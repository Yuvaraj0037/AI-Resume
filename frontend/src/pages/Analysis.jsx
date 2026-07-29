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
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  GitCompareArrows,
  KeyRound,
  Lightbulb,
  Loader2,
  PencilLine,
  Sparkles,
  Target,
  Trash2,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../component/DashboardLayout";
import AnalysisHeader from "../component/AnalysisHeader";
import SummaryCard from "../component/SummaryCard";
import SkillsCard from "../component/SkillsCard";
import MissingSkillsCard from "../component/MissingSkillsCard";
import JobMatchCard from "../component/JobMatchCard";
import StrengthCard from "../component/StrengthCard";
import WeaknessCard from "../component/WeaknessCard";
import SuggestionCard from "../component/SuggestionCard";

import {
  deleteResume,
  getLatestResume,
} from "../services/resumeApi";
import {
  downloadAnalysisPDF,
} from "../utils/downloadPdf";

const ROLE_LABELS = {
  backend: "Backend Developer",
  frontend: "Frontend Developer",
  mlEngineer: "ML Engineer",
  dataScientist: "Data Scientist",
};

const SECTION_LABELS = {
  summary: "Professional Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  atsFormatting: "ATS Formatting",
};

function getScoreColor(score) {
  if (score >= 80) {
    return "from-emerald-500 to-green-400";
  }

  if (score >= 60) {
    return "from-blue-500 to-indigo-500";
  }

  if (score >= 40) {
    return "from-amber-500 to-orange-400";
  }

  return "from-red-500 to-rose-500";
}

