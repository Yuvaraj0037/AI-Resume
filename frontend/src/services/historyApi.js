import api from "./api";

export const getResumeHistory = async () => {
  const response = await api.get("/resume/history");
  return response.data;
};