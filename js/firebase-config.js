// ============================================================
// FIREBASE CONFIGURATION - FIXED
// ============================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

let db = null;
let auth = null;
let firebaseInitialized = false;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized successfully');
        firebaseInitialized = true;
    } else {
        firebaseInitialized = true;
        console.log('✅ Using existing Firebase app');
    }
} catch (error) {
    console.warn('⚠️ Firebase initialization error:', error.message);
    try {
        if (firebase.apps.length > 0) {
            firebaseInitialized = true;
            console.log('✅ Using existing Firebase app');
        }
    } catch (e) {
        console.error('❌ Failed to initialize Firebase:', e);
    }
}

try {
    if (firebaseInitialized) {
        db = firebase.firestore();
        
        // FIXED: Use cache instead of deprecated enablePersistence
        try {
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                cache: {
                    synchronizeTabs: true
                }
            });
            console.log('✅ Firestore cache enabled with tab synchronization');
        } catch (error) {
            console.warn('Firestore cache settings:', error);
            // Fallback: try without cache
            try {
                db.settings({
                    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
                });
            } catch (e) {
                console.warn('Firestore settings fallback:', e);
            }
        }

        // Initialize Auth
        auth = firebase.auth();

        try {
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .catch(err => {
                    console.warn('Auth persistence error:', err);
                });
        } catch (err) {
            console.warn('Auth persistence setup:', err);
        }
    }
} catch (error) {
    console.warn('⚠️ Firebase service initialization error:', error.message);
}

window.db = db;
window.auth = auth;
window.firebase = firebase;
window.firebaseInitialized = firebaseInitialized;

let isFirebaseConnected = false;
let connectionCheckInterval = null;

function checkFirebaseConnection() {
    if (!db) return;
    try {
        db.collection('_test').limit(1).get()
            .then(() => {
                if (!isFirebaseConnected) {
                    isFirebaseConnected = true;
                    console.log('✅ Firebase connection established');
                }
            })
            .catch(() => {
                if (isFirebaseConnected) {
                    isFirebaseConnected = false;
                    console.warn('⚠️ Firebase connection lost');
                }
            });
    } catch (e) {
        // Silently handle connection check errors
    }
}

if (firebaseInitialized && db) {
    connectionCheckInterval = setInterval(checkFirebaseConnection, 30000);
    setTimeout(checkFirebaseConnection, 2000);
}

console.log('✅ Firebase services ready');
console.log('💾 Cache enabled with tab synchronization');
