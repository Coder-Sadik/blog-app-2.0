import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function DarkModeToggle() {
	const { theme, toggleTheme } = useContext(ThemeContext);
	return (
		<button
			onClick={toggleTheme}
			aria-label="Toggle Dark Mode"
			className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
		>
			{theme === "dark" ? (
				<Sun className="w-6 h-6 text-yellow-400" />
			) : (
				<Moon className="w-6 h-6 text-gray-800" />
			)}
		</button>
	);
}
