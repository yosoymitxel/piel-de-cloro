import { test, expect } from '@playwright/test';

test('avatar lab renders code-generated skins and editable hairstyle variants', async ({ page }) => {
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.goto('/avatar-lab.html', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Laboratorio de avatares/i);
  await expect(page.getByRole('heading', { name: /Laboratorio de identidades/i })).toBeVisible();

  const portrait = page.locator('#current-portrait');
  await expect(portrait).toBeVisible();
  await expect.poll(() => portrait.evaluate(img => img.naturalWidth)).toBe(256);
  await expect(page.locator('#hair-gallery .hair-card')).toHaveCount(10);
  await expect(page.locator('#svg-source')).toContainText('<svg');
  await expect(page.locator('#pxl-gallery .pxl-card')).toHaveCount(6);

  const before = await portrait.getAttribute('src');
  await page.getByRole('button', { name: /Elegir peinado Coleta/i }).click();
  await expect(portrait).toHaveAttribute('data-hair-style', 'ponytail');
  await expect(page.locator('#hair')).toHaveValue('ponytail');
  await expect(page.locator('#svg-source')).toContainText('width="3" height="7"');
  expect(await portrait.getAttribute('src')).not.toBe(before);

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
});

test('each ClaudePXL output referenced in the lab has decoded image pixels', async ({ page }) => {
  await page.goto('/avatar-lab.html', { waitUntil: 'domcontentloaded' });
  const sprites = page.locator('#pxl-gallery img');
  await expect(sprites).toHaveCount(6);
  for (const sprite of await sprites.all()) {
    await expect.poll(() => sprite.evaluate(img => img.naturalWidth), {
      message: 'Each generated ClaudePXL sprite must exist and decode'
    }).toBeGreaterThan(0);
  }
});
