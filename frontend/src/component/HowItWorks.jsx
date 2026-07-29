import { motion } from "framer-motion";
import {
  UploadCloud,
  BrainCircuit,
  FileCheck2,
} from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "Upload Resume",
    description:
      "Upload your PDF resume securely with a single click.",
    color: "bg-blue-500",
  },
  {
    icon: BrainCircuit,
    title: "AI Analysis",
    description:
      "Gemini AI analyzes ATS compatibility, skills and job matching.",
    color: "bg-purple-500",
  },
  {
    icon: FileCheck2,
    title: "Get Results",
    description:
      "Receive ATS score, missing skills and personalized suggestions instantly.",
    color: "bg-green-500",
  },
];

function HowItWorks() {
  return (
    <section
      id="how"
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center mb-20">

          <h2 className="text-5xl font-bold text-gray-900">
            How It Works
          </h2>

          <p className="mt-5 text-lg text-gray-600">
            Three simple steps to optimize your resume.
          </p>

        </div>

        <div className="relative grid md:grid-cols-3 gap-12">

          {/* Connecting Line */}

          <div className="hidden md:block absolute top-20 left-[17%] w-[66%] h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"></div>

          {steps.map((step, index) => {

            const Icon = step.icon;

            return (

              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 60,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.3,
                }}
                viewport={{
                  once: true,
                }}
                className="relative text-center"
              >

                {/* Number */}

                <div className="absolute -top-5 right-8 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}

                <div
                  className={`${step.color} w-24 h-24 rounded-full flex items-center justify-center mx-auto text-white shadow-xl`}
                >
                  <Icon size={42} />
                </div>

                <h3 className="mt-8 text-2xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-4 text-gray-600 leading-7">
                  {step.description}
                </p>

              </motion.div>

            );
          })}

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;