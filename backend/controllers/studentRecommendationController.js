import crypto from "crypto";
import Student from "../models/Student.js";
import Internship from "../models/Internship.js";
import RecommendationSnapshot from "../models/RecommendationSnapshot.js";
import { toClientInternship } from "./studentInternshipController.js";
import { getCachedOrFreshRecommendations } from "../services/recommendationService.js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
const DEFAULT_MIN_SCORE = 0;
const DEFAULT_CANDIDATE_CAP = 150;

const toBool = (value = "") => String(value || "").trim().toLowerCase() === "true";

const toNumberOr = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeLimit = (value) => {
  const parsed = Math.floor(toNumberOr(value, DEFAULT_LIMIT));
  return Math.min(MAX_LIMIT, Math.max(1, parsed || DEFAULT_LIMIT));
};

const normalizeMinScore = (value) => {
  const parsed = toNumberOr(value, DEFAULT_MIN_SCORE);
  return Math.min(100, Math.max(0, parsed));
};

const getCandidateCap = () => {
  const raw = toNumberOr(process.env.RECOMMENDATION_MAX_CANDIDATES, DEFAULT_CANDIDATE_CAP);
  return Math.max(25, raw);
};

const isStrictLocationMismatch = (item = {}) => {
  const workmode = String(item?.internship?.workmode || item?.internship?.mode || "")
    .trim()
    .toLowerCase();
  if (!workmode || workmode.includes("remote")) return false;
  if (item?.locationEligible === false) return true;
  return item?.locationMatch === false;
};

const normalizeInternships = (internships = [], applicationsMap = new Map()) =>
  internships.map((doc) => {
    const normalized = toClientInternship(doc);
    return {
      ...normalized,
      id: String(normalized.id),
      aboutWork: normalized.about_work || "",
      employmentType: normalized.employment_type || "",
      skills: Array.isArray(normalized.skills) ? normalized.skills : [],
      applicationsCount: Number(applicationsMap.get(String(normalized.id)) || 0),
    };
  });

export const getStudentRecommendations = async (req, res) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  try {
    const recommendationEnabled = !["false", "0"].includes(
      String(process.env.RECOMMENDATION_ENABLED || "true").trim().toLowerCase()
    );

    if (!recommendationEnabled) {
      return res.status(503).json({
        success: false,
        message: "Recommendations are temporarily disabled",
      });
    }

    const studentId = req.studentId;
    const limit = normalizeLimit(req.query.limit);
    const minScore = normalizeMinScore(req.query.minScore);
    const refresh = toBool(req.query.refresh);

    const student = await Student.findById(studentId)
      .select(
        "fname lname skills preferredLocation city state projects certificates educations appliedInternships"
      )
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const cachedSnapshot = await RecommendationSnapshot.findOne({ studentId, limit })
      .sort({ createdAt: -1 })
      .lean();

    const appliedInternshipIds = Array.isArray(student.appliedInternships)
      ? student.appliedInternships
          .map((entry) => entry?.internship)
          .filter(Boolean)
          .map((id) => String(id))
      : [];

    const filters = {
      intern_status: "ACTIVE",
      is_published: "true",
      $or: [{ title: { $exists: true, $ne: "" } }, { about_work: { $exists: true, $ne: "" } }],
    };

    if (appliedInternshipIds.length) {
      filters._id = { $nin: appliedInternshipIds };
    }

    const candidateCap = getCandidateCap();

    const internships = await Internship.find(filters)
      .populate("company_id", "companyName logo")
      .populate("recruiter_id", "name")
      .sort({ createdAt: -1 })
      .limit(candidateCap)
      .lean();

    const candidateIds = internships.map((item) => item._id);
    const applicationCounts = candidateIds.length
      ? await Student.aggregate([
          { $unwind: "$appliedInternships" },
          { $match: { "appliedInternships.internship": { $in: candidateIds } } },
          {
            $group: {
              _id: "$appliedInternships.internship",
              count: { $sum: 1 },
            },
          },
        ])
      : [];

    const applicationsMap = new Map(
      applicationCounts.map((row) => [String(row._id), Number(row.count || 0)])
    );

    const normalizedInternships = normalizeInternships(internships, applicationsMap);

    const recommendationData = await getCachedOrFreshRecommendations({
      studentId,
      limit,
      refresh,
      student,
      internships: normalizedInternships,
      cachedSnapshot,
    });

    const filteredItems = (Array.isArray(recommendationData.items) ? recommendationData.items : [])
      .filter((item) => !isStrictLocationMismatch(item))
      .filter((item) => Number(item?.score || 0) >= minScore)
      .slice(0, limit);

    if (!recommendationData.fromCache) {
      await RecommendationSnapshot.findOneAndUpdate(
        { studentId, limit },
        {
          $set: {
            candidateCount: recommendationData.candidateCount,
            items: recommendationData.items,
            source: recommendationData.source,
            modelVersion: recommendationData.modelVersion,
            latencyMs: recommendationData.latencyMs,
            candidateFingerprint: recommendationData.candidateFingerprint || "",
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          sort: { createdAt: -1 },
        }
      );
    }

    const logPayload = {
      requestId,
      studentId: String(studentId),
      candidateCount: recommendationData.candidateCount,
      source: recommendationData.source,
      latencyMs: recommendationData.latencyMs,
      errorClass: recommendationData.rankingError?.code || null,
      totalHandlerMs: Date.now() - startedAt,
    };

    console.log("[recommendations]", JSON.stringify(logPayload));

    return res.status(200).json({
      success: true,
      generatedAt: recommendationData.generatedAt,
      source: recommendationData.source,
      modelVersion: recommendationData.modelVersion,
      items: filteredItems,
    });
  } catch (error) {
    console.error("[recommendations]", JSON.stringify({
      requestId,
      studentId: String(req.studentId || ""),
      errorClass: error?.code || error?.name || "unknown",
      message: error?.message || "Failed to fetch recommendations",
      totalHandlerMs: Date.now() - startedAt,
    }));

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
    });
  }
};
