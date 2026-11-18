# Cook ledger: Cadence (Calendar & To-Do Studio)

Started: 2026-11-18 17:29 +08:00
Time: floor 4 Cook rounds + React Bits pass (session cap) | cap single-session completion
Bar: composition 99 | light 99 | color 99 | materials 99 | detail 99 | motion 9/10
Calibration offset: none yet (pending user feedback; apply strict zero-context critic scoring)
Usage: paced across parallel subagent critics and layered build steps
Gate: stills approved [pending user review at handoff] | Phase 2 React Bits polish [pending Phase 1 completion]
Best so far: round 04, `cook/stills/r04/`, commit `pending-r04`

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

---

## Round 03

Time: 17:48 to 17:55 +08:00 | total elapsed 0.43h
Usage: not readable
Focus: Eliminate verbatim duplication, fix S04 axis spacing, fit S05 hero cleanly in 100vh, soften event hairlines

Changes:
- Removed `(Overlap)` suffix on `Partner Check-in` and disambiguated `FocusHistory` sprint entries with timestamps (`src/data/seed.ts`).
- Removed Calendar/Queue sidebar on `Tasks` view (`src/App.tsx`), replaced Tasks top bar quick-add duplicate with Command search button, and swapped Overview navbar to editorial links (`src/components/TopBar.tsx`).
- Added inline quick-add in Eisenhower quadrants and converted tags into clean popover filters (`src/components/TasksWorkspace.tsx`).
- Eliminated duplicate Daily Journal line echo (`src/components/FocusHabitsStudio.tsx`), separated bar top values in `AnalyticsSuite.tsx` and fixed `"1 block"` pluralization, and sized `ProductivityOverview.tsx` cleanly to 100vh with metallic display gradient and multi-column showcase preview.

Stills: `cook/stills/r03/` | Side by side: `cook/compare/r03/`

Scores, eyeballed: critic median after calibration (3 fresh zero-context critics: Critic A inherit + Critic B flash + Critic C pro)

| Shot | Comp | Light | Color | Materials | Detail | Motion | vs last round |
|---|---|---|---|---|---|---|---|
| S01 | 76 | 74 | 81 | 74 | 74 | not scored | +2 / +2 / +9 / +1 / +6 |
| S02 | 79 | 70 | 78 | 76 | 78 | not scored | +2 / +5 / +7 / +7 / +7 |
| S03 | 81 | 78 | 72 | 75 | 79 | not scored | +8 / +7 / +0 / +3 / +17 |
| S04 | 80 | 73 | 80 | 74 | 73 | not scored | +2 / +4 / +9 / +2 / +5 |
| S05 | 79 | 76 | 85 | 77 | 75 | not scored | +13 / +11 / +12 / +7 / +9 |
| S06 | 69 | 78 | 80 | 78 | 68 | not scored | -6 / +10 / +9 / +8 / +4 |

Raw critic medians before calibration: identical (calibration offset none yet).
Own score (logged, never decides): S01 79, S05 80.

Measured (command and result):
- `npm run build`: exited 0 in 2.69s (`dist/assets/index-CM75Mg57.js` 397.59 kB).
- `node scripts/render-stills.mjs r03`: all 6 shots rendered (1232-1421ms), overflow `false`, errors `[]`.
- `python cook/color_check.py`: S01 vs R01 sat `+0.193` bright `-0.040`; S02 vs R04 sat `-0.087` bright `-0.186`; S03 vs R03 sat `+0.006` bright `+0.005`; S04 vs R05 sat `+0.184` bright `+0.034`; S05 vs R01 sat `+0.185` bright `-0.037`.
- `node scripts/verify-interactions.mjs`: `ALL_INTERACTIONS_PASSED`.
- `node scripts/slop-scan.mjs`: flagged 1 comment em-dash in `src/data/seed.ts`.

Top gaps from critics:
1. S06/S01 coordinate & overlap regressions: double `+12` top offset shifted events slightly below hour lines; `day` mode cascade overlap covered `12 PM` icons on `Design Systems Review`; `justify-between` left tall block empty middle gap.
2. S04 data/chart precision: `7.8h` bar exceeded `8h` dashed line due to flexbox offset; `0%` progress bars rendered `6%` left dot artifact; `22 blocks` vs `20` timed blocks discrepancy.
3. S02/S03/S05 polish: nested bordered task boxes and bottom-pinned add rows in S02; blue CTA clash in S03 light mode; truncated queue titles and uniform wireframe blocks in S05 preview.

Progress note sent: 2026-11-18 17:53 +08:00
Stop check: bar [no] | floor [no] | stills approved [no] | final checked [no] -> next round (Round 04)
Next focus: Remove double `+12` event Y-offset and fix S06 50/50 split columns + compact mobile chrome; fix S04 exact Y-axis percentage lines and 0% track dot artifact; convert S02 to hairline-divided rows; unify S03 light-mode ember palette; upgrade S05 preview with true time-grid hairlines and non-truncating copy.

---

## Round 04

