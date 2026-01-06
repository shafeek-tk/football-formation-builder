import { test, expect } from '@playwright/test';

test.describe('Football Formation Builder', () => {
  
  test('should load homepage and display formation controls', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    
    // Check page title
    await expect(page).toHaveTitle(/Football Formation Builder/);
    
    // Check formation selectors exist
    await expect(page.locator('#myTeamFormation')).toBeVisible();
    await expect(page.locator('#awayTeamFormation')).toBeVisible();
    
    // Check action buttons exist
    await expect(page.getByText('SHARE FORMATION')).toBeVisible();
    await expect(page.getByText('DOWNLOAD IMAGE')).toBeVisible();
    
    // Check mode toggle buttons
    await expect(page.getByText('11v11')).toBeVisible();
    await expect(page.getByText('7v7')).toBeVisible();
    await expect(page.getByText('6v6')).toBeVisible();
  });

  test('should change formation and update players', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    
    // Wait for page to load
    await page.waitForSelector('#field');
    
    // Count initial players (4-4-2 formation should have 11 players)
    const initialPlayers = await page.locator('.player').count();
    expect(initialPlayers).toBe(22); // 11 home + 11 away
    
    // Change home team formation to 4-3-3
    await page.selectOption('#myTeamFormation', '433');
    
    // Players should still be 22 (formation change doesn't change player count)
    const playersAfterChange = await page.locator('.player').count();
    expect(playersAfterChange).toBe(22);
  });

  test('should edit player names', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    
    // Wait for players to load
    await page.waitForSelector('.player-name');
    
    // Click on first player name to edit
    const firstPlayerName = page.locator('.my-team .player-name').first();
    await firstPlayerName.click();
    
    // Should be editable (check if it becomes focused or changes)
    await expect(firstPlayerName).toBeFocused();
  });

  test('should switch between different formats', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    
    // Click 7v7 button
    await page.getByText('7v7').click();
    
    // Should navigate to 7s.html
    await expect(page).toHaveURL(/7s\.html/);
    
    // Should have 7v7 formation controls
    await expect(page.locator('#myTeamFormation')).toBeVisible();
    
    // Go back to 11v11
    await page.getByText('11v11').click();
    await expect(page).toHaveURL(/index\.html/);
  });

  test('should generate shareable URL', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    
    // Wait for page to load
    await page.waitForSelector('#field');
    
    // Mock clipboard API
    await page.addInitScript(() => {
      window.clipboardData = '';
      navigator.clipboard = {
        writeText: (text) => {
          window.clipboardData = text;
          return Promise.resolve();
        }
      };
    });
    
    // Click share formation button
    await page.getByText('SHARE FORMATION').click();
    
    // Check if URL was generated (clipboard should contain URL)
    const clipboardData = await page.evaluate(() => window.clipboardData);
    expect(clipboardData).toContain('easyfootballlineup.com');
    expect(clipboardData).toContain('#f=');
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/index.html');
    
    // Check mobile-specific elements
    await expect(page.getByText('SHARE IMAGE')).toBeVisible();
    
    // Mode buttons should be smaller on mobile
    const modeButton = page.getByText('11v11');
    await expect(modeButton).toBeVisible();
    
    // Formation controls should be stacked vertically on mobile
    const controls = page.locator('.controls');
    await expect(controls).toBeVisible();
  });

  test('should load 7v7 format correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    
    // Check 7v7 specific elements
    await expect(page).toHaveTitle(/7v7 Football Formation/);
    await expect(page.getByText('7v7').nth(0)).toHaveClass(/active/);
    
    // Should have 14 players total (7 home + 7 away)
    await page.waitForSelector('.player');
    const players = await page.locator('.player').count();
    expect(players).toBe(14);
  });

  test('should load 6v6 format correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    
    // Check 6v6 specific elements  
    await expect(page).toHaveTitle(/6v6 Football Formation/);
    await expect(page.getByText('6v6').nth(0)).toHaveClass(/active/);
    
    // Should have 12 players total (6 home + 6 away)
    await page.waitForSelector('.player');
    const players = await page.locator('.player').count();
    expect(players).toBe(12);
  });

  test('should preserve names when changing formations', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    
    // Wait for players to load
    await page.waitForSelector('.my-team .player-name');
    
    // Edit first player name
    const firstPlayer = page.locator('.my-team .player-name').first();
    await firstPlayer.click();
    await firstPlayer.fill('CUSTOM NAME');
    await firstPlayer.blur();
    
    // Change formation
    await page.selectOption('#myTeamFormation', '433');
    
    // Name should be preserved
    await expect(page.locator('.my-team .player-name').first()).toHaveText('CUSTOM NAME');
  });
});
