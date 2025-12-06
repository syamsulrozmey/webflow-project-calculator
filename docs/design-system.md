# Webflow Project Calculator — Design System

Updated to mirror the live landing page styling (FlowScope) built on Next.js 16 + Tailwind + shadcn/ui.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Border Radius](#border-radius)
6. [Shadows & Depth](#shadows--depth)
7. [Components](#components)
8. [Motion & Animation](#motion--animation)
9. [Icons](#icons)
10. [Patterns & Best Practices](#patterns--best-practices)

---

## Design Philosophy

Light-first, editorial SaaS aesthetic that blends a calm teal palette with crisp whites and generous breathing room.

- **Editorial headlines + neutral body**: Serif for hero/section titles, Inter for everything else.
- **Pill CTAs + soft cards**: Rounded-full buttons with teal fills; white cards with thin borders and soft shadows.
- **Layered light surfaces**: Off-white backgrounds, mint/sage section bands, subtle noise and dotted patterns.
- **Clarity first**: High-contrast text, restrained accent usage, predictable spacing.
- **Motion with purpose**: Fade-in-up entrances, gentle parallax/flow lines, micro-lifts on hover.

### Core Principles

1. **Explainer-first** — copy must be readable before any flourish.  
2. **Hierarchy via typography** — serif display for hero/section titles, sans for body and UI.  
3. **Tactile feedback** — hover lifts, flow animations, and dashed connectors guide attention.  
4. **Semantic tokens** — never hardcode colors; rely on tokens and Tailwind extensions.  
5. **Accessible contrast** — keep text on white/off-white at AA or better; avoid low-contrast grays.

---

## Color System

### CSS Variables (HSL) — defined in `globals.css`

```css
:root {
  /* Base surfaces */
  --background: 0 0% 97%;         /* #F8F8F8 */
  --background-alt: 0 0% 94%;     /* #F0F0F0 */
  --foreground: 0 0% 10%;         /* #1A1A1A */

  /* Muted */
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 40%;   /* #666666 */

  /* Surfaces */
  --card: 0 0% 100%;
  --card-foreground: 0 0% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 10%;

  /* Borders & inputs */
  --border: 0 0% 90%;             /* #E5E5E5 */
  --input: 0 0% 90%;

  /* Primary (teal) */
  --primary: 181 41% 39%;         /* #3A8B8C */
  --primary-hover: 181 43% 31%;   /* #2D7374 */
  --primary-foreground: 0 0% 100%;

  /* Accent */
  --accent: 181 41% 39%;
  --accent-foreground: 0 0% 100%;

  /* Section backgrounds */
  --section-feature: 168 33% 93%;     /* #E8F5F5 */
  --section-alt: 150 20% 93%;         /* #E5F0E8 */
  --section-announcement: 0 0% 18%;   /* #2D2D2D */

  /* Feedback */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 76% 36%;
  --warning: 38 92% 50%;

  --ring: 181 41% 39%;
  --radius: 0.75rem;
}

.dark {
  --background: 0 0% 10%;
  --foreground: 0 0% 97%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 60%;
  --card: 0 0% 12%;
  --card-foreground: 0 0% 97%;
  --popover: 0 0% 10%;
  --popover-foreground: 0 0% 97%;
  --border: 0 0% 20%;
  --input: 0 0% 20%;
  --primary: 181 41% 45%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 15%;
  --secondary-foreground: 0 0% 97%;
  --accent: 181 41% 45%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 62% 30%;
  --destructive-foreground: 0 0% 100%;
  --ring: 181 41% 45%;
}
```

### Tailwind palette extensions (`tailwind.config.ts`)

```ts
colors: {
  conv: {
    primary: "#3A8B8C",
    "primary-hover": "#2D7374",
    "primary-active": "#246263",
    "primary-light": "rgba(58, 139, 140, 0.1)",
    white: "#FFFFFF",
    background: "#F8F8F8",
    "background-alt": "#F0F0F0",
    surface: "#FFFFFF",
    "text-primary": "#1A1A1A",
    "text-secondary": "#666666",
    "text-muted": "#999999",
    border: "#E5E5E5",
    "border-light": "#EEEEEE",
    "section-mint": "#E8F5F5",
    "section-sage": "#E5F0E8",
    "section-announcement": "#2D2D2D",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    purple: "#8B5CF6",
    teal: "#14B8A6",
    orange: "#F97316",
    pink: "#EC4899",
  }
}
```

### Semantic usage (landing)

| Use case | Classes | Notes |
| --- | --- | --- |
| Base page | `bg-conv-background text-conv-text-primary` | Light neutral canvas |
| Section bands | `bg-conv-section-mint`, `bg-conv-section-sage` | Alternating rows |
| Announcement bar | `bg-conv-section-announcement text-white/90` | Full-width pill links |
| Cards | `bg-white border border-conv-border shadow-card` | Keep text `text-conv-text-primary` |
| Muted text | `text-conv-text-secondary`, `text-conv-text-muted` | Secondary/labels |
| Primary CTA | `bg-conv-primary text-white hover:bg-conv-primary-hover shadow-button` | Rounded-full |
| Outline CTA | `border-conv-border text-conv-text-primary hover:bg-white` | Rounded-full |
| Chips/pills | `rounded-full bg-conv-primary/10 text-conv-primary` | Use for badges/filters |
| Dividers | `border-conv-border` and `border-conv-border-light` | Keep subtle |

---

## Typography

### Font stack

- **Serif display**: `Playfair Display` for hero/section titles (`font-serif`).  
- **Sans body/UI**: `Inter` + Geist Sans (`font-sans`).  
- **Mono**: Geist Mono for code/tabular (`font-mono`).

### Type scale (landing)

| Element | Class | Notes |
| --- | --- | --- |
| Hero headline | `font-serif text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.1]` | Two-line, center |
| Section title | `font-serif text-4xl md:text-5xl font-normal tracking-tight leading-tight` | Left-aligned |
| Card title | `text-xl font-semibold text-conv-text-primary` | Inside cards |
| Body copy | `text-base md:text-lg text-conv-text-secondary leading-relaxed` | Max width ~64ch |
| Helper/kicker | `text-xs font-semibold uppercase tracking-wider text-conv-text-muted` | Labels above cards |
| Micro labels | `text-[9px] uppercase tracking-wider text-conv-text-muted` | Small pill labels |
| Stat/price | `font-serif text-5xl lg:text-6xl font-medium text-conv-text-primary` | Centered |

**Spacing with type**: Use `mb-8` under hero titles, `mb-6` for section copy, `gap-2` inside CTAs.

---

## Spacing & Layout

- **Base unit**: Tailwind 4px scale.  
- **Section padding**: `py-20 lg:py-28` hero, `py-24` for feature/workflow, `py-16` for testimonials/pricing.  
- **Container width**: `max-w-[90rem]` with `px-6 md:px-10 lg:px-16`.  
- **Bento hero grid**: `grid grid-cols-1 lg:grid-cols-12 gap-5` with 3/6/3 split.  
- **Card padding**: `p-4` small cards, `p-6`–`p-8` standard, `p-12` feature showcase.  
- **Gaps**: `gap-4` for controls, `gap-5` for card columns, `gap-8-12` for section headers.

Use alternating section backgrounds (`bg-conv-section-mint` / `bg-conv-section-sage`) to break long pages.

---

## Border Radius

- **Base**: `--radius: 12px` (0.75rem).  
- **Hero/outer cards**: `rounded-3xl` (24px).  
- **Standard cards**: `rounded-2xl` (20px) or `rounded-xl` (16px).  
- **CTAs & badges**: `rounded-full`.  
- **Icon holders**: `rounded-lg` or `rounded-xl`.  
- **Inputs**: `rounded-lg` (8–12px).

Stay consistent: hero CTAs and announcement pills are always `rounded-full`; card corners never square.

---

## Shadows & Depth

- **Buttons**: `shadow-button` (0 2px 8px rgba(58,139,140,0.25)), `hover:shadow-button-hover`.  
- **Cards**: `shadow-card` default, `hover:shadow-card-hover` for lift; keep borders visible (`border-conv-border`).  
- **Elevated overlays**: `shadow-card-elevated` for modals/popovers.  
- **Charts/spotlights**: Layer noise + gradient overlays instead of heavy shadows.

Depth hierarchy: base background → section band → card with border → elevated card with shadow → floating tooltip/popover.

---

## Components

### Buttons (landing defaults)

- **Primary CTA**: `rounded-full bg-conv-primary text-white px-8 h-14 text-base font-medium hover:bg-conv-primary-hover shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all`.  
- **Outline CTA**: `rounded-full border-conv-border px-8 h-14 text-base font-medium text-conv-text-primary hover:bg-white hover:border-conv-text-muted`.  
- **Ghost link**: `text-sm font-medium text-conv-text-secondary hover:text-conv-text-primary hover:bg-transparent`.

### Cards

- **Base**: `bg-white border border-conv-border rounded-2xl shadow-card`.  
- **Hover**: add `hover:shadow-card-hover hover:-translate-y-1`.  
- **Status bars**: use `border-b border-conv-border-light bg-white` for card headers.

### Pills & badges

- **Feature badge**: `inline-flex items-center gap-2 rounded-full bg-conv-primary/10 px-4 py-2 text-sm font-medium text-conv-primary`.  
- **Micro pill**: `text-[10px] bg-conv-background px-1.5 py-0.5 rounded text-conv-text-muted`.

### Inputs (combined style)

- `flex items-center rounded-full border border-[#E5E5E5] bg-white pr-1 pl-6 transition focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(58,139,140,0.15)]`.

### Feature/workflow tiles

- Icon holders: `h-12 w-12 rounded-xl bg-conv-section-mint text-conv-primary group-hover:bg-conv-primary group-hover:text-white`.  
- Step nodes: `border-2 border-conv-primary rounded-2xl bg-white shadow-lg` with flow lines using `animate-flow-horiz/vert`.

### Pricing cards

- Use white cards with `rounded-2xl border-conv-border shadow-card`, list items with check icons in `text-conv-primary`, CTA buttons rounded-full.

### Announcement bar

- Full-width strip: `bg-conv-section-announcement py-2.5 text-center text-white/90`, links use inline ArrowRight and keep `hover:text-white`.

---

## Motion & Animation

- **Entrances**: `animate-fade-in-up` on hero headline, copy, CTAs; stagger via inline `style={{ animationDelay: '0.2s' }}`.  
- **Hover lift**: `hover:-translate-y-0.5` on CTAs, `hover:-translate-y-1` on cards.  
- **Progress/analysis**: `animate-pulse` for status dots; `animate-dash` on SVG lines; bar fills transition with delay per index.  
- **Flow lines**: `animate-flow-horiz` and `animate-flow-vert` for connectors in workflow diagram.  
- **Noise/overlay**: Layer grain (`noise.svg`) with `opacity-20` plus white-to-background gradient for depth.

Keep durations around 200–400ms; avoid excessive springiness (`transition-all duration-200` standard).

---

## Icons

- Library: **Lucide React**.  
- Sizes: `h-4 w-4` for UI, `h-5 w-5` for CTAs, `h-7 w-7` for hero emblem.  
- Color: default to `text-conv-primary` on light backgrounds; use `text-conv-text-secondary` for muted states; keep icon containers lightly tinted (`bg-conv-section-mint`).

---

## Patterns & Best Practices

- **Hero (bento)**: 3/6/3 grid with white cards, primary pill badge, serif headline, dual CTAs, trust line.  
- **Navigation**: sticky, translucent (`bg-white/95 backdrop-blur-md`), thin bottom border; announcement bar above.  
- **Section headers**: Serif title + supporting paragraph; CTA aligned right on desktop.  
- **Workflow diagram**: Node + animated connectors, alternating horizontal/vertical flow for responsiveness.  
- **Pricing**: Two-column cards with checklisted bullets, micro badges for limits, rounded-full buttons.  
- **Footer**: Multi-column links with muted text and social icons; keep `text-conv-text-secondary`.

Do:
- Use `max-w-[90rem]` containers and generous `gap-5+`.  
- Keep borders visible on white cards; avoid shadow-only separation.  
- Use pills for badges and CTAs for brand cohesion.  
- Alternate mint/sage backgrounds to break sections.

Avoid:
- Harsh dark backgrounds behind teal text.  
- Squared corners on CTAs/cards.  
- Heavy drop shadows; rely on border + soft shadow combos.  
- Low-contrast gray text on white (stay at or above `text-conv-text-secondary`).

---

## Quick Reference Cheat Sheet

```
Backgrounds: bg-conv-background, bg-conv-section-mint, bg-conv-section-sage
Text: text-conv-text-primary (body), text-conv-text-secondary (muted), text-conv-text-muted (labels)
Borders: border-conv-border, border-conv-border-light
Cards: bg-white border-conv-border rounded-2xl shadow-card
Primary CTA: rounded-full bg-conv-primary text-white hover:bg-conv-primary-hover shadow-button
Outline CTA: rounded-full border-conv-border text-conv-text-primary hover:bg-white
Badges: bg-conv-primary/10 text-conv-primary rounded-full px-4 py-2
Containers: max-w-[90rem] px-6 md:px-10 lg:px-16
Animations: animate-fade-in-up, animate-dash, animate-flow-horiz/vert
```

---

## Appendix: Component Import Paths

```ts
// UI Components (shadcn)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Utilities
import { cn } from "@/lib/utils";

// Icons
import { ArrowRight, Calculator, Zap } from "lucide-react";
```

---

*Last updated: December 2025*  
*Theme: Light-first teal/white with serif headlines and pill CTAs*  
*Sources: Landing page (FlowScope), `globals.css`, `tailwind.config.ts`*
