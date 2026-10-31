# Stage 4 — Demo Video & Presentation Artifacts

**Project**: SonoPlot STEM  
**Video File**: `evidence/stage-4-demo/demo.mp4`  
**Video Specifications**:
- **Format**: MP4 (H.264 video, AAC audio)
- **Resolution**: 1920 × 1080 (1080p Full HD)
- **Frame Rate**: 30.0 fps
- **Duration**: 94.09 seconds (1 min 34 sec)
- **File Size**: 5.89 MB (6,175,634 bytes)
- **Audio Stream**: AAC stereo, 48000 Hz, with synchronized natural narration and burned-in accessible subtitles (ASS format).

---

## 1. Scene Composition & Narrative Arc

| # | Scene Name | Type | Duration | Visual Description & Action | Voiceover Narration |
|---|---|---|---|---|---|
| 1 | `cover` | Card (Slide 1) | 5.5s | Title, vision, and oscilloscope wave preview | "Welcome to SonoPlot STEM, an accessible auditory and tactile graph explorer built for blind and low-vision learners." |
| 2 | `problem` | Card (Slide 2) | 7.5s | Side-by-side Before/After comparison of classroom barrier | "In STEM classrooms, visual curves communicate instant intuition. But for blind students, screen readers only speak silent alt-text, creating an impassable barrier." |
| 3 | `architecture` | Card (Slide 3) | 7.5s | 4-stage pipeline: Parser → Calculus Engine → Web Audio → BANA Tactile | "SonoPlot STEM bridges this divide through a client-side calculus engine that translates formulas and science sensor data into spatial sound sweeps and tactile Braille." |
| 4 | `live-sweep` | Live Screen Capture | 12.2s | Clicks "Play Audio Sweep", cursor sweeps, steps right coordinate by coordinate | "Clicking Play Audio Sweep launches a continuous frequency sweep. Pitch maps height while sound pans binaurally from left to right ear, followed by step-by-step coordinate scrubbing." |
| 5 | `live-snapping` | Live Screen Capture | 8.9s | Clicks "Next Extrema", snaps to peak at (1.97, 8.00), snaps to root | "Dedicated controls snap directly to mathematical peaks and zero roots, accompanied by chime earcons and live ARIA speech." |
| 6 | `live-calculus` | Live Screen Capture | 11.8s | Tab 2: Full calculus architectural report table and monotonicity intervals | "The Calculus Report delivers an automated architectural breakdown: exact domain and range, real roots, and monotonicity intervals, enabling one-click point inspection." |
| 7 | `live-tactile` | Live Screen Capture | 11.8s | Tab 3: BANA tactile ASCII grid, toggles Unicode Braille pins, clicks Copy Grid | "For tactile exploration, SonoPlot emits BANA-standard ASCII and Unicode Braille matrices ready for instant printing on swell-touch thermal paper or refreshable Braille pin displays." |
| 8 | `live-quiz` | Live Screen Capture | 12.0s | Tab 4: Plays mystery sound clip, selects parabolic trajectory, checks answer | "The built-in Ear-Training Lab builds acoustic mental models, training students to identify physical trajectories, decaying harmonic oscillations, and chemical sigmoids by sound alone." |
| 9 | `validation` | Card (Slide 4) | 13.4s | Benchmark verification table with Stewart Calculus, NIST, and Vernier sensors | "In real-world testing, SonoPlot achieved verified accuracy across Stewart Calculus problems, NIST titration curves, and Vernier laboratory pendulum sensors with sub-millisecond execution latency." |
| 10 | `conclusion` | Card (Slide 5) | 13.2s | Three pillars: Multi-Sensory Agency, Real Science Ingestion, Zero-Cost Global Equity | "SonoPlot STEM is fully open-source, runs offline in any browser, and is live at accessed-hacks.vercel.app. Learning has no single doorway; let's open more of them together." |

---

## 2. Frame-Check Visual QA Verification

Extracted frame timestamps at `2s`, `8s`, `20s`, `35s`, `55s`, `75s`, `88s`:
- `evidence/stage-4-demo/qa/frame-2.png`: Title and preview card. Captions positioned with zero text overlap.
- `evidence/stage-4-demo/qa/frame-8.png`: Comparison boxes with distinct red (fail) and emerald (success) semantic styling.
- `evidence/stage-4-demo/qa/frame-20.png`: 4-stage pipeline diagram with crisp labels and technical badges.
- `evidence/stage-4-demo/qa/frame-35.png`: Live software canvas during continuous sweep, showing active coordinates, frequency in Hz, and instantaneous slope.
- `evidence/stage-4-demo/qa/frame-55.png`: Live calculus report showing turning points, stationary coordinates, and monotonic intervals.
- `evidence/stage-4-demo/qa/frame-75.png`: Live acoustic quiz testing student mental models with instant feedback.
- `evidence/stage-4-demo/qa/frame-88.png`: Real-world benchmark evidence table with verified ground truth indicators.

All frames verified for contrast, typography, and absence of caption collision.
