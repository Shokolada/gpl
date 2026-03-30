'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AttemptResult, HitResult } from '@/types/game';

interface ResultModalProps {
  result: AttemptResult;
  onClose: () => void;
}

const resultConfig: Record<
  HitResult,
  {
    title: string;
    subtitle?: string;
    bgGlow: string;
    textColor: string;
    borderColor: string;
    shadowColor: string;
  }
> = {
  perfect: {
    title: 'PERFECT!',
    bgGlow: 'from-yellow-500/30 via-amber-500/20 to-yellow-600/30',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-500/50',
    shadowColor: 'shadow-yellow-500/40',
  },
  success: {
    title: 'SUCCESS!',
    bgGlow: 'from-green-500/30 via-emerald-500/20 to-green-600/30',
    textColor: 'text-green-300',
    borderColor: 'border-green-500/50',
    shadowColor: 'shadow-green-500/40',
  },
  early: {
    title: 'TOO EARLY',
    subtitle: 'Free retry!',
    bgGlow: 'from-blue-500/30 via-slate-500/20 to-blue-600/30',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-500/50',
    shadowColor: 'shadow-blue-500/40',
  },
  miss: {
    title: 'MISS!',
    bgGlow: 'from-red-500/30 via-rose-500/20 to-red-600/30',
    textColor: 'text-red-300',
    borderColor: 'border-red-500/50',
    shadowColor: 'shadow-red-500/40',
  },
};

function ConfettiParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: Math.random() * -200 - 50,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    color: ['#FFD700', '#FFA500', '#FF6347', '#00FF88', '#00BFFF'][
      Math.floor(Math.random() * 5)
    ],
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            scale: p.scale,
            rotate: p.rotation,
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function ExplosionEffect() {
  const shards = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    return {
      id: i,
      x: Math.cos(angle) * 80,
      y: Math.sin(angle) * 80,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shards.map((s) => (
        <motion.div
          key={s.id}
          className="absolute left-1/2 top-1/2 h-3 w-1 rounded-full bg-red-400"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: s.x,
            y: s.y,
            opacity: [1, 0.8, 0],
            scale: [1, 0.5],
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function ResultModal({ result, onClose }: ResultModalProps) {
  const config = resultConfig[result.result];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          className={`relative z-10 mx-4 flex w-full max-w-sm flex-col items-center rounded-2xl border bg-gradient-to-b ${config.bgGlow} ${config.borderColor} ${config.shadowColor} bg-gray-900/90 p-8 shadow-2xl`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Confetti for PERFECT */}
          {result.result === 'perfect' && <ConfettiParticles />}

          {/* Explosion for MISS */}
          {result.result === 'miss' && <ExplosionEffect />}

          {/* Result Title */}
          <motion.h2
            className={`text-5xl font-black tracking-wider ${config.textColor}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 15 }}
          >
            {config.title}
          </motion.h2>

          {/* Subtitle (e.g. "Free retry!") */}
          {config.subtitle && (
            <motion.p
              className="mt-1 text-lg font-medium text-slate-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {config.subtitle}
            </motion.p>
          )}

          {/* Time Stopped */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Time Stopped
            </p>
            <p className="mt-1 font-mono text-3xl font-bold text-white">
              {result.timeStopped.toFixed(3)}s
            </p>
          </motion.div>

          {/* Pixels Earned */}
          {result.pixelsEarned > 0 && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
            >
              <span className="text-2xl font-black text-white">
                +{result.pixelsEarned} pixels!
              </span>
            </motion.div>
          )}

          {/* Streak Bonus */}
          {result.streakCount > 1 && (
            <motion.div
              className="mt-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <span className="rounded-full bg-orange-500/20 px-4 py-1.5 text-sm font-bold tracking-wide text-orange-300">
                x{result.streakMultiplier} STREAK BONUS!
              </span>
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.button
            className="mt-8 w-full rounded-xl bg-white/10 px-8 py-3 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/30"
            onClick={onClose}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.97 }}
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
