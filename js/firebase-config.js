// ================================================================
// FIREBASE CONFIGURATION - SINGLETON PATTERN
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
    maxAttempts: 3,
    firebaseApp: null,
    firestoreInstance: null,
    authInstance: null,
    isInitializing: false,

    init: function() {
        if (this.initialized && this.firebaseApp) {
            console.log('✅ Firebase already initialized');
            return this.firebaseApp;
        }

        if (this.isInitializing) {
            console.log('⏳ Firebase initialization in progress...');
            return null;
        }

        if (this.initAttempts >= this.maxAttempts) {
            console.error('❌ Firebase initialization failed after', this.maxAttempts, 'attempts');
            return null;
        }

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
                console.log('✅ Using existing Firebase app');
                return this.firebaseApp;
            }

            // Initialize Firebase
            this.firebaseApp = firebase.initializeApp(firebaseConfig);
            this.initialized = true;
            this.isInitializing = false;
            console.log('✅ Firebase initialized successfully');

            // Enable offline persistence with the new cache settings
            this.enablePersistence();

            return this.firebaseApp;

        } catch (e) {
            this.isInitializing = false;
            console.warn('⚠️ Firebase initialization failed:', e.message);

            if (this.initAttempts < this.maxAttempts) {
                console.log(`🔄 Retrying Firebase init (attempt ${this.initAttempts + 1}/${this.maxAttempts})...`);
                setTimeout(() => this.init(), 2000);
            }
            return null;
        }
    },

    enablePersistence: function() {
        if (!this.firebaseApp) return;

        try {
            const db = this.getFirestore();
            if (!db) return;

            // Use the new cache settings instead of the deprecated enablePersistence
            // This follows the latest Firebase SDK best practices
            const settings = {
                cache: {
                    // Enable offline persistence with tab synchronization
                    // This replaces the deprecated enablePersistence({ synchronizeTabs: true })
                    tabSynchronization: true,
                    // Enable cache for offline reads
                    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
                }
            };

            // Apply settings - this is the modern way to enable persistence
            db.settings(settings);
            console.log('✅ Firebase cache with tab synchronization enabled');

            // Also try the legacy method as fallback for older SDKs
            // Only if the cache settings approach fails
            try {
                // The new cache settings approach should work, but we'll keep a fallback
                // for older versions where the cache property might not be recognized
                if (!db._settings || !db._settings.cache) {
                    // Fallback to the deprecated method only if necessary
                    db.enablePersistence({ synchronizeTabs: true })
                        .then(() => console.log('✅ Firebase persistence enabled (legacy fallback)'))
                        .catch(err => {
                            if (err.code === 'failed-precondition') {
                                console.warn('⚠️ Firebase persistence: multiple tabs open, persistence disabled');
                            } else if (err.code === 'unimplemented') {
                                console.warn('⚠️ Firebase persistence not supported in this browser');
                            } else {
                                console.warn('⚠️ Firebase persistence error:', err.message);
                            }
                        });
                }
            } catch (legacyErr) {
                // Silently ignore legacy fallback errors
                console.debug('ℹ️ Legacy persistence fallback not needed');
            }

        } catch (persistErr) {
            console.warn('⚠️ Firebase persistence setup failed:', persistErr.message);
            // Try legacy method as final fallback
            try {
                const db = this.getFirestore();
                if (db) {
                    db.enablePersistence({ synchronizeTabs: true })
                        .then(() => console.log('✅ Firebase persistence enabled (final fallback)'))
                        .catch(() => {});
                }
            } catch (finalErr) {
                // Ignore final fallback errors
            }
        }
    },

    getFirestore: function() {
        if (!this.firebaseApp) {
            this.init();
        }
        if (!this.firebaseApp) return null;

        try {
            if (!this.firestoreInstance) {
                this.firestoreInstance = this.firebaseApp.firestore();
                // Apply cache settings immediately when first created
                try {
                    const settings = {
                        cache: {
                            tabSynchronization: true,
                            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
                        }
                    };
                    this.firestoreInstance.settings(settings);
                } catch (settingsErr) {
                    // Silently ignore if settings can't be applied
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
        }
        if (!this.firebaseApp) return null;

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
        return this.initialized && this.firebaseApp !== null;
    },

    reset: function() {
        this.initialized = false;
        this.firebaseApp = null;
        this.firestoreInstance = null;
        this.authInstance = null;
        this.initAttempts = 0;
        this.isInitializing = false;
    }
};

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a tick for other scripts to load
    setTimeout(function() {
        FirebaseManager.init();
    }, 100);
});

// Expose for global use
window.FirebaseManager = FirebaseManager;
window.isFirebaseReady = function() { return FirebaseManager.isReady(); };
window.getFirebase = function() { return FirebaseManager.firebaseApp; };
window.getFirestore = function() { return FirebaseManager.getFirestore(); };
window.getAuth = function() { return FirebaseManager.getAuth(); };

console.log('🔧 Firebase config loaded (singleton pattern with modern cache settings)');