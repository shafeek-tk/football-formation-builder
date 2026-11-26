import { test, expect } from '@playwright/test';
import { openFresh, shareState } from './helpers.js';

test.describe('Bulk names', () => {
  test('pasted WhatsApp list fills the team in order', async ({ page }) => {
    await openFresh(page, '5s.html');
    await page.locator('#bulkNamesBtn').click();
    await page.fill('#bnHome', '1. Sam ✅\n2) Alex\n- Priya\n• Jo\n\nKai');
    await page.fill('#bnAway', 'Ben\nTom\nLiam\nNoah\nOli');
    await page.locator('#bnApply').click();
    await expect(page.locator('.my-team .player-name')).toHaveText(['SAM', 'ALEX', 'PRIYA', 'JO', 'KAI']);
    await expect(page.locator('.opp-team .player-name')).toHaveText(['BEN', 'TOM', 'LIAM', 'NOAH', 'OLI']);
    const state = await shareState(page);
    expect(state.n['my-team_2']).toBe('PRIYA');
  });

  test('clear all leaves blank, tappable names that survive reload', async ({ page }) => {
    await openFresh(page, '6s.html');
    await page.locator('#bulkNamesBtn').click();
    await page.locator('#bnClear').click();
    await page.locator('#bnApply').click();
    await expect(page.locator('.my-team .player-name').first()).toHaveText('');
    const box = await page.locator('.my-team .player-name').first().boundingBox();
    expect(box.width).toBeGreaterThan(30);
    await page.reload();
    await page.waitForSelector('.player');
    await expect(page.locator('.opp-team .player-name').first()).toHaveText('');
  });

  test('a short list leaves the remaining spots blank', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#bulkNamesBtn').click();
    await page.fill('#bnHome', 'One\nTwo');
    await page.locator('#bnApply').click();
    await expect(page.locator('.my-team .player-name').nth(1)).toHaveText('TWO');
    await expect(page.locator('.my-team .player-name').nth(2)).toHaveText('');
  });
});
