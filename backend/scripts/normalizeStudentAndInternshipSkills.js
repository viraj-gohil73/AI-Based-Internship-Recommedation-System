import dotenv from "dotenv";
import mongoose from "mongoose";
import Student from "../models/Student.js";
import Internship from "../models/Internship.js";
import { normalizeSkillArray } from "../utils/skillNormalization.js";

dotenv.config();

const sameStringArray = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const normalizeStudents = async () => {
  const students = await Student.find(
    {},
    { _id: 1, skills: 1, certificates: 1, projects: 1 }
  ).lean();

  if (!students.length) {
    console.log("No student records found.");
    return { matched: 0, modified: 0 };
  }

  const operations = [];

  for (const student of students) {
    const currentSkills = Array.isArray(student.skills) ? student.skills : [];
    const nextSkills = normalizeSkillArray(currentSkills);

    const currentCertificates = Array.isArray(student.certificates)
      ? student.certificates
      : [];
    const nextCertificates = currentCertificates.map((item) => {
      const techStack = normalizeSkillArray(item?.techStack);
      return {
        ...item,
        techStack,
      };
    });

    const currentProjects = Array.isArray(student.projects) ? student.projects : [];
    const nextProjects = currentProjects.map((item) => {
      const techStack = normalizeSkillArray(item?.techStack);
      return {
        ...item,
        techStack,
      };
    });

    const certificateChanged = currentCertificates.some(
      (item, idx) => !sameStringArray(Array.isArray(item?.techStack) ? item.techStack : [], nextCertificates[idx].techStack)
    );
    const projectChanged = currentProjects.some(
      (item, idx) => !sameStringArray(Array.isArray(item?.techStack) ? item.techStack : [], nextProjects[idx].techStack)
    );

    if (!sameStringArray(currentSkills, nextSkills) || certificateChanged || projectChanged) {
      operations.push({
        updateOne: {
          filter: { _id: student._id },
          update: {
            $set: {
              skills: nextSkills,
              certificates: nextCertificates,
              projects: nextProjects,
            },
          },
        },
      });
    }
  }

  if (!operations.length) {
    console.log("Students already normalized.");
    return { matched: students.length, modified: 0 };
  }

  const result = await Student.bulkWrite(operations, { ordered: false });
  return {
    matched: result.matchedCount || 0,
    modified: result.modifiedCount || 0,
  };
};

const normalizeInternships = async () => {
  const internships = await Internship.find({}, { _id: 1, skill_req: 1 }).lean();

  if (!internships.length) {
    console.log("No internship records found.");
    return { matched: 0, modified: 0 };
  }

  const operations = [];

  for (const internship of internships) {
    const currentSkills = Array.isArray(internship.skill_req) ? internship.skill_req : [];
    const nextSkills = normalizeSkillArray(currentSkills);

    if (!sameStringArray(currentSkills, nextSkills)) {
      operations.push({
        updateOne: {
          filter: { _id: internship._id },
          update: { $set: { skill_req: nextSkills } },
        },
      });
    }
  }

  if (!operations.length) {
    console.log("Internships already normalized.");
    return { matched: internships.length, modified: 0 };
  }

  const result = await Internship.bulkWrite(operations, { ordered: false });
  return {
    matched: result.matchedCount || 0,
    modified: result.modifiedCount || 0,
  };
};

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const studentResult = await normalizeStudents();
    const internshipResult = await normalizeInternships();

    console.log(
      `Student normalization: matched=${studentResult.matched}, modified=${studentResult.modified}`
    );
    console.log(
      `Internship normalization: matched=${internshipResult.matched}, modified=${internshipResult.modified}`
    );

    process.exit(0);
  } catch (error) {
    console.error("Failed to normalize skill data:", error.message);
    process.exit(1);
  }
};

run();
