# Global Precision League (GPL) — Game Design Spec

**Date:** 2026-03-30
**Status:** Draft
**Project directory:** `~/Programs/gpl/`

---

## 1. Overview

A competitive hybrid-casual PWA where players join teams and compete for pixel conquest through extreme timing precision. Players stop a bomb's stopwatch as close to 10.000 seconds as possible — successful hits "siphon" pixels from the opponent's map into their team's map.

**Core loop:** Open arena → Stop the bomb → Pixels transfer → Team conquers → Arena resets → New battle.

**Business model:** Free-to-play with bomb packs (consumables) + VIP subscription.

**Target:** Viral web game. Zero signup friction, shareable results, team competition drives organic growth.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Graphics | HTML5 Canvas API (pixel manipulation) |
| Animations | Framer Motion (UI transitions, pixel siphon) |
| Database | Supabase (Postgres + Realtime + Auth) |
| Payments | Stripe (Checkout + Subscriptions) |
| Deployment | Vercel |
| PWA | next-pwa (manifest + service worker + push notifications) |

---

## 3. Game Core — Precision Engine

### 3.1 Timer Mechanics
- Timer starts on tap/click (player taps "START" which becomes "STOP")
- Counts from 0.000 upward at 60fps
- Display format: XX.XXX (seconds with 3 decimal places)
- Cannot be paused — player must hit STOP or let it pass

### 3.2 Scoring System

| Time Range | Result | Effect |
|-----------|--------|--------|
| Exactly 10.000 | **PERFECT** | 50 pixels siphoned, -1 bomb |
| 9.950–9.999 or 10.001–10.050 | **SUCCESS** | 10 pixels siphoned, -1 bomb |
| < 9.950 | **TOO EARLY** | No penalty — free retry, timer resets |
| > 10.050 | **MISS** | Explosion animation, -1 bomb, no pixels |

### 3.3 Pixel Siphon (The Transfer)
- On successful hit: pixels are physically removed from the victim's Canvas map
- Removed pixels animate "falling" into the invader's Canvas map (Framer Motion)
- Global percentage bar updates: "% of Victim Map Captured"
- **Real-time visual sync across all players:**
  - Supabase Realtime broadcasts pixel count changes
  - ALL connected players see the map canvases update live — pixels disappearing from victim map and appearing in invader map in real-time
  - When Player A in Tokyo hits PERFECT, Player B in New York sees Iran's map lose 50 pixels instantly
  - Battle Balance bar animates smoothly as the global count changes
  - "Recent hits" feed scrolls showing who just scored what

### 3.4 Streak / Combo System
- Consecutive successful hits (SUCCESS or PERFECT) multiply rewards:
  - 2 in a row: 1.5x pixels
  - 3 in a row: 2x pixels
  - 5 in a row: 3x pixels + "ON FIRE!" visual effect
- A MISS or TOO EARLY breaks the streak
- Streak counter visible on screen with escalating sound effects (casino-style)
- Creates flow state and extends session length (+15-25% per industry benchmarks)

### 3.5 Ammo System

| Parameter | Free Player | VIP Commander |
|-----------|------------|---------------|
| Max bombs | 5 | 10 |
| Regen rate | 1 bomb / 20 min | 1 bomb / 10 min |
| Starting bombs | 5 | 10 |

- Every attempt costs 1 bomb (except TOO EARLY = free retry)
- Regeneration timer persisted in localStorage + Supabase
- Buy extra bombs: 10 ($0.99), 25 ($1.99), 50 ($3.99) via Stripe

---

## 4. Arenas

### 4.1 Launch Arenas (6 total, 2 per category)

**Geopolitical (safe — public domain maps/flags):**
1. USA vs Iran
2. Israel vs Iran

**Sports (use fictional archetypes — NO real names/logos):**
3. "The Argentine Magician" vs "The Portuguese Rocket" (football rivalry)
4. "Red Knights" vs "Blue Giants" (club rivalry)

**Music/Culture (use fictional archetypes — NO real names):**
5. "The Toronto MC" vs "The Compton King" (rap rivalry)
6. "The Pop Queen" vs "The R&B Empress" (pop rivalry)

