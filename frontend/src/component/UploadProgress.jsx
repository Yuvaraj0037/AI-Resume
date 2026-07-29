import { motion } from "framer-motion";
import {
  BrainCircuit,
  Check,
  FileSearch,
  Loader2,
  UploadCloud,
} from "lucide-react";

import {
  useAppearance,
} from "../context/AppearanceContext";

const STAGES = [
  {
    key: "uploading",
    title: "Uploading PDF",
    description:
      "Securely sending your resume",
    icon: UploadCloud,
  },
  {
    key: "extracting",
    title: "Reading content",
    description:
      "Extracting text from your PDF",
    icon: FileSearch,
  },
  {
    key: "analyzing",
    title: "AI analysis",
    description:
      "Scoring skills and ATS compatibility",
    icon: BrainCircuit,
  },
];

const STAGE_ORDER = {
  uploading: 0,
  extracting: 1,
  analyzing: 2,
  complete: 3,
};

function UploadProgress({
  progress,
  stage,
  visible,
}) {
  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isNightMode =
    theme === "dark" || sleepMode;

  if (!visible) return null;

  const safeProgress = Math.min(
    100,
    Math.max(0, Math.round(progress))
  );

  const circumference =
    2 * Math.PI * 54;

  const offset =
    circumference -
    (safeProgress / 100) *
      circumference;

  const currentStage =
    STAGE_ORDER[stage] ?? 0;

  const containerClass = sleepMode
    ? "border-amber-400/15 bg-[#2b2518]/95"
    : isNightMode
      ? "border-slate-700 bg-slate-900/95"
      : "border-white/70 bg-white/90";

  const headingClass = isNightMode
    ? "text-white"
    : "text-slate-950";

  const descriptionClass = sleepMode
    ? "text-amber-100/75"
    : isNightMode
      ? "text-slate-300"
      : "text-slate-600";

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.98,
      }}
      className={`relative mt-7 overflow-hidden rounded-3xl border p-6 shadow-xl backdrop-blur-xl sm:p-8 ${containerClass}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[auto_1fr]">
        <div className="relative mx-auto h-36 w-36">
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="54"
              fill="transparent"
              stroke={
                isNightMode
                  ? "rgba(148,163,184,0.18)"
                  : "rgba(148,163,184,0.25)"
              }
              strokeWidth="11"
            />

            <motion.circle
              cx="72"
              cy="72"
              r="54"
              fill="transparent"
              stroke="url(#uploadGradient)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={
                circumference
              }
              animate={{
                strokeDashoffset: offset,
              }}
              transition={{
                duration: 0.45,
                ease: "easeOut",
              }}
            />

            <defs>
              <linearGradient
                id="uploadGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#6366f1"
                />

                <stop
                  offset="55%"
                  stopColor="#8b5cf6"
                />

                <stop
                  offset="100%"
                  stopColor="#06b6d4"
                />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {stage === "complete" ? (
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
              >
                <Check
                  size={30}
                  strokeWidth={3}
                />
              </motion.div>
            ) : (
              <>
                <motion.p
                  key={safeProgress}
                  initial={{
                    opacity: 0.5,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className={`text-3xl font-black ${headingClass}`}
                >
                  {safeProgress}%
                </motion.p>

                <span
                  className={`text-xs font-bold uppercase tracking-wider ${descriptionClass}`}
                >
                  Processing
                </span>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            {stage === "complete" ? (
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
                <Check size={22} />
              </div>
            ) : (
              <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
                <Loader2
                  size={22}
                  className="animate-spin"
                />
              </div>
            )}

            <div>
              <h2
                className={`text-xl font-black ${headingClass}`}
              >
                {stage === "complete"
                  ? "Analysis completed"
                  : "Analyzing your resume"}
              </h2>

              <p
                className={`text-sm ${descriptionClass}`}
              >
                {stage === "complete"
                  ? "Opening your ATS report..."
                  : "Estimated progress based on the current processing stage"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {STAGES.map(
              (item, index) => {
                const Icon = item.icon;

                const completed =
                  currentStage > index;

                const active =
                  currentStage === index;

                return (
                  <motion.div
                    key={item.key}
                    animate={{
                      y: active
                        ? -3
                        : 0,
                      scale: active
                        ? 1.02
                        : 1,
                    }}
                    className={`rounded-2xl border p-4 transition ${
                      completed
                        ? "border-emerald-200 bg-emerald-50"
                        : active
                          ? "border-indigo-300 bg-indigo-50 shadow-md"
                          : isNightMode
                            ? "border-slate-700 bg-slate-800/60"
                            : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        completed
                          ? "bg-emerald-100 text-emerald-600"
                          : active
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {completed ? (
                        <Check size={19} />
                      ) : (
                        <Icon size={19} />
                      )}
                    </div>

                    <p
                      className={`mt-3 text-sm font-bold ${
                        completed
                          ? "text-emerald-700"
                          : active
                            ? "text-indigo-700"
                            : headingClass
                      }`}
                    >
                      {item.title}
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        completed
                          ? "text-emerald-600"
                          : descriptionClass
                      }`}
                    >
                      {item.description}
                    </p>
                  </motion.div>
                );
              }
            )}
          </div>

          <div
            className={`mt-6 h-3 overflow-hidden rounded-full ${
              isNightMode
                ? "bg-slate-700"
                : "bg-slate-200"
            }`}
          >
            <motion.div
              animate={{
                width: `${safeProgress}%`,
              }}
              transition={{
                duration: 0.45,
              }}
              className="relative h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500"
            >
              <motion.span
                animate={{
                  x: ["-100%", "500%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default UploadProgress;