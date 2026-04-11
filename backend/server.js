import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import session from "express-session";
import { configurePassport } from "./config/passport.js";
import { googleCallbackHandler } from "./controllers/authGoogle.js";
import companyroutes from "./routes/companyRoutes.js";
import "./config/passportCompany.js";
import cookieParser from "cookie-parser";
import adminApprovalRoutes from "./routes/admin.js";
import authvg from "./routes/authvg.js";
import { seedAdmin } from "./controllers/seedAdmin.js";
import recruiterAuthRoutes from "./routes/recruiterAuthRoutes.js";
import internshipRoutes from "./routes/internship.js";
import studentRoutes from "./routes/studentRoutes.js";
import { seedSubscriptionSystem } from "./controllers/seedSubscriptionSystem.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());

const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");

const allowedOrigins = new Set(
  (process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean)
);

const vercelPreviewOriginPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (no Origin header).
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    // Support Vercel preview deployments for this frontend.
    if (vercelPreviewOriginPattern.test(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${normalizedOrigin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

configurePassport(app);
app.use(passport.initialize());
googleCallbackHandler();

// app.use("/api/auth", authRoutes);
app.use("/api/company", companyroutes);
app.use("/api/auth", authvg);
app.use("/api/admin", adminApprovalRoutes);
app.use("/api/recruiter", recruiterAuthRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/notifications", notificationRoutes);

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    await seedAdmin();
    await seedSubscriptionSystem();

    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err?.message || err);
    process.exit(1);
  }
};

startServer();
