"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StreakCounterProps {
  streak: number;
  multiplier: number;
}

function getStreakIntensity(streak: number): {
  bgClass: string;
  textClass: string;
  scale: number;
} {
  if (streak >= 5) {
    return {
      bgClass: "bg-orange-500/30 border-orange-400/60",
      textClass: "text-orange-300",
      scale: 1.15,
    };
  }
  if (streak >= 3) {
    return {
      bgClass: "bg-yellow-500/25 border-yellow-400/50",
      textClass: "text-yellow-300",
      scale: 1.1,
    };
  }
  // streak === 2
  return {
    bgClass: "bg-blue-500/20 border-blue-400/40",
    textClass: "text-blue-300",
    scale: 1.0,
  };
}

export default function StreakCounter({
  streak,
  multiplier,
}: StreakCounterProps) {
  if (streak < 2) return null;

  const { bgClass, textClass, scale } = getStreakIntensity(streak);
  const isOnFire = streak >= 5;

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 0.5, opacity: 0, y: 10 }}
        animate={{ scale, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`
          inline-flex items-center gap-2 px-4 py-1.5 rounded-full border
          ${bgClass}
        `}
      >
        {/* Fire effect for streak 5+ */}
        {isOnFire && (
          <span className="relative">
            <span className="text-lg animate-fire-flicker">
              <svg
                width="18"
                height="22"
                viewBox="0 0 18 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block"
              >
                <path
                  d="M9 0C9 0 1 8 1 14C1 18.418 4.582 22 9 22C13.418 22 17 18.418 17 14C17 8 9 0 9 0Z"
                  fill="#F97316"
                />
                <path
                  d="M9 6C9 6 4 12 4 16C4 18.761 6.239 21 9 21C11.761 21 14 18.761 14 16C14 12 9 6 9 6Z"
                  fill="#FBBF24"
                />
                <path
                  d="M9 12C9 12 7 15 7 17C7 18.105 7.895 19 9 19C10.105 19 11 18.105 11 17C11 15 9 12 9 12Z"
                  fill="#FEF3C7"
                />
              </svg>
            </span>
          </span>
        )}

        {/* Multiplier text */}
        <span className={`font-mono text-lg font-black ${textClass}`}>
          x{multiplier}
        </span>

        {/* ON FIRE label */}
        {isOnFire && (
          <motion.span
            className="text-xs font-black tracking-widest text-orange-300 uppercase"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            ON FIRE!
          </motion.span>
        )}

        {/* Streak count */}
        {!isOnFire && (
          <span className="text-xs font-medium text-gray-400">
            {streak} hits
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
