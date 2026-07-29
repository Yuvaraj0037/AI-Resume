import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  BarChart3,
  Calendar,
  Download,
  Eye,
  FileText,
  GitCompareArrows,
  History as HistoryIcon,
  Trophy,
  Trash2,
  Upload,
} from "lucide-react";

import DashboardLayout from "../component/DashboardLayout";
import {
  getResumeHistory,
} from "../services/historyApi";
import {
  deleteResume,
} from "../services/resumeApi";
import {
  downloadAnalysisPDF,
} from "../utils/downloadPdf";

function formatDate(date) {
  if (!date) return "Recently";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function ScoreBadge({ score, color }) {
  const styles =
    color === "emerald"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-indigo-100 text-indigo-700";

  return (
    <div className="flex items-center gap-3">
      <span
        className={`min-w-16 rounded-xl px-3 py-2 text-center font-black ${styles}`}
      >
        {score}%
      </span>

      <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-slate-100 xl:block">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min(
              100,
              Math.max(0, score)
            )}%`,
          }}
          transition={{
            duration: 0.7,
          }}
          className={`h-full rounded-full ${
            color === "emerald"
              ? "bg-emerald-500"
              : "bg-indigo-500"
          }`}
        />
      </div>
    </div>
  );
}

function HistoryStat({
  title,
  value,
  icon: Icon,
  iconClass,
  delay,
}) {
  return (
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
        delay,
      }}
      whileHover={{
        y: -5,
      }}
      className="rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur-xl"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={22} />
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 truncate text-2xl font-black text-slate-900">
        {value}
      </p>
    </motion.div>
  );
}

function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState(null);

  async function fetchHistory() {
    try {
      setLoading(true);

      const data = await getResumeHistory();

      setHistory(
        Array.isArray(data)
          ? data
          : data.resumes || []
      );
    } catch (error) {
      console.error(
        "Failed to load resume history:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

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

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume analysis?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteResume(id);

      setHistory((current) =>
        current.filter(
          (resume) => resume._id !== id
        )
      );
    } catch (error) {
      window.alert(
        error.response?.data?.message ||
          "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  }

  const statistics = useMemo(() => {
    const totalResumes = history.length;

    const highestATS =
      totalResumes > 0
        ? Math.max(
            ...history.map(
              (item) =>
                Number(
                  item.analysis?.atsScore
                ) || 0
            )
          )
        : 0;

    const averageResumeScore =
      totalResumes > 0
        ? Math.round(
            history.reduce(
              (total, item) =>
                total +
                (Number(
                  item.analysis?.resumeScore
                ) || 0),
              0
            ) / totalResumes
          )
        : 0;

    return {
      totalResumes,
      highestATS,
      averageResumeScore,
      latestUpload: history[0]?.createdAt
        ? formatDate(history[0].createdAt)
        : "N/A",
    };
  }, [history]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl animate-pulse space-y-7">
          <div className="h-44 rounded-3xl bg-white/50" />

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 rounded-2xl bg-white/50"
              />
            ))}
          </div>

          <div className="h-96 rounded-3xl bg-white/50" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-7">
        <motion.header
          initial={{
            opacity: 0,
            y: -18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="liquid-glass rounded-3xl p-6 sm:p-8"
        >
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-5">
              <div className="liquid-logo flex h-16 w-16 shrink-0 items-center justify-center text-white">
                <HistoryIcon
                  size={30}
                  className="relative z-10"
                />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Analysis archive
                </p>

                <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
                  Resume History
                </h1>

                <p className="mt-2 text-slate-500">
                  Review, compare, download or remove
                  previous resume analyses.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {history.length >= 2 && (
                <Link
                  to="/compare"
                  className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/70 px-5 py-3 font-bold text-indigo-600 backdrop-blur transition hover:bg-indigo-50"
                >
                  <GitCompareArrows size={19} />
                  Compare
                </Link>
              )}

              <Link
                to="/upload"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
              >
                <Upload size={19} />
                Upload Resume
              </Link>
            </div>
          </div>
        </motion.header>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <HistoryStat
            title="Total Resumes"
            value={statistics.totalResumes}
            icon={FileText}
            iconClass="bg-indigo-100 text-indigo-600"
            delay={0.04}
          />

          <HistoryStat
            title="Highest ATS"
            value={`${statistics.highestATS}%`}
            icon={Trophy}
            iconClass="bg-emerald-100 text-emerald-600"
            delay={0.08}
          />

          <HistoryStat
            title="Average Resume Score"
            value={`${statistics.averageResumeScore}%`}
            icon={BarChart3}
            iconClass="bg-violet-100 text-violet-600"
            delay={0.12}
          />

          <HistoryStat
            title="Latest Upload"
            value={statistics.latestUpload}
            icon={Calendar}
            iconClass="bg-amber-100 text-amber-600"
            delay={0.16}
          />
        </section>

        {history.length === 0 ? (
          <motion.section
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-3xl bg-white/90 px-6 py-16 text-center shadow-sm backdrop-blur-xl"
          >
            <div className="liquid-logo mx-auto flex h-20 w-20 items-center justify-center text-white">
              <FileText
                size={36}
                className="relative z-10"
              />
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900">
              No resume history yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              Upload and analyze your first resume to
              begin tracking improvements.
            </p>

            <Link
              to="/upload"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
            >
              <Upload size={19} />
              Upload Resume
            </Link>
          </motion.section>
        ) : (
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="overflow-hidden rounded-3xl bg-white/90 shadow-sm backdrop-blur-xl"
          >
            <div className="border-b border-slate-200/70 px-6 py-5">
              <h2 className="text-xl font-black text-slate-900">
                Saved analyses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {history.length} resume version
                {history.length === 1 ? "" : "s"} available
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/70 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">
                      Resume
                    </th>

                    <th className="px-6 py-4">
                      ATS Score
                    </th>

                    <th className="px-6 py-4">
                      Resume Score
                    </th>

                    <th className="px-6 py-4">
                      Uploaded
                    </th>

                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence initial={false}>
                    {history.map(
                      (resume, index) => {
                        const atsScore =
                          Number(
                            resume.analysis
                              ?.atsScore
                          ) || 0;

                        const resumeScore =
                          Number(
                            resume.analysis
                              ?.resumeScore
                          ) || 0;

                        const deleting =
                          deletingId ===
                          resume._id;

                        return (
                          <motion.tr
                            key={resume._id}
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            exit={{
                              opacity: 0,
                              x: 20,
                            }}
                            transition={{
                              delay:
                                index * 0.035,
                            }}
                            className="border-b border-slate-100 transition last:border-0 hover:bg-indigo-50/40"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                  <FileText
                                    size={21}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-64 truncate font-bold text-slate-900">
                                    {resume.filename ||
                                      "resume.pdf"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Analysis complete
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <ScoreBadge
                                score={atsScore}
                                color="emerald"
                              />
                            </td>

                            <td className="px-6 py-5">
                              <ScoreBadge
                                score={
                                  resumeScore
                                }
                                color="indigo"
                              />
                            </td>

                            <td className="px-6 py-5 text-sm font-medium text-slate-500">
                              {formatDate(
                                resume.createdAt
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                <motion.button
                                  type="button"
                                  whileHover={{
                                    y: -2,
                                  }}
                                  whileTap={{
                                    scale: 0.95,
                                  }}
                                  onClick={() =>
                                    handleView(
                                      resume
                                    )
                                  }
                                  title="View analysis"
                                  className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                                >
                                  <Eye
                                    size={18}
                                  />
                                </motion.button>

                                <motion.button
                                  type="button"
                                  whileHover={{
                                    y: -2,
                                  }}
                                  whileTap={{
                                    scale: 0.95,
                                  }}
                                  onClick={() =>
                                    handleDownload(
                                      resume
                                    )
                                  }
                                  title="Download report"
                                  className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
                                >
                                  <Download
                                    size={18}
                                  />
                                </motion.button>

                                <motion.button
                                  type="button"
                                  disabled={
                                    deleting
                                  }
                                  whileHover={
                                    deleting
                                      ? undefined
                                      : {
                                          y: -2,
                                        }
                                  }
                                  whileTap={
                                    deleting
                                      ? undefined
                                      : {
                                          scale:
                                            0.95,
                                        }
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      resume._id
                                    )
                                  }
                                  title="Delete analysis"
                                  className="rounded-xl bg-red-100 p-2.5 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Trash2
                                    size={18}
                                    className={
                                      deleting
                                        ? "animate-pulse"
                                        : ""
                                    }
                                  />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      }
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.section>
        )}
      </div>
    </DashboardLayout>
  );
}

export default History;