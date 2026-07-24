// ================================================================
// SCRIPTFLOW PRO - COMPLETE APPLICATION
// ================================================================

// ================================================================
// CONFIGURATION
// ================================================================

const CONFIG = {
    PRIMARY_STATUSES: ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled'],
    SECONDARY_STATUSES: ['Meeting Booked', 'Rescheduled', 'Overdue', 'Held'],
    STATUS_OPTIONS: ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held'],
    STATUS_COLORS: {
        'Hot Transfer': '#dc2626',
        'Warm Callback': '#f59e0b',
        'Completed': '#10b981',
        'Pending': '#94a3b8',
        'Canceled': '#ef4444',
        'Meeting Booked': '#3b82f6',
        'Rescheduled': '#f97316',
        'Overdue': '#8b5cf6',
        'Held': '#06b6d4'
    },
    TAG_OPTIONS: [
        { id: 'qualified_warm_call', name: 'Qualified Warm Call', color: '#10b981' },
        { id: 'unqualified_warm_callback', name: 'Unqualified Warm Callback', color: '#f59e0b' },
        { id: 'vip', name: 'VIP', color: '#3b82f6' },
        { id: 'negligent_warm_callback', name: 'Negligent Warm Callback', color: '#ef4444' }
    ],
    DEFAULT_TEAM_MEMBERS: [
        { id: 'daniel', name: 'Daniel', role: 'Team Lead', email: 'daniel@company.com', phone: '+1-555-0101', avatar: '👨‍💼', color: '#3b82f6', active: true },
        { id: 'sarah', name: 'Sarah', role: 'Senior Agent', email: 'sarah@company.com', phone: '+1-555-0102', avatar: '👩‍💼', color: '#8b5cf6', active: true },
        { id: 'mike', name: 'Mike', role: 'Agent', email: 'mike@company.com', phone: '+1-555-0103', avatar: '👨‍💻', color: '#10b981', active: true },
        { id: 'jessica', name: 'Jessica', role: 'Agent', email: 'jessica@company.com', phone: '+1-555-0104', avatar: '👩‍💻', color: '#f59e0b', active: true },
        { id: 'david', name: 'David', role: 'Junior Agent', email: 'david@company.com', phone: '+1-555-0105', avatar: '👨‍🎓', color: '#ef4444', active: true }
    ],
    FIELD_MAPPINGS: {
        'business': ['business', 'company', 'organization', 'org', 'firm', 'brand', 'store', 'business name', 'company name'],
        'name': ['name', 'client', 'prospect', 'contact', 'customer', 'person', 'full name', 'contact name', 'client name'],
        'role': ['role', 'title', 'position', 'job title', 'designation'],
        'phone': ['phone', 'mobile', 'cell', 'telephone', 'number', 'contact number', 'phone number', 'mobile number', 'phone no'],
        'email': ['email', 'e-mail', 'mail', 'email address', 'e-mail address'],
        'date': ['date', 'appointment date', 'schedule date', 'meeting date', 'call date', 'day', 'best time', 'callback date'],
        'time': ['time', 'appointment time', 'schedule time', 'meeting time', 'call time', 'hour', 'best time', 'callback time'],
        'status': ['status', 'state', 'stage', 'lead status', 'appointment status', 'call status'],
        'notes': ['notes', 'note', 'comment', 'remarks', 'additional notes', 'info', 'details', 'description'],
        'assigned': ['assigned', 'assigned to', 'owner', 'agent', 'representative', 'rep', 'assigned agent']
    },
    DEFAULT_SHORTCUTS: {
        'Smart Import': { keys: ['Ctrl', 'Shift', 'I'], description: 'Open Smart Import modal' },
        'Appointment Calendar': { keys: ['Ctrl', 'Shift', 'C'], description: 'Open Appointment Calendar' },
        'Call Scripts': { keys: ['Ctrl', 'Shift', 'S'], description: 'Open Call Scripts' },
        'Global Search': { keys: ['Ctrl', 'Shift', 'F'], description: 'Open Global Search' },
        'Quick Add Appointment': { keys: ['Ctrl', 'Shift', 'A'], description: 'Quick Add Appointment' },
        'Analytics Hub': { keys: ['Ctrl', 'Shift', 'H'], description: 'Open Analytics Hub' },
        'Keyboard Shortcuts': { keys: ['Ctrl', 'Shift', '?'], description: 'Open Keyboard Shortcuts' },
        'Export to CSV': { keys: ['Ctrl', 'Shift', 'E'], description: 'Export data to CSV' },
        'Toggle Theme': { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle Dark/Light Mode' },
        'Refresh Data': { keys: ['Ctrl', 'Shift', 'R'], description: 'Refresh data from server' },
        'Bulk Actions': { keys: ['Ctrl', 'Shift', 'B'], description: 'Open Bulk Actions' },
        'Close Panel': { keys: ['Escape'], description: 'Close current panel and return to scripts' }
    }
};

// ================================================================
// SMART IMPORT CONFIGURATION
// ================================================================

const SMART_IMPORT_CONFIG = {
    CONFIDENCE: {
        HIGH: 0.8,
        MEDIUM: 0.5,
        LOW: 0.3
    },
    VALIDATION: {
        name: { required: true, minLength: 2, maxLength: 100 },
        business: { required: true, minLength: 2, maxLength: 100 },
        phone: { pattern: /^[\+\d\s\-\(\)]{7,20}$/ },
        email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        time: { pattern: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i },
        status: { allowed: ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held'] }
    },
    FIELD_ALIASES: {
        name: ['name', 'full name', 'contact name', 'client name', 'customer name', 'person name', 'first name', 'last name', 'contact', 'client', 'customer', 'person', 'prospect', 'lead name'],
        business: ['business', 'company', 'organization', 'org', 'firm', 'brand', 'store', 'business name', 'company name', 'organization name', 'account', 'client company'],
        phone: ['phone', 'mobile', 'cell', 'telephone', 'number', 'contact number', 'phone number', 'mobile number', 'phone no', 'cell phone', 'work phone', 'home phone'],
        email: ['email', 'e-mail', 'mail', 'email address', 'e-mail address', 'contact email', 'work email', 'personal email'],
        date: ['date', 'appointment date', 'schedule date', 'meeting date', 'call date', 'day', 'best time', 'callback date', 'scheduled date', 'event date', 'when'],
        time: ['time', 'appointment time', 'schedule time', 'meeting time', 'call time', 'hour', 'callback time', 'scheduled time', 'event time', 'at', 'when'],
        status: ['status', 'state', 'stage', 'lead status', 'appointment status', 'call status', 'phase', 'step'],
        notes: ['notes', 'note', 'comment', 'remarks', 'additional notes', 'info', 'details', 'description', 'summary', 'observation', 'feedback'],
        assigned: ['assigned', 'assigned to', 'owner', 'agent', 'representative', 'rep', 'assigned agent', 'team member', 'handler', 'manager'],
        role: ['role', 'title', 'position', 'job title', 'designation', 'function', 'department']
    }
};

// ================================================================
// APPLICATION STATE
// ================================================================

const AppState = {
    currentUser: null,
    isFirebaseReady: false,
    authInProgress: false,
    authModalOpen: false,

    appointments: {},
    scripts: {},
    scriptOrder: [],
    scriptFavorites: [],
    tasks: [],
    teamMembers: [],
    goals: { daily: 3, weekly: 15, monthly: 60 },

    currentScriptId: 'opening',
    isEditing: false,
    searchTerm: '',
    currentEditContent: '',
    toolsOpen: false,
    currentView: 'calendar',
    calendarView: 'calendar',
    analyticsTab: 'insights',
    taskFilter: 'all',
    selectedAppointments: new Set(),
    currentAppointmentId: null,
    selectedCalDate: null,
    currentCalDate: null,

    dateFilter: 'today',
    customStartDate: null,
    customEndDate: null,

    appointmentsUnsubscribe: null,
    tasksUnsubscribe: null,
    teamMembersUnsubscribe: null,

    chartInstances: {},

    shortcuts: {},
    customShortcuts: {},

    parsedImportData: {},
    importConfidence: {},

    isLoading: false,
    isRefreshing: false,
    shortcutsEnabled: true,
    
    calendarViewMode: 'month',
    calendarFilters: {
        meetings: true,
        callbacks: true,
        followups: true
    },
    calendarTimezone: 'Central CDT',
    calendarSearchTerm: '',
    calendarCurrentDate: new Date(),
    
    // Script Coach state
    coachIsAnalyzing: false,
    coachIsPlaying: false,
    coachIsPaused: false,
    coachAnalysisResults: null,
    coachAnalysisComplete: false,
    coachPlaybackSpeed: 1.0,
    coachCurrentWordIndex: 0,
    coachWords: [],
    coachWordTimings: [],
    coachPlaybackInterval: null,
    coachAudioContext: null,
    coachCurrentSection: 0,
    coachIsLooping: false,
    coachLoopStart: 0,
    coachIsRecording: false,
    coachMediaRecorder: null,
    coachRecordedChunks: [],
    coachFocusMode: true,
    coachShowCues: true,
    coachProgress: 0,
    coachTotalDuration: 0,
    coachCurrentTime: 0,
    coachIsDragging: false,
    coachActiveLineIndex: -1,
    coachLines: [],
    coachSectionMarkers: []
};

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

const Utils = {
    generateId() {
        return Date.now().toString() + '_' + Math.random().toString(36).substring(2, 11);
    },

    getTodayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },

    formatDate(dateStr) {
        if (!dateStr) return 'No date';
        let d;
        if (typeof dateStr === 'object' && dateStr.seconds !== undefined) {
            d = new Date(dateStr.seconds * 1000);
        } else if (typeof dateStr.toDate === 'function') {
            d = dateStr.toDate();
        } else if (typeof dateStr === 'string') {
            d = new Date(dateStr.replace(/-/g, '/'));
        } else {
            d = new Date(dateStr);
        }
        if (isNaN(d.getTime())) return 'No date';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    formatDateForCompare(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    escapeHtml(s) {
        if (!s) return '';
        return String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    },

    getStatus(appt) {
        if (!appt || !appt.status) return 'Pending';
        return appt.status;
    },

    getStatusClass(status) {
        const map = {
            'Hot Transfer': 'status-hot-transfer-sm',
            'Warm Callback': 'status-warm-callback-sm',
            'Completed': 'status-completed-sm',
            'Pending': 'status-pending-sm',
            'Canceled': 'status-canceled-sm',
            'Meeting Booked': 'status-meeting-booked-sm',
            'Rescheduled': 'status-rescheduled-sm',
            'Overdue': 'status-overdue-sm',
            'Held': 'status-held-sm'
        };
        return map[status] || 'status-pending-sm';
    },

    getScoreColor(score) {
        if (score >= 70) return 'score-hot';
        if (score >= 40) return 'score-warm';
        return 'score-cold';
    },

    getPrimaryStatus(status) {
        if (CONFIG.PRIMARY_STATUSES.includes(status)) {
            return status;
        }
        if (CONFIG.SECONDARY_STATUSES.includes(status)) {
            return 'Completed';
        }
        return 'Pending';
    },

    getStatusColor(status) {
        return CONFIG.STATUS_COLORS[status] || '#94a3b8';
    },

    calculateLeadScore(appt) {
        let score = 0;
        const status = Utils.getStatus(appt);
        const primaryStatus = Utils.getPrimaryStatus(status);

        if (primaryStatus === 'Hot Transfer') score += 50;
        else if (primaryStatus === 'Completed') score += 40;
        else if (primaryStatus === 'Warm Callback') score += 30;
        else if (primaryStatus === 'Pending') score += 10;
        else if (primaryStatus === 'Canceled') score -= 20;

        if (status === 'Meeting Booked') score += 15;
        if (status === 'Held') score += 10;
        if (status === 'Rescheduled') score += 5;

        if (appt.tags) {
            if (appt.tags.includes('vip')) score += 20;
            if (appt.tags.includes('qualified_warm_call')) score += 15;
            if (appt.tags.includes('negligent_warm_callback')) score -= 10;
        }
        if (appt.notes && appt.notes.length > 10) score += 5;
        if (appt.phone) score += 5;
        return Math.max(0, Math.min(100, score));
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    checkShortcutConflict(newKeys, excludeAction, shortcuts) {
        const conflicts = [];
        for (const [action, shortcut] of Object.entries(shortcuts)) {
            if (action === excludeAction) continue;
            if (shortcut.keys && shortcut.keys.length === newKeys.length) {
                const sorted1 = [...shortcut.keys].sort();
                const sorted2 = [...newKeys].sort();
                if (sorted1.every((k, i) => k === sorted2[i])) {
                    conflicts.push(action);
                }
            }
        }
        return conflicts;
    },

    getOrderedVisible(scripts, scriptOrder) {
        if (scriptOrder && scriptOrder.length > 0) {
            return scriptOrder.filter(id => scripts && scripts[id]);
        }
        return Object.keys(scripts || {});
    },

    parseDateString(dateStr) {
        if (!dateStr) return null;
        try {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
            const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const match = dateStr.match(/(\w+)\s+(\w+)\s+(\d{1,2})(?:,\s*(\d{4}))?/i);
            if (match) {
                const dayName = match[1];
                const monthName = match[2];
                const day = parseInt(match[3]);
                const year = match[4] ? parseInt(match[4]) : new Date().getFullYear();
                
                let monthIndex = months.indexOf(monthName);
                if (monthIndex === -1) {
                    monthIndex = monthAbbr.indexOf(monthName.substring(0, 3));
                }
                if (monthIndex !== -1) {
                    const date = new Date(year, monthIndex, day);
                    if (!isNaN(date.getTime())) {
                        return Utils.formatDateForCompare(date);
                    }
                }
            }
            
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                return Utils.formatDateForCompare(d);
            }
            return null;
        } catch (e) {
            return null;
        }
    }
};

// ================================================================
// DOM HELPERS
// ================================================================

const DOM = {
    get(id) { return document.getElementById(id); },

    setText(id, text) {
        const el = this.get(id);
        if (el) el.textContent = text;
    },

    setHTML(id, html) {
        const el = this.get(id);
        if (el) el.innerHTML = html;
    },

    show(id) {
        const el = this.get(id);
        if (el) el.style.display = 'block';
    },

    hide(id) {
        const el = this.get(id);
        if (el) el.style.display = 'none';
    },

    toggle(id) {
        const el = this.get(id);
        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
    },

    createElement(tag, className, html) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (html) el.innerHTML = html;
        return el;
    }
};

// ================================================================
// TOAST NOTIFICATIONS
// ================================================================

function showToast(message, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'info' ? 'info' : ''}`;
    const icons = { success: '✓', error: '⚠️', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `${icons[type] || '✓'} ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ================================================================
// COPY TO CLIPBOARD
// ================================================================

function copyToClipboard(text) {
    if (!text) { showToast('Nothing to copy', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => showToast('Copied!')).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied!');
    });
}

// ================================================================
// ERROR HANDLING
// ================================================================

function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    let message = 'An error occurred. Please try again.';
    if (error.code === 'auth/network-request-failed') {
        message = 'Network connection lost. Please check your internet connection.';
    } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please wait a moment and try again.';
    } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign in cancelled.';
    } else if (error.message) {
        message = error.message;
    }
    showToast(message, 'error');
    return { success: false, message };
}

