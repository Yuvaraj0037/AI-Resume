import { useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useDropzone,
} from "react-dropzone";
import toast from "react-hot-toast";

import {
  useAppearance,
} from "../context/AppearanceContext";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(
      1
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function FileDropzone({
  file,
  setFile,
  disabled = false,
}) {
  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isNightMode =
    theme === "dark" || sleepMode;

  const onDropAccepted = useCallback(
    (acceptedFiles) => {
      const selectedFile =
        acceptedFiles[0];

      if (!selectedFile) return;

      setFile(selectedFile);

      toast.success(
        "PDF selected successfully"
      );
    },
    [setFile]
  );

  const onDropRejected = useCallback(
    (rejections) => {
      const rejection =
        rejections[0];

      const errorCode =
        rejection?.errors?.[0]?.code;

      if (
        errorCode ===
        "file-too-large"
      ) {
        toast.error(
          "PDF must be smaller than 5 MB"
        );

        return;
      }

      toast.error(
        "Only valid PDF files are allowed"
      );
    },
    []
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled,
    onDropAccepted,
    onDropRejected,
  });

  const containerClass = sleepMode
    ? "border-amber-400/25 bg-[#2b2518]/90"
    : isNightMode
      ? "border-slate-600 bg-slate-900/85"
      : "border-indigo-200 bg-white/90";

  const headingClass = isNightMode
    ? "text-white"
    : "text-slate-950";

  const descriptionClass = sleepMode
    ? "text-amber-100/75"
    : isNightMode
      ? "text-slate-300"
      : "text-slate-600";

  function removeFile(event) {
    event.stopPropagation();

    if (disabled) return;

    setFile(null);
  }

  return (
    <motion.div
      {...getRootProps()}
      animate={{
        scale: isDragActive
          ? 1.015
          : 1,
      }}
      whileHover={
        disabled
          ? undefined
          : {
              y: -3,
            }
      }
      className={`relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed p-7 text-center shadow-sm backdrop-blur-xl transition-all sm:p-12 ${
        isDragActive
          ? "border-indigo-500 bg-indigo-500/10 shadow-xl shadow-indigo-500/10"
          : containerClass
      } ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : ""
      }`}
    >
      <input {...getInputProps()} />

      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10">
        {!file ? (
          <>
            <motion.div
              animate={
                isDragActive
                  ? {
                      y: [0, -10, 0],
                      scale: [
                        1,
                        1.08,
                        1,
                      ],
                    }
                  : {
                      y: [0, -6, 0],
                    }
              }
              transition={{
                duration: isDragActive
                  ? 1
                  : 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="liquid-logo mx-auto flex h-24 w-24 items-center justify-center text-white"
            >
              <UploadCloud
                size={44}
                className="relative z-10"
              />
            </motion.div>

            <motion.div
              key={
                isDragActive
                  ? "active"
                  : "inactive"
              }
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <h2
                className={`mt-7 text-2xl font-black sm:text-3xl ${headingClass}`}
              >
                {isDragActive
                  ? "Drop your resume here"
                  : "Upload your resume"}
              </h2>

              <p
                className={`mx-auto mt-3 max-w-lg ${descriptionClass}`}
              >
                Drag and drop a PDF or browse
                from your device. ResumeAI will
                extract the text and generate an
                ATS analysis.
              </p>
            </motion.div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/20">
              <UploadCloud size={19} />
              Browse PDF
            </div>

            <div
              className={`mt-5 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold ${descriptionClass}`}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={16}
                  className="text-emerald-500"
                />
                PDF only
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={16}
                  className="text-emerald-500"
                />
                Maximum 5 MB
              </span>

              <span className="flex items-center gap-1.5">
                <Sparkles
                  size={16}
                  className="text-violet-500"
                />
                AI-powered analysis
              </span>
            </div>
          </>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/10"
            >
              <FileText size={38} />
            </motion.div>

            <div className="mx-auto mt-6 max-w-xl">
              <div
                className={`relative rounded-2xl border p-5 text-left ${
                  isNightMode
                    ? "border-slate-600 bg-slate-800"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  onClick={removeFile}
                  disabled={disabled}
                  title="Remove selected file"
                  className={`absolute right-3 top-3 rounded-lg p-2 transition ${
                    isNightMode
                      ? "text-slate-300 hover:bg-slate-700 hover:text-white"
                      : "text-slate-500 hover:bg-red-100 hover:text-red-600"
                  }`}
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-4 pr-10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <FileText size={24} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate font-bold ${headingClass}`}
                    >
                      {file.name}
                    </p>

                    <p
                      className={`mt-1 text-sm ${descriptionClass}`}
                    >
                      {formatFileSize(
                        file.size
                      )}{" "}
                      • Ready for analysis
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {!disabled && (
              <p
                className={`mt-4 text-sm ${descriptionClass}`}
              >
                Click anywhere to select a
                different PDF.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default FileDropzone;