# Technical Documentation: FB → Medium Copier

**Live URL:** https://aiwithr.github.io/fb_medium/  
**Last Updated:** May 29, 2026

---

## Architecture

```
fb_posts.db → export_posts.py → posts_1.json to posts_21.json → GitHub Pages
                                                                     ↓
                                                          User Browser (index.html)
                                                                     ↓
                                    GitHub Issue ← Mark Posted → GitHub Action
```

---

## Key Functions (app.js)

| Function | Purpose |
|----------|---------|
| `loadPosts()` | Fetch all 21 JSON chunks |
| `selectPost(id)` | Show post preview |
| `copyPost()` | Copy to clipboard |
| `markPosted()` | GitHub Issue workflow |
| `filter()` | Category/date filters |

---

## Safety Features

### 3-Layer Protection
1. **Modal** - Must confirm before GitHub Issue opens
2. **Issue First** - Post stays visible until commit
3. **Manual Refresh** - User controls when to reload

### Recovery
- Accidentally marked? → Reopen GitHub Issue
- Want to re-post? → Add ID back to `posted_ids.json`

---

## Files

```
fb_to_medium_ghpages/
├── index.html              # Main app UI
├── styles.css              # Styling  
├── app.js                   # Core logic
├── .nojekyll               # GitHub Pages config
├── posts_1.json to posts_21.json  # 6,287 posts
├── posted_ids.json         # Posted tracking
└── scripts/
    └── export_posts.py     # SQLite → JSON
```

---

## Deployment

```bash
git push origin main
# Enable GitHub Pages: Settings → Pages → main/(root)
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Posts | 6,287 |
| JSON Chunks | 21 |
| Size | ~8.05 MB |
| Cost | $0 |

---

## Bug Fixes Log

| Commit | Fix |
|--------|-----|
| 9e97fd1 | Fixed empty state hiding |
| eb563d9 | Added .nojekyll |
| b32ce7c | Accessibility + keyboard nav |
