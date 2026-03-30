import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getArenaById } from '@/lib/game/arenas';
import BattleView from '@/components/game/BattleView';

interface ArenaPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArenaPageProps): Promise<Metadata> {
  const { id } = await params;
  const arena = getArenaById(id);
  return {
    title: arena ? `${arena.name} | GPL` : 'Arena Not Found | GPL',
  };
}

export default function ArenaPage({ params }: ArenaPageProps) {
  const { id } = React.use(params);
  const arena = getArenaById(id);

  if (!arena) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold text-red-400">Arena Not Found</h1>
        <p className="text-gray-400">
          The arena you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-gray-800 px-6 py-3 font-bold text-white transition hover:bg-gray-700"
        >
          Back to Arenas
        </Link>
      </div>
    );
  }

  return <BattleView arena={arena} />;
}
