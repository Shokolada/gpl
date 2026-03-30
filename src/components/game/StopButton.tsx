"use client";

interface StopButtonProps {
  isRunning: boolean;
  disabled: boolean;
  onPress: () => void;
}

export default function StopButton({
  isRunning,
  disabled,
  onPress,
}: StopButtonProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={`
        relative w-full min-h-[60px] rounded-2xl text-2xl font-black uppercase tracking-widest
        transition-all duration-200 select-none
        ${
          disabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600"
            : isRunning
            ? "bg-red-600 text-white border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.5)] active:scale-[0.97]"
            : "bg-green-600 text-white border-2 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:bg-green-500 active:scale-[0.97]"
        }
      `}
    >
      {/* Pulsing glow when running */}
      {isRunning && !disabled && (
        <div className="absolute inset-0 rounded-2xl bg-red-500/40 animate-ping pointer-events-none" />
      )}

      {/* Inner gradient shine */}
      {!disabled && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      )}

      <span className="relative z-10">
        {disabled ? "NO AMMO" : isRunning ? "STOP!" : "START"}
      </span>
    </button>
  );
}
