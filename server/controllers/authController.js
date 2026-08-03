const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Resume = require("../models/Resume");
const ResumeBuilder = require(
  "../models/ResumeBuilder"
);
const CoachConversation = require(
  "../models/CoachConversation"
);

const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESET_ATTEMPTS = 5;

/* -------------------------------------------------------------------------- */
/*                                HELPERS                                     */
/* -------------------------------------------------------------------------- */

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function validatePassword(password) {
  const value = String(
    password || ""
  );

  const failures = [];

  if (value.length < 15) {
    failures.push(
      "at least 15 characters"
    );
  }

  if (
    Buffer.byteLength(
      value,
      "utf8"
    ) > 72
  ) {
    failures.push(
      "no more than 72 bytes"
    );
  }

  if (!/[a-z]/.test(value)) {
    failures.push(
      "one lowercase letter"
    );
  }

  if (!/[A-Z]/.test(value)) {
    failures.push(
      "one uppercase letter"
    );
  }

  if (!/[0-9]/.test(value)) {
    failures.push("one number");
  }

  if (
    !/[^A-Za-z0-9]/.test(
      value
    )
  ) {
    failures.push(
      "one special character"
    );
  }

  return {
    valid:
      failures.length === 0,

    failures,

    message:
      failures.length > 0
        ? `Password must contain ${failures.join(
            ", "
          )}.`
        : "",
  };
}

function createOtp() {
  return crypto
    .randomInt(
      100000,
      1000000
    )
    .toString();
}

function hashOtp(otp) {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
}

function otpMatches(
  plainOtp,
  storedHash
) {
  if (
    !plainOtp ||
    !storedHash
  ) {
    return false;
  }

  try {
    const suppliedBuffer =
      Buffer.from(
        hashOtp(plainOtp),
        "hex"
      );

    const storedBuffer =
      Buffer.from(
        storedHash,
        "hex"
      );

    return (
      suppliedBuffer.length ===
        storedBuffer.length &&
      crypto.timingSafeEqual(
        suppliedBuffer,
        storedBuffer
      )
    );
  } catch {
    return false;
  }
}

function createVerificationData() {
  const otp = createOtp();

  return {
    otp,

    tokenHash:
      hashOtp(otp),

    expiresAt:
      new Date(
        Date.now() +
          OTP_EXPIRY_MINUTES *
            60 *
            1000
      ),

    sentAt: new Date(),
  };
}

