import fetch from "node-fetch";
import Company from "../models/Company.js";

const CHECK_NAMES = ["companyInfo", "email", "domain", "gst", "fraud"];
const CHECK_STATUS = {
  PENDING: "PENDING",
  PASS: "PASS",
  FAIL: "FAIL",
  NEEDS_REVIEW: "NEEDS_REVIEW",
};

export const COMPANY_DECISIONS = {
  AUTO_APPROVED: "AUTO_APPROVED",
  MANUAL_APPROVAL: "MANUAL_APPROVAL",
  AUTO_RESUBMIT: "AUTO_RESUBMIT",
  AUTO_REJECT: "AUTO_REJECT",
};

const SCORE_WEIGHTS = {
  gst: 0.35,
  emailDomain: 0.25,
  companyInfo: 0.3,
  fraud: 0.1,
};

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
]);

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeDomain = (value = "") => {
  let domain = normalizeText(value);
  if (!domain) return "";
  domain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return domain.split("/")[0].split(":")[0];
};

const getEmailDomain = (email = "") => {
  const normalized = normalizeText(email);
  const parts = normalized.split("@");
  return parts.length === 2 ? parts[1] : "";
};

const scoreToStatus = (score) => {
  if (score >= 70) return CHECK_STATUS.PASS;
  if (score >= 45) return CHECK_STATUS.NEEDS_REVIEW;
  return CHECK_STATUS.FAIL;
};

const safeRound = (value) => Math.max(0, Math.min(100, Math.round(value || 0)));

const emptyCheck = () => ({
  status: CHECK_STATUS.PENDING,
  score: 0,
  reasons: [],
  details: {},
  critical: false,
  lastRunAt: null,
});

const getFailedCheckKeys = (checks = {}) =>
  CHECK_NAMES.filter((name) => {
    const status = checks?.[name]?.status;
    return status === CHECK_STATUS.FAIL || status === CHECK_STATUS.NEEDS_REVIEW;
  });

