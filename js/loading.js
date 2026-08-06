// ================================================================
// LOADING MODULE - CENTRALIZED LOADING SCREEN MANAGEMENT
// ================================================================

const LoadingManager = {
    state: {
        isVisible: true,
        progress: 0,
        steps: [
            { id: 'init', label: 'Initializing...', progress: 10 },
            { id: 'firebase', label: 'Connecting to Firebase...', progress: 25 },
            { id: 'auth', label: 'Checking authentication...', progress: 40 },
            { id: 'data', label: 'Loading your data...', progress: 60 },
            { id: 'scripts', label: 'Loading scripts...', progress: 75 },
            { id: 'calendar', label: 'Preparing calendar...', progress: 85 },
            { id: 'features', label: 'Loading features...', progress: 95 },
            { id: 'complete', label: 'Ready!', progress: 100 }
        ],
        currentStepIndex: 0,
        intervalId: null,
        onComplete: null,
        isComplete: false
    },

    /**
     * Initialize the loading screen
     */
    init: function() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) {
            console.warn('Loading screen not found');
            return;
        }
        
        // Ensure loading screen is visible
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
        
        // Start with initial progress
        this.updateProgress(0, 'Starting ScriptFlow Pro...');
        
        console.log('🎯 Loading Manager initialized');
        return this;
    },

    /**
     * Update loading progress
     */
    updateProgress: function(percent, message) {
        const progressBar = document.getElementById('loadingProgress');
        const loadingSubtitle = document.querySelector('.loading-subtitle');
        
        if (progressBar) {
            progressBar.style.width = Math.min(percent, 100) + '%';
        }
        
        if (loadingSubtitle && message) {
            loadingSubtitle.textContent = message;
        }
        
        this.state.progress = Math.min(percent, 100);
        return this;
    },

    /**
     * Advance to next loading step
     */
    nextStep: function() {
        const steps = this.state.steps;
        const currentIndex = this.state.currentStepIndex;
        
        if (currentIndex < steps.length) {
            const step = steps[currentIndex];
            this.updateProgress(step.progress, step.label);
            this.state.currentStepIndex = currentIndex + 1;
            return true;
        }
        return false;
    },

    /**
     * Start the loading sequence
     */
    start: function(onComplete) {
        this.state.onComplete = onComplete || null;
        this.state.currentStepIndex = 0;
        this.state.isComplete = false;
        
        // Clear any existing interval
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.state.intervalId = null;
        }
        
        // Start with first step
        this.nextStep();
        
        // Auto-advance through steps
        this.state.intervalId = setInterval(() => {
            const hasMore = this.nextStep();
            if (!hasMore) {
                clearInterval(this.state.intervalId);
                this.state.intervalId = null;
                this.complete();
            }
        }, 600);
        
        return this;
    },

    /**
     * Complete loading and hide the screen
     */
    complete: function() {
        if (this.state.isComplete) return;
        this.state.isComplete = true;
        
        const loadingScreen = document.getElementById('loadingScreen');
        const appWrapper = document.getElementById('appWrapper');
        
        // Update to 100%
        this.updateProgress(100, 'Ready! 🚀');
        
        // Small delay before hiding
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s ease';
            }
            
            if (appWrapper) {
                appWrapper.style.display = 'flex';
            }
            
            // Remove loading screen after transition
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
                this.state.isVisible = false;
            }, 500);
            
            // Call onComplete callback
            if (typeof this.state.onComplete === 'function') {
                this.state.onComplete();
            }
            
            console.log('✅ Loading complete');
        }, 400);
        
        return this;
    },

    /**
     * Show an error on the loading screen
     */
    showError: function(message) {
        const loadingSubtitle = document.querySelector('.loading-subtitle');
        const loadingIcon = document.querySelector('.loading-icon');
        const loadingTitle = document.querySelector('.loading-title');
        
        if (loadingSubtitle) {
            loadingSubtitle.textContent = '⚠️ ' + message;
            loadingSubtitle.style.color = 'var(--danger)';
        }
        
        if (loadingIcon) {
            loadingIcon.textContent = '⚠️';
        }
        
        if (loadingTitle) {
            loadingTitle.textContent = 'Error Loading';
        }
        
        // Add retry button if not already present
        const loadingContent = document.querySelector('.loading-content');
        if (loadingContent && !loadingContent.querySelector('.retry-btn')) {
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn-icon retry-btn';
            retryBtn.style.cssText = 'margin-top:16px; background:var(--primary); color:white; padding:8px 24px;';
            retryBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Retry';
            retryBtn.onclick = function() {
                location.reload();
            };
            loadingContent.appendChild(retryBtn);
        }
        
        console.error('Loading error:', message);
        return this;
    },

    /**
     * Set a custom loading message
     */
    setMessage: function(message) {
        const loadingSubtitle = document.querySelector('.loading-subtitle');
        if (loadingSubtitle) {
            loadingSubtitle.textContent = message;
        }
        return this;
    },

    /**
     * Get current loading progress
     */
    getProgress: function() {
        return this.state.progress;
    },

    /**
     * Check if loading is complete
     */
    isComplete: function() {
        return this.state.isComplete;
    },
    
    /**
     * Force complete loading (skip remaining steps)
     */
    forceComplete: function() {
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.state.intervalId = null;
        }
        this.complete();
        return this;
    }
};

// Export for use in other files
window.LoadingManager = LoadingManager;

console.log('📦 Loading module initialized');