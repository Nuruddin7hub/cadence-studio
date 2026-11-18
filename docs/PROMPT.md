# Build Provenance & Prompt Record

## User Prompt

> I need you to setup everythings in these things in this project
> first, cook skill: https://github.com/Leonxlnx/cook
> second, inspo mcp to fetch award winning website references: https://inspomcp.dev/ use npx -y inspo-mcp install
> third, react skill: I attached here in chat .
>
> Using the cook skill and the inspo mcp , make sure you actually use the whole cook skill A to Z, everything and the inspo mcp to fetch references to : I need you to make a calander and to do list website but consider many feature that relate to it put it in one website.
>
> After you finish the website using cook skill, use the react skill and apply it to the website. remember full award winning best looking website.

## Environment & Process

- **Agent**: Google DeepMind Antigravity Agent
- **Reference Set**: 7 award-winning SaaS/productivity references queried via **Inspo MCP** (`cron-com`, `morgen-so`, `amie-so`, `superlist-com`, `linear-app`, `todoist-com`, `vimcal-com`), stored locally during exploration under gitignored `cook/refs/`.
- **Methodology**:
  - **Phase 1 (Cook Rounds 01–05)**: `cook/BRIEF.md`, `cook/SHOTS.md`, `cook/ROUNDS.md`, per-round deterministic Chromium stills (`S01`–`S06`), `side-by-side.mjs` composite comparisons, `color_check.py` delta auditing, and independent multi-model zero-context critics after every round.
  - **Phase 2 (`r06-rb` & `r07-final`)**: Installed 23 official `@react-bits/*-JS-CSS` components via `npx shadcn@latest add`, removed banned purple fallback defaults from `.jsx`/`.css` files, wired atmospheric/surface/typographic/micro-interaction layers with `prefers-reduced-motion` fallbacks, verified custom below-the-fold scroll captures, and polished final typography kerning and 7-day habit seed math.

## Latest Final Check Results (`r07-final`)

- **`npm run build`**: Exited `0` in `11.52s` (`tsc -b && vite build`, `8158` modules transformed; `dist/assets/index-DUHgm0Yt.css` `105.80 kB`, `dist/assets/index-CvP-ymjp.js` `884.92 kB`).
- **`node scripts/slop-scan.mjs`**: `SLOP_SCAN_PASSED: 64 files clean` (zero em dashes, banned purple hex codes, beige literals, uppercase-monospace combinations, or external image URLs).
- **`node scripts/render-stills.mjs r07-final`**: `S01`–`S06` all rendered with `overflow: false` and `errors: []`.
- **`node scripts/verify-interactions.mjs`**: `ALL_INTERACTIONS_PASSED` (verified NLP quick add, `Share times` availability toggle, Calendar views, Tasks Smart List/Kanban/Matrix/check, Focus timer + habit toggle + journal extraction, `.ics` download, Overview React Bits DOM mount, Dark/Light theme toggle, `Ctrl+K` Command Palette, `prefers-reduced-motion: reduce`, zero em-dashes, zero console errors).
- **Phase 2 Zero-Context Critic Scores (`r06-rb`, prior to `r07-final` micro-fix on `studio.` period kerning & 7-day habit grid)**: Alpha mean `97.2` (`S01 97.4`, `S02 97.2`, `S03 98.2`, `S04 97.8`, `S05 95.6`, `S06 97.2`), Pro range `92–98` (`discipline 98`, zero slop violations; sole critical note `"studio ."` H1 spacing fixed in `r07-final`).

## Credits

- [Cook Visual Quality Loop](https://github.com/Leonxlnx/cook)
- [Inspo MCP](https://inspomcp.dev/)
- [React Bits](https://reactbits.dev/)
