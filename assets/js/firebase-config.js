// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence - FIXED: Check if already initialized
try {
    // Try to enable persistence
    db.enablePersistence({ synchronizeTabs: true })
        .then(() => {
            console.log('Firestore persistence enabled');
        })
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                // Multiple tabs open, persistence can only be enabled in one tab at a time
                console.warn('Persistence failed: Multiple tabs open, using cache fallback');
            } else if (err.code === 'unimplemented') {
                // The current browser doesn't support persistence
                console.warn('Persistence not supported in this browser');
            } else {
                console.warn('Persistence error:', err);
            }
        });
} catch (error) {
    console.warn('Failed to enable persistence:', error);
}

// Export for use in other files
window.firebaseApp = firebase;
window.auth = auth;
window.db = db;