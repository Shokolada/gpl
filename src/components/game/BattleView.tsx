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
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050510]">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(0,240,255,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 60%, rgba(255,45,85,0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 20%, rgba(0,255,136,0.06) 0%, transparent 60%)",
            }}
            animate={{
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <motion.div
          className="relative z-10 flex w-full max-w-lg flex-col items-center gap-10 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Arena name */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h2
              className="font-[family-name:var(--font-orbitron)] text-sm font-medium uppercase tracking-[0.25em] text-[#00f0ff]"
              style={{ textShadow: "0 0 20px rgba(0,240,255,0.4)" }}
            >
              {initialArena.name}
            </h2>
            <h1 className="mt-4 font-[family-name:var(--font-orbitron)] text-3xl font-black tracking-wide text-white sm:text-4xl">
              Choose Your Side
            </h1>
          </motion.div>

          {/* Team cards row */}
          <div className="flex w-full items-center gap-3 sm:gap-5">
            {/* Side A */}
            <motion.button
              className="group relative flex-1 overflow-hidden rounded-2xl border border-white/10 p-5 text-center backdrop-blur-sm transition-colors sm:p-7"
              style={{
                backgroundColor: `${initialArena.sideA.color}08`,
              }}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{
                borderColor: initialArena.sideA.color,
                boxShadow: `0 0 40px ${initialArena.sideA.color}25, inset 0 0 30px ${initialArena.sideA.color}08`,
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelectTeam("side_a")}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at center, ${initialArena.sideA.color}15 0%, transparent 70%)`,
                }}
              />
              {/* Pulse circle */}
              <div className="relative mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16">
                <motion.div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{ backgroundColor: initialArena.sideA.color }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: initialArena.sideA.color }}
                />
              </div>
              <p className="relative font-[family-name:var(--font-orbitron)] text-lg font-bold text-white sm:text-xl">
                {initialArena.sideA.name}
              </p>
            </motion.button>

            {/* VS text */}
            <motion.span
              className="shrink-0 font-[family-name:var(--font-orbitron)] text-2xl font-black text-white/30 sm:text-3xl"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              VS
            </motion.span>

            {/* Side B */}
            <motion.button
              className="group relative flex-1 overflow-hidden rounded-2xl border border-white/10 p-5 text-center backdrop-blur-sm transition-colors sm:p-7"
              style={{
                backgroundColor: `${initialArena.sideB.color}08`,
              }}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{
                borderColor: initialArena.sideB.color,
                boxShadow: `0 0 40px ${initialArena.sideB.color}25, inset 0 0 30px ${initialArena.sideB.color}08`,
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelectTeam("side_b")}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at center, ${initialArena.sideB.color}15 0%, transparent 70%)`,
                }}
              />
              {/* Pulse circle */}
              <div className="relative mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16">
                <motion.div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{ backgroundColor: initialArena.sideB.color }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: initialArena.sideB.color }}
                />
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

  // ══════════════════════════════════════════════
  // MAIN BATTLE SCREEN
  // ══════════════════════════════════════════════
  return (
    <div className="relative flex min-h-screen flex-col bg-[#050510] text-white">
      {/* Vignette overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at center, transparent 0%, rgba(5,5,16,0.4) 60%, rgba(5,5,16,0.85) 100%)",
        }}
      />

      {/* Top: Battle Balance + Back link */}
      <div className="relative z-20 flex items-start justify-between px-4 pt-4 pb-2 sm:px-6">
        <div className="flex-1">
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
        <a
          href="/"
          className="ml-3 mt-1 shrink-0 font-[family-name:var(--font-jetbrains)] text-xs text-slate-600 transition-colors hover:text-[#00f0ff]"
        >
          &larr; arenas
        </a>
      </div>

      {/* Middle: Canvas + Stopwatch area (CSS Grid) */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        {/* Siphon animation overlay */}
        <PixelSiphon
          isActive={showSiphon}
          pixelCount={siphonPixels}
          fromColor={opponentSide.color}
          toColor={playerSide.color}
          direction={siphonDirection}
          onComplete={handleSiphonComplete}
        />

        {/* Responsive grid: mobile stacked, desktop 3-col */}
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6 lg:gap-10">
          {/* Opponent (victim) PixelCanvas */}
          <div className="order-1 md:order-1">
            <div
              className="rounded-xl border border-white/5 p-2 backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <PixelCanvas
                totalPixels={initialArena.totalPixels}
                capturedPixels={playerCaptured}
                color={opponentSide.color}
                secondaryColor={opponentSide.secondaryColor}
                label={opponentSide.name}
                className="w-full"
              />
            </div>
          </div>

          {/* Center: Stopwatch + Streak */}
          <div className="order-2 flex flex-col items-center gap-3 md:order-2">
            {/* Streak counter floats above stopwatch */}
            <div className="flex h-10 items-center">
              <StreakCounter
                streak={streak}
                multiplier={getStreakMultiplier(streak)}
              />
            </div>

            <BombStopwatch time={time} isRunning={isRunning} />
          </div>

          {/* Player (invader) PixelCanvas */}
          <div className="order-3 md:order-3">
            <div
              className="rounded-xl border border-white/5 p-2 backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <PixelCanvas
                totalPixels={initialArena.totalPixels}
                capturedPixels={opponentCaptured}
                color={playerSide.color}
                secondaryColor={playerSide.secondaryColor}
                label={playerSide.name}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Action bar (glass panel) */}
      <div
        className="relative z-20 border-t border-white/5 px-4 pb-6 pt-4 sm:px-6"
        style={{
          background:
            "linear-gradient(to top, rgba(10,15,30,0.95), rgba(10,15,30,0.7))",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Row: Ammo | StopButton | TeamBadge */}
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
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
            <TeamBadge teamName={playerSide.name} teamColor={playerSide.color} />
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
