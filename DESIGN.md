---
name: Gym Application
description: A personal gym and food tracker that feels like an outdoor swim club on a sunny morning.
colors:
  sun-deck: "oklch(0.982 0.007 85)"
  tile-white: "oklch(0.997 0.003 85)"
  warm-ink: "oklch(0.22 0.014 60)"
  lido-yellow: "oklch(0.86 0.16 85)"
  yellow-ink: "oklch(0.47 0.11 70)"
  pool-blue: "oklch(0.56 0.15 248)"
  wet-concrete: "oklch(0.95 0.012 85)"
  shade-text: "oklch(0.47 0.02 60)"
  sunlit-hover: "oklch(0.95 0.035 88)"
  grout: "oklch(0.9 0.014 80)"
  coral-warning: "oklch(0.58 0.2 30)"
  night-deck: "oklch(0.185 0.012 60)"
  night-tile: "oklch(0.225 0.014 60)"
  night-pool: "oklch(0.7 0.13 245)"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  numeral:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
    fontFeature: "tnum"
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
rounded:
  tile: "8px"
  field: "20.8px"
  float: "9999px"
spacing:
  tight: "8px"
  group: "16px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.lido-yellow}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.float}"
    height: "48px"
    padding: "8px 20px"
  button-primary-hover:
    backgroundColor: "{colors.lido-yellow}"
    textColor: "{colors.warm-ink}"
  button-outline:
    backgroundColor: "{colors.tile-white}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.float}"
    height: "48px"
  button-on-field:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.lido-yellow}"
    rounded: "{rounded.float}"
    height: "56px"
  field-sun:
    backgroundColor: "{colors.lido-yellow}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.field}"
    padding: "24px"
  field-pool:
    backgroundColor: "{colors.pool-blue}"
    textColor: "{colors.tile-white}"
    rounded: "{rounded.field}"
    padding: "24px"
  tile:
    backgroundColor: "{colors.tile-white}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.tile}"
    padding: "20px"
  float-empty:
    backgroundColor: "{colors.tile-white}"
    rounded: "{rounded.float}"
    size: "20px"
  float-filled:
    backgroundColor: "{colors.pool-blue}"
    rounded: "{rounded.float}"
    size: "20px"
  tab-active:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.sun-deck}"
    rounded: "{rounded.float}"
    height: "44px"
  input:
    backgroundColor: "{colors.tile-white}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.tile}"
    height: "48px"
---

# Design System: Gym Application

## Overview

**Creative North Star: "The Swim Club on a Sunny Morning"**

The app feels like arriving at an outdoor pool early: a bright warm deck, one big yellow sign telling you what's next, and lane ropes you count as you go. It is a consumer app for people holding a phone between sets or logging dinner at home, so every screen leads with one next thing at a huge size and pushes everything else back.

The palette does real work. Lido yellow marks what is waiting for you. Pool blue only ever means "this filled up / this is done". Ink carries text and the strongest buttons. Coral appears only for missed days and warnings. Density is relaxed on phones and splits into an uneven 3:2 grid on desktop, never three equal cards.

It rejects the fitness-app default (near-black with neon glow) and the wellness default (pastel calm cards). It also avoids glass, gradients, and icon-in-a-square feature lists.

**Key Characteristics:**
- One big coloured Field per screen; everything else is a quiet tile or plain text.
- Lane-rope floats are the progress language everywhere (sets, week days, calories, steps).
- Heavy Archivo headings with tight tracking over friendly Figtree body text.
- Done and missed items stay visible and marked, never removed.
- One ripple when something completes; press feedback on every tap.

## Colors

Warm sun-washed neutrals with one loud yellow and one meaningful blue.

### Primary
- **Lido Yellow** (oklch(0.86 0.16 85)): the Field behind "today's next thing", primary buttons, the active tab pill, selected options. Always carries Warm Ink text, never white.
- **Yellow Ink** (oklch(0.47 0.11 70)): the readable yellow-family colour for links, small emphasis and focus rings on light ground (yellow itself fails contrast as text).

### Secondary
- **Pool Blue** (oklch(0.56 0.15 248); dark mode oklch(0.7 0.13 245)): filled floats, completed sets, "You did it!" Fields, the strength graph, saved confirmations. It means progress and nothing else.

### Tertiary
- **Coral Warning** (oklch(0.58 0.2 30)): missed days in the week rope, destructive actions, form errors only.

### Neutral
- **Sun Deck** (oklch(0.982 0.007 85)): page ground. Warm white, not cream.
- **Tile White** (oklch(0.997 0.003 85)): tiles, inputs, the bottom bar.
- **Warm Ink** (oklch(0.22 0.014 60)): text, active section tabs, ink buttons on Fields.
- **Shade Text** (oklch(0.47 0.02 60)): secondary text, about 6:1 on Sun Deck.
- **Wet Concrete** (oklch(0.95 0.012 85)): muted fills, empty states, tab tracks.
- **Grout** (oklch(0.9 0.014 80)): borders and row dividers.
- **Night Deck / Night Tile** (oklch(0.185 0.012 60) / oklch(0.225 0.014 60)): dark-mode ground and tiles. The yellow stays the same at night.

### Named Rules
**The Blue Means Done Rule.** Pool Blue is only for things that filled up or finished. Never use it for decoration, links or plain buttons.

**The One Field Rule.** A screen has at most one big coloured Field. If two things compete for it, the less urgent one becomes a tile.

