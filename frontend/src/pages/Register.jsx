import { useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Circle,
  AlertCircle,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import LoginIllustration from "../component/LoginIllustration";
import {
  register,
  getGoogleAuthUrl,
} from "../services/authApi";

const PASSWORD_RULES = [
  {
    id: "length",
    text: "At least 15 characters",
    validate: (password) =>
      password.length >= 15,
  },
  {
    id: "uppercase",
    text: "One uppercase letter",
    validate: (password) =>
      /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    text: "One lowercase letter",
    validate: (password) =>
      /[a-z]/.test(password),
  },
  {
    id: "number",
    text: "One number",
    validate: (password) =>
      /\d/.test(password),
  },
  {
    id: "special",
    text: "One special character",
    validate: (password) =>
      /[^A-Za-z0-9]/.test(password),
  },
];

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [agreeTerms, setAgreeTerms] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const passwordChecks = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({
        ...rule,
        passed:
          rule.validate(password),
      })),
    [password]
  );

  const passedRules =
    passwordChecks.filter(
      (rule) => rule.passed
    ).length;

  const isStrongPassword =
    passwordChecks.every(
      (rule) => rule.passed
    ) && password.length <= 72;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const getStrength = () => {
    if (!password) {
      return {
        label: "Not entered",
        color: "bg-gray-600",
        text: "text-gray-300",
      };
    }

    if (passedRules <= 1) {
      return {
        label: "Weak",
        color: "bg-red-500",
        text: "text-red-400",
      };
    }

    if (passedRules <= 3) {
      return {
        label: "Fair",
        color: "bg-yellow-500",
        text: "text-yellow-400",
      };
    }

    if (passedRules === 4) {
      return {
        label: "Good",
        color: "bg-blue-500",
        text: "text-blue-400",
      };
    }

    return {
      label: "Strong",
      color: "bg-green-500",
      text: "text-green-400",
    };
  };

  const strength = getStrength();

  const showError = (message) => {
    setError(message);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const validateForm = () => {
    const cleanName = name.trim();

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName) {
      return "Full name is required.";
    }

    if (
      cleanName.length < 2 ||
      cleanName.length > 80
    ) {
      return "Name must contain between 2 and 80 characters.";
    }

    if (!cleanEmail) {
      return "Email address is required.";
    }

    if (
      !emailRegex.test(cleanEmail)
    ) {
      return "Enter a valid email address.";
    }

    if (!password) {
      return "Password is required.";
    }

    if (password.length > 72) {
      return "Password cannot exceed 72 characters.";
    }

    if (!isStrongPassword) {
      return "Password must satisfy all security requirements.";
    }

    if (!confirmPassword) {
      return "Confirm your password.";
    }

    if (
      password !== confirmPassword
    ) {
      return "Passwords do not match.";
    }

    if (!agreeTerms) {
      return "Please agree to the Terms & Conditions.";
    }

    return "";
  };

  const handleRegister = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await register({
          name: name.trim(),

          email: email
            .trim()
            .toLowerCase(),

          password,
        });

      const verificationEmail = email
        .trim()
        .toLowerCase();

      sessionStorage.setItem(
        "verificationEmail",
        verificationEmail
      );

      navigate("/verify-email", {
        replace: true,

        state: {
          message:
            response.message ||
            "Verification code sent to your email.",

          email: verificationEmail,
        },
      });
    } catch (requestError) {
      console.error(
        "Registration failed:",
        requestError
      );

      let message =
        requestError.response?.data
          ?.message ||
        "Registration failed. Please try again.";

      if (
        requestError.code ===
        "ERR_NETWORK"
      ) {
        message =
          "Cannot connect to the server. Start the backend and try again.";
      }

      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-950 pt-20">
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 70, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 top-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 50, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
        />
      </div>

      <div className="relative z-10 grid min-h-[calc(100vh-80px)] lg:grid-cols-2">
        {/* Left */}
        <motion.div
          initial={{
            opacity: 0,
            x: -50,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="hidden flex-col items-center justify-center px-10 lg:flex"
        >
          <LoginIllustration />

          <motion.h1
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
            }}
            className="mt-8 text-5xl font-bold text-white"
          >
            Join ResumeAI
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
            className="mt-5 max-w-md text-center leading-8 text-gray-300"
          >
            Create your account and
            unlock AI-powered resume
            analysis, ATS scoring and
            smart job matching.
          </motion.p>
        </motion.div>

        {/* Right */}
        <div className="flex items-center justify-center p-5 sm:p-10">
          <motion.form
            onSubmit={handleRegister}
            initial={{
              opacity: 0,
              x: 50,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
            }}
            noValidate
            className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-xl sm:p-10"
          >
            <h2 className="text-4xl font-bold text-white">
              Create Account
            </h2>

            <p className="mt-2 text-gray-300">
              Start analyzing your
              resume today.
            </p>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -10,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    height: 0,
                  }}
                  role="alert"
                  className="mt-6 flex items-start gap-3 overflow-hidden rounded-xl border border-red-400/30 bg-red-500/15 p-4 text-red-200"
                >
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <span className="text-sm leading-6">
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name */}
            <div className="relative mt-8">
              <User className="absolute left-4 top-4 text-white" />

              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(event) => {
                  setName(
                    event.target.value
                  );
                  setError("");
                }}
                minLength={2}
                maxLength={80}
                autoComplete="name"
                disabled={loading}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-60"
              />
            </div>

            {/* Email */}
            <div className="relative mt-5">
              <Mail className="absolute left-4 top-4 text-white" />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );
                  setError("");
                }}
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div className="relative mt-5">
              <Lock className="absolute left-4 top-4 text-white" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );
                  setError("");
                }}
                minLength={15}
                maxLength={72}
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-12 text-white outline-none transition placeholder:text-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-4 top-4 text-white transition hover:text-indigo-300"
              >
                {showPassword ? (
                  <EyeOff />
                ) : (
                  <Eye />
                )}
              </button>
            </div>

            {/* Strength bar */}
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="h-2 flex-1 overflow-hidden rounded-full bg-gray-600"
                  >
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width:
                          item <=
                          passedRules
                            ? "100%"
                            : "0%",
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className={`h-full ${strength.color}`}
                    />
                  </div>
                )
              )}
            </div>

            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-300">
                Password Strength
              </span>

              <span
                className={`font-semibold ${strength.text}`}
              >
                {strength.label}
              </span>
            </div>

            {/* Requirements */}
            <motion.div
              layout
              className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-black/10 p-4 sm:grid-cols-2"
            >
              {passwordChecks.map(
                (rule) => (
                  <motion.div
                    layout
                    key={rule.id}
                    className={`flex items-center gap-2 text-xs ${
                      rule.passed
                        ? "text-green-400"
                        : "text-gray-300"
                    }`}
                  >
                    {rule.passed ? (
                      <CheckCircle
                        size={15}
                      />
                    ) : (
                      <Circle
                        size={15}
                      />
                    )}

                    {rule.text}
                  </motion.div>
                )
              )}
            </motion.div>

            {/* Confirm password */}
            <div className="relative mt-5">
              <Lock className="absolute left-4 top-4 text-white" />

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );
                  setError("");
                }}
                minLength={15}
                maxLength={72}
                autoComplete="new-password"
                disabled={loading}
                className={`w-full rounded-xl border bg-white/10 py-4 pl-12 pr-12 text-white outline-none transition placeholder:text-gray-300 focus:ring-2 disabled:opacity-60 ${
                  confirmPassword
                    ? passwordsMatch
                      ? "border-green-400 focus:border-green-400 focus:ring-green-400/20"
                      : "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                    : "border-white/20 focus:border-indigo-400 focus:ring-indigo-400/20"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(
                    (current) => !current
                  )
                }
                aria-label={
                  showConfirm
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-4 top-4 text-white transition hover:text-indigo-300"
              >
                {showConfirm ? (
                  <EyeOff />
                ) : (
                  <Eye />
                )}
              </button>
            </div>

            {/* Password match */}
            <AnimatePresence>
              {confirmPassword.length >
                0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="mt-3 flex items-center gap-2"
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="text-green-400" />

                      <span className="text-sm text-green-400">
                        Passwords Match
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-400" />

                      <span className="text-sm text-red-400">
                        Passwords Don't
                        Match
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terms */}
            <label className="mt-6 flex cursor-pointer items-start gap-3 text-gray-300">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(event) =>
                  setAgreeTerms(
                    event.target.checked
                  )
                }
                disabled={loading}
                className="mt-1 h-4 w-4 accent-indigo-600"
              />

              <span>
                I agree to the Terms &
                Conditions
              </span>
            </label>

            {/* Register */}
            <motion.button
              whileHover={
                loading
                  ? undefined
                  : { scale: 1.02 }
              }
              whileTap={
                loading
                  ? undefined
                  : { scale: 0.97 }
              }
              type="submit"
              disabled={loading}
              className={`mt-8 w-full rounded-xl py-4 font-semibold text-white transition ${
                loading
                  ? "cursor-not-allowed bg-gray-500"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </motion.button>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <hr className="flex-1 border-white/20" />

              <span className="mx-4 text-gray-300">
                OR
              </span>

              <hr className="flex-1 border-white/20" />
            </div>

            {/* Google */}
            <motion.a
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              href={getGoogleAuthUrl()}
              className="block w-full rounded-xl bg-white py-4 text-center font-semibold text-slate-900 transition hover:bg-gray-100"
            >
              Continue with Google
            </motion.a>

            <p className="mt-8 text-center text-gray-300">
              Already have an account?

              <Link
                to="/login"
                className="ml-2 font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Login
              </Link>
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

export default Register;