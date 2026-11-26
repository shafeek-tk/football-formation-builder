import { test, expect } from '@playwright/test';
import { openFresh } from './helpers.js';

test.describe('Formation picker', () => {
  test('a styled button opens formation cards and picking one changes the lineup', async ({ page }) => {
    await openFresh(page, 'index.html');
    const trigger = page.locator('#myTeamFormationPicker');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveText('4-4-2');
    await trigger.click();
    const panel = page.locator('.fp-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('.fp-option[aria-selected="true"]')).toHaveAttribute('data-value', '442');
    expect(await panel.locator('.fp-option svg circle').count()).toBeGreaterThan(100);
    await panel.locator('.fp-option[data-value="433"]').click();
    await expect(panel).toHaveCount(0);
    await expect(page.locator('#myTeamFormation')).toHaveValue('433');
    await expect(trigger).toHaveText('4-3-3');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('keyboard: arrows move, Enter picks, Escape closes', async ({ page }) => {
    await openFresh(page, '7s.html');
    await page.locator('#awayTeamFormationPicker').click();
    await expect(page.locator('.fp-option:focus')).toHaveCount(1);
    await page.keyboard.press('ArrowRight');
    const value = await page.locator('.fp-option:focus').getAttribute('data-value');
    await page.keyboard.press('Enter');
    await expect(page.locator('#awayTeamFormation')).toHaveValue(value);
    await page.locator('#awayTeamFormationPicker').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.fp-panel')).toHaveCount(0);
    await expect(page.locator('#awayTeamFormationPicker')).toBeFocused();
  });

  test('the button follows changes made in code (share links, undo)', async ({ page }) => {
    await openFresh(page, '5s.html');
    await page.selectOption('#myTeamFormation', '211');
    await expect(page.locator('#myTeamFormationPicker')).toHaveText('2-1-1');
    await page.locator('#undoBtn').click();
    await expect(page.locator('#myTeamFormationPicker')).toHaveText('2-2');
  });

  test('on a phone it opens as a sheet at the bottom of the screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openFresh(page, 'index.html');
    await page.locator('#myTeamFormationPicker').click();
    const panel = page.locator('.fp-panel');
    await expect(panel).toHaveClass(/is-sheet/);
    // Wait for the slide-up to finish
    await expect.poll(async () => { const b = await panel.boundingBox(); return Math.round(b.y + b.height); }).toBe(844);
    expect(Math.round((await panel.boundingBox()).width)).toBe(390);
    await page.locator('.fp-backdrop').click({ position: { x: 20, y: 20 } });
    await expect(panel).toHaveCount(0);
  });
});
