import Student from "../models/Student.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await Student.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newStudent = await Student.create({ name, email, password });

    const token = jwt.sign(
      { id: newStudent._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      token,
      student: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const loginStudent = async (req, res) => {
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

    const student = await Student.findOne({ email }).select("+password");
    if (!student) {
      return res.status(404).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: student._id,
        email: student.email,
        role: "student",
      },
      student: {
        id: student._id,
        name: `${student.fname || ""} ${student.lname || ""}`.trim(),
        email: student.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const splitCommaSeparated = (value) => {
  if (!value || typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const validateNewPassword = (password) => {
  const value = String(password || "");

  if (value.length < 8) {
    return "New password must be at least 8 characters";
  }

  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return "Use uppercase, lowercase, number, and special character in new password";
  }

  return "";
};

const normalizeEducations = (educations) => {
  if (!Array.isArray(educations)) return [];

  return educations.map((item) => ({
    instituteName: item?.instituteName || "",
    boardOrUniversity: item?.boardOrUniversity || "",
    degreeType: item?.degreeType || "",
    fieldOfStudy: item?.fieldOfStudy || "",
    specialization: item?.specialization || "",
    startYear: item?.startYear || "",
    endYear: item?.endYear || "",
    status: item?.status || "pursuing",
    courseType: item?.courseType || "",
    gradeType: item?.gradeType || "",
    gradeValue: item?.gradeValue || "",
    location: item?.location || "",
    description: item?.description || "",
  }));
};

const normalizeCertificates = (certificates) => {
  if (!Array.isArray(certificates)) return [];

  return certificates.map((item) => ({
    name: item?.name || "",
    organization: item?.organization || "",
    certificateType: item?.certificateType || "",
    techStack: Array.isArray(item?.techStack) ? item.techStack.filter((tech) => typeof tech === "string") : [],
    issueDate: item?.issueDate || "",
    expiryDate: item?.expiryDate || "",
    hasExpiry: Boolean(item?.hasExpiry),
    status: item?.status || "active",
    credentialId: item?.credentialId || "",
    credentialUrl: item?.credentialUrl || "",
    certificateFile: item?.certificateFile || "",
    certificateFileName: item?.certificateFileName || "",
    description: item?.description || "",
  }));
};

const normalizeProjects = (projects) => {
  if (!Array.isArray(projects)) return [];

  return projects.map((item) => ({
    title: item?.title || "",
    description: item?.description || "",
    projectType: item?.projectType || "",
    techStack: Array.isArray(item?.techStack) ? item.techStack.filter((tech) => typeof tech === "string") : [],
    startDate: item?.startDate || "",
    endDate: item?.endDate || "",
    liveUrl: item?.liveUrl || "",
    thumbnail: item?.thumbnail || "",
  }));
};

const normalizeSocialLinks = (socialLinks) => {
  if (!Array.isArray(socialLinks)) return [];

  return socialLinks.map((item) => ({
    platform: item?.platform || "",
    url: item?.url || "",
    username: item?.username || "",
  }));
};

const getUploadcareUUID = (url = "") => {
  if (typeof url !== "string" || !url.trim()) return "";
  const match = url.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i
  );
  return match ? match[1] : "";
};

const deleteUploadcareFile = async (url) => {
  const uuid = getUploadcareUUID(url);
  if (!uuid) return;

  const publicKey = process.env.UPLOADCARE_PUBLIC_KEY;
  const secretKey = process.env.UPLOADCARE_SECRET_KEY;
  if (!publicKey || !secretKey) return;

  try {
    await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Uploadcare.Simple ${publicKey}:${secretKey}`,
        Accept: "application/vnd.uploadcare-v0.7+json",
      },
    });
  } catch (error) {
    console.error("Failed to delete previous Uploadcare resume:", error?.message || error);
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      profile: {
        dp: student.profilePic || "",
        firstName: student.fname || "",
        lastName: student.lname || "",
        gender: student.gender || "",
        dob: student.dob ? student.dob.toISOString().split("T")[0] : "",
        phone: student.phone_no || "",
        email: student.email || "",
        address1: student.address1 || "",
        address2: student.address2 || "",
        city: student.city || "",
        state: student.state || "",
        pincode: student.pincode || "",
        preferredLocation: student.preferredLocation || "",
        languages: Array.isArray(student.languages) ? student.languages.join(", ") : "",
        hobbies: Array.isArray(student.hobbies) ? student.hobbies.join(", ") : "",
        educations: normalizeEducations(student.educations),
        certificates: normalizeCertificates(student.certificates),
        projects: normalizeProjects(student.projects),
        socialLinks: normalizeSocialLinks(student.socialLinks),
        resume: student.resume || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changeStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password must match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const passwordValidationError = validateNewPassword(newPassword);
    if (passwordValidationError) {
      return res.status(400).json({
        success: false,
        message: passwordValidationError,
      });
    }

    const student = await Student.findById(req.studentId).select("+password +loginType");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!student.password) {
      return res.status(400).json({
        success: false,
        message: "Password is not set for this account. Use forgot password first.",
      });
    }

    let isCurrentPasswordValid = false;
    if (student.password.startsWith("$2")) {
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.password);
    } else {
      isCurrentPasswordValid = currentPassword === student.password;
    }

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    student.password = await bcrypt.hash(String(newPassword), 10);
    student.loginType = "email";
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const {
      dp,
      firstName,
      lastName,
      gender,
      dob,
      phone,
      email,
      address1,
      address2,
      city,
      state,
      pincode,
      preferredLocation,
      languages,
      hobbies,
      educations,
      certificates,
      projects,
      socialLinks,
      resume,
    } = req.body;

    if (Object.prototype.hasOwnProperty.call(req.body, "dp")) student.profilePic = dp || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "firstName")) student.fname = firstName || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "lastName")) student.lname = lastName || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "gender")) student.gender = gender || undefined;
    if (Object.prototype.hasOwnProperty.call(req.body, "dob")) student.dob = dob || undefined;
    if (Object.prototype.hasOwnProperty.call(req.body, "phone")) student.phone_no = phone || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "email")) student.email = email || student.email;
    if (Object.prototype.hasOwnProperty.call(req.body, "address1")) student.address1 = address1 || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "address2")) student.address2 = address2 || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "city")) student.city = city || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "state")) student.state = state || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "pincode")) student.pincode = pincode || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "preferredLocation")) {
      student.preferredLocation = preferredLocation || "";
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "languages")) {
      student.languages = splitCommaSeparated(languages);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "hobbies")) {
      student.hobbies = splitCommaSeparated(hobbies);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "educations")) {
      student.educations = normalizeEducations(educations);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "certificates")) {
      student.certificates = normalizeCertificates(certificates);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "projects")) {
      student.projects = normalizeProjects(projects);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "socialLinks")) {
      student.socialLinks = normalizeSocialLinks(socialLinks);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "resume")) {
      const nextResume = typeof resume === "string" ? resume.trim() : "";
      const previousResume = student.resume || "";

      if (previousResume && previousResume !== nextResume) {
        await deleteUploadcareFile(previousResume);
      }

      student.resume = nextResume;
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        dp: student.profilePic || "",
        certificates: normalizeCertificates(student.certificates),
        projects: normalizeProjects(student.projects),
        socialLinks: normalizeSocialLinks(student.socialLinks),
        resume: student.resume || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
