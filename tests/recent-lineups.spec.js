import { test, expect } from '@playwright/test';
import { openFresh } from './helpers.js';

test.describe('Recent lineups', () => {
  test('a shared lineup can be reopened later, from another format page too', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('.my-team .player-name').first().evaluate(el => { el.textContent = 'Remember Me'; el.dispatchEvent(new Event('blur')); });
    await page.evaluate(() => { formationBuilder.shareURL = () => {}; });
    await page.locator('#copyLinkBtn').click();

    await page.evaluate(() => localStorage.removeItem('playerNames'));
    await page.goto('http://localhost:8080/5s.html');
    await page.waitForSelector('.player');
    await page.locator('#moreBtn').click();
    await page.locator('#recentBtn').click();
    await expect(page.locator('.recent-row')).toHaveCount(1);
    await expect(page.locator('.recent-meta')).toContainText('7v7');
    await page.locator('.recent-open').click();
    await page.waitForURL(/7s\.html#f=/);
    await expect(page.locator('.my-team .player-name').first()).toHaveText('REMEMBER ME');
  });

  test('save current, open on the same page, and remove', async ({ page }) => {
    await openFresh(page, '6s.html');
    await page.locator('#moreBtn').click();
    await page.locator('#recentBtn').click();
    await expect(page.locator('.efl-panel')).toContainText('will appear here');
    await page.locator('.efl-panel .efl-btn--primary').click();
    await expect(page.locator('.recent-row')).toHaveCount(1);
    await page.locator('.recent-remove').click();
    await expect(page.locator('.recent-row')).toHaveCount(0);
  });
});
