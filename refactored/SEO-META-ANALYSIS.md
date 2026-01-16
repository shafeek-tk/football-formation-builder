# SEO Meta Tags - Can They Be Common?

## The Problem

Meta tags must be in the `<head>` section and need to be present in the initial HTML response for:
- Search engines (Google, Bing, etc.)
- Social media crawlers (Facebook, Twitter, LinkedIn)
- Browser rendering

JavaScript cannot inject meta tags dynamically because crawlers don't execute JavaScript.

## Solutions

### Option 1: Template File (Created) ✅
- Use `template.html` with placeholders like `{{TITLE}}`, `{{DESCRIPTION}}`
- Manually replace placeholders for each page
- **Pros**: Simple, works for static sites
- **Cons**: Manual process, not automated

### Option 2: Build Script 🔧
Create a build script that generates pages from template:

```bash
#!/bin/bash
# build-pages.sh

# Generate index.html
sed 's/{{TITLE}}/Free Football Formation Builder/g' template.html | \
sed 's/{{DESCRIPTION}}/Free online football formation builder.../g' | \
sed 's/{{CANONICAL}}/https:\/\/easyfootballlineup.com\//g' \
> index.html

# Generate 7s.html
sed 's/{{TITLE}}/7v7 Football Formation Builder/g' template.html | \
sed 's/{{DESCRIPTION}}/Free 7v7 football formation builder.../g' | \
sed 's/{{CANONICAL}}/https:\/\/easyfootballlineup.com\/7s.html/g' \
> 7s.html
```

**Pros**: Automated, DRY, easy to maintain
**Cons**: Requires build step

### Option 3: Server-Side Includes (SSI) 🌐
If using a web server that supports SSI:

```html
<!--#include virtual="common-head.html" -->
```

**Pros**: Dynamic, no build step
**Cons**: Requires server support (Apache, Nginx)

### Option 4: Static Site Generator 🏗️
Use tools like:
- Jekyll
- Hugo
- 11ty
- Astro

**Pros**: Professional, powerful, maintainable
**Cons**: Adds complexity, learning curve

## Current Situation

**Meta tags CANNOT be made common with pure client-side JavaScript** because:
1. ❌ Search engines need them before JS executes
2. ❌ Social media crawlers don't run JavaScript
3. ❌ Meta tags must be in initial HTML response

## Recommendation

For a static site like this, **keep meta tags in each HTML file** because:

1. ✅ **Simple and reliable** - No build process needed
2. ✅ **Easy to customize** - Each page has unique SEO needs
3. ✅ **No dependencies** - Works everywhere
4. ✅ **Already minimal** - Only 3 pages to maintain

The duplication is **acceptable** because:
- Only 3 pages total
- Meta tags are page-specific by nature (different titles, descriptions, URLs)
- The core logic/styling is already common (90% reduction achieved)

## Conclusion

**SEO meta tags should stay in each HTML file.** The current approach is optimal for a 3-page static site. Adding a build process would add complexity without significant benefit.

**Current state is best practice for static sites.** ✅
