// ================================================================
// LOADING MODULE - CENTRALIZED LOADING SCREEN MANAGEMENT (FIXED)
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
        isComplete: false,
        isStarted: false,
        isHidden: false
    },

    /**
     * Initialize the loading screen
     */
    init: function() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) {
            console.warn('Loading screen not found');
            return this;
        }
        
        // Ensure loading screen is visible
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
        loadingScreen.style.visibility = 'visible';
        loadingScreen.style.pointerEvents = 'auto';
        
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
            progressBar.style.transition = 'width 0.5s ease';
        }
        
        if (loadingSubtitle && message) {
            loadingSubtitle.textContent = message;
            loadingSubtitle.style.color = '';
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
        if (this.state.isStarted) return this;
        this.state.isStarted = true;
        this.state.onComplete = onComplete || null;
        this.state.currentStepIndex = 0;
        this.state.isComplete = false;
        this.state.isHidden = false;
        
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
        }, 500);
        
        return this;
    },

    /**
     * Complete loading and hide the screen
     */
    complete: function() {
        if (this.state.isComplete || this.state.isHidden) return this;
        this.state.isComplete = true;
        
        const loadingScreen = document.getElementById('loadingScreen');
        const appWrapper = document.getElementById('appWrapper');
        
        // Update to 100%
        this.updateProgress(100, 'Ready! 🚀');
        
        // Hide loading screen immediately
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.4s ease';
            loadingScreen.style.pointerEvents = 'none';
            
            // Force hide after transition
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                loadingScreen.style.visibility = 'hidden';
                this.state.isHidden = true;
                this.state.isVisible = false;
            }, 450);
        }
        
        // Show app wrapper
        if (appWrapper) {
            appWrapper.style.display = 'flex';
            appWrapper.style.opacity = '1';
        }
        
        // Call onComplete callback
        if (typeof this.state.onComplete === 'function') {
            try {
                this.state.onComplete();
            } catch (e) {
                console.warn('Loading complete callback error:', e);
            }
        }
        
        console.log('✅ Loading complete');
        return this;
    },

    /**
     * Force complete loading immediately (skip animations)
     */
    forceComplete: function() {
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.state.intervalId = null;
        }
        
        const loadingScreen = document.getElementById('loadingScreen');
        const appWrapper = document.getElementById('appWrapper');
        
        // Hide loading screen immediately
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
            this.state.isHidden = true;
            this.state.isVisible = false;
        }
        
        if (appWrapper) {
            appWrapper.style.display = 'flex';
            appWrapper.style.opacity = '1';
        }
        
        this.state.isComplete = true;
        this.state.isStarted = true;
        
        console.log('✅ Loading force completed');
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
            retryBtn.style.cssText = 'margin-top:16px; background:var(--primary); color:white; padding:8px 24px; border-radius:40px; cursor:pointer; border:none; font-weight:600;';
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
            loadingSubtitle.style.color = '';
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
     * Check if loading is hidden
     */
    isHidden: function() {
        return this.state.isHidden;
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize loading manager
    if (typeof LoadingManager !== 'undefined') {
        LoadingManager.init();
    }
});

// Export for use in other files
window.LoadingManager = LoadingManager;

console.log('📦 Loading module initialized');