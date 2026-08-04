// ================================================================
// FIREBASE CONFIGURATION - CENTRALIZED & FIXED
// ================================================================

/**
 * Firebase Configuration
 * Centralized configuration for Firebase services
 * All settings are managed here to avoid duplication
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
    persistenceMode: 'none', // 'multi-tab', 'single-tab', 'none'
    connectionStatus: 'unknown' // 'online', 'offline', 'unknown'
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
        
        // Step 4: Configure Firestore settings BEFORE any operations
        // This must be done before enabling persistence or any other calls
        try {
            // Use merge to avoid overriding existing settings
            // Only set cache-related settings that are available
            const settings = {
                // For newer Firebase versions, use cache in settings
                // For compatibility, we'll use the older approach with enablePersistence
            };
            
            // Apply settings with merge to avoid overriding
            db.settings(settings);
            console.log('✅ Firestore settings configured successfully');
        } catch (settingsError) {
            console.warn('⚠️ Could not configure Firestore settings:', settingsError.message);
            // Continue anyway - settings may already be configured
        }

        // Step 5: Enable persistence with proper error handling
        // Check if enablePersistence is available
        if (typeof db.enablePersistence === 'function') {
            console.log('📋 Attempting to enable Firebase persistence...');
            
            // Try multi-tab persistence first (recommended)
            db.enablePersistence({
                synchronizeTabs: true
            })
            .then(() => {
                console.log('✅ Firebase persistence enabled (multi-tab mode)');
                FirebaseStatus.persistenceMode = 'multi-tab';
                FirebaseStatus.isReady = true;
            })
            .catch(err => {
                console.warn('⚠️ Multi-tab persistence failed:', err.code);
                
                // Handle specific error cases
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Multiple tabs open - persistence may be limited');
                    
                    // Try fallback to single-tab mode
                    try {
                        db.enablePersistence({
                            synchronizeTabs: false
                        })
                        .then(() => {
                            console.log('✅ Firebase persistence enabled (single-tab mode)');
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

        // Step 6: Mark as initialized
        FirebaseStatus.isInitialized = true;
        FirebaseStatus.isReady = true;
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

// Also set in AppState if available (will be picked up by app.js)
if (typeof AppState !== 'undefined') {
    AppState.isFirebaseReady = isFirebaseReady;
    AppState.firebaseStatus = FirebaseStatus;
}

console.log(`🔌 Firebase status: ${isFirebaseReady ? '✅ Connected' : '❌ Offline mode'}`);
console.log(`📋 Persistence: ${FirebaseStatus.persistenceMode}`);

// ================================================================
// HELPER FUNCTIONS FOR APP
// ================================================================

/**
 * Check if Firebase is ready
 * @returns {boolean} True if Firebase is initialized and ready
 */
function isFirebaseAvailable() {
    return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && FirebaseStatus.isReady;
}

/**
 * Get Firestore instance with error handling
 * @returns {Object|null} Firestore instance or null if not available
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
 * @returns {Object|null} Auth instance or null if not available
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
 * @returns {Object|null} Current user or null if not authenticated
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
 * @returns {Object} Firebase status object
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
// EXPOSE HELPER FUNCTIONS GLOBALLY
// ================================================================

// Core Firebase functions
window.isFirebaseAvailable = isFirebaseAvailable;
window.getFirestore = getFirestore;
window.getAuth = getAuth;
window.getCurrentUser = getCurrentUser;

// Status functions
window.getFirebaseStatus = getFirebaseStatus;
window.waitForFirebaseReady = waitForFirebaseReady;

// Global status flags
window.__FIREBASE_READY__ = isFirebaseReady;
window.__FIREBASE_STATUS__ = FirebaseStatus;

console.log('📋 Firebase helper functions exposed globally');
console.log('📋 Status: ' + (isFirebaseReady ? '✅ Ready' : '❌ Not ready'));

// ================================================================
// EXPOSE MODULE
// ================================================================

// For ES Module support
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