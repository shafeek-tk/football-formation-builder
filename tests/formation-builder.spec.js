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
    
    // Check download button exists (text varies by viewport)
    const downloadBtn = page.locator('#downloadBtn');
    await expect(downloadBtn).toBeVisible();
    
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
    
    // Should trigger edit mode (check if content changes or becomes editable)
    await page.waitForTimeout(200);
    const isEditable = await firstPlayerName.evaluate(el => el.contentEditable === 'true' || el.tagName === 'INPUT');
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
    
    // Set home team player names A through K
    const homeNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    for (let i = 0; i < homeNames.length; i++) {
      const player = page.locator('.my-team .player-name').nth(i);
      await player.evaluate((el, name) => {
        el.textContent = name;
      }, homeNames[i]);
    }
    
    // Set away team player names L through V
    const awayNames = ['L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
    for (let i = 0; i < awayNames.length; i++) {
      const player = page.locator('.opp-team .player-name').nth(i);
      await player.evaluate((el, name) => {
        el.textContent = name;
      }, awayNames[i]);
    }
    
    // Override shareURL function after page loads
    await page.evaluate(() => {
      window.capturedShareUrl = '';
      const originalShareURL = window.shareURL;
      window.shareURL = function(url) {
        window.capturedShareUrl = url;
        // Mock clipboard and alert to prevent blocking
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).catch(() => {});
        }
      };
    });
    
    // Click share formation button
    await page.getByText('SHARE FORMATION').click();
    
    // Get the captured URL
    const shareUrl = await page.evaluate(() => window.capturedShareUrl);
    expect(shareUrl).toBeTruthy();
    expect(shareUrl).toContain('#f=');
    
    console.log('Production URL:', shareUrl);
    
    // Convert production URL to localhost for testing
    const localUrl = shareUrl.replace('https://easyfootballlineup.com', 'http://localhost:8080');
    console.log('Local test URL:', localUrl);
    
    // Test that the URL loads correctly locally
    await page.goto(localUrl);
    await page.waitForSelector('#field');
    
    // Verify the page loaded with the formation data
    expect(page.url()).toContain('#f=');
    
    // Check that all home team names were preserved
    for (let i = 0; i < homeNames.length; i++) {
      const player = page.locator('.my-team .player-name').nth(i);
      await expect(player).toHaveText(homeNames[i]);
    }
    
    // Check that all away team names were preserved
    for (let i = 0; i < awayNames.length; i++) {
      const player = page.locator('.opp-team .player-name').nth(i);
      await expect(player).toHaveText(awayNames[i]);
    }
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
    
    // Should have 14 players total (7 home + 7 away)
    await page.waitForSelector('.player');
    const players = await page.locator('.player').count();
    expect(players).toBe(14);
  });

  test('should load 6v6 format correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    
    // Check 6v6 specific elements  
    await expect(page).toHaveTitle(/6v6 Football Formation/);
    
    // Should have 12 players total (6 home + 6 away)
    await page.waitForSelector('.player');
    const players = await page.locator('.player').count();
    expect(players).toBe(12);
  });

  test('should preserve names when changing formations', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    
    // Wait for players to load
    await page.waitForSelector('.my-team .player-name');
    
    // Edit multiple home team player names
    const homeNames = ['HOME A', 'HOME B', 'HOME C'];
    for (let i = 0; i < homeNames.length; i++) {
      const player = page.locator('.my-team .player-name').nth(i);
      await player.click();
      
      const input = page.locator('.player-name-input');
      await input.fill(homeNames[i]);
      await input.blur();
      
      await page.waitForSelector('.player-name-input', { state: 'detached' });
      await expect(player).toHaveText(homeNames[i]);
    }
    
    // Edit multiple away team player names
    const awayNames = ['AWAY X', 'AWAY Y', 'AWAY Z'];
    for (let i = 0; i < awayNames.length; i++) {
      const player = page.locator('.opp-team .player-name').nth(i);
      await player.click();
      
      const input = page.locator('.player-name-input');
      await input.fill(awayNames[i]);
      await input.blur();
      
      await page.waitForSelector('.player-name-input', { state: 'detached' });
      await expect(player).toHaveText(awayNames[i]);
    }
    
    // Change formation
    await page.selectOption('#myTeamFormation', '433');
    await page.waitForTimeout(1000);
    
    // Verify all home team names are preserved
    for (let i = 0; i < homeNames.length; i++) {
      await expect(page.locator('.my-team .player-name').nth(i)).toHaveText(homeNames[i]);
    }
    
    // Verify all away team names are preserved
    for (let i = 0; i < awayNames.length; i++) {
      await expect(page.locator('.opp-team .player-name').nth(i)).toHaveText(awayNames[i]);
    }
  });

  // 7v7 Format Tests
  test('should load 7v7 format and display formation controls', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    
    // Check page title
    await expect(page).toHaveTitle(/7v7 Football Formation/);
    
    // Check formation selectors exist (7v7 only has home team formation)
    await expect(page.locator('#myTeamFormation')).toBeVisible();
    
    // Check action buttons exist
    await expect(page.getByText('SHARE FORMATION')).toBeVisible();
    const downloadBtn = page.locator('#downloadBtn');
    await expect(downloadBtn).toBeVisible();
    
    // Check mode toggle buttons (use button selectors to avoid duplicates)
    await expect(page.locator('button.mode-btn', { hasText: '11v11' })).toBeVisible();
    await expect(page.locator('button.mode-btn', { hasText: '7v7' })).toBeVisible();
    await expect(page.locator('button.mode-btn', { hasText: '6v6' })).toBeVisible();
  });

  test('should change 7v7 formation and update players', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    
    // Wait for page to load
    await page.waitForSelector('#field');
    
    // Should have 14 players total (7 home + 7 away)
    const initialPlayers = await page.locator('.player').count();
    expect(initialPlayers).toBe(14);
    
    // Change home team formation to 3-2-1 (valid 7-player formation)
    await page.selectOption('#myTeamFormation', '321');
    
    // Players should still be 14
    const playersAfterChange = await page.locator('.player').count();
    expect(playersAfterChange).toBe(14);
  });

  test('should preserve names when changing 7v7 formations', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    
    // Wait for players to load
    await page.waitForSelector('.my-team .player-name');
    
    // Edit home team names (first 3 players)
    const homeNames = ['7V7 A', '7V7 B', '7V7 C'];
    for (let i = 0; i < homeNames.length; i++) {
      const player = page.locator('.my-team .player-name').nth(i);
      await player.click();
      
      const input = page.locator('.player-name-input');
      await input.fill(homeNames[i]);
      await input.blur();
      
      await page.waitForSelector('.player-name-input', { state: 'detached' });
      await expect(player).toHaveText(homeNames[i]);
    }
    
    // Edit away team names (first 2 players)
    const awayNames = ['AWAY 7A', 'AWAY 7B'];
    for (let i = 0; i < awayNames.length; i++) {
      const player = page.locator('.opp-team .player-name').nth(i);
      await player.click();
      
      const input = page.locator('.player-name-input');
      await input.fill(awayNames[i]);
      await input.blur();
      
      await page.waitForSelector('.player-name-input', { state: 'detached' });
      await expect(player).toHaveText(awayNames[i]);
    }
    
    // Change formation to 3-2-1 (valid 7-player formation)
    await page.selectOption('#myTeamFormation', '321');
    await page.waitForTimeout(1000);
    
    // Verify names are preserved
    for (let i = 0; i < homeNames.length; i++) {
      await expect(page.locator('.my-team .player-name').nth(i)).toHaveText(homeNames[i]);
    }
    
    for (let i = 0; i < awayNames.length; i++) {
      await expect(page.locator('.opp-team .player-name').nth(i)).toHaveText(awayNames[i]);
    }
  });

  test('should work on mobile viewport for 7v7', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/7s.html');
    
    // Check mobile-specific elements
    await expect(page.getByText('SHARE IMAGE')).toBeVisible();
    
    // Mode buttons should be visible on mobile (use button selector to avoid duplicate)
    const modeButton = page.locator('button.mode-btn', { hasText: '7v7' });
    await expect(modeButton).toBeVisible();
    
    // Formation controls should be visible
    const controls = page.locator('.controls');
    await expect(controls).toBeVisible();
  });

  test('should edit 7v7 player names', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    
    // Wait for players to load
    await page.waitForSelector('.player-name');
    
    // Click on first player name to edit
    const firstPlayerName = page.locator('.my-team .player-name').first();
    await firstPlayerName.click();
    
    // Fill input and save
    const input = page.locator('.player-name-input');
    await input.fill('EDITED 7V7');
    await input.blur();
    
    // Wait for input to disappear
    await page.waitForSelector('.player-name-input', { state: 'detached' });
    
    // Verify name was changed
    await expect(firstPlayerName).toHaveText('EDITED 7V7');
  });

  test('should generate shareable URL for 7v7', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    
    // Wait for page to load
    await page.waitForSelector('#field');
    
    // Set custom names for 7v7 players
    const homeNames = ['7A', '7B', '7C', '7D', '7E', '7F', '7G'];
    for (let i = 0; i < homeNames.length; i++) {
      const player = page.locator('.my-team .player-name').nth(i);
      await player.evaluate((el, name) => {
        el.textContent = name;
      }, homeNames[i]);
    }
    
    // Override shareURL function
    await page.evaluate(() => {
      window.capturedShareUrl = '';
      const originalShareURL = window.shareURL;
      window.shareURL = function(url) {
        window.capturedShareUrl = url;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).catch(() => {});
        }
      };
    });
    
    // Click share formation button
    await page.getByText('SHARE FORMATION').click();
    await page.waitForTimeout(1000);
    
    // Get the captured URL
    const shareUrl = await page.evaluate(() => window.capturedShareUrl);
    expect(shareUrl).toBeTruthy();
    expect(shareUrl).toContain('#f=');
    
    // Convert to localhost for testing
    const localUrl = shareUrl.replace('https://easyfootballlineup.com', 'http://localhost:8080');
    
    // Test that the URL loads correctly
    await page.goto(localUrl);
    await page.waitForSelector('#field');
    
    // Verify names were preserved
    for (let i = 0; i < homeNames.length; i++) {
      const player = page.locator('.my-team .player-name').nth(i);
      await expect(player).toHaveText(homeNames[i]);
    }
  });

  // 6v6 Format Tests
  test('should load 6v6 format and display formation controls', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    
    // Check page title
    await expect(page).toHaveTitle(/6v6 Football Formation/);
    
    // Check formation selectors exist (6v6 only has home team formation)
    await expect(page.locator('#myTeamFormation')).toBeVisible();
    
    // Check action buttons exist
    await expect(page.getByText('SHARE FORMATION')).toBeVisible();
    const downloadBtn = page.locator('#downloadBtn');
    await expect(downloadBtn).toBeVisible();
    
    // Check mode toggle buttons (use button selectors to avoid duplicates)
    await expect(page.locator('button.mode-btn', { hasText: '11v11' })).toBeVisible();
    await expect(page.locator('button.mode-btn', { hasText: '7v7' })).toBeVisible();
    await expect(page.locator('button.mode-btn', { hasText: '6v6' })).toBeVisible();
  });

  test('should change 6v6 formation and update players', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    
    // Wait for page to load
    await page.waitForSelector('#field');
    
    // Should have 12 players total (6 home + 6 away)
    const initialPlayers = await page.locator('.player').count();
    expect(initialPlayers).toBe(12);
    
    // Change home team formation to 2-1-2
    await page.selectOption('#myTeamFormation', '212');
    
    // Players should still be 12
    const playersAfterChange = await page.locator('.player').count();
    expect(playersAfterChange).toBe(12);
  });

  test('should preserve names when changing 6v6 formations', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    
    // Wait for players to load
    await page.waitForSelector('.my-team .player-name');
    
    // Edit home team names (first 3 players)
    const homeNames = ['6V6 A', '6V6 B', '6V6 C'];
    for (let i = 0; i < homeNames.length; i++) {
      const player = page.locator('.my-team .player-name').nth(i);
      await player.click();
      
      const input = page.locator('.player-name-input');
      await input.fill(homeNames[i]);
      await input.blur();
      
      await page.waitForSelector('.player-name-input', { state: 'detached' });
      await expect(player).toHaveText(homeNames[i]);
    }
    
    // Edit away team names (first 2 players)
    const awayNames = ['AWAY 6A', 'AWAY 6B'];
    for (let i = 0; i < awayNames.length; i++) {
      const player = page.locator('.opp-team .player-name').nth(i);
      await player.click();
      
      const input = page.locator('.player-name-input');
      await input.fill(awayNames[i]);
      await input.blur();
      
      await page.waitForSelector('.player-name-input', { state: 'detached' });
      await expect(player).toHaveText(awayNames[i]);
    }
    
    // Change formation
    await page.selectOption('#myTeamFormation', '212');
    await page.waitForTimeout(1000);
    
    // Verify names are preserved
    for (let i = 0; i < homeNames.length; i++) {
      await expect(page.locator('.my-team .player-name').nth(i)).toHaveText(homeNames[i]);
    }
    
    for (let i = 0; i < awayNames.length; i++) {
      await expect(page.locator('.opp-team .player-name').nth(i)).toHaveText(awayNames[i]);
    }
  });

  test('should work on mobile viewport for 6v6', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/6s.html');
    
    // Check mobile-specific elements
    await expect(page.getByText('SHARE IMAGE')).toBeVisible();
    
    // Mode buttons should be visible on mobile (use button selector to avoid duplicate)
    const modeButton = page.locator('button.mode-btn', { hasText: '6v6' });
    await expect(modeButton).toBeVisible();
    
    // Formation controls should be visible
    const controls = page.locator('.controls');
    await expect(controls).toBeVisible();
  });

  test('should edit 6v6 player names', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    
    // Wait for players to load
    await page.waitForSelector('.player-name');
    
    // Click on first player name to edit
    const firstPlayerName = page.locator('.my-team .player-name').first();
    await firstPlayerName.click();
    
    // Fill input and save
    const input = page.locator('.player-name-input');
    await input.fill('EDITED 6V6');
    await input.blur();
    
    // Wait for input to disappear
    await page.waitForSelector('.player-name-input', { state: 'detached' });
    
    // Verify name was changed
    await expect(firstPlayerName).toHaveText('EDITED 6V6');
  });

  test('should generate shareable URL for 6v6', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    
    // Wait for page to load
    await page.waitForSelector('#field');
    
    // Set custom names for 6v6 players
    const homeNames = ['6A', '6B', '6C', '6D', '6E', '6F'];
    for (let i = 0; i < homeNames.length; i++) {
      const player = page.locator('.my-team .player-name').nth(i);
      await player.evaluate((el, name) => {
        el.textContent = name;
      }, homeNames[i]);
    }
    
    // Override shareURL function
    await page.evaluate(() => {
      window.capturedShareUrl = '';
      const originalShareURL = window.shareURL;
      window.shareURL = function(url) {
        window.capturedShareUrl = url;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).catch(() => {});
        }
      };
    });
    
    // Click share formation button
    await page.getByText('SHARE FORMATION').click();
    await page.waitForTimeout(1000);
    
    // Get the captured URL
    const shareUrl = await page.evaluate(() => window.capturedShareUrl);
    expect(shareUrl).toBeTruthy();
    expect(shareUrl).toContain('#f=');
    
    // Convert to localhost for testing
    const localUrl = shareUrl.replace('https://easyfootballlineup.com', 'http://localhost:8080');
    
    // Test that the URL loads correctly
    await page.goto(localUrl);
    await page.waitForSelector('#field');
    
    // Verify names were preserved
    for (let i = 0; i < homeNames.length; i++) {
      const player = page.locator('.my-team .player-name').nth(i);
      await expect(player).toHaveText(homeNames[i]);
    }
  });

  // Formation Validation Tests
  test('should have valid 11v11 formations with 11 players each', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    
    // Wait for initial players to load
    await page.waitForSelector('.my-team .player-name');
    
    // Get all formation options
    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      const options = Array.from(select.options);
      return options.map(option => ({
        value: option.value,
        text: option.text
      }));
    });
    
    // Test each formation has exactly 11 players
    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      
      // Wait for formation change to complete and players to be rendered
      await page.waitForFunction(() => {
        return document.querySelectorAll('.my-team .player-name').length > 0;
      });
      
      const playerCount = await page.locator('.my-team .player-name').count();
      expect(playerCount).toBe(11, `Formation ${formation.text} should have 11 players, got ${playerCount}`);
    }
  });

  test('should have valid 7v7 formations with 7 players each', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    
    // Wait for initial players to load
    await page.waitForSelector('.my-team .player-name');
    
    // Get all formation options
    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      const options = Array.from(select.options);
      return options.map(option => ({
        value: option.value,
        text: option.text
      }));
    });
    
    // Test each formation has exactly 7 players
    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      
      // Wait for formation change to complete and players to be rendered
      await page.waitForFunction(() => {
        return document.querySelectorAll('.my-team .player-name').length > 0;
      });
      
      const playerCount = await page.locator('.my-team .player-name').count();
      expect(playerCount).toBe(7, `Formation ${formation.text} should have 7 players, got ${playerCount}`);
    }
    
    // Verify 3-2-2 is not available (would be 8 players)
    const formationValues = formations.map(f => f.value);
    expect(formationValues).not.toContain('322');
  });

  test('should have valid 6v6 formations with 6 players each', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    
    // Wait for initial players to load
    await page.waitForSelector('.my-team .player-name');
    
    // Get all formation options
    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      const options = Array.from(select.options);
      return options.map(option => ({
        value: option.value,
        text: option.text
      }));
    });
    
    // Test each formation has exactly 6 players
    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      
      // Wait for formation change to complete and players to be rendered
      await page.waitForFunction(() => {
        return document.querySelectorAll('.my-team .player-name').length > 0;
      });
      
      const playerCount = await page.locator('.my-team .player-name').count();
      expect(playerCount).toBe(6, `Formation ${formation.text} should have 6 players, got ${playerCount}`);
    }
  });
});
