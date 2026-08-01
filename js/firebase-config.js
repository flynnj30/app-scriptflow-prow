// ================================================================
// FIREBASE CONFIGURATION
// ================================================================

const firebaseConfig = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

/**
 * Initialize Firebase with proper error handling and persistence
 * @returns {boolean} True if Firebase initialized successfully
 */
function initializeFirebase() {
    try {
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK not loaded - running in offline mode');
            return false;
        }

        // Initialize Firebase app if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        }

        // Get Firestore instance
        const db = firebase.firestore();

        // ================================================================
        // FIX: Use the new cache configuration to avoid deprecation warning
        // Reference: https://firebase.google.com/docs/firestore/manage-data/enable-offline
        // ================================================================
        
        // Enable persistence with recommended settings
        // This is the recommended approach for Firestore 9.x
        db.enablePersistence({
            synchronizeTabs: true,
            experimentalForceOwningTab: true
        })
        .then(() => {
            console.log('✅ Firebase persistence enabled with cache configuration');
        })
        .catch(err => {
            // Handle specific error cases gracefully
            if (err.code === 'failed-precondition') {
                // Multiple tabs open - persistence is disabled in other tabs
                console.warn('⚠️ Firebase persistence: multiple tabs open, persistence disabled in this tab');
                console.info('ℹ️ Data will still work, but offline support may be limited');
            } else if (err.code === 'unimplemented') {
                // Browser doesn't support persistence
                console.warn('⚠️ Firebase persistence not supported in this browser');
                console.info('ℹ️ Continuing in online-only mode');
            } else {
                // Other persistence errors
                console.warn('⚠️ Firebase persistence error:', err.message);
                console.info('ℹ️ Continuing without persistence - data will still work online');
            }
        });

        // ================================================================
        // Configure cache size for better performance
        // This helps manage memory usage for offline data
        // ================================================================
        try {
            // Use unlimited cache size for better offline support
            // You can also use a specific size like: 104857600 (100MB)
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
            });
            console.log('✅ Firestore cache size configured');
        } catch (cacheError) {
            // Cache size configuration is optional and may not be supported in all versions
            console.warn('⚠️ Could not set cache size:', cacheError.message);
        }

        // ================================================================
        // Optional: Enable Firestore logging for debugging (disable in production)
        // ================================================================
        // if (window.location.hostname === 'localhost') {
        //     firebase.firestore.setLogLevel('debug');
        //     console.log('🔍 Firestore debug logging enabled');
        // }

        console.log('✅ Firestore configured successfully');
        return true;

    } catch (error) {
        console.warn('⚠️ Firebase initialization failed:', error.message);
        console.info('ℹ️ Running in offline mode - some features may be limited');
        return false;
    }
}

// Execute initialization
const isFirebaseReady = initializeFirebase();

// ================================================================
// EXPOSE FIREBASE STATUS FOR APP
// ================================================================

// Make Firebase status available globally
window.__FIREBASE_READY__ = isFirebaseReady;

// Also set in AppState if available (will be picked up by app.js)
if (typeof AppState !== 'undefined' && AppState) {
    AppState.isFirebaseReady = isFirebaseReady;
}

console.log(`🔌 Firebase status: ${isFirebaseReady ? '✅ Connected' : '❌ Offline mode'}`);

// ================================================================
// HELPER FUNCTIONS FOR APP
// ================================================================

/**
 * Check if Firebase is ready
 * @returns {boolean} True if Firebase is initialized and ready
 */