**Why fictional names:** Using real celebrity names (Messi, Drake, etc.) creates right-of-publicity legal liability. EA paid $60M in settlements for similar issues. Country maps/flags are public domain and safe. Celebrity arenas use obvious archetypes that everyone recognizes without direct name usage.

**Future option:** If the game gains traction, negotiate licensing deals with celebrities/teams for official arenas.

### 4.2 Arena Configuration
Each arena requires:
- Two SVG map/silhouette masks (or image masks for non-country matchups)
- Two flag/brand textures to fill the pixel grids
- Total pixel count (default: 10,000)
- Category tag

### 4.3 Two-Sided Battle
Both teams attack simultaneously. Each team has its own pixel count being conquered:
- Team A attacks Team B's map → increases side_a_captured
- Team B attacks Team A's map → increases side_b_captured
- Victory condition: first team to reach 100% conquest of the opponent wins
- The Battle Balance bar shows relative progress (which team is winning)

### 4.4 Victory & Reset Flow
1. Arena reaches 100% conquest → full-screen "CONQUERED" celebration
2. Winners get a victory badge on their profile
3. 24-hour cooldown — leaderboard frozen
4. Arena resets to 0% — new battle begins
5. Historical stats preserved

### 4.5 Future: Trending & Community Arenas
- Admin panel to create new arenas quickly (upload images, set names, publish)
- v2: Google Trends API integration for automated suggestions
- v2: Community-submitted matchups with voting

---

## 5. UI Layout & Components

### 5.1 Responsive Layout

**Mobile (portrait):**
```
┌──────────────────────────┐
│ ☰  GLOBAL PRECISION LEAGUE │
├──────────────────────────┤
│ [===== BATTLE BALANCE ====] │
│  Team A: 85%    Team B: 15% │
├──────────────────────────┤
│                            │
│     [VICTIM MAP CANVAS]    │
│     (flag texture pixels)  │
│                            │
├──────────────────────────┤
│        💣 STOPWATCH        │
│         09.423             │
│       TARGET: 10.000       │
├──────────────────────────┤
│                            │
│    [INVADER MAP CANVAS]    │
│    (flag texture pixels)   │
│                            │
├──────────────────────────┤
│ 💣x3  │  [  STOP!  ]  │ 👤🏳 │
│ Ammo  │              │ Team │
└──────────────────────────┘
```

**Desktop/Tablet (landscape):**
```
┌─────────────────────────────────────────────┐
│ ☰     GLOBAL PRECISION LEAGUE    BATTLE BAL │
├──────────┬──────────────┬──────────┤
│          │              │          │
│ [VICTIM] │   💣 BOMB    │[INVADER] │
│  MAP     │  STOPWATCH   │  MAP     │
│  CANVAS  │   09.423     │  CANVAS  │
│          │ TARGET:10.000│          │
│          │              │          │
├──────────┴──────────────┴──────────┤
│  💣x3 Ammo │   [ STOP! ]    │ 👤🏳  │
└─────────────────────────────────────────────┘
```

### 5.2 Component Tree

```
App
├── ArenaSelector (home — 6 arena cards with live % progress)
├── BattleView (main game screen)
│   ├── BattleBalance (progress bar: Team A % vs Team B %)
│   ├── PixelCanvas (victim map — HTML5 Canvas with flag texture)
│   ├── BombStopwatch (animated bomb + neon digital timer)
│   ├── PixelCanvas (invader map — HTML5 Canvas with flag texture)
│   ├── PixelSiphon (falling pixel animation between canvases)
│   ├── ActionZone
│   │   ├── AmmoCounter (bomb icon + count)
│   │   ├── StopButton (full-width red button)
│   │   └── TeamBadge (profile + team flag)
│   └── ResultModal (PERFECT/SUCCESS/TOO EARLY/MISS)
├── Leaderboard (top contributors per arena)
├── ShopModal (bomb packs + VIP subscription via Stripe)
├── ProfilePage (stats, badges, team, purchase history)
└── AdminPanel (create/manage arenas — protected route)
```

---

## 6. Data Model (Supabase)

### 6.1 Tables

