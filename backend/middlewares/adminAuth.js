import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔒 Token present & Bearer format check
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ❌ Role check (VERY IMPORTANT)
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    // ✅ Attach decoded data
    req.admin = decoded;        // { id, role, iat, exp }
    req.adminId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
