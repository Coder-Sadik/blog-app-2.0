import React, { createContext, useState, useLayoutEffect } from "react";

export const ThemeContext = createContext();

function ThemeProvider({ children }) {
	// Initialize theme from localStorage (avoid flash)
	const [theme, setTheme] = useState(() =>
		localStorage.getItem("theme") === "dark" ? "dark" : "light"
	);

	// Toggle dark class on <html> and persist choice
	useLayoutEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		localStorage.setItem("theme", theme);
	}, [theme]);

	// Switch between light and dark
	const toggleTheme = () => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export default ThemeProvider;
