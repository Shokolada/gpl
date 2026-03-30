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
    glowColor: string;
    textColor: string;
    borderColor: string;
    shadowRgb: string;
    bgRadial: string;
  }
> = {
  perfect: {
    title: 'PERFECT!',
    subtitle: 'JACKPOT!',
    glowColor: '#ffd700',
    textColor: 'text-[#ffd700]',
    borderColor: 'border-[#ffd700]/40',
    shadowRgb: '255, 215, 0',
    bgRadial: 'radial-gradient(ellipse at center, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.05) 50%, transparent 80%)',
  },
  success: {
    title: 'SUCCESS!',
    glowColor: '#00ff88',
    textColor: 'text-[#00ff88]',
    borderColor: 'border-[#00ff88]/40',
    shadowRgb: '0, 255, 136',
    bgRadial: 'radial-gradient(ellipse at center, rgba(0,255,136,0.12) 0%, rgba(0,255,136,0.03) 50%, transparent 80%)',
  },
  early: {
    title: 'TOO EARLY',
    subtitle: 'Free retry \u2014 no bomb lost!',
    glowColor: '#00f0ff',
    textColor: 'text-[#00f0ff]',
    borderColor: 'border-[#00f0ff]/30',
    shadowRgb: '0, 240, 255',
    bgRadial: 'radial-gradient(ellipse at center, rgba(0,240,255,0.08) 0%, rgba(0,240,255,0.02) 50%, transparent 80%)',
  },
  miss: {
    title: 'MISS!',
    glowColor: '#ff2d55',
    textColor: 'text-[#ff2d55]',
    borderColor: 'border-[#ff2d55]/40',
    shadowRgb: '255, 45, 85',
    bgRadial: 'radial-gradient(ellipse at center, rgba(255,45,85,0.15) 0%, rgba(255,45,85,0.04) 50%, transparent 80%)',
  },
};

/* ─── Confetti: 35 colored squares fly outward from center ─── */
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
          color: ['#ffd700', '#ff2d55', '#00ff88', '#00f0ff', '#ff8c00', '#ff6ec7'][
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

/* ─── Gentle rising particles for SUCCESS ─── */
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
          className="absolute left-1/2 top-1/2 rounded-full bg-[#00ff88]"
          style={{ width: p.size, height: p.size }}
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

/* ─── Explosion lines radiating outward for MISS ─── */
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
          className="absolute left-1/2 top-1/2 rounded-full bg-[#ff2d55]"
          style={{
            width: 2,
            height: s.length,
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
        {/* Backdrop with heavy blur */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          onClick={onClose}
          initial={{ backdropFilter: 'blur(0px)' }}
          animate={{ backdropFilter: 'blur(24px)' }}
          transition={{ duration: 0.3 }}
        />

        {/* Modal Card */}
        <motion.div
          className={`relative z-10 mx-4 flex w-full max-w-sm flex-col items-center overflow-hidden rounded-2xl border ${config.borderColor} p-8`}
          style={{
            backgroundColor: 'rgba(10, 15, 30, 0.95)',
            backgroundImage: config.bgRadial,
            boxShadow: `0 0 60px rgba(${config.shadowRgb}, 0.2), 0 0 120px rgba(${config.shadowRgb}, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)`,
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
          {/* Shimmer border for PERFECT */}
          {isPerfect && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background:
                  'linear-gradient(135deg, transparent 30%, rgba(255,215,0,0.3) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '200% 200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}

          {/* Confetti for PERFECT */}
          {isPerfect && <ConfettiParticles />}

          {/* Rising particles for SUCCESS */}
          {result.result === 'success' && <RisingParticles />}

          {/* Explosion for MISS */}
          {result.result === 'miss' && <ExplosionEffect />}

          {/* Glow orb behind title */}
          <motion.div
            className="pointer-events-none absolute top-8 h-32 w-32 rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: config.glowColor }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />

          {/* Result Title */}
          <motion.h2
            className={`relative z-10 font-[family-name:var(--font-orbitron)] text-5xl font-black tracking-wider ${config.textColor}`}
            style={
              isPerfect
                ? {
                    textShadow: `0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.4), 0 0 80px rgba(255,215,0,0.2)`,
                  }
                : {
                    textShadow: `0 0 16px rgba(${config.shadowRgb}, 0.6), 0 0 32px rgba(${config.shadowRgb}, 0.3)`,
                  }
            }
            initial={{ scale: 0.3, opacity: 0 }}
            animate={
              isPerfect
                ? {
                    scale: [0.3, 1.15, 1],
                    opacity: 1,
                    textShadow: [
                      '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.4)',
                      '0 0 30px rgba(255,215,0,1), 0 0 60px rgba(255,215,0,0.6)',
                      '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.4)',
                    ],
                  }
                : { scale: 1, opacity: 1 }
            }
            transition={{
              delay: 0.1,
              type: 'spring',
              stiffness: 400,
              damping: 14,
              ...(isPerfect && {
                textShadow: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              }),
            }}
          >
            {config.title}
          </motion.h2>

          {/* Subtitle */}
          {config.subtitle && (
            <motion.p
              className={`relative z-10 mt-2 font-[family-name:var(--font-orbitron)] text-sm font-medium tracking-widest uppercase ${
                isPerfect ? 'text-[#ffd700]/70' : 'text-slate-400'
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
              className="relative z-10 mt-2 font-[family-name:var(--font-orbitron)] text-sm font-bold tracking-widest text-[#ff2d55]"
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
            <p className="font-[family-name:var(--font-orbitron)] text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Time Stopped
            </p>
            <p className="mt-1 font-[family-name:var(--font-jetbrains)] text-4xl font-bold text-white">
              {result.timeStopped.toFixed(3)}
              <span className="text-xl text-slate-400">s</span>
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
                  isPerfect ? 'text-[#ffd700]' : 'text-white'
                }`}
                style={
                  isPerfect
                    ? {
                        textShadow:
                          '0 0 12px rgba(255,215,0,0.5), 0 0 24px rgba(255,215,0,0.25)',
                      }
                    : undefined
                }
              >
                +{result.pixelsEarned} pixels!
              </span>
            </motion.div>
          )}

          {/* Streak Badge */}
          {result.streakCount > 1 && (
            <motion.div
              className="relative z-10 mt-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 font-[family-name:var(--font-orbitron)] text-sm font-bold tracking-wide text-orange-200"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,100,0,0.25), rgba(255,45,85,0.25))',
                  border: '1px solid rgba(255,140,0,0.3)',
                  boxShadow:
                    '0 0 16px rgba(255,100,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-base">&#x1F525;</span>
                x{result.streakMultiplier} STREAK!
              </span>
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.button
            className="relative z-10 mt-8 w-full rounded-xl border border-white/10 px-8 py-3.5 font-[family-name:var(--font-orbitron)] text-base font-semibold tracking-wide text-white backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/15 active:bg-white/20"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
              boxShadow:
                '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
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
