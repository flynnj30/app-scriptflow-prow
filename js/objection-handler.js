// ================================================================
// OBJECTION HANDLER - INTEGRATED INTO SCRIPT MODAL
// ================================================================

const ObjectionHandler = {
    isOpen: false,
    currentCategory: 'reflex',
    expandedCards: new Set(),
    initialized: false,
    isModalOpen: false,
    _eventListenersAttached: false,
    
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
    
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        
        // Create the integrated UI if it doesn't exist
        if (!document.getElementById('objectionIntegratedBody')) {
            this.createIntegratedUI();
        }
        
        // Always attach events to ensure they're available
        this.attachEvents();
        console.log('🎯 Objection Handler initialized');
        return this;
    },
    
    // Open modal method - called from app.js
    openModal: function() {
        // Ensure initialization
        if (!this.initialized) {
            this.init();
        }
        
        // If already open, just bring it to focus
        if (this.isModalOpen) {
            const container = document.getElementById('objectionHandlerContainer');
            if (container) {
                container.style.display = 'block';
                const body = document.getElementById('objectionIntegratedBody');
                if (body) body.style.display = 'block';
            }
            return;
        }
        
        // Check if container exists, create if not
        let container = document.getElementById('objectionHandlerContainer');
        if (!container) {
            this.createIntegratedUI();
            container = document.getElementById('objectionHandlerContainer');
        }
        
        if (!container) {
            console.warn('Objection handler container not found');
            if (typeof showToast !== 'undefined') {
                showToast('Objection handler not available', 'warning');
            }
            return;
        }
        
        // Show the container
        container.style.display = 'block';
        const body = document.getElementById('objectionIntegratedBody');
        if (body) body.style.display = 'block';
        
        // Update button state
        const toggleBtn = document.getElementById('objectionToggleBtn');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Hide Objections';
            toggleBtn.style.background = 'var(--success)';
        }
        
        // Update minimize button
        const minimizeBtn = document.getElementById('objectionMinimizeBtn');
        if (minimizeBtn) {
            minimizeBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
        
        this.isOpen = true;
        this.isModalOpen = true;
        
        // Ensure current category is rendered
        this.switchCategory(this.currentCategory);
        
        // Scroll to the container if needed
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Dispatch event for analytics
        document.dispatchEvent(new CustomEvent('objectionModalOpened'));
    },
    
    // Close modal method
    closeModal: function() {
        const container = document.getElementById('objectionHandlerContainer');
        if (container) {
            container.style.display = 'none';
        }
        
        // Update button state
        const toggleBtn = document.getElementById('objectionToggleBtn');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Objections';
            toggleBtn.style.background = 'var(--secondary)';
        }
        
        this.isOpen = false;
        this.isModalOpen = false;
        
        document.dispatchEvent(new CustomEvent('objectionModalClosed'));
    },
    
    // Toggle between open and closed
    toggleModal: function() {
        if (this.isModalOpen) {
            this.closeModal();
        } else {
            this.openModal();
        }
    },
    
    createIntegratedUI: function() {
        // Check if container already exists
        let container = document.getElementById('objectionHandlerContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'objectionHandlerContainer';
            container.style.display = 'none';
            // Insert after the script panel or in a suitable location
            const scriptPanel = document.getElementById('scriptPanel');
            if (scriptPanel && scriptPanel.parentNode) {
                scriptPanel.parentNode.insertBefore(container, scriptPanel.nextSibling);
            } else {
                document.body.appendChild(container);
            }
        }
        
        container.innerHTML = `
            <div class="objection-integrated" style="margin-top:16px;">
                <div class="objection-integrated-header" id="objectionIntegratedToggle" style="display:flex; justify-content:space-between; align-items:center; padding:12px 20px; background:var(--bg-card); border-radius:16px 16px 0 0; border:1px solid var(--border-color); border-bottom:none; cursor:pointer;">
                    <div class="objection-integrated-title" style="display:flex; align-items:center; gap:12px;">
                        <span class="objection-icon" style="font-size:1.2rem;">🛡️</span>
                        <span class="objection-title" style="font-weight:600; font-size:1rem;">Objection Handling Scripts</span>
                        <span class="objection-badge" style="background:var(--primary); color:white; padding:2px 12px; border-radius:20px; font-size:0.7rem; font-weight:600;">${this.getTotalObjectionCount()} scripts</span>
                    </div>
                    <div class="objection-integrated-controls" style="display:flex; gap:8px;">
                        <button class="objection-minimize-btn" id="objectionMinimizeBtn" title="Minimize" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text-secondary);">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                        <button class="objection-close-btn" id="objectionCloseBtn" title="Close" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text-secondary);">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="objection-integrated-body" id="objectionIntegratedBody" style="border:1px solid var(--border-color); border-top:none; border-radius:0 0 16px 16px; background:var(--bg-card); overflow:hidden;">
                    <div class="objection-category-nav" id="objectionCategoryNav" style="display:flex; gap:8px; padding:12px 16px; background:var(--bg-primary); border-bottom:1px solid var(--border-color); flex-wrap:wrap;">
                        ${Object.entries(this.categories).map(([key, cat]) => `
                            <button class="objection-category-btn ${key === this.currentCategory ? 'active' : ''}" data-category="${key}" style="display:flex; align-items:center; gap:8px; padding:6px 14px; border-radius:20px; border:2px solid ${key === this.currentCategory ? cat.color : 'var(--border-color)'}; background:${key === this.currentCategory ? 'var(--bg-card)' : 'transparent'}; color:${key === this.currentCategory ? 'var(--text-primary)' : 'var(--text-secondary)'}; cursor:pointer; transition:all 0.2s; font-size:0.8rem;">
                                <span class="category-icon">${cat.icon}</span>
                                <span class="category-label">${cat.label}</span>
                                <span class="category-count" style="background:var(--bg-primary); padding:0 8px; border-radius:10px; font-size:0.6rem; font-weight:600;">${cat.objections.length}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="objection-cards-container" id="objectionCardsContainer" style="padding:12px 16px; max-height:450px; overflow-y:auto;">
                        ${this.renderCards(this.currentCategory)}
                    </div>
                    <div class="objection-footer" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-top:1px solid var(--border-color); background:var(--bg-primary); flex-wrap:wrap; gap:8px;">
                        <div class="objection-footer-tip" style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:var(--text-muted);">
                            <i class="fas fa-lightbulb" style="color:var(--warning);"></i>
                            <span>Your single best tool is the offer itself. The website is already built, it's free, and there's no obligation.</span>
                        </div>
                        <div class="objection-footer-actions" style="display:flex; gap:8px;">
                            <button class="objection-expand-all-btn" id="objectionExpandAll" style="padding:4px 12px; border-radius:16px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-secondary); cursor:pointer; font-size:0.7rem; transition:all 0.2s;">
                                <i class="fas fa-expand"></i> Expand All
                            </button>
                            <button class="objection-collapse-all-btn" id="objectionCollapseAll" style="padding:4px 12px; border-radius:16px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-secondary); cursor:pointer; font-size:0.7rem; transition:all 0.2s;">
                                <i class="fas fa-compress"></i> Collapse All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles for the integrated component
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .objection-integrated {
                animation: fadeIn 0.3s ease;
            }
            .objection-category-btn:hover {
                border-color: var(--primary) !important;
                color: var(--text-primary) !important;
            }
            .objection-category-btn.active {
                border-color: var(--primary) !important;
                background: var(--bg-primary) !important;
                color: var(--text-primary) !important;
            }
            .objection-card {
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                margin-bottom: 8px;
                overflow: hidden;
                transition: all 0.2s ease;
            }
            .objection-card:hover {
                border-color: var(--primary);
            }
            .objection-card.expanded {
                border-color: var(--primary);
            }
            .objection-card-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 14px;
                cursor: pointer;
                user-select: none;
                transition: background 0.2s;
            }
            .objection-card-header:hover {
                background: var(--bg-primary);
            }
            .objection-card-icon {
                font-size: 0.9rem;
                flex-shrink: 0;
            }
            .objection-card-objection {
                flex: 1;
                font-weight: 500;
                font-size: 0.85rem;
                color: var(--text-primary);
            }
            .objection-card-toggle {
                color: var(--text-muted);
                font-size: 0.7rem;
                flex-shrink: 0;
                transition: transform 0.2s;
            }
            .objection-card-body {
                padding: 0 14px 14px;
                border-top: 1px solid var(--border-color);
                animation: fadeIn 0.3s ease;
            }
            .objection-response {
                padding: 10px 12px;
                background: var(--bg-primary);
                border-radius: 8px;
                margin-bottom: 8px;
                border-left: 3px solid var(--success);
            }
            .objection-response-label {
                font-size: 0.6rem;
                font-weight: 600;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.3px;
                margin-bottom: 2px;
            }
            .objection-response-text {
                font-size: 0.85rem;
                color: var(--text-primary);
                line-height: 1.5;
            }
            .objection-tip {
                padding: 8px 12px;
                background: rgba(245, 158, 11, 0.08);
                border-radius: 8px;
                margin-bottom: 10px;
                border-left: 3px solid var(--warning);
            }
            .objection-tip-label {
                font-size: 0.6rem;
                font-weight: 600;
                color: var(--warning);
                text-transform: uppercase;
                letter-spacing: 0.3px;
                margin-bottom: 2px;
            }
            .objection-tip-text {
                font-size: 0.8rem;
                color: var(--text-secondary);
                line-height: 1.4;
            }
            .objection-card-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                padding-top: 8px;
                border-top: 1px solid var(--border-color);
            }
            .objection-copy-btn,
            .objection-practice-btn {
                padding: 4px 12px;
                border-radius: 16px;
                border: 1px solid var(--border-color);
                background: var(--bg-primary);
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 0.7rem;
                font-weight: 500;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .objection-copy-btn:hover {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }
            .objection-practice-btn:hover {
                background: var(--secondary);
                color: white;
                border-color: var(--secondary);
            }
            .objection-empty {
                text-align: center;
                padding: 40px 20px;
                color: var(--text-muted);
            }
            .objection-empty i {
                font-size: 2.5rem;
                display: block;
                margin-bottom: 12px;
                opacity: 0.3;
            }
            @media (max-width: 768px) {
                .objection-category-nav {
                    gap: 4px;
                }
                .objection-category-btn {
                    font-size: 0.7rem;
                    padding: 4px 10px;
                }
                .objection-category-btn .category-label {
                    display: none;
                }
                .objection-footer {
                    flex-direction: column;
                    align-items: stretch;
                }
                .objection-footer-tip {
                    font-size: 0.7rem;
                }
                .objection-footer-actions {
                    justify-content: center;
                }
                .objection-card-objection {
                    font-size: 0.8rem;
                }
                .objection-response-text {
                    font-size: 0.8rem;
                }
                .objection-tip-text {
                    font-size: 0.75rem;
                }
            }
            @media (max-width: 480px) {
                .objection-category-btn .category-icon {
                    font-size: 0.9rem;
                }
                .objection-category-btn .category-count {
                    font-size: 0.5rem;
                    padding: 0 6px;
                }
                .objection-card-header {
                    padding: 8px 10px;
                    gap: 8px;
                }
                .objection-card-body {
                    padding: 0 10px 10px;
                }
                .objection-copy-btn,
                .objection-practice-btn {
                    font-size: 0.65rem;
                    padding: 3px 10px;
                }
            }
        `;
        document.head.appendChild(styleEl);
        
        // Attach events after creating UI
        this.attachEvents();
    },
    
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
    
    getTotalObjectionCount: function() {
        let count = 0;
        for (const category of Object.values(this.categories)) {
            count += category.objections.length;
        }
        return count;
    },
    
    toggleBanner: function() {
        this.toggleModal();
    },
    
    toggleMinimize: function() {
        const body = document.getElementById('objectionIntegratedBody');
        const minimizeBtn = document.getElementById('objectionMinimizeBtn');
        
        if (body) {
            const isMinimized = body.style.display === 'none';
            body.style.display = isMinimized ? 'block' : 'none';
            if (minimizeBtn) {
                minimizeBtn.innerHTML = isMinimized ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
            }
        }
    },
    
    switchCategory: function(categoryKey) {
        this.currentCategory = categoryKey;
        
        document.querySelectorAll('.objection-category-btn').forEach(btn => {
            const isActive = btn.dataset.category === categoryKey;
            btn.classList.toggle('active', isActive);
            if (isActive) {
                const color = this.categories[categoryKey]?.color || 'var(--primary)';
                btn.style.borderColor = color;
                btn.style.background = 'var(--bg-card)';
                btn.style.color = 'var(--text-primary)';
            } else {
                btn.style.borderColor = 'var(--border-color)';
                btn.style.background = 'transparent';
                btn.style.color = 'var(--text-secondary)';
            }
        });
        
        const container = document.getElementById('objectionCardsContainer');
        if (container) {
            container.innerHTML = this.renderCards(categoryKey);
            this.attachCardEvents();
        }
    },
    
    toggleCard: function(id) {
        if (this.expandedCards.has(id)) {
            this.expandedCards.delete(id);
        } else {
            this.expandedCards.add(id);
        }
        
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
    },
    
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
    },
    
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
    },
    
    copyResponse: function(response) {
        const text = response.replace(/&quot;/g, '"');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                if (typeof showToast !== 'undefined') {
                    showToast('Response copied to clipboard! 📋', 'success');
                }
            }).catch(() => {
                this._fallbackCopy(text);
            });
        } else {
            this._fallbackCopy(text);
        }
    },
    
    _fallbackCopy: function(text) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.top = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            if (typeof showToast !== 'undefined') {
                showToast('Response copied to clipboard! 📋', 'success');
            }
        } catch (e) {
            console.warn('Copy failed:', e);
            if (typeof showToast !== 'undefined') {
                showToast('Failed to copy. Please copy manually.', 'error');
            }
        }
    },
    
    practiceMode: function(objection, response) {
        const cleanObjection = objection.replace(/&quot;/g, '"');
        const cleanResponse = response.replace(/&quot;/g, '"');
        
        const existing = document.getElementById('objectionPracticeModal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'objectionPracticeModal';
        modal.className = 'objection-practice-modal';
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center; z-index:10001; opacity:0; transition:opacity 0.3s ease; padding:20px;';
        modal.innerHTML = `
            <div class="objection-practice-content" style="background:var(--bg-secondary); border-radius:24px; max-width:600px; width:100%; max-height:85vh; overflow-y:auto; border:1px solid var(--border-color); box-shadow:var(--shadow-lg); transform:scale(0.9); transition:transform 0.3s ease;">
                <div class="objection-practice-header" style="display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid var(--border-color); background:var(--bg-card); border-radius:24px 24px 0 0;">
                    <h3 style="font-size:1rem; font-weight:600; display:flex; align-items:center; gap:8px; margin:0;">🎯 Practice Session</h3>
                    <button class="objection-practice-close" id="objectionPracticeClose" style="background:none; border:none; color:var(--text-muted); font-size:1.1rem; cursor:pointer; padding:4px 8px; border-radius:8px; transition:all 0.2s;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="objection-practice-body" style="padding:16px 20px; display:flex; flex-direction:column; gap:14px;">
                    <div class="objection-practice-scenario" style="background:var(--bg-primary); padding:12px 16px; border-radius:10px; border-left:4px solid var(--danger);">
                        <div class="objection-practice-label" style="font-size:0.65rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.3px; margin-bottom:2px;">Customer Says:</div>
                        <div class="objection-practice-objection" style="font-size:0.9rem; color:var(--text-primary); font-weight:500;">${cleanObjection}</div>
                    </div>
                    <div class="objection-practice-response-area">
                        <div class="objection-practice-label" style="font-size:0.65rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.3px; margin-bottom:2px;">Your Response (Practice):</div>
                        <textarea class="objection-practice-input" rows="4" placeholder="Type your response here..." style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-primary); font-size:0.85rem; resize:vertical; transition:all 0.2s; font-family:inherit;"></textarea>
                    </div>
                    <div class="objection-practice-recommended" style="background:var(--bg-card); padding:12px 16px; border-radius:10px; border:1px solid var(--border-color);">
                        <div class="objection-practice-label" style="font-size:0.65rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.3px; margin-bottom:2px;">💡 Recommended Response:</div>
                        <div class="objection-practice-recommended-text" style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; display:none; padding:6px 0;">${cleanResponse}</div>
                        <button class="objection-practice-reveal-btn" id="objectionRevealResponse" style="padding:5px 14px; border-radius:16px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-secondary); cursor:pointer; font-size:0.7rem; transition:all 0.2s; margin-top:4px;">
                            <i class="fas fa-eye"></i> Show Recommended Response
                        </button>
                    </div>
                    <div class="objection-practice-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="objection-practice-copy-btn" data-response="${cleanResponse.replace(/"/g, '&quot;')}" style="padding:6px 16px; border-radius:16px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-secondary); cursor:pointer; font-size:0.75rem; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px;">
                            <i class="fas fa-copy"></i> Copy Response
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => {
            modal.style.opacity = '1';
            const content = modal.querySelector('.objection-practice-content');
            if (content) content.style.transform = 'scale(1)';
        }, 10);
        
        const closeBtn = document.getElementById('objectionPracticeClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.opacity = '0';
                const content = modal.querySelector('.objection-practice-content');
                if (content) content.style.transform = 'scale(0.9)';
                setTimeout(() => modal.remove(), 300);
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                const content = modal.querySelector('.objection-practice-content');
                if (content) content.style.transform = 'scale(0.9)';
                setTimeout(() => modal.remove(), 300);
            }
        });
        
        const revealBtn = document.getElementById('objectionRevealResponse');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => {
                const recommendedText = document.querySelector('.objection-practice-recommended-text');
                if (recommendedText) {
                    const isHidden = recommendedText.style.display === 'none' || !recommendedText.style.display;
                    recommendedText.style.display = isHidden ? 'block' : 'none';
                    revealBtn.innerHTML = isHidden ? 
                        '<i class="fas fa-eye-slash"></i> Hide Recommended Response' : 
                        '<i class="fas fa-eye"></i> Show Recommended Response';
                }
            });
        }
        
        const copyBtn = document.querySelector('.objection-practice-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const response = copyBtn.dataset.response.replace(/&quot;/g, '"');
                this.copyResponse(response);
            });
        }
    },
    
    attachEvents: function() {
        // Prevent duplicate event listeners
        if (this._eventListenersAttached) {
            // Still need to ensure category buttons work
            this.attachCardEvents();
            return;
        }
        this._eventListenersAttached = true;
        
        // Close button
        const closeBtn = document.getElementById('objectionCloseBtn');
        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            newCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeModal();
            });
        }
        
        // Minimize button
        const minimizeBtn = document.getElementById('objectionMinimizeBtn');
        if (minimizeBtn) {
            const newMinimizeBtn = minimizeBtn.cloneNode(true);
            minimizeBtn.parentNode.replaceChild(newMinimizeBtn, minimizeBtn);
            newMinimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMinimize();
            });
        }
        
        // Header toggle
        const headerToggle = document.getElementById('objectionIntegratedToggle');
        if (headerToggle) {
            // Only toggle on header click, not on button clicks
            headerToggle.addEventListener('click', (e) => {
                // Don't toggle if clicking on a button
                if (e.target.closest('button')) return;
                this.toggleModal();
            });
        }
        
        // Category buttons
        document.querySelectorAll('.objection-category-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                this.switchCategory(newBtn.dataset.category);
            });
        });
        
        // Expand/Collapse buttons
        const expandAll = document.getElementById('objectionExpandAll');
        if (expandAll) {
            const newExpandAll = expandAll.cloneNode(true);
            expandAll.parentNode.replaceChild(newExpandAll, expandAll);
            newExpandAll.addEventListener('click', () => this.expandAll());
        }
        
        const collapseAll = document.getElementById('objectionCollapseAll');
        if (collapseAll) {
            const newCollapseAll = collapseAll.cloneNode(true);
            collapseAll.parentNode.replaceChild(newCollapseAll, collapseAll);
            newCollapseAll.addEventListener('click', () => this.collapseAll());
        }
        
        // Card events
        this.attachCardEvents();
        
        // Keyboard shortcut for closing (Escape)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.closeModal();
            }
        });
    },
    
    attachCardEvents: function() {
        document.querySelectorAll('.objection-card-header').forEach(header => {
            // Remove existing listeners to prevent duplicates
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            newHeader.addEventListener('click', () => {
                const id = newHeader.dataset.id;
                if (id) this.toggleCard(id);
            });
        });
        
        document.querySelectorAll('.objection-copy-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const response = newBtn.dataset.response;
                this.copyResponse(response);
            });
        });
        
        document.querySelectorAll('.objection-practice-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const objection = newBtn.dataset.objection;
                const response = newBtn.dataset.response;
                this.practiceMode(objection, response);
            });
        });
    },
    
    // Safe initialization check
    isReady: function() {
        return this.initialized;
    }
};

// Expose to global
window.ObjectionHandler = ObjectionHandler;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        ObjectionHandler.init();
        console.log('🛡️ Objection Handler auto-initialized');
    }, 300);
});