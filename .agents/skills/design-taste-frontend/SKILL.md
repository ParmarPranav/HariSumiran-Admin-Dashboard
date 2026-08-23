---
name: design-taste-frontend
description: Use when building high-agency frontend interfaces with strict design taste, calibrated color, responsive layout, and motion rules. Use when the user asks to create, improve, or review frontend UI with strong design taste and anti-generic constraints. Use when React, Next.js, Tailwind, motion, component states, typography, spacing, color, or responsive behavior need senior-level design judgment. Use when the output must override common LLM UI biases such as centered heroes, purple gradients, card overuse, poor states, and fragile layouts.
category: frontend
risk: safe
source: community
source_repo: Leonxlnx/taste-skill
source_type: community
date_added: 2026-04-17
author: Leonxlnx
tags:
  - frontend
  - design
  - ui
  - react
tools:
  - claude
  - cursor
  - codex
  - antigravity
---

# High-Agency Frontend Skill

## Limitations

- This skill provides frontend design and implementation guidance; it does not replace project-specific product requirements, accessibility review, or user testing.
- Verify framework versions, installed dependencies, responsive behavior, and build output in the target repository before treating generated UI as production-ready.
- Do not force these design rules when the existing product, brand system, or platform conventions require a different visual direction.

## 1. ACTIVE BASELINE CONFIGURATION

- DESIGN_VARIANCE: 8 (1=Perfect Symmetry, 10=Artsy Chaos)
- MOTION_INTENSITY: 6 (1=Static/No movement, 10=Cinematic/Magic Physics)
- VISUAL_DENSITY: 4 (1=Art Gallery/Airy, 10=Pilot Cockpit/Packed Data)

**AI Instruction:** The standard baseline for all generations is strictly set to these values (8, 6, 4). Do not ask the user to edit this file. Otherwise, ALWAYS listen to the user: adapt these values dynamically based on what they explicitly request in their chat prompts. Use these baseline (or user-overridden) values as your global variables to drive the specific logic in Sections 3 through 7.

## 2. DEFAULT ARCHITECTURE & CONVENTIONS

Unless the user explicitly specifies a different stack, adhere to these structural constraints to maintain consistency:

- **DEPENDENCY VERIFICATION [MANDATORY]:** Before importing ANY 3rd party library (e.g. `framer-motion`, `lucide-react`, `zustand`), you MUST check `package.json`. If the package is missing, you MUST output the installation command (e.g. `npm install package-name`) before providing the code. **Never** assume a library exists.
- **Framework & Interactivity:** React or Next.js. Default to Server Components (`RSC`).
  - **RSC SAFETY:** Global state works ONLY in Client Components. In Next.js, wrap providers in a `"use client"` component.
  - **INTERACTIVITY ISOLATION:** If Sections 4 or 7 (Motion/Liquid Glass) are active, the specific interactive UI component MUST be extracted as an isolated leaf component with `'use client'` at the very top. Server Components must exclusively render static layouts.
- **State Management:** Use local `useState`/`useReducer` for isolated UI. Use global state strictly for deep prop-drilling avoidance.
- **Styling Policy:** Use Tailwind CSS (v3/v4) for 90% of styling.
  - **TAILWIND VERSION LOCK:** Check `package.json` first. Do not use v4 syntax in v3 projects.
  - **T4 CONFIG GUARD:** For v4, do NOT use `tailwindcss` plugin in `postcss.config.js`. Use `@tailwindcss/postcss` or the Vite plugin.
