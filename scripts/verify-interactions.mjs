import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

const viteCli = path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
const server = spawn(process.execPath, [viteCli, 'preview', '--port', '4174', '--strictPort'], {
  cwd: process.cwd(),
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
  throw new Error('Preview server timeout');
}

let browser;
try {
  await waitForServer('http://localhost:4174');
  browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') pageErrors.push(m.text());
  });

  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' });

  // 1. Quick NLP capture in TopBar
  const quickInput = page.getByLabel('Quick capture task or event');
  await quickInput.fill('Architecture checkpoint tomorrow 4pm 30m !p1 #core');
  await quickInput.press('Enter');
  await page.waitForTimeout(200);
  const bodyAfterAdd = await page.locator('body').innerText();
  if (!bodyAfterAdd.includes('Architecture checkpoint')) {
    throw new Error('Quick NLP capture did not create visible event/task');
  }

  // 2. Availability Share toggle + exit + Calendar Mode switching
  await page.getByRole('button', { name: /Share times/i }).click();
  await page.waitForTimeout(150);
  await page.getByLabel('Exit availability mode').click();
  await page.waitForTimeout(150);

  await page.getByRole('radio', { name: 'Month', exact: true }).click();
  await page.waitForTimeout(150);
  await page.getByRole('radio', { name: 'Agenda', exact: true }).click();
  await page.waitForTimeout(150);
  await page.getByRole('radio', { name: 'Week', exact: true }).click();
  await page.waitForTimeout(150);

  // 3. Tasks tab: Kanban, Matrix, Smart List + SpringCheck completion toggle
  await page.getByRole('button', { name: 'Tasks', exact: true }).click();
  await page.waitForTimeout(180);
  await page.getByRole('radio', { name: 'Kanban Board' }).click();
  await page.waitForTimeout(180);
  await page.getByRole('radio', { name: 'Eisenhower Matrix' }).click();
  await page.waitForTimeout(180);
  await page.getByRole('radio', { name: 'Smart List' }).click();
  await page.waitForTimeout(180);
  await page.getByLabel(/Complete Finalize unified timeline grid/i).first().click();
  await page.waitForTimeout(150);

  // 4. Focus & Habits tab: Timer start/pause + RubberSegment interval + Focus Curtain + Habit toggle + Daily Journal task extraction
  await page.getByRole('button', { name: 'Focus & Habits' }).click();
  await page.waitForTimeout(180);
  await page.getByRole('radio', { name: '5m', exact: true }).click();
  await page.waitForTimeout(120);
  await page.getByRole('radio', { name: '25m', exact: true }).click();
  await page.waitForTimeout(120);
  await page.getByRole('button', { name: 'Start session' }).click();
  await page.waitForTimeout(1150);
  await page.getByRole('button', { name: 'Pause timer' }).click();

  await page.getByRole('button', { name: 'Distraction-free mode' }).click();
  await page.waitForTimeout(250);
  await page.getByLabel('Exit focus curtain').click();
  await page.waitForTimeout(150);

  await page.getByLabel(/2h Uninterrupted Deep Work on/i).first().click();
  await page.waitForTimeout(120);
  await page.getByRole('button', { name: 'Send to To-Do' }).first().click();
  await page.waitForTimeout(150);

  // 5. Analytics tab + .ics export download trigger
  await page.getByRole('button', { name: 'Analytics', exact: true }).click();
  await page.waitForTimeout(200);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export .ics' }).click(),
  ]);
  if (download.suggestedFilename() !== 'cadence-calendar.ics') {
    throw new Error(`Unexpected .ics filename: ${download.suggestedFilename()}`);
  }

  // 6. Overview tab: React Bits sections mounted + Theme toggle + Command Palette + Reduced Motion check
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.waitForTimeout(350);
  const overviewHtml = await page.locator('#overview-scroll').innerHTML();
  if (!overviewHtml.includes('magic-bento') || !overviewHtml.includes('card-swap') || !overviewHtml.includes('folder-stage')) {
    throw new Error('React Bits interactive modules missing from Overview DOM');
  }

  await page.getByLabel('Toggle dark or light theme').click();
  await page.waitForTimeout(150);
  const isLight = await page.evaluate(() => document.documentElement.classList.contains('light'));
  if (!isLight) throw new Error('Theme toggle failed to activate light mode');
  await page.getByLabel('Toggle dark or light theme').click();
  await page.waitForTimeout(150);

  await page.keyboard.press('Control+k');
  await page.waitForTimeout(200);
  const cmdVisible = await page.getByPlaceholder(/Search events, tasks, commands/i).isVisible();
  if (!cmdVisible) throw new Error('Ctrl+K did not open command palette');
  await page.keyboard.press('Escape');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(200);
  const h1VisibleReduced = await page.locator('h1').isVisible();
  if (!h1VisibleReduced) throw new Error('Overview H1 hidden under prefers-reduced-motion: reduce');

  // 7. Slop check: zero em-dashes in rendered UI + zero console/page errors
  const visibleText = await page.evaluate(() => document.body.innerText);
  if (visibleText.includes('\u2014')) {
    throw new Error('Found banned em-dash character in rendered UI');
  }

  if (pageErrors.length > 0) {
    throw new Error(`Console/page errors detected: ${pageErrors.join(' | ')}`);
  }

  console.log('ALL_INTERACTIONS_PASSED');
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
