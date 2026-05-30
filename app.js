const PER_PAGE = 30;
let allPosts = [], postedIds = new Set(), filtered = [], selected = null, page = 1;
let activeCategory = 'all', activeYear = 'all', showPosted = false, shortOnly = false;
const E = id => document.getElementById(id);
document.addEventListener('DOMContentLoaded', start);

async function start() {
    E('loading').style.display = 'flex';
    loadPosted();
    await loadPosts();
    E('loading').style.display = 'none';
    setupEvents();
    render();
}

function loadPosted() {
    const s = localStorage.getItem('fb_medium_posted');
    if (s) postedIds = new Set(JSON.parse(s));
}

function savePosted() {
    localStorage.setItem('fb_medium_posted', JSON.stringify([...postedIds]));
}

async function loadPosts() {
    const maxChunks = 30;
    let loadedChunks = 0;

    for (let i = 1; i <= maxChunks; i++) {
        try {
            const r = await fetch('posts_' + i + '.json');
            if (!r.ok) break;
            const c = await r.json();
            if (Array.isArray(c) && c.length > 0) {
                allPosts.push(...c);
                loadedChunks++;
            } else {
                break;
            }
        } catch (e) {
            break;
        }
    }

    allPosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

function setupEvents() {
    E('searchInput').addEventListener('input', debounce(filter, 200));
    E('prevBtn').addEventListener('click', () => changePage(-1));
    E('nextBtn').addEventListener('click', () => changePage(1));
    E('copyBtn').addEventListener('click', copyPost);
    E('markPostedBtn').addEventListener('click', markPosted);
    document.addEventListener('keydown', handleKeyboard);
}

function handleKeyboard(e) {
    if (e.key === 'Escape') {
        selected = null;
        render();
    }
}

function filter() {
    const q = E('searchInput').value.toLowerCase().trim();
    filtered = allPosts.filter(p => {
        if (!showPosted && postedIds.has(p.id)) return false;
        if (activeCategory !== 'all' && p.category !== activeCategory) return false;
        if (activeYear !== 'all') {
            const postYear = p.date ? new Date(p.date).getFullYear().toString() : '';
            if (postYear !== activeYear) return false;
        }
        if (shortOnly && (!p.word_count || p.word_count >= 50)) return false;
        if (q && !(p.content + p.id).toLowerCase().includes(q)) return false;
        return true;
    });
    page = 1;
    render();
}

function render() {
    renderFilters();
    renderList();
    updateStats();
}

function renderFilters() {
    // Build category counts (respecting showPosted)
    const cats = {};
    allPosts.forEach(p => {
        if (!showPosted && postedIds.has(p.id)) return;
        cats[p.category] = (cats[p.category] || 0) + 1;
    });
    
    // Build year counts (respecting showPosted)
    const years = {};
    allPosts.forEach(p => {
        if (!showPosted && postedIds.has(p.id)) return;
        const y = p.date ? new Date(p.date).getFullYear().toString() : '';
        if (y) years[y] = (years[y] || 0) + 1;
    });
    
    // Count short posts (<50 words)
    const shortCount = allPosts.filter(p => {
        if (!showPosted && postedIds.has(p.id)) return false;
        return p.word_count && p.word_count < 50;
    }).length;
    
    // Category filter
    const catHtml = ['<button class="filter-chip active" data-cat="all">All</button>'];
    Object.entries(cats).forEach(([k, v]) => {
        const active = activeCategory === k ? ' active' : '';
        catHtml.push('<button class="filter-chip' + active + '" data-cat="' + k + '">' + fmtCat(k) + ' (' + v + ')</button>');
    });
    
    // Year filter
    const sortedYears = Object.keys(years).sort((a, b) => b - a);
    const yearHtml = sortedYears.map(y => {
        const active = activeYear === y ? ' active' : '';
        return '<button class="filter-chip filter-chip-year' + active + '" data-year="' + y + '">' + y + ' (' + years[y] + ')</button>';
    });
    
    // Show/hide posted toggle
    const postedCount = postedIds.size;
    const showBtnClass = showPosted ? 'filter-chip active' : 'filter-chip';
    const showBtnLabel = 'Posted (' + postedCount + ')';
    
    // Short posts filter
    const shortBtnClass = shortOnly ? 'filter-chip active' : 'filter-chip';
    const shortBtnLabel = '<50 words (' + shortCount + ')';
    
    E('categoryFilters').innerHTML = 
        '<div class="filter-section"><div class="filter-section-label">Category</div>' + catHtml.join('') + '</div>' +
        '<div class="filter-section"><div class="filter-section-label">Year</div><button class="filter-chip filter-chip-year' + (activeYear === 'all' ? ' active' : '') + '" data-year="all">All</button>' + yearHtml.join('') + '</div>' +
        '<div class="filter-section"><button class="' + showBtnClass + '" id="showPostedBtn">' + showBtnLabel + '</button> <button class="' + shortBtnClass + '" id="shortBtn">' + shortBtnLabel + '</button></div>';
    
    // Event delegation for all filter chips
    E('categoryFilters').addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn) return;
        
        if (btn.id === 'showPostedBtn') {
            showPosted = !showPosted;
            filter();
            return;
        }
        
        if (btn.id === 'shortBtn') {
            shortOnly = !shortOnly;
            filter();
            return;
        }
        
        if (btn.classList.contains('filter-chip-year')) {
            E('categoryFilters').querySelectorAll('.filter-chip-year').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeYear = btn.dataset.year;
            filter();
            return;
        }
        
        E('categoryFilters').querySelectorAll('.filter-chip:not(.filter-chip-year)').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        filter();
    });
}

