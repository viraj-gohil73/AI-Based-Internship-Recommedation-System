import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
  const adminExists = await Admin.findOne({ role: "ADMIN" });

  if (adminExists) {
    console.log("⚠️ Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await Admin.create({
    name: "Super Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "ADMIN",
    active: true,
  });

  console.log("✅ Admin initialized successfully");
};
