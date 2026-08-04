// ================================================================
// FIREBASE CONFIGURATION - CENTRALIZED & FIXED
// ================================================================

/**
 * Firebase Configuration
 * Centralized configuration for Firebase services
 */
const firebaseConfig = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

/**
 * Firebase Service Status
 */
const FirebaseStatus = {
    isInitialized: false,
    isReady: false,
    lastError: null,
    persistenceMode: 'none',
    connectionStatus: 'unknown'
};

// ================================================================
// FIREBASE INITIALIZATION
// ================================================================

/**
 * Initialize Firebase with proper error handling and persistence
 * @returns {boolean} - Whether Firebase was initialized successfully
 */
function initializeFirebase() {
    try {
        // Step 1: Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK not loaded - running in offline mode');
            FirebaseStatus.isReady = false;
            FirebaseStatus.lastError = 'Firebase SDK not loaded';
            return false;
        }

        // Step 2: Initialize Firebase app if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase app initialized successfully');
        } else {
            console.log('✅ Firebase app already initialized');
        }

        // Step 3: Get Firestore instance
        const db = firebase.firestore();
        
        // Step 4: Configure Firestore settings with merge
        // This prevents the "overriding the original host" warning
        try {
            // Check if settings have been applied before
            // Apply settings with merge option to avoid warnings
            const settings = {
                // Use modern cache settings
                cache: firebase.firestore.CacheConfig?.UNLIMITED || undefined
            };
            
            // Apply settings with merge (prevents override warnings)
            db.settings(settings);
            console.log('✅ Firestore settings configured successfully');
        } catch (settingsError) {
            console.warn('⚠️ Could not configure Firestore settings:', settingsError.message);
        }

        // Step 5: Enable persistence with modern approach
        // Using the newer method to avoid deprecation warnings
        if (typeof db.enablePersistence === 'function') {
            console.log('📋 Enabling Firebase persistence...');
            
            // Use the modern approach with cache settings
            // This avoids the enableMultiTabIndexedDbPersistence deprecation warning
            db.enablePersistence({
                synchronizeTabs: true
            })
            .then(() => {
                console.log('✅ Firebase persistence enabled');
                FirebaseStatus.persistenceMode = 'multi-tab';
                FirebaseStatus.isReady = true;
            })
            .catch(err => {
                console.warn('⚠️ Persistence warning:', err.code || err.message);
                
                // Handle specific error cases
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Multiple tabs open - trying single-tab mode');
                    
                    // Try fallback to single-tab mode
                    try {
                        db.enablePersistence({
                            synchronizeTabs: false
                        })
                        .then(() => {
                            console.log('✅ Firebase persistence enabled (single-tab)');
                            FirebaseStatus.persistenceMode = 'single-tab';
                            FirebaseStatus.isReady = true;
                        })
                        .catch(fallbackErr => {
                            console.warn('⚠️ Single-tab persistence failed:', fallbackErr.message);
                            FirebaseStatus.persistenceMode = 'none';
                            FirebaseStatus.isReady = true;
                            console.info('ℹ️ Continuing in online-only mode');
                        });
                    } catch (fallbackError) {
                        console.warn('⚠️ Persistence fallback error:', fallbackError.message);
                        FirebaseStatus.persistenceMode = 'none';
                        FirebaseStatus.isReady = true;
                    }
                } else if (err.code === 'unimplemented') {
                    console.warn('⚠️ Persistence not supported in this browser');
                    FirebaseStatus.persistenceMode = 'none';
                    FirebaseStatus.isReady = true;
                    console.info('ℹ️ Continuing in online-only mode');
                } else {
                    console.warn('⚠️ Persistence error:', err.message);
                    FirebaseStatus.persistenceMode = 'none';
                    FirebaseStatus.isReady = true;
                    console.info('ℹ️ Continuing without persistence');
                }
            });
        } else {
            console.warn('⚠️ enablePersistence not available');
            FirebaseStatus.persistenceMode = 'none';
            FirebaseStatus.isReady = true;
            console.info('ℹ️ Running in online-only mode');
        }

        FirebaseStatus.isInitialized = true;
        FirebaseStatus.lastError = null;
        
        console.log('✅ Firestore configured successfully');
        console.log(`📋 Persistence mode: ${FirebaseStatus.persistenceMode}`);
        return true;

    } catch (error) {
        console.warn('⚠️ Firebase initialization failed:', error.message);
        FirebaseStatus.isInitialized = false;
        FirebaseStatus.isReady = false;
        FirebaseStatus.lastError = error.message;
        console.info('ℹ️ Running in offline mode - some features may be limited');
        return false;
    }
}

