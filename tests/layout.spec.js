import { test, expect } from '@playwright/test';
import { openFresh, revealTool } from './helpers.js';

test.describe('Page layout', () => {
  test('controls are grouped: match, squad, pitch actions, share', async ({ page }) => {
    await openFresh(page, 'index.html');
    await expect(page.locator('#myTeamFormationPicker')).toBeVisible();
    for (const id of ['bulkNamesBtn', 'splitTeamsBtn', 'teamsBtn']) {
      await expect(page.locator(`.st-squad-row #${id}`)).toBeVisible();
    }
    for (const id of ['undoBtn', 'redoBtn', 'moreBtn']) {
      await expect(page.locator(`.pitch-actions #${id}`)).toBeVisible();
    }
    await expect(page.locator('#downloadBtn')).toBeVisible();
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
    await revealTool(page, 'recentBtn');
    await page.locator('#recentBtn').click();
    await expect(page.locator('#moreMenu')).toBeHidden();
    await expect(page.locator('.efl-panel')).toBeVisible();
  });

  test('wide screens: setting up on the left, pitch in the centre, sharing on the right', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openFresh(page, 'index.html');
    const field = await page.locator('#field').boundingBox();
    expect(Math.abs(field.x + field.width / 2 - 720)).toBeLessThan(20);
    const left = await page.locator('.studio-side:not(.studio-right)').boundingBox();
    const right = await page.locator('.studio-right').boundingBox();
    expect(left.x + left.width).toBeLessThan(field.x);
    expect(right.x).toBeGreaterThan(field.x + field.width);
    for (const id of ['myTeamFormationPicker', 'bulkNamesBtn', 'splitTeamsBtn', 'teamsBtn']) {
      await expect(page.locator(`.studio-side:not(.studio-right) #${id}`)).toBeVisible();
    }
    for (const id of ['downloadBtn', 'copyLinkBtn', 'whatsappBtn', 'imageOptionsBtn', 'copyTextBtn']) {
      await expect(page.locator(`.studio-right #${id}`)).toBeVisible();
    }
  });

  test('going narrow puts the controls back in the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openFresh(page, 'index.html');
    await page.setViewportSize({ width: 800, height: 900 });
    await page.locator('#moreBtn').click();
    await expect(page.locator('#moreMenu #imageOptionsBtn')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.st-squad #bulkNamesBtn')).toBeVisible();
    await expect(page.locator('.st-share #downloadBtn')).toBeVisible();
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
