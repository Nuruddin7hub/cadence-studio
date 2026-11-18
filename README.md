# Cadence Studio

A unified calendar, task management, Pomodoro focus, habit tracking, and time-analytics web workspace built with React 19, TypeScript, Vite, Tailwind CSS v4, and `@react-bits` animated UI components.

## Workspace Modules

- **Unified Planner (`Planner`)**: 7-day Week, Workweek, 3-Day, Day, Month, and Agenda timeline views; multi-column overlap lane calculation; drag-to-reschedule and bottom-edge duration resizing on 15-minute snaps; drag tasks from the Backlog Queue directly onto hour cells; dual timezone ruler (`GMT+8` + toggleable `UTC`); Availability slot picker (`Share times`) for copying open meeting windows; collapsible left mini-calendar sidebar and right inspector (`Block Details` + `Daily Notes`).
- **Tasks & Triage (`Tasks`)**: Smart views (`Today`, `Inbox`, `Upcoming`, `Overdue`, `Completed`), natural-language inline parser (date keywords, times, durations, priorities `!p1`–`!p4`, and `#tags`), drag-and-drop **Kanban Board**, and drag-and-drop **Eisenhower Priority Matrix**.
- **Focus, Habits & Journal (`Focus & Habits`)**: Integrated Pomodoro engine (`25m` / `5m` / `15m` presets, customizable 15–60 min spring `ElasticSlider`, distraction-free `FocusCurtain` overlay, Web Audio completion chime), 7-day habit consistency tracker, and `Daily Journal` reflection capture with one-click task extraction.
- **Analytics & Portability (`Analytics`)**: Scheduled weekly load vs deep focus chart with exact hour reference lines, category breakdown, project backlog effort table, RFC 5545 `.ics` calendar export, and local JSON backup/restore (`localStorage` persistence + `Ctrl+Z` undo stack).
- **Overview (`Overview`)**: Dual-theme landing experience (`Obsidian Studio` dark default `#090A0E` / `#E74004` ember and `Daylight Paper` `#FAFAF9` / `#FFFFFF` light theme), interactive workspace preview, `MagicBento` capability grid, interactive project `Folder` packs, swappable `CardSwap` stack, `Dock` switcher, and `Ctrl+K` Command Palette reference.

## Local Development

```bash
npm install
npm run dev
```

## Build & Verification Scripts

```bash
npm run build                        # TypeScript check + Vite production bundle
node scripts/slop-scan.mjs           # AI-slop, banned palette, and em-dash scanner
node scripts/verify-interactions.mjs # Headless Chrome end-to-end Playwright verification
node scripts/render-stills.mjs r08-lively
```

## Credits & Design System Tooling

- **Design References**: Studied layout structure, typography scale, dark/light contrast, and hierarchy via **Inspo MCP** (`https://inspomcp.dev/`).
- **Iterative Visual Loop**: Built and audited across 5 Cook rounds + 3 React Bits polish & motion waves using the **Cook** skill (`https://github.com/Leonxlnx/cook`).
- **Animated Components**: 33 `@react-bits/*-JS-CSS` components (`AnimatedContent`, `AnimatedList`, `Aurora`, `BellToggle`, `BlurText`, `BorderGlow`, `CardSwap`, `ClickSpark`, `CountUp`, `Counter`, `DecryptedText`, `Dock`, `DotGrid`, `ElasticSlider`, `ElectricBorder`, `FadeContent`, `Folder`, `GlareHover`, `GradientText`, `HoldButton`, `LineWaves`, `MagicBento`, `Magnet`, `RotatingText`, `RubberSegment`, `ScrollReveal`, `ScrollVelocity`, `ShinyText`, `SpotlightCard`, `SpringCheck`, `SquishSwitch`, `TextType`, `TiltedCard`), palette-tuned to Cadence Studio tokens and `prefers-reduced-motion` safe.
