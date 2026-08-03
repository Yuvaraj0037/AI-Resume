function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSenderDetails() {
  const configuredAddress = String(
    process.env.EMAIL_FROM_ADDRESS || ""
  )
    .trim()
    .toLowerCase();

  const configuredName = String(
    process.env.EMAIL_FROM_NAME ||
      "ResumeAI"
  ).trim();

  if (configuredAddress) {
    return {
      name:
        configuredName || "ResumeAI",
      email: configuredAddress,
    };
  }

  // Supports:
  // EMAIL_FROM=ResumeAI <email@example.com>
  const legacyFrom = String(
    process.env.EMAIL_FROM || ""
  ).trim();

  const match = legacyFrom.match(
    /^(.*?)\s*<([^<>@\s]+@[^<>@\s]+)>$/
  );

  if (match) {
    return {
      name:
        match[1].trim() ||
        "ResumeAI",

      email: match[2]
        .trim()
        .toLowerCase(),
    };
  }

  // Supports:
  // EMAIL_FROM=email@example.com
  if (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      legacyFrom
    )
  ) {
    return {
      name:
        configuredName || "ResumeAI",

      email:
        legacyFrom.toLowerCase(),
    };
  }

  throw new Error(
    "A valid EMAIL_FROM_ADDRESS or EMAIL_FROM is required"
  );
}

function validateEmail(value) {
  const email = String(value || "")
    .trim()
    .toLowerCase();

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    throw new Error(
      "A valid recipient email is required"
    );
  }

  return email;
}

