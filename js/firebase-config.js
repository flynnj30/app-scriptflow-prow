// ================================================================
// FIREBASE CONFIGURATION
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

// Initialize Firebase
try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        // Enable offline persistence
        firebase.firestore().enablePersistence({ synchronizeTabs: true })
            .catch(err => {
                console.warn('Firebase persistence:', err.message);
            });
        console.log('✅ Firebase initialized successfully');
    }
} catch (e) {
    console.warn('⚠️ Firebase initialization failed:', e.message);
}