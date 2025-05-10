import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

// CORS configuration
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: "Too many requests, please try again later",
});
app.use(limiter);

// Middleware
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
	try {
		const mongoURI = process.env.MONGO_URI;
		if (!mongoURI) {
			throw new Error("MongoDB URI is not defined in .env file");
		}

		await mongoose.connect(mongoURI);
		console.log("MongoDB connected");
	} catch (error) {
		console.error("DB connection failed:", error.message);
		process.exit(1);
	}
};

// Server startup sequence
const startServer = async () => {
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
};

startServer();
