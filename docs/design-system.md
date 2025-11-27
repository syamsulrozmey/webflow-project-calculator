# Webflow Project Calculator — Design System

A comprehensive style guide to ensure visual consistency across the application.

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

The Webflow Project Calculator follows a **dark-first, professional SaaS aesthetic** with:

- **Deep navy backgrounds** that feel premium and reduce eye strain
- **Vibrant violet/purple accents** that command attention without overwhelming
- **Glass-morphism touches** using subtle transparency and blur effects
- **Generous whitespace** for readability and sophisticated feel
- **Soft, layered surfaces** that create visual hierarchy through subtle opacity differences

### Core Principles

1. **Clarity over decoration** — Every element serves a purpose
2. **Hierarchy through contrast** — Use color intensity and size to guide the eye
3. **Consistent rhythm** — Predictable spacing creates trust
4. **Progressive disclosure** — Show complexity only when needed

---

## Color System

### CSS Variables (HSL Format)

All colors use HSL format with CSS custom properties for easy theming.

```css
:root {
  /* Base surfaces */
  --background: 222.2 84% 4.9%;      /* Deep navy: hsl(222.2, 84%, 4.9%) */
  --foreground: 210 40% 98%;         /* Near white: hsl(210, 40%, 98%) */
  
  /* Muted/Secondary */
  --muted: 217.2 32.6% 17.5%;        /* Muted surface */
  --muted-foreground: 215 22.1% 65.1%; /* Secondary text */
  
  /* Primary (Violet) */
  --primary: 253 95% 68%;            /* Vibrant violet */
  --primary-foreground: 222.2 47.4% 11.2%; /* Dark text on primary */
  
  /* Accent (Electric Blue) */
  --accent: 213 94% 68%;             /* Electric blue */
  --accent-foreground: 222.2 47.4% 11.2%;
  
  /* Secondary surfaces */
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  
  /* Feedback states */
  --destructive: 0 62.8% 30.6%;      /* Error red */
  --destructive-foreground: 210 40% 98%;
  
  /* UI elements */
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 249 95% 63%;               /* Focus ring */
  
  /* Cards & Popovers */
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  
  /* Border radius base */
  --radius: 0.75rem;
}
```

### Brand Colors (Tailwind)

```typescript
// tailwind.config.ts
colors: {
  brand: {
    DEFAULT: '#6E49FF',  // Primary violet
    dark: '#4D2ED6',     // Darker shade for hover/active
    light: '#A794FF'     // Lighter shade for accents
  },
  electric: {
    50: '#f0f6ff',
    100: '#dbe8ff',
    200: '#b3ceff',
    300: '#7eacff',
    400: '#4c8bff',
    500: '#2a6fe6',
    600: '#1a55b4',
    700: '#123c82',
    800: '#0b2759',
    900: '#051530'
  },
  surface: '#0F1117'  // Alternative dark surface
}
```

### Color Usage Guidelines

| Use Case | Color | Tailwind Class |
|----------|-------|----------------|
| Page background | Deep navy | `bg-background` |
| Primary text | Near white | `text-foreground` |
| Secondary text | Gray | `text-muted-foreground` |
| Primary actions | Violet | `bg-primary text-primary-foreground` |
| Accent highlights | Electric blue | `text-accent` |
| Kickers/Labels | 70% opacity primary | `text-primary/70` |
| Card borders | 10% white | `border-white/10` |
| Subtle borders | 5% white | `border-white/5` |
| Card surfaces | 2-4% white | `bg-white/[0.02]` to `bg-white/[0.04]` |
| Error states | Red | `text-destructive` |
| Success states | Emerald | `text-emerald-400` |
| Warning states | Amber | `text-amber-300` |

### Gradients

```css
/* Hero section gradient */
.hero-gradient {
  background: linear-gradient(
    to bottom,
    hsl(var(--background)),
    hsl(var(--background)),
    #0b1021
  );
}

/* Card accent gradient (rare) */
.accent-gradient {
  background: linear-gradient(
    to right,
    #0b0f1f,
    #090b16
  );
}
```

---

## Typography

### Font Stack

```typescript
// layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'SFMono-Regular', 'monospace']
}
```

### Type Scale

