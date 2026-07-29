import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Copy,
  FilePlus2,
  FileText,
  Import,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import toast from "react-hot-toast";

import DashboardLayout from "../component/DashboardLayout";

import {
  useAppearance,
} from "../context/AppearanceContext";

import {
  createBuilderResume,
  deleteBuilderResume,
  duplicateBuilderResume,
  getBuilderResumes,
  importAnalyzedResume,
} from "../services/resumeBuilderApi";

import {
  getResumeHistory,
} from "../services/historyApi";

const BUILDER_MODE_CLASSES = {
  light:
    "bg-gradient-to-br from-slate-50 via-indigo-50 to-white text-slate-950 [&>section]:border-indigo-100 [&>section]:bg-white/90 [&>section]:text-slate-950 [&_article]:border-indigo-100 [&_article]:bg-white/90 [&_article]:text-slate-950 [&_.resume-builder-modal]:border-indigo-100 [&_.resume-builder-modal]:bg-white [&_.resume-builder-modal]:text-slate-950 [&_.text-slate-300]:text-slate-700 [&_.text-slate-400]:text-slate-600 [&_.text-slate-500]:text-slate-500",

  dark:
    "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white [&_.resume-builder-modal]:border-white/10 [&_.resume-builder-modal]:bg-slate-950 [&_.resume-builder-modal]:text-white",

  sleep:
    "bg-gradient-to-br from-[#17130c] via-[#292014] to-[#17130c] text-orange-50 [&>section]:border-amber-400/10 [&>section]:bg-[#302819]/80 [&>section]:text-orange-50 [&_article]:border-amber-400/10 [&_article]:bg-[#302819]/80 [&_article]:text-orange-50 [&_.resume-builder-modal]:border-amber-400/10 [&_.resume-builder-modal]:bg-[#1d1a12] [&_.resume-builder-modal]:text-orange-50 [&_.text-slate-300]:text-stone-200 [&_.text-slate-400]:text-stone-300 [&_.text-slate-500]:text-stone-400",
};