// ================================================================
// LOADING SCREEN
// ================================================================

function updateLoadingProgress(percent, message = '') {
    const bar = document.getElementById('loadingProgress');
    const percentDisplay = document.getElementById('loadingPercent');
    const subtitle = document.querySelector('.loading-subtitle');
    
    if (bar) {
        bar.style.width = Math.min(percent, 100) + '%';
    }
    if (percentDisplay) {
        percentDisplay.textContent = Math.min(percent, 100) + '%';
    }
    if (subtitle && message) {
        subtitle.textContent = message;
    }
}

function hideLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    const appWrapper = document.getElementById('appWrapper');
    
    if (screen) {
        screen.classList.add('hidden');
        setTimeout(() => {
            screen.style.display = 'none';
        }, 600);
    }
    if (appWrapper) {
        appWrapper.style.display = 'flex';
    }
}

// ================================================================
// AUTHENTICATION
// ================================================================

const Auth = {
    signInWithGoogle: async function() {
        if (AppState.authInProgress || !AppState.isFirebaseReady) return false;
        AppState.authInProgress = true;
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await firebase.auth().signInWithPopup(provider);
            if (result.user) {
                AppState.currentUser = result.user;
                this.updateUI();
                await Data.loadUserData();
                showToast('Welcome back! 👋', 'success');
                this.closeModal();
                AppState.authInProgress = false;
                return true;
            }
        } catch (error) {
            AppState.authInProgress = false;
            if (error.code === 'auth/popup-closed-by-user') {
                showToast('Sign in cancelled', 'info');
            } else {
                handleError(error, 'Google Sign-In');
            }
            return false;
        }
    },

    signUp: async function(email, password, username) {
        if (AppState.authInProgress || !AppState.isFirebaseReady) return false;
        AppState.authInProgress = true;
        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            if (result.user) {
                await result.user.updateProfile({ displayName: username });
                await firebase.firestore().collection('users').doc(result.user.uid).set({
                    uid: result.user.uid,
                    email: email,
                    username: username,
                    displayName: username,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    goals: { daily: 3, weekly: 15, monthly: 60 },
                    scriptOrder: ['opening']
                });
                showToast('Account created! 🎉', 'success');
                AppState.currentUser = result.user;
                this.updateUI();
                await Data.loadUserData();
                this.closeModal();
                AppState.authInProgress = false;
                return true;
            }
        } catch (error) {
            AppState.authInProgress = false;
            handleError(error, 'Sign Up');
            return false;
        }
    },

    signIn: async function(email, password) {
        if (AppState.authInProgress || !AppState.isFirebaseReady) return false;
        AppState.authInProgress = true;
        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            if (result.user) {
                AppState.currentUser = result.user;
                this.updateUI();
                await Data.loadUserData();
                showToast('Welcome back! 👋', 'success');
                this.closeModal();
                AppState.authInProgress = false;
                return true;
            }
        } catch (error) {
            AppState.authInProgress = false;
            handleError(error, 'Sign In');
            return false;
        }
    },

    signOut: async function() {
        try {
            if (AppState.appointmentsUnsubscribe) {
                AppState.appointmentsUnsubscribe();
                AppState.appointmentsUnsubscribe = null;
            }
            if (AppState.tasksUnsubscribe) {
                AppState.tasksUnsubscribe();
                AppState.tasksUnsubscribe = null;
            }
            if (AppState.teamMembersUnsubscribe) {
                AppState.teamMembersUnsubscribe();
                AppState.teamMembersUnsubscribe = null;
            }
            
            AppState.currentUser = null;
            AppState.appointments = {};
            AppState.tasks = [];
            AppState.scripts = {};
            AppState.scriptOrder = [];
            AppState.teamMembers = [];
            
            this.updateUI();
            Stats.updateAll();
            Scripts.renderSidebar();
            
            if (AppState.isFirebaseReady) {
                await firebase.auth().signOut();
            }
            
            showToast('Signed out successfully', 'info');
            setTimeout(() => this.showModal(), 300);
        } catch (error) {
            handleError(error, 'Sign Out');
        }
    },

    updateUI: function() {
        const container = DOM.get('userInfo');
        if (!container) return;
        if (!AppState.currentUser) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'block';
        DOM.setText('userEmail', AppState.currentUser.email || '');
    },

    showModal: function() {
        if (AppState.authModalOpen) return;
        AppState.authModalOpen = true;

        const existing = DOM.get('authModal');
        if (existing) existing.remove();

        const modal = DOM.createElement('div', 'modal-overlay');
        modal.id = 'authModal';
        modal.innerHTML = `
            <div class="modal-card" style="max-width: 420px;">
                <h2 style="text-align:center; margin-bottom:20px;">
                    <i class="fas fa-microphone-alt" style="color:var(--primary);"></i>
                    ScriptFlow Pro
                </h2>
                <p style="text-align:center; color:var(--text-muted); margin-bottom:20px; font-size:0.9rem;">
                    Sign in to manage and hand off your leads
                </p>
                ${AppState.isFirebaseReady ? `
                    <button id="googleSignInBtn" class="btn-icon" style="width:100%; justify-content:center; background:#ffffff; color:#333; border:1px solid #dadce0; margin-bottom:16px; padding:10px;">
                        <svg style="width:18px; height:18px; margin-right:8px;" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        <span style="font-weight:500;">Sign in with Google</span>
                    </button>
                    <div class="auth-divider">or continue with email</div>
                ` : `
                    <div style="padding:16px; background:var(--warning); border-radius:12px; margin-bottom:16px; color:#1e293b;">
                        ⚠️ Offline Mode - Firebase connection unavailable
                    </div>
                `}
                <div id="authFormContainer">
                    <div style="display:flex; gap:8px; margin-bottom:20px;">
                        <button id="loginTabBtn" class="view-btn active" style="flex:1; justify-content:center;">Sign In</button>
                        <button id="signupTabBtn" class="view-btn" style="flex:1; justify-content:center;">Sign Up</button>
                    </div>
                    <div id="loginForm">
                        <div class="form-group"><label>Email</label><input type="email" id="loginEmailInput" placeholder="you@example.com" /></div>
                        <div class="form-group"><label>Password</label><input type="password" id="loginPasswordInput" placeholder="••••••••" /></div>
                        <button id="loginBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--primary); color:white;" ${!AppState.isFirebaseReady ? 'disabled' : ''}><i class="fas fa-sign-in-alt"></i> Sign In</button>
                    </div>
                    <div id="signupForm" style="display:none;">
                        <div class="form-group"><label>Username</label><input type="text" id="signupUsernameInput" placeholder="Choose a username" /></div>
                        <div class="form-group"><label>Email</label><input type="email" id="signupEmailInput" placeholder="you@example.com" /></div>
                        <div class="form-group"><label>Password</label><input type="password" id="signupPasswordInput" placeholder="•••••••• (min 6 chars)" /></div>
                        <button id="signupBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--success); color:white;" ${!AppState.isFirebaseReady ? 'disabled' : ''}><i class="fas fa-user-plus"></i> Create Account</button>
                    </div>
                </div>
                <div style="margin-top:16px; text-align:center; font-size:0.8rem; color:var(--text-muted);">🔒 Secure Cloud Data Integration</div>
            </div>
        `;
        document.body.appendChild(modal);

        if (AppState.isFirebaseReady) {
            const googleBtn = DOM.get('googleSignInBtn');
            const loginTab = DOM.get('loginTabBtn');
            const signupTab = DOM.get('signupTabBtn');
            const loginBtn = DOM.get('loginBtn');
            const signupBtn = DOM.get('signupBtn');

            if (googleBtn) googleBtn.addEventListener('click', (e) => { e.preventDefault(); this.signInWithGoogle(); });
            if (loginTab) loginTab.addEventListener('click', () => {
                loginTab.classList.add('active');
                if (signupTab) signupTab.classList.remove('active');
                const loginForm = DOM.get('loginForm');
                const signupForm = DOM.get('signupForm');
                if (loginForm) loginForm.style.display = 'block';
                if (signupForm) signupForm.style.display = 'none';
            });
            if (signupTab) signupTab.addEventListener('click', () => {
                signupTab.classList.add('active');
                if (loginTab) loginTab.classList.remove('active');
                const loginForm = DOM.get('loginForm');
                const signupForm = DOM.get('signupForm');
                if (loginForm) loginForm.style.display = 'none';
                if (signupForm) signupForm.style.display = 'block';
            });
            if (loginBtn) loginBtn.addEventListener('click', async () => {
                const email = DOM.get('loginEmailInput')?.value;
                const password = DOM.get('loginPasswordInput')?.value;
                if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
                await this.signIn(email, password);
            });
            if (signupBtn) signupBtn.addEventListener('click', async () => {
                const username = DOM.get('signupUsernameInput')?.value;
                const email = DOM.get('signupEmailInput')?.value;
                const password = DOM.get('signupPasswordInput')?.value;
                if (!username || !email || !password) { showToast('Please fill in all fields', 'error'); return; }
                if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
                await this.signUp(email, password, username);
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    },

    closeModal: function() {
        const modal = DOM.get('authModal');
        if (modal) modal.remove();
        AppState.authModalOpen = false;
    }
};

// ================================================================
// DATA LAYER
// ================================================================

const Data = {
    loadUserData: async function(showLoading = true) {
        if (!AppState.currentUser) {
            const localData = localStorage.getItem('userData_fallback');
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    AppState.scripts = data.scripts || {};
                    AppState.scriptOrder = data.scriptOrder || [];
                    AppState.appointments = data.appointments || {};
                    AppState.tasks = data.tasks || {};
                    AppState.teamMembers = data.teamMembers || CONFIG.DEFAULT_TEAM_MEMBERS;
                    showToast('Loaded offline data', 'info');
                    Stats.updateAll();
                    Scripts.renderSidebar();
                    Scripts.loadScript('opening');
                    return;
                } catch (e) {
                    console.warn('Failed to load offline data:', e);
                }
            }
            return;
        }

        if (!AppState.isFirebaseReady) {
            showToast('Firebase unavailable - using offline mode', 'warning');
            return;
        }

        try {
            const statusEl = DOM.get('saveStatus');
            if (statusEl && showLoading) statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

            const db = firebase.firestore();
            const userRef = db.collection('users').doc(AppState.currentUser.uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            
            if (!userData) {
                await userRef.set({
                    uid: AppState.currentUser.uid,
                    email: AppState.currentUser.email,
                    username: AppState.currentUser.displayName || AppState.currentUser.email,
                    displayName: AppState.currentUser.displayName || AppState.currentUser.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    goals: { daily: 3, weekly: 15, monthly: 60 },
                    scriptOrder: ['opening']
                });
                return this.loadUserData();
            }
            
            if (userData.goals) {
                AppState.goals = {
                    daily: userData.goals.daily || 3,
                    weekly: userData.goals.weekly || 15,
                    monthly: userData.goals.monthly || 60
                };
            }
            AppState.scriptOrder = userData.scriptOrder || [];

            this.subscribeToChanges();

            const scriptsSnapshot = await userRef.collection('scripts').get();
            AppState.scripts = {};
            scriptsSnapshot.forEach(doc => {
                const data = doc.data();
                AppState.scripts[doc.id] = { name: data.name, content: data.content, version: data.version || 1 };
            });
            
            if (Object.keys(AppState.scripts).length === 0) {
                await this.createDefaultScripts();
                return this.loadUserData();
            }

            const teamSnapshot = await userRef.collection('teamMembers').get();
            if (!teamSnapshot.empty) {
                AppState.teamMembers = [];
                teamSnapshot.forEach(doc => {
                    AppState.teamMembers.push({ ...doc.data(), id: doc.id });
                });
            }

            localStorage.setItem('userData_fallback', JSON.stringify({
                scripts: AppState.scripts,
                scriptOrder: AppState.scriptOrder,
                appointments: AppState.appointments,
                tasks: AppState.tasks,
                teamMembers: AppState.teamMembers
            }));

            Stats.updateAll();
            Scripts.renderSidebar();
            Scripts.loadScript('opening');
            Auth.closeModal();
            if (statusEl) statusEl.innerHTML = '<i class="fas fa-check"></i> Synced';
        } catch (error) {
            console.error('Data Load Error:', error);
            handleError(error, 'Loading Data');
        }
    },

    subscribeToChanges: function() {
        if (!AppState.currentUser || !AppState.isFirebaseReady) return;
        if (AppState.appointmentsUnsubscribe) AppState.appointmentsUnsubscribe();
        if (AppState.tasksUnsubscribe) AppState.tasksUnsubscribe();
        if (AppState.teamMembersUnsubscribe) AppState.teamMembersUnsubscribe();

        try {
            const db = firebase.firestore();
            const userRef = db.collection('users').doc(AppState.currentUser.uid);

            AppState.appointmentsUnsubscribe = userRef.collection('appointments').orderBy('createdAt', 'desc').onSnapshot(snap => {
                AppState.appointments = {};
                snap.forEach(doc => {
                    const appt = doc.data();
                    if (!AppState.appointments[appt.date]) {
                        AppState.appointments[appt.date] = { count: 0, note: '', reports: [] };
                    }
                    AppState.appointments[appt.date].reports.push({ ...appt, id: doc.id });
                    AppState.appointments[appt.date].count = AppState.appointments[appt.date].reports.length;
                });
                Stats.updateAll();
                FeaturePanel.refreshCurrentView();
                localStorage.setItem('appointments_fallback', JSON.stringify(AppState.appointments));
            }, error => {
                console.warn('Appointments subscription error:', error);
            });

            AppState.tasksUnsubscribe = userRef.collection('tasks').orderBy('createdAt', 'desc').onSnapshot(snap => {
                AppState.tasks = [];
                snap.forEach(doc => AppState.tasks.push({ ...doc.data(), id: doc.id }));
                Stats.updateTaskStats();
                FeaturePanel.refreshCurrentView();
                localStorage.setItem('tasks_fallback', JSON.stringify(AppState.tasks));
            }, error => {
                console.warn('Tasks subscription error:', error);
            });

            AppState.teamMembersUnsubscribe = userRef.collection('teamMembers').onSnapshot(snap => {
                if (snap.empty) {
                    AppState.teamMembers = CONFIG.DEFAULT_TEAM_MEMBERS;
                    AppState.teamMembers.forEach(member => {
                        userRef.collection('teamMembers').doc(member.id).set(member);
                    });
                } else {
                    AppState.teamMembers = [];
                    snap.forEach(doc => {
                        AppState.teamMembers.push({ ...doc.data(), id: doc.id });
                    });
                }
                localStorage.setItem('teamMembers_fallback', JSON.stringify(AppState.teamMembers));
            }, error => {
                console.warn('Team members subscription error:', error);
            });
        } catch (error) {
            console.warn('Subscription error:', error);
            const appointmentsLocal = localStorage.getItem('appointments_fallback');
            const tasksLocal = localStorage.getItem('tasks_fallback');
            const teamLocal = localStorage.getItem('teamMembers_fallback');
            
            if (appointmentsLocal) {
                try {
                    AppState.appointments = JSON.parse(appointmentsLocal);
                    Stats.updateAll();
                    FeaturePanel.refreshCurrentView();
                } catch (e) {}
            }
            if (tasksLocal) {
                try {
                    AppState.tasks = JSON.parse(tasksLocal);
                    Stats.updateTaskStats();
                    FeaturePanel.refreshCurrentView();
                } catch (e) {}
            }
            if (teamLocal) {
                try {
                    AppState.teamMembers = JSON.parse(teamLocal);
                } catch (e) {}
            }
        }
    },

    createDefaultScripts: async function() {
        if (!AppState.currentUser || !AppState.isFirebaseReady) return;
        const defaultScripts = {
            "opening": { name: "🎯 Opening Script", content: '"Hey, is this [Company Name]?"\n\n"Awesome — this is Flynn. We created a free, modern preview version inspired by your current site. There\'s no cost or obligation. Would you be open to taking a quick look later today and sharing your thoughts?"' },
            "owner_yes": { name: "👑 Owner - Yes", content: "Perfect! Daniel will call you shortly to showcase your preview concept. Is this the best number to connect with you?" },
            "owner_no": { name: "🤤 Not Owner", content: "No worries! Who usually drives your design or advertising decisions? What is the best coordinate to reach them today?" },
            "objection_website": { name: "💻 Objection - Website", content: "I completely understand your concern about the website. Our preview is designed to show you what's possible without any commitment." },
            "objection_cost": { name: "💰 Objection - Cost", content: "Great question about pricing. The preview is completely free—there's no cost or obligation. We believe in showing value first." },
            "closing": { name: "🤝 Closing Script", content: "Thank you for your time today! I'll have our team prepare the preview and reach out with next steps." }
        };
        const batch = firebase.firestore().batch();
        const ref = firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts');
        for (const [id, script] of Object.entries(defaultScripts)) {
            batch.set(ref.doc(id), {
                name: script.name,
                content: script.content,
                version: 1,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        await batch.commit();
    },

    saveScriptOrder: async function() {
        if (!AppState.currentUser || !AppState.isFirebaseReady) return;
        try {
            await firebase.firestore().collection('users').doc(AppState.currentUser.uid).update({ scriptOrder: AppState.scriptOrder });
        } catch (error) {
            console.error('Error saving script order:', error);
        }
    },

    addAppointment: function(dateStr, business, contactName, role, phone, time, notes, assigned, editId = null, status = 'Pending', crmLink = '', tags = []) {
        if (!AppState.currentUser) { showToast('Please sign in first', 'error'); return null; }
        if (!AppState.appointments[dateStr]) {
            AppState.appointments[dateStr] = { count: 0, note: '', reports: [] };
        }
        if (!CONFIG.STATUS_OPTIONS.includes(status)) status = 'Pending';
        
        const newAppt = {
            id: editId || Utils.generateId(),
            business: business || 'Unknown Business',
            contactName: contactName || 'Unknown Contact',
            role: role || 'Owner',
            phone: phone || '',
            time: time || '',
            notes: notes || '',
            assigned: assigned || 'Daniel',
            status: status,
            crmLink: crmLink || '',
            tags: tags || [],
            date: dateStr,
            email: '',
            createdAt: new Date().toISOString()
        };
        
        if (notes && notes.includes('Email:')) {
            const emailMatch = notes.match(/Email:\s*([^\s\n]+)/);
            if (emailMatch) {
                newAppt.email = emailMatch[1];
            }
        }
        
        this.syncAppointment(newAppt);
        return newAppt;
    },

    syncAppointment: async function(appointment) {
        if (!AppState.currentUser) return;
        if (AppState.isFirebaseReady) {
            try {
                await firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('appointments').doc(appointment.id.toString()).set(appointment, { merge: true });
            } catch (e) {
                console.error('Error syncing appointment:', e);
                this.saveAppointmentsToLocal();
            }
        } else {
            this.saveAppointmentsToLocal();
        }
    },

    saveAppointmentsToLocal: function() {
        try {
            localStorage.setItem('appointments_fallback', JSON.stringify(AppState.appointments));
        } catch (e) {
            console.warn('Failed to save appointments locally:', e);
        }
    },

    deleteAppointment: function(dateStr, id) {
        if (AppState.appointments[dateStr]?.reports) {
            AppState.appointments[dateStr].reports = AppState.appointments[dateStr].reports.filter(r => r.id !== id);
            if (AppState.appointments[dateStr].reports.length === 0) delete AppState.appointments[dateStr];
            if (AppState.isFirebaseReady && AppState.currentUser) {
                firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('appointments').doc(id.toString()).delete().catch(e => console.warn('Delete error:', e));
            }
            this.saveAppointmentsToLocal();
            Stats.updateAll();
            FeaturePanel.refreshCurrentView();
            return true;
        }
        return false;
    },

    updateAppointment: function(dateStr, id, updates) {
        const appt = AppState.appointments[dateStr]?.reports?.find(r => r.id === id);
        if (!appt) return false;
        Object.assign(appt, updates);
        this.syncAppointment(appt);
        Stats.updateAll();
        FeaturePanel.refreshCurrentView();
        return true;
    },

    getAppointmentById: function(id) {
        for (let date in AppState.appointments) {
            if (AppState.appointments[date].reports) {
                const found = AppState.appointments[date].reports.find(r => r.id === id);
                if (found) return found;
            }
        }
        return null;
    },

    addTask: function(description, dueDate, priority = 'medium', appointmentId = null) {
        if (!AppState.currentUser) return;
        const task = {
            id: Utils.generateId(),
            description: description || 'New task',
            dueDate: dueDate || '',
            priority: priority || 'medium',
            appointmentId: appointmentId || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(task.id).set(task).catch(e => console.warn('Task save error:', e));
        }
        AppState.tasks.push(task);
        localStorage.setItem('tasks_fallback', JSON.stringify(AppState.tasks));
        Stats.updateTaskStats();
        FeaturePanel.refreshCurrentView();
    },

    toggleTaskComplete: function(id) {
        const task = AppState.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (AppState.isFirebaseReady && AppState.currentUser) {
                firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(id).update({ completed: task.completed }).catch(e => console.warn('Task update error:', e));
            }
            localStorage.setItem('tasks_fallback', JSON.stringify(AppState.tasks));
            Stats.updateTaskStats();
            FeaturePanel.refreshCurrentView();
        }
    },

    deleteTask: function(id) {
        AppState.tasks = AppState.tasks.filter(t => t.id !== id);
        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(id).delete().catch(e => console.warn('Task delete error:', e));
        }
        localStorage.setItem('tasks_fallback', JSON.stringify(AppState.tasks));
        Stats.updateTaskStats();
        FeaturePanel.refreshCurrentView();
    },

    exportToCSV: function(selectedIds = null) {
        let csv = 'Business,Contact,Phone,Email,Date,Time,Status,PrimaryStatus,Notes,Assigned\n';
        const appointments = selectedIds ? this.getSelectedAppointments(selectedIds) : this.getAllAppointments();

        appointments.forEach(appt => {
            const status = Utils.getStatus(appt);
            const primaryStatus = Utils.getPrimaryStatus(status);
            csv += `"${appt.business || ''}","${appt.contactName || ''}","${appt.phone || ''}","${appt.email || ''}","${appt.date || ''}","${appt.time || ''}","${status}","${primaryStatus}","${appt.notes || ''}","${appt.assigned || 'Daniel'}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments_${Utils.getTodayStr()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('CSV exported!', 'success');
    },

    getSelectedAppointments: function(ids) {
        const result = [];
        ids.forEach(id => {
            const appt = this.getAppointmentById(id);
            if (appt) result.push(appt);
        });
        return result;
    },

    getAllAppointments: function() {
        const result = [];
        for (let date in AppState.appointments) {
            if (AppState.appointments[date].reports) {
                AppState.appointments[date].reports.forEach(appt => {
                    result.push({ ...appt, dateKey: date });
                });
            }
        }
        return result.sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));
    },

    addTeamMember: async function(member) {
        if (!AppState.currentUser) { showToast('Please sign in first', 'error'); return; }
        const newMember = {
            id: member.id || Utils.generateId(),
            name: member.name || 'New Member',
            role: member.role || 'Agent',
            email: member.email || '',
            phone: member.phone || '',
            avatar: member.avatar || '👤',
            color: member.color || '#3b82f6',
            active: true,
            createdAt: new Date().toISOString()
        };
        
        if (AppState.isFirebaseReady && AppState.currentUser) {
            try {
                await firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('teamMembers').doc(newMember.id).set(newMember);
            } catch (e) {
                console.error('Error adding team member:', e);
                AppState.teamMembers.push(newMember);
                localStorage.setItem('teamMembers_fallback', JSON.stringify(AppState.teamMembers));
            }
        } else {
            AppState.teamMembers.push(newMember);
            localStorage.setItem('teamMembers_fallback', JSON.stringify(AppState.teamMembers));
        }
        
        showToast(`Team member ${newMember.name} added!`, 'success');
        return newMember;
    },

    updateTeamMember: async function(id, updates) {
        const member = AppState.teamMembers.find(m => m.id === id);
        if (!member) { showToast('Team member not found', 'error'); return; }
        
        Object.assign(member, updates);
        
        if (AppState.isFirebaseReady && AppState.currentUser) {
            try {
                await firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('teamMembers').doc(id).update(updates);
            } catch (e) {
                console.error('Error updating team member:', e);
                localStorage.setItem('teamMembers_fallback', JSON.stringify(AppState.teamMembers));
            }
        } else {
            localStorage.setItem('teamMembers_fallback', JSON.stringify(AppState.teamMembers));
        }
        
        showToast(`Team member ${member.name} updated!`, 'success');
    },

    deleteTeamMember: async function(id) {
        const member = AppState.teamMembers.find(m => m.id === id);
        if (!member) { showToast('Team member not found', 'error'); return; }
        
        if (!confirm(`Delete ${member.name} from the team?`)) return;
        
        AppState.teamMembers = AppState.teamMembers.filter(m => m.id !== id);
        
        if (AppState.isFirebaseReady && AppState.currentUser) {
            try {
                await firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('teamMembers').doc(id).delete();
            } catch (e) {
                console.error('Error deleting team member:', e);
                localStorage.setItem('teamMembers_fallback', JSON.stringify(AppState.teamMembers));
            }
        } else {
            localStorage.setItem('teamMembers_fallback', JSON.stringify(AppState.teamMembers));
        }
        
        showToast(`Team member ${member.name} deleted`, 'info');
    }
};

// ================================================================
// STATISTICS
// ================================================================

const Stats = {
    getTodayCount: function() {
        return AppState.appointments[Utils.getTodayStr()]?.reports?.length || 0;
    },

    getWeekCount: function() {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        let total = 0;
        for (let d in AppState.appointments) {
            const date = new Date(d);
            if (date >= start && AppState.appointments[d].reports) {
                total += AppState.appointments[d].reports.length;
            }
        }
        return total;
    },

    getMonthCount: function() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        let total = 0;
        for (let d in AppState.appointments) {
            const date = new Date(d);
            if (date >= start && AppState.appointments[d].reports) {
                total += AppState.appointments[d].reports.length;
            }
        }
        return total;
    },

    getAverageScore: function() {
        let total = 0, count = 0;
        for (let date in AppState.appointments) {
            if (AppState.appointments[date].reports) {
                AppState.appointments[date].reports.forEach(appt => {
                    total += Utils.calculateLeadScore(appt);
                    count++;
                });
            }
        }
        return count > 0 ? Math.round(total / count) : 0;
    },

    updateAll: function() {
        DOM.setText('statToday', this.getTodayCount());
        DOM.setText('statWeek', this.getWeekCount());
        DOM.setText('statMonth', this.getMonthCount());
        DOM.setText('avgScore', this.getAverageScore());
        this.updateTaskStats();
        DOM.setText('goalDaily', AppState.goals.daily || 3);
        DOM.setText('goalWeekly', AppState.goals.weekly || 15);
        DOM.setText('goalMonthly', AppState.goals.monthly || 60);
    },

    updateTaskStats: function() {
        const pending = AppState.tasks.filter(t => !t.completed).length;
        DOM.setText('pendingTasks', pending);
    }
};

// ================================================================
// SCRIPTS MODULE
// ================================================================

const Scripts = {
    renderSidebar: function() {
        const container = DOM.get('scriptListContainer');
        if (!container) return;

        const scripts = AppState.scripts || {};
        const scriptOrder = AppState.scriptOrder || [];
        
        const visible = Utils.getOrderedVisible(scripts, scriptOrder);
        const sorted = [...visible].sort((a, b) => {
            const aFav = AppState.scriptFavorites.includes(a);
            const bFav = AppState.scriptFavorites.includes(b);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return visible.indexOf(a) - visible.indexOf(b);
        });

        let html = '';
        if (sorted.length === 0) {
            html = `<div class="empty-scripts-msg" style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
                <i class="fas fa-scroll" style="font-size:2rem; display:block; margin-bottom:8px; opacity:0.3;"></i>
                No scripts yet. Click "New Script" to create one.
            </div>`;
        } else {
            sorted.forEach((id, idx) => {
                const s = scripts[id];
                if (!s) return;
                const active = AppState.currentScriptId === id;
                const isFavorite = AppState.scriptFavorites.includes(id);
                html += `
                    <div class="script-item ${active ? 'active' : ''}" data-id="${id}">
                        <i class="fas fa-grip-vertical drag-handle"></i>
                        <span class="script-name">${Utils.escapeHtml(s.name)}</span>
                        <i class="fas fa-star favorite-star ${isFavorite ? 'active' : ''}" data-id="${id}"></i>
                        <span class="key-hint">${idx < 9 ? idx + 1 : ''}</span>
                        <i class="fas fa-edit script-edit-btn" data-id="${id}" title="Edit script name"></i>
                        <i class="fas fa-trash script-delete-btn" data-id="${id}" title="Delete script"></i>
                    </div>
                `;
            });
        }
        container.innerHTML = html;

        if (window.sortableInstance) {
            window.sortableInstance.destroy();
            window.sortableInstance = null;
        }

        if (sorted.length > 0) {
            window.sortableInstance = new Sortable(container, {
                handle: '.drag-handle',
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onEnd: async function() {
                    const newOrder = [];
                    container.querySelectorAll('.script-item').forEach(item => {
                        const id = item.getAttribute('data-id');
                        if (id) newOrder.push(id);
                    });
                    AppState.scriptOrder = newOrder;
                    await Data.saveScriptOrder();
                    Scripts.renderSidebar();
                    Scripts.updateKeyHints();
                }
            });
        }

        container.querySelectorAll('.script-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.drag-handle')) return;
                if (e.target.closest('.favorite-star')) return;
                if (e.target.closest('.script-edit-btn')) return;
                if (e.target.closest('.script-delete-btn')) return;
                Scripts.loadScript(el.getAttribute('data-id'));
            });
        });

        container.querySelectorAll('.favorite-star').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                Scripts.toggleFavorite(el.getAttribute('data-id'));
            });
        });

        container.querySelectorAll('.script-edit-btn').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = el.getAttribute('data-id');
                Scripts.editScriptTitle(id);
            });
        });

        container.querySelectorAll('.script-delete-btn').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = el.getAttribute('data-id');
                Scripts.deleteScript(id);
            });
        });

        this.updateKeyHints();
    },

    editScriptTitle: function(id) {
        const script = AppState.scripts[id];
        if (!script) {
            showToast('Script not found', 'error');
            return;
        }

        const newName = prompt('Edit script name:', script.name);
        if (newName && newName.trim() && newName.trim() !== script.name) {
            const updatedName = newName.trim();
            
            AppState.scripts[id] = { ...script, name: updatedName };
            
            if (AppState.isFirebaseReady && AppState.currentUser) {
                firebase.firestore()
                    .collection('users')
                    .doc(AppState.currentUser.uid)
                    .collection('scripts')
                    .doc(id)
                    .update({ name: updatedName })
                    .then(() => {
                        showToast('Script name updated!', 'success');
                        Scripts.renderSidebar();
                        if (AppState.currentScriptId === id) {
                            DOM.setText('currentScriptName', updatedName);
                        }
                    })
                    .catch(err => {
                        handleError(err, 'Updating script name');
                        AppState.scripts[id] = script;
                        Scripts.renderSidebar();
                    });
            } else {
                const fallback = JSON.parse(localStorage.getItem('scripts_fallback') || '{}');
                if (fallback[id]) {
                    fallback[id].name = updatedName;
                    localStorage.setItem('scripts_fallback', JSON.stringify(fallback));
                }
                showToast('Script name updated!', 'success');
                Scripts.renderSidebar();
                if (AppState.currentScriptId === id) {
                    DOM.setText('currentScriptName', updatedName);
                }
            }
        }
    },

    deleteScript: function(id) {
        const script = AppState.scripts[id];
        if (!script) {
            showToast('Script not found', 'error');
            return;
        }

        const scriptCount = Object.keys(AppState.scripts).length;
        if (scriptCount <= 1) {
            showToast('Cannot delete the last script. Create a new one first.', 'warning');
            return;
        }

        if (!confirm(`Delete script "${script.name}"? This cannot be undone.`)) {
            return;
        }

        delete AppState.scripts[id];
        AppState.scriptOrder = AppState.scriptOrder.filter(scriptId => scriptId !== id);
        AppState.scriptFavorites = AppState.scriptFavorites.filter(scriptId => scriptId !== id);

        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore()
                .collection('users')
                .doc(AppState.currentUser.uid)
                .collection('scripts')
                .doc(id)
                .delete()
                .then(() => {
                    showToast(`Script "${script.name}" deleted`, 'info');
                    if (AppState.currentScriptId === id) {
                        const remainingIds = Object.keys(AppState.scripts);
                        if (remainingIds.length > 0) {
                            Scripts.loadScript(remainingIds[0]);
                        }
                    }
                    Scripts.renderSidebar();
                    Scripts.saveScriptOrder();
                })
                .catch(err => {
                    handleError(err, 'Deleting script');
                    AppState.scripts[id] = script;
                    AppState.scriptOrder.push(id);
                    Scripts.renderSidebar();
                });
        } else {
            const fallback = JSON.parse(localStorage.getItem('scripts_fallback') || '{}');
            delete fallback[id];
            localStorage.setItem('scripts_fallback', JSON.stringify(fallback));
            
            showToast(`Script "${script.name}" deleted`, 'info');
            if (AppState.currentScriptId === id) {
                const remainingIds = Object.keys(AppState.scripts);
                if (remainingIds.length > 0) {
                    Scripts.loadScript(remainingIds[0]);
                }
            }
            Scripts.renderSidebar();
            Scripts.saveScriptOrder();
        }
    },

    updateKeyHints: function() {
        const visible = Utils.getOrderedVisible(AppState.scripts, AppState.scriptOrder);
        const items = document.querySelectorAll('.script-item');
        items.forEach((item, idx) => {
            const hint = item.querySelector('.key-hint');
            if (hint && idx < 9) {
                hint.textContent = idx + 1;
            } else if (hint) {
                hint.textContent = '';
            }
        });

        const activeHint = DOM.get('activeShortcutHint');
        if (activeHint) {
            const idx = visible.indexOf(AppState.currentScriptId);
            activeHint.textContent = (idx >= 0 && idx < 9) ? (idx + 1) : '—';
        }
    },

    loadScript: function(id) {
        if (!AppState.scripts[id]) {
            const ids = Object.keys(AppState.scripts);
            if (ids.length > 0) {
                id = ids[0];
            } else {
                showToast('No scripts available. Create a new script.', 'warning');
                return;
            }
        }
        if (AppState.isEditing) {
            if (!confirm('You have unsaved changes. Discard them?')) return;
            this.cancelEdit();
        }
        AppState.currentScriptId = id;
        const script = AppState.scripts[id];
        DOM.setText('currentScriptName', script.name);
        DOM.setHTML('scriptContent', `<div class="script-display">${Utils.escapeHtml(script.content).replace(/\n/g, '<br>')}</div>`);
        DOM.setText('versionNumber', script.version || 1);
        this.updateFavoriteStar();
        this.renderSidebar();
        this.updateKeyHints();
        
        // Notify Script Coach
        if (window.ScriptCoach && typeof window.ScriptCoach.onScriptLoaded === 'function') {
            window.ScriptCoach.onScriptLoaded(id, script.content);
        }
    },

    toggleFavorite: function(id) {
        const index = AppState.scriptFavorites.indexOf(id);
        if (index > -1) {
            AppState.scriptFavorites.splice(index, 1);
        } else {
            AppState.scriptFavorites.push(id);
        }
        localStorage.setItem('scriptFavorites', JSON.stringify(AppState.scriptFavorites));
        this.renderSidebar();
        this.updateFavoriteStar();
        showToast(index > -1 ? 'Removed from favorites' : 'Added to favorites', 'info');
    },

    updateFavoriteStar: function() {
        const star = DOM.get('favoriteScriptBtn');
        if (star) {
            const isFavorite = AppState.scriptFavorites.includes(AppState.currentScriptId);
            star.innerHTML = `<i class="fas fa-star" style="color:${isFavorite ? 'var(--favorite-color)' : 'var(--text-muted)'}"></i>`;
            star.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
        }
    },

    startEdit: function() {
        if (!AppState.scripts[AppState.currentScriptId]) return;
        AppState.isEditing = true;
        AppState.shortcutsEnabled = false;
        const script = AppState.scripts[AppState.currentScriptId];
        AppState.currentEditContent = script.content;

        DOM.hide('editScriptBtn');
        DOM.show('saveScriptBtn');
        DOM.show('cancelEditBtn');
        DOM.show('editStatusBadge');

        const contentDiv = DOM.get('scriptContent');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <textarea class="edit-textarea" id="editTextarea">${Utils.escapeHtml(script.content)}</textarea>
                <div class="auto-save-indicator">Auto-saving...</div>
            `;
        }

        const textarea = DOM.get('editTextarea');
        if (textarea) {
            textarea.focus();

            const saveContent = Utils.debounce((content) => {
                this.saveScriptContent(content);
                const indicator = document.querySelector('.auto-save-indicator');
                if (indicator) {
                    indicator.textContent = '✓ Auto-saved';
                    indicator.style.color = 'var(--success)';
                }
            }, 1000);

            textarea.addEventListener('input', () => {
                AppState.currentEditContent = textarea.value;
                const indicator = document.querySelector('.auto-save-indicator');
                if (indicator) {
                    indicator.textContent = 'Saving...';
                    indicator.style.color = 'var(--warning)';
                }
                if (window.autoSaveTimer) clearTimeout(window.autoSaveTimer);
                window.autoSaveTimer = setTimeout(() => saveContent(textarea.value), 1000);
            });

            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.cancelEdit();
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    this.saveScriptContent(textarea.value);
                    this.finishEdit();
                }
            });
        }
    },

    saveScriptContent: function(content) {
        if (!AppState.currentUser || !AppState.currentScriptId) return;
        const script = AppState.scripts[AppState.currentScriptId];
        if (!script) return;

        const updatedScript = {
            ...script,
            content: content,
            version: (script.version || 1) + 1
        };

        if (AppState.isFirebaseReady) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(AppState.currentScriptId).set(updatedScript, { merge: true })
                .then(() => {
                    AppState.scripts[AppState.currentScriptId] = updatedScript;
                })
                .catch(err => handleError(err, 'Saving script'));
        } else {
            AppState.scripts[AppState.currentScriptId] = updatedScript;
            localStorage.setItem('scripts_fallback', JSON.stringify(AppState.scripts));
        }
    },

    finishEdit: function() {
        AppState.isEditing = false;
        AppState.shortcutsEnabled = true;
        DOM.show('editScriptBtn');
        DOM.hide('saveScriptBtn');
        DOM.hide('cancelEditBtn');
        DOM.hide('editStatusBadge');
        this.loadScript(AppState.currentScriptId);
        showToast('Changes saved', 'success');
    },

    cancelEdit: function() {
        if (!confirm('Discard your changes?')) return;
        AppState.isEditing = false;
        AppState.shortcutsEnabled = true;
        DOM.show('editScriptBtn');
        DOM.hide('saveScriptBtn');
        DOM.hide('cancelEditBtn');
        DOM.hide('editStatusBadge');
        this.loadScript(AppState.currentScriptId);
    },

    resetScript: function() {
        if (!confirm('Reset this script to its original content?')) return;
        if (AppState.currentUser && AppState.currentScriptId) {
            const script = AppState.scripts[AppState.currentScriptId];
            if (AppState.isFirebaseReady) {
                firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(AppState.currentScriptId).set({
                    name: script.name,
                    content: script.content,
                    version: 1
                }, { merge: true }).then(() => {
                    showToast('Script reset', 'info');
                    Data.loadUserData(true);
                }).catch(err => handleError(err, 'Resetting script'));
            } else {
                script.version = 1;
                localStorage.setItem('scripts_fallback', JSON.stringify(AppState.scripts));
                showToast('Script reset locally', 'info');
                this.loadScript(AppState.currentScriptId);
            }
        }
    },

    createScript: function() {
        if (!AppState.currentUser) { 
            showToast('Please sign in first', 'error'); 
            return; 
        }
        
        const name = prompt('Enter new script name:');
        if (!name || !name.trim()) return;
        
        const scriptName = name.trim();
        const id = 'script_' + Utils.generateId();
        const newScript = {
            name: scriptName,
            content: 'New script content...\n\nStart writing your script here.',
            version: 1
        };

        AppState.scripts[id] = newScript;
        AppState.scriptOrder.push(id);

        if (AppState.isFirebaseReady) {
            firebase.firestore()
                .collection('users')
                .doc(AppState.currentUser.uid)
                .collection('scripts')
                .doc(id)
                .set({
                    name: scriptName,
                    content: newScript.content,
                    version: 1,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    showToast(`Script "${scriptName}" created! 🎉`, 'success');
                    Scripts.renderSidebar();
                    Scripts.loadScript(id);
                    Data.saveScriptOrder();
                })
                .catch(err => {
                    handleError(err, 'Creating script');
                    delete AppState.scripts[id];
                    AppState.scriptOrder = AppState.scriptOrder.filter(sid => sid !== id);
                    Scripts.renderSidebar();
                });
        } else {
            const fallback = JSON.parse(localStorage.getItem('scripts_fallback') || '{}');
            fallback[id] = newScript;
            localStorage.setItem('scripts_fallback', JSON.stringify(fallback));
            
            showToast(`Script "${scriptName}" created! 🎉`, 'success');
            Scripts.renderSidebar();
            Scripts.loadScript(id);
            Scripts.saveScriptOrder();
        }
    },

    saveScriptOrder: function() {
        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore()
                .collection('users')
                .doc(AppState.currentUser.uid)
                .update({ scriptOrder: AppState.scriptOrder })
                .catch(err => console.warn('Error saving script order:', err));
        } else {
            const fallback = JSON.parse(localStorage.getItem('scripts_fallback') || '{}');
            fallback.scriptOrder = AppState.scriptOrder;
            localStorage.setItem('scripts_fallback', JSON.stringify(fallback));
        }
    },

    isEditing: function() {
        return AppState.isEditing;
    }
};

