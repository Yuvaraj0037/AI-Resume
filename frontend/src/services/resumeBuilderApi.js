import api from "./api";

function getAuthConfig() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Authentication token is missing"
    );
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// Create an empty or manually entered resume
export async function createBuilderResume(
  resumeData = {}
) {
  const response = await api.post(
    "/resume-builder",
    resumeData,
    getAuthConfig()
  );

  return response.data;
}

// Get all builder resumes belonging to user
export async function getBuilderResumes() {
  const response = await api.get(
    "/resume-builder",
    getAuthConfig()
  );

  return response.data;
}

// Get one complete builder resume
export async function getBuilderResumeById(
  resumeId
) {
  if (!resumeId) {
    throw new Error(
      "Builder resume ID is required"
    );
  }

  const response = await api.get(
    `/resume-builder/${resumeId}`,
    getAuthConfig()
  );

  return response.data;
}

// Save complete resume data
export async function updateBuilderResume(
  resumeId,
  resumeData
) {
  if (!resumeId) {
    throw new Error(
      "Builder resume ID is required"
    );
  }

  const response = await api.put(
    `/resume-builder/${resumeId}`,
    resumeData,
    getAuthConfig()
  );

  return response.data;
}

// Delete a builder resume
export async function deleteBuilderResume(
  resumeId
) {
  if (!resumeId) {
    throw new Error(
      "Builder resume ID is required"
    );
  }

  const response = await api.delete(
    `/resume-builder/${resumeId}`,
    getAuthConfig()
  );

  return response.data;
}

// Duplicate an existing builder resume
export async function duplicateBuilderResume(
  resumeId
) {
  if (!resumeId) {
    throw new Error(
      "Builder resume ID is required"
    );
  }

  const response = await api.post(
    `/resume-builder/${resumeId}/duplicate`,
    {},
    getAuthConfig()
  );

  return response.data;
}

// Import a previously analyzed PDF resume
export async function importAnalyzedResume(
  analysisResumeId
) {
  if (!analysisResumeId) {
    throw new Error(
      "Analyzed resume ID is required"
    );
  }

  const response = await api.post(
    `/resume-builder/import/${analysisResumeId}`,
    {},
    getAuthConfig()
  );

  return response.data;
}

// Ask Gemini to rewrite one resume section
export async function rewriteResumeSection(
  resumeId,
  {
    section,
    content,
    targetJobDescription = "",
  }
) {
  if (!resumeId) {
    throw new Error(
      "Builder resume ID is required"
    );
  }

  if (!section || !content?.trim()) {
    throw new Error(
      "Section and content are required"
    );
  }

  const response = await api.post(
    `/resume-builder/${resumeId}/ai-rewrite`,
    {
      section,
      content: content.trim(),
      targetJobDescription:
        targetJobDescription.trim(),
    },
    getAuthConfig()
  );

  return response.data;
}