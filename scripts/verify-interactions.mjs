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

  // 1. Opens straight to Overview with zero static Nov 2026 demo template
  const initialBody = await page.locator('body').innerText();
  if (!initialBody.includes('Calendar, tasks, and focus.') || !initialBody.includes('Open Live Studio')) {
    throw new Error('App did not open straight onto Overview landing page');
  }
  if (initialBody.includes('Sprint 42 Release Week') || initialBody.includes('Board Metrics Deck')) {
    throw new Error('Found leftover static template copy on Overview');
  }

  // 2. Verify Google Sign-In UI + Client ID validation, then Create real local Account (IndexedDB + localStorage Vault)
  await page.getByRole('button', { name: 'Create Free Account' }).click();
  await page.waitForTimeout(200);

  await page.getByRole('button', { name: /Continue with Google/i }).click();
  await page.waitForTimeout(150);
  const googlePanelText = await page.locator('[role="dialog"]').innerText();
  if (!googlePanelText.includes('https://nuruddin7hub.github.io')) {
    throw new Error('Google OAuth setup panel missing authorized JavaScript origin guidance');
  }
  await page.getByLabel('Google OAuth Client ID').fill('not-a-valid-id');
  await page.getByRole('button', { name: 'Enable Google' }).click();
  await page.waitForTimeout(100);
  if (!(await page.locator('[role="alert"]').innerText()).includes('apps.googleusercontent.com')) {
    throw new Error('Invalid Google Client ID did not trigger validation alert');
  }
  // Dismiss Google setup back cleanly so modal stays crisp
  await page.getByRole('button', { name: /Continue with Google/i }).click();
  await page.waitForTimeout(100);

  await page.getByPlaceholder('Alex Rivera').fill('Nadia Chen');
  await page.getByPlaceholder('you@domain.com').fill('nadia@studio.dev');
  const pwInputs = page.getByPlaceholder('••••••');
  await pwInputs.nth(0).fill('cadence99');
  await pwInputs.nth(1).fill('cadence99');
  await page.getByRole('button', { name: 'Create Local Vault Account' }).click();
  await page.waitForTimeout(250);

  const overviewAfterSignup = await page.locator('body').innerText();
  if (!overviewAfterSignup.includes('Nadia Chen')) {
    throw new Error('Account badge did not update with signed-in user Nadia Chen');
  }

  // 3. Enter Studio from Overview & verify clean blank state + optional checklist / NLP capture
  await page.getByRole('button', { name: 'Open Live Studio', exact: true }).click();
  await page.waitForTimeout(250);

  const quickInput = page.getByLabel('Quick capture task or event');
  await quickInput.fill('Architecture checkpoint today 4pm 45m !p1 #core');
  await quickInput.press('Enter');
  await page.waitForTimeout(220);
  const bodyAfterAdd = await page.locator('body').innerText();
  if (!bodyAfterAdd.includes('Architecture checkpoint')) {
    throw new Error('Quick NLP capture did not create visible event/task');
  }

  // 4. Reload browser and verify active account & IndexedDB workspace persisted cleanly!
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  // Reload lands on Overview straight away with Nadia Chen signed in and 1 block synced
  const afterReloadOverview = await page.locator('body').innerText();
  if (!afterReloadOverview.includes('Nadia Chen') || !afterReloadOverview.includes('Architecture checkpoint')) {
    throw new Error('Account session or IndexedDB workspace state lost across reload');
  }

  // Open Studio again for deep feature verification
  await page.getByRole('button', { name: 'Open Live Studio', exact: true }).click();
  await page.waitForTimeout(220);

  // Availability Share toggle + exit + Calendar Mode switching
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

  // 5. Tasks tab: Kanban, Matrix, Smart List + task completion toggle
  await page.getByRole('button', { name: 'Tasks', exact: true }).click();
  await page.waitForTimeout(180);
  await page.getByRole('radio', { name: 'Kanban Board' }).click();
  await page.waitForTimeout(180);
  await page.getByRole('radio', { name: 'Eisenhower Matrix' }).click();
  await page.waitForTimeout(180);
  await page.getByRole('radio', { name: 'Smart List' }).click();
  await page.waitForTimeout(180);
  await page.getByLabel(/Complete Architecture checkpoint/i).first().click();
  await page.waitForTimeout(150);

  // 6. Focus & Habits tab: create a habit cleanly on blank state + journal line extraction + timer
  await page.getByRole('button', { name: 'Focus & Habits' }).click();
  await page.waitForTimeout(180);
  await page.getByPlaceholder('New habit...').fill('Deep Work Sprint');
  await page.getByLabel('Add habit').click();
  await page.waitForTimeout(150);
  await page.getByLabel(/Deep Work Sprint on/i).last().click();
  await page.waitForTimeout(120);

  await page.getByPlaceholder(/Write a reflection/i).fill('Prepare weekly summary');
  await page.getByRole('button', { name: 'Add note' }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Send to To-Do' }).first().click();
  await page.waitForTimeout(150);

  await page.getByRole('radio', { name: '5m', exact: true }).click();
  await page.waitForTimeout(100);
  await page.getByRole('radio', { name: '25m', exact: true }).click();
  await page.waitForTimeout(100);
  await page.getByRole('button', { name: 'Start session' }).click();
  await page.waitForTimeout(1150);
  await page.getByRole('button', { name: 'Pause timer' }).click();

  await page.getByRole('button', { name: 'Distraction-free mode' }).click();
  await page.waitForTimeout(220);
  await page.getByLabel('Exit focus curtain').click();
  await page.waitForTimeout(150);

  // 7. Analytics tab + .ics export + Account Sign Out / Sign In isolation check
  await page.getByRole('button', { name: 'Analytics', exact: true }).click();
  await page.waitForTimeout(200);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export .ics' }).click(),
  ]);
  if (download.suggestedFilename() !== 'cadence-calendar.ics') {
    throw new Error(`Unexpected .ics filename: ${download.suggestedFilename()}`);
  }

  await page.getByRole('button', { name: /Account: Nadia Chen/i }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Sign Out to Guest/i }).click();
  await page.waitForTimeout(250);
  await page.getByLabel('Close account dialog').click();
  await page.waitForTimeout(150);

  const guestAnalytics = await page.locator('body').innerText();
  if (guestAnalytics.includes('Nadia Chen')) {
    throw new Error('Sign out did not isolate account back to Guest');
  }

  // Sign back in cleanly
  await page.getByRole('button', { name: /Account & Vault/i }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: 'Nadia Chen' }).click();
  await page.getByPlaceholder('••••••').fill('cadence99');
  await page.getByRole('button', { name: 'Sign In & Load Vault' }).click();
  await page.waitForTimeout(250);
  if (!(await page.locator('body').innerText()).includes('Nadia Chen')) {
    throw new Error('Sign back in failed');
  }

  // 8. Overview tab, React Bits modules, Theme toggle, Ctrl+K & Reduced Motion
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.waitForTimeout(350);
  const overviewHtml = await page.locator('#overview-scroll').innerHTML();
  if (!overviewHtml.includes('magic-bento') || !overviewHtml.includes('card-swap') || !overviewHtml.includes('folder-stage')) {
    throw new Error('React Bits interactive modules missing from Overview DOM');
  }

  await page.getByLabel('Toggle dark or light theme').click();
  await page.waitForTimeout(150);
  if (!(await page.evaluate(() => document.documentElement.classList.contains('light')))) {
    throw new Error('Theme toggle failed to activate light mode');
  }
  await page.getByLabel('Toggle dark or light theme').click();
  await page.waitForTimeout(150);

  await page.keyboard.press('Control+k');
  await page.waitForTimeout(200);
  if (!(await page.getByPlaceholder(/Search events, tasks, commands/i).isVisible())) {
    throw new Error('Ctrl+K did not open command palette');
  }
  await page.keyboard.press('Escape');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(200);
  if (!(await page.locator('h1').isVisible())) {
    throw new Error('Overview H1 hidden under prefers-reduced-motion: reduce');
  }

  const visibleText = await page.evaluate(() => document.body.innerText);
  if (visibleText.includes('\u2014')) {
    throw new Error('Found banned em-dash character in rendered UI');
  }

  // 9. Mobile 375x812 responsive check: opens Overview cleanly, starter checklist, touch drag & zero overflow
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
  const mPage = await mobileCtx.newPage();
  mPage.on('pageerror', (e) => pageErrors.push(e.message));
  mPage.on('console', (m) => {
    if (m.type() === 'error') pageErrors.push(m.text());
  });
  await mPage.goto('http://localhost:4174/', { waitUntil: 'networkidle' });
  await mPage.waitForTimeout(250);

  await mPage.getByRole('button', { name: 'Import starter checklist' }).click();
  await mPage.waitForTimeout(200);

  await mPage.getByRole('button', { name: 'Calendar', exact: true }).click();
  await mPage.waitForTimeout(250);

  const grip = mPage.locator('[title="Drag to move"]').first();
  await grip.scrollIntoViewIfNeeded();
  await mPage.waitForTimeout(100);
  const gripBox = await grip.boundingBox();
  if (!gripBox) throw new Error('Mobile touch drag grip missing on Calendar block');
  await mPage.mouse.move(gripBox.x + gripBox.width / 2, gripBox.y + gripBox.height / 2);
  await mPage.mouse.down();
  await mPage.mouse.move(gripBox.x + gripBox.width / 2, gripBox.y + gripBox.height / 2 - 56, { steps: 6 });
  await mPage.mouse.up();
  await mPage.waitForTimeout(200);
  if (!(await mPage.locator('body').innerText()).includes('Block rescheduled')) {
    throw new Error('Touch/pointer drag on Calendar block did not reschedule');
  }

  await mPage.locator('text=Plan top 3 priorities').first().click();
  await mPage.waitForTimeout(200);
  if (!(await mPage.getByLabel('Close inspector').isVisible())) {
    throw new Error('Tapping event on mobile did not open MobileInspectorSheet');
  }
  await mPage.getByLabel('Close inspector').click();

  await mPage.getByRole('button', { name: /Account: Nadia Chen|Account & Vault/i }).click();
  await mPage.waitForTimeout(200);
  const modalOverflow = await mPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (modalOverflow) throw new Error('Account modal overflowed at 375px mobile width');
  await mPage.getByLabel('Close account dialog').click();

  for (const mobileTab of ['Calendar', 'Tasks', 'Focus', 'Stats', 'Suite']) {
    await mPage.getByRole('button', { name: mobileTab, exact: true }).click();
    await mPage.waitForTimeout(220);
    const overflows = await mPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (overflows) throw new Error(`Horizontal overflow detected at 375px on ${mobileTab}`);
  }
  await mobileCtx.close();

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