function createJwt(user) {
  if (
    !process.env.JWT_SECRET
  ) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  return jwt.sign(
    {
      id: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

function safeErrorDetails(error) {
  return {
    message:
      error?.message ||
      "Unknown error",

    code:
      error?.code,

    status:
      error?.status ||
      error?.statusCode,
  };
}

/* -------------------------------------------------------------------------- */
/*                                REGISTER                                    */
/* -------------------------------------------------------------------------- */

exports.register = async (
  req,
  res
) => {
  let createdUser = null;

  try {
    const name = String(
      req.body?.name || ""
    ).trim();

    const email =
      normalizeEmail(
        req.body?.email
      );

    const password =
      String(
        req.body?.password ||
          ""
      );

    if (
      !name ||
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message:
            "Name, email and password are required",
        });
    }

    if (
      name.length < 2 ||
      name.length > 80
    ) {
      return res
        .status(400)
        .json({
          message:
            "Name must contain between 2 and 80 characters",
        });
    }

    if (
      !isValidEmail(email)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Enter a valid email address",
        });
    }

    const passwordValidation =
      validatePassword(
        password
      );

    if (
      !passwordValidation.valid
    ) {
      return res
        .status(400)
        .json({
          message:
            passwordValidation.message,
        });
    }

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res
        .status(409)
        .json({
          message:
            "An account already exists with this email",
        });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const verification =
      createVerificationData();

    createdUser =
      await User.create({
        name,
        email,

        password:
          hashedPassword,

        authProvider:
          "local",

        emailVerified:
          false,

        emailVerificationTokenHash:
          verification.tokenHash,

        emailVerificationExpiresAt:
          verification.expiresAt,

        emailVerificationSentAt:
          verification.sentAt,
      });

    try {
      await sendVerificationEmail({
        to:
          createdUser.email,

        name:
          createdUser.name,

        otp:
          verification.otp,

        expiresInMinutes:
          OTP_EXPIRY_MINUTES,
      });
    } catch (emailError) {
      await User.deleteOne({
        _id:
          createdUser._id,

        emailVerified:
          false,
      });

      console.error(
        "Registration email failed:",
        safeErrorDetails(
          emailError
        )
      );

      return res
        .status(502)
        .json({
          message:
            "Unable to send verification email. Please try again later.",

          code:
            "EMAIL_DELIVERY_FAILED",
        });
    }

    return res
      .status(201)
      .json({
        message:
          "Account created. Check your email for the verification code.",

        requiresEmailVerification:
          true,

        email:
          createdUser.email,
      });
  } catch (error) {
    console.error(
      "Register error:",
      safeErrorDetails(error)
    );

    if (
      createdUser?._id
    ) {
      await User.deleteOne({
        _id:
          createdUser._id,

        emailVerified:
          false,
      }).catch(
        (cleanupError) => {
          console.error(
            "Registration cleanup error:",
            safeErrorDetails(
              cleanupError
            )
          );
        }
      );
    }

    if (
      error?.code === 11000
    ) {
      return res
        .status(409)
        .json({
          message:
            "An account already exists with this email",
        });
    }

    return res
      .status(500)
      .json({
        message:
          process.env
            .NODE_ENV ===
          "production"
            ? "Unable to create account"
            : error?.message ||
              "Registration failed",
      });
  }
};

/* -------------------------------------------------------------------------- */
/*                           VERIFY EMAIL OTP                                 */
/* -------------------------------------------------------------------------- */

exports.verifyEmail = async (
  req,
  res
) => {
  try {
    const email =
      normalizeEmail(
        req.body?.email
      );

    const otp = String(
      req.body?.otp || ""
    ).trim();

    if (
      !isValidEmail(email) ||
      !/^\d{6}$/.test(otp)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Email and a valid 6-digit verification code are required",
        });
    }

    const user =
      await User.findOne({
        email,
      }).select(
        [
          "name",
          "email",
          "emailVerified",
          "authProvider",
          "+emailVerificationTokenHash",
          "+emailVerificationExpiresAt",
          "+emailVerificationSentAt",
        ].join(" ")
      );

    if (!user) {
      return res
        .status(400)
        .json({
          message:
            "Invalid or expired verification code",
        });
    }

    if (
      user.emailVerified
    ) {
      return res
        .status(200)
        .json({
          message:
            "Email is already verified. You can log in.",
        });
    }

    if (
      !user
        .emailVerificationTokenHash ||
      !user
        .emailVerificationExpiresAt
    ) {
      return res
        .status(400)
        .json({
          message:
            "Verification code expired. Request a new code.",

          code:
            "OTP_EXPIRED",
        });
    }

    if (
      new Date(
        user.emailVerificationExpiresAt
      ).getTime() <=
      Date.now()
    ) {
      user.emailVerificationTokenHash =
        undefined;

      user.emailVerificationExpiresAt =
        undefined;

      user.emailVerificationSentAt =
        undefined;

      await user.save({
        validateBeforeSave:
          false,
      });

      return res
        .status(400)
        .json({
          message:
            "Verification code expired. Request a new code.",

          code:
            "OTP_EXPIRED",
        });
    }

    const matches =
      otpMatches(
        otp,
        user.emailVerificationTokenHash
      );

    if (!matches) {
      return res
        .status(400)
        .json({
          message:
            "Invalid verification code",

          code:
            "INVALID_OTP",
        });
    }

    user.emailVerified =
      true;

    user.emailVerificationTokenHash =
      undefined;

    user.emailVerificationExpiresAt =
      undefined;

    user.emailVerificationSentAt =
      undefined;

    // Password is select:false, so normal save
    // validation may incorrectly fail for local users.
    await user.save({
      validateBeforeSave: false,
    });

    return res
      .status(200)
      .json({
        message:
          "Email verified successfully. You can now log in.",
      });
  } catch (error) {
    console.error(
      "Verify email error:",
      safeErrorDetails(error)
    );

    return res
      .status(500)
      .json({
        message:
          "Unable to verify email",
      });
  }
};

