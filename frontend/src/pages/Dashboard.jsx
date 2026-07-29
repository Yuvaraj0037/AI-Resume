import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  GitCompareArrows,
  History,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  Trash2,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../component/DashboardLayout";

import {
  deleteResume,
  getLatestResume,
} from "../services/resumeApi";
import {
  getResumeHistory,
} from "../services/historyApi";
import {
  downloadAnalysisPDF,
} from "../utils/downloadPdf";
import {
  useAuth,
} from "../context/AuthContext";

const ROLE_LABELS = {
  backend: "Backend Developer",
  frontend: "Frontend Developer",
  mlEngineer: "ML Engineer",
  dataScientist: "Data Scientist",
};

function formatDate(date) {
  if (!date) return "Recently";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getScoreColor(score) {
  if (score >= 80) {
    return {
      text: "text-emerald-600",
      gradient:
        "from-emerald-500 to-green-400",
      background: "bg-emerald-100",
    };
  }

  if (score >= 60) {
    return {
      text: "text-blue-600",
      gradient:
        "from-blue-500 to-indigo-500",
      background: "bg-blue-100",
    };
  }

  if (score >= 40) {
    return {
      text: "text-amber-600",
      gradient:
        "from-amber-500 to-orange-400",
      background: "bg-amber-100",
    };
  }

  return {
    text: "text-red-600",
    gradient:
      "from-red-500 to-rose-500",
    background: "bg-red-100",
  };
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  delay,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
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
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={22} />
        </div>

        <Sparkles
          size={16}
          className="text-slate-300"
        />
      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </motion.div>
  );
}

