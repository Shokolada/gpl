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
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={available && lowAmmo ? "animate-ammo-pulse" : ""}
    >
      {/* Bomb body */}
      <circle
        cx="8"
        cy="10"
        r="5"
        fill={available ? "#d1d5db" : "#2a2d35"}
        opacity={available ? 0.9 : 0.3}
      />
      <circle
        cx="8"
        cy="10"
        r="5"
        fill="none"
        stroke={available ? "#9ca3af" : "#2a2d35"}
        strokeWidth="0.8"
        opacity={available ? 0.6 : 0.2}
      />
      {/* Fuse cap */}
      <rect
        x="6.8"
        y="4.5"
        width="2.4"
        height="2"
        rx="0.5"
        fill={available ? "#9ca3af" : "#2a2d35"}
        opacity={available ? 0.7 : 0.2}
      />
      {/* Fuse */}
      <path
        d="M9.2 4.5 C10 3.5, 11 3.8, 11.5 2.5"
        stroke={available ? "#9ca3af" : "#2a2d35"}
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity={available ? 0.5 : 0.15}
      />
      {/* Highlight */}
      {available && (
        <ellipse
          cx="6.5"
          cy="8.5"
          rx="1.5"
          ry="1"
          fill="rgba(255,255,255,0.2)"
          transform="rotate(-30 6.5 8.5)"
        />
      )}
    </svg>
  );
}

export default function AmmoCounter({ count, maxBombs }: AmmoCounterProps) {
  const lowAmmo = count <= 2 && count > 0;
  const empty = count === 0;

  return (
    <div
      className="panel-raised flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 sm:gap-1 sm:px-2.5"
    >
      {empty ? (
        <span
          className="text-[10px] font-[family-name:var(--font-jetbrains)] font-bold tracking-widest uppercase animate-ammo-pulse"
          style={{ color: "#cc0000" }}
        >
          EMPTY
        </span>
      ) : (
        <>
          <div className="flex items-center gap-0.5">
            <div className="flex items-center gap-px">
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
              className="ml-0.5 text-[11px] font-[family-name:var(--font-jetbrains)] font-bold"
              style={{ color: lowAmmo ? "#cc0000" : "#ffffff" }}
            >
              x{count}
            </span>
          </div>

          {/* Label */}
          <span
            className="text-[7px] font-[family-name:var(--font-orbitron)] font-medium uppercase tracking-wider sm:text-[8px]"
            style={{ color: "#6b7280" }}
          >
            Ammo
          </span>
        </>
      )}
    </div>
  );
}
