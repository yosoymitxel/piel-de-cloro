import { test, expect } from '@playwright/test';

const liveUrl = process.env.LIVE_SITE_URL;

test.skip(!liveUrl, 'Set LIVE_SITE_URL to run against the deployed site');

test('deployed GitHub Pages site loads and reaches first-day gameplay on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(liveUrl, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Piel de Cloro/i);
  await expect(page.locator('.terminal-chasis')).toBeVisible();

  await page.waitForFunction(() => Boolean(window.game?.audio));
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
  await page.getByRole('button', { name: /INICIAR OPERACIONES/i }).click();

  const interludeContinue = page.locator('#btn-lore-continue-screen');
  await expect(interludeContinue).toBeVisible({ timeout: 2500 }).catch(() => {});
  if (await interludeContinue.isVisible()) await interludeContinue.click();

  await expect(page.locator('#screen-game')).toBeVisible({ timeout: 15000 });
  const portrait = page.locator('#npc-display .npc-pixel-portrait').first();
  await expect(portrait).toBeVisible({ timeout: 15000 });
  await expect.poll(() => portrait.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect(portrait.evaluate(img => img.complete)).resolves.toBe(true);
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/live-production-mobile.png', fullPage: false });

  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    hudVisible: getComputedStyle(document.querySelector('#screen-game')).display !== 'none'
  }));
  expect(metrics.document, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.hudVisible).toBe(true);
  expect(pageErrors, 'uncaught browser errors on the deployed site').toEqual([]);
});
