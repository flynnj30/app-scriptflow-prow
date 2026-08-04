// ================================================================
// SCRIPTFLOW PRO - COMPLETE APPLICATION (CENTRALIZED)
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
        { id: 'kailan', name: 'Kailan', role: 'Closer', email: 'kailan@company.com', phone: '+1-555-0101', avatar: '👨‍💼', color: '#3b82f6', active: true },
        { id: 'seif', name: 'Seif', role: 'Closer', email: 'seif@company.com', phone: '+1-555-0102', avatar: '👩‍💼', color: '#8b5cf6', active: true },
        { id: 'daniel', name: 'Daniel', role: 'Team Lead', email: 'daniel@company.com', phone: '+1-555-0103', avatar: '👨‍💻', color: '#10b981', active: true },
        { id: 'sarah', name: 'Sarah', role: 'Senior Agent', email: 'sarah@company.com', phone: '+1-555-0104', avatar: '👩‍💻', color: '#f59e0b', active: true }
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
        'Close Panel': { keys: ['Escape'], description: 'Close current panel and return to scripts' },
        'Objection Handler': { keys: ['Ctrl', 'Shift', 'O'], description: 'Open Objection Handler panel' },
        'Prospects': { keys: ['Ctrl', 'Shift', 'P'], description: 'Open Prospects Manager' }
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
    analyticsTab: 'meetings',
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
    
    importRecords: [],
    importProcessing: false,
    importProgress: 0,
    
    prospectManager: null,
    prospectManagerReady: false,

    analyticsFilters: {
        timeRange: 'today',
        startDate: null,
        endDate: null,
        setter: 'all',
        campaign: 'all',
        timeZone: 'local'
    },
    analyticsData: null,
    analyticsLoading: false,
    
    // AI Configuration (using centralized config)
    aiConfig: null,
    isAIAvailable: false,
    firebaseStatus: null
};

// ================================================================
// STORAGE KEYS - Using centralized config
// ================================================================

