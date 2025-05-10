import express from "express";
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

// User Management
router.get("/users", protect, admin, getAllUsers);
router.put("/users/approve/:id", protect, admin, approveUser);
router.put("/users/suspend/:id", protect, admin, suspendUser);
router.put("/users/unsuspend/:id", protect, admin, unsuspendUser);
router.delete("/users/:id", protect, admin, deleteUser);

// Post Management
router.delete("/posts/:id", protect, admin, adminDeletePost); // Changed to /posts
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
