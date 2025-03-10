// index.js (or server.js)
import express from "express";
import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import cors from "cors";
import { initializeSocket } from "./socket.js";  // Import the socket initialization function
import chatRoutes from "./routes/chatRoutes.js";
import { saveChatMessageSocket } from "./controllers/chatController.js"; // New socket function

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server and attach it to the app
const server = http.createServer(app);

// Initialize Socket.IO and attach to the server
export const io = initializeSocket(server);

// Database Connection
connectDB();

// Middleware
app.use(cors({
  origin: '*', // React app URL
  
}));

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/swap", swapRoutes);
app.use("/api/chats", chatRoutes);

// WebSocket handling
io.on("connection", (socket) => {
  console.log("A client connected.");

  // Join chat room
  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
  });

   // Leave chat room
   socket.on("leave-chat", (chatId) => {
    socket.leave(chatId);
  });

  // Handle joining user room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

   // Handle chat messages
   socket.on("chat:message", async (data) => {
    try {
      console.log("Received chat:message event with data:", data);
      // data should contain: chatId, content, and senderId
      const updatedChat = await saveChatMessageSocket({
        chatId: data.chatId,
        content: data.content,
        sender: data.senderId,
      });
      // Emit the last message to all participants
      const lastMessage = updatedChat.messages.slice(-1)[0];
      io.to(data.chatId).emit("chat:message", lastMessage);
      // Emit a chat update to all participants' personal rooms so their chat lists update
    updatedChat.participants.forEach((participant) => {
      io.to(participant.toString()).emit("chat:update", updatedChat);
    });
      console.log("Emitted chat:message event with lastMessage:", lastMessage);
    } catch (error) {
      console.error("Error handling chat message:", error);
    }
  });

socket.on("delete-chat", (chatId) => {
  socket.to(chatId).emit("chat:deleted", { chatId });
  console.log("Emitted chat:deleted event for chatId:", chatId);
});

// Handle client disconnect
socket.on("disconnect", () => {
  console.log("A client disconnected.");
});

});

// Set the port for the server
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));