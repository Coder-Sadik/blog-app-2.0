import mongoose from "mongoose";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
const urlRegex = /^(http|https):\/\/[^ "]+$/; // Basic URL validation

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			trim: true,
			minlength: [3, "Username must be at least 3 characters"],
			maxlength: [30, "Username cannot exceed 30 characters"],
			match: [
				usernameRegex,
				"Username can only contain letters, numbers, and underscores",
			],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [emailRegex, "Invalid email format"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [8, "Password must be at least 8 characters"],
			validate: {
				validator: (v) => /^(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(v),
				message: "Password must contain at least 1 number and 1 symbol",
			},
		},
		profileImage: {
			type: String,
			default: "",
			validate: {
				validator: (v) => v === "" || urlRegex.test(v),
				message: "Invalid image URL format",
			},
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		isApproved: {
			type: Boolean,
			default: false,
		},
		isVerified: {
			type: Boolean,
			default: false, // Tracks whether the user has verified their email
		},
		isBanned: {
			type: Boolean,
			default: false,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => {
				delete ret.password;
				delete ret.__v;
				delete ret.isDeleted;
			},
		},
	}
);

// Indexes
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
