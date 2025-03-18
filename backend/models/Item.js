import mongoose from "mongoose";

function arrayLimit(val) {
  return val.length <= 5;
}

const ItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    bookType: { type: String, required: false },
    images: {
      type: [String],
      validate: [arrayLimit, "{PATH} exceeds the limit of 5 images"],
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Item", ItemSchema);
