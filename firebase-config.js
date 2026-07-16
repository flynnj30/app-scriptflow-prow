// ============================================================
// FIREBASE CONFIGURATION - ScriptFlow Pro
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
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized successfully');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Initialize Firestore
const db = firebase.firestore();

// Apply settings
try {
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        merge: true
    });
    console.log('✅ Firestore settings applied');
} catch (error) {
    console.warn('Firestore settings already applied:', error);
}

// Enable offline persistence
try {
    db.enablePersistence({ synchronizeTabs: true })
        .then(() => console.log('✅ Offline persistence enabled'))
        .catch(err => {
            if (err.code !== 'failed-precondition' && err.code !== 'unavailable') {
                console.warn('Firebase persistence error:', err);
            }
        });
} catch (err) {
    console.warn('Firebase persistence setup:', err);
}

// Initialize Auth
const auth = firebase.auth();

// Enable persistence for auth
try {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => console.log('✅ Auth persistence enabled'))
        .catch(err => {
            console.warn('Auth persistence error:', err);
        });
} catch (err) {
    console.warn('Auth persistence setup:', err);
}

// Export globally
window.db = db;
window.auth = auth;
window.firebase = firebase;

console.log('✅ Firebase services ready');
console.log('📊 Firestore Database:', FIREBASE_CONFIG.projectId);
console.log('🔐 Auth Domain:', FIREBASE_CONFIG.authDomain);