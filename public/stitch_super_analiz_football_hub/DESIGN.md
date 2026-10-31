---
name: Süper Analiz
colors:
  surface: '#f9f9ff'
  surface-dim: '#d1daf4'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8ff'
  surface-container-highest: '#d9e2fc'
  on-surface: '#121b2e'
  on-surface-variant: '#3e4a40'
  inverse-surface: '#273044'
  inverse-on-surface: '#edf0ff'
  outline: '#6e7a6f'
  outline-variant: '#bdcabd'
  surface-tint: '#006d3b'
  primary: '#006b39'
  on-primary: '#ffffff'
  primary-container: '#00874a'
  on-primary-container: '#fbfff8'
  inverse-primary: '#70dc95'
  secondary: '#00677d'
  on-secondary: '#ffffff'
  secondary-container: '#50d9fe'
  on-secondary-container: '#005c70'
  tertiary: '#b70059'
  on-tertiary: '#ffffff'
  tertiary-container: '#e50071'
  on-tertiary-container: '#fffdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8cf9af'
  primary-fixed-dim: '#70dc95'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#00522b'
  secondary-fixed: '#b3ebff'
  secondary-fixed-dim: '#4cd6fb'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5f'
  tertiary-fixed: '#ffd9e1'
  tertiary-fixed-dim: '#ffb1c4'
  on-tertiary-fixed: '#3f001a'
  on-tertiary-fixed-variant: '#8f0044'
  background: '#f9f9ff'
  on-background: '#121b2e'
  surface-variant: '#d9e2fc'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  label-numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-numeric-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

The design system establishes a high-performance sports analytics editorial and data terminal for Turkish football. It balances elite analytical rigor with accessible, high-clarity sports journalism.

### Core Philosophy
- **Clean Light Precision:** Rejects the overused dark, glowing, crypto-like esports aesthetic. More than 85% of the surface area is pure white (`#FFFFFF`) or soft neutral canvas (`#F7F9FC`, `#F1F4F8`), reminiscent of high-end financial terminals and editorial broadsheets.
- **Air & Legibility:** Ample whitespace and breathable padding ensure high-density metrics (xG, passing maps, tactical zones) never feel congested or overwhelming.
- **Micro-Contrast & Restraint:** High-impact status hues (Pitch Green, Defeat Crimson, Tactical Cyan, Draw Amber) exist exclusively for data attribution, state changes, and primary action drivers—never for decorative clutter.

### Target Audience & Emotional Impact
Designed for football analysts, club scouts, sports journalists, and analytical fans. The interface conveys clinical accuracy, calm authority, modern Scandinavian-influenced minimalism, and instant readability under live-match pressure.

## Colors

The color system operates on calibrated semantic assignments tailored to football statistics:

### Surface & Border Hierarchy
- **Canvas Base:** `#FFFFFF` (Primary surface for elevated cards, active panels, table cells)
- **Sub-Canvas / Sectional Fill:** `#F7F9FC` (Secondary page segments, filters toolbar, secondary rail)
- **Neutral Recessed Surface:** `#F1F4F8` (Pill badges, search inputs, inactive bar tracks, header fills)
- **Structural Borders:** `#E5EAF1` (Card outlines, container limits)
- **Dividers & Gridlines:** `#E9EDF3` (Table rows, vertical splitters, subtle separators)

### Typography & Ink
- **Headings & Bold Labels:** `#0B132B` (High-contrast, authoritative dark slate)
- **Primary Body Text:** `#172033` (Balanced readability for sustained match reviews)
- **Secondary Metadata:** `#667085` (Timestamps, secondary column metrics, breadcrumbs)
- **Muted / Subdued:** `#8490A5` (Empty states, helper text, chart grid ticks)

### Functional & Sports Telemetry Colors
- **Pitch Green (Win / Positive Metric / Primary CTA):** `#00874A`
  - *Vibrant Green (Live / Success Indicator):* `#00A859`
  - *Accent Flare (Real-time Pulses):* `#00E676`
- **Data Cyan (Tactical Series / Secondary Stats / Radar Overlays):** `#00B4D8`
- **Loss / Danger / Live Minute Pulse:** `#FF007F` (Sharp magenta-crimson for high-visibility contrast)
- **Draw / Caution / Amber Stats:** `#F59E0B`

## Typography

Typography establishes an analytical tripartite relationship:

1. **Space Grotesk:** Anchors titles, widget headers, card names, and standings table league headers. It delivers technical character with geometric precision.
2. **Inter:** Handles all editorial copy, analysis commentary, player bio notes, form summaries, and UI action triggers, ensuring neutral, frictionless scanning.
3. **JetBrains Mono:** Dedicated exclusively to quantitative values:
   - Match scores (`3 - 1`)
   - Match clocks (`87:42`)
   - Advanced analytics (`xG: 2.14`, `PPDA: 8.4`, `PSxG+/-: +0.42`)
   - Standings numbers (Points, GD, Win/Draw/Loss totals)
   - Tabular alignment ensures numbers never shift horizontally during live data streams.

## Layout & Spacing

The structural layout relies on an open 12-column responsive fluid grid designed to display multi-tier statistical dashboards without friction.

### Grid & Breakpoints
- **Desktop (1280px+):** 12 columns, `1.25rem` (20px) gutters, max container width `1440px` with `2rem` (32px) margins.
- **Tablet (768px – 1279px):** 8 columns, `1rem` (16px) gutters, fluid margins `1.5rem` (24px). Match center views shift side-by-side radars to stacked tabs.
- **Mobile (< 768px):** 4 columns, `0.75rem` (12px) gutters, `1rem` (16px) outer margins. Numerical telemetry cards snap into horizontal scroll trays.

