import crypto from "node:crypto";

const DEFAULT_LIMIT = 3;
const MAX_TOP_K = 3;
const DEFAULT_ML_TIMEOUT_MS = 1200;
const DEFAULT_CACHE_TTL_MIN = 30;
const DEFAULT_CGPA_NEUTRAL_SCORE = 0.5;
const DEFAULT_CGPA_UNKNOWN_SCORE = 0.3;
const DEFAULT_EDUCATION_NEUTRAL_SCORE = 0.5;
const MODEL_VERSION = "rule-hybrid-v1";

const toLower = (value = "") => String(value || "").trim().toLowerCase();
const toWords = (value = "") =>
  toLower(value)
    .split(/[^a-z0-9+#.]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const uniq = (arr = []) => [...new Set(arr.filter(Boolean))];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toFiniteOr = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getTimeoutMs = () => {
  const raw = Number(process.env.ML_RANKER_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 100 ? raw : DEFAULT_ML_TIMEOUT_MS;
};

const getCacheTtlMs = () => {
  const raw = Number(process.env.RECOMMENDATION_CACHE_TTL_MIN);
  const ttlMin = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_CACHE_TTL_MIN;
  return ttlMin * 60 * 1000;
};

const getCgpaNeutralScore = () =>
  clamp(toFiniteOr(process.env.RECOMMENDATION_CGPA_NEUTRAL_SCORE, DEFAULT_CGPA_NEUTRAL_SCORE), 0, 1);

const getCgpaUnknownScore = () =>
  clamp(toFiniteOr(process.env.RECOMMENDATION_CGPA_UNKNOWN_SCORE, DEFAULT_CGPA_UNKNOWN_SCORE), 0, 1);

const getEducationNeutralScore = () =>
  clamp(
    toFiniteOr(process.env.RECOMMENDATION_EDUCATION_NEUTRAL_SCORE, DEFAULT_EDUCATION_NEUTRAL_SCORE),
    0,
    1
  );

const shouldUseMlProbe = () => {
  const enabled = !["false", "0"].includes(
    String(process.env.RECOMMENDATION_USE_ML_PROBE || "true").trim().toLowerCase()
  );
  const mlUrl = String(process.env.ML_RANKER_URL || "").trim();
  return enabled && Boolean(mlUrl);
};

const getStudentSkills = (student = {}) => {
  const directSkills = Array.isArray(student.skills) ? student.skills : [];
  const projectSkills = Array.isArray(student.projects)
    ? student.projects.flatMap((project) => (Array.isArray(project?.techStack) ? project.techStack : []))
    : [];
  const certificateSkills = Array.isArray(student.certificates)
    ? student.certificates.flatMap((cert) => (Array.isArray(cert?.techStack) ? cert.techStack : []))
    : [];

  return uniq(
    [...directSkills, ...projectSkills, ...certificateSkills].map((skill) =>
      String(skill || "").trim()
    )
  );
};

const getInternshipSkills = (internship = {}) => {
  const raw = Array.isArray(internship.skills)
    ? internship.skills
    : Array.isArray(internship.skill_req)
      ? internship.skill_req
      : [];
  return uniq(raw.map((item) => String(item || "").trim()));
};

const calculateSkillOverlap = (studentSkills, internshipSkills) => {
  const studentSet = new Set(studentSkills.map(toLower));
  const overlap = internshipSkills.filter((skill) => studentSet.has(toLower(skill)));
  return uniq(overlap);
};

const normalizeCgpaValue = (raw) => {
  const numeric = toFiniteOr(String(raw || "").replace(/[^0-9.]/g, ""), Number.NaN);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  if (numeric > 10 && numeric <= 100) return Number((numeric / 10).toFixed(2));
  if (numeric > 100) return null;
  return Number(numeric.toFixed(2));
};

const getLatestEducation = (educations = []) => {
  const normalized = Array.isArray(educations) ? educations.filter(Boolean) : [];
  if (!normalized.length) return null;

  return normalized
    .slice()
    .sort((a, b) => {
      const aYear = Number.parseInt(a?.endYear, 10);
      const bYear = Number.parseInt(b?.endYear, 10);
      if (Number.isFinite(aYear) && Number.isFinite(bYear) && aYear !== bYear) return bYear - aYear;
      return 0;
    })[0];
};

const extractStudentCgpa = (student = {}) => {
  const latestEducation = getLatestEducation(student.educations);
  if (!latestEducation) return null;
  return normalizeCgpaValue(latestEducation.gradeValue);
};

const parseCgpaThreshold = (internship = {}) => {
  const text = [
    internship.who_can_apply || internship.whoCanApply || "",
    internship.other_req || internship.otherReq || "",
  ]
    .join(" ")
    .trim();

  if (!text) return null;

  const patterns = [
    /cgpa\s*(?:of|is|:|>=|>|at\s*least|minimum|min)?\s*([0-9]+(?:\.[0-9]+)?)/i,
    /([0-9]+(?:\.[0-9]+)?)\s*\+\s*cgpa/i,
    /cgpa[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*(?:\+|or above|minimum|and above)?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const value = normalizeCgpaValue(match[1]);
    if (Number.isFinite(value)) return value;
  }

  return null;
};

const getInternshipRequirementText = (internship = {}) =>
  [
    internship.title || "",
    internship.aboutWork || internship.about_work || "",
    internship.who_can_apply || internship.whoCanApply || "",
    internship.other_req || internship.otherReq || "",
    getInternshipSkills(internship).join(" "),
  ]
    .join(" ")
    .trim();

const getStudentEducationTokens = (student = {}) => {
  const latestEducation = getLatestEducation(student.educations);
  if (!latestEducation) return [];
  return uniq(
    toWords(
      [
        latestEducation.degreeType || "",
        latestEducation.fieldOfStudy || "",
        latestEducation.specialization || "",
      ].join(" ")
    )
  );
};

const EDUCATION_KEYWORDS = [
  "btech",
  "be",
  "b.e",
  "bca",
  "mca",
  "bsc",
  "msc",
  "bcom",
  "mcom",
  "mba",
  "diploma",
  "graduate",
  "engineering",
];

const evaluateEducationMatch = (student = {}, internship = {}) => {
  const requirementText = toLower(
    `${internship.who_can_apply || internship.whoCanApply || ""} ${internship.other_req || internship.otherReq || ""}`
  );
  const requiresEducationMatch = EDUCATION_KEYWORDS.some((keyword) => requirementText.includes(keyword));
  if (!requiresEducationMatch) {
    return { educationMatch: null, educationFactor: getEducationNeutralScore() };
  }

  const studentTokens = getStudentEducationTokens(student);
  if (!studentTokens.length) {
    return { educationMatch: false, educationFactor: 0 };
  }

  const matched = studentTokens.some((token) => requirementText.includes(token));
  return {
    educationMatch: matched,
    educationFactor: matched ? 1 : 0,
  };
};

const computeProjectRelevance = (student = {}, internship = {}) => {
  const internshipTokens = new Set(toWords(getInternshipRequirementText(internship)));
  if (!internshipTokens.size) return 0;

  const projects = Array.isArray(student.projects) ? student.projects : [];
  if (!projects.length) return 0;

  let maxRelevance = 0;
  for (const project of projects) {
    const projectTokens = new Set(
      toWords(
        [
          project?.title || "",
          project?.description || "",
          Array.isArray(project?.techStack) ? project.techStack.join(" ") : "",
        ].join(" ")
      )
    );

    if (!projectTokens.size) continue;

    let overlap = 0;
    for (const token of projectTokens) {
      if (internshipTokens.has(token)) overlap += 1;
    }

    const denom = Math.max(1, Math.min(internshipTokens.size, 20));
    maxRelevance = Math.max(maxRelevance, overlap / denom);
  }

  return Number(clamp(maxRelevance, 0, 1).toFixed(4));
};

const evaluateCgpaEligibility = (student = {}, internship = {}) => {
  const minCgpa = parseCgpaThreshold(internship);
  const studentCgpa = extractStudentCgpa(student);

  if (minCgpa === null) {
    return {
      cgpaEligible: null,
      cgpaFactor: getCgpaNeutralScore(),
      minCgpa: null,
      studentCgpa,
    };
  }

  if (studentCgpa === null) {
    return {
      cgpaEligible: null,
      cgpaFactor: getCgpaUnknownScore(),
      minCgpa,
      studentCgpa: null,
    };
  }

  const eligible = studentCgpa >= minCgpa;
  return {
    cgpaEligible: eligible,
    cgpaFactor: eligible ? 1 : 0,
    minCgpa,
    studentCgpa,
  };
};

const buildReasonTags = ({
  matchedSkills = [],
  educationMatch = null,
  projectRelevance = 0,
  cgpaEligible = null,
}) => {
  const tags = [];
  if (matchedSkills.length > 0) tags.push("SKILL_MATCH");
  if (educationMatch === true) tags.push("EDUCATION_MATCH");
  if (projectRelevance >= 0.2) tags.push("PROJECT_RELEVANCE");
  if (cgpaEligible === true) tags.push("CGPA_ELIGIBLE");
  return tags;
};

const buildFallbackExplanation = ({
  score,
  matchedSkills,
  missingSkills,
  educationMatch,
  projectRelevance,
  cgpaEligible,
}) => {
  const pieces = [];
  pieces.push(`Score ${score.toFixed(1)} based on profile-fit signals.`);

  if (matchedSkills.length) pieces.push(`Matched skills: ${matchedSkills.slice(0, 4).join(", ")}.`);
  else pieces.push("No strong required-skill overlap found.");

  if (educationMatch === true) pieces.push("Education requirement appears aligned.");
  else if (educationMatch === false) pieces.push("Education requirement mismatch detected.");
  else pieces.push("Education criteria not explicitly specified.");

  pieces.push(`Project relevance: ${(projectRelevance * 100).toFixed(0)}%.`);

  if (cgpaEligible === true) pieces.push("CGPA criteria satisfied.");
  else if (cgpaEligible === false) pieces.push("CGPA criteria not satisfied.");
  else pieces.push("CGPA criteria unavailable or incomplete.");

  if (missingSkills.length) pieces.push(`Missing skills: ${missingSkills.slice(0, 4).join(", ")}.`);

  return pieces.join(" ");
};

const isLlmExplanationEnabled = () =>
  !["false", "0"].includes(
    String(process.env.RECOMMENDATION_ENABLE_LLM_EXPLANATION || "false").trim().toLowerCase()
  );

const buildExplanationPrompt = ({ student, internship, matchedSkills, missingSkills, score }) => {
  const education = Array.isArray(student.educations)
    ? student.educations
        .map((item) => `${item?.degreeType || ""} ${item?.fieldOfStudy || ""}`.trim())
        .filter(Boolean)
        .join(", ")
    : "";
  const skills = getStudentSkills(student).join(", ");
  const projects = Array.isArray(student.projects)
    ? student.projects.map((item) => item?.title || "").filter(Boolean).join(", ")
    : "";
  const certificates = Array.isArray(student.certificates)
    ? student.certificates.map((item) => item?.name || "").filter(Boolean).join(", ")
    : "";

  const internshipList = JSON.stringify(
    [
      {
        internshipId: internship?.id || internship?._id || "",
        title: internship?.title || "",
        requiredSkills: getInternshipSkills(internship),
        whoCanApply: internship?.who_can_apply || internship?.whoCanApply || "",
        otherReq: internship?.other_req || internship?.otherReq || "",
      },
    ],
    null,
    2
  );

  return `You are an AI Internship Recommendation Engine.

Analyze the student profile and match it with the available internships.

Student Profile:
- Education: ${education || "not provided"}
- Skills: ${skills || "not provided"}
- Projects: ${projects || "not provided"}
- Certificates: ${certificates || "not provided"}
- CGPA: ${extractStudentCgpa(student) ?? "not provided"}

Available Internships:
${internshipList}

Task:
1. Compare student skills with required skills.
2. Check education match.
3. Check project relevance.
4. Check CGPA eligibility.
5. Give match score (0-100).
6. Recommend top 3 internships.
7. Mention missing skills.
8. Provide short explanation for each recommendation.

Current computed details:
- score: ${score.toFixed(1)}
- matchedSkills: ${matchedSkills.join(", ") || "none"}
- missingSkills: ${missingSkills.join(", ") || "none"}

Return one concise explanation sentence only.`;
};

const generateLlmExplanation = async ({
  student,
  internship,
  matchedSkills,
  missingSkills,
  score,
  fallback,
}) => {
  if (!isLlmExplanationEnabled()) return fallback;

  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) return fallback;

  const model = String(process.env.RECOMMENDATION_LLM_MODEL || "gpt-4.1-mini").trim();
  const endpoint = String(
    process.env.OPENAI_RESPONSES_URL || "https://api.openai.com/v1/responses"
  ).trim();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: buildExplanationPrompt({
          student,
          internship,
          matchedSkills,
          missingSkills,
          score,
        }),
        max_output_tokens: 80,
      }),
    });

    if (!response.ok) return fallback;

    const data = await response.json().catch(() => ({}));
    const text = String(data?.output_text || "").trim();
    return text || fallback;
  } catch {
    return fallback;
  }
};

