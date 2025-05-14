// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

// ——————————————————————————————————————————————
// Security Headers
// ——————————————————————————————————————————————
app.use(helmet());

// ——————————————————————————————————————————————
// CORS Configuration
// ——————————————————————————————————————————————
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

// CORS Error Handling Middleware
app.use((err, req, res, next) => {
	if (err.message.includes("CORS policy")) {
		return res.status(403).json({
			code: "CORS_ERROR",
			message: err.message,
		});
	}
	next(err);
});

// ——————————————————————————————————————————————
// Rate Limiting
// ——————————————————————————————————————————————
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per window
	message: "Too many requests, please try again later",
});
app.use(limiter);

// ——————————————————————————————————————————————
// JSON Body Parser
// ——————————————————————————————————————————————
app.use(express.json({ limit: "10mb" }));

// ——————————————————————————————————————————————
// Routes
// ——————————————————————————————————————————————
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// ——————————————————————————————————————————————
// Error Handlers
// ——————————————————————————————————————————————
app.use(notFound);
app.use(errorHandler);

// ——————————————————————————————————————————————
// Database & Server Startup
// ——————————————————————————————————————————————
async function connectDB() {
	if (!process.env.MONGO_URI) {
		console.error("MONGO_URI is not defined in .env");
		process.exit(1);
	}

	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB connected successfully");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	}
}

async function startServer() {
	await connectDB();

	const PORT = process.env.PORT || 5000;
	const server = app.listen(PORT, () => {
		console.log(
			`Server running in ${
				process.env.NODE_ENV || "development"
			} mode on port ${PORT}`
		);
	});

	// Graceful shutdown
	process.on("SIGINT", async () => {
		await mongoose.connection.close();
		console.log("MongoDB connection closed");

		server.close(() => {
			console.log("Server shut down gracefully");
			process.exit(0);
		});
	});

	process.on("SIGTERM", async () => {
		await mongoose.connection.close();
		console.log("MongoDB connection closed");

		server.close(() => {
			console.log("Server shut down gracefully");
			process.exit(0);
		});
	});
}

startServer();
