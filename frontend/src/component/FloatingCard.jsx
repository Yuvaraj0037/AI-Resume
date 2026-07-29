import { motion } from "framer-motion";

function FloatingCard() {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
      }}
      className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-auto"
    >
      <div className="flex justify-between">

        <h2 className="font-bold text-xl">
          Resume.pdf
        </h2>

        <span className="text-green-500 font-bold">
          ✓
        </span>

      </div>

      <div className="mt-8 space-y-5">

        <div>

          <p className="text-gray-500">
            ATS Score
          </p>

          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">

            <div className="bg-green-500 h-3 rounded-full w-[91%]"></div>

          </div>

          <p className="mt-2 font-bold text-green-600">
            91%
          </p>

        </div>

        <div>

          <p className="text-gray-500">
            Resume Score
          </p>

          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">

            <div className="bg-blue-500 h-3 rounded-full w-[85%]"></div>

          </div>

          <p className="mt-2 font-bold text-blue-600">
            85%
          </p>

        </div>

        <div>

          <p className="text-gray-500">
            Job Match
          </p>

          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">

            <div className="bg-purple-500 h-3 rounded-full w-[89%]"></div>

          </div>

          <p className="mt-2 font-bold text-purple-600">
            89%
          </p>

        </div>

      </div>

    </motion.div>
  );
}

export default FloatingCard;