const computeCandidateFingerprint = (internships = []) => {
  const ids = internships
    .map((item) => String(item?.id || item?._id || ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const latestCreatedAtMs = internships.reduce((acc, item) => {
    const createdAtMs = item?.createdAt ? new Date(item.createdAt).getTime() : 0;
    return Number.isFinite(createdAtMs) ? Math.max(acc, createdAtMs) : acc;
  }, 0);

  const payload = JSON.stringify({
    ids,
    latestCreatedAtMs,
  });

  return crypto.createHash("sha256").update(payload).digest("hex");
};

export const buildStudentFeatureText = (student = {}) => {
  const name = `${student.fname || ""} ${student.lname || ""}`.trim();
  const skills = getStudentSkills(student).join(", ");
  const education = Array.isArray(student.educations)
    ? student.educations
        .map((item) => `${item?.degreeType || ""} ${item?.fieldOfStudy || ""}`.trim())
        .filter(Boolean)
        .join(", ")
    : "";

  return [
    `Student: ${name || "unknown"}`,
    `Skills: ${skills || "not specified"}`,
    `Education: ${education || "not specified"}`,
  ].join("\n");
};

export const buildCandidateText = (internship = {}) => {
  const skills = getInternshipSkills(internship).join(", ");
  const company = internship.company || internship.companyName || "Unknown Company";
  const title = internship.title || "Untitled Internship";

  return [
    `Title: ${title}`,
    `Company: ${company}`,
    `Skills: ${skills || "Not specified"}`,
    `About: ${internship.aboutWork || internship.about_work || "Not specified"}`,
    `Who can apply: ${internship.who_can_apply || internship.whoCanApply || "Not specified"}`,
    `Other requirements: ${internship.other_req || internship.otherReq || "Not specified"}`,
  ].join("\n");
};

export const callMlRankService = async (payload) => {
  const baseUrl = String(process.env.ML_RANKER_URL || "").trim();
  if (!baseUrl) {
    const error = new Error("ML_RANKER_URL is not configured");
    error.code = "ML_URL_MISSING";
    throw error;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/rank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        topK: clamp(Number(payload?.topK || DEFAULT_LIMIT), 1, MAX_TOP_K),
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.message || "ML ranker request failed");
      error.code = "ML_BAD_RESPONSE";
      throw error;
    }

    return {
      modelVersion: String(data?.modelVersion || "ml-encoder-v1"),
      ranked: Array.isArray(data?.ranked) ? data.ranked : [],
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("ML ranker timeout");
      timeoutError.code = "ML_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const rankByRules = async (student = {}, internships = [], limit = DEFAULT_LIMIT) => {
  const studentSkills = getStudentSkills(student);

  const scored = internships.map((internship) => {
    const internshipSkills = getInternshipSkills(internship);
    const matchedSkills = calculateSkillOverlap(studentSkills, internshipSkills);
    const matchedSet = new Set(matchedSkills.map(toLower));
    const missingSkills = internshipSkills.filter((skill) => !matchedSet.has(toLower(skill)));

    const skillFactor = internshipSkills.length
      ? matchedSkills.length / internshipSkills.length
      : 0.5;
    const skillScore = clamp(skillFactor, 0, 1) * 50;

    const { educationMatch, educationFactor } = evaluateEducationMatch(student, internship);
    const educationScore = clamp(educationFactor, 0, 1) * 20;

    const projectRelevance = computeProjectRelevance(student, internship);
    const projectScore = clamp(projectRelevance, 0, 1) * 20;

    const { cgpaEligible, cgpaFactor } = evaluateCgpaEligibility(student, internship);
    const cgpaScore = clamp(cgpaFactor, 0, 1) * 10;

    const finalScore = Number(clamp(skillScore + educationScore + projectScore + cgpaScore, 0, 100).toFixed(2));
    const reasons = buildReasonTags({
      matchedSkills,
      educationMatch,
      projectRelevance,
      cgpaEligible,
    });

    return {
      internshipId: internship._id || internship.id,
      score: finalScore,
      reasons,
      matchedSkills: matchedSkills.slice(0, 8),
      missingSkills: missingSkills.slice(0, 8),
      educationMatch,
      projectRelevance: Number(projectRelevance.toFixed(4)),
      cgpaEligible,
      explanation: "",
      internship,
    };
  });

  const topRanked = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, clamp(Number(limit || DEFAULT_LIMIT), 1, MAX_TOP_K));

  const withExplanations = [];
  for (const item of topRanked) {
    const fallback = buildFallbackExplanation(item);
    const explanation = await generateLlmExplanation({
      student,
      internship: item.internship,
      matchedSkills: item.matchedSkills,
      missingSkills: item.missingSkills,
      score: item.score,
      fallback,
    });
    withExplanations.push({
      ...item,
      explanation,
    });
  }

  return withExplanations;
};

export const fallbackRank = async (student = {}, internships = [], limit = DEFAULT_LIMIT) => {
  const items = await rankByRules(student, internships, limit);
  return {
    modelVersion: MODEL_VERSION,
    ranked: items,
  };
};

export const getCachedOrFreshRecommendations = async ({
  limit = DEFAULT_LIMIT,
  refresh = false,
  student,
  internships,
  cachedSnapshot,
}) => {
  const normalizedLimit = clamp(Number(limit || DEFAULT_LIMIT), 1, MAX_TOP_K);
  const now = new Date();
  const candidateFingerprint = computeCandidateFingerprint(internships);

  if (!refresh && cachedSnapshot?.createdAt) {
    const ageMs = now.getTime() - new Date(cachedSnapshot.createdAt).getTime();
    const sameFingerprint =
      cachedSnapshot.candidateFingerprint &&
      String(cachedSnapshot.candidateFingerprint) === String(candidateFingerprint);

    if (ageMs >= 0 && ageMs <= getCacheTtlMs() && sameFingerprint) {
      return {
        generatedAt: new Date(cachedSnapshot.createdAt).toISOString(),
        source: cachedSnapshot.source || "rule",
        modelVersion: cachedSnapshot.modelVersion || MODEL_VERSION,
        latencyMs: Number(cachedSnapshot.latencyMs || 0),
        candidateCount: Number(cachedSnapshot.candidateCount || 0),
        candidateFingerprint,
        items: Array.isArray(cachedSnapshot.items) ? cachedSnapshot.items : [],
        fromCache: true,
      };
    }
  }

  const startedAt = Date.now();
  let source = "rule";
  let modelVersion = MODEL_VERSION;
  let rankingError = null;

  if (shouldUseMlProbe()) {
    try {
      const mlPayload = {
        studentText: buildStudentFeatureText(student),
        candidates: internships.map((internship) => ({
          internshipId: String(internship.id || internship._id),
          text: buildCandidateText(internship),
        })),
        topK: normalizedLimit,
      };
      const mlProbe = await callMlRankService(mlPayload);
      source = "ml";
      modelVersion = `${String(mlProbe.modelVersion || "ml-encoder-v1")}|${MODEL_VERSION}`;
    } catch (error) {
      source = "fallback";
      modelVersion = MODEL_VERSION;
      rankingError = error;
    }
  }

  const rankedWithContext = await rankByRules(student, internships, normalizedLimit);
  const latencyMs = Date.now() - startedAt;

  return {
    generatedAt: now.toISOString(),
    source,
    modelVersion,
    latencyMs,
    candidateCount: internships.length,
    candidateFingerprint,
    items: rankedWithContext,
    fromCache: false,
    rankingError,
  };
};