- **ANTI-EMOJI POLICY [CRITICAL]:** NEVER use emojis in code, markup, text content, or alt text. Replace symbols with high-quality icons (Radix, Phosphor) or clean SVG primitives. Emojis are BANNED.
- **Responsiveness & Spacing:**
  - Standardize breakpoints (`sm`, `md`, `lg`, `xl`).
  - Contain page layouts using `max-w-[1400px] mx-auto` or `max-w-7xl`.
  - **Viewport Stability [CRITICAL]:** NEVER use `h-screen` for full-height Hero sections. ALWAYS use `min-h-[100dvh]` to prevent catastrophic layout jumping on mobile browsers (iOS Safari).
  - **Grid over Flex-Math:** NEVER use complex flexbox percentage math (`w-[calc(33%-1rem)]`). ALWAYS use CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`) for reliable structures.
- **Icons:** You MUST use exactly `@phosphor-icons/react` or `@radix-ui/react-icons` as the import paths (check installed version). Standardize `strokeWidth` globally (e.g., exclusively use `1.5` or `2.0`).

## 3. DESIGN ENGINEERING DIRECTIVES (Bias Correction)

LLMs have statistical biases toward specific UI cliché patterns. Proactively construct premium interfaces using these engineered rules:

**Rule 1: Deterministic Typography**
- **Display/Headlines:** Default to `text-4xl md:text-6xl tracking-tighter leading-none`.
  - **ANTI-SLOP:** Discourage `Inter` for "Premium" or "Creative" vibes. Force unique character using `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`.
  - **TECHNICAL UI RULE:** Serif fonts are strictly BANNED for Dashboard/Software UIs. For these contexts, use exclusively high-end Sans-Serif pairings (`Geist` + `Geist Mono` or `Satoshi` + `JetBrains Mono`).
- **Body/Paragraphs:** Default to `text-base text-gray-600 leading-relaxed max-w-[65ch]`.

**Rule 2: Color Calibration**
- **Constraint:** Max 1 Accent Color. Saturation < 80%.
- **THE LILA BAN:** The "AI Purple/Blue" aesthetic is strictly BANNED. No purple button glows, no neon gradients. Use absolute neutral bases (Zinc/Slate) with high-contrast, singular accents (e.g. Emerald, Electric Blue, or Deep Rose).
- **COLOR CONSISTENCY:** Stick to one palette for the entire output. Do not fluctuate between warm and cool grays within the same project.

**Rule 3: Layout Diversification**
- **ANTI-CENTER BIAS:** Centered Hero/H1 sections are strictly BANNED when `LAYOUT_VARIANCE > 4`. Force "Split Screen" (50/50), "Left Aligned content/Right Aligned asset", or "Asymmetric White-space" structures.

**Rule 4: Materiality, Shadows, and "Anti-Card Overuse"**
- **DASHBOARD HARDENING:** For `VISUAL_DENSITY > 7`, generic card containers are strictly BANNED. Use logic-grouping via `border-t`, `divide-y`, or purely negative space.
- **Execution:** Use cards ONLY when elevation communicates hierarchy. When a shadow is used, tint it to the background hue.

**Rule 5: Interactive UI States**
- **Mandatory Generation:** You MUST implement full interaction cycles:
  - **Loading:** Skeletal loaders matching layout sizes (avoid generic circular spinners).
  - **Empty States:** Beautifully composed empty states indicating how to populate data.
  - **Error States:** Clear, inline error reporting (e.g., forms).
  - **Tactile Feedback:** On `:active`, use `-translate-y-[1px]` or `scale-[0.98]` to simulate a physical push.

**Rule 6: Data & Form Patterns**
- **Forms:** Label MUST sit above input. Helper text is optional but should exist in markup. Error text below input. Use a standard `gap-2` for input blocks.

## 4. CREATIVE PROACTIVITY (Anti-Slop Implementation)

- **"Liquid Glass" Refraction:** When glassmorphism is needed, go beyond `backdrop-blur`. Add a 1px inner border (`border-white/10`) and a subtle inner shadow (`shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`) to simulate physical edge refraction.
- **Magnetic Micro-physics (If MOTION_INTENSITY > 5):** Implement buttons that pull slightly toward the mouse cursor. **CRITICAL:** NEVER use React `useState` for magnetic hover. Use EXCLUSIVELY Framer Motion's `useMotionValue` and `useTransform` outside the React render cycle.
- **Perpetual Micro-Interactions:** When `MOTION_INTENSITY > 5`, embed continuous, infinite micro-animations (Pulse, Typewriter, Float, Shimmer, Carousel). Apply premium Spring Physics (`type: "spring", stiffness: 100, damping: 20`) to all interactive elements.
- **Layout Transitions:** Always utilize Framer Motion's `layout` and `layoutId` props for smooth re-ordering and shared element transitions.
- **Staggered Orchestration:** Use `staggerChildren` (Framer) or CSS cascade (`animation-delay: calc(var(--index) * 100ms)`) to create sequential waterfall reveals.

## 5. PERFORMANCE GUARDRAILS

- **DOM Cost:** Apply grain/noise filters exclusively to fixed, `pointer-events-none` pseudo-elements. NEVER to scrolling containers.
- **Hardware Acceleration:** Never animate `top`, `left`, `width`, or `height`. Animate exclusively via `transform` and `opacity`.
- **Z-Index Restraint:** NEVER spam arbitrary `z-50` or `z-10` unprompted. Use z-indexes strictly for systemic layer contexts (Sticky Navbars, Modals, Overlays).

## 6. TECHNICAL REFERENCE (Dial Definitions)

### DESIGN_VARIANCE (Level 1-10)
- **1-3 (Predictable):** Flexbox `justify-center`, strict 12-column symmetrical grids, equal paddings.
- **4-7 (Offset):** Use `margin-top: -2rem` overlapping, varied image aspect ratios, left-aligned headers.
- **8-10 (Asymmetric):** Masonry layouts, CSS Grid with fractional units, massive empty zones.
- **MOBILE OVERRIDE:** For levels 4-10, any asymmetric layout above `md:` MUST fall back to a strict single-column layout (`w-full`, `px-4`, `py-8`) on viewports `< 768px`.

### MOTION_INTENSITY (Level 1-10)
- **1-3 (Static):** No automatic animations. CSS `:hover` and `:active` states only.
- **4-7 (Fluid CSS):** Use `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`. Focus strictly on `transform` and `opacity`.
- **8-10 (Advanced Choreography):** Complex scroll-triggered reveals. Use Framer Motion hooks. NEVER use `window.addEventListener('scroll')`.

### VISUAL_DENSITY (Level 1-10)
- **1-3 (Art Gallery Mode):** Lots of white space. Huge section gaps. Everything feels expensive and clean.
- **4-7 (Daily App Mode):** Normal spacing for standard web apps.
- **8-10 (Cockpit Mode):** Tiny paddings. No card boxes; just 1px lines. **Mandatory:** Use `font-mono` for all numbers.

## 7. AI TELLS (Forbidden Patterns)

### Visual & CSS
- **NO Neon/Outer Glows:** Use inner borders or subtle tinted shadows instead.
- **NO Pure Black:** Never use `#000000`. Use Off-Black, Zinc-950, or Charcoal.
- **NO Oversaturated Accents:** Desaturate accents to blend elegantly with neutrals.
- **NO Excessive Gradient Text:** Do not use text-fill gradients for large headers.
- **NO Custom Mouse Cursors:** They are outdated and hurt performance/accessibility.