| Element | Size | Weight | Class |
|---------|------|--------|-------|
| Hero headline | 4xl-5xl | Semibold (600) | `text-4xl md:text-5xl font-semibold` |
| Section title | 2xl | Semibold (600) | `text-2xl font-semibold` |
| Card title | lg-xl | Semibold (600) | `text-lg font-semibold` |
| Body text | base (16px) | Normal (400) | `text-base` |
| Secondary text | sm (14px) | Normal (400) | `text-sm text-muted-foreground` |
| Labels/Kickers | xs (12px) | Normal (400) | `text-xs text-primary/70` |
| Micro labels | 10-11px | Normal (400) | `text-[10px]` or `text-[11px]` |
| Monospace | sm | Normal (400) | `font-mono text-sm` |

### Text Styles

```tsx
// Kicker (small label above headlines)
<p className="text-xs text-primary/70">
  Kicker text
</p>

// Primary headline
<h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
  Main Headline
</h1>

// Section title
<h2 className="text-2xl font-semibold leading-none tracking-tight">
  Section Title
</h2>

// Card title
<h3 className="text-lg font-semibold text-white">
  Card Title
</h3>

// Body paragraph
<p className="text-base text-muted-foreground">
  Body text goes here...
</p>

// Helper/Caption text
<p className="text-xs text-muted-foreground">
  Helper or caption text
</p>

// Uppercase label
<span className="text-[11px] uppercase tracking-wide text-muted-foreground">
  CATEGORY
</span>
```

---

## Spacing & Layout

### Spacing Scale

Use Tailwind's default spacing scale (4px base unit):

| Token | Value | Use Case |
|-------|-------|----------|
| `1` | 4px | Tight gaps (icons in buttons) |
| `1.5` | 6px | Dense list items |
| `2` | 8px | Small gaps, pill padding |
| `3` | 12px | Standard gap between related items |
| `4` | 16px | Card padding (tight), section gaps |
| `5` | 20px | Card padding (standard) |
| `6` | 24px | Card content padding, section spacing |
| `8` | 32px | Large section gaps |
| `10` | 40px | Major section spacing |
| `16` | 64px | Page section margins |
| `20` | 80px | Hero padding |

### Container Widths

```tsx
// Max-width container
<div className="mx-auto max-w-6xl px-6 md:px-10 lg:px-16">
  {/* Content */}
</div>

// Full-width with padding
<div className="w-full px-4 md:px-6">
  {/* Content */}
</div>
```

### Grid Patterns

```tsx
// Two-column with sidebar (common layout)
<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
  <main>{/* Main content */}</main>
  <aside>{/* Sidebar */}</aside>
</div>

// Responsive card grid
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>

// Dashboard stat grid
<div className="grid gap-4 lg:grid-cols-3">
  {/* Stat cards */}
</div>

// Stepper grid
<div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
  {/* Steps */}
</div>
```

---

## Border Radius

### Scale

```typescript
// tailwind.config.ts
borderRadius: {
  xl: 'calc(var(--radius) + 4px)',  // 16px - Large containers, hero cards
  lg: 'var(--radius)',               // 12px - Standard cards
  md: 'calc(var(--radius) - 2px)',   // 10px - Inner sections
  sm: 'calc(var(--radius) - 4px)',   // 8px - Small elements
  // Plus Tailwind defaults: full, 2xl, 3xl
}
```

### Usage Guidelines

| Element | Radius | Class |
|---------|--------|-------|
| Hero containers | 24px | `rounded-3xl` |
| Cards | 16px | `rounded-xl` or `rounded-2xl` |
| Buttons | varies | `rounded-md` (standard), `rounded-full` (pills) |
| Input fields | 12px | `rounded-lg` or `rounded-xl` |
| Badges/Pills | full | `rounded-full` |
| Internal panels | 12-16px | `rounded-xl` to `rounded-2xl` |
| Progress bars | full | `rounded-full` |
| Tooltips | 12px | `rounded-xl` |

---

## Shadows & Depth

### Custom Shadows

```typescript
// tailwind.config.ts
boxShadow: {
  'soft-card': '0 15px 35px rgba(24, 34, 63, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
}
```

### Shadow Usage

```tsx
// Primary card shadow
<Card className="shadow-soft-card">
  {/* Content */}
</Card>

// Floating elements (dialogs, popovers)
<div className="shadow-2xl shadow-black/40">
  {/* Content */}
</div>

// Elevated buttons/controls
<div className="shadow-lg shadow-black/40">
  {/* Content */}
</div>
```

### Depth Hierarchy

