'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ARENAS } from '@/lib/game/arenas';
import { ArenaCategory } from '@/types/game';

type FilterTab = 'all' | ArenaCategory;

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Geopolitical', value: 'geopolitical' },
  { label: 'Sports', value: 'sports' },
  { label: 'Culture', value: 'culture' },
];

const CATEGORY_COLORS: Record<ArenaCategory, string> = {
  geopolitical: 'bg-red-500/20 text-red-400 border-red-500/30',
  sports: 'bg-green-500/20 text-green-400 border-green-500/30',
  culture: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered =
    activeTab === 'all'
      ? ARENAS
      : ARENAS.filter((a) => a.category === activeTab);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-4xl font-black tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            GLOBAL PRECISION LEAGUE
          </span>
        </h1>
        <p className="text-lg text-gray-400">Choose Your Arena</p>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              activeTab === tab.value
                ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Arena Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((arena) => {
          const totalCaptured = arena.sideACaptured + arena.sideBCaptured;
          const pctA =
            totalCaptured > 0
              ? Math.round((arena.sideACaptured / arena.totalPixels) * 100)
              : 0;
          const pctB =
            totalCaptured > 0
              ? Math.round((arena.sideBCaptured / arena.totalPixels) * 100)
              : 0;

          return (
            <Link
              key={arena.id}
              href={`/arena/${arena.id}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:border-gray-600 hover:shadow-lg hover:shadow-cyan-500/5"
            >
              {/* Gradient header */}
              <div
                className="h-24 w-full"
                style={{
                  background: `linear-gradient(135deg, ${arena.sideA.color} 0%, ${arena.sideA.secondaryColor} 40%, ${arena.sideB.secondaryColor} 60%, ${arena.sideB.color} 100%)`,
                }}
              />

              {/* Card body */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Category badge */}
                <span
                  className={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[arena.category]}`}
                >
                  {arena.category}
                </span>

                {/* Arena name */}
                <h2 className="text-lg font-bold leading-tight text-white">
                  {arena.name}
                </h2>

                {/* Progress bar */}
                <div className="mt-auto">
                  <div className="mb-1 flex justify-between text-xs text-gray-400">
                    <span>
                      {arena.sideA.name}{' '}
                      <span className="font-bold text-white">{pctA}%</span>
                    </span>
                    <span>
                      <span className="font-bold text-white">{pctB}%</span>{' '}
                      {arena.sideB.name}
                    </span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className="transition-all"
                      style={{
                        width: `${pctA}%`,
                        backgroundColor: arena.sideA.color,
                      }}
                    />
                    <div className="flex-1" />
                    <div
                      className="transition-all"
                      style={{
                        width: `${pctB}%`,
                        backgroundColor: arena.sideB.color,
                      }}
                    />
                  </div>
                </div>

                {/* Enter button */}
                <div className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 py-2 text-center text-sm font-bold tracking-wide text-cyan-400 transition group-hover:bg-cyan-500/20">
                  ENTER BATTLE
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
