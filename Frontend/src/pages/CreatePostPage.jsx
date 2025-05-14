import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import client from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";

export default function CreatePostPage() {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext); // Get user from context

	// Corrected: Using user._id directly
	const userId = user?._id;

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [image, setImage] = useState(null); // For image upload
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);

	const handleImageChange = (e) => {
		setImage(e.target.files[0]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const formData = new FormData();
			formData.append("title", title);
			formData.append("content", content);
			formData.append("image", image); // Include image file
			formData.append("author", userId); // Attach the logged-in user’s ID

			// Send the POST request to create the post
			const res = await client.post("/api/posts", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (res.data.status === "success") {
				setMessage("Post created successfully!");
				setTimeout(() => navigate("/"), 3000); // Redirect to homepage after success
			}
		} catch (err) {
			setError(err.response?.data?.message || "Failed to create post");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
				Create New Post
			</h1>

			{error && <Alert type="error" message={error} />}
			{message && <Alert type="success" message={message} />}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label
						htmlFor="title"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Title
					</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label
						htmlFor="content"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Content
					</label>
					<textarea
						id="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
						rows="6"
						className="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label
						htmlFor="image"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Image (Optional)
					</label>
					<input
						id="image"
						type="file"
						accept="image/*"
						onChange={handleImageChange}
						className="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full flex justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					{loading ? <Spinner size="sm" /> : "Create Post"}
				</button>
			</form>
		</div>
	);
}
