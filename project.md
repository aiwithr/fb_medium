# Technical Documentation: FB → Medium Copier

## Overview

A static web app that helps you cross-post content from Facebook to Medium without losing any posts. Works entirely in the browser using GitHub Pages.

---

## Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌────────────────┐
│  fb_posts.db    │ ──── │ export_posts │ ──── │  posts.json    │
│  (SQLite)       │      │    .py       │      │  (6,287 posts) │
└─────────────────┘      └──────────────┘      └───────┬────────┘
                                                       │
                                                       ▼
┌─────────────────┐      ┌──────────────┐      ┌────────────────┐
│  Your Browser   │ ◄── │  GitHub      │ ◄─── │  GitHub Repo   │
│  (index.html)   │      │  Pages       │      │  (static host) │
└────────┬────────┘      └──────────────┘      └────────┬───────┘
         │                                             │
         │  User clicks "Mark Posted"                 │
         │            │                                │
         ▼            ▼                                │
┌─────────────────┐      ┌──────────────┐              │
│  GitHub Issue   │ ──── │  GitHub      │              │
│  created        │      │  Action      │ ◄───────────┘
└─────────────────┘      │  updates     │
                        │ posted_ids.json              │
                        └─────────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | HTML/CSS/JS | No framework, runs anywhere |
| Hosting | GitHub Pages | Free, unlimited, fast |
| Data | JSON files in GitHub | Persistent storage |
| Tracking | GitHub Issues | Audit trail + automation |
| Automation | GitHub Actions | Update posted_ids.json |

### Why This Architecture?

| Option | Pros | Cons |
|--------|------|------|
| SQLite + Streamlit | Full-featured | Needs server, costs money |
| JSON + GitHub Pages | Free, simple | Manual refresh required |
| Real-time database | Always synced | Expensive hosting |

This project prioritizes **free hosting** and **zero maintenance** over real-time sync.

---

## File Structure

```
fb_to_medium_ghpages/
├── index.html              # Main app UI
├── styles.css              # Styling
├── app.js                  # Core logic + GitHub sync
├── posts.json              # Your Facebook posts (from export)
├── posted_ids.json         # IDs of posts you've marked as posted
├── project.md              # This documentation
├── README.md               # User-facing documentation
├── scripts/
│   └── export_posts.py     # SQLite → JSON export script
└── .github/
    └── workflows/
        └── track_posts.yml # GitHub Action for auto-updating
```

---

## Key Files Explained

### posts.json

Contains all your Facebook posts with metadata:

```json
{
  "exported_at": "2024-01-15T10:30:00Z",
  "total_posts": 6287,
  "posts": [
    {
      "id": "1234567890_9876543210",
      "date": "2024-01-10",
      "content": "Just finished reading...",
      "category": "ai_ml",
      "word_count": 250,
      "char_count": 1500,
      "post_type": "note",
      "has_media": 0
    }
  ]
}
```

### posted_ids.json

Tracks which posts you've marked as posted:

```json
{
  "posted": ["1234567890_9876543210", "..."],
  "updated_at": "2024-01-15T12:00:00Z",
  "updated_by": "github-action"
}
```

### app.js - Core Functions

| Function | Purpose |
|----------|---------|
| `loadData()` | Fetches posts.json and posted_ids.json from GitHub |
| `applyFilters()` | Filters posts by date, category, word count |
| `renderPosts()` | Renders current page of posts |
| `copyPost(id)` | Copies post content to clipboard |
| `markPosted(id)` | Opens confirmation modal |
| `confirmMarkPosted()` | Creates GitHub Issue, adds to local set |
| `openGitHubIssue(post)` | Opens pre-filled GitHub Issue |

---

## Workflow: "Mark Posted"

```
User clicks "Mark Posted"
         │
         ▼
┌─────────────────────┐
│ Confirmation Modal  │ ◄── Safety Layer 1: Confirm explicit action
│ "Are you sure?"    │
└─────────┬───────────┘
          │
          │ User clicks "Open GitHub Issue"
          ▼
┌─────────────────────┐
│ GitHub Issue opens  │ ◄── Safety Layer 2: Issue must be closed
│ Pre-filled template│     to complete action
└─────────┬───────────┘
          │
          │ User closes issue in GitHub
          ▼
┌─────────────────────┐
│ GitHub Action runs  │ ◄── Safety Layer 3: Action updates JSON
│ Updates posted_ids  │
└─────────┬───────────┘
          │
          │ User presses Refresh in app
          ▼
┌─────────────────────┐
│ Post disappears     │ ◄── Post is now hidden from list
│ from active list   │
└─────────────────────┘
```

