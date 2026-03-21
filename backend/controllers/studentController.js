import Student from "../models/Student.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { normalizeSkillArray } from "../utils/skillNormalization.js";

const MAX_RESUME_COUNT = 3;

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

    if (student.isactive === false) {
      return res.status(403).json({ success: false, message: "Your account is blocked" });
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

const normalizeSkills = (skills) => normalizeSkillArray(skills);

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

const normalizeEducationGrade = (item = {}) => {
  const explicitType = String(item?.gradeType || "").trim();
  const explicitValue = String(item?.gradeValue || "").trim();
  const legacyCgpa = String(item?.cgpa || "").trim();
  const legacyGrade = String(item?.grade || "").trim();

  const gradeValue = explicitValue || legacyCgpa || legacyGrade;
  if (!gradeValue) return { gradeType: "", gradeValue: "" };

  if (explicitType) return { gradeType: explicitType, gradeValue };
  if (legacyCgpa) return { gradeType: "CGPA", gradeValue };
  if (legacyGrade) return { gradeType: "Percentage", gradeValue };

  const numeric = Number.parseFloat(gradeValue);
  if (Number.isFinite(numeric)) {
    return {
      gradeType: numeric <= 10 ? "CGPA" : "Percentage",
      gradeValue,
    };
  }

  return { gradeType: "", gradeValue };
};

const normalizeEducations = (educations) => {
  if (!Array.isArray(educations)) return [];

  return educations.map((item) => {
    const { gradeType, gradeValue } = normalizeEducationGrade(item);

    return {
      instituteName: item?.instituteName || "",
      boardOrUniversity: item?.boardOrUniversity || "",
      degreeType: item?.degreeType || "",
      fieldOfStudy: item?.fieldOfStudy || "",
      specialization: item?.specialization || "",
      startYear: item?.startYear || "",
      endYear: item?.endYear || "",
      status: item?.status || "pursuing",
      courseType: item?.courseType || "",
      gradeType,
      gradeValue,
      location: item?.location || "",
      description: item?.description || "",
    };
  });
};

const normalizeCertificates = (certificates) => {
  if (!Array.isArray(certificates)) return [];

  return certificates.map((item) => ({
    name: item?.name || "",
    organization: item?.organization || "",
    certificateType: item?.certificateType || "",
    techStack: normalizeSkillArray(item?.techStack),
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
    techStack: normalizeSkillArray(item?.techStack),
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

const getFileNameFromUrl = (url = "") => {
  if (typeof url !== "string" || !url.trim()) return "resume";
  const cleanUrl = url.split("?")[0];
  const parts = cleanUrl.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "resume");
};

const normalizeResumes = (resumes) => {
  if (!Array.isArray(resumes)) return [];

  const seen = new Set();
  return resumes
    .map((item) => {
      const url = String(item?.url || item || "").trim();
      if (!url || seen.has(url)) return null;
      seen.add(url);
      return {
        url,
        name: String(item?.name || getFileNameFromUrl(url)).trim() || getFileNameFromUrl(url),
        uploadedAt: item?.uploadedAt ? new Date(item.uploadedAt) : new Date(),
      };
    })
    .filter(Boolean);
};

export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const legacyResume = String(student.resume || "").trim();
    const normalizedResumes = normalizeResumes(student.resumes || []);
    const hasLegacyInList = normalizedResumes.some((item) => item.url === legacyResume);
    const resumes = legacyResume && !hasLegacyInList
      ? [{ url: legacyResume, name: getFileNameFromUrl(legacyResume), uploadedAt: new Date() }, ...normalizedResumes]
      : normalizedResumes;

    return res.status(200).json({
      success: true,
      profile: {
        dp: student.profilePic || "",
        firstName: student.fname || "",
        lastName: student.lname || "",
        gender: student.gender || "",
        dob: student.dob ? student.dob.toISOString().split("T")[0] : "",
        currentCourse: student.currentCourse || "",
        cgpa: student.cgpa || "",
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
        skills: normalizeSkills(student.skills),
        educations: normalizeEducations(student.educations),
        certificates: normalizeCertificates(student.certificates),
        projects: normalizeProjects(student.projects),
        socialLinks: normalizeSocialLinks(student.socialLinks),
        resume: legacyResume,
        resumes,
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
      currentCourse,
      cgpa,
      phone,
      address1,
      address2,
      city,
      state,
      pincode,
      preferredLocation,
      languages,
      hobbies,
      skills,
      educations,
      certificates,
      projects,
      socialLinks,
      resume,
      resumes,
    } = req.body;

    if (Object.prototype.hasOwnProperty.call(req.body, "dp")) student.profilePic = dp || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "firstName")) student.fname = firstName || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "lastName")) student.lname = lastName || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "gender")) student.gender = gender || undefined;
    if (Object.prototype.hasOwnProperty.call(req.body, "dob")) student.dob = dob || undefined;
    if (Object.prototype.hasOwnProperty.call(req.body, "currentCourse")) student.currentCourse = currentCourse || "";
    if (Object.prototype.hasOwnProperty.call(req.body, "cgpa")) student.cgpa = cgpa || undefined;
    if (Object.prototype.hasOwnProperty.call(req.body, "phone")) student.phone_no = phone || "";
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
    if (Object.prototype.hasOwnProperty.call(req.body, "skills")) {
      student.skills = normalizeSkills(skills);
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

    let nextResumes = normalizeResumes(student.resumes || []);
    const currentResume = String(student.resume || "").trim();
    if (currentResume && !nextResumes.some((item) => item.url === currentResume)) {
      nextResumes = [
        { url: currentResume, name: getFileNameFromUrl(currentResume), uploadedAt: new Date() },
        ...nextResumes,
      ];
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "resumes")) {
      nextResumes = normalizeResumes(resumes);
      if (nextResumes.length > MAX_RESUME_COUNT) {
        return res.status(400).json({
          success: false,
          message: `You can upload maximum ${MAX_RESUME_COUNT} resumes only.`,
        });
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "resume")) {
      const nextResume = typeof resume === "string" ? resume.trim() : "";
      student.resume = nextResume;
      if (nextResume && !nextResumes.some((item) => item.url === nextResume)) {
        nextResumes = [
          { url: nextResume, name: getFileNameFromUrl(nextResume), uploadedAt: new Date() },
          ...nextResumes,
        ];
      }
    } else if (student.resume && !nextResumes.some((item) => item.url === student.resume)) {
      student.resume = nextResumes[0]?.url || "";
    }

    if (nextResumes.length > MAX_RESUME_COUNT) {
      return res.status(400).json({
        success: false,
        message: `You can upload maximum ${MAX_RESUME_COUNT} resumes only.`,
      });
    }

    student.resumes = nextResumes;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        dp: student.profilePic || "",
        currentCourse: student.currentCourse || "",
        cgpa: student.cgpa || "",
        skills: normalizeSkills(student.skills),
        certificates: normalizeCertificates(student.certificates),
        projects: normalizeProjects(student.projects),
        socialLinks: normalizeSocialLinks(student.socialLinks),
        resume: student.resume || "",
        resumes: normalizeResumes(student.resumes || []),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