function ResumeBuilder() {
  const navigate = useNavigate();

  const {
    theme,
    sleepMode,
  } = useAppearance();

  const appearanceMode = sleepMode
    ? "sleep"
    : theme === "dark"
    ? "dark"
    : "light";

  const [resumes, setResumes] =
    useState([]);

  const [
    analyzedResumes,
    setAnalyzedResumes,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [
    importingId,
    setImportingId,
  ] = useState("");

  const [actionId, setActionId] =
    useState("");

  const [
    showImport,
    setShowImport,
  ] = useState(false);

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          builderResult,
          historyResult,
        ] = await Promise.all([
          getBuilderResumes(),
          getResumeHistory(),
        ]);

        setResumes(
          Array.isArray(builderResult)
            ? builderResult
            : builderResult.resumes ||
                []
        );

        setAnalyzedResumes(
          Array.isArray(historyResult)
            ? historyResult
            : historyResult.resumes ||
                []
        );
      } catch (error) {
        console.error(
          "Resume Builder load error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            error.message ||
            "Unable to load resumes"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreate() {
    try {
      setCreating(true);

      const result =
        await createBuilderResume({
          title: "Untitled Resume",
          template: "student-tech",
        });

      const createdResume =
        result.resume || result;

      toast.success(
        "New resume created successfully"
      );

      navigate(
        `/resume-builder/${createdResume._id}`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to create resume"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleImport(
    analysisResumeId
  ) {
    try {
      setImportingId(
        analysisResumeId
      );

      const result =
        await importAnalyzedResume(
          analysisResumeId
        );

      const importedResume =
        result.resume || result;

      toast.success(
        "Analyzed resume imported successfully"
      );

      setShowImport(false);

      navigate(
        `/resume-builder/${importedResume._id}`
      );
    } catch (error) {
      const existingResume =
        error.response?.data?.resume;

      if (
        error.response?.status ===
          409 &&
        existingResume?._id
      ) {
        toast(
          "This resume was already imported"
        );

        navigate(
          `/resume-builder/${existingResume._id}`
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to import resume"
      );
    } finally {
      setImportingId("");
    }
  }

  async function handleDuplicate(
    resumeId
  ) {
    try {
      setActionId(resumeId);

      await duplicateBuilderResume(
        resumeId
      );

      toast.success(
        "Resume duplicated successfully"
      );

      await loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to duplicate resume"
      );
    } finally {
      setActionId("");
    }
  }

  async function handleDelete(
    resumeId,
    title
  ) {
    const confirmed = window.confirm(
      `Delete "${
        title || "Untitled Resume"
      }"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(resumeId);

      await deleteBuilderResume(
        resumeId
      );

      setResumes((current) =>
        current.filter(
          (resume) =>
            resume._id !== resumeId
        )
      );

      toast.success(
        "Resume deleted successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete resume"
      );
    } finally {
      setActionId("");
    }
  }

  return (
    <DashboardLayout>
      <div
        data-builder-mode={
          appearanceMode
        }
        className={`resume-builder-workspace resume-builder-manager min-h-screen rounded-3xl p-5 transition-colors duration-500 sm:p-8 ${BUILDER_MODE_CLASSES[appearanceMode]}`}
      >
        <motion.section
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3 text-indigo-400">
                <Sparkles size={22} />

                <span className="font-semibold">
                  AI Resume Workspace
                </span>
              </div>

              <h1 className="text-3xl font-black sm:text-4xl">
                Resume Builder
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Create, import and manage
                ATS-friendly resumes from
                one workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowImport(true)
                }
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-semibold transition hover:bg-white/20"
              >
                <Import size={19} />
                Import Analysis
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <Loader2
                    className="animate-spin"
                    size={19}
                  />
                ) : (
                  <Plus size={19} />
                )}

                New Resume
              </button>
            </div>
          </div>
        </motion.section>

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={46}
                className="mx-auto animate-spin text-indigo-400"
              />

              <p className="mt-4 text-slate-400">
                Loading your resumes...
              </p>
            </div>
          </div>
        ) : resumes.length === 0 ? (
          <motion.section
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-12 text-center backdrop-blur-xl"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/20 text-indigo-400">
              <FilePlus2 size={38} />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              No builder resumes yet
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-slate-400">
              Create a blank resume or
              import information from an
              existing analysis.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="mt-7 rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              Create First Resume
            </button>
          </motion.section>
        ) : (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resumes.map(
              (resume, index) => (
                <motion.article
                  key={resume._id}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.07,
                  }}
                  whileHover={{
                    y: -6,
                  }}
                  className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                      <FileText
                        size={27}
                      />
                    </div>

                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
                      {resume.template ||
                        "student-tech"}
                    </span>
                  </div>

                  <h2 className="mt-6 truncate text-xl font-bold">
                    {resume.title ||
                      "Untitled Resume"}
                  </h2>

                  <p className="mt-2 truncate text-sm text-slate-400">
                    {resume.personal?.name ||
                      "ResumeAI User"}
                  </p>

                  <p className="mt-4 text-sm text-slate-400">
                    Updated{" "}
                    {resume.updatedAt
                      ? new Date(
                          resume.updatedAt
                        ).toLocaleDateString()
                      : "recently"}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/resume-builder/${resume._id}`
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500"
                    >
                      <Pencil
                        size={17}
                      />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDuplicate(
                          resume._id
                        )
                      }
                      disabled={
                        actionId ===
                        resume._id
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-current/10 bg-white/10 px-4 py-3 font-semibold hover:bg-white/20 disabled:opacity-50"
                    >
                      {actionId ===
                      resume._id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Copy
                          size={17}
                        />
                      )}

                      Duplicate
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        resume._id,
                        resume.title
                      )
                    }
                    disabled={
                      actionId ===
                      resume._id
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                    Delete
                  </button>
                </motion.article>
              )
            )}
          </section>
        )}

        {showImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="resume-builder-modal max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl border p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    Import Resume
                    Analysis
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Select a previously
                    analyzed resume.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close import window"
                  onClick={() =>
                    setShowImport(false)
                  }
                  className="rounded-xl bg-white/10 p-3 hover:bg-white/20"
                >
                  <X size={19} />
                </button>
              </div>

              {analyzedResumes.length ===
              0 ? (
                <div className="mt-8 rounded-2xl border border-current/10 bg-white/5 p-8 text-center">
                  <FileText
                    className="mx-auto text-slate-400"
                    size={38}
                  />

                  <p className="mt-4 text-slate-400">
                    No analyzed resumes
                    found.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/upload")
                    }
                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
                  >
                    Upload Resume
                  </button>
                </div>
              ) : (
                <div className="mt-7 space-y-3">
                  {analyzedResumes.map(
                    (resume) => (
                      <div
                        key={resume._id}
                        className="flex flex-col justify-between gap-4 rounded-2xl border border-current/10 bg-white/5 p-5 sm:flex-row sm:items-center"
                      >
                        <div>
                          <h3 className="font-bold">
                            {resume.filename ||
                              "resume.pdf"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            ATS{" "}
                            {resume.analysis
                              ?.atsScore ||
                              0}
                            %
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleImport(
                              resume._id
                            )
                          }
                          disabled={
                            importingId ===
                            resume._id
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                        >
                          {importingId ===
                          resume._id ? (
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <Import
                              size={18}
                            />
                          )}

                          Import
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ResumeBuilder;