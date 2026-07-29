import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

function AnalysisPreview() {
  return (
    <section className="py-28 bg-gradient-to-br from-slate-50 to-indigo-50">

      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center mb-16">

          <h2 className="text-5xl font-bold text-gray-900">
            Live AI Resume Analysis
          </h2>

          <p className="mt-5 text-lg text-gray-600">
            See exactly what happens after uploading your resume.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Resume */}

          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >

            <div className="flex justify-between">

              <h3 className="text-2xl font-bold">
                Resume.pdf
              </h3>

              <span className="text-green-600 font-bold">
                Uploaded
              </span>

            </div>

            <hr className="my-6"/>

            <div className="space-y-4">

              <div className="h-4 bg-gray-200 rounded w-full"></div>

              <div className="h-4 bg-gray-200 rounded w-10/12"></div>

              <div className="h-4 bg-gray-200 rounded w-8/12"></div>

              <div className="h-4 bg-gray-200 rounded w-full"></div>

              <div className="h-4 bg-gray-200 rounded w-11/12"></div>

              <div className="h-4 bg-gray-200 rounded w-7/12"></div>

              <div className="h-4 bg-gray-200 rounded w-9/12"></div>

            </div>

          </motion.div>

          {/* Analysis */}

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
            className="space-y-6"
          >

            {/* ATS */}

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <div className="flex justify-between">

                <h3 className="font-bold text-xl">
                  ATS Score
                </h3>

                <span className="text-green-600 text-3xl font-bold">
                  91%
                </span>

              </div>

              <div className="w-full bg-gray-200 h-4 rounded-full mt-5">

                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "91%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5 }}
                  className="h-4 rounded-full bg-green-500"
                />

              </div>

            </div>

            {/* Skills */}

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h3 className="font-bold text-xl mb-4">
                Top Skills
              </h3>

              <div className="flex flex-wrap gap-3">

                {[
                  "Python",
                  "React",
                  "Node.js",
                  "MongoDB",
                  "TensorFlow",
                  "Express"
                ].map(skill=>(
                  <span
                    key={skill}
                    className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium"
                  >
                    {skill}
                  </span>
                ))}

              </div>

            </div>

            {/* Missing */}

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h3 className="font-bold text-xl mb-4">
                Missing Skills
              </h3>

              <div className="space-y-3">

                {[
                  "AWS",
                  "Docker",
                  "SQL"
                ].map(skill=>(
                  <div
                    key={skill}
                    className="flex items-center gap-3"
                  >
                    <AlertTriangle
                      className="text-red-500"
                    />

                    <span>{skill}</span>

                  </div>
                ))}

              </div>

            </div>

            {/* Suggestions */}

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h3 className="font-bold text-xl mb-5">
                AI Suggestions
              </h3>

              <div className="space-y-4">

                <div className="flex gap-3">

                  <CheckCircle2 className="text-green-500"/>

                  <span>
                    Add internship experience.
                  </span>

                </div>

                <div className="flex gap-3">

                  <TrendingUp className="text-indigo-600"/>

                  <span>
                    Quantify project achievements.
                  </span>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}

export default AnalysisPreview;