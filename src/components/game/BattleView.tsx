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

  // ──────────────────────────────────────────────
  // Team Selection Overlay
  // ──────────────────────────────────────────────
  if (playerTeam === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950" />

        <motion.div
          className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Arena name */}
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-400 uppercase tracking-widest">
              {initialArena.name}
            </h2>
            <h1 className="mt-2 text-3xl font-black text-white">
              Choose Your Side
            </h1>
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-4 w-full">
            {/* Side A button */}
            <motion.button
              className="flex-1 rounded-2xl border-2 px-4 py-6 text-center transition-colors"
              style={{
                borderColor: initialArena.sideA.color,
                backgroundColor: `${initialArena.sideA.color}15`,
              }}
              whileHover={{
                backgroundColor: `${initialArena.sideA.color}30`,
                scale: 1.02,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectTeam("side_a")}
            >
              <div
                className="w-10 h-10 rounded-full mx-auto mb-3"
                style={{ backgroundColor: initialArena.sideA.color }}
              />
              <p className="text-xl font-bold text-white">
                {initialArena.sideA.name}
              </p>
            </motion.button>

            {/* VS text */}
            <span className="text-2xl font-black text-gray-600">VS</span>

            {/* Side B button */}
            <motion.button
              className="flex-1 rounded-2xl border-2 px-4 py-6 text-center transition-colors"
              style={{
                borderColor: initialArena.sideB.color,
                backgroundColor: `${initialArena.sideB.color}15`,
              }}
              whileHover={{
                backgroundColor: `${initialArena.sideB.color}30`,
                scale: 1.02,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectTeam("side_b")}
            >
              <div
                className="w-10 h-10 rounded-full mx-auto mb-3"
                style={{ backgroundColor: initialArena.sideB.color }}
              />
              <p className="text-xl font-bold text-white">
                {initialArena.sideB.name}
              </p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Main Battle Screen
  // ──────────────────────────────────────────────
  return (
    <div className="relative flex flex-col min-h-screen bg-gray-950 text-white">
      {/* Top: Battle Balance */}
      <div className="px-4 pt-4 pb-2">
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

      {/* Middle: Canvas + Stopwatch area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4 relative">
        {/* Siphon animation overlay */}
        <PixelSiphon
          isActive={showSiphon}
          pixelCount={siphonPixels}
          fromColor={opponentSide.color}
          toColor={playerSide.color}
          direction={siphonDirection}
          onComplete={handleSiphonComplete}
        />

        {/* Desktop: side-by-side | Mobile: stacked */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* Opponent (victim) PixelCanvas */}
          <div className="w-full md:w-1/3">
            <PixelCanvas
              totalPixels={initialArena.totalPixels}
              capturedPixels={playerCaptured}
              color={opponentSide.color}
              secondaryColor={opponentSide.secondaryColor}
              label={opponentSide.name}
              className="w-full"
            />
          </div>

          {/* Center: Stopwatch + Streak */}
          <div className="flex flex-col items-center gap-3 md:w-1/3">
            {/* Streak counter floats above stopwatch */}
            <div className="h-10 flex items-center">
              <StreakCounter
                streak={streak}
                multiplier={getStreakMultiplier(streak)}
              />
            </div>

            <BombStopwatch time={time} isRunning={isRunning} />
          </div>

          {/* Player (invader) PixelCanvas */}
          <div className="w-full md:w-1/3">
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

      {/* Bottom: Action zone */}
      <div className="px-4 pb-6 pt-2">
        {/* Ammo + Team Badge row */}
        <div className="flex items-center justify-between mb-3">
          <AmmoCounter count={bombsCount} maxBombs={MAX_BOMBS} />
          <TeamBadge teamName={playerSide.name} teamColor={playerSide.color} />
        </div>

        {/* Stop Button */}
        <StopButton
          isRunning={isRunning}
          disabled={bombsCount <= 0 && !isRunning}
          onPress={handleButtonPress}
        />
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
