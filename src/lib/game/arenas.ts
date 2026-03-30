import { Arena } from '@/types/game';

export const ARENAS: Arena[] = [
  // Geopolitical
  {
    id: 'usa-vs-iran',
    name: 'USA vs Iran',
    category: 'geopolitical',
    sideA: { name: 'USA', color: '#3B82F6', secondaryColor: '#1E40AF' },
    sideB: { name: 'Iran', color: '#EF4444', secondaryColor: '#991B1B' },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
  {
    id: 'israel-vs-iran',
    name: 'Israel vs Iran',
    category: 'geopolitical',
    sideA: { name: 'Israel', color: '#2563EB', secondaryColor: '#1D4ED8' },
    sideB: { name: 'Iran', color: '#DC2626', secondaryColor: '#991B1B' },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
  // Sports
  {
    id: 'argentine-magician-vs-portuguese-rocket',
    name: 'The Argentine Magician vs The Portuguese Rocket',
    category: 'sports',
    sideA: { name: 'The Argentine Magician', color: '#60A5FA', secondaryColor: '#2563EB' },
    sideB: { name: 'The Portuguese Rocket', color: '#F87171', secondaryColor: '#DC2626' },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
  {
    id: 'red-knights-vs-blue-giants',
    name: 'Red Knights vs Blue Giants',
    category: 'sports',
    sideA: { name: 'Red Knights', color: '#EF4444', secondaryColor: '#B91C1C' },
    sideB: { name: 'Blue Giants', color: '#3B82F6', secondaryColor: '#1D4ED8' },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
  // Culture
  {
    id: 'toronto-mc-vs-compton-king',
    name: 'The Toronto MC vs The Compton King',
    category: 'culture',
    sideA: { name: 'The Toronto MC', color: '#A855F7', secondaryColor: '#7C3AED' },
    sideB: { name: 'The Compton King', color: '#F59E0B', secondaryColor: '#D97706' },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
  {
    id: 'pop-queen-vs-rnb-empress',
    name: 'The Pop Queen vs The R&B Empress',
    category: 'culture',
    sideA: { name: 'The Pop Queen', color: '#EC4899', secondaryColor: '#DB2777' },
    sideB: { name: 'The R&B Empress', color: '#8B5CF6', secondaryColor: '#6D28D9' },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
];

export function getArenaById(id: string): Arena | undefined {
  return ARENAS.find((a) => a.id === id);
}
