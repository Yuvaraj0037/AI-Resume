const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Resume = require("../models/Resume");
const ResumeBuilder = require("../models/ResumeBuilder");
const CoachConversation = require("../models/CoachConversation");

const {
  sendPasswordResetEmail,
} = require("../services/emailService");

const {
  sendVerificationEmail,
} = require("../services/emailService");

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

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
  const failures = [];

  if (password.length < 15) {
    failures.push(
      "at least 15 characters"
    );
  }

  if (
    Buffer.byteLength(
      password,
      "utf8"
    ) > 72
  ) {
    failures.push(
      "no more than 72 bytes"
    );
  }

  if (!/[a-z]/.test(password)) {
    failures.push(
      "one lowercase letter"
    );
  }

  if (!/[A-Z]/.test(password)) {
    failures.push(
      "one uppercase letter"
    );
  }

  if (!/\d/.test(password)) {
    failures.push("one number");
  }

  if (
    !/[^A-Za-z0-9]/.test(password)
  ) {
    failures.push(
      "one special character"
    );
  }

  return failures;
}

function createOtp() {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}

function hashOtp(otp) {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
}

function createVerificationData() {
  const otp = createOtp();

  return {
    otp,

    tokenHash: hashOtp(otp),

    expiresAt: new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES *
          60 *
          1000
    ),

    sentAt: new Date(),
  };
}

function createJwt(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

function createOtp() {
  return crypto.randomInt(
    100000,
    1000000
  ).toString();
}

function hashOtp(otp) {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

// REGISTER AND SEND OTP
exports.register = async (
  req,
  res
) => {
  let createdUser = null;

  try {
    const name = String(
      req.body.name || ""
    ).trim();

    const email = normalizeEmail(
      req.body.email
    );

    const password = String(
      req.body.password || ""
    );

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    if (
      name.length < 2 ||
      name.length > 80
    ) {
      return res.status(400).json({
        message:
          "Name must contain between 2 and 80 characters",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message:
          "Enter a valid email address",
      });
    }

    const passwordFailures =
      validatePassword(password);

    if (
      passwordFailures.length > 0
    ) {
      return res.status(400).json({
        message: `Password must contain ${passwordFailures.join(
          ", "
        )}.`,
      });
    }

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res.status(409).json({
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
        password: hashedPassword,
        authProvider: "local",
        emailVerified: false,

        emailVerificationTokenHash:
          verification.tokenHash,

        emailVerificationExpiresAt:
          verification.expiresAt,

        emailVerificationSentAt:
          verification.sentAt,
      });

    await sendVerificationEmail({
      to: createdUser.email,
      name: createdUser.name,
      otp: verification.otp,

      expiresInMinutes:
        OTP_EXPIRY_MINUTES,
    });

    return res.status(201).json({
      message:
        "Account created. Check your email for the verification code.",

      requiresEmailVerification:
        true,

      email: createdUser.email,
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    if (createdUser?._id) {
      await User.deleteOne({
        _id: createdUser._id,
        emailVerified: false,
      }).catch(
        (cleanupError) => {
          console.error(
            "Registration cleanup error:",
            cleanupError
          );
        }
      );
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "An account already exists with this email",
      });
    }

    return res.status(500).json({
      message:
        process.env.NODE_ENV ===
        "production"
          ? "Unable to create account"
          : error.message ||
            "Registration failed",
    });
  }
};

// VERIFY EMAIL OTP
exports.verifyEmail = async (
  req,
  res
) => {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    const otp = String(
      req.body.otp || ""
    ).trim();

    if (
      !email ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        message:
          "Email and a valid 6-digit verification code are required",
      });
    }

    const user =
      await User.findOne({
        email,
      }).select(
        "+emailVerificationTokenHash " +
          "+emailVerificationExpiresAt"
      );

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired verification code",
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        message:
          "Email is already verified. You can log in.",
      });
    }

    if (
      !user.emailVerificationTokenHash ||
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() <=
        Date.now()
    ) {
      return res.status(400).json({
        message:
          "Verification code expired. Request a new code.",

        code: "OTP_EXPIRED",
      });
    }

    const suppliedHash =
      Buffer.from(
        hashOtp(otp),
        "hex"
      );

    const storedHash =
      Buffer.from(
        user.emailVerificationTokenHash,
        "hex"
      );

    const matches =
      suppliedHash.length ===
        storedHash.length &&
      crypto.timingSafeEqual(
        suppliedHash,
        storedHash
      );

    if (!matches) {
      return res.status(400).json({
        message:
          "Invalid verification code",

        code: "INVALID_OTP",
      });
    }

    user.emailVerified = true;

    user.emailVerificationTokenHash =
      undefined;

    user.emailVerificationExpiresAt =
      undefined;

    user.emailVerificationSentAt =
      undefined;

    await user.save();

    return res.status(200).json({
      message:
        "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error(
      "Verify email error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to verify email",
    });
  }
};

