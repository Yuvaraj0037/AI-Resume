import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GitCompareArrows,
  Lightbulb,
  Loader2,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../component/DashboardLayout";
import {
  compareResumes,
  getComparisonResumes,
} from "../services/comparisonApi";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function DeltaBadge({ value, suffix = "" }) {
  const numericValue = Number(value) || 0;

  if (numericValue > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
        <TrendingUp size={15} />
        +{numericValue}
        {suffix}
      </span>
    );
  }

  if (numericValue < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
        <TrendingDown size={15} />
        {numericValue}
        {suffix}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
      <Minus size={15} />
      No change
    </span>
  );
}

function ScoreCard({
  title,
  baseline,
  current,
  delta,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-slate-900">
          {title}
        </h3>

        <DeltaBadge value={delta} />
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Baseline
          </p>

          <p className="mt-1 text-3xl font-black text-slate-500">
            {baseline}
          </p>
        </div>

        <ArrowRight className="mb-2 text-indigo-400" />

        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
            Current
          </p>

          <p className="mt-1 text-4xl font-black text-indigo-600">
            {current}
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min(
              100,
              Math.max(0, current)
            )}%`,
          }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
        />
      </div>
    </motion.div>
  );
}

function SkillList({
  title,
  skills,
  type,
}) {
  const styles = {
    gained: {
      icon: Plus,
      wrapper: "bg-emerald-50",
      iconColor: "text-emerald-600",
      badge:
        "border-emerald-200 bg-emerald-100 text-emerald-700",
    },
    removed: {
      icon: Minus,
      wrapper: "bg-red-50",
      iconColor: "text-red-600",
      badge:
        "border-red-200 bg-red-100 text-red-700",
    },
    unchanged: {
      icon: CheckCircle2,
      wrapper: "bg-indigo-50",
      iconColor: "text-indigo-600",
      badge:
        "border-indigo-200 bg-indigo-100 text-indigo-700",
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`rounded-2xl p-5 ${style.wrapper}`}>
      <div className="flex items-center gap-2">
        <Icon
          size={19}
          className={style.iconColor}
        />

        <h3 className="font-bold text-slate-900">
          {title}
        </h3>

        <span className="ml-auto text-sm font-bold text-slate-500">
          {skills.length}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <span
              key={skill}
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${style.badge}`}
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No skills in this category.
          </p>
        )}
      </div>
    </div>
  );
}

