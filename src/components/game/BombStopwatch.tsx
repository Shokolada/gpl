"use client";

import { useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BombStopwatchProps {
  time: number;
  isRunning: boolean;
}

type Zone = "safe" | "warning" | "red";

interface VisualState {
  zone: Zone;
  progress: number;
  formattedTime: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeVisualState(time: number): VisualState {
  const progress = Math.min(time / 10, 1);

  let zone: Zone = "safe";
  if (time > 10.05) zone = "red";
  else if (time > 9.0) zone = "warning";

  const seconds = Math.floor(time);
  const ms = Math.floor((time - seconds) * 1000);
  const formattedTime = `${String(seconds).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;

  return { zone, progress, formattedTime };
}

// ─── Inline Keyframes ────────────────────────────────────────────────────────

const keyframesCSS = `
@keyframes bomb-shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-3px) rotate(-1deg); }
  20% { transform: translateX(3px) rotate(1deg); }
  30% { transform: translateX(-3px) rotate(-0.5deg); }
  40% { transform: translateX(3px) rotate(0.5deg); }
  50% { transform: translateX(-2px) rotate(-0.5deg); }
  60% { transform: translateX(2px) rotate(0.5deg); }
  70% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
  90% { transform: translateX(-1px); }
}

@keyframes digit-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.82; }
}

@keyframes spark-flicker {
  0%, 100% { opacity: 1; transform: scale(1) translate(0, 0); }
  15% { opacity: 0.5; transform: scale(0.7) translate(1px, -1px); }
  30% { opacity: 1; transform: scale(1.3) translate(-1px, 0); }
  50% { opacity: 0.6; transform: scale(0.85) translate(0, 1px); }
  70% { opacity: 1; transform: scale(1.15) translate(1px, -1px); }
  85% { opacity: 0.7; transform: scale(0.9) translate(-1px, 0); }
}

