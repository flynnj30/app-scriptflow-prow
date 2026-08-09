// Objection Handler Module
class ObjectionHandler {
    constructor() {
        this.objections = [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.practiceMode = false;
        this.expandedAll = false;
        
        // Sample objections data
        this.sampleObjections = [
            // Reflex Brush-Offs
            {
                id: 'r1',
                category: 'reflex',
                question: "I'm just not interested.",
                answer: "I understand. Most of our clients felt the same way initially. What if I could show you how we've helped businesses similar to yours increase their conversion rate by 40%? Would you be open to a brief conversation?"
            },
            {
                id: 'r2',
                category: 'reflex',
                question: "I'm too busy right now.",
                answer: "I completely understand you're busy. That's exactly why I'm reaching out - we help busy professionals save time by streamlining their sales process. Could we schedule a 10-minute call at your convenience?"
            },
            {
                id: 'r3',
                category: 'reflex',
                question: "Just send me some information.",
                answer: "I'd be happy to send you information. However, I find that our clients get the most value from a brief conversation where I can understand your specific needs. Would you be open to a 15-minute call next week?"
            },
            {
                id: 'r4',
                category: 'reflex',
                question: "We're already working with someone.",
                answer: "That's great to hear. Most companies work with multiple partners to maximize results. What's one area where you feel your current provider could improve? This might be where we can add value."
            },
            // We Don't Need It
            {
                id: 'n1',
                category: 'need',
                question: "We don't need your service.",
                answer: "Many of our clients initially felt they didn't need our service until they saw the measurable impact. What's your current process for managing sales calls? I'd love to share how we've helped others improve."
            },
            {
                id: 'n2',
                category: 'need',
                question: "We have an internal team that handles this.",
                answer: "That's excellent that you have an internal team. We actually work alongside many internal teams to provide additional expertise and tools. How many calls is your team handling per day?"
            },
            {
                id: 'n3',
                category: 'need',
                question: "Our current system works fine.",
                answer: "If your system is working well for you, that's great. At the same time, we've found that businesses using our platform typically see a 30% increase in conversion rates. Would you be open to seeing some case studies?"
            },
            // Skeptical Questions
            {
                id: 's1',
                category: 'skeptical',
                question: "How do I know this will work for us?",
                answer: "Great question. We provide a 30-day trial so you can see the results firsthand. Additionally, we have case studies from companies in your industry who achieved remarkable results. Would you like to see some specific examples?"
            },
            {
                id: 's2',
                category: 'skeptical',
                question: "What's the ROI?",
                answer: "Excellent question. Our clients typically see a 3x to 5x return on investment within the first quarter. This comes from increased conversion rates, reduced time spent on calls, and better lead management. Would you like to see our ROI calculator?"
            },
            {
                id: 's3',
                category: 'skeptical',
                question: "How much does it cost?",
                answer: "We have flexible pricing plans starting at $99/month for small teams. The investment typically pays for itself within the first few weeks of use. I can work with you to find a plan that fits your budget. Would you like to discuss the options?"
            },
            // Gatekeepers
            {
                id: 'g1',
                category: 'gatekeeper',
                question: "The decision-maker is not available.",
                answer: "I understand. Can you tell me who the decision-maker is and when they might be available? I'd like to schedule a brief conversation with them. Is there a good time I could call back?"
            },
            {
                id: 'g2',
                category: 'gatekeeper',
                question: "We're not interested in sales calls.",
                answer: "I completely understand. This isn't a typical sales call - I'm reaching out to share how we help businesses like yours solve specific challenges. Could you connect me with the person responsible for sales operations?"
            },
            {
                id: 'g3',
                category: 'gatekeeper',
                question: "Please remove us from your list.",
                answer: "I understand and respect your request. Before I do that, I want to mention that we've helped many companies in your industry. If you ever need assistance with sales optimization, we're here. Is there anyone else I should speak with?"
            }
        ];
    }

    init() {
        this.loadObjections();
        this.bindEvents();
        this.renderObjections();
    }

    loadObjections() {
        // Load from localStorage or use sample data
        const stored = localStorage.getItem('scriptflow_objections');
        if (stored) {
            try {
                this.objections = JSON.parse(stored);
                return;
            } catch (e) {
                console.warn('Failed to parse stored objections');
            }
        }
        this.objections = JSON.parse(JSON.stringify(this.sampleObjections));
        this.saveObjections();
    }

    saveObjections() {
        localStorage.setItem('scriptflow_objections', JSON.stringify(this.objections));
    }

    bindEvents() {
        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.renderObjections();
            });
        });

        // Search
        const searchInput = document.getElementById('objectionSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderObjections();
            });
        }

        // Expand/Collapse All
        document.getElementById('expandAllObj')?.addEventListener('click', () => {
            this.expandedAll = true;
            document.querySelectorAll('.objection-card').forEach(card => {
                card.classList.add('expanded');
            });
        });

        document.getElementById('collapseAllObj')?.addEventListener('click', () => {
            this.expandedAll = false;
            document.querySelectorAll('.objection-card').forEach(card => {
                card.classList.remove('expanded');
            });
        });

        // Practice Mode
        document.getElementById('practiceModeBtn')?.addEventListener('click', () => {
            this.practiceMode = !this.practiceMode;
            const btn = document.getElementById('practiceModeBtn');
            if (this.practiceMode) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-stop"></i> Stop Practice';
                this.renderObjections();
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fas fa-microphone"></i> Practice Mode';
                this.renderObjections();
            }
        });
    }

    renderObjections() {
        const container = document.getElementById('objectionList');
        if (!container) return;

        let filtered = this.objections;

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(o => o.category === this.currentCategory);
        }

        // Filter by search
        if (this.searchTerm) {
            filtered = filtered.filter(o => 
                o.question.toLowerCase().includes(this.searchTerm) ||
                o.answer.toLowerCase().includes(this.searchTerm)
            );
        }

        // Update count
        const countEl = document.getElementById('objectionCount');
        if (countEl) {
            countEl.textContent = `${filtered.length} results`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No objections found matching your criteria.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(obj => `
            <div class="objection-card ${this.expandedAll ? 'expanded' : ''} ${this.practiceMode ? 'practice-mode' : ''}" data-id="${obj.id}">
                <div class="objection-question">
                    ${obj.question}
                    <span class="objection-category-tag">${this.getCategoryLabel(obj.category)}</span>
                </div>
                <div class="objection-answer">
                    ${obj.answer}
                </div>
                <div class="objection-actions-card">
                    <button class="btn-secondary-sm toggle-answer" data-id="${obj.id}">
                        <i class="fas fa-chevron-down"></i> Show Answer
                    </button>
                    <button class="btn-secondary-sm copy-response" data-id="${obj.id}">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    ${this.practiceMode ? `
                        <button class="btn-secondary-sm reveal-response" data-id="${obj.id}">
                            <i class="fas fa-eye"></i> Reveal
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Bind card events
        container.querySelectorAll('.objection-card').forEach(card => {
            const id = card.dataset.id;
            const obj = this.objections.find(o => o.id === id);
            
            // Toggle on card click
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                card.classList.toggle('expanded');
            });

            // Toggle answer button
            const toggleBtn = card.querySelector('.toggle-answer');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    card.classList.toggle('expanded');
                    const icon = toggleBtn.querySelector('i');
                    if (card.classList.contains('expanded')) {
                        icon.className = 'fas fa-chevron-up';
                        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Answer';
                    } else {
                        icon.className = 'fas fa-chevron-down';
                        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Answer';
                    }
                });
            }

            // Copy response
            const copyBtn = card.querySelector('.copy-response');
            if (copyBtn && obj) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(obj.answer).then(() => {
                        this.showToast('Response copied to clipboard!', 'success');
                    }).catch(() => {
                        this.showToast('Failed to copy response', 'error');
                    });
                });
            }

            // Reveal response (practice mode)
            const revealBtn = card.querySelector('.reveal-response');
            if (revealBtn && obj) {
                revealBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    card.classList.add('expanded');
                    const answer = card.querySelector('.objection-answer');
                    if (answer) {
                        answer.style.backgroundColor = 'var(--accent-light)';
                        setTimeout(() => {
                            answer.style.backgroundColor = '';
                        }, 2000);
                    }
                });
            }
        });
    }

    getCategoryLabel(category) {
        const labels = {
            'reflex': 'Reflex Brush-Off',
            'need': 'We Don\'t Need It',
            'skeptical': 'Skeptical Questions',
            'gatekeeper': 'Gatekeepers'
        };
        return labels[category] || category;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize on page load
const objectionHandler = new ObjectionHandler();
window.objectionHandler = objectionHandler;