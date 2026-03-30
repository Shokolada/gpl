"use client";

import { useMemo } from "react";

interface BombStopwatchProps {
  time: number; // current time in seconds
  isRunning: boolean;
}

function getTimerColor(time: number): string {
  if (time < 9.5) return "text-white";
  if (time < 9.95) return "text-yellow-400";
  if (time <= 10.05) return "text-green-500";
  return "text-red-500";
}

function getGlowColor(time: number): string {
  if (time < 9.5) return "drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]";
  if (time < 9.95) return "drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]";
  if (time <= 10.05) return "drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]";
  return "drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]";
}

function formatTime(time: number): string {
  const seconds = Math.floor(time);
  const ms = Math.floor((time - seconds) * 1000);
  return `${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

export default function BombStopwatch({ time, isRunning }: BombStopwatchProps) {
  const timerColor = useMemo(() => getTimerColor(time), [time]);
  const glowEffect = useMemo(() => getGlowColor(time), [time]);
  const formattedTime = useMemo(() => formatTime(time), [time]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main container */}
      <div className="relative rounded-2xl bg-gray-950 border border-gray-800 px-10 py-8 shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
        {/* Subtle background glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none" />

        {/* Timer row */}
        <div className="relative flex items-center justify-center gap-5">
          {/* Bomb icon */}
          <div className={`text-5xl ${isRunning ? "animate-pulse" : ""}`}>
            <svg
              width="56"
              height="56"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={isRunning ? "animate-bounce" : ""}
              style={{ animationDuration: "1.5s" }}
            >
              {/* Bomb body */}
              <circle cx="30" cy="38" r="22" fill="#1F2937" stroke="#6B7280" strokeWidth="2" />
              <circle cx="30" cy="38" r="22" fill="url(#bombSheen)" />
              {/* Highlight */}
              <ellipse cx="22" cy="30" rx="6" ry="4" fill="rgba(255,255,255,0.08)" transform="rotate(-30 22 30)" />
              {/* Fuse neck */}
              <rect x="27" y="12" width="6" height="8" rx="1" fill="#6B7280" />
              {/* Fuse string */}
              <path
                d="M33 12 C36 8, 40 10, 42 6 C44 2, 48 4, 50 2"
                stroke="#A78BFA"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Spark / flame */}
              {isRunning && (
                <g className="animate-pulse">
                  <circle cx="50" cy="2" r="4" fill="#FBBF24" opacity="0.9" />
                  <circle cx="50" cy="2" r="2.5" fill="#F97316" />
                  <circle cx="50" cy="2" r="1.2" fill="#FEF3C7" />
                </g>
              )}
              <defs>
                <radialGradient id="bombSheen" cx="0.35" cy="0.35" r="0.65">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Timer display */}
          <div className={`font-mono text-7xl font-bold tracking-wider ${timerColor} ${glowEffect} transition-colors duration-150`}>
            {formattedTime}
          </div>
        </div>

        {/* Target display */}
        <div className="relative mt-4 text-center">
          <span className="font-mono text-sm tracking-widest text-gray-500 uppercase">
            Target: 10.000
          </span>
        </div>

        {/* Running indicator bar */}
        {isRunning && (
          <div className="absolute bottom-0 left-4 right-4 h-0.5 overflow-hidden rounded-full">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