**arenas**
- `id` (uuid, PK)
- `name` (text) — e.g., "USA vs Iran"
- `category` (enum: geopolitical, sports, culture)
- `side_a_name` (text) — e.g., "USA"
- `side_a_image` (text) — URL to SVG/image mask
- `side_a_texture` (text) — URL to flag texture
- `side_b_name` (text) — e.g., "Iran"
- `side_b_image` (text)
- `side_b_texture` (text)
- `total_pixels` (int, default 10000)
- `side_a_captured` (int, default 0) — pixels captured by side A
- `side_b_captured` (int, default 0)
- `status` (enum: active, cooldown, completed)
- `created_at`, `updated_at`

**players**
- `id` (uuid, PK)
- `anonymous_id` (text, unique) — generated on first visit, stored in localStorage
- `auth_user_id` (uuid, nullable, FK → auth.users) — linked when they log in
- `display_name` (text)
- `team_side` (text) — which side they chose per arena (stored in player_arenas)
- `bombs_count` (int, default 5)
- `last_bomb_regen_at` (timestamptz)
- `is_vip` (boolean, default false)
- `vip_expires_at` (timestamptz, nullable)
- `stripe_customer_id` (text, nullable)
- `total_pixels_earned` (int, default 0)
- `total_perfects` (int, default 0)
- `created_at`

**player_arenas** (which team per arena)
- `player_id` (uuid, FK)
- `arena_id` (uuid, FK)
- `team` (enum: side_a, side_b)
- `pixels_contributed` (int, default 0)
- `attempts_count` (int, default 0)
- `perfects_count` (int, default 0)
- PK: (player_id, arena_id)

**attempts**
- `id` (uuid, PK)
- `player_id` (uuid, FK)
- `arena_id` (uuid, FK)
- `time_stopped` (decimal) — e.g., 9.987
- `result` (enum: perfect, success, miss, early)
- `pixels_earned` (int)
- `created_at`

**purchases**
- `id` (uuid, PK)
- `player_id` (uuid, FK)
- `stripe_session_id` (text)
- `type` (enum: bombs_10, bombs_25, bombs_50, vip_monthly)
- `amount_cents` (int)
- `status` (enum: pending, completed, refunded)
- `created_at`

**arena_proposals**
- `id` (uuid, PK)
- `player_id` (uuid, FK) — who proposed it
- `side_a_name` (text)
- `side_b_name` (text)
- `category` (enum: geopolitical, sports, culture)
- `reason` (text) — why this matchup is interesting
- `upvotes` (int, default 0)
- `downvotes` (int, default 0)
- `status` (enum: pending, approved, rejected, live)
- `created_at`

**proposal_votes**
- `player_id` (uuid, FK)
- `proposal_id` (uuid, FK)
- `vote` (enum: up, down)
- PK: (player_id, proposal_id)

### 6.2 Realtime
- Subscribe to `arenas` table changes (side_a_captured, side_b_captured)
- All connected players see pixel counts update in real time

### 6.3 Row Level Security
- Players can read all arenas and leaderboard data
- Players can only update their own player record
- Attempts are insert-only by the player, readable by all
- Admin routes protected by a specific auth role

---

## 7. Auth Flow

1. **First visit:** Generate `anonymous_id` (UUID), store in localStorage. Create `players` row.
2. **Team selection:** Show team picker per arena. Store in `player_arenas`.
3. **Play:** Fully functional with anonymous identity.
4. **Login prompt:** After 3 games, soft prompt: "Save your progress?" → Google one-tap login.
5. **Login:** Supabase Auth (Google provider). Link `auth_user_id` to existing `players` row via `anonymous_id`.
6. **Purchases:** Require authenticated account. Redirect to login if anonymous user tries to buy.

---

## 8. Monetization (Stripe)

### 8.1 Products
- **Starter Pack (3 bombs)** — $0.49 (one-time) — lowest friction first purchase, breaks "I never pay" barrier
- **Bomb Pack 10** — $0.99 (one-time, Stripe Checkout)
- **Bomb Pack 25** — $1.99 (one-time)
- **Bomb Pack 50** — $3.99 (one-time)
- **VIP Commander** — $4.99/month or $29.99/year (Stripe Subscription)

