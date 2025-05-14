// controllers/postController.js
import cloudinary from "../config/cloudinaryConfig.js";
import Post from "../models/Post.js";
import { uploadImage } from "../utils/uploadImage.js"; // multer instance

// helper: only upload if there's a file
const maybeUploadToCloudinary = async (file) => {
	if (!file) return null;
	const result = await cloudinary.v2.uploader.upload(file.path, {
		folder: "posts",
		transformation: [{ width: 800, height: 600, crop: "limit" }],
	});
	return result.secure_url;
};
// Create a post with an optional image
export const createPost = async (req, res) => {
	try {
		const imageUrl = req.file ? await maybeUploadToCloudinary(req.file) : null;
		const { title, content } = req.body;

		const newPost = new Post({
			title,
			content,
			image: imageUrl,
			author: req.user.id,
		});

		await newPost.save();
		res.status(201).json({ status: "success", data: newPost });
	} catch (error) {
		console.error("Error creating post:", error);
		res
			.status(500)
			.json({ code: "POST_CREATION_FAILED", message: "Failed to create post" });
	}
};

// Get all posts
export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find({ isDeleted: false })
			.populate("author", "username email")
			.select("-__v -comments.__v")
			.lean();

		res.status(200).json({
			status: "success",
			results: posts.length,
			data: posts,
		});
	} catch (error) {
		console.error("Error fetching posts:", error);
		res.status(500).json({
			code: "POST_FETCH_FAILED",
			message: "Failed to fetch posts",
		});
	}
};

// Get a post by ID (and increment its view count)
export const getPostById = async (req, res) => {
	try {
		const post = await Post.findOneAndUpdate(
			{ _id: req.params.id, isDeleted: false },
			{ $inc: { views: 1 } },
			{ new: true }
		)
			.populate("author", "username email")
			.populate("comments.user", "username email")
			.select("-__v -comments.__v")
			.lean();

		if (!post) {
			return res.status(404).json({
				code: "POST_NOT_FOUND",
				message: "Post not found",
			});
		}

		res.status(200).json({
			status: "success",
			data: post,
		});
	} catch (error) {
		console.error("Error fetching post by ID:", error);
		res.status(500).json({
			code: "POST_FETCH_FAILED",
			message: "Failed to fetch post",
		});
	}
};

// Update a post (only overwrite image if a new file is provided)
export const updatePost = async (req, res) => {
	try {
		const { title, content } = req.body;
		const updateData = { title, content };

		if (req.file) {
			updateData.image = await maybeUploadToCloudinary(req.file);
		}

		const updated = await Post.findOneAndUpdate(
			{ _id: req.params.id, author: req.user.id, isDeleted: false },
			updateData,
			{ new: true, runValidators: true }
		)
			.populate("author", "username email")
			.lean();

		if (!updated) {
			return res
				.status(404)
				.json({
					code: "POST_NOT_FOUND",
					message: "Post not found or no permission",
				});
		}

		res.status(200).json({ status: "success", data: updated });
	} catch (error) {
		console.error("Error updating post:", error);
		res
			.status(500)
			.json({ code: "POST_UPDATE_FAILED", message: "Failed to update post" });
	}
};

// Delete a post (soft delete)
export const deletePost = async (req, res) => {
	try {
		const post = await Post.findOneAndUpdate(
			{ _id: req.params.id, isDeleted: false },
			{ isDeleted: true },
			{ new: true }
		)
			.select("-__v -comments.__v")
			.lean();

		if (!post) {
			return res.status(404).json({
				code: "POST_NOT_FOUND",
				message: "Post not found or already deleted",
			});
		}

		res.status(200).json({
			status: "success",
			message: "Post deleted successfully",
			data: post,
		});
	} catch (error) {
		console.error("Error deleting post:", error);
		res.status(500).json({
			code: "POST_DELETE_FAILED",
			message: "Failed to delete post",
		});
	}
};

// Restore a post (restore from soft delete)
export const restorePost = async (req, res) => {
	try {
		const post = await Post.findOneAndUpdate(
			{ _id: req.params.id, isDeleted: true },
			{ isDeleted: false },
			{ new: true }
		)
			.select("-__v -comments.__v")
			.lean();

		if (!post) {
			return res.status(404).json({
				code: "POST_NOT_FOUND",
				message: "Post not found or not deleted",
			});
		}

		res.status(200).json({
			status: "success",
			message: "Post restored successfully",
			data: post,
		});
	} catch (error) {
		console.error("Error restoring post:", error);
		res.status(500).json({
			code: "POST_RESTORE_FAILED",
			message: "Failed to restore post",
		});
	}
};

// Add a comment to a post
export const addComment = async (req, res) => {
	const { text } = req.body;
	if (!text?.trim()) {
		return res.status(400).json({
			code: "COMMENT_REQUIRED",
			message: "Comment text cannot be empty",
		});
	}

	try {
		const post = await Post.findOneAndUpdate(
			{ _id: req.params.id, isDeleted: false },
			{
				$push: {
					comments: {
						user: req.user.id,
						text: text.trim(),
					},
				},
			},
			{ new: true }
		)
			.populate("comments.user", "username email")
			.select("-__v -comments.__v")
			.lean();

		if (!post) {
			return res.status(404).json({
				code: "POST_NOT_FOUND",
				message: "Post not found",
			});
		}

		const newComment = post.comments[post.comments.length - 1];
		res.status(201).json({ status: "success", comment: newComment });
	} catch (error) {
		console.error("Error adding comment:", error);
		res.status(500).json({
			code: "COMMENT_ADD_FAILED",
			message: "Failed to add comment",
		});
	}
};

// Delete own comment from a post
export const deleteOwnComment = async (req, res) => {
	try {
		const post = await Post.findOneAndUpdate(
			{
				_id: req.params.id,
				"comments._id": req.params.commentId,
				"comments.user": req.user.id,
			},
			{ $pull: { comments: { _id: req.params.commentId } } },
			{ new: true }
		)
			.populate("comments.user", "username email")
			.select("-__v -comments.__v")
			.lean();

		if (!post) {
			return res.status(404).json({
				code: "COMMENT_NOT_FOUND",
				message: "Comment not found or you don't have permission to delete",
			});
		}

		res.status(200).json({
			status: "success",
			message: "Comment deleted successfully",
			data: post,
		});
	} catch (error) {
		console.error("Error deleting comment:", error);
		res.status(500).json({
			code: "COMMENT_DELETE_FAILED",
			message: "Failed to delete comment",
		});
	}
};

// Toggle like (like/unlike) on a post
export const toggleLike = async (req, res) => {
	try {
		const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
		if (!post) {
			return res.status(404).json({
				code: "POST_NOT_FOUND",
				message: "Post not found or has been deleted",
			});
		}

		const isLiked = post.likes.includes(req.user.id);
		if (isLiked) {
			post.likes.pull(req.user.id);
		} else {
			post.likes.push(req.user.id);
		}
		await post.save();

		res.status(200).json({
			status: "success",
			message: isLiked ? "Post unliked" : "Post liked",
			data: post,
		});
	} catch (error) {
		console.error("Error toggling like:", error);
		res.status(500).json({
			code: "TOGGLE_LIKE_FAILED",
			message: "Failed to toggle like",
		});
	}
};