// ================================================================
// FEATURE PANEL (Abbreviated - includes Calendar, Tasks, Analytics, Shortcuts)
// ================================================================

const FeaturePanel = {
    show: function(featureType, title) {
        const scriptPanel = DOM.get('scriptPanel');
        const featurePanel = DOM.get('featurePanel');
        const featureTitle = DOM.get('featurePanelTitle');
        const featureBody = DOM.get('featurePanelBody');

        if (!scriptPanel || !featurePanel) return;

        AppState.currentView = featureType;
        if (featureTitle) {
            const iconMap = { 
                'calendar': 'fa-calendar-alt', 
                'tasks': 'fa-tasks', 
                'analytics': 'fa-chart-pie', 
                'shortcuts': 'fa-keyboard'
            };
            featureTitle.innerHTML = `<i class="fas ${iconMap[featureType] || 'fa-sticky-note'}"></i> ${title}`;
        }

        const container = DOM.get('viewToggleContainer');
        if (container) {
            let html = '';
            if (featureType === 'calendar') {
                html = `
                    <div class="view-toggle" id="calendarViewToggle">
                        <button id="calendarViewBtn" class="view-btn active">📅 Calendar</button>
                        <button id="listViewBtn" class="view-btn">📋 List</button>
                    </div>
                `;
            } else if (featureType === 'analytics') {
                html = `
                    <div class="view-toggle" id="analyticsTabContainer">
                        <button id="insightsTabBtn" class="view-btn ${AppState.analyticsTab === 'insights' ? 'active' : ''}">📊 Insights</button>
                        <button id="reportsTabBtn" class="view-btn ${AppState.analyticsTab === 'reports' ? 'active' : ''}">📈 Reports</button>
                    </div>
                `;
            } else if (featureType === 'tasks') {
                html = `
                    <div class="view-toggle" id="taskViewToggle">
                        <button id="taskListViewBtn" class="view-btn active">📋 All</button>
                        <button id="taskPendingBtn" class="view-btn">⏳ Pending</button>
                        <button id="taskTodayBtn" class="view-btn">📅 Today</button>
                    </div>
                `;
            }
            container.innerHTML = html;
        }

        scriptPanel.style.display = 'none';
        featurePanel.style.display = 'block';

        if (featureBody) {
            if (featureType === 'tasks') {
                this.renderTasks(featureBody);
            } else if (featureType === 'shortcuts') {
                this.renderShortcuts(featureBody);
            } else if (featureType === 'calendar') {
                // Calendar rendering is handled by CalendarView module
                if (window.CalendarView) {
                    window.CalendarView.render(featureBody);
                } else {
                    featureBody.innerHTML = '<p>Loading calendar...</p>';
                }
            } else if (featureType === 'analytics') {
                // Analytics rendering is handled by Analytics module
                featureBody.innerHTML = '<p>Loading analytics...</p>';
            }
        }
    },

    hide: function() {
        const featurePanel = DOM.get('featurePanel');
        const scriptPanel = DOM.get('scriptPanel');
        if (featurePanel) featurePanel.style.display = 'none';
        if (scriptPanel) scriptPanel.style.display = 'block';
    },

    refreshCurrentView: function() {
        const body = DOM.get('featurePanelBody');
        if (!body) return;
        if (AppState.currentView === 'tasks') {
            this.renderTasks(body);
        } else if (AppState.currentView === 'shortcuts') {
            this.renderShortcuts(body);
        } else if (AppState.currentView === 'calendar' && window.CalendarView) {
            window.CalendarView.render(body);
        }
    },

    renderTasks: function(container) {
        if (!container) return;

        const filteredTasks = AppState.taskFilter === 'all' ? AppState.tasks :
            AppState.taskFilter === 'pending' ? AppState.tasks.filter(t => !t.completed) :
            AppState.tasks.filter(t => t.dueDate === Utils.getTodayStr());

        container.innerHTML = `
            <div class="tasks-section fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                    <h3><i class="fas fa-tasks"></i> Follow-up Tasks</h3>
                    <button id="addNewTaskBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> New</button>
                </div>
                <div class="tasks-list">
                    ${filteredTasks.length === 0 ? '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No tasks found</p></div>' :
                    filteredTasks.map(t => `
                        <div class="task-card ${t.completed ? 'task-completed' : ''}">
                            <div class="task-row">
                                <div class="task-title">
                                    <input type="checkbox" ${t.completed ? 'checked' : ''} class="toggle-task-checkbox" data-id="${t.id}" />
                                    <span>${Utils.escapeHtml(t.description)}</span>
                                </div>
                                <div class="task-actions">
                                    <button class="delete-task-btn" data-id="${t.id}" title="Delete"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            <div class="task-meta">
                                ${t.dueDate ? `<span><i class="far fa-calendar"></i> Due: ${Utils.formatDate(t.dueDate)}</span>` : ''}
                                <span class="task-priority-${t.priority || 'medium'}">${t.priority || 'Medium'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const addBtn = DOM.get('addNewTaskBtn');
        if (addBtn) addBtn.addEventListener('click', () => {
            const desc = prompt('Enter task description:');
            if (desc && desc.trim()) {
                const dueDate = prompt('Enter due date (YYYY-MM-DD) or leave blank:', Utils.getTodayStr());
                Data.addTask(desc.trim(), dueDate || '', 'medium', null);
                this.renderTasks(container);
                showToast('Task added!', 'success');
            }
        });

        container.querySelectorAll('.toggle-task-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                Data.toggleTaskComplete(cb.getAttribute('data-id'));
                setTimeout(() => this.renderTasks(container), 100);
            });
        });

        container.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Delete this task?')) {
                    Data.deleteTask(btn.getAttribute('data-id'));
                    this.renderTasks(container);
                }
            });
        });
    },

    renderShortcuts: function(container) {
        if (!container) return;

        const shortcuts = AppState.shortcuts;

        let html = `
            <div class="shortcuts-container fade-in">
                <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts Manager</h3>
                <p style="color:var(--text-muted); margin-bottom:16px;">View and customize keyboard shortcuts for quick access to features.</p>
                <div style="margin-bottom:16px; display:flex; gap:8px; flex-wrap:wrap;">
                    <button id="shortcutsResetDefaultsBtn" class="btn-icon" style="background:var(--warning); color:#1e293b;"><i class="fas fa-undo"></i> Reset Defaults</button>
                    <span style="font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center;">⚠️ Conflicts are highlighted in red</span>
                    <span style="font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center; margin-left:auto;">
                        Shortcuts ${AppState.shortcutsEnabled ? '🟢 Active' : '🔴 Disabled (Editing)'}
                    </span>
                </div>
                <div id="shortcutsListContainer" style="max-height:450px; overflow-y:auto;">
        `;

        for (const [action, shortcut] of Object.entries(shortcuts)) {
            const isDefault = CONFIG.DEFAULT_SHORTCUTS[action] &&
                JSON.stringify(CONFIG.DEFAULT_SHORTCUTS[action].keys) === JSON.stringify(shortcut.keys);
            const conflict = Utils.checkShortcutConflict(shortcut.keys, action, shortcuts);

            html += `
                <div class="shortcut-item ${conflict.length > 0 ? 'conflict' : ''}">
                    <div class="shortcut-info">
                        <div class="shortcut-name">${action}</div>
                        <div class="shortcut-description">${shortcut.description || ''}</div>
                    </div>
                    <div class="shortcut-keys">
                        ${shortcut.keys.map(k => `<kbd>${k}</kbd>`).join(' <span class="shortcut-separator">+</span> ')}
                        ${!isDefault ? ' <span style="font-size:0.65rem; color:var(--text-muted);">(custom)</span>' : ''}
                        ${conflict.length > 0 ? ` <span class="shortcut-conflict">⚠️ Conflict: ${conflict.join(', ')}</span>` : ''}
                        <i class="fas fa-pen shortcut-edit" onclick="window.openShortcutEdit('${action}')" title="Edit shortcut"></i>
                    </div>
                </div>
            `;
        }

        html += `</div></div>`;
        container.innerHTML = html;

        const resetBtn = DOM.get('shortcutsResetDefaultsBtn');
        if (resetBtn) resetBtn.addEventListener('click', () => {
            if (confirm('Reset all keyboard shortcuts to default values?')) {
                AppState.customShortcuts = {};
                localStorage.removeItem('customShortcuts');
                AppState.shortcuts = { ...CONFIG.DEFAULT_SHORTCUTS };
                showToast('Shortcuts reset to defaults', 'success');
                this.renderShortcuts(container);
            }
        });
    },

    openQuickAdd: function(defaultDate) {
        const modal = DOM.get('quickAddModal');
        if (!modal) return;

        modal.style.display = 'flex';
        const dateInput = DOM.get('newApptDate');
        if (dateInput) dateInput.value = defaultDate || Utils.getTodayStr();

        const statusSelect = DOM.get('newApptStatus');
        if (statusSelect) {
            statusSelect.innerHTML = CONFIG.STATUS_OPTIONS.map(s =>
                `<option value="${s}" ${s === 'Pending' ? 'selected' : ''}>${s}</option>`
            ).join('');
        }

        const assignedSelect = DOM.get('newApptAssigned');
        if (assignedSelect) {
            assignedSelect.innerHTML = AppState.teamMembers.map(m =>
                `<option value="${m.id}">${m.name}</option>`
            ).join('');
        }

        const fields = ['newApptBusiness', 'newApptContact', 'newApptPhone', 'newApptEmail', 'newApptTime', 'newApptNotes'];
        fields.forEach(id => { const el = DOM.get(id); if (el) el.value = ''; });

        const saveBtn = DOM.get('saveQuickApptBtn');
        const cancelBtn = DOM.get('cancelQuickApptBtn');

        if (saveBtn) {
            saveBtn.onclick = () => {
                const date = DOM.get('newApptDate')?.value || '';
                const bus = DOM.get('newApptBusiness')?.value?.trim() || '';
                const contact = DOM.get('newApptContact')?.value?.trim() || '';
                const phone = DOM.get('newApptPhone')?.value?.trim() || '';
                const email = DOM.get('newApptEmail')?.value?.trim() || '';
                const time = DOM.get('newApptTime')?.value || '';
                const status = DOM.get('newApptStatus')?.value || 'Pending';
                const assigned = DOM.get('newApptAssigned')?.value || 'daniel';
                const notes = DOM.get('newApptNotes')?.value?.trim() || '';

                if (!bus || !contact) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }

                const member = AppState.teamMembers.find(m => m.id === assigned);
                Data.addAppointment(date, bus, contact, 'Owner', phone, time, notes + (email ? `\nEmail: ${email}` : ''), member ? member.name : 'Daniel', null, status);
                modal.style.display = 'none';
                showToast('Appointment added successfully! 🎉', 'success');
                FeaturePanel.refreshCurrentView();
            };
        }

        if (cancelBtn) cancelBtn.onclick = () => { modal.style.display = 'none'; };

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
};

