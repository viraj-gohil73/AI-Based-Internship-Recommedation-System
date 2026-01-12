import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../../models/Student.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        
        
        if (!user) {
          user = await User.create({
            fname: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.photos[0].value,
            loginType: "google",
            isVerified: true,
          });


         /* if (!user.googleId) {
            user.googleId = googleId;
            user.loginType = "google";
            user.isVerified = true;
            user.photo = user.photo || profile.photos?.[0]?.value;
            await user.save();
            console.log("🔗 Linked Google account with existing email user:", email);
          } else {
            console.log("✅ Existing Google user:", email);
          }
        } else {
          // ✅ Case 2: First-time Google user → create new record
          user = await User.create({
            name: profile.displayName,
            email,
            photo: profile.photos?.[0]?.value,
            googleId,
            loginType: "google",
            isVerified: true,
          });
          console.log("🆕 New Google user created:", email);
        }*/

        
          console.log("New user created:", user);
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
