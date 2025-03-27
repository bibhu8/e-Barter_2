// controllers/feedbackController.js
import Feedback from "../models/Feedback.js";

export const createFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Feedback message is required" });
    }

    // req.user comes from your auth middleware (protect)
    const feedback = await Feedback.create({
      user: req.user._id,
      message,
    });

    res.status(201).json({ feedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
