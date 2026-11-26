import { test, expect } from '@playwright/test';
import { BASE } from './helpers.js';

// These tests are about the very first visit, so start with nothing saved
test.use({ storageState: { cookies: [], origins: [] } });

async function firstVisit(page, file = 'index.html') {
  await page.goto(`${BASE}/${file}`);
  await page.waitForSelector('.player');
}

test.describe('First-visit walkthrough', () => {
  test('runs through edit, swap, tools and share, then stays away', async ({ page }) => {
    await firstVisit(page, '7s.html');
    const card = page.locator('.efl-tour-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText('1 of 4');
    await expect(card).toContainText('Tap any name');
    await expect(page.locator('.efl-tour-spot')).toBeVisible();

    for (const [n, words] of [[2, 'Drag a shirt'], [3, 'fair teams'], [4, 'WhatsApp']]) {
      await card.locator('.efl-tour-next').click();
      await expect(card).toContainText(`${n} of 4`);
      await expect(card).toContainText(words);
      const box = await card.boundingBox();
      const vp = page.viewportSize();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
    }
    await card.locator('.efl-tour-next').click();
    await expect(card).toHaveCount(0);
    await expect(page.locator('.efl-tour-spot')).toHaveCount(0);

    await page.reload();
    await page.waitForSelector('.player');
    await page.waitForTimeout(1000);
    await expect(page.locator('.efl-tour-card')).toHaveCount(0);
  });

  test('skip closes it, and How it works brings it back', async ({ page }) => {
    await firstVisit(page);
    await page.locator('.efl-tour-skip').click();
    await expect(page.locator('.efl-tour-card')).toHaveCount(0);
    await page.locator('#tourBtn').click();
    await expect(page.locator('.efl-tour-card')).toContainText('1 of 4');
    await page.keyboard.press('Escape');
    await expect(page.locator('.efl-tour-card')).toHaveCount(0);
  });

  test('editing a name still works after the tour', async ({ page }) => {
    await firstVisit(page, '5s.html');
    await page.locator('.efl-tour-skip').click();
    const name = page.locator('.my-team .player-name').first();
    await name.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Jo');
    await page.keyboard.press('Enter');
    await expect(name).toHaveText(/^jo$/i);
  });
});