/* -------------------------------------------------------------------------- */
/*                        RESEND VERIFICATION OTP                              */
/* -------------------------------------------------------------------------- */

exports.resendVerificationEmail =
  async (req, res) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email
        );

      if (
        !isValidEmail(email)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Enter a valid email address",
          });
      }

      const user =
        await User.findOne({
          email,
        }).select(
          [
            "name",
            "email",
            "emailVerified",
            "authProvider",
            "+emailVerificationTokenHash",
            "+emailVerificationExpiresAt",
            "+emailVerificationSentAt",
          ].join(" ")
        );

      if (!user) {
        return res
          .status(200)
          .json({
            message:
              "If an unverified account exists, a new code has been sent.",
          });
      }

      if (
        user.authProvider !==
        "local"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Google accounts do not require email verification",
          });
      }

      if (
        user.emailVerified
      ) {
        return res
          .status(400)
          .json({
            message:
              "Email is already verified",
          });
      }

      const sentAt =
        user.emailVerificationSentAt
          ? new Date(
              user.emailVerificationSentAt
            ).getTime()
          : 0;

      const secondsSinceLastSend =
        Math.floor(
          (Date.now() -
            sentAt) /
            1000
        );

      if (
        secondsSinceLastSend <
        RESEND_COOLDOWN_SECONDS
      ) {
        const waitSeconds =
          RESEND_COOLDOWN_SECONDS -
          secondsSinceLastSend;

        return res
          .status(429)
          .json({
            message: `Wait ${waitSeconds} seconds before requesting another code.`,

            retryAfter:
              waitSeconds,
          });
      }

      const oldHash =
        user.emailVerificationTokenHash;

      const oldExpires =
        user.emailVerificationExpiresAt;

      const oldSentAt =
        user.emailVerificationSentAt;

      const verification =
        createVerificationData();

      user.emailVerificationTokenHash =
        verification.tokenHash;

      user.emailVerificationExpiresAt =
        verification.expiresAt;

      user.emailVerificationSentAt =
        verification.sentAt;

      await user.save({
        validateBeforeSave:
          false,
      });

      try {
        await sendVerificationEmail({
          to:
            user.email,

          name:
            user.name,

          otp:
            verification.otp,

          expiresInMinutes:
            OTP_EXPIRY_MINUTES,
        });
      } catch (emailError) {
        user.emailVerificationTokenHash =
          oldHash;

        user.emailVerificationExpiresAt =
          oldExpires;

        user.emailVerificationSentAt =
          oldSentAt;

        await user.save({
          validateBeforeSave:
            false,
        });

        console.error(
          "Resend verification email failed:",
          safeErrorDetails(
            emailError
          )
        );

        return res
          .status(502)
          .json({
            message:
              "Unable to send verification email. Please try again later.",

            code:
              "EMAIL_DELIVERY_FAILED",
          });
      }

      return res
        .status(200)
        .json({
          message:
            "A new verification code has been sent.",

          email:
            user.email,

          expiresInMinutes:
            OTP_EXPIRY_MINUTES,
        });
    } catch (error) {
      console.error(
        "Resend verification error:",
        safeErrorDetails(
          error
        )
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to resend verification code",
        });
    }
  };

