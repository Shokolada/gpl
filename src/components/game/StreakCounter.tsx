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
        {/* Main container with fire gradient border */}
        <div
          className={`
            relative rounded-lg px-4 py-1.5
            ${isOnFire ? "animate-streak-fire" : ""}
          `}
          style={{
            background: "rgba(10, 15, 30, 0.8)",
            border: isOnFire
              ? "2px solid transparent"
              : isCombo
                ? "1px solid rgba(255, 215, 0, 0.5)"
                : "1px solid rgba(0, 240, 255, 0.3)",
            backgroundClip: "padding-box",
          }}
        >
          {/* Animated gradient border for on-fire state */}
          {isOnFire && (
            <div
              className="absolute -inset-[2px] rounded-lg -z-10 animate-fire-border"
              style={{
                background:
                  "linear-gradient(45deg, #ff6b00, #ff2d55, #ffd700, #ff6b00, #ff2d55)",
                backgroundSize: "300% 300%",
              }}
            />
          )}

          <div className="flex items-center gap-2">
            {/* Fire icon for 5+ */}
            {isOnFire && (
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="animate-fire-flicker"
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
                    fill="#F97316"
                  />
                  <path
                    d="M8 5C8 5 3 11 3 15C3 17.761 5.239 19 8 19C10.761 19 13 17.761 13 15C13 11 8 5 8 5Z"
                    fill="#FBBF24"
                  />
                  <path
                    d="M8 11C8 11 6 14 6 16C6 17.105 6.895 18 8 18C9.105 18 10 17.105 10 16C10 14 8 11 8 11Z"
                    fill="#FEF3C7"
                  />
                </svg>
              </motion.span>
            )}

            {/* Multiplier text */}
            <span
              className="font-[family-name:var(--font-orbitron)] font-black leading-none"
              style={{
                fontSize: isOnFire ? "22px" : "18px",
                color: isOnFire ? "#ffd700" : isCombo ? "#ffd700" : "#00f0ff",
                textShadow: isOnFire
                  ? "0 0 12px rgba(255, 165, 0, 0.8), 0 0 24px rgba(255, 215, 0, 0.5), 0 0 48px rgba(255, 100, 0, 0.3)"
                  : isCombo
                    ? "0 0 8px rgba(255, 215, 0, 0.5)"
                    : "0 0 6px rgba(0, 240, 255, 0.4)",
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
            style={{ color: "#ffd700" }}
          >
            COMBO!
          </motion.span>
        )}

        {/* ON FIRE! text for streak 5+ */}
        {isOnFire && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="mt-1 text-[10px] font-[family-name:var(--font-orbitron)] font-black tracking-[0.25em] uppercase"
            style={{
              background: "linear-gradient(90deg, #ff6b00, #ffd700, #ff2d55)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 0 6px rgba(255, 165, 0, 0.6))",
            }}
          >
            ON FIRE!
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
