interface TeamBadgeProps {
  teamName: string;
  teamColor: string;
  flagStripes?: string[];
}

export default function TeamBadge({ teamName, teamColor, flagStripes }: TeamBadgeProps) {
  return (
    <div
      className="panel-raised flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 sm:gap-1 sm:px-2.5"
    >
      {/* TEAM label */}
      <span
        className="text-[7px] font-[family-name:var(--font-orbitron)] font-medium uppercase tracking-[0.2em] sm:text-[8px]"
        style={{ color: "#6b7280" }}
      >
        TEAM
      </span>

      <div className="flex items-center gap-1.5">
        {/* Team color circle with flag stripes */}
        <div
          className="w-4 h-4 rounded-full border border-white/20 overflow-hidden"
          style={{
            backgroundColor: teamColor,
          }}
        >
          {flagStripes && flagStripes.length > 1 && (
            <div className="flex flex-col w-full h-full">
              {flagStripes.map((stripe, i) => (
                <div
                  key={i}
                  className="w-full"
                  style={{
                    backgroundColor: stripe,
                    flex: 1,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Team name — truncated for long names */}
        <span className="text-[11px] font-bold text-white tracking-wide max-w-[60px] truncate sm:max-w-[80px] sm:text-sm">
          {teamName}
        </span>
      </div>
    </div>
  );
}
