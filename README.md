# FB to Medium Copier

## Overview

This is a GitHub Pages-hosted web application that allows you to browse your Facebook posts and copy their content for reposting on Medium. The entire application runs in the browser with no server-side dependencies.

**Live URL:** https://aiwithr.github.io/fb_medium/
**Repository:** https://github.com/aiwithr/fb_medium
**Last Updated:** May 30, 2026

## What This App Does

This tool was created to solve a specific problem: your Facebook posts are scattered across many years and difficult to browse through the Facebook interface. This app provides a unified view of all your posts with powerful filtering options, allowing you to:

1. Browse through all your Facebook posts in chronological order
2. Filter posts by category, year, or word count
3. Preview posts before copying
4. Copy post content to clipboard with one click
5. Mark posts as "posted" to track your progress
6. Undo marking actions if you make a mistake

## Features

| Feature | Description |
|---------|-------------|
| **Clean User Interface** | Modern, responsive design that works on desktop and mobile devices |
| **Category Filtering** | Filter posts by category such as AI/ML, Tech, Tutorial, Books, Thoughts, Bengali, or Short posts (under 50 words) |
| **Year Filtering** | Filter posts by specific year to narrow down your search |
| **Short Posts Filter** | Dedicated filter for posts with fewer than 50 words |
| **One-click Copy** | Copy post content to clipboard with a single button click |
| **Safe Marking** | Multi-layer confirmation prevents accidental marking of posts |
| **GitHub Issue Tracking** | Marked posts are tracked via GitHub Issues for audit trail |
| **Statistics Dashboard** | See total posts, posted count, and pending posts at a glance |
| **GitHub Sync** | All posted status changes are synchronized via GitHub Issues |
| **Recovery Options** | Reopen GitHub Issues to undo marking actions |
| **Free Hosting** | No server costs, no maintenance required |
| **Offline Capable** | Works without internet connection once loaded |

## Quick Start

If you just want to use the app (not modify it), follow these steps:

1. Open the live URL: https://aiwithr.github.io/fb_medium/
2. Browse through your posts using the filters at the top
3. Click on any post to select it and preview its content
4. Click the "Copy Text" button to copy the content to your clipboard
5. Paste the content into Medium
6. When done, click "Mark as Posted" to track your progress

## Local Setup

If you want to run this app locally or make modifications:

```bash
cd c:\Downloads\fb_medium\fb_to_medium_ghpages
python -m http.server 8080
```

Then open your browser to http://localhost:8080

## Git Workflow

To deploy changes to the live site:

```bash
git add app.js styles.css index.html
git commit -m "Description of changes"
git push
```

The site will automatically update within a few minutes after pushing.

---

## How the Safety System Works

### Why Safety Measures Exist

Posts are marked as "posted" in local storage, but this data is separate from the GitHub-hosted content. Without proper safeguards, you might accidentally lose track of which posts you have processed. The safety system ensures you always have a recovery path.

### Three-Layer Confirmation for Marking

When you click "Mark as Posted", the app requires multiple steps:

1. **Initial Click** - A confirmation dialog appears showing the post details
2. **GitHub Issue Creation** - You must click "Open GitHub Issue" to proceed
3. **Manual Refresh** - The post remains visible until you refresh the page

### What This Prevents

| Scenario | Without Safety | With Safety |
|----------|----------------|-------------|
| Accidental click | Post disappears immediately | Confirmation blocks it |
| Browser close during work | Unsaved progress lost | Posts stay visible |
| App restart | All progress reset | Posts stay visible |
| Wrong post marked | No way to undo | Reopen GitHub Issue to undo |

### Recovery Options

If something goes wrong:

- **Wrong post marked as posted** - Reopen the GitHub Issue to restore visibility
- **Want to re-post a marked post** - Add the ID back to posted_ids.json manually
- **Cache corrupted** - Click "Reset Local" in the sidebar to clear local storage
- **GitHub Action fails** - The issue stays open, retry later when GitHub recovers

---

## Project Structure

