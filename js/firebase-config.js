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
let db, auth;
let firebaseInitialized = false;

try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized successfully');
        firebaseInitialized = true;
    } else if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        console.log('✅ Firebase already initialized');
        firebaseInitialized = true;
    } else {
        console.warn('⚠️ Firebase library not loaded');
        firebaseInitialized = false;
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    firebaseInitialized = false;
}

if (firebaseInitialized) {
    try {
        db = firebase.firestore();
        auth = firebase.auth();
        
        // Firestore Settings
        try {
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                merge: true,
                cache: {
                    tabSynchronization: true,
                    persistenceEnabled: true
                }
            });
            console.log('✅ Firestore cache configured');
        } catch (settingsError) {
            try {
                db.settings({
                    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                    merge: true
                });
                console.log('✅ Firestore settings applied (fallback)');
            } catch (fallbackError) {
                console.warn('⚠️ Firestore settings error:', fallbackError);
            }
        }

        // Offline Persistence
        try {
            db.enablePersistence({ synchronizeTabs: true })
                .then(() => {
                    console.log('✅ Firestore persistence enabled (multi-tab)');
                })
                .catch(err => {
                    if (err.code === 'failed-precondition') {
                        console.warn('⚠️ Multiple tabs open, trying single tab mode');
                        db.enablePersistence({ synchronizeTabs: false })
                            .then(() => {
                                console.log('✅ Firestore persistence enabled (single-tab)');
                            })
                            .catch(() => {
                                console.warn('⚠️ Offline persistence unavailable');
                            });
                    } else {
                        console.warn('⚠️ Persistence unavailable:', err.message);
                    }
                });
        } catch (persistenceError) {
            console.warn('⚠️ Persistence setup error:', persistenceError.message);
        }

        // Auth Persistence
        try {
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(() => {
                    console.log('✅ Auth persistence enabled');
                })
                .catch(err => {
                    console.warn('⚠️ Auth persistence error:', err.message);
                });
        } catch (authError) {
            console.warn('⚠️ Auth persistence setup error:', authError.message);
        }

        console.log('✅ Firebase services ready');
        
    } catch (error) {
        console.error('❌ Error setting up Firebase services:', error);
        db = createFallbackDb();
        auth = createFallbackAuth();
    }
} else {
    console.warn('⚠️ Using fallback Firebase services');
    db = createFallbackDb();
    auth = createFallbackAuth();
}

// Fallback Functions
function createFallbackDb() {
    return {
        collection: () => ({
            doc: () => ({
                get: () => Promise.resolve({ exists: false, data: () => ({}) }),
                set: () => Promise.resolve(),
                update: () => Promise.resolve(),
                delete: () => Promise.resolve(),
                onSnapshot: () => () => {}
            }),
            onSnapshot: () => () => {},
            add: () => Promise.resolve({ id: 'local_' + Date.now() })
        })
    };
}

function createFallbackAuth() {
    return {
        onAuthStateChanged: () => () => {},
        signInWithPopup: () => Promise.reject(new Error('Firebase unavailable')),
        signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase unavailable')),
        createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase unavailable')),
        signOut: () => Promise.resolve(),
        setPersistence: () => Promise.resolve(),
        currentUser: null
    };
}

// Make available globally
window.db = db;
window.auth = auth;
window.firebase = firebase;

console.log('✅ Firebase module loaded');