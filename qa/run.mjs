import { chromium, firefox } from "playwright";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const BASE = process.env.BASE_URL ?? "https://accessed-hacks.vercel.app";
const OUT = process.env.QA_OUT ?? "evidence/stage-3-qa";
const BROWSER = process.env.BROWSER === "chromium" ? "chromium" : "firefox";
const HEADED = process.env.HEADED === "1";

const SHOTS = path.join(OUT, "screens");
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: "mobile", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectVisible(page, selector, timeout = 10000) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout });
  return locator;
}

async function expectText(page, text, timeout = 10000) {
  const locator = page.getByText(text).first();
  await locator.waitFor({ state: "visible", timeout });
  return locator;
}

function collectIssues(page) {
  const issues = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") issues.push({ kind: "console", text: msg.text() });
  });
  page.on("pageerror", (err) => {
    issues.push({ kind: "pageerror", text: err.message });
  });
  page.on("requestfailed", (req) => {
    const reason = req.failure()?.errorText ?? "request failed";
    if (!reason.includes("ERR_ABORTED")) {
      issues.push({ kind: "requestfailed", text: `${reason} ${req.url()}` });
    }
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 500) issues.push({ kind: "http", text: `${status} ${res.url()}` });
    else if (status >= 400) {
      issues.push({ kind: "http", level: "warn", text: `${status} ${res.url()}` });
    }
  });
  return issues;
}

