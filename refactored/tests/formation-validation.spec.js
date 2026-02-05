const { test, expect } = require('@playwright/test');

test.describe('Formation Validation - Player Count', () => {
  
  test('11v11 formations should all have exactly 11 players', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    await page.waitForSelector('.field');
    
    // Get all formation options
    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      return Array.from(select.options).map(opt => ({
        value: opt.value,
        label: opt.text
      }));
    });
    
    console.log(`Testing ${formations.length} formations for 11v11`);
    
    // Test each formation
    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      await page.waitForTimeout(300);
      
      const homeCount = await page.locator('.my-team').count();
      expect(homeCount, `Formation ${formation.label} (${formation.value}) should have 11 home players`).toBe(11);
      
      const awayCount = await page.locator('.opp-team').count();
      expect(awayCount, `Formation ${formation.label} (${formation.value}) should have 11 away players`).toBe(11);
    }
  });

  test('9v9 formations should all have exactly 9 players', async ({ page }) => {
    await page.goto('http://localhost:8080/9s.html');
    await page.waitForSelector('.field');
    
    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      return Array.from(select.options).map(opt => ({
        value: opt.value,
        label: opt.text
      }));
    });
    
    console.log(`Testing ${formations.length} formations for 9v9`);
    
    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      await page.waitForTimeout(300);
      
      const homeCount = await page.locator('.my-team').count();
      expect(homeCount, `Formation ${formation.label} (${formation.value}) should have 9 home players`).toBe(9);
      
      const awayCount = await page.locator('.opp-team').count();
      expect(awayCount, `Formation ${formation.label} (${formation.value}) should have 9 away players`).toBe(9);
    }
  });

  test('8v8 formations should all have exactly 8 players', async ({ page }) => {
    await page.goto('http://localhost:8080/8s.html');
    await page.waitForSelector('.field');
    
    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      return Array.from(select.options).map(opt => ({
        value: opt.value,
        label: opt.text
      }));
    });
    
    console.log(`Testing ${formations.length} formations for 8v8`);
    
    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      await page.waitForTimeout(300);
      
      const homeCount = await page.locator('.my-team').count();
      expect(homeCount, `Formation ${formation.label} (${formation.value}) should have 8 home players`).toBe(8);
      
      const awayCount = await page.locator('.opp-team').count();
      expect(awayCount, `Formation ${formation.label} (${formation.value}) should have 8 away players`).toBe(8);
    }
  });

  test('7v7 formations should all have exactly 7 players', async ({ page }) => {
    await page.goto('http://localhost:8080/7s.html');
    await page.waitForSelector('.field');
    
    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      return Array.from(select.options).map(opt => ({
        value: opt.value,
        label: opt.text
      }));
    });
    
    console.log(`Testing ${formations.length} formations for 7v7`);
    
    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      await page.waitForTimeout(300);
      
      const homeCount = await page.locator('.my-team').count();
      expect(homeCount, `Formation ${formation.label} (${formation.value}) should have 7 home players`).toBe(7);
      
      const awayCount = await page.locator('.opp-team').count();
      expect(awayCount, `Formation ${formation.label} (${formation.value}) should have 7 away players`).toBe(7);
    }
  });

  test('6v6 formations should all have exactly 6 players', async ({ page }) => {
    await page.goto('http://localhost:8080/6s.html');
    await page.waitForSelector('.field');
    
    const formations = await page.evaluate(() => {
      const select = document.getElementById('myTeamFormation');
      return Array.from(select.options).map(opt => ({
        value: opt.value,
        label: opt.text
      }));
    });
    
    console.log(`Testing ${formations.length} formations for 6v6`);
    
    for (const formation of formations) {
      await page.selectOption('#myTeamFormation', formation.value);
      await page.waitForTimeout(300);
      
      const homeCount = await page.locator('.my-team').count();
      expect(homeCount, `Formation ${formation.label} (${formation.value}) should have 6 home players`).toBe(6);
      
      const awayCount = await page.locator('.opp-team').count();
      expect(awayCount, `Formation ${formation.label} (${formation.value}) should have 6 away players`).toBe(6);
    }
  });

  test('Formation data validation - all formats', async () => {
    // This test validates the formation data directly
    const fs = require('fs');
    const path = require('path');
    const formationsFile = fs.readFileSync(path.join(__dirname, '../js/formations.js'), 'utf8');
    
    // Extract and evaluate formations
    const FORMATIONS_11V11 = {};
    const FORMATIONS_9V9 = {};
    const FORMATIONS_8V8 = {};
    const FORMATIONS_7V7 = {};
    const FORMATIONS_6V6 = {};
    
    eval(formationsFile);
    
    // Validate 11v11
    let count11 = 0;
    Object.entries(FORMATIONS_11V11).forEach(([key, formation]) => {
      const playerCount = formation.reduce((sum, layer) => sum + layer.length, 0);
      expect(playerCount, `11v11 formation ${key} should have 11 players`).toBe(11);
      count11++;
    });
    console.log(`✅ Validated ${count11} formations for 11v11`);
    
    // Validate 9v9
    let count9 = 0;
    Object.entries(FORMATIONS_9V9).forEach(([key, formation]) => {
      const playerCount = formation.reduce((sum, layer) => sum + layer.length, 0);
      expect(playerCount, `9v9 formation ${key} should have 9 players`).toBe(9);
      count9++;
    });
    console.log(`✅ Validated ${count9} formations for 9v9`);
    
    // Validate 8v8
    let count8 = 0;
    Object.entries(FORMATIONS_8V8).forEach(([key, formation]) => {
      const playerCount = formation.reduce((sum, layer) => sum + layer.length, 0);
      expect(playerCount, `8v8 formation ${key} should have 8 players`).toBe(8);
      count8++;
    });
    console.log(`✅ Validated ${count8} formations for 8v8`);
    
    // Validate 7v7
    let count7 = 0;
    Object.entries(FORMATIONS_7V7).forEach(([key, formation]) => {
      const playerCount = formation.reduce((sum, layer) => sum + layer.length, 0);
      expect(playerCount, `7v7 formation ${key} should have 7 players`).toBe(7);
      count7++;
    });
    console.log(`✅ Validated ${count7} formations for 7v7`);
    
    // Validate 6v6
    let count6 = 0;
    Object.entries(FORMATIONS_6V6).forEach(([key, formation]) => {
      const playerCount = formation.reduce((sum, layer) => sum + layer.length, 0);
      expect(playerCount, `6v6 formation ${key} should have 6 players`).toBe(6);
      count6++;
    });
    console.log(`✅ Validated ${count6} formations for 6v6`);
    
    console.log(`✅ Total: ${count11 + count9 + count8 + count7 + count6} formations validated`);
  });
});