const STORAGE_KEYS = {
    userData: 'userData_fallback',
    appointments: 'appointments_fallback',
    tasks: 'tasks_fallback',
    teamMembers: 'teamMembers_fallback',
    scripts: 'scripts_fallback',
    scriptFavorites: 'scriptFavorites',
    customShortcuts: 'customShortcuts',
    toolsMenuOpen: 'toolsMenuOpen',
    analyticsFilters: 'analyticsFilters',
    prospectsCache: 'prospects_cache',
    objectionFavorites: 'objectionFavorites',
    geminiApiKey: 'gemini_api_key'
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

    formatDateTime(dateStr) {
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
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        if (score >= 8) return 'score-high';
        if (score >= 6) return 'score-medium';
        return 'score-low';
    },

    getScoreColorClass(score) {
        if (score >= 8) return 'green';
        if (score >= 6) return 'yellow';
        return 'red';
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

    calculateQualityScore(appt) {
        if (!appt) return null;
        if (appt.qualityScore !== undefined && appt.qualityScore !== null) {
            return Math.max(0, Math.min(10, appt.qualityScore));
        }
        const status = Utils.getStatus(appt);
        let score = 5;
        
        if (status === 'Held') {
            score = 8;
            if (appt.tags && appt.tags.includes('vip')) score += 1;
            if (appt.notes && appt.notes.length > 20) score += 0.5;
        } else if (status === 'Meeting Booked') {
            score = 7;
        } else if (status === 'Rescheduled') {
            score = 4;
        } else if (status === 'Canceled') {
            score = 2;
        }
        
        if (appt.email && Utils.isValidEmail(appt.email)) {
            score += 0.5;
        }
        
        return Math.max(0, Math.min(10, score));
    },

    isValidEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isEmailBounced(email) {
        if (!email) return false;
        const bounceIndicators = ['bounce', 'undeliverable', 'failed', 'invalid', 'rejected'];
        const lowerEmail = email.toLowerCase();
        return bounceIndicators.some(indicator => lowerEmail.includes(indicator));
    },

    getEmailStatus(email) {
        if (!email) return 'unknown';
        if (this.isEmailBounced(email)) return 'bounced';
        if (this.isValidEmail(email)) return 'valid';
        return 'invalid';
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
    },

    getDateRange(range) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate, endDate;

        switch(range) {
            case 'today':
                startDate = new Date(today);
                endDate = new Date(today);
                break;
            case 'yesterday':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 1);
                endDate = new Date(startDate);
                break;
            case 'thisWeek':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - today.getDay());
                endDate = new Date(today);
                break;
            case 'lastWeek':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - today.getDay() - 7);
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                break;
            case 'thisMonth':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today);
                break;
            case 'lastMonth':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            default:
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 30);
                endDate = new Date(today);
        }

        return {
            start: Utils.formatDateForCompare(startDate),
            end: Utils.formatDateForCompare(endDate)
        };
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
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `${icons[type] || '✅'} ${message}`;
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
            
            if (AppState.prospectManager && AppState.prospectManager.unsubscribe) {
                AppState.prospectManager.unsubscribe();
            }
            AppState.prospectManager = null;
            AppState.prospectManagerReady = false;
            
            AppState.currentUser = null;
            AppState.appointments = {};
            AppState.tasks = [];
            AppState.scripts = {};
            AppState.scriptOrder = [];
            AppState.teamMembers = [];
            
            this.updateUI();
            Stats.updateAll();
            if (typeof Scripts !== 'undefined') {
                Scripts.renderSidebar();
            }
            
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

    getProspectCount: function() {
        try {
            if (AppState.prospectManagerReady && AppState.prospectManager && typeof AppState.prospectManager.getAll === 'function') {
                return AppState.prospectManager.getAll().length;
            }
        } catch (e) {
            console.warn('Could not get prospect count:', e);
        }
        return 0;
    },

    getMeetingStats: function() {
        const allAppointments = Data.getAllAppointments();
        let meetingsBooked = 0;
        let meetingsHeld = 0;
        let noShows = 0;
        let cancelled = 0;
        let rescheduled = 0;
        let pending = 0;
        let completed = 0;
        let totalQualityScore = 0;
        let scoredMeetings = 0;
        let totalCalls = allAppointments.length;

        allAppointments.forEach(appt => {
            const status = Utils.getStatus(appt);
            
            if (status === 'Meeting Booked') {
                meetingsBooked++;
            }
            if (status === 'Held') {
                meetingsHeld++;
            }
            if (status === 'Canceled' || status === 'Overdue') {
                if (appt.notes && appt.notes.toLowerCase().includes('no show')) {
                    noShows++;
                } else if (status === 'Canceled') {
                    cancelled++;
                }
            }
            if (status === 'Rescheduled') {
                rescheduled++;
            }
            if (status === 'Pending') {
                pending++;
            }
            if (status === 'Completed') {
                completed++;
            }
            
            const qualityScore = Utils.calculateQualityScore(appt);
            if (qualityScore !== null && qualityScore !== undefined) {
                totalQualityScore += qualityScore;
                scoredMeetings++;
            }
        });

        const avgQualityScore = scoredMeetings > 0 ? (totalQualityScore / scoredMeetings) : 0;
        const per100Calls = totalCalls > 0 ? (meetingsBooked / totalCalls) * 100 : 0;
        const showRate = meetingsBooked > 0 ? (meetingsHeld / meetingsBooked) * 100 : 0;
        const noShowRate = meetingsBooked > 0 ? (noShows / meetingsBooked) * 100 : 0;
        const rescheduleRate = meetingsBooked > 0 ? (rescheduled / meetingsBooked) * 100 : 0;

        return {
            meetingsBooked,
            meetingsHeld,
            noShows,
            cancelled,
            rescheduled,
            pending,
            completed,
            avgQualityScore: Math.round(avgQualityScore * 10) / 10,
            scoredMeetings,
            per100Calls: Math.round(per100Calls * 10) / 10,
            showRate: Math.round(showRate * 10) / 10,
            noShowRate: Math.round(noShowRate * 10) / 10,
            rescheduleRate: Math.round(rescheduleRate * 10) / 10,
            totalCalls
        };
    },

    updateAll: function() {
        DOM.setText('statToday', this.getTodayCount());
        DOM.setText('statWeek', this.getWeekCount());
        DOM.setText('statMonth', this.getMonthCount());
        DOM.setText('avgScore', this.getAverageScore());
        DOM.setText('prospectCount', this.getProspectCount());
        this.updateTaskStats();
    },

    updateTaskStats: function() {
        const pending = AppState.tasks.filter(t => !t.completed).length;
        DOM.setText('pendingTasks', pending);
    }
};

// ================================================================
// DATA LAYER
// ================================================================

