import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  resendVerificationOtp,
  verifyEmailOtp,
} from "../services/verificationApi";

const OTP_LENGTH = 6;

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [email, setEmail] = useState(
    location.state?.email ||
      sessionStorage.getItem(
        "verificationEmail"
      ) ||
      ""
  );

  const [digits, setDigits] = useState(
    Array(OTP_LENGTH).fill("")
  );

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [resending, setResending] =
    useState(false);
  const [success, setSuccess] =
    useState(false);
  const [countdown, setCountdown] =
    useState(60);

  useEffect(() => {
    if (email) {
      sessionStorage.setItem(
        "verificationEmail",
        email
      );
    }
  }, [email]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setInterval(
      () => {
        setCountdown((current) =>
          Math.max(0, current - 1)
        );
      },
      1000
    );

    return () =>
      window.clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const otp = digits.join("");

  const updateDigit = (
    index,
    value
  ) => {
    const cleanValue = value
      .replace(/\D/g, "")
      .slice(-1);

    setDigits((current) => {
      const updated = [...current];
      updated[index] = cleanValue;
      return updated;
    });

    setError("");

    if (
      cleanValue &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyDown = (
    index,
    event
  ) => {
    if (
      event.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const updated =
      Array(OTP_LENGTH).fill("");

    pasted
      .split("")
      .forEach((digit, index) => {
        updated[index] = digit;
      });

    setDigits(updated);
    setError("");

    inputRefs.current[
      Math.min(
        pasted.length,
        OTP_LENGTH
      ) - 1
    ]?.focus();
  };

  const handleVerify = async (
    event
  ) => {
    event.preventDefault();

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail) {
      setError(
        "Email address is required."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Enter the complete 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await verifyEmailOtp({
        email: cleanEmail,
        otp,
      });

      setSuccess(true);

      sessionStorage.removeItem(
        "verificationEmail"
      );

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email: cleanEmail,
            successMessage:
              "Email verified successfully. You can now log in.",
          },
        });
      }, 1400);
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          (requestError.code ===
          "ERR_NETWORK"
            ? "Cannot connect to the server."
            : "Verification failed. Try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) {
      return;
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail) {
      setError(
        "Email address is required."
      );
      return;
    }

    try {
      setResending(true);
      setError("");

      await resendVerificationOtp(
        cleanEmail
      );

      setDigits(
        Array(OTP_LENGTH).fill("")
      );
      setCountdown(60);

      window.setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to resend the verification code."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-950 pt-20">
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

      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center p-5 sm:p-10">
        <motion.form
          onSubmit={handleVerify}
          initial={{
            opacity: 0,
            y: 40,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.6,
          }}
          className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-7 text-white shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="py-12 text-center"
              >
                <motion.div
                  initial={{
                    scale: 0,
                    rotate: -90,
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 12,
                  }}
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 text-green-400"
                >
                  <CheckCircle size={56} />
                </motion.div>

                <h1 className="mt-7 text-3xl font-bold">
                  Email Verified
                </h1>

                <p className="mt-3 text-gray-300">
                  Your account is ready.
                  Opening Login...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="verify"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{
                    y: [0, -7, 0],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30"
                >
                  <MailCheck size={40} />
                </motion.div>

                <div className="mt-7 text-center">
                  <h1 className="text-3xl font-bold">
                    Verify Your Email
                  </h1>

                  <p className="mt-3 leading-7 text-gray-300">
                    Enter the code sent to
                  </p>

                  <p className="break-all font-semibold text-indigo-300">
                    {email ||
                      "your email address"}
                  </p>
                </div>

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

                {!email && (
                  <div className="mt-6">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="Email address"
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-gray-300 focus:border-indigo-400"
                    />
                  </div>
                )}

                <div
                  className="mt-8 flex justify-center gap-2 sm:gap-3"
                  onPaste={handlePaste}
                >
                  {digits.map(
                    (digit, index) => (
                      <motion.input
                        key={index}
                        ref={(element) => {
                          inputRefs.current[
                            index
                          ] = element;
                        }}
                        whileFocus={{
                          y: -4,
                          scale: 1.05,
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={
                          index === 0
                            ? "one-time-code"
                            : "off"
                        }
                        maxLength={1}
                        value={digit}
                        onChange={(event) =>
                          updateDigit(
                            index,
                            event.target
                              .value
                          )
                        }
                        onKeyDown={(event) =>
                          handleKeyDown(
                            index,
                            event
                          )
                        }
                        disabled={loading}
                        aria-label={`OTP digit ${
                          index + 1
                        }`}
                        className="h-14 w-11 rounded-xl border border-white/20 bg-white/10 text-center text-2xl font-bold text-white outline-none transition focus:border-indigo-400 focus:bg-indigo-500/20 focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-60 sm:h-16 sm:w-12"
                      />
                    )
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-300">
                  <span>
                    Code expires in 10
                    minutes
                  </span>

                  <span>
                    {otp.length}/6 digits
                  </span>
                </div>

                <motion.button
                  whileHover={
                    loading ||
                    otp.length !==
                      OTP_LENGTH
                      ? undefined
                      : { scale: 1.02 }
                  }
                  whileTap={
                    loading ||
                    otp.length !==
                      OTP_LENGTH
                      ? undefined
                      : { scale: 0.97 }
                  }
                  type="submit"
                  disabled={
                    loading ||
                    otp.length !==
                      OTP_LENGTH
                  }
                  className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white transition ${
                    loading ||
                    otp.length !==
                      OTP_LENGTH
                      ? "cursor-not-allowed bg-gray-500"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  <ShieldCheck size={20} />

                  {loading
                    ? "Verifying..."
                    : "Verify Email"}
                </motion.button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={
                    countdown > 0 ||
                    resending
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-3 font-medium text-gray-200 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={18}
                    className={
                      resending
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {resending
                    ? "Sending..."
                    : countdown > 0
                    ? `Resend code in ${countdown}s`
                    : "Resend verification code"}
                </button>

                <Link
                  to="/login"
                  className="mt-7 flex items-center justify-center gap-2 text-sm text-indigo-300 transition hover:text-indigo-200"
                >
                  <ArrowLeft size={17} />
                  Back to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </div>
  );
}

export default VerifyEmail;