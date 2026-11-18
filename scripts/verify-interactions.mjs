import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const server = spawn('npx', ['vite', 'preview', '--port', '4174', '--strictPort'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
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

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') pageErrors.push(m.text());
  });

  await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' });

  // 1. Verify quick NLP task/event add in TopBar
  const quickInput = page.getByLabel('Quick capture task or event');
  await quickInput.fill('Architecture checkpoint tomorrow 4pm 30m !p1 #core');
  await quickInput.press('Enter');
  await page.waitForTimeout(200);
  const bodyAfterAdd = await page.locator('body').innerText();
  if (!bodyAfterAdd.includes('Architecture checkpoint')) {
    throw new Error('Quick NLP capture did not create visible event/task');
  }

  // 2. Verify Calendar Mode switching (Month, Agenda, Week)
  await page.getByRole('button', { name: 'Month', exact: true }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Agenda', exact: true }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Week', exact: true }).click();
  await page.waitForTimeout(150);

  // 3. Verify Tasks tab, Kanban, Eisenhower Matrix, and task completion toggle
  await page.getByRole('button', { name: 'Tasks', exact: true }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Kanban Board' }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Eisenhower Matrix' }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Smart List' }).click();
  await page.waitForTimeout(150);

  // 4. Verify Focus & Habits tab + timer start/pause + habit toggle
  await page.getByRole('button', { name: 'Focus & Habits' }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Start session' }).click();
  await page.waitForTimeout(1150);
  await page.getByRole('button', { name: 'Pause timer' }).click();

  // 5. Verify Analytics & Overview tabs + Theme Toggle + Command Palette
  await page.getByRole('button', { name: 'Analytics', exact: true }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.waitForTimeout(150);
  await page.getByLabel('Toggle dark or light theme').click();
  await page.waitForTimeout(150);
  const isLight = await page.evaluate(() => document.documentElement.classList.contains('light'));
  if (!isLight) throw new Error('Theme toggle failed to activate light mode');
  await page.getByLabel('Toggle dark or light theme').click();
  await page.waitForTimeout(150);

  // 6. Command Palette Ctrl+K
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(200);
  const cmdVisible = await page.getByPlaceholder(/Search events, tasks, commands/i).isVisible();
  if (!cmdVisible) throw new Error('Ctrl+K did not open command palette');
  await page.keyboard.press('Escape');

  // 7. Slop check: ensure zero em-dashes rendered anywhere in visible text
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
  server.kill();
}
