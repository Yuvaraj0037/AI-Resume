import { motion } from "framer-motion";
import {
  Award,
  Download,
  Edit3,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import {
  useAppearance,
} from "../../context/AppearanceContext";

function ProfileHeader({
  profile,
  onEdit,
  onDownload,
}) {
  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isNightMode =
    theme === "dark" || sleepMode;

  const name =
    profile?.name || "ResumeAI User";

  const email =
    profile?.email || "No email available";

  const highestATS =
    Number(profile?.highestATS) || 0;

  const totalResumes =
    Number(profile?.totalResumes) || 0;

  const level = Math.min(
    10,
    Math.max(
      1,
      Math.ceil(highestATS / 10)
    )
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-xl sm:p-8 ${
        sleepMode
          ? "border-amber-400/15 bg-[#2b2518]/90"
          : isNightMode
            ? "border-slate-700/60 bg-slate-900/80"
            : "border-white/70 bg-white/75"
      }`}
    >
      {/* Background glow */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <motion.div
            animate={{
              y: [0, -7, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative shrink-0"
          >
            <div className="liquid-logo flex h-28 w-28 items-center justify-center text-white shadow-xl">
              <User
                size={50}
                className="relative z-10"
              />
            </div>

            <span
              className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-4 bg-emerald-500 ${
                isNightMode
                  ? "border-slate-900"
                  : "border-white"
              }`}
            />
          </motion.div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2
                className={`break-words text-3xl font-black sm:text-4xl ${
                  isNightMode
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                {name}
              </h2>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                <ShieldCheck size={15} />
                Active
              </span>
            </div>

            <div
              className={`mt-3 flex items-center gap-2 font-medium ${
                isNightMode
                  ? "text-slate-300"
                  : "text-slate-600"
              }`}
            >
              <Mail
                size={18}
                className="shrink-0 text-indigo-500"
              />

              <span className="break-all">
                {email}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-100 px-4 py-2 font-bold text-indigo-700">
                <Award size={18} />
                Highest ATS {highestATS}%
              </span>

              <span className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-100 px-4 py-2 font-bold text-violet-700">
                <Sparkles size={18} />
                Level {level}
              </span>

              <span
                className={`rounded-xl border px-4 py-2 font-bold ${
                  isNightMode
                    ? "border-slate-600 bg-slate-800 text-slate-200"
                    : "border-slate-200 bg-slate-100 text-slate-700"
                }`}
              >
                {totalResumes}{" "}
                {totalResumes === 1
                  ? "Resume"
                  : "Resumes"}{" "}
                Uploaded
              </span>
            </div>
          </div>
        </div>

        {(onEdit || onDownload) && (
          <div className="flex flex-wrap gap-3">
            {onEdit && (
              <motion.button
                type="button"
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                onClick={onEdit}
                className={`flex items-center gap-2 rounded-xl border px-5 py-3 font-bold transition ${
                  isNightMode
                    ? "border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Edit3 size={18} />
                Edit Profile
              </motion.button>
            )}

            {onDownload && (
              <motion.button
                type="button"
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                onClick={onDownload}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-500/20"
              >
                <Download size={18} />
                Download Report
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProfileHeader;