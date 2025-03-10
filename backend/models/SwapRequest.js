import mongoose from "mongoose";

const SwapRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  offeredItem: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  desiredItem: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
},
{
  timestamps: true
});

export default mongoose.model("SwapRequest", SwapRequestSchema);