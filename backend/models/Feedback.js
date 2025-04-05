// models/Feedback.js
/*import mongoose from "mongoose";

const feedbackSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Feedback message is required"],
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;*/
import mongoose from "mongoose";

const feedbackSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interfaceRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    journeyRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    functionalityRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    message: {
      type: String,
      default: "", // Optional field for suggestions or comments
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;

