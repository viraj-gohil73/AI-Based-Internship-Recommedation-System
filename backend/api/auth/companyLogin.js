import Company from "../../models/Company.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const companyLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    //const isMatch = password === company.password;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: company._id, role: "company" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: company._id,
        email: company.email,
        role: "company",
      },
    });
  } catch (err) {
    console.error("Company Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
