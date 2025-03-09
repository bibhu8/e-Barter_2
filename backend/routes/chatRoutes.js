import express from "express";
import { getChats, saveChatMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's chats
router.get("/", protect, getChats);

// Save new message
router.post("/message", protect, saveChatMessage);

export default router;