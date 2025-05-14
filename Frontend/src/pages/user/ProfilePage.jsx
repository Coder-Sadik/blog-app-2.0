// src/pages/user/ProfilePage.jsx
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import client from "../../utils/api"; // your axios instance
import Spinner from "../../components/Spinner";
import Alert from "../../components/Alert";

export default function ProfilePage() {
	const { user, updateUser, logout } = useContext(AuthContext);
	const [username, setUsername] = useState(user?.username || "");
	const [email, setEmail] = useState(user?.email || "");
	const [profileImage, setProfileImage] = useState(user?.profileImage || "");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// In case someone refreshes on this page, re-fetch latest profile
	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = await client.get("/api/users/profile");
				const data = res.data.data;
				setUsername(data.username);
				setEmail(data.email);
				setProfileImage(data.profileImage || "");
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		try {
			const res = await client.put("/api/users/profile", {
				username,
				email,
				profileImage,
			});
			const updated = res.data.data;
			updateUser(updated);
			setSuccess("Profile updated successfully!");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <Spinner />;

	return (
		<div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
			<h1 className="text-2xl font-bold mb-6 text-center dark:text-gray-100">
				My Profile
			</h1>
			{error && <Alert type="error" message={error} />}
			{success && <Alert type="success" message={success} />}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="username"
						className="block text-sm font-medium dark:text-gray-200"
					>
						Username
					</label>
					<input
						id="username"
						type="text"
						autoComplete="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
						className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>
				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium dark:text-gray-200"
					>
						Email
					</label>
					<input
						id="email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>
				<div>
					<label
						htmlFor="profileImage"
						className="block text-sm font-medium dark:text-gray-200"
					>
						Profile Image URL
					</label>
					<input
						id="profileImage"
						type="url"
						value={profileImage}
						onChange={(e) => setProfileImage(e.target.value)}
						placeholder="https://..."
						className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>
				{profileImage && (
					<div className="flex justify-center">
						<img
							src={profileImage}
							alt="Profile"
							className="h-24 w-24 object-cover rounded-full mt-2"
						/>
					</div>
				)}
				<button
					type="submit"
					disabled={loading}
					className="w-full flex justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md disabled:opacity-50"
				>
					{loading ? "Saving…" : "Save Changes"}
				</button>
			</form>

			<div className="mt-6 text-center">
				<button
					onClick={logout}
					className="text-red-600 hover:underline text-sm"
				>
					Log out
				</button>
			</div>
		</div>
	);
}
