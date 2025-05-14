import React, { useState, useContext } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import client from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";

export default function LoginPage() {
	const navigate = useNavigate();
	const { user, login } = useContext(AuthContext);

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showError, setShowError] = useState(false);

	if (user) {
		return <Navigate to="/" replace />;
	}

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setShowError(false);
		setLoading(true);

		try {
			const res = await client.post("/api/auth/login", formData, {
				skipAuthRedirect: true, // Add this if your interceptor supports it
			});

			const { token, user: userData } = res.data;
			login(token, userData);
			navigate("/", { replace: true });
		} catch (err) {
			console.error("Login error:", err);
			setError(err.response?.data?.message || "Invalid email or password");
			setShowError(true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
			<h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
				Login
			</h2>

			{showError && error && (
				<div
					role="alert"
					className="mb-4 px-4 py-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 rounded transition-opacity duration-300"
				>
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-5">
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
						value={formData.email}
						onChange={handleChange}
						className="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
						autoComplete="current-password"
						required
						value={formData.password}
						onChange={handleChange}
						className="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex justify-center items-center"
				>
					{loading ? <Spinner size="sm" className="text-white" /> : "Login"}
				</button>
			</form>

			<div className="mt-4 text-center">
				<Link
					to="/request-password-reset"
					className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
				>
					Forgot your password?
				</Link>
			</div>
			<div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
				Don't have an account?{" "}
				<Link
					to="/register"
					className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
				>
					Register
				</Link>
			</div>
		</div>
	);
}
