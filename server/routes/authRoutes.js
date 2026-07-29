const express = require("express");

const auth = require(
  "../middleware/authMiddleware"
);

const {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  getMe,
  updateProfile,
  getPreferences,
  updatePreferences,
  deleteAccount,
  forgotPassword,
resetPassword,
} = require("../controllers/authController");

const {
  passport,
  issueJWTHandler,
} = require("./googleAuth");

// Create router before using router.get/post/put
const router = express.Router();

// Email and password authentication
router.post("/register", register);

router.post(
  "/verify-email",
  verifyEmail
);

router.post(
  "/resend-verification",
  resendVerificationEmail
);

router.post("/login", login);

// Google authentication
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,

    failureRedirect: `${
      process.env.CLIENT_URL ||
      "http://localhost:5173"
    }/login?error=google_auth_failed`,
  }),
  issueJWTHandler
);

// Protected user routes
router.get(
  "/me",
  auth,
  getMe
);

router.put(
  "/profile",
  auth,
  updateProfile
);

router.get(
  "/preferences",
  auth,
  getPreferences
);

router.put(
  "/preferences",
  auth,
  updatePreferences
);

router.delete(
  "/account",
  auth,
  deleteAccount
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

module.exports = router;