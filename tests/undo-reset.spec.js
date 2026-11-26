import { test, expect } from '@playwright/test';
import { openFresh } from './helpers.js';

async function rename(page, i, name) {
  await page.locator('.my-team .player-name').nth(i).evaluate((el, n) => {
    el.textContent = n; el.dispatchEvent(new Event('blur'));
  }, name);
  await page.waitForTimeout(20);
}

test.describe('Undo, redo and reset', () => {
  test('undo and redo name edits and formation changes', async ({ page }) => {
    await openFresh(page, '7s.html');
    const first = page.locator('.my-team .player-name').first();
    const original = await first.textContent();
    await expect(page.locator('#undoBtn')).toBeDisabled();

    await rename(page, 0, 'Ana');
    await page.selectOption('#myTeamFormation', '222');
    await page.waitForTimeout(20);

    await page.locator('#undoBtn').click();
    await expect(page.locator('#myTeamFormation')).toHaveValue('231');
    await expect(first).toHaveText('ANA');
    await page.locator('#undoBtn').click();
    await expect(first).toHaveText(original);
    await expect(page.locator('#undoBtn')).toBeDisabled();

    await page.locator('#redoBtn').click();
    await page.locator('#redoBtn').click();
    await expect(page.locator('#myTeamFormation')).toHaveValue('222');
    await expect(page.locator('#redoBtn')).toBeDisabled();
  });

  test('keyboard shortcuts work outside text fields', async ({ page }) => {
    await openFresh(page, '6s.html');
    const original = await page.locator('.my-team .player-name').nth(1).textContent();
    await rename(page, 1, 'Bo');
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Control+z');
    await expect(page.locator('.my-team .player-name').nth(1)).toHaveText(original);
    await page.keyboard.press('Control+Shift+z');
    await expect(page.locator('.my-team .player-name').nth(1)).toHaveText('BO');
  });

  test('reset goes back to defaults and can be undone', async ({ page }) => {
    await openFresh(page, '5s.html');
    const original = await page.locator('.my-team .player-name').first().textContent();
    await rename(page, 0, 'Cy');
    await page.locator('#resetBtn').click();
    await expect(page.locator('.my-team .player-name').first()).toHaveText(original);
    await expect(page.locator('#toast')).toContainText('Undo');
    await page.locator('#undoBtn').click();
    await expect(page.locator('.my-team .player-name').first()).toHaveText('CY');
  });
});
