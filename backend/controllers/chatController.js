import Chat from "../models/Chat.js";
import SwapRequest from "../models/SwapRequest.js";
import mongoose from "mongoose";
import { io } from "../server.js";

// controllers/chatController.js
export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({
      participants: userId,
      deletedBy: { $ne: userId }  // Exclude chats deleted by this user
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


    // Extract the last message with populated sender
    const lastMessage = updatedChat.messages.slice(-1)[0];
    
    // Emit to all chat participants
    io.to(chatId).emit("chat:message", lastMessage);

    res.json(updatedChat);
    // io.to(chatId).emit('chat:message', updatedChat);

  } catch (error) {
    res.status(500).json({ message: "Error saving message" });
  }
};

// New function for saving a message via socket events
export const saveChatMessageSocket = async ({ chatId, content, sender }) => {
  const newMessage = { sender, content };
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { messages: newMessage },
      $set: { lastUpdated: Date.now(), deletedBy: []  },
      // Convert sender to an ObjectId to ensure a match in the deletedBy array
    },
    { new: true }
  ).populate("messages.sender", "fullname");

  if (!updatedChat) {
    throw new Error("Chat not found");
  }
  return updatedChat;
};


export const createChatFromSwap = async (swapRequestId) => {
  try {
    // Find the swap request and populate sender and receiver details
    const request = await SwapRequest.findById(swapRequestId)
      .populate("sender", "fullname")
      .populate("receiver", "fullname");

    if (!request) {
      throw new Error("Swap request not found");
    }

    // Create a new chat using the sender and receiver from the swap request
    const newChat = new Chat({
      participants: [request.sender._id, request.receiver._id],
      messages: []  // Initialize with no messages
      // createdAt and lastUpdated will be set automatically
    });

    await newChat.save();
    return newChat;
  } catch (error) {
    console.error("Error creating chat from swap:", error);
    throw error;
  }
};

export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("participants", "fullname")
      .populate("messages.sender", "fullname");
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Add the current user to the deletedBy array if not already present
    if (!chat.deletedBy.includes(userId)) {
      chat.deletedBy.push(userId);
      await chat.save();
    }

    // If all participants have deleted the chat, remove it from the database
    if (chat.deletedBy.length === chat.participants.length) {
      await Chat.findByIdAndDelete(chatId);
      // Emit to all sockets in the chat room that it’s fully deleted
      chat.participants.forEach((participant) => {
        io.to(participant.toString()).emit("chat:deleted", { chatId });
      });
    } else {
      // Notify all participants about the update
      io.to(chatId).emit("chat:updated", { 
        chatId,
        deletedBy: chat.deletedBy 
      });
      chat.participants.forEach((participant) => {
        io.to(participant.toString()).emit("chat:update", chat);
      });
    }

    res.json({ message: "Chat deleted for current user" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting chat", error: error.message });
  }
};

