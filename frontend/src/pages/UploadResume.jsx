import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  BrainCircuit,
  FileCheck2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../component/DashboardLayout";
import FileDropzone from "../component/FileDropzone";
import UploadProgress from "../component/UploadProgress";

import {
  uploadResume,
} from "../services/uploadApi";

function UploadResume() {
  const navigate = useNavigate();

  const [file, setFile] =
    useState(null);

  const [progress, setProgress] =
    useState(0);

  const [stage, setStage] =
    useState("uploading");

  const [loading, setLoading] =
    useState(false);

  const [showProgress, setShowProgress] =
    useState(false);

  const progressTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (progressTimer.current) {
        clearInterval(
          progressTimer.current
        );
      }
    };
  }, []);

  function clearProgressTimer() {
    if (progressTimer.current) {
      clearInterval(
        progressTimer.current
      );

      progressTimer.current = null;
    }
  }

  function resetProgress() {
    clearProgressTimer();
    setProgress(0);
    setStage("uploading");
    setShowProgress(false);
  }

  function handleFileChange(
    selectedFile
  ) {
    if (loading) return;

    setFile(selectedFile);
    resetProgress();
  }

  function beginAnalysisAnimation() {
    if (progressTimer.current) return;

    setStage("extracting");

    setProgress((current) =>
      Math.max(current, 32)
    );

    progressTimer.current =
      setInterval(() => {
        setProgress((current) => {
          if (current >= 94) {
            return 94;
          }

          if (current >= 50) {
            setStage("analyzing");
          } else {
            setStage("extracting");
          }

          const increment =
            current < 50
              ? 2
              : current < 75
                ? 1.5
                : 0.8;

          return Math.min(
            94,
            current + increment
          );
        });
      }, 550);
  }

  async function handleAnalyze() {
    if (!file) {
      toast.error(
        "Select a PDF resume first"
      );

      return;
    }

    if (
      file.type !== "application/pdf"
    ) {
      toast.error(
        "Only PDF files are allowed"
      );

      return;
    }

    try {
      setLoading(true);
      setShowProgress(true);
      setProgress(0);
      setStage("uploading");

      const response =
        await uploadResume(
          file,
          (event) => {
            if (!event.total) return;

            const uploadPercent =
              Math.round(
                (event.loaded * 100) /
                  event.total
              );

            // File transfer represents the
            // first 30% of overall processing.
            const overallProgress =
              Math.round(
                uploadPercent * 0.3
              );

            setProgress((current) =>
              Math.max(
                current,
                overallProgress
              )
            );

            if (uploadPercent >= 100) {
              beginAnalysisAnimation();
            }
          }
        );

      clearProgressTimer();

      setStage("complete");
      setProgress(100);

      const uploadedResume =
        response.resume || response;

      localStorage.setItem(
        "latestResume",
        JSON.stringify(
          uploadedResume
        )
      );

      // Keep compatibility with older
      // Analysis.jsx implementations.
      if (uploadedResume.analysis) {
        localStorage.setItem(
          "analysis",
          JSON.stringify(
            uploadedResume.analysis
          )
        );
      }

      toast.success(
        "Resume analysis completed"
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 900)
      );

      navigate("/analysis");
    } catch (error) {
      clearProgressTimer();

      console.error(
        "Upload failed:",
        error
      );

      setShowProgress(false);
      setProgress(0);
      setStage("uploading");

      toast.error(
        error.response?.data?.message ||
          (error.code ===
          "ERR_NETWORK"
            ? "Cannot connect to the backend"
            : "Resume analysis failed")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
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
                <BrainCircuit
                  size={30}
                  className="relative z-10"
                />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
                  AI-powered ATS engine
                </p>

                <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
                  Analyze Your Resume
                </h1>

                <p className="mt-2 max-w-2xl text-slate-600">
                  Upload a PDF to receive
                  ATS scoring, skill detection,
                  job-match insights and
                  actionable suggestions.
                </p>
              </div>
            </div>

            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="hidden rounded-2xl border border-indigo-200 bg-indigo-100/80 px-5 py-3 text-indigo-700 lg:block"
            >
              <div className="flex items-center gap-2 font-bold">
                <Sparkles size={19} />
                Gemini AI
              </div>

              <p className="mt-1 text-xs font-semibold text-indigo-500">
                Smart resume intelligence
              </p>
            </motion.div>
          </div>
        </motion.header>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Secure upload",
              text: "Your PDF is processed securely.",
              color:
                "bg-emerald-100 text-emerald-600",
            },
            {
              icon: FileCheck2,
              title: "ATS evaluation",
              text: "Formatting and keywords are scored.",
              color:
                "bg-indigo-100 text-indigo-600",
            },
            {
              icon: Zap,
              title: "Actionable results",
              text: "Receive targeted improvement tips.",
              color:
                "bg-amber-100 text-amber-600",
            },
          ].map(
            (
              {
                icon: Icon,
                title,
                text,
                color,
              },
              index
            ) => (
              <motion.div
                key={title}
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
                    index * 0.07,
                }}
                className="rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl p-3 ${color}`}
                  >
                    <Icon size={21} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900">
                      {title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {text}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </section>

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.12,
          }}
          className="mt-7"
        >
          <FileDropzone
            file={file}
            setFile={handleFileChange}
            disabled={loading}
          />
        </motion.section>

        <AnimatePresence>
          <UploadProgress
            progress={progress}
            stage={stage}
            visible={showProgress}
          />
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={
            loading || !file
              ? undefined
              : {
                  y: -3,
                  scale: 1.005,
                }
          }
          whileTap={
            loading || !file
              ? undefined
              : {
                  scale: 0.99,
                }
          }
          onClick={handleAnalyze}
          disabled={loading || !file}
          className={`relative mt-7 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-lg font-black text-white shadow-xl transition ${
            loading
              ? "cursor-wait bg-gradient-to-r from-indigo-500 to-violet-500"
              : file
                ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 shadow-indigo-500/20 hover:shadow-indigo-500/30"
                : "cursor-not-allowed bg-slate-400 shadow-none"
          }`}
        >
          {loading && (
            <motion.span
              animate={{
                x: [
                  "-150%",
                  "500%",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-y-0 w-24 rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          )}

          <span className="relative z-10 flex items-center gap-3">
            {loading ? (
              <Loader2
                size={22}
                className="animate-spin"
              />
            ) : (
              <BrainCircuit size={22} />
            )}

            {loading
              ? `Analyzing Resume — ${Math.round(
                  progress
                )}%`
              : file
                ? "Start AI Analysis"
                : "Select a PDF to Continue"}
          </span>
        </motion.button>

        {!loading && file && (
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="mt-3 text-center text-sm font-medium text-slate-500"
          >
            Analysis normally takes between
            10 and 30 seconds.
          </motion.p>
        )}
      </div>
    </DashboardLayout>
  );
}

export default UploadResume;