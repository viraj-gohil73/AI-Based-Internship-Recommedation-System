import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Company from "../models/Company.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  "google-company",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.BACKEND_URL +
        "/api/company/google/company/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);

        let company = await Company.findOne({ email });

        if (!company) {
          company = await Company.create({
            email,
            companyName: profile.displayName,
            logo: profile.photos?.[0]?.value,
            googleId: profile.id,
            loginType: "google",
          });
        }

        const token = jwt.sign(
          { id: company._id, role: "company" },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // ⭐ THIS IS KEY ⭐
        done(null, { token });

      } catch (err) {
        done(err, null);
      }
    }
  )
);

console.log("✅ google-company strategy registered");
