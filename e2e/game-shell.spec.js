import { test, expect } from '@playwright/test';

test('game shell loads without uncaught JavaScript errors', async ({ page }, testInfo) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Piel de Cloro/i);
  await expect(page.locator('.terminal-chasis')).toBeVisible();

  const screenshot = testInfo.outputPath('initial-screen.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach('initial-screen', { path: screenshot, contentType: 'image/png' });
  await page.waitForTimeout(1200);
  expect(pageErrors, 'uncaught browser JavaScript errors').toEqual([]);
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
