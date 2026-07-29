import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      const publicPaths = [
        "/login",
        "/register",
        "/verify-email",
        "/auth/callback",
      ];

      const isPublicPage =
        publicPaths.some((path) =>
          window.location.pathname.startsWith(
            path
          )
        );

      if (!isPublicPage) {
        window.location.href =
          "/login?reason=session_expired";
      }
    }

    return Promise.reject(error);
  }
);

export default api;