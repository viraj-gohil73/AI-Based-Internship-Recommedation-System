import dotenv from "dotenv";
import mongoose from "mongoose";
import Internship from "../models/Internship.js";

dotenv.config();

const SOFT_SKILLS = new Set([
  "problem solving",
  "communication",
  "collaboration",
  "ownership",
  "attention to detail",
  "time management",
  "adaptability",
  "critical thinking",
  "stakeholder communication",
]);

const normalize = (value = "") => String(value || "").trim().toLowerCase();

const trimSoftSkills = (skills = []) => {
  const source = Array.isArray(skills) ? skills : [];
  const result = [];
  let softCount = 0;

  for (const raw of source) {
    const skill = String(raw || "").trim();
    if (!skill) continue;

    const isSoft = SOFT_SKILLS.has(normalize(skill));
    if (isSoft) {
      if (softCount >= 2) continue;
      softCount += 1;
    }

    result.push(skill);
  }

  return result;
};

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const internships = await Internship.find({}, { _id: 1, skill_req: 1 }).lean();
    if (!internships.length) {
      console.log("No internship records found.");
      process.exit(0);
    }

    const operations = [];
    for (const item of internships) {
      const current = Array.isArray(item.skill_req) ? item.skill_req : [];
      const next = trimSoftSkills(current);
      if (JSON.stringify(current) !== JSON.stringify(next)) {
        operations.push({
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { skill_req: next } },
          },
        });
      }
    }

    if (!operations.length) {
      console.log("No internship records required soft-skill trimming.");
      process.exit(0);
    }

    const result = await Internship.bulkWrite(operations, { ordered: false });
    console.log(
      `Updated internships: matched=${result.matchedCount || 0}, modified=${result.modifiedCount || 0}`
    );

    process.exit(0);
  } catch (error) {
    console.error("Failed to trim internship soft skills:", error.message);
    process.exit(1);
  }
};

run();