function createOtpEmailTemplate({
  name,
  otp,
  expiresInMinutes,
  type,
}) {
  const safeName = escapeHtml(
    name || "User"
  );

  const safeOtp = escapeHtml(otp);

  const safeExpiry = Number(
    expiresInMinutes
  );

  const expiryMinutes =
    Number.isFinite(safeExpiry) &&
    safeExpiry > 0
      ? safeExpiry
      : 10;

  const isPasswordReset =
    type === "password-reset";

  const title = isPasswordReset
    ? "Reset Your Password"
    : "Verify Your Email";

  const description = isPasswordReset
    ? "Use the verification code below to reset your ResumeAI password."
    : "Use the verification code below to verify your ResumeAI email address.";

  const securityMessage =
    isPasswordReset
      ? "If you did not request a password reset, you can safely ignore this email."
      : "If you did not create a ResumeAI account, you can safely ignore this email.";

  return `
    <!doctype html>

    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>${title}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #0f172a;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
          color: #f8fafc;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            background-color: #0f172a;
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding: 40px 16px;
              "
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 600px;
                  overflow: hidden;
                  border: 1px solid #334155;
                  border-radius: 24px;
                  background-color: #1e293b;
                  box-shadow:
                    0 24px 60px
                    rgba(0, 0, 0, 0.35);
                "
              >
                <tr>
                  <td
                    style="
                      height: 8px;
                      background:
                        linear-gradient(
                          90deg,
                          #4f46e5,
                          #7c3aed,
                          #06b6d4
                        );
                    "
                  ></td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 36px;
                    "
                  >
                    <table
                      role="presentation"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        <td
                          style="
                            border-radius: 16px;
                            background:
                              linear-gradient(
                                135deg,
                                #4f46e5,
                                #7c3aed
                              );
                            padding:
                              13px 18px;
                            color: #ffffff;
                            font-size: 21px;
                            font-weight: 800;
                            letter-spacing:
                              -0.4px;
                          "
                        >
                          ResumeAI
                        </td>
                      </tr>
                    </table>

                    <h1
                      style="
                        margin:
                          30px 0 12px;
                        color: #f8fafc;
                        font-size: 30px;
                        line-height: 1.25;
                        letter-spacing:
                          -0.7px;
                      "
                    >
                      ${title}
                    </h1>

                    <p
                      style="
                        margin: 0;
                        color: #cbd5e1;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      Hello ${safeName},
                    </p>

                    <p
                      style="
                        margin:
                          14px 0 0;
                        color: #cbd5e1;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      ${description}
                    </p>

                    <div
                      style="
                        margin:
                          30px 0 22px;
                        border:
                          1px solid
                          rgba(
                            129,
                            140,
                            248,
                            0.4
                          );
                        border-radius: 20px;
                        background-color:
                          #312e81;
                        padding:
                          26px 18px;
                        text-align: center;
                      "
                    >
                      <p
                        style="
                          margin:
                            0 0 10px;
                          color: #c7d2fe;
                          font-size: 13px;
                          font-weight: 700;
                          letter-spacing:
                            2px;
                          text-transform:
                            uppercase;
                        "
                      >
                        Verification code
                      </p>

                      <p
                        style="
                          margin: 0;
                          color: #ffffff;
                          font-size: 42px;
                          font-weight: 900;
                          letter-spacing:
                            12px;
                          line-height: 1.2;
                        "
                      >
                        ${safeOtp}
                      </p>
                    </div>

                    <div
                      style="
                        border:
                          1px solid
                          #334155;
                        border-radius: 14px;
                        background-color:
                          #0f172a;
                        padding:
                          16px 18px;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          color: #94a3b8;
                          font-size: 14px;
                          line-height: 1.7;
                        "
                      >
                        This code expires in
                        <strong
                          style="
                            color: #c7d2fe;
                          "
                        >
                          ${expiryMinutes}
                          minutes
                        </strong>.
                        Do not share this code
                        with anyone.
                      </p>
                    </div>

                    <p
                      style="
                        margin:
                          24px 0 0;
                        color: #94a3b8;
                        font-size: 13px;
                        line-height: 1.7;
                      "
                    >
                      ${securityMessage}
                    </p>

                    <div
                      style="
                        margin-top: 30px;
                        border-top:
                          1px solid
                          #334155;
                        padding-top:
                          20px;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          color: #64748b;
                          font-size: 12px;
                          line-height: 1.6;
                        "
                      >
                        This is an automated
                        security email from
                        ResumeAI. Please do not
                        reply to this message.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin:
                    20px 0 0;
                  color: #64748b;
                  font-size: 12px;
                "
              >
                © ${new Date().getFullYear()}
                ResumeAI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function sendBrevoEmail({
  to,
  toName = "",
  subject,
  htmlContent,
  textContent = "",
}) {
  const apiKey = String(
    process.env.BREVO_API_KEY || ""
  ).trim();

  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY is not configured"
    );
  }

  const recipientEmail =
    validateEmail(to);

  const safeSubject = String(
    subject || ""
  ).trim();

  if (!safeSubject) {
    throw new Error(
      "Email subject is required"
    );
  }

  const safeHtml = String(
    htmlContent || ""
  ).trim();

  if (!safeHtml) {
    throw new Error(
      "Email HTML content is required"
    );
  }

  const sender =
    getSenderDetails();

  const recipient = {
    email: recipientEmail,
  };

  const safeRecipientName = String(
    toName || ""
  ).trim();

  if (safeRecipientName) {
    recipient.name =
      safeRecipientName;
  }

  const payload = {
    sender,
    to: [recipient],
    subject: safeSubject,
    htmlContent: safeHtml,
  };

  const safeText = String(
    textContent || ""
  ).trim();

  if (safeText) {
    payload.textContent =
      safeText;
  }

  let response;

  try {
    response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",

        headers: {
          accept:
            "application/json",

          "content-type":
            "application/json",

          "api-key": apiKey,
        },

        body:
          JSON.stringify(payload),

        signal:
          AbortSignal.timeout(
            20000
          ),
      }
    );
  } catch (error) {
    if (
      error.name ===
        "TimeoutError" ||
      error.name ===
        "AbortError"
    ) {
      const timeoutError =
        new Error(
          "Brevo API connection timed out"
        );

      timeoutError.status = 504;

      throw timeoutError;
    }

    throw error;
  }

  const responseText =
    await response.text();

  let responseData = {};

  if (responseText) {
    try {
      responseData =
        JSON.parse(responseText);
    } catch {
      responseData = {
        raw: responseText,
      };
    }
  }

  if (!response.ok) {
    console.error(
      "Brevo API request failed:",
      {
        status:
          response.status,

        message:
          responseData.message ||
          "Unknown Brevo error",
      }
    );

    const error = new Error(
      responseData.message ||
        "Unable to send email"
    );

    error.status =
      response.status;

    throw error;
  }

  return responseData;
}

async function sendVerificationEmail({
  to,
  name,
  otp,
  expiresInMinutes = 10,
}) {
  const safeOtp = String(
    otp || ""
  ).trim();

  if (!/^\d{6}$/.test(safeOtp)) {
    throw new Error(
      "Verification OTP must contain 6 digits"
    );
  }

  const html =
    createOtpEmailTemplate({
      name,
      otp: safeOtp,
      expiresInMinutes,
      type: "email-verification",
    });

  return sendBrevoEmail({
    to,
    toName: name,

    subject:
      "Verify your ResumeAI email",

    htmlContent: html,

    textContent:
      `Your ResumeAI verification code is ${safeOtp}. ` +
      `It expires in ${expiresInMinutes} minutes.`,
  });
}

async function sendPasswordResetEmail({
  to,
  name,
  otp,
  expiresInMinutes = 10,
}) {
  const safeOtp = String(
    otp || ""
  ).trim();

  if (!/^\d{6}$/.test(safeOtp)) {
    throw new Error(
      "Password reset OTP must contain 6 digits"
    );
  }

  const html =
    createOtpEmailTemplate({
      name,
      otp: safeOtp,
      expiresInMinutes,
      type: "password-reset",
    });

  return sendBrevoEmail({
    to,
    toName: name,

    subject:
      "Reset your ResumeAI password",

    htmlContent: html,

    textContent:
      `Your ResumeAI password reset code is ${safeOtp}. ` +
      `It expires in ${expiresInMinutes} minutes.`,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};