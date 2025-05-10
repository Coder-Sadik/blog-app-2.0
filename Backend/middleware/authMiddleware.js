import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect middleware for validating JWT
export const protect = async (req, res, next) => {
	let token;

	try {
		if (!req.headers.authorization?.startsWith("Bearer")) {
			return res.status(401).json({
				code: "MISSING_TOKEN",
				message: "Authentication token required",
			});
		}

		token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findById(decoded.id).select("-password -__v");
		if (!user) {
			return res.status(401).json({
				code: "INVALID_TOKEN",
				message: "User account no longer exists",
			});
		}

		if (user.isBanned) {
			return res.status(403).json({
				code: "ACCOUNT_BANNED",
				message: "This account has been suspended",
			});
		}

		if (!user.isApproved) {
			return res.status(403).json({
				code: "ACCOUNT_PENDING",
				message: "Account awaiting admin approval",
			});
		}

		req.user = user;
		next();
	} catch (error) {
		const errorMap = {
			TokenExpiredError: {
				code: "TOKEN_EXPIRED",
				message: "Session expired. Please log in again",
			},
			JsonWebTokenError: {
				code: "INVALID_TOKEN",
				message: "Invalid authentication token",
			},
		};

		const errorInfo = errorMap[error.name] || {
			code: "AUTH_FAILED",
			message: "Authentication failed",
		};

		res.status(401).json(errorInfo);
	}
};

// Check if the user is not banned
export const checkNotBanned = (req, res, next) => {
	if (req.user?.isBanned) {
		return res.status(403).json({
			code: "ACCOUNT_BANNED",
			message: "Your account has been suspended",
		});
	}
	next();
};

// Admin check middleware
export const admin = (req, res, next) => {
	if (req.user?.role === "admin" && !req.user.isDeleted) {
		return next();
	}
	res.status(403).json({
		code: "ADMIN_REQUIRED",
		message: "Admin privileges required",
	});
};
