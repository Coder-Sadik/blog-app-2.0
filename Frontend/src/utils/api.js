import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
	baseURL: API_BASE,
	headers: {
		"Content-Type": "application/json",
	},
});

// Initialize token from localStorage
const token = localStorage.getItem("token");
if (token) {
	client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Response interceptor with login request check
client.interceptors.response.use(
	(response) => response,
	(error) => {
		const isLoginRequest = error.config?.url?.includes("/auth/login");

		if (error.response?.status === 401 && !isLoginRequest) {
			localStorage.removeItem("token");
			window.location.href = "/login";
		}

		return Promise.reject(error);
	}
);

export default client;
