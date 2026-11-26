import { test, expect } from '@playwright/test';
import { openFresh } from './helpers.js';

test.describe('Phone layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('share buttons sit in a bar fixed to the bottom of the screen', async ({ page }) => {
    await openFresh(page, 'index.html');
    const bar = page.locator('.share-bar');
    await expect(bar).toHaveCSS('position', 'fixed');
    const box = await bar.boundingBox();
    expect(Math.round(box.y + box.height)).toBe(844);
    for (const id of ['#copyLinkBtn', '#downloadBtn', '#whatsappBtn']) {
      const b = await page.locator(id).boundingBox();
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('the whole pitch fits above the bar without scrolling on a typical phone', async ({ page }) => {
    await openFresh(page, 'index.html');
    const field = await page.locator('#field').boundingBox();
    const bar = await page.locator('.share-bar').boundingBox();
    expect(field.y + field.height).toBeLessThanOrEqual(bar.y);
    await expect(page.locator('.subtitle')).toBeHidden();
  });

  test('desktop keeps the normal layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openFresh(page, 'index.html');
    await expect(page.locator('.share-bar')).not.toHaveCSS('position', 'fixed');
    await expect(page.locator('.subtitle')).toBeVisible();
  });
});