const makeChecklist = (checks = {}) => {
  const items = [];
  if (checks.gst?.status !== CHECK_STATUS.PASS) {
    items.push("GST legal name/status verify karo aur valid GST document re-upload karo.");
  }
  if (checks.domain?.status !== CHECK_STATUS.PASS) {
    items.push("Website domain ko company email domain ke saath match karo.");
  }
  if (checks.email?.status !== CHECK_STATUS.PASS) {
    items.push("Official business email verify karo (OTP/link completion).");
  }
  if (checks.companyInfo?.status !== CHECK_STATUS.PASS) {
    items.push("Company about, address aur website details consistent update karo.");
  }
  if (checks.fraud?.status !== CHECK_STATUS.PASS) {
    items.push("Duplicate/suspicious profile signals clear karne ke liye supporting documents do.");
  }
  return items;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const verificationQueue = [];
let queueRunning = false;

const runQueue = async () => {
  if (queueRunning) return;
  queueRunning = true;
  while (verificationQueue.length) {
    const payload = verificationQueue.shift();
    try {
      // eslint-disable-next-line no-await-in-loop
      await processCompanyVerification(payload.companyId, payload.options);
    } catch (error) {
      console.error("Company verification worker error:", error.message);
    }
  }
  queueRunning = false;
};

export const enqueueCompanyVerification = (companyId, options = {}) => {
  verificationQueue.push({ companyId, options });
  setTimeout(() => {
    runQueue().catch((error) => {
      console.error("Verification queue run error:", error.message);
    });
  }, 0);
};

const evaluateEmailCheck = (company) => {
  const domain = getEmailDomain(company.email);
  const otpVerified = Boolean(
    company?.verification?.email?.otpVerified ||
      company?.verification?.emailOtpVerified ||
      (company.loginType && company.loginType !== "email")
  );
  let score = 20;
  const reasons = [];

  if (!domain) {
    reasons.push("Primary company email invalid hai.");
    return {
      status: CHECK_STATUS.FAIL,
      score: 0,
      reasons,
      details: { domain: "" },
      critical: true,
      lastRunAt: new Date(),
    };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    score -= 30;
    reasons.push("Disposable email domain detect hua.");
  } else {
    score += 40;
  }

  if (otpVerified) {
    score += 40;
  } else {
    reasons.push("Email OTP/link verification complete nahi hai.");
  }

  return {
    status: scoreToStatus(score),
    score: safeRound(score),
    reasons,
    details: { domain, otpVerified },
    critical: DISPOSABLE_DOMAINS.has(domain),
    lastRunAt: new Date(),
  };
};

const evaluateDomainCheck = (company) => {
  const emailDomain = getEmailDomain(company.email);
  const websiteDomain = normalizeDomain(company.website);
  let score = 25;
  const reasons = [];

  if (!websiteDomain) {
    reasons.push("Company website missing hai.");
    return {
      status: CHECK_STATUS.NEEDS_REVIEW,
      score: 45,
      reasons,
      details: { emailDomain, websiteDomain },
      critical: false,
      lastRunAt: new Date(),
    };
  }

  if (!emailDomain) {
    reasons.push("Email domain invalid hai.");
    return {
      status: CHECK_STATUS.FAIL,
      score: 0,
      reasons,
      details: { emailDomain, websiteDomain },
      critical: true,
      lastRunAt: new Date(),
    };
  }

  const exactMatch = websiteDomain === emailDomain;
  const subdomainMatch =
    websiteDomain.endsWith(`.${emailDomain}`) || emailDomain.endsWith(`.${websiteDomain}`);
  const hasMxLikeDomain = websiteDomain.includes(".");

  if (exactMatch || subdomainMatch) {
    score += 50;
  } else {
    score -= 20;
    reasons.push("Website domain aur email domain mismatch hai.");
  }

  if (hasMxLikeDomain) score += 15;
  else reasons.push("Domain format suspicious lag raha hai.");

  return {
    status: scoreToStatus(score),
    score: safeRound(score),
    reasons,
    details: {
      emailDomain,
      websiteDomain,
      exactMatch,
      subdomainMatch,
    },
    critical: !exactMatch && !subdomainMatch,
    lastRunAt: new Date(),
  };
};

const runGstApiVerification = async (company) => {
  const apiUrl = process.env.GST_VERIFICATION_API_URL;
  const apiKey = process.env.GST_VERIFICATION_API_KEY;
  if (!apiUrl) return null;

  const gstin = normalizeText(company.gst_no).toUpperCase();
  if (!gstin) return null;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      gstin,
      companyName: company.companyName || "",
    }),
  });

  if (!response.ok) {
    throw new Error(`GST API returned ${response.status}`);
  }
  return response.json();
};

const evaluateGstCheck = async (company) => {
  const gst = normalizeText(company.gst_no).toUpperCase();
  const reasons = [];
  let score = 25;
  let apiPayload = null;

  if (!gst) {
    return {
      status: CHECK_STATUS.FAIL,
      score: 0,
      reasons: ["GST number required hai."],
      details: { gst },
      critical: true,
      lastRunAt: new Date(),
    };
  }

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/;
  if (gstRegex.test(gst)) score += 35;
  else reasons.push("GST format invalid hai.");

  try {
    apiPayload = await runGstApiVerification(company);
  } catch (error) {
    reasons.push("GST API timeout/error. Manual review required.");
    return {
      status: CHECK_STATUS.NEEDS_REVIEW,
      score: 50,
      reasons,
      details: { gst, apiError: error.message },
      critical: false,
      lastRunAt: new Date(),
    };
  }

  if (apiPayload) {
    const active = normalizeText(apiPayload.status || apiPayload.gstStatus) === "active";
    const gstLegalName = normalizeText(apiPayload.legalName || apiPayload.tradeName);
    const profileName = normalizeText(company.companyName);
    const nameMatch =
      gstLegalName && profileName
        ? gstLegalName.includes(profileName) || profileName.includes(gstLegalName)
        : false;

    if (active) score += 20;
    else reasons.push("GST status active nahi hai.");

    if (nameMatch) score += 20;
    else reasons.push("GST legal name aur company name mismatch hai.");

    return {
      status: scoreToStatus(score),
      score: safeRound(score),
      reasons,
      details: { gst, active, nameMatch, apiPayload },
      critical: !active,
      lastRunAt: new Date(),
    };
  }

  return {
    status: scoreToStatus(score),
    score: safeRound(score),
    reasons,
    details: { gst, apiPayload: null },
    critical: false,
    lastRunAt: new Date(),
  };
};

