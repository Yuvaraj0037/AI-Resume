import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

function AIAssistant() {
  const messages = [
    "Uploading Resume...",
    "Extracting PDF...",
    "Analyzing ATS Score...",
    "Finding Missing Skills...",
    "Matching Job Roles...",
    "Analysis Complete ✓",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) =>
        prev === messages.length - 1 ? 0 : prev + 1
      );
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-100">

      <div className="max-w-7xl mx-auto px-8">

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left */}

          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full">
              AI Assistant
            </span>

            <h2 className="text-5xl font-bold mt-6">
              Your Personal
              <span className="text-indigo-600">
                {" "}Resume Coach
              </span>
            </h2>

            <p className="text-gray-600 mt-6 text-lg leading-8">
              Powered by Gemini AI, our assistant instantly
              analyzes your resume, predicts ATS performance,
              identifies missing skills, and recommends
              improvements for your dream job.
            </p>

          </motion.div>

          {/* Right */}

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white">

                <Bot size={32} />

              </div>

              <div>

                <h3 className="font-bold text-xl">
                  Resume AI
                </h3>

                <p className="text-green-500 text-sm">
                  ● Online
                </p>

              </div>

            </div>

            <div className="mt-8 bg-slate-100 rounded-xl p-5">

              <div className="flex gap-3 items-center">

                <Sparkles className="text-indigo-600" />

                <motion.p
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >
                  {messages[index]}
                </motion.p>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}

export default AIAssistant;