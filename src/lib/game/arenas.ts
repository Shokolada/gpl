import { Arena } from '@/types/game';

// Country silhouette clip-path polygons (percentage coordinates)
const SHAPES = {
  iran: '32% 2%, 42% 0%, 55% 1%, 65% 5%, 73% 10%, 78% 16%, 82% 22%, 86% 30%, 90% 38%, 92% 46%, 90% 54%, 86% 60%, 80% 66%, 74% 72%, 68% 76%, 60% 82%, 52% 86%, 44% 90%, 36% 92%, 28% 88%, 22% 82%, 18% 74%, 14% 66%, 12% 58%, 10% 50%, 10% 42%, 12% 34%, 16% 26%, 20% 18%, 24% 12%, 28% 6%',
  israel: '42% 0%, 58% 0%, 60% 4%, 58% 10%, 62% 16%, 60% 22%, 58% 28%, 56% 34%, 54% 40%, 55% 46%, 56% 52%, 54% 58%, 52% 64%, 54% 70%, 52% 76%, 50% 82%, 52% 88%, 50% 100%, 48% 88%, 46% 82%, 48% 76%, 46% 70%, 48% 64%, 46% 58%, 44% 52%, 45% 46%, 46% 40%, 44% 34%, 42% 28%, 40% 22%, 38% 16%, 42% 10%, 40% 4%',
  usa: '3% 18%, 8% 14%, 14% 10%, 20% 8%, 26% 10%, 30% 6%, 36% 8%, 42% 6%, 48% 4%, 54% 6%, 58% 4%, 64% 6%, 70% 4%, 76% 8%, 82% 6%, 88% 10%, 93% 14%, 97% 20%, 98% 28%, 96% 34%, 92% 40%, 88% 46%, 84% 52%, 78% 56%, 72% 60%, 66% 62%, 60% 64%, 56% 68%, 52% 74%, 50% 80%, 48% 74%, 44% 68%, 40% 72%, 36% 76%, 30% 72%, 24% 66%, 18% 60%, 12% 52%, 8% 44%, 4% 36%, 2% 28%',
  argentina: '45% 0%, 55% 0%, 58% 6%, 60% 14%, 58% 22%, 56% 30%, 54% 38%, 56% 46%, 58% 54%, 56% 62%, 52% 70%, 48% 78%, 44% 86%, 42% 92%, 50% 98%, 48% 100%, 40% 96%, 38% 88%, 40% 80%, 42% 72%, 44% 64%, 42% 56%, 44% 48%, 42% 40%, 44% 32%, 42% 24%, 44% 16%, 42% 8%',
  portugal: '38% 0%, 62% 0%, 65% 6%, 63% 14%, 65% 22%, 62% 30%, 60% 38%, 58% 46%, 60% 54%, 58% 62%, 55% 70%, 52% 78%, 50% 86%, 48% 94%, 50% 100%, 45% 94%, 42% 86%, 44% 78%, 42% 70%, 40% 62%, 38% 54%, 40% 46%, 38% 38%, 40% 30%, 38% 22%, 40% 14%, 38% 6%',
  shield: '50% 0%, 65% 5%, 78% 12%, 88% 22%, 95% 35%, 98% 48%, 95% 60%, 88% 72%, 78% 82%, 65% 90%, 50% 100%, 35% 90%, 22% 82%, 12% 72%, 5% 60%, 2% 48%, 5% 35%, 12% 22%, 22% 12%, 35% 5%',
  star: '50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%',
  hexagon: '50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%',
} as const;

export const ARENAS: Arena[] = [
  // Geopolitical
  {
    id: 'usa-vs-iran',
    name: 'USA vs Iran',
    category: 'geopolitical',
    sideA: { name: 'USA', color: '#3B82F6', secondaryColor: '#1E40AF', clipPolygon: SHAPES.usa },
    sideB: { name: 'Iran', color: '#EF4444', secondaryColor: '#991B1B', clipPolygon: SHAPES.iran },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
  {
    id: 'israel-vs-iran',
    name: 'Israel vs Iran',
    category: 'geopolitical',
    sideA: { name: 'Israel', color: '#2563EB', secondaryColor: '#1D4ED8', clipPolygon: SHAPES.israel },
    sideB: { name: 'Iran', color: '#DC2626', secondaryColor: '#991B1B', clipPolygon: SHAPES.iran },
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
    sideA: { name: 'The Argentine Magician', color: '#60A5FA', secondaryColor: '#2563EB', clipPolygon: SHAPES.argentina },
    sideB: { name: 'The Portuguese Rocket', color: '#F87171', secondaryColor: '#DC2626', clipPolygon: SHAPES.portugal },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
  {
    id: 'red-knights-vs-blue-giants',
    name: 'Red Knights vs Blue Giants',
    category: 'sports',
    sideA: { name: 'Red Knights', color: '#EF4444', secondaryColor: '#B91C1C', clipPolygon: SHAPES.shield },
    sideB: { name: 'Blue Giants', color: '#3B82F6', secondaryColor: '#1D4ED8', clipPolygon: SHAPES.shield },
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
    sideA: { name: 'The Toronto MC', color: '#A855F7', secondaryColor: '#7C3AED', clipPolygon: SHAPES.hexagon },
    sideB: { name: 'The Compton King', color: '#F59E0B', secondaryColor: '#D97706', clipPolygon: SHAPES.star },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
  {
    id: 'pop-queen-vs-rnb-empress',
    name: 'The Pop Queen vs The R&B Empress',
    category: 'culture',
    sideA: { name: 'The Pop Queen', color: '#EC4899', secondaryColor: '#DB2777', clipPolygon: SHAPES.star },
    sideB: { name: 'The R&B Empress', color: '#8B5CF6', secondaryColor: '#6D28D9', clipPolygon: SHAPES.hexagon },
    totalPixels: 10000,
    sideACaptured: 0,
    sideBCaptured: 0,
    status: 'active',
  },
];

export function getArenaById(id: string): Arena | undefined {
  return ARENAS.find((a) => a.id === id);
}
