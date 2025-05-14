import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import RequestResetPage from "./pages/auth/RequestResetPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProfilePage from "./pages/user/ProfilePage";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import ThemeProvider from "./context/ThemeContext";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<ThemeProvider>
					<Navbar />
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="posts/:id" element={<PostDetailPage />} />
						<Route path="create-post" element={<CreatePostPage />} />{" "}
						<Route path="posts/edit/:id" element={<EditPostPage />} />{" "}
						{/* auth routes */}
						<Route path="login" element={<LoginPage />} />
						<Route path="register" element={<RegisterPage />} />
						<Route path="verify-email/:token" element={<VerifyEmailPage />} />
						<Route path="profile" element={<ProfilePage />} />
						<Route
							path="request-password-reset"
							element={<RequestResetPage />}
						/>
						<Route path="reset-password" element={<ResetPasswordPage />} />
						{/* protected/profile/admin routes… */}
					</Routes>
				</ThemeProvider>
			</AuthProvider>
		</BrowserRouter>
	);
}