/* -------------------------------------------------------------------------- */
/*                                  LOGIN                                     */
/* -------------------------------------------------------------------------- */

exports.login = async (
  req,
  res
) => {
  try {
    const email =
      normalizeEmail(
        req.body?.email
      );

    const password =
      String(
        req.body?.password ||
          ""
      );

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message:
            "Email and password are required",
        });
    }

    if (
      !isValidEmail(email)
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email or password",
        });
    }

    const user =
      await User.findOne({
        email,
      }).select(
        "+password"
      );

    if (
      !user ||
      !user.password
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email or password",
        });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (
      !passwordMatches
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email or password",
        });
    }

    if (
      user.authProvider !==
        "google" &&
      !user.emailVerified
    ) {
      return res
        .status(403)
        .json({
          message:
            "Please verify your email before signing in",

          code:
            "EMAIL_NOT_VERIFIED",

          email:
            user.email,
        });
    }

    const token =
      createJwt(user);

    return res
      .status(200)
      .json({
        message:
          "Login successful",

        token,

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          emailVerified:
            Boolean(
              user.emailVerified
            ),

          authProvider:
            user.authProvider ||
            "local",
        },
      });
  } catch (error) {
    console.error(
      "Login error:",
      safeErrorDetails(error)
    );

    return res
      .status(500)
      .json({
        message:
          "Login failed",
      });
  }
};

/* -------------------------------------------------------------------------- */
/*                            GET CURRENT USER                                */
/* -------------------------------------------------------------------------- */

exports.getMe = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select(
        [
          "-password",
          "-emailVerificationTokenHash",
          "-passwordResetOtpHash",
        ].join(" ")
      );

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    const resumes =
      await Resume.find({
        user:
          req.user.id,
      })
        .select(
          "filename analysis createdAt"
        )
        .sort({
          createdAt: -1,
        });

    const totalResumes =
      resumes.length;

    const highestATS =
      totalResumes > 0
        ? Math.max(
            ...resumes.map(
              (resume) =>
                Number(
                  resume
                    .analysis
                    ?.atsScore
                ) || 0
            )
          )
        : 0;

    const averageATS =
      totalResumes > 0
        ? Math.round(
            resumes.reduce(
              (
                total,
                resume
              ) =>
                total +
                (Number(
                  resume
                    .analysis
                    ?.atsScore
                ) || 0),
              0
            ) /
              totalResumes
          )
        : 0;

    const recentResumes =
      resumes.slice(
        0,
        5
      );

    const activities =
      recentResumes.map(
        (resume) => ({
          title:
            "Resume Analyzed",

          description: `${
            resume.filename
          } scored ${
            resume.analysis
              ?.atsScore || 0
          }% ATS.`,

          time:
            resume.createdAt
              ? new Date(
                  resume.createdAt
                ).toLocaleDateString()
              : "Recently",

          type:
            "analysis",
        })
      );

    return res
      .status(200)
      .json({
        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        emailVerified:
          Boolean(
            user.emailVerified
          ),

        authProvider:
          user.authProvider ||
          "local",

        createdAt:
          user.createdAt,

        totalResumes,
        highestATS,
        averageATS,
        recentResumes,
        activities,
      });
  } catch (error) {
    console.error(
      "Get profile error:",
      safeErrorDetails(error)
    );

    return res
      .status(500)
      .json({
        message:
          "Unable to load profile",
      });
  }
};

/* -------------------------------------------------------------------------- */
/*                             UPDATE PROFILE                                 */
/* -------------------------------------------------------------------------- */

