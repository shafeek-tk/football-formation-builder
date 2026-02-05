# Refactored Football Formation Builder

This is a completely refactored version of the Easy Football Lineup project with **zero code duplication**.

## Key Improvements

### 🚀 Zero Duplication
- **Single FormationBuilder class** handles all game types (11v11, 7v7, 6v6)
- **Shared formation data** in separate module
- **Common styles** split into pitch-styles.css and app-styles.css
- **Reusable components** for all functionality

### 📁 Clean Architecture
```
refactored/
├── index.html          # 11v11 (22 players)
├── 7s.html            # 7v7 (7 players)  
├── 6s.html            # 6v6 (6 players)
├── css/
│   ├── pitch-styles.css    # Pitch rendering
│   └── app-styles.css      # UI components
├── js/
│   ├── formation-builder.js # Core logic
│   ├── formations.js       # Formation data
│   └── pitch-common.js     # Pitch initialization
└── tests/
    └── formation-builder.spec.js # Unified tests
```

### 🔧 Configuration-Driven
Each page initializes with specific config:
```javascript
const formationBuilder = new FormationBuilder({
    gameType: '11v11',
    formations: FORMATIONS_11V11,
    defaultNames: DEFAULT_NAMES_11V11,
    fieldMargin: 8
});
```

### ✅ Improved Testing
- **Single test suite** covers all game types
- **Graceful exit** - tests run and exit properly
- **Better error handling** with console output
- **Timeout protection** prevents hanging

## Usage

```bash
cd refactored
npm install
npm test        # Run tests with auto-exit
./run-tests.sh  # Run with timeout protection
```

## Features Maintained
- ✅ All original functionality preserved
- ✅ Same visual design and UX
- ✅ URL sharing with compression
- ✅ Image download/sharing
- ✅ Player name editing
- ✅ Formation switching
- ✅ Mobile responsive
- ✅ Local storage persistence

## Code Reduction
- **~70% less code** through elimination of duplication
- **Single source of truth** for all logic
- **Maintainable** - changes in one place affect all pages
- **Extensible** - easy to add new game types
