import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  condition: { type: String, required: true },
  images: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
},
{
  timestamps: true
});

export default mongoose.model("Item", ItemSchema);
