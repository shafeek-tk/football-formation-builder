#!/bin/bash

echo "=== PRE-MIGRATION CHECKLIST ==="
echo ""

echo "1. Checking Google Analytics (gtag)..."
grep -r "gtag" refactored/*.html | head -5
echo ""

echo "2. Checking all required files exist..."
echo "HTML files:"
ls -1 refactored/*.html
echo ""
echo "CSS files:"
ls -1 refactored/css/*.css
echo ""
echo "JS files:"
ls -1 refactored/js/*.js
echo ""
echo "Images:"
ls -1 refactored/*.png 2>/dev/null || echo "No PNG files"
echo ""

echo "3. Checking for placeholder GA ID..."
grep -n "G-XXXXXXXXXX" refactored/*.html | wc -l
echo "occurrences of placeholder GA ID found"
echo ""

echo "4. Checking original GA ID..."
grep -o "G-[A-Z0-9]*" index.html | head -1
echo ""

echo "5. File count comparison..."
echo "Original HTML files: $(ls -1 *.html 2>/dev/null | wc -l)"
echo "Refactored HTML files: $(ls -1 refactored/*.html 2>/dev/null | wc -l)"
echo ""

echo "6. Checking for hardcoded URLs..."
grep -n "easyfootballlineup.com" refactored/index.html | head -3
echo ""

echo "=== CHECKLIST COMPLETE ==="