| Level | Use Case | Classes |
|-------|----------|---------|
| 0 | Base page | `bg-background` |
| 1 | Card surface | `bg-white/[0.02] border border-white/10` |
| 2 | Nested section | `bg-white/[0.03] border border-white/5` |
| 3 | Highlighted area | `bg-primary/5 border border-primary/20` |
| 4 | Floating UI | `bg-[#070810] shadow-2xl` |

---

## Components

### Button Variants

```tsx
// Primary (default) - Main CTAs
<Button>Primary Action</Button>
// Classes: bg-primary text-primary-foreground hover:bg-primary/90

// Secondary - Secondary actions
<Button variant="secondary">Secondary</Button>
// Classes: bg-secondary text-secondary-foreground hover:bg-secondary/80

// Outline - Bordered buttons
<Button variant="outline" className="border-white/20">
  Outline
</Button>
// Classes: border border-input bg-background hover:bg-accent

// Ghost - Minimal presence
<Button variant="ghost">Ghost</Button>
// Classes: hover:bg-accent hover:text-accent-foreground

// Destructive - Dangerous actions
<Button variant="destructive">Delete</Button>
// Classes: bg-destructive text-destructive-foreground

// Subtle - Low emphasis
<Button variant="subtle">Subtle</Button>
// Classes: bg-muted text-muted-foreground hover:text-foreground

// Link - Text link style
<Button variant="link">Link</Button>
// Classes: text-primary underline-offset-4 hover:underline
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>   // h-9 px-3
<Button size="default">Default</Button> // h-10 px-4
<Button size="lg">Large</Button>   // h-11 px-8
<Button size="icon">            // h-10 w-10
  <Icon className="h-4 w-4" />
</Button>
```

### Card Component

```tsx
<Card className="border-white/10 bg-white/[0.02]">
  <CardHeader className="border-b border-white/5 pb-6">
    <p className="text-xs text-primary/70">Kicker</p>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent className="pt-6 space-y-4">
    {/* Content */}
  </CardContent>
  <CardFooter className="border-t border-white/5 pt-6">
    {/* Actions */}
  </CardFooter>
</Card>
```

### Input Fields

```tsx
// Standard input
<input
  type="text"
  className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none ring-primary/40 transition focus:ring"
  placeholder="Placeholder text"
/>

// Textarea
<textarea
  className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none ring-primary/40 focus:ring"
  rows={4}
/>
```

### Selection Controls

```tsx
// Single select option
<button
  className={cn(
    "rounded-xl border px-4 py-3 text-left transition",
    isSelected
      ? "border-primary bg-primary/10"
      : "border-white/10 hover:border-white/30"
  )}
>
  <p className="text-sm font-medium text-white">{label}</p>
  <p className="text-xs text-muted-foreground">{description}</p>
</button>

// Multi-select chip
<button
  className={cn(
    "rounded-full border px-4 py-1.5 text-sm transition",
    isSelected
      ? "border-primary bg-primary/10 text-white"
      : "border-white/15 text-white/70 hover:border-white/40"
  )}
>
  {label}
</button>

// Toggle switch
<button
  className={cn(
    "relative inline-flex h-6 w-11 items-center rounded-full border border-white/15 transition",
    isOn ? "bg-primary/80" : "bg-white/10"
  )}
  role="switch"
  aria-checked={isOn}
>
  <span
    className={cn(
      "inline-block h-4 w-4 rounded-full bg-white transition",
      isOn ? "translate-x-5" : "translate-x-1"
    )}
  />
</button>
```

### Segmented Control

```tsx
<div className="rounded-full border border-white/15 bg-white/[0.03] p-1 text-xs">
  <div className="flex gap-1">
    {options.map((option) => (
      <button
        key={option.value}
        className={cn(
          "rounded-full px-3 py-1 transition",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-white"
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
</div>
```

### Progress Bar

```tsx
<div className="h-2 flex-1 rounded-full bg-white/10">
  <div
    className="h-2 rounded-full bg-primary transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Badge/Pill

```tsx
// Standard badge
<span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-muted-foreground">
  Badge
</span>

// Primary badge
<span className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
  Recommended
</span>

// Status badge
<span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
  Active
</span>
```

### Tooltip

```tsx
<div className="group relative">
  <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
  <div className="pointer-events-none absolute left-1/2 top-full mt-2 hidden w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-background p-3 text-xs text-muted-foreground shadow-2xl group-hover:block">
    {tooltipText}
  </div>