function InsightCard({
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
        y: -4,
      }}
      className="rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
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

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
        <Icon size={21} />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionScoreCard({
  scores = {},
}) {
  const entries = Object.entries(
    SECTION_LABELS
  );

  return (
    <div className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl">
      <div className="space-y-5">
        {entries.map(
          ([key, label], index) => {
            const score =
              Number(scores[key]) || 0;

            return (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="font-bold text-slate-700">
                    {label}
                  </span>

                  <span className="font-black text-slate-950">
                    {score}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${Math.min(
                        100,
                        Math.max(0, score)
                      )}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay:
                        index * 0.08,
                    }}
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(
                      score
                    )}`}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function KeywordCard({
  keywordAnalysis = {},
}) {
  const matched =
    keywordAnalysis.matched || [];

  const missing =
    keywordAnalysis.missing || [];

  const coverageScore =
    Number(
      keywordAnalysis.coverageScore
    ) || 0;

  return (
    <div className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-950">
            Keyword Coverage
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Important ATS keywords detected in
            your resume.
          </p>
        </div>

        <div className="rounded-2xl bg-indigo-100 px-5 py-3 text-center">
          <p className="text-2xl font-black text-indigo-700">
            {coverageScore}%
          </p>

          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
            Coverage
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-emerald-50 p-5">
          <h4 className="flex items-center gap-2 font-black text-emerald-800">
            <CheckCircle2 size={19} />
            Matched Keywords
          </h4>

          <div className="mt-4 flex flex-wrap gap-2">
            {matched.length > 0 ? (
              matched.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-700"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-sm text-emerald-700">
                No matched keywords were
                identified.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 p-5">
          <h4 className="flex items-center gap-2 font-black text-amber-800">
            <AlertTriangle size={19} />
            Missing Keywords
          </h4>

          <div className="mt-4 flex flex-wrap gap-2">
            {missing.length > 0 ? (
              missing.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-sm text-amber-700">
                No important missing keywords
                were identified.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImprovementPlan({
  items = [],
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item, index) => (
        <motion.article
          key={`${item.section}-${index}`}
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay:
              index * 0.08,
          }}
          className="rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-black text-white">
              {item.priority ||
                index + 1}
            </span>

            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-violet-700">
              {item.section ||
                "Resume"}
            </span>
          </div>

          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-wider text-red-500">
              Problem
            </p>

            <p className="mt-1 font-bold leading-6 text-slate-800">
              {item.problem ||
                "Improvement required"}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
              Recommended Action
            </p>

            <p className="mt-1 leading-6 text-slate-700">
              {item.action ||
                "Review and improve this section."}
            </p>
          </div>

          {item.expectedImpact && (
            <div className="mt-5 rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                Expected Impact
              </p>

              <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800">
                {item.expectedImpact}
              </p>
            </div>
          )}
        </motion.article>
      ))}
    </div>
  );
}

function FormattingIssues({
  issues = [],
}) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {issues.map((item, index) => {
        const severity =
          item.severity || "medium";

        const severityClass =
          severity === "high"
            ? "bg-red-100 text-red-700"
            : severity === "low"
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700";

        return (
          <motion.div
            key={`${item.issue}-${index}`}
            initial={{
              opacity: 0,
              x: -15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay:
                index * 0.07,
            }}
            className="rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur-xl"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h3 className="font-black text-slate-950">
                  {item.issue ||
                    "Formatting issue"}
                </h3>

                <p className="mt-2 leading-6 text-slate-600">
                  {item.fix ||
                    "Review this area and use a standard ATS-friendly format."}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${severityClass}`}
              >
                {severity}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function RewriteExamples({
  rewrites = {},
}) {
  const summary =
    rewrites.professionalSummary || "";

  const bullets =
    rewrites.projectBullets || [];

  if (!summary && bullets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {summary && (
        <div className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-600">
            Improved Professional Summary
          </p>

          <p className="mt-4 whitespace-pre-line text-base font-medium leading-8 text-slate-800">
            {summary}
          </p>
        </div>
      )}

      {bullets.map((bullet, index) => (
        <div
          key={`${bullet.improved}-${index}`}
          className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl"
        >
          {bullet.original && (
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-red-600">
                Before
              </p>

              <p className="mt-2 leading-6 text-red-800">
                {bullet.original}
              </p>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Improved
            </p>

            <p className="mt-2 font-semibold leading-6 text-emerald-900">
              {bullet.improved ||
                "No rewrite available."}
            </p>
          </div>

          {bullet.reason && (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              <strong className="text-slate-800">
                Why this is better:
              </strong>{" "}
              {bullet.reason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function LoadingAnalysis() {
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
            Preparing your analysis
          </h2>

          <p className="mt-2 text-slate-600">
            Organizing ATS scores, keywords
            and recommendations.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3 rounded-xl bg-indigo-50 p-4 font-bold text-indigo-700">
            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading Gemini insights...
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function Analysis() {
  const navigate = useNavigate();

  const [resume, setResume] =
    useState(null);

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    async function fetchResume() {
      try {
        const cachedResume =
          localStorage.getItem(
            "latestResume"
          );

        if (cachedResume) {
          const parsed =
            JSON.parse(cachedResume);

          if (parsed?.analysis) {
            setResume(parsed);
            setData(
              parsed.analysis
            );

            return;
          }
        }

        const latestResume =
          await getLatestResume();

        setResume(latestResume);

        setData(
          latestResume.analysis
        );
      } catch (error) {
        console.error(
          "Failed to load analysis:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Unable to load resume analysis"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchResume();
  }, []);

  const insights = useMemo(() => {
    if (!data) {
      return {
        totalSkills: 0,
        highPriorityMissing: 0,
        bestRole:
          "Not available",
        bestRoleScore: 0,
        topActions: [],
      };
    }

    const skills =
      data.skills || {};

    const totalSkills = [
      ...(skills.programming || []),
      ...(skills.ml || []),
      ...(skills.web || []),
      ...(skills.tools || []),
    ].filter(Boolean).length;

    const highPriorityMissing = (
      data.missingSkills || []
    ).filter(
      (item) =>
        item?.severity === "high"
    ).length;

    const jobEntries =
      Object.entries(
        data.jobMatches || {}
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
      totalSkills,
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
        data.suggestions || []
      ).slice(0, 3),
    };
  }, [data]);

  function handleDownloadPDF() {
    if (!data) {
      toast.error(
        "No analysis data available"
      );

      return;
    }

    downloadAnalysisPDF({
      filename:
        resume?.filename ||
        "resume.pdf",

      analysis: data,
    });
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "Delete this resume analysis permanently?"
      );

    if (!confirmed) return;

    try {
      setDeleting(true);

      if (resume?._id) {
        await deleteResume(
          resume._id
        );
      }

      localStorage.removeItem(
        "latestResume"
      );

      localStorage.removeItem(
        "analysis"
      );

      toast.success(
        "Resume analysis deleted"
      );

      navigate("/dashboard", {
        replace: true,
      });
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
    return <LoadingAnalysis />;
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="liquid-glass max-w-lg rounded-3xl p-10 text-center">
            <FileText
              size={48}
              className="mx-auto text-indigo-500"
            />

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              No analysis found
            </h2>

            <p className="mt-3 text-slate-600">
              Upload a PDF resume to generate
              your ATS report.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/upload")
              }
              className="mt-7 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white"
            >
              Upload Resume
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const hasSectionScores =
    data.sectionScores &&
    Object.values(
      data.sectionScores
    ).some(
      (score) =>
        Number(score) > 0
    );

  const hasKeywordAnalysis =
    data.keywordAnalysis &&
    (
      data.keywordAnalysis
        .matched?.length > 0 ||
      data.keywordAnalysis
        .missing?.length > 0 ||
      Number(
        data.keywordAnalysis
          .coverageScore
      ) > 0
    );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-9">
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
          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div className="flex items-center gap-5">
              <div className="liquid-logo flex h-16 w-16 shrink-0 items-center justify-center text-white">
                <BrainCircuit
                  size={30}
                  className="relative z-10"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-indigo-600">
                  Gemini ATS Intelligence
                </p>

                <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">
                  Resume Analysis
                </h1>

                <div className="mt-2 flex items-center gap-2 text-slate-600">
                  <FileText
                    size={17}
                    className="shrink-0 text-indigo-500"
                  />

                  <span className="max-w-xl truncate font-semibold">
                    {resume?.filename ||
                      "Latest uploaded resume"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/resume-improve"
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-bold text-white shadow-lg"
              >
                <WandSparkles size={18} />
                Improve
              </button>

              <button
                type="button"
                onClick={
                  handleDownloadPDF
                }
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
              >
                <Download size={18} />
                Download
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
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

        <AnalysisHeader
          ats={
            Number(
              data.atsScore
            ) || 0
          }
          resume={
            Number(
              data.resumeScore
            ) || 0
          }
          filename={
            resume?.filename ||
            "resume.pdf"
          }
        />

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            icon={BrainCircuit}
            label="Detected Skills"
            value={
              insights.totalSkills
            }
            description="Technical skills identified across all categories."
            iconClass="bg-indigo-100 text-indigo-600"
            delay={0.05}
          />

          <InsightCard
            icon={Target}
            label="Best Role Match"
            value={
              insights.bestRole
            }
            description={`${insights.bestRoleScore}% estimated compatibility.`}
            iconClass="bg-emerald-100 text-emerald-600"
            delay={0.1}
          />

          <InsightCard
            icon={AlertTriangle}
            label="Priority Gaps"
            value={
              insights.highPriorityMissing
            }
            description="High-severity missing skills requiring attention."
            iconClass="bg-amber-100 text-amber-600"
            delay={0.15}
          />

          <InsightCard
            icon={Gauge}
            label="AI Confidence"
            value={`${
              Number(
                data.confidenceScore
              ) || 0
            }%`}
            description="Confidence based on the information available in the PDF."
            iconClass="bg-violet-100 text-violet-600"
            delay={0.2}
          />
        </section>

        {data.candidateProfile && (
          <section className="grid gap-4 rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl md:grid-cols-3">
            {[
              {
                label:
                  "Experience Level",
                value:
                  data.candidateProfile
                    .experienceLevel,
              },
              {
                label:
                  "Primary Domain",
                value:
                  data.candidateProfile
                    .primaryDomain,
              },
              {
                label:
                  "Recommended Role",
                value:
                  data.candidateProfile
                    .recommendedRole,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-indigo-50 p-5"
              >
                <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
                  {item.label}
                </p>

                <p className="mt-2 text-lg font-black text-slate-900">
                  {item.value ||
                    "Not identified"}
                </p>
              </div>
            ))}
          </section>
        )}

        {insights.topActions.length >
          0 && (
          <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/15 p-3">
                <Zap size={22} />
              </div>

              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-100">
                  Highest-impact actions
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Improve these first
                </h2>

                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {insights.topActions.map(
                    (
                      action,
                      index
                    ) => (
                      <div
                        key={`${action}-${index}`}
                        className="flex gap-3 rounded-xl bg-white/10 p-4"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white font-black text-indigo-600">
                          {index + 1}
                        </span>

                        <p className="text-sm font-semibold leading-6">
                          {action}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <SectionTitle
            icon={FileText}
            eyebrow="Overview"
            title="Professional Summary"
            description="A concise evaluation of the resume."
          />

          <SummaryCard
            summary={
              data.summary ||
              "No summary available."
            }
          />
        </section>

        {hasSectionScores && (
          <section>
            <SectionTitle
              icon={Gauge}
              eyebrow="Section quality"
              title="Resume Section Scores"
              description="See which sections contribute most to the overall score."
            />

            <SectionScoreCard
              scores={
                data.sectionScores
              }
            />
          </section>
        )}

        <section>
          <SectionTitle
            icon={BrainCircuit}
            eyebrow="Capabilities"
            title="Skills Analysis"
            description="Detected technical skills and important gaps."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <SkillsCard
              skills={
                data.skills || {}
              }
            />

            <MissingSkillsCard
              skills={
                data.missingSkills ||
                []
              }
            />
          </div>
        </section>

        {hasKeywordAnalysis && (
          <section>
            <SectionTitle
              icon={KeyRound}
              eyebrow="ATS keywords"
              title="Keyword Analysis"
              description="Matched and missing terms that affect ATS discoverability."
            />

            <KeywordCard
              keywordAnalysis={
                data.keywordAnalysis
              }
            />
          </section>
        )}

        <section>
          <SectionTitle
            icon={Target}
            eyebrow="Career fit"
            title="Job Match"
            description="Estimated compatibility with common technical roles."
          />

          <JobMatchCard
            matches={
              data.jobMatches || {}
            }
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/job-match"
                )
              }
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
            >
              Match Job Description
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/compare")
              }
              className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/80 px-5 py-3 font-bold text-indigo-600"
            >
              <GitCompareArrows size={18} />
              Compare Resumes
            </button>
          </div>
        </section>

        <section>
          <SectionTitle
            icon={Sparkles}
            eyebrow="Evaluation"
            title="Strengths and Weaknesses"
            description="What works and what requires correction."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <StrengthCard
              strengths={
                data.strengths || []
              }
            />

            <WeaknessCard
              weaknesses={
                data.weaknesses ||
                []
              }
            />
          </div>
        </section>

        {data.improvementPlan?.length >
          0 && (
          <section>
            <SectionTitle
              icon={Lightbulb}
              eyebrow="Priority roadmap"
              title="Improvement Plan"
              description="Ordered actions based on expected resume impact."
            />

            <ImprovementPlan
              items={
                data.improvementPlan
              }
            />
          </section>
        )}

        {data.formattingIssues?.length >
          0 && (
          <section>
            <SectionTitle
              icon={AlertTriangle}
              eyebrow="ATS compatibility"
              title="Formatting Issues"
              description="Potential structural problems detected from extracted text."
            />

            <FormattingIssues
              issues={
                data.formattingIssues
              }
            />
          </section>
        )}

        {(data.rewriteExamples
          ?.professionalSummary ||
          data.rewriteExamples
            ?.projectBullets
            ?.length > 0) && (
          <section>
            <SectionTitle
              icon={PencilLine}
              eyebrow="Rewrite examples"
              title="Suggested Resume Wording"
              description="Evidence-based examples without invented achievements."
            />

            <RewriteExamples
              rewrites={
                data.rewriteExamples
              }
            />
          </section>
        )}

        <section>
          <SectionTitle
            icon={Lightbulb}
            eyebrow="Next steps"
            title="Additional Recommendations"
            description="Practical suggestions generated from the resume."
          />

          <SuggestionCard
            suggestions={
              data.suggestions || []
            }
          />
        </section>

        {data.limitations?.length >
          0 && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-black text-amber-900">
              <AlertTriangle
                size={20}
              />
              Analysis Limitations
            </h2>

            <ul className="mt-4 space-y-2">
              {data.limitations.map(
                (
                  limitation,
                  index
                ) => (
                  <li
                    key={`${limitation}-${index}`}
                    className="flex gap-2 text-sm leading-6 text-amber-800"
                  >
                    <span>•</span>
                    <span>
                      {limitation}
                    </span>
                  </li>
                )
              )}
            </ul>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Analysis;