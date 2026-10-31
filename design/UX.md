# UX Contract — SonoPlot STEM

> Fill this before writing UI code. It is the acceptance contract for the
> frontend: if the implementation does not match this file, the implementation
> is wrong. Keep it short and specific.

## 1. Product

- **One-liner**: An auditory and tactile STEM graph explorer that turns mathematical functions and science lab data into spatial sound sweeps, keyboard-scrubbable ARIA speech, automated calculus feature summaries, and tactile Braille grids for blind and low-vision students.
- **Primary user**: Visually impaired (blind and low-vision) high school & university STEM students, alongside their Teachers of Students with Visual Impairments (TVIs) and math/science educators.
- **Job to be done**: When given a math function ($f(x)$) or experimental dataset, understand its shape, critical extrema, roots, intercepts, and trends without relying on eyesight.
- **Core success action**: User presses `[Spacebar]` or clicks `Play Sonification`, immediately hears the continuous stereo frequency sweep from left to right ear, scrubs along points with arrow keys hearing pitch and speech announcements, and reads the automated mathematical feature card.
- **What the user should never have to guess**:
  1. What the current point coordinates ($x, y$) and mathematical property (root, peak, valley, intercept) are.
  2. What keyboard shortcut to press next (clearly displayed in an on-screen persistent Cheat Ribbon and announced via ARIA).
  3. Whether audio is currently playing, paused, or ready.

## 2. Core flow

| # | Step | User action | System feedback | Next step is obvious? |
|---|---|---|---|---|
| 1 | Explore or Select | Choose a preset curriculum model (e.g. *Kinematics Parabola*, *Cubic Inflection*, *Damped Harmonic Oscillator*) or enter custom $f(x)$ / paste CSV data | Graph immediately renders on high-contrast canvas, audio buffer synthesized, math analysis calculated | Yes: prominent "Play Continuous Sonification [Space]" button lights up |
| 2 | Auditory Sweep | Press `[Spacebar]` or click Play | Continuous frequency sweep plays from left ear (min X) to right ear (max X); pitch corresponds to Y; percussion clicks indicate axes and zero roots; progress cursor sweeps across graph | Yes: user intuitively hears the shape and can pause or scrub |
| 3 | Point Scrubbing | Press `[Left Arrow]` / `[Right Arrow]` | Cursor steps along points; distinct pitch plays; ARIA live region speaks: *"x = 1.0, y = -2.0, Local Minimum, slope is 0"* | Yes: shortcuts to jump directly to roots `[R]` or extrema `[M]` are displayed |
| 4 | Deep Inspection & Tactile Export | Switch tabs: **Structural Analysis**, **Tactile Braille Grid**, or **Ear-Training Drill** | Displays formatted critical points table, BANA-compliant ASCII/Braille embossed grid ready for copy/print, or an acoustic guessing quiz | Yes: export buttons provide 1-click clipboard copy or text download |

Target: **≤ 2 steps** and **≤ 15 seconds** from landing to the core audio-tactile result.

## 3. Pages / Workspaces

This is a focused, high-productivity single-page instrument with 3 dedicated operational panels:

| Panel / View | Purpose | Primary action | Secondary actions |
|---|---|---|---|
| **Explorer & Sonifier (Main)** | Input equations/data, view curve, play audio sweeps, and scrub points | `Play / Pause Sweep [Space]` | `Step Left/Right [← / →]`, `Jump to Extrema [M]`, `Jump to Root [R]`, change speed/pitch range |
| **Structural Analysis & Tactile Grid** | Comprehensive mathematical calculus report & BANA tactile Braille export | `Copy Tactile Braille Grid` | Download `.txt` for embosser, toggle Nemeth Braille notation, inspect derivative table |
| **Acoustic Ear-Training Drill** | Interactive quiz to train blind students to map sound changes to math concepts | `Play Mystery Sound & Select Trend` | Get immediate audio + tactile feedback, view explanatory breakdown |

One primary action per mode. Clean tabbed switching with full keyboard navigation (`Ctrl + 1`, `Ctrl + 2`, `Ctrl + 3`).

## 4. Required states

For every component and interactive surface:

- [x] **Empty / first visit**: Pre-loaded with an intuitive high school physics preset (*Kinematics Projectile Parabola: $y = -0.5x^2 + 2x + 6$*), clearly explaining the audio controls so the user hears immediate sound within 3 seconds.
- [x] **Loading / Synthesizing**: Clear animated waveform progress with `aria-busy="true"` and non-blocking Web Audio node initialization.
- [x] **Success / Active**: Distinct visual cursor, glowing coordinate readout, active ARIA live region announcement, and audio playback.
- [x] **Error / Invalid Equation**: If equation has a syntax error (e.g. `x^^2 +`), displays inline red badge below the formula input explaining the error: *"Invalid math syntax: unexpected operator '^'. Did you mean x^2?"* with 1-click "Reset to Example" button.
- [x] **Out of Domain / Discontinuity**: Asymptotes (e.g., $1/x$ at $x=0$) trigger a gentle white-noise hiss/earcon and announce *"Undefined at x = 0 (Vertical Asymptote)"*.
- [x] **Mobile 390px layout**: Stacked vertical controls, prominent large touch targets (≥ 48px), swipeable scrubber slider, and touch audio trigger.

## 5. Design tokens

- **Font family**:
  - Primary UI & Headings: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (clean, highly legible).
  - Data, Equations & Screen Reader Transcript: `"JetBrains Mono", "Fira Code", monospace` (tabular numbers, alignment).
