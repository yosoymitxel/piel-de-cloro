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
    // Screenshot is captured after the control-size wait below, once the CRT entrance transition settles.

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

    await page.screenshot({ path: 'test-results/mobile-inspection-390.png', fullPage: false });

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
      const hudRoot = document.querySelector('#screen-game > header > div.flex.flex-wrap');
      const visibleHud = [...(hudRoot?.children ?? [])].filter(el => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && el.getClientRects().length > 0;
      }).map(el => {
        const r = el.getBoundingClientRect();
        return { name: el.className, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
      });
      const batteryCard = document.querySelector('#screen-game .comp-gen-battery .hud-component');
      const batteryFill = document.querySelector('#screen-game #comp-gen-bat-fill');
      const rectJSON = el => {
        if (!el || !el.getClientRects().length) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
      };
      return {
        viewportWidth, documentWidth, bounds, monitors, visibleHud,
        batteryCard: rectJSON(batteryCard), batteryFill: rectJSON(batteryFill),
        mainView: rectOf('#screen-game .main-view-area'),
        dialogue: rectOf('#screen-game .dialogue-sidebar'),
        dock: rectOf('#sidebar-left'),
        pause: rectOf('#screen-game #btn-pause'),
        actionButtons: [...document.querySelectorAll('#game-actions-container > button')].filter(isVisible).map(rectJSON),
        generatorWarning: warningRect ? { height: warningRect.height, width: warningRect.width } : null
      };
    });

    expect(measurements.documentWidth, JSON.stringify(measurements)).toBeLessThanOrEqual(measurements.viewportWidth + 1);
    expect(measurements.bounds.length).toBeGreaterThan(0);

    // Six visible status cards must form two complete three-column rows.
    expect(measurements.visibleHud, JSON.stringify(measurements.visibleHud)).toHaveLength(6);
    const hudRows = [...new Set(measurements.visibleHud.map(card => Math.round(card.top / 4)))];
    expect(hudRows.length, JSON.stringify(measurements.visibleHud)).toBe(2);
    expect(measurements.visibleHud.every(card => card.width >= 44 && card.left >= -1 && card.right <= measurements.viewportWidth + 1)).toBe(true);

    // The battery fill must remain inside its card, including at 100%.
    if (measurements.batteryCard && measurements.batteryFill) {
      expect(measurements.batteryFill.left).toBeGreaterThanOrEqual(measurements.batteryCard.left - 1);
      expect(measurements.batteryFill.right).toBeLessThanOrEqual(measurements.batteryCard.right + 1);
    }

    // Decision actions must finish before the dialogue panel starts; no visual overlap.
    if (measurements.dialogue) {
      for (const [index, button] of measurements.actionButtons.entries()) {
        expect(button.bottom, `decision button ${index} overlaps dialogue panel: ${JSON.stringify({button, dialogue: measurements.dialogue})}`)
          .toBeLessThanOrEqual(measurements.dialogue.top + 1);
      }
    }

    // The pause control may be hidden by game state; when visible it must not cover the dock or actions.
    const overlaps = (a, b) => Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
    if (measurements.pause && measurements.pause.width > 0) {
      expect(overlaps(measurements.pause, measurements.dock), JSON.stringify(measurements)).toBe(false);
      for (const button of measurements.actionButtons) {
        expect(overlaps(measurements.pause, button), JSON.stringify(measurements)).toBe(false);
      }
    }
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
