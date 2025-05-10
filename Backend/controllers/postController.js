import cloudinary from "../config/cloudinaryConfig.js";
import Post from "../models/Post.js";
import { uploadImage } from "../utils/uploadImage.js";

// Function to upload image to Cloudinary (if needed)
export const uploadImageToCloudinary = async (file) => {
	try {
		const result = await cloudinary.v2.uploader.upload(file.path, {
			folder: "posts",
			transformation: [{ width: 800, height: 600, crop: "limit" }],
		});

		return result.secure_url;
	} catch (error) {
		console.error("Error uploading image to Cloudinary", error);
		throw error;
	}
};

// Create a post with an optional image
export const createPost = (req, res) => {
	uploadImage.single("image")(req, res, async (err) => {
		if (err) {
			return res.status(400).json({
				code: "FILE_UPLOAD_FAILED",
				message: err.message,
			});
		}

		const { title, content } = req.body;
		const imagePath = req.file ? req.file.path : null; // Get the uploaded image path

		try {
			const imageUrl = imagePath
				? await uploadImageToCloudinary(req.file) // Upload image to Cloudinary
				: null;

			const newPost = new Post({
				title,
				content,
				image: imageUrl, // Store Cloudinary image URL
				author: req.user.id, // Assume `req.user` contains the logged-in user's information
			});

			// Save the post in the database
			await newPost.save();

			res.status(201).json({
				status: "success",
				data: newPost, // Return the created post as the response
			});
		} catch (error) {
			console.error("Error creating post:", error);
			res.status(500).json({
				code: "POST_CREATION_FAILED",
				message: "Failed to create post",
			});
		}
	});
};

// Get all posts
export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find({ isDeleted: false }) // Assuming soft delete mechanism
			.populate("author", "username email") // Populate author details
			.select("-__v -comments.__v") // Exclude unnecessary fields
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

// Get a post by ID
export const getPostById = async (req, res) => {
	try {
		const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
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

// Update a post
export const updatePost = async (req, res) => {
	const { title, content } = req.body;
	const imagePath = req.file ? req.file.path : null;

	try {
		// Find the post and update it
		const updatedPost = await Post.findOneAndUpdate(
			{ _id: req.params.id, author: req.user.id, isDeleted: false },
			{
				title,
				content,
				image: imagePath ? await uploadImageToCloudinary(req.file) : null,
			},
			{ new: true, runValidators: true }
		)
			.populate("author", "username email")
			.select("-__v -comments.__v")
			.lean();

		if (!updatedPost) {
			return res.status(404).json({
				code: "POST_NOT_FOUND",
				message: "Post not found or you don't have permission to edit",
			});
		}

		res.status(200).json({
			status: "success",
			data: updatedPost,
		});
	} catch (error) {
		console.error("Error updating post:", error);
		res.status(500).json({
			code: "POST_UPDATE_FAILED",
			message: "Failed to update post",
		});
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

		res.status(201).json({
			status: "success",
			comment: newComment,
		});
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
