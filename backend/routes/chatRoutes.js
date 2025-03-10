import express from "express";
import { getChats, saveChatMessage, getChat, deleteChat } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's chats
router.get("/", protect, getChats);
router.get("/:chatId", protect, getChat);

// Save new message
router.post("/message", protect, saveChatMessage);


// Delete a chat
router.delete("/:chatId", protect, deleteChat);

export default router;