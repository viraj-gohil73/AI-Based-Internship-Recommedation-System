import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

export const configurePassport = (app) => {
  // ✅ Session Middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "SECRET_KEY",
      resave: false,
      saveUninitialized: true,
    })
  );

  // ✅ Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const { default: User } = await import("../models/Student.js");
    const user = await User.findById(id);
    done(null, user);
  });
};