// ================================================================
// GLOBAL FUNCTIONS
// ================================================================

function openGlobalSearch() {
    const modal = DOM.get('globalSearchModal');
    if (!modal) return;
    modal.style.display = 'flex';
    const input = DOM.get('globalSearchInput');
    if (input) { input.value = ''; input.focus(); }
    const results = DOM.get('globalSearchResults');
    if (results) results.innerHTML = '';
}

function performGlobalSearch(query) {
    const results = DOM.get('globalSearchResults');
    if (!results) return;
    if (!query || query.length < 2) {
        results.innerHTML = '<p style="color:var(--text-muted); padding:12px;">Type at least 2 characters to search...</p>';
        return;
    }

    const searchResults = [];
    const q = query.toLowerCase();

    for (let date in AppState.appointments) {
        if (AppState.appointments[date].reports) {
            AppState.appointments[date].reports.forEach(appt => {
                const searchable = `${appt.business} ${appt.contactName} ${appt.phone || ''} ${appt.email || ''} ${appt.notes || ''}`.toLowerCase();
                if (searchable.includes(q)) {
                    searchResults.push({ type: 'appointment', data: appt, date: date });
                }
            });
        }
    }

    AppState.tasks.forEach(task => {
        if (task.description.toLowerCase().includes(q)) {
            searchResults.push({ type: 'task', data: task });
        }
    });

    for (const [id, script] of Object.entries(AppState.scripts)) {
        if (script.name.toLowerCase().includes(q) || script.content.toLowerCase().includes(q)) {
            searchResults.push({ type: 'script', data: { id, ...script } });
        }
    }

    if (searchResults.length === 0) {
        results.innerHTML = '<p style="color:var(--text-muted); padding:12px;">No results found.</p>';
        return;
    }

    let html = `<div style="display:flex; flex-direction:column; gap:8px;">`;
    searchResults.slice(0, 20).forEach(result => {
        if (result.type === 'appointment') {
            html += `
                <div class="list-item" style="cursor:pointer; padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);" onclick="window.showAppointmentDetail('${result.data.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span style="font-weight:600;">${Utils.escapeHtml(result.data.business)}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${Utils.formatDate(result.data.date)}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">${Utils.escapeHtml(result.data.contactName)}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">Status: ${Utils.getStatus(result.data)}</div>
                </div>
            `;
        } else if (result.type === 'task') {
            html += `
                <div class="list-item" style="padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span style="font-weight:600;">${Utils.escapeHtml(result.data.description)}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${result.data.completed ? '✅ Done' : '⏳ Pending'}</span>
                    </div>
                </div>
            `;
        } else if (result.type === 'script') {
            html += `
                <div class="list-item" style="cursor:pointer; padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);" onclick="window.loadScript('${result.data.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span style="font-weight:600;">${Utils.escapeHtml(result.data.name)}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">📜 Script</span>
                    </div>
                </div>
            `;
        }
    });
    html += `</div>`;
    results.innerHTML = html;
}

