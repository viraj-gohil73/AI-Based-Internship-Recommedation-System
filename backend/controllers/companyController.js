import Company from "../models/Company.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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