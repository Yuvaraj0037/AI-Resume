import api from "./api";

export async function getPreferences() {
  const response = await api.get(
    "/auth/preferences"
  );

  return response.data.preferences;
}

export async function savePreferences(
  preferences
) {
  const response = await api.put(
    "/auth/preferences",
    preferences
  );

  return response.data;
}