const Data = {
    loadUserData: async function(showLoading = true) {
        if (!AppState.currentUser) {
            const localData = localStorage.getItem(STORAGE_KEYS.userData);
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
                    if (typeof Scripts !== 'undefined') {
                        Scripts.renderSidebar();
                        Scripts.loadScript('opening');
                    }
                    Data.initProspectManager();
                    if (typeof FeaturePanel !== 'undefined') {
                        FeaturePanel.refreshCurrentView();
                    }
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

            try {
                const teamSnapshot = await userRef.collection('teamMembers').get();
                if (!teamSnapshot.empty) {
                    AppState.teamMembers = [];
                    teamSnapshot.forEach(doc => {
                        AppState.teamMembers.push({ ...doc.data(), id: doc.id });
                    });
                }
            } catch (teamError) {
                console.warn('Could not load team members:', teamError);
                AppState.teamMembers = CONFIG.DEFAULT_TEAM_MEMBERS;
            }

            Data.initProspectManager();

            localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify({
                scripts: AppState.scripts,
                scriptOrder: AppState.scriptOrder,
                appointments: AppState.appointments,
                tasks: AppState.tasks,
                teamMembers: AppState.teamMembers
            }));

            Stats.updateAll();
            if (typeof Scripts !== 'undefined') {
                Scripts.renderSidebar();
                Scripts.loadScript('opening');
            }
            Auth.closeModal();
            if (statusEl) statusEl.innerHTML = '<i class="fas fa-check"></i> Synced';
            
            if (typeof FeaturePanel !== 'undefined') {
                FeaturePanel.refreshCurrentView();
            }
        } catch (error) {
            console.error('Data Load Error:', error);
            handleError(error, 'Loading Data');
        }
    },

    initProspectManager: function() {
        try {
            if (typeof ProspectManager !== 'undefined' && ProspectManager) {
                if (!ProspectManager.isInitialized) {
                    ProspectManager.init();
                }
                AppState.prospectManager = ProspectManager;
                AppState.prospectManagerReady = true;
                console.log('📋 Prospect Manager initialized successfully');
                Stats.updateAll();
            } else {
                if (!AppState.prospectManagerReady) {
                    setTimeout(() => {
                        Data.initProspectManager();
                    }, 1000);
                }
            }
        } catch (error) {
            console.warn('Could not initialize Prospect Manager:', error);
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
                if (typeof FeaturePanel !== 'undefined') {
                    FeaturePanel.refreshCurrentView();
                }
                localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(AppState.appointments));
            }, error => {
                console.warn('Appointments subscription error:', error);
            });

            AppState.tasksUnsubscribe = userRef.collection('tasks').orderBy('createdAt', 'desc').onSnapshot(snap => {
                AppState.tasks = [];
                snap.forEach(doc => AppState.tasks.push({ ...doc.data(), id: doc.id }));
                Stats.updateTaskStats();
                if (typeof FeaturePanel !== 'undefined') {
                    FeaturePanel.refreshCurrentView();
                }
                localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(AppState.tasks));
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
                localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers));
            }, error => {
                console.warn('Team members subscription error:', error);
            });
        } catch (error) {
            console.warn('Subscription error:', error);
            const appointmentsLocal = localStorage.getItem(STORAGE_KEYS.appointments);
            const tasksLocal = localStorage.getItem(STORAGE_KEYS.tasks);
            const teamLocal = localStorage.getItem(STORAGE_KEYS.teamMembers);
            
            if (appointmentsLocal) {
                try {
                    AppState.appointments = JSON.parse(appointmentsLocal);
                    Stats.updateAll();
                    if (typeof FeaturePanel !== 'undefined') {
                        FeaturePanel.refreshCurrentView();
                    }
                } catch (e) {}
            }
            if (tasksLocal) {
                try {
                    AppState.tasks = JSON.parse(tasksLocal);
                    Stats.updateTaskStats();
                    if (typeof FeaturePanel !== 'undefined') {
                        FeaturePanel.refreshCurrentView();
                    }
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
            "owner_yes": { name: "👔 Owner - Yes", content: "Perfect! Kailan will call you shortly to showcase your preview concept. Is this the best number to connect with you?" },
            "owner_no": { name: "🤔 Not Owner", content: "No worries! Who usually drives your design or advertising decisions? What is the best coordinate to reach them today?" },
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
        
        let email = '';
        if (notes && notes.includes('Email:')) {
            const emailMatch = notes.match(/Email:\s*([^\s\n]+)/);
            if (emailMatch) {
                email = emailMatch[1];
            }
        }
        
        let assignedTo = assigned || 'Daniel';
        if (status === 'Meeting Booked') {
            const meetingBookedCount = this.getMeetingBookedCount();
            assignedTo = meetingBookedCount % 2 === 0 ? 'Kailan' : 'Seif';
        }
        
        const newAppt = {
            id: editId || Utils.generateId(),
            business: business || 'Unknown Business',
            contactName: contactName || 'Unknown Contact',
            role: role || 'Owner',
            phone: phone || '',
            email: email || '',
            time: time || '',
            notes: notes || '',
            assigned: assignedTo,
            status: status,
            crmLink: crmLink || '',
            tags: tags || [],
            date: dateStr,
            qualityScore: null,
            campaign: '',
            setter: assignedTo,
            manager: '',
            outcome: '',
            callCount: 0,
            connected: false,
            meetingHeld: status === 'Held',
            noShow: status === 'Canceled' && notes && notes.toLowerCase().includes('no show'),
            rescheduled: status === 'Rescheduled',
            completed: status === 'Completed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (status === 'Meeting Booked' || status === 'Held') {
            newAppt.qualityScore = Utils.calculateQualityScore(newAppt);
        }
        
        this.syncAppointment(newAppt);
        return newAppt;
    },

    getMeetingBookedCount: function() {
        let count = 0;
        for (let date in AppState.appointments) {
            if (AppState.appointments[date].reports) {
                AppState.appointments[date].reports.forEach(appt => {
                    if (Utils.getStatus(appt) === 'Meeting Booked') {
                        count++;
                    }
                });
            }
        }
        return count;
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
            localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(AppState.appointments));
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
            if (typeof FeaturePanel !== 'undefined') {
                FeaturePanel.refreshCurrentView();
            }
            return true;
        }
        return false;
    },

    updateAppointment: function(dateStr, id, updates) {
        const appt = AppState.appointments[dateStr]?.reports?.find(r => r.id === id);
        if (!appt) return false;
        Object.assign(appt, updates);
        appt.updatedAt = new Date().toISOString();
        
        if (updates.status) {
            appt.qualityScore = Utils.calculateQualityScore(appt);
        }
        
        this.syncAppointment(appt);
        Stats.updateAll();
        if (typeof FeaturePanel !== 'undefined') {
            FeaturePanel.refreshCurrentView();
        }
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
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(AppState.tasks));
        Stats.updateTaskStats();
        if (typeof FeaturePanel !== 'undefined') {
            FeaturePanel.refreshCurrentView();
        }
    },

    toggleTaskComplete: function(id) {
        const task = AppState.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (AppState.isFirebaseReady && AppState.currentUser) {
                firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(id).update({ completed: task.completed }).catch(e => console.warn('Task update error:', e));
            }
            localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(AppState.tasks));
            Stats.updateTaskStats();
            if (typeof FeaturePanel !== 'undefined') {
                FeaturePanel.refreshCurrentView();
            }
        }
    },

    deleteTask: function(id) {
        AppState.tasks = AppState.tasks.filter(t => t.id !== id);
        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(id).delete().catch(e => console.warn('Task delete error:', e));
        }
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(AppState.tasks));
        Stats.updateTaskStats();
        if (typeof FeaturePanel !== 'undefined') {
            FeaturePanel.refreshCurrentView();
        }
    },

    exportToCSV: function(selectedIds = null) {
        let csv = 'Business,Contact,Phone,Email,Date,Time,Status,PrimaryStatus,QualityScore,Notes,Assigned\n';
        const appointments = selectedIds ? this.getSelectedAppointments(selectedIds) : this.getAllAppointments();

        appointments.forEach(appt => {
            const status = Utils.getStatus(appt);
            const primaryStatus = Utils.getPrimaryStatus(status);
            const qualityScore = Utils.calculateQualityScore(appt) || '';
            csv += `"${appt.business || ''}","${appt.contactName || ''}","${appt.phone || ''}","${appt.email || ''}","${appt.date || ''}","${appt.time || ''}","${status}","${primaryStatus}","${qualityScore}","${appt.notes || ''}","${appt.assigned || 'Daniel'}"\n`;
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

    getAppointmentsByStatus: function(status) {
        return this.getAllAppointments().filter(appt => Utils.getStatus(appt) === status);
    },

    getAppointmentsByDateRange: function(startDate, endDate) {
        return this.getAllAppointments().filter(appt => {
            const date = new Date(appt.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return date >= start && date <= end;
        });
    },

    getAppointmentsBySetter: function(setter) {
        if (setter === 'all') return this.getAllAppointments();
        return this.getAllAppointments().filter(appt => appt.assigned === setter || appt.setter === setter);
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
                localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers));
            }
        } else {
            AppState.teamMembers.push(newMember);
            localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers));
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
                localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers));
            }
        } else {
            localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers));
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
                localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers));
            }
        } else {
            localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers));
        }
        
        showToast(`Team member ${member.name} deleted`, 'info');
    }
};

