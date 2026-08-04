import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Copy,
  Wand2,
  Lightbulb,
  Code2,
  FileText,
} from "lucide-react";

import DashboardLayout from "../component/DashboardLayout";
import { improveResume } from "../services/resumeApi";

function ResumeImprove() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImprove = async () => {
    try {
      setLoading(true);
      const data = await improveResume();
      setResult(data);
    } catch (err) {
      alert(err.response?.data?.message || "Resume improvement failed");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text || "");
    alert("Copied!");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-8 rounded-3xl text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500 p-4 rounded-2xl">
              <Sparkles size={34} />
            </div>

            <div>
              <h1 className="text-4xl font-bold">AI Resume Improvement</h1>
              <p className="text-gray-300 mt-2">
                Generate stronger resume content using AI.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleImprove}
            disabled={loading}
            className={`mt-10 px-8 py-4 rounded-xl font-semibold transition flex items-center gap-3 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <Wand2 />
            {loading ? "Improving Resume..." : "Improve My Resume"}
          </motion.button>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white/10 border border-white/10 rounded-3xl p-8"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-white/20 rounded w-1/3" />
              <div className="h-4 bg-white/20 rounded w-full" />
              <div className="h-4 bg-white/20 rounded w-5/6" />
              <div className="h-4 bg-white/20 rounded w-2/3" />
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="mt-8 space-y-6"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-indigo-300" />
                  <h2 className="text-2xl font-bold">Improved Summary</h2>
                </div>

                <button
                  onClick={() => copyText(result.improvedSummary)}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Copy size={18} />
                  Copy
                </button>
              </div>

              <p className="text-gray-200 leading-8 mt-5">
                {result.improvedSummary || "No summary generated."}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-5">
                  <Code2 className="text-emerald-300" />
                  <h2 className="text-2xl font-bold">Improved Skills</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  {result.improvedSkills?.length > 0 ? (
                    result.improvedSkills.map((skill, index) => (
                      <motion.span
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 px-4 py-2 rounded-xl font-medium"
                      >
                        {skill}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-gray-400">No skills generated.</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-5">
                  <Lightbulb className="text-yellow-300" />
                  <h2 className="text-2xl font-bold">ATS Tips</h2>
                </div>

                <ul className="space-y-3">
                  {result.atsTips?.length > 0 ? (
                    result.atsTips.map((tip, index) => (
                      <li
                        key={index}
                        className="bg-white/10 border border-white/10 rounded-xl p-4 text-gray-200"
                      >
                        {tip}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-400">No tips generated.</p>
                  )}
                </ul>
              </motion.div>
            </div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-5">Improved Projects</h2>

              <ul className="space-y-4">
                {result.improvedProjects?.length > 0 ? (
                  result.improvedProjects.map((project, index) => (
                    <li
                      key={index}
                      className="bg-white/10 border border-white/10 rounded-xl p-5 text-gray-200 leading-7"
                    >
                      {project}
                    </li>
                  ))
                ) : (
                  <p className="text-gray-400">
                    No project improvements found.
                  </p>
                )}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ResumeImprove;
