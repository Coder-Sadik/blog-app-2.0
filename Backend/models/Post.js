import mongoose from "mongoose";

// Post Schema
const postSchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			required: true,
			maxlength: 100,
		},
		content: {
			type: String,
			required: true,
		},
		image: {
			type: String, // Store image URL (from Cloudinary)
			required: false, // Optional: Make it required if you want every post to have an image
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				text: {
					type: String,
					required: true,
					maxlength: 300,
				},
				isDeleted: {
					type: Boolean,
					default: false, // Mark comment as deleted
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		views: {
			type: Number,
			default: 0,
		},
		isDeleted: {
			type: Boolean,
			default: false, // Soft delete flag for posts
		},
	},
	{
		timestamps: true, // Automatically add createdAt and updatedAt fields
		toJSON: {
			virtuals: true,
			versionKey: false,
			transform: function (doc, ret) {
				delete ret._id;
				delete ret.isDeleted;

				// Remove deleted comments from the response
				if (ret.comments) {
					ret.comments = ret.comments.filter((comment) => !comment.isDeleted);
				}
			},
		},
	}
);

// Create a Mongoose model for Post
export default mongoose.model("Post", postSchema);
