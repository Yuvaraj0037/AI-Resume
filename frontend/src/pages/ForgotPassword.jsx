import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  motion,
} from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import {
  requestPasswordReset,
  resetPassword,
} from "../services/passwordApi";

function ForgotPassword() {
  const navigate =
    useNavigate();

  const [step, setStep] =
    useState("email");

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    requesting,
    setRequesting,
  ] = useState(false);

  const [
    resetting,
    setResetting,
  ] = useState(false);

  const [
    resendSeconds,
    setResendSeconds,
  ] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timer =
      window.setInterval(() => {
        setResendSeconds(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [resendSeconds]);

  const passwordChecks =
    useMemo(
      () => ({
        length:
          newPassword.length >= 15,

        uppercase:
          /[A-Z]/.test(
            newPassword
          ),

        lowercase:
          /[a-z]/.test(
            newPassword
          ),

        number:
          /[0-9]/.test(
            newPassword
          ),

        special:
          /[^A-Za-z0-9]/.test(
            newPassword
          ),
      }),
      [newPassword]
    );

  const strongPassword =
    Object.values(
      passwordChecks
    ).every(Boolean);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    newPassword ===
      confirmPassword;

  function handleOtpChange(
    event
  ) {
    const digits =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(digits);
  }

  async function handleRequestOtp(
    event
  ) {
    event.preventDefault();

    const safeEmail =
      email
        .trim()
        .toLowerCase();

    if (!safeEmail) {
      toast.error(
        "Enter your email address"
      );

      return;
    }

    try {
      setRequesting(true);

      const result =
        await requestPasswordReset(
          safeEmail
        );

      setEmail(safeEmail);
      setStep("reset");
      setResendSeconds(60);

      toast.success(
        result?.message ||
          "If an eligible account exists, a reset code has been sent."
      );
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Unable to request a reset code"
      );
    } finally {
      setRequesting(false);
    }
  }

  async function handleResendOtp() {
    if (
      resendSeconds > 0 ||
      requesting
    ) {
      return;
    }

    try {
      setRequesting(true);

      const result =
        await requestPasswordReset(
          email
        );

      setOtp("");
      setResendSeconds(60);

      toast.success(
        result?.message ||
          "A new reset code has been requested."
      );
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Unable to resend the code"
      );
    } finally {
      setRequesting(false);
    }
  }

  async function handleResetPassword(
    event
  ) {
    event.preventDefault();

    if (otp.length !== 6) {
      toast.error(
        "Enter the 6-digit verification code"
      );

      return;
    }

    if (!strongPassword) {
      toast.error(
        "Create a stronger password"
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match"
      );

      return;
    }

    try {
      setResetting(true);

      const result =
        await resetPassword({
          email,
          otp,
          newPassword,
        });

      toast.success(
        result?.message ||
          "Password reset successfully"
      );

      window.setTimeout(() => {
        navigate(
          "/login?passwordReset=true",
          {
            replace: true,
          }
        );
      }, 700);
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Unable to reset password"
      );
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-20 text-white sm:px-6">
      <motion.div
        animate={{
          x: [
            0,
            60,
            -30,
            0,
          ],
          y: [
            0,
            -40,
            30,
            0,
          ],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
      />

      <motion.div
        animate={{
          x: [
            0,
            -50,
            25,
            0,
          ],
          y: [
            0,
            50,
            -25,
            0,
          ],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-10rem)] max-w-6xl items-center justify-center">
        <motion.section
          initial={{
            opacity: 0,
            scale: 0.94,
            y: 35,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 22,
          }}
          className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl"
        >
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500" />

          <div className="p-6 sm:p-10">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>

            <motion.div
              key={step}
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-8"
            >
              <div className="flex h-17 w-17 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-950/40">
                {step === "email" ? (
                  <KeyRound size={32} />
                ) : (
                  <ShieldCheck size={32} />
                )}
              </div>

              <h1 className="mt-6 text-4xl font-black">
                {step === "email"
                  ? "Forgot Password?"
                  : "Reset Password"}
              </h1>

              <p className="mt-3 leading-7 text-slate-300">
                {step === "email"
                  ? "Enter the email used for your ResumeAI email/password account."
                  : `Enter the verification code sent to ${email}.`}
              </p>
            </motion.div>

            {step === "email" ? (
              <motion.form
                onSubmit={
                  handleRequestOtp
                }
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="mt-8"
              >
                <label
                  htmlFor="forgot-email"
                  className="text-sm font-bold text-slate-200"
                >
                  Email address
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    disabled={requesting}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/15 bg-white/10 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={requesting}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {requesting ? (
                    <>
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                      />
                      Sending code...
                    </>
                  ) : (
                    <>
                      <Mail size={20} />
                      Send Reset Code
                    </>
                  )}
                </button>

                <p className="mt-6 text-center text-sm leading-6 text-slate-400">
                  Google-only account? Use
                  Google Login instead. ResumeAI
                  cannot reset your Google
                  password.
                </p>
              </motion.form>
            ) : (
              <motion.form
                onSubmit={
                  handleResetPassword
                }
                initial={{
                  opacity: 0,
                  x: 24,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className="mt-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor="reset-otp"
                      className="text-sm font-bold text-slate-200"
                    >
                      Verification code
                    </label>

                    <span className="text-xs font-semibold text-slate-400">
                      {otp.length}/6 digits
                    </span>
                  </div>

                  <input
                    id="reset-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={
                      handleOtpChange
                    }
                    disabled={resetting}
                    placeholder="000000"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-4 text-center text-3xl font-black tracking-[0.5em] text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="new-password"
                    placeholder="15 characters"
                    className="text-sm font-bold text-slate-200"
                  >
                    New password
                  </label>

                  <div className="relative mt-2">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="new-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      disabled={resetting}
                      placeholder="Create new password"
                      className="w-full rounded-xl border border-white/15 bg-white/10 py-4 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      label:
                        "8+ characters",
                      valid:
                        passwordChecks.length,
                    },
                    {
                      label:
                        "Uppercase",
                      valid:
                        passwordChecks.uppercase,
                    },
                    {
                      label:
                        "Lowercase",
                      valid:
                        passwordChecks.lowercase,
                    },
                    {
                      label: "Number",
                      valid:
                        passwordChecks.number,
                    },
                    {
                      label:
                        "Special character",
                      valid:
                        passwordChecks.special,
                    },
                  ].map((check) => (
                    <div
                      key={check.label}
                      className={`flex items-center gap-2 ${
                        check.valid
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      <CheckCircle2
                        size={14}
                      />
                      {check.label}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="confirm-new-password"
                    className="text-sm font-bold text-slate-200"
                  >
                    Confirm new password
                  </label>

                  <div className="relative mt-2">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirm-new-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      disabled={resetting}
                      placeholder="Repeat new password"
                      className="w-full rounded-xl border border-white/15 bg-white/10 py-4 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  {confirmPassword && (
                    <p
                      className={`mt-2 text-sm font-semibold ${
                        passwordsMatch
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {passwordsMatch
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    resetting ||
                    otp.length !== 6 ||
                    !strongPassword ||
                    !passwordsMatch
                  }
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {resetting ? (
                    <>
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                      />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <KeyRound size={20} />
                      Reset Password
                    </>
                  )}
                </button>

                <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    disabled={resetting}
                    className="text-sm font-semibold text-slate-400 transition hover:text-white"
                  >
                    Change email
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleResendOtp
                    }
                    disabled={
                      resendSeconds > 0 ||
                      requesting
                    }
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200 disabled:cursor-not-allowed disabled:text-slate-500"
                  >
                    {requesting ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCw
                        size={16}
                      />
                    )}

                    {resendSeconds > 0
                      ? `Resend in ${resendSeconds}s`
                      : "Resend code"}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default ForgotPassword;