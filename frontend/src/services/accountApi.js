import api from "./api";

export async function deleteAccount({
  confirmation,
  password,
}) {
  const payload = {
    confirmation: String(
      confirmation || ""
    )
      .trim()
      .toUpperCase(),
  };

  if (password) {
    payload.password = password;
  }

  const response = await api.delete(
    "/auth/account",
    {
      data: payload,
      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );

  return response.data;
}