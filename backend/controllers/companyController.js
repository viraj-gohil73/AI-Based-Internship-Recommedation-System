import Company from "../models/Company.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";
// ✅ REGISTER COMPANY
export const registerCompany = async (req, res) => {
  try {
    let { companyName, email, password } = req.body;
    // Check all fields
    if (!email || !password || !companyName)
      return res.status(400).json({ message: "All fields are required" });
    // Check existing email
    const existingUser = await Company.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    password = await bcrypt.hash(password, 10);

    // Create company
    const newCompany = await Company.create({ email, password, companyName });
    // Create JWT Token
    const token = jwt.sign(
      { id: newCompany._id, role: "company" },
      process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    res.status(201).json({
        success: true,
        message: "Company registered successfully",
        token,
        company: {
            id: newCompany._id,
            email: newCompany.email,
            
        },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/**
 * PUT /api/company/update
 */
export const updateCompany = async (req, res) => {
  try {
    const companyId = req.companyId; // string id from token

    const company = await Company.findByIdAndUpdate(
      companyId,              // ✅ string id allowed
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Update company error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




const getUUID = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  return parts[3]; // ucarecdn.com/UUID/
};

export const updateCompanyLogo = async (req, res) => {
  try {
    const { newLogo, oldLogo } = req.body;
    const companyId = req.companyId;

    // delete old file from uploadcare
    const oldUUID = getUUID(oldLogo);

    if (oldUUID) {
      await fetch(`https://api.uploadcare.com/files/${oldUUID}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
          Accept: "application/vnd.uploadcare-v0.7+json",
        },
      });
    }

    // save new logo in DB
    await Company.findByIdAndUpdate(companyId, { logo: newLogo });

    res.json({ success: true, logo: newLogo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logo update failed" });
  }
};