**The Ink On Yellow Rule.** Text and buttons on Lido Yellow use Warm Ink (or inherit the Field's ink via `currentColor`), so they stay readable in light and dark mode.

## Typography

**Display Font:** Archivo (variable, with width axis; fallback system-ui)
**Body Font:** Figtree (fallback system-ui)

**Character:** Archivo at 800 weight with tight tracking reads like painted pool signage; condensed width (`font-stretch-condensed`) gives depth-marker numerals for timers and stats. Figtree keeps body text friendly and easy at small sizes.

### Hierarchy
- **Display** (800, 3rem to 4.5rem, line-height 1, -0.035em): landing headline only.
- **Headline** (800, 2.25rem to 3rem, line-height 1): page titles and the Field question ("Ready for Legs and push?").
- **Title** (800, 1.25rem to 1.5rem): tile and section headings, exercise names.
- **Numeral** (800, 3rem to 3.75rem, tabular): calories, workout counts, finish stats; condensed for timers.
- **Body** (400, 1rem to 1.125rem, line-height about 1.55): descriptions, max about 65ch.
- **Label** (700, 0.875rem): tab bar labels, chips, weekday letters.

### Named Rules
**The No Eyebrow Rule.** Headings speak for themselves. No small label or kicker above a heading; status lines go under the subtitle.

**The Fixed Cell Rule.** All numbers are tabular (`font-variant-numeric: tabular-nums` on html) so values change in place without shifting.

## Layout

Phone first at 375px with a 16px gutter. Content column caps at `max-w-2xl` (672px) for single-column screens. The dashboard shell allows `max-w-4xl` so Home can split 3:2 on large screens (Field left, food and week stats right). Spacing rhythm: 8px inside groups, 16px between tiles, 24px under page headers, more space above a heading than below it. Primary actions sit within thumb reach: sticky above the bottom bar (`bottom-24`) on phones, inline on desktop. The bottom tab bar has five items (Today, Workouts, Food, Progress, More); desktop swaps it for a left sidebar.

## Elevation & Depth

Flat by default. Depth comes from colour fields and borders, not shadows. Only two shadows exist: a small Yellow Ink tinted shadow under primary buttons (removed on press), and a larger soft shadow under floating things (the sticky action, the rest-timer pill, the landing demo).

## Shapes

Three shapes, each with a job. Tiles are small-radius rectangles (8px), like pool tiles. Fields are big soft rectangles (about 21px). Floats, buttons, tabs and chips are fully round. Borders are 1px Grout on tiles and 2px on inputs, option cards and empty floats.

## Components

### Buttons
- **Shape:** fully round pill.
- **Primary:** Lido Yellow with Warm Ink bold text, 48px tall (56px large), small tinted shadow.
- **On a Field:** Warm Ink pill with yellow text (`FIELD_BUTTON`); quiet outline variant uses `currentColor` at 30% (`FIELD_OUTLINE`).
- **Outline:** Tile White with a 2px ink-at-15% border; border darkens on hover.
- **Press:** every button scales to 97% on press with a 150ms ease-out.

### Field
- The one big region per screen (`src/shared/components/ui/field.tsx`). Sun tone for "next thing to do", pool tone for "done". Holds a question-style headline, one line of context, one action, and optionally the week rope.

### Lane Rope (signature)
- `src/shared/components/ui/lane-rope.tsx`. A row of round floats: empty floats have a 2px Pool Blue ring at 25%; filled floats are solid Pool Blue; the current one is yellow with an ink ring. When a float fills while visible it sends one ripple. Used for workout sets, calorie targets (10 floats), and landing steps.
- **Week Rope** (`src/features/training/components/week-rope.tsx`): seven day-floats. Done is filled blue, missed keeps a coral ring, today has an ink ring, rest days shrink to a dot.

### Set Float
- In the workout checklist each set's Done control is a 48px float that fills blue with a ripple and shrinks to 90% on press.

### Tiles
- Tile White, 8px radius, 1px Grout border, 20px padding. Lists inside tiles use row dividers, not nested cards.

### Inputs
- 48px, 2px border, Tile White; focus turns the border ink with a 4px yellow ring.

### Tabs
- Pill track in Wet Concrete; the active tab is a Warm Ink pill with light text. Same look for in-page tabs and section links.

### Navigation
- Bottom bar: Tile White, five items, 56px targets, active icon sits in a yellow pill. The More sheet lists items as plain icon rows (no icon tiles). Header wordmark: two floats (yellow, blue) and the app name in Archivo 800.

## Do's and Don'ts

### Do:
- **Do** lead each screen with its single next action in one Field, phrased as plain coach talk ("Ready for Legs and push?", "Rest day. Enjoy it.").
- **Do** show progress as floats that fill, and celebrate completion with one ripple and "You did it!".
- **Do** keep done and missed items visible and marked.
- **Do** keep copy short enough for a child to understand; name features plainly (Today, Food, Progress, Ask Coach).
- **Do** guard all motion with `prefers-reduced-motion` (ripples hide, fills and rises stop).

### Don't:
- **Don't** use Pool Blue for anything that isn't progress or completion.
- **Don't** put white text on Lido Yellow.
- **Don't** build sections from three identical icon cards or icon-in-a-square feature lists.
- **Don't** add eyebrows or kickers above headings.
- **Don't** use gradients, glass blur or glowing blobs as decoration.
- **Don't** invent stats, testimonials or claims; demo content is labelled ("Try it").
