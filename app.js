/**
 * FB -> Medium Copier | Smart Edition
 */

const POSTS_PER_PAGE = 50;

let allPosts = [];
let postedIds = new Set();
let filteredPosts = [];
let selectedPostId = null;
let currentPage = 1;

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', init);

async function init() {
    showLoading(true);
    loadPostedIds();
    await loadPosts();
    setupEvents();
    showLoading(false);
    renderPosts();
    updateStats();
}

function loadPostedIds() {
    const saved = localStorage.getItem('fb_medium_posted');
    if (saved) postedIds = new Set(JSON.parse(saved));
}

function savePostedIds() {
    localStorage.setItem('fb_medium_posted', JSON.stringify([...postedIds]));
}

async function loadPosts() {
    // Load chunks
    for (let i = 1; i <= 25; i++) {
        try {
            const resp = await fetch('posts_' + i + '.json');
            if (!resp.ok) break;
            const chunk = await resp.json();
            allPosts.push(...chunk);
        } catch { break; }
    }
    
    // Fallback
    if (allPosts.length === 0) {
        try {
            const resp = await fetch('posts.json');
            if (resp.ok) allPosts = await resp.json();
        } catch (e) { console.error(e); }
    }
    
    console.log('Loaded ' + allPosts.length + ' posts');
}

function setupEvents() {
    $('searchInput').addEventListener('input', debounce(filterPosts, 300));
    $('prevBtn').addEventListener('click', () => changePage(-1));
    $('nextBtn').addEventListener('click', () => changePage(1));
    $('copyBtn').addEventListener('click', copySelectedPost);
    $('markPostedBtn').addEventListener('click', markSelectedPosted);
}

function filterPosts() {
    const query = $('searchInput').value.toLowerCase().trim();
    const activeCat = document.querySelector('.chip.active')?.dataset.category || 'all';
    
    filteredPosts = allPosts.filter(post => {
        if (postedIds.has(post.id)) return false;
        if (activeCat !== 'all' && post.category !== activeCat) return false;
        if (query) {
            const text = (post.content + ' ' + post.id).toLowerCase();
            if (!text.includes(query)) return false;
        }
        return true;
    });
    
    currentPage = 1;
    renderPosts();
    updateStats();
}

function renderCategoryChips() {
    const counts = {};
    filteredPosts.forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
    
    const cats = [
        {id:'all', label:'All', count:filteredPosts.length},
        ...Object.entries(counts).map(([k,v]) => ({id:k, label:formatCategory(k), count:v}))
    ];
    
    $('categoryChips').innerHTML = cats.map(c => 
        '<div class="chip' + (c.id === 'all' && !document.querySelector('.chip.active') ? ' active' : '') + '" data-category="' + c.id + '">' +
        c.label + ' <span class="chip-count">' + c.count + '</span></div>'
    ).join('');
    
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filterPosts();
        });
    });
}

function renderPosts() {
    renderCategoryChips();
    
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    
    $('paginationInfo').textContent = filteredPosts.length + ' posts';
    $('prevBtn').disabled = currentPage <= 1;
    $('nextBtn').disabled = currentPage >= totalPages || totalPages === 0;
    
    if (filteredPosts.length === 0) {
        $('postsList').innerHTML = '<div style="padding:2rem;text-align:center;color:#888;">No posts found</div>';
        return;
    }
    
    $('postsList').innerHTML = filteredPosts.slice(start, end).map(post => 
        '<div class="post-item' + (post.id === selectedPostId ? ' selected' : '') + '" data-id="' + post.id + '">' +
            '<div class="post-item-header">' +
                '<span class="post-item-date">' + formatDate(post.date) + '</span>' +
                '<span class="post-item-badge ' + post.category + '">' + formatCategory(post.category) + '</span>' +
            '</div>' +
            '<div class="post-item-preview">' + escapeHtml(post.content.substring(0, 80)) + '...</div>' +
            '<div class="post-item-footer">' +
                '<span>' + (post.word_count || 0) + ' words</span>' +
                (postedIds.has(post.id) ? '<span class="posted-badge">Posted</span>' : '') +
            '</div>' +
        '</div>'
    ).join('');
    
    document.querySelectorAll('.post-item').forEach(item => {
        item.addEventListener('click', () => selectPost(item.dataset.id));
    });
}

function selectPost(postId) {
    selectedPostId = postId;
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    document.querySelectorAll('.post-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.id === postId);
    });
    
    $('previewTitle').textContent = formatDate(post.date) + ' - ' + formatCategory(post.category);
    $('previewActions').style.display = 'flex';
    
    $('previewContent').innerHTML = 
        '<div class="preview-post">' +
            '<div class="preview-post-meta">' +
                '<span>' + formatDate(post.date) + '</span>' +
                '<span class="preview-category">' + formatCategory(post.category) + '</span>' +
                '<span>' + (post.word_count || 0) + ' words</span>' +
            '</div>' +
            '<div class="preview-body">' + escapeHtml(post.content) + '</div>' +
            '<div class="preview-footer">' +
                '<span>ID: ' + post.id + '</span>' +
                (!postedIds.has(post.id) ? '<button class="btn btn-sm btn-success" onclick="markSelectedPosted()">Mark Posted</button>' : '<span style="color:#10b981;">Posted</span>') +
            '</div>' +
        '</div>';
}

function copySelectedPost() {
    const post = allPosts.find(p => p.id === selectedPostId);
    if (!post) return;
    navigator.clipboard.writeText(post.content).then(() => showToast('Copied!', 'success')).catch(() => showToast('Error', 'error'));
}

function markSelectedPosted() {
    if (!selectedPostId || postedIds.has(selectedPostId)) return;
    postedIds.add(selectedPostId);
    savePostedIds();
    showToast('Marked as posted!', 'success');
    filterPosts();
    updateStats();
    clearPreview();
}

function clearPreview() {
    selectedPostId = null;
    $('previewTitle').textContent = 'Select a post';
    $('previewActions').style.display = 'none';
    $('previewContent').innerHTML = '<div class="preview-empty"><p>Click on a post to preview it</p></div>';
}

function updateStats() {
    const total = allPosts.length, posted = postedIds.size;
    const pct = total > 0 ? Math.round((posted / total) * 100) : 0;
    $('totalPosts').textContent = total + ' Posts';
    $('postedCount').textContent = posted + ' Posted';
    $('progressPercent').textContent = pct + '%';
    $('progressFill').style.width = pct + '%';
    $('progressText').textContent = posted + ' / ' + total + ' posted';
    $('progressPercentText').textContent = pct + '% complete';
}

function changePage(dir) {
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const newPage = currentPage + dir;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderPosts();
    }
}

function showLoading(show) {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

function showToast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    $('toastContainer').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function formatDate(d) { if (!d) return ''; return new Date(d).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric'}); }
function formatCategory(c) { const l={ai_ml:'AI/ML',tech:'Tech',tutorial:'Tutorial',books:'Books',thoughts:'Thoughts',bengali:'Bengali',general:'General'}; return l[c] || c || 'General'; }
function escapeHtml(t) { if (!t) return ''; const d=document.createElement('div'); d.textContent=t; return d.innerHTML; }
function debounce(f, w) { let t; return function() { clearTimeout(t); t = setTimeout(() => f.apply(this, arguments), w); }; }

window.markSelectedPosted = markSelectedPosted;
