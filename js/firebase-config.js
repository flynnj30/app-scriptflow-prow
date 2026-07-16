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
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized successfully');
        firebaseInitialized = true;
    } else {
        firebaseInitialized = true;
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    firebaseInitialized = false;
}

if (firebaseInitialized) {
    try {
        db = firebase.firestore();
        auth = firebase.auth();
        
        // ============================================================
        // MODERN FIRESTORE SETTINGS - Using cache instead of deprecated methods
        // ============================================================
        try {
            // Use the modern cache settings approach
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                merge: true,
                // Modern cache setting - recommended approach
                cache: {
                    tabSynchronization: true,
                    // Enable offline persistence
                    persistenceEnabled: true,
                    // Cache size limit
                    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
                },
                // Fallback for older SDK versions
                experimentalAutoDetectLongPolling: false,
                experimentalForceLongPolling: false
            });
            
            console.log('✅ Firestore cache settings applied');
        } catch (settingsError) {
            console.warn('⚠️ Firestore settings error:', settingsError);
            
            // Fallback: Try without cache setting
            try {
                db.settings({
                    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                    merge: true,
                    experimentalAutoDetectLongPolling: false,
                    experimentalForceLongPolling: false
                });
                console.log('✅ Firestore settings applied (fallback)');
            } catch (fallbackError) {
                console.warn('⚠️ Firestore settings fallback error:', fallbackError);
            }
        }

        // ============================================================
        // OFFLINE PERSISTENCE - Modern approach with try-catch
        // ============================================================
        try {
            // Use the modern enablePersistence with cache settings
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
                                console.warn('⚠️ Offline persistence unavailable, running in online-only mode');
                            });
                    } else if (err.code === 'unavailable') {
                        console.warn('⚠️ Offline persistence unavailable, running in online-only mode');
                    } else {
                        console.warn('⚠️ Firebase persistence error:', err);
                    }
                });
        } catch (persistenceError) {
            console.warn('⚠️ Firebase persistence setup error:', persistenceError);
        }

        // ============================================================
        // AUTH PERSISTENCE
        // ============================================================
        try {
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(() => {
                    console.log('✅ Auth persistence enabled');
                })
                .catch(err => {
                    console.warn('⚠️ Auth persistence error:', err);
                });
        } catch (authError) {
            console.warn('⚠️ Auth persistence setup error:', authError);
        }

        console.log('✅ Firebase services ready');
        
    } catch (error) {
        console.error('❌ Error setting up Firebase services:', error);
        
        // Create fallback objects to prevent app crashes
        db = {
            collection: () => ({
                doc: () => ({
                    get: () => Promise.resolve({ exists: false, data: () => ({}) }),
                    set: () => Promise.resolve(),
                    update: () => Promise.resolve(),
                    delete: () => Promise.resolve(),
                    onSnapshot: () => () => {}
                }),
                onSnapshot: () => () => {}
            })
        };
        auth = {
            onAuthStateChanged: () => () => {},
            signInWithPopup: () => Promise.reject(new Error('Firebase unavailable')),
            signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase unavailable')),
            createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase unavailable')),
            signOut: () => Promise.resolve(),
            setPersistence: () => Promise.resolve()
        };
    }
} else {
    // Fallback for failed Firebase initialization
    console.warn('⚠️ Using fallback Firebase services');
    db = {
        collection: () => ({
            doc: () => ({
                get: () => Promise.resolve({ exists: false, data: () => ({}) }),
                set: () => Promise.resolve(),
                update: () => Promise.resolve(),
                delete: () => Promise.resolve(),
                onSnapshot: () => () => {}
            }),
            onSnapshot: () => () => {}
        })
    };
    auth = {
        onAuthStateChanged: () => () => {},
        signInWithPopup: () => Promise.reject(new Error('Firebase unavailable')),
        signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase unavailable')),
        createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase unavailable')),
        signOut: () => Promise.resolve(),
        setPersistence: () => Promise.resolve()
    };
}

// Make available globally
window.db = db;
window.auth = auth;
window.firebase = firebase;

console.log('✅ Firebase module loaded');