### Spacing Cadence
- **Micro Spacing (`space-xs`, `space-sm`):** Badge padding, score pill separators, team crest-to-name gaps.
- **Structural Spacing (`space-md`, `space-lg`):** Internal card padding, table row heights (`48px` default, `40px` compact), widget headers to content.
- **Sectional Gaps (`space-xl`):** Major matchweek containers, fixture carousels, and analysis module transitions.

## Elevation & Depth

To preserve the clean, air-filled 85%+ white and ultra-light canvas, the system rejects deep shadows and glossy surfaces in favor of architectural surface layering:

### Elevation Hierarchy
- **Level 0 (Base Canvas):** Background canvas `#FFFFFF` or sub-canvas `#F7F9FC`.
- **Level 1 (Card & Module Surfaces):** Surface `#FFFFFF`, bounded by `1px solid #E5EAF1` with an ultra-soft ambient shadow: `box-shadow: 0 1px 3px rgba(11, 19, 43, 0.03), 0 1px 2px rgba(11, 19, 43, 0.02)`.
- **Level 2 (Hovered Cards & Interactive Rows):** `box-shadow: 0 4px 12px rgba(11, 19, 43, 0.05)`, border shifts subtly to `#D5DFEB`.
- **Level 3 (Sticky Headers, Live Sliders, Floating Drawers):** `box-shadow: 0 8px 24px rgba(11, 19, 43, 0.06)`, border `#E5EAF1`.

### Data Layer Separation
Data visual layers (heatmaps, shot charts, pass networks) use transparent fills against pure white backing to maintain immediate legibility and clean contrast.

## Shapes

The design system implements a cohesive geometric profile with `roundedness: 2`:

- **Containers & Cards:** `12px` (`0.75rem`) to `16px` (`1rem`) border-radius (`rounded-lg`), providing an inviting yet strictly structured container for complex data.
- **Form Controls & Inputs:** `8px` (`0.5rem`) for search fields, filter selectors, and team drop-downs.
- **Status Pills, Match Clocks & Form Tags:** `9999px` (Pill-shaped) for `W / D / L` indicators, live match minute flags, and xG badge counters.
- **Data Bars & Progress Tracks:** `4px` to `6px` radius for smooth comparison bars without appearing blunt.

## Components

### 1. Buttons
- **Primary Action (Match Filter, Export, Follow Team):** Filled `#00874A`, text `#FFFFFF`, font `Inter` 600, border radius `8px`. Hover: `#00A859`. Focus: 2px ring `#00E676` with 2px offset.
- **Secondary Action:** Background `#FFFFFF`, border `1px solid #E5EAF1`, text `#172033`. Hover: background `#F7F9FC`, border `#D5DFEB`.
- **Ghost Action (Table Column Toggles):** Background transparent, text `#667085`. Hover: background `#F1F4F8`, text `#0B132B`.

### 2. Match Cards & Score Blocks
- **Card Shell:** Background `#FFFFFF`, border `1px solid #E5EAF1`, corner radius `14px`, padding `space-md`.
- **Live State Indicator:** Pill badge with `#FF007F` dot, animated ping, text `#FF007F`, background `rgba(255, 0, 127, 0.08)`.
- **Score Matrix:** `JetBrains Mono` 24px bold (`#0B132B`). Team names in `Space Grotesk` 15px medium.
- **xG Comparison Line:** A slim 4px progress rail beneath the score; home side `#00874A`, away side `#00B4D8`, track `#F1F4F8`.

### 3. Data Tables (Standings, Player Metrics)
- **Cell Structure:** Height `52px` (standard) or `40px` (dense), padding `0 16px`. Horizontal border `1px solid #E9EDF3`.
- **Row States:** Default `#FFFFFF`, hover `#F7F9FC`. Active/Selected row uses subtle `#00874A` 2px left border accent.
- **Headers:** Background `#F7F9FC`, font `Space Grotesk` 11px uppercase (`label-caps`), text `#8490A5`.
- **Numeric Cells:** Monospaced (`JetBrains Mono`), right-aligned with fixed tabular figures.

### 4. Chips & Form Badges
- **Result Badges (Form Guide):**
  - **Win (G):** 24x24px rounded-full circle, background `#00874A`, text `#FFFFFF`, label "G".
  - **Draw (B):** 24x24px rounded-full circle, background `#F59E0B`, text `#FFFFFF`, label "B".
  - **Loss (M):** 24x24px rounded-full circle, background `#FF007F`, text `#FFFFFF`, label "M".
- **Filter Chips:** Height `32px`, pill-shaped, background `#F1F4F8`, text `#172033`. Selected: background `#00874A`, text `#FFFFFF`.

### 5. Input Fields & Selectors
- **Search & Filter Bars:** Background `#FFFFFF`, border `1px solid #E5EAF1`, height `40px`, text `Inter` 14px. Focus: border `#00874A`, box-shadow `0 0 0 3px rgba(0, 135, 74, 0.12)`.
- **Placeholder:** `#8490A5`.

### 6. Sports Data Visualizations (Bars, Radars, Donut Charts)
- **Direct Stat Comparisons (Possession, Shots, Pass Accuracy):**
  - Track background: `#F1F4F8`, height: `8px`, corner radius: `4px`.
  - Team A Fill: `#00874A`.
  - Team B Fill: `#00B4D8`.
- **Radar & Polygons:** 
  - Web gridlines: `#E9EDF3` at 1px stroke.
  - Metrics polygon: `#00874A` fill at 20% opacity with 2px solid stroke; secondary layer uses `#00B4D8` at 20% opacity.
- **Shot Map Fills:** Open Play Goal (Green `#00874A`), Missed (Muted `#8490A5`), Blocked (Amber `#F59E0B`), Save (Cyan `#00B4D8`), xG represented by node size (6px to 24px diameter).