### 8.2 VIP Benefits
- Max bombs: 10 (vs 5)
- Regen rate: 1 bomb / 10 min (vs 20 min)
- VIP badge on leaderboard
- Exclusive explosion effects / skins
- Priority in "Recent Hits" feed

### 8.3 Integration
- `POST /api/stripe/checkout` — create Checkout session for bomb packs
- `POST /api/stripe/subscription` — create subscription for VIP
- `POST /api/stripe/webhook` — handle payment confirmations, update player bombs/VIP status
- Stripe Customer Portal for subscription management

---

## 9. Viral & Social Features

### 9.1 Share Mechanics
- **After PERFECT hit:** Shareable card — "I just hit 10.000 PERFECT! Join Team USA"
- **After arena conquest:** "Team USA conquered Iran! 🏆" with shareable image
- **Leaderboard rank:** "I'm #12 on Team USA — beat me!" with link
- **Referral tracking:** Each share link includes player's referral code

### 9.2 Urgency System (Losing Team Alerts)
When a team reaches critical thresholds, trigger urgency mechanics:

| Threshold | Trigger |
|-----------|---------|
| 70% conquered | In-app warning banner: "Your team is under heavy attack!" |
| 80% conquered | Push notification to all team members: "Team Iran is at 80% — fight back NOW!" |
| 90% conquered | CRITICAL alert + easy "Recruit Allies" share button with pre-filled message |
| 95% conquered | "LAST STAND" mode — dramatic UI change (red pulsing border, alarm sound) |

**Comeback bonus:** When a team is below 20% remaining, successful hits earn 15 pixels instead of 10 (makes comebacks dramatic and possible).

**Recruit share message:** "Team Iran is about to fall! We need you — join the fight NOW! [link]"

### 9.3 Player-Proposed Matchups
- Any logged-in player can propose a new arena matchup
- Other players vote on proposals (upvote/downvote)
- Top-voted proposals shown to admin for approval
- Admin reviews, uploads assets, publishes as new arena
- Proposer gets a "Creator" badge when their arena goes live

### 9.4 Social Proof
- Live player count per arena ("1,234 players fighting now")
- Real-time pixel counter updating across all connections
- "Recent hits" scrolling feed showing other players' results

### 9.5 PWA & Push Notifications
- `manifest.json` — installable on home screen
- Service worker — cache static assets, offline fallback
- Offline mode — show last state, queue attempts for sync
- **Push notification triggers:**
  - "Your bombs are recharged!" (ammo full)
  - "Your team is under attack! 80% conquered" (urgency)
  - "New arena just dropped: Drake vs Kendrick!" (new content)
  - "CONQUERED! Your team won!" (victory)

### 9.6 Daily Engagement Systems

**Daily Login Reward Calendar (Critical — +20-30% D7 retention):**
- Day 1: 50 bonus pixels
- Day 3: 1 free bomb
- Day 7: 200 bonus pixels + exclusive bomb skin
- Day 14: 2 free bombs + "Veteran" badge
- Day 30: 500 bonus pixels + "Legendary" badge + rare bomb skin
- Missing a day resets the streak to 0 (loss aversion)

**Daily Challenge:**
- One new challenge per day: "Conquer 200 pixels in any arena" / "Hit 3 SUCCESSes in a row" / "Score a PERFECT"
- Completing the challenge: bonus pixels + progress toward weekly reward
- Creates a specific reason to open the app every day

**Friend Invite with Rewards (Critical for viral growth):**
- Share invite link → friend joins and plays 3 games → both get 500 pixels + 2 free bombs
- Referral leaderboard: "Top Recruiters" shown on profile
- Each friend invited makes the player more invested (sunk cost)
- Pre-filled share messages: "I just conquered 85% of Iran on GPL — join my team!"

### 9.7 SEO / Social Previews
- Dynamic OG images per arena (Next.js OG image generation)
- Meta tags with current battle status
- SSR arena pages for search engine indexing

---

## 10. Sound Design (Casino-Style NLP Retention)

Sound is critical for addiction and retention. Use casino psychology — variable reward sounds that trigger dopamine.

### 10.1 Core Sounds

