import { test, expect } from '@playwright/test';

const MOBILE_WIDTHS = [320, 360, 390, 430];

test.describe('dedicated mobile presentation', () => {
  test('keeps the start screen inside narrow viewports', async ({ browser }) => {
    for (const width of MOBILE_WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.terminal-chasis')).toBeVisible();
      await expect(page.getByRole('button', { name: /INICIAR PARTIDA/i })).toBeVisible();
      if (width === 390) await page.screenshot({ path: 'test-results/mobile-start-390.png', fullPage: false });

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
    await page.screenshot({ path: 'test-results/mobile-inspection-390.png', fullPage: false });

    // The CRT power-on animation scales the entire monitor from a scan line.
    // Wait for actual visible controls to reach their final touch-target size
    // instead of measuring transient animation frames (which caused flaky CI).
    await page.waitForFunction(() => {
      const controls = [
        ...document.querySelectorAll('#inspection-tools-container .horror-tool-btn'),
        ...document.querySelectorAll('#game-actions-container > button')
      ].filter(el => {
        const style = getComputedStyle(el);
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) > 0
          && el.getClientRects().length > 0;
      });
      return controls.length > 0 && controls.every(el => {
        const rect = el.getBoundingClientRect();
        return rect.width >= 44 && rect.height >= 44;
      });
    }, null, { timeout: 8000 });

    const measurements = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const documentWidth = document.documentElement.scrollWidth;
      const isVisible = el => {
        const style = getComputedStyle(el);
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) > 0
          && el.getClientRects().length > 0;
      };
      const toolButtons = [...document.querySelectorAll('#inspection-tools-container .horror-tool-btn')].filter(isVisible);
      const actionButtons = [...document.querySelectorAll('#game-actions-container > button')].filter(isVisible);
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
      const monitors = [...document.querySelectorAll('#screen-game .center-console > .mini-monitor, #screen-game .center-console > .analog-controls')].map(el => {
        const r = el.getBoundingClientRect();
        return { tag: el.className, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
      });
      return {
        viewportWidth, documentWidth, bounds, monitors,
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
    for (const [index, monitor] of measurements.monitors.entries()) {
      expect(monitor.width, `telemetry element ${index} has no usable width: ${JSON.stringify(monitor)}`).toBeGreaterThanOrEqual(44);
      expect(monitor.left, `telemetry element ${index} starts outside viewport: ${JSON.stringify(monitor)}`).toBeGreaterThanOrEqual(-1);
      expect(monitor.right, `telemetry element ${index} exceeds viewport: ${JSON.stringify(monitor)}`).toBeLessThanOrEqual(measurements.viewportWidth + 1);
    }
    for (const [index, bounds] of measurements.bounds.entries()) {
      expect(bounds.width, `control ${index} is too narrow: ${JSON.stringify(bounds)}`).toBeGreaterThanOrEqual(44);
      expect(bounds.height, `control ${index} is too short: ${JSON.stringify(bounds)}`).toBeGreaterThanOrEqual(44);
      expect(bounds.right, `control ${index} exceeds viewport: ${JSON.stringify(bounds)}`).toBeLessThanOrEqual(measurements.viewportWidth + 1);
    }

    expect(pageErrors, 'uncaught JavaScript errors during mobile gameplay').toEqual([]);
  });
});


test('global pause control does not cover decision actions or the mobile navigation dock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
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
  const pause = page.locator('#btn-pause');
  // Some mobile states intentionally hide the global pause control; only
  // measure overlap when the control is actually rendered.
  test.skip(!(await pause.isVisible()), 'pause control is hidden in this mobile state');
  const geometry = await page.evaluate(() => {
    const rect = selector => {
      const el = document.querySelector(selector);
      if (!el || getComputedStyle(el).display === 'none') return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    };
    return { pause: rect('#btn-pause'), dock: rect('#sidebar-left'), admit: rect('#btn-admit'), ignore: rect('#btn-ignore') };
  });
  const overlaps = (a, b) => Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
  expect(overlaps(geometry.pause, geometry.dock), JSON.stringify(geometry)).toBe(false);
  expect(overlaps(geometry.pause, geometry.admit), JSON.stringify(geometry)).toBe(false);
  expect(overlaps(geometry.pause, geometry.ignore), JSON.stringify(geometry)).toBe(false);
});
