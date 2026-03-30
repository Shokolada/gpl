"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StreakCounterProps {
  streak: number;
  multiplier: number;
}

export default function StreakCounter({
  streak,
  multiplier,
}: StreakCounterProps) {
  if (streak < 2) return null;

  const isCombo = streak >= 3;
  const isOnFire = streak >= 5;

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="flex flex-col items-center"
      >
        {/* Main container with gold border */}
        <div
          className={`
            relative rounded-lg px-4 py-1.5
            ${isOnFire ? "animate-streak-fire" : ""}
          `}
          style={{
            backgroundColor: "#1e2128",
            border: isOnFire
              ? "4px solid #ffcc00"
              : isCombo
                ? "2px solid #ffcc00"
                : "1px solid #4a4f5a",
          }}
        >
          <div className="flex items-center gap-2">
            {/* Fire icon for 5+ — simplified */}
            {isOnFire && (
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <svg
                  width="16"
                  height="20"
                  viewBox="0 0 16 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0C8 0 0 7 0 13C0 17.418 3.582 20 8 20C12.418 20 16 17.418 16 13C16 7 8 0 8 0Z"
                    fill="#cc6600"
                  />
                  <path
                    d="M8 5C8 5 3 11 3 15C3 17.761 5.239 19 8 19C10.761 19 13 17.761 13 15C13 11 8 5 8 5Z"
                    fill="#ffcc00"
                  />
                  <path
                    d="M8 11C8 11 6 14 6 16C6 17.105 6.895 18 8 18C9.105 18 10 17.105 10 16C10 14 8 11 8 11Z"
                    fill="#ffffff"
                  />
                </svg>
              </motion.span>
            )}

            {/* Multiplier text */}
            <span
              className="font-[family-name:var(--font-orbitron)] font-black leading-none"
              style={{
                fontSize: isOnFire ? "22px" : "18px",
                color: isCombo || isOnFire ? "#ffcc00" : "#ffffff",
              }}
            >
              x{multiplier}
            </span>
          </div>
        </div>

        {/* COMBO! text for streak 3-4 */}
        {isCombo && !isOnFire && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-[10px] font-[family-name:var(--font-orbitron)] font-bold tracking-[0.2em] uppercase"
            style={{ color: "#ffcc00" }}
          >
            COMBO!
          </motion.span>
        )}

        {/* ON FIRE! text for streak 5+ — simple brightness pulse */}
        {isOnFire && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="mt-1 text-[10px] font-[family-name:var(--font-orbitron)] font-black tracking-[0.25em] uppercase"
            style={{ color: "#ffcc00" }}
          >
            ON FIRE!
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
