"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Arena,
  TeamSide,
  AttemptResult,
  evaluateHit,
  getStreakMultiplier,
  SCORING,
} from "@/types/game";
import { useStopwatch } from "@/hooks/useStopwatch";
import SoundManager from "@/lib/audio/SoundManager";
import BombStopwatch from "@/components/game/BombStopwatch";
import PixelCanvas from "@/components/game/PixelCanvas";
import PixelSiphon from "@/components/game/PixelSiphon";
import ResultModal from "@/components/game/ResultModal";
import BattleBalance from "@/components/game/BattleBalance";
import StopButton from "@/components/game/StopButton";
import AmmoCounter from "@/components/game/AmmoCounter";
import TeamBadge from "@/components/game/TeamBadge";
import StreakCounter from "@/components/game/StreakCounter";

interface BattleViewProps {
  arena: Arena;
}

const MAX_BOMBS = 5;

export default function BattleView({ arena: initialArena }: BattleViewProps) {
  // ══════════════════════════════════════════════
  // ALL GAME LOGIC — PRESERVED EXACTLY AS-IS
  // ══════════════════════════════════════════════

  // Team selection
  const [playerTeam, setPlayerTeam] = useState<TeamSide | null>(null);

  // Arena state (local for now)
  const [sideACaptured, setSideACaptured] = useState(initialArena.sideACaptured);
  const [sideBCaptured, setSideBCaptured] = useState(initialArena.sideBCaptured);

  // Game state
  const [bombsCount, setBombsCount] = useState(MAX_BOMBS);
  const [streak, setStreak] = useState(0);
  const [lastResult, setLastResult] = useState<AttemptResult | null>(null);
  const [showSiphon, setShowSiphon] = useState(false);
  const [siphonPixels, setSiphonPixels] = useState(0);

  // Sound manager ref
  const soundRef = useRef<SoundManager | null>(null);

  // Stopwatch
  const { time, isRunning, start, stop, reset } = useStopwatch();

  // Initialize sound manager on first user interaction
  const initSound = useCallback(() => {
    if (!soundRef.current) {
      const sm = SoundManager.getInstance();
      sm.init();
      soundRef.current = sm;
    }
  }, []);

  // Determine sides based on player team
  const playerSide = playerTeam === "side_a" ? initialArena.sideA : initialArena.sideB;
  const opponentSide = playerTeam === "side_a" ? initialArena.sideB : initialArena.sideA;

  // Which captured count belongs to the player (pixels captured BY the player)
  const playerCaptured = playerTeam === "side_a" ? sideACaptured : sideBCaptured;
  const opponentCaptured = playerTeam === "side_a" ? sideBCaptured : sideACaptured;

  // Siphon direction: pixels flow from opponent (top) to player (bottom) on mobile
  const siphonDirection: "down" | "up" = "down";

  // Handle team selection
  const handleSelectTeam = useCallback(
    (team: TeamSide) => {
      initSound();
      soundRef.current?.play("buttonClick");
      setPlayerTeam(team);
    },
    [initSound]
  );

  // Handle START/STOP press
  const handleButtonPress = useCallback(() => {
    initSound();

    if (!isRunning) {
      // START
      soundRef.current?.play("buttonClick");
      reset();
      start();
    } else {
      // STOP
      const stoppedTime = stop();
      const { result, basePixels } = evaluateHit(stoppedTime);

      let newStreak = streak;
      let pixelsEarned = 0;
      let newBombs = bombsCount;

      switch (result) {
        case "perfect":
        case "success": {
          newStreak = streak + 1;
          const multiplier = getStreakMultiplier(newStreak);
          pixelsEarned = Math.round(basePixels * multiplier);

          // Comeback bonus
          const totalPixels = initialArena.totalPixels;
          const playerPct = playerCaptured / totalPixels;
          if (playerPct < SCORING.COMEBACK_THRESHOLD && result === "success") {
            pixelsEarned += SCORING.COMEBACK_PIXELS;
          }

          // Update captured pixels
          if (playerTeam === "side_a") {
            setSideACaptured((prev) => Math.min(prev + pixelsEarned, totalPixels));
          } else {
            setSideBCaptured((prev) => Math.min(prev + pixelsEarned, totalPixels));
          }

          // Play sounds
          soundRef.current?.play(result);
          if (newStreak >= 2) {
            setTimeout(() => soundRef.current?.play("streakUp"), 300);
          }

          // Trigger siphon animation
          setSiphonPixels(Math.min(pixelsEarned, 30));
          setShowSiphon(true);

          break;
        }
        case "early": {
          // Free retry - no bomb lost, streak resets
          newStreak = 0;
          soundRef.current?.play("early");
          break;
        }
        case "miss": {
          // Lose a bomb, streak resets
          newStreak = 0;
          newBombs = Math.max(0, bombsCount - 1);
          soundRef.current?.play("miss");
          break;
        }
      }

      setStreak(newStreak);
      setBombsCount(newBombs);

      const attemptResult: AttemptResult = {
        result,
        timeStopped: stoppedTime,
        pixelsEarned,
        streakCount: newStreak,
        streakMultiplier: getStreakMultiplier(newStreak),
      };

      setLastResult(attemptResult);
    }
  }, [
    initSound,
    isRunning,
    start,
    stop,
    reset,
    streak,
    bombsCount,
    playerTeam,
    playerCaptured,
    initialArena.totalPixels,
  ]);

  // Close result modal
  const handleCloseResult = useCallback(() => {
    setLastResult(null);
    reset();
  }, [reset]);

  // Siphon complete handler
  const handleSiphonComplete = useCallback(() => {
    setShowSiphon(false);
    soundRef.current?.play("pixelDrop");
  }, []);

  // Play tick sounds as timer approaches target
  useEffect(() => {
    if (!isRunning || !soundRef.current) return;

    // Play escalating ticks from 9.0s onward
    if (time >= 9.0 && time < 10.5) {
      const tempo = Math.min(1, (time - 9.0) / 1.0);
      // Only play every ~200ms
      const interval = Math.max(80, 200 - tempo * 120);
      const lastTick = Math.floor(time * 1000 / interval);
      const prevTick = Math.floor((time - 0.016) * 1000 / interval);
      if (lastTick !== prevTick) {
        soundRef.current.playTick(tempo);
      }
    }
  }, [time, isRunning]);

  // ══════════════════════════════════════════════
  // TEAM SELECTION SCREEN
  // ══════════════════════════════════════════════
  if (playerTeam === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#181b22]">
        <motion.div
          className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-medium uppercase tracking-[0.25em] text-[#6b7280]">
              {initialArena.name}
            </h2>
            <h1 className="mt-3 font-[family-name:var(--font-orbitron)] text-3xl font-black tracking-wide text-white sm:text-4xl">
              Choose Your Side
            </h1>
          </motion.div>

          <div className="flex w-full items-center gap-3 sm:gap-5">
            {/* Side A Button */}
            <motion.button
              className="group relative flex-1 overflow-hidden rounded-xl p-5 text-center sm:p-7"
              style={{
                backgroundColor: "#1c1f27",
                borderTop: "2px solid #4a4f5a",
                borderLeft: "2px solid #4a4f5a",
                borderBottom: "2px solid #15181e",
                borderRight: "2px solid #15181e",
              }}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 20 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelectTeam("side_a")}
            >
              {/* Flag circle */}
              <div className="relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-white/20 sm:h-20 sm:w-20">
                {initialArena.sideA.flagStripes && initialArena.sideA.flagStripes.length > 1 ? (
                  <div className="flex flex-col w-full h-full">
                    {initialArena.sideA.flagStripes.map((s, i) => (
                      <div key={i} style={{ backgroundColor: s, flex: 1 }} />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: initialArena.sideA.color }} />
                )}
              </div>
              <p className="relative font-[family-name:var(--font-orbitron)] text-lg font-bold text-white sm:text-xl">
                {initialArena.sideA.name}
              </p>
            </motion.button>

            <motion.span
              className="shrink-0 font-[family-name:var(--font-orbitron)] text-2xl font-black text-[#4a4f5a] sm:text-3xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              VS
            </motion.span>

            {/* Side B Button */}
            <motion.button
              className="group relative flex-1 overflow-hidden rounded-xl p-5 text-center sm:p-7"
              style={{
                backgroundColor: "#1c1f27",
                borderTop: "2px solid #4a4f5a",
                borderLeft: "2px solid #4a4f5a",
                borderBottom: "2px solid #15181e",
                borderRight: "2px solid #15181e",
              }}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 20 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelectTeam("side_b")}
            >
              {/* Flag circle */}
              <div className="relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-white/20 sm:h-20 sm:w-20">
                {initialArena.sideB.flagStripes && initialArena.sideB.flagStripes.length > 1 ? (
                  <div className="flex flex-col w-full h-full">
                    {initialArena.sideB.flagStripes.map((s, i) => (
                      <div key={i} style={{ backgroundColor: s, flex: 1 }} />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: initialArena.sideB.color }} />
                )}
              </div>
              <p className="relative font-[family-name:var(--font-orbitron)] text-lg font-bold text-white sm:text-xl">
                {initialArena.sideB.name}
              </p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate capture percentages for display
  const playerCapturePercent = initialArena.totalPixels > 0
    ? Math.round((playerCaptured / initialArena.totalPixels) * 100)
    : 0;
  const opponentIntactPercent = initialArena.totalPixels > 0
    ? Math.round(((initialArena.totalPixels - playerCaptured) / initialArena.totalPixels) * 100)
    : 100;
  const playerIntactPercent = initialArena.totalPixels > 0
    ? Math.round(((initialArena.totalPixels - opponentCaptured) / initialArena.totalPixels) * 100)
    : 100;

  // ══════════════════════════════════════════════
  // MAIN BATTLE SCREEN — Mobile Portrait Primary
  // Uses dvh for true viewport fit on mobile
  // ══════════════════════════════════════════════
  return (
    <div className="relative flex h-dvh flex-col bg-[#181b22] text-white overflow-hidden">
      {/* ── Header: Title + Battle Balance ── */}
      <div className="relative z-20 shrink-0 px-3 pt-2 pb-1 sm:px-4">
        {/* Title row with back link */}
        <div className="flex items-center justify-between mb-1">
          <a
            href="/"
            className="shrink-0 font-[family-name:var(--font-jetbrains)] text-[10px] text-[#6b7280] transition-colors hover:text-white"
          >
            &larr; arenas
          </a>
          <h1
            className="text-center font-[family-name:var(--font-orbitron)] text-sm font-black uppercase tracking-[0.1em] text-white sm:text-lg md:text-xl"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
          >
            Global Precision League
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Battle Balance */}
        <BattleBalance
          sideAName={initialArena.sideA.name}
          sideBName={initialArena.sideB.name}
          sideAColor={initialArena.sideA.color}
          sideBColor={initialArena.sideB.color}
          sideACaptured={sideACaptured}
          sideBCaptured={sideBCaptured}
          totalPixels={initialArena.totalPixels}
        />
      </div>

      {/* ── Main Content: Maps + Stopwatch — fills remaining space ── */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-2 min-h-0 sm:px-3">
        {/* Siphon animation overlay */}
        <PixelSiphon
          isActive={showSiphon}
          pixelCount={siphonPixels}
          fromColor={opponentSide.color}
          toColor={playerSide.color}
          direction={siphonDirection}
          onComplete={handleSiphonComplete}
        />

        {/* Mobile Portrait: stacked vertically | Desktop: 3-column grid */}
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-1 md:grid-cols-[1fr_auto_1fr] md:gap-3">
          {/* Opponent Map (top on mobile, left on desktop) */}
          <div className="order-1">
            <div
              className="panel-raised grid-texture relative rounded-lg p-1 overflow-hidden"
            >
              <PixelCanvas
                totalPixels={initialArena.totalPixels}
                capturedPixels={playerCaptured}
                color={opponentSide.color}
                secondaryColor={opponentSide.secondaryColor}
                label={opponentSide.name}
                className="w-full"
                clipPolygon={opponentSide.clipPolygon}
                flagStripes={opponentSide.flagStripes}
              />
              {/* Capture overlay text */}
              {playerCapturePercent > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p
                    className="text-center font-[family-name:var(--font-orbitron)] text-xs font-black uppercase leading-tight text-white sm:text-sm md:text-lg"
                    style={{
                      textShadow: "0 0 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {playerSide.name}: {playerCapturePercent}%<br />
                    OF {opponentSide.name} CAPTURED
                  </p>
                </div>
              )}
            </div>
            <p className="mt-0.5 text-center font-[family-name:var(--font-orbitron)] text-[8px] font-medium uppercase tracking-wider text-[#6b7280] sm:text-[9px]">
              {opponentSide.name} FLAG (INTACT): {opponentIntactPercent}%
            </p>
          </div>

          {/* Streak + Bomb/Timer (center) */}
          <div className="order-2 flex flex-col items-center gap-0">
            <div className="flex h-7 items-center">
              <StreakCounter
                streak={streak}
                multiplier={getStreakMultiplier(streak)}
              />
            </div>
            <BombStopwatch time={time} isRunning={isRunning} />
          </div>

          {/* Player Map (bottom on mobile, right on desktop) */}
          <div className="order-3">
            <div
              className="panel-raised grid-texture relative rounded-lg p-1 overflow-hidden"
            >
              <PixelCanvas
                totalPixels={initialArena.totalPixels}
                capturedPixels={opponentCaptured}
                color={playerSide.color}
                secondaryColor={playerSide.secondaryColor}
                label={playerSide.name}
                className="w-full"
                clipPolygon={playerSide.clipPolygon}
                flagStripes={playerSide.flagStripes}
              />
            </div>
            <p className="mt-0.5 text-center font-[family-name:var(--font-orbitron)] text-[8px] font-medium uppercase tracking-wider text-[#6b7280] sm:text-[9px]">
              {playerSide.name} FLAG (INTACT): {playerIntactPercent}%
            </p>
          </div>
        </div>
      </div>

      {/* ── ACTION ZONE divider ── */}
      <div className="relative z-20 px-3 py-0.5 shrink-0">
        <div className="mx-auto flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-[#4a4f5a]" />
          <p className="text-center font-[family-name:var(--font-orbitron)] text-[8px] font-medium uppercase tracking-[0.25em] text-[#6b7280]">
            Action Zone
          </p>
          <div className="h-px w-8 bg-[#4a4f5a]" />
        </div>
      </div>

      {/* ── Bottom Action Bar — fixed, always visible, thumb-accessible ── */}
      <div className="relative z-20 shrink-0 px-3 pb-2 safe-bottom sm:px-4">
        <div
          className="panel-raised rounded-xl px-3 py-2"
        >
          <div className="mx-auto flex w-full max-w-5xl items-center gap-2">
            <div className="shrink-0">
              <AmmoCounter count={bombsCount} maxBombs={MAX_BOMBS} />
            </div>
            <div className="flex-1">
              <StopButton
                isRunning={isRunning}
                disabled={bombsCount <= 0 && !isRunning}
                onPress={handleButtonPress}
              />
            </div>
            <div className="shrink-0">
              <TeamBadge teamName={playerSide.name} teamColor={playerSide.color} flagStripes={playerSide.flagStripes} />
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal overlay */}
      <AnimatePresence>
        {lastResult && (
          <ResultModal result={lastResult} onClose={handleCloseResult} />
        )}
      </AnimatePresence>
    </div>
  );
}
