// ============================================================
// FIREBASE CONFIGURATION - ScriptFlow Pro
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
  authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
  databaseURL: "https://scriptflow-pro-2cf4c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scriptflow-pro-2cf4c",
  storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
  messagingSenderId: "250157640936",
  appId: "1:250157640936:web:01b0297461f4596a5aed5d"
};

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized successfully');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

const db = firebase.firestore();
const auth = firebase.auth();

try {
    db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED, merge: true });
    db.enablePersistence({ synchronizeTabs: true }).catch(err => {
        if (err.code !== 'failed-precondition' && err.code !== 'unavailable') {
            console.warn('Firebase persistence error:', err);
        }
    });
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
        console.warn('Auth persistence error:', err);
    });
} catch (err) {
    console.warn('Firebase setup:', err);
}

window.db = db;
window.auth = auth;
window.firebase = firebase;