```
fb_to_medium_ghpages/
|
|-- index.html              # Main HTML structure, modern gradient header
|-- styles.css              # All styling with CSS variables and responsive design
|-- app.js                  # Core JavaScript logic, filtering, rendering, interactions
|-- README.md               # This documentation
|
|-- posts_1.json            # First batch of posts (IDs 1-500)
|-- posts_2.json            # Second batch (IDs 501-1000)
|-- posts_3.json            # Third batch (IDs 1001-1500)
|-- posts_4.json            # Fourth batch (IDs 1501-2000)
|-- posts_5.json            # Fifth batch (IDs 2001-2500)
|-- posts_6.json            # Sixth batch (IDs 2501-3000)
|-- posts_7.json            # Seventh batch (IDs 3001-3500)
|-- posts_8.json            # Eighth batch (IDs 3501-4000)
|-- posts_9.json            # Ninth batch (IDs 4001-4500)
|-- posts_10.json           # Tenth batch (IDs 4501-5000)
|-- posts_11.json           # Eleventh batch (IDs 5001-5500)
|-- posts_12.json           # Twelfth batch (IDs 5501-6000)
|-- posts_13.json           # Thirteenth batch (IDs 6001-6500)
|-- posts_14.json           # Fourteenth batch (IDs 6501-7000)
|-- posts_15.json           # Fifteenth batch (IDs 7001-7500)
|-- posts_16.json           # Sixteenth batch (IDs 7501-8000)
|-- posts_17.json           # Seventeenth batch (IDs 8001-8500)
|-- posts_18.json           # Eighteenth batch (IDs 8501-9000)
|-- posts_19.json           # Nineteenth batch (IDs 9001-9500)
|-- posts_20.json           # Twentieth batch (IDs 9501-10000)
|-- posts_21.json           # Twenty-first batch (IDs 10001+)
|
|-- posted_ids.json         # Array of post IDs that have been marked as posted
|-- posted_ids_backup.json  # Backup of posted IDs for recovery
|
|-- scripts/
|   |-- export_posts.py     # Python script to export posts from SQLite database
|
|-- .github/
    |-- workflows/
    |   |-- auto_update.yml # GitHub Action to auto-update posted_ids.json when issues close
    |
    |-- ISSUE_TEMPLATE/
        |-- post-tracker.yml # GitHub Form template for marking posts as posted without API token
```

---

## Technical Details

### Architecture Choices

| Component | Technology | Why It Was Chosen |
|-----------|------------|-------------------|
| Frontend | HTML5, CSS3, JavaScript (ES6) | No framework overhead, works everywhere, easy to deploy |
| Hosting | GitHub Pages | Free, reliable, automatic SSL, no maintenance |
| Data Storage | JSON files | Human-readable, version-controlled, easy to edit manually |
| Tracking | GitHub Issues | Free, searchable, has comments, integrates with Actions |
| Automation | GitHub Actions | Free tier available, runs on any repository event |

### Why JSON Plus GitHub Pages?

This architecture was chosen over traditional server-based approaches for specific reasons:

| Aspect | Traditional Server | This Solution |
|--------|-------------------|---------------|
| Server Requirements | Python/PHP/Node server needed | No server required |
| Database | SQL database required | JSON files only |
| Hosting Costs | $10-50 per month | Free |
| Deployment | Complex deployment pipelines | Push to deploy |
| Real-time Sync | Requires WebSocket or polling | Simple and reliable |
| Failure Mode | Single point of failure | Distributed, resilient |
| Maintenance | Regular updates needed | Static files, no maintenance |

### Data Flow

```
Step 1: Export from SQLite
┌─────────────────┐     ┌─────────────┐     ┌──────────────┐
│  SQLite Database │ ──> │ Export      │ ──> │ posts_N.json │
│  (Facebook data)│     │ Script      │     │ (in GitHub)  │
└─────────────────┘     └─────────────┘     └──────┬───────┘
                                                   │
                                                   v
Step 2: View in Browser
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│ Posts JSON  │ ──> │ App.js      │ ──> │ Browser UI   │
│ (loaded via │     │ (filters,   │     │ (rendered    │
│  fetch API) │     │  render)    │     │  posts list) │
└─────────────┘     └─────────────┘     └──────┬───────┘
                                               │
                                               v
Step 3: Mark as Posted
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│ User clicks │ ──> │ GitHub      │ ──> │ GitHub       │
│ "Mark       │     │ Issue       │     │ Action       │
│  Posted"    │     │ created     │     │ updates JSON │
└─────────────┘     └─────────────┘     └──────────────┘
```

---

## How to Use Each Feature

### Browsing Posts

The main view shows all posts loaded from the JSON files. Each post displays:
- Date when it was originally posted
- Category label (if assigned)
- Preview of the content (first few lines)
- Word count
- Copy and Mark buttons

Use the pagination controls at the bottom to navigate through pages.

### Filtering by Category