function openBulkActions() {
    const modal = DOM.get('bulkActionsModal');
    const container = DOM.get('bulkSelectionContainer');
    if (!modal || !container) return;
    modal.style.display = 'flex';
    AppState.selectedAppointments = new Set();

    let html = '';
    for (let date in AppState.appointments) {
        if (AppState.appointments[date].reports) {
            AppState.appointments[date].reports.forEach(appt => {
                html += `
                    <div class="bulk-item">
                        <input type="checkbox" class="bulk-checkbox" value="${appt.id}" data-date="${date}" />
                        <span><strong>${Utils.escapeHtml(appt.business)}</strong> - ${Utils.escapeHtml(appt.contactName)} (${Utils.getStatus(appt)})</span>
                    </div>
                `;
            });
        }
    }
    container.innerHTML = html || '<p style="color:var(--text-muted);">No appointments found</p>';

    container.querySelectorAll('.bulk-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) AppState.selectedAppointments.add(cb.value);
            else AppState.selectedAppointments.delete(cb.value);
        });
    });

    const options = DOM.get('bulkActionOptions');
    if (options) options.style.display = 'none';
}

function executeBulkAction() {
    const action = DOM.get('bulkActionSelect')?.value || 'status';
    const selected = Array.from(AppState.selectedAppointments);

    if (selected.length === 0) { showToast('Please select at least one appointment', 'warning'); return; }

    if (action === 'delete') {
        if (!confirm(`Delete ${selected.length} appointment(s)?`)) return;
        selected.forEach(id => {
            for (let date in AppState.appointments) {
                if (AppState.appointments[date].reports) {
                    const found = AppState.appointments[date].reports.find(r => r.id === id);
                    if (found) { Data.deleteAppointment(date, id); break; }
                }
            }
        });
        showToast(`${selected.length} appointment(s) deleted`, 'success');
    } else if (action === 'status') {
        const statusSelect = DOM.get('bulkStatusSelect');
        const newStatus = statusSelect?.value || 'Pending';
        selected.forEach(id => {
            for (let date in AppState.appointments) {
                if (AppState.appointments[date].reports) {
                    const found = AppState.appointments[date].reports.find(r => r.id === id);
                    if (found) { Data.updateAppointment(date, id, { status: newStatus }); break; }
                }
            }
        });
        showToast(`${selected.length} appointment(s) updated to ${newStatus}`, 'success');
    } else if (action === 'tag') {
        const tagSelect = DOM.get('bulkTagSelect');
        const tag = tagSelect?.value || '';
        selected.forEach(id => {
            for (let date in AppState.appointments) {
                if (AppState.appointments[date].reports) {
                    const found = AppState.appointments[date].reports.find(r => r.id === id);
                    if (found) {
                        const tags = found.tags || [];
                        if (!tags.includes(tag)) { tags.push(tag); Data.updateAppointment(date, id, { tags }); }
                        break;
                    }
                }
            }
        });
        showToast(`Tag added to ${selected.length} appointment(s)`, 'success');
    } else if (action === 'export') {
        Data.exportToCSV(selected);
    }

    const modal = DOM.get('bulkActionsModal');
    if (modal) modal.style.display = 'none';
    FeaturePanel.refreshCurrentView();
}

