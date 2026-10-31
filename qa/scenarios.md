# QA Scenarios — SonoPlot STEM

**Target Environments**:
- Deployed: `https://accessed-hacks.vercel.app`
- Local: `http://localhost:4173` (Production Preview)
**Browser**: Headless Firefox 157.0 & Headless Chromium
**Viewports**: Desktop (1440×900) & Mobile (390×844)

---

## Scenario Catalog & Prioritization

### P0 (Critical — Core Accessibility & Sonification Flow)
1. **`smoke-landing`**:
   - Initial landing page renders with high contrast.
   - Page title is non-empty.
   - Document horizontal overflow $\le 1$px.
   - Default curriculum preset (Kinematics Projectile) is loaded and ready.
2. **`core-audio-sweep`**:
   - User triggers continuous audio sweep via button click or Spacebar.
   - Visual playhead sweeps across canvas.
   - Web Audio oscillator generates smooth frequency modulation without console errors.
   - User can pause/stop sweep on demand.
3. **`keyboard-scrubbing-aria`**:
   - User steps left and right using Arrow keys.
   - Audio point frequency tone plays immediately.
   - ARIA live region (`role="status"`) announces coordinate and slope updates.
   - Screen-reader feed reflects exact mathematical state.
4. **`feature-snapping-extrema-roots`**:
   - User presses `[R]` or clicks "Next Root" to jump cursor to zero crossing.
   - User presses `[M]` or clicks "Next Extrema" to jump cursor to peak/valley turning point.
   - Coordinate inspector updates instantly to the exact critical point.

### P1 (High Priority — Pedagogical Value & Tactile Output)
5. **`calculus-structural-report`**:
   - User switches to Tab 2 ("Calculus Feature Report").
   - Summary card displays correct domain, range, roots, and critical points.
   - Critical points table lists coordinates, calculus classifications, and slope conditions.
   - Clicking "Inspect Point" jumps back to Tab 1 with cursor focused on that point.
6. **`tactile-braille-bana-grid`**:
   - User switches to Tab 3 ("BANA Tactile Braille Grid").
   - ASCII tactile matrix conforming to BANA guidelines renders with axes, origin, and curve points.
   - User toggles to "Unicode Braille Pins" view.
   - "Copy Grid" triggers clipboard write and gives visual confirmation ("Copied!").
   - "Download .txt" triggers browser file download.
7. **`formula-validation-error-recovery`**:
   - User enters an invalid formula (e.g. `x^^3 +++`).
   - System displays inline accessible error message explaining the issue.
   - System does not crash or produce unhandled exceptions.
   - User corrects formula to `x^3 - 3*x` and clicks "Apply", successfully updating the curve.
8. **`science-csv-data-import`**:
   - User toggles to "Science CSV Data".
   - Submits two-column experimental lab data (time vs displacement).
   - System analyzes points, updates domain/range, and enables audio scrubbing over empirical data.
9. **`ear-training-lab-quiz`**:
   - User switches to Tab 4 ("Acoustic Ear-Training Lab").
   - Plays mystery sound clip.
   - Selects a multiple-choice hypothesis.
   - Submits answer and receives instant audio cue, score update, and conceptual explanation.
   - Advances to next question.

### P2 (Polish & Convenience)
10. **`keyboard-shortcuts-modal`**:
    - User presses `?` or clicks "Keyboard Cheatsheet".
    - Accessible modal opens with list of keybindings.
    - Pressing `Escape` closes modal and restores focus.
11. **`mobile-responsiveness-390px`**:
    - 390px viewport renders without horizontal overflow.
    - Preset ribbon scrolls horizontally without breaking page grid.
    - Canvas and audio controls remain usable.
