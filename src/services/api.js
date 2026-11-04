import axios from "axios";

const api = axios.create({
  baseURL: (() => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== "undefined" && window.location?.hostname) {
      const hostname = window.location.hostname;
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        return `http://${hostname}:5000`;
      }
    }
    return "http://localhost:5000";
  })(),
});

// Request interceptor: attach token automatically if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized responses consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Ignore 401 on login/register endpoints so login forms handle validation errors
    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:unauthorized"));

      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === "/login" || currentPath === "/register";
      const isProtectedPath =
        currentPath.startsWith("/admin") ||
        currentPath === "/checkout" ||
        currentPath === "/orders" ||
        currentPath === "/profile";

      if (!isAuthPage && isProtectedPath) {
        setTimeout(() => {
          if (
            window.location.pathname !== "/login" &&
            (window.location.pathname.startsWith("/admin") ||
              window.location.pathname === "/checkout" ||
              window.location.pathname === "/orders" ||
              window.location.pathname === "/profile")
          ) {
            window.location.assign("/login");
          }
        }, 300);
      }
    }

    return Promise.reject(error);
  }
);

export default api;