// ================================================================
// ANALYTICS ENGINE - Meeting Performance Dashboard
// ================================================================

const AnalyticsEngine = {
    getFilteredAppointments() {
        const filters = AppState.analyticsFilters || {};
        let appointments = Data.getAllAppointments();
        
        if (filters.timeRange && filters.timeRange !== 'custom') {
            const range = Utils.getDateRange(filters.timeRange);
            appointments = appointments.filter(appt => {
                const date = new Date(appt.date);
                const start = new Date(range.start);
                const end = new Date(range.end);
                end.setHours(23, 59, 59, 999);
                return date >= start && date <= end;
            });
        } else if (filters.timeRange === 'custom' && filters.startDate && filters.endDate) {
            appointments = appointments.filter(appt => {
                const date = new Date(appt.date);
                const start = new Date(filters.startDate);
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                return date >= start && date <= end;
            });
        }
        
        if (filters.setter && filters.setter !== 'all') {
            appointments = appointments.filter(appt => 
                appt.assigned === filters.setter || 
                appt.setter === filters.setter
            );
        }
        
        if (filters.campaign && filters.campaign !== 'all') {
            appointments = appointments.filter(appt => appt.campaign === filters.campaign);
        }
        
        return appointments;
    },

    calculateMetrics(appointments) {
        let meetingsBooked = 0;
        let meetingsHeld = 0;
        let noShows = 0;
        let cancelled = 0;
        let rescheduled = 0;
        let pending = 0;
        let completed = 0;
        let totalQualityScore = 0;
        let scoredMeetings = 0;
        let totalCalls = appointments.length;
        let lowQualityCount = 0;
        let highQualityCount = 0;
        let statusDistribution = {};
        let dailyBookings = {};
        let dailyShowRate = {};
        let qualityDistribution = { '0-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0 };
        let appointmentsBySetter = {};
        let appointmentsByCampaign = {};
        let emailValidCount = 0;
        let emailBouncedCount = 0;
        let emailInvalidCount = 0;

        appointments.forEach(appt => {
            const status = Utils.getStatus(appt);
            const qualityScore = Utils.calculateQualityScore(appt);
            
            if (status === 'Meeting Booked') {
                meetingsBooked++;
            }
            if (status === 'Held') {
                meetingsHeld++;
            }
            if (status === 'Canceled' && appt.notes && appt.notes.toLowerCase().includes('no show')) {
                noShows++;
            }
            if (status === 'Canceled' && !(appt.notes && appt.notes.toLowerCase().includes('no show'))) {
                cancelled++;
            }
            if (status === 'Rescheduled') {
                rescheduled++;
            }
            if (status === 'Pending') {
                pending++;
            }
            if (status === 'Completed') {
                completed++;
            }
            
            if (qualityScore !== null && qualityScore !== undefined) {
                totalQualityScore += qualityScore;
                scoredMeetings++;
                
                if (qualityScore < 5) lowQualityCount++;
                if (qualityScore >= 8) highQualityCount++;
                
                if (qualityScore <= 2) qualityDistribution['0-2']++;
                else if (qualityScore <= 4) qualityDistribution['3-4']++;
                else if (qualityScore <= 6) qualityDistribution['5-6']++;
                else if (qualityScore <= 8) qualityDistribution['7-8']++;
                else qualityDistribution['9-10']++;
            }
            
            statusDistribution[status] = (statusDistribution[status] || 0) + 1;
            
            if (status === 'Meeting Booked' && appt.date) {
                dailyBookings[appt.date] = (dailyBookings[appt.date] || 0) + 1;
            }
            
            if (appt.date) {
                if (!dailyShowRate[appt.date]) {
                    dailyShowRate[appt.date] = { booked: 0, held: 0 };
                }
                if (status === 'Meeting Booked') {
                    dailyShowRate[appt.date].booked++;
                }
                if (status === 'Held') {
                    dailyShowRate[appt.date].held++;
                }
            }
            
            const setter = appt.assigned || appt.setter || 'Unassigned';
            appointmentsBySetter[setter] = (appointmentsBySetter[setter] || 0) + 1;
            
            const campaign = appt.campaign || 'Uncategorized';
            appointmentsByCampaign[campaign] = (appointmentsByCampaign[campaign] || 0) + 1;
            
            if (appt.email) {
                const emailStatus = Utils.getEmailStatus(appt.email);
                if (emailStatus === 'valid') emailValidCount++;
                else if (emailStatus === 'bounced') emailBouncedCount++;
                else emailInvalidCount++;
            }
        });

        const avgQualityScore = scoredMeetings > 0 ? (totalQualityScore / scoredMeetings) : 0;
        const per100Calls = totalCalls > 0 ? (meetingsBooked / totalCalls) * 100 : 0;
        const showRate = meetingsBooked > 0 ? (meetingsHeld / meetingsBooked) * 100 : 0;
        const noShowRate = meetingsBooked > 0 ? (noShows / meetingsBooked) * 100 : 0;
        const rescheduleRate = meetingsBooked > 0 ? (rescheduled / meetingsBooked) * 100 : 0;
        const completionRate = meetingsBooked > 0 ? (completed / meetingsBooked) * 100 : 0;

        const dailyShowRates = {};
        Object.keys(dailyShowRate).forEach(date => {
            const data = dailyShowRate[date];
            dailyShowRates[date] = data.booked > 0 ? (data.held / data.booked) * 100 : 0;
        });

        return {
            meetingsBooked,
            meetingsHeld,
            noShows,
            cancelled,
            rescheduled,
            pending,
            completed,
            avgQualityScore: Math.round(avgQualityScore * 10) / 10,
            scoredMeetings,
            per100Calls: Math.round(per100Calls * 10) / 10,
            showRate: Math.round(showRate * 10) / 10,
            noShowRate: Math.round(noShowRate * 10) / 10,
            rescheduleRate: Math.round(rescheduleRate * 10) / 10,
            completionRate: Math.round(completionRate * 10) / 10,
            totalCalls,
            lowQualityCount,
            highQualityCount,
            statusDistribution,
            dailyBookings,
            dailyShowRates,
            qualityDistribution,
            appointmentsBySetter,
            appointmentsByCampaign,
            emailValidCount,
            emailBouncedCount,
            emailInvalidCount,
            totalEmailCount: emailValidCount + emailBouncedCount + emailInvalidCount
        };
    },

    getDrillDownData(metric, appointments) {
        const filtered = appointments.filter(appt => {
            const status = Utils.getStatus(appt);
            const qualityScore = Utils.calculateQualityScore(appt);
            
            switch(metric) {
                case 'meetingsBooked':
                    return status === 'Meeting Booked';
                case 'meetingsHeld':
                    return status === 'Held';
                case 'noShows':
                    return status === 'Canceled' && appt.notes && appt.notes.toLowerCase().includes('no show');
                case 'cancelled':
                    return status === 'Canceled' && !(appt.notes && appt.notes.toLowerCase().includes('no show'));
                case 'rescheduled':
                    return status === 'Rescheduled';
                case 'pending':
                    return status === 'Pending';
                case 'completed':
                    return status === 'Completed';
                case 'lowQuality':
                    return qualityScore !== null && qualityScore < 5;
                case 'highQuality':
                    return qualityScore !== null && qualityScore >= 8;
                case 'emailValid':
                    return appt.email && Utils.isValidEmail(appt.email);
                case 'emailBounced':
                    return appt.email && Utils.isEmailBounced(appt.email);
                case 'emailInvalid':
                    return appt.email && !Utils.isValidEmail(appt.email) && !Utils.isEmailBounced(appt.email);
                default:
                    return false;
            }
        });
        return filtered;
    },

    getStatusChartData(appointments) {
        const metrics = this.calculateMetrics(appointments);
        const labels = [];
        const data = [];
        const colors = [];
        
        const statusMap = {
            'Meeting Booked': '#3b82f6',
            'Held': '#10b981',
            'Rescheduled': '#f97316',
            'Canceled': '#ef4444',
            'Pending': '#94a3b8',
            'Completed': '#06b6d4'
        };
        
        Object.keys(metrics.statusDistribution).forEach(status => {
            if (metrics.statusDistribution[status] > 0) {
                labels.push(status);
                data.push(metrics.statusDistribution[status]);
                colors.push(statusMap[status] || '#64748b');
            }
        });
        
        return { labels, data, colors };
    },

    getWeeklyTrendData(appointments) {
        const metrics = this.calculateMetrics(appointments);
        const dates = Object.keys(metrics.dailyBookings).sort();
        const last7Days = dates.slice(-7);
        const data = last7Days.map(date => metrics.dailyBookings[date] || 0);
        const labels = last7Days.map(date => Utils.formatDate(date));
        
        return { labels, data };
    },

    getDailyShowRateData(appointments) {
        const metrics = this.calculateMetrics(appointments);
        const dates = Object.keys(metrics.dailyShowRates).sort();
        const last7Days = dates.slice(-7);
        const data = last7Days.map(date => Math.round(metrics.dailyShowRates[date]));
        const labels = last7Days.map(date => Utils.formatDate(date));
        
        return { labels, data };
    },

    getQualityDistributionData(appointments) {
        const metrics = this.calculateMetrics(appointments);
        const labels = ['0-2', '3-4', '5-6', '7-8', '9-10'];
        const data = labels.map(label => metrics.qualityDistribution[label] || 0);
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#10b981'];
        
        return { labels, data, colors };
    }
};

// ================================================================
// [REST OF APP.JS CONTINUES WITH FEATURE PANEL, SCRIPTS, INITIALIZATION]
// ================================================================

// ================================================================
// INITIALIZATION - UPDATED WITH FIREBASE STATUS CHECK
// ================================================================

function initApp() {
    console.log('🚀 Starting ScriptFlow Pro...');
    updateLoadingProgress(10, 'Initializing application...');

    try {
        // Check Firebase availability using centralized status
        if (typeof FirebaseStatus !== 'undefined') {
            AppState.isFirebaseReady = FirebaseStatus.isReady;
            AppState.firebaseStatus = FirebaseStatus;
            console.log(`🔌 Firebase status: ${AppState.isFirebaseReady ? '✅ Connected' : '❌ Offline mode'}`);
            console.log(`📋 Persistence mode: ${FirebaseStatus.persistenceMode}`);
        } else {
            // Fallback check
            AppState.isFirebaseReady = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
            console.log(`🔌 Firebase status (fallback): ${AppState.isFirebaseReady ? '✅ Connected' : '❌ Offline mode'}`);
        }
        
        // Check AI configuration using centralized helpers
        const aiConfigured = typeof isAIConfigured === 'function' && isAIConfigured();
        AppState.isAIAvailable = aiConfigured;
        console.log(`🤖 AI status: ${aiConfigured ? '✅ Configured' : '❌ Not configured'}`);
        
        // Set global flags
        window.__FIREBASE_READY__ = AppState.isFirebaseReady;
        
        // Log version info
        console.log(`📦 App version: ${Date.now()}`);
        console.log(`🌐 Environment: ${AppState.isFirebaseReady ? 'Online' : 'Offline'}`);
        
    } catch (e) {
        console.warn('⚠️ Initialization check error:', e);
        AppState.isFirebaseReady = false;
        AppState.isAIAvailable = false;
    }

    // Check if Firebase is not ready but SDK is loaded
    if (!AppState.isFirebaseReady && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
        console.warn('⚠️ Firebase SDK loaded but not ready, attempting re-initialization...');
        if (typeof initializeFirebase === 'function') {
            try {
                AppState.isFirebaseReady = initializeFirebase();
                console.log(`🔄 Firebase re-initialized: ${AppState.isFirebaseReady ? '✅ Success' : '❌ Failed'}`);
            } catch (initError) {
                console.warn('⚠️ Firebase re-initialization failed:', initError);
            }
        }
    }

    // ================================================================
    // CONTINUE WITH EXISTING INITIALIZATION CODE
    // ================================================================

    // Check if Firebase is available
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

    // Load custom shortcuts from localStorage
    AppState.customShortcuts = JSON.parse(localStorage.getItem(STORAGE_KEYS.customShortcuts) || '{}');
    AppState.shortcuts = { ...CONFIG.DEFAULT_SHORTCUTS, ...AppState.customShortcuts };
    AppState.scriptFavorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.scriptFavorites) || '[]');

    // Load analytics filters from localStorage
    const savedFilters = localStorage.getItem(STORAGE_KEYS.analyticsFilters);
    if (savedFilters) {
        try {
            AppState.analyticsFilters = { ...AppState.analyticsFilters, ...JSON.parse(savedFilters) };
        } catch (e) {}
    }

    // Tools menu toggle
    const toolsHeader = DOM.get('toolsHeader');
    const toolsMenu = DOM.get('toolsMenu');
    const toolsChevron = DOM.get('toolsChevron');
    const toolsOpen = localStorage.getItem(STORAGE_KEYS.toolsMenuOpen) === 'true';

    if (toolsHeader && toolsMenu && toolsChevron) {
        if (toolsOpen) { toolsMenu.classList.add('open'); toolsChevron.classList.add('rotated'); }
        toolsHeader.addEventListener('click', () => {
            const isOpen = toolsMenu.classList.toggle('open');
            toolsChevron.classList.toggle('rotated');
            localStorage.setItem(STORAGE_KEYS.toolsMenuOpen, isOpen);
        });
    }
    updateLoadingProgress(50, 'Setting up UI...');

    // Menu toggle
    const menuToggle = DOM.get('menuToggleBtn');
    const sidebar = DOM.get('mainSidebar');
    const mainContent = DOM.get('mainContent');

    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            mainContent.classList.toggle('expanded');
        });
    }

    // Escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') handleEscapeKey();
    });
    updateLoadingProgress(65, 'Loading features...');

    // ================================================================
    // TOOL ITEMS EVENT LISTENERS
    // ================================================================

    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            if (tool === 'notepad') showToast('📝 Notes feature coming soon!', 'info');
            else if (tool === 'calendar') FeaturePanel.show('calendar', '📅 Appointment & Handoff Calendar');
            else if (tool === 'tasks') FeaturePanel.show('tasks', '📋 Follow-up Tasks Manager');
            else if (tool === 'analytics') {
                AppState.analyticsTab = 'meetings';
                FeaturePanel.show('analytics', '📊 Analytics Hub');
            } else if (tool === 'shortcuts') FeaturePanel.show('shortcuts', '⌨️ Keyboard Shortcuts');
            else if (tool === 'prospects') {
                openProspectManager();
            } else if (tool === 'objections') {
                if (window.ObjectionHandler) {
                    window.ObjectionHandler.toggle();
                } else {
                    showToast('Objection Handler loading...', 'info');
                }
            } else if (tool === 'theme') {
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

    // Feature panel close button
    const closeFeatureBtn = DOM.get('closeFeaturePanelBtn');
    if (closeFeatureBtn) closeFeatureBtn.addEventListener('click', () => {
        FeaturePanel.hide();
        Scripts.loadScript('opening');
    });

    // Script buttons
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

    // Smart Import buttons
    const quickReportBtn = DOM.get('quickReportBtn');
    const parseBtn = DOM.get('parseImportBtn');
    const saveImportBtn = DOM.get('saveImportBtn');
    const closeImportBtn = DOM.get('closeImportBtn');
    const templateBtn = DOM.get('quickTemplateBtn');
    const clipboardBtn = DOM.get('clipboardImportBtn');

    if (quickReportBtn) quickReportBtn.addEventListener('click', openSmartImportEnhanced);
    if (parseBtn) parseBtn.addEventListener('click', parseAndPreviewImportEnhanced);
    if (saveImportBtn) saveImportBtn.addEventListener('click', saveAllImportedAppointments);
    if (closeImportBtn) closeImportBtn.addEventListener('click', closeSmartImportEnhanced);
    if (templateBtn) templateBtn.addEventListener('click', generateImportTemplate);
    if (clipboardBtn) clipboardBtn.addEventListener('click', quickImportFromClipboard);

    // Prospect buttons
    const addProspectBtn = DOM.get('addProspectBtn');
    if (addProspectBtn) addProspectBtn.addEventListener('click', openAddProspect);

    // Bulk actions
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

    // Sign out
    const signOutBtn = DOM.get('signOutBtn');
    if (signOutBtn) signOutBtn.addEventListener('click', () => Auth.signOut());

    // Refresh
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

    // Add script
    const addScriptBtn = DOM.get('addScriptBtnSide');
    if (addScriptBtn) addScriptBtn.addEventListener('click', () => Scripts.createScript());

    // Script search
    const scriptSearch = DOM.get('scriptSearch');
    if (scriptSearch) scriptSearch.addEventListener('input', (e) => {
        AppState.searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.script-item').forEach(item => {
            const name = item.querySelector('.script-name')?.textContent?.toLowerCase() || '';
            item.style.display = name.includes(AppState.searchTerm) ? 'flex' : 'none';
        });
    });

    // Global search
    const searchGlobalBtn = DOM.get('searchGlobalBtn');
    const globalSearchInput = DOM.get('globalSearchInput');
    const globalSearchClose = DOM.get('globalSearchCloseBtn');

    if (searchGlobalBtn) searchGlobalBtn.addEventListener('click', openGlobalSearch);
    if (globalSearchInput) globalSearchInput.addEventListener('input', (e) => performGlobalSearch(e.target.value));
    if (globalSearchClose) globalSearchClose.addEventListener('click', () => {
        const modal = DOM.get('globalSearchModal');
        if (modal) modal.style.display = 'none';
    });

    // CSV Import
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

    // Keyboard shortcuts
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

    // Initialize Prospect Manager
    Data.initProspectManager();

    // Firebase auth state listener
    try {
        if (AppState.isFirebaseReady) {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    AppState.currentUser = user;
                    Auth.updateUI();
                    await Data.loadUserData();
                    updateLoadingProgress(85, 'Loading your data...');
                } else {
                    const localData = localStorage.getItem(STORAGE_KEYS.userData);
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
            const localData = localStorage.getItem(STORAGE_KEYS.userData);
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

    // Click outside modal to close
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    });

    console.log('🚀 ScriptFlow Pro initialized successfully!');
    console.log(`🔌 Firebase status: ${AppState.isFirebaseReady ? '✅ Connected' : '❌ Offline mode'}`);
    console.log(`🤖 AI status: ${AppState.isAIAvailable ? '✅ Configured' : '❌ Not configured'}`);
    console.log('🛡️ Objection Handler available via Ctrl+Shift+O or sidebar menu');
    console.log('📥 Smart Import: Click the "Smart Import" button, paste text, click Parse, review, and Save!');
    console.log('👥 Prospect Manager: Manage all your prospects with the "Prospects" tool');
    console.log('📊 Meeting Performance Dashboard: Available in Analytics Hub > Meetings tab');
}

