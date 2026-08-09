// ================================================================
// SCRIPTS LOADER - Ensures scripts are loaded before app starts
// ================================================================

(function() {
    'use strict';

    const loadedScripts = {};
    const requiredScripts = [
        'firebase-config.js',
        'loading.js',
        'objection-handler.js',
        'import-enhancements.js',
        'app.js'
    ];

    let allLoaded = false;
    let loadAttempts = 0;
    const maxAttempts = 15;

    function checkScriptsLoaded() {
        const scripts = document.querySelectorAll('script[src]');
        const found = {};
        
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            for (const required of requiredScripts) {
                if (src && src.includes(required)) {
                    found[required] = true;
                    loadedScripts[required] = true;
                }
            }
        });

        const allFound = requiredScripts.every(r => found[r]);
        
        if (allFound) {
            console.log('✅ All required scripts found:', Object.keys(loadedScripts));
            allLoaded = true;
            return true;
        }

        const missing = requiredScripts.filter(s => !found[s]);
        if (loadAttempts % 3 === 0) {
            console.log(`⏳ Waiting for scripts: ${missing.join(', ')} (attempt ${loadAttempts + 1})`);
        }
        return false;
    }

    function waitForScripts() {
        if (allLoaded) return true;

        loadAttempts++;
        if (loadAttempts > maxAttempts) {
            console.error('❌ Scripts failed to load after', maxAttempts, 'attempts');
            console.log('Loaded scripts:', Object.keys(loadedScripts));
            console.log('Missing:', requiredScripts.filter(s => !loadedScripts[s]));
            return false;
        }

        if (checkScriptsLoaded()) {
            return true;
        }

        setTimeout(waitForScripts, 500);
        return false;
    }

    // Check immediately
    setTimeout(() => {
        checkScriptsLoaded();
    }, 100);

    // Also use MutationObserver for dynamic loading
    const observer = new MutationObserver(() => {
        if (!allLoaded) {
            checkScriptsLoaded();
        }
    });

    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up after 10 seconds
    setTimeout(() => {
        observer.disconnect();
    }, 10000);

    // Expose for debugging
    window.__scriptLoader = {
        loadedScripts,
        allLoaded,
        requiredScripts,
        checkScriptsLoaded,
        waitForScripts
    };

    console.log('📦 Scripts Loader initialized');
})();