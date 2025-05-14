// src/components/Navbar.jsx
import React, { useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
	const { user, logout } = useContext(AuthContext);
	const [mobileOpen, setMobileOpen] = useState(false);

	const toggleMobile = () => setMobileOpen((open) => !open);

	// shared link styles
	const linkClasses = ({ isActive }) =>
		`block px-3 py-2 rounded-md text-base font-medium ${
			isActive
				? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
				: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
		}`;

	return (
		<header className="bg-white dark:bg-gray-800 shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* logo + desktop nav */}
					<div className="flex items-center">
						<Link
							to="/"
							className="flex-shrink-0 text-2xl font-bold text-indigo-600 dark:text-indigo-300"
						>
							MERN App
						</Link>

						{/* desktop links */}
						<nav className="hidden sm:ml-6 sm:flex sm:space-x-4">
							<NavLink to="/" className={linkClasses}>
								Home
							</NavLink>
							{user && (
								<NavLink to="/profile" className={linkClasses}>
									Profile
								</NavLink>
							)}
							{user?.role === "admin" && (
								<NavLink to="/admin" className={linkClasses}>
									Admin
								</NavLink>
							)}
							{user && (
								<NavLink
									to="/create-post"
									className={({ isActive }) =>
										`px-3 py-2 rounded-md text-base font-medium ${
											isActive
												? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
												: "text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700"
										}`
									}
								>
									Create Post
								</NavLink>
							)}
						</nav>
					</div>

					{/* right side */}
					<div className="flex items-center">
						<DarkModeToggle />

						{/* desktop auth */}
						<div className="hidden sm:ml-4 sm:flex sm:items-center">
							{user ? (
								<button
									onClick={logout}
									className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
								>
									Logout
								</button>
							) : (
								<>
									<Link
										to="/login"
										className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										Login
									</Link>
									<Link
										to="/register"
										className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
									>
										Register
									</Link>
								</>
							)}
						</div>

						{/* mobile menu button */}
						<div className="sm:hidden ml-2">
							<button
								onClick={toggleMobile}
								aria-label="Toggle menu"
								className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								{mobileOpen ? <X size={20} /> : <Menu size={20} />}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* mobile menu */}
			{mobileOpen && (
				<nav className="sm:hidden bg-white dark:bg-gray-800 px-2 pt-2 pb-4 space-y-1">
					<NavLink to="/" onClick={toggleMobile} className={linkClasses}>
						Home
					</NavLink>
					{user && (
						<NavLink
							to="/profile"
							onClick={toggleMobile}
							className={linkClasses}
						>
							Profile
						</NavLink>
					)}
					{user?.role === "admin" && (
						<NavLink to="/admin" onClick={toggleMobile} className={linkClasses}>
							Admin
						</NavLink>
					)}
					{user && (
						<NavLink
							to="/create-post"
							onClick={toggleMobile}
							className={linkClasses}
						>
							Create Post
						</NavLink>
					)}

					<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
						{user ? (
							<button
								onClick={() => {
									toggleMobile();
									logout();
								}}
								className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
							>
								Logout
							</button>
						) : (
							<>
								<Link
									to="/login"
									onClick={toggleMobile}
									className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									Login
								</Link>
								<Link
									to="/register"
									onClick={toggleMobile}
									className="block mt-1 px-3 py-2 rounded-md text-base font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
								>
									Register
								</Link>
							</>
						)}
					</div>
				</nav>
			)}
		</header>
	);
}
