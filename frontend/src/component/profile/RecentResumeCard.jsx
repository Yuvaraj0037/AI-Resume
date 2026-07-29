import { motion } from "framer-motion";
import {
  Calendar,
  Download,
  Eye,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  downloadAnalysisPDF,
} from "../../utils/downloadPdf";
import {
  useAppearance,
} from "../../context/AppearanceContext";

function RecentResumeCard({
  resumes = [],
}) {
  const navigate = useNavigate();

  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isNightMode =
    theme === "dark" || sleepMode;

  function handleView(resume) {
    localStorage.setItem(
      "latestResume",
      JSON.stringify(resume)
    );

    navigate("/analysis");
  }

  function handleDownload(resume) {
    downloadAnalysisPDF({
      filename:
        resume.filename || "resume.pdf",
      analysis: resume.analysis,
    });
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
            Recent Resumes
          </h2>

          <p
            className={`mt-1 font-medium ${descriptionClass}`}
          >
            Your latest uploaded resume analyses.
          </p>
        </div>

        <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
          <FileText />
        </div>
      </div>

      {resumes.length === 0 ? (
        <div
          className={`rounded-2xl border py-10 text-center ${itemClass}`}
        >
          <FileText
            className="mx-auto text-indigo-400"
            size={44}
          />

          <h3
            className={`mt-4 text-xl font-bold ${headingClass}`}
          >
            No recent resumes
          </h3>

          <p
            className={`mt-2 ${descriptionClass}`}
          >
            Upload a resume to see your recent
            analyses here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/upload")}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
          >
            Upload Resume
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes
            .slice(0, 4)
            .map((resume, index) => {
              const atsScore =
                Number(
                  resume.analysis?.atsScore
                ) || 0;

              const resumeScore =
                Number(
                  resume.analysis?.resumeScore
                ) || 0;

              return (
                <motion.div
                  key={
                    resume._id ||
                    `${resume.filename}-${index}`
                  }
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
                  whileHover={{
                    y: -2,
                  }}
                  className={`rounded-2xl border p-5 transition ${itemClass}`}
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                        <FileText size={25} />
                      </div>

                      <div className="min-w-0">
                        <h3
                          className={`max-w-64 truncate text-lg font-bold ${headingClass}`}
                        >
                          {resume.filename ||
                            "resume.pdf"}
                        </h3>

                        <div
                          className={`mt-1 flex items-center gap-2 text-sm font-medium ${mutedClass}`}
                        >
                          <Calendar size={15} />

                          {resume.createdAt
                            ? new Date(
                                resume.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "Recently"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100 px-4 py-2 font-bold text-emerald-700">
                        <TrendingUp size={16} />
                        ATS {atsScore}%
                      </span>

                      <span className="rounded-xl border border-blue-200 bg-blue-100 px-4 py-2 font-bold text-blue-700">
                        Score {resumeScore}%
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleView(resume)
                        }
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white transition hover:bg-indigo-700"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(resume)
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-bold transition ${
                          isNightMode
                            ? "border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Download size={16} />
                        Export
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}
    </motion.div>
  );
}

export default RecentResumeCard;