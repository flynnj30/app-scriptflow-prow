// ================================================================
// OBJECTION HANDLER - Complete
// ================================================================

const ObjectionHandler = {
    categories: {
        reflex: {
            name: 'Reflex Brush-offs',
            icon: '🔴',
            description: 'Quick responses to initial resistance',
            objections: [
                { id: 'not_interested', label: '"I\'m not interested."', response: 'I totally understand, I\'m not trying to sell you anything. The website is already built and it\'s yours to look at for free.' },
                { id: 'too_busy', label: '"I\'m too busy."', response: 'Totally get it, I don\'t want to take up your time right now. I just wanted to show it to you another day, it would only take like 10 minutes.' },
                { id: 'send_info', label: '"Just send me the info."', response: 'I could send you some info about the offer, but honestly you should take a look for yourself, the website looks great. It only takes 10 minutes.' },
                { id: 'email_website', label: '"Can you just email me the website?"', response: 'I\'d love to, but the website isn\'t online yet, right now it\'s just a file on our end. The only way to actually show it to you is to share my screen, and it only takes 10 minutes.' }
            ]
        },
        we_dont_need: {
            name: '"We Don\'t Need It"',
            icon: '🟡',
            description: 'Responses when they say they\'re already sorted',
            objections: [
                { id: 'have_website', label: '"We already have a website."', response: 'Oh nice, when was it last updated? We actually put together a modern version specifically for your business, might be worth a quick look to compare.' },
                { id: 'dont_need_website', label: '"We don\'t need a website."', response: 'Totally fair, but it\'s not really about the website, it\'s about more jobs. A good site gets you found by more people and brings in more work.' },
                { id: 'do_it_myself', label: '"I\'ll do it myself."', response: 'That\'s great. How long have you been planning to? What if it was basically done for you by the end of this week?' },
                { id: 'have_web_designer', label: '"We already have a web designer."', response: 'Right, isn\'t it better to have options? There\'s a big difference between just getting a website and getting one done well.' }
            ]
        },
        skeptical: {
            name: 'Skeptical Questions',
            icon: '🟠',
            description: 'Fair questions that need simple, relaxed answers',
            objections: [
                { id: 'how_much_cost', label: '"How much is this going to cost?"', response: 'Great question. The walkthrough is completely free, there\'s no cost just to look at the website.' },
                { id: 'whats_catch', label: '"What\'s the catch?"', response: 'No catch. If you love it, you pay us to fully flesh it out and get it online for you. If you don\'t like it, we just leave it at that.' },
                { id: 'help_business', label: '"Is this going to help my business?"', response: 'Of course it will. It\'ll make you way easier to find on Google, make you look more trustworthy and professional.' },
                { id: 'got_number', label: '"How did you get my number?"', response: 'Your business shows up on Google, that\'s where we found you. We noticed you didn\'t have a website linked to your profile.' }
            ]
        },
        gatekeepers: {
            name: 'Gatekeepers',
            icon: '🟣',
            description: 'Handling receptionists and employees',
            objections: [
                { id: 'owner_not_in', label: '"The owner isn\'t in right now."', response: 'Alright, no problem, I can give them a call back. When will they be back in?' },
                { id: 'owner_unavailable', label: '"The owner is unavailable."', response: 'No worries. Can I leave a message, or is there a better time to reach them?' },
                { id: 'take_message', label: '"I can take a message."', response: 'Great! Could you let them know that I\'ve put together a free modern preview of their website?' }
            ]
        }
    },

    isOpen: false,
    activeCategory: 'reflex',
    searchTerm: '',
    favorites: JSON.parse(localStorage.getItem('objectionFavorites') || '[]'),

    init() {
        this.injectStyles();
        this.createPanel();
        this.setupEventListeners();
        console.log('Objection Handler initialized');
    },

    injectStyles() {
        const style = document.createElement('style');
        style.id = 'objection-handler-styles';
        style.textContent = `
            .objection-toggle-wrapper { position: relative; display: inline-flex; }
            .objection-toggle-icon { background: none; border: none; color: var(--text-muted); font-size: 1.1rem; cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: var(--transition); position: relative; display: inline-flex; align-items: center; gap: 4px; }
            .objection-toggle-icon:hover { background: var(--bg-primary); color: var(--primary); }
            .objection-toggle-icon .badge-count { font-size: 0.55rem; background: var(--primary); color: white; padding: 1px 6px; border-radius: 10px; font-weight: 700; min-width: 16px; text-align: center; }
            .objection-toggle-icon.active { color: var(--primary); background: rgba(59, 130, 246, 0.1); }
            .objection-panel-integrated { position: absolute; top: calc(100% + 8px); right: 0; width: 520px; max-width: calc(100vw - 40px); max-height: 500px; background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); z-index: 1000; transform: translateY(10px) scale(0.95); opacity: 0; visibility: hidden; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; display: flex; flex-direction: column; pointer-events: none; }
            .objection-panel-integrated.open { transform: translateY(0) scale(1); opacity: 1; visibility: visible; pointer-events: auto; }
            .objection-panel-header { padding: 12px 16px; background: var(--bg-card); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
            .objection-panel-header h4 { font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0; }
            .objection-panel-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: var(--transition); font-size: 0.9rem; }
            .objection-panel-close:hover { background: var(--bg-primary); color: var(--text-primary); }
            .objection-panel-search { padding: 8px 12px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; position: relative; }
            .objection-panel-search input { width: 100%; padding: 6px 12px 6px 32px; border-radius: 16px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 0.8rem; outline: none; transition: var(--transition); }
            .objection-panel-search input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
            .objection-panel-search .search-icon-pos { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); opacity: 0.4; font-size: 0.7rem; }
            .objection-categories-integrated { display: flex; gap: 4px; padding: 6px 12px; overflow-x: auto; border-bottom: 1px solid var(--border-color); flex-shrink: 0; scrollbar-width: none; }
            .objection-categories-integrated::-webkit-scrollbar { display: none; }
            .objection-cat-btn-int { padding: 4px 12px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-secondary); font-size: 0.7rem; cursor: pointer; white-space: nowrap; transition: var(--transition); font-weight: 500; }
            .objection-cat-btn-int:hover { border-color: var(--primary); color: var(--text-primary); }
            .objection-cat-btn-int.active { background: var(--primary); color: white; border-color: var(--primary); }
            .objection-cat-btn-int .cat-count-int { background: rgba(255, 255, 255, 0.15); padding: 0 5px; border-radius: 8px; font-size: 0.55rem; margin-left: 3px; }
            .objection-list-integrated { flex: 1; overflow-y: auto; padding: 8px 12px; min-height: 120px; max-height: 280px; }
            .objection-list-integrated::-webkit-scrollbar { width: 3px; }
            .objection-list-integrated::-webkit-scrollbar-track { background: transparent; }
            .objection-list-integrated::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }
            .objection-item-int { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; margin-bottom: 6px; transition: var(--transition); cursor: pointer; }
            .objection-item-int:hover { border-color: var(--primary); box-shadow: var(--shadow-sm); }
            .objection-item-int .obj-label { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); display: block; }
            .objection-item-int .obj-response { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; padding: 6px 10px; background: var(--bg-primary); border-radius: 6px; border-left: 3px solid var(--primary); margin-top: 4px; display: none; }
            .objection-item-int.expanded .obj-response { display: block; }
            .objection-item-int .obj-actions { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
            .objection-item-int .obj-actions button { padding: 2px 10px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-secondary); font-size: 0.6rem; cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 3px; }
            .objection-item-int .obj-actions button:hover { border-color: var(--primary); color: var(--text-primary); }
            .objection-item-int .obj-actions .copy-btn-int:hover { border-color: var(--success); color: var(--success); }
            .objection-item-int .obj-actions .fav-btn-int.active { color: var(--favorite-color); border-color: var(--favorite-color); }
            .objection-empty-int { text-align: center; padding: 30px 16px; color: var(--text-muted); }
            .objection-empty-int i { font-size: 2rem; display: block; margin-bottom: 8px; opacity: 0.3; }
            .objection-panel-footer-int { padding: 8px 12px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; font-size: 0.65rem; color: var(--text-muted); }
            .objection-panel-footer-int .footer-stats-int { display: flex; gap: 10px; }
            .copy-toast-int { position: fixed; bottom: 30px; right: 30px; background: var(--success); color: white; padding: 6px 18px; border-radius: 24px; font-size: 0.8rem; font-weight: 500; z-index: 10000; animation: slideInRight 0.3s ease; box-shadow: var(--shadow-md); pointer-events: none; }
            .copy-toast-int.fade-out { opacity: 0; transform: translateX(20px); transition: all 0.3s ease; }
            @media (max-width: 768px) { .objection-panel-integrated { width: calc(100vw - 30px); right: -10px; max-height: 420px; } }
            @media (max-width: 480px) { .objection-panel-integrated { width: calc(100vw - 20px); right: -5px; max-height: 380px; } }
        `;
        document.head.appendChild(style);
    },

    getTotalObjections() {
        let total = 0;
        for (const category of Object.values(this.categories)) {
            total += category.objections.length;
        }
        return total;
    },

    createPanel() {
        const scriptActions = document.querySelector('.script-actions');
        if (!scriptActions) { setTimeout(() => this.createPanel(), 200); return; }
        
        if (document.querySelector('.objection-toggle-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'objection-toggle-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-flex';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'objection-toggle-icon';
        toggleBtn.id = 'objectionToggleBtn';
        toggleBtn.innerHTML = `
            <i class="fas fa-shield-alt"></i>
            <span class="badge-count">${this.getTotalObjections()}</span>
            <span class="tooltip-text">Objection Handler (Ctrl+Shift+O)</span>
        `;

        const panel = document.createElement('div');
        panel.className = 'objection-panel-integrated';
        panel.id = 'objectionPanel';
        panel.innerHTML = `
            <div class="objection-panel-header">
                <h4><span>⚡</span> Objection Handler <span class="header-sub">Senior Setter/Booker</span></h4>
                <button class="objection-panel-close" id="objectionPanelClose"><i class="fas fa-times"></i></button>
            </div>
            <div class="objection-panel-search">
                <span class="search-icon-pos">🔍</span>
                <input type="text" id="objectionSearch" placeholder="Search objections..." />
            </div>
            <div class="objection-categories-integrated" id="objectionCategories"></div>
            <div class="objection-list-integrated" id="objectionList"></div>
            <div class="objection-panel-footer-int">
                <div class="footer-stats-int"><span>📋 <span id="objCount">0</span></span><span>⭐ <span id="favCount">0</span></span></div>
                <span><kbd>Ctrl+Shift+O</kbd> toggle</span>
            </div>
        `;

        wrapper.appendChild(toggleBtn);
        wrapper.appendChild(panel);

        const favoriteBtn = scriptActions.querySelector('#favoriteScriptBtn');
        if (favoriteBtn) {
            scriptActions.insertBefore(wrapper, favoriteBtn.nextSibling);
        } else {
            scriptActions.appendChild(wrapper);
        }

        this.elements = {
            wrapper: wrapper,
            toggleBtn: toggleBtn,
            panel: panel,
            closeBtn: document.getElementById('objectionPanelClose'),
            searchInput: document.getElementById('objectionSearch'),
            categoriesContainer: document.getElementById('objectionCategories'),
            listContainer: document.getElementById('objectionList'),
            countEl: document.getElementById('objCount'),
            favCountEl: document.getElementById('favCount')
        };

        this.renderCategories();
        this.renderList();

        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.close(); });
        }

        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderList();
            });
        }

        document.addEventListener('click', (e) => {
            if (this.isOpen && this.elements.wrapper && !this.elements.wrapper.contains(e.target)) {
                this.close();
            }
        });
    },

    renderCategories() {
        const container = this.elements.categoriesContainer;
        if (!container) return;

        container.innerHTML = Object.entries(this.categories).map(([key, cat]) => `
            <button class="objection-cat-btn-int ${key === this.activeCategory ? 'active' : ''}" data-category="${key}">
                <span class="cat-icon">${cat.icon}</span>
                ${cat.name}
                <span class="cat-count-int">${cat.objections.length}</span>
            </button>
        `).join('');

        container.querySelectorAll('.objection-cat-btn-int').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.activeCategory = btn.dataset.category;
                this.renderCategories();
                this.renderList();
            });
        });
    },

    renderList() {
        const container = this.elements.listContainer;
        if (!container) return;

        const category = this.categories[this.activeCategory];
        if (!category) {
            container.innerHTML = `<div class="objection-empty-int"><i class="fas fa-folder-open"></i><p>Category not found</p></div>`;
            return;
        }

        let objections = category.objections;
        if (this.searchTerm) {
            objections = objections.filter(o =>
                o.label.toLowerCase().includes(this.searchTerm) ||
                o.response.toLowerCase().includes(this.searchTerm)
            );
        }

        if (this.elements.countEl) this.elements.countEl.textContent = objections.length;
        if (this.elements.favCountEl) this.elements.favCountEl.textContent = this.favorites.length;

        if (objections.length === 0) {
            container.innerHTML = `<div class="objection-empty-int"><i class="fas fa-search"></i><p>No objections found${this.searchTerm ? ' matching your search' : ''}</p></div>`;
            return;
        }

        container.innerHTML = objections.map(obj => {
            const isFavorite = this.favorites.includes(obj.id);
            return `
                <div class="objection-item-int" data-id="${obj.id}">
                    <span class="obj-label">${obj.label}</span>
                    <div class="obj-response">${obj.response}</div>
                    <div class="obj-actions">
                        <button class="copy-btn-int" data-response="${obj.response.replace(/"/g, '&quot;')}"><i class="fas fa-copy"></i> Copy</button>
                        <button class="expand-btn-int"><i class="fas fa-chevron-down"></i></button>
                        <button class="fav-btn-int ${isFavorite ? 'active' : ''}" data-id="${obj.id}"><i class="fas fa-star"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.objection-item-int').forEach(item => {
            const expandBtn = item.querySelector('.expand-btn-int');
            if (expandBtn) {
                expandBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.classList.toggle('expanded');
                    const icon = expandBtn.querySelector('i');
                    if (icon) icon.className = item.classList.contains('expanded') ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
                });
            }

            const copyBtn = item.querySelector('.copy-btn-int');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const response = copyBtn.dataset.response;
                    if (response) {
                        this.copyToClipboard(response);
                        this.showCopyToast('Response copied!');
                    }
                });
            }

            const favBtn = item.querySelector('.fav-btn-int');
            if (favBtn) {
                favBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = favBtn.dataset.id;
                    this.toggleFavorite(id);
                    this.renderList();
                });
            }

            item.addEventListener('click', (e) => {
                if (e.target.closest('.obj-actions')) return;
                item.classList.toggle('expanded');
                const expandBtn = item.querySelector('.expand-btn-int');
                if (expandBtn) {
                    const icon = expandBtn.querySelector('i');
                    if (icon) icon.className = item.classList.contains('expanded') ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
                }
            });
        });
    },

    toggleFavorite(id) {
        const index = this.favorites.indexOf(id);
        if (index > -1) {
            this.favorites.splice(index, 1);
            if (window.showToast) window.showToast('Removed from favorites', 'info');
        } else {
            this.favorites.push(id);
            if (window.showToast) window.showToast('Added to favorites', 'success');
        }
        localStorage.setItem('objectionFavorites', JSON.stringify(this.favorites));
    },

    copyToClipboard(text) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => this.fallbackCopy(text));
        } else {
            this.fallbackCopy(text);
        }
    },

    fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
    },

    showCopyToast(message) {
        const existing = document.querySelector('.copy-toast-int');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'copy-toast-int';
        toast.textContent = '✅ ' + message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    },

    toggle() {
        if (this.isOpen) { this.close(); } else { this.open(); }
    },

    open() {
        this.isOpen = true;
        if (this.elements.panel) this.elements.panel.classList.add('open');
        if (this.elements.toggleBtn) this.elements.toggleBtn.classList.add('active');
        if (this.elements.searchInput) setTimeout(() => this.elements.searchInput.focus(), 100);
    },

    close() {
        this.isOpen = false;
        if (this.elements.panel) this.elements.panel.classList.remove('open');
        if (this.elements.toggleBtn) this.elements.toggleBtn.classList.remove('active');
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
            this.searchTerm = '';
            this.renderList();
        }
    },

    setupEventListeners() {
        if (this.elements.toggleBtn) {
            this.elements.toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
        }

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
                e.preventDefault();
                this.toggle();
            }
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    },

    onScriptLoaded() {
        const existingWrapper = document.querySelector('.objection-toggle-wrapper');
        if (!existingWrapper) {
            this.createPanel();
        } else {
            const badge = existingWrapper.querySelector('.badge-count');
            if (badge) badge.textContent = this.getTotalObjections();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => { ObjectionHandler.init(); }, 600);
});

window.ObjectionHandler = ObjectionHandler;
console.log('Objection Handler initialized');