const { test, expect } = require('@playwright/test');

test.describe('11v11 Formation Builder', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('file://' + process.cwd() + '/index.html');
        await page.waitForSelector('.field', { timeout: 5000 });
    });

    test('should load page with default formation', async ({ page }) => {
        // Check title
        await expect(page).toHaveTitle(/Football Formation Builder/);
        
        // Check header
        const header = await page.locator('h1').textContent();
        expect(header).toContain('EASY FOOTBALL LINEUP');
        
        // Check default formation is selected
        const homeFormation = await page.locator('#myTeamFormation').inputValue();
        expect(homeFormation).toBe('442');
        
        // Check players are rendered (11 home + 11 away = 22)
        const playerCount = await page.locator('.player').count();
        expect(playerCount).toBe(22);
    });

    test('should display correct number of players for each team', async ({ page }) => {
        const homePlayers = await page.locator('.my-team').count();
        const awayPlayers = await page.locator('.opp-team').count();
        
        expect(homePlayers).toBe(11);
        expect(awayPlayers).toBe(11);
    });

    test('should change formation when dropdown is changed', async ({ page }) => {
        // Change to 4-3-3
        await page.selectOption('#myTeamFormation', '433');
        await page.waitForTimeout(500);
        
        // Still should have 11 players per team
        const homePlayers = await page.locator('.my-team').count();
        expect(homePlayers).toBe(11);
    });

    test('should have all formation options available', async ({ page }) => {
        const options = await page.locator('#myTeamFormation option').count();
        expect(options).toBeGreaterThanOrEqual(23); // We added 23 formations
    });

    test('should display player names', async ({ page }) => {
        const firstPlayerName = await page.locator('.my-team .player-name').first().textContent();
        expect(firstPlayerName).toBeTruthy();
        expect(firstPlayerName.length).toBeGreaterThan(0);
    });

    test('should have share button', async ({ page }) => {
        const shareButton = page.locator('button:has-text("SHARE FORMATION")');
        await expect(shareButton).toBeVisible();
    });

    test('should have download button', async ({ page }) => {
        const downloadButton = page.locator('button#downloadBtn');
        await expect(downloadButton).toBeVisible();
    });

    test('should have mode toggle buttons', async ({ page }) => {
        const modeToggle = page.locator('.mode-toggle');
        await expect(modeToggle).toBeVisible();
        
        const buttons = await modeToggle.locator('.mode-btn').count();
        expect(buttons).toBe(3); // 11v11, 7v7, 6v6
    });

    test('should have footer with credits', async ({ page }) => {
        const footer = page.locator('.footer');
        await expect(footer).toBeVisible();
        
        const footerText = await footer.textContent();
        expect(footerText).toContain('Icons8');
        expect(footerText).toContain('easyfootballlineup@gmail.com');
    });

    test('should have marketing section', async ({ page }) => {
        const marketing = page.locator('text=Why coaches and players love this tool');
        await expect(marketing).toBeVisible();
    });

    test('should display jersey images', async ({ page }) => {
        // Check if player icons have background images
        const homePlayer = page.locator('.my-team .player-icon').first();
        const awayPlayer = page.locator('.opp-team .player-icon').first();
        
        await expect(homePlayer).toBeVisible();
        await expect(awayPlayer).toBeVisible();
    });

    test('should have instruction text', async ({ page }) => {
        const instruction = page.locator('text=Click on player names to edit');
        await expect(instruction).toBeVisible();
    });

    test('should allow editing player names on click', async ({ page }) => {
        const playerName = page.locator('.my-team .player-name').first();
        await playerName.click();
        
        // Check if contenteditable or input appears
        const isEditable = await playerName.evaluate(el => 
            el.isContentEditable || el.querySelector('input') !== null
        );
        expect(isEditable).toBeTruthy();
    });

    test('should have both home and away formation selectors', async ({ page }) => {
        const homeSelector = page.locator('#myTeamFormation');
        const awaySelector = page.locator('#awayTeamFormation');
        
        await expect(homeSelector).toBeVisible();
        await expect(awaySelector).toBeVisible();
    });

    test('should change away team formation independently', async ({ page }) => {
        await page.selectOption('#awayTeamFormation', '352');
        await page.waitForTimeout(500);
        
        const awayPlayers = await page.locator('.opp-team').count();
        expect(awayPlayers).toBe(11);
    });
});
