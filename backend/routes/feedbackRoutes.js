// routes/feedbackRoutes.js
import express from "express";
import { createFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createFeedback);

export default router;
