import { motion } from "framer-motion";
import {
  AlertTriangle,
  Gamepad2,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import {
  useAppearance,
} from "../../context/AppearanceContext";

function ATSProgress({ value = 0 }) {
  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isNightMode =
    theme === "dark" || sleepMode;

  const score = Math.min(
    100,
    Math.max(0, Number(value) || 0)
  );

  const status =
    score >= 85
      ? "Excellent"
      : score >= 70
        ? "Good"
        : score >= 50
          ? "Average"
          : "Needs Work";

  const StatusIcon =
    score >= 70
      ? ShieldCheck
      : AlertTriangle;

  const level =
    score >= 85
      ? 4
      : score >= 70
        ? 3
        : score >= 50
          ? 2
          : 1;

  const nextTarget =
    score < 50
      ? 50
      : score < 70
        ? 70
        : score < 85
          ? 85
          : 100;

  const pointsNeeded = Math.max(
    0,
    nextTarget - score
  );

  const circumference =
    2 * Math.PI * 92;

  const progressOffset =
    circumference -
    (score / 100) * circumference;

  const containerClass = sleepMode
    ? "border-amber-400/15 bg-[#2b2518]/92"
    : isNightMode
      ? "border-slate-700/60 bg-slate-900/85"
      : "border-slate-200 bg-white/95";

  const panelClass = sleepMode
    ? "border-amber-400/10 bg-[#37301f]"
    : isNightMode
      ? "border-slate-700 bg-slate-800/85"
      : "border-slate-200 bg-slate-50";

  const headingClass = isNightMode
    ? "text-white"
    : "text-slate-950";

  const descriptionClass = sleepMode
    ? "text-amber-100/80"
    : isNightMode
      ? "text-slate-300"
      : "text-slate-600";

  const mutedClass = sleepMode
    ? "text-amber-200/70"
    : isNightMode
      ? "text-slate-400"
      : "text-slate-500";

  const trackColor = sleepMode
    ? "rgba(251, 191, 36, 0.14)"
    : isNightMode
      ? "rgba(148, 163, 184, 0.18)"
      : "rgba(148, 163, 184, 0.22)";

  const ringClass =
    score >= 85
      ? "text-emerald-500"
      : score >= 70
        ? "text-blue-500"
        : score >= 50
          ? "text-amber-500"
          : "text-red-500";

  const statusMessage =
    score >= 85
      ? "Your resume is highly ATS-friendly."
      : score >= 70
        ? "Good score with some room to improve."
        : score >= 50
          ? "Add stronger keywords and measurable results."
          : "Improve skills, keywords and project impact.";

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 30,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      whileHover={{
        y: -5,
      }}
      className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-xl sm:p-8 ${containerClass}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <h2
              className={`text-2xl font-black ${headingClass}`}
            >
              ATS Progress
            </h2>

            <p
              className={`mt-1 font-medium ${descriptionClass}`}
            >
              Your best resume score
            </p>
          </div>

          <motion.div
            animate={{
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="rounded-2xl bg-indigo-100 p-3 text-indigo-600"
          >
            <Target />
          </motion.div>
        </div>

        <div className="relative mx-auto h-56 w-56">
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="92"
              stroke={trackColor}
              strokeWidth="18"
              fill="transparent"
            />

            <motion.circle
              cx="112"
              cy="112"
              r="92"
              stroke="currentColor"
              strokeWidth="18"
              fill="transparent"
              strokeLinecap="round"
              className={ringClass}
              strokeDasharray={circumference}
              initial={{
                strokeDashoffset:
                  circumference,
              }}
              animate={{
                strokeDashoffset:
                  progressOffset,
              }}
              transition={{
                duration: 1.4,
                ease: "easeOut",
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.h3
              initial={{
                scale: 0.7,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                delay: 0.35,
              }}
              className={`text-5xl font-black ${headingClass}`}
            >
              {score}%
            </motion.h3>

            <p
              className={`mt-2 font-semibold ${mutedClass}`}
            >
              ATS Score
            </p>
          </div>

          {[0, 1, 2].map((particle) => (
            <motion.div
              key={particle}
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4],
                rotate: [0, 20, 0],
              }}
              transition={{
                duration: 2.4,
                delay: particle * 0.5,
                repeat: Infinity,
              }}
              className={`absolute text-amber-400 ${
                particle === 0
                  ? "left-2 top-8"
                  : particle === 1
                    ? "right-1 top-20"
                    : "bottom-5 left-7"
              }`}
            >
              <Star
                size={
                  particle === 1
                    ? 14
                    : 18
                }
                fill="currentColor"
              />
            </motion.div>
          ))}
        </div>

        <div
          className={`mt-7 flex items-center gap-4 rounded-2xl border p-5 ${panelClass}`}
        >
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
            <StatusIcon />
          </div>

          <div>
            <h3
              className={`font-black ${headingClass}`}
            >
              {status}
            </h3>

            <p
              className={`mt-1 text-sm ${descriptionClass}`}
            >
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Game-style ATS level */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.55,
          }}
          className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-[1px] shadow-lg shadow-indigo-500/15"
        >
          <div
            className={`relative overflow-hidden rounded-[15px] p-5 ${
              isNightMode
                ? "bg-slate-950/90"
                : "bg-white/95"
            }`}
          >
            <motion.div
              animate={{
                x: ["-100%", "150%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 1.5,
              }}
              className="pointer-events-none absolute inset-y-0 w-20 rotate-12 bg-gradient-to-r from-transparent via-indigo-400/15 to-transparent"
            />

            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                    rotate: [0, -4, 4, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                  className="rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 p-3 text-white shadow-lg"
                >
                  {level === 4 ? (
                    <Trophy size={22} />
                  ) : (
                    <Gamepad2 size={22} />
                  )}
                </motion.div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-500">
                    ATS Quest
                  </p>

                  <h3
                    className={`font-black ${headingClass}`}
                  >
                    Career Level {level}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 font-black text-amber-700">
                <Zap
                  size={15}
                  fill="currentColor"
                />
                {score} XP
              </div>
            </div>

            <div className="relative mt-5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={mutedClass}>
                  Level progress
                </span>

                <span className="text-indigo-500">
                  {score}/100
                </span>
              </div>

              <div
                className={`mt-2 h-3 overflow-hidden rounded-full ${
                  isNightMode
                    ? "bg-slate-700"
                    : "bg-slate-200"
                }`}
              >
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${score}%`,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.4,
                  }}
                  className="relative h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                >
                  <motion.span
                    animate={{
                      x: ["-100%", "300%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  />
                </motion.div>
              </div>

              <p
                className={`mt-3 text-center text-xs font-semibold ${descriptionClass}`}
              >
                {score >= 100
                  ? "Maximum ATS level achieved!"
                  : `${pointsNeeded} more points to reach the ${nextTarget}% milestone`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ATSProgress;