import { test, expect } from '@playwright/test';
import { openFresh, shareState, openState, exportSize } from './helpers.js';

test.describe('Subs bench', () => {
  test('add subs, swap one onto the pitch, keep it in the link', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('.bench-row.my-team .bench-add').click();
    await page.keyboard.type('Zed');
    await page.keyboard.press('Enter');
    await page.locator('.bench-row.my-team .bench-add').click();
    await page.keyboard.type('Yan');
    await page.keyboard.press('Enter');
    await expect(page.locator('.bench-row.my-team .bench-name')).toHaveText(['ZED', 'YAN']);

    const starter = page.locator('.my-team.player').nth(2);
    const starterName = await starter.locator('.player-name').textContent();
    await page.locator('.bench-row.my-team .bench-name').first().click();
    await starter.click();
    await expect(starter.locator('.player-name')).toHaveText('ZED');
    await expect(page.locator('.bench-row.my-team .bench-name').first()).toHaveText(starterName);

    const state = await shareState(page);
    expect(state.b.h).toEqual([starterName, 'YAN']);
    await page.evaluate(() => localStorage.clear());
    await openState(page, '7s.html', state);
    await expect(page.locator('.bench-row.my-team .bench-name')).toHaveText([starterName, 'YAN']);
  });

  test('remove a sub', async ({ page }) => {
    await openFresh(page, '5s.html');
    await page.evaluate(() => EFL.setBench('opp-team', ['a', 'b']));
    await page.locator('.bench-row.opp-team .bench-remove').first().click();
    await expect(page.locator('.bench-row.opp-team .bench-name')).toHaveText(['B']);
  });

  test('subs are added under the shared image', async ({ page }) => {
    await openFresh(page, '5s.html');
    const before = await exportSize(page);
    await page.evaluate(() => EFL.setBench('my-team', ['Sub One']));
    const after = await exportSize(page);
    expect(after.height).toBeGreaterThan(before.height);
  });
});
