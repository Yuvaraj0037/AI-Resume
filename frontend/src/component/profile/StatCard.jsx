import CountUp from "react-countup";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

function StatCard({ title, value, icon, color }) {
  const numericValue =
    typeof value === "string"
      ? Number(value.replace("%", ""))
      : Number(value);

  const isNumber = !Number.isNaN(numericValue);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 250 }}
      className="relative overflow-hidden bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-xl text-white"
    >
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl" />

      <div className="relative z-10 flex items-center justify-between">
        <div
          className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg`}
        >
          {icon}
        </div>

        <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <TrendingUp size={14} />
          Live
        </span>
      </div>

      <div className="relative z-10 mt-6">
        <h2 className="text-4xl font-bold">
          {isNumber ? (
            <>
              <CountUp end={numericValue} duration={1.4} />
              {typeof value === "string" && value.includes("%") ? "%" : ""}
            </>
          ) : (
            value
          )}
        </h2>

        <p className="text-gray-300 mt-2">{title}</p>
      </div>
    </motion.div>
  );
}

export default StatCard;