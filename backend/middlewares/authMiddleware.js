const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // decode token here
    req.userId = decoded.id;
    req.companyId = decoded.company_id;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token vg" });
  }
};

export default authMiddleware;
