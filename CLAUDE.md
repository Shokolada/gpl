# GPL — Global Precision League

## What Is This
Competitive hybrid-casual PWA game. Players stop a bomb's stopwatch at exactly 10.000 seconds — successful hits siphon pixels from the opponent's map. Teams compete for pixel conquest across themed arenas.

## Tech Stack
- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- HTML5 Canvas API (pixel maps)
- Framer Motion (animations)
- Web Audio API (casino-style sounds)
- Future: Supabase (backend), Stripe (payments)

## Project Structure
```
src/
  app/              # Next.js App Router pages
    arena/[id]/     # Individual arena battle page
  components/
    game/           # Core game components (BattleView, PixelCanvas, etc.)
    ui/             # Shared UI components
  hooks/            # Custom React hooks (useStopwatch, etc.)
  lib/
    audio/          # Web Audio API sound manager
    game/           # Game logic, types, arena data
  types/            # TypeScript type definitions
public/
  sounds/           # Sound effect files
  arenas/           # Arena images and textures
```

## Key Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

## Game Rules
- Timer counts from 0.000 to beyond 10.000
- PERFECT: exactly 10.000 = 50 pixels
- SUCCESS: 9.950-9.999 or 10.001-10.050 = 10 pixels
- TOO EARLY: < 9.950 = free retry, no bomb lost
- MISS: > 10.050 = bomb lost, no pixels
- Streaks multiply rewards: 2 hits=1.5x, 3=2x, 5=3x

## Design Spec
Full spec at `docs/superpowers/specs/2026-03-30-gpl-game-design.md`