### Typography
- **NO Inter Font:** Banned. Use `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`.
- **NO Oversized H1s:** Control hierarchy with weight and color, not just massive scale.
- **Serif Constraints:** Use Serif fonts ONLY for creative/editorial designs. NEVER on dashboards.

### Layout & Spacing
- **NO 3-Column Card Layouts:** The generic "3 equal cards horizontally" feature row is BANNED. Use a 2-column Zig-Zag, asymmetric grid, or horizontal scrolling approach instead.

### Content & Data
- **NO Generic Names:** "John Doe", "Sarah Chan" are banned. Use realistic, creative names.
- **NO Generic Avatars:** DO NOT use standard SVG "egg" or Lucide user icons for avatars.
- **NO Fake Numbers:** Avoid `99.99%`, `50%`. Use organic data (`47.2%`, `+1 (312) 847-1928`).
- **NO Startup Slop Names:** "Acme", "Nexus", "SmartFlow". Invent premium, contextual brand names.
- **NO Filler Words:** Avoid "Elevate", "Seamless", "Unleash", "Next-Gen". Use concrete verbs.

### External Resources
- **NO Broken Unsplash Links:** Use `https://picsum.photos/seed/{random_string}/800/600` instead.
- **shadcn/ui Customization:** You may use `shadcn/ui`, but NEVER in its generic default state. Customize radii, colors, and shadows.

