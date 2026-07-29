import {
  useEffect,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  deleteAccount,
} from "../../services/accountApi";
import {
  useAppearance,
} from "../../context/AppearanceContext";

function getStoredEmail() {
  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return "";
    }

    const user =
      JSON.parse(storedUser);

    return user?.email || "";
  } catch {
    return "";
  }
}

function DeleteAccountSection() {
  const {
    theme,
    sleepMode,
  } = useAppearance();

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    confirmation,
    setConfirmation,
  ] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const isDark =
    theme === "dark";

  const storedEmail =
    getStoredEmail();

  const isConfirmed =
    confirmation === "DELETE";

  // Password does not control the button.
  // Backend decides whether a password is required.
  const canDelete =
    isConfirmed && !deleting;

  const sectionClass = sleepMode
    ? "border-amber-300/20 bg-[#292317] text-amber-50"
    : isDark
      ? "border-red-400/15 bg-slate-900/80 text-white"
      : "border-red-200 bg-white text-slate-950";

  const descriptionClass =
    sleepMode
      ? "text-amber-100/70"
      : isDark
        ? "text-slate-400"
        : "text-slate-600";

  const modalClass = sleepMode
    ? "border-amber-300/20 bg-[#211d14] text-amber-50"
    : isDark
      ? "border-white/10 bg-slate-950 text-white"
      : "border-slate-200 bg-white text-slate-950";

  const inputClass = sleepMode
    ? "border-amber-300/20 bg-black/20 text-amber-50 placeholder:text-amber-100/40 focus:border-amber-400"
    : isDark
      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-red-400"
      : "border-slate-300 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-red-500";

  function resetFields() {
    setConfirmation("");
    setPassword("");
    setShowPassword(false);
  }

  function openModal() {
    resetFields();
    setModalOpen(true);
  }

  function closeModal() {
    if (deleting) {
      return;
    }

    setModalOpen(false);
    resetFields();
  }

  useEffect(() => {
    if (!modalOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (
        event.key === "Escape" &&
        !deleting
      ) {
        setModalOpen(false);
        setConfirmation("");
        setPassword("");
        setShowPassword(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        "";
    };
  }, [modalOpen, deleting]);

  function handleConfirmationChange(
    event
  ) {
    const nextValue =
      event.target.value
        .toUpperCase()
        .replace(
          /[^A-Z]/g,
          ""
        );

    /*
      Accept only values that can form DELETE:

      D
      DE
      DEL
      DELE
      DELET
      DELETE

      Browser-autofilled email addresses
      are rejected automatically.
    */
    if (
      "DELETE".startsWith(
        nextValue
      )
    ) {
      setConfirmation(
        nextValue
      );
    } else {
      setConfirmation("");
    }
  }

  async function handleDeleteAccount(
    event
  ) {
    event.preventDefault();

    if (
      confirmation !== "DELETE"
    ) {
      toast.error(
        'Type "DELETE" to continue'
      );

      return;
    }

    try {
      setDeleting(true);

      const result =
        await deleteAccount({
          confirmation:
            "DELETE",
          password,
        });

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "latestResume"
      );

      toast.success(
        result?.message ||
          "Account deleted successfully"
      );

      window.setTimeout(() => {
        window.location.replace(
          "/register?accountDeleted=true"
        );
      }, 700);
    } catch (error) {
      console.error(
        "Delete account failed:",
        error.response?.data ||
          error
      );

      const status =
        error.response?.status;

      const backendMessage =
        error.response?.data?.message;

      if (status === 400) {
        toast.error(
          backendMessage ||
            "Check the confirmation and password"
        );

        return;
      }

      if (status === 401) {
        toast.error(
          backendMessage ||
            "Incorrect password or expired session"
        );

        return;
      }

      if (status === 404) {
        toast.error(
          backendMessage ||
            "Account deletion endpoint was not found"
        );

        return;
      }

      if (status === 429) {
        toast.error(
          backendMessage ||
            "Too many requests. Try again later."
        );

        return;
      }

      toast.error(
        backendMessage ||
          error.message ||
          "Unable to delete account"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <motion.section
        initial={{
          opacity: 0,
          y: 24,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 0.45,
        }}
        className={`overflow-hidden rounded-3xl border shadow-xl ${sectionClass}`}
      >
        <div className="h-1 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-500">
                <AlertTriangle
                  size={27}
                />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-500">
                  Danger zone
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Delete Account
                </h2>

                <p
                  className={`mt-2 max-w-2xl leading-7 ${descriptionClass}`}
                >
                  Permanently delete your
                  account, resume analyses,
                  builder resumes, preferences
                  and AI Coach conversations.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={openModal}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700"
            >
              <Trash2 size={19} />
              Delete Account
            </motion.button>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-8"
          >
            <motion.button
              type="button"
              aria-label="Close deletion dialog"
              onClick={closeModal}
              className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-md"
            />

            <motion.form
              onSubmit={
                handleDeleteAccount
              }
              autoComplete="off"
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 35,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 24,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 24,
              }}
              className={`relative z-10 w-full max-w-lg rounded-3xl border p-6 shadow-2xl sm:p-8 ${modalClass}`}
            >
              {/* Captures browser username autofill */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={storedEmail}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
              />

              <button
                type="button"
                onClick={closeModal}
                disabled={deleting}
                aria-label="Close"
                className="absolute right-5 top-5 rounded-xl p-2 text-slate-400 transition hover:bg-black/10 hover:text-red-500 disabled:cursor-not-allowed"
              >
                <X size={22} />
              </button>

              <motion.div
                animate={{
                  rotate: [
                    0,
                    -4,
                    4,
                    -3,
                    3,
                    0,
                  ],
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.25,
                }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-red-500"
              >
                <Trash2 size={31} />
              </motion.div>

              <h2 className="mt-6 text-3xl font-black">
                Delete your account?
              </h2>

              <p
                className={`mt-3 leading-7 ${descriptionClass}`}
              >
                This permanently removes
                your account and associated
                ResumeAI data. You cannot
                recover it later.
              </p>

              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={21}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <p className="text-sm leading-6 text-red-500">
                    Resume analyses, extracted
                    resume text, builder resumes
                    and coaching conversations
                    will be permanently deleted.
                  </p>
                </div>
              </div>

              {/* Confirmation field */}
              <div className="mt-6">
                <label
                  htmlFor="delete-confirmation"
                  className="text-sm font-bold"
                >
                  Type{" "}
                  <span className="text-red-500">
                    DELETE
                  </span>{" "}
                  to confirm
                </label>

                <input
                  id="delete-confirmation"
                  name="resumeai-delete-phrase"
                  type="search"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={confirmation}
                  onChange={
                    handleConfirmationChange
                  }
                  disabled={deleting}
                  placeholder='Type "DELETE"'
                  className={`mt-2 w-full rounded-xl border px-4 py-3.5 font-semibold uppercase outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${inputClass}`}
                />

                <div className="mt-2 flex items-center justify-between gap-3">
                  <p
                    className={`text-xs ${descriptionClass}`}
                  >
                    Enter DELETE, not your
                    email address.
                  </p>

                  {confirmation.length >
                    0 && (
                    <span
                      className={`text-xs font-bold ${
                        isConfirmed
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {isConfirmed
                        ? "Confirmed"
                        : "Not confirmed"}
                    </span>
                  )}
                </div>
              </div>

              {/* Optional password */}
              <div className="mt-5">
                <label
                  htmlFor="delete-password"
                  className="text-sm font-bold"
                >
                  Current password
                </label>

                <p
                  className={`mt-1 text-xs ${descriptionClass}`}
                >
                  Email/password accounts must
                  enter their ResumeAI password.
                  Google-only accounts must leave
                  this empty.
                </p>

                <div className="relative mt-2">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="delete-password"
                    name="current-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    disabled={deleting}
                    placeholder="Leave empty for Google-only account"
                    className={`w-full rounded-xl border py-3.5 pl-12 pr-12 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${inputClass}`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    disabled={deleting}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-red-500 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={19}
                      />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-slate-500/30 px-5 py-3.5 font-bold transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep Account
                </button>

                <motion.button
                  type="submit"
                  whileHover={
                    canDelete
                      ? {
                          scale: 1.02,
                        }
                      : {}
                  }
                  whileTap={
                    canDelete
                      ? {
                          scale: 0.98,
                        }
                      : {}
                  }
                  disabled={!canDelete}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-70"
                >
                  {deleting ? (
                    <>
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2
                        size={19}
                      />
                      Delete Permanently
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default DeleteAccountSection;