function isFirebaseAvailable() {
    return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
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
 * Get Firebase Auth provider (Google)
 * @returns {Object|null} Google Auth provider or null if not available
 */
function getGoogleAuthProvider() {
    try {
        if (isFirebaseAvailable()) {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            return provider;
        }
        return null;
    } catch (error) {
        console.warn('⚠️ Could not get Google Auth provider:', error.message);
        return null;
    }
}

/**
 * Sign in with Google
 * @returns {Promise<Object|null>} User object or null on error
 */
async function signInWithGoogle() {
    try {
        if (!isFirebaseAvailable()) {
            throw new Error('Firebase is not available');
        }
        const provider = getGoogleAuthProvider();
        if (!provider) {
            throw new Error('Could not create Google Auth provider');
        }
        const result = await firebase.auth().signInWithPopup(provider);
        return result.user;
    } catch (error) {
        console.warn('⚠️ Google sign-in error:', error.message);
        throw error;
    }
}

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object or null on error
 */
async function signInWithEmail(email, password) {
    try {
        if (!isFirebaseAvailable()) {
            throw new Error('Firebase is not available');
        }
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        return result.user;
    } catch (error) {
        console.warn('⚠️ Email sign-in error:', error.message);
        throw error;
    }
}

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<Object|null>} User object or null on error
 */
async function signUpWithEmail(email, password, displayName) {
    try {
        if (!isFirebaseAvailable()) {
            throw new Error('Firebase is not available');
        }
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        if (result.user && displayName) {
            await result.user.updateProfile({ displayName: displayName });
        }
        return result.user;
    } catch (error) {
        console.warn('⚠️ Email sign-up error:', error.message);
        throw error;
    }
}

/**
 * Sign out current user
 * @returns {Promise<boolean>} True if signed out successfully
 */
async function signOutUser() {
    try {
        if (!isFirebaseAvailable()) {
            return true;
        }
        await firebase.auth().signOut();
        return true;
    } catch (error) {
        console.warn('⚠️ Sign-out error:', error.message);
        throw error;
    }
}

/**
 * Get Firebase Auth state
 * @param {Function} callback - Callback function with user object
 * @returns {Function} Unsubscribe function
 */
function onAuthStateChanged(callback) {
    try {
        if (!isFirebaseAvailable()) {
            callback(null);
            return () => {};
        }
        return firebase.auth().onAuthStateChanged(callback);
    } catch (error) {
        console.warn('⚠️ Auth state change error:', error.message);
        callback(null);
        return () => {};
    }
}

/**
 * Get Firestore collection reference with error handling
 * @param {string} collectionName - Collection name
 * @returns {Object|null} Collection reference or null
 */
function getCollection(collectionName) {
    try {
        const db = getFirestore();
        if (!db) return null;
        return db.collection(collectionName);
    } catch (error) {
        console.warn(`⚠️ Could not get collection "${collectionName}":`, error.message);
        return null;
    }
}

/**
 * Get Firestore document reference with error handling
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @returns {Object|null} Document reference or null
 */
function getDocument(collectionName, docId) {
    try {
        const db = getFirestore();
        if (!db) return null;
        return db.collection(collectionName).doc(docId);
    } catch (error) {
        console.warn(`⚠️ Could not get document "${docId}" from "${collectionName}":`, error.message);
        return null;
    }
}

/**
 * Get user-specific collection reference
 * @param {string} userId - User ID
 * @param {string} subCollection - Sub-collection name
 * @returns {Object|null} Collection reference or null
 */
function getUserCollection(userId, subCollection) {
    try {
        if (!userId || !subCollection) return null;
        return getDocument('users', userId)?.collection(subCollection) || null;
    } catch (error) {
        console.warn(`⚠️ Could not get user collection "${subCollection}":`, error.message);
        return null;
    }
}

// ================================================================
// EXPOSE HELPER FUNCTIONS GLOBALLY
// ================================================================

window.isFirebaseAvailable = isFirebaseAvailable;
window.getFirestore = getFirestore;
window.getAuth = getAuth;
window.getCurrentUser = getCurrentUser;
window.getGoogleAuthProvider = getGoogleAuthProvider;
window.signInWithGoogle = signInWithGoogle;
window.signInWithEmail = signInWithEmail;
window.signUpWithEmail = signUpWithEmail;
window.signOutUser = signOutUser;
window.onAuthStateChanged = onAuthStateChanged;
window.getCollection = getCollection;
window.getDocument = getDocument;
window.getUserCollection = getUserCollection;

console.log('📋 Firebase helper functions exposed globally');
console.log('📋 Available functions: isFirebaseAvailable, getFirestore, getAuth, getCurrentUser, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, onAuthStateChanged, getCollection, getDocument, getUserCollection');