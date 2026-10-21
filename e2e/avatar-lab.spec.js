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
  await expect(page.locator('#svg-source')).toContainText('<svg');
  await expect(page.locator('#pxl-source')).toContainText('sprite("npc_human"');

  // Capture the rendered UI before further changes. These PNGs are uploaded
  // with CI so the visual result, not only assertions, can be inspected.
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
  await expect(page.locator('#svg-source')).toContainText('width="3" height="7"');
  expect(await portrait.getAttribute('src')).not.toBe(before);
  await capture('ponytail');

  await page.locator('#hair-gallery-title').scrollIntoViewIfNeeded();
  await capture('hair-variants');

  await page.locator('#palette').selectOption('3');
  await expect(page.locator('#palette-swatches button[aria-pressed="true"]')).toHaveAttribute('data-palette', '3');
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

test('ClaudePXL authoring source is visible in the repository lab without binary assets', async ({ page }, testInfo) => {
  mkdirSync('test-results', { recursive: true });
  await page.goto('/avatar-lab.html', { waitUntil: 'domcontentloaded' });
  const source = page.locator('#pxl-source');
  await expect(source).toContainText('sprite("npc_human"');
  await expect(source).toContainText('sprite("npc_archivist"');
  await expect(page.locator('#pxl-gallery img')).toHaveCount(0);
  await source.scrollIntoViewIfNeeded();
  const path = `test-results/avatar-lab-${testInfo.project.name}-pxl-source.png`;
  await page.screenshot({ path });
  await testInfo.attach('avatar-lab-pxl-source-code', { path, contentType: 'image/png' });
});
