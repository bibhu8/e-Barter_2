import express from "express";
import { createSwapRequest, getSwapRequests, acceptSwapRequest, rejectRequest, deleteRequest} from "../controllers/swapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSwapRequest);
router.get("/", protect, getSwapRequests);
router.put("/:id/accept", protect, acceptSwapRequest);
router.put('/:id/reject', protect, rejectRequest);
router.delete('/:id', protect, deleteRequest);

export default router;