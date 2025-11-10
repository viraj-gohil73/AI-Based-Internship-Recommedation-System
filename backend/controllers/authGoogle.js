import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/Student.js";
import jwt from "jsonwebtoken";

dotenv.config();

export const googleCallbackHandler = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("🟢 Google profile:", profile);
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email found"), null);

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email,
              photo: profile.photos?.[0]?.value,
              loginType: "google",
              isVerified: true,
            });
          }

          console.log("✅ User Found/Created:", user.email);
          done(null, user); // <-- This does NOT use req.login() because session: false
        } catch (error) {
          console.error("❌ Google Strategy Error:", error);
          done(error, null);
        }
      }
    )
  );

  console.log("✅ Google Strategy initialized (stateless)");
};