// RESEND VERIFICATION OTP
exports.resendVerificationEmail =
  async (req, res) => {
    try {
      const email =
        normalizeEmail(
          req.body.email
        );

      if (
        !email ||
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
          "+emailVerificationTokenHash " +
            "+emailVerificationExpiresAt " +
            "+emailVerificationSentAt"
        );

      if (!user) {
        return res
          .status(200)
          .json({
            message:
              "If an unverified account exists, a new code has been sent.",
          });
      }

      if (user.emailVerified) {
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
          (Date.now() - sentAt) /
            1000
        );

      if (
        secondsSinceLastSend <
        RESEND_COOLDOWN_SECONDS
      ) {
        return res
          .status(429)
          .json({
            message: `Wait ${
              RESEND_COOLDOWN_SECONDS -
              secondsSinceLastSend
            } seconds before requesting another code.`,
          });
      }

      const verification =
        createVerificationData();

      user.emailVerificationTokenHash =
        verification.tokenHash;

      user.emailVerificationExpiresAt =
        verification.expiresAt;

      user.emailVerificationSentAt =
        verification.sentAt;

      await user.save();

      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        otp: verification.otp,

        expiresInMinutes:
          OTP_EXPIRY_MINUTES,
      });

      return res
        .status(200)
        .json({
          message:
            "A new verification code has been sent.",
        });
    } catch (error) {
      console.error(
        "Resend verification email error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to resend verification code",
        });
    }
  };

// LOGIN
exports.login = async (
  req,
  res
) => {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    const password = String(
      req.body.password || ""
    );

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (
      !user ||
      !user.password
    ) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    if (
      user.authProvider !==
        "google" &&
      !user.emailVerified
    ) {
      return res.status(403).json({
        message:
          "Please verify your email before signing in",

        code:
          "EMAIL_NOT_VERIFIED",

        email: user.email,
      });
    }

    const token =
      createJwt(user);

    return res.status(200).json({
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,

        emailVerified:
          Boolean(
            user.emailVerified
          ),
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

// GET CURRENT USER
exports.getMe = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select(
        "-password -emailVerificationTokenHash"
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const resumes =
      await Resume.find({
        user: req.user.id,
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
                  resume.analysis
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
                  resume.analysis
                    ?.atsScore
                ) || 0),
              0
            ) /
              totalResumes
          )
        : 0;

    const recentResumes =
      resumes.slice(0, 5);

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

          time: resume.createdAt
            ? new Date(
                resume.createdAt
              ).toLocaleDateString()
            : "Recently",

          type: "analysis",
        })
      );

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,

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
      error
    );

    return res.status(500).json({
      message:
        "Unable to load profile",
    });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (
  req,
  res
) => {
  try {
    const name = String(
      req.body.name || ""
    ).trim();

    if (!name) {
      return res.status(400).json({
        message:
          "Name is required",
      });
    }

    if (
      name.length < 2 ||
      name.length > 80
    ) {
      return res.status(400).json({
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
          runValidators: true,
        }
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      message:
        "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,

        emailVerified:
          Boolean(
            user.emailVerified
          ),
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update profile",
    });
  }
};

// GET SETTINGS
exports.getPreferences = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select("preferences");

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    return res.status(200).json({
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
      error
    );

    return res.status(500).json({
      message:
        "Failed to load preferences",
    });
  }
};

// UPDATE SETTINGS
exports.updatePreferences =
  async (req, res) => {
    try {
      const {
        theme,
        sleepMode,
        doNotDisturb,
        analysisTips,
        saveAnalysisLocally,
      } = req.body;

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
            $set: updates,
          },
          {
            new: true,
            runValidators: true,
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
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to save preferences",
        });
    }
  };

  // DELETE CURRENT USER ACCOUNT
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const confirmation = String(
      req.body?.confirmation || ""
    )
      .trim()
      .toUpperCase();

    if (confirmation !== "DELETE") {
      return res.status(400).json({
        message:
          'Enter "DELETE" to confirm account deletion',
      });
    }

    const user = await User.findById(userId).select(
      "+password authProvider"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Local accounts must verify their password.
    if (user.authProvider === "local") {
      const password = String(
        req.body?.password || ""
      );

      if (!password) {
        return res.status(400).json({
          message:
            "Password is required to delete this account",
        });
      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatches) {
        return res.status(401).json({
          message: "Incorrect password",
        });
      }
    }

    // Delete all data owned by this user.
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

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message:
        "Account and associated data deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete account error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to delete account",
    });
  }
};

