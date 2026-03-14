import dotenv from "dotenv";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import Internship from "../models/Internship.js";

dotenv.config();

const cleanTitle = (title = "") => String(title || "").replace(/\s*#\d+\s*$/i, "").trim();

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
