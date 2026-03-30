interface TeamBadgeProps {
  teamName: string;
  teamColor: string;
}

export default function TeamBadge({ teamName, teamColor }: TeamBadgeProps) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5"
      style={{
        backgroundColor: "#1c1f27",
        borderTop: "2px solid #4a4f5a",
        borderLeft: "2px solid #4a4f5a",
        borderBottom: "2px solid #15181e",
        borderRight: "2px solid #15181e",
      }}
    >
      {/* TEAM label */}
      <span
        className="text-[8px] font-[family-name:var(--font-orbitron)] font-medium uppercase tracking-[0.2em]"
        style={{ color: "#6b7280" }}
      >
        TEAM
      </span>

      <div className="flex items-center gap-2">
        {/* Team color circle — no glow */}
        <div
          className="w-4 h-4 rounded-full border-2"
          style={{
            backgroundColor: teamColor,
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        />

        {/* Team name */}
        <span className="text-sm font-bold text-white tracking-wide">
          {teamName}
        </span>
      </div>
    </div>
  );
}