</div>
```

### Insight/Info Card

```tsx
<Card className="border-white/10 bg-white/[0.03]">
  <CardHeader className="pb-2">
    <p className="text-xs text-primary/70">{kicker}</p>
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <CardTitle className="text-base">{title}</CardTitle>
    </div>
  </CardHeader>
  <CardContent className="pt-0 text-sm text-muted-foreground">
    {children}
  </CardContent>
</Card>
```

### Stepper

```tsx
<button
  className={cn(
    "rounded-xl border px-4 py-3 text-left transition",
    isActive
      ? "border-primary/60 bg-white/[0.05]"
      : "border-white/10 bg-transparent hover:border-primary/30"
  )}
>
  <div className="flex items-center justify-between text-xs text-muted-foreground">
    <span>{stepNumber}</span>
    {isComplete && <Check className="h-4 w-4 text-primary" />}
  </div>
  <p className="mt-2 text-sm font-semibold text-white">{title}</p>
  <p className="text-xs text-muted-foreground">{progress}%</p>
</button>
```

---

## Motion & Animation

### Keyframes

```css
/* Accordion animation */
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

/* Glow pulse for highlights */
@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 rgba(129, 140, 248, 0); }
  50% { box-shadow: 0 0 25px rgba(129, 140, 248, 0.35); }
  100% { box-shadow: 0 0 0 rgba(129, 140, 248, 0); }
}
```

### Animation Classes

```typescript
// tailwind.config.ts
animation: {
  'accordion-down': 'accordion-down 0.2s ease-out',
  'accordion-up': 'accordion-up 0.2s ease-out'
}
```

```css
/* Custom animation utility */
.animate-pulse-glow {
  animation: pulse-glow 2.4s ease-in-out infinite;
}
```

### Transition Defaults

```tsx
// Standard transition
<div className="transition" />        // colors, opacity, etc.
<div className="transition-all" />     // all properties
<div className="transition-colors" />  // color changes only
<div className="transition-shadow" />  // shadow changes

// Duration modifiers (when needed)
<div className="duration-300" />  // 300ms (default is 150ms)
```

### Usage Patterns

```tsx
// Hover state transitions
<button className="border-white/10 transition hover:border-white/30">
  
// Focus ring transition
<input className="ring-primary/40 transition focus:ring">

// Visibility transitions
<div className={cn(
  "transition-all duration-300",
  visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
)}>

// Loading state
<Loader2 className="h-4 w-4 animate-spin" />
```

---

## Icons

### Library: Lucide React

All icons use [Lucide React](https://lucide.dev/icons/) for consistency.

```tsx
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ChevronDown,
  Loader2,
  Sparkles,
  // ... etc
} from "lucide-react";
```

### Icon Sizes

| Size | Class | Use Case |
|------|-------|----------|
| 3-3.5 | `h-3 w-3` or `h-3.5 w-3.5` | Inline with small text |
| 4 | `h-4 w-4` | Standard UI icons, buttons |
| 5 | `h-5 w-5` | Section headers |
| 6 | `h-6 w-6` | Large standalone icons |

### Icon Styling

```tsx
// Primary accent icon
<Sparkles className="h-4 w-4 text-primary" />

// Muted icon
<ChevronDown className="h-4 w-4 text-muted-foreground" />

// Interactive icon
<button>
  <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary" />
</button>

// Icon with text
<div className="flex items-center gap-2">
  <Icon className="h-4 w-4 text-primary" />
  <span>Label text</span>
