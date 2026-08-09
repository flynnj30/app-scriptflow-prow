// ================================================================
// FIREBASE CONFIGURATION - SINGLETON PATTERN WITH READY PROMISE
// ================================================================

const firebaseConfig = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

// Singleton state
const FirebaseManager = {
    initialized: false,
    initAttempts: 0,
    maxAttempts: 5,
    firebaseApp: null,
    firestoreInstance: null,
    authInstance: null,
    isInitializing: false,
    readyPromise: null,
    readyResolve: null,
    readyReject: null,
    _isReady: false,
    _settingsApplied: false,

    init: function() {
        if (this.initialized && this.firebaseApp) {
            console.log('✅ Firebase already initialized');
            return Promise.resolve(this.firebaseApp);
        }

        if (this.isInitializing) {
            console.log('⏳ Firebase initialization in progress...');
            return this.readyPromise;
        }

        // Create the ready promise
        this.readyPromise = new Promise((resolve, reject) => {
            this.readyResolve = resolve;
            this.readyReject = reject;
        });

        this.isInitializing = true;
        this.initAttempts++;

        try {
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }

            // Check if already initialized
            if (firebase.apps && firebase.apps.length > 0) {
                this.firebaseApp = firebase.apps[0];
                this.initialized = true;
                this.isInitializing = false;
                this._isReady = true;
                console.log('✅ Using existing Firebase app');
                this.applyFirestoreSettings();
                if (this.readyResolve) this.readyResolve(this.firebaseApp);
                return this.readyPromise;
            }

            // Initialize Firebase
            this.firebaseApp = firebase.initializeApp(firebaseConfig);
            this.initialized = true;
            this.isInitializing = false;
            this._isReady = true;
            console.log('✅ Firebase initialized successfully');

            this.applyFirestoreSettings();

            if (this.readyResolve) this.readyResolve(this.firebaseApp);

            return this.readyPromise;

        } catch (e) {
            this.isInitializing = false;
            console.warn('⚠️ Firebase initialization failed:', e.message);

            if (this.initAttempts < this.maxAttempts) {
                console.log(`🔄 Retrying Firebase init (attempt ${this.initAttempts + 1}/${this.maxAttempts})...`);
                setTimeout(() => {
                    this.init();
                }, 1000);
            } else {
                if (this.readyReject) this.readyReject(e);
                console.error('❌ Firebase initialization failed after', this.maxAttempts, 'attempts');
            }
            return this.readyPromise;
        }
    },

    applyFirestoreSettings: function() {
        if (!this.firebaseApp || this._settingsApplied) return;

        try {
            const db = this.firebaseApp.firestore();
            
            try {
                db.settings({
                    cacheSettings: {
                        localCache: {
                            kind: 'persistent',
                            tabManager: {
                                kind: 'synchronize',
                                cacheSize: 104857600
                            }
                        }
                    }
                });
                console.log('✅ Firestore cache settings applied');
                this._settingsApplied = true;
            } catch (settingsError) {
                console.warn('⚠️ Firestore cache settings not supported:', settingsError.message);
                try {
                    db.settings({});
                    console.log('✅ Firestore default settings applied');
                    this._settingsApplied = true;
                } catch (fallbackError) {
                    console.warn('⚠️ Firestore settings fallback failed:', fallbackError.message);
                }
            }
            
            this.firestoreInstance = db;
        } catch (err) {
            console.warn('⚠️ Firestore settings failed:', err.message);
            try {
                const db = this.firebaseApp.firestore();
                this.firestoreInstance = db;
                console.log('⚠️ Firestore using default settings');
            } catch (e) {
                console.warn('⚠️ Firestore fallback failed:', e.message);
            }
        }
    },

    getFirestore: function() {
        if (!this.firebaseApp) {
            this.init();
            return null;
        }

        try {
            if (!this.firestoreInstance) {
                this.firestoreInstance = this.firebaseApp.firestore();
                if (!this._settingsApplied) {
                    this.applyFirestoreSettings();
                }
            }
            return this.firestoreInstance;
        } catch (e) {
            console.warn('⚠️ Firestore not available:', e.message);
            return null;
        }
    },

    getAuth: function() {
        if (!this.firebaseApp) {
            this.init();
            return null;
        }

        try {
            if (!this.authInstance) {
                this.authInstance = this.firebaseApp.auth();
            }
            return this.authInstance;
        } catch (e) {
            console.warn('⚠️ Auth not available:', e.message);
            return null;
        }
    },

    isReady: function() {
        return this.initialized && this.firebaseApp !== null && this._isReady;
    },

    waitForReady: function() {
        if (this.isReady()) {
            return Promise.resolve(this.firebaseApp);
        }
        if (this.readyPromise) {
            return this.readyPromise;
        }
        return this.init();
    },

    reset: function() {
        this.initialized = false;
        this.firebaseApp = null;
        this.firestoreInstance = null;
        this.authInstance = null;
        this.initAttempts = 0;
        this.isInitializing = false;
        this._isReady = false;
        this._settingsApplied = false;
        this.readyPromise = null;
        this.readyResolve = null;
        this.readyReject = null;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    FirebaseManager.init();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    FirebaseManager.init();
}

window.FirebaseManager = FirebaseManager;
window.isFirebaseReady = function() { return FirebaseManager.isReady(); };
window.getFirebase = function() { return FirebaseManager.firebaseApp; };
window.getFirestore = function() { return FirebaseManager.getFirestore(); };
window.getAuth = function() { return FirebaseManager.getAuth(); };
window.waitForFirebase = function() { return FirebaseManager.waitForReady(); };

console.log('🔧 Firebase config loaded');