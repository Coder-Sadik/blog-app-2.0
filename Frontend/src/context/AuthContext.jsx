// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL; // e.g. "http://localhost:5000"

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loadingAuth, setLoadingAuth] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			axios
				.get("/api/users/profile")
				.then((res) => setUser(res.data.data))
				.catch(() => {
					localStorage.removeItem("token");
				})
				.finally(() => setLoadingAuth(false));
		} else {
			setLoadingAuth(false);
		}
	}, []);

	const login = (token, userData) => {
		localStorage.setItem("token", token);
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		setUser(userData);
	};

	const logout = () => {
		localStorage.removeItem("token");
		delete axios.defaults.headers.common["Authorization"];
		setUser(null);
	};

	// new helper for profile updates
	const updateUser = (newUserData) => {
		setUser(newUserData);
	};

	if (loadingAuth) {
		return null; // or a splash screen / spinner
	}

	return (
		<AuthContext.Provider value={{ user, login, logout, updateUser }}>
			{children}
		</AuthContext.Provider>
	);
}
