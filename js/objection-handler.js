// ================================================================
// OBJECTION HANDLER - SENIOR SETTER/BOOKER BANNER
// ================================================================

const ObjectionHandler = {
    // State
    isOpen: false,
    currentCategory: 'reflex',
    currentObjection: null,
    expandedCards: new Set(),
    
    // Data
    categories: {
        reflex: {
            label: '🔄 Reflex Brush-Offs',
            icon: '🔄',
            color: '#f59e0b',
            objections: [
                {
                    id: 'not_interested',
                    objection: '"I\'m not interested."',
                    response: 'I totally understand, I\'m not trying to sell you anything. The website is already built and it\'s yours to look at for free.',
                    tip: 'Take the pressure off immediately. Remind them it\'s free and already done.'
                },
                {
                    id: 'too_busy',
                    objection: '"I\'m too busy."',
                    response: 'Totally get it, I don\'t want to take up your time right now. I just wanted to show it to you another day, it would only take like 10 minutes.',
                    tip: 'Acknowledge their time constraints while keeping the door open for a quick 10-minute look.'
                },
                {
                    id: 'send_info',
                    objection: '"Just send me the info."',
                    response: 'I could send you some info about the offer, but honestly you should take a look for yourself, the website looks great. It only takes 10 minutes.',
                    tip: 'Gently steer them toward seeing it themselves rather than just reading about it.'
                },
                {
                    id: 'email_website',
                    objection: '"Can you just email me the website?"',
                    response: 'I\'d love to, but the website isn\'t online yet, right now it\'s just a file on our end. The only way to actually show it to you is to share my screen, and it only takes 10 minutes.',
                    tip: 'Explain why screen sharing is necessary while emphasizing the short time commitment.'
                },
                {
                    id: 'call_back_later',
                    objection: '"Call me back later."',
                    response: 'Sure. Just so I\'m not calling back and forth, can we lock in a specific time that works for you?',
                    tip: 'Convert a vague "later" into a concrete appointment.'
                }
            ]
        },
        existing: {
            label: '💼 "We Don\'t Need It"',
            icon: '💼',
            color: '#3b82f6',
            objections: [
                {
                    id: 'already_website',
                    objection: '"We already have a website."',
                    response: 'Oh nice, when was it last updated? We actually put together a modern version specifically for your business, might be worth a quick look to compare.',
                    tip: 'Acknowledge their existing site while highlighting the value of a comparison.'
                },
                {
                    id: 'no_website_needed',
                    objection: '"We don\'t need a website."',
                    response: 'Totally fair, but it\'s not really about the website, it\'s about more jobs. A good site gets you found by more people and brings in more work. You\'re not saying no to more customers, right? And it\'s free to take a look.',
                    tip: 'Reframe the conversation from "website" to "more jobs" and "more customers."'
                },
                {
                    id: 'do_it_myself',
                    objection: '"I\'ll do it myself."',
                    response: 'That\'s great. How long have you been planning to? What if it was basically done for you by the end of this week?',
                    tip: 'Challenge their timeline gently while offering a faster alternative.'
                },
                {
                    id: 'have_designer',
                    objection: '"We already have a web designer."',
                    response: 'Right, isn\'t it better to have options? There\'s a big difference between just getting a website and getting one done well, and the look costs you nothing.',
                    tip: 'Position your offer as a free option to compare against their current designer.'
                },
                {
                    id: 'someone_working',
                    objection: '"We have someone working on it."',
                    response: 'Awesome, then you should definitely take a look. Worst case, you get some inspiration or get to compare the two. But I bet you\'re going to like ours better, and if you do, we can work together.',
                    tip: 'Use friendly competition to pique their interest in seeing your work.'
                },
                {
                    id: 'word_of_mouth',
                    objection: '"Word of mouth is enough."',
                    response: 'Word of mouth is great, it means you do solid work. But it only reaches people who already know you. A website puts you in front of everyone searching for what you do right now, that\'s a whole stream of new jobs you\'re missing. And it\'s free to take a look.',
                    tip: 'Acknowledge their success while showing the untapped potential of a website.'
                },
                {
                    id: 'too_small',
                    objection: '"We\'re too small."',
                    response: 'Honestly, smaller businesses are where a website makes the biggest difference. It makes you look just as professional as the big guys.',
                    tip: 'Flip their concern into a strength—small businesses benefit the most from a professional online presence.'
                }
            ]
        },
        skeptical: {
            label: '❓ Skeptical Questions',
            icon: '❓',
            color: '#8b5cf6',
            objections: [
                {
                    id: 'how_much',
                    objection: '"How much is this going to cost?"',
                    response: 'Great question. The walkthrough is completely free, there\'s no cost just to look at the website. The price does vary a little depending on the website, but I promise it\'s very affordable, and my colleague covers all the options on the call.',
                    tip: 'Keep the focus on the free walkthrough and defer pricing details to the closer.'
                },
                {
                    id: 'whats_catch',
                    objection: '"What\'s the catch?"',
                    response: 'No catch. If you love it, you pay us to fully flesh it out and get it online for you. If you don\'t like it, we just leave it at that, no hard feelings.',
                    tip: 'Be transparent and straightforward—no hidden agendas.'
                },
                {
                    id: 'will_help',
                    objection: '"Is this going to help my business?"',
                    response: 'Of course it will. It\'ll make you way easier to find on Google, make you look more trustworthy and professional, and give customers an easy way to reach you and book you. A good website brings in business, that\'s the whole point.',
                    tip: 'Focus on the practical, tangible benefits they\'ll see.'
                },
                {
                    id: 'got_number',
                    objection: '"How did you get my number?"',
                    response: 'Your business shows up on Google, that\'s where we found you. We noticed you didn\'t have a website linked to your profile.',
                    tip: 'Be honest and specific about how you found them.'
                },
                {
                    id: 'are_you_local',
                    objection: '"Are you local?"',
                    response: 'We\'re based in Delaware, but we work with businesses like yours all over, and everything we do is focused on helping you show up better in your own area online.',
                    tip: 'Acknowledge location while emphasizing local business focus.'
                }
            ]
        },
        gatekeeper: {
            label: '🚪 Gatekeepers',
            icon: '🚪',
            color: '#ef4444',
            objections: [
                {
                    id: 'owner_not_in',
                    objection: '"The owner isn\'t in right now."',
                    response: 'Alright, no problem, I can give them a call back. When will they be back in?',
                    tip: 'Stay friendly, don\'t push, and get a concrete time for callback.'
                }
            ]
        }
    },
    
    // Initialize the banner
    init: function() {
        this.createBanner();
        this.loadState();
        this.attachEvents();
        console.log('🎯 Objection Handler initialized - Press Ctrl+Shift+O to toggle');
    },
    
    // Create the banner HTML
    createBanner: function() {
        const existingBanner = document.getElementById('objectionBanner');
        if (existingBanner) existingBanner.remove();
        
        const banner = document.createElement('div');
        banner.id = 'objectionBanner';
        banner.className = 'objection-banner';
        banner.innerHTML = `
            <div class="objection-banner-header" id="objectionBannerToggle">
                <div class="objection-banner-title">
                    <span class="objection-banner-icon">🛡️</span>
                    <span class="objection-banner-text">Senior Setter/Booker Objection Handling</span>
                    <span class="objection-banner-badge">${this.getTotalObjectionCount()} scripts</span>
                </div>
                <div class="objection-banner-controls">
                    <button class="objection-banner-toggle-btn" id="objectionToggleBtn" aria-label="Toggle objection handler">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
            <div class="objection-banner-body" id="objectionBannerBody" style="display:none;">
                <div class="objection-banner-content">
                    <div class="objection-category-nav" id="objectionCategoryNav">
                        ${Object.entries(this.categories).map(([key, cat]) => `
                            <button class="objection-category-btn ${key === this.currentCategory ? 'active' : ''}" data-category="${key}" style="border-color:${cat.color};">
                                <span class="category-icon">${cat.icon}</span>
                                <span class="category-label">${cat.label}</span>
                                <span class="category-count">${cat.objections.length}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="objection-cards-container" id="objectionCardsContainer">
                        ${this.renderCards(this.currentCategory)}
                    </div>
                    <div class="objection-banner-footer">
                        <div class="objection-footer-tip">
                            <i class="fas fa-lightbulb"></i>
                            <span>Your single best tool is the offer itself. The website is already built, it's free, and there's no obligation.</span>
                        </div>
                        <div class="objection-footer-actions">
                            <button class="objection-expand-all-btn" id="objectionExpandAll">
                                <i class="fas fa-expand"></i> Expand All
                            </button>
                            <button class="objection-collapse-all-btn" id="objectionCollapseAll">
                                <i class="fas fa-compress"></i> Collapse All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after the top bar
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            topBar.parentNode.insertBefore(banner, topBar.nextSibling);
        } else {
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.insertBefore(banner, mainContent.firstChild);
            }
        }
    },
    
    // Render cards for a category
    renderCards: function(categoryKey) {
        const category = this.categories[categoryKey];
        if (!category) return '<div class="objection-empty">No objections in this category.</div>';
        
        return category.objections.map(obj => `
            <div class="objection-card ${this.expandedCards.has(obj.id) ? 'expanded' : ''}" data-id="${obj.id}">
                <div class="objection-card-header" data-id="${obj.id}">
                    <span class="objection-card-icon">💬</span>
                    <span class="objection-card-objection">${obj.objection}</span>
                    <span class="objection-card-toggle">
                        <i class="fas ${this.expandedCards.has(obj.id) ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
                    </span>
                </div>
                <div class="objection-card-body" style="${this.expandedCards.has(obj.id) ? 'display:block;' : 'display:none;'}">
                    <div class="objection-response">
                        <div class="objection-response-label">🎯 Recommended Response</div>
                        <div class="objection-response-text">${obj.response}</div>
                    </div>
                    <div class="objection-tip">
                        <div class="objection-tip-label">💡 Pro Tip</div>
                        <div class="objection-tip-text">${obj.tip}</div>
                    </div>
                    <div class="objection-card-actions">
                        <button class="objection-copy-btn" data-response="${obj.response.replace(/"/g, '&quot;')}">
                            <i class="fas fa-copy"></i> Copy Response
                        </button>
                        <button class="objection-practice-btn" data-objection="${obj.objection.replace(/"/g, '&quot;')}" data-response="${obj.response.replace(/"/g, '&quot;')}">
                            <i class="fas fa-microphone"></i> Practice
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Get total objection count
    getTotalObjectionCount: function() {
        let count = 0;
        for (const category of Object.values(this.categories)) {
            count += category.objections.length;
        }
        return count;
    },
    
    // Load state from localStorage
    loadState: function() {
        try {
            const saved = localStorage.getItem('objectionHandlerState');
            if (saved) {
                const state = JSON.parse(saved);
                this.isOpen = state.isOpen || false;
                this.currentCategory = state.currentCategory || 'reflex';
                this.expandedCards = new Set(state.expandedCards || []);
            }
        } catch (e) {
            console.warn('Failed to load objection handler state:', e);
        }
    },
    
    // Save state to localStorage
    saveState: function() {
        try {
            localStorage.setItem('objectionHandlerState', JSON.stringify({
                isOpen: this.isOpen,
                currentCategory: this.currentCategory,
                expandedCards: Array.from(this.expandedCards)
            }));
        } catch (e) {
            console.warn('Failed to save objection handler state:', e);
        }
    },
    
    // Toggle banner open/close
    toggleBanner: function() {
        this.isOpen = !this.isOpen;
        const body = document.getElementById('objectionBannerBody');
        const toggleBtn = document.getElementById('objectionToggleBtn');
        
        if (body) {
            body.style.display = this.isOpen ? 'block' : 'none';
        }
        if (toggleBtn) {
            toggleBtn.innerHTML = `<i class="fas fa-chevron-${this.isOpen ? 'up' : 'down'}"></i>`;
        }
        
        this.saveState();
    },
    
    // Switch category
    switchCategory: function(categoryKey) {
        this.currentCategory = categoryKey;
        
        // Update nav buttons
        document.querySelectorAll('.objection-category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === categoryKey);
        });
        
        // Update cards
        const container = document.getElementById('objectionCardsContainer');
        if (container) {
            container.innerHTML = this.renderCards(categoryKey);
            this.attachCardEvents();
        }
        
        this.saveState();
    },
    
    // Toggle card expansion
    toggleCard: function(id) {
        if (this.expandedCards.has(id)) {
            this.expandedCards.delete(id);
        } else {
            this.expandedCards.add(id);
        }
        
        // Update the specific card
        const card = document.querySelector(`.objection-card[data-id="${id}"]`);
        if (card) {
            card.classList.toggle('expanded');
            const body = card.querySelector('.objection-card-body');
            const toggle = card.querySelector('.objection-card-toggle i');
            if (body) {
                body.style.display = this.expandedCards.has(id) ? 'block' : 'none';
            }
            if (toggle) {
                toggle.className = `fas fa-chevron-${this.expandedCards.has(id) ? 'up' : 'down'}`;
            }
        }
        
        this.saveState();
    },
    
    // Expand all cards
    expandAll: function() {
        const cards = document.querySelectorAll('.objection-card');
        cards.forEach(card => {
            const id = card.dataset.id;
            if (id) {
                this.expandedCards.add(id);
                card.classList.add('expanded');
                const body = card.querySelector('.objection-card-body');
                const toggle = card.querySelector('.objection-card-toggle i');
                if (body) body.style.display = 'block';
                if (toggle) toggle.className = 'fas fa-chevron-up';
            }
        });
        this.saveState();
    },
    
    // Collapse all cards
    collapseAll: function() {
        const cards = document.querySelectorAll('.objection-card');
        cards.forEach(card => {
            const id = card.dataset.id;
            if (id) {
                this.expandedCards.delete(id);
                card.classList.remove('expanded');
                const body = card.querySelector('.objection-card-body');
                const toggle = card.querySelector('.objection-card-toggle i');
                if (body) body.style.display = 'none';
                if (toggle) toggle.className = 'fas fa-chevron-down';
            }
        });
        this.saveState();
    },
    
    // Copy response to clipboard
    copyResponse: function(response) {
        const text = response.replace(/&quot;/g, '"');
        navigator.clipboard.writeText(text).then(() => {
            showToast('Response copied to clipboard! 📋', 'success');
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('Response copied to clipboard! 📋', 'success');
        });
    },
    
    // Practice mode - open a practice modal
    practiceMode: function(objection, response) {
        const cleanObjection = objection.replace(/&quot;/g, '"');
        const cleanResponse = response.replace(/&quot;/g, '"');
        
        // Create practice modal
        const existing = document.getElementById('objectionPracticeModal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'objectionPracticeModal';
        modal.className = 'objection-practice-modal';
        modal.innerHTML = `
            <div class="objection-practice-content">
                <div class="objection-practice-header">
                    <h3>🎯 Practice Session</h3>
                    <button class="objection-practice-close" id="objectionPracticeClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="objection-practice-body">
                    <div class="objection-practice-scenario">
                        <div class="objection-practice-label">Customer Says:</div>
                        <div class="objection-practice-objection">${cleanObjection}</div>
                    </div>
                    <div class="objection-practice-response-area">
                        <div class="objection-practice-label">Your Response (Practice):</div>
                        <textarea class="objection-practice-input" rows="4" placeholder="Type your response here..."></textarea>
                    </div>
                    <div class="objection-practice-recommended">
                        <div class="objection-practice-label">💡 Recommended Response:</div>
                        <div class="objection-practice-recommended-text">${cleanResponse}</div>
                        <button class="objection-practice-reveal-btn" id="objectionRevealResponse">
                            <i class="fas fa-eye"></i> Show Recommended Response
                        </button>
                    </div>
                    <div class="objection-practice-actions">
                        <button class="objection-practice-copy-btn" data-response="${cleanResponse.replace(/"/g, '&quot;')}">
                            <i class="fas fa-copy"></i> Copy Response
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => modal.classList.add('active'), 10);
        
        // Close handler
        const closeBtn = document.getElementById('objectionPracticeClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            });
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        });
        
        // Reveal recommended response
        const revealBtn = document.getElementById('objectionRevealResponse');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => {
                const recommendedText = document.querySelector('.objection-practice-recommended-text');
                if (recommendedText) {
                    recommendedText.style.display = recommendedText.style.display === 'none' ? 'block' : 'none';
                    revealBtn.innerHTML = recommendedText.style.display === 'none' ? 
                        '<i class="fas fa-eye"></i> Show Recommended Response' : 
                        '<i class="fas fa-eye-slash"></i> Hide Recommended Response';
                }
            });
        }
        
        // Copy button in practice modal
        const copyBtn = document.querySelector('.objection-practice-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const response = copyBtn.dataset.response.replace(/&quot;/g, '"');
                this.copyResponse(response);
            });
        }
    },
    
    // Attach all event listeners
    attachEvents: function() {
        // Toggle banner
        const toggleBtn = document.getElementById('objectionToggleBtn');
        const header = document.getElementById('objectionBannerToggle');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleBanner();
            });
        }
        if (header) {
            header.addEventListener('click', (e) => {
                if (!e.target.closest('.objection-banner-controls')) {
                    this.toggleBanner();
                }
            });
        }
        
        // Category navigation
        document.querySelectorAll('.objection-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchCategory(btn.dataset.category);
            });
        });
        
        // Expand all / Collapse all
        const expandAll = document.getElementById('objectionExpandAll');
        const collapseAll = document.getElementById('objectionCollapseAll');
        if (expandAll) expandAll.addEventListener('click', () => this.expandAll());
        if (collapseAll) collapseAll.addEventListener('click', () => this.collapseAll());
        
        // Card events
        this.attachCardEvents();
        
        // Restore state
        if (this.isOpen) {
            const body = document.getElementById('objectionBannerBody');
            const toggleBtn = document.getElementById('objectionToggleBtn');
            if (body) body.style.display = 'block';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
    },
    
    // Attach card-specific events
    attachCardEvents: function() {
        // Card header click to toggle
        document.querySelectorAll('.objection-card-header').forEach(header => {
            header.addEventListener('click', () => {
                const id = header.dataset.id;
                if (id) this.toggleCard(id);
            });
        });
        
        // Copy buttons
        document.querySelectorAll('.objection-copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const response = btn.dataset.response;
                this.copyResponse(response);
            });
        });
        
        // Practice buttons
        document.querySelectorAll('.objection-practice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const objection = btn.dataset.objection;
                const response = btn.dataset.response;
                this.practiceMode(objection, response);
            });
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the app to initialize
    setTimeout(() => {
        ObjectionHandler.init();
    }, 500);
});

// Make globally accessible
window.ObjectionHandler = ObjectionHandler;