function renderList() {
    const total = Math.ceil(filtered.length / PER_PAGE) || 1;
    const start = (page - 1) * PER_PAGE;
    const end = start + PER_PAGE;

    E('pageInfo').textContent = 'Page ' + page + ' of ' + total;
    E('prevBtn').disabled = page <= 1;
    E('nextBtn').disabled = page >= total;

    if (filtered.length === 0) {
        E('postsList').innerHTML = '<div style="padding:2rem;text-align:center;color:#888;">No posts found</div>';
        return;
    }

    E('postsList').innerHTML = filtered.slice(start, end).map(p => {
        const preview = escHtml(p.content.substring(0, 120));
        const isPosted = postedIds.has(p.id);
        const isSelected = p.id === selected;

        return '<div class="post-card' + (isSelected ? ' selected' : '') + '" ' +
               'data-id="' + p.id + '" ' +
               'role="listitem" ' +
               'tabindex="0" ' +
               'aria-label="Post from ' + fmtDate(p.date) + ', ' + fmtCat(p.category) + ', ' + (p.word_count || 0) + ' words' + (isPosted ? ', already posted' : '') + '">' +
            '<div class="post-card-header">' +
                '<span class="post-card-date">' + fmtDate(p.date) + '</span>' +
                '<span class="post-card-cat ' + (p.category || 'general') + '">' + fmtCat(p.category) + '</span>' +
            '</div>' +
            '<div class="post-card-text">' + preview + (p.content.length > 120 ? '...' : '') + '</div>' +
            '<div class="post-card-footer">' +
                '<span>' + (p.word_count || 0) + ' words</span>' +
                '<span>' + (isPosted ? '? Posted' : '') + '</span>' +
            '</div>' +
        '</div>';
    }).join('');

    E('postsList').querySelectorAll('.post-card').forEach(card => {
        const cardId = card.dataset.id;
        card.addEventListener('click', () => {
            selectPost(cardId);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectPost(card.dataset.id);
            }
        });
    });
}

function selectPost(id) {
    // Convert to number for comparison (JSON has numeric ids, dataset returns strings)
    const numId = Number(id);
    const p = allPosts.find(x => x.id === numId);
    if (!p) {
        showToast('Post not found', 'error');
        return;
    }
    
    // Update selection state
    selected = numId;
    const emptyState = E('emptyState');
    if (emptyState) emptyState.style.display = 'none';
    
    E('postsList').querySelectorAll('.post-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector('.post-card[data-id="' + id + '"]');
    if (card) card.classList.add('selected');

    E('postMeta').innerHTML = '<span>' + fmtDate(p.date) + '</span><span class="preview-cat ' + p.category + '">' + fmtCat(p.category) + '</span><span class="preview-words">' + (p.word_count || 0) + ' words</span>';
    E('contentActions').style.display = 'flex';

    const content = p.content || 'No content available';
    E('contentBody').innerHTML =
        '<div class="preview-post">' +
            '<div class="preview-meta">' +
                '<span class="preview-date">' + fmtDate(p.date) + '</span>' +
                '<span class="preview-cat ' + p.category + '">' + fmtCat(p.category) + '</span>' +
                '<span class="preview-words">' + (p.word_count || 0) + ' words</span>' +
            '</div>' +
            '<div class="preview-body">' + escHtml(content) + '</div>' +
            '<div class="preview-footer">' +
                '<span class="preview-id">ID: ' + p.id + '</span>' +
                (postedIds.has(p.id) ? '<span style="color:#059669;font-weight:600;">Posted</span>' : '<button class="preview-btn" id="previewMarkBtn">Mark as Posted</button>') +
            '</div>' +
        '</div>';

    const inlineBtn = E('previewMarkBtn');
    if (inlineBtn) inlineBtn.addEventListener('click', doMarkPosted);
}

function copyPost() {
    // Convert to number for comparison
    const numSelected = Number(selected);
    const p = allPosts.find(x => x.id === numSelected);
    if (!p) {
        showToast('No post selected', 'error');
        return;
    }
    
    const content = p.content || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(err => {
            fallbackCopy(content);
        });
    } else {
        fallbackCopy(content);
    }
}

function fallbackCopy(text) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (success) {
            showToast('Copied!', 'success');
        } else {
            showToast('Select text manually and copy', 'error');
        }
    } catch (err) {
        showToast('Copy failed: ' + err.message, 'error');
    }
}

function markPosted() {
    if (!selected || postedIds.has(selected)) return;
    postedIds.add(Number(selected));
    savePosted();
    showToast('Marked as posted!', 'success');
    filter();
}

function doMarkPosted() {
    if (!selected || postedIds.has(selected)) return;
    postedIds.add(Number(selected));
    savePosted();
    showToast('Marked as posted!', 'success');
    selectPost(selected);
}

function changePage(dir) {
    const total = Math.ceil(filtered.length / PER_PAGE);
    const np = page + dir;
    if (np >= 1 && np <= total) {
        page = np;
        renderList();
    }
}

function updateStats() {
    const total = allPosts.length, posted = postedIds.size;
    const pct = total > 0 ? Math.round((posted / total) * 100) : 0;
    E('totalPosts').textContent = total;
    E('postedCount').textContent = posted;
    E('progressText').textContent = posted + ' / ' + total + ' posted';
    E('progressPercent').textContent = pct + '%';
    E('progressFill').style.width = pct + '%';
}

function showToast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    E('toastContainer').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : ''; }
function fmtCat(c) { const m = {ai_ml:'AI/ML', tech:'Tech', tutorial:'Tutorial', books:'Books', thoughts:'Thoughts', bengali:'Bengali', general:'General'}; return m[c] || c || 'General'; }
function escHtml(t) { if (!t) return ''; const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function debounce(f, w) { let t; return () => { clearTimeout(t); t = setTimeout(f, w); }; }
window.doMarkPosted = doMarkPosted;
