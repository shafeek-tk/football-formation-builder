# File Size Comparison

## Line Count
- index.html: 200 lines
- 7s.html: 99 lines  
- 6s.html: 95 lines

## Breakdown

### index.html (200 lines)
- **Head section**: ~82 lines
  - SEO meta tags (15 lines) - Main landing page needs extensive SEO
  - Open Graph tags (11 lines) - Social media previews
  - Twitter Card tags (5 lines)
  - Schema.org JSON-LD (15 lines)
  - Redirect script (5 lines)
  - Other meta tags (31 lines)
  
- **Body section**: ~118 lines
  - Header/controls: ~30 lines
  - Formation selectors: ~50 lines (23 formations × 2 dropdowns)
  - Field: ~5 lines
  - Scripts: ~20 lines
  - Initialization: ~13 lines

### 7s.html (99 lines)
- **Head section**: ~26 lines
  - Basic SEO meta tags (5 lines)
  - Open Graph tags (4 lines)
  - Minimal meta (17 lines)
  
- **Body section**: ~73 lines
  - Header/controls: ~30 lines
  - Formation selectors: ~20 lines (7 formations × 2 dropdowns)
  - Field: ~5 lines
  - Scripts: ~15 lines
  - Initialization: ~3 lines

### 6s.html (95 lines)
- Similar to 7s.html but with 5 formations

## Why index.html is Larger

### Justified Differences ✅
1. **SEO Requirements** (+56 lines)
   - Main landing page needs comprehensive meta tags
   - Social media preview tags
   - Schema.org structured data
   - Multiple locale tags

2. **More Formations** (+30 lines)
   - 23 formations vs 7 (7s) or 5 (6s)
   - Each formation = 2 lines (home + away dropdown)

### Structure is Identical ✅
All three pages have the same structure:
- Header with title/subtitle
- Controls (share/download buttons)
- Formation selectors (home/away)
- Field container
- Mode toggle
- Scripts
- Initialization

## Conclusion

**The size difference is appropriate and necessary:**
- index.html is the main landing page → needs full SEO
- index.html has 3-4x more formations → needs more options
- Core structure is identical across all pages ✅
- No unnecessary duplication ✅

**Current state is optimal!**
