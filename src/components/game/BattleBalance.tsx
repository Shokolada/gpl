"use client";

import { useMemo } from "react";

interface BattleBalanceProps {
  sideAName: string;
  sideBName: string;
  sideAColor: string;
  sideBColor: string;
  sideACaptured: number;
  sideBCaptured: number;
  totalPixels: number;
}

export default function BattleBalance({
  sideAName,
  sideBName,
  sideAColor,
  sideBColor,
  sideACaptured,
  sideBCaptured,
  totalPixels,
}: BattleBalanceProps) {
  const { sideAPercent, sideBPercent } = useMemo(() => {
    if (totalPixels === 0) return { sideAPercent: 50, sideBPercent: 50 };

    const sideATerritory = totalPixels - sideBCaptured + sideACaptured;
    const sideBTerritory = totalPixels - sideACaptured + sideBCaptured;
    const total = sideATerritory + sideBTerritory;

    return {
      sideAPercent: Math.round((sideATerritory / total) * 100),
      sideBPercent: Math.round((sideBTerritory / total) * 100),
    };
  }, [sideACaptured, sideBCaptured, totalPixels]);

  const sideADominant = sideAPercent > 80;
  const sideBDominant = sideBPercent > 80;

  return (
    <div className="w-full">
      {/* Glass container */}
      <div
        className="rounded-lg px-3 py-2.5"
        style={{
          background: "rgba(10, 15, 30, 0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {/* Team names and percentages */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-[family-name:var(--font-orbitron)] font-semibold uppercase tracking-wider"
              style={{ color: sideAColor }}
            >
              {sideAName}
            </span>
            <span
              className="text-sm font-[family-name:var(--font-jetbrains)] font-bold"
              style={{ color: sideAColor }}
            >
              {sideAPercent}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-sm font-[family-name:var(--font-jetbrains)] font-bold"
              style={{ color: sideBColor }}
            >
              {sideBPercent}%
            </span>
            <span
              className="text-[11px] font-[family-name:var(--font-orbitron)] font-semibold uppercase tracking-wider"
              style={{ color: sideBColor }}
            >
              {sideBName}
            </span>
          </div>
        </div>

        {/* Progress bar track */}
        <div
          className="relative h-2 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: "#0a0f1e" }}
        >
          {/* Side A fill (from left) */}
          <div
            className={`absolute inset-y-0 left-0 rounded-l-full transition-all duration-500 ease-out ${
              sideADominant ? "animate-bar-pulse-glow" : ""
            }`}
            style={{
              width: `${sideAPercent}%`,
              background: `linear-gradient(90deg, ${sideAColor}cc, ${sideAColor})`,
              boxShadow: `0 0 8px ${sideAColor}88, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          />

          {/* Side B fill (from right) */}
          <div
            className={`absolute inset-y-0 right-0 rounded-r-full transition-all duration-500 ease-out ${
              sideBDominant ? "animate-bar-pulse-glow" : ""
            }`}
            style={{
              width: `${sideBPercent}%`,
              background: `linear-gradient(270deg, ${sideBColor}cc, ${sideBColor})`,
              boxShadow: `0 0 8px ${sideBColor}88, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          />

          {/* Edge glow - Side A */}
          <div
            className="absolute inset-y-0 transition-all duration-500"
            style={{
              left: `${sideAPercent - 1}%`,
              width: "2px",
              background: sideAColor,
              boxShadow: `0 0 6px ${sideAColor}, 0 0 12px ${sideAColor}88`,
            }}
          />

          {/* Edge glow - Side B */}
          <div
            className="absolute inset-y-0 transition-all duration-500"
            style={{
              right: `${sideBPercent - 1}%`,
              width: "2px",
              background: sideBColor,
              boxShadow: `0 0 6px ${sideBColor}, 0 0 12px ${sideBColor}88`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