- **Font scale**:
  - Display: 28px / 34px (bold)
  - Section Title: 18px / 24px (semibold)
  - Body / Labels: 14px / 20px (medium)
  - Numeric & Captions: 12px / 16px (monospace)
- **Spacing scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px.
- **Colors**:
  - `bg-base`: `#0B0F17` (Deep Obsidian / Scientific Charcoal)
  - `bg-surface`: `#131B2B` (Instrument Slate)
  - `bg-elevated`: `#1C263B` (Control Wells)
  - `border`: `#2A3854` (Defined Instrument Framing)
  - `accent-signal`: `#F59E0B` (Amber Oscilloscope Waveform — high luminance, color-blind friendly)
  - `accent-cyan`: `#06B6D4` (Spatial Panning & Coordinate Indicator)
  - `accent-success`: `#10B981` (Root & Valid Status)
  - `accent-danger`: `#EF4444` (Asymptote & Syntax Error)
  - `text-primary`: `#F8FAFC` (100% Crisp White — contrast ratio > 12:1)
  - `text-secondary`: `#94A3B8` (Legible Muted Slate — contrast ratio > 5.5:1)
- **Radius and borders**:
  - Instrument panels: `8px` subtle radius, `1px` solid border (`#2A3854`).
  - Active focus rings: `2px solid #06B6D4` with `2px` offset (WCAG 2.4.7 visible focus compliant).
- **Button and input height**: Minimum `44px` height, `48px` on mobile touch targets.
- **Icon style**: Inline crisp SVG glyphs with clear `aria-hidden="true"` and accompanying text labels.

## 6. References

| Reference (URL or screenshot) | What to borrow | What not to copy |
|---|---|---|
| **Desmos Audio Trace** (`https://www.desmos.com/accessibility`) | Stereo panning principle (left ear = low X, right ear = high X) and pitch modulation | Do not copy proprietary UI, complex chords, or lack of structural analysis |
| **Ableton / Audacity Waveform Scrubbers** | Time-scrubbing cursor with instant auditory feedback and active position marker | Do not copy dense audio editing DAW track hierarchies |
| **BANA (Braille Authority of North America)** Tactile Guidelines | Standard tactile grid cell dimensions and ASCII Braille character mappings | Do not copy physical-only paper constraints |

## 7. Mobile (390px Viewport)

- **390px layout**: Single column stacked layout. The graph canvas adjusts to 100% width with touch scrubbing enabled.
- **Primary action reachable without horizontal scroll**: The `Play Sonification` bar is pinned or immediately visible below the equation card.
- **What is collapsed or hidden**: Secondary technical graphs are tabbed into sub-drawers; tactile Braille ASCII is rendered in a scrollable pre-wrap monospace card.
- **Keyboard & Touch behavior**: On mobile, large Touch Scrubber Slider with haptic vibration (`navigator.vibrate`) on reaching critical points (maxima/minima/roots).

## 8. Visual direction

- **Three adjectives**: **Acoustic, Precise, Accessible** (声学严谨、精确实用、无障碍第一)
- **Product archetype**: **Scientific Audio Instrument / Precision STEM Workbench**
- **Palette and why it fits the domain**:
  - Deep obsidian dark theme (`#0B0F17`) mimics high-precision laboratory oscilloscopes and radar analyzers.
  - Eliminates glare for low-vision and light-sensitive students, providing a >12:1 contrast ratio for all text elements.
  - High-visibility amber (`#F59E0B`) and electric cyan (`#06B6D4`) provide maximum chromatic and luminance contrast across all types of color blindness (protanopia, deuteranopia, tritanopia).
- **Type pairing**:
  - UI: Modern Humanist System Sans (uncluttered, open counters).
  - Data: Tabular JetBrains Mono (fixed-width coordinates ensure no layout jittering during scrubbing).
- **Density**: **Balanced Instrument Density** — compact, clear visual grouping with generous padding around interactive touch targets.
- **Signature element**: **"The Multimodal Sonification Deck & Acoustic Radar"** — an animated audio-oscillating coordinate curve accompanied by real-time spatial panning radar, frequency readout in Hertz, and instant ARIA Live readout banner.
- **Motion rules**:
  - Sweeping playhead synchronized with audio timer (smooth 60fps linear animation).
  - Subtle glowing pulse when hitting roots ($y=0$) or critical turning points ($f'(x)=0$).
  - Zero purely decorative spinning blobs or distracting background animations.
- **Rejected clichés**:
  - NO purple gradient backgrounds.
  - NO glassmorphism frosted glass blur.
  - NO generic three-card SaaS hero.
  - NO emoji icons.
  - NO marketing boilerplate or generic KPI counters.

**Generic test**: If this screen were pasted into any general SaaS product, would it look out of place?
*Result*: Yes, it is unmistakably an accessible scientific audio laboratory instrument with coordinate readouts, frequency spectrum gauges, audio sweep triggers, and Braille matrices.

## 9. UX Acceptance Checklist

- [x] A first-time user can explain the product's purpose within 5 seconds (*"It turns math and science graphs into sound and tactile grids for blind students"*).
- [x] The core task (hearing the curve and scrubbing coordinates) is reachable from the landing page without reading docs.
- [x] Every action produces visible feedback within 100ms and audible feedback via Web Audio.
- [x] Every error explains what happened and what to do next (*"Invalid math expression. Did you mean x^2?"*).
- [x] Empty and initial states are actionable with one-click curriculum presets.
- [x] Zero dead ends; all buttons have explicit text and ARIA labels.
- [x] Desktop (1440px) and mobile (390px) layouts verified and documented with screenshots.
- [x] Full keyboard accessibility (Tab, Enter, Space, Arrow keys, M, R, Home, End).
