'use client';

import { useMemo } from 'react';
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
    color: string;
    textColorClass: string;
    borderColor: string;
  }
> = {
  perfect: {
    title: 'PERFECT!',
    subtitle: 'JACKPOT!',
    color: '#ffcc00',
    textColorClass: 'text-[#ffcc00]',
    borderColor: '#ffcc00',
  },
  success: {
    title: 'SUCCESS!',
    color: '#009933',
    textColorClass: 'text-[#009933]',
    borderColor: '#009933',
  },
  early: {
    title: 'TOO EARLY',
    subtitle: 'Free retry \u2014 no bomb lost!',
    color: '#0066cc',
    textColorClass: 'text-[#0066cc]',
    borderColor: '#0066cc',
  },
  miss: {
    title: 'MISS!',
    color: '#cc0000',
    textColorClass: 'text-[#cc0000]',
    borderColor: '#cc0000',
  },
};

/* --- Confetti: military colors (gold, white, red) --- */
function ConfettiParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 120 + Math.random() * 160;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          rotation: Math.random() * 720 - 360,
          scale: Math.random() * 0.6 + 0.4,
          size: Math.random() * 6 + 4,
          color: ['#ffcc00', '#ffffff', '#cc0000', '#ffcc00', '#ffffff', '#cc0000'][
            Math.floor(Math.random() * 6)
          ],
          delay: Math.random() * 0.15,
        };
      }),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '2px' : '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0.8, 0],
            scale: [0, p.scale, p.scale * 0.6],
            rotate: p.rotation,
          }}
          transition={{
            duration: 1.4,
            ease: 'easeOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* --- Gentle rising particles for SUCCESS --- */
function RisingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: Math.random() * 240 - 120,
        startY: 40 + Math.random() * 20,
        endY: -(80 + Math.random() * 120),
        size: Math.random() * 4 + 2,
        delay: Math.random() * 0.4,
        opacity: Math.random() * 0.4 + 0.3,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: '#009933' }}
          initial={{ x: p.x, y: p.startY, opacity: 0, scale: 0 }}
          animate={{
            y: p.endY,
            opacity: [0, p.opacity, p.opacity, 0],
            scale: [0, 1, 0.6],
          }}
          transition={{
            duration: 1.6,
            ease: 'easeOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* --- Explosion lines radiating outward for MISS --- */
function ExplosionEffect() {
  const shards = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const distance = 70 + Math.random() * 40;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          length: 16 + Math.random() * 12,
          rotation: (angle * 180) / Math.PI,
        };
      }),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shards.map((s) => (
        <motion.div
          key={s.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: 2,
            height: s.length,
            backgroundColor: '#cc0000',
            transformOrigin: 'center center',
            rotate: `${s.rotation}deg`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.3 }}
          animate={{
            x: s.x,
            y: s.y,
            opacity: [1, 0.9, 0],
            scale: [0.3, 1, 0.4],
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function ResultModal({ result, onClose }: ResultModalProps) {
  const config = resultConfig[result.result];
  const isPerfect = result.result === 'perfect';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Backdrop — dark overlay with reduced blur */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
          initial={{ backdropFilter: 'blur(0px)' }}
          animate={{ backdropFilter: 'blur(12px)' }}
          transition={{ duration: 0.3 }}
        />

        {/* Modal Card — dark panel, beveled, no glass/blur/radial */}
        <motion.div
          className="relative z-10 mx-4 flex w-full max-w-sm flex-col items-center overflow-hidden rounded-2xl p-8"
          style={{
            backgroundColor: '#1c1f27',
            borderTop: `2px solid ${config.borderColor}`,
            borderLeft: `2px solid ${config.borderColor}`,
            borderBottom: '2px solid #15181e',
            borderRight: '2px solid #15181e',
          }}
          initial={{ scale: 0.4, opacity: 0, y: 30 }}
          animate={
            result.result === 'miss'
              ? {
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  x: [0, -6, 6, -4, 4, -2, 2, 0],
                }
              : { scale: 1, opacity: 1, y: 0 }
          }
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 18,
            ...(result.result === 'miss' && {
              x: { duration: 0.5, delay: 0.15 },
            }),
          }}
        >
          {/* Confetti for PERFECT */}
          {isPerfect && <ConfettiParticles />}

          {/* Rising particles for SUCCESS */}
          {result.result === 'success' && <RisingParticles />}

          {/* Explosion for MISS */}
          {result.result === 'miss' && <ExplosionEffect />}

          {/* Result Title */}
          <motion.h2
            className={`relative z-10 font-[family-name:var(--font-orbitron)] text-5xl font-black tracking-wider ${config.textColorClass}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={
              isPerfect
                ? { scale: [0.3, 1.15, 1], opacity: 1 }
                : { scale: 1, opacity: 1 }
            }
            transition={{
              delay: 0.1,
              type: 'spring',
              stiffness: 400,
              damping: 14,
            }}
          >
            {config.title}
          </motion.h2>

          {/* Subtitle */}
          {config.subtitle && (
            <motion.p
              className={`relative z-10 mt-2 font-[family-name:var(--font-orbitron)] text-sm font-medium tracking-widest uppercase ${
                isPerfect ? 'text-[#ffcc00]/70' : 'text-[#6b7280]'
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {config.subtitle}
            </motion.p>
          )}

          {/* -1 BOMB warning for MISS */}
          {result.result === 'miss' && (
            <motion.p
              className="relative z-10 mt-2 font-[family-name:var(--font-orbitron)] text-sm font-bold tracking-widest text-[#cc0000]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0.7, 1], scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              -1 BOMB
            </motion.p>
          )}

          {/* Time Stopped */}
          <motion.div
            className="relative z-10 mt-6 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p
              className="font-[family-name:var(--font-orbitron)] text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ color: '#6b7280' }}
            >
              Time Stopped
            </p>
            <p className="mt-1 font-[family-name:var(--font-jetbrains)] text-4xl font-bold text-white">
              {result.timeStopped.toFixed(3)}
              <span className="text-xl" style={{ color: '#6b7280' }}>
                s
              </span>
            </p>
          </motion.div>

          {/* Pixels Earned */}
          {result.pixelsEarned > 0 && (
            <motion.div
              className="relative z-10 mt-5"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: [0.4, 1.2, 1] }}
              transition={{
                delay: 0.35,
                type: 'spring',
                stiffness: 300,
                damping: 12,
              }}
            >
              <span
                className={`font-[family-name:var(--font-orbitron)] text-2xl font-black ${
                  isPerfect ? 'text-[#ffcc00]' : 'text-white'
                }`}
              >
                +{result.pixelsEarned} pixels!
              </span>
            </motion.div>
          )}

          {/* Streak Badge — gold border panel */}
          {result.streakCount > 1 && (
            <motion.div
              className="relative z-10 mt-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-5 py-1.5 font-[family-name:var(--font-orbitron)] text-sm font-bold tracking-wide"
                style={{
                  backgroundColor: '#1c1f27',
                  color: '#ffcc00',
                  border: '2px solid #ffcc00',
                }}
              >
                x{result.streakMultiplier} STREAK!
              </span>
            </motion.div>
          )}

          {/* Continue Button — steel gray beveled */}
          <motion.button
            className="relative z-10 mt-8 w-full rounded-xl px-8 py-3.5 font-[family-name:var(--font-orbitron)] text-base font-semibold tracking-wide text-white transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(180deg, #4a4f5a 0%, #2a2d35 100%)',
              borderTop: '2px solid #4a4f5a',
              borderLeft: '2px solid #4a4f5a',
              borderBottom: '2px solid #15181e',
              borderRight: '2px solid #15181e',
            }}
            onClick={onClose}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
