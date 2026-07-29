const mongoose = require(
  "mongoose"
);

const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 160,
      },

      password: {
        type: String,

        required() {
          return (
            this.authProvider ===
            "local"
          );
        },

        default: undefined,

        // Password must be explicitly
        // selected during login/reset.
        select: false,
      },

      authProvider: {
        type: String,

        enum: [
          "local",
          "google",
        ],

        default: "local",
      },

      googleId: {
        type: String,
        trim: true,
        default: undefined,
      },

      // Google already verifies ownership
      // of the returned email address.
      emailVerified: {
        type: Boolean,

        default() {
          return (
            this.authProvider ===
            "google"
          );
        },
      },

      // Email verification OTP hash.
      // Never store the original OTP.
      emailVerificationTokenHash: {
        type: String,
        default: undefined,
        select: false,
      },

      emailVerificationExpiresAt: {
        type: Date,
        default: undefined,
        select: false,
      },

      emailVerificationSentAt: {
        type: Date,
        default: undefined,
        select: false,
      },

      // Password reset OTP hash.
      passwordResetOtpHash: {
        type: String,
        default: undefined,
        select: false,
      },

      // Password reset OTP expiry.
      passwordResetOtpExpires: {
        type: Date,
        default: undefined,
        select: false,
      },

      // Failed reset OTP attempts.
      passwordResetAttempts: {
        type: Number,
        default: 0,
        min: 0,
        select: false,
      },

      // Useful when adding token
      // invalidation later.
      passwordChangedAt: {
        type: Date,
        default: undefined,
      },

      preferences: {
        theme: {
          type: String,

          enum: [
            "light",
            "dark",
          ],

          default: "light",
        },

        sleepMode: {
          type: Boolean,
          default: false,
        },

        doNotDisturb: {
          type: Boolean,
          default: false,
        },

        analysisTips: {
          type: Boolean,
          default: true,
        },

        saveAnalysisLocally: {
          type: Boolean,
          default: true,
        },
      },
    },
    {
      timestamps: true,
    }
  );

// Email/password users do not have a
// Google ID. The partial index applies
// only when googleId is a string.
userSchema.index(
  {
    googleId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      googleId: {
        $type: "string",
      },
    },
  }
);

// Normalize email again before validation.
// This protects against inconsistent API input.
userSchema.pre(
  "validate",
  function normalizeEmail(next) {
    if (this.email) {
      this.email = String(
        this.email
      )
        .trim()
        .toLowerCase();
    }

    next();
  }
);

// Remove sensitive fields whenever a user
// document is converted into JSON.
userSchema.set(
  "toJSON",
  {
    transform(
      document,
      returnedObject
    ) {
      delete returnedObject.password;

      delete returnedObject
        .emailVerificationTokenHash;

      delete returnedObject
        .emailVerificationExpiresAt;

      delete returnedObject
        .emailVerificationSentAt;

      delete returnedObject
        .passwordResetOtpHash;

      delete returnedObject
        .passwordResetOtpExpires;

      delete returnedObject
        .passwordResetAttempts;

      return returnedObject;
    },
  }
);

module.exports =
  mongoose.model(
    "User",
    userSchema
  );