function ScoreCard({
  title,
  score,
  icon: Icon,
  delay,
}) {
  const color =
    getScoreColor(score);

  const circumference =
    2 * Math.PI * 47;

  const offset =
    circumference -
    (score / 100) * circumference;

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
      className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            Latest analysis
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${color.background} ${color.text}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="relative mx-auto mt-6 h-32 w-32">
        <svg className="h-full w-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="47"
            fill="transparent"
            stroke="rgba(148,163,184,0.22)"
            strokeWidth="11"
          />

          <motion.circle
            cx="64"
            cy="64"
            r="47"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={
              circumference
            }
            initial={{
              strokeDashoffset:
                circumference,
            }}
            animate={{
              strokeDashoffset:
                offset,
            }}
            transition={{
              duration: 1.1,
              delay,
            }}
            className={color.text}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-black text-slate-950">
            {score}%
          </p>

          <span className="text-xs font-bold text-slate-500">
            Score
          </span>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${score}%`,
          }}
          transition={{
            duration: 0.9,
            delay,
          }}
          className={`h-full rounded-full bg-gradient-to-r ${color.gradient}`}
        />
      </div>
    </motion.div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className="rounded-2xl bg-white/90 p-5 text-left shadow-sm backdrop-blur-xl"
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={20} />
      </div>

      <h3 className="mt-4 font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-indigo-600">
        Open
        <ArrowRight size={16} />
      </div>
    </motion.button>
  );
}

function DashboardLoading() {
  const stages = [
    "Loading your resume",
    "Reading ATS scores",
    "Preparing insights",
  ];

  return (
    <DashboardLayout>
      <div className="flex min-h-[72vh] items-center justify-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="liquid-glass w-full max-w-lg rounded-3xl p-8 text-center"
        >
          <div className="liquid-logo mx-auto flex h-20 w-20 items-center justify-center text-white">
            <BrainCircuit
              size={38}
              className="relative z-10"
            />
          </div>

          <h2 className="mt-6 text-2xl font-black text-slate-950">
            Preparing your dashboard
          </h2>

          <p className="mt-2 text-slate-600">
            Organizing your latest resume
            intelligence.
          </p>

          <div className="mt-7 space-y-3 text-left">
            {stages.map(
              (stage, index) => (
                <motion.div
                  key={stage}
                  initial={{
                    opacity: 0,
                    x: -12,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.18,
                  }}
                  className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3 text-sm font-bold text-indigo-700"
                >
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  {stage}
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resume, setResume] =
    useState(null);

  const [analysis, setAnalysis] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [
        latestResult,
        historyResult,
      ] = await Promise.allSettled([
        getLatestResume(),
        getResumeHistory(),
      ]);

      let latestResume = null;
      let historyData = [];

      if (
        historyResult.status ===
        "fulfilled"
      ) {
        historyData = Array.isArray(
          historyResult.value
        )
          ? historyResult.value
          : historyResult.value
              ?.resumes || [];

        setHistory(historyData);
      } else {
        console.error(
          "History load failed:",
          historyResult.reason
        );

        setHistory([]);
      }

      if (
        latestResult.status ===
        "fulfilled"
      ) {
        latestResume =
          latestResult.value;
      } else if (
        historyData.length > 0
      ) {
        latestResume =
          historyData[0];
      }

      if (latestResume?.analysis) {
        setResume(latestResume);

        setAnalysis(
          latestResume.analysis
        );
      } else {
        setResume(null);
        setAnalysis(null);
      }
    } catch (error) {
      console.error(
        "Dashboard load error:",
        error
      );

      toast.error(
        "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const insights = useMemo(() => {
    if (!analysis) {
      return {
        atsScore: 0,
        resumeScore: 0,
        averageJobMatch: 0,
        totalSkills: 0,
        highPriorityMissing: 0,
        bestRole:
          "Not available",
        bestRoleScore: 0,
        topActions: [],
      };
    }

    const atsScore =
      Number(
        analysis.atsScore
      ) || 0;

    const resumeScore =
      Number(
        analysis.resumeScore
      ) || 0;

    const skills =
      analysis.skills || {};

    const allSkills = [
      ...(skills.programming || []),
      ...(skills.ml || []),
      ...(skills.web || []),
      ...(skills.tools || []),
    ].filter(Boolean);

    const uniqueSkills =
      new Set(
        allSkills.map((skill) =>
          String(skill)
            .trim()
            .toLowerCase()
        )
      );

    const missingSkills =
      analysis.missingSkills || [];

    const highPriorityMissing =
      missingSkills.filter(
        (item) =>
          item?.severity === "high"
      ).length;

    const jobEntries =
      Object.entries(
        analysis.jobMatches || {}
      );

    const averageJobMatch =
      jobEntries.length > 0
        ? Math.round(
            jobEntries.reduce(
              (sum, [, value]) =>
                sum +
                (Number(value) ||
                  0),
              0
            ) /
              jobEntries.length
          )
        : Math.round(
            (atsScore +
              resumeScore) /
              2
          );

    const bestJob =
      jobEntries.length > 0
        ? jobEntries.reduce(
            (best, current) =>
              Number(current[1]) >
              Number(best[1])
                ? current
                : best
          )
        : null;

    return {
      atsScore,
      resumeScore,
      averageJobMatch,
      totalSkills:
        uniqueSkills.size,
      highPriorityMissing,

      bestRole: bestJob
        ? ROLE_LABELS[
            bestJob[0]
          ] || bestJob[0]
        : "Not available",

      bestRoleScore: bestJob
        ? Number(bestJob[1]) ||
          0
        : 0,

      topActions: (
        analysis.suggestions || []
      ).slice(0, 3),
    };
  }, [analysis]);

  function openAnalysis(
    selectedResume = resume
  ) {
    if (!selectedResume) return;

    localStorage.setItem(
      "latestResume",
      JSON.stringify(
        selectedResume
      )
    );

    if (
      selectedResume.analysis
    ) {
      localStorage.setItem(
        "analysis",
        JSON.stringify(
          selectedResume.analysis
        )
      );
    }

    navigate("/analysis");
  }

  function downloadReport() {
    if (!analysis) {
      toast.error(
        "No analysis available"
      );

      return;
    }

    downloadAnalysisPDF({
      filename:
        resume?.filename ||
        "resume.pdf",

      analysis,
    });
  }

  async function removeLatestResume() {
    if (!resume?._id) return;

    const confirmed =
      window.confirm(
        "Delete this resume analysis permanently?"
      );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteResume(
        resume._id
      );

      localStorage.removeItem(
        "latestResume"
      );

      localStorage.removeItem(
        "analysis"
      );

      toast.success(
        "Resume analysis deleted"
      );

      await loadDashboard();
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Delete failed"
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <DashboardLoading />;
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[72vh] items-center justify-center">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="liquid-glass max-w-2xl rounded-3xl p-10 text-center"
          >
            <div className="liquid-logo mx-auto flex h-24 w-24 items-center justify-center text-white">
              <Upload
                size={42}
                className="relative z-10"
              />
            </div>

            <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-indigo-600">
              Start your analysis
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
              Upload your first resume
            </h1>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
              Generate ATS scoring, skill
              detection, job-role matching and
              personalized improvement actions.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/upload")
              }
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-4 font-black text-white shadow-lg"
            >
              <Upload size={20} />
              Upload Resume
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const displayName =
    user?.name?.split(" ")[0] ||
    "there";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
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
          <div className="relative z-10 flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
            <div className="flex items-center gap-5">
              <div className="liquid-logo flex h-16 w-16 shrink-0 items-center justify-center text-white">
                <BrainCircuit
                  size={30}
                  className="relative z-10"
                />
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-indigo-600">
                  Career intelligence
                </p>

                <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">
                  Welcome back,{" "}
                  {displayName}
                </h1>

                <p className="mt-2 max-w-2xl text-slate-600">
                  Here is your latest resume
                  performance and highest-impact
                  improvement plan.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/upload")
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-bold text-white shadow-lg"
              >
                <Upload size={18} />
                Upload New
              </button>

              <button
                type="button"
                onClick={() =>
                  openAnalysis()
                }
                className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/80 px-5 py-3 font-bold text-indigo-600"
              >
                <Gauge size={18} />
                View Analysis
              </button>

              <button
                type="button"
                onClick={downloadReport}
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 font-bold text-emerald-700"
              >
                <Download size={18} />
                Download
              </button>

              <button
                type="button"
                onClick={
                  removeLatestResume
                }
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-600 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={18} />
                )}

                Delete
              </button>
            </div>
          </div>
        </motion.header>

        <section className="grid gap-5 md:grid-cols-3">
          <ScoreCard
            title="ATS Score"
            score={
              insights.atsScore
            }
            icon={Gauge}
            delay={0.04}
          />

          <ScoreCard
            title="Resume Score"
            score={
              insights.resumeScore
            }
            icon={FileText}
            delay={0.09}
          />

          <ScoreCard
            title="Average Job Match"
            score={
              insights.averageJobMatch
            }
            icon={Target}
            delay={0.14}
          />
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={BriefcaseBusiness}
            label="Best Role"
            value={
              insights.bestRole
            }
            description={`${insights.bestRoleScore}% estimated compatibility.`}
            iconClass="bg-emerald-100 text-emerald-600"
            delay={0.06}
          />

          <MetricCard
            icon={BrainCircuit}
            label="Detected Skills"
            value={
              insights.totalSkills
            }
            description="Unique technical skills identified."
            iconClass="bg-indigo-100 text-indigo-600"
            delay={0.11}
          />

          <MetricCard
            icon={AlertTriangle}
            label="Priority Gaps"
            value={
              insights.highPriorityMissing
            }
            description="High-severity missing skills."
            iconClass="bg-amber-100 text-amber-600"
            delay={0.16}
          />

          <MetricCard
            icon={History}
            label="Saved Versions"
            value={history.length}
            description="Resumes available in your history."
            iconClass="bg-violet-100 text-violet-600"
            delay={0.21}
          />
        </section>

        {insights.topActions.length >
          0 && (
          <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/15 p-3">
                <Zap size={22} />
              </div>

              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-100">
                  Priority action plan
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Improve these first
                </h2>

                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {insights.topActions.map(
                    (
                      action,
                      index
                    ) => (
                      <motion.div
                        key={`${action}-${index}`}
                        whileHover={{
                          y: -3,
                        }}
                        className="flex gap-3 rounded-xl bg-white/10 p-4 backdrop-blur"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-black text-indigo-600">
                          {index + 1}
                        </span>

                        <p className="text-sm font-semibold leading-6">
                          {action}
                        </p>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">
              Resume tools
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Continue improving
            </h2>

            <p className="mt-1 text-slate-600">
              Use your saved analysis for the
              next career action.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickAction
              icon={WandSparkles}
              title="Improve Resume"
              description="Generate better summary and project wording."
              color="bg-violet-100 text-violet-600"
              onClick={() =>
                navigate(
                  "/resume-improve"
                )
              }
            />

            <QuickAction
              icon={Target}
              title="Job Match"
              description="Compare your resume with a job description."
              color="bg-emerald-100 text-emerald-600"
              onClick={() =>
                navigate(
                  "/job-match"
                )
              }
            />

            <QuickAction
              icon={GitCompareArrows}
              title="Compare Versions"
              description="Track score and skill changes between resumes."
              color="bg-blue-100 text-blue-600"
              onClick={() =>
                navigate("/compare")
              }
            />

            <QuickAction
              icon={History}
              title="Resume History"
              description="Open previous analyses and reports."
              color="bg-amber-100 text-amber-600"
              onClick={() =>
                navigate("/history")
              }
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
                  Missing skills
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Priority skill gaps
                </h2>
              </div>

              <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                <AlertTriangle size={21} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(analysis.missingSkills ||
                [])
                .slice(0, 5)
                .map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.skill}-${index}`}
                      className="flex items-start justify-between gap-4 rounded-xl bg-amber-50 p-4"
                    >
                      <div>
                        <p className="font-black text-slate-900">
                          {item.skill}
                        </p>

                        {item.reason && (
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {item.reason}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                          item.severity ===
                          "high"
                            ? "bg-red-100 text-red-700"
                            : item.severity ===
                                "low"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.severity ||
                          "medium"}
                      </span>
                    </div>
                  )
                )}

              {(analysis.missingSkills ||
                []).length === 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700">
                  <CheckCircle2 size={20} />
                  No major missing skills were
                  identified.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-violet-600">
                  AI recommendations
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Suggested improvements
                </h2>
              </div>

              <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
                <Lightbulb size={21} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(analysis.suggestions ||
                [])
                .slice(0, 5)
                .map(
                  (
                    suggestion,
                    index
                  ) => (
                    <div
                      key={`${suggestion}-${index}`}
                      className="flex gap-3 rounded-xl bg-violet-50 p-4"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white">
                        {index + 1}
                      </span>

                      <p className="text-sm font-semibold leading-6 text-slate-700">
                        {suggestion}
                      </p>
                    </div>
                  )
                )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
                Recent resume versions
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Resume history
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/history")
              }
              className="flex items-center gap-2 font-bold text-indigo-600"
            >
              View all
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history
              .slice(0, 3)
              .map(
                (
                  item,
                  index
                ) => (
                  <motion.button
                    type="button"
                    key={
                      item._id ||
                      index
                    }
                    whileHover={{
                      y: -3,
                    }}
                    onClick={() =>
                      openAnalysis(
                        item
                      )
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-indigo-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                        <FileText
                          size={21}
                        />
                      </div>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
                        {Number(
                          item.analysis
                            ?.atsScore
                        ) || 0}
                        %
                      </span>
                    </div>

                    <p className="mt-4 truncate font-black text-slate-950">
                      {item.filename ||
                        "resume.pdf"}
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      {formatDate(
                        item.createdAt
                      )}
                    </p>
                  </motion.button>
                )
              )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;