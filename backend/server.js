import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import 'dotenv/config';
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import cors from "cors";
import path from "path";

dotenv.config();
const app = express();

// Database Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/swap", swapRoutes);

// Serve static files from the uploads directory
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));