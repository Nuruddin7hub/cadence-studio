---
name: react-bits-effects
description: A design playbook for making any website beautiful with React Bits animated components, plus a complete index of all 217 FREE React Bits components with their exact install commands. Use whenever building, restyling or polishing a website of any kind — read the site's purpose first, then use every matching effect from the core set and the full index that is suitable and useful — with no artificial limit on how many — layering them by the placement map so the site feels richly animated and engaging everywhere, while following the safety rules so everything still works.
---

# React Bits Effects — make any website beautiful

## What this skill is

A reusable effects library for AI website builders, built on [React Bits](https://reactbits.dev). Every component has an exact install command:

```
npx shadcn@latest add @react-bits/<Component>-JS-CSS
```

The command name is the component's display name in PascalCase (spaces removed) + `-JS-CSS` — verified on the site (e.g. "Blur Text" → `@react-bits/BlurText-JS-CSS`).

**Core idea: the effects must fit what the website IS.** A finance dashboard, a photographer's portfolio and a children's game site should not get the same effects. Read the site's purpose, audience and mood first, then choose — never apply effects at random.

**No artificial cap:** do not limit yourself to a handful of effects. Use **every** effect that is suitable and useful for the site — across the background, headings, cards, galleries, numbers, navigation, buttons, forms and scroll moments — so the finished site feels animated and engaging everywhere, not just in one hero section. Suitability is the only filter, never a count.

**Free vs Pro:** everything indexed in this file is FREE — all 217 components on reactbits.dev are free (checked 18 Nov 2026). "React Bits Pro" is a separate paid library on a different site (pro.reactbits.dev) and is **not** included here. (Three free components merely have "Pro" in their name: Variable Proximity, Profile Card, Prompt Bar.)

## Step 1 — Read the website before choosing anything

Decide these three things first:

1. **Type** — dashboard/data tool, portfolio/creative, landing/marketing page, showcase/gallery, blog/content, e-commerce, event/personal page.
2. **Mood** — serious & trustworthy, playful, premium/elegant, techy/futuristic, warm & personal.
3. **Content shape** — lots of text? cards? images/certificates? data that updates? long scrolling page? small interactive controls (forms, toggles, sliders)?

Then pick effects using the matching row in Step 3, from the core set in Step 2 or the full index in Step 2B.

## Step 2 — The core set (proven shortlist)

Start here. These are the most versatile components, with placement guidance:

| Component | Command | What it does | Best used for |
|-----------|---------|--------------|----------------|
| CursorGrid | `npx shadcn@latest add @react-bits/CursorGrid-JS-CSS` | Background grid that reacts to the cursor | Techy / dashboard backgrounds |
| LetterGlitch | `npx shadcn@latest add @react-bits/LetterGlitch-JS-CSS` | Canvas field of glitching letters | Bold creative / hacker / gaming backgrounds — tune colours to the site's palette and keep it QUIET (low opacity) |
| TiltedCard | `npx shadcn@latest add @react-bits/TiltedCard-JS-CSS` | Card tilts in 3D following the cursor, soft glare, springs back flat | The page's hero card, certificates, product cards, any framed image that deserves attention |
| BorderGlow | `npx shadcn@latest add @react-bits/BorderGlow-JS-CSS` | Pointer-tracked glow tracing a card's border | Layered inside a TiltedCard, or on one featured card/panel |
| CardSwap | `npx shadcn@latest add @react-bits/CardSwap-JS-CSS` | A deck of cards that swap/cycle | "Coming up", featured items, testimonials — pick ONE of CardSwap / Shredder per deck |
| Shredder | `npx shadcn@latest add @react-bits/Shredder-JS-CSS` | Card deck with a shredder-style cycle animation | Same slots as CardSwap, bolder feel — pick ONE of the two |
| BranchedMenu | `npx shadcn@latest add @react-bits/BranchedMenu-JS-CSS` | Menu that branches open from a corner button | Navigation on app-like sites; bottom-left or bottom-right corner |
| StickerPeel | `npx shadcn@latest add @react-bits/StickerPeel-JS-CSS` | Logo/badge rendered as a peelable sticker | Site logo or badge, top-left; playful and personal sites love this |
| SplitText | `npx shadcn@latest add @react-bits/SplitText-JS-CSS` | Heading letters rise and fade in one by one, then settle | The main H1 / page heading — one heading only |
| DepthText | `npx shadcn@latest add @react-bits/DepthText-JS-CSS` | Extruded 3D block lettering with pointer parallax | A big display heading on showcase / achievement / poster-style pages |
| TextType | `npx shadcn@latest add @react-bits/TextType-JS-CSS` | Typewriter that types a line once, then stops | A status line ("last updated …"), a tagline, a terminal-style line — short text only |
| ScrollReveal | `npx shadcn@latest add @react-bits/ScrollReveal-JS-CSS` | Sections rise, sharpen from a slight blur and fade in as they scroll into view | Long pages: apply to the blocks below the hero, never the hero itself |
| FlipCard | `npx shadcn@latest add @react-bits/FlipCard-JS-CSS` | Two-faced card that flips on click/tap | ⚠️ Use with caution — flipping HIDES the front content, and users dislike hunting for descriptions. Only when the back is truly optional extra detail, never for primary text |

## Step 2B — Complete free library index (all 217, by category)

The full shelf. When the core set doesn't have what a site needs, pick from here — same command pattern for every row. The 13 core-set components above are marked ★ and not repeated in these tables.

Category guide:
- **Text Animations (33)** — headings, hero words, numbers, any text that should arrive with style.
- **Animations (38)** — cursor effects, hover magic, content entrances, image effects.
- **Components (48)** — navs, menus, carousels, galleries, cards, layout pieces.
- **Micro (34)** — tiny interactive controls: buttons, toggles, sliders, toasts, ratings. Use them wherever a control exists — if a button, toggle, slider or rating can feel more alive, give it a Micro treatment. Do not ration them.
- **Backgrounds (64)** — full-page or section backdrops. Use one strong background as the page base, and add different background treatments to distinct sections where that separates the page into chapters and keeps it engaging.

### Text Animations — 29 more

| Component | Command |
|-----------|---------|
| Tech Text | `npx shadcn@latest add @react-bits/TechText-JS-CSS` |
| Text Loop | `npx shadcn@latest add @react-bits/TextLoop-JS-CSS` |
| Masked Heading | `npx shadcn@latest add @react-bits/MaskedHeading-JS-CSS` |
| Particle Text | `npx shadcn@latest add @react-bits/ParticleText-JS-CSS` |
| Split Flap Text | `npx shadcn@latest add @react-bits/SplitFlapText-JS-CSS` |
| Warp Text | `npx shadcn@latest add @react-bits/WarpText-JS-CSS` |
| Stroke Text | `npx shadcn@latest add @react-bits/StrokeText-JS-CSS` |
| Fold Text | `npx shadcn@latest add @react-bits/FoldText-JS-CSS` |
| Echo Text | `npx shadcn@latest add @react-bits/EchoText-JS-CSS` |
| Blur Text | `npx shadcn@latest add @react-bits/BlurText-JS-CSS` |
| Circular Text | `npx shadcn@latest add @react-bits/CircularText-JS-CSS` |
| Shuffle | `npx shadcn@latest add @react-bits/Shuffle-JS-CSS` |
| Shiny Text | `npx shadcn@latest add @react-bits/ShinyText-JS-CSS` |
| Text Pressure | `npx shadcn@latest add @react-bits/TextPressure-JS-CSS` |
| Curved Loop | `npx shadcn@latest add @react-bits/CurvedLoop-JS-CSS` |
| Fuzzy Text | `npx shadcn@latest add @react-bits/FuzzyText-JS-CSS` |
| Gradient Text | `npx shadcn@latest add @react-bits/GradientText-JS-CSS` |
| Falling Text | `npx shadcn@latest add @react-bits/FallingText-JS-CSS` |
| Text Cursor | `npx shadcn@latest add @react-bits/TextCursor-JS-CSS` |
| Decrypted Text | `npx shadcn@latest add @react-bits/DecryptedText-JS-CSS` |
| True Focus | `npx shadcn@latest add @react-bits/TrueFocus-JS-CSS` |
| Scroll Float | `npx shadcn@latest add @react-bits/ScrollFloat-JS-CSS` |
| ASCII Text | `npx shadcn@latest add @react-bits/ASCIIText-JS-CSS` |
| Scrambled Text | `npx shadcn@latest add @react-bits/ScrambledText-JS-CSS` |
| Rotating Text | `npx shadcn@latest add @react-bits/RotatingText-JS-CSS` |
| Glitch Text | `npx shadcn@latest add @react-bits/GlitchText-JS-CSS` |
| Scroll Velocity | `npx shadcn@latest add @react-bits/ScrollVelocity-JS-CSS` |
| Variable Proximity | `npx shadcn@latest add @react-bits/VariableProximity-JS-CSS` |
| Count Up | `npx shadcn@latest add @react-bits/CountUp-JS-CSS` |

### Animations — 36 more

| Component | Command |
|-----------|---------|
| Crystalized Ball | `npx shadcn@latest add @react-bits/CrystalizedBall-JS-CSS` |
| Electric Logo | `npx shadcn@latest add @react-bits/ElectricLogo-JS-CSS` |
| Dither Veil | `npx shadcn@latest add @react-bits/DitherVeil-JS-CSS` |
| Glow Cursor | `npx shadcn@latest add @react-bits/GlowCursor-JS-CSS` |
| Scroll Expand | `npx shadcn@latest add @react-bits/ScrollExpand-JS-CSS` |
| Ripple Distortion | `npx shadcn@latest add @react-bits/RippleDistortion-JS-CSS` |
| Elastic Mesh | `npx shadcn@latest add @react-bits/ElasticMesh-JS-CSS` |
| Swarm Cursor | `npx shadcn@latest add @react-bits/SwarmCursor-JS-CSS` |
| Halftone Reveal | `npx shadcn@latest add @react-bits/HalftoneReveal-JS-CSS` |
| Pixel Swap | `npx shadcn@latest add @react-bits/PixelSwap-JS-CSS` |
| Animated Content | `npx shadcn@latest add @react-bits/AnimatedContent-JS-CSS` |
| Fade Content | `npx shadcn@latest add @react-bits/FadeContent-JS-CSS` |
| Electric Border | `npx shadcn@latest add @react-bits/ElectricBorder-JS-CSS` |
| Orbit Images | `npx shadcn@latest add @react-bits/OrbitImages-JS-CSS` |
| Pixel Transition | `npx shadcn@latest add @react-bits/PixelTransition-JS-CSS` |
| Glare Hover | `npx shadcn@latest add @react-bits/GlareHover-JS-CSS` |
| Logo Loop | `npx shadcn@latest add @react-bits/LogoLoop-JS-CSS` |
| Target Cursor | `npx shadcn@latest add @react-bits/TargetCursor-JS-CSS` |
| Laser Flow | `npx shadcn@latest add @react-bits/LaserFlow-JS-CSS` |
| Ghost Cursor | `npx shadcn@latest add @react-bits/GhostCursor-JS-CSS` |
| Gradual Blur | `npx shadcn@latest add @react-bits/GradualBlur-JS-CSS` |
| Click Spark | `npx shadcn@latest add @react-bits/ClickSpark-JS-CSS` |
| Magnet | `npx shadcn@latest add @react-bits/Magnet-JS-CSS` |
| Strands | `npx shadcn@latest add @react-bits/Strands-JS-CSS` |
| Pixel Trail | `npx shadcn@latest add @react-bits/PixelTrail-JS-CSS` |
| Cubes | `npx shadcn@latest add @react-bits/Cubes-JS-CSS` |
| Metallic Paint | `npx shadcn@latest add @react-bits/MetallicPaint-JS-CSS` |
| Noise | `npx shadcn@latest add @react-bits/Noise-JS-CSS` |
| Shape Blur | `npx shadcn@latest add @react-bits/ShapeBlur-JS-CSS` |
| Crosshair | `npx shadcn@latest add @react-bits/Crosshair-JS-CSS` |
| Image Trail | `npx shadcn@latest add @react-bits/ImageTrail-JS-CSS` |
| Ribbons | `npx shadcn@latest add @react-bits/Ribbons-JS-CSS` |
| Splash Cursor | `npx shadcn@latest add @react-bits/SplashCursor-JS-CSS` |
| Meta Balls | `npx shadcn@latest add @react-bits/MetaBalls-JS-CSS` |
| Blob Cursor | `npx shadcn@latest add @react-bits/BlobCursor-JS-CSS` |
| Star Border | `npx shadcn@latest add @react-bits/StarBorder-JS-CSS` |

### Components — 45 more

| Component | Command |
|-----------|---------|
| Holo Card | `npx shadcn@latest add @react-bits/HoloCard-JS-CSS` |
| Circular Carousel | `npx shadcn@latest add @react-bits/CircularCarousel-JS-CSS` |
| Flex Carousel | `npx shadcn@latest add @react-bits/FlexCarousel-JS-CSS` |
| Infinite Spiral | `npx shadcn@latest add @react-bits/InfiniteSpiral-JS-CSS` |
| Depth Carousel | `npx shadcn@latest add @react-bits/DepthCarousel-JS-CSS` |
| Morph Slider | `npx shadcn@latest add @react-bits/MorphSlider-JS-CSS` |
| Drift Wall | `npx shadcn@latest add @react-bits/DriftWall-JS-CSS` |
| Accordion Gallery | `npx shadcn@latest add @react-bits/AccordionGallery-JS-CSS` |
| Specular Button | `npx shadcn@latest add @react-bits/SpecularButton-JS-CSS` |
| Option Wheel | `npx shadcn@latest add @react-bits/OptionWheel-JS-CSS` |
| Curved Input | `npx shadcn@latest add @react-bits/CurvedInput-JS-CSS` |
| Line Sidebar | `npx shadcn@latest add @react-bits/LineSidebar-JS-CSS` |
| Animated List | `npx shadcn@latest add @react-bits/AnimatedList-JS-CSS` |
| Scroll Stack | `npx shadcn@latest add @react-bits/ScrollStack-JS-CSS` |
| Bubble Menu | `npx shadcn@latest add @react-bits/BubbleMenu-JS-CSS` |
| Magic Bento | `npx shadcn@latest add @react-bits/MagicBento-JS-CSS` |
| Circular Gallery | `npx shadcn@latest add @react-bits/CircularGallery-JS-CSS` |
| Reflective Card | `npx shadcn@latest add @react-bits/ReflectiveCard-JS-CSS` |
| Card Nav | `npx shadcn@latest add @react-bits/CardNav-JS-CSS` |
| Stack | `npx shadcn@latest add @react-bits/Stack-JS-CSS` |
| Fluid Glass | `npx shadcn@latest add @react-bits/FluidGlass-JS-CSS` |
| Pill Nav | `npx shadcn@latest add @react-bits/PillNav-JS-CSS` |
| Masonry | `npx shadcn@latest add @react-bits/Masonry-JS-CSS` |
| Glass Surface | `npx shadcn@latest add @react-bits/GlassSurface-JS-CSS` |
| Dome Gallery | `npx shadcn@latest add @react-bits/DomeGallery-JS-CSS` |
| Chroma Grid | `npx shadcn@latest add @react-bits/ChromaGrid-JS-CSS` |
| Folder | `npx shadcn@latest add @react-bits/Folder-JS-CSS` |
| Staggered Menu | `npx shadcn@latest add @react-bits/StaggeredMenu-JS-CSS` |
| Model Viewer | `npx shadcn@latest add @react-bits/ModelViewer-JS-CSS` |
| Lanyard | `npx shadcn@latest add @react-bits/Lanyard-JS-CSS` |
| Profile Card | `npx shadcn@latest add @react-bits/ProfileCard-JS-CSS` |
| Dock | `npx shadcn@latest add @react-bits/Dock-JS-CSS` |
| Gooey Nav | `npx shadcn@latest add @react-bits/GooeyNav-JS-CSS` |
| Pixel Card | `npx shadcn@latest add @react-bits/PixelCard-JS-CSS` |
| Carousel | `npx shadcn@latest add @react-bits/Carousel-JS-CSS` |
| Spotlight Card | `npx shadcn@latest add @react-bits/SpotlightCard-JS-CSS` |
| Flying Posters | `npx shadcn@latest add @react-bits/FlyingPosters-JS-CSS` |
| Glass Icons | `npx shadcn@latest add @react-bits/GlassIcons-JS-CSS` |
| Decay Card | `npx shadcn@latest add @react-bits/DecayCard-JS-CSS` |
| Flowing Menu | `npx shadcn@latest add @react-bits/FlowingMenu-JS-CSS` |
| Elastic Slider | `npx shadcn@latest add @react-bits/ElasticSlider-JS-CSS` |
| Counter | `npx shadcn@latest add @react-bits/Counter-JS-CSS` |
| Infinite Menu | `npx shadcn@latest add @react-bits/InfiniteMenu-JS-CSS` |
| Stepper | `npx shadcn@latest add @react-bits/Stepper-JS-CSS` |
| Bounce Cards | `npx shadcn@latest add @react-bits/BounceCards-JS-CSS` |

### Micro — 31 more

Small interactive controls — buttons, toggles, sliders, toasts, ratings with playful physics.

| Component | Command |
|-----------|---------|
| Paper Crumple | `npx shadcn@latest add @react-bits/PaperCrumple-JS-CSS` |
| Tear Ticket | `npx shadcn@latest add @react-bits/TearTicket-JS-CSS` |
| Folder Float | `npx shadcn@latest add @react-bits/FolderFloat-JS-CSS` |
| Refine Frame | `npx shadcn@latest add @react-bits/RefineFrame-JS-CSS` |
| Thought Line | `npx shadcn@latest add @react-bits/ThoughtLine-JS-CSS` |
| Voice Pill | `npx shadcn@latest add @react-bits/VoicePill-JS-CSS` |
| Slosh Gauge | `npx shadcn@latest add @react-bits/SloshGauge-JS-CSS` |
| Prompt Bar | `npx shadcn@latest add @react-bits/PromptBar-JS-CSS` |
| Swipe Toast | `npx shadcn@latest add @react-bits/SwipeToast-JS-CSS` |
| Sling Button | `npx shadcn@latest add @react-bits/SlingButton-JS-CSS` |
| Bell Toggle | `npx shadcn@latest add @react-bits/BellToggle-JS-CSS` |
| Call Chip | `npx shadcn@latest add @react-bits/CallChip-JS-CSS` |
| Status Mark | `npx shadcn@latest add @react-bits/StatusMark-JS-CSS` |
| Glide Select | `npx shadcn@latest add @react-bits/GlideSelect-JS-CSS` |
| Swipe Row | `npx shadcn@latest add @react-bits/SwipeRow-JS-CSS` |
| Jelly Radio | `npx shadcn@latest add @react-bits/JellyRadio-JS-CSS` |
| Comet Dial | `npx shadcn@latest add @react-bits/CometDial-JS-CSS` |
| Wake Slider | `npx shadcn@latest add @react-bits/WakeSlider-JS-CSS` |
| Code Slots | `npx shadcn@latest add @react-bits/CodeSlots-JS-CSS` |
| Dodge Field | `npx shadcn@latest add @react-bits/DodgeField-JS-CSS` |
| Lattice Loader | `npx shadcn@latest add @react-bits/LatticeLoader-JS-CSS` |
| Scrub Field | `npx shadcn@latest add @react-bits/ScrubField-JS-CSS` |
| Fuse Button | `npx shadcn@latest add @react-bits/FuseButton-JS-CSS` |
| Warm Tooltip | `npx shadcn@latest add @react-bits/WarmTooltip-JS-CSS` |
| Slide Commit | `npx shadcn@latest add @react-bits/SlideCommit-JS-CSS` |
| Rubber Segment | `npx shadcn@latest add @react-bits/RubberSegment-JS-CSS` |
| Pulse Heart | `npx shadcn@latest add @react-bits/PulseHeart-JS-CSS` |
| Spring Check | `npx shadcn@latest add @react-bits/SpringCheck-JS-CSS` |
| Peek Rating | `npx shadcn@latest add @react-bits/PeekRating-JS-CSS` |
| Hold Button | `npx shadcn@latest add @react-bits/HoldButton-JS-CSS` |
| Squish Switch | `npx shadcn@latest add @react-bits/SquishSwitch-JS-CSS` |

### Backgrounds — 63 more

Pick by mood, and feel free to vary it by section — Aurora/Silk/Soft Aurora for calm and premium, Galaxy/Particles/Hyperspeed for space and tech, Faulty Terminal/Dither/CRT Warp for retro and hacker, Waves/Threads/Lines for gentle and corporate.

| Component | Command |
|-----------|---------|
| Holo Mosaic | `npx shadcn@latest add @react-bits/HoloMosaic-JS-CSS` |
| Gradient ASCII | `npx shadcn@latest add @react-bits/GradientASCII-JS-CSS` |
| Flux Lines | `npx shadcn@latest add @react-bits/FluxLines-JS-CSS` |
| Pattern Waves | `npx shadcn@latest add @react-bits/PatternWaves-JS-CSS` |
| Micro Slats | `npx shadcn@latest add @react-bits/MicroSlats-JS-CSS` |
| Shape Waves | `npx shadcn@latest add @react-bits/ShapeWaves-JS-CSS` |
| Aero Shards | `npx shadcn@latest add @react-bits/AeroShards-JS-CSS` |
| Ghost Fibers | `npx shadcn@latest add @react-bits/GhostFibers-JS-CSS` |
| CRT Warp | `npx shadcn@latest add @react-bits/CRTWarp-JS-CSS` |
| Molten Metal | `npx shadcn@latest add @react-bits/MoltenMetal-JS-CSS` |
| Gradient Waves | `npx shadcn@latest add @react-bits/GradientWaves-JS-CSS` |
| Web Threads | `npx shadcn@latest add @react-bits/WebThreads-JS-CSS` |
| Topography | `npx shadcn@latest add @react-bits/Topography-JS-CSS` |
| Light Tunnel | `npx shadcn@latest add @react-bits/LightTunnel-JS-CSS` |
| Sliced Waves | `npx shadcn@latest add @react-bits/SlicedWaves-JS-CSS` |
| Acid Squares | `npx shadcn@latest add @react-bits/AcidSquares-JS-CSS` |
| Scanner | `npx shadcn@latest add @react-bits/Scanner-JS-CSS` |
| Ferrofluid | `npx shadcn@latest add @react-bits/Ferrofluid-JS-CSS` |
| Lightfall | `npx shadcn@latest add @react-bits/Lightfall-JS-CSS` |
| Liquid Ether | `npx shadcn@latest add @react-bits/LiquidEther-JS-CSS` |
| Prism | `npx shadcn@latest add @react-bits/Prism-JS-CSS` |
| Dark Veil | `npx shadcn@latest add @react-bits/DarkVeil-JS-CSS` |
| Light Pillar | `npx shadcn@latest add @react-bits/LightPillar-JS-CSS` |
| Antigravity | `npx shadcn@latest add @react-bits/Antigravity-JS-CSS` |
| Silk | `npx shadcn@latest add @react-bits/Silk-JS-CSS` |
| Floating Lines | `npx shadcn@latest add @react-bits/FloatingLines-JS-CSS` |
| Side Rays | `npx shadcn@latest add @react-bits/SideRays-JS-CSS` |
| Light Rays | `npx shadcn@latest add @react-bits/LightRays-JS-CSS` |
| Pixel Blast | `npx shadcn@latest add @react-bits/PixelBlast-JS-CSS` |
| Color Bends | `npx shadcn@latest add @react-bits/ColorBends-JS-CSS` |
| Line Waves | `npx shadcn@latest add @react-bits/LineWaves-JS-CSS` |
| Radar | `npx shadcn@latest add @react-bits/Radar-JS-CSS` |
| Soft Aurora | `npx shadcn@latest add @react-bits/SoftAurora-JS-CSS` |
| Magic Rings | `npx shadcn@latest add @react-bits/MagicRings-JS-CSS` |
| Aurora | `npx shadcn@latest add @react-bits/Aurora-JS-CSS` |
| Plasma | `npx shadcn@latest add @react-bits/Plasma-JS-CSS` |
| Plasma Wave | `npx shadcn@latest add @react-bits/PlasmaWave-JS-CSS` |
| Particles | `npx shadcn@latest add @react-bits/Particles-JS-CSS` |
| Gradient Blinds | `npx shadcn@latest add @react-bits/GradientBlinds-JS-CSS` |
| Grainient | `npx shadcn@latest add @react-bits/Grainient-JS-CSS` |
| Grid Scan | `npx shadcn@latest add @react-bits/GridScan-JS-CSS` |
| Beams | `npx shadcn@latest add @react-bits/Beams-JS-CSS` |
| Pixel Snow | `npx shadcn@latest add @react-bits/PixelSnow-JS-CSS` |
| Lightning | `npx shadcn@latest add @react-bits/Lightning-JS-CSS` |
| Prismatic Burst | `npx shadcn@latest add @react-bits/PrismaticBurst-JS-CSS` |
| Galaxy | `npx shadcn@latest add @react-bits/Galaxy-JS-CSS` |
| Dither | `npx shadcn@latest add @react-bits/Dither-JS-CSS` |
| Faulty Terminal | `npx shadcn@latest add @react-bits/FaultyTerminal-JS-CSS` |
| Ripple Grid | `npx shadcn@latest add @react-bits/RippleGrid-JS-CSS` |
| Dot Field | `npx shadcn@latest add @react-bits/DotField-JS-CSS` |
| Dot Grid | `npx shadcn@latest add @react-bits/DotGrid-JS-CSS` |
| Threads | `npx shadcn@latest add @react-bits/Threads-JS-CSS` |
| Hyperspeed | `npx shadcn@latest add @react-bits/Hyperspeed-JS-CSS` |
| Iridescence | `npx shadcn@latest add @react-bits/Iridescence-JS-CSS` |
| Waves | `npx shadcn@latest add @react-bits/Waves-JS-CSS` |
| Magnet Lines | `npx shadcn@latest add @react-bits/MagnetLines-JS-CSS` |
| Grid Distortion | `npx shadcn@latest add @react-bits/GridDistortion-JS-CSS` |
| Ballpit | `npx shadcn@latest add @react-bits/Ballpit-JS-CSS` |
| Orb | `npx shadcn@latest add @react-bits/Orb-JS-CSS` |
| Grid Motion | `npx shadcn@latest add @react-bits/GridMotion-JS-CSS` |
| Shape Grid | `npx shadcn@latest add @react-bits/ShapeGrid-JS-CSS` |
| Liquid Chrome | `npx shadcn@latest add @react-bits/LiquidChrome-JS-CSS` |
| Balatro | `npx shadcn@latest add @react-bits/Balatro-JS-CSS` |

## Step 3 — Choose by website type

Build a **rich effects set** from the matching row — there is **no 3–5 limit, and no maximum at all**. Start with the row, then keep adding every other effect from Step 2 and the Step 2B index that is suitable and useful for this site's content, sections and controls. Aim for a site that feels animated at every scroll depth: background, headings, cards, numbers, nav, buttons, forms and section reveals should all move or react where it serves the content. That expanded set is the site's effects identity — keep its palette, motion speed and component family consistent across all pages, not its count.

| Website type | Background | Heading | Cards / content | Extras |
|--------------|-----------|---------|-----------------|--------|
| **Dashboard / data tool** | CursorGrid (subtle) or Dot Grid | SplitText on the title | TiltedCard + BorderGlow on the main panel/calendar | TextType for a live "last updated" line, ScrollReveal below the fold, BranchedMenu for nav, Count Up for stat numbers |
| **Portfolio / creative** | LetterGlitch (palette-tuned, quiet), Aurora or Galaxy | DepthText or SplitText | TiltedCard on project covers, Dome Gallery / Circular Gallery for image sets | StickerPeel logo, ScrollReveal for project sections, Magnet on CTA buttons |
| **Landing / marketing** | Aurora, Silk or Particles | SplitText or Gradient Text hero headline | TiltedCard on the featured card, Magic Bento for feature grids | TextType tagline, Logo Loop for client logos, ScrollReveal sections, CardSwap testimonials |
| **Showcase / gallery / certificates** | LetterGlitch (quiet, palette-matched) or Dark Veil | DepthText | TiltedCard on every framed item (click still opens the full view), Masonry for grids | StickerPeel badge |
| **Blog / content** | none or very subtle Dot Grid | SplitText or Blur Text | Animated List for post lists | ScrollReveal on article blocks, TextType for dates/meta |
| **E-commerce** | none or Soft Aurora | SplitText | TiltedCard / Spotlight Card on product cards, Carousel / Flex Carousel for ranges | CardSwap for featured products, Counter for cart counts |
| **Event / personal page** | mood-dependent: Aurora, Waves, Pixel Snow | DepthText or Circular Text | TiltedCard on the poster/photo | StickerPeel badge, TextType for the date line, Count Up countdown numbers |
| **Forms / app UI** | none | — | Glass Surface / Fluid Glass panels | Micro category: Squish Switch, Jelly Radio, Spring Check, Warm Tooltip, Swipe Toast — and any other Micro control that fits, used across every form control that benefits |

Mood adjustments: **serious/trustworthy** → keep the animation rich, but pick calmer components, slower and gentler motion, and skip harsh glitch styling. **Playful** → go biggest: StickerPeel, Ballpit, bolder colours, CardSwap/Shredder, cursor effects and Micro controls everywhere they fit. **Premium** → rich but refined: TiltedCard + BorderGlow, Silk/Aurora, elegant text animations, galleries and smooth reveals layered generously, with generous spacing and subtle colours.

## Step 4 — Placement map (where each effect is allowed to go)

- **Background:** one strong base background component (from Backgrounds or CursorGrid/LetterGlitch) behind everything, pointer-events off, quiet enough that text and data stay perfectly readable — plus additional background treatments for distinct sections where they help the page feel alive and separate its chapters.
- **Heading:** give every major heading an animated treatment — SplitText, DepthText, Blur Text, Gradient Text, etc. Different headings can use different treatments, and compatible treatments can be layered on the same heading (e.g. a SplitText reveal with a Gradient Text fill) when the words still read clearly.
- **Hero / main card:** TiltedCard, with BorderGlow layered inside it so the glow follows the tilt. Layer more compatible effects (glare, spotlight, animated borders) where they add life.
- **Framed items** (certificates, products, photos): TiltedCard each — the tilt must never block the click that opens the item.
- **Card decks** ("coming up", featured, testimonials): CardSwap OR Shredder per deck — different decks on the same site may use different styles.
- **Navigation:** one primary nav style per site — BranchedMenu, Pill Nav, Gooey Nav, Dock, Flowing Menu, etc. — plus complementary menus/docks where a second navigation moment is genuinely useful.
- **Logo/badge:** StickerPeel, top-left.
- **Status/tagline line:** TextType — types once, then stops. No looping, no deleting.
- **Numbers/stats:** Count Up or Counter — animate every important number.
- **Small controls:** Micro components wherever there are controls — forms, toolbars, ratings, toasts and buttons — as many as are useful. Do not ration them.
- **Below the fold:** ScrollReveal (and other entrance effects) on each major block, firing ONCE per block — every section should arrive with motion, not just the hero.

## Step 5 — Composition rules (this is what makes it rich, animated and engaging)

1. **No effects limit — use everything suitable and useful.** There is no maximum number of effects per site or per page, and Micro controls are not rationed either. If an effect fits the content, the mood and the slot, and makes the site more animated, engaging or enjoyable, add it. Keep adding across the whole page — background, hero, headings, cards, galleries, numbers, navigation, buttons, forms and scroll reveals — until every section has life. Do not stop at 3–5.
2. **Consistency comes from style, not from counting.** Keep one coherent palette, motion speed and component family across the site, even when you use many different effects. Different sections, headings and decks can use different effects; what must match is the look and feel.
3. **Suitability is the only filter.** Every effect should earn its place by being useful or delightful — guide the eye, mark the important content, reward scrolling, hovering or clicking, or make a control feel alive. If an effect is random, clashes with the palette, or duplicates exactly what another effect already does in the same spot, pick the stronger one for that spot — then use the other somewhere else it fits.
4. **Motion should be felt everywhere:** layer entrances, hover reactions, cursor responses, animated numbers and scroll reveals so the page never feels static. Keep individual motions smooth and readable (tilts ~5–6° unless a playful site wants more, entrances snappy) and stagger groups so rich animation still reads clearly. Backgrounds and ambient effects may loop; interactive effects should respond and settle.
5. **Palette discipline:** glows, glitch letters and highlights use the site's own colours — never the component's default colours if they clash.
6. **Build up in layers and check as you go** — add effects section by section, checking that everything still works after each layer, so you can safely finish with a richly animated page instead of guessing which change broke the layout. Adding many effects is the goal; verifying each layer is how you get there reliably.

## Step 6 — Implementation & safety rules (non-negotiable)

1. If the project supports the shadcn CLI, install with the exact command from the tables. If it doesn't (e.g. a generated web artifact), implement the component directly from its React Bits **JS/CSS variant** source — same component, same effect. Some components need an extra package (e.g. Blur Text's manual install shows `npm install motion`) — follow the component's own page.
2. **Function first:** after adding any effect, verify every tap, click, checkbox, menu and scroll still works. An effect that breaks interaction is removed, not shipped.
3. **Touch & reduced motion:** pointer/tilt/glow/cursor effects OFF on touch and coarse pointers; under `prefers-reduced-motion`, show the final static state (full text visible, no animation).
4. **Accessibility:** animated text keeps an accessible copy (aria-label or reserved-space invisible text) so screen readers read the real words and the layout never shifts while animating.
5. **Performance:** background canvases pause when the tab is hidden and cap their resolution; scroll effects fire once and then disconnect.
6. **Content stays king:** no effect may cover, hide or delay the site's actual information — descriptions, prices, dates and deadlines are always visible without hovering, flipping or waiting.

## Quick start for the AI using this skill

1. Identify the site's type, mood and content shape (Step 1).
2. Build a rich effects set from Step 3 — the row is a starting point, not a limit — and place it by Step 4. Keep searching the Step 2B index by category and add every other effect that is suitable and useful for this site.
3. Install/implement the components (Step 6.1), section by section, checking the page after each layer.
4. Final pass against Steps 5 and 6 — keep every suitable effect; fix or swap out anything that breaks function, readability or performance rather than stripping the animation back down.
