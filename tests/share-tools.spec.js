import { test, expect } from '@playwright/test';
import { openFresh } from './helpers.js';

test.describe('Share tools', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('copy link shows a toast instead of an alert', async ({ page, browserName }, testInfo) => {
    test.skip(testInfo.project.name === 'Mobile Chrome', 'touch devices use the share sheet');
    await openFresh(page, '7s.html');
    let dialog = false;
    page.on('dialog', d => { dialog = true; d.dismiss(); });
    await page.locator('#copyLinkBtn').click();
    await expect(page.locator('#toast')).toHaveClass(/visible/);
    await expect(page.locator('#toast')).toContainText('Link copied');
    expect(dialog).toBe(false);
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('#f=');
  });

  test('copy as text lists both teams and the link', async ({ page }) => {
    await openFresh(page, '7s.html');
    const text = await page.evaluate(() => EFL.lineupText());
    const names = await page.locator('.my-team .player-name').allTextContents();
    expect(text).toContain('7v7 lineup');
    expect(text).toContain('HOME (2-3-1)');
    expect(text).toMatch(/AWAY \(\d-\d-\d\)/);
    expect(text).toContain(`1. ${names[0]}`);
    expect(text).toMatch(/View or edit: http.*#f=/);
    await page.locator('#moreBtn').click();
    await expect(page.locator('#copyTextBtn')).toBeVisible();
  });

  test('touch devices use the native share sheet for links', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Chrome', 'touch only');
    await openFresh(page, '7s.html');
    await page.evaluate(() => {
      window.shared = null;
      navigator.share = async data => { window.shared = data; };
    });
    await page.locator('#copyLinkBtn').click();
    const shared = await page.evaluate(() => window.shared);
    expect(shared.url).toContain('#f=');
  });
});
