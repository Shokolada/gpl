"use client";

interface AmmoCounterProps {
  count: number;
  maxBombs: number;
}

function getAmmoColor(count: number): string {
  if (count >= 3) return "text-green-400";
  if (count === 2) return "text-yellow-400";
  if (count === 1) return "text-red-400";
  return "text-gray-500";
}

function getGlowClass(count: number): string {
  if (count >= 3) return "drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]";
  if (count === 2) return "drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]";
  if (count === 1) return "drop-shadow-[0_0_6px_rgba(248,113,113,0.5)]";
  return "";
}

export default function AmmoCounter({ count, maxBombs }: AmmoCounterProps) {
  const colorClass = getAmmoColor(count);
  const glowClass = getGlowClass(count);

  return (
    <div className={`flex items-center gap-1.5 ${colorClass} ${glowClass}`}>
      {/* Bomb icon */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="30" cy="38" r="20" fill="currentColor" opacity="0.9" />
        <circle
          cx="30"
          cy="38"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="27" y="14" width="6" height="7" rx="1" fill="currentColor" opacity="0.7" />
        <path
          d="M33 14 C36 10, 40 12, 42 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <ellipse
          cx="23"
          cy="32"
          rx="5"
          ry="3"
          fill="rgba(255,255,255,0.15)"
          transform="rotate(-30 23 32)"
        />
      </svg>

      {/* Count display */}
      <span className="font-mono text-xl font-bold">
        x{count}
      </span>

      {/* Small pip indicators */}
      <div className="flex gap-0.5 ml-1">
        {Array.from({ length: maxBombs }, (_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < count ? "bg-current" : "bg-gray-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
