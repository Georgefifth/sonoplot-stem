const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static server for dist/
function startServer(distDir, port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(distDir, 'index.html'); // SPA fallback
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error: ' + err.code);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve(server);
    });
  });
}

async function run() {
  const distDir = path.resolve(__dirname, '../dist');
  const port = 4173;
  const server = await startServer(distDir, port);
  console.log(`Local test server running at http://localhost:${port}`);

  const outputDir = path.resolve(__dirname, '../evidence/stage-2-build/frontend');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const consoleErrors = [];

  try {
    // 1. Desktop 1440px Tests & Screenshots
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const desktopPage = await desktopContext.newPage();

    desktopPage.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
        consoleErrors.push(msg.text());
      }
    });

    await desktopPage.goto(`http://localhost:${port}`);
    await desktopPage.waitForSelector('canvas');
    console.log('Main Explorer view loaded.');

    // Screenshot 1: Desktop Main Explorer
    await desktopPage.screenshot({
      path: path.join(outputDir, 'desktop-1440-explorer.png'),
      fullPage: false
    });
    console.log('Saved: desktop-1440-explorer.png');

    // Test Play sweep action
    const playBtn = desktopPage.locator('button:has-text("Play Audio Sweep")');
    await playBtn.click();
    await desktopPage.waitForTimeout(600);

    // Stop sweep
    const stopBtn = desktopPage.locator('button:has-text("Stop Sweep")');
    if (await stopBtn.isVisible()) {
      await stopBtn.click();
    }

    // Test Keyboard Scrubbing: press ArrowRight multiple times
    await desktopPage.keyboard.press('ArrowRight');
    await desktopPage.keyboard.press('ArrowRight');
    await desktopPage.keyboard.press('ArrowRight');
    await desktopPage.waitForTimeout(200);

    // Test Jump to Extrema (Key: M)
    await desktopPage.keyboard.press('m');
    await desktopPage.waitForTimeout(200);

    // Test Jump to Root (Key: R)
    await desktopPage.keyboard.press('r');
    await desktopPage.waitForTimeout(200);

    // Test Tab 2: Calculus Feature Report
    await desktopPage.click('button:has-text("Calculus Feature Report")');
    await desktopPage.waitForSelector('text=Critical Points & Stationary Coordinates');
    await desktopPage.screenshot({
      path: path.join(outputDir, 'desktop-1440-calculus-report.png'),
      fullPage: false
    });
    console.log('Saved: desktop-1440-calculus-report.png');

    // Test Tab 3: BANA Tactile Braille Grid
    await desktopPage.click('button:has-text("BANA Tactile Braille Grid")');
    await desktopPage.waitForSelector('pre');
    await desktopPage.screenshot({
      path: path.join(outputDir, 'desktop-1440-tactile-grid.png'),
      fullPage: false
    });
    console.log('Saved: desktop-1440-tactile-grid.png');

    // Test Tab 4: Acoustic Ear-Training Lab
    await desktopPage.click('button:has-text("Acoustic Ear-Training Lab")');
    await desktopPage.waitForSelector('text=Step 1: Listen to the Secret Curve');
    await desktopPage.screenshot({
      path: path.join(outputDir, 'desktop-1440-ear-training.png'),
      fullPage: false
    });
    console.log('Saved: desktop-1440-ear-training.png');

    // Switch back to Explorer to test Error State
    await desktopPage.click('button:has-text("Curve Sonifier & Explorer")');
    await desktopPage.waitForSelector('#formula-field');

    // Enter invalid formula to verify error state
    await desktopPage.fill('#formula-field', 'x^^3 +++');
    await desktopPage.click('button:has-text("Apply")');
    await desktopPage.waitForSelector('#formula-error');
    await desktopPage.screenshot({
      path: path.join(outputDir, 'desktop-1440-invalid-syntax.png'),
      fullPage: false
    });
    console.log('Saved: desktop-1440-invalid-syntax.png');

    // Reset formula to valid
    await desktopPage.fill('#formula-field', 'x^3 - 3*x');
    await desktopPage.click('button:has-text("Apply")');
    await desktopPage.waitForTimeout(200);

    // Test Keyboard Cheatsheet modal (Press ?)
    await desktopPage.keyboard.press('?');
    await desktopPage.waitForSelector('text=Accessible Keyboard Shortcuts');
    await desktopPage.screenshot({
      path: path.join(outputDir, 'desktop-1440-shortcuts-modal.png'),
      fullPage: false
    });
    console.log('Saved: desktop-1440-shortcuts-modal.png');
    await desktopPage.keyboard.press('Escape');
    await desktopPage.waitForTimeout(200);

    // 2. Mobile 390px Viewport Tests & Screenshots
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();

    mobilePage.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Mobile browser console error:', msg.text());
        consoleErrors.push(msg.text());
      }
    });

    await mobilePage.goto(`http://localhost:${port}`);
    await mobilePage.waitForSelector('canvas');
    await mobilePage.screenshot({
      path: path.join(outputDir, 'mobile-390-explorer.png'),
      fullPage: false
    });
    console.log('Saved: mobile-390-explorer.png');

    // Switch to Tactile Grid on Mobile
    await mobilePage.click('button:has-text("BANA Tactile Braille Grid")');
    await mobilePage.waitForSelector('pre');
    await mobilePage.screenshot({
      path: path.join(outputDir, 'mobile-390-tactile.png'),
      fullPage: false
    });
    console.log('Saved: mobile-390-tactile.png');

    console.log('\n=== ALL PLAYWRIGHT FRONTEND ACCEPTANCE TESTS PASSED ===');
    console.log(`Total console errors: ${consoleErrors.length}`);
  } finally {
    await browser.close();
    server.close();
  }

  if (consoleErrors.length > 0) {
    throw new Error(`Encountered ${consoleErrors.length} console errors during test.`);
  }
}

run().catch(err => {
  console.error('Playwright execution error:', err);
  process.exit(1);
});
