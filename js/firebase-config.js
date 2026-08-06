// ================================================================
// FIREBASE CONFIGURATION - COMPLETE
// ================================================================

const firebaseConfig = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

const FirebaseStatus = {
    isInitialized: false,
    isReady: false,
    lastError: null,
    persistenceMode: 'none',
    connectionStatus: 'unknown',
    blockedByClient: false
};

let firebaseInitAttempts = 0;
const MAX_INIT_ATTEMPTS = 5;

function initializeFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded');
            FirebaseStatus.isReady = false;
            FirebaseStatus.lastError = 'Firebase SDK not loaded';
            return false;
        }

        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase app initialized successfully');
        } else {
            console.log('Firebase app already initialized');
        }

        const db = firebase.firestore();
        
        try {
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                ignoreUndefinedProperties: true,
                merge: true
            });
            console.log('Firestore settings configured');
        } catch (settingsError) {
            console.warn('Firestore settings warning:', settingsError.message);
        }

        // Use memory-only mode to avoid connection issues
        console.log('Using memory-only mode (no persistence) to avoid connection issues');
        
        setTimeout(() => {
            FirebaseStatus.persistenceMode = 'memory-only';
            FirebaseStatus.isReady = true;
            FirebaseStatus.isInitialized = true;
            window.__FIREBASE_READY__ = true;
            
            if (typeof AppState !== 'undefined') {
                AppState.isFirebaseReady = true;
                AppState.firebaseStatus = FirebaseStatus;
            }
            
            document.dispatchEvent(new CustomEvent('firebase-ready'));
            console.log('Firebase ready in memory-only mode');
        }, 300);

        console.log('Firebase initialized successfully');
        console.log(`Status: ${FirebaseStatus.isReady ? 'Ready' : 'Not ready'}`);
        console.log(`Persistence mode: ${FirebaseStatus.persistenceMode}`);
        return true;

    } catch (error) {
        console.error('Firebase initialization error:', error);
        FirebaseStatus.isInitialized = false;
        FirebaseStatus.isReady = false;
        FirebaseStatus.lastError = error.message;
        window.__FIREBASE_READY__ = false;
        
        if (typeof AppState !== 'undefined') {
            AppState.isFirebaseReady = false;
            AppState.firebaseStatus = FirebaseStatus;
        }
        
        firebaseInitAttempts++;
        if (firebaseInitAttempts < MAX_INIT_ATTEMPTS) {
            console.log(`Retrying Firebase initialization (${firebaseInitAttempts}/${MAX_INIT_ATTEMPTS})...`);
            setTimeout(() => {
                initializeFirebase();
            }, 2000 * firebaseInitAttempts);
        }
        
        return false;
    }
}

function isFirebaseAvailable() {
    return typeof firebase !== 'undefined' && 
           firebase.apps && 
           firebase.apps.length > 0 && 
           FirebaseStatus.isReady;
}

function getFirestore() {
    try {
        if (isFirebaseAvailable()) {
            return firebase.firestore();
        }
        return null;
    } catch (error) {
        console.warn('Could not get Firestore:', error.message);
        return null;
    }
}

function getAuth() {
    try {
        if (isFirebaseAvailable()) {
            return firebase.auth();
        }
        return null;
    } catch (error) {
        console.warn('Could not get Auth:', error.message);
        return null;
    }
}

function getCurrentUser() {
    try {
        if (isFirebaseAvailable()) {
            return firebase.auth().currentUser;
        }
        return null;
    } catch (error) {
        console.warn('Could not get current user:', error.message);
        return null;
    }
}

function getFirebaseStatus() {
    return {
        ...FirebaseStatus,
        isAvailable: isFirebaseAvailable(),
        sdkLoaded: typeof firebase !== 'undefined'
    };
}

function waitForFirebaseReady(timeout = 10000) {
    return new Promise((resolve) => {
        if (FirebaseStatus.isReady) {
            resolve(true);
            return;
        }
        
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (FirebaseStatus.isReady) {
                clearInterval(checkInterval);
                resolve(true);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                console.warn('Firebase ready timeout');
                resolve(false);
            }
        }, 200);
    });
}

console.log('Initializing Firebase...');
const isFirebaseReady = initializeFirebase();

window.firebaseConfig = firebaseConfig;
window.FirebaseStatus = FirebaseStatus;
window.isFirebaseReady = isFirebaseReady;
window.isFirebaseAvailable = isFirebaseAvailable;
window.getFirestore = getFirestore;
window.getAuth = getAuth;
window.getCurrentUser = getCurrentUser;
window.getFirebaseStatus = getFirebaseStatus;
window.waitForFirebaseReady = waitForFirebaseReady;
window.__FIREBASE_READY__ = isFirebaseReady;

if (typeof AppState !== 'undefined') {
    AppState.isFirebaseReady = isFirebaseReady;
    AppState.firebaseStatus = FirebaseStatus;
}

console.log(`Firebase status: ${isFirebaseReady ? 'Connected' : 'Offline mode'}`);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        firebaseConfig,
        FirebaseStatus,
        isFirebaseReady,
        initializeFirebase,
        isFirebaseAvailable,
        getFirestore,
        getAuth,
        getCurrentUser,
        getFirebaseStatus,
        waitForFirebaseReady
    };
}