import { motion } from "framer-motion";
import { ArrowRight, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingCard from "./FloatingCard";

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-indigo-50 via-white to-purple-100 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-purple-300 rounded-full blur-[140px] opacity-30 top-10 left-20"></div>

      <div className="absolute w-80 h-80 bg-blue-300 rounded-full blur-[120px] opacity-30 bottom-10 right-20"></div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center px-8">

        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-indigo-600 font-semibold mb-4">
            🚀 Gemini AI Powered
          </p>

          <h1 className="text-6xl font-extrabold leading-tight text-gray-900">
            Beat ATS.
            <br />
            <span className="text-indigo-600">
              Get Hired Faster.
            </span>
          </h1>

          <p className="text-gray-600 text-lg mt-6 leading-8">
            Upload your resume and receive ATS scoring,
            AI suggestions, job matching and missing
            skill analysis within seconds.
          </p>

          <div className="flex gap-5 mt-10">

            <Link to="/upload">

              <button className="flex items-center gap-2 bg-indigo-600 text-white px-7 py-4 rounded-xl hover:bg-indigo-700 transition">
                <Upload size={20} />
                Analyze Resume
              </button>

            </Link>

            <button className="flex items-center gap-2 border border-gray-300 px-7 py-4 rounded-xl hover:bg-gray-100 transition">
              Learn More
              <ArrowRight size={18} />
            </button>

          </div>

        </motion.div>

        {/* Right */}
        <FloatingCard />

      </div>

    </section>
  );
}

export default Hero;