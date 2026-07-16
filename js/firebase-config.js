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

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('âœ… Firebase initialized successfully');
    }
} catch (error) {
    console.error('âŒ Firebase initialization error:', error);
}

const db = firebase.firestore();

try {
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        merge: true
    });
} catch (error) {
    console.warn('Firestore settings already applied:', error);
}

try {
    db.enablePersistence({ synchronizeTabs: true })
        .catch(err => {
            if (err.code !== 'failed-precondition' && err.code !== 'unavailable') {
                console.warn('Firebase persistence error:', err);
            }
        });
} catch (err) {
    console.warn('Firebase persistence setup:', err);
}

const auth = firebase.auth();

try {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(err => {
            console.warn('Auth persistence error:', err);
        });
} catch (err) {
    console.warn('Auth persistence setup:', err);
}

window.db = db;
window.auth = auth;
window.firebase = firebase;

console.log('âœ… Firebase services ready');