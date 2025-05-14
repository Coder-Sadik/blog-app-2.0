// src/pages/auth/ResetPasswordPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../../utils/api"; // your shared axios instance
import Alert from "../../components/Alert";
import Spinner from "../../components/Spinner";

export default function ResetPasswordPage() {
	const { token } = useParams();
	const navigate = useNavigate();

	const [newPassword, setNewPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState(null);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setStatus(null);
		try {
			const res = await client.post("/api/auth/reset-password", {
				token,
				newPassword,
			});
			setStatus("success");
			setMessage(
				res.data.message || "Password reset successful! Redirecting to login…"
			);
			setTimeout(() => navigate("/login"), 3000);
		} catch (err) {
			setStatus("error");
			setMessage(
				err.response?.data?.message ||
					err.message ||
					"Reset failed. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
			<h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
				Set New Password
			</h1>

			{status && <Alert type={status} message={message} className="mb-4" />}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="new-password"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						New Password
					</label>
					<input
						id="new-password"
						name="newPassword"
						type="password"
						autoComplete="new-password"
						required
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"
					/>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="w-full flex justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					{loading ? <Spinner size="sm" /> : "Reset Password"}
				</button>
			</form>
		</div>
	);
}
