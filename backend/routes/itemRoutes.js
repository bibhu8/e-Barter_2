import express from "express";
import { getItems, postItem, getItemsByUser,getItemsFromOther} from "../controllers/itemController.js";
import { protect } from "../middleware/authMiddleware.js";
import {deleteItem} from "../controllers/itemController.js";
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get("/getItem", getItems);
router.post("/postItem", protect,upload.single('image'), postItem);
router.get("/user", protect, getItemsByUser);
router.get("/otheruser", protect, getItemsFromOther); 
router.delete("/:id", protect, deleteItem);

export default router;