function handleEscapeKey() {
    if (AppState.isEditing) {
        Scripts.cancelEdit();
        return true;
    }

    const featurePanel = DOM.get('featurePanel');
    if (featurePanel && featurePanel.style.display !== 'none') {
        FeaturePanel.hide();
        Scripts.loadScript('opening');
        showToast('Returned to Opening Script', 'info');
        return true;
    }

    const openModals = document.querySelectorAll('.modal-overlay');
    openModals.forEach(modal => {
        if (modal.style.display !== 'none') {
            modal.style.display = 'none';
        }
    });
    return true;
}

function openShortcutEdit(action) {
    const currentKeys = AppState.shortcuts[action]?.keys || [];
    const keysString = currentKeys.join('+');
    const newKeysString = prompt(`Enter new shortcut for "${action}" (e.g., Ctrl+Shift+I):`, keysString);

    if (newKeysString && newKeysString !== keysString) {
        const newKeys = newKeysString.split('+').map(k => k.trim());
        const conflicts = Utils.checkShortcutConflict(newKeys, action, AppState.shortcuts);

        if (conflicts.length > 0) {
            showToast(`Conflict with: ${conflicts.join(', ')}`, 'warning');
            return false;
        }

        if (AppState.shortcuts[action]) {
            AppState.shortcuts[action].keys = newKeys;
            AppState.customShortcuts[action] = AppState.shortcuts[action];
            localStorage.setItem('customShortcuts', JSON.stringify(AppState.customShortcuts));
            showToast(`Shortcut updated for ${action}`, 'success');

            const body = DOM.get('featurePanelBody');
            if (body && AppState.currentView === 'shortcuts') {
                FeaturePanel.renderShortcuts(body);
            }
            return true;
        }
    }
    return false;
}

