import Student from "../models/Student.js";
import Company from "../models/Company.js";
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
    const [existingStudent, existingCompany] = await Promise.all([
      Student.findOne({ email: normalizedEmail }),
      Company.findOne({ email: normalizedEmail }),
    ]);

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered as company. Use company login.",
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
