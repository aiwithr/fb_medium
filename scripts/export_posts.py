"""
Export Facebook posts from SQLite to JSON for GitHub Pages deployment.
Run this once to generate posts.json from your SQLite database.
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime

# Configuration
FB_DB = Path(__file__).parent.parent.parent / "fb_posts.db"
OUTPUT_DIR = Path(__file__).parent.parent
POSTS_JSON = OUTPUT_DIR / "posts.json"
POSTED_IDS_JSON = OUTPUT_DIR / "posted_ids.json"


def fix_encoding(text):
    """Fix encoding issues in content."""
    if not text:
        return ""
    try:
        return text.encode('latin-1').decode('utf-8')
    except:
        return text


def categorize(content):
    """Categorize post based on content keywords."""
    if not content:
        return "general"
    
    content_lower = content.lower()
    
    if any(w in content_lower for w in ['ai', 'machine learning', 'neural', 'model', 'gpt', 'llm', 'chatgpt']):
        return "ai_ml"
    if any(w in content_lower for w in ['python', 'javascript', 'java', 'c++', 'code', 'programming', 'git', 'api']):
        return "tech"
    if any(w in content_lower for w in ['tutorial', 'how to', 'learn', 'guide', 'step by step', 'example']):
        return "tutorial"
    if any(w in content_lower for w in ['book', 'review', 'read', 'reading', 'author']):
        return "books"
    if any(w in content_lower for w in ['thought', 'reflection', 'thinking', 'idea', 'opinion']):
        return "thoughts"
    # Check for Bengali Unicode range (U+0980 to U+09FF)
    if any('\u0980' <= ch <= '\u09FF' for ch in content):
        return "bengali"
    return "general"


def export_posts():
    """Export all posts from SQLite to JSON."""
    
    if not FB_DB.exists():
        print(f"❌ Error: {FB_DB} not found")
        print("   Expected path: fb_posts.db")
        print("   Copy your fb_posts.db to this folder, or adjust FB_DB path in script.")
        return False
    
    print(f"📖 Reading from: {FB_DB}")
    
    conn = sqlite3.connect(FB_DB)
    
    # Check which table exists
    tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    table_names = [t[0] for t in tables]
    print(f"📦 Available tables: {table_names}")
    
    # Try different table names
    table_name = None
    if 'fb_text_posts' in table_names:
        table_name = 'fb_text_posts'
    elif 'posts' in table_names:
        table_name = 'posts'
    
    if not table_name:
        print(f"❌ No suitable table found. Expected: fb_text_posts or posts")
        conn.close()
        return False
    
    print(f"📊 Using table: {table_name}")
    
    rows = conn.execute(f"""
        SELECT id, timestamp, date, content, post_type, word_count, char_count, has_media, status
        FROM {table_name}
        WHERE content IS NOT NULL AND content != ''
        ORDER BY timestamp DESC
    """).fetchall()
    conn.close()
    
    print(f"📊 Found {len(rows)} posts with content")
    
    posts = []
    for row in rows:
        post_id, timestamp, date, content, post_type, word_count, char_count, has_media, status = row
        
        posts.append({
            "id": post_id,
            "timestamp": timestamp,
            "date": date[:10] if date else None,
            "content": fix_encoding(content),
            "post_type": post_type or "post",
            "word_count": word_count or 0,
            "char_count": char_count or 0,
            "has_media": bool(has_media) if has_media is not None else False,
            "category": categorize(content),
            "status": status or "pending"
        })
    
    # Write posts.json with metadata wrapper
    output = {
        "exported_at": datetime.now().isoformat(),
        "total_posts": len(posts),
        "posts": posts
    }
    with open(POSTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Created {POSTS_JSON} ({len(posts):,} posts)")
    
    # Create empty posted_ids.json with proper structure
    posted_output = {
        "posted": [],
        "updated_at": "",
        "updated_by": ""
    }
    with open(POSTED_IDS_JSON, 'w', encoding='utf-8') as f:
        json.dump(posted_output, f, indent=2)
    print(f"✅ Created {POSTED_IDS_JSON} (empty)")
    
    # Stats
    categories = {}
    word_counts = []
    for p in posts:
        cat = p['category']
        categories[cat] = categories.get(cat, 0) + 1
        if p['word_count']:
            word_counts.append(p['word_count'])
    
    print("\n📈 Statistics:")
    print(f"   Total posts: {len(posts):,}")
    print(f"   Avg words: {sum(word_counts)//len(word_counts) if word_counts else 0}")
    print(f"   With media: {sum(1 for p in posts if p['has_media'])}")
    
    print("\n📊 Category Breakdown:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        pct = count / len(posts) * 100
        print(f"   {cat:12s}: {count:5,} ({pct:5.1f}%)")
    
    return True


if __name__ == "__main__":
    print("=" * 60)
    print("Facebook → Medium: Export to JSON")
    print("=" * 60)
    print()
    
    success = export_posts()
    
    if success:
        print()
        print("=" * 60)
        print("✅ Export complete!")
        print()
        print("Next steps:")
        print("1. Review posts.json")
        print("2. Create GitHub repository")
        print("   gh repo create fb-medium-copier --public")
        print("3. Push files:")
        print("   git add . && git commit -m 'Initial upload'")
        print("   git remote add origin https://github.com/USERNAME/fb-medium-copier.git")
        print("   git push -u origin main")
        print("4. Enable GitHub Pages:")
        print("   Settings → Pages → Source: main branch, / (root)")
        print("=" * 60)