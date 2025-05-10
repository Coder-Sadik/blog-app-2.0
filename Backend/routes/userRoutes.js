import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // Protect middleware to secure routes
import {
	getUserProfile,
	updateUserProfile,
} from "../controllers/userController.js"; // Controller functions

const router = express.Router();

// Get user profile (protected)
router.get("/profile", protect, getUserProfile);

// Update user profile (protected)
router.put("/profile", protect, updateUserProfile);

export default router;
