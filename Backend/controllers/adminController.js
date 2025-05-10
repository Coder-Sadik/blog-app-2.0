import Post from "../models/Post.js";
import User from "../models/User.js";

// User Management
export const getAllUsers = async (req, res) => {
	try {
		const showDeleted = req.query.showDeleted;
		const filter = {};

		const showDeletedFlag = showDeleted === "true";
		if (!showDeletedFlag) filter.isDeleted = false;

		const users = await User.find(filter)
			.select("-password -__v") // Exclude password and version field
			.lean();

		res.status(200).json({
			status: "success",
			results: users.length,
			data: users,
		});
	} catch (error) {
		res.status(500).json({
			code: "USER_FETCH_FAILED",
			message: "Failed to retrieve users",
		});
	}
};

export const approveUser = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ isApproved: true },
			{ new: true, runValidators: true }
		).select("-password -__v");

		if (!user || user.isDeleted) {
			return res.status(404).json({
				code: "USER_NOT_FOUND",
				message: "User not found or deleted",
			});
		}

		res.status(200).json({
			status: "success",
			message: "User account approved",
			data: user,
		});
	} catch (error) {
		res.status(500).json({
			code: "APPROVAL_FAILED",
			message: "Failed to approve user",
		});
	}
};

export const suspendUser = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ isBanned: true },
			{ new: true }
		).select("-password -__v");

		if (!user || user.isDeleted) {
			return res.status(404).json({
				code: "USER_NOT_FOUND",
				message: "User not found or deleted",
			});
		}

		res.status(200).json({
			status: "success",
			message: "User account suspended",
			data: user,
		});
	} catch (error) {
		res.status(500).json({
			code: "SUSPENSION_FAILED",
			message: "Failed to suspend user",
		});
	}
};

export const unsuspendUser = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ isBanned: false },
			{ new: true }
		).select("-password -__v");

		if (!user || user.isDeleted) {
			return res.status(404).json({
				code: "USER_NOT_FOUND",
				message: "User not found or deleted",
			});
		}

		res.status(200).json({
			status: "success",
			message: "User account unsuspended",
			data: user,
		});
	} catch (error) {
		res.status(500).json({
			code: "UNSUSPEND_FAILED",
			message: "Failed to unsuspend user",
		});
	}
};

export const deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ isDeleted: true },
			{ new: true }
		).select("-password -__v");

		if (!user) {
			return res.status(404).json({
				code: "USER_NOT_FOUND",
				message: "User not found",
			});
		}

		res.status(200).json({
			status: "success",
			message: "User marked as deleted",
			data: user,
		});
	} catch (error) {
		res.status(500).json({
			code: "USER_DELETE_FAILED",
			message: "Failed to delete user",
		});
	}
};

// Post Management
export const adminDeletePost = async (req, res) => {
	try {
		const post = await Post.findByIdAndUpdate(
			req.params.id,
			{ isDeleted: true },
			{ new: true }
		).select("-__v -comments.__v");

		if (!post) {
			return res.status(404).json({
				code: "POST_NOT_FOUND",
				message: "Post not found",
			});
		}

		res.status(200).json({
			status: "success",
			message: "Post deleted by admin",
			data: post,
		});
	} catch (error) {
		res.status(500).json({
			code: "ADMIN_DELETE_FAILED",
			message: "Failed to delete post",
		});
	}
};

export const adminRestorePost = async (req, res) => {
	try {
		const post = await Post.findByIdAndUpdate(
			req.params.id,
			{ isDeleted: false },
			{ new: true }
		).select("-__v -comments.__v");

		if (!post) {
			return res.status(404).json({
				code: "POST_NOT_FOUND",
				message: "Post not found",
			});
		}

		res.status(200).json({
			status: "success",
			message: "Post restored by admin",
			data: post,
		});
	} catch (error) {
		res.status(500).json({
			code: "RESTORE_FAILED",
			message: "Failed to restore post",
		});
	}
};

// Comment Management
export const adminDeleteComment = async (req, res) => {
	try {
		const { postId, commentId } = req.params;

		const post = await Post.findOneAndUpdate(
			{
				_id: postId,
				"comments._id": commentId,
			},
			{
				$set: { "comments.$.isDeleted": true },
			},
			{ new: true }
		).select("-__v -comments.__v");

		if (!post) {
			return res.status(404).json({
				code: "COMMENT_NOT_FOUND",
				message: "Comment not found",
			});
		}

		res.status(200).json({
			status: "success",
			message: "Comment deleted by admin",
			data: post.comments.id(commentId),
		});
	} catch (error) {
		res.status(500).json({
			code: "COMMENT_DELETE_FAILED",
			message: "Failed to delete comment",
		});
	}
};

export const adminRestoreComment = async (req, res) => {
	try {
		const { postId, commentId } = req.params;

		const post = await Post.findOneAndUpdate(
			{
				_id: postId,
				"comments._id": commentId,
			},
			{
				$set: { "comments.$.isDeleted": false },
			},
			{ new: true }
		).select("-__v -comments.__v");

		if (!post) {
			return res.status(404).json({
				code: "COMMENT_NOT_FOUND",
				message: "Comment not found",
			});
		}

		res.status(200).json({
			status: "success",
			message: "Comment restored by admin",
			data: post.comments.id(commentId),
		});
	} catch (error) {
		res.status(500).json({
			code: "COMMENT_RESTORE_FAILED",
			message: "Failed to restore comment",
		});
	}
};
