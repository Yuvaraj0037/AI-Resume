import api from "./api";

export async function getComparisonResumes() {
  const response = await api.get("/resume/history");

  return response.data;
}

export async function compareResumes(
  baselineId,
  currentId
) {
  if (!baselineId || !currentId) {
    throw new Error("Select two resumes");
  }

  if (baselineId === currentId) {
    throw new Error(
      "Select two different resumes"
    );
  }

  const response = await api.get("/resume/compare", {
    params: {
      baselineId,
      currentId,
    },
  });

  return response.data;
}