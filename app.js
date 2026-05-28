/**
 * Facebook → Medium Copier
 * Core Logic
 */

const APP_VERSION = '1.0.0';
const POSTS_PER_PAGE = 10;

// State
let allPosts = [];
let postedIds = new Set();
let filteredPosts = [];
let currentPage = 1;
let repoConfig = {};

// DOM Elements
const elements = {
    totalCount: document.getElementById('totalCount'),
    postedCount: document.getElementById('postedCount'),
    pendingCount: document.getElementById('pendingCount'),
    loadedCount: document.getElementById('loadedCount'),
    postsList: document.getElementById('postsList'),
    emptyState: document.getElementById('emptyState'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    pageInfo: document.getElementById('pageInfo'),
    clipboard: document.getElementById('clipboard'),
    repoInput: document.getElementById('repoInput'),
    saveRepoBtn: document.getElementById('saveRepoBtn'),
    syncStatus: document.getElementById('syncStatus'),
    dateFilter: document.getElementById('dateFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    minWordsFilter: document.getElementById('minWordsFilter'),
    minWordsValue: document.getElementById('minWordsValue'),
    hidePosted: document.getElementById('hidePosted'),
    refreshBtn: document.getElementById('refreshBtn'),
    localResetBtn: document.getElementById('localResetBtn'),
    clearClipboardBtn: document.getElementById('clearClipboardBtn'),
    modal: document.getElementById('confirmModal'),
    confirmPostId: document.getElementById('confirmPostId'),
    confirmPostPreview: document.getElementById('confirmPostPreview'),
    confirmCancel: document.getElementById('confirmCancel'),
    confirmOk: document.getElementById('confirmOk'),
};

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log('🚀 FB → Medium Copier v' + APP_VERSION);
    
    // Load saved repo config
    loadRepoConfig();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load data
    await loadData();
    
    // Apply initial filters
    applyFilters();
}

function setupEventListeners() {
    // Filters
    elements.dateFilter.addEventListener('change', () => applyFilters());
    elements.categoryFilter.addEventListener('change', () => applyFilters());
    elements.hidePosted.addEventListener('change', () => applyFilters());
    elements.minWordsFilter.addEventListener('input', (e) => {
        elements.minWordsValue.textContent = e.target.value;
        applyFilters();
    });
    
    // Pagination
    elements.prevBtn.addEventListener('click', () => changePage(-1));
    elements.nextBtn.addEventListener('click', () => changePage(1));
    
    // Actions
    elements.refreshBtn.addEventListener('click', loadData);
    elements.localResetBtn.addEventListener('click', resetLocalStorage);
    elements.clearClipboardBtn.addEventListener('click', () => {
        elements.clipboard.value = '';
        showToast('Clipboard cleared', 'info');
    });
    
    // GitHub Sync
    elements.saveRepoBtn.addEventListener('click', saveRepoConfig);
    
    // Modal
    elements.confirmCancel.addEventListener('click', closeModal);
    elements.confirmOk.addEventListener('click', confirmMarkPosted);
    
    // Close modal on background click
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });
}

// ========================================
// Data Loading
// ========================================

