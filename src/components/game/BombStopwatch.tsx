"use client";

import { useMemo } from "react";

interface BombStopwatchProps {
  time: number;
  isRunning: boolean;
}

type TimerZone = "calm" | "bright" | "gold" | "green" | "red";

interface VisualState {
  zone: TimerZone;
  textColor: string;
  textShadow: string;
  glowClass: string;
  ringColor: string;
  ringGlow: string;
  progress: number; // 0-1, how close to 10.000
  formattedTime: string;
}

function computeVisualState(time: number): VisualState {
  const seconds = Math.floor(time);
  const ms = Math.floor((time - seconds) * 1000);
  const formattedTime = `${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;

  // Progress ring: fills from 0 to 1 as time goes 0 -> 10
  const progress = Math.min(time / 10, 1);

  if (time < 9.0) {
    return {
      zone: "calm",
      textColor: "text-gray-300",
      textShadow: "0 0 10px rgba(200, 200, 220, 0.15)",
      glowClass: "",
      ringColor: "#6b7280",
      ringGlow: "none",
      progress,
      formattedTime,
    };
  }

  if (time < 9.5) {
    return {
      zone: "bright",
      textColor: "text-white",
      textShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
      glowClass: "",
      ringColor: "#ffffff",
      ringGlow: "0 0 8px rgba(255, 255, 255, 0.3)",
      progress,
      formattedTime,
    };
  }

  if (time < 9.95) {
    // Gold zone - increasing intensity
    const intensity = (time - 9.5) / 0.45; // 0 to 1 within this range
    return {
      zone: "gold",
      textColor: "text-[#ffd700]",
      textShadow: `0 0 ${15 + intensity * 25}px rgba(255, 215, 0, ${0.4 + intensity * 0.4}), 0 0 ${30 + intensity * 40}px rgba(255, 215, 0, ${0.2 + intensity * 0.2})`,
      glowClass: "",
      ringColor: "#ffd700",
      ringGlow: `0 0 ${6 + intensity * 12}px rgba(255, 215, 0, ${0.3 + intensity * 0.4})`,
      progress,
      formattedTime,
    };
  }

  if (time <= 10.05) {
    return {
      zone: "green",
      textColor: "text-[#00ff88]",
      textShadow: "unused", // handled by CSS class
      glowClass: "animate-green-glow-pulse",
      ringColor: "#00ff88",
      ringGlow: "0 0 20px rgba(0, 255, 136, 0.6)",
      progress,
      formattedTime,
    };
  }

  return {
    zone: "red",
    textColor: "text-[#ff2d55]",
    textShadow: "0 0 25px rgba(255, 45, 85, 0.7), 0 0 50px rgba(255, 45, 85, 0.3)",
    glowClass: "animate-shake",
    ringColor: "#ff2d55",
    ringGlow: "0 0 15px rgba(255, 45, 85, 0.5)",
    progress,
    formattedTime,
  };
}

export default function BombStopwatch({ time, isRunning }: BombStopwatchProps) {
  const vs = useMemo(() => computeVisualState(time), [time]);

  // SVG circle math for progress ring
  const circleRadius = 130;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - vs.progress);

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* ---- Floating background particles (CSS-only) ---- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute w-1 h-1 rounded-full bg-[#00f0ff]/30"
          style={{ top: "15%", left: "10%", animation: "float-particle-1 6s ease-in-out infinite" }}
        />
        <div
          className="absolute w-0.5 h-0.5 rounded-full bg-[#00f0ff]/20"
          style={{ top: "60%", left: "85%", animation: "float-particle-2 8s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-[#ffd700]/20"
          style={{ top: "80%", left: "25%", animation: "float-particle-3 7s ease-in-out infinite 0.5s" }}
        />
        <div
          className="absolute w-0.5 h-0.5 rounded-full bg-[#00ff88]/25"
          style={{ top: "25%", left: "75%", animation: "float-particle-1 9s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-[#ff2d55]/15"
          style={{ top: "45%", left: "50%", animation: "float-particle-2 5s ease-in-out infinite 3s" }}
        />
        <div
          className="absolute w-0.5 h-0.5 rounded-full bg-[#00f0ff]/20"
          style={{ top: "70%", left: "65%", animation: "float-particle-3 10s ease-in-out infinite 1.5s" }}
        />
      </div>

      {/* ---- Main container with rotating border ---- */}
      <div className="relative">
        {/* Outer rotating gradient border */}
        <div className="absolute -inset-[2px] rounded-full overflow-hidden" aria-hidden="true">
          <div
            className="w-full h-full animate-rotate-border"
            style={{
              background: `conic-gradient(from 0deg, #00f0ff, #3b82f6, #8b5cf6, #ff2d55, #ffd700, #00ff88, #00f0ff)`,
              opacity: isRunning ? 0.7 : 0.25,
              transition: "opacity 0.5s ease",
            }}
          />
        </div>

        {/* Inner container: dark glass circle */}
        <div
          className="relative w-[300px] h-[300px] md:w-[360px] md:h-[360px] rounded-full flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(15, 23, 42, 0.9), rgba(5, 5, 16, 0.98))`,
            boxShadow: `inset 0 2px 0 rgba(255, 255, 255, 0.04), inset 0 -2px 4px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 0, 0, 0.6)`,
          }}
        >
          {/* Glass highlight */}
          <div
            className="absolute top-0 left-0 w-full h-1/2 rounded-t-full pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)",
            }}
          />

          {/* SVG Progress Ring + Bomb */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Track ring (background) */}
            <circle
              cx="150"
              cy="150"
              r={circleRadius}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="3"
              fill="none"
            />
            {/* Progress ring */}
            <circle
              cx="150"
              cy="150"
              r={circleRadius}
              stroke={vs.ringColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 150 150)"
              style={{
                transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease",
                filter: vs.ringGlow !== "none" ? `drop-shadow(${vs.ringGlow})` : undefined,
              }}
            />

            {/* ---- Bomb SVG ---- */}
            <g transform="translate(115, 42)">
              {/* Bomb body - sleek rounded rectangle with metallic gradient */}
              <defs>
                <radialGradient id="bombBody" cx="0.4" cy="0.35" r="0.65">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="60%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>
                <linearGradient id="bombSheen" x1="0" y1="0" x2="0.6" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <linearGradient id="fuseGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                {isRunning && (
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="50%" stopColor="#ff8c00" />
                    <stop offset="100%" stopColor="#ff2d55" />
                  </linearGradient>
                )}
              </defs>

              {/* Bomb body silhouette */}
              <ellipse
                cx="35"
                cy="48"
                rx="28"
                ry="30"
                fill="url(#bombBody)"
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* Metallic sheen */}
              <ellipse
                cx="35"
                cy="48"
                rx="28"
                ry="30"
                fill="url(#bombSheen)"
              />
              {/* Highlight reflection */}
              <ellipse
                cx="24"
                cy="38"
                rx="8"
                ry="5"
                fill="rgba(255,255,255,0.06)"
                transform="rotate(-25 24 38)"
              />

              {/* Bomb cap / collar */}
              <rect
                x="27"
                y="16"
                width="16"
                height="8"
                rx="3"
                fill="#334155"
                stroke="#475569"
                strokeWidth="1"
              />

              {/* Fuse path */}
              <path
                d="M43 16 C46 10, 52 12, 54 6 C56 0, 62 3, 66 -2"
                stroke="url(#fuseGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Animated fuse glow when running */}
              {isRunning && (
                <path
                  d="M43 16 C46 10, 52 12, 54 6 C56 0, 62 3, 66 -2"
                  stroke="#ffd700"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="8 32"
                  style={{
                    animation: "fuse-glow 0.8s linear infinite",
                    filter: "drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))",
                  }}
                />
              )}

              {/* Spark at end of fuse */}
              {isRunning && (
                <g>
                  {/* Outer glow */}
                  <circle
                    cx="66"
                    cy="-2"
                    r="6"
                    fill="rgba(255, 200, 0, 0.3)"
                    className="animate-pulse"
                  />
                  {/* Bright core */}
                  <circle
                    cx="66"
                    cy="-2"
                    r="3.5"
                    fill="#ffd700"
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(255, 215, 0, 0.9))",
                    }}
                  />
                  <circle cx="66" cy="-2" r="1.8" fill="#fff8e1" />
                  {/* Mini sparks */}
                  <circle cx="63" cy="-5" r="1" fill="#ffa000" opacity="0.7" className="animate-pulse" />
                  <circle cx="69" cy="0" r="0.8" fill="#ff6f00" opacity="0.6" className="animate-pulse" />
                </g>
              )}

              {/* Inactive fuse tip (when stopped) */}
              {!isRunning && (
                <circle cx="66" cy="-2" r="2" fill="#475569" />
              )}

              {/* Running glow around bomb body */}
              {isRunning && (
                <ellipse
                  cx="35"
                  cy="48"
                  rx="32"
                  ry="34"
                  fill="none"
                  stroke="rgba(255, 215, 0, 0.1)"
                  strokeWidth="4"
                  className="animate-pulse"
                />
              )}
            </g>
          </svg>

          {/* Timer display - overlaid on top of SVG */}
          <div className="relative z-10 flex flex-col items-center mt-16 md:mt-20">
            <div
              className={`
                font-[family-name:var(--font-jetbrains)] font-extrabold tracking-wider
                text-6xl md:text-8xl tabular-nums
                ${vs.textColor}
                ${vs.glowClass}
                ${isRunning && vs.zone !== "green" && vs.zone !== "red" ? "animate-digit-pulse" : ""}
                transition-colors duration-150
              `}
              style={{
                textShadow: vs.zone !== "green" ? vs.textShadow : undefined,
              }}
            >
              {vs.formattedTime}
            </div>

            {/* TARGET display */}
            <div className="mt-3 md:mt-4">
              <span
                className="font-[family-name:var(--font-orbitron)] text-xs md:text-sm tracking-[0.25em] uppercase text-[#00f0ff]/70"
                style={{
                  textShadow: "0 0 8px rgba(0, 240, 255, 0.2)",
                }}
              >
                TARGET: 10.000
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
