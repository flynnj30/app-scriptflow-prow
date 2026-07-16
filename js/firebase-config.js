// ============================================================
// FIREBASE CONFIGURATION - Minimal Version
// ============================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

// Initialize Firebase
let db, auth;
let firebaseInitialized = false;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized');
        firebaseInitialized = true;
    } else {
        firebaseInitialized = true;
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    firebaseInitialized = false;
}

if (firebaseInitialized) {
    try {
        db = firebase.firestore();
        auth = firebase.auth();
        
        // ============================================================
        // SUPPRESS DEPRECATION WARNING - Use modern approach
        // ============================================================
        
        // Method 1: Use cache settings (Recommended)
        try {
            // Modern approach - cache settings
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                merge: true,
                // Modern cache configuration
                cache: {
                    tabSynchronization: true,
                    persistenceEnabled: true
                }
            });
            console.log('✅ Firestore cache configured');
        } catch (settingsError) {
            // Fallback: Basic settings without cache
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                merge: true
            });
            console.log('✅ Firestore basic settings applied');
        }

        // ============================================================
        // OFFLINE PERSISTENCE - Handle gracefully
        // ============================================================
        try {
            // Try to enable persistence
            db.enablePersistence({ synchronizeTabs: true })
                .then(() => console.log('✅ Persistence enabled'))
                .catch(() => {
                    console.warn('⚠️ Persistence unavailable - offline mode disabled');
                });
        } catch (persistenceError) {
            console.warn('⚠️ Persistence setup error:', persistenceError.message);
        }

        // ============================================================
        // AUTH PERSISTENCE
        // ============================================================
        try {
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .catch(() => console.warn('⚠️ Auth persistence unavailable'));
        } catch (authError) {
            console.warn('⚠️ Auth persistence error');
        }

        console.log('✅ Firebase ready');
        
    } catch (error) {
        console.error('❌ Firebase services error:', error);
        // Fallback objects
        db = { collection: () => ({ doc: () => ({ get: () => Promise.resolve({ exists: false, data: () => ({}) }), set: () => Promise.resolve(), update: () => Promise.resolve(), delete: () => Promise.resolve(), onSnapshot: () => () => {} }), onSnapshot: () => () => {} }) };
        auth = { onAuthStateChanged: () => () => {}, signInWithPopup: () => Promise.reject(), signInWithEmailAndPassword: () => Promise.reject(), createUserWithEmailAndPassword: () => Promise.reject(), signOut: () => Promise.resolve(), setPersistence: () => Promise.resolve() };
    }
} else {
    // Fallback
    console.warn('⚠️ Using fallback Firebase services');
    db = { collection: () => ({ doc: () => ({ get: () => Promise.resolve({ exists: false, data: () => ({}) }), set: () => Promise.resolve(), update: () => Promise.resolve(), delete: () => Promise.resolve(), onSnapshot: () => () => {} }), onSnapshot: () => () => {} }) };
    auth = { onAuthStateChanged: () => () => {}, signInWithPopup: () => Promise.reject(), signInWithEmailAndPassword: () => Promise.reject(), createUserWithEmailAndPassword: () => Promise.reject(), signOut: () => Promise.resolve(), setPersistence: () => Promise.resolve() };
}

window.db = db;
window.auth = auth;
window.firebase = firebase;

console.log('✅ Firebase module loaded');