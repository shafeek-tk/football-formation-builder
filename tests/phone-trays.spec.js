import { test, expect } from '@playwright/test';
import { openFresh } from './helpers.js';

// Phones: pickers, panels and the More menu are short trays along the bottom,
// with no dark overlay, so the pitch stays in view and changes as you go.
test.describe('Phone trays', () => {
  test.beforeEach(async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1000) > 600, 'phone layout only');
  });

  const fieldVisibleAbove = async (page, tray) => page.evaluate(sel => {
    const f = document.getElementById('field').getBoundingClientRect();
    const t = document.querySelector(sel).getBoundingClientRect();
    const shown = Math.min(f.bottom, t.top) - Math.max(f.top, 0);
    return shown / f.height;
  }, tray);

  test('formation tray: pitch stays in view and changes as you tap', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#myTeamFormationPicker').click();
    const panel = page.locator('.fp-panel.is-sheet');
    await expect(panel).toBeVisible();
    const tray = await panel.boundingBox();
    expect(tray.height).toBeLessThan(page.viewportSize().height * 0.4);
    expect(await page.locator('.fp-backdrop').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    await expect.poll(() => fieldVisibleAbove(page, '.fp-panel')).toBeGreaterThan(0.6);

    const value = await panel.locator('.fp-option').nth(2).getAttribute('data-value');
    await panel.locator('.fp-option').nth(2).click();
    await expect(page.locator('#myTeamFormation')).toHaveValue(value);
    await expect(panel).toBeVisible();
    await panel.locator('.fp-close').click();
    await expect(page.locator('.fp-panel')).toHaveCount(0);
  });

  test('names tray: no keyboard on open, names show on the pitch as you type, close keeps them', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#bulkNamesBtn').click();
    const panel = page.locator('.efl-panel');
    await expect(panel).toBeVisible();
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('TEXTAREA');
    expect(await page.locator('.efl-panel-overlay').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    expect((await panel.boundingBox()).height).toBeLessThan(page.viewportSize().height * 0.5);

    await page.locator('#bnHome').fill('Sam\nAlex');
    await expect(page.locator('#field .player.my-team .player-name').first()).toHaveText('SAM');
    await page.locator('.efl-panel-close').click();
    await expect(page.locator('.efl-panel')).toHaveCount(0);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('playerNames')));
    expect(saved['my-team_0']).toBe('SAM');
  });

  test('kits tray: a colour shows on the pitch before Done', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#teamsBtn').click();
    const swatch = page.locator('.team-fields[data-side="h"] .kit-swatch').nth(4);
    const color = await swatch.getAttribute('data-color');
    await swatch.click();
    await expect.poll(() => page.locator('#field').evaluate(el => el.style.getPropertyValue('--kit-h'))).toBe(color);
  });

  test('split teams: Split puts the teams on the pitch straight away', async ({ page }) => {
    await openFresh(page, '5s.html');
    await page.locator('#splitTeamsBtn').click();
    await page.locator('#spList').fill('Ann\nBob\nCat\nDan\nEve\nFin\nGus\nHal\nIan\nJo');
    await page.locator('#spSplit').click();
    const names = await page.locator('#field .player .player-name').allTextContents();
    expect(names.sort()).toEqual(['ANN', 'BOB', 'CAT', 'DAN', 'EVE', 'FIN', 'GUS', 'HAL', 'IAN', 'JO']);
    await expect(page.locator('.efl-panel')).toBeVisible();
  });

  test('with the keyboard up the tray sits above it and the close button stays on screen', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#bulkNamesBtn').click();
    await page.evaluate(() => { const r = document.documentElement; r.style.setProperty('--vv-h', '380px'); r.classList.add('kb-open'); });
    await expect.poll(async () => { const b = await page.locator('.efl-panel').boundingBox(); return b.y + b.height; }).toBeLessThanOrEqual(381);
    const close = await page.locator('.efl-panel-close').boundingBox();
    expect(close.y).toBeGreaterThanOrEqual(0);
  });

  test('More menu is a short tray with no dark overlay', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#moreBtn').click();
    const menu = page.locator('#moreMenu');
    await expect(menu).toBeVisible();
    expect((await menu.boundingBox()).height).toBeLessThanOrEqual(page.viewportSize().height * 0.53);
    expect(await page.locator('.ly-backdrop').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  });
});