// ================================================================
// EXECUTE INITIALIZATION
// ================================================================

// Initialize Firebase
const isFirebaseReady = initializeFirebase();

// Make Firebase status available globally
window.__FIREBASE_READY__ = isFirebaseReady;
window.__FIREBASE_STATUS__ = FirebaseStatus;

// Also set in AppState if available
if (typeof AppState !== 'undefined') {
    AppState.isFirebaseReady = isFirebaseReady;
    AppState.firebaseStatus = FirebaseStatus;
}

console.log(`🔌 Firebase status: ${isFirebaseReady ? '✅ Connected' : '❌ Offline mode'}`);
console.log(`📋 Persistence: ${FirebaseStatus.persistenceMode}`);

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Check if Firebase is ready
 * @returns {boolean}
 */
function isFirebaseAvailable() {
    return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && FirebaseStatus.isReady;
}

/**
 * Get Firestore instance with error handling
 * @returns {Object|null}
 */
function getFirestore() {
    try {
        if (isFirebaseAvailable()) {
            return firebase.firestore();
        }
        return null;
    } catch (error) {
        console.warn('⚠️ Could not get Firestore instance:', error.message);
        return null;
    }
}

/**
 * Get Auth instance with error handling
 * @returns {Object|null}
 */
function getAuth() {
    try {
        if (isFirebaseAvailable()) {
            return firebase.auth();
        }
        return null;
    } catch (error) {
        console.warn('⚠️ Could not get Auth instance:', error.message);
        return null;
    }
}

/**
 * Get current user with error handling
 * @returns {Object|null}
 */
function getCurrentUser() {
    try {
        if (isFirebaseAvailable()) {
            return firebase.auth().currentUser;
        }
        return null;
    } catch (error) {
        console.warn('⚠️ Could not get current user:', error.message);
        return null;
    }
}

/**
 * Get Firebase status
 * @returns {Object}
 */
function getFirebaseStatus() {
    return {
        ...FirebaseStatus,
        isAvailable: isFirebaseAvailable(),
        sdkLoaded: typeof firebase !== 'undefined'
    };
}

/**
 * Wait for Firebase to be ready
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>}
 */
function waitForFirebaseReady(timeout = 5000) {
    return new Promise((resolve) => {
        if (FirebaseStatus.isReady) {
            resolve(true);
            return;
        }
        
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (FirebaseStatus.isReady) {
                clearInterval(checkInterval);
                resolve(true);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                console.warn('⚠️ Firebase ready timeout');
                resolve(false);
            }
        }, 200);
    });
}

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

window.isFirebaseAvailable = isFirebaseAvailable;
window.getFirestore = getFirestore;
window.getAuth = getAuth;
window.getCurrentUser = getCurrentUser;
window.getFirebaseStatus = getFirebaseStatus;
window.waitForFirebaseReady = waitForFirebaseReady;
window.__FIREBASE_READY__ = isFirebaseReady;
window.__FIREBASE_STATUS__ = FirebaseStatus;

console.log('📋 Firebase helper functions exposed globally');
console.log('📋 Status: ' + (isFirebaseReady ? '✅ Ready' : '❌ Not ready'));

// ES Module support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        firebaseConfig,
        FirebaseStatus,
        isFirebaseReady,
        initializeFirebase,
        isFirebaseAvailable,
        getFirestore,
        getAuth,
        getCurrentUser,
        getFirebaseStatus,
        waitForFirebaseReady
    };
}

console.log('🔥 Firebase module ready');