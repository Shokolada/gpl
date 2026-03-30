"use client";

import { motion } from "framer-motion";

interface StopButtonProps {
  isRunning: boolean;
  disabled: boolean;
  onPress: () => void;
}

export default function StopButton({
  isRunning,
  disabled,
  onPress,
}: StopButtonProps) {
  // Determine visual state
  const state = disabled ? "disabled" : isRunning ? "running" : "idle";

  const label = {
    idle: "START",
    running: "STOP!",
    disabled: "NO AMMO",
  }[state];

  const gradientBg = {
    idle: "linear-gradient(180deg, #cc0000 0%, #880000 100%)",
    running: "linear-gradient(180deg, #ee0000 0%, #aa0000 100%)",
    disabled: "#1e2128",
  }[state];

  const textColor = {
    idle: "#ffffff",
    running: "#ffffff",
    disabled: "#6b7280",
  }[state];

  // Beveled borders: lighter top-left, darker bottom-right
  const borderStyle = {
    idle: {
      borderTop: "2px solid #e63333",
      borderLeft: "2px solid #e63333",
      borderBottom: "2px solid #550000",
      borderRight: "2px solid #550000",
    },
    running: {
      borderTop: "2px solid #ff4444",
      borderLeft: "2px solid #ff4444",
      borderBottom: "2px solid #770000",
      borderRight: "2px solid #770000",
    },
    disabled: {
      borderTop: "2px solid #2a2d35",
      borderLeft: "2px solid #2a2d35",
      borderBottom: "2px solid #15181e",
      borderRight: "2px solid #15181e",
    },
  }[state];

  return (
    <motion.button
      onClick={onPress}
      disabled={disabled}
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.95,
              // Reverse bevel on press for "pushed in" effect
              borderTop: "2px solid #550000",
              borderLeft: "2px solid #550000",
              borderBottom: "2px solid #e63333",
              borderRight: "2px solid #e63333",
            }
      }
      whileHover={disabled ? undefined : { scale: 1.03 }}
      className={`
        relative w-full min-h-[60px] rounded-xl
        font-[family-name:var(--font-orbitron)] text-xl md:text-2xl font-extrabold
        uppercase tracking-[0.15em]
        select-none outline-none
        transition-all duration-200
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        ${state === "running" ? "pulse-red" : ""}
      `}
      style={{
        background: gradientBg,
        color: textColor,
        ...borderStyle,
      }}
    >
      {/* Inner gradient shine overlay */}
      {!disabled && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 100%)",
          }}
        />
      )}

      {/* Label */}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}
