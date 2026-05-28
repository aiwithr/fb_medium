# 📋 Facebook → Medium Copier

**Sync your Facebook posts to Medium without losing anything.**

A free, serverless web app that helps you browse your Facebook posts and copy them to Medium. No database, no server, just GitHub Pages + JSON files.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![GitHub Pages](https://img.shields.io/badge/hosting-GitHub%20Pages-blue)

---

## 🎯 What is this?

If you've been writing on Facebook for years and want to migrate to Medium, this tool helps you:

- 📚 **Browse** all your Facebook posts in one place
- 📋 **Copy** post content with one click
- ✅ **Track** what's been posted to Medium
- 🔒 **Never lose** a post accidentally

---

## 🚀 Quick Start

### 1. Your app is already live!

Navigate to: **`https://YOUR_USERNAME.github.io/fb-medium-copier/`**

> Replace with your actual GitHub username and repository name.

### 2. Browse your posts

- Use the sidebar to filter by **date**, **category**, or **word count**
- Posts are paginated (10 per page)
- Click **"📋 Copy"** to load content into the clipboard area

### 3. Paste to Medium

- Select all (Ctrl+A) in the clipboard area
- Copy (Ctrl+C)
- Paste into Medium's editor (Ctrl+V)

### 4. Mark as Posted

When you've successfully posted to Medium:

1. Click **"✓ Mark Posted"** on any post
2. Confirm in the popup dialog
3. A GitHub Issue opens (keeps audit trail)
4. Close the issue to complete the sync
5. Refresh the app to see the post removed from the list

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Clean UI** | Modern, responsive design |
| 🔍 **Filters** | Filter by date, category, word count |
| 📑 **Categories** | AI/ML, Tech, Tutorial, Books, Thoughts, বাংলা |
| 📋 **One-click Copy** | Copy post content to clipboard |
| ✅ **Safe Marking** | 3-layer confirmation before hiding |
| 📊 **Statistics** | See total, posted, and pending counts |
| 🔄 **GitHub Sync** | Issues track all posted status |
| 🛡️ **Recovery** | Reopen issues to undo |
| 🌐 **Free Hosting** | No server costs, no maintenance |

---

## 🛡️ Safety First

### Posts NEVER disappear without you explicitly choosing to:

1. **Confirmation Dialog** - Must click "Open GitHub Issue"
2. **GitHub Issue First** - Post stays visible until you commit
3. **Manual Refresh** - You control when to reload data

### What if something goes wrong?

- **Wrong post marked?** → Reopen the GitHub Issue
- **Want to re-post?** → Add ID back to `posted_ids.json`
- **Cache corrupted?** → Click "🗑️ Reset Local" in sidebar
- **GitHub Action fails?** → Issue stays open, retry later

---

## 📁 Project Structure

```
fb-medium-copier/
├── index.html          # Main app
├── styles.css          # Styling
├── app.js              # Core logic
├── posts.json          # Your posts (6,287 in this demo)
├── posted_ids.json     # Tracking file
├── scripts/
│   └── export_posts.py # Export from SQLite
└── .github/
    └── workflows/
        └── track_posts.yml # Auto-update tracking
```

---

## 🔧 Technical Details

| Component | Technology |
|-----------|-----------|
| Frontend | HTML/CSS/JavaScript (no framework) |
| Hosting | GitHub Pages (free) |
| Data Storage | JSON files in GitHub |
| Tracking | GitHub Issues |
| Automation | GitHub Actions |

### Why JSON + GitHub Pages?

| Traditional Approach | This Approach |
|---------------------|---------------|
| Python server required | ❌ No server needed |
| Database hosting costs $10-50/mo | ✅ Free |
| Complex deployment | ✅ Push to deploy |
| Real-time sync | ✅ Simple + reliable |

---

## 📖 How It Works

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────┐
│  SQLite DB      │ ──► │ Export      │ ──► │ posts.json   │
│  (your data)    │     │ Script      │     │ (in GitHub)  │
└─────────────────┘     └─────────────┘     └──────┬───────┘
                                                   │
                                                   ▼
┌─────────────────┐     ┌─────────────┐     ┌──────────────┐
│  Medium         │ ◄── │ Copy/Paste  │ ◄── │ Your Browser │
│  (manual post)  │     │ (manual)    │     │ (web app)    │
└─────────────────┘     └─────────────┘     └──────┬───────┘
                                                   │
                              ┌────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  GitHub Issue   │ ──► GitHub Action
                    │  (audit trail)  │     updates tracking
                    └─────────────────┘
```

---

## 🔄 Deployment (For Your Own Data)

### Step 1: Export your posts from SQLite

```bash
# Run the export script (requires Python)
python scripts/export_posts.py
```

This creates `posts.json` and `posted_ids.json`.

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial upload"
git remote add origin https://github.com/YOUR_USERNAME/fb-medium-copier.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** (left sidebar)
3. Under **Source**, select:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Click **Save**
5. Wait 2-3 minutes for deployment

### Step 4: Your app is live! 🎉

Visit: `https://YOUR_USERNAME.github.io/fb-medium-copier/`

---

## 🎨 Screenshots

### Main Interface
```
┌─────────────────────────────────────────────────────────┐
│  📋 Facebook → Medium Copier                           │
│  Browse your Facebook posts and copy to Medium         │
├─────────────────────────────────────────────────────────┤
│  Total: 6,287  |  Posted: 136  |  To Post: 6,151      │
├──────────────┬──────────────────────────────────────────┤
│ 🔧 GitHub    │  📝 Posts                      Page 1   │
│ 📊 Filter    │  ┌────────────────────────────────────┐  │
│ [username/..]│  │ 2024-01-10  [AI/ML]                │  │
│              │  │ Just finished reading about...     │  │
│ Date: [All] │  │ 250 words | 📋 Copy | ✓ Mark      │  │
│ Cat: [All]   │  └────────────────────────────────────┘  │
│ Min: [0___] │                                          │
│ [ ] Hide    │  ┌────────────────────────────────────┐  │
│              │  │ 2024-01-09  [Tech]                │  │
│ 🔄 Refresh  │  │ Building a web scraper with...     │  │
│ 🗑️ Reset    │  │ 180 words | 📋 Copy | ✓ Mark      │  │
└──────────────┴──┴────────────────────────────────────┴──┘
│ 📋 Clipboard                                             │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Select all (Ctrl+A) and copy to paste into Medium   ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Mark Posted Confirmation
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ Confirm Mark as Posted                            │
│                                                     │
│ Post ID: 1234567890_9876543210                      │
│ Preview: Just finished reading about...             │
│                                                     │
│ ✅ This will open a GitHub Issue                    │
│ ✅ Post will STAY VISIBLE until you refresh        │
│ ✅ You can undo this by reopening the issue        │
│                                                     │
│              [Cancel]  [Open GitHub Issue]           │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### "Failed to load posts"

1. Check if `posts.json` exists in your repository
2. Ensure GitHub Pages is enabled
3. Try a hard refresh (Ctrl+Shift+R)

### "GitHub Issue not updating"

1. Check the issue has `[POSTED]` in the title
2. Verify GitHub Actions is enabled (Settings → Actions)
3. Check Actions tab for error logs

### "Posts not syncing across devices"

This is by design! Each browser has its own local storage. This ensures:
- You can use the app offline
- No server = no single point of failure
- Your data stays on your device until you sync

To sync, close GitHub Issues or edit `posted_ids.json` manually.

---

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/amazing`
3. Make your changes
4. Submit a pull request

---

## 📜 License

MIT License - Use it however you want.

---

## 🙏 Acknowledgments

- Built with vanilla HTML/CSS/JS (no frameworks)
- Hosted on GitHub Pages (free forever)
- Inspired by the need to migrate content between platforms

---

## 📞 Questions?

Open an issue on GitHub or reach out!

---

*Last updated: January 2024*