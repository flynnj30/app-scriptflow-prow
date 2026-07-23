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

// Initialize Firebase with error handling
try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('âœ… Firebase initialized successfully');
        }
        
        firebase.firestore().enablePersistence({ synchronizeTabs: true })
            .then(() => console.log('âœ… Firebase persistence enabled'))
            .catch(err => {
                if (err.code === 'failed-precondition') {
                    console.warn('âš ï¸ Firebase persistence: multiple tabs open, persistence disabled');
                } else if (err.code === 'unimplemented') {
                    console.warn('âš ï¸ Firebase persistence not supported in this browser');
                } else {
                    console.warn('âš ï¸ Firebase persistence error:', err.message);
                }
            });
    } else {
        console.warn('âš ï¸ Firebase SDK not loaded');
    }
} catch (e) {
    console.warn('âš ï¸ Firebase initialization failed:', e.message);
}