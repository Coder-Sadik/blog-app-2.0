import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/nodemailer.js"; // Add the sendEmail utility for email verification and password reset

const validatePassword = (password) => {
	const errors = [];
	if (password.length < 8) errors.push("at least 8 characters");
	if (!/\d/.test(password)) errors.push("at least 1 number");
	if (!/[!@#$%^&*]/.test(password)) errors.push("at least 1 symbol");

	if (errors.length > 0) {
		throw new Error(`Password requires: ${errors.join(", ")}`);
	}
};

export const register = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		validatePassword(password);

		const existingUser = await User.findOne({
			$or: [{ email }, { username }],
			isDeleted: false,
		});

		if (existingUser) {
			const field = existingUser.email === email ? "email" : "username";
			return res.status(409).json({
				code: `${field.toUpperCase()}_EXISTS`,
				message: `${field} is already registered`,
			});
		}

		const user = await User.create({
			username,
			email,
			password: await bcrypt.hash(password, 12),
			role: "user",
			isApproved: false,
			isVerified: false,
		});

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		const verificationUrl = `http://localhost:5000/api/auth/verify-email/${token}`;
		await sendEmail(
			email,
			"Email Verification",
			"Verify your email",
			`<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
		);

		res.status(201).json({
			status: "success",
			message: "User registered. Awaiting approval. Please verify your email.",
			data: { id: user._id, email: user.email, username: user.username },
		});
	} catch (error) {
		res.status(400).json({
			code: error.message.startsWith("Password")
				? "INVALID_PASSWORD"
				: "REGISTRATION_FAILED",
			message: error.message,
		});
	}
};

// Verify email via token
export const verifyEmail = async (req, res) => {
	const { token } = req.params;

	try {
		// Decode the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Mark the user as verified
		user.isVerified = true;
		await user.save();

		res.status(200).json({ message: "Email verified successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error verifying email", error });
	}
};

// Login user
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email, isDeleted: false }).select(
			"+password"
		);

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({
				code: "INVALID_CREDENTIALS",
				message: "Invalid email or password",
			});
		}

		if (user.isBanned) {
			return res.status(403).json({
				code: "ACCOUNT_BANNED",
				message: "Account suspended",
			});
		}

		if (!user.isApproved) {
			return res.status(403).json({
				code: "ACCOUNT_PENDING",
				message: "Account awaiting admin approval",
			});
		}

		if (!user.isVerified) {
			return res.status(403).json({
				code: "ACCOUNT_NOT_VERIFIED",
				message: "Please verify your email before logging in",
			});
		}

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
		);

		res.status(200).json({
			status: "success",
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
				isApproved: user.isApproved,
			},
		});
	} catch (error) {
		res.status(500).json({
			code: "AUTHENTICATION_FAILED",
			message: "Login process failed",
		});
	}
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Generate reset token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1h", // Token expires in 1 hour
		});

		// Send reset password email
		const resetUrl = `http://localhost:5000/api/auth/reset-password/${token}`;
		const htmlContent = `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`;
		await sendEmail(
			email,
			"Password Reset",
			"Reset your password",
			htmlContent
		);

		res.status(200).json({ message: "Password reset email sent" });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error sending password reset email", error });
	}
};

// Reset password using token
export const resetPassword = async (req, res) => {
	const { token, newPassword } = req.body;

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update the user's password
		user.password = await bcrypt.hash(newPassword, 12);
		await user.save();

		res.status(200).json({ message: "Password reset successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error resetting password", error });
	}
};
