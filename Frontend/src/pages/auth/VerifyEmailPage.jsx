import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import Spinner from "../../components/Spinner";

export default function VerifyEmailPage() {
	const { token } = useParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
	const [message, setMessage] = useState("");

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				const response = await fetch(`/api/auth/verify-email/${token}`);
				const data = await response.json();
				if (!response.ok)
					throw new Error(data.message || "Verification failed");
				setStatus("success");
				setMessage(
					data.message || "Email verified successfully! Redirecting to login..."
				);
				setTimeout(() => navigate("/login"), 3000);
			} catch (err) {
				setStatus("error");
				setMessage(err.message);
			}
		};
		verifyEmail();
	}, [token, navigate]);

	return (
		<div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
			{status === "loading" && <Spinner />}
			{(status === "success" || status === "error") && (
				<Alert
					type={status === "success" ? "success" : "error"}
					message={message}
				/>
			)}
		</div>
	);
}
