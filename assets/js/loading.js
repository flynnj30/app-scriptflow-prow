// Loading Screen Management
class LoadingManager {
    constructor() {
        this.steps = [
            'firebase', 
            'auth', 
            'data', 
            'scripts', 
            'calendar', 
            'features'
        ];
        this.currentStep = 0;
        this.progress = 0;
        this.totalSteps = this.steps.length;
        this.isComplete = false;
    }

    show() {
        const screen = document.getElementById('loadingScreen');
        if (screen) {
            screen.classList.remove('hidden');
        }
        this.updateProgress(0, 'Initializing...');
    }

    hide() {
        const screen = document.getElementById('loadingScreen');
        if (screen) {
            screen.classList.add('hidden');
        }
        document.getElementById('app').style.display = 'flex';
    }

    updateProgress(percent, status) {
        const bar = document.getElementById('loadingBar');
        const statusEl = document.getElementById('loadingStatus');
        
        if (bar) {
            bar.style.width = Math.min(percent, 100) + '%';
        }
        if (statusEl) {
            statusEl.textContent = status || 'Loading...';
        }
    }

    advanceStep(stepName, status) {
        const stepIndex = this.steps.indexOf(stepName);
        if (stepIndex === -1) return;

        // Mark step as done
        const steps = document.querySelectorAll('.loading-step');
        steps.forEach((el, index) => {
            if (index === stepIndex) {
                el.classList.add('done');
                el.classList.remove('active');
            }
        });

        // Calculate progress
        this.currentStep = Math.max(this.currentStep, stepIndex + 1);
        const progress = (this.currentStep / this.totalSteps) * 100;
        this.progress = progress;
        
        this.updateProgress(progress, status || `Loading ${stepName}...`);
        
        // Activate next step
        if (stepIndex < this.totalSteps - 1) {
            const nextStep = steps[stepIndex + 1];
            if (nextStep) {
                nextStep.classList.add('active');
            }
        }
    }

    complete() {
        this.isComplete = true;
        this.updateProgress(100, 'Ready!');
        setTimeout(() => {
            this.hide();
        }, 500);
    }
}

// Create global instance
const loadingManager = new LoadingManager();
window.loadingManager = loadingManager;