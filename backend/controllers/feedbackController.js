// controllers/feedbackController.js
/*import Feedback from "../models/Feedback.js";

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
};*/
// controllers/feedbackController.js
import Feedback from "../models/Feedback.js";

export const createFeedback = async (req, res) => {
  try {
    const { interfaceRating, journeyRating, functionalityRating, message } = req.body;

    // Validate all required fields
    if (
      !interfaceRating ||
      !journeyRating ||
      !functionalityRating ||
      interfaceRating < 1 || interfaceRating > 5 ||
      journeyRating < 1 || journeyRating > 5 ||
      functionalityRating < 1 || functionalityRating > 5
    ) {
      return res.status(400).json({ message: "All ratings must be between 1 and 5 stars" });
    }

    // Create feedback
    const feedback = await Feedback.create({
      user: req.user._id,
      interfaceRating,
      journeyRating,
      functionalityRating,
      message,
    });

    res.status(201).json({ feedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

