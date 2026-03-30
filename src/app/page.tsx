'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ARENAS } from '@/lib/game/arenas';
import { ArenaCategory } from '@/types/game';

type FilterTab = 'all' | ArenaCategory;

const TABS: { label: string; value: FilterTab; icon: string }[] = [
  { label: 'All Arenas', value: 'all', icon: '🌐' },
  { label: 'Geopolitical', value: 'geopolitical', icon: '⚔️' },
  { label: 'Sports', value: 'sports', icon: '🏟️' },
  { label: 'Culture', value: 'culture', icon: '🎤' },
];

const CATEGORY_STYLES: Record<ArenaCategory, { badge: string; color: string }> = {
  geopolitical: {
    badge: 'text-[#ff6b6b]',
    color: '#ff6b6b',
  },
  sports: {
    badge: 'text-[#66cc88]',
    color: '#66cc88',
  },
  culture: {
    badge: 'text-[#8888cc]',
    color: '#8888cc',
  },
};

// Fake live player counts for each arena (seeded by index for consistency)
function getFakePlayerCount(index: number): string {
  const counts = [1234, 892, 2451, 567, 1789, 943];
  return counts[index % counts.length].toLocaleString();
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = useMemo(
    () =>
      activeTab === 'all'
        ? ARENAS
        : ARENAS.filter((a) => a.category === activeTab),
    [activeTab]
  );

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* ── Hero Section ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-16 text-center"
        >
          {/* Title */}
          <h1
            className="mb-3 font-[family-name:var(--font-orbitron)] text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            GLOBAL PRECISION LEAGUE
          </h1>

          {/* Military-style divider */}
          <div className="mx-auto mt-6 mb-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-[#4a4f5a]" />
            <div className="h-1.5 w-1.5 rotate-45 bg-[#4a4f5a]" />
            <div className="h-px w-24 bg-[#4a4f5a]" />
            <div className="h-1.5 w-1.5 rotate-45 bg-[#4a4f5a]" />
            <div className="h-px w-16 bg-[#4a4f5a]" />
          </div>

          {/* Choose arena prompt */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="font-[family-name:var(--font-orbitron)] text-lg font-semibold tracking-widest text-[#6b7280] uppercase sm:text-xl"
          >
            Choose Your Arena
          </motion.p>
        </motion.div>

        {/* ── Category Tabs ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-3"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`panel relative rounded-lg px-4 py-2.5 font-[family-name:var(--font-orbitron)] text-xs font-semibold tracking-wider uppercase transition-all duration-300 sm:px-5 sm:text-sm ${
                  isActive
                    ? 'text-white'
                    : 'text-[#6b7280] hover:text-white/70'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-px left-2 right-2 h-[2px] rounded-full bg-[#ffcc00]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ── Arena Grid ──────────────────────────────── */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((arena, index) => {
            const totalCaptured = arena.sideACaptured + arena.sideBCaptured;
            const pctA =
              totalCaptured > 0
                ? Math.round((arena.sideACaptured / arena.totalPixels) * 100)
                : 0;
            const pctB =
              totalCaptured > 0
                ? Math.round((arena.sideBCaptured / arena.totalPixels) * 100)
                : 0;
            const catStyle = CATEGORY_STYLES[arena.category];

            return (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.5,
                  ease: 'easeOut',
                }}
              >
                <Link
                  href={`/arena/${arena.id}`}
                  className="panel group relative flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#5a5f6a]"
                >
                  {/* Left gradient stripe (team colors) */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(to bottom, ${arena.sideA.color}, ${arena.sideB.color})`,
                    }}
                  />

                  {/* Card body */}
                  <div className="flex flex-1 flex-col gap-4 p-5 pl-5">
                    {/* Top row: badge + player count */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full bg-[#0a0c10] px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${catStyle.badge}`}
                      >
                        {arena.category}
                      </span>
                      <span className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains)] text-[10px] text-[#6b7280]">
                        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#009933]" />
                        {getFakePlayerCount(index)} fighting
                      </span>
                    </div>

                    {/* Arena name */}
                    <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold leading-tight text-white sm:text-lg">
                      {arena.name}
                    </h2>

                    {/* VS Divider */}
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold tracking-wide"
                        style={{ color: arena.sideA.color }}
                      >
                        {arena.sideA.name}
                      </span>
                      <span className="font-[family-name:var(--font-orbitron)] text-[10px] font-black text-[#4a4f5a]">
                        VS
                      </span>
                      <span
                        className="text-xs font-bold tracking-wide"
                        style={{ color: arena.sideB.color }}
                      >
                        {arena.sideB.name}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-auto">
                      <div className="mb-1.5 flex justify-between font-[family-name:var(--font-jetbrains)] text-[10px]">
                        <span style={{ color: arena.sideA.color }}>
                          {pctA}%
                        </span>
                        <span className="text-[#4a4f5a]">
                          {100 - pctA - pctB}% unclaimed
                        </span>
                        <span style={{ color: arena.sideB.color }}>
                          {pctB}%
                        </span>
                      </div>
                      <div className="flex h-1.5 overflow-hidden rounded-full bg-[#0a0c10]">
                        <div
                          className="transition-all duration-500"
                          style={{
                            width: `${pctA}%`,
                            backgroundColor: arena.sideA.color,
                          }}
                        />
                        <div className="flex-1" />
                        <div
                          className="transition-all duration-500"
                          style={{
                            width: `${pctB}%`,
                            backgroundColor: arena.sideB.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Enter button */}
                    <div
                      className="mt-1 rounded-lg py-2 text-center font-[family-name:var(--font-orbitron)] text-xs font-bold tracking-widest text-white uppercase transition-all duration-300 group-hover:brightness-110"
                      style={{
                        backgroundColor: '#cc0000',
                        borderTop: '1px solid #e63333',
                        borderLeft: '1px solid #e63333',
                        borderBottom: '1px solid #880000',
                        borderRight: '1px solid #880000',
                      }}
                    >
                      Enter Battle
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Footer ──────────────────────────────────── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#4a4f5a]" />
            <div className="h-1 w-1 rotate-45 bg-[#4a4f5a]" />
            <div className="h-px w-12 bg-[#4a4f5a]" />
          </div>
          <p className="font-[family-name:var(--font-orbitron)] text-xs font-medium tracking-[0.2em] text-[#6b7280] uppercase">
            Stop the bomb. Conquer the map.
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
