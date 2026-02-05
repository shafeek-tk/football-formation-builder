#!/bin/bash

echo "=== MIGRATION SCRIPT: Refactored → Original ==="
echo ""

# Create backup
echo "1. Creating backup of original files..."
BACKUP_DIR="../backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp ../*.html "$BACKUP_DIR/" 2>/dev/null
cp ../*.css "$BACKUP_DIR/" 2>/dev/null
cp ../*.js "$BACKUP_DIR/" 2>/dev/null
cp ../*.png "$BACKUP_DIR/" 2>/dev/null
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Verify GA ID is correct
echo "2. Verifying Google Analytics ID..."
GA_COUNT=$(grep -c "G-BGH9W2K44G" index.html)
if [ "$GA_COUNT" -gt 0 ]; then
    echo "✅ Google Analytics ID is correct (G-BGH9W2K44G)"
else
    echo "❌ ERROR: Google Analytics ID not found!"
    exit 1
fi
echo ""

# List files to be migrated
echo "3. Files to be migrated:"
echo "HTML files:"
ls -1 *.html | grep -v "simple\|template\|test"
echo ""
echo "CSS files:"
ls -1 css/*.css
echo ""
echo "JS files:"
ls -1 js/*.js
echo ""
echo "Images:"
ls -1 *.png
echo ""

# Confirm before proceeding
echo "4. Ready to migrate. This will:"
echo "   - Copy all refactored files to parent directory"
echo "   - Overwrite existing files"
echo "   - Backup is saved at: $BACKUP_DIR"
echo ""
read -p "Proceed with migration? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

# Perform migration
echo ""
echo "5. Migrating files..."

# Copy HTML files
cp index.html 6s.html 7s.html 8s.html 9s.html ../
echo "✅ HTML files copied"

# Copy CSS files
mkdir -p ../css
cp css/*.css ../css/
echo "✅ CSS files copied"

# Copy JS files
mkdir -p ../js
cp js/*.js ../js/
echo "✅ JS files copied"

# Copy images
cp *.png ../
echo "✅ Images copied"

# Copy other files
cp README.md ../README.md 2>/dev/null
echo "✅ README copied"

echo ""
echo "=== MIGRATION COMPLETE ==="
echo ""
echo "Summary:"
echo "- Backup location: $BACKUP_DIR"
echo "- Files migrated: HTML (5), CSS (2), JS (6), Images (2)"
echo "- New pages added: 8s.html, 9s.html"
echo "- Google Analytics: G-BGH9W2K44G ✅"
echo ""
echo "Next steps:"
echo "1. Test all pages in parent directory"
echo "2. Verify Google Analytics is tracking"
echo "3. Test share and download functionality"
echo "4. Deploy to production"
