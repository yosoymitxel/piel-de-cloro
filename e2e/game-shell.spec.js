import { test, expect } from '@playwright/test';

test('game shell loads without uncaught JavaScript errors', async ({ page }, testInfo) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Piel de Cloro/i);
  await expect(page.locator('.terminal-chasis')).toBeVisible();
  await expect(page.locator('#sidebar-left')).toBeHidden();

  const screenshot = testInfo.outputPath('initial-screen.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach('initial-screen', { path: screenshot, contentType: 'image/png' });
  await page.waitForTimeout(1200);
  expect(pageErrors, 'uncaught browser JavaScript errors').toEqual([]);
});

test('a player can enter the tutorial and begin the first day', async ({ page }, testInfo) => {
  test.setTimeout(45000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.game?.audio));
  // Keep this flow test focused on UI/state transitions; audio has separate unit coverage.
  await page.evaluate(() => {
    const audio = window.game.audio;
    audio.manifest = { e2e: {} };
    audio.unlock = () => {};
    audio.preloadAll = async () => {};
    audio.playSFXByKey = () => {};
    audio.playAmbientByKey = () => {};
  });
  await page.getByRole('button', { name: /INICIAR PARTIDA/i }).click();
  await expect(page.locator('#modal-tutorial')).toBeVisible({ timeout: 45000 });
  if (await page.evaluate(() => window.innerWidth <= 640)) {
    const headerLayout = await page.locator('#modal-tutorial .horror-panel-modal > header').evaluate(el => getComputedStyle(el).flexDirection);
    expect(headerLayout, 'tutorial header must stack on mobile').toBe('column');
  }

  const tutorialShot = testInfo.outputPath('tutorial-screen.png');
  await page.screenshot({ path: tutorialShot, fullPage: true });
  await testInfo.attach('tutorial-screen', { path: tutorialShot, contentType: 'image/png' });

  await page.getByRole('button', { name: /INICIAR OPERACIONES/i }).click();
  await expect(page.locator('#screen-game')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1500); // Let the initial typewriter line settle before capturing the screen.

  const gameplayShot = testInfo.outputPath('first-day-screen.png');
  await page.screenshot({ path: gameplayShot, fullPage: true });
  await testInfo.attach('first-day-screen', { path: gameplayShot, contentType: 'image/png' });
  expect(pageErrors, 'uncaught browser errors while starting a run').toEqual([]);
});

test('mobile layout does not create page-level horizontal overflow', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.terminal-chasis')).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    shellWidth: Math.round(document.querySelector('.terminal-chasis')?.getBoundingClientRect().width ?? 0)
  }));
  const screenshot = testInfo.outputPath('mobile-layout.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach('mobile-layout', { path: screenshot, contentType: 'image/png' });
  await testInfo.attach('mobile-layout-metrics', {
    body: Buffer.from(JSON.stringify(dimensions, null, 2)),
    contentType: 'application/json'
  });
  expect(dimensions.documentWidth, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
});
