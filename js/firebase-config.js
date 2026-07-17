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
            console.log('✅ Firebase initialized successfully');
        }
        
        // Enable offline persistence with proper error handling
        firebase.firestore().enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.log('✅ Firebase persistence enabled');
            })
            .catch(err => {
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Firebase persistence: multiple tabs open, persistence disabled');
                } else if (err.code === 'unimplemented') {
                    console.warn('⚠️ Firebase persistence not supported in this browser');
                } else {
                    console.warn('⚠️ Firebase persistence error:', err.message);
                }
            });

        // Initialize Firestore with settings
        const db = firebase.firestore();
        
        // Set Firestore settings for better performance
        db.settings({
            merge: true,
            ignoreUndefinedProperties: true
        });

        console.log('✅ Firestore collections ready:');
        console.log('   📁 users/{uid}/appointments - Appointment data');
        console.log('   📁 users/{uid}/scripts - Script data');
        console.log('   📁 users/{uid}/tasks - Task data');
        console.log('   📁 users/{uid}/teamMembers - Team member data');
    } else {
        console.warn('⚠️ Firebase SDK not loaded');
    }
} catch (e) {
    console.warn('⚠️ Firebase initialization failed:', e.message);
}

// Export Firestore for use in app.js
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;

// ================================================================
// FIRESTORE COLLECTION STRUCTURE REFERENCE
// ================================================================

/*
 * users/{uid}/appointments/{appointmentId}
 *   - id: string
 *   - business: string
 *   - contactName: string
 *   - role: string
 *   - phone: string
 *   - email: string
 *   - time: string
 *   - notes: string
 *   - assigned: string
 *   - status: string (Hot Transfer, Warm Callback, Completed, Pending, Canceled, Meeting Booked, Rescheduled, Overdue, Held)
 *   - primaryStatus: string (Completed, Warm Callback, Pending, Canceled, Rescheduled, Overdue, Held)
 *   - crmLink: string
 *   - tags: array
 *   - date: string (YYYY-MM-DD)
 *   - createdAt: timestamp
 *
 * users/{uid}/scripts/{scriptId}
 *   - name: string
 *   - content: string
 *   - version: number
 *   - createdAt: timestamp
 *
 * users/{uid}/tasks/{taskId}
 *   - id: string
 *   - description: string
 *   - dueDate: string
 *   - priority: string (high, medium, low)
 *   - appointmentId: string (optional)
 *   - completed: boolean
 *   - createdAt: timestamp
 *
 * users/{uid}/teamMembers/{memberId}
 *   - id: string
 *   - name: string
 *   - role: string
 *   - email: string
 *   - phone: string
 *   - avatar: string (emoji)
 *   - color: string (hex)
 *   - active: boolean
 *   - createdAt: timestamp
 */