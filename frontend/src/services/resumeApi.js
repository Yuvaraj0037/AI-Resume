import api from "./api";

export const getLatestResume = async () => {
  const response = await api.get("/resume/latest");
  return response.data;
};

export const matchJobDescription = async (jobDescription) => {
  const response = await api.post("/resume/job-match", { jobDescription });
  return response.data;
};

export const improveResume = async () => {
  const response = await api.post("/resume/improve");
  return response.data;
};

export const deleteResume = async (id) => {
  const response = await api.delete(`/resume/${id}`);
  return response.data;
};