# Playwright Testing Setup

## 🧪 **Test Suite for Football Formation Builder**

This project includes comprehensive end-to-end tests using Playwright to ensure the formation builder works correctly across different browsers and devices.

## 📋 **Test Coverage**

### ✅ **Working Tests:**
- Homepage loading and controls display
- Formation changes and player updates  
- Format switching (11v11 ↔ 7v7 ↔ 6v6)
- Mobile responsiveness
- Basic functionality verification

### 🔧 **Tests Needing Fixes:**
- Player name editing (needs proper input handling)
- URL sharing (clipboard API mocking)
- Active button state detection
- Name preservation during formation changes

## 🚀 **Running Tests**

### **Quick Start:**
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with browser UI (helpful for debugging)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# View test report
npm run test:report
```

### **Manual Test Runner:**
```bash
# Use the provided script
./run-tests.sh
```

## 🎯 **Test Categories**

### **Core Functionality:**
- Formation selector changes
- Player positioning
- Mode switching between formats
- Button interactions

### **Mobile Testing:**
- Responsive design verification
- Touch interactions
- Mobile-specific UI elements
- Viewport adaptations

### **Cross-Browser:**
- Chromium (Chrome/Edge)
- Mobile Chrome simulation
- Firefox and WebKit (can be enabled)

## 📊 **Current Status**

**Passing:** 7/18 tests ✅  
**Failing:** 11/18 tests ❌

The failing tests are mostly due to:
1. Player name editing implementation differences
2. Clipboard API mocking needs refinement
3. CSS class detection for active states
4. Timing issues with dynamic content

## 🔧 **Next Steps**

1. **Fix player editing tests** - Update to match actual implementation
2. **Improve clipboard mocking** - Better simulation of share functionality  
3. **Add visual regression tests** - Screenshot comparisons
4. **Performance testing** - Load time and interaction speed
5. **Accessibility testing** - Screen reader and keyboard navigation

## 📁 **File Structure**

```
tests/
├── formation-builder.spec.js  # Main test suite
playwright.config.js           # Playwright configuration
run-tests.sh                  # Test runner script
```

## 🐛 **Debugging**

- Use `npm run test:ui` for interactive debugging
- Check `test-results/` folder for failure screenshots
- Use `--headed` flag to see browser actions
- Add `await page.pause()` in tests for manual inspection
