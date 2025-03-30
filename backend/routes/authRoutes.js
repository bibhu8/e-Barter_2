import express from "express";
import { loginUser, registerUser, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/*router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false}),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    // Redirect to frontend with token
    //res.redirect(`http://localhost:3000/auth-handler?token=${token}`);
    res.redirect(`${process.env.CLIENT_URL}/auth-handler?token=${token}`)
  }
);*/
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    // Build redirect URL with token, userId, fullname and email as query parameters
    const redirectUrl = `${process.env.CLIENT_URL}/auth-handler?token=${token}&userId=${req.user._id}&fullname=${encodeURIComponent(req.user.fullname)}&email=${encodeURIComponent(req.user.email)}`;
    res.redirect(redirectUrl);
  }
);
export default router;
