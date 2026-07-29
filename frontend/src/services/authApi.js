import api from "./api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const getGoogleAuthUrl = () => `${API_BASE}/auth/google`;

export const updateProfile = async (data) => {
  const response = await api.put("/auth/profile", data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put("/auth/password", data);
  return response.data;
};
