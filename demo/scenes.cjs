"use strict";

module.exports = [
  {
    name: "cover",
    card: {
      image: "demo/assets/slide1_cover.png"
    },
    duration: 5.5,
    vo: "Welcome to SonoPlot STEM, an accessible auditory and tactile graph explorer built for blind and low-vision learners."
  },
  {
    name: "problem",
    card: {
      image: "demo/assets/slide2_problem.png"
    },
    duration: 7.5,
    vo: "In STEM classrooms, visual curves communicate instant intuition. But for blind students, screen readers only speak silent alt-text, creating an impassable barrier."
  },
  {
    name: "architecture",
    card: {
      image: "demo/assets/slide3_arch.png"
    },
    duration: 7.5,
    vo: "SonoPlot STEM bridges this divide through a client-side calculus engine that translates formulas and science sensor data into spatial sound sweeps and tactile Braille."
  },
  {
    name: "live-sweep",
    url: "https://accessed-hacks.vercel.app",
    session: "app",
    actions: [
      { type: "waitFor", sel: "canvas" },
      { type: "wait", ms: 800 },
      { type: "click", sel: 'button:has-text("Play Audio Sweep")' },
      { type: "wait", ms: 3800 },
      { type: "click", sel: 'button:has-text("Step Right")' },
      { type: "wait", ms: 400 },
      { type: "click", sel: 'button:has-text("Step Right")' },
      { type: "wait", ms: 600 }
    ],
    vo: "Clicking Play Audio Sweep launches a continuous frequency sweep. Pitch maps height while sound pans binaurally from left to right ear, followed by step-by-step coordinate scrubbing."
  },
  {
    name: "live-snapping",
    session: "app",
    actions: [
      { type: "click", sel: 'button:has-text("Next Extrema")' },
      { type: "wait", ms: 1600 },
      { type: "click", sel: 'button:has-text("Next Root")' },
      { type: "wait", ms: 1800 }
    ],
    vo: "Dedicated controls snap directly to mathematical peaks and zero roots, accompanied by chime earcons and live ARIA speech."
  },
  {
    name: "live-calculus",
    session: "app",
    actions: [
      { type: "click", sel: 'button:has-text("Calculus Feature Report")' },
      { type: "waitFor", sel: "text=Critical Points & Stationary Coordinates" },
      { type: "wait", ms: 2500 }
    ],
    vo: "The Calculus Report delivers an automated architectural breakdown: exact domain and range, real roots, and monotonicity intervals, enabling one-click point inspection."
  },
  {
    name: "live-tactile",
    session: "app",
    actions: [
      { type: "click", sel: 'button:has-text("BANA Tactile Braille Grid")' },
      { type: "waitFor", sel: "pre" },
      { type: "wait", ms: 1000 },
      { type: "click", sel: 'button:has-text("Unicode Braille Pins")' },
      { type: "wait", ms: 1500 },
      { type: "click", sel: 'button:has-text("Copy Grid")' },
      { type: "wait", ms: 1200 }
    ],
    vo: "For tactile exploration, SonoPlot emits BANA-standard ASCII and Unicode Braille matrices ready for instant printing on swell-touch thermal paper or refreshable Braille pin displays."
  },
  {
    name: "live-quiz",
    session: "app",
    actions: [
      { type: "click", sel: 'button:has-text("Acoustic Ear-Training Lab")' },
      { type: "waitFor", sel: "text=Step 1: Listen to the Secret Curve" },
      { type: "click", sel: 'button:has-text("Play Mystery Sound")' },
      { type: "wait", ms: 2000 },
      { type: "click", sel: '[role="radio"]' },
      { type: "click", sel: 'button:has-text("Check Answer")' },
      { type: "wait", ms: 2200 }
    ],
    vo: "The built-in Ear-Training Lab builds acoustic mental models, training students to identify physical trajectories, decaying harmonic oscillations, and chemical sigmoids by sound alone."
  },
  {
    name: "validation",
    card: {
      image: "demo/assets/slide4_benchmark.png"
    },
    duration: 8.0,
    vo: "In real-world testing, SonoPlot achieved verified accuracy across Stewart Calculus problems, NIST titration curves, and Vernier laboratory pendulum sensors with sub-millisecond execution latency."
  },
  {
    name: "conclusion",
    card: {
      image: "demo/assets/slide5_conclusion.png"
    },
    duration: 8.0,
    vo: "SonoPlot STEM is fully open-source, runs offline in any browser, and is live at accessed-hacks.vercel.app. Learning has no single doorway; let's open more of them together."
  }
];