const callCompanyInfoModel = async (company) => {
  const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
  const response = await fetch(`${mlServiceUrl}/score/company-trust`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyName: company.companyName || "",
      website: company.website || "",
      about: company.about || "",
      email: company.email || "",
      gstNo: company.gst_no || "",
      gstLegalName: company?.verification?.gst?.legalName || "",
      gstStatus: company?.verification?.gst?.status || "",
    }),
  });
  if (!response.ok) {
    throw new Error(`ML service returned ${response.status}`);
  }
  return response.json();
};

const evaluateCompanyInfoCheck = async (company) => {
  let modelPayload = null;
  const reasons = [];
  let score = 35;

  try {
    modelPayload = await callCompanyInfoModel(company);
    score = safeRound(modelPayload.legitimacyScore);
    if (Array.isArray(modelPayload.riskFlags) && modelPayload.riskFlags.length) {
      reasons.push(...modelPayload.riskFlags.map((flag) => `Risk: ${flag}`));
    }
  } catch (error) {
    if ((company.about || "").trim().length > 80) score += 30;
    if (normalizeDomain(company.website)) score += 20;
    reasons.push("ML service unavailable, fallback heuristic scoring used.");
  }

  return {
    status: scoreToStatus(score),
    score: safeRound(score),
    reasons,
    details: { modelPayload },
    critical: false,
    lastRunAt: new Date(),
  };
};

const evaluateFraudCheck = async (company) => {
  let score = 75;
  const reasons = [];
  const websiteDomain = normalizeDomain(company.website);
  const normalizedGst = normalizeText(company.gst_no).toUpperCase();

  const duplicateConditions = [];
  if (normalizedGst) duplicateConditions.push({ gst_no: normalizedGst });
  if (websiteDomain) duplicateConditions.push({ website: new RegExp(websiteDomain, "i") });

  if (duplicateConditions.length) {
    const duplicateCount = await Company.countDocuments({
      _id: { $ne: company._id },
      $or: duplicateConditions,
    });
    if (duplicateCount > 0) {
      score -= 40;
      reasons.push("Duplicate GST/domain profile detect hua.");
    }
  }

  const attemptCount = Number(company?.verification?.attemptCount || 1);
  if (attemptCount > 2) {
    score -= 15;
    reasons.push("Repeated failed verification attempts detect hue.");
  }

  const failedChecks = getFailedCheckKeys(company?.verification?.checks || {});
  if (failedChecks.length >= 3) {
    score -= 20;
    reasons.push("Multiple verification dimensions fail hue.");
  }

  return {
    status: scoreToStatus(score),
    score: safeRound(score),
    reasons,
    details: {
      attemptCount,
      websiteDomain,
      previousFailedChecks: failedChecks,
    },
    critical: score < 35,
    lastRunAt: new Date(),
  };
};

const mergeChecks = (currentChecks = {}, updates = {}) => {
  const merged = {};
  CHECK_NAMES.forEach((name) => {
    merged[name] = updates[name] || currentChecks[name] || emptyCheck();
  });
  return merged;
};

const decideVerification = ({ trustScore, criticalFlags }) => {
  if (criticalFlags.length || trustScore < 40) {
    return COMPANY_DECISIONS.AUTO_REJECT;
  }
  if (trustScore >= 80) return COMPANY_DECISIONS.AUTO_APPROVED;
  if (trustScore >= 60) return COMPANY_DECISIONS.MANUAL_APPROVAL;
  return COMPANY_DECISIONS.AUTO_RESUBMIT;
};

const decisionToVerificationStatus = (decision) => {
  if (decision === COMPANY_DECISIONS.AUTO_APPROVED) return "AUTO_APPROVED";
  if (decision === COMPANY_DECISIONS.MANUAL_APPROVAL) return "MANUAL_APPROVAL";
  if (decision === COMPANY_DECISIONS.AUTO_RESUBMIT) return "AUTO_RESUBMIT";
  return "AUTO_REJECT";
};

