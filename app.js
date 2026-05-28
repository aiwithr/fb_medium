/**
 * FB ? Medium Copier | Smart Edition
 * Clean, efficient, user-friendly
 */

// Config
const POSTS_PER_PAGE = 50;
const CHUNK_SIZE = 300;

// State
let allPosts = [];
let postedIds = new Set();
let filteredPosts = [];
let selectedPostId = null;
let currentPage = 1;

// DOM
const $ = id => document.getElementById(id);

// Init
document.addEventListener('DOMContentLoaded', init);

async function init() {
    showLoading(true);
    
    // Load posted IDs from localStorage
    loadPostedIds();
    
    // Load posts
    await loadPosts();
    
    // Setup events
    setupEvents();
    
    showLoading(false);
    renderPosts();
    updateStats();
}

function loadPostedIds() {
    const saved = localStorage.getItem('fb_medium_posted');
    if (saved) {
        postedIds = new Set(JSON.parse(saved));
    }
}

function savePostedIds() {
    localStorage.setItem('fb_medium_posted', JSON.stringify([...postedIds]));
}

// Load posts
async function loadPosts() {
    const chunkFiles = [];
    
    // Find how many chunks exist (posts_1.json, posts_2.json, etc.)
    for (let i = 1; i <= 50; i++) {
        try {
            const resp = await fetch(posts_.json);
            if (!resp.ok) break;
            const chunk = await resp.json();
            allPosts.push(...chunk);
            chunkFiles.push(i);
        } catch {
            break;
        }
    }
    
    // Fallback: load single posts.json
    if (allPosts.length === 0) {
        try {
            const resp = await fetch('posts.json');
            if (resp.ok) {
                allPosts = await resp.json();
            }
        } catch (e) {
            console.error('Failed to load posts:', e);
        }
    }
    
    console.log(Loaded  posts);
}

// Setup events
function setupEvents() {
    // Search
    searchInput.addEventListener('input', debounce(filterPosts, 300));
    
    // Pagination
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
    
    // Preview actions
    copyBtn.addEventListener('click', copySelectedPost);
    markPostedBtn.addEventListener('click', markSelectedPosted);
}

// Filter posts
function filterPosts() {
    const query = searchInput.value.toLowerCase().trim();
    const activeCategory = document.querySelector('.chip.active')?.dataset.category || 'all';
    
    filteredPosts = allPosts.filter(post => {
        // Hide posted
        if (postedIds.has(post.id)) return false;
        
        // Category filter
        if (activeCategory !== 'all' && post.category !== activeCategory) return false;
        
        // Search filter
        if (query) {
            const searchable = (post.content + ' ' + post.id + ' ' + post.category).toLowerCase();
            if (!searchable.includes(query)) return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    renderPosts();
    updateStats();
}

// Category chips
function renderCategoryChips() {
    const counts = {};
    allPosts.forEach(p => {
        if (!postedIds.has(p.id)) {
            counts[p.category] = (counts[p.category] || 0) + 1;
        }
    });
    
    const categories = [
        { id: 'all', label: 'All', count: filteredPosts.length },
        ...Object.entries(counts).map(([id, count]) => ({ id, label: formatCategory(id), count }))
    ];
    
    categoryChips.innerHTML = categories.map(cat => 
        <div class="chip" data-category="">
             <span class="chip-count"></span>
        </div>
    ).join('');
    
    // Category click handlers
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filterPosts();
        });
    });
}

// Render posts list
function renderPosts() {
    renderCategoryChips();
    
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const pagePosts = filteredPosts.slice(start, start, end);
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    
    // Pagination info
    paginationInfo.textContent = ${filteredPosts.length} posts;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    if (filteredPosts.length === 0) {
        postsList.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-muted);">No posts found</div>';
        return;
    }
    
    postsList.innerHTML = filteredPosts.slice(start, end).map(post => 
        <div class="post-item" data-id="">
            <div class="post-item-header">
                <span class="post-item-date"></span>
                <span class="post-item-badge "></span>
            </div>
            <div class="post-item-title">...</div>
            <div class="post-item-footer">
                <span class="post-item-words"> words</span>
                
            </div>
        </div>
    ).join('');
    
    // Click handlers
    document.querySelectorAll('.post-item').forEach(item => {
        item.addEventListener('click', () => selectPost(item.dataset.id));
    });
}

// Select post
function selectPost(postId) {
    selectedPostId = postId;
    const post = allPosts.find(p => p.id === postId);
    
    if (!post) return;
    
    // Update selection visual
    document.querySelectorAll('.post-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.id === postId);
    });
    
    // Update preview header
    previewTitle.textContent = formatDate(post.date) + ' • ' + formatCategory(post.category);
    previewActions.style.display = 'flex';
    
    // Render preview
    previewContent.innerHTML = 
        <div class="preview-post">
            <div class="preview-post-meta">
                <span class="preview-date"></span>
                <span class="preview-category" style="background:20;color:">
                    
                </span>
                
            </div>
            <div class="preview-body"></div>
            <div class="preview-footer">
                <span class="preview-stats">ID: </span>
                
            </div>
        </div>
    ;
}

// Copy post
function copySelectedPost() {
    const post = allPosts.find(p => p.id === selectedPostId);
    if (!post) return;
    
    // Copy to clipboard
    navigator.clipboard.writeText(post.content).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback: select text
        const textarea = document.createElement('textarea');
        textarea.value = post.content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        showToast('Copied!', 'success');
    });
}

// Mark as posted
function markSelectedPosted() {
    if (!selectedPostId || postedIds.has(selectedPostId)) return;
    
    postedIds.add(selectedPostId);
    savePostedIds();
    
    showToast('Marked as posted!', 'success');
    
    // Refresh
    filterPosts();
    updateStats();
    
    // Clear preview if this was the selected post
    clearPreview();
}

// Clear preview
function clearPreview() {
    selectedPostId = null;
    previewTitle.textContent = 'Select a post';
    previewActions.style.display = 'none';
    previewContent.innerHTML = 
        <div class="preview-empty">
            <div class="preview-empty-icon">??</div>
            <p>Click on a post to preview it here</p>
        </div>
    ;
}

// Update stats
function updateStats() {
    const total = allPosts.length;
    const posted = postedIds.size;
    const remaining = total - posted;
    const percent = total > 0 ? Math.round((posted / total) * 100) : 0;
    
    totalPosts.textContent = ${total} Posts;
    postedCount.textContent = ${posted} Posted;
    progressPercent.textContent = ${percent}%;
    progressFill.style.width = ${percent}%;
    progressText.textContent = ${posted} /  posted;
    progressPercentText.textContent = ${percent}% complete;
}

// Change page
function changePage(direction) {
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderPosts();
    }
}

// Loading
function showLoading(show) {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// Toast
function showToast(message, type = 'info') {
    const container = toastContainer;
    const toast = document.createElement('div');
    toast.className = 	oast ;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Utils
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCategory(cat) {
    const labels = {
        ai_ml: 'AI/ML',
        tech: 'Tech',
        tutorial: 'Tutorial',
        books: 'Books',
        thoughts: 'Thoughts',
        bengali: '?????',
        general: 'General'
    };
    return labels[cat] || cat || 'General';
}

function getCategoryColor(cat) {
    const colors = {
        ai_ml: '#7c3aed',
        tech: '#0284c7',
        tutorial: '#059669',
        books: '#d97706',
        thoughts: '#db2777',
        bengali: '#4338ca',
        general: '#64748b'
    };
    return colors[cat] || '#64748b';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Expose to global
window.markSelectedPosted = markSelectedPosted;
