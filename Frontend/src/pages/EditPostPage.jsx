// src/pages/EditPostPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";

export default function EditPostPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const userId = user?._id ?? user?.id;

	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [image, setImage] = useState(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const res = await client.get(`/api/posts/${id}`);
				const fetched = res.data.data;
				// compare the string values explicitly
				if (fetched.author._id.toString() !== userId.toString()) {
					setError("You can only edit your own posts.");
				} else {
					setPost(fetched);
				}
			} catch (err) {
				setError(err.response?.data?.message || "Failed to fetch post");
			} finally {
				setLoading(false);
			}
		})();
	}, [id, userId]);

	const handleImageChange = (e) => setImage(e.target.files[0]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const formData = new FormData();
			formData.append("title", post.title);
			formData.append("content", post.content);
			if (image) formData.append("image", image);

			const res = await client.put(`/api/posts/${id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			if (res.data.status === "success") {
				// navigate immediately
				navigate(`/posts/${id}`);
			}
		} catch (err) {
			setError(err.response?.data?.message || "Failed to update post");
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <Spinner />;
	if (error) return <Alert type="error" message={error} />;

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6 dark:text-gray-100">Edit Post</h1>
			{post && (
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label htmlFor="title">Title</label>
						<input
							id="title"
							type="text"
							value={post.title}
							onChange={(e) => setPost({ ...post, title: e.target.value })}
							required
							className="mt-1 w-full p-2 border rounded"
						/>
					</div>
					<div>
						<label htmlFor="content">Content</label>
						<textarea
							id="content"
							rows={6}
							value={post.content}
							onChange={(e) => setPost({ ...post, content: e.target.value })}
							required
							className="mt-1 w-full p-2 border rounded"
						/>
					</div>
					<div>
						<label htmlFor="image">Image (Optional)</label>
						<input
							id="image"
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="mt-1 w-full"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
					>
						{loading ? "Saving…" : "Save Changes"}
					</button>
				</form>
			)}
		</div>
	);
}
