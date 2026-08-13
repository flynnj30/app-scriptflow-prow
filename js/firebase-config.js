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
 * Configure Firestore offline persistence for Firebase 9.22 compat.
 *
 * Important: do NOT call db.settings({...}) here. Firebase 9.22's compat
 * SDK can interpret unsupported cache settings as a settings override and
 * emit:
 *   "You are overriding the original host. If you did not intend to
 *    override your settings, use {merge: true}."
 *
 * We intentionally leave the Firebase host/settings untouched and use the
 * supported persistence API instead. This keeps the configured Firestore
 * endpoint unchanged and avoids the warning.
 */
function applyModernCacheSettings() {
    try {
        const db = firebase.firestore();

        if (typeof db.enableMultiTabIndexedDbPersistence === 'function') {
            db.enableMultiTabIndexedDbPersistence()
                .then(() => {
                    console.log('✅ Firestore multi-tab offline persistence enabled');
                })
                .catch(err => {
                    if (err && err.code === 'failed-precondition') {
                        console.info('ℹ️ Firestore persistence limited: another tab is already active.');
                    } else if (err && err.code === 'unimplemented') {
                        console.info('ℹ️ Firestore offline persistence is not supported in this browser.');
                    } else if (err) {
                        console.warn('⚠️ Firestore persistence unavailable:', err.message);
                    }
                });
            return;
        }

        if (typeof db.enablePersistence === 'function') {
            db.enablePersistence({ synchronizeTabs: true })
                .then(() => {
                    console.log('✅ Firestore offline persistence enabled');
                })
                .catch(err => {
                    if (err && err.code === 'failed-precondition') {
                        console.info('ℹ️ Firestore persistence limited: another tab is already active.');
                    } else if (err && err.code === 'unimplemented') {
                        console.info('ℹ️ Firestore offline persistence is not supported in this browser.');
                    } else if (err) {
                        console.warn('⚠️ Firestore persistence unavailable:', err.message);
                    }
                });
            return;
        }

        console.info('ℹ️ Firestore offline persistence API is unavailable; using online mode.');
    } catch (e) {
        console.warn('⚠️ Firestore persistence setup skipped:', e.message);
    }
}

// Backward-compatible alias retained for any existing callers.
function tryFallbackPersistence() {
    applyModernCacheSettings();
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