exports.updateProfile = async (
  req,
  res
) => {
  try {
    const name = String(
      req.body?.name || ""
    ).trim();

    if (!name) {
      return res
        .status(400)
        .json({
          message:
            "Name is required",
        });
    }

    if (
      name.length < 2 ||
      name.length > 80
    ) {
      return res
        .status(400)
        .json({
          message:
            "Name must contain between 2 and 80 characters",
        });
    }

    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            name,
          },
        },
        {
          new: true,
          runValidators:
            true,
        }
      ).select(
        "-password"
      );

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    return res
      .status(200)
      .json({
        message:
          "Profile updated successfully",

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          emailVerified:
            Boolean(
              user.emailVerified
            ),

          authProvider:
            user.authProvider ||
            "local",
        },
      });
  } catch (error) {
    console.error(
      "Update profile error:",
      safeErrorDetails(error)
    );

    return res
      .status(500)
      .json({
        message:
          "Failed to update profile",
      });
  }
};

/* -------------------------------------------------------------------------- */
/*                            GET PREFERENCES                                 */
/* -------------------------------------------------------------------------- */

exports.getPreferences =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select(
          "preferences"
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      return res
        .status(200)
        .json({
          preferences: {
            theme:
              user.preferences
                ?.theme ||
              "light",

            sleepMode:
              user.preferences
                ?.sleepMode ??
              false,

            doNotDisturb:
              user.preferences
                ?.doNotDisturb ??
              false,

            analysisTips:
              user.preferences
                ?.analysisTips ??
              true,

            saveAnalysisLocally:
              user.preferences
                ?.saveAnalysisLocally ??
              true,
          },
        });
    } catch (error) {
      console.error(
        "Get preferences error:",
        safeErrorDetails(
          error
        )
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to load preferences",
        });
    }
  };

/* -------------------------------------------------------------------------- */
/*                           UPDATE PREFERENCES                               */
/* -------------------------------------------------------------------------- */

exports.updatePreferences =
  async (req, res) => {
    try {
      const {
        theme,
        sleepMode,
        doNotDisturb,
        analysisTips,
        saveAnalysisLocally,
      } = req.body || {};

      const updates = {};

      if (
        theme !== undefined
      ) {
        if (
          ![
            "light",
            "dark",
          ].includes(theme)
        ) {
          return res
            .status(400)
            .json({
              message:
                "Theme must be light or dark",
            });
        }

        updates[
          "preferences.theme"
        ] = theme;
      }

      const booleanFields = {
        sleepMode,
        doNotDisturb,
        analysisTips,
        saveAnalysisLocally,
      };

      for (
        const [
          field,
          value,
        ] of Object.entries(
          booleanFields
        )
      ) {
        if (
          value !== undefined
        ) {
          if (
            typeof value !==
            "boolean"
          ) {
            return res
              .status(400)
              .json({
                message: `${field} must be a boolean`,
              });
          }

          updates[
            `preferences.${field}`
          ] = value;
        }
      }

      if (
        Object.keys(updates)
          .length === 0
      ) {
        return res
          .status(400)
          .json({
            message:
              "No valid preference fields provided",
          });
      }

      const user =
        await User.findByIdAndUpdate(
          req.user.id,
          {
            $set:
              updates,
          },
          {
            new: true,
            runValidators:
              true,
          }
        ).select(
          "preferences"
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      return res
        .status(200)
        .json({
          message:
            "Preferences saved successfully",

          preferences:
            user.preferences,
        });
    } catch (error) {
      console.error(
        "Update preferences error:",
        safeErrorDetails(
          error
        )
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to save preferences",
        });
    }
  };

/* -------------------------------------------------------------------------- */
/*                             DELETE ACCOUNT                                 */
/* -------------------------------------------------------------------------- */

