import api from "./api";

export async function requestPasswordReset(
  email
) {
  const response = await api.post(
    "/auth/forgot-password",
    {
      email: String(
        email || ""
      )
        .trim()
        .toLowerCase(),
    }
  );

  return response.data;
}

export async function resetPassword({
  email,
  otp,
  newPassword,
}) {
  const response = await api.post(
    "/auth/reset-password",
    {
      email: String(
        email || ""
      )
        .trim()
        .toLowerCase(),

      otp: String(
        otp || ""
      ).trim(),

      newPassword,
    }
  );

  return response.data;
}