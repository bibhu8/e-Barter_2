import Chat from "../models/Chat.js";
import SwapRequest from "../models/SwapRequest.js";

export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({
      participants: userId
    })
    .populate("participants", "fullname")
    .populate("messages.sender", "fullname")
    .sort("-lastUpdated");

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats" });
  }
};

export const saveChatMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    
    const newMessage = {
      sender: req.user._id,
      content
    };

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: newMessage },
        $set: { lastUpdated: Date.now() }
      },
      { new: true }
    )
    .populate("messages.sender", "fullname");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Error saving message" });
  }
};

export const createChatFromSwap = async (swapRequestId) => {
  try {
    const request = await SwapRequest.findById(swapRequestId)
      .populate("sender")
      .populate("receiver");

    if (!request) throw new Error("Swap request not found");

    const newChat = new Chat({
      participants: [request.sender._id, request.receiver._id],
      messages: []
    });

    await newChat.save();
    return newChat;
  } catch (error) {
    console.error("Error creating chat from swap:", error);
    throw error;
  }
};