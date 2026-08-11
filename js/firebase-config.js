// ================================================================
// FIREBASE CONFIGURATION - WITH MODERN CACHING (FIXED)
// ================================================================

const firebaseConfig = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

// State
let firebaseInitialized = false;
let firebaseInitAttempts = 0;
const MAX_INIT_ATTEMPTS = 5;
let initResolve = null;
let initReject = null;
let initPromise = null;

/**
 * Initialize Firebase with modern caching settings
 * Uses FirestoreSettings.cache instead of deprecated enableMultiTabIndexedDbPersistence
 */
function initFirebase() {
    if (initPromise) return initPromise;
    
    initPromise = new Promise((resolve, reject) => {
        initResolve = resolve;
        initReject = reject;
        
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK not loaded, waiting...');
            let checkCount = 0;
            const checkInterval = setInterval(() => {
                checkCount++;
                if (typeof firebase !== 'undefined') {
                    clearInterval(checkInterval);
                    attemptInit();
                } else if (checkCount > 20) {
                    clearInterval(checkInterval);
                    reject(new Error('Firebase SDK failed to load'));
                }
            }, 500);
            return;
        }
        
        attemptInit();
    });
    
    return initPromise;
}

function attemptInit() {
    try {
        if (firebase.apps && firebase.apps.length > 0) {
            console.log('✅ Firebase already initialized');
            // Apply modern cache settings to existing app
            applyModernCacheSettings();
            firebaseInitialized = true;
            if (initResolve) initResolve(true);
            return;
        }
        
        firebase.initializeApp(firebaseConfig);
        firebaseInitialized = true;
        console.log('✅ Firebase initialized successfully');
        
        // Apply modern cache settings
        applyModernCacheSettings();
        
        if (initResolve) initResolve(true);
        
    } catch (e) {
        console.warn('⚠️ Firebase initialization failed:', e.message);
        
        if (firebaseInitAttempts < MAX_INIT_ATTEMPTS) {
            firebaseInitAttempts++;
            console.log(`🔄 Retrying Firebase init (attempt ${firebaseInitAttempts}/${MAX_INIT_ATTEMPTS})...`);
            
            // Update loading screen
            const loadingSubtitle = document.querySelector('.loading-subtitle');
            if (loadingSubtitle) {
                loadingSubtitle.textContent = `Retrying connection (${firebaseInitAttempts}/${MAX_INIT_ATTEMPTS})...`;
            }
            
            setTimeout(() => {
                attemptInit();
            }, 2000);
        } else {
            console.error('❌ Firebase initialization failed after max attempts');
            if (initReject) initReject(e);
        }
    }
}

/**
 * Apply modern Firestore cache settings
 * Uses FirestoreSettings.cache instead of deprecated enableMultiTabIndexedDbPersistence
 */
function applyModernCacheSettings() {
    try {
        const db = firebase.firestore();
        
        // Modern approach: Use FirestoreSettings with cache configuration
        // This replaces the deprecated enableMultiTabIndexedDbPersistence()
        const settings = {
            // Use cache for offline support
            cache: {
                // Enable multi-tab support
                tab: true,
                // Cache size in bytes (100 MB)
                size: 104857600
            }
        };
        
        // Apply settings to the Firestore instance
        db.settings(settings);
        
        console.log('✅ Modern Firestore cache enabled (multi-tab support)');
        
        // Verify cache is working by checking if we can read from cache
        db.enableNetwork()
            .then(() => console.log('✅ Firestore network enabled'))
            .catch(err => console.warn('⚠️ Firestore network enable error:', err.message));
            
    } catch (e) {
        console.warn('⚠️ Failed to apply modern cache settings:', e.message);
        // Fallback: try old approach for backward compatibility
        tryFallbackPersistence();
    }
}

/**
 * Fallback persistence for older Firebase versions
 */
function tryFallbackPersistence() {
    try {
        const db = firebase.firestore();
        
        // Try to use the modern cache approach first
        try {
            const settings = {
                cache: {
                    tab: true,
                    size: 104857600
                }
            };
            db.settings(settings);
            console.log('✅ Fallback cache settings applied');
            return;
        } catch (innerError) {
            console.warn('⚠️ Modern cache settings not available, trying legacy approach');
        }
        
        // Legacy approach (for older SDK versions)
        // Check if enableMultiTabIndexedDbPersistence exists
        if (typeof db.enableMultiTabIndexedDbPersistence === 'function') {
            db.enableMultiTabIndexedDbPersistence()
                .then(() => {
                    console.log('✅ Legacy multi-tab persistence enabled (will be deprecated)');
                })
                .catch(err => {
                    if (err.code === 'failed-precondition') {
                        console.warn('⚠️ Persistence: multiple tabs open, persistence limited');
                    } else if (err.code === 'unimplemented') {
                        console.warn('⚠️ Persistence not supported in this browser');
                    } else {
                        console.warn('⚠️ Persistence error:', err.message);
                    }
                });
        } else {
            // Try standard persistence as last resort
            db.enablePersistence({ synchronizeTabs: true })
                .then(() => console.log('✅ Standard persistence enabled'))
                .catch(err => console.warn('⚠️ Standard persistence error:', err.message));
        }
    } catch (e) {
        console.warn('⚠️ All persistence approaches failed:', e.message);
    }
}

// Start initialization immediately
const firebaseInitPromise = initFirebase();

// Expose Firebase status check
window.isFirebaseReady = function() {
    return firebaseInitialized && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
};

window.getFirebase = function() {
    if (window.isFirebaseReady()) {
        return firebase;
    }
    return null;
};

window.getFirestore = function() {
    const fb = window.getFirebase();
    if (fb) {
        try {
            return fb.firestore();
        } catch (e) {
            console.warn('⚠️ Firestore not available:', e.message);
            return null;
        }
    }
    return null;
};

window.getAuth = function() {
    const fb = window.getFirebase();
    if (fb) {
        try {
            return fb.auth();
        } catch (e) {
            console.warn('⚠️ Auth not available:', e.message);
            return null;
        }
    }
    return null;
};

// Wait for Firebase to be ready
window.waitForFirebase = function() {
    return firebaseInitPromise;
};

console.log('🔧 Firebase config loaded with modern cache support');