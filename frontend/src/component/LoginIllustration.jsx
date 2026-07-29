import { motion } from "framer-motion";
import {
  FileText,
  Brain,
  BarChart3,
  Sparkles,
} from "lucide-react";

function FloatingIcon({ children, x, y, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        y: [0, -15, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 4,
        delay,
      }}
      className={`absolute ${x} ${y}`}
    >
      {children}
    </motion.div>
  );
}

export default function LoginIllustration() {
  return (
    <div className="relative flex items-center justify-center h-full">

      <motion.div
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
        className="w-72 h-72 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-2xl flex items-center justify-center"
      >
        <Brain size={120} className="text-white" />
      </motion.div>

      <FloatingIcon
        x="left-10"
        y="top-10"
        delay={0}
      >
        <div className="bg-white p-4 rounded-2xl shadow-xl">
          <FileText className="text-indigo-600" size={35} />
        </div>
      </FloatingIcon>

      <FloatingIcon
        x="right-10"
        y="top-24"
        delay={1}
      >
        <div className="bg-white p-4 rounded-2xl shadow-xl">
          <BarChart3 className="text-green-600" size={35} />
        </div>
      </FloatingIcon>

      <FloatingIcon
        x="left-20"
        y="bottom-20"
        delay={2}
      >
        <div className="bg-white p-4 rounded-2xl shadow-xl">
          <Sparkles className="text-pink-500" size={35} />
        </div>
      </FloatingIcon>

    </div>
  );
}