import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const roundArg = process.argv[2] || 'r01';
const rootDir = process.cwd();
const stillsDir = path.join(rootDir, 'cook', 'stills', roundArg);
const compareDir = path.join(rootDir, 'cook', 'compare', roundArg);
fs.mkdirSync(stillsDir, { recursive: true });
fs.mkdirSync(compareDir, { recursive: true });

const SHOTS = [
  { id: 'S01', ref: 'cook/refs/R01.png', query: '?shot=studio-dark', width: 1440, height: 900 },
  { id: 'S02', ref: 'cook/refs/R04.png', query: '?shot=tasks-dark', width: 1440, height: 900 },
  { id: 'S03', ref: 'cook/refs/R03.png', query: '?shot=focus-light', width: 1440, height: 900 },
  { id: 'S04', ref: 'cook/refs/R05.png', query: '?shot=analytics-dark', width: 1440, height: 900 },
  { id: 'S05', ref: 'cook/refs/R01.png', query: '?shot=overview-dark', width: 1440, height: 900 },
  { id: 'S06', ref: 'cook/refs/R03_mobile.png', query: '?shot=mobile-dark', width: 375, height: 812 },
];

const viteCli = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const server = spawn(process.execPath, [viteCli, 'preview', '--port', '4173', '--strictPort'], {
  cwd: rootDir,
  stdio: 'ignore',
});

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Preview server did not start in time');
}

let browser;
try {
  await waitForServer('http://localhost:4173');
  browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const metrics = [];
  for (const shot of SHOTS) {
    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const t0 = performance.now();
    await page.goto(`http://localhost:4173/${shot.query}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(450);
    const loadMs = Math.round(performance.now() - t0);

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    const outPath = path.join(stillsDir, `${shot.id}.png`);
    await page.screenshot({ path: outPath });
    metrics.push({ id: shot.id, width: shot.width, height: shot.height, loadMs, overflow, errors });
    await context.close();
  }

  console.log('RENDER_METRICS:', JSON.stringify(metrics, null, 2));

  // Build desktop side-by-side comparison using Cook's side-by-side.mjs
  const sbsScript = path.join(rootDir, '.agents', 'skills', 'cook', 'scripts', 'side-by-side.mjs');
  const desktopPairs = SHOTS.slice(0, 5).flatMap((s) => [
    path.join(rootDir, s.ref),
    path.join(stillsDir, `${s.id}.png`),
  ]);
  const sbsDesktop = spawnSync(
    'node',
    [sbsScript, '--out', path.join(compareDir, 'desktop.jpg'), '--height', '540', '--aspect', '16:10', ...desktopPairs],
    { encoding: 'utf8' }
  );
  console.log(sbsDesktop.stdout || sbsDesktop.stderr);

  // Mobile side-by-side
  const sbsMobile = spawnSync(
    'node',
    [
      sbsScript,
      '--out',
      path.join(compareDir, 'mobile.jpg'),
      '--height',
      '640',
      '--aspect',
      '375:812',
      path.join(rootDir, 'cook/refs/R03_mobile.png'),
      path.join(stillsDir, 'S06.png'),
    ],
    { encoding: 'utf8' }
  );
  console.log(sbsMobile.stdout || sbsMobile.stderr);

  // Color checks
  for (const s of SHOTS.slice(0, 5)) {
    const cc = spawnSync('python', [path.join(rootDir, 'cook/color_check.py'), path.join(rootDir, s.ref), path.join(stillsDir, `${s.id}.png`)], {
      encoding: 'utf8',
    });
    console.log(`COLOR_CHECK ${s.id} vs ${path.basename(s.ref)}: ${cc.stdout.trim()}`);
  }
} finally {
  if (browser) await browser.close();
  if (server.pid) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      server.kill('SIGKILL');
    }
  }
}