@keyframes fuse-ember {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
`;

// ─── Bomb SVG ────────────────────────────────────────────────────────────────

function BombSVG({ isRunning }: { isRunning: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[130px] md:h-[130px]"
      style={{ position: "relative", zIndex: 2 }}
      aria-hidden="true"
    >
      <defs>
        {/* 3D sphere gradient for bomb body */}
        <radialGradient id="bsw-bombBody" cx="38%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="25%" stopColor="#2e2e2e" />
          <stop offset="60%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#080808" />
        </radialGradient>

        {/* Specular highlight on sphere */}
        <radialGradient id="bsw-bombHL" cx="32%" cy="28%" r="22%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Metallic cap */}
        <linearGradient id="bsw-capGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#999999" />
          <stop offset="35%" stopColor="#6e6e6e" />
          <stop offset="70%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>

        {/* Spark radial gradient */}
        <radialGradient id="bsw-sparkGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#ffee00" />
          <stop offset="55%" stopColor="#ffaa00" />
          <stop offset="100%" stopColor="#ff4400" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* --- Fuse (curved line from cap to tip) --- */}
      <path
        d="M 100 58 Q 106 38, 128 28 Q 150 18, 158 8"
        fill="none"
        stroke={isRunning ? "#5c4a3a" : "#4a4a4a"}
        strokeWidth="3.5"
        strokeLinecap="round"
        style={isRunning ? { animation: "fuse-ember 0.3s ease-in-out infinite" } : undefined}
      />

      {/* --- Spark at fuse tip --- */}
      {isRunning ? (
        <g style={{ animation: "spark-flicker 0.18s ease-in-out infinite" }}>
          {/* Outer glow halo */}
          <circle cx="158" cy="8" r="12" fill="url(#bsw-sparkGrad)" opacity={0.35} />
          {/* Mid flame */}
          <circle cx="158" cy="8" r="6" fill="url(#bsw-sparkGrad)" />
          {/* White-hot core */}
          <circle cx="158" cy="8" r="2.5" fill="#ffffff" />
        </g>
      ) : (
        <circle cx="158" cy="8" r="3" fill="#5a5a5a" />
      )}

      {/* --- Metallic collar / cap --- */}
      <rect
        x="87"
        y="54"
        width="26"
        height="14"
        rx="3"
        fill="url(#bsw-capGrad)"
        stroke="#5a5a5a"
        strokeWidth="0.6"
      />
      {/* Ridge details on cap */}
      <line x1="90" y1="58" x2="110" y2="58" stroke="#8a8a8a" strokeWidth="0.5" opacity={0.4} />
      <line x1="90" y1="62" x2="110" y2="62" stroke="#8a8a8a" strokeWidth="0.5" opacity={0.4} />

      {/* --- Bomb body (circle sphere) --- */}
      <circle cx="100" cy="130" r="64" fill="url(#bsw-bombBody)" />
      {/* Highlight overlay */}
      <circle cx="100" cy="130" r="64" fill="url(#bsw-bombHL)" />
      {/* Subtle edge definition */}
      <circle cx="100" cy="130" r="64" fill="none" stroke="#222222" strokeWidth="1" />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BombStopwatch({ time, isRunning }: BombStopwatchProps) {
  const vs = useMemo(() => computeVisualState(time), [time]);

  const isShaking = vs.zone === "red";

  return (
    <>
      <style>{keyframesCSS}</style>

      <div
        className="flex flex-col items-center justify-center select-none"
        style={
          isShaking
            ? {
                animation: "bomb-shake 0.4s ease-in-out infinite",
              }
            : undefined
        }
      >
        {/* Bomb graphic — overlaps the top of the circular display */}
        <div className="relative" style={{ marginBottom: "-38px", zIndex: 2 }}>
          <BombSVG isRunning={isRunning} />
        </div>

        {/* ---- Circular LED Display ---- */}
        <div
          className="relative w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] md:w-[340px] md:h-[340px]"
          style={{ zIndex: 1 }}
        >
          {/* Outer beveled metallic rim */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(135deg, #4a4f5a 0%, #3a3e48 30%, #2a2d35 50%, #1e2128 70%, #15181e 100%)`,
              boxShadow: `
                0 2px 8px rgba(0,0,0,0.6),
                inset 0 1px 0 rgba(255,255,255,0.06)
              `,
            }}
          >
            {/* Second bevel ring for depth */}
            <div
              className="absolute inset-[5px] sm:inset-[7px] md:inset-[8px] rounded-full"
              style={{
                background: `linear-gradient(315deg, #4a4f5a 0%, #2a2d35 35%, #1e2128 65%, #15181e 100%)`,
              }}
            >
              {/* Inner dark LED surface with scanlines */}
              <div
                className="scanlines absolute inset-[4px] sm:inset-[5px] md:inset-[6px] rounded-full flex flex-col items-center justify-center"
                style={{
                  backgroundColor: "#0a0c10",
                  boxShadow: `inset 0 2px 12px rgba(0,0,0,0.8), inset 0 -1px 6px rgba(0,0,0,0.4)`,
                }}
              >
                {/* STOPWATCH label */}
                <div
                  className="text-[8px] sm:text-[9px] md:text-[11px] tracking-[0.3em] uppercase mb-3 sm:mb-4 md:mb-5"
                  style={{
                    color: "#6b7280",
                    fontFamily: "var(--font-orbitron, 'Orbitron'), 'JetBrains Mono', monospace",
                    letterSpacing: "0.3em",
                  }}
                >
                  STOPWATCH
                </div>

                {/* Timer digits container */}
                <div className="relative">
                  {/* Ghost segments — simulates unlit LED segments */}
                  <div
                    className="text-[32px] sm:text-[40px] md:text-[56px] leading-none tabular-nums"
                    style={{
                      fontFamily:
                        "var(--font-jetbrains, 'JetBrains Mono'), 'Courier New', monospace",
                      fontWeight: 700,
                      color: "#ff0000",
                      opacity: 0.06,
                      userSelect: "none",
                      letterSpacing: "2px",
                    }}
                    aria-hidden="true"
                  >
                    88.888
                  </div>

                  {/* Active LED digits — always red */}
                  <div
                    className="absolute inset-0 text-[32px] sm:text-[40px] md:text-[56px] leading-none tabular-nums"
                    style={{
                      fontFamily:
                        "var(--font-jetbrains, 'JetBrains Mono'), 'Courier New', monospace",
                      fontWeight: 700,
                      color: "#ff0000",
                      textShadow:
                        "0 0 10px rgba(255,0,0,0.5), 0 0 25px rgba(255,0,0,0.15)",
                      letterSpacing: "2px",
                      ...(isRunning
                        ? {
                            animation: "digit-pulse 1.4s ease-in-out infinite",
                          }
                        : {}),
                    }}
                  >
                    {vs.formattedTime}
                  </div>
                </div>

                {/* TARGET label */}
                <div
                  className="text-[8px] sm:text-[9px] md:text-[11px] tracking-[0.2em] uppercase mt-3 sm:mt-4 md:mt-5"
                  style={{
                    color: "#6b7280",
                    fontFamily: "var(--font-orbitron, 'Orbitron'), 'JetBrains Mono', monospace",
                    letterSpacing: "0.2em",
                  }}
                >
                  TARGET: 10.000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
