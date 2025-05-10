import express from "express";
import {
	register,
	login,
	verifyEmail,
	requestPasswordReset,
	resetPassword,
} from "../controllers/authController.js"; 
import {
	getAllUsers,
	approveUser,
	suspendUser,
	unsuspendUser,
	deleteUser,
	adminDeletePost,
	adminRestorePost,
	adminDeleteComment,
	adminRestoreComment,
} from "../controllers/adminController.js"; 
import { protect, admin } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// User Authentication Routes
// Register new user
router.post("/register", register);

// Verify email via token
router.get("/verify-email/:token", verifyEmail);

// Login user
router.post("/login", login);

// Request password reset
router.post("/request-password-reset", requestPasswordReset);

// Reset password using token
router.post("/reset-password", resetPassword);

// Admin Routes (User Management, Post Management, etc.)
// User Management
router.get("/users", protect, admin, getAllUsers);
router.put("/users/approve/:id", protect, admin, approveUser);
router.put("/users/suspend/:id", protect, admin, suspendUser);
router.put("/users/unsuspend/:id", protect, admin, unsuspendUser);
router.delete("/users/:id", protect, admin, deleteUser);

// Post Management
router.delete("/posts/:id", protect, admin, adminDeletePost); 
router.put("/posts/restore/:id", protect, admin, adminRestorePost);

// Comment Management
router.delete(
	"/posts/:postId/comments/:commentId",
	protect,
	admin,
	adminDeleteComment
);
router.put(
	"/posts/:postId/comments/:commentId/restore",
	protect,
	admin,
	adminRestoreComment
);

export default router;
