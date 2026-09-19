---
name: Pitch Pulse Analytics
colors:
  surface: '#0a122a'
  surface-dim: '#0a122a'
  surface-bright: '#313852'
  surface-container-lowest: '#050d25'
  surface-container-low: '#131a33'
  surface-container: '#171e37'
  surface-container-high: '#212942'
  surface-container-highest: '#2c344d'
  on-surface: '#dbe1ff'
  on-surface-variant: '#bacbb9'
  inverse-surface: '#dbe1ff'
  inverse-on-surface: '#282f49'
  outline: '#859585'
  outline-variant: '#3b4a3d'
  surface-tint: '#00e475'
  primary: '#75ff9e'
  on-primary: '#003918'
  primary-container: '#00e676'
  on-primary-container: '#00612e'
  inverse-primary: '#006d35'
  secondary: '#4cd6fb'
  on-secondary: '#003642'
  secondary-container: '#00b2d6'
  on-secondary-container: '#003f4e'
  tertiary: '#ffdce3'
  on-tertiary: '#65002e'
  tertiary-container: '#ffb4c6'
  on-tertiary-container: '#a70051'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#62ff96'
  primary-fixed-dim: '#00e475'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005226'
  secondary-fixed: '#b3ebff'
  secondary-fixed-dim: '#4cd6fb'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5f'
  tertiary-fixed: '#ffd9e1'
  tertiary-fixed-dim: '#ffb1c4'
  on-tertiary-fixed: '#3f001a'
  on-tertiary-fixed-variant: '#8f0044'
  background: '#0a122a'
  on-background: '#dbe1ff'
  surface-variant: '#2c344d'
typography:
  display:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 26px
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  label-caps:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes a high-performance, dark-mode analytical environment engineered specifically for modern football data intelligence on mobile devices. It balances high-density statistics with immediate tactical comprehension. The aesthetic fuses **Technical Modernism** with **Telemetry High-Contrast**: deep midnight navy surfaces recede into the canvas, allowing vibrant data traces, spatial pitch visualizations, and live event pulses to demand visual priority without eye fatigue.

The emotional signature is focused, sharp, and authoritative—analogous to a professional tactical room HUD or high-end trading terminal, re-engineered for one-handed mobile speed. Visual clutter is stripped in favor of strict tabular layouts, structured micro-badges, and high-visibility glow accents that direct attention directly to match momentum, performance anomalies (xG over/under-performance), and live minute-by-minute shifts.

## Colors

The palette leverages a strict visual hierarchy calibrated for low-light legibility and immediate categorical recognition:

- **Primary Canvas (`#0B132B`)**: Deep Midnight Navy providing foundational contrast and maximum battery efficiency on OLED displays.
- **Surface & Panels (`#1C2541`)**: Elevated container level housing match cards, stat grids, and metrics panels.
- **Borders & Structural Lines (`#2A3859`)**: Low-glare division lines separating dense information cells without adding visual bulk.
- **Primary Accent / Victory / Action (`#00E676`)**: Pitch Green. Used for primary CTAs, positive metric variance, goal indicators, win badges (G), and upper-percentile metric anchors.
- **Secondary Accent / Analytic Depth (`#00B4D8`)**: Electric Blue. Reserved for comparative charts, radar axes, passing networks, possession stats, and secondary interactions.
- **Alert / Live State / Defeat (`#FF007F`)**: Neon Fuchsia. Denotes live match clocks (`90'+3`), hot zones, high-risk tactical events, red cards, and loss badges (M).
- **Draw / Neutral Accent (`#F59E0B`)**: Amber gold utilized strictly for draw states (B) and warning flags.
- **Text & Data Layers**:
  - `text-high`: `#FFFFFF` (Primary stats, player names, team scores).
  - `text-medium`: `#94A3B8` (Metric labels, elapsed time, secondary text).
  - `text-subtle`: `#64748B` (Inactive states, table headers, pitch line markings).

## Typography

The type system adopts a strict three-tier hierarchy:

1. **Display & Headers (Outfit)**: Clean geometric shapes with aggressive modern cuts that inject sporting dynamism into match headers, tournament titles, and modal sheets.
2. **Body & Interface (Inter)**: High x-height, neutral grotesk clarity designed for compact mobile viewports, ensuring effortless scanning across deep tactical tables and player profiles.
3. **Metrics & Numerical Telemetry (JetBrains Mono)**: Pure monospaced figures (`tabular-nums`) across all timestamps, xG tallies, pass completion percentages, shot conversion rates, and coordinate points. This prevents optical jitter when numerical data updates in real time. All micro-labels use uppercase tracking for rapid scan-ability.

## Layout & Spacing

This design system is optimized for a high-density, single-column mobile experience (with a fluid 4-column sub-grid on standard 360–428px mobile widths):

- **Grid & Gutters**: Outer viewport margins are pinned at `16px` (`margin: 1rem`) to maximize screen estate for multi-column data sheets. Column gutters sit at `12px` (`gutter: 0.75rem`), tight enough to keep related match entities connected.
- **Rhythm Scale**: Spacing is anchored to a strict `4px` incremental system. `space-xs` (4px) isolates micro indicators (form dots, live badges); `space-sm` (8px) separates metrics within compact cards; `space-md` (12px) structures intra-card components; `space-lg` (16px) establishes section gaps.
- **Thumb Zone Compliance**: Primary interactive triggers, sub-navigation tabs (e.g., *Genel Bakış, Kadrolar, xG Analizi, Momentum*), and prediction slips are anchored in the bottom 40% of the screen.
- **Scroll Behavior**: Horizontal overflow scroll is standard for form guides, live fixture carousels, and match filter pills with snap-to-edge momentum.