</div>
```

### Common Icons by Use Case

| Use Case | Icon |
|----------|------|
| Loading | `Loader2` (with `animate-spin`) |
| Success/Complete | `Check`, `CheckCircle2` |
| Navigation back | `ArrowLeft` |
| Navigation forward | `ArrowRight` |
| Expand/Collapse | `ChevronDown`, `ChevronUp` |
| Help/Info | `HelpCircle`, `CircleHelp` |
| Warning | `AlertCircle`, `TriangleAlert` |
| Close | `X` |
| Save | `CloudUpload` |
| Download | `FileDown`, `CloudDownload` |
| Share | `Share2` |
| Settings | `Settings` |
| User | `Users`, `User` |
| Time/Clock | `Clock3`, `Clock4` |
| AI/Magic | `Sparkles` |
| Chart/Data | `BarChart3`, `PieChart` |
| Money | `DollarSign` |

---

## Patterns & Best Practices

### Card Hierarchy Pattern

```tsx
// Level 1: Main container card
<Card className="border-white/10 bg-white/[0.04]">
  <CardContent>
    
    {/* Level 2: Grouped section */}
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4">
      
      {/* Level 3: Individual item */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
        {/* Content */}
      </div>
      
    </div>
    
  </CardContent>
</Card>
```

### Section Pattern

```tsx
<section className="space-y-4">
  {/* Section header */}
  <div className="flex items-start gap-3">
    <Icon className="mt-1 h-4 w-4 text-primary" />
    <div>
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
  
  {/* Section content */}
  <div className="space-y-4">
    {children}
  </div>
</section>
```

### Responsive Patterns

```tsx
// Stack to row
<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

// Mobile-first grid
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Hidden on mobile
<div className="hidden md:flex">

// Full-width on mobile, auto on desktop
<Button className="w-full sm:w-auto">
```

### Form Layout Pattern

```tsx
<div className="space-y-6">
  {/* Question card */}
  <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-5">
    {/* Header */}
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-base font-semibold text-white">{question}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground/80">{helper}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* Actions */}
      </div>
    </div>
    
    {/* Input area */}
    <div className="mt-4">
      {/* Form controls */}
    </div>
  </div>
</div>
```

### Empty State Pattern

```tsx
<div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
  No items to display. Try adjusting your filters.
</div>
```

### Error/Warning Pattern

```tsx
// Error message
<p className="text-xs text-destructive">{errorMessage}</p>

// Warning banner
<div className="flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
  <TriangleAlert className="h-4 w-4" />
  {warningMessage}
</div>

// Success message
<p className="text-xs text-emerald-400">{successMessage}</p>
```

### Highlighted Card Pattern (AI/Special)

```tsx
<div className={cn(
  "rounded-2xl border bg-white/[0.01] p-5 transition-shadow duration-300",
  isHighlighted
    ? "border-primary/60 bg-primary/5 shadow-[0_0_25px_rgba(129,140,248,0.25)] animate-pulse-glow"
    : "border-white/10"
)}>
  {/* Content */}
</div>
```

### Floating/Sticky UI Pattern

```tsx
<div className={cn(
  "fixed inset-x-0 bottom-4 z-40 flex justify-center transition-all duration-300",
  visible 
    ? "translate-y-0 opacity-100 pointer-events-auto" 
    : "translate-y-4 opacity-0 pointer-events-none"
)}>
  <div className="flex items-center gap-3 rounded-full border border-white/20 bg-black/70 px-4 py-2 shadow-lg backdrop-blur">
    {/* Content */}
  </div>
</div>
```

---

## Quick Reference Cheat Sheet

### Essential Classes

```
Background:        bg-background, bg-white/[0.02], bg-white/[0.03]
Text Primary:      text-foreground, text-white
Text Secondary:    text-muted-foreground
Text Accent:       text-primary, text-primary/70
Borders:           border-white/10, border-white/5, border-primary/30
Cards:             rounded-2xl border border-white/10 bg-white/[0.02] p-5
Buttons:           rounded-md (standard), rounded-full (pill)
Inputs:            rounded-lg border border-white/10 bg-transparent
Badges:            rounded-full border border-white/15 px-2 py-0.5 text-[10px]
Spacing:           gap-2 (tight), gap-4 (standard), gap-6 (loose)
```

### Do's ✅

- Use consistent border opacity (`white/10`, `white/5`)
- Layer backgrounds with increasing opacity for depth
- Use `text-primary/70` for kickers and labels
- Add transitions to interactive elements
- Use `rounded-2xl` or `rounded-3xl` for cards
- Keep shadows subtle in dark mode

### Don'ts ❌

- Don't use solid white backgrounds
- Don't mix border-radius styles inconsistently  
- Don't use shadows heavier than `shadow-soft-card` for cards
- Don't skip the focus ring on interactive elements
- Don't use colors outside the defined palette

---

## Appendix: Component Import Paths

```typescript
// UI Components (shadcn)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Utilities
import { cn } from "@/lib/utils";

// Icons
import { Sparkles, Check, ArrowRight } from "lucide-react";
```

---

*Last updated: November 2024*
*Based on: Next.js 16 + shadcn/ui (New York style) + Tailwind CSS*