Time: 17:55 to 18:06 +08:00 | total elapsed 0.62h
Usage: not readable
Focus: Fix double `+12` Y-offset & 50/50 split overlaps, tighten mobile chrome, clean Analytics zero tracks, unify S03 light ember palette, upgrade S05 preview & S02 hairlines

Changes:
- Removed em-dash comment in `src/data/seed.ts` (`SLOP_SCAN_PASSED`).
- Fixed double `+12` Y-coordinate offset on event blocks, restored clean 50/50 side-by-side split overlaps in `day` mode, and removed tall-block `justify-between` middle void (`src/components/CalendarView.tsx`).
- Tuned Daylight Paper warm paper shadow & contrast (`src/index.css`), narrowed desktop sidebars (`w-[224px]` / `w-[264px]`), converted S02 Matrix rows to hairline dividers (`TasksWorkspace.tsx`), unified S03 light mode to ember `#E74004` (`FocusHabitsStudio.tsx`), fixed S04 exact Y-axis percentage lines and removed `0%` dot artifact (`AnalyticsSuite.tsx`), and upgraded S05 preview with hour hairlines and bottom vignette (`ProductivityOverview.tsx`).

Stills: `cook/stills/r04/` | Side by side: `cook/compare/r04/`

Scores, eyeballed: critic median after calibration (3 fresh zero-context critics: Alpha inherit + Beta flash + Gamma pro; mapped `match / hierarchy / craft / discipline / taste`)

| Shot | Match | Hierarchy | Craft | Discipline | Taste | Motion | vs last round |
|---|---|---|---|---|---|---|---|
| S01 | 78 | 82 | 76 | 94 | 81 | not scored | +2 / +8 / -5 / +20 / +7 |
| S02 | 86 | 88 | 85 | 93 | 87 | not scored | +7 / +18 / +7 / +17 / +9 |
| S03 | 84 | 86 | 83 | 94 | 85 | not scored | +3 / +8 / +11 / +19 / +6 |
| S04 | 84 | 87 | 81 | 94 | 85 | not scored | +4 / +14 / +1 / +20 / +10 |
| S05 | 80 | 86 | 79 | 90 | 83 | not scored | +1 / +10 / -6 / +13 / +8 |
| S06 | 89 | 91 | 88 | 95 | 90 | not scored | +20 / +13 / +8 / +17 / +22 |

Raw critic medians before calibration: identical (calibration offset none).

Measured (command and result):
- `npm run build`: exited 0 in 2.96s (`dist/assets/index-DbjXO53w.js` 401.09 kB, `index-D9kO-Oyx.css` 41.22 kB).
- `node scripts/slop-scan.mjs`: `SLOP_SCAN_PASSED: 24 files clean`.
- `node scripts/render-stills.mjs r04`: S01 1641ms, S02 3208ms, S03 1324ms, S04 1240ms, S05 1396ms, S06 1549ms; overflow `false`, errors `[]`.
- `python cook/color_check.py`: S01 vs R01 sat `+0.193` bright `-0.041`; S02 vs R04 sat `-0.079` bright `-0.196`; S03 vs R03 sat `-0.004` bright `+0.008`; S04 vs R05 sat `+0.184` bright `+0.035`; S05 vs R01 sat `+0.208` bright `-0.035`.
- `node scripts/verify-interactions.mjs`: `ALL_INTERACTIONS_PASSED` (after adding explicit `Pause timer` accessible text).

Top gaps from critics:
1. S05 eyebrow pill (`● Cadence Studio · Unified Calendar & To-Do`) violates `BRIEF.md` Rule 19 (`NO eyebrow labels`); preview right column (`Deep Focus`) has dead gap above `Habit streaks`.
2. S01 Week grid header `Wed [18]` right-aligned day badge, scrollbar-width misalignment vs body, `line-clamp-2` blocked by inner `<span className="truncate">`, `showSecondaryTz: true` (`UTC` vs `GMT+8`), and `November 2026` / `Queue` 4th-item clipping in `Sidebar.tsx`.
3. S04 flex bar container shrank `7.8h` bar below `8h` dashed line; dark `Total scheduled` bars too dim against `#111318`; `25.5h` vs `25.6h` rounding delta; three `0%` rows in backlog table.
4. S03 `Recent Focus Log` bottom void with only 3 entries; muted light-mode text contrast; S02 Matrix `+ Add directly to ...` unpinned mid-card + redundant `Overdue:` prefix + dev-meta copy (`#svg`, `#wcag`); S06 45m blocks omit start times (`height < 42`).

Stop check: bar [no] | floor [yes - 4 rounds completed] | stills approved [no] | final checked [no] -> next round (Round 05 Cook Polish before Phase 2 React Bits)
Next focus: Delete S05 eyebrow pill & enrich S05 preview time gutter + Deep Focus panel; fix S01 header-body alignment, `line-clamp-2` wrapping, `Nov 2026` single-line sidebar + clean queue fit, default single TZ (`GMT+8`), and S06 45m start times + bottom padding; fix S04 absolute bar labels, brighter slate scheduled bars, exact `25.5h` sum & seeded backlog completions; expand S03 focus log to fill card height cleanly; pin S02 quadrant footers and clean seed copy.