exports.deleteAccount = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({
          message:
            "Unauthorized",
        });
    }

    const confirmation =
      String(
        req.body
          ?.confirmation || ""
      )
        .trim()
        .toUpperCase();

    if (
      confirmation !==
      "DELETE"
    ) {
      return res
        .status(400)
        .json({
          message:
            'Enter "DELETE" to confirm account deletion',
        });
    }

    const user =
      await User.findById(
        userId
      ).select(
        "+password authProvider"
      );

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    if (
      user.authProvider ===
      "local"
    ) {
      const password =
        String(
          req.body
            ?.password || ""
        );

      if (!password) {
        return res
          .status(400)
          .json({
            message:
              "Password is required to delete this account",
          });
      }

      const matches =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!matches) {
        return res
          .status(401)
          .json({
            message:
              "Incorrect password",
          });
      }
    }

    await Promise.all([
      Resume.deleteMany({
        user: userId,
      }),

      ResumeBuilder.deleteMany({
        user: userId,
      }),

      CoachConversation.deleteMany({
        user: userId,
      }),
    ]);

    await User.findByIdAndDelete(
      userId
    );

    return res
      .status(200)
      .json({
        message:
          "Account and associated data deleted successfully",
      });
  } catch (error) {
    console.error(
      "Delete account error:",
      safeErrorDetails(error)
    );

    return res
      .status(500)
      .json({
        message:
          "Unable to delete account",
      });
  }
};

/* -------------------------------------------------------------------------- */
/*                     FORGOT PASSWORD — SEND OTP                             */
/* -------------------------------------------------------------------------- */

exports.forgotPassword =
  async (req, res) => {
    const genericResponse = {
      message:
        "If an eligible account exists, a password reset code has been sent.",
    };

    try {
      const email =
        normalizeEmail(
          req.body?.email
        );

      if (!email) {
        return res
          .status(400)
          .json({
            message:
              "Email is required",
          });
      }

      if (
        !isValidEmail(email)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Enter a valid email address",
          });
      }

      const user =
        await User.findOne({
          email,
        }).select(
          [
            "name",
            "email",
            "authProvider",
            "emailVerified",
            "+passwordResetOtpHash",
            "+passwordResetOtpExpires",
            "+passwordResetAttempts",
          ].join(" ")
        );

      // Prevent account enumeration.
      if (!user) {
        return res
          .status(200)
          .json(
            genericResponse
          );
      }

      // Google-only accounts have no local password.
      if (
        user.authProvider !==
        "local"
      ) {
        return res
          .status(200)
          .json(
            genericResponse
          );
      }

      if (
        !user.emailVerified
      ) {
        return res
          .status(403)
          .json({
            message:
              "Verify your email before resetting your password",

            code:
              "EMAIL_NOT_VERIFIED",

            email:
              user.email,
          });
      }

      const otp =
        createOtp();

      user.passwordResetOtpHash =
        hashOtp(otp);

      user.passwordResetOtpExpires =
        new Date(
          Date.now() +
            OTP_EXPIRY_MINUTES *
              60 *
              1000
        );

      user.passwordResetAttempts =
        0;

      await user.save({
        validateBeforeSave:
          false,
      });

      try {
        await sendPasswordResetEmail({
          to:
            user.email,

          name:
            user.name,

          otp,

          expiresInMinutes:
            OTP_EXPIRY_MINUTES,
        });
      } catch (emailError) {
        user.passwordResetOtpHash =
          undefined;

        user.passwordResetOtpExpires =
          undefined;

        user.passwordResetAttempts =
          0;

        await user.save({
          validateBeforeSave:
            false,
        });

        console.error(
          "Password reset email failed:",
          safeErrorDetails(
            emailError
          )
        );

        return res
          .status(502)
          .json({
            message:
              "Unable to send password reset email. Please try again later.",

            code:
              "EMAIL_DELIVERY_FAILED",
          });
      }

      return res
        .status(200)
        .json({
          message:
            "Password reset code sent successfully. Check your email.",

          email:
            user.email,

          expiresInMinutes:
            OTP_EXPIRY_MINUTES,
        });
    } catch (error) {
      console.error(
        "Forgot password error:",
        safeErrorDetails(
          error
        )
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to process the password reset request",

          code:
            "PASSWORD_RESET_REQUEST_FAILED",
        });
    }
  };

