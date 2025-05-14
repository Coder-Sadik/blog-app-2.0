// src/pages/auth/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../utils/api"; // your shared axios instance
import Alert from "../../components/Alert";
import Spinner from "../../components/Spinner";

export default function RegisterPage() {
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setMessage(null);
		setLoading(true);

		try {
			// Use axios client instead of fetch
			const res = await client.post("/api/auth/register", {
				username,
				email,
				password,
			});

			// The backend returns { status, message, data: {...} }
			setMessage(
				res.data.message ||
					"Registration successful! Please check your email to verify your account. Redirecting to login…"
			);

			// After a short delay, navigate to login
			setTimeout(() => {
				navigate("/login");
			}, 3000);
		} catch (err) {
			// Extract and display error message
			const msg =
				err.response?.data?.message ||
				err.message ||
				"Registration failed. Please try again.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
			<h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
				Register
			</h1>

			{error && <Alert type="error" message={error} className="mb-4" />}
			{message && <Alert type="success" message={message} className="mb-4" />}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="username"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Username
					</label>
					<input
						id="username"
						name="username"
						type="text"
						autoComplete="username"
						required
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="new-password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full flex justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
				>
					{loading ? <Spinner size="sm" /> : "Register"}
				</button>
			</form>
		</div>
	);
}