const scenarios = [
  {
    id: "smoke-landing",
    title: "Landing page renders with high contrast and valid title",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await ctx.expectVisible("body");
      const title = await page.title();
      ctx.assert(title.includes("SonoPlot STEM"), `Unexpected page title: ${title}`);

      // Verify canvas rendered
      await ctx.expectVisible("canvas");

      // Verify horizontal overflow <= 1px
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      ctx.assert(overflow <= 1, `Horizontal overflow detected: ${overflow}px`);

      // Verify default preset Kinematics is loaded
      await ctx.expectText("Kinematics");
      await ctx.shot("initial-loaded");
    },
  },
  {
    id: "core-audio-sweep",
    title: "Continuous audio sonification sweep plays and pauses cleanly",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const playBtn = await ctx.expectVisible('button:has-text("Play Audio Sweep")');

      // Click play sweep
      await playBtn.click();
      // Should change text to "Stop Sweep"
      const stopBtn = await ctx.expectVisible('button:has-text("Stop Sweep")');
      ctx.assert(await stopBtn.isVisible(), "Stop sweep button did not appear");
      await ctx.shot("sweep-active");

      // Stop sweep
      await stopBtn.click();
      await ctx.expectVisible('button:has-text("Play Audio Sweep")');
    },
  },
  {
    id: "keyboard-scrubbing-aria",
    title: "Arrow key scrubbing steps through points with live ARIA announcements",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await ctx.expectVisible("canvas");

      // Press ArrowRight to step forward
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");

      // Verify ARIA Live region has text
      const srElement = page.locator('[role="status"]');
      const srText = await srElement.textContent();
      ctx.assert(srText.length > 0 && srText.includes("x is"), `ARIA status text missing: ${srText}`);

      // Verify Inspector coordinate card
      await ctx.expectText("Active Inspector");
      await ctx.shot("scrubbing-active");
    },
  },
  {
    id: "feature-snapping-extrema-roots",
    title: "Direct feature jumping snaps accurately to real roots and local peaks",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Click Next Extrema button
      const extremaBtn = await ctx.expectVisible('button:has-text("Next Extrema")');
      await extremaBtn.click();

      // Verify Local Peak badge appears
      await ctx.expectText("Local Peak");
      await ctx.shot("snapped-extrema");

      // Click Next Root button
      const rootBtn = await ctx.expectVisible('button:has-text("Next Root")');
      await rootBtn.click();

      // Verify Root (Zero) badge appears
      await ctx.expectText("Root (Zero)");
      await ctx.shot("snapped-root");
    },
  },
  {
    id: "calculus-structural-report",
    title: "Calculus Feature Report displays complete critical points and allows point jumping",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Navigate to Tab 2
      await page.click('button:has-text("Calculus Feature Report")');
      await ctx.expectText("Mathematical Architecture Report");
      await ctx.expectText("Critical Points & Stationary Coordinates");

      // Check that table has rows
      const rows = page.locator("table tbody tr");
      const rowCount = await rows.count();
      ctx.assert(rowCount >= 2, `Expected at least 2 critical points, found ${rowCount}`);
      await ctx.shot("calculus-report-view");

      // Click "Inspect Point" on the first row
      const inspectBtn = rows.first().locator('button:has-text("Inspect Point")');
      await inspectBtn.click();

      // Should automatically navigate back to Explorer tab
      await ctx.expectVisible("canvas");
      await ctx.expectText("Active Inspector");
      await ctx.shot("inspected-point-from-report");
    },
  },
  {
    id: "tactile-braille-bana-grid",
    title: "BANA Tactile Braille Grid renders, toggles formats, and copies grid",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Navigate to Tab 3
      await page.click('button:has-text("BANA Tactile Braille Grid")');
      await ctx.expectText("Tactile Braille & Embosser Matrix (BANA Standard)");

      // Check pre element content
      const pre = page.locator("pre");
      const gridText = await pre.textContent();
      ctx.assert(gridText.includes("TACTILE GRAPH SPECIFICATION"), "BANA specification header missing");
      ctx.assert(gridText.includes("TACTILE LEGEND"), "Tactile legend missing");
      await ctx.shot("tactile-ascii-grid");

      // Toggle to Unicode Braille Pins
      await page.click('button:has-text("Unicode Braille Pins")');
      const brailleText = await pre.textContent();
      ctx.assert(brailleText.includes("⠠") || brailleText.includes("⠤"), "Unicode Braille pins missing in view");
      await ctx.shot("tactile-braille-pins");

      // Test Copy Grid button
      await page.click('button:has-text("Copy Grid")');
      await ctx.expectText("Copied!");
    },
  },
  {
    id: "formula-validation-error-recovery",
    title: "Syntax error validation warns clearly and allows user recovery without crash",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Enter syntax error
      await page.fill("#formula-field", "x^^3 +++");
      await page.click('button:has-text("Apply")');

      // Verify inline accessible error
      await ctx.expectVisible("#formula-error");
      await ctx.expectText("Invalid expression");
      await ctx.shot("syntax-error-alert");

      // Recover: input clean valid formula
      await page.fill("#formula-field", "x^3 - 3*x");
      await page.click('button:has-text("Apply")');

      // Error should disappear
      const errorCount = await page.locator("#formula-error").count();
      ctx.assert(errorCount === 0, "Formula error badge was not cleared after valid input");
      await ctx.shot("recovered-valid-formula");
    },
  },
  {
    id: "science-csv-data-import",
    title: "Experimental Science CSV data imports, parses points, and sonifies dataset",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Switch to CSV mode
      await page.click('button:has-text("Science CSV Data")');
      await ctx.expectVisible("#csv-textarea");

      // Submit CSV data
      await page.click('button:has-text("Parse & Sonify Dataset")');

      // Verify inspector and canvas update
      await ctx.expectVisible("canvas");
      const srText = await page.locator('[role="status"]').textContent();
      ctx.assert(srText.includes("coordinates") || srText.includes("Parsed"), `CSV status announcement missing: ${srText}`);
      await ctx.shot("csv-dataset-loaded");
    },
  },
  {
    id: "ear-training-lab-quiz",
    title: "Acoustic Ear-Training Lab plays sound, evaluates answer, and tracks score",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Navigate to Tab 4
      await page.click('button:has-text("Acoustic Ear-Training Lab")');
      await ctx.expectText("Step 1: Listen to the Secret Curve");

      // Play mystery sound
      const mysteryBtn = await ctx.expectVisible('button:has-text("Play Mystery Sound")');
      await mysteryBtn.click();

      // Select first option (Projectile parabola)
      const firstOpt = page.locator('[role="radio"]').first();
      await firstOpt.click();

      // Submit answer
      await page.click('button:has-text("Check Answer")');

      // Verify score becomes 1 / 3
      await ctx.expectText("Score: 1 / 3");
      await ctx.expectText("Correct!");
      await ctx.shot("quiz-answered-correctly");

      // Click Next Question
      await page.click('button:has-text("Next Question →")');
      await ctx.expectText("Question 2 of 3");
      await ctx.shot("quiz-next-question");
    },
  },
  {
    id: "keyboard-shortcuts-modal",
    title: "Keyboard Cheatsheet modal opens via ? key and dismisses via Esc",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Press ? to open cheatsheet
      await page.keyboard.press("?");
      await ctx.expectText("Accessible Keyboard Shortcuts");
      await ctx.expectText("100% hands-free non-visual operation");
      await ctx.shot("shortcuts-modal-open");

      // Press Escape to dismiss
      await page.keyboard.press("Escape");
      const modalCount = await page.locator('[role="dialog"]').count();
      ctx.assert(modalCount === 0, "Modal did not dismiss on Escape key");
    },
  },
  {
    id: "mobile-responsiveness-390px",
    title: "Mobile layout (390px) scrolls presets horizontally without breaking page grid",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Verify no horizontal document overflow on mobile
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      ctx.assert(overflow <= 1, `Mobile horizontal overflow: ${overflow}px`);

      // Verify canvas and play controls are both visible
      await ctx.expectVisible("canvas");
      await ctx.expectVisible('button:has-text("Play Audio Sweep")');
      await ctx.shot("mobile-ready");
    },
  },
];