## Elevation & Depth

Visual hierarchy is communicated via layered surfaces and subtle luminous outlines rather than heavy opaque drop shadows:

- **Canvas Level (0dp)**: `#0B132B`. The continuous backdrop upon which data components sit.
- **Surface Level 1 (Card & Module Layer)**: `#1C2541` encased with a crisp `1px` border of `#2A3859`. Flat, zero ambient blur, creating a distinct, architectural boundary for tables and cards.
- **Surface Level 2 (Floating & Active States)**: `#222E50` with an outer border glow (`box-shadow: 0 0 12px rgba(0, 230, 118, 0.15)`) when focused, selected, or housing a match in play.
- **Overlay Level (Bottom Sheets & Drawers)**: `#141C33` backed by a heavy backdrop blur (`backdrop-filter: blur(16px)`) with a top border highlight of `1px solid rgba(255, 255, 255, 0.1)`.
- **Live Indicator Beacon**: Active live elements (e.g., Live Minute indicator, Hot Prediction chip) employ a dual-layer soft pulse: `box-shadow: 0 0 8px rgba(255, 0, 127, 0.5)`.

## Shapes

The shape architecture pairs structural stability with modern sport-tech curves:

- **Cards & Data Modules**: Defined at `rounded-md` (`8px`) for inner items and `rounded-lg` (`12px`) for primary cards. This maintains compact line alignment within statistical tables.
- **Controls & CTAs**: Interactive action elements, bottom tabs, and prediction slips utilize `rounded-md` (`8px`) to remain distinct from fluid informational cards.
- **Badges, Tags & Match Minutes**: Pill-shaped (`9999px`) rounded borders are applied strictly to qualitative markers: Form indicators (G/B/M), match elapsed time (`74'`), and status labels (`HT`, `FT`, `VAR`).

## Components

### 1. Live Match Scoreboard & Ticker
- **Layout**: Centered split card with Home and Away teams stacked or horizontally opposed.
- **Live State**: The match minute badge sits prominently between scores, filled with `rgba(255, 0, 127, 0.15)` with text in `#FF007F` and a blinking `4px` circular dot.
- **Typography**: Team names in `title-md` (`#FFFFFF`), live scores rendered in `data-lg` (`#FFFFFF`).

### 2. Comparative xG & Metric Progress Bars
- **Architecture**: Dual-ended horizontal comparative bar. Home metrics extend from the left in `#00E676` or `#00B4D8`; Away metrics extend from the right in contrasting tone or muted `#64748B`.
- **Center Ticker**: Target statistic label (e.g., `Beklenen Gol (xG)`, `Topla Oynama`) displayed in `label-caps` (`#94A3B8`) dead-center above or between numerical values set in `data-md`.
- **Track**: `4px` height with a `#2A3859` background track and `2px` rounded ends.

### 3. Radar & Tactical Visualizer Panels
- **Container**: Elevated `#1C2541` surface with subtle concentric polygon guides rendered in `#2A3859`.
- **Data Layers**: Metric polygon filled with `#00B4D8` at `25%` opacity, stroked at `2px` solid `#00B4D8`. Comparative overlay (opponent/league average) rendered with dashed `#64748B`.
- **Metric Nodes**: Distinct labels (`Pres`, `Pas İsabeti`, `Hücum`, `Hava Topu`, `Defansif Katkı`) positioned around the perimeter in `label-caps`.

### 4. Player Pitch & Heatmap Canvas
- **Pitch Graphic**: Stylized dark turf background in `#101935` marked with `1px` crisp penalty boxes and center circle in `#2A3859`.
- **Heatmap Layer**: High-density radial gradients blending smoothly from cool `#00B4D8` (low touch zones) to warm `#00E676` and hot `#FF007F` (box touches and goalmouth action).

### 5. Form Badges (G, B, M)
- **Geometry**: Circular or rounded-square (`20x20px`) badges aligned in horizontal rows of 5.
- **Color Mapping**:
  - **Galibiyet (G)**: Background `#00E676`, text `#0B132B` (`font-bold`).
  - **Beraberlik (B)**: Background `#F59E0B`, text `#0B132B` (`font-bold`).
  - **Mağlubiyet (M)**: Background `#FF007F`, text `#FFFFFF` (`font-bold`).

### 6. Interactive Prediction & Poll Cards
- **Structure**: Deep Navy panel (`#1C2541`) with interactive odd/prediction segments (1 - X - 2).
- **Segment Buttons**: Outlined in `#2A3859` with selection triggering an active state: background `rgba(0, 230, 118, 0.1)`, border `#00E676`, and text `#00E676`.
- **Community Consensus**: Inline percentage bar displaying voting distribution using `#00E676`, `#F59E0B`, and `#FF007F`.

### 7. League Standings Table (Dense Mode)
- **Grid Layout**: Pinned team name column with horizontal drag-scroll for performance indicators (`O`, `G`, `B`, `M`, `AV`, `P`, `xG Diff`).
- **Rows**: Alternating subtle backgrounds (`#1C2541` to `rgba(28, 37, 65, 0.5)`) separated by `1px` `#2A3859` borders.
- **Qualification Strips**: A `3px` solid vertical bar on the left edge denoting Champions League (`#00E676`), Europa League (`#00B4D8`), and Relegation (`#FF007F`).