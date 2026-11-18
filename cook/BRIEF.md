# Brief: Cadence Rewards, Streaks & Comeback System (From-Zero Cook Redesign)

Target: Redesign Cadence Studio's comeback, daily rewards, streak protection, and collectible achievement features from zero to match award-winning product benchmarks (`inspo` MCP: `linear-app`, `designmaestro-io`, `duolingo-com--plus`, `morgen-so`, `obsidian-md`), engineering an irresistibly motivating daily return loop synced across IndexedDB, Cloud Firestore, and the installable PWA.
Stack: React 19, TypeScript, Vite, Tailwind CSS, React Bits animated components (`TiltedCard`, `BorderGlow`, `SpotlightCard`, `Counter`, `CountUp`, `GlareHover`, `Magnet`, `RubberSegment`, `ShinyText`, `SpringCheck`, `AnimatedContent`), custom layered SVG emblems, Web Audio triads, Playwright-core + Chrome + Node + ffmpeg + Python/Pillow.
References: `cook/refs/R01.png` (`linear-app`), `R02.png` (`designmaestro-io`), `R03.png` (`duolingo-com--plus`), `R04.png` (`morgen-so`), `R05.png` (`obsidian-md`), plus mobile `R04_mobile_fold.png` (`375x812`). Match their spatial authority, specular border craft, reward path excitement, and hierarchy in Cadence's Obsidian Studio palette ("same quality, own style").

UI Rubric Mapping & Bar (0-100 similarity/craft parity against references; motion 1-10):
- Composition (layout hierarchy, reward path legibility, balanced density): 99
- Light (atmosphere, specular surface highlights, focal reward glow): 99
- Color (Obsidian `#0B0C0F` ground, Ember `#E74004`, Gold `#F4C46C`, Emerald `#2CCC74`, Sky `#14A4FC`, zero muddy grey): 99
- Materials (typography scale, custom layered SVG Trophy Emblems, crisp 1px hairlines, rarity framing): 99
- Detail density (realistic bounties, escalating 7-day chest rewards, multiplier math, 16-week mosaic, deep-link CTAs): 99
- Motion & Feedback (interactive React Bits physics, claim transitions, gentle Web Audio reward chords): 9/10
Calibration offset: none yet (use >=2 fresh zero-context critic subagents per round; apply offset immediately if calibration drift >=10 pts emerges).

Rules:
- Zero external raster images or cartoon stock clip-art; all trophy crests, reward crates, and heatmaps rendered cleanly in SVG/code.
- Sound: optional synthesized gentle Web Audio reward triad & achievement chords only when sound is enabled; zero harsh synth bells or rising whips.
- Slop ban list (strict): NO eyebrow labels, NO monospace uppercase text, NO random serif fonts, NO purple gradients, NO purple as default accent, NO beige, NO 01/02/03 counters, NO random glowing orbs, NO shockwave rings popping out of cards, NO decorative floating particles, NO long thin decorative lines, NO em dashes anywhere in visible UI copy.
- Hardware & Verification: `npm run build` (`tsc -b && vite build`), `node scripts/slop-scan.mjs`, deterministic stills at `1440x900` (`S01..S04`) & `375x812` (`S05`), Python `cook/color_check.py`, `node scripts/verify-interactions.mjs`, and live GitHub Pages Playwright E2E validation.

Time:
- Autonomous iterative Cook run (>= 4 structured Cook rounds: from-zero rebuild + deep critique & visual polish + React Bits choreography + final verification & live deployment).
- Started: 2026-11-19 01:55 +08:00.

Deliverable:
- Redesigned production comeback & rewards system (`src/utils/gamification.ts`, `src/components/TrophyEmblem.tsx`, `src/components/RewardsStudio.tsx`, `src/components/ComebackModal.tsx`, `src/components/ComebackOverviewBand.tsx`) integrated seamlessly into `WorkspaceContext`, `TopBar`, `ProductivityOverview`, `CommandPalette`, and `App`, committed and deployed live to `https://nuruddin7hub.github.io/cadence-studio/`.

Permissions: Full workspace implementation, `inspo` MCP queries, local still rendering & subagent critics, git commit & GitHub Pages push upon verified passing checks.
User's words: "redesign back from zero the come back features everything the achievements the daily stuff award etc and what I need you to do this rerun back the whole cook skill just exclusively for making those features and use the inspo MCP to find award winning websites that implement this features and use them as references when doing the full cook skill run just exclusively to make implement this addictive features . Bismillah"