exports.forgotPassword = async (
  req,
  res
) => {
  const genericResponse = {
    message:
      "If an eligible account exists, a password reset code has been sent.",
  };

  try {
    const email = String(
      req.body?.email || ""
    )
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        message:
          "Email is required",
      });
    }

    const user =
      await User.findOne({
        email,
      }).select(
        "+passwordResetOtpHash +passwordResetOtpExpires +passwordResetAttempts"
      );

    // Do not reveal whether the email exists.
    if (
      !user ||
      user.authProvider !== "local"
    ) {
      return res
        .status(200)
        .json(genericResponse);
    }

    const otp =
      createOtp();

    user.passwordResetOtpHash =
      hashOtp(otp);

    user.passwordResetOtpExpires =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );

    user.passwordResetAttempts = 0;

    await user.save({
      validateBeforeSave: false,
    });

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        otp,
        expiresInMinutes: 10,
      });
    } catch (emailError) {
      user.passwordResetOtpHash =
        undefined;

      user.passwordResetOtpExpires =
        undefined;

      user.passwordResetAttempts = 0;

      await user.save({
        validateBeforeSave: false,
      });

      console.error(
        "Password reset email failed:",
        emailError.message
      );
    }

    return res
      .status(200)
      .json(genericResponse);
  } catch (error) {
    console.error(
      "Forgot password error:",
      error.message
    );

    return res
      .status(200)
      .json(genericResponse);
  }
};

exports.resetPassword = async (
  req,
  res
) => {
  try {
    const email = String(
      req.body?.email || ""
    )
      .trim()
      .toLowerCase();

    const otp = String(
      req.body?.otp || ""
    ).trim();

    const newPassword = String(
      req.body?.newPassword || ""
    );

    if (
      !email ||
      !otp ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Email, verification code and new password are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message:
          "Verification code must contain 6 digits",
      });
    }

    if (
      !isStrongPassword(
        newPassword
      )
    ) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, including uppercase, lowercase, number and special character",
      });
    }

    const user =
      await User.findOne({
        email,
        authProvider: "local",
      }).select(
        "+password +passwordResetOtpHash +passwordResetOtpExpires +passwordResetAttempts"
      );

    if (
      !user ||
      !user.passwordResetOtpHash ||
      !user.passwordResetOtpExpires
    ) {
      return res.status(400).json({
        message:
          "Invalid or expired verification code",
      });
    }

    if (
      user.passwordResetAttempts >= 5
    ) {
      user.passwordResetOtpHash =
        undefined;

      user.passwordResetOtpExpires =
        undefined;

      user.passwordResetAttempts = 0;

      await user.save({
        validateBeforeSave: false,
      });

      return res.status(429).json({
        message:
          "Too many incorrect attempts. Request a new code.",
      });
    }

    if (
      user.passwordResetOtpExpires.getTime() <
      Date.now()
    ) {
      user.passwordResetOtpHash =
        undefined;

      user.passwordResetOtpExpires =
        undefined;

      user.passwordResetAttempts = 0;

      await user.save({
        validateBeforeSave: false,
      });

      return res.status(400).json({
        message:
          "Verification code expired. Request a new code.",
      });
    }

    const providedOtpHash =
      hashOtp(otp);

    const providedBuffer =
      Buffer.from(
        providedOtpHash,
        "hex"
      );

    const storedBuffer =
      Buffer.from(
        user.passwordResetOtpHash,
        "hex"
      );

    const otpMatches =
      providedBuffer.length ===
        storedBuffer.length &&
      crypto.timingSafeEqual(
        providedBuffer,
        storedBuffer
      );

    if (!otpMatches) {
      user.passwordResetAttempts += 1;

      await user.save({
        validateBeforeSave: false,
      });

      const attemptsRemaining =
        Math.max(
          0,
          5 -
            user.passwordResetAttempts
        );

      return res.status(400).json({
        message:
          attemptsRemaining > 0
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

    user.passwordResetAttempts = 0;

    await user.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      message:
        "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to reset password",
    });
  }
};