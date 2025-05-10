import User from "../models/User.js";

const validateEmail = (email) => {
	const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	if (!regex.test(email)) throw new Error("Invalid email format");
};

const validateUsername = (username) => {
	if (username.length < 3 || username.length > 30) {
		throw new Error("Username must be between 3-30 characters");
	}
};

export const getUserProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select(
			"-password -__v -createdAt -updatedAt"
		);

		res.status(200).json({
			status: "success",
			data: user,
		});
	} catch (error) {
		res.status(500).json({
			code: "PROFILE_FETCH_FAILED",
			message: "Failed to retrieve user profile",
		});
	}
};

export const updateUserProfile = async (req, res) => {
	try {
		const { username, email, profileImage } = req.body;

		// Validation
		if (username) validateUsername(username);
		if (email) validateEmail(email);

		const existingUser = await User.findOne({
			$and: [{ _id: { $ne: req.user.id } }, { $or: [{ username }, { email }] }],
		});

		if (existingUser) {
			const field = existingUser.username === username ? "username" : "email";
			return res.status(409).json({
				code: `${field.toUpperCase()}_EXISTS`,
				message: `${field} is already taken`,
			});
		}

		const user = await User.findByIdAndUpdate(
			req.user.id,
			{ username, email, profileImage },
			{ new: true, runValidators: true }
		).select("-password -__v");

		res.status(200).json({
			status: "success",
			data: user,
		});
	} catch (error) {
		const code = error.message.startsWith("Invalid")
			? "VALIDATION_ERROR"
			: "PROFILE_UPDATE_FAILED";

		res.status(400).json({
			code,
			message: error.message,
		});
	}
};
