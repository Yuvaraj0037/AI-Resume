const nodemailer = require(
  "nodemailer"
);

function requireEmailEnvironment() {
  const requiredVariables = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
  ];

  const missingVariables =
    requiredVariables.filter(
      (variableName) =>
        !process.env[
          variableName
        ]
    );

  if (
    missingVariables.length > 0
  ) {
    throw new Error(
      `Missing email environment variables: ${missingVariables.join(
        ", "
      )}`
    );
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;"
    );
}

function createTransporter() {
  requireEmailEnvironment();

  const port =
    Number(
      process.env.SMTP_PORT
    ) || 587;

  const secure =
    process.env.SMTP_SECURE !==
    undefined
      ? String(
          process.env.SMTP_SECURE
        ).toLowerCase() ===
        "true"
      : port === 465;

  return nodemailer.createTransport(
    {
      host:
        process.env.SMTP_HOST,

      port,
      secure,

      auth: {
        user:
          process.env.SMTP_USER,

        pass:
          process.env.SMTP_PASS,
      },

      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,

      tls: {
        minVersion: "TLSv1.2",
      },
    }
  );
}

async function verifyEmailConnection() {
  const transporter =
    createTransporter();

  await transporter.verify();

  console.log(
    "Brevo SMTP connection successful"
  );

  return true;
}

async function sendVerificationEmail({
  to,
  name,
  otp,
  expiresInMinutes = 10,
}) {
  if (!to || !otp) {
    throw new Error(
      "Verification email and OTP are required"
    );
  }

  const transporter =
    createTransporter();

  const safeName =
    escapeHtml(name || "User");

  const safeOtp =
    escapeHtml(otp);

  const info =
    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM,

      to,

      subject:
        "Verify your ResumeAI email",

      text: `
Hello ${name || "User"},

Your ResumeAI email verification code is:

${otp}

This code expires in ${expiresInMinutes} minutes.

If you did not create a ResumeAI account, ignore this email.
      `.trim(),

      html: `
        <!doctype html>

        <html lang="en">
          <head>
            <meta charset="utf-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />

            <title>
              Verify your ResumeAI email
            </title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background: #f1f5f9;
              font-family: Arial, sans-serif;
              color: #0f172a;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                padding: 32px 16px;
              "
            >
              <div
                style="
                  background: #ffffff;
                  border-radius: 20px;
                  padding: 32px;
                  box-shadow:
                    0 15px 40px
                    rgba(15, 23, 42, 0.08);
                "
              >
                <div
                  style="
                    display: inline-block;
                    padding: 12px 16px;
                    border-radius: 14px;
                    background:
                      linear-gradient(
                        135deg,
                        #4f46e5,
                        #7c3aed
                      );
                    color: #ffffff;
                    font-size: 20px;
                    font-weight: 700;
                  "
                >
                  ResumeAI
                </div>

                <h1
                  style="
                    margin: 28px 0 12px;
                    font-size: 28px;
                    line-height: 1.3;
                  "
                >
                  Verify your email
                </h1>

                <p
                  style="
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.7;
                  "
                >
                  Hello ${safeName},
                </p>

                <p
                  style="
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.7;
                  "
                >
                  Use this code to verify
                  your ResumeAI account:
                </p>

                <div
                  style="
                    margin: 24px 0;
                    padding: 20px;
                    border-radius: 16px;
                    background: #eef2ff;
                    color: #4338ca;
                    font-size: 34px;
                    font-weight: 800;
                    text-align: center;
                    letter-spacing: 10px;
                  "
                >
                  ${safeOtp}
                </div>

                <p
                  style="
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.7;
                  "
                >
                  This code expires in
                  ${expiresInMinutes} minutes.
                  If you did not create this
                  account, ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

  return {
    messageId:
      info.messageId,

    accepted:
      info.accepted,

    rejected:
      info.rejected,
  };
}

async function sendPasswordResetEmail({
  to,
  name,
  otp,
  expiresInMinutes = 10,
}) {
  if (!to || !otp) {
    throw new Error(
      "Reset email and OTP are required"
    );
  }

  const transporter =
    createTransporter();

  const safeName =
    escapeHtml(name || "User");

  const safeOtp =
    escapeHtml(otp);

  const info =
    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM,

      to,

      subject:
        "Reset your ResumeAI password",

      text: `
Hello ${name || "User"},

Your ResumeAI password reset code is:

${otp}

This code expires in ${expiresInMinutes} minutes.

If you did not request a password reset, ignore this email. Your password has not been changed.
      `.trim(),

      html: `
        <!doctype html>

        <html lang="en">
          <head>
            <meta charset="utf-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />

            <title>
              Reset your ResumeAI password
            </title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background: #f1f5f9;
              font-family: Arial, sans-serif;
              color: #0f172a;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                padding: 32px 16px;
              "
            >
              <div
                style="
                  background: #ffffff;
                  border-radius: 20px;
                  padding: 32px;
                  box-shadow:
                    0 15px 40px
                    rgba(15, 23, 42, 0.08);
                "
              >
                <div
                  style="
                    display: inline-block;
                    padding: 12px 16px;
                    border-radius: 14px;
                    background:
                      linear-gradient(
                        135deg,
                        #4f46e5,
                        #7c3aed
                      );
                    color: #ffffff;
                    font-size: 20px;
                    font-weight: 700;
                  "
                >
                  ResumeAI
                </div>

                <h1
                  style="
                    margin: 28px 0 12px;
                    font-size: 28px;
                    line-height: 1.3;
                  "
                >
                  Reset your password
                </h1>

                <p
                  style="
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.7;
                  "
                >
                  Hello ${safeName},
                </p>

                <p
                  style="
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.7;
                  "
                >
                  Use this code to reset your
                  ResumeAI password:
                </p>

                <div
                  style="
                    margin: 24px 0;
                    padding: 20px;
                    border-radius: 16px;
                    background: #eef2ff;
                    color: #4338ca;
                    font-size: 34px;
                    font-weight: 800;
                    text-align: center;
                    letter-spacing: 10px;
                  "
                >
                  ${safeOtp}
                </div>

                <p
                  style="
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.7;
                  "
                >
                  This code expires in
                  ${expiresInMinutes} minutes.
                </p>

                <p
                  style="
                    margin-top: 18px;
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.7;
                  "
                >
                  If you did not request this,
                  ignore this email. Your
                  existing password has not
                  been changed.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

  return {
    messageId:
      info.messageId,

    accepted:
      info.accepted,

    rejected:
      info.rejected,
  };
}

module.exports = {
  verifyEmailConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
};