// ================================================================
// SCRIPTFLOW PRO - MAIN ENTRY POINT
// ================================================================

(function() {
    'use strict';

    console.log('🚀 ScriptFlow Pro main entry point loaded');

    // Check if app is already initialized
    if (window.__appInitialized) {
        console.log('⚠️ App already initialized, skipping...');
        return;
    }

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function() {
        console.log('📄 DOM ready, initializing ScriptFlow Pro...');

        // Check if core dependencies are loaded
        const dependencies = {
            FirebaseManager: typeof FirebaseManager !== 'undefined',
            LoadingManager: typeof LoadingManager !== 'undefined',
            ObjectionHandler: typeof ObjectionHandler !== 'undefined',
            AppState: typeof AppState !== 'undefined',
            Data: typeof Data !== 'undefined',
            Scripts: typeof Scripts !== 'undefined',
            FeaturePanel: typeof FeaturePanel !== 'undefined',
            CalendarView: typeof CalendarView !== 'undefined',
            Stats: typeof Stats !== 'undefined',
            Utils: typeof Utils !== 'undefined'
        };

        const missingDeps = Object.entries(dependencies)
            .filter(([, loaded]) => !loaded)
            .map(([name]) => name);

        if (missingDeps.length > 0) {
            console.error('❌ Missing dependencies:', missingDeps.join(', '));
            showCriticalError('Failed to load core modules. Please refresh the page.');
            return;
        }

        console.log('✅ All dependencies loaded');

        // Mark as initialized
        window.__appInitialized = true;

        // Start the app
        if (typeof startApp === 'function') {
            startApp();
        } else if (typeof initApp === 'function') {
            initApp();
        } else {
            console.error('❌ No app initialization function found');
            showCriticalError('App initialization failed. Please refresh the page.');
        }
    });

    function showCriticalError(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            const subtitle = loadingScreen.querySelector('.loading-subtitle');
            const icon = loadingScreen.querySelector('.loading-icon');
            const title = loadingScreen.querySelector('.loading-title');
            
            if (icon) icon.textContent = '⚠️';
            if (title) title.textContent = 'Error';
            if (subtitle) {
                subtitle.textContent = message;
                subtitle.style.color = '#ef4444';
            }
            
            const content = loadingScreen.querySelector('.loading-content');
            if (content && !content.querySelector('.error-retry-btn')) {
                const btn = document.createElement('button');
                btn.className = 'btn-icon error-retry-btn';
                btn.style.cssText = 'margin-top:16px; background:var(--primary); color:white; padding:8px 24px; border-radius:40px; cursor:pointer; border:none; font-weight:600;';
                btn.innerHTML = '<i class="fas fa-sync-alt"></i> Retry';
                btn.onclick = function() { location.reload(); };
                content.appendChild(btn);
            }
        }
        
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        }
    }

    window.__mainReady = true;
    console.log('✅ Main entry point ready');
})();