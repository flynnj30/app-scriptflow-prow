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
(function initFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
            console.log('✅ Firebase initialized successfully');
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        // Show user-friendly error
        showToast('Failed to connect to Firebase. Please check your connection.', 'error');
    }
})();

const db = firebase.firestore();

// Configure Firestore with security best practices
try {
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        merge: true,
        ignoreUndefinedProperties: true
    });
} catch (error) {
    console.warn('Firestore settings already applied:', error);
}

// Enable offline persistence with error handling
try {
    db.enablePersistence({ 
        synchronizeTabs: true,
        experimentalForceOwningTab: true
    }).catch(err => {
        if (err.code !== 'failed-precondition' && err.code !== 'unavailable') {
            console.warn('Firebase persistence error:', err);
        }
    });
} catch (err) {
    console.warn('Firebase persistence setup:', err);
}

const auth = firebase.auth();

// Configure auth persistence
try {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(err => {
            console.warn('Auth persistence error:', err);
        });
} catch (err) {
    console.warn('Auth persistence setup:', err);
}

// Auth state logging (for debugging)
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('👤 User authenticated:', user.email);
    } else {
        console.log('👤 No user authenticated');
    }
});

// Export for global use
window.db = db;
window.auth = auth;
window.firebase = firebase;

// Security: Add request validation
const validateFirebaseData = (data) => {
    const MAX_STRING_LENGTH = 10000;
    const MAX_ARRAY_LENGTH = 100;
    
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
            console.warn(`⚠️ Field "${key}" exceeds maximum length`);
            return false;
        }
        if (Array.isArray(value) && value.length > MAX_ARRAY_LENGTH) {
            console.warn(`⚠️ Array "${key}" exceeds maximum length`);
            return false;
        }
    }
    return true;
};

window.validateFirebaseData = validateFirebaseData;

console.log('✅ Firebase services ready');