## 8. THE CREATIVE ARSENAL (High-End Patterns)

Use these advanced concepts when appropriate instead of defaulting to generic UI:

**Navigation & Menus:** Mac OS Dock Magnification, Magnetic Button, Gooey Menu, Dynamic Island pill, Contextual Radial Menu, Floating Speed Dial, Mega Menu Reveal.

**Layout & Grids:** Bento Grid (asymmetric Apple-style), Masonry Layout, Chroma Grid, Split Screen Scroll, Curtain Reveal.

**Cards & Containers:** Parallax Tilt Card, Spotlight Border Card, Glassmorphism Panel, Holographic Foil Card, Morphing Modal.

**Scroll-Animations:** Sticky Scroll Stack, Horizontal Scroll Hijack, Zoom Parallax, Scroll Progress Path SVG, Liquid Swipe Transition.

**Typography & Text:** Kinetic Marquee, Text Mask Reveal, Text Scramble Effect, Circular Text Path, Gradient Stroke Animation.

**Micro-Interactions:** Particle Explosion Button, Skeleton Shimmer, Directional Hover Aware Button, Ripple Click Effect, Mesh Gradient Background.

> **CRITICAL:** Never mix GSAP/ThreeJS with Framer Motion in the same component tree. Default to Framer Motion for UI. Use GSAP/ThreeJS EXCLUSIVELY for isolated full-page scrolltelling or canvas backgrounds, wrapped in strict `useEffect` cleanup blocks.

## 9. THE "MOTION-ENGINE" BENTO PARADIGM

When generating modern SaaS dashboards or feature sections, use this "Bento 2.0" architecture:

**Core Design Philosophy:**
- Background: `#f9fafb`. Cards: pure white (`#ffffff`) with `border-slate-200/50`.
- Surfaces: `rounded-[2.5rem]` for major containers. Diffusion shadow: `shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]`.
- Typography: `Geist`, `Satoshi`, or `Cabinet Grotesk`. `tracking-tight` for headers.
- Labels placed **outside and below** cards. Generous `p-8` or `p-10` padding inside cards.

**Animation Engine (Perpetual Motion):**
- Spring Physics: `type: "spring", stiffness: 100, damping: 20`.
- Every card must have an "Active State" that loops infinitely (Pulse, Typewriter, Float, or Carousel).
- Wrap dynamic lists in `<AnimatePresence>`. Isolate perpetual animations in their own `React.memo` Client Components.

**5-Card Archetypes:**
1. **Intelligent List:** Vertical stack with infinite auto-sorting loop using `layoutId`.
2. **Command Input:** AI bar with multi-step Typewriter Effect and "processing" shimmer state.
3. **Live Status:** Scheduling UI with "breathing" indicators and spring-physics notification badge.
4. **Wide Data Stream:** Horizontal infinite carousel of metrics. Seamless loop (`x: ["0%", "-100%"]`).
5. **Contextual UI (Focus Mode):** Document view with staggered highlight + float-in toolbar.

## 10. FINAL PRE-FLIGHT CHECK

Before outputting code, evaluate against this matrix:

- [ ] Is global state used appropriately (not arbitrarily)?
- [ ] Is mobile layout collapse (`w-full`, `px-4`, `max-w-7xl mx-auto`) guaranteed for high-variance designs?
- [ ] Do full-height sections safely use `min-h-[100dvh]` instead of `h-screen`?
- [ ] Do `useEffect` animations contain strict cleanup functions?
- [ ] Are empty, loading, and error states provided?
- [ ] Are cards omitted in favor of spacing where possible?
- [ ] Are CPU-heavy perpetual animations isolated in their own Client Components?
