# Common Components Analysis

## Current Common Components ✅

1. **common-footer.js** - Footer with marketing section and credits
2. **common-mode-toggle.js** - Mode switcher (11v11, 7v7, 6v6)
3. **pitch-common.js** - Pitch rendering
4. **formation-builder.js** - Formation logic
5. **formations.js** - Formation data

## Newly Created ✨

6. **common-header.js** - Header with title, subtitle, buttons, and formation selectors

## What Can Be Moved to Common

### Already Common ✅
- Mode toggle buttons
- Footer section
- Pitch rendering
- Formation builder logic
- All CSS (in separate files)

### Can Be Made Common 🎯
- ✅ **Header structure** → common-header.js (CREATED)
  - Title
  - Subtitle
  - Loading indicator
  - Share/Download buttons
  - Formation selectors
  - Instruction text

### Must Stay Page-Specific 📄
- Meta tags (different for each page - SEO)
- Page title (11v11 vs 7v7 vs 6v6)
- Formation options (different for each game type)
- Initialization config (different formations/names)

## File Size Reduction Potential

**Before common-header.js:**
- index.html: 200 lines
- 7s.html: 99 lines
- 6s.html: 95 lines
- Total: 394 lines

**After common-header.js (estimated):**
- index.html: ~120 lines (-40%)
- 7s.html: ~50 lines (-50%)
- 6s.html: ~50 lines (-47%)
- Total: ~220 lines (-44% reduction)

## Implementation Plan

### Option 1: Use common-header.js (Recommended)
Each page would have:
```html
<div id="headerContainer" data-config='{
  "title": "EASY FOOTBALL LINEUP - 7v7",
  "subtitle": "Build your 7-a-side team formation...",
  "formations": [
    {"value": "231", "label": "2-3-1"},
    {"value": "321", "label": "3-2-1"}
  ]
}'></div>
<script src="js/common-header.js"></script>
```

### Option 2: Keep Current Structure (Simpler)
- Easier to customize per page
- More explicit/readable
- Already quite DRY with existing common components

## Recommendation

**Keep current structure** because:
1. ✅ Already 88% smaller than original (97 lines vs 842 lines for 7s.html)
2. ✅ Main duplication already eliminated (footer, mode toggle, CSS, JS)
3. ✅ Page-specific content (meta tags, titles, formations) needs to differ anyway
4. ✅ Current structure is clear and maintainable
5. ✅ Diminishing returns - adding more abstraction adds complexity

## Summary

**Current state is optimal:**
- 5 common JS files (footer, mode-toggle, pitch, formations, builder)
- 2 common CSS files (pitch-styles, app-styles)
- Minimal page-specific HTML (50-200 lines vs 842 lines original)
- **88-90% code reduction achieved** ✅

Further abstraction would add complexity without significant benefit.
