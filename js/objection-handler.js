// ================================================================
// OBJECTION HANDLER - MODAL/POPUP VERSION (COMPLETE)
// ================================================================

(function() {
    'use strict';

    const ObjectionHandler = {
        isOpen: false,
        currentCategory: 'reflex',
        expandedCards: new Set(),
        initialized: false,
        _modalInstance: null,
        _observer: null,
        
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
            this.attachButtonEvents();
            console.log('🎯 Objection Handler initialized (modal mode)');
        },

        attachButtonEvents: function() {
            // Try to attach immediately
            this._tryAttachButton();
            
            // Also watch for dynamically added buttons
            if (this._observer) {
                this._observer.disconnect();
            }
            
            this._observer = new MutationObserver(() => {
                this._tryAttachButton();
            });
            
            this._observer.observe(document.body, { childList: true, subtree: true });
        },
        
        _tryAttachButton: function() {
            const toggleBtn = document.getElementById('objectionToggleBtn');
            if (toggleBtn && !toggleBtn._handlerAttached) {
                this._attachButtonHandler(toggleBtn);
            }
        },
        
        _attachButtonHandler: function(button) {
            button._handlerAttached = true;
            // Remove existing listeners by cloning
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.openModal();
            });
            console.log('🎯 Objection button attached');
        },
        
        openModal: function() {
            console.log('🎯 Opening objection modal');
            
            // Remove existing modal if any
            const existing = document.getElementById('objectionModalOverlay');
            if (existing) {
                existing.remove();
            }
            
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.id = 'objectionModalOverlay';
            overlay.className = 'objection-modal-overlay';
            
            overlay.innerHTML = this.buildModalHTML();
            document.body.appendChild(overlay);
            
            // Trigger animation
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
            
            // Attach events
            this.attachModalEvents(overlay);
            
            // Focus search input
            const searchInput = overlay.querySelector('#objectionSearchInput');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 200);
            }
            
            this._modalInstance = overlay;
            this.isOpen = true;
        },
        
        closeModal: function() {
            const overlay = document.getElementById('objectionModalOverlay');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (overlay.parentNode) overlay.remove();
                }, 350);
            }
            this._modalInstance = null;
            this.isOpen = false;
        },
        
        buildModalHTML: function() {
            const categoriesHtml = Object.entries(this.categories).map(([key, cat]) => `
                <button class="objection-category-tab ${key === this.currentCategory ? 'active' : ''}" data-category="${key}" style="border-color:${cat.color};">
                    <span class="cat-icon">${cat.icon}</span>
                    <span>${cat.label}</span>
                    <span class="cat-count">${cat.objections.length}</span>
                </button>
            `).join('');
            
            const cardsHtml = this.renderModalCards(this.currentCategory);
            
            return `
                <div class="objection-modal-content">
                    <div class="objection-modal-header">
                        <div class="objection-modal-title">
                            <h2>🛡️ Objection Handling</h2>
                            <span class="badge">${this.getTotalObjectionCount()} scripts</span>
                        </div>
                        <button class="objection-modal-close" id="objectionModalClose" aria-label="Close modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="objection-modal-search">
                        <div class="objection-search-wrapper">
                            <i class="fas fa-search"></i>
                            <input type="text" id="objectionSearchInput" placeholder="Search objections..." autocomplete="off" />
                            <span class="objection-search-count" id="objectionSearchCount"></span>
                        </div>
                    </div>
                    
                    <div class="objection-modal-body">
                        <div class="objection-modal-categories" id="objectionModalCategories">
                            ${categoriesHtml}
                        </div>
                        <div class="objection-cards-container" id="objectionModalCards">
                            ${cardsHtml}
                        </div>
                    </div>
                    
                    <div class="objection-modal-footer">
                        <div class="objection-modal-footer-tip">
                            <i class="fas fa-lightbulb"></i>
                            <span>Your single best tool is the offer itself. The website is already built, it's free, and there's no obligation.</span>
                        </div>
                        <div class="objection-modal-footer-actions">
                            <button class="objection-expand-all-btn-modal" id="objectionModalExpandAll">
                                <i class="fas fa-expand"></i> Expand All
                            </button>
                            <button class="objection-collapse-all-btn-modal" id="objectionModalCollapseAll">
                                <i class="fas fa-compress"></i> Collapse All
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },
        
        renderModalCards: function(categoryKey) {
            const category = this.categories[categoryKey];
            if (!category) {
                return '<div class="objection-empty-modal"><i class="fas fa-shield-alt"></i><p>No objections in this category.</p></div>';
            }
            
            return category.objections.map(obj => {
                const isExpanded = this.expandedCards.has(obj.id);
                return `
                <div class="objection-card-modal ${isExpanded ? 'expanded' : ''}" data-id="${obj.id}">
                    <div class="objection-card-modal-header" data-id="${obj.id}">
                        <span class="objection-card-modal-icon">💬</span>
                        <span class="objection-card-modal-objection">${obj.objection}</span>
                        <span class="objection-card-modal-toggle">
                            <i class="fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
                        </span>
                    </div>
                    <div class="objection-card-modal-body" style="${isExpanded ? 'display:block;' : 'display:none;'}">
                        <div class="objection-response-modal">
                            <div class="objection-response-label-modal">🎯 Recommended Response</div>
                            <div class="objection-response-text-modal">${obj.response}</div>
                        </div>
                        <div class="objection-tip-modal">
                            <div class="objection-tip-label-modal">💡 Pro Tip</div>
                            <div class="objection-tip-text-modal">${obj.tip}</div>
                        </div>
                        <div class="objection-card-actions-modal">
                            <button class="objection-copy-btn-modal" data-response="${obj.response.replace(/"/g, '&quot;')}">
                                <i class="fas fa-copy"></i> Copy Response
                            </button>
                            <button class="objection-practice-btn-modal" data-objection="${obj.objection.replace(/"/g, '&quot;')}" data-response="${obj.response.replace(/"/g, '&quot;')}">
                                <i class="fas fa-microphone"></i> Practice
                            </button>
                        </div>
                    </div>
                </div>
            `}).join('');
        },
        
        getTotalObjectionCount: function() {
            let count = 0;
            for (const category of Object.values(this.categories)) {
                count += category.objections.length;
            }
            return count;
        },
        
        attachModalEvents: function(overlay) {
            const closeBtn = overlay.querySelector('#objectionModalClose');
            const expandAll = overlay.querySelector('#objectionModalExpandAll');
            const collapseAll = overlay.querySelector('#objectionModalCollapseAll');
            const searchInput = overlay.querySelector('#objectionSearchInput');
            const searchCount = overlay.querySelector('#objectionSearchCount');
            const categoriesContainer = overlay.querySelector('#objectionModalCategories');
            const cardsContainer = overlay.querySelector('#objectionModalCards');
            
            // Close modal
            const closeModal = () => {
                this.closeModal();
            };
            
            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });
            
            // Escape key
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
            
            // Category tabs
            if (categoriesContainer) {
                categoriesContainer.addEventListener('click', (e) => {
                    const tab = e.target.closest('.objection-category-tab');
                    if (!tab) return;
                    
                    const category = tab.dataset.category;
                    if (!category) return;
                    
                    this.currentCategory = category;
                    
                    categoriesContainer.querySelectorAll('.objection-category-tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    tab.classList.add('active');
                    
                    if (cardsContainer) {
                        cardsContainer.innerHTML = this.renderModalCards(category);
                        this.attachCardEvents(overlay);
                        this.updateSearchCount(overlay);
                    }
                });
            }
            
            // Expand/Collapse all
            if (expandAll) {
                expandAll.addEventListener('click', () => {
                    const cards = overlay.querySelectorAll('.objection-card-modal');
                    cards.forEach(card => {
                        const id = card.dataset.id;
                        if (id) {
                            this.expandedCards.add(id);
                            card.classList.add('expanded');
                            const body = card.querySelector('.objection-card-modal-body');
                            const toggle = card.querySelector('.objection-card-modal-toggle i');
                            if (body) body.style.display = 'block';
                            if (toggle) toggle.className = 'fas fa-chevron-up';
                        }
                    });
                });
            }
            
            if (collapseAll) {
                collapseAll.addEventListener('click', () => {
                    const cards = overlay.querySelectorAll('.objection-card-modal');
                    cards.forEach(card => {
                        const id = card.dataset.id;
                        if (id) {
                            this.expandedCards.delete(id);
                            card.classList.remove('expanded');
                            const body = card.querySelector('.objection-card-modal-body');
                            const toggle = card.querySelector('.objection-card-modal-toggle i');
                            if (body) body.style.display = 'none';
                            if (toggle) toggle.className = 'fas fa-chevron-down';
                        }
                    });
                });
            }
            
            // Search
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    const cards = overlay.querySelectorAll('.objection-card-modal');
                    let visibleCount = 0;
                    
                    cards.forEach(card => {
                        const objectionText = card.querySelector('.objection-card-modal-objection')?.textContent?.toLowerCase() || '';
                        const responseText = card.querySelector('.objection-response-text-modal')?.textContent?.toLowerCase() || '';
                        const tipText = card.querySelector('.objection-tip-text-modal')?.textContent?.toLowerCase() || '';
                        
                        const matches = !query || 
                            objectionText.includes(query) || 
                            responseText.includes(query) || 
                            tipText.includes(query);
                        
                        card.style.display = matches ? '' : 'none';
                        if (matches) visibleCount++;
                    });
                    
                    if (searchCount) {
                        searchCount.textContent = `${visibleCount} results`;
                    }
                });
                
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input'));
                        searchInput.blur();
                    }
                });
            }
            
            this.updateSearchCount(overlay);
            this.attachCardEvents(overlay);
        },
        
        attachCardEvents: function(overlay) {
            const cardsContainer = overlay.querySelector('#objectionModalCards');
            if (!cardsContainer) return;
            
            // Card header toggle
            cardsContainer.addEventListener('click', (e) => {
                if (e.target.closest('.objection-copy-btn-modal') || e.target.closest('.objection-practice-btn-modal')) {
                    return;
                }
                
                const header = e.target.closest('.objection-card-modal-header');
                if (!header) return;
                
                const id = header.dataset.id;
                if (!id) return;
                
                this.toggleCard(id);
                
                const card = cardsContainer.querySelector(`.objection-card-modal[data-id="${id}"]`);
                if (card) {
                    const isExpanded = this.expandedCards.has(id);
                    card.classList.toggle('expanded', isExpanded);
                    const body = card.querySelector('.objection-card-modal-body');
                    const toggle = card.querySelector('.objection-card-modal-toggle i');
                    if (body) body.style.display = isExpanded ? 'block' : 'none';
                    if (toggle) toggle.className = `fas fa-chevron-${isExpanded ? 'up' : 'down'}`;
                }
            });
            
            // Copy buttons
            cardsContainer.querySelectorAll('.objection-copy-btn-modal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const response = btn.dataset.response;
                    this.copyResponse(response);
                });
            });
            
            // Practice buttons
            cardsContainer.querySelectorAll('.objection-practice-btn-modal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const objection = btn.dataset.objection;
                    const response = btn.dataset.response;
                    this.practiceMode(objection, response);
                });
            });
        },
        
        updateSearchCount: function(overlay) {
            const searchCount = overlay.querySelector('#objectionSearchCount');
            const cards = overlay.querySelectorAll('.objection-card-modal');
            const visible = Array.from(cards).filter(c => c.style.display !== 'none').length;
            if (searchCount) {
                searchCount.textContent = `${visible} results`;
            }
        },
        
        toggleCard: function(id) {
            if (this.expandedCards.has(id)) {
                this.expandedCards.delete(id);
            } else {
                this.expandedCards.add(id);
            }
        },
        
        copyResponse: function(response) {
            const text = response.replace(/&quot;/g, '"');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    this._showToast('Response copied to clipboard! 📋', 'success');
                }).catch(() => {
                    this._fallbackCopy(text);
                });
            } else {
                this._fallbackCopy(text);
            }
        },
        
        _fallbackCopy: function(text) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                this._showToast('Response copied to clipboard! 📋', 'success');
            } catch (e) {
                this._showToast('Could not copy. Please select and copy manually.', 'warning');
            }
            document.body.removeChild(ta);
        },
        
        _showToast: function(message, type) {
            if (typeof showToast === 'function') {
                showToast(message, type);
            } else {
                console.log(`[${type}] ${message}`);
                // Fallback alert if showToast is not available
                alert(message);
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
            requestAnimationFrame(() => {
                modal.classList.add('active');
            });
            
            const closeBtn = document.getElementById('objectionPracticeClose');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('active');
                    setTimeout(() => modal.remove(), 300);
                });
            }
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
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
                    const responseText = copyBtn.dataset.response.replace(/&quot;/g, '"');
                    this.copyResponse(responseText);
                });
            }
        }
    };

    // Expose globally
    window.ObjectionHandler = ObjectionHandler;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                ObjectionHandler.init();
            }, 300);
        });
    } else {
        setTimeout(function() {
            ObjectionHandler.init();
        }, 300);
    }

    console.log('📦 Objection Handler module loaded');
})();