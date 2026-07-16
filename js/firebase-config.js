// ============================================================
// FIREBASE CONFIGURATION
// ============================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

// Initialize Firebase with error handling
let db = null;
let auth = null;
let firebaseInitialized = false;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized successfully');
        firebaseInitialized = true;
    } else {
        firebaseInitialized = true;
        console.log('✅ Using existing Firebase app');
    }
} catch (error) {
    console.warn('⚠️ Firebase initialization error:', error.message);
    // Try to use existing app
    try {
        if (firebase.apps.length > 0) {
            firebaseInitialized = true;
            console.log('✅ Using existing Firebase app');
        }
    } catch (e) {
        console.error('❌ Failed to initialize Firebase:', e);
    }
}

try {
    if (firebaseInitialized) {
        db = firebase.firestore();
        
        // Apply settings with error handling - FIX: Only use one persistence option
        try {
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                merge: true
            });
        } catch (error) {
            console.warn('Firestore settings already applied:', error);
        }

        // Enable offline persistence - FIX: Removed experimentalForceOwningTab
        try {
            db.enablePersistence({ 
                synchronizeTabs: true
                // experimentalForceOwningTab removed - cannot be used with synchronizeTabs
            }).catch(err => {
                // If persistence fails, continue without it
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Firestore persistence: Multiple tabs open. Using online-only mode.');
                } else if (err.code === 'unavailable') {
                    console.warn('⚠️ Firestore persistence: Browser does not support persistence. Using online-only mode.');
                } else {
                    console.warn('⚠️ Firestore persistence error:', err);
                }
                // Continue without persistence - app will still work
            });
        } catch (err) {
            console.warn('⚠️ Firestore persistence setup error:', err);
            // Continue without persistence
        }

        // Initialize Auth
        auth = firebase.auth();

        try {
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .catch(err => {
                    console.warn('Auth persistence error:', err);
                });
        } catch (err) {
            console.warn('Auth persistence setup:', err);
        }
    }
} catch (error) {
    console.warn('⚠️ Firebase service initialization error:', error.message);
}

// Make available globally with fallbacks
window.db = db;
window.auth = auth;
window.firebase = firebase;
window.firebaseInitialized = firebaseInitialized;

// Connection status tracking
let isFirebaseConnected = false;
let connectionCheckInterval = null;

function checkFirebaseConnection() {
    if (!db) return;
    try {
        // Test connection with a lightweight operation
        db.collection('_test').limit(1).get()
            .then(() => {
                if (!isFirebaseConnected) {
                    isFirebaseConnected = true;
                    console.log('✅ Firebase connection established');
                }
            })
            .catch(() => {
                if (isFirebaseConnected) {
                    isFirebaseConnected = false;
                    console.warn('⚠️ Firebase connection lost');
                }
            });
    } catch (e) {
        // Silently handle connection check errors
    }
}

// Check connection every 30 seconds if Firebase is available
if (firebaseInitialized && db) {
    connectionCheckInterval = setInterval(checkFirebaseConnection, 30000);
    // Initial check after 2 seconds
    setTimeout(checkFirebaseConnection, 2000);
}

console.log('✅ Firebase services ready');
console.log('📡 Connection monitoring enabled');
console.log('💾 Offline persistence: ' + (db ? 'enabled (synchronizeTabs)' : 'disabled'));
