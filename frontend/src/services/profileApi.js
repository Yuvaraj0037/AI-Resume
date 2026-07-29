import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};