---

## Safety Features

### 3-Layer Protection

| Layer | Protection | What Happens If... |
|-------|-----------|---------------------|
| **Modal** | Must confirm before GitHub Issue opens | Accidental clicks blocked |
| **Issue First** | Issue opens before anything changes | Can verify/cancel before commit |
| **Manual Refresh** | User controls when to reload data | Browser crash = nothing lost |
| **Audit Trail** | GitHub Issues remain in history | Can reopen to undo |

### Never Automatic

The app NEVER automatically:
1. Deletes posts from posts.json
2. Modifies your GitHub data
3. Hides posts without explicit refresh

### Recovery Procedures

| Problem | Recovery |
|---------|----------|
| Accidentally marked wrong post | Reopen the GitHub Issue |
| Want to include post again | Add ID back to posted_ids.json manually |
| GitHub Action fails | Issue stays open, fix and close manually |
| Local cache corrupted | Click "Reset Local" in sidebar |

---

## GitHub Actions Details

### When it runs

```yaml
on:
  issues:
    types: [closed, reopened]
```

### What it does

1. **On issue CLOSED:** Add post ID to `posted_ids.json`
2. **On issue REOPENED:** Remove post ID from `posted_ids.json`

### Security Notes

- Uses `GITHUB_TOKEN` for authentication
- Limited to `contents: write` permission
- Only processes issues with `[POSTED]` prefix
- All changes are logged in commit history

---

## Deployment

### Prerequisites

1. GitHub account
2. Your posts exported to `posts.json`
3. Empty `posted_ids.json` file

### Steps

1. **Create GitHub Repo**
   ```
   gh repo create fb-medium-copier --public
   ```

2. **Push files**
   ```bash
   cd fb_to_medium_ghpages
   git init
   git add .
   git commit -m "Initial upload"
   git remote add origin https://github.com/YOUR_USERNAME/fb-medium-copier.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   ```
   Settings → Pages → Source: Deploy from branch → main → / (root)
   ```

4. **Wait 2-3 minutes**
   - Your app will be live at: `https://YOUR_USERNAME.github.io/fb-medium-copier/`

---

## Export Script

### Running locally

```bash
# Make sure you have the original SQLite database
python scripts/export_posts.py
```

### What it does

1. Connects to `fb_posts.db`
2. Exports all posts with metadata
3. Categorizes posts automatically:
   - `ai_ml` - AI/ML related
   - `tech` - Technology
   - `tutorial` - How-to guides
   - `books` - Book related
   - `thoughts` - Personal thoughts
   - `bengali` - Bengali language posts
   - `general` - Everything else
4. Outputs to `posts.json` and `posted_ids.json`

### Encoding Fix

Facebook exports inconsistent encodings. The script normalizes:
- `\u00e2\u0080\u0099` → `'`
- `\u00e2\u0080\u009c` → `"` (left)
- `\u00e2\u0080\u009d` → `"` (right)
- `\u00c2` removals
- Double-spaces

---

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Tested |
| Firefox | 88+ | ✅ Should work |
| Safari | 14+ | ✅ Should work |
| Edge | 90+ | ✅ Should work |

**No Internet Explorer support.**

---

## Performance

| Metric | Value |
|--------|-------|
| Initial load | ~1-2 seconds |
| Posts per page | 10 |
| Total JSON size | ~2-5 MB (6,287 posts) |
| Filtering | Instant (<50ms) |

---

## Customization

### Change posts per page

In `app.js`:
```javascript
const POSTS_PER_PAGE = 10; // change to 20, 50, etc.
```

### Add new categories

1. Update `scripts/export_posts.py` categorization logic
2. Update `formatCategory()` in `app.js`
3. Update CSS with new color in `.post-category`

### Modify confirmation modal

Find in `index.html`:
```html
<div id="confirmModal" class="modal">
```

And modify the content inside.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT - Use freely, no attribution required.

---

## Questions?

Open an issue on GitHub or check the README for quick start guide.