export const processCompanyVerification = async (companyId, options = {}) => {
  const company = await Company.findById(companyId);
  if (!company) return null;

  const verification = company.verification || {};
  const attemptCount = Number(verification.attemptCount || 0);
  const currentChecks = verification.checks || {};
  const failedOnly = Boolean(options.onlyFailedChecks);
  const checksToRun = failedOnly
    ? (verification.lastFailedChecks || []).filter((name) => CHECK_NAMES.includes(name))
    : CHECK_NAMES;
  const effectiveChecksToRun = checksToRun.length ? checksToRun : CHECK_NAMES;

  const updates = {};
  const criticalFlags = [];
  const tasks = [];

  if (effectiveChecksToRun.includes("companyInfo")) {
    tasks.push(
      evaluateCompanyInfoCheck(company).then((result) => {
        updates.companyInfo = result;
      })
    );
  }
  if (effectiveChecksToRun.includes("email")) {
    tasks.push(
      Promise.resolve(evaluateEmailCheck(company)).then((result) => {
        updates.email = result;
      })
    );
  }
  if (effectiveChecksToRun.includes("domain")) {
    tasks.push(
      Promise.resolve(evaluateDomainCheck(company)).then((result) => {
        updates.domain = result;
      })
    );
  }
  if (effectiveChecksToRun.includes("gst")) {
    tasks.push(
      evaluateGstCheck(company).then((result) => {
        updates.gst = result;
      })
    );
  }
  if (effectiveChecksToRun.includes("fraud")) {
    tasks.push(
      evaluateFraudCheck(company).then((result) => {
        updates.fraud = result;
      })
    );
  }

  await Promise.all(tasks);
  const mergedChecks = mergeChecks(currentChecks, updates);

  CHECK_NAMES.forEach((name) => {
    if (mergedChecks[name]?.critical) {
      criticalFlags.push(`${name.toUpperCase()}_CRITICAL`);
    }
  });

  const emailDomainScore = safeRound(
    mergedChecks.email.score * 0.4 + mergedChecks.domain.score * 0.6
  );
  const trustScore = safeRound(
    mergedChecks.gst.score * SCORE_WEIGHTS.gst +
      emailDomainScore * SCORE_WEIGHTS.emailDomain +
      mergedChecks.companyInfo.score * SCORE_WEIGHTS.companyInfo +
      mergedChecks.fraud.score * SCORE_WEIGHTS.fraud
  );

  const decision = decideVerification({ trustScore, criticalFlags });
  const verificationStatus = decisionToVerificationStatus(decision);
  const now = new Date();
  const failedChecks = getFailedCheckKeys(mergedChecks);
  const checklist = makeChecklist(mergedChecks);

  const historyEntry = {
    attemptNumber: attemptCount,
    trustScore,
    decision,
    verificationStatus,
    checks: mergedChecks,
    criticalFlags,
    checklist,
    source: options.source || "SYSTEM",
    createdAt: now,
  };

  company.verificationStatus = verificationStatus;
  company.verification = {
    ...verification,
    attemptCount,
    trustScore,
    decision,
    criticalFlags,
    checklist,
    checks: mergedChecks,
    lastFailedChecks: failedChecks,
    submittedAt: verification.submittedAt || now,
    lastEvaluatedAt: now,
    resubmitBy: decision === COMPANY_DECISIONS.AUTO_RESUBMIT ? addDays(now, 7) : null,
    history: [...(verification.history || []), historyEntry].slice(-20),
  };

  await company.save();
  return company;
};

export const startVerificationRun = async ({
  company,
  source = "PROFILE_SUBMIT",
  onlyFailedChecks = false,
}) => {
  const now = new Date();
  const existingVerification = company.verification || {};
  const nextAttemptCount = Number(existingVerification.attemptCount || 0) + 1;

  company.verificationStatus = "PENDING_VERIFICATION";
  company.verification = {
    ...existingVerification,
    attemptCount: nextAttemptCount,
    submittedAt: now,
    lastEvaluatedAt: null,
    decision: null,
    trustScore: 0,
    criticalFlags: [],
    checklist: [],
    checks: mergeChecks(existingVerification.checks, {}),
    source,
  };

  await company.save();
  enqueueCompanyVerification(company._id, { source, onlyFailedChecks });
  return company;
};
