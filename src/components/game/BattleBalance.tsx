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
      {/* Sunken panel container — inset bevel */}
      <div
        className="rounded-lg px-2.5 py-1.5"
        style={{
          backgroundColor: "#1c1f27",
          borderTop: "2px solid #15181e",
          borderLeft: "2px solid #15181e",
          borderBottom: "2px solid #4a4f5a",
          borderRight: "2px solid #4a4f5a",
        }}
      >
        {/* BATTLE BALANCE label */}
        <p
          className="text-center mb-1 text-[9px] font-[family-name:var(--font-orbitron)] font-medium uppercase tracking-[0.2em]"
          style={{ color: "#6b7280" }}
        >
          BATTLE BALANCE
        </p>

        {/* Team names and percentages */}
        <div className="flex items-center justify-between mb-1">
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
          style={{ backgroundColor: "#0a0c10" }}
        >
          {/* Side A fill (from left) */}
          <div
            className={`absolute inset-y-0 left-0 rounded-l-full transition-all duration-500 ease-out ${
              sideADominant ? "animate-bar-pulse-glow" : ""
            }`}
            style={{
              width: `${sideAPercent}%`,
              backgroundColor: sideAColor,
            }}
          />

          {/* Side B fill (from right) */}
          <div
            className={`absolute inset-y-0 right-0 rounded-r-full transition-all duration-500 ease-out ${
              sideBDominant ? "animate-bar-pulse-glow" : ""
            }`}
            style={{
              width: `${sideBPercent}%`,
              backgroundColor: sideBColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
