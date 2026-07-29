import { motion } from "framer-motion";
import {
  Brain,
  FileSearch,
  Target,
  Briefcase,
  Sparkles,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Resume Analysis",
    desc: "Gemini AI analyzes your resume and provides intelligent feedback.",
  },
  {
    icon: FileSearch,
    title: "ATS Score",
    desc: "Check how well your resume performs with Applicant Tracking Systems.",
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    desc: "Discover missing skills required for your dream job.",
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    desc: "See how your resume matches different job roles.",
  },
  {
    icon: Sparkles,
    title: "AI Suggestions",
    desc: "Receive actionable improvements to strengthen your resume.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    desc: "Understand strengths, weaknesses, and resume quality through insights.",
  },
];

function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-slate-100 to-white"
    >
      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900">
            Powerful Features
          </h2>

          <p className="mt-4 text-gray-600 text-lg">
            Everything you need to optimize your resume with AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                whileHover={{
                  y: -12,
                  scale: 1.03,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg border border-gray-100 group"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"></div>

                <div className="relative z-10">

                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition">

                    <Icon size={30} />

                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-7">
                    {feature.desc}
                  </p>

                </div>

              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}

export default Features;