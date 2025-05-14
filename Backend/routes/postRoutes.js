// src/routes/postRoutes.js
import express from "express";
import multer from "multer";
import {
	protect,
	checkNotBanned,
	admin,
} from "../middleware/authMiddleware.js";
import {
	createPost,
	getAllPosts,
	getPostById,
	updatePost,
	deletePost,
	toggleLike,
	addComment,
	deleteOwnComment,
	restorePost,
} from "../controllers/postController.js";

// configure multer to write to disk (so Cloudinary upload can read it)
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected routes (authenticated + not banned)
// CREATE needs multer:
router.post("/", protect, checkNotBanned, upload.single("image"), createPost);

// UPDATE now also needs multer:
router.put("/:id", protect, checkNotBanned, upload.single("image"), updatePost);

router.delete("/:id", protect, checkNotBanned, deletePost);
router.post("/:id/like", protect, checkNotBanned, toggleLike);
router.post("/:id/comment", protect, checkNotBanned, addComment);
router.delete(
	"/:id/comment/:commentId",
	protect,
	checkNotBanned,
	deleteOwnComment
);
router.put("/:id/restore", protect, admin, restorePost); // if you have a restore

// Admin routes (admin required)
router.delete("/admin/posts/:id", protect, admin, deletePost);
router.put("/admin/posts/restore/:id", protect, admin, restorePost);

export default router;
