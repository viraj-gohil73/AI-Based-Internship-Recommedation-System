import Student from "../models/Student.js";
import bcrypt from "bcryptjs";

export const registerStudent = async (req, res) => {
  try {
    const { email, password, role, fname = "", lname = "", name = "" } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await Student.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    let firstName = fname.trim();
    let lastName = lname.trim();

    if (!firstName && name.trim()) {
      const parts = name.trim().split(/\s+/);
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Student.create({
      email: normalizedEmail,
      password: hashedPassword,
      fname: firstName,
      lname: lastName,
      loginType: role === "google" ? "google" : "email",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      student: {
        id: user._id,
        email: user.email,
        fname: user.fname || "",
        lname: user.lname || "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
