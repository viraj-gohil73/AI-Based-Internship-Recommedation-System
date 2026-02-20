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
import { handleRazorpayWebhook } from "./controllers/paymentWebhookController.js";

dotenv.config();
const app = express();

app.use(cookieParser());
app.post(
  "/api/payments/razorpay/webhook",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook
);
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

configurePassport(app);
app.use(passport.initialize());
googleCallbackHandler();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await seedAdmin();
    await seedSubscriptionSystem();
  })
  .catch((err) => console.log(err));

// app.use("/api/auth", authRoutes);
app.use("/api/company", companyroutes);
app.use("/api/auth", authvg);
app.use("/api/admin", adminApprovalRoutes);
app.use("/api/recruiter", recruiterAuthRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/student", studentRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
