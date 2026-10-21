import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test('avatar lab renders code-generated skins and editable hairstyle variants', async ({ page }, testInfo) => {
  mkdirSync('test-results', { recursive: true });
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.goto('/avatar-lab.html', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Laboratorio de avatares/i);
  await expect(page.getByRole('heading', { name: /Laboratorio de identidades/i })).toBeVisible();

  const portrait = page.locator('#current-portrait');
  await expect(portrait).toBeVisible();
  await expect.poll(() => portrait.evaluate(img => img.naturalWidth)).toBe(256);
  await expect(page.locator('#hair-gallery .hair-card')).toHaveCount(10);
  await expect(page.locator('#face-gallery .hair-card')).toHaveCount(7);
  await expect(page.locator('#svg-source')).toContainText('<svg');
  await expect(page.locator('#pxl-source')).toContainText('sprite(\"npc_human\"');

  const capture = async (name, fullPage = false) => {
    const path = `test-results/avatar-lab-${testInfo.project.name}-${name}.png`;
    await page.screenshot({ path, fullPage });
    await testInfo.attach(`avatar-lab-${name}`, { path, contentType: 'image/png' });
  };
  await capture('default');
  await capture('full-page', true);

  const before = await portrait.getAttribute('src');
  await page.getByRole('button', { name: /Elegir peinado Coleta/i }).click();
  await expect(portrait).toHaveAttribute('data-hair-style', 'ponytail');
  await expect(page.locator('#hair')).toHaveValue('ponytail');
  await expect(page.locator('#svg-source')).toContainText('x="26" y="19" width="4" height="7"');
  await capture('ponytail');

  await page.locator('#hair-gallery-title').scrollIntoViewIfNeeded();
  await capture('hair-variants');
  await page.locator('#face-gallery-title').scrollIntoViewIfNeeded();
  await capture('face-variants');
  expect(await portrait.getAttribute('src')).not.toBe(before);

  await page.locator('#face-shape').selectOption('angular');
  await expect(portrait).toHaveAttribute('data-face-shape', 'angular');
  await expect(page.locator('#face-gallery .hair-card[aria-pressed="true"]')).toHaveAttribute('data-face-shape', 'angular');

  await page.locator('#palette').selectOption('3');
  await expect(page.locator('#palette-swatches button[aria-pressed="true"]')).toHaveAttribute('data-palette', '3');
  await page.locator('#palette-skin').uncheck();
  await page.locator('#skin-color').fill('#6a3f2e');
  await expect(page.locator('#svg-source')).toContainText('fill="#6a3f2e"');
  await page.locator('#seed').fill('npc-stable-identifier-27');
  await expect(portrait).toHaveAttribute('data-npc-id', 'npc-stable-identifier-27');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(portrait).toBeVisible();
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth
  }));
  expect(widths.page, JSON.stringify(widths)).toBeLessThanOrEqual(widths.viewport + 1);
  await capture('mobile-full-page', true);
});

test('ClaudePXL authoring source is visible in the repository lab without binary assets', async ({ page }) => {
  await page.goto('/avatar-lab.html', { waitUntil: 'domcontentloaded' });
  const source = page.locator('#pxl-source');
  await expect(source).toContainText('sprite("npc_human"');
  await expect(source).toContainText('sprite("npc_archivist"');
  await expect(page.locator('#pxl-gallery img')).toHaveCount(0);
});
