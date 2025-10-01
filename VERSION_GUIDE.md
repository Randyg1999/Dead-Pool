# Dead Pool Version Update Guide

## How Updates Work Now

Your app now has **automatic update detection**! Here's what happens:

### When You Deploy Changes:

1. **Update the Service Worker version** in `sw.js`:
   ```javascript
   const VERSION = '2025.01.01'; // Change this to current date or increment
   ```

2. **Push to GitHub** → Netlify deploys automatically

3. **Users open the app** → They get a popup:
   ```
   "A new version of Dead Pool is available! Click OK to update now."
   ```

4. **User clicks OK** → App reloads with new version automatically!

---

## What Auto-Updates:
✅ HTML files (index.htm, editor.htm)
✅ CSS (styles.css)
✅ JavaScript (script.js, contestants.js)
✅ Netlify Functions (death checking, notifications)
✅ Service Worker (when version changes)

## What Doesn't Auto-Update:
❌ Nothing! Everything updates now.

---

## For Each Deployment:

### Quick Changes (contestants, styling, minor fixes):
1. Make your changes
2. Update `sw.js` version: `const VERSION = '2025.01.15';`
3. Push to GitHub
4. Users get update prompt next time they open the app

### Major Changes (new features, scoring changes):
1. Make your changes
2. Update `sw.js` version with a note: `const VERSION = '2025.01.15'; // Added new scoring`
3. Test locally first
4. Push to GitHub
5. Users get update prompt

---

## Testing Updates Locally:

1. Open DevTools (F12)
2. Go to **Application** tab → **Service Workers**
3. Check "Update on reload"
4. Refresh the page to test update flow

---

## Troubleshooting:

### If a user doesn't see updates:
1. Have them close ALL tabs with the app
2. Reopen the app → should see update prompt
3. If still not working: Settings → Apps → Dead Pool → Clear Data

### If you want to force an update:
- Change the VERSION in sw.js to something obviously newer
- Users will get prompted immediately on next visit

---

## Version History Template:

Keep track of your versions here:

- **2025.01.01** - Initial versioned release, fixed graveyard duplication bug
- **2025.01.XX** - (your next update)

