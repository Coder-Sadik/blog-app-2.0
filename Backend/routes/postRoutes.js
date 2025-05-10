import express from "express";
import {
	protect,
	checkNotBanned,
	admin,
} from "../middleware/authMiddleware.js"; // Correct import of admin
import {
	createPost,
	getAllPosts,
	getPostById,
	updatePost,
	deletePost,
	toggleLike,
	addComment,
	deleteOwnComment,
	restorePost, // Import restorePost
} from "../controllers/postController.js";

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected routes (authenticated + not banned)
router.post("/", protect, checkNotBanned, createPost);
router.put("/:id", protect, checkNotBanned, updatePost);
router.delete("/:id", protect, checkNotBanned, deletePost);
router.post("/:id/like", protect, checkNotBanned, toggleLike);
router.post("/:id/comment", protect, checkNotBanned, addComment);
router.delete(
	"/:id/comment/:commentId",
	protect,
	checkNotBanned,
	deleteOwnComment
);

// Admin routes (admin required)
router.delete("/admin/posts/:id", protect, admin, deletePost);
router.put("/admin/posts/restore/:id", protect, admin, restorePost); // Now correctly using restorePost

export default router;
