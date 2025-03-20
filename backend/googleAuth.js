// googleAuth.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import User from "./models/User.js"; // adjust the path as needed
import jwt from "jsonwebtoken";

// Configure the Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        // Find an existing user by email or create a new user
        let user = await User.findOne({ email: profile.email });
        if (!user) {
          // Option: Generate a random password or mark this user as a Google user
          user = await User.create({
            fullname: profile.displayName,
            email: profile.email,
            password: "", // or generate a random string
          });
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Serialize and deserialize the user (used for session support)
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