| Event | Sound Style | Purpose |
|-------|-------------|---------|
| Timer ticking | Soft heartbeat pulse, increasing tempo as it approaches 10.000 | Builds tension and anticipation |
| PERFECT hit | Slot machine jackpot — coins cascading, triumphant fanfare | Maximum dopamine reward |
| SUCCESS hit | Satisfying "cha-ching" + light celebration chime | Positive reinforcement |
| TOO EARLY | Soft "whoosh" — neutral, encouraging | No punishment feeling |
| MISS / Explosion | Deep bass boom + glass shatter | Dramatic but makes player want to try again |
| Pixel siphon | Rapid tick-tick-tick as pixels transfer (like coins falling) | Casino coin-drop satisfaction |
| Bomb recharge | Power-up ascending tone + notification ping | Triggers "play again" impulse |
| LAST STAND mode | Alarm siren + dramatic heartbeat | Creates urgency to share/recruit |
| Victory / CONQUERED | Epic orchestral crescendo + crowd cheering | Social reward, worth sharing |

### 10.2 NLP Retention Patterns
- **Variable reward sounds:** PERFECT hits occasionally get a "super jackpot" sound variant (unexpected = more dopamine)
- **Near-miss amplification:** When timer shows 10.048 (just barely a miss), play a "so close!" sound + visual — triggers "one more try" behavior
- **Streak sounds:** Consecutive successes get increasingly exciting sounds (1 hit = chime, 3 hits = fanfare, 5 hits = mega jackpot)
- **Ambient anticipation:** Low background music that subtly speeds up as pixels approach 100% conquest
- **Social sounds:** Subtle "ping" when another player hits a PERFECT (shows activity, FOMO)

### 10.3 Implementation
- Use Web Audio API for low-latency playback (critical for timing game)
- Preload all sounds on first interaction (mobile requires user gesture for audio)
- Volume control + mute toggle in settings
- Sounds stored as small .mp3/.ogg files in `/public/sounds/`

---

## 11. Copyright & Legal Protection

### 11.1 Risk Assessment

| Asset Type | Risk Level | Approach |
|-----------|-----------|----------|
| Country maps/borders | **Low** — geographic shapes are public domain | Use freely |
| Country flags | **Low** — flags are public domain by international convention | Use freely |
| Celebrity names (Messi, Drake, etc.) | **Medium** — right of publicity varies by jurisdiction | See mitigation below |
| Team logos (Real Madrid, Barcelona) | **HIGH** — trademarked | Never use official logos |
| Celebrity photos/likenesses | **HIGH** — right of publicity + copyright | Never use photos |
| Music/songs | **HIGH** — copyright | Never use copyrighted music |

### 11.2 Mitigation Strategy

**For celebrity/team arenas:**
- **NO official logos, photos, or copyrighted imagery** — ever
- Use **generic silhouette icons** or **AI-generated abstract art** for each side
- Use names only in a "community poll / opinion" context — similar to how Twitter polls ask "Messi or Ronaldo?" without licensing
- Add a **disclaimer** on every arena page: "This is a community opinion game. We are not affiliated with, endorsed by, or sponsored by any individuals or organizations mentioned."
- Add **Terms of Service** stating: "Arena matchups represent public debates and are user-generated content. No endorsement is implied."

**For country arenas:**
- Country maps and flags are public domain — safe to use
- Avoid any government-specific imagery (emblems, seals)

**For sound effects:**
- Use **royalty-free** sound effects only (from sites like freesound.org, Pixabay Sounds)
- Or generate custom sounds with AI audio tools
- Document the license for every sound file in `/public/sounds/LICENSE.md`

**For user-proposed arenas:**
- Moderation required — admin approval before any arena goes live
- Reject arenas that use trademarked content inappropriately
- Terms of Service: "Users may not propose arenas that infringe on copyrights or trademarks"

### 11.3 Legal Pages (Required for Launch)
- **Terms of Service** — `/terms`
- **Privacy Policy** — `/privacy` (required for Google Auth + Stripe)
- **DMCA / Takedown Policy** — `/dmca` (process for copyright holders to request removal)
- **Disclaimer** — visible on every arena page

