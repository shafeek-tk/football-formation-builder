const { test, expect } = require('@playwright/test');

test.describe('7v7 Formation Builder', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('file://' + process.cwd() + '/7s.html');
        await page.waitForSelector('.field', { timeout: 5000 });
    });

    test('should load 7v7 page correctly', async ({ page }) => {
        const header = await page.locator('h1').textContent();
        expect(header).toContain('7v7');
        
        // Check 7 players per team (14 total)
        const playerCount = await page.locator('.player').count();
        expect(playerCount).toBe(14);
    });

    test('should have correct number of formations', async ({ page }) => {
        const options = await page.locator('#myTeamFormation option').count();
        expect(options).toBe(7); // 7 formations for 7v7
    });

    test('should display 7 players per team', async ({ page }) => {
        const homePlayers = await page.locator('.my-team').count();
        const awayPlayers = await page.locator('.opp-team').count();
        
        expect(homePlayers).toBe(7);
        expect(awayPlayers).toBe(7);
    });

    test('should have both home and away selectors', async ({ page }) => {
        const homeSelector = page.locator('#myTeamFormation');
        const awaySelector = page.locator('#awayTeamFormation');
        
        await expect(homeSelector).toBeVisible();
        await expect(awaySelector).toBeVisible();
    });

    test('should change formation correctly', async ({ page }) => {
        await page.selectOption('#myTeamFormation', '321');
        await page.waitForTimeout(500);
        
        const homePlayers = await page.locator('.my-team').count();
        expect(homePlayers).toBe(7);
    });

    test('should have mode toggle with 7v7 active', async ({ page }) => {
        const activeButton = page.locator('.mode-toggle .mode-btn.active');
        const text = await activeButton.textContent();
        expect(text).toContain('7v7');
    });

    test('should have all common elements', async ({ page }) => {
        await expect(page.locator('button:has-text("SHARE FORMATION")')).toBeVisible();
        await expect(page.locator('button#downloadBtn')).toBeVisible();
        await expect(page.locator('.footer')).toBeVisible();
    });
});
