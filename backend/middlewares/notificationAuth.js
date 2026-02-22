import jwt from "jsonwebtoken";

const ROLE_TO_MODEL = {
  student: "Student",
  recruiter: "Recruiter",
  company: "Company",
  admin: "Admin",
};

export const notificationAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const normalizedRole = String(decoded.role || "").toLowerCase();
    const recipientModel = ROLE_TO_MODEL[normalizedRole];

    if (!recipientModel || !decoded.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    req.notificationUser = {
      id: decoded.id,
      role: normalizedRole,
      recipientModel,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