/* -------------------------------------------------------------------------- */
/*                         RESET PASSWORD                                     */
/* -------------------------------------------------------------------------- */

exports.resetPassword = async (
  req,
  res
) => {
  try {
    const email =
      normalizeEmail(
        req.body?.email
      );

    const otp = String(
      req.body?.otp || ""
    ).trim();

    const newPassword =
      String(
        req.body
          ?.newPassword || ""
      );

    if (
      !email ||
      !otp ||
      !newPassword
    ) {
      return res
        .status(400)
        .json({
          message:
            "Email, verification code and new password are required",
        });
    }

    if (
      !isValidEmail(email)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Enter a valid email address",
        });
    }

    if (
      !/^\d{6}$/.test(otp)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Verification code must contain 6 digits",
        });
    }

    const passwordValidation =
      validatePassword(
        newPassword
      );

    if (
      !passwordValidation.valid
    ) {
      return res
        .status(400)
        .json({
          message:
            passwordValidation.message,
        });
    }

    const user =
      await User.findOne({
        email,
        authProvider:
          "local",
      }).select(
        [
          "+password",
          "+passwordResetOtpHash",
          "+passwordResetOtpExpires",
          "+passwordResetAttempts",
        ].join(" ")
      );

    if (
      !user ||
      !user
        .passwordResetOtpHash ||
      !user
        .passwordResetOtpExpires
    ) {
      return res
        .status(400)
        .json({
          message:
            "Invalid or expired verification code",
        });
    }

    if (
      Number(
        user.passwordResetAttempts ||
          0
      ) >=
      MAX_RESET_ATTEMPTS
    ) {
      user.passwordResetOtpHash =
        undefined;

      user.passwordResetOtpExpires =
        undefined;

      user.passwordResetAttempts =
        0;

      await user.save({
        validateBeforeSave:
          false,
      });

      return res
        .status(429)
        .json({
          message:
            "Too many incorrect attempts. Request a new code.",
        });
    }

    if (
      new Date(
        user.passwordResetOtpExpires
      ).getTime() <=
      Date.now()
    ) {
      user.passwordResetOtpHash =
        undefined;

      user.passwordResetOtpExpires =
        undefined;

      user.passwordResetAttempts =
        0;

      await user.save({
        validateBeforeSave:
          false,
      });

      return res
        .status(400)
        .json({
          message:
            "Verification code expired. Request a new code.",
        });
    }

    const matches =
      otpMatches(
        otp,
        user.passwordResetOtpHash
      );

    if (!matches) {
      user.passwordResetAttempts =
        Number(
          user.passwordResetAttempts ||
            0
        ) + 1;

      const attemptsRemaining =
        Math.max(
          0,
          MAX_RESET_ATTEMPTS -
            user.passwordResetAttempts
        );

      if (
        attemptsRemaining ===
        0
      ) {
        user.passwordResetOtpHash =
          undefined;

        user.passwordResetOtpExpires =
          undefined;

        user.passwordResetAttempts =
          0;
      }

      await user.save({
        validateBeforeSave:
          false,
      });

      return res
        .status(
          attemptsRemaining ===
            0
            ? 429
            : 400
        )
        .json({
          message:
            attemptsRemaining >
            0
              ? `Invalid verification code. ${attemptsRemaining} attempts remaining.`
              : "Too many incorrect attempts. Request a new code.",
        });
    }

    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );

    user.passwordChangedAt =
      new Date();

    user.passwordResetOtpHash =
      undefined;

    user.passwordResetOtpExpires =
      undefined;

    user.passwordResetAttempts =
      0;

    await user.save({
      validateBeforeSave:
        false,
    });

    return res
      .status(200)
      .json({
        message:
          "Password reset successfully. You can now log in.",
      });
  } catch (error) {
    console.error(
      "Reset password error:",
      safeErrorDetails(error)
    );

    return res
      .status(500)
      .json({
        message:
          "Unable to reset password",
      });
  }
};