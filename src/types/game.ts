export type HitResult = 'perfect' | 'success' | 'miss' | 'early';

export type ArenaCategory = 'geopolitical' | 'sports' | 'culture';

export type ArenaStatus = 'active' | 'cooldown' | 'completed';

export type TeamSide = 'side_a' | 'side_b';

export interface Arena {
  id: string;
  name: string;
  category: ArenaCategory;
  sideA: ArenaSide;
  sideB: ArenaSide;
  totalPixels: number;
  sideACaptured: number;
  sideBCaptured: number;
  status: ArenaStatus;
}

export interface ArenaSide {
  name: string;
  color: string;
  secondaryColor: string;
  silhouetteUrl?: string;
  clipPolygon?: string;
  flagStripes?: string[];
}

export interface AttemptResult {
  result: HitResult;
  timeStopped: number;
  pixelsEarned: number;
  streakCount: number;
  streakMultiplier: number;
}

export interface GameState {
  arena: Arena;
  playerTeam: TeamSide;
  bombsCount: number;
  maxBombs: number;
  streak: number;
  isTimerRunning: boolean;
  currentTime: number;
  lastResult: AttemptResult | null;
}

export const SCORING = {
  PERFECT_TIME: 10.0,
  SUCCESS_RANGE: 0.05,
  PERFECT_PIXELS: 50,
  SUCCESS_PIXELS: 10,
  COMEBACK_PIXELS: 15,
  COMEBACK_THRESHOLD: 0.2,
  STREAK_MULTIPLIERS: [1, 1, 1.5, 2, 2, 3] as const, // index = streak count (0,1,2,3,4,5+)
} as const;

export function getStreakMultiplier(streak: number): number {
  if (streak >= 5) return 3;
  return SCORING.STREAK_MULTIPLIERS[streak] ?? 1;
}

export function evaluateHit(time: number): { result: HitResult; basePixels: number } {
  const diff = Math.abs(time - SCORING.PERFECT_TIME);

  if (diff < 0.0005) {
    return { result: 'perfect', basePixels: SCORING.PERFECT_PIXELS };
  }
  if (time >= SCORING.PERFECT_TIME - SCORING.SUCCESS_RANGE && time <= SCORING.PERFECT_TIME + SCORING.SUCCESS_RANGE) {
    return { result: 'success', basePixels: SCORING.SUCCESS_PIXELS };
  }
  if (time < SCORING.PERFECT_TIME - SCORING.SUCCESS_RANGE) {
    return { result: 'early', basePixels: 0 };
  }
  return { result: 'miss', basePixels: 0 };
}
