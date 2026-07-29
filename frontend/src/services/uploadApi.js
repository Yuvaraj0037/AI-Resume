import api from "./api";

export const uploadResume = async (
  file,
  onUploadProgress
) => {

  const formData = new FormData();

  formData.append("resume", file);

  const token = localStorage.getItem("token");

  const response = await api.post(
    "/resume/upload",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }
  );

  return response.data;
};