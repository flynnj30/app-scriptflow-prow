// ================================================================
// FIREBASE CONFIGURATION - WITH ERROR HANDLING & FALLBACK
// ================================================================

// Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

// Initialize Firebase with error handling and retry logic
let firebaseInitialized = false;
let firebaseInitAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

function initFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK not loaded');
            return false;
        }
        
        if (firebase.apps && firebase.apps.length > 0) {
            console.log('✅ Firebase already initialized');
            firebaseInitialized = true;
            return true;
        }
        
        // Try to initialize with a timeout to prevent blocking
        firebase.initializeApp(firebaseConfig);
        firebaseInitialized = true;
        console.log('✅ Firebase initialized successfully');
        
        // Enable offline persistence with error handling
        try {
            firebase.firestore().enablePersistence({ synchronizeTabs: true })
                .then(() => console.log('✅ Firebase persistence enabled'))
                .catch(err => {
                    if (err.code === 'failed-precondition') {
                        console.warn('⚠️ Firebase persistence: multiple tabs open, persistence disabled');
                    } else if (err.code === 'unimplemented') {
                        console.warn('⚠️ Firebase persistence not supported in this browser');
                    } else {
                        console.warn('⚠️ Firebase persistence error:', err.message);
                    }
                });
        } catch (persistErr) {
            console.warn('⚠️ Firebase persistence setup failed:', persistErr.message);
        }
        
        return true;
        
    } catch (e) {
        console.warn('⚠️ Firebase initialization failed:', e.message);
        
        if (firebaseInitAttempts < MAX_INIT_ATTEMPTS) {
            firebaseInitAttempts++;
            console.log(`🔄 Retrying Firebase init (attempt ${firebaseInitAttempts}/${MAX_INIT_ATTEMPTS})...`);
            // Retry after delay
            setTimeout(initFirebase, 2000);
        }
        return false;
    }
}

// Try to initialize immediately
initFirebase();

// Retry on page load if needed
document.addEventListener('DOMContentLoaded', function() {
    if (!firebaseInitialized) {
        setTimeout(initFirebase, 1000);
    }
});

// Export for use in other files
window.isFirebaseReady = function() {
    return firebaseInitialized && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
};

// Helper to get Firebase with fallback
window.getFirebase = function() {
    if (window.isFirebaseReady()) {
        return firebase;
    }
    return null;
};

// Helper to get Firestore with fallback
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

// Helper to get Auth with fallback
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

console.log('🔧 Firebase config loaded with fallback support');