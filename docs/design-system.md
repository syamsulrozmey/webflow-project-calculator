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

The Webflow Project Calculator follows a **theme-adaptive, professional SaaS aesthetic** with:

- **Semantic color tokens** that adapt to light and dark themes automatically
- **Clean, readable surfaces** that work in any lighting condition
- **Vibrant accent colors** that command attention without overwhelming
- **Generous whitespace** for readability and sophisticated feel
- **Layered depth** through subtle backgrounds and borders

### Core Principles

1. **Clarity over decoration** — Every element serves a purpose
2. **Hierarchy through contrast** — Use color intensity and size to guide the eye
3. **Consistent rhythm** — Predictable spacing creates trust
4. **Progressive disclosure** — Show complexity only when needed
5. **Theme adaptability** — Use semantic tokens, not hardcoded colors

---

## Color System

### CSS Variables (HSL Format)

All colors use HSL format with CSS custom properties for automatic theming.

```css
:root {
  /* Base surfaces */
  --background: 0 0% 100%;            /* White background */
  --foreground: 222.2 84% 4.9%;       /* Near black text */
  
  /* Muted/Secondary */
  --muted: 210 40% 96.1%;             /* Light gray surface */
  --muted-foreground: 215.4 16.3% 46.9%; /* Secondary text */
  
  /* Primary (Violet) */
  --primary: 253 95% 68%;             /* Vibrant violet */
  --primary-foreground: 210 40% 98%;  /* White text on primary */
  
  /* Accent */
  --accent: 210 40% 96.1%;            /* Subtle accent surface */
  --accent-foreground: 222.2 47.4% 11.2%;
  
  /* Secondary surfaces */
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  /* Feedback states */
  --destructive: 0 84.2% 60.2%;       /* Error red */
  --destructive-foreground: 210 40% 98%;
  
  /* UI elements */
  --border: 214.3 31.8% 91.4%;        /* Light border */
  --input: 214.3 31.8% 91.4%;
  --ring: 249 95% 63%;                /* Focus ring */
  
  /* Cards & Popovers */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  
  /* Border radius base */
  --radius: 0.75rem;
}

/* Dark mode variant (optional) */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 22.1% 65.1%;
  --border: 217.2 32.6% 17.5%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
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
  }
}
```

### Semantic Color Usage Guidelines

**IMPORTANT:** Always use semantic color tokens instead of hardcoded colors like `text-white` or `text-black`.

| Use Case | Semantic Class | ❌ Avoid |
|----------|---------------|----------|
| Primary text | `text-foreground` | `text-white`, `text-black` |
| Secondary text | `text-muted-foreground` | `text-gray-500` |
| Page background | `bg-background` | `bg-white`, `bg-black` |
| Card background | `bg-card` | `bg-white/[0.02]` |
| Card borders | `border-border` or `border-border/50` | `border-white/10` |
| Input background | `bg-background` | `bg-transparent` |
| Hover surfaces | `bg-accent` or `bg-accent/50` | `bg-white/[0.04]` |
| Muted backgrounds | `bg-muted` | `bg-white/5` |
| Primary actions | `bg-primary text-primary-foreground` | - |
| Accent highlights | `text-primary` | - |
| Error states | `text-destructive` | `text-red-500` |
| Success states | `text-emerald-500` or `text-emerald-600` | `text-emerald-400` |
| Warning states | `text-amber-500` or `text-amber-600` | `text-amber-300` |

### Status Badge Colors (Light-Theme Friendly)

```tsx
// Status badges that work on light backgrounds
const statusColors = {
  draft: "border-amber-500/50 bg-amber-500/10 text-amber-600",
  in_progress: "border-blue-500/50 bg-blue-500/10 text-blue-600",
  completed: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600",
}
```

### Accent Icon Colors

Use the `-500` variants for icons on light backgrounds:

```tsx
// ✅ Good - works on light backgrounds
<FolderKanban className="h-5 w-5 text-blue-500" />
<DollarSign className="h-5 w-5 text-emerald-500" />
<TrendingUp className="h-5 w-5 text-amber-500" />

// ❌ Avoid - hard to see on light backgrounds
<FolderKanban className="h-5 w-5 text-blue-400" />
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
<h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
  Main Headline
</h1>

// Section title
<h2 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
  Section Title
</h2>

// Card title
<h3 className="text-lg font-semibold text-foreground">
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

// Highlighted inline text
<span className="text-foreground font-medium">highlighted text</span>
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

### Shadow Usage

```tsx
// Standard card (light theme - minimal shadow)
<Card className="border-border/50 bg-card">
  {/* Content */}
</Card>

// Elevated card with shadow
<Card className="border-border/50 bg-card shadow-sm">
  {/* Content */}
</Card>

// Floating elements (dialogs, popovers)
<div className="shadow-lg">
  {/* Content */}
</div>
```

### Depth Hierarchy (Light Theme)

| Level | Use Case | Classes |
|-------|----------|---------|
| 0 | Base page | `bg-background` |
| 1 | Card surface | `bg-card border border-border/50` |
| 2 | Nested section | `bg-background border border-border/30` |
| 3 | Highlighted area | `bg-primary/5 border border-primary/20` |
| 4 | Floating UI | `bg-popover shadow-lg border border-border` |

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
<Button variant="outline">Outline</Button>
// Classes: border border-input bg-background hover:bg-accent

// Ghost - Minimal presence
<Button variant="ghost">Ghost</Button>
// Classes: hover:bg-accent hover:text-accent-foreground

// Destructive - Dangerous actions
<Button variant="destructive">Delete</Button>
// Classes: bg-destructive text-destructive-foreground
```

### Card Component

```tsx
// Standard card (theme-adaptive)
<Card className="border-border/50 bg-card">
  <CardHeader className="pb-3">
    <CardTitle className="text-base font-medium text-foreground">
      Card Title
    </CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Optional description
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Card with hover state
<Card className="border-border/50 bg-card transition-colors hover:bg-accent/50">
  {/* Content */}
</Card>
```

### Metric/Stat Card

```tsx
<Card className="border-border/50 bg-card transition-colors hover:bg-accent/50">
  <CardHeader className="p-5">
    <div className="flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
        <FolderKanban className="h-5 w-5 text-blue-500" />
      </div>
    </div>
    <div className="mt-4 space-y-1">
      <CardTitle className="text-3xl font-bold tabular-nums text-foreground">
        {value}
      </CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        {label}
      </CardDescription>
    </div>
    <p className="mt-2 text-xs text-muted-foreground">
      {subtext}
    </p>
  </CardHeader>
</Card>
```

### List Item Card

```tsx
<div className="group flex items-center justify-between rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border hover:bg-accent/50">
  <div className="flex items-center gap-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{title}</span>
        <Badge variant="outline" className="text-[10px] border-blue-500/50 bg-blue-500/10 text-blue-600">
          Status
        </Badge>
      </div>
      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{detail1}</span>
        <span>•</span>
        <span>{detail2}</span>
      </div>
    </div>
  </div>
  <span className="text-sm font-medium tabular-nums text-foreground">
    {value}
  </span>
</div>
```

### Input Fields

```tsx
// Standard input
<input
  type="text"
  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none ring-primary/40 transition focus:ring"
  placeholder="Placeholder text"
/>

// Select trigger
<SelectTrigger className="h-8 w-[130px] border-border bg-background text-xs">
  <SelectValue />
</SelectTrigger>
```

### Progress Bar

```tsx
<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
  <div
    className="h-2 rounded-full bg-primary transition-all"
    style={{ width: `${progress}%` }}
  />
</div>

// With dynamic colors based on value
<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
  <div
    className={cn(
      "h-full rounded-full transition-all duration-500",
      percentage > 90 ? "bg-rose-500" :
      percentage > 70 ? "bg-amber-500" :
      "bg-primary"
    )}
    style={{ width: `${percentage}%` }}
  />
</div>
```

### Badge/Status Pills

```tsx
// Draft status
<Badge variant="outline" className="text-[10px] border-amber-500/50 bg-amber-500/10 text-amber-600">
  Draft
</Badge>

// In Progress status
<Badge variant="outline" className="text-[10px] border-blue-500/50 bg-blue-500/10 text-blue-600">
  In Progress
</Badge>

// Completed status
<Badge variant="outline" className="text-[10px] border-emerald-500/50 bg-emerald-500/10 text-emerald-600">
  Completed
</Badge>
```

### Dropdown Menu

```tsx
<DropdownMenuContent align="end" className="w-64 p-2">
  <DropdownMenuItem className="cursor-pointer gap-3 rounded-lg px-3 py-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
      <Zap className="h-4 w-4 text-primary" />
    </div>
    <div className="flex flex-col">
      <span className="font-medium text-foreground">Menu Item</span>
      <span className="text-xs text-muted-foreground">Description</span>
    </div>
  </DropdownMenuItem>
</DropdownMenuContent>
```

### Tooltip (Custom)

```tsx
// Chart tooltip
<div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
  <p className="text-sm font-medium text-foreground">{title}</p>
  <p className="text-xs text-muted-foreground">{value}</p>
</div>
```

---

## Motion & Animation

### Keyframes

```css
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

### Transition Defaults

```tsx
// Standard transition
<div className="transition" />        // colors, opacity, etc.
<div className="transition-all" />     // all properties
<div className="transition-colors" />  // color changes only

// Duration modifiers (when needed)
<div className="duration-300" />  // 300ms
<div className="duration-500" />  // 500ms for progress bars
```

### Usage Patterns

```tsx
// Hover state transitions
<Card className="transition-colors hover:bg-accent/50">

// Focus ring transition
<input className="ring-primary/40 transition focus:ring">

// Group hover visibility
<div className="opacity-0 transition-opacity group-hover:opacity-100">

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
} from "lucide-react";
```

### Icon Sizes

| Size | Class | Use Case |
|------|-------|----------|
| 3-3.5 | `h-3 w-3` or `h-3.5 w-3.5` | Inline with small text, badges |
| 4 | `h-4 w-4` | Standard UI icons, buttons |
| 5 | `h-5 w-5` | Section headers, stat cards |
| 6 | `h-6 w-6` | Large standalone icons |

### Icon Styling

```tsx
// Primary accent icon
<Sparkles className="h-4 w-4 text-primary" />

// Muted icon
<ChevronDown className="h-4 w-4 text-muted-foreground" />

// Colored icon (use -500 for light themes)
<FolderKanban className="h-5 w-5 text-blue-500" />
<DollarSign className="h-5 w-5 text-emerald-500" />
<TrendingUp className="h-5 w-5 text-amber-500" />

// Icon with text
<div className="flex items-center gap-2">
  <Icon className="h-4 w-4 text-muted-foreground" />
  <span className="text-foreground">Label text</span>
</div>
```

---

## Patterns & Best Practices

### Card Hierarchy Pattern

```tsx
// Level 1: Main container card
<Card className="border-border/50 bg-card">
  <CardContent>
    
    {/* Level 2: List item */}
    <div className="rounded-xl border border-border/30 bg-background p-4">
      {/* Content */}
    </div>
    
  </CardContent>
</Card>
```

### Section Header Pattern

```tsx
<div className="flex items-center gap-2">
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
    <Users className="h-4 w-4 text-primary" />
  </div>
  <div className="text-left">
    <h3 className="text-sm font-medium text-foreground">Section Title</h3>
    <p className="text-xs text-muted-foreground">
      Section description
    </p>
  </div>
</div>
```

### Expandable Section Pattern

```tsx
<button
  onClick={() => setIsExpanded(!isExpanded)}
  className="flex w-full items-center justify-between"
>
  <div className="flex items-center gap-2">
    {/* Icon and title */}
  </div>
  <div className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
    {isExpanded ? (
      <ChevronUp className="h-4 w-4 text-muted-foreground" />
    ) : (
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    )}
  </div>
</button>
```

### Empty State Pattern

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="mb-4 rounded-full border border-border bg-muted p-4">
    <FileEdit className="h-6 w-6 text-muted-foreground" />
  </div>
  <p className="text-sm text-muted-foreground">No items found</p>
  <Button asChild size="sm" className="mt-4">
    <Link href="/create">Create new</Link>
  </Button>
</div>
```

### Error/Warning Pattern

```tsx
// Error message
<p className="text-xs text-destructive">{errorMessage}</p>

// Warning banner
<div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
  <TriangleAlert className="h-4 w-4" />
  {warningMessage}
</div>

// Success message
<p className="text-xs text-emerald-600">{successMessage}</p>
```

---

## Quick Reference Cheat Sheet

### Essential Classes (Theme-Adaptive)

```
Background:        bg-background, bg-card, bg-muted
Text Primary:      text-foreground
Text Secondary:    text-muted-foreground
Text Accent:       text-primary, text-primary/70
Borders:           border-border, border-border/50, border-border/30
Cards:             rounded-xl border border-border/50 bg-card
Hover States:      hover:bg-accent/50, hover:border-border
Buttons:           rounded-md (standard), rounded-full (pill)
Inputs:            rounded-lg border border-border bg-background
Progress bars:     bg-muted (track), bg-primary (fill)
Spacing:           gap-2 (tight), gap-4 (standard), gap-6 (loose)
```

### Do's ✅

- **Always use semantic tokens** (`text-foreground`, `bg-card`, `border-border`)
- Use `-500` or `-600` color variants for text on light backgrounds
- Add transitions to interactive elements (`transition-colors`, `hover:bg-accent/50`)
- Use `rounded-xl` or `rounded-2xl` for cards
- Use `bg-muted` for progress bar tracks and icon containers
- Test components in both light and dark modes

### Don'ts ❌

- **Don't use `text-white`** — use `text-foreground` instead
- **Don't use `text-black`** — use `text-foreground` instead
- **Don't use `bg-white/[0.02]`** — use `bg-card` instead
- **Don't use `border-white/10`** — use `border-border/50` instead
- Don't use `-300` or `-400` color variants for text (too light)
- Don't skip focus rings on interactive elements

### Migration Guide (Dark → Light Theme)

| Old (Dark Theme) | New (Theme-Adaptive) |
|------------------|----------------------|
| `text-white` | `text-foreground` |
| `text-white/60` | `text-muted-foreground` |
| `bg-white/[0.02]` | `bg-card` |
| `bg-white/5` | `bg-muted` |
| `border-white/10` | `border-border/50` |
| `border-white/5` | `border-border/30` |
| `hover:bg-white/[0.04]` | `hover:bg-accent/50` |
| `text-amber-300` | `text-amber-600` |
| `text-blue-400` | `text-blue-500` |
| `text-emerald-400` | `text-emerald-500` |

---

## Appendix: Component Import Paths

```typescript
// UI Components (shadcn)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Utilities
import { cn } from "@/lib/utils";

// Icons
import { Sparkles, Check, ArrowRight } from "lucide-react";
```

---

*Last updated: November 2024*
*Based on: Next.js 16 + shadcn/ui (New York style) + Tailwind CSS*
*Theme: Light-first with semantic color tokens*
