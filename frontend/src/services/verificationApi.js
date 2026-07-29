import api from "./api";

export const verifyEmailOtp = async ({
  email,
  otp,
}) => {
  const response = await api.post(
    "/auth/verify-email",
    {
      email: String(email || "")
        .trim()
        .toLowerCase(),

      otp: String(otp || "").trim(),
    }
  );

  return response.data;
};

export const resendVerificationOtp =
  async (email) => {
    const response = await api.post(
      "/auth/resend-verification",
      {
        email: String(email || "")
          .trim()
          .toLowerCase(),
      }
    );

    return response.data;
  };