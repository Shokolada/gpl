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
    idle: "linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)",
    running: "linear-gradient(135deg, #ff2d55 0%, #f97316 100%)",
    disabled: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
  }[state];

  const boxShadowStatic = {
    idle: "0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.15)",
    running: "", // handled by CSS animation class
    disabled: "none",
  }[state];

  const borderColor = {
    idle: "rgba(0, 240, 255, 0.4)",
    running: "rgba(255, 45, 85, 0.5)",
    disabled: "rgba(75, 85, 99, 0.5)",
  }[state];

  const textColor = {
    idle: "#ffffff",
    running: "#ffffff",
    disabled: "#6b7280",
  }[state];

  return (
    <motion.button
      onClick={onPress}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      className={`
        relative w-full min-h-[72px] rounded-2xl
        font-[family-name:var(--font-orbitron)] text-xl md:text-2xl font-extrabold
        uppercase tracking-[0.15em]
        select-none outline-none border-2
        transition-all duration-200
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        ${state === "running" ? "animate-button-pulse-glow animate-button-scale-pulse" : ""}
      `}
      style={{
        background: gradientBg,
        boxShadow: state !== "running" ? boxShadowStatic : undefined,
        borderColor,
        color: textColor,
      }}
    >
      {/* Inner gradient shine overlay */}
      {!disabled && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)",
          }}
        />
      )}

      {/* Idle: subtle shimmer on hover (CSS-only via pseudo-class handled by Tailwind) */}
      {state === "idle" && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.15), transparent 60%)",
          }}
        />
      )}

      {/* Label */}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}
