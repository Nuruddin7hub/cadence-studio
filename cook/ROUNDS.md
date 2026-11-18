# Cook ledger: Cadence (Calendar & To-Do Studio)

Started: 2026-11-18 17:29 +08:00
Time: floor 4 Cook rounds + React Bits pass (session cap) | cap single-session completion
Bar: composition 99 | light 99 | color 99 | materials 99 | detail 99 | motion 9/10
Calibration offset: none yet (pending user feedback; apply strict zero-context critic scoring)
Usage: paced across parallel subagent critics and layered build steps
Gate: stills approved [pending user review at handoff] | Phase 2 React Bits polish [pending Phase 1 completion]
Best so far: round 02, `cook/stills/r02/`, commit `afa96f8`

## Decisions

Made without asking, one line each.
- 2026-11-18 17:29 Resolved Cook Intake defaults directly from prompt and attached skills (React + TypeScript + Vite + Tailwind + shadcn, inspo-mcp references, strict slop ban list, zero external raster assets), because prompt requested autonomous end-to-end execution of Cook A-to-Z followed by React Bits Effects.
- 2026-11-18 17:29 Selected dual-register architecture (Obsidian Studio dark default `#0B0C0F` + `#E74004` ember + `#F4C46C` amber, plus Daylight Paper light `#FFFFFF` + `#14A4FC` + `#D6950E`), because `inspo-mcp` top calendar/task references split across dark (`cron-com`, `morgen-so`, `linear-app`, `superlist-com`) and light (`amie-so`, `todoist-com`) while strictly avoiding banned purple and beige.
- 2026-11-18 17:29 Chose `playwright-core` driving installed Google Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`) for deterministic `1440x900` and `375x812` still captures, because Chrome is present locally and avoids slow multi-hundred-MB browser downloads.
- 2026-11-18 17:29 Included deterministic `?shot=<preset>` URL query presets and seeded date `2026-11-18` alongside normal interactive app state, because Cook requires identical framing and reproducible still comparisons across every round.

## User feedback inbox

- 2026-11-18 17:21 "make sure you actually use the whole cook skill A to Z, everything and the inspo mcp to fetch references to : I need you to make a calander and to do list website but consider many feature that relate to it put it in one website. After you finish the website using cook skill, use the react skill and apply it to the website. remember full award winning best looking website." | intake | open

---

## Round 01

Time: 17:29 to 17:38 +08:00 | total elapsed 0.15h
Usage: not readable
Focus: Initial full-feature Calendar & To-Do Studio build and verification harness across S01-S06

Changes:
- Built complete unified WorkspaceContext (`src/context/WorkspaceContext.tsx`) with localStorage persistence, Undo stack, keyboard shortcuts, deterministic `?shot=` presets, NLP task parser (`src/utils/nlp.ts`), RFC 5545 `.ics` exporter (`src/utils/ics.ts`), and subtle Web Audio chime synth (`src/utils/sound.ts`).
- Built TopBar (`src/components/TopBar.tsx`), Sidebar with mini-calendar & drag-to-calendar queue (`src/components/Sidebar.tsx`), multi-view Calendar with overlap layout & drag/resize (`src/components/CalendarView.tsx`), InspectorRail with Pomodoro timer & Daily Notes extractor (`src/components/InspectorRail.tsx`), TasksWorkspace with List/Kanban/Eisenhower Matrix (`src/components/TasksWorkspace.tsx`), FocusHabitsStudio (`src/components/FocusHabitsStudio.tsx`), AnalyticsSuite (`src/components/AnalyticsSuite.tsx`), ProductivityOverview (`src/components/ProductivityOverview.tsx`), CommandPalette (`src/components/CommandPalette.tsx`), FocusCurtain, MobileDock, and ToastStack.
- Built Cook still renderer (`scripts/render-stills.mjs`) and interaction test suite (`scripts/verify-interactions.mjs`).

Stills: `cook/stills/r01/` | Side by side: `cook/compare/r01/`

Measured (command and result):
- `npm run build`: `tsc -b && vite build` exited 0 in 3.14s (`dist/assets/index-b7DmfGQi.js` 373.51 kB).
- `node scripts/render-stills.mjs r01`: S01 1448ms, S02 1621ms, S03 1553ms, S04 1338ms, S05 1330ms, S06 1314ms; horizontal overflow `false` on all 6 shots; 1 console 404 (`favicon.ico`) caught on S01.
- `python cook/color_check.py`: S01 vs R01 sat `+0.157` bright `-0.034`; S02 vs R04 sat `-0.145` bright `-0.186`; S03 vs R03 sat `+0.012` bright `+0.006`; S04 vs R05 sat `+0.138` bright `+0.015`; S05 vs R01 sat `+0.131` bright `-0.048`.
- `node scripts/verify-interactions.mjs`: failed on `favicon.ico` 404 console error check (all UI flow assertions passed prior to error gate).

Scores, eyeballed: critic median after calibration (2 fresh zero-context critics, Critic A inherit + Critic B flash; >10pt spread on S02/S04/S05 noted — Round 02 adds 3rd critic)

| Shot | Comp | Light | Color | Materials | Detail | Motion | vs last round |
|---|---|---|---|---|---|---|---|
| S01 | 71 | 71 | 75 | 69 | 70 | not scored | baseline |
| S02 | 66 | 60 | 67 | 67 | 68 | not scored | baseline |
| S03 | 71 | 73 | 69 | 70 | 68 | not scored | baseline |
| S04 | 68 | 64 | 63 | 67 | 64 | not scored | baseline |
| S05 | 55 | 56 | 71 | 64 | 53 | not scored | baseline |
| S06 | 67 | 71 | 78 | 67 | 68 | not scored | baseline |

Raw critic medians before calibration: identical (calibration offset none yet).
Own score (logged, never decides): S01 72, S05 55.

Top gaps from critics:
1. S05 Overview hero: unanchored flat black background, orphan 3-line headline wrap, workspace toolbar collision, no framed live product showcase above fold.
2. S04 & S02 dark mode flatness & rainbow KPIs/tags: dead black cards without top-edge light sheen, 4 neon KPI hues vs Linear restraint, 16-pill wrapping tag bar, compressed Eisenhower matrix from locked sidebars.
3. S01, S03 & S06 truncation & overflow: locked 3-column layout truncating calendar titles, clipped right-rail Daily Notes, truncated `+ To-Do:` buttons on S03, `3-Day` wrap and overlapping `+08`/`22h` mobile gutter on S06.

Progress note sent: 2026-11-18 17:39 +08:00
Stop check: bar [no] | floor [no] | stills approved [no] | final checked [no] -> next round (Round 02)
Next focus: Overhaul S05 Overview hero with Cron-inspired centered 2-line display + atmospheric glow + live framed showcase; unify S04/S02 tonal lighting, monochrome KPI craft, and full-width Tasks matrix; fix S01/S03/S06 wrapping, rail collapsibility, and mobile header.

---

## Round 02

Time: 17:40 to 17:48 +08:00 | total elapsed 0.32h
Usage: not readable
Focus: S05 Overview hero & showcase framing, S02/S04 dark surface lighting & full-width Matrix, S01/S03/S06 wrapping & mobile fixes

Changes:
- Added inline SVG favicon in `index.html` (resolved 404 console error).
- Added `.studio-card` sheen/shadow elevation and `.studio-spotlight-dark` ambient radial lighting (`src/index.css`).
- Hidden right inspector rail on `Tasks` tab (`src/App.tsx`), added single-popover tag filter in `TasksWorkspace.tsx`, and added clean editorial header mode for Overview (`src/components/TopBar.tsx`).
- Tabbed `InspectorRail.tsx` into `Block Details | Daily Notes`, fixed `Daily Journal` action checklist layout and `Pomodoro Session` balance (`FocusHabitsStudio.tsx`), converted `AnalyticsSuite.tsx` KPIs to monochrome tabular numerals + added Y-axis gridlines & Backlog table, and rebuilt `ProductivityOverview.tsx` with centered Cron-inspired 2-line hero + live framed studio preview.
- Fixed mobile `3-Day` line wrapping and gutter overlap (`CalendarView.tsx`).

Stills: `cook/stills/r02/` | Side by side: `cook/compare/r02/`

Scores, eyeballed: critic median after calibration (3 fresh zero-context critics: Critic A inherit + Critic B flash + Critic C pro)

| Shot | Comp | Light | Color | Materials | Detail | Motion | vs last round |
|---|---|---|---|---|---|---|---|
| S01 | 74 | 72 | 72 | 73 | 68 | not scored | +3 / +1 / -3 / +4 / -2 |
| S02 | 77 | 65 | 71 | 69 | 71 | not scored | +11 / +5 / +4 / +2 / +3 |
| S03 | 73 | 71 | 72 | 72 | 62 | not scored | +2 / -2 / +3 / +2 / -6 |
| S04 | 78 | 69 | 71 | 72 | 68 | not scored | +10 / +5 / +8 / +5 / +4 |
| S05 | 66 | 65 | 73 | 70 | 66 | not scored | +11 / +9 / +2 / +6 / +13 |
| S06 | 75 | 68 | 71 | 70 | 64 | not scored | +8 / -3 / -7 / +3 / -4 |

Raw critic medians before calibration: identical (calibration offset none yet).
Own score (logged, never decides): S01 76, S05 68.

Measured (command and result):
- `npm run build`: exited 0 in 3.42s (`dist/assets/index-Di7Q7p5-.js` 390.58 kB).
- `node scripts/render-stills.mjs r02`: all 6 shots rendered (1283-1454ms), horizontal overflow `false`, console errors `[]` (0 errors).
- `python cook/color_check.py`: S01 vs R01 sat `+0.166` bright `-0.043`; S02 vs R04 sat `-0.111` bright `-0.184`; S03 vs R03 sat `+0.006` bright `-0.001`; S04 vs R05 sat `+0.156` bright `+0.026`; S05 vs R01 sat `+0.178` bright `-0.041`.
- `node scripts/verify-interactions.mjs`: `ALL_INTERACTIONS_PASSED`.

Top gaps from critics:
1. Detail regressions & duplication: verbatim 4-line journal echo + conflicting sprint totals in S03, duplicated Queue/Matrix tasks in S02, clipped `22 8 4 3` fold numbers in S05, `"1 blocks"` typo in S04, `line-through` text ghosting on S06 `Morning Writing & Priorities`.
2. Surface lighting & hairline restraint: bright perimeter event outlines on S01/S06, invisible dark-gray weekly load bars & `8h`/`3.8h` label collision in S04, flat backdrop behind S05 preview frame.
3. Mobile & column density: squeezed 50/50 split on `S06` noon blocks and bottom-edge clip behind MobileDock; duplicated timer task label in `InspectorRail`.

Progress note sent: 2026-11-18 17:46 +08:00
Stop check: bar [no] | floor [no] | stills approved [no] | final checked [no] -> next round (Round 03)
Next focus: Eliminate all verbatim duplication (S02 sidebar, S03 journal lines, S01 timer title), fix S04 chart axis spacing & pluralization, fit S05 hero cleanly within 100vh without fold-sliced stats, soften event borders to hairline + left accent, and stagger S06 mobile overlaps.
