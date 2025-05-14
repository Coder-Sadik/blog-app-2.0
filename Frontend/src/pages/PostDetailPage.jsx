import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import { Sun, Moon, Eye } from "lucide-react";

export default function PostDetailPage() {
	const { id } = useParams();
	const { user } = useContext(AuthContext);
	const userId = user?._id ?? user?.id;

	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [commentText, setCommentText] = useState("");
	const [commentLoading, setCommentLoading] = useState(false);
	const [commentError, setCommentError] = useState(null);

	// 1) Initial load: fetch post and increment views once
	useEffect(() => {
		const fetchPost = async () => {
			try {
				setLoading(true);
				const res = await client.get(`/api/posts/${id}`);
				setPost(res.data.data);
			} catch (err) {
				setError(err.response?.data?.message || err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchPost();
	}, [id]);

	// 2) Toggle like in-place
	const handleLike = async () => {
		if (!user) return;
		try {
			const res = await client.post(`/api/posts/${id}/like`);
			setPost((prev) => ({
				...prev,
				likes: res.data.data.likes,
			}));
		} catch (err) {
			console.error(err);
		}
	};

	// 3) Add new comment
	const handleCommentSubmit = async (e) => {
		e.preventDefault();
		if (!commentText.trim()) return;

		try {
			setCommentLoading(true);
			const res = await client.post(`/api/posts/${id}/comment`, {
				text: commentText,
			});
			setPost((p) => ({
				...p,
				comments: [...p.comments, res.data.comment],
			}));
			setCommentText("");
		} catch (err) {
			setCommentError(err.response?.data?.message || err.message);
		} finally {
			setCommentLoading(false);
		}
	};

	// 4) Delete own comment
	const handleDeleteComment = async (commentId) => {
		try {
			await client.delete(`/api/posts/${id}/comment/${commentId}`);
			setPost((p) => ({
				...p,
				comments: p.comments.filter((c) => c._id !== commentId),
			}));
		} catch (err) {
			console.error(err);
		}
	};

	// ——— Guard against null/post not yet loaded ———
	if (loading) return <Spinner />;
	if (error) return <Alert message={error} type="error" />;
	if (!post) return null; // or another Spinner/Alert if you prefer

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			{/* — Post Header — */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
					{post.title}
				</h1>
				<div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
					<span>By {post.author.username}</span>
					<span>•</span>
					<span>{new Date(post.createdAt).toLocaleDateString()}</span>
					<span className="flex items-center space-x-1">
						<Eye className="w-4 h-4" />
						<span>{post.views}</span>
					</span>
				</div>
			</div>

			{/* — Image — */}
			{post.image && (
				<div className="mb-6">
					<img
						src={post.image}
						alt={post.title}
						className="w-full rounded-lg object-cover"
					/>
				</div>
			)}

			{/* — Content — */}
			<div className="prose prose-invert dark:prose-dark max-w-none mb-6">
				<p className="text-gray-800 dark:text-gray-200">{post.content}</p>
			</div>

			{/* — Like/Unlike — */}
			<div className="flex items-center mb-8 space-x-2">
				<button
					onClick={handleLike}
					disabled={!user}
					className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
				>
					{post.likes.includes(userId) ? (
						<Sun className="w-5 h-5" />
					) : (
						<Moon className="w-5 h-5" />
					)}
					<span>{post.likes.length}</span>
				</button>
				{!user && (
					<span className="text-sm text-gray-500 dark:text-gray-400">
						(Log in to like)
					</span>
				)}
			</div>

			{/* — Edit Post Button (Only visible to the author of the post) — */}
			{userId === post.author._id && (
				<Link
					to={`/posts/edit/${id}`}
					className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
				>
					Edit Post
				</Link>
			)}

			{/* — Comments List — */}
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
					Comments ({post.comments.length})
				</h2>
				{post.comments.map((c) => (
					<div
						key={c._id}
						className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
					>
						<div className="flex justify-between mb-2">
							<span className="font-medium text-gray-800 dark:text-gray-200">
								{c.user.username}
							</span>
							<span className="text-xs text-gray-500 dark:text-gray-400">
								{new Date(c.createdAt).toLocaleString()}
							</span>
						</div>
						<p className="text-gray-700 dark:text-gray-300 mb-2">{c.text}</p>
						{userId === c.user._id && (
							<button
								onClick={() => handleDeleteComment(c._id)}
								className="text-red-600 hover:underline text-sm"
							>
								Delete
							</button>
						)}
					</div>
				))}
			</div>

			{/* — Add Comment — */}
			{user ? (
				<form onSubmit={handleCommentSubmit} className="space-y-2">
					{commentError && <Alert message={commentError} type="error" />}
					<textarea
						className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 dark:text-white rounded-md focus:outline-none"
						rows={3}
						placeholder="Add a comment..."
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						required
					/>
					<button
						type="submit"
						disabled={commentLoading}
						className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md"
					>
						{commentLoading ? "Posting..." : "Post Comment"}
					</button>
				</form>
			) : (
				<p className="text-gray-600 dark:text-gray-400">
					Please{" "}
					<Link to="/login" className="text-indigo-500">
						login
					</Link>{" "}
					to comment.
				</p>
			)}
		</div>
	);
}
