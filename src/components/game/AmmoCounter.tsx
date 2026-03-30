"use client";

interface AmmoCounterProps {
  count: number;
  maxBombs: number;
}

function BombIcon({
  available,
  lowAmmo,
}: {
  available: boolean;
  lowAmmo: boolean;
}) {
  const glowColor = lowAmmo ? "#ff2d55" : "#00f0ff";

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={available && lowAmmo ? "animate-ammo-pulse" : ""}
    >
      {/* Glow filter for available bombs */}
      {available && (
        <defs>
          <filter id={`bomb-glow-${lowAmmo ? "red" : "cyan"}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      <g filter={available ? `url(#bomb-glow-${lowAmmo ? "red" : "cyan"})` : undefined}>
        {/* Bomb body */}
        <circle
          cx="8"
          cy="10"
          r="5"
          fill={available ? glowColor : "#1a1f2e"}
          opacity={available ? 0.9 : 0.4}
        />
        <circle
          cx="8"
          cy="10"
          r="5"
          fill="none"
          stroke={available ? glowColor : "#2a2f3e"}
          strokeWidth="0.8"
          opacity={available ? 0.6 : 0.3}
        />
        {/* Fuse cap */}
        <rect
          x="6.8"
          y="4.5"
          width="2.4"
          height="2"
          rx="0.5"
          fill={available ? glowColor : "#1a1f2e"}
          opacity={available ? 0.7 : 0.3}
        />
        {/* Fuse */}
        <path
          d="M9.2 4.5 C10 3.5, 11 3.8, 11.5 2.5"
          stroke={available ? glowColor : "#2a2f3e"}
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity={available ? 0.5 : 0.2}
        />
        {/* Highlight */}
        {available && (
          <ellipse
            cx="6.5"
            cy="8.5"
            rx="1.5"
            ry="1"
            fill="rgba(255,255,255,0.15)"
            transform="rotate(-30 6.5 8.5)"
          />
        )}
      </g>
    </svg>
  );
}

export default function AmmoCounter({ count, maxBombs }: AmmoCounterProps) {
  const lowAmmo = count <= 2 && count > 0;
  const empty = count === 0;

  return (
    <div className="flex items-center gap-1.5">
      {/* Bomb icons row */}
      {empty ? (
        <span
          className="text-[10px] font-[family-name:var(--font-jetbrains)] font-bold tracking-widest uppercase animate-ammo-pulse"
          style={{ color: "#ff2d55" }}
        >
          EMPTY
        </span>
      ) : (
        <>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: maxBombs }, (_, i) => (
              <BombIcon
                key={i}
                available={i < count}
                lowAmmo={lowAmmo && i < count}
              />
            ))}
          </div>

          {/* Counter text */}
          <span
            className="text-xs font-[family-name:var(--font-jetbrains)] font-bold"
            style={{ color: lowAmmo ? "#ff2d55" : "#00f0ff" }}
          >
            x{count}
          </span>
        </>
      )}
    </div>
  );
}