### 11.4 Recommendation
Before launching publicly, **consult a lawyer** about the right of publicity issues with celebrity names. The "community poll" framing provides some protection, but jurisdiction matters. For MVP/beta, the generic approach (silhouettes + disclaimer) is safe enough.

---

## 12. Admin Panel

Protected route (`/admin`) — accessible only to your account.

**Features:**
- Create new arena (upload images, set names, category, publish)
- View all arenas with live stats
- Pause/reset arenas
- View player stats and revenue
- Manage trending arenas (pin/unpin)

---

## 13. Native App Strategy

### 13.1 Approach: PWA → Capacitor

Build the web app first, then wrap it for app stores using **Capacitor** (by Ionic):

| Phase | Platform | Distribution |
|-------|----------|-------------|
| MVP | PWA (web) | Direct URL, installable on home screen |
| v0.2 | iOS app | App Store (via Capacitor wrapper) |
| v0.2 | Android app | Google Play (via Capacitor wrapper) |

### 13.2 Why Capacitor
- **Zero code rewrite** — wraps your existing Next.js app as a native app
- **Native APIs** — haptic feedback on STOP button, native push notifications, in-app purchases
- **App Store presence** — important for discoverability and trust
- **One codebase** — all platforms share the same React code

### 13.3 App Store Considerations
- **In-app purchases:** App Store requires using Apple's IAP for digital goods (bombs, VIP). Google Play has similar rules. Stripe works for web only — native apps need platform IAP.
- **Revenue split:** Apple/Google take 30% (15% for small business program under $1M/year)
- **Review process:** Both stores review apps — avoid content that violates guidelines
- **Solution:** Use Capacitor's `@capacitor/in-app-purchases` plugin. Detect platform at runtime: web = Stripe, native app = platform IAP.

### 13.4 Architecture for Multi-Platform
- All game logic stays in React (shared)
- Payment layer abstracted: `PaymentService` with web (Stripe) and native (IAP) implementations
- Push notifications: web (Web Push API) vs native (APNs/FCM via Capacitor)
- Haptic feedback: only on native (Capacitor Haptics plugin)

---

## 14. MVP Scope vs Future

### MVP (v0.1)
- [ ] 6 arenas with pixel canvas maps (fictional archetypes for celebrity arenas)
- [ ] Precision engine (stopwatch + scoring with TOO EARLY free retry)
- [ ] Streak/combo multiplier system (1.5x → 2x → 3x)
- [ ] Pixel siphon animation (Framer Motion)
- [ ] Anonymous play + team selection per arena
- [ ] Supabase realtime pixel sync (maps update live for all players)
- [ ] Ammo system with localStorage + Supabase persistence
- [ ] Responsive layout (portrait mobile + landscape desktop)
- [ ] PWA (installable, basic offline)
- [ ] Share buttons (PERFECT hit, team recruitment, invite friends)
- [ ] Urgency system (losing team alerts + comeback bonus)
- [ ] Daily login reward calendar (streak-based)
- [ ] Daily challenge system
- [ ] Friend invite with rewards (referral link)
- [ ] Leaderboard (per arena, personal contribution)
- [ ] Stripe: bomb packs ($0.49-$3.99) + VIP subscription ($4.99/mo or $29.99/yr)
- [ ] Google login (optional, required for purchases)
- [ ] Admin panel (create/manage arenas)
- [ ] Victory + reset flow (CONQUERED celebration → cooldown → reset)
- [ ] Casino-style sound design (Web Audio API, tension + reward sounds)
- [ ] Legal: Terms of Service, Privacy Policy, DMCA page, disclaimers

### v0.2 (Post-launch)
- [ ] Push notifications (ammo recharged, team under attack, new arena)
- [ ] Capacitor wrapper for iOS + Android app stores
- [ ] In-app purchases (Apple IAP / Google Play Billing)
- [ ] Battle Pass / Season Pass ($2.99-$4.99 per season)
- [ ] Limited-time events (weekly rotating challenges)
- [ ] Achievement/badge system
- [ ] Player-proposed matchups (suggest + vote)
- [ ] Google Trends integration for arena suggestions
- [ ] Advanced skins/effects shop
- [ ] Tournament mode (time-limited arena with prizes)
- [ ] Spectator mode (watch live hits across all arenas)
