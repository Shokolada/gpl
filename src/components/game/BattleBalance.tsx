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

    // Side A's territory = totalPixels - pixels captured BY side B (what B took from A)
    // Side B's territory = totalPixels - pixels captured BY side A (what A took from B)
    // For the balance bar, we show how much each side controls overall:
    // Side A controls: totalPixels - sideBCaptured (its remaining) + sideACaptured (what it took)
    const sideATerritory = totalPixels - sideBCaptured + sideACaptured;
    const sideBTerritory = totalPixels - sideACaptured + sideBCaptured;
    const total = sideATerritory + sideBTerritory;

    return {
      sideAPercent: Math.round((sideATerritory / total) * 100),
      sideBPercent: Math.round((sideBTerritory / total) * 100),
    };
  }, [sideACaptured, sideBCaptured, totalPixels]);

  return (
    <div className="w-full">
      {/* Team names and percentages */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: sideAColor }}
          />
          <span className="text-sm font-bold text-white">{sideAName}</span>
          <span className="text-xs font-mono text-gray-400">
            {sideAPercent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">
            {sideBPercent}%
          </span>
          <span className="text-sm font-bold text-white">{sideBName}</span>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: sideBColor }}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 w-full rounded-full overflow-hidden bg-gray-800 border border-gray-700">
        {/* Side A fill (from left) */}
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
          style={{
            width: `${sideAPercent}%`,
            backgroundColor: sideAColor,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
        </div>

        {/* Side B fill (from right) */}
        <div
          className="absolute inset-y-0 right-0 transition-all duration-700 ease-out"
          style={{
            width: `${sideBPercent}%`,
            backgroundColor: sideBColor,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
        </div>

        {/* Center divider line */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/30 -translate-x-1/2 z-10" />
      </div>
    </div>
  );
}