At the top of the interface, category filter chips allow you to narrow down posts:
- **All** - Shows every post regardless of category
- **Short** - Shows only posts with fewer than 50 words
- **Bengali** - Shows posts in Bengali language
- **AI/ML** - Shows posts about artificial intelligence and machine learning
- **Tech** - Shows posts about technology
- **Tutorial** - Shows posts that are tutorials or how-to guides
- **Books** - Shows posts about books
- **Thoughts** - Shows personal thoughts and opinions

### Filtering by Year

Year filter chips appear below the category filters. Click a year to show only posts from that specific year. Click "All Years" to reset the filter.

### Searching Posts

The search box allows you to search through post content. Results update as you type, and the search is case-insensitive.

### Copying Post Content

1. Click on any post in the list to select it
2. The post content will appear in the preview area
3. Click the "Copy Text" button
4. The content is copied to your clipboard
5. Paste it wherever you need (Medium editor, document, etc.)

### Marking Posts as Posted

1. Select the post you want to mark
2. Click the "Mark as Posted" button
3. A confirmation dialog appears showing the post details
4. Review the information to ensure you are marking the correct post
5. Click "Open GitHub Issue" to proceed
6. A new browser tab opens with a pre-filled GitHub Issue form
7. Submit the issue to complete the marking
8. Refresh the app page to see the post marked as posted

### Viewing Posted Posts

By default, posts that have been marked as posted are hidden. To view them:
1. Look for the "Posted (N)" toggle button near the top
2. Click it to show all posted posts
3. Click again to hide them

---

## Deployment Instructions

If you want to create your own version of this app with different data:

### Step 1: Export Your Data

Run the export script to convert your Facebook data (stored in SQLite) to JSON format:

```bash
python scripts/export_posts.py
```

This will create the posts_N.json files and initialize posted_ids.json.

### Step 2: Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial upload - Facebook posts data"
```

### Step 3: Connect to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click the "Settings" tab
3. In the left sidebar, click "Pages"
4. Under "Source", select the following:
   - Branch: main
   - Folder: / (root)
5. Click "Save"
6. Wait 2-3 minutes for deployment to complete

### Step 5: Verify Deployment

Your app will be available at: `https://YOUR_USERNAME.github.io/your-repo-name/`

---

## Troubleshooting

### Problem: "Failed to load posts"

Possible causes and solutions:

1. **Missing JSON files** - Verify that posts_N.json files exist in your repository root
2. **GitHub Pages not enabled** - Check repository Settings > Pages and ensure it is configured
3. **Browser cache issue** - Try a hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
4. **File naming case sensitivity** - Ensure filenames match exactly (posts_1.json not Posts_1.json)

### Problem: "GitHub Issue not updating"

Possible causes and solutions:

1. **Issue title format** - Ensure the issue title contains "[POSTED]" as required by the automation
2. **GitHub Actions not enabled** - Check Settings > Actions and ensure workflows are allowed
3. **Action failure** - Check the Actions tab in your repository for error logs
4. **Permission issues** - Ensure the GitHub Action has write permissions to the repository

### Problem: "Posts not syncing across devices"

This behavior is intentional. Each browser has its own local storage copy. This design ensures:

- You can use the app offline
- No single point of failure from a central server
- Your data stays on your device until you explicitly sync

To sync posted status across devices, close the GitHub Issues or edit posted_ids.json manually.

### Problem: "Category filter not working"

Ensure you are using the latest version of app.js. Clear browser cache if needed.

### Problem: "Year filter shows no posts"

Some posts may not have date information in the correct format. Check the JSON structure of your posts.

---

## Contributing

To contribute improvements to this project:

1. Fork the repository to your GitHub account
2. Create a feature branch for your changes: `git checkout -b feature/your-feature-name`
3. Make your modifications to the code
4. Test your changes locally using `python -m http.server 8080`
5. Commit your changes with clear commit messages
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a pull request to the main repository

---

## License

This project is available under the MIT License. You are free to use, modify, and distribute the code for any purpose, commercial or non-commercial, as long as you include the original copyright notice.

---

## Acknowledgments

- Built with vanilla HTML, CSS, and JavaScript with no framework dependencies
- Hosted on GitHub Pages which provides free hosting forever
- Inspired by the need to migrate content between platforms without losing work
- Uses the Fetch API for loading JSON data asynchronously
- Leverages localStorage for client-side state management

---

## Questions or Feedback

If you encounter issues or have suggestions for improvements:

- Open an issue on GitHub at https://github.com/aiwithr/fb_medium/issues
- Provide as much detail as possible including browser version and steps to reproduce

---

*Last updated: May 30, 2026*