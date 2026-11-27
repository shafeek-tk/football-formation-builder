import { test, expect } from '@playwright/test';
import { openFresh } from './helpers.js';

// Every pop-up opens the same way: on desktop it drops from its button (like
// the formation picker); on phones it is a tray and the page comes back after.
test.describe('Panel placement', () => {
  test('desktop: Names, Split teams and Kits open next to their button', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) <= 600, 'desktop only');
    await openFresh(page, '7s.html');
    for (const id of ['bulkNamesBtn', 'splitTeamsBtn', 'teamsBtn']) {
      await page.locator('#' + id).click();
      await expect(page.locator('.efl-panel.is-open')).toHaveCount(1);
      await page.waitForTimeout(200);
      const btn = await page.locator('#' + id).boundingBox();
      const panel = await page.locator('.efl-panel').boundingBox();
      const below = Math.abs(panel.y - (btn.y + btn.height + 8)) < 2;
      const above = Math.abs(panel.y + panel.height - (btn.y - 8)) < 2;
      expect(below || above, `${id} ${JSON.stringify(btn)} ${JSON.stringify(panel)}`).toBe(true);
      expect(panel.x < btn.x + btn.width && panel.x + panel.width > btn.x, id).toBe(true);
      await page.keyboard.press('Escape');
      await expect(page.locator('.efl-panel')).toHaveCount(0);
    }
  });

  test('phone: after a tray closes the page glides back so the other controls are right there', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1000) > 600, 'phone only');
    await openFresh(page, 'index.html');
    const before = await page.evaluate(() => window.scrollY);
    await page.locator('#myTeamFormationPicker').click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 20);
    await page.locator('.fp-close').click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(before + 3);
    await expect(page.locator('#awayTeamFormationPicker')).toBeInViewport();
  });
});
