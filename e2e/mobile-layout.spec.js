import { test, expect } from '@playwright/test';

const MOBILE_WIDTHS = [320, 360, 390, 430];

test.describe('dedicated mobile presentation', () => {
  test('keeps the start screen inside narrow viewports', async ({ browser }) => {
    for (const width of MOBILE_WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.terminal-chasis')).toBeVisible();
      await expect(page.getByRole('button', { name: /INICIAR PARTIDA/i })).toBeVisible();
      if (width === 390) await page.screenshot({ path: 'test-results/mobile-start-390.png', fullPage: true });

      const metrics = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        shell: Math.round(document.querySelector('.terminal-chasis')?.getBoundingClientRect().width ?? 0),
        mobileStylesheetLoaded: [...document.styleSheets].some(sheet => sheet.href?.endsWith('/css/MobileLayout.css'))
      }));

      expect(metrics.mobileStylesheetLoaded, `MobileLayout.css missing at ${width}px`).toBe(true);
      expect(metrics.document, JSON.stringify({ width, ...metrics })).toBeLessThanOrEqual(metrics.viewport + 1);
      expect(metrics.shell, JSON.stringify({ width, ...metrics })).toBeLessThanOrEqual(metrics.viewport + 1);
      await page.close();
    }
  });

  test('first-day inspection remains usable with touch-sized controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('/', { waitUntil: 'domcontentloaded' });
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
    await expect(page.locator('#screen-game')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/mobile-inspection-390.png', fullPage: true });

    const measurements = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const documentWidth = document.documentElement.scrollWidth;
      const toolButtons = [...document.querySelectorAll('#inspection-tools-container .horror-tool-btn')];
      const actionButtons = [...document.querySelectorAll('#game-actions-container > button')];
      const bounds = [...toolButtons, ...actionButtons].map(el => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height, right: rect.right, label: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 50) };
      });
      const rectOf = selector => {
        const el = document.querySelector(selector);
        if (!el || el.getClientRects().length === 0) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
      };
      const generatorWarning = document.querySelector('#inspection-tools-container > #btn-goto-generator');
      const warningRect = generatorWarning?.getClientRects().length ? generatorWarning.getBoundingClientRect() : null;
      return {
        viewportWidth, documentWidth, bounds,
        mainView: rectOf('#screen-game .main-view-area'),
        dialogue: rectOf('#screen-game .dialogue-sidebar'),
        dock: rectOf('#sidebar-left'),
        generatorWarning: warningRect ? { height: warningRect.height, width: warningRect.width } : null
      };
    });

    expect(measurements.documentWidth, JSON.stringify(measurements)).toBeLessThanOrEqual(measurements.viewportWidth + 1);
    expect(measurements.bounds.length).toBeGreaterThan(0);
    if (measurements.mainView && measurements.dialogue) {
      expect(measurements.mainView.bottom, 'inspection area overlaps dialogue panel').toBeLessThanOrEqual(measurements.dialogue.top + 1);
    }
    if (measurements.generatorWarning) {
      expect(measurements.generatorWarning.height, 'generator warning overwhelms the mobile inspection view').toBeLessThanOrEqual(76);
    }
    for (const [index, bounds] of measurements.bounds.entries()) {
      expect(bounds.width, `control ${index} is too narrow: ${JSON.stringify(bounds)}`).toBeGreaterThanOrEqual(44);
      expect(bounds.height, `control ${index} is too short: ${JSON.stringify(bounds)}`).toBeGreaterThanOrEqual(44);
      expect(bounds.right, `control ${index} exceeds viewport: ${JSON.stringify(bounds)}`).toBeLessThanOrEqual(measurements.viewportWidth + 1);
    }

    expect(pageErrors, 'uncaught JavaScript errors during mobile gameplay').toEqual([]);
  });
});