function handleShortcutAction(action) {
    switch (action) {
        case 'Smart Import': showToast('📥 Smart Import opened', 'info'); break;
        case 'Appointment Calendar': FeaturePanel.show('calendar', '📅 Appointment & Handoff Calendar'); break;
        case 'Call Scripts': FeaturePanel.hide(); Scripts.loadScript('opening'); break;
        case 'Global Search': openGlobalSearch(); break;
        case 'Quick Add Appointment': FeaturePanel.openQuickAdd(Utils.getTodayStr()); break;
        case 'Analytics Hub': FeaturePanel.show('analytics', '📊 Analytics Hub'); break;
        case 'Keyboard Shortcuts': FeaturePanel.show('shortcuts', '⌨️ Keyboard Shortcuts'); break;
        case 'Export to CSV': Data.exportToCSV(); break;
        case 'Toggle Theme': document.body.classList.toggle('light'); showToast('Theme toggled', 'info'); break;
        case 'Refresh Data': { const btn = DOM.get('refreshBtn'); if (btn) btn.click(); break; }
        case 'Bulk Actions': openBulkActions(); break;
        case 'Close Panel': handleEscapeKey(); break;
        default: showToast(`Action: ${action}`, 'info');
    }
}

// ================================================================
// APPOINTMENT DETAIL MODAL
// ================================================================

