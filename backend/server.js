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

  // Handle joining user room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Send a welcome message to the client
  socket.emit("message", "Welcome to the Socket.IO server!");

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log("A client disconnected.");
  });

   // Handle chat messages
   socket.on("chat:message", async (data) => {
    try {
      // Save message to database
      const savedMessage = await saveChatMessageToDB(data);
      
      // Broadcast to chat room
      io.to(data.chatId).emit("chat:message", savedMessage);
    } catch (error) {
      console.error("Error handling chat message:", error);
    }
  });

  // Join chat room
  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
  });

  // Leave chat room
  socket.on("leave-chat", (chatId) => {
    socket.leave(chatId);
  });
});

// Set the port for the server
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