// ================================================================
// GLOBAL EXPOSURE
// ================================================================

// Core functions
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
window.openSmartImportEnhanced = openSmartImportEnhanced;
window.parseAndPreviewImportEnhanced = parseAndPreviewImportEnhanced;
window.generateImportTemplate = generateImportTemplate;
window.quickImportFromClipboard = quickImportFromClipboard;
window.expandAllRecords = expandAllRecords;
window.collapseAllRecords = collapseAllRecords;
window.toggleImportRecord = toggleImportRecord;
window.saveAllImportedAppointments = saveAllImportedAppointments;
window.CalendarView = CalendarView;
window.handleShortcutAction = handleShortcutAction;
window.Utils = Utils;
window.openProspectManager = openProspectManager;
window.openAddProspect = openAddProspect;
window.viewProspect = viewProspect;
window.editProspect = editProspect;
window.deleteProspect = deleteProspect;
window.AnalyticsEngine = AnalyticsEngine;
window.STORAGE_KEYS = STORAGE_KEYS;

// Start the app
document.addEventListener('DOMContentLoaded', initApp);

console.log('🚀 ScriptFlow Pro loaded successfully');
console.log('🔑 AI Configured:', window.isAIConfigured ? window.isAIConfigured() : 'Unknown');
console.log('🔌 Firebase Ready:', AppState.isFirebaseReady);