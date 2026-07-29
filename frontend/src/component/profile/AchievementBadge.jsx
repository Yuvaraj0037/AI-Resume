import { motion } from "framer-motion";
import { CheckCircle, Lock } from "lucide-react";

export default function AchievementBadge({ badges = [] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl text-white">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Achievements</h2>
        <span className="text-xs text-white/50">
          {badges.filter(b => b.unlocked).length}/{badges.length}
        </span>
      </div>

      {/* Empty */}
      {badges.length === 0 && (
        <p className="text-white/50 text-sm text-center py-6">
          No achievements yet
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className={`relative p-4 rounded-xl border transition overflow-hidden
              ${
                badge.unlocked
                  ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-400/30"
                  : "bg-white/5 border-white/10 opacity-60"
              }
            `}
          >
            
            {/* Glow effect */}
            {badge.unlocked && (
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-indigo-500/30 blur-2xl rounded-full" />
            )}

            {/* Icon */}
            <div className="flex items-center justify-between">
              <div className="text-2xl">
                {badge.icon || "🏅"}
              </div>

              <div>
                {badge.unlocked ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <Lock size={16} className="text-white/40" />
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold mt-2">
              {badge.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-white/50 mt-1">
              {badge.description}
            </p>

            {/* Progress hint */}
            {!badge.unlocked && badge.progress && (
              <p className="text-xs text-indigo-300 mt-2">
                Progress: {badge.progress}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}