async function loadData() {
    try {
        showLoading(true);
        
        // Load posts.json
        const postsResponse = await fetch('posts.json');
        if (!postsResponse.ok) throw new Error('Failed to load posts.json');
        allPosts = await postsResponse.json();
        console.log(`📥 Loaded ${allPosts.length} posts`);
        
        // Load posted_ids.json
        try {
            const postedResponse = await fetch('posted_ids.json');
            if (postedResponse.ok) {
                const postedData = await postedResponse.json();
                postedIds = new Set(postedData.posted || []);
                console.log(`📥 Loaded ${postedIds.size} posted IDs`);
            }
        } catch (e) {
            console.log('📥 No posted_ids.json found, starting fresh');
            postedIds = new Set();
        }
        
        updateStats();
        renderPosts();
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showToast('Failed to load data. Check console for details.', 'error');
        elements.postsList.innerHTML = `
            <div class="error-state">
                <p>❌ Failed to load posts</p>
                <p class="hint">${error.message}</p>
                <button class="btn btn-primary" onclick="loadData()">Retry</button>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    if (show) {
        elements.postsList.innerHTML = '<div class="loading">Loading posts...</div>';
    }
}

// ========================================
// Filtering & Pagination
// ========================================

function applyFilters() {
    const dateFilter = elements.dateFilter.value;
    const categoryFilter = elements.categoryFilter.value;
    const minWords = parseInt(elements.minWordsFilter.value);
    const hidePosted = elements.hidePosted.checked;
    
    filteredPosts = allPosts.filter(post => {
        // Check posted status
        if (hidePosted && postedIds.has(post.id)) {
            return false;
        }
        
        // Check category
        if (categoryFilter !== 'all' && post.category !== categoryFilter) {
            return false;
        }
        
        // Check word count
        if (post.word_count < minWords) {
            return false;
        }
        
        // Check date
        if (dateFilter !== 'all') {
            const postYear = new Date(post.date).getFullYear();
            if (dateFilter === '30') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                if (new Date(post.date) < thirtyDaysAgo) return false;
            } else if (dateFilter === '90') {
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                if (new Date(post.date) < ninetyDaysAgo) return false;
            } else if (dateFilter === '365') {
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                if (new Date(post.date) < oneYearAgo) return false;
            } else if (!isNaN(parseInt(dateFilter)) && postYear !== parseInt(dateFilter)) {
                return false;
            }
        }
        
        return true;
    });
    
    currentPage = 1;
    updateStats();
    renderPosts();
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderPosts();
    }
}

function updateStats() {
    elements.totalCount.textContent = allPosts.length;
    elements.postedCount.textContent = postedIds.size;
    elements.pendingCount.textContent = allPosts.length - postedIds.size;
    elements.loadedCount.textContent = `${filteredPosts.length} / ${allPosts.length}`;
}

// ========================================
// Rendering
// ========================================

function renderPosts() {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const pagePosts = filteredPosts.slice(start, end);
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    
    // Update pagination
    elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    elements.prevBtn.disabled = currentPage <= 1;
    elements.nextBtn.disabled = currentPage >= totalPages;
    
    // Show empty state or posts
    if (filteredPosts.length === 0) {
        elements.postsList.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    elements.postsList.innerHTML = pagePosts.map(post => `
        <div class="post-card ${postedIds.has(post.id) ? 'posted' : ''}" data-id="${post.id}">
            <div class="post-header">
                <span class="post-date">${formatDate(post.date)}</span>
                <span class="post-category ${post.category}">${formatCategory(post.category)}</span>
            </div>
            <div class="post-content">${escapeHtml(post.content)}</div>
            <div class="post-meta">
                📏 ${post.word_count} words | 
                📝 ${post.char_count} chars | 
                ${post.post_type ? '📌 ' + post.post_type : ''}
                ${post.has_media === 1 ? ' 🖼️ Has media' : ''}
            </div>
            <div class="post-actions">
                <button class="btn btn-copy btn-small" onclick="copyPost('${post.id}')">📋 Copy</button>
                <button class="btn btn-mark btn-small" onclick="markPosted('${post.id}')" 
                        ${postedIds.has(post.id) ? 'disabled' : ''}>
                    ${postedIds.has(post.id) ? '✅ Posted' : '✓ Mark Posted'}
                </button>
                <button class="btn btn-expand btn-small" onclick="toggleExpand(this)">更多...</button>
                ${postedIds.has(post.id) ? '<span class="post-status">✓ POSTED</span>' : ''}
            </div>
        </div>
    `).join('');
}

// ========================================
// Post Actions
// ========================================

function copyPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
        elements.clipboard.value = post.content;
        elements.clipboard.focus();
        elements.clipboard.select();
        
        // Try to copy to clipboard API
        navigator.clipboard.writeText(post.content).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Content loaded - use Ctrl+A, Ctrl+C to copy', 'info');
        });
    }
}

function savePostLocally(postId) {
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    if (!savedPosts.includes(postId)) {
        savedPosts.push(postId);
        localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
    }
}

let pendingPostId = null;

function markPosted(postId) {
    if (postedIds.has(postId)) {
        showToast('This post is already marked as posted', 'info');
        return;
    }
    
    const post = allPosts.find(p => p.id === postId);
    if (post) {
        pendingPostId = postId;
        elements.confirmPostId.textContent = post.id;
        elements.confirmPostPreview.innerHTML = escapeHtml(post.content.substring(0, 200)) + '...';
        elements.modal.classList.add('show');
    }
}

function confirmMarkPosted() {
    const postId = pendingPostId;
    closeModal();
    pendingPostId = null;
    
    if (!postId) return;
    
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Add to local set
    postedIds.add(postId);
    
    // Update the post card
    const card = document.querySelector(`[data-id="${postId}"]`);
    if (card) {
        card.classList.add('posted');
        card.querySelector('.btn-mark').disabled = true;
        card.querySelector('.btn-mark').textContent = '✅ Posted';
        card.querySelector('.post-status')?.remove();
        card.insertAdjacentHTML('beforeend', '<span class="post-status">✓ POSTED</span>');
    }
    
    // Open GitHub Issue
    openGitHubIssue(post);
    
    updateStats();
}

function closeModal() {
    elements.modal.classList.remove('show');
    pendingPostId = null;
}

function toggleExpand(btn) {
    const card = btn.closest('.post-card');
    const isExpanded = card.classList.toggle('expanded');
    btn.textContent = isExpanded ? '收起 ▲' : '更多...';
    
    // Show full content
    if (isExpanded) {
        const postId = card.dataset.id;
        const post = allPosts.find(p => p.id === postId);
        if (post) {
            card.querySelector('.post-content').innerHTML = escapeHtml(post.content);
        }
    }
}

// ========================================
// GitHub Integration
// ========================================

function openGitHubIssue(post) {
    const repo = repoConfig.repo || localStorage.getItem('ghRepo');
    
    if (!repo) {
        // Just save locally without GitHub integration
        savePostedIds();
        showToast('Marked locally! (Set repo to enable GitHub Issue)', 'info');
        return;
    }
    
    const title = encodeURIComponent(`[POSTED] ${post.id}`);
    const body = encodeURIComponent(`
## Post Marked as Posted

**Post ID:** ${post.id}
**Date:** ${post.date}
**Category:** ${post.category}
**Word Count:** ${post.word_count}

---

### Preview
${post.content.substring(0, 300)}...

---

This issue was created automatically by FB → Medium Copier.
Close this issue to update posted_ids.json via GitHub Actions.
Reopen this issue to undo the "Mark Posted" action.
    `.trim());
    
    const issueUrl = `https://github.com/${repo}/issues/new?title=${title}&&body=${body}`;
    
    // Open in new tab
    window.open(issueUrl, '_blank');
    
    showToast('GitHub Issue opened! Close it to complete the sync.', 'success');
    
    // Save locally as backup
    savePostedIds();
}

function savePostedIds() {
    // This would normally sync to GitHub
    // For now, we just keep it in memory and rely on GitHub Actions
    console.log('📝 Posted IDs:', Array.from(postedIds));
}

// ========================================
// Repo Config
// ========================================

function loadRepoConfig() {
    const savedRepo = localStorage.getItem('ghRepo');
    if (savedRepo) {
        elements.repoInput.value = savedRepo;
        elements.syncStatus.textContent = `📂 Configured: ${savedRepo}`;
        elements.syncStatus.className = 'sync-status success';
    }
}

function saveRepoConfig() {
    const repo = elements.repoInput.value.trim();
    
    if (!repo) {
        elements.syncStatus.textContent = '❌ Please enter a repository';
        elements.syncStatus.className = 'sync-status error';
        return;
    }
    
    if (!repo.includes('/')) {
        elements.syncStatus.textContent = '❌ Use format: username/repo';
        elements.syncStatus.className = 'sync-status error';
        return;
    }
    
    localStorage.setItem('ghRepo', repo);
    elements.syncStatus.textContent = `✓ Saved: ${repo}`;
    elements.syncStatus.className = 'sync-status success';
    
    showToast('Repository saved!', 'success');
}

// ========================================
// Local Storage Reset
// ========================================

function resetLocalStorage() {
    if (confirm('⚠️ Reset ALL local data?\n\nThis will clear your saved posts, repo config, and reset all posted status.\n\nThis does NOT affect GitHub.')) {
        localStorage.removeItem('savedPosts');
        localStorage.removeItem('ghRepo');
        postedIds = new Set();
        
        elements.repoInput.value = '';
        elements.syncStatus.textContent = '';
        elements.syncStatus.className = 'sync-status';
        
        updateStats();
        renderPosts();
        
        showToast('Local data reset!', 'info');
    }
}

// ========================================
// Utilities
// ========================================

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCategory(category) {
    const labels = {
        ai_ml: 'AI/ML',
        tech: 'Tech',
        tutorial: 'Tutorial',
        books: 'Books',
        thoughts: 'Thoughts',
        bengali: 'বাংলা',
        general: 'General'
    };
    return labels[category] || category;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ========================================
// Keyboard Shortcuts
// ========================================

document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+V to focus clipboard
    if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        elements.clipboard.focus();
        elements.clipboard.select();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && elements.modal.classList.contains('show')) {
        closeModal();
    }
});

// Export for button onclick handlers
window.copyPost = copyPost;
window.markPosted = markPosted;
window.toggleExpand = toggleExpand;
window.loadData = loadData;
window.resetLocalStorage = resetLocalStorage;