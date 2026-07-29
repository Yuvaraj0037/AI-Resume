import { motion } from "framer-motion";
import {
  Clock,
  FileCheck,
  Sparkles,
  Target,
  UploadCloud,
} from "lucide-react";

import {
  useAppearance,
} from "../../context/AppearanceContext";

function ActivityTimeline({
  activities = [],
}) {
  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isNightMode =
    theme === "dark" || sleepMode;

  const fallbackActivities = [
    {
      title: "Resume Uploaded",
      description:
        "Your latest resume was uploaded successfully.",
      time: "Recently",
      type: "upload",
    },
    {
      title: "ATS Analysis Completed",
      description:
        "AI generated your resume score and missing skills.",
      time: "Recently",
      type: "analysis",
    },
    {
      title: "AI Suggestions Ready",
      description:
        "Personalized improvement tips are available.",
      time: "Recently",
      type: "suggestion",
    },
  ];

  const data =
    activities.length > 0
      ? activities
      : fallbackActivities;

  function getIcon(type) {
    if (type === "upload") {
      return <UploadCloud size={20} />;
    }

    if (type === "analysis") {
      return <FileCheck size={20} />;
    }

    if (type === "match") {
      return <Target size={20} />;
    }

    return <Sparkles size={20} />;
  }

  const containerClass = sleepMode
    ? "border-amber-400/15 bg-[#2b2518]/92"
    : isNightMode
      ? "border-slate-700/60 bg-slate-900/85"
      : "border-slate-200 bg-white/95";

  const itemClass = sleepMode
    ? "border-amber-400/10 bg-[#37301f] hover:bg-[#413824]"
    : isNightMode
      ? "border-slate-700 bg-slate-800/85 hover:bg-slate-800"
      : "border-slate-200 bg-slate-50 hover:bg-indigo-50/60";

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
      className={`rounded-3xl border p-6 shadow-sm backdrop-blur-xl sm:p-8 ${containerClass}`}
    >
      <div className="mb-8 flex items-center justify-between gap-5">
        <div>
          <h2
            className={`text-2xl font-black ${headingClass}`}
          >
            Recent Activity
          </h2>

          <p
            className={`mt-1 font-medium ${descriptionClass}`}
          >
            Your latest resume actions and AI events.
          </p>
        </div>

        <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
          <Clock />
        </div>
      </div>

      <div className="relative space-y-6">
        <div
          className={`absolute bottom-4 left-6 top-4 w-px ${
            isNightMode
              ? "bg-slate-600"
              : "bg-slate-200"
          }`}
        />

        {data.map((item, index) => (
          <motion.div
            key={`${item.title}-${index}`}
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: index * 0.1,
            }}
            className="relative flex gap-5"
          >
            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-100 text-indigo-600 shadow-sm">
              {getIcon(item.type)}
            </div>

            <div
              className={`min-w-0 flex-1 rounded-2xl border p-5 transition ${itemClass}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3
                  className={`text-lg font-bold ${headingClass}`}
                >
                  {item.title || "Activity"}
                </h3>

                <span
                  className={`text-xs font-semibold ${mutedClass}`}
                >
                  {item.time ||
                    (item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "Recently")}
                </span>
              </div>

              <p
                className={`mt-2 leading-6 ${descriptionClass}`}
              >
                {item.description ||
                  "Resume activity recorded."}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default ActivityTimeline;