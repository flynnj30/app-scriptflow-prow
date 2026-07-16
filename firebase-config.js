// ============================================================
// FIREBASE CONFIGURATION - ScriptFlow Pro
// ============================================================

// Define Firebase configuration first
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

// Initialize Firebase
let db;
let auth;
let firebaseApp;

try {
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK not loaded. Check your script tags in index.html');
    }

    // Initialize Firebase app
    if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized successfully');
    } else {
        firebaseApp = firebase.app();
        console.log('✅ Firebase already initialized');
    }

    // Initialize Firestore
    db = firebase.firestore();
    console.log('✅ Firestore connected');

    // Apply Firestore settings
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        merge: true
    });

    // Enable offline persistence
    db.enablePersistence({ synchronizeTabs: true })
        .then(() => console.log('✅ Offline persistence enabled'))
        .catch(err => {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ The current browser does not support offline persistence.');
            } else {
                console.warn('Firebase persistence error:', err);
            }
        });

    // Initialize Auth
    auth = firebase.auth();
    console.log('✅ Auth initialized');

    // Set auth persistence
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => console.log('✅ Auth persistence set to LOCAL'))
        .catch(err => console.warn('Auth persistence error:', err));

    // Export to window object
    window.db = db;
    window.auth = auth;
    window.firebase = firebase;
    window.firebaseApp = firebaseApp;

    console.log('✅ Firebase services ready');
    console.log('📊 Project ID:', FIREBASE_CONFIG.projectId);

} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    
    // Show user-friendly error
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:white;padding:12px;text-align:center;z-index:99999;font-family:sans-serif;';
    errorDiv.innerHTML = `
        <strong>⚠️ Firebase Connection Error</strong><br>
        <small>${error.message}</small><br>
        <small>Please check your internet connection and reload the page.</small>
    `;
    document.body.prepend(errorDiv);
}