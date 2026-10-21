import { test, expect } from '@playwright/test';

test('start screen renders and exposes the primary action', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Piel de Cloro/i);
  await expect(page.getByRole('heading', { name: /PIEL DE CLORO/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /INICIAR PARTIDA/i })).toBeVisible();

  // Keep runtime errors visible instead of treating a painted but broken page as healthy.
  expect(pageErrors).toEqual([]);
});

test('start screen remains usable at a narrow mobile viewport', async ({ page }) => {
  await page.goto('/');
  const startButton = page.getByRole('button', { name: /INICIAR PARTIDA/i });
  await expect(startButton).toBeVisible();

  const metrics = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    buttonRight: document.querySelector('#btn-start-game')?.getBoundingClientRect().right ?? Infinity
  }));

  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.buttonRight).toBeLessThanOrEqual(metrics.viewportWidth + 1);
});
