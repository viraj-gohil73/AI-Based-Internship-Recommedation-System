import dotenv from "dotenv";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import Internship from "../models/Internship.js";

dotenv.config();

const TITLE_NORMALIZERS = [
  {
    match: /\bpython\s+dev(?:eloper|loper)?\b/i,
    value: "Python Developer Intern",
  },
  {
    match: /\breact(?:\.?js)?\s+dev(?:eloper|loper)?\b/i,
    value: "React.js Developer Intern",
  },
  {
    match: /\bnode(?:\.?js)?\s+dev(?:eloper|loper)?\b/i,
    value: "Node.js Developer Intern",
  },
  {
    match: /\bfront\s*end\s+dev(?:eloper|loper)?\b/i,
    value: "Frontend Developer Intern",
  },
  {
    match: /\bback\s*end\s+dev(?:eloper|loper)?\b/i,
    value: "Backend Developer Intern",
  },
  {
    match: /\bfull\s*stack\s+dev(?:eloper|loper)?\b/i,
    value: "Full Stack Developer Intern",
  },
];

const cleanTitle = (title = "") => {
  const cleaned = String(title || "").replace(/\s*#\d+\s*$/i, "").trim();
  if (!cleaned) return cleaned;

  for (const normalizer of TITLE_NORMALIZERS) {
    if (normalizer.match.test(cleaned)) {
      return normalizer.value;
    }
  }

  return cleaned
    .replace(/\bdevloper\b/gi, "Developer")
    .replace(/\breactjs\b/gi, "React.js")
    .replace(/\bnodejs\b/gi, "Node.js");
};

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const companies = await Company.find({}, { _id: 1 }).lean();
    if (!companies.length) {
      throw new Error("No companies found. Please create at least one company before mapping internships.");
    }

    const internships = await Internship.find({}, { _id: 1, title: 1, company_id: 1 }).lean();
    if (!internships.length) {
      console.log("No internships found.");
      process.exit(0);
    }

    let companyIndex = 0;
    const operations = internships.map((internship) => {
      const next = {
        title: cleanTitle(internship.title),
      };

      if (!internship.company_id) {
        next.company_id = companies[companyIndex % companies.length]._id;
        companyIndex += 1;
      }

      return {
        updateOne: {
          filter: { _id: internship._id },
          update: { $set: next },
        },
      };
    });

    const result = await Internship.bulkWrite(operations, { ordered: false });

    const missingCompanyAfter = await Internship.countDocuments({ company_id: { $exists: false } });
    const hashTitlesAfter = await Internship.countDocuments({ title: /\s#\d+\s*$/i });

    console.log(
      `Updated internships: matched=${result.matchedCount || 0}, modified=${result.modifiedCount || 0}`
    );
    console.log(
      `Post-check: missingCompanyId=${missingCompanyAfter}, titlesWithHashNumber=${hashTitlesAfter}`
    );

    process.exit(0);
  } catch (error) {
    console.error("Failed to cleanup internship company/title data:", error.message);
    process.exit(1);
  }
};

run();
