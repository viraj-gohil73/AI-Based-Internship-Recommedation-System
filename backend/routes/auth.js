import express from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
//import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import dotenv from "dotenv";
import User from "../models/Student.js";
import { handleOAuthSuccess } from "../controllers/authController.js";

dotenv.config();
const router = express.Router();

/* ---------------- SESSION ---------------- */
router.use(
  session({
    secret: process.env.JWT_SECRET || "SECRET_KEY",
    resave: false,
    saveUninitialized: true,
  })
);

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

/* ---------------- GOOGLE STRATEGY ---------------- */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            photo: profile.photos[0]?.value,
            loginType: "google",
            isVerified: true,
          });
        }

        done(null, user);
      }
      catch(err) 
      {
        done(err, null);
      }
    }
  )
);

/* ---------------- LINKEDIN STRATEGY ---------------- */
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/linkedin/callback`,
      scope: ["r_emailaddress", "r_liteprofile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            photo: profile.photos[0]?.value,
            loginType: "linkedin",
            isVerified: true,
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

/* ---------------- ROUTES ---------------- */

// GOOGLE
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  handleOAuthSuccess
);

// LINKEDIN
router.get("/linkedin", passport.authenticate("linkedin"));
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  handleOAuthSuccess
);

export default router;