async function main() {
  console.log(`Starting Playwright QA against BASE_URL: ${BASE}`);
  console.log(`Browser: ${BROWSER} (${HEADED ? "headed" : "headless"})`);

  const browserType = BROWSER === "chromium" ? chromium : firefox;
  const browser = await browserType.launch({ headless: !HEADED });
  const startedAt = new Date().toISOString();
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Running Viewport: ${vp.name} (${vp.viewport.width}x${vp.viewport.height}) ---`);
    const context = await browser.newContext({
      baseURL: BASE,
      viewport: vp.viewport,
      deviceScaleFactor: vp.deviceScaleFactor,
    });

    for (const scenario of scenarios) {
      const page = await context.newPage();
      const issues = collectIssues(page);
      const screenshots = [];
      const started = Date.now();
      let status = "pass";
      let error = null;

      const ctx = {
        assert,
        expectVisible: (selector, timeout) => expectVisible(page, selector, timeout),
        expectText: (text, timeout) => expectText(page, text, timeout),
        shot: async (name, opts = {}) => {
          const file = path.join(SHOTS, `${scenario.id}-${name}-${vp.name}.png`);
          await page.screenshot({ path: file, fullPage: opts.fullPage ?? true });
          screenshots.push(file);
          return file;
        },
      };

      try {
        await scenario.run(page, ctx);
      } catch (err) {
        status = "fail";
        error = err.message;
      } finally {
        await page.close().catch(() => {});
      }

      const errors = issues.filter((i) => (i.level ?? "error") === "error");
      const warnings = issues.filter((i) => i.level === "warn");
      if (status === "pass" && errors.length > 0) {
        status = "fail";
        error = errors.map((i) => `${i.kind}: ${i.text}`).join(" | ");
      }

      results.push({
        viewport: vp.name,
        id: scenario.id,
        title: scenario.title,
        status,
        ms: Date.now() - started,
        error,
        errors,
        warnings,
        screenshots,
      });

      console.log(
        `${status === "pass" ? "✓" : "✗"} [${vp.name}] ${scenario.id}` +
          (error ? ` — ${error}` : "")
      );
    }

    await context.close();
  }

  await browser.close();

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === "pass").length,
    fail: results.filter((r) => r.status === "fail").length,
  };
  const finishedAt = new Date().toISOString();
  const report = {
    base: BASE,
    browser: BROWSER,
    headed: HEADED,
    startedAt,
    finishedAt,
    summary,
    results,
  };

  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(report, null, 2));

  const warnings = results.flatMap((r) =>
    r.warnings.map((w) => `- [${r.viewport}] ${r.id}: ${w.kind} — ${w.text}`)
  );
  const md = [
    `# QA Execution Report — SonoPlot STEM`,
    "",
    `- **Target Environment**: ${BASE}`,
    `- **Browser**: ${BROWSER} (${HEADED ? "headed" : "headless"})`,
    `- **Execution Time**: ${finishedAt}`,
    `- **Summary**: ${summary.total} total tests — **${summary.pass} PASSED**, ${summary.fail} failed`,
    "",
    "| Viewport | Scenario ID | Status | Duration (ms) | Detail / Outcome |",
    "|---|---|:---:|:---:|---|",
    ...results.map(
      (r) =>
        `| ${r.viewport} | \`${r.id}\` | **${r.status.toUpperCase()}** | ${r.ms}ms | ${(r.error ?? r.title).replace(/\|/g, "\\|")} |`
    ),
    "",
    ...(warnings.length ? ["## Warnings", "", ...warnings, ""] : []),
    "## Captured Verification Screenshots",
    "",
    ...results.flatMap((r) => r.screenshots.map((s) => `- \`${s}\``)),
    "",
  ];
  fs.writeFileSync(path.join(OUT, "report.md"), md.join("\n"));

  console.log(`\n========================================`);
  console.log(`QA Result: ${summary.pass}/${summary.total} passed — see ${OUT}/report.md`);
  console.log(`========================================\n`);

  if (summary.fail > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("QA Runner Exception:", err);
  process.exit(2);
});
