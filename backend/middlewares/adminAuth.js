import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default adminAuth;
