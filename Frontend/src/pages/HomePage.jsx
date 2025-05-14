import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import client from "../utils/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

export default function HomePage() {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				setLoading(true);
				const res = await client.get("/api/posts");
				// backend: { status, data: postsArray }
				setPosts(res.data.data);
			} catch (err) {
				setError(err.response?.data?.message || err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchPosts();
	}, []);

	if (loading) return <Spinner />;
	if (error) return <Alert message={error} type="error" />;

	return (
		<div className="max-w-7xl mx-auto p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{posts.map((post) => (
				<Link
					key={post._id}
					to={`/posts/${post._id}`}
					className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
				>
					{post.image && (
						<img
							src={post.image}
							alt={post.title}
							className="h-48 w-full object-cover rounded-t-lg"
						/>
					)}
					<div className="p-4">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
							{post.title}
						</h2>
						<p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
							{post.content}
						</p>
						<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
							<span>By {post.author.username}</span>
							<span>{new Date(post.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}
