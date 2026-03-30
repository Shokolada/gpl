interface TeamBadgeProps {
  teamName: string;
  teamColor: string;
}

export default function TeamBadge({ teamName, teamColor }: TeamBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded-full border-2 border-white/30 shadow-[0_0_8px_var(--badge-color)]"
        style={
          {
            backgroundColor: teamColor,
            "--badge-color": `${teamColor}66`,
          } as React.CSSProperties
        }
      />
      <span className="text-sm font-bold text-white tracking-wide">
        {teamName}
      </span>
    </div>
  );
}
