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
  await testInfo.attach('initial-screen-full-page', { path: screenshot, contentType: 'image/png' });
  const viewportScreenshot = testInfo.outputPath('initial-screen-viewport.png');
  await page.screenshot({ path: viewportScreenshot });
  await testInfo.attach('initial-screen-viewport', { path: viewportScreenshot, contentType: 'image/png' });
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
  await testInfo.attach('tutorial-screen-full-page', { path: tutorialShot, contentType: 'image/png' });
  const tutorialViewport = testInfo.outputPath('tutorial-screen-viewport.png');
  await page.screenshot({ path: tutorialViewport });
  await testInfo.attach('tutorial-screen-viewport', { path: tutorialViewport, contentType: 'image/png' });

  await page.getByRole('button', { name: /INICIAR OPERACIONES/i }).click();
  const interludeContinue = page.locator('#btn-lore-continue-screen');
  await expect(interludeContinue).toBeVisible({ timeout: 2500 }).catch(() => {});
  if (await interludeContinue.isVisible()) await interludeContinue.click();
  await expect(page.locator('#screen-game')).toBeVisible({ timeout: 15000 });

  const skipDialogue = page.getByRole('button', { name: /OMITIR POR DIÁLOGO/i });
  await expect(skipDialogue).toBeVisible();

  // The CRT power-on animation temporarily scales controls below their final
  // hit area. Measure only after that transition has settled on mobile.
  if (await page.evaluate(() => window.innerWidth <= 640)) {
    await page.waitForFunction(() => {
      const button = [...document.querySelectorAll('#screen-game .option-omit')]
        .find(el => getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0);
      return Boolean(button && button.getBoundingClientRect().height >= 44);
    }, null, { timeout: 12000 });
  }

  // Check pause only after the CRT entrance animation has reached final geometry.
  if (await page.evaluate(() => window.innerWidth > 640)) {
    const desktopPause = page.locator('#btn-pause');
    await expect(desktopPause).toBeVisible();
    const pauseStyle = await desktopPause.evaluate(el => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const area = document.querySelector('#main-area').getBoundingClientRect();
      return { position: style.position, bottom: parseFloat(style.bottom), right: parseFloat(style.right),
        rectInsideArea: rect.right <= area.right + 1 && rect.bottom <= area.bottom + 1 };
    });
    // Preserve the exact desktop CSS geometry from the pre-layout baseline.
    expect(pauseStyle.position).toBe('fixed');
    expect(pauseStyle.bottom).toBe(32);
    expect(pauseStyle.right).toBe(24);
    expect(pauseStyle.rectInsideArea).toBe(true);
  } else {
    await expect(page.locator('#btn-pause-mobile')).toBeVisible();
    await expect(page.locator('#btn-pause')).toBeHidden();
  }

  const pauseButton = page.locator(await page.evaluate(() => window.innerWidth <= 640 ? '#btn-pause-mobile' : '#btn-pause'));
  await page.waitForFunction(() => Boolean(window.game?.loopManager?.isRunning) && !window.game.loopManager.isPaused, null, { timeout: 12000 });
  await pauseButton.click();
  await expect(page.locator('#modal-pause')).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/paused/);
  expect(await page.evaluate(() => window.game.loopManager.isPaused)).toBe(true);
  await page.locator('#btn-pause-close').click();
  await expect(page.locator('#modal-pause')).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/paused/);
  expect(await page.evaluate(() => window.game.loopManager.isPaused)).toBe(false);

  const touchTarget = await skipDialogue.boundingBox();
  expect(touchTarget, 'dialogue skip action must remain visible').not.toBeNull();
  // Preserve the existing desktop design; enforce touch sizing on the dedicated mobile layout.
  if (await page.evaluate(() => window.innerWidth <= 640)) {
    expect(touchTarget?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(touchTarget?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  await page.waitForTimeout(1500); // Let the initial typewriter line settle before capturing the screen.

  const gameplayShot = testInfo.outputPath('first-day-screen.png');
  await page.screenshot({ path: gameplayShot, fullPage: true });
  await testInfo.attach('first-day-screen-full-page', { path: gameplayShot, contentType: 'image/png' });
  const gameplayViewport = testInfo.outputPath('first-day-screen-viewport.png');
  await page.screenshot({ path: gameplayViewport });
  await testInfo.attach('first-day-screen-viewport', { path: gameplayViewport, contentType: 'image/png' });
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
  await testInfo.attach('mobile-layout-full-page', { path: screenshot, contentType: 'image/png' });
  const viewportScreenshot = testInfo.outputPath('mobile-layout-viewport.png');
  await page.screenshot({ path: viewportScreenshot });
  await testInfo.attach('mobile-layout-viewport', { path: viewportScreenshot, contentType: 'image/png' });
  await testInfo.attach('mobile-layout-metrics', {
    body: Buffer.from(JSON.stringify(dimensions, null, 2)),
    contentType: 'application/json'
  });
  expect(dimensions.documentWidth, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
});
