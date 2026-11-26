import { test, expect } from '@playwright/test';
import { openFresh } from './helpers.js';

test.describe('Page layout', () => {
  test('controls are grouped: match, squad, pitch actions, share', async ({ page }) => {
    await openFresh(page, 'index.html');
    await expect(page.locator('.st-match #myTeamFormation')).toBeAttached();
    for (const id of ['bulkNamesBtn', 'splitTeamsBtn', 'teamsBtn']) {
      await expect(page.locator(`.st-squad #${id}`)).toBeVisible();
    }
    for (const id of ['undoBtn', 'redoBtn', 'moreBtn']) {
      await expect(page.locator(`.pitch-actions #${id}`)).toBeVisible();
    }
    await expect(page.locator('.st-share #downloadBtn')).toBeVisible();
    // Secondary items are tucked away until the menu opens
    for (const id of ['imageOptionsBtn', 'copyTextBtn', 'recentBtn', 'resetBtn', 'tourBtn']) {
      await expect(page.locator(`#moreMenu #${id}`)).toBeHidden();
    }
    await page.locator('#moreBtn').click();
    await expect(page.locator('#moreMenu #recentBtn')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#moreMenu')).toBeHidden();
  });

  test('picking a menu item runs it and closes the menu', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#moreBtn').click();
    await page.locator('#recentBtn').click();
    await expect(page.locator('#moreMenu')).toBeHidden();
    await expect(page.locator('.efl-panel')).toBeVisible();
  });

  test('wide screens put the controls in a column beside the pitch', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openFresh(page, 'index.html');
    const side = await page.locator('.studio-side').boundingBox();
    const field = await page.locator('#field').boundingBox();
    expect(side.x + side.width).toBeLessThan(field.x);
    expect(field.y).toBeLessThan(260);
  });

  test('on a phone nothing scrolls sideways and the squad row fits', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await openFresh(page, 'index.html');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    const row = await page.locator('.st-squad-row').boundingBox();
    expect(row.x).toBeGreaterThanOrEqual(0);
    expect(row.x + row.width).toBeLessThanOrEqual(375);
    await page.locator('#moreBtn').click();
    await expect(page.locator('#moreMenu')).toHaveClass(/is-sheet/);
  });
});