function ResumeComparison() {
  const [resumes, setResumes] = useState([]);
  const [baselineId, setBaselineId] = useState("");
  const [currentId, setCurrentId] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loadingHistory, setLoadingHistory] =
    useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    async function loadResumes() {
      try {
        const data = await getComparisonResumes();

        setResumes(data);

        if (data.length >= 2) {
          // History is newest first.
          setCurrentId(data[0]._id);
          setBaselineId(data[1]._id);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load resume history"
        );
      } finally {
        setLoadingHistory(false);
      }
    }

    loadResumes();
  }, []);

  const canCompare = useMemo(
    () =>
      baselineId &&
      currentId &&
      baselineId !== currentId,
    [baselineId, currentId]
  );

  async function handleCompare() {
    if (!canCompare) {
      toast.error("Select two different resumes");
      return;
    }

    try {
      setComparing(true);

      const data = await compareResumes(
        baselineId,
        currentId
      );

      setComparison(data);
      toast.success("Resume comparison completed");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Comparison failed"
      );
    } finally {
      setComparing(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-3xl p-7"
        >
          <div className="relative z-10 flex items-center gap-5">
            <div className="liquid-logo flex h-16 w-16 items-center justify-center text-white">
              <GitCompareArrows
                size={30}
                className="relative z-10"
              />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
                Progress tracker
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-900">
                Resume Comparison
              </h1>

              <p className="mt-2 text-slate-500">
                Compare two saved resume analyses without using
                additional Gemini quota.
              </p>
            </div>
          </div>
        </motion.header>

        <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm">
          {loadingHistory ? (
            <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
              <Loader2 className="animate-spin" />
              Loading saved resumes...
            </div>
          ) : resumes.length < 2 ? (
            <div className="py-10 text-center">
              <FileText
                size={42}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Two resumes are required
              </h2>

              <p className="mt-2 text-slate-500">
                Upload and analyze at least two resume versions
                before comparing them.
              </p>
            </div>
          ) : (
            <>
              <div className="grid items-end gap-5 lg:grid-cols-[1fr_auto_1fr_auto]">
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Baseline resume
                  </span>

                  <select
                    value={baselineId}
                    onChange={(event) => {
                      setBaselineId(event.target.value);
                      setComparison(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                  >
                    {resumes.map((resume) => (
                      <option
                        key={resume._id}
                        value={resume._id}
                      >
                        {resume.filename} —{" "}
                        {formatDate(resume.createdAt)}
                      </option>
                    ))}
                  </select>
                </label>

                <ArrowRight className="mb-3 hidden text-indigo-500 lg:block" />

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Current resume
                  </span>

                  <select
                    value={currentId}
                    onChange={(event) => {
                      setCurrentId(event.target.value);
                      setComparison(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                  >
                    {resumes.map((resume) => (
                      <option
                        key={resume._id}
                        value={resume._id}
                      >
                        {resume.filename} —{" "}
                        {formatDate(resume.createdAt)}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  disabled={!canCompare || comparing}
                  onClick={handleCompare}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {comparing ? (
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <GitCompareArrows size={19} />
                  )}

                  {comparing ? "Comparing..." : "Compare"}
                </button>
              </div>

              {baselineId === currentId && (
                <p className="mt-3 text-sm font-semibold text-red-500">
                  Choose two different resume versions.
                </p>
              )}
            </>
          )}
        </section>

        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-7 space-y-7"
          >
            <section className="grid gap-5 md:grid-cols-2">
              <ScoreCard
                title="ATS Score"
                baseline={comparison.baseline.atsScore}
                current={comparison.current.atsScore}
                delta={comparison.comparison.atsDelta}
              />

              <ScoreCard
                title="Resume Score"
                baseline={
                  comparison.baseline.resumeScore
                }
                current={comparison.current.resumeScore}
                delta={
                  comparison.comparison.resumeScoreDelta
                }
              />
            </section>

            <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <Lightbulb className="mt-1 shrink-0" />

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-indigo-200">
                    Comparison verdict
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    {comparison.comparison.verdict}
                  </h2>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Skills change
              </h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <SkillList
                  title="Skills gained"
                  skills={
                    comparison.comparison.gainedSkills
                  }
                  type="gained"
                />

                <SkillList
                  title="Skills removed"
                  skills={
                    comparison.comparison.removedSkills
                  }
                  type="removed"
                />

                <SkillList
                  title="Unchanged skills"
                  skills={
                    comparison.comparison.unchangedSkills
                  }
                  type="unchanged"
                />
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Job match changes
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Object.entries(
                  comparison.comparison.jobMatchChanges
                ).map(([role, scores]) => (
                  <div
                    key={role}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <p className="font-bold capitalize text-slate-900">
                      {role
                        .replace("mlEngineer", "ML Engineer")
                        .replace(
                          "dataScientist",
                          "Data Scientist"
                        )}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-slate-500">
                        {scores.baseline} →{" "}
                        <strong className="text-indigo-600">
                          {scores.current}
                        </strong>
                      </span>

                      <DeltaBadge
                        value={scores.delta}
                        suffix="%"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Recommended next improvements
              </h2>

              <div className="mt-5 space-y-3">
                {comparison.comparison.recommendations
                  .slice(0, 6)
                  .map((suggestion, index) => (
                    <div
                      key={`${suggestion}-${index}`}
                      className="flex gap-3 rounded-xl bg-indigo-50 p-4"
                    >
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-indigo-600"
                      />

                      <p className="text-sm font-medium text-slate-700">
                        {suggestion}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ResumeComparison;