function showAppointmentDetail(appointmentId) {
    const appt = Data.getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    AppState.currentAppointmentId = appointmentId;

    const modal = DOM.get('appointmentDetailModal');
    if (!modal) return;

    const status = Utils.getStatus(appt);
    const score = Utils.calculateLeadScore(appt);

    const titleEl = DOM.get('appointmentDetailTitle');
    if (titleEl) titleEl.textContent = `📋 ${appt.business} - ${appt.contactName}`;

    const contentEl = DOM.get('appointmentDetailContent');
    if (contentEl) {
        contentEl.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding-bottom:12px; border-bottom:2px solid var(--border-color);">
                    <div>
                        <div style="font-size:1.1rem; font-weight:700;">${Utils.escapeHtml(appt.business)}</div>
                        <div style="font-size:0.9rem; color:var(--text-secondary);">${Utils.escapeHtml(appt.contactName)}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="status-tag ${Utils.getStatusClass(status)}">${status}</span>
                        <span class="score-badge ${Utils.getScoreColor(score)}">${score} Pts</span>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                    <div style="background:var(--bg-primary); border-radius:8px; padding:12px;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">📞 Phone</div>
                        <div style="font-weight:500;">${Utils.escapeHtml(appt.phone || 'N/A')}</div>
                    </div>
                    <div style="background:var(--bg-primary); border-radius:8px; padding:12px;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">✉️ Email</div>
                        <div style="font-weight:500;">${Utils.escapeHtml(appt.email || 'N/A')}</div>
                    </div>
                    <div style="background:var(--bg-primary); border-radius:8px; padding:12px;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">📅 Date</div>
                        <div style="font-weight:500;">${Utils.formatDate(appt.date)}</div>
                    </div>
                    <div style="background:var(--bg-primary); border-radius:8px; padding:12px;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">🕐 Time</div>
                        <div style="font-weight:500;">${Utils.escapeHtml(appt.time || 'N/A')}</div>
                    </div>
                </div>

                <div style="display:flex; gap:16px; flex-wrap:wrap; padding:8px 0; border-bottom:1px solid var(--border-color);">
                    <div><span style="color:var(--text-muted);">👤 Assigned:</span> <strong>${Utils.escapeHtml(appt.assigned || 'Daniel')}</strong></div>
                    <div><span style="color:var(--text-muted);">💼 Role:</span> <strong>${Utils.escapeHtml(appt.role || 'Owner')}</strong></div>
                    ${appt.tags && appt.tags.length > 0 ? `
                        <div><span style="color:var(--text-muted);">🏷️ Tags:</span> ${appt.tags.map(t => `<span class="status-tag" style="background:var(--bg-primary);">#${t}</span>`).join(' ')}</div>
                    ` : ''}
                </div>

                ${appt.notes ? `
                    <div style="background:var(--bg-primary); border-radius:8px; padding:12px; margin-top:4px;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">📝 Notes</div>
                        <div style="white-space:pre-wrap; margin-top:4px;">${Utils.escapeHtml(appt.notes)}</div>
                    </div>
                ` : ''}

                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; padding-top:12px; border-top:2px solid var(--border-color);">
                    <button class="btn-icon" onclick="window.editAppointment('${appt.id}')" style="background:var(--warning); color:#1e293b;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-icon" onclick="window.rescheduleAppointment('${appt.id}')" style="background:var(--secondary); color:white;">
                        <i class="fas fa-calendar-alt"></i> Reschedule
                    </button>
                    <button class="btn-icon" onclick="window.completeAppointment('${appt.id}')" style="background:var(--success); color:white;">
                        <i class="fas fa-check"></i> Complete
                    </button>
                    <button class="btn-icon" onclick="window.cancelAppointment('${appt.id}')" style="background:var(--danger); color:white;">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
    }

    modal.style.display = 'flex';
}

function closeAppointmentDetail() {
    const modal = DOM.get('appointmentDetailModal');
    if (modal) modal.style.display = 'none';
    AppState.currentAppointmentId = null;
}

function editAppointment(appointmentId) {
    const appt = Data.getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    
    closeAppointmentDetail();
    FeaturePanel.openQuickAdd(appt.date);
    setTimeout(() => {
        const businessInput = DOM.get('newApptBusiness');
        const contactInput = DOM.get('newApptContact');
        const phoneInput = DOM.get('newApptPhone');
        const timeInput = DOM.get('newApptTime');
        const statusSelect = DOM.get('newApptStatus');
        const notesInput = DOM.get('newApptNotes');
        const assignedSelect = DOM.get('newApptAssigned');
        
        if (businessInput) businessInput.value = appt.business;
        if (contactInput) contactInput.value = appt.contactName;
        if (phoneInput) phoneInput.value = appt.phone || '';
        if (timeInput) timeInput.value = appt.time || '';
        if (statusSelect) statusSelect.value = Utils.getStatus(appt);
        if (notesInput) notesInput.value = appt.notes || '';
        if (assignedSelect) {
            const member = AppState.teamMembers.find(m => m.name === appt.assigned);
            if (member) assignedSelect.value = member.id;
        }
        Data.deleteAppointment(appt.date, appt.id);
    }, 100);
}

function rescheduleAppointment(appointmentId) {
    const appt = Data.getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    
    const newDate = prompt('Enter new date (YYYY-MM-DD):', appt.date);
    if (newDate && newDate.trim()) {
        const newTime = prompt('Enter new time (e.g., 2:30 PM):', appt.time || '');
        Data.updateAppointment(appt.date, appt.id, { 
            date: newDate.trim(),
            time: newTime || appt.time,
            status: 'Rescheduled'
        });
        closeAppointmentDetail();
        showToast(`Appointment rescheduled to ${Utils.formatDate(newDate)}`, 'success');
    }
}

function completeAppointment(appointmentId) {
    const appt = Data.getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    
    if (confirm(`Mark "${appt.business}" as Completed?`)) {
        Data.updateAppointment(appt.date, appt.id, { status: 'Completed' });
        closeAppointmentDetail();
        showToast('Appointment marked as Completed! 🎉', 'success');
    }
}

function cancelAppointment(appointmentId) {
    const appt = Data.getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    
    if (confirm(`Cancel appointment with ${appt.business}?`)) {
        Data.updateAppointment(appt.date, appt.id, { status: 'Canceled' });
        closeAppointmentDetail();
        showToast('Appointment canceled', 'info');
    }
}

// ================================================================
// INITIALIZATION
// ================================================================

function initApp() {
    console.log('🚀 Starting ScriptFlow Pro...');
    updateLoadingProgress(10, 'Initializing application...');

    try {
        AppState.isFirebaseReady = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
    } catch (e) {
        AppState.isFirebaseReady = false;
    }

    if (!AppState.isFirebaseReady) {
        console.warn('⚠️ Firebase not available - running in offline mode');
        showToast('Offline mode - Some features may be limited', 'warning');
    }
    updateLoadingProgress(35, 'Connecting to services...');

    AppState.customShortcuts = JSON.parse(localStorage.getItem('customShortcuts') || '{}');
    AppState.shortcuts = { ...CONFIG.DEFAULT_SHORTCUTS, ...AppState.customShortcuts };
    AppState.scriptFavorites = JSON.parse(localStorage.getItem('scriptFavorites') || '[]');

    const toolsHeader = DOM.get('toolsHeader');
    const toolsMenu = DOM.get('toolsMenu');
    const toolsChevron = DOM.get('toolsChevron');
    const toolsOpen = localStorage.getItem('toolsMenuOpen') === 'true';

    if (toolsHeader && toolsMenu && toolsChevron) {
        if (toolsOpen) { toolsMenu.classList.add('open'); toolsChevron.classList.add('rotated'); }
        toolsHeader.addEventListener('click', () => {
            const isOpen = toolsMenu.classList.toggle('open');
            toolsChevron.classList.toggle('rotated');
            localStorage.setItem('toolsMenuOpen', isOpen);
        });
    }
    updateLoadingProgress(50, 'Setting up UI...');

    const menuToggle = DOM.get('menuToggleBtn');
    const sidebar = DOM.get('mainSidebar');
    const mainContent = DOM.get('mainContent');

    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            mainContent.classList.toggle('expanded');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') handleEscapeKey();
    });
    updateLoadingProgress(65, 'Loading features...');

    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            if (tool === 'notepad') showToast('📝 Notes feature coming soon!', 'info');
            else if (tool === 'calendar') FeaturePanel.show('calendar', '📅 Appointment & Handoff Calendar');
            else if (tool === 'tasks') FeaturePanel.show('tasks', '📋 Follow-up Tasks Manager');
            else if (tool === 'analytics') {
                AppState.analyticsTab = 'insights';
                FeaturePanel.show('analytics', '📊 Analytics Hub');
            } else if (tool === 'shortcuts') FeaturePanel.show('shortcuts', '⌨️ Keyboard Shortcuts');
            else if (tool === 'theme') {
                document.body.classList.toggle('light');
                showToast('Theme toggled', 'info');
            } else if (tool === 'help') {
                showToast('Handoffs: Hot Transfer, Warm Callback, Completed (includes Meeting Booked, Rescheduled, Held), Pending, Canceled', 'info');
            } else if (tool === 'reset') {
                if (confirm('⚠️ This will clear all local data and reset the app. Continue?')) {
                    localStorage.clear();
                    if (AppState.currentUser && AppState.isFirebaseReady) {
                        firebase.firestore().collection('users').doc(AppState.currentUser.uid).delete().catch(e => console.warn('Delete error:', e));
                    }
                    location.reload();
                }
            } else if (tool === 'export') Data.exportToCSV();
            else if (tool === 'signOut') Auth.signOut();
        });
    });

    const closeFeatureBtn = DOM.get('closeFeaturePanelBtn');
    if (closeFeatureBtn) closeFeatureBtn.addEventListener('click', () => {
        FeaturePanel.hide();
        Scripts.loadScript('opening');
    });

    // Script editing buttons
    const editScriptBtn = DOM.get('editScriptBtn');
    const saveScriptBtn = DOM.get('saveScriptBtn');
    const cancelEditBtn = DOM.get('cancelEditBtn');
    const copyScriptBtn = DOM.get('copyScriptBtn');
    const resetScriptBtn = DOM.get('resetScriptBtn');
    const favoriteScriptBtn = DOM.get('favoriteScriptBtn');

    if (editScriptBtn) editScriptBtn.addEventListener('click', () => Scripts.startEdit());
    if (saveScriptBtn) saveScriptBtn.addEventListener('click', () => {
        const textarea = DOM.get('editTextarea');
        if (textarea) { Scripts.saveScriptContent(textarea.value); Scripts.finishEdit(); }
    });
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => Scripts.cancelEdit());
    if (copyScriptBtn) copyScriptBtn.addEventListener('click', () => {
        const script = AppState.scripts[AppState.currentScriptId];
        if (script) copyToClipboard(script.content);
    });
    if (resetScriptBtn) resetScriptBtn.addEventListener('click', () => Scripts.resetScript());
    if (favoriteScriptBtn) favoriteScriptBtn.addEventListener('click', () => Scripts.toggleFavorite(AppState.currentScriptId));

    const bulkActionsBtn = DOM.get('bulkActionsBtn');
    const closeBulkBtn = DOM.get('closeBulkModalBtn');
    const executeBulkBtn = DOM.get('executeBulkActionBtn');
    const bulkActionSelect = DOM.get('bulkActionSelect');

    if (bulkActionsBtn) bulkActionsBtn.addEventListener('click', openBulkActions);
    if (closeBulkBtn) closeBulkBtn.addEventListener('click', () => {
        const modal = DOM.get('bulkActionsModal');
        if (modal) modal.style.display = 'none';
    });
    if (executeBulkBtn) executeBulkBtn.addEventListener('click', executeBulkAction);

    if (bulkActionSelect) bulkActionSelect.addEventListener('change', () => {
        const value = bulkActionSelect.value;
        const statusGroup = DOM.get('bulkStatusGroup');
        const tagGroup = DOM.get('bulkTagGroup');
        const options = DOM.get('bulkActionOptions');
        if (statusGroup) statusGroup.style.display = value === 'status' ? 'block' : 'none';
        if (tagGroup) tagGroup.style.display = value === 'tag' ? 'block' : 'none';
        if (options) options.style.display = (value === 'status' || value === 'tag') ? 'block' : 'none';
    });

    const signOutBtn = DOM.get('signOutBtn');
    if (signOutBtn) signOutBtn.addEventListener('click', () => Auth.signOut());

    const refreshBtn = DOM.get('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', async () => {
        if (AppState.isRefreshing) return;
        AppState.isRefreshing = true;
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;

        try {
            showToast('Refreshing data...', 'info');
            await Data.loadUserData(true);
            FeaturePanel.refreshCurrentView();
            showToast('Data refreshed!', 'success');
        } catch (error) { handleError(error, 'Refresh'); }
        finally {
            AppState.isRefreshing = false;
            refreshBtn.classList.remove('spinning');
            refreshBtn.disabled = false;
        }
    });

    const addScriptBtn = DOM.get('addScriptBtnSide');
    if (addScriptBtn) addScriptBtn.addEventListener('click', () => Scripts.createScript());

    const scriptSearch = DOM.get('scriptSearch');
    if (scriptSearch) scriptSearch.addEventListener('input', (e) => {
        AppState.searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.script-item').forEach(item => {
            const name = item.querySelector('.script-name')?.textContent?.toLowerCase() || '';
            item.style.display = name.includes(AppState.searchTerm) ? 'flex' : 'none';
        });
    });

    const searchGlobalBtn = DOM.get('searchGlobalBtn');
    const globalSearchInput = DOM.get('globalSearchInput');
    const globalSearchClose = DOM.get('globalSearchCloseBtn');

    if (searchGlobalBtn) searchGlobalBtn.addEventListener('click', openGlobalSearch);
    if (globalSearchInput) globalSearchInput.addEventListener('input', (e) => performGlobalSearch(e.target.value));
    if (globalSearchClose) globalSearchClose.addEventListener('click', () => {
        const modal = DOM.get('globalSearchModal');
        if (modal) modal.style.display = 'none';
    });

    const csvFileInput = DOM.get('csvFileInput');
    if (csvFileInput) csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const csvText = event.target.result;
                    const lines = csvText.split('\n').filter(line => line.trim());
                    if (lines.length > 0) {
                        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                        let imported = 0;
                        for (let i = 1; i < lines.length; i++) {
                            const values = lines[i].split(',').map(v => v.trim());
                            const data = {};
                            headers.forEach((h, idx) => data[h] = values[idx] || '');
                            if (data.name || data.business) {
                                Data.addAppointment(
                                    data.date || Utils.getTodayStr(),
                                    data.business || data.company || 'Unknown Business',
                                    data.name || data.contact || 'Unknown Contact',
                                    'Owner',
                                    data.phone || data.mobile || '',
                                    data.time || '',
                                    data.notes || '',
                                    'Daniel',
                                    null,
                                    data.status || 'Pending'
                                );
                                imported++;
                            }
                        }
                        showToast(`Imported ${imported} appointments from CSV!`, 'success');
                        FeaturePanel.refreshCurrentView();
                    }
                } catch (err) { showToast('Error parsing CSV: ' + err.message, 'error'); }
            };
            reader.readAsText(file);
        }
        e.target.value = '';
    });

    document.addEventListener('keydown', (e) => {
        if (!AppState.shortcutsEnabled || AppState.isEditing) {
            if (e.key === 'Escape') {
                handleEscapeKey();
            }
            return;
        }

        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            const visible = Utils.getOrderedVisible(AppState.scripts, AppState.scriptOrder);
            if (index < visible.length) {
                e.preventDefault();
                Scripts.loadScript(visible[index]);
                showToast(`Switched to: ${AppState.scripts[visible[index]]?.name}`, 'info');
            }
        }

        for (const [action, shortcut] of Object.entries(AppState.shortcuts)) {
            if (shortcut.keys && shortcut.keys.length > 0) {
                const keys = shortcut.keys;
                const ctrl = keys.includes('Ctrl');
                const shift = keys.includes('Shift');
                const alt = keys.includes('Alt');
                const key = keys.find(k => !['Ctrl', 'Shift', 'Alt'].includes(k));
                if (e.ctrlKey === ctrl && e.shiftKey === shift && e.altKey === alt && e.key === key) {
                    e.preventDefault();
                    handleShortcutAction(action);
                }
            }
        }
    });

    try {
        if (AppState.isFirebaseReady) {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    AppState.currentUser = user;
                    Auth.updateUI();
                    await Data.loadUserData();
                    updateLoadingProgress(85, 'Loading your data...');
                } else {
                    const localData = localStorage.getItem('userData_fallback');
                    if (localData) {
                        try {
                            const data = JSON.parse(localData);
                            AppState.scripts = data.scripts || {};
                            AppState.scriptOrder = data.scriptOrder || [];
                            AppState.appointments = data.appointments || {};
                            AppState.tasks = data.tasks || {};
                            AppState.teamMembers = data.teamMembers || CONFIG.DEFAULT_TEAM_MEMBERS;
                            Stats.updateAll();
                            Scripts.renderSidebar();
                            Scripts.loadScript('opening');
                            showToast('Loaded offline data', 'info');
                        } catch (e) {}
                    }
                    Auth.showModal();
                }
                updateLoadingProgress(100, 'Ready!');
                setTimeout(hideLoadingScreen, 400);
            });
        } else {
            const localData = localStorage.getItem('userData_fallback');
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    AppState.scripts = data.scripts || {};
                    AppState.scriptOrder = data.scriptOrder || [];
                    AppState.appointments = data.appointments || {};
                    AppState.tasks = data.tasks || {};
                    AppState.teamMembers = data.teamMembers || CONFIG.DEFAULT_TEAM_MEMBERS;
                    Stats.updateAll();
                    Scripts.renderSidebar();
                    Scripts.loadScript('opening');
                } catch (e) {}
            }
            Auth.showModal();
            updateLoadingProgress(100, 'Ready!');
            setTimeout(hideLoadingScreen, 400);
        }
    } catch (error) {
        console.warn('Auth setup error:', error);
        Auth.showModal();
        updateLoadingProgress(100, 'Ready!');
        setTimeout(hideLoadingScreen, 400);
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    });

    // Initialize Script Coach
    setTimeout(() => {
        if (typeof initScriptCoach === 'function') {
            initScriptCoach();
            console.log('🎯 Script Coach initialized successfully');
        } else {
            console.log('📝 Script Coach script loading...');
        }
    }, 1000);

    console.log('🚀 ScriptFlow Pro initialized successfully!');
    console.log(`🔌 Firebase status: ${AppState.isFirebaseReady ? '✅ Connected' : '❌ Offline mode'}`);
}

// ================================================================
// GLOBAL EXPOSURE
// ================================================================

window.showAppointmentDetail = showAppointmentDetail;
window.closeAppointmentDetail = closeAppointmentDetail;
window.loadScript = Scripts.loadScript;
window.openShortcutEdit = openShortcutEdit;
window.showToast = showToast;
window.openGlobalSearch = openGlobalSearch;
window.editAppointment = editAppointment;
window.rescheduleAppointment = rescheduleAppointment;
window.completeAppointment = completeAppointment;
window.cancelAppointment = cancelAppointment;
window.FeaturePanel = FeaturePanel;
window.Data = Data;
window.Stats = Stats;
window.Scripts = Scripts;
window.Auth = Auth;
window.CONFIG = CONFIG;
window.AppState = AppState;

// Start the app
document.addEventListener('DOMContentLoaded', initApp);