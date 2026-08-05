// ================================================================
// SCRIPTFLOW PRO - COMPLETE APPLICATION
// ================================================================

// ================================================================
// PARSER REFERENCE - CHECK AVAILABILITY
// ================================================================

// Check if transcript parser is available
if (typeof transcriptParser !== 'undefined') {
    console.log('📝 Transcript parser available');
    window.transcriptParser = transcriptParser;
} else {
    console.warn('⚠️ Transcript parser not available - using fallback');
    // Create a minimal fallback if parser is not available
    window.transcriptParser = {
        parse: function(transcript, defaultDate) {
            console.warn('⚠️ Using fallback parser');
            // Simple fallback extraction
            const result = {
                business: 'N/A',
                name: 'N/A',
                role: 'N/A',
                phone: 'N/A',
                email: 'N/A',
                date: defaultDate || new Date().toISOString().split('T')[0],
                time: 'N/A',
                status: 'Meeting Booked',
                assigned: 'Daniel',
                notes: '',
                tags: [],
                sentiment: 'Neutral',
                callSummary: '',
                detectedObjections: [],
                meetingQualityScore: 5,
                missingInformation: [],
                confidence: 0.3,
                _confidence: {},
                _evidence: {}
            };
            return result;
        }
    };
}

// ================================================================
// SMART IMPORT FALLBACK FUNCTIONS
// ================================================================

if (typeof window.openSmartImportEnhanced === 'undefined') {
    window.openSmartImportEnhanced = function() {
        const modal = document.getElementById('smartImportModal');
        if (modal) modal.style.display = 'flex';
        else if (window.showToast) window.showToast('Smart Import modal not found', 'error');
        else alert('Smart Import modal not found');
    };
}

if (typeof window.parseAndPreviewImportEnhanced === 'undefined') {
    window.parseAndPreviewImportEnhanced = function() {
        const textArea = document.getElementById('importTextArea');
        if (!textArea) { 
            if (window.showToast) window.showToast('Text area not found', 'error');
            return; 
        }
        const text = textArea.value;
        if (!text.trim()) { 
            if (window.showToast) window.showToast('Please paste a transcript to parse', 'warning');
            return; 
        }
        if (typeof window._parseAndPreviewImport === 'function') {
            window._parseAndPreviewImport();
        } else {
            if (window.showToast) window.showToast('Smart Import parser not loaded. Please refresh the page.', 'error');
        }
    };
}

if (typeof window.saveAllImportedAppointments === 'undefined') {
    window.saveAllImportedAppointments = function() {
        if (window.showToast) window.showToast('Save function not loaded. Please refresh the page.', 'error');
        else alert('Save function not loaded. Please refresh the page.');
    };
}

if (typeof window.closeSmartImportEnhanced === 'undefined') {
    window.closeSmartImportEnhanced = function() {
        const modal = document.getElementById('smartImportModal');
        if (modal) modal.style.display = 'none';
    };
}

if (typeof window.generateImportTemplate === 'undefined') {
    window.generateImportTemplate = function() {
        const textArea = document.getElementById('importTextArea');
        if (!textArea) return;
        const template = `Business Name/Company : [Enter Business Name]
Name : [Enter Contact Name]
Role : [Owner/Manager/Decision Maker]
Phone Number: [Enter Phone Number]
Email: [Enter Email Address]
Demo Time & Date: [Today's Date] at [Time]

Status: [Pending/Hot Transfer/Warm Callback/Meeting Booked/Completed/Canceled]

Notes: [Enter notes about the conversation]`;
        textArea.value = template;
    };
}

if (typeof window.quickImportFromClipboard === 'undefined') {
    window.quickImportFromClipboard = async function() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                window.openSmartImportEnhanced();
                const textArea = document.getElementById('importTextArea');
                if (textArea) textArea.value = text;
                setTimeout(window.parseAndPreviewImportEnhanced, 500);
            }
        } catch (e) {
            if (window.showToast) window.showToast('Unable to read clipboard. Please paste manually.', 'error');
            else alert('Unable to read clipboard. Please paste manually.');
        }
    };
}

if (typeof window.toggleImportRecord === 'undefined') {
    window.toggleImportRecord = function(header) {
        const body = header.nextElementSibling;
        if (body) {
            const isVisible = body.style.display !== 'none';
            body.style.display = isVisible ? 'none' : 'block';
            const toggle = header.querySelector('.record-toggle');
            if (toggle) toggle.textContent = isVisible ? '▶' : '▼';
        }
    };
}

if (typeof window.expandAllRecords === 'undefined') {
    window.expandAllRecords = function() {
        document.querySelectorAll('.import-record .record-body').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.import-record .record-toggle').forEach(el => el.textContent = '▼');
    };
}

if (typeof window.collapseAllRecords === 'undefined') {
    window.collapseAllRecords = function() {
        document.querySelectorAll('.import-record .record-body').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.import-record .record-toggle').forEach(el => el.textContent = '▶');
    };
}

if (typeof window.clearExtractedData === 'undefined') {
    window.clearExtractedData = function() {
        if (!confirm('Clear all extracted data?')) return;
        document.getElementById('importPreview').style.display = 'none';
        document.getElementById('importResultsContainer').innerHTML = '';
        document.getElementById('importSummary').style.display = 'none';
        document.getElementById('saveImportBtn').style.display = 'none';
    };
}

if (typeof window.reviewDuplicate === 'undefined') {
    window.reviewDuplicate = function(index) {
        if (window.showToast) window.showToast('Review duplicate function not loaded. Please refresh.', 'warning');
        else alert('Review duplicate function not loaded. Please refresh.');
    };
}

if (typeof window.updateDuplicate === 'undefined') {
    window.updateDuplicate = function(index) {
        if (window.showToast) window.showToast('Update duplicate function not loaded. Please refresh.', 'warning');
        else alert('Update duplicate function not loaded. Please refresh.');
    };
}

if (typeof window.importAsNew === 'undefined') {
    window.importAsNew = function(index) {
        if (window.showToast) window.showToast('Import as new function not loaded. Please refresh.', 'warning');
        else alert('Import as new function not loaded. Please refresh.');
    };
}

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
    calendarFilters: { meetings: true, callbacks: true, followups: true },
    calendarTimezone: 'Central CDT',
    calendarSearchTerm: '',
    calendarCurrentDate: new Date(),
    importRecords: [],
    importProcessing: false,
    importProgress: 0,
    prospectManager: null,
    prospectManagerReady: false,
    analyticsFilters: { timeRange: 'today', startDate: null, endDate: null, setter: 'all', campaign: 'all', timeZone: 'local' },
    analyticsData: null,
    analyticsLoading: false,
    firebaseStatus: null,
    parserAvailable: typeof transcriptParser !== 'undefined'
};

// ================================================================
// STORAGE KEYS
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
    objectionFavorites: 'objectionFavorites'
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
        if (CONFIG.PRIMARY_STATUSES.includes(status)) return status;
        if (CONFIG.SECONDARY_STATUSES.includes(status)) return 'Completed';
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
        if (status === 'Held') { score = 8; if (appt.tags && appt.tags.includes('vip')) score += 1; if (appt.notes && appt.notes.length > 20) score += 0.5; }
        else if (status === 'Meeting Booked') score = 7;
        else if (status === 'Rescheduled') score = 4;
        else if (status === 'Canceled') score = 2;
        if (appt.email && Utils.isValidEmail(appt.email)) score += 0.5;
        return Math.max(0, Math.min(10, score));
    },
    isValidEmail(email) {
        if (!email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    isEmailBounced(email) {
        if (!email) return false;
        const bounceIndicators = ['bounce', 'undeliverable', 'failed', 'invalid', 'rejected'];
        return bounceIndicators.some(i => email.toLowerCase().includes(i));
    },
    getEmailStatus(email) {
        if (!email) return 'unknown';
        if (this.isEmailBounced(email)) return 'bounced';
        if (this.isValidEmail(email)) return 'valid';
        return 'invalid';
    },
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },
    checkShortcutConflict(newKeys, excludeAction, shortcuts) {
        const conflicts = [];
        for (const [action, shortcut] of Object.entries(shortcuts)) {
            if (action === excludeAction) continue;
            if (shortcut.keys && shortcut.keys.length === newKeys.length) {
                const sorted1 = [...shortcut.keys].sort();
                const sorted2 = [...newKeys].sort();
                if (sorted1.every((k, i) => k === sorted2[i])) conflicts.push(action);
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
    getDateRange(range) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate, endDate;
        switch(range) {
            case 'today': startDate = new Date(today); endDate = new Date(today); break;
            case 'yesterday': startDate = new Date(today); startDate.setDate(startDate.getDate() - 1); endDate = new Date(startDate); break;
            case 'thisWeek': startDate = new Date(today); startDate.setDate(today.getDate() - today.getDay()); endDate = new Date(today); break;
            case 'lastWeek': startDate = new Date(today); startDate.setDate(today.getDate() - today.getDay() - 7); endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 6); break;
            case 'thisMonth': startDate = new Date(today.getFullYear(), today.getMonth(), 1); endDate = new Date(today); break;
            case 'lastMonth': startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); endDate = new Date(today.getFullYear(), today.getMonth(), 0); break;
            default: startDate = new Date(today); startDate.setDate(today.getDate() - 30); endDate = new Date(today);
        }
        return { start: this.formatDateForCompare(startDate), end: this.formatDateForCompare(endDate) };
    },
    formatDateForCompare(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    // Parser helper - check if parser is available
    isParserAvailable() {
        return typeof transcriptParser !== 'undefined' || typeof window.transcriptParser !== 'undefined';
    }
};

// ================================================================
// DOM HELPERS
// ================================================================

const DOM = {
    get(id) { return document.getElementById(id); },
    setText(id, text) { const el = this.get(id); if (el) el.textContent = text; },
    setHTML(id, html) { const el = this.get(id); if (el) el.innerHTML = html; },
    show(id) { const el = this.get(id); if (el) el.style.display = 'block'; },
    hide(id) { const el = this.get(id); if (el) el.style.display = 'none'; },
    toggle(id) { const el = this.get(id); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; },
    createElement(tag, className, html) { const el = document.createElement(tag); if (className) el.className = className; if (html) el.innerHTML = html; return el; }
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

function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    let message = 'An error occurred. Please try again.';
    if (error.code === 'auth/network-request-failed') message = 'Network connection lost. Please check your internet connection.';
    else if (error.code === 'auth/too-many-requests') message = 'Too many failed attempts. Please wait a moment and try again.';
    else if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
    else if (error.code === 'auth/wrong-password') message = 'Incorrect password. Please try again.';
    else if (error.code === 'auth/popup-closed-by-user') message = 'Sign in cancelled.';
    else if (error.message) message = error.message;
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
    if (bar) bar.style.width = Math.min(percent, 100) + '%';
    if (percentDisplay) percentDisplay.textContent = Math.min(percent, 100) + '%';
    if (subtitle && message) subtitle.textContent = message;
}

function hideLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    const appWrapper = document.getElementById('appWrapper');
    if (screen) { screen.classList.add('hidden'); setTimeout(() => { screen.style.display = 'none'; }, 600); }
    if (appWrapper) appWrapper.style.display = 'flex';
}

// ================================================================
// AUTHENTICATION - FULLY INTEGRATED WITH FIREBASE
// ================================================================

const Auth = {
    signInWithGoogle: async function() {
        if (AppState.authInProgress || !AppState.isFirebaseReady) {
            if (!AppState.isFirebaseReady) {
                showToast('Firebase is connecting. Please wait...', 'info');
                await new Promise((resolve) => {
                    const checkReady = setInterval(() => {
                        if (AppState.isFirebaseReady) {
                            clearInterval(checkReady);
                            resolve();
                        }
                    }, 500);
                    setTimeout(() => clearInterval(checkReady), 10000);
                });
                if (!AppState.isFirebaseReady) {
                    showToast('Firebase connection failed. Please refresh.', 'error');
                    return false;
                }
            }
        }
        
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
                    uid: result.user.uid, email: email, username: username,
                    displayName: username, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    goals: { daily: 3, weekly: 15, monthly: 60 }, scriptOrder: ['opening']
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
            if (AppState.appointmentsUnsubscribe) { AppState.appointmentsUnsubscribe(); AppState.appointmentsUnsubscribe = null; }
            if (AppState.tasksUnsubscribe) { AppState.tasksUnsubscribe(); AppState.tasksUnsubscribe = null; }
            if (AppState.teamMembersUnsubscribe) { AppState.teamMembersUnsubscribe(); AppState.teamMembersUnsubscribe = null; }
            if (AppState.prospectManager && AppState.prospectManager.unsubscribe) { AppState.prospectManager.unsubscribe(); }
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
            if (typeof Scripts !== 'undefined') Scripts.renderSidebar();
            if (AppState.isFirebaseReady) await firebase.auth().signOut();
            showToast('Signed out successfully', 'info');
            setTimeout(() => this.showModal(), 300);
        } catch (error) { handleError(error, 'Sign Out'); }
    },
    updateUI: function() {
        const container = DOM.get('userInfo');
        if (!container) return;
        if (!AppState.currentUser) { container.style.display = 'none'; return; }
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
        const isFirebaseReady = AppState.isFirebaseReady;
        modal.innerHTML = `
            <div class="modal-card" style="max-width: 420px;">
                <h2 style="text-align:center; margin-bottom:20px;"><i class="fas fa-microphone-alt" style="color:var(--primary);"></i> ScriptFlow Pro</h2>
                <p style="text-align:center; color:var(--text-muted); margin-bottom:20px; font-size:0.9rem;">Sign in to manage and hand off your leads</p>
                ${isFirebaseReady ? `
                    <button id="googleSignInBtn" class="btn-icon" style="width:100%; justify-content:center; background:#ffffff; color:#333; border:1px solid #dadce0; margin-bottom:16px; padding:10px;">
                        <svg style="width:18px; height:18px; margin-right:8px;" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                        <span style="font-weight:500;">Sign in with Google</span>
                    </button>
                    <div class="auth-divider">or continue with email</div>
                ` : `<div style="padding:16px; background:var(--warning); border-radius:12px; margin-bottom:16px; color:#1e293b;">⚠️ Connecting to Firebase... Please wait</div>`}
                <div id="authFormContainer">
                    <div style="display:flex; gap:8px; margin-bottom:20px;">
                        <button id="loginTabBtn" class="view-btn active" style="flex:1; justify-content:center;">Sign In</button>
                        <button id="signupTabBtn" class="view-btn" style="flex:1; justify-content:center;">Sign Up</button>
                    </div>
                    <div id="loginForm">
                        <div class="form-group"><label>Email</label><input type="email" id="loginEmailInput" placeholder="you@example.com" /></div>
                        <div class="form-group"><label>Password</label><input type="password" id="loginPasswordInput" placeholder="••••••••" /></div>
                        <button id="loginBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--primary); color:white;" ${!isFirebaseReady ? 'disabled' : ''}><i class="fas fa-sign-in-alt"></i> Sign In</button>
                    </div>
                    <div id="signupForm" style="display:none;">
                        <div class="form-group"><label>Username</label><input type="text" id="signupUsernameInput" placeholder="Choose a username" /></div>
                        <div class="form-group"><label>Email</label><input type="email" id="signupEmailInput" placeholder="you@example.com" /></div>
                        <div class="form-group"><label>Password</label><input type="password" id="signupPasswordInput" placeholder="•••••••• (min 6 chars)" /></div>
                        <button id="signupBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--success); color:white;" ${!isFirebaseReady ? 'disabled' : ''}><i class="fas fa-user-plus"></i> Create Account</button>
                    </div>
                </div>
                <div style="margin-top:16px; text-align:center; font-size:0.8rem; color:var(--text-muted);">🔒 Secure Cloud Data Integration</div>
            </div>
        `;
        document.body.appendChild(modal);
        
        if (isFirebaseReady) {
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
        
        modal.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(); });
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
    getTodayCount: function() { return AppState.appointments[Utils.getTodayStr()]?.reports?.length || 0; },
    getWeekCount: function() {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        let total = 0;
        for (let d in AppState.appointments) {
            const date = new Date(d);
            if (date >= start && AppState.appointments[d].reports) total += AppState.appointments[d].reports.length;
        }
        return total;
    },
    getMonthCount: function() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        let total = 0;
        for (let d in AppState.appointments) {
            const date = new Date(d);
            if (date >= start && AppState.appointments[d].reports) total += AppState.appointments[d].reports.length;
        }
        return total;
    },
    getAverageScore: function() {
        let total = 0, count = 0;
        for (let date in AppState.appointments) {
            if (AppState.appointments[date].reports) {
                AppState.appointments[date].reports.forEach(appt => { total += Utils.calculateLeadScore(appt); count++; });
            }
        }
        return count > 0 ? Math.round(total / count) : 0;
    },
    getProspectCount: function() {
        try {
            if (AppState.prospectManagerReady && AppState.prospectManager && typeof AppState.prospectManager.getAll === 'function') {
                return AppState.prospectManager.getAll().length;
            }
        } catch (e) {}
        return 0;
    },
    getMeetingStats: function() {
        const allAppointments = Data.getAllAppointments();
        let meetingsBooked = 0, meetingsHeld = 0, noShows = 0, cancelled = 0, rescheduled = 0, pending = 0, completed = 0;
        let totalQualityScore = 0, scoredMeetings = 0;
        let totalCalls = allAppointments.length;
        allAppointments.forEach(appt => {
            const status = Utils.getStatus(appt);
            if (status === 'Meeting Booked') meetingsBooked++;
            if (status === 'Held') meetingsHeld++;
            if (status === 'Canceled' || status === 'Overdue') {
                if (appt.notes && appt.notes.toLowerCase().includes('no show')) noShows++;
                else if (status === 'Canceled') cancelled++;
            }
            if (status === 'Rescheduled') rescheduled++;
            if (status === 'Pending') pending++;
            if (status === 'Completed') completed++;
            const qualityScore = Utils.calculateQualityScore(appt);
            if (qualityScore !== null && qualityScore !== undefined) { totalQualityScore += qualityScore; scoredMeetings++; }
        });
        const avgQualityScore = scoredMeetings > 0 ? (totalQualityScore / scoredMeetings) : 0;
        const per100Calls = totalCalls > 0 ? (meetingsBooked / totalCalls) * 100 : 0;
        const showRate = meetingsBooked > 0 ? (meetingsHeld / meetingsBooked) * 100 : 0;
        const noShowRate = meetingsBooked > 0 ? (noShows / meetingsBooked) * 100 : 0;
        const rescheduleRate = meetingsBooked > 0 ? (rescheduled / meetingsBooked) * 100 : 0;
        return {
            meetingsBooked, meetingsHeld, noShows, cancelled, rescheduled, pending, completed,
            avgQualityScore: Math.round(avgQualityScore * 10) / 10, scoredMeetings,
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
                    if (typeof Scripts !== 'undefined') { Scripts.renderSidebar(); Scripts.loadScript('opening'); }
                    Data.initProspectManager();
                    if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
                    return;
                } catch (e) {}
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
                await userRef.set({ uid: AppState.currentUser.uid, email: AppState.currentUser.email,
                    username: AppState.currentUser.displayName || AppState.currentUser.email,
                    displayName: AppState.currentUser.displayName || AppState.currentUser.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    goals: { daily: 3, weekly: 15, monthly: 60 }, scriptOrder: ['opening'] });
                return this.loadUserData();
            }
            if (userData.goals) AppState.goals = { daily: userData.goals.daily || 3, weekly: userData.goals.weekly || 15, monthly: userData.goals.monthly || 60 };
            AppState.scriptOrder = userData.scriptOrder || [];
            this.subscribeToChanges();
            const scriptsSnapshot = await userRef.collection('scripts').get();
            AppState.scripts = {};
            scriptsSnapshot.forEach(doc => { const data = doc.data(); AppState.scripts[doc.id] = { name: data.name, content: data.content, version: data.version || 1 }; });
            if (Object.keys(AppState.scripts).length === 0) { await this.createDefaultScripts(); return this.loadUserData(); }
            try {
                const teamSnapshot = await userRef.collection('teamMembers').get();
                if (!teamSnapshot.empty) { AppState.teamMembers = []; teamSnapshot.forEach(doc => { AppState.teamMembers.push({ ...doc.data(), id: doc.id }); }); }
            } catch (teamError) { AppState.teamMembers = CONFIG.DEFAULT_TEAM_MEMBERS; }
            Data.initProspectManager();
            localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify({ scripts: AppState.scripts, scriptOrder: AppState.scriptOrder, appointments: AppState.appointments, tasks: AppState.tasks, teamMembers: AppState.teamMembers }));
            Stats.updateAll();
            if (typeof Scripts !== 'undefined') { Scripts.renderSidebar(); Scripts.loadScript('opening'); }
            Auth.closeModal();
            if (statusEl) statusEl.innerHTML = '<i class="fas fa-check"></i> Synced';
            if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
        } catch (error) { console.error('Data Load Error:', error); handleError(error, 'Loading Data'); }
    },
    initProspectManager: function() {
        try {
            if (typeof ProspectManager !== 'undefined' && ProspectManager) {
                if (!ProspectManager.isInitialized) ProspectManager.init();
                AppState.prospectManager = ProspectManager;
                AppState.prospectManagerReady = true;
                Stats.updateAll();
            } else {
                if (!AppState.prospectManagerReady) setTimeout(() => { Data.initProspectManager(); }, 1000);
            }
        } catch (error) {}
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
                    if (!AppState.appointments[appt.date]) AppState.appointments[appt.date] = { count: 0, note: '', reports: [] };
                    AppState.appointments[appt.date].reports.push({ ...appt, id: doc.id });
                    AppState.appointments[appt.date].count = AppState.appointments[appt.date].reports.length;
                });
                Stats.updateAll();
                if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
                localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(AppState.appointments));
            }, error => { console.warn('Appointments subscription error:', error); });
            AppState.tasksUnsubscribe = userRef.collection('tasks').orderBy('createdAt', 'desc').onSnapshot(snap => {
                AppState.tasks = [];
                snap.forEach(doc => AppState.tasks.push({ ...doc.data(), id: doc.id }));
                Stats.updateTaskStats();
                if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
                localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(AppState.tasks));
            }, error => { console.warn('Tasks subscription error:', error); });
            AppState.teamMembersUnsubscribe = userRef.collection('teamMembers').onSnapshot(snap => {
                if (snap.empty) { AppState.teamMembers = CONFIG.DEFAULT_TEAM_MEMBERS; AppState.teamMembers.forEach(member => { userRef.collection('teamMembers').doc(member.id).set(member); }); }
                else { AppState.teamMembers = []; snap.forEach(doc => { AppState.teamMembers.push({ ...doc.data(), id: doc.id }); }); }
                localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers));
            }, error => { console.warn('Team members subscription error:', error); });
        } catch (error) {
            console.warn('Subscription error:', error);
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
            batch.set(ref.doc(id), { name: script.name, content: script.content, version: 1, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        }
        await batch.commit();
    },
    saveScriptOrder: async function() {
        if (!AppState.currentUser || !AppState.isFirebaseReady) return;
        try { await firebase.firestore().collection('users').doc(AppState.currentUser.uid).update({ scriptOrder: AppState.scriptOrder }); } catch (error) { console.error('Error saving script order:', error); }
    },
    addAppointment: function(dateStr, business, contactName, role, phone, time, notes, assigned, editId = null, status = 'Pending', crmLink = '', tags = []) {
        if (!AppState.currentUser) { showToast('Please sign in first', 'error'); return null; }
        if (!AppState.appointments[dateStr]) AppState.appointments[dateStr] = { count: 0, note: '', reports: [] };
        if (!CONFIG.STATUS_OPTIONS.includes(status)) status = 'Pending';
        let email = '';
        if (notes && notes.includes('Email:')) { const emailMatch = notes.match(/Email:\s*([^\s\n]+)/); if (emailMatch) email = emailMatch[1]; }
        let assignedTo = assigned || 'Daniel';
        if (status === 'Meeting Booked') { const meetingBookedCount = this.getMeetingBookedCount(); assignedTo = meetingBookedCount % 2 === 0 ? 'Kailan' : 'Seif'; }
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
        if (status === 'Meeting Booked' || status === 'Held') newAppt.qualityScore = Utils.calculateQualityScore(newAppt);
        this.syncAppointment(newAppt);
        return newAppt;
    },
    getMeetingBookedCount: function() {
        let count = 0;
        for (let date in AppState.appointments) {
            if (AppState.appointments[date].reports) {
                AppState.appointments[date].reports.forEach(appt => { if (Utils.getStatus(appt) === 'Meeting Booked') count++; });
            }
        }
        return count;
    },
    syncAppointment: async function(appointment) {
        if (!AppState.currentUser) return;
        if (AppState.isFirebaseReady) {
            try { await firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('appointments').doc(appointment.id.toString()).set(appointment, { merge: true }); }
            catch (e) { console.error('Error syncing appointment:', e); this.saveAppointmentsToLocal(); }
        } else { this.saveAppointmentsToLocal(); }
    },
    saveAppointmentsToLocal: function() { try { localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(AppState.appointments)); } catch (e) {} },
    deleteAppointment: function(dateStr, id) {
        if (AppState.appointments[dateStr]?.reports) {
            AppState.appointments[dateStr].reports = AppState.appointments[dateStr].reports.filter(r => r.id !== id);
            if (AppState.appointments[dateStr].reports.length === 0) delete AppState.appointments[dateStr];
            if (AppState.isFirebaseReady && AppState.currentUser) {
                firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('appointments').doc(id.toString()).delete().catch(e => console.warn('Delete error:', e));
            }
            this.saveAppointmentsToLocal();
            Stats.updateAll();
            if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
            return true;
        }
        return false;
    },
    updateAppointment: function(dateStr, id, updates) {
        const appt = AppState.appointments[dateStr]?.reports?.find(r => r.id === id);
        if (!appt) return false;
        Object.assign(appt, updates);
        appt.updatedAt = new Date().toISOString();
        if (updates.status) appt.qualityScore = Utils.calculateQualityScore(appt);
        this.syncAppointment(appt);
        Stats.updateAll();
        if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
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
        const task = { id: Utils.generateId(), description: description || 'New task', dueDate: dueDate || '', priority: priority || 'medium', appointmentId: appointmentId || null, completed: false, createdAt: new Date().toISOString() };
        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(task.id).set(task).catch(e => console.warn('Task save error:', e));
        }
        AppState.tasks.push(task);
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(AppState.tasks));
        Stats.updateTaskStats();
        if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
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
            if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
        }
    },
    deleteTask: function(id) {
        AppState.tasks = AppState.tasks.filter(t => t.id !== id);
        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(id).delete().catch(e => console.warn('Task delete error:', e));
        }
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(AppState.tasks));
        Stats.updateTaskStats();
        if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
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
    getSelectedAppointments: function(ids) { const result = []; ids.forEach(id => { const appt = this.getAppointmentById(id); if (appt) result.push(appt); }); return result; },
    getAllAppointments: function() {
        const result = [];
        for (let date in AppState.appointments) {
            if (AppState.appointments[date].reports) {
                AppState.appointments[date].reports.forEach(appt => { result.push({ ...appt, dateKey: date }); });
            }
        }
        return result.sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));
    },
    getAppointmentsByStatus: function(status) { return this.getAllAppointments().filter(appt => Utils.getStatus(appt) === status); },
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
        const newMember = { id: member.id || Utils.generateId(), name: member.name || 'New Member', role: member.role || 'Agent', email: member.email || '', phone: member.phone || '', avatar: member.avatar || '👤', color: member.color || '#3b82f6', active: true, createdAt: new Date().toISOString() };
        if (AppState.isFirebaseReady && AppState.currentUser) {
            try { await firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('teamMembers').doc(newMember.id).set(newMember); }
            catch (e) { console.error('Error adding team member:', e); AppState.teamMembers.push(newMember); localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers)); }
        } else { AppState.teamMembers.push(newMember); localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers)); }
        showToast(`Team member ${newMember.name} added!`, 'success');
        return newMember;
    },
    updateTeamMember: async function(id, updates) {
        const member = AppState.teamMembers.find(m => m.id === id);
        if (!member) { showToast('Team member not found', 'error'); return; }
        Object.assign(member, updates);
        if (AppState.isFirebaseReady && AppState.currentUser) {
            try { await firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('teamMembers').doc(id).update(updates); }
            catch (e) { console.error('Error updating team member:', e); localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers)); }
        } else { localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers)); }
        showToast(`Team member ${member.name} updated!`, 'success');
    },
    deleteTeamMember: async function(id) {
        const member = AppState.teamMembers.find(m => m.id === id);
        if (!member) { showToast('Team member not found', 'error'); return; }
        if (!confirm(`Delete ${member.name} from the team?`)) return;
        AppState.teamMembers = AppState.teamMembers.filter(m => m.id !== id);
        if (AppState.isFirebaseReady && AppState.currentUser) {
            try { await firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('teamMembers').doc(id).delete(); }
            catch (e) { console.error('Error deleting team member:', e); localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers)); }
        } else { localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(AppState.teamMembers)); }
        showToast(`Team member ${member.name} deleted`, 'info');
    }
};

// ================================================================
// ANALYTICS ENGINE
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
            appointments = appointments.filter(appt => appt.assigned === filters.setter || appt.setter === filters.setter);
        }
        if (filters.campaign && filters.campaign !== 'all') {
            appointments = appointments.filter(appt => appt.campaign === filters.campaign);
        }
        return appointments;
    },
    calculateMetrics(appointments) {
        let meetingsBooked = 0, meetingsHeld = 0, noShows = 0, cancelled = 0, rescheduled = 0, pending = 0, completed = 0;
        let totalQualityScore = 0, scoredMeetings = 0, totalCalls = appointments.length;
        let lowQualityCount = 0, highQualityCount = 0;
        let statusDistribution = {}, dailyBookings = {}, dailyShowRate = {};
        let qualityDistribution = { '0-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0 };
        let appointmentsBySetter = {}, appointmentsByCampaign = {};
        let emailValidCount = 0, emailBouncedCount = 0, emailInvalidCount = 0;
        appointments.forEach(appt => {
            const status = Utils.getStatus(appt);
            const qualityScore = Utils.calculateQualityScore(appt);
            if (status === 'Meeting Booked') meetingsBooked++;
            if (status === 'Held') meetingsHeld++;
            if (status === 'Canceled' && appt.notes && appt.notes.toLowerCase().includes('no show')) noShows++;
            if (status === 'Canceled' && !(appt.notes && appt.notes.toLowerCase().includes('no show'))) cancelled++;
            if (status === 'Rescheduled') rescheduled++;
            if (status === 'Pending') pending++;
            if (status === 'Completed') completed++;
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
            if (status === 'Meeting Booked' && appt.date) dailyBookings[appt.date] = (dailyBookings[appt.date] || 0) + 1;
            if (appt.date) {
                if (!dailyShowRate[appt.date]) dailyShowRate[appt.date] = { booked: 0, held: 0 };
                if (status === 'Meeting Booked') dailyShowRate[appt.date].booked++;
                if (status === 'Held') dailyShowRate[appt.date].held++;
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
            meetingsBooked, meetingsHeld, noShows, cancelled, rescheduled, pending, completed,
            avgQualityScore: Math.round(avgQualityScore * 10) / 10, scoredMeetings,
            per100Calls: Math.round(per100Calls * 10) / 10,
            showRate: Math.round(showRate * 10) / 10,
            noShowRate: Math.round(noShowRate * 10) / 10,
            rescheduleRate: Math.round(rescheduleRate * 10) / 10,
            completionRate: Math.round(completionRate * 10) / 10,
            totalCalls, lowQualityCount, highQualityCount,
            statusDistribution, dailyBookings, dailyShowRates,
            qualityDistribution, appointmentsBySetter, appointmentsByCampaign,
            emailValidCount, emailBouncedCount, emailInvalidCount, totalEmailCount: emailValidCount + emailBouncedCount + emailInvalidCount
        };
    },
    getDrillDownData(metric, appointments) {
        const filtered = appointments.filter(appt => {
            const status = Utils.getStatus(appt);
            const qualityScore = Utils.calculateQualityScore(appt);
            switch(metric) {
                case 'meetingsBooked': return status === 'Meeting Booked';
                case 'meetingsHeld': return status === 'Held';
                case 'noShows': return status === 'Canceled' && appt.notes && appt.notes.toLowerCase().includes('no show');
                case 'cancelled': return status === 'Canceled' && !(appt.notes && appt.notes.toLowerCase().includes('no show'));
                case 'rescheduled': return status === 'Rescheduled';
                case 'pending': return status === 'Pending';
                case 'completed': return status === 'Completed';
                case 'lowQuality': return qualityScore !== null && qualityScore < 5;
                case 'highQuality': return qualityScore !== null && qualityScore >= 8;
                case 'emailValid': return appt.email && Utils.isValidEmail(appt.email);
                case 'emailBounced': return appt.email && Utils.isEmailBounced(appt.email);
                case 'emailInvalid': return appt.email && !Utils.isValidEmail(appt.email) && !Utils.isEmailBounced(appt.email);
                default: return false;
            }
        });
        return filtered;
    },
    getStatusChartData(appointments) {
        const metrics = this.calculateMetrics(appointments);
        const labels = [], data = [], colors = [];
        const statusMap = { 'Meeting Booked': '#3b82f6', 'Held': '#10b981', 'Rescheduled': '#f97316', 'Canceled': '#ef4444', 'Pending': '#94a3b8', 'Completed': '#06b6d4' };
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
                html += `<div class="script-item ${active ? 'active' : ''}" data-id="${id}">
                    <i class="fas fa-grip-vertical drag-handle"></i>
                    <span class="script-name">${Utils.escapeHtml(s.name)}</span>
                    <i class="fas fa-star favorite-star ${isFavorite ? 'active' : ''}" data-id="${id}"></i>
                    <span class="key-hint">${idx < 9 ? idx + 1 : ''}</span>
                    <i class="fas fa-edit script-edit-btn" data-id="${id}" title="Edit script name"></i>
                    <i class="fas fa-trash script-delete-btn" data-id="${id}" title="Delete script"></i>
                </div>`;
            });
        }
        container.innerHTML = html;
        if (window.sortableInstance) { window.sortableInstance.destroy(); window.sortableInstance = null; }
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
            el.addEventListener('click', (e) => { e.stopPropagation(); Scripts.toggleFavorite(el.getAttribute('data-id')); });
        });
        container.querySelectorAll('.script-edit-btn').forEach(el => {
            el.addEventListener('click', (e) => { e.stopPropagation(); const id = el.getAttribute('data-id'); Scripts.editScriptTitle(id); });
        });
        container.querySelectorAll('.script-delete-btn').forEach(el => {
            el.addEventListener('click', (e) => { e.stopPropagation(); const id = el.getAttribute('data-id'); Scripts.deleteScript(id); });
        });
        this.updateKeyHints();
    },
    editScriptTitle: function(id) {
        const script = AppState.scripts[id];
        if (!script) { showToast('Script not found', 'error'); return; }
        const newName = prompt('Edit script name:', script.name);
        if (newName && newName.trim() && newName.trim() !== script.name) {
            const updatedName = newName.trim();
            AppState.scripts[id] = { ...script, name: updatedName };
            if (AppState.isFirebaseReady && AppState.currentUser) {
                firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(id).update({ name: updatedName })
                    .then(() => { showToast('Script name updated!', 'success'); Scripts.renderSidebar(); if (AppState.currentScriptId === id) DOM.setText('currentScriptName', updatedName); })
                    .catch(err => { handleError(err, 'Updating script name'); AppState.scripts[id] = script; Scripts.renderSidebar(); });
            } else {
                const fallback = JSON.parse(localStorage.getItem('scripts_fallback') || '{}');
                if (fallback[id]) { fallback[id].name = updatedName; localStorage.setItem('scripts_fallback', JSON.stringify(fallback)); }
                showToast('Script name updated!', 'success');
                Scripts.renderSidebar();
                if (AppState.currentScriptId === id) DOM.setText('currentScriptName', updatedName);
            }
        }
    },
    deleteScript: function(id) {
        const script = AppState.scripts[id];
        if (!script) { showToast('Script not found', 'error'); return; }
        const scriptCount = Object.keys(AppState.scripts).length;
        if (scriptCount <= 1) { showToast('Cannot delete the last script. Create a new one first.', 'warning'); return; }
        if (!confirm(`Delete script "${script.name}"? This cannot be undone.`)) return;
        delete AppState.scripts[id];
        AppState.scriptOrder = AppState.scriptOrder.filter(scriptId => scriptId !== id);
        AppState.scriptFavorites = AppState.scriptFavorites.filter(scriptId => scriptId !== id);
        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(id).delete()
                .then(() => { showToast(`Script "${script.name}" deleted`, 'info'); if (AppState.currentScriptId === id) { const remainingIds = Object.keys(AppState.scripts); if (remainingIds.length > 0) Scripts.loadScript(remainingIds[0]); } Scripts.renderSidebar(); Scripts.saveScriptOrder(); })
                .catch(err => { handleError(err, 'Deleting script'); AppState.scripts[id] = script; AppState.scriptOrder.push(id); Scripts.renderSidebar(); });
        } else {
            const fallback = JSON.parse(localStorage.getItem('scripts_fallback') || '{}');
            delete fallback[id];
            localStorage.setItem('scripts_fallback', JSON.stringify(fallback));
            showToast(`Script "${script.name}" deleted`, 'info');
            if (AppState.currentScriptId === id) { const remainingIds = Object.keys(AppState.scripts); if (remainingIds.length > 0) Scripts.loadScript(remainingIds[0]); }
            Scripts.renderSidebar();
            Scripts.saveScriptOrder();
        }
    },
    updateKeyHints: function() {
        const visible = Utils.getOrderedVisible(AppState.scripts, AppState.scriptOrder);
        document.querySelectorAll('.script-item').forEach((item, idx) => {
            const hint = item.querySelector('.key-hint');
            if (hint && idx < 9) hint.textContent = idx + 1;
            else if (hint) hint.textContent = '';
        });
    },
    loadScript: function(id) {
        if (!AppState.scripts[id]) {
            const ids = Object.keys(AppState.scripts);
            if (ids.length > 0) id = ids[0];
            else { showToast('No scripts available. Create a new script.', 'warning'); return; }
        }
        if (AppState.isEditing) { if (!confirm('You have unsaved changes. Discard them?')) return; this.cancelEdit(); }
        AppState.currentScriptId = id;
        const script = AppState.scripts[id];
        DOM.setText('currentScriptName', script.name);
        DOM.setHTML('scriptContent', `<div class="script-display">${Utils.escapeHtml(script.content).replace(/\n/g, '<br>')}</div>`);
        DOM.setText('versionNumber', script.version || 1);
        this.updateFavoriteStar();
        this.renderSidebar();
        this.updateKeyHints();
        if (window.ObjectionHandler && typeof window.ObjectionHandler.onScriptLoaded === 'function') window.ObjectionHandler.onScriptLoaded();
    },
    toggleFavorite: function(id) {
        const index = AppState.scriptFavorites.indexOf(id);
        if (index > -1) AppState.scriptFavorites.splice(index, 1);
        else AppState.scriptFavorites.push(id);
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
            contentDiv.innerHTML = `<textarea class="edit-textarea" id="editTextarea">${Utils.escapeHtml(script.content)}</textarea>
                <div class="auto-save-indicator">Auto-saving...</div>`;
        }
        const textarea = DOM.get('editTextarea');
        if (textarea) {
            textarea.focus();
            const saveContent = Utils.debounce((content) => {
                this.saveScriptContent(content);
                const indicator = document.querySelector('.auto-save-indicator');
                if (indicator) { indicator.textContent = '✅ Auto-saved'; indicator.style.color = 'var(--success)'; }
            }, 1000);
            textarea.addEventListener('input', () => {
                AppState.currentEditContent = textarea.value;
                const indicator = document.querySelector('.auto-save-indicator');
                if (indicator) { indicator.textContent = 'Saving...'; indicator.style.color = 'var(--warning)'; }
                if (window.autoSaveTimer) clearTimeout(window.autoSaveTimer);
                window.autoSaveTimer = setTimeout(() => saveContent(textarea.value), 1000);
            });
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.cancelEdit();
                if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); this.saveScriptContent(textarea.value); this.finishEdit(); }
            });
        }
    },
    saveScriptContent: function(content) {
        if (!AppState.currentUser || !AppState.currentScriptId) return;
        const script = AppState.scripts[AppState.currentScriptId];
        if (!script) return;
        const updatedScript = { ...script, content: content, version: (script.version || 1) + 1 };
        if (AppState.isFirebaseReady) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(AppState.currentScriptId).set(updatedScript, { merge: true })
                .then(() => { AppState.scripts[AppState.currentScriptId] = updatedScript; })
                .catch(err => handleError(err, 'Saving script'));
        } else {
            AppState.scripts[AppState.currentScriptId] = updatedScript;
            localStorage.setItem('scripts_fallback', JSON.stringify(AppState.scripts));
        }
    },
    finishEdit: function() { AppState.isEditing = false; AppState.shortcutsEnabled = true; DOM.show('editScriptBtn'); DOM.hide('saveScriptBtn'); DOM.hide('cancelEditBtn'); DOM.hide('editStatusBadge'); this.loadScript(AppState.currentScriptId); showToast('Changes saved', 'success'); },
    cancelEdit: function() { if (!confirm('Discard your changes?')) return; AppState.isEditing = false; AppState.shortcutsEnabled = true; DOM.show('editScriptBtn'); DOM.hide('saveScriptBtn'); DOM.hide('cancelEditBtn'); DOM.hide('editStatusBadge'); this.loadScript(AppState.currentScriptId); },
    resetScript: function() {
        if (!confirm('Reset this script to its original content?')) return;
        if (AppState.currentUser && AppState.currentScriptId) {
            const script = AppState.scripts[AppState.currentScriptId];
            if (AppState.isFirebaseReady) {
                firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(AppState.currentScriptId).set({ name: script.name, content: script.content, version: 1 }, { merge: true })
                    .then(() => { showToast('Script reset', 'info'); Data.loadUserData(true); })
                    .catch(err => handleError(err, 'Resetting script'));
            } else { script.version = 1; localStorage.setItem('scripts_fallback', JSON.stringify(AppState.scripts)); showToast('Script reset locally', 'info'); this.loadScript(AppState.currentScriptId); }
        }
    },
    createScript: function() {
        if (!AppState.currentUser) { showToast('Please sign in first', 'error'); return; }
        const name = prompt('Enter new script name:');
        if (!name || !name.trim()) return;
        const scriptName = name.trim();
        const id = 'script_' + Utils.generateId();
        const newScript = { name: scriptName, content: 'New script content...\n\nStart writing your script here.', version: 1 };
        AppState.scripts[id] = newScript;
        AppState.scriptOrder.push(id);
        if (AppState.isFirebaseReady) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(id).set({ name: scriptName, content: newScript.content, version: 1, createdAt: firebase.firestore.FieldValue.serverTimestamp() })
                .then(() => { showToast(`Script "${scriptName}" created! 🎉`, 'success'); Scripts.renderSidebar(); Scripts.loadScript(id); Data.saveScriptOrder(); })
                .catch(err => { handleError(err, 'Creating script'); delete AppState.scripts[id]; AppState.scriptOrder = AppState.scriptOrder.filter(sid => sid !== id); Scripts.renderSidebar(); });
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
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).update({ scriptOrder: AppState.scriptOrder }).catch(err => console.warn('Error saving script order:', err));
        } else {
            const fallback = JSON.parse(localStorage.getItem('scripts_fallback') || '{}');
            fallback.scriptOrder = AppState.scriptOrder;
            localStorage.setItem('scripts_fallback', JSON.stringify(fallback));
        }
    },
    isEditing: function() { return AppState.isEditing; }
};

// ================================================================
// FEATURE PANEL
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
            const iconMap = { 'calendar': 'fa-calendar-alt', 'tasks': 'fa-tasks', 'analytics': 'fa-chart-pie', 'shortcuts': 'fa-keyboard', 'prospects': 'fa-users' };
            featureTitle.innerHTML = `<i class="fas ${iconMap[featureType] || 'fa-sticky-note'}"></i> ${title}`;
        }
        const container = DOM.get('viewToggleContainer');
        if (container) {
            let html = '';
            if (featureType === 'calendar') {
                html = `<div class="view-toggle" id="calendarViewToggle">
                    <button id="calendarViewBtn" class="view-btn active">📅 Calendar</button>
                    <button id="listViewBtn" class="view-btn">📋 List</button>
                </div>`;
            } else if (featureType === 'analytics') {
                html = `<div class="view-toggle" id="analyticsTabContainer">
                    <button id="insightsTabBtn" class="view-btn ${AppState.analyticsTab === 'insights' ? 'active' : ''}">📊 Insights</button>
                    <button id="reportsTabBtn" class="view-btn ${AppState.analyticsTab === 'reports' ? 'active' : ''}">📈 Reports</button>
                    <button id="meetingsTabBtn" class="view-btn ${AppState.analyticsTab === 'meetings' ? 'active' : ''}">📅 Meetings</button>
                </div>`;
            } else if (featureType === 'tasks') {
                html = `<div class="view-toggle" id="taskViewToggle">
                    <button id="taskListViewBtn" class="view-btn active">📋 All</button>
                    <button id="taskPendingBtn" class="view-btn">⏳ Pending</button>
                    <button id="taskTodayBtn" class="view-btn">📅 Today</button>
                </div>`;
            } else if (featureType === 'prospects') {
                html = `<div class="view-toggle" id="prospectsViewToggle">
                    <button id="prospectsListBtn" class="view-btn active">📋 List</button>
                    <button id="prospectsStatsBtn" class="view-btn">📊 Stats</button>
                </div>`;
            }
            container.innerHTML = html;
            this.attachViewToggleEvents(featureType);
        }
        scriptPanel.style.display = 'none';
        featurePanel.style.display = 'block';
        if (featureBody) {
            if (featureType === 'calendar') CalendarView.render(featureBody);
            else if (featureType === 'tasks') this.renderTasks(featureBody);
            else if (featureType === 'analytics') this.renderAnalytics(featureBody);
            else if (featureType === 'shortcuts') this.renderShortcuts(featureBody);
            else if (featureType === 'prospects') this.renderProspects(featureBody);
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
        if (AppState.currentView === 'calendar') CalendarView.render(body);
        else if (AppState.currentView === 'tasks') this.renderTasks(body);
        else if (AppState.currentView === 'analytics') this.renderAnalytics(body);
        else if (AppState.currentView === 'shortcuts') this.renderShortcuts(body);
        else if (AppState.currentView === 'prospects') this.renderProspects(body);
    },
    attachViewToggleEvents: function(featureType) {
        if (featureType === 'calendar') {
            const calendarBtn = DOM.get('calendarViewBtn');
            const listBtn = DOM.get('listViewBtn');
            if (calendarBtn) calendarBtn.addEventListener('click', () => { AppState.calendarView = 'calendar'; calendarBtn.classList.add('active'); if (listBtn) listBtn.classList.remove('active'); this.refreshCurrentView(); });
            if (listBtn) listBtn.addEventListener('click', () => { AppState.calendarView = 'list'; listBtn.classList.add('active'); if (calendarBtn) calendarBtn.classList.remove('active'); this.refreshCurrentView(); });
        } else if (featureType === 'analytics') {
            const insightsBtn = DOM.get('insightsTabBtn');
            const reportsBtn = DOM.get('reportsTabBtn');
            const meetingsBtn = DOM.get('meetingsTabBtn');
            if (insightsBtn) insightsBtn.addEventListener('click', () => { AppState.analyticsTab = 'insights'; insightsBtn.classList.add('active'); if (reportsBtn) reportsBtn.classList.remove('active'); if (meetingsBtn) meetingsBtn.classList.remove('active'); this.renderAnalytics(DOM.get('featurePanelBody')); });
            if (reportsBtn) reportsBtn.addEventListener('click', () => { AppState.analyticsTab = 'reports'; reportsBtn.classList.add('active'); if (insightsBtn) insightsBtn.classList.remove('active'); if (meetingsBtn) meetingsBtn.classList.remove('active'); this.renderAnalytics(DOM.get('featurePanelBody')); });
            if (meetingsBtn) meetingsBtn.addEventListener('click', () => { AppState.analyticsTab = 'meetings'; meetingsBtn.classList.add('active'); if (insightsBtn) insightsBtn.classList.remove('active'); if (reportsBtn) reportsBtn.classList.remove('active'); this.renderAnalytics(DOM.get('featurePanelBody')); });
        } else if (featureType === 'tasks') {
            const allBtn = DOM.get('taskListViewBtn');
            const pendingBtn = DOM.get('taskPendingBtn');
            const todayBtn = DOM.get('taskTodayBtn');
            if (allBtn) allBtn.addEventListener('click', () => { AppState.taskFilter = 'all'; allBtn.classList.add('active'); if (pendingBtn) pendingBtn.classList.remove('active'); if (todayBtn) todayBtn.classList.remove('active'); this.refreshCurrentView(); });
            if (pendingBtn) pendingBtn.addEventListener('click', () => { AppState.taskFilter = 'pending'; pendingBtn.classList.add('active'); if (allBtn) allBtn.classList.remove('active'); if (todayBtn) todayBtn.classList.remove('active'); this.refreshCurrentView(); });
            if (todayBtn) todayBtn.addEventListener('click', () => { AppState.taskFilter = 'today'; todayBtn.classList.add('active'); if (allBtn) allBtn.classList.remove('active'); if (pendingBtn) pendingBtn.classList.remove('active'); this.refreshCurrentView(); });
        } else if (featureType === 'prospects') {
            const listBtn = DOM.get('prospectsListBtn');
            const statsBtn = DOM.get('prospectsStatsBtn');
            if (listBtn) listBtn.addEventListener('click', () => { listBtn.classList.add('active'); if (statsBtn) statsBtn.classList.remove('active'); this.refreshCurrentView(); });
            if (statsBtn) statsBtn.addEventListener('click', () => { statsBtn.classList.add('active'); if (listBtn) listBtn.classList.remove('active'); this.refreshCurrentView(); });
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
                    filteredTasks.map(t => `<div class="task-card ${t.completed ? 'task-completed' : ''}">
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
                    </div>`).join('')}
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
            cb.addEventListener('change', () => { Data.toggleTaskComplete(cb.getAttribute('data-id')); setTimeout(() => this.renderTasks(container), 100); });
        });
        container.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', () => { if (confirm('Delete this task?')) { Data.deleteTask(btn.getAttribute('data-id')); this.renderTasks(container); } });
        });
    },
    renderProspects: function(container) {
        if (!container) return;
        let prospects = [];
        if (AppState.prospectManagerReady && AppState.prospectManager) {
            try { prospects = AppState.prospectManager.getAll(); } catch (e) {}
        }
        container.innerHTML = `
            <div class="prospects-section fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
                    <h3><i class="fas fa-users"></i> Prospects (${prospects.length})</h3>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="btn-icon" onclick="window.openAddProspect && window.openAddProspect()" style="background:var(--primary); color:white;">
                            <i class="fas fa-plus"></i> Add Prospect
                        </button>
                        <input type="text" id="prospectSearchInput" placeholder="🔍 Search prospects..." style="padding:8px 14px; border-radius:20px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:0.85rem; min-width:180px;" />
                    </div>
                </div>
                <div id="prospectListContainer">
                    ${prospects.length === 0 ? `<div class="empty-state"><i class="fas fa-users"></i><p>No prospects yet</p><span style="font-size:0.8rem; color:var(--text-muted);">Add your first prospect using Smart Import or the "Add Prospect" button</span></div>` :
                    `<div class="prospect-grid">${prospects.map(prospect => {
                        const score = prospect.leadScore || 0;
                        const scoreClass = score >= 70 ? 'score-hot' : score >= 40 ? 'score-warm' : 'score-cold';
                        const statusClass = Utils.getStatusClass(prospect.status);
                        return `<div class="prospect-card" data-id="${prospect.id}" onclick="window.viewProspect && window.viewProspect('${prospect.id}')">
                            <div class="prospect-card-header">
                                <div class="prospect-card-title">
                                    <span class="prospect-business">${Utils.escapeHtml(prospect.business)}</span>
                                    <span class="prospect-name">${Utils.escapeHtml(prospect.name)}</span>
                                </div>
                                <div class="prospect-card-badges">
                                    ${prospect.status ? `<span class="status-tag ${statusClass}">${Utils.escapeHtml(prospect.status)}</span>` : ''}
                                    <span class="score-badge ${scoreClass}">${score} Pts</span>
                                </div>
                            </div>
                            <div class="prospect-card-body">
                                <div class="prospect-details">
                                    ${prospect.role ? `<span class="prospect-detail"><i class="fas fa-briefcase"></i> ${Utils.escapeHtml(prospect.role)}</span>` : ''}
                                    ${prospect.phone ? `<span class="prospect-detail"><i class="fas fa-phone"></i> ${Utils.escapeHtml(prospect.phone)}</span>` : ''}
                                    ${prospect.email ? `<span class="prospect-detail"><i class="fas fa-envelope"></i> ${Utils.escapeHtml(prospect.email)}</span>` : ''}
                                    ${prospect.date ? `<span class="prospect-detail"><i class="fas fa-calendar"></i> ${Utils.formatDate(prospect.date)}</span>` : ''}
                                </div>
                                ${prospect.notes ? `<div class="prospect-notes">${Utils.escapeHtml(prospect.notes.substring(0, 100))}${prospect.notes.length > 100 ? '...' : ''}</div>` : ''}
                                ${prospect.tags && prospect.tags.length > 0 ? `<div class="prospect-tags">${prospect.tags.map(tag => `<span class="prospect-tag">#${Utils.escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                                <div class="prospect-meta">
                                    <span class="prospect-source">${prospect.source || 'Manual'}</span>
                                    <span class="prospect-date">${prospect.createdAt ? Utils.formatDate(prospect.createdAt) : ''}</span>
                                </div>
                            </div>
                        </div>`;
                    }).join('')}</div>`}
                </div>
            </div>
        `;
        const searchInput = container.querySelector('#prospectSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                const cards = container.querySelectorAll('.prospect-card');
                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    card.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
                });
            });
        }
    },
    renderAnalytics: function(container) {
        if (!container) return;
        const filteredAppointments = AnalyticsEngine.getFilteredAppointments();
        const metrics = AnalyticsEngine.calculateMetrics(filteredAppointments);
        const statusData = AnalyticsEngine.getStatusChartData(filteredAppointments);
        let total = filteredAppointments.length;
        let completed = 0, hTransfers = 0, wCallbacks = 0;
        let statusCounts = {};
        filteredAppointments.forEach(appt => {
            const status = Utils.getStatus(appt);
            const primaryStatus = Utils.getPrimaryStatus(status);
            statusCounts[primaryStatus] = (statusCounts[primaryStatus] || 0) + 1;
            if (primaryStatus === 'Completed') completed++;
            if (primaryStatus === 'Hot Transfer') hTransfers++;
            if (primaryStatus === 'Warm Callback') wCallbacks++;
        });
        const hasData = total > 0;
        container.innerHTML = `
            <div class="analytics-container fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
                    <h3><i class="fas fa-chart-pie"></i> Analytics Dashboard</h3>
                    <span class="version-chip"><i class="fas fa-database"></i> ${total} Records</span>
                </div>
                <div class="report-metrics scale-in">
                    <div class="metric-card"><div class="metric-value">${total}</div><div class="metric-label">Total Appointments</div></div>
                    <div class="metric-card"><div class="metric-value" style="color:var(--success);">${completed}</div><div class="metric-label">✅ Completed</div></div>
                    <div class="metric-card"><div class="metric-value" style="color:#dc2626;">${hTransfers}</div><div class="metric-label">🔥 Hot Transfers</div></div>
                    <div class="metric-card"><div class="metric-value" style="color:var(--warning);">${wCallbacks}</div><div class="metric-label">📞 Warm Callbacks</div></div>
                    <div class="metric-card"><div class="metric-value" style="color:#8b5cf6;">${metrics.showRate}%</div><div class="metric-label">📊 Show Rate</div></div>
                    <div class="metric-card"><div class="metric-value" style="color:#f59e0b;">${metrics.avgQualityScore}</div><div class="metric-label">⭐ Avg Quality Score</div></div>
                </div>
                ${hasData ? `
                    <div class="feature-card">
                        <h4>📊 Status Distribution</h4>
                        ${Object.entries(statusCounts).map(([status, count]) =>
                            `<div style="display:flex; justify-content:space-between; padding:4px 8px; background:var(--bg-primary); border-radius:6px; margin:4px 0;">
                                <span>${status}</span>
                                <span style="font-weight:600;">${count} (${Math.round((count/total)*100)}%)</span>
                            </div>`
                        ).join('')}
                    </div>
                    ${statusData.labels && statusData.labels.length > 0 ? `
                        <div class="feature-card" style="margin-top:8px;">
                            <h4>📈 Status Chart</h4>
                            <div class="chart-container-sm" style="height:180px;">
                                <canvas id="analyticsStatusChart"></canvas>
                            </div>
                        </div>
                    ` : ''}
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-chart-pie"></i>
                        <p>No data available for the selected filters</p>
                        <span style="font-size:0.8rem; color:var(--text-muted);">Try adjusting your date range or filters</span>
                    </div>
                `}
            </div>
        `;
        if (hasData && statusData.labels && statusData.labels.length > 0) {
            setTimeout(() => {
                const ctx = document.getElementById('analyticsStatusChart');
                if (ctx) {
                    if (window._analyticsChart) window._analyticsChart.destroy();
                    window._analyticsChart = new Chart(ctx, {
                        type: 'doughnut',
                        data: { labels: statusData.labels, datasets: [{ data: statusData.data, backgroundColor: statusData.colors || ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#94a3b8', '#06b6d4'], borderWidth: 2, borderColor: 'var(--bg-card)' }] },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 10, color: 'var(--text-secondary)' } } } }, cutout: '60%' }
                    });
                }
            }, 300);
        }
    },
    renderShortcuts: function(container) {
        if (!container) return;
        const shortcuts = AppState.shortcuts;
        let html = `<div class="shortcuts-container fade-in">
            <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts Manager</h3>
            <p style="color:var(--text-muted); margin-bottom:16px;">View and customize keyboard shortcuts for quick access to features.</p>
            <div style="margin-bottom:16px; display:flex; gap:8px; flex-wrap:wrap;">
                <button id="shortcutsResetDefaultsBtn" class="btn-icon" style="background:var(--warning); color:#1e293b;"><i class="fas fa-undo"></i> Reset Defaults</button>
            </div>
            <div id="shortcutsListContainer">`;
        for (const [action, shortcut] of Object.entries(shortcuts)) {
            const conflict = Utils.checkShortcutConflict(shortcut.keys, action, shortcuts);
            html += `<div class="shortcut-item ${conflict.length > 0 ? 'conflict' : ''}">
                <div class="shortcut-info">
                    <div class="shortcut-name">${action}</div>
                    <div class="shortcut-description">${shortcut.description || ''}</div>
                </div>
                <div class="shortcut-keys">
                    ${shortcut.keys.map(k => `<kbd>${k}</kbd>`).join(' <span class="shortcut-separator">+</span> ')}
                    ${conflict.length > 0 ? ` <span class="shortcut-conflict">⚠️ Conflict: ${conflict.join(', ')}</span>` : ''}
                    <i class="fas fa-pen shortcut-edit" onclick="window.openShortcutEdit && window.openShortcutEdit('${action}')" title="Edit shortcut"></i>
                </div>
            </div>`;
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
        if (statusSelect) { statusSelect.innerHTML = CONFIG.STATUS_OPTIONS.map(s => `<option value="${s}" ${s === 'Pending' ? 'selected' : ''}>${s}</option>`).join(''); }
        const assignedSelect = DOM.get('newApptAssigned');
        if (assignedSelect) { assignedSelect.innerHTML = AppState.teamMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join(''); }
        ['newApptBusiness', 'newApptContact', 'newApptPhone', 'newApptEmail', 'newApptTime', 'newApptNotes'].forEach(id => { const el = DOM.get(id); if (el) el.value = ''; });
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
                if (!bus || !contact) { showToast('Please fill in all required fields', 'error'); return; }
                const member = AppState.teamMembers.find(m => m.id === assigned);
                Data.addAppointment(date, bus, contact, 'Owner', phone, time, notes + (email ? `\nEmail: ${email}` : ''), member ? member.name : 'Daniel', null, status);
                modal.style.display = 'none';
                showToast('Appointment added successfully! 🎉', 'success');
                FeaturePanel.refreshCurrentView();
            };
        }
        if (cancelBtn) cancelBtn.onclick = () => { modal.style.display = 'none'; };
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }
};

// ================================================================
// CALENDAR VIEW
// ================================================================

const CalendarView = {
    render: function(container) {
        if (!container) return;
        const currentDate = AppState.calendarCurrentDate || new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();
        const todayStr = Utils.getTodayStr();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const monthAppointments = this.getAppointmentsForMonth(year, month);
        const filteredAppointments = this.filterAppointments(monthAppointments);
        const appointmentsByDate = {};
        filteredAppointments.forEach(appt => {
            if (!appointmentsByDate[appt.date]) appointmentsByDate[appt.date] = [];
            appointmentsByDate[appt.date].push(appt);
        });
        let html = `<div class="calendar-full-container fade-in">
            <div class="calendar-toolbar">
                <div class="calendar-toolbar-left">
                    <div class="view-selector">
                        <button class="view-btn ${AppState.calendarViewMode === 'month' ? 'active' : ''}" data-view="month">Month</button>
                        <button class="view-btn ${AppState.calendarViewMode === 'week' ? 'active' : ''}" data-view="week">Week</button>
                        <button class="view-btn ${AppState.calendarViewMode === 'day' ? 'active' : ''}" data-view="day">Day</button>
                        <button class="view-btn ${AppState.calendarViewMode === 'list' ? 'active' : ''}" data-view="list">List</button>
                    </div>
                    <div class="calendar-nav-group">
                        <button class="btn-icon" id="calPrevBtn"><i class="fas fa-chevron-left"></i></button>
                        <button class="btn-icon" id="calTodayBtn">Today</button>
                        <button class="btn-icon" id="calNextBtn"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <span class="calendar-current-month">${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="calendar-toolbar-right">
                    <div class="search-wrapper">
                        <i class="fas fa-search"></i>
                        <input type="text" id="calendarSearchInput" placeholder="Search contact..." value="${AppState.calendarSearchTerm || ''}" />
                    </div>
                    <button class="btn-icon" id="calendarAddEventBtn"><i class="fas fa-plus"></i> Add</button>
                </div>
            </div>
            <div class="calendar-filter-chips">
                <button class="filter-chip ${AppState.calendarFilters.meetings ? 'active' : ''}" data-filter="meetings">
                    <span class="filter-dot" style="background:#3b82f6;"></span> Meetings
                </button>
                <button class="filter-chip ${AppState.calendarFilters.callbacks ? 'active' : ''}" data-filter="callbacks">
                    <span class="filter-dot" style="background:#f59e0b;"></span> Callbacks
                </button>
                <button class="filter-chip ${AppState.calendarFilters.followups ? 'active' : ''}" data-filter="followups">
                    <span class="filter-dot" style="background:#10b981;"></span> Follow-ups
                </button>
            </div>
            <div class="calendar-body">
                <div class="calendar-month-grid">
                    ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div class="calendar-day-header">${d}</div>`).join('')}`;
        const startDay = firstDay;
        for (let i = startDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const hasEvents = appointmentsByDate[dateStr] && appointmentsByDate[dateStr].length > 0;
            html += `<div class="calendar-day other-month ${isToday ? 'today' : ''}" data-date="${dateStr}">
                <span class="day-number">${day}</span>
                ${hasEvents ? `<span class="day-event-indicator">${appointmentsByDate[dateStr].length}</span>` : ''}
            </div>`;
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const hasEvents = appointmentsByDate[dateStr] && appointmentsByDate[dateStr].length > 0;
            const events = appointmentsByDate[dateStr] || [];
            let eventsHtml = '';
            if (hasEvents) {
                eventsHtml = `<div class="day-events">
                    ${events.slice(0, 2).map(event => {
                        const color = Utils.getStatusColor(Utils.getStatus(event));
                        return `<div class="day-event" style="border-left-color: ${color};" data-id="${event.id}" onclick="window.showAppointmentDetail && window.showAppointmentDetail('${event.id}')">
                            <span class="event-time">${event.time || 'No time'}</span>
                            <span class="event-title">${Utils.escapeHtml(event.business)}</span>
                        </div>`;
                    }).join('')}
                    ${events.length > 2 ? `<div class="day-event-more">+${events.length - 2} more</div>` : ''}
                </div>`;
            }
            html += `<div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" data-date="${dateStr}">
                <span class="day-number">${d}</span>
                ${eventsHtml}
            </div>`;
        }
        const totalDays = startDay + daysInMonth;
        const remainingDays = (7 - (totalDays % 7)) % 7;
        for (let d = 1; d <= remainingDays; d++) {
            const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            html += `<div class="calendar-day other-month" data-date="${dateStr}">
                <span class="day-number">${d}</span>
            </div>`;
        }
        html += `</div></div></div>`;
        container.innerHTML = html;
        this.attachEvents(container);
    },
    getAppointmentsForMonth: function(year, month) {
        const result = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (AppState.appointments[dateStr]?.reports) result.push(...AppState.appointments[dateStr].reports);
        }
        return result;
    },
    filterAppointments: function(appointments) {
        const filters = AppState.calendarFilters;
        return appointments.filter(appt => {
            const status = Utils.getStatus(appt);
            const isMeeting = ['Hot Transfer', 'Meeting Booked', 'Held'].includes(status);
            const isCallback = status === 'Warm Callback';
            const isFollowup = ['Pending', 'Rescheduled'].includes(status);
            const showMeeting = filters.meetings && isMeeting;
            const showCallback = filters.callbacks && isCallback;
            const showFollowup = filters.followups && isFollowup;
            if (!filters.meetings && !filters.callbacks && !filters.followups) return true;
            return showMeeting || showCallback || showFollowup;
        });
    },
    attachEvents: function(container) {
        container.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                AppState.calendarViewMode = view;
                const body = DOM.get('featurePanelBody');
                if (body && AppState.currentView === 'calendar') CalendarView.render(body);
                showToast(`Switched to ${view} view`, 'info');
            });
        });
        const prevBtn = container.querySelector('#calPrevBtn');
        const nextBtn = container.querySelector('#calNextBtn');
        const todayBtn = container.querySelector('#calTodayBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => {
            const current = AppState.calendarCurrentDate || new Date();
            if (AppState.calendarViewMode === 'month') current.setMonth(current.getMonth() - 1);
            else if (AppState.calendarViewMode === 'week') current.setDate(current.getDate() - 7);
            else if (AppState.calendarViewMode === 'day') current.setDate(current.getDate() - 1);
            AppState.calendarCurrentDate = current;
            const body = DOM.get('featurePanelBody');
            if (body && AppState.currentView === 'calendar') CalendarView.render(body);
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            const current = AppState.calendarCurrentDate || new Date();
            if (AppState.calendarViewMode === 'month') current.setMonth(current.getMonth() + 1);
            else if (AppState.calendarViewMode === 'week') current.setDate(current.getDate() + 7);
            else if (AppState.calendarViewMode === 'day') current.setDate(current.getDate() + 1);
            AppState.calendarCurrentDate = current;
            const body = DOM.get('featurePanelBody');
            if (body && AppState.currentView === 'calendar') CalendarView.render(body);
        });
        if (todayBtn) todayBtn.addEventListener('click', () => {
            AppState.calendarCurrentDate = new Date();
            const body = DOM.get('featurePanelBody');
            if (body && AppState.currentView === 'calendar') CalendarView.render(body);
            showToast('Today', 'info');
        });
        container.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.getAttribute('data-filter');
                AppState.calendarFilters[filter] = !AppState.calendarFilters[filter];
                const body = DOM.get('featurePanelBody');
                if (body && AppState.currentView === 'calendar') CalendarView.render(body);
            });
        });
        const addBtn = container.querySelector('#calendarAddEventBtn');
        if (addBtn) addBtn.addEventListener('click', () => { if (typeof FeaturePanel !== 'undefined') FeaturePanel.openQuickAdd(Utils.getTodayStr()); });
        container.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('dblclick', () => {
                const date = day.getAttribute('data-date');
                if (date && typeof FeaturePanel !== 'undefined') FeaturePanel.openQuickAdd(date);
            });
        });
    }
};

// ================================================================
// GLOBAL FUNCTIONS
// ================================================================

function openProspectManager() { if (typeof FeaturePanel !== 'undefined') FeaturePanel.show('prospects', '👥 Prospect Manager'); }
function openAddProspect() { showToast('Add Prospect feature coming soon!', 'info'); }
function viewProspect(id) { const prospect = AppState.prospectManager?.get(id); if (prospect) showToast(`Viewing ${prospect.business}`, 'info'); else showToast('Prospect not found', 'error'); }
function editProspect(id) { showToast('Edit Prospect feature coming soon!', 'info'); }
function deleteProspect(id) { if (confirm('Delete this prospect?')) showToast('Prospect deleted', 'info'); }

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
    if (!query || query.length < 2) { results.innerHTML = '<p style="color:var(--text-muted); padding:12px;">Type at least 2 characters to search...</p>'; return; }
    const searchResults = [];
    const q = query.toLowerCase();
    for (let date in AppState.appointments) {
        if (AppState.appointments[date].reports) {
            AppState.appointments[date].reports.forEach(appt => {
                const searchable = `${appt.business} ${appt.contactName} ${appt.phone || ''} ${appt.email || ''} ${appt.notes || ''}`.toLowerCase();
                if (searchable.includes(q)) searchResults.push({ type: 'appointment', data: appt, date: date });
            });
        }
    }
    AppState.tasks.forEach(task => { if (task.description.toLowerCase().includes(q)) searchResults.push({ type: 'task', data: task }); });
    for (const [id, script] of Object.entries(AppState.scripts)) {
        if (script.name.toLowerCase().includes(q) || script.content.toLowerCase().includes(q)) searchResults.push({ type: 'script', data: { id, ...script } });
    }
    if (searchResults.length === 0) { results.innerHTML = '<p style="color:var(--text-muted); padding:12px;">No results found.</p>'; return; }
    let html = `<div style="display:flex; flex-direction:column; gap:8px;">`;
    searchResults.slice(0, 20).forEach(result => {
        if (result.type === 'appointment') {
            html += `<div class="list-item" style="cursor:pointer; padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);" onclick="window.showAppointmentDetail && window.showAppointmentDetail('${result.data.id}')">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                    <span style="font-weight:600;">${Utils.escapeHtml(result.data.business)}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${Utils.formatDate(result.data.date)}</span>
                </div>
                <div style="font-size:0.8rem; color:var(--text-secondary);">${Utils.escapeHtml(result.data.contactName)}</div>
                <div style="font-size:0.7rem; color:var(--text-muted);">Status: ${Utils.getStatus(result.data)}</div>
            </div>`;
        } else if (result.type === 'task') {
            html += `<div class="list-item" style="padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                    <span style="font-weight:600;">${Utils.escapeHtml(result.data.description)}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${result.data.completed ? '✅ Done' : '⏳ Pending'}</span>
                </div>
            </div>`;
        } else if (result.type === 'script') {
            html += `<div class="list-item" style="cursor:pointer; padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);" onclick="window.loadScript && window.loadScript('${result.data.id}')">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                    <span style="font-weight:600;">${Utils.escapeHtml(result.data.name)}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">📜 Script</span>
                </div>
            </div>`;
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
                html += `<div class="bulk-item">
                    <input type="checkbox" class="bulk-checkbox" value="${appt.id}" data-date="${date}" />
                    <span><strong>${Utils.escapeHtml(appt.business)}</strong> - ${Utils.escapeHtml(appt.contactName)} (${Utils.getStatus(appt)})</span>
                </div>`;
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
    } else if (action === 'export') Data.exportToCSV(selected);
    const modal = DOM.get('bulkActionsModal');
    if (modal) modal.style.display = 'none';
    if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
}

function handleEscapeKey() {
    if (AppState.isEditing) { Scripts.cancelEdit(); return true; }
    const featurePanel = DOM.get('featurePanel');
    if (featurePanel && featurePanel.style.display !== 'none') {
        if (typeof FeaturePanel !== 'undefined') FeaturePanel.hide();
        Scripts.loadScript('opening');
        showToast('Returned to Opening Script', 'info');
        return true;
    }
    document.querySelectorAll('.modal-overlay').forEach(modal => { if (modal.style.display !== 'none') modal.style.display = 'none'; });
    return true;
}

function openShortcutEdit(action) {
    const currentKeys = AppState.shortcuts[action]?.keys || [];
    const keysString = currentKeys.join('+');
    const newKeysString = prompt(`Enter new shortcut for "${action}" (e.g., Ctrl+Shift+I):`, keysString);
    if (newKeysString && newKeysString !== keysString) {
        const newKeys = newKeysString.split('+').map(k => k.trim());
        const conflicts = Utils.checkShortcutConflict(newKeys, action, AppState.shortcuts);
        if (conflicts.length > 0) { showToast(`Conflict with: ${conflicts.join(', ')}`, 'warning'); return false; }
        if (AppState.shortcuts[action]) {
            AppState.shortcuts[action].keys = newKeys;
            AppState.customShortcuts[action] = AppState.shortcuts[action];
            localStorage.setItem('customShortcuts', JSON.stringify(AppState.customShortcuts));
            showToast(`Shortcut updated for ${action}`, 'success');
            const body = DOM.get('featurePanelBody');
            if (body && AppState.currentView === 'shortcuts' && typeof FeaturePanel !== 'undefined') FeaturePanel.renderShortcuts(body);
            return true;
        }
    }
    return false;
}

function handleShortcutAction(action) {
    switch (action) {
        case 'Smart Import': window.openSmartImportEnhanced(); break;
        case 'Appointment Calendar': if (typeof FeaturePanel !== 'undefined') FeaturePanel.show('calendar', '📅 Appointment & Handoff Calendar'); break;
        case 'Call Scripts': if (typeof FeaturePanel !== 'undefined') FeaturePanel.hide(); Scripts.loadScript('opening'); break;
        case 'Global Search': openGlobalSearch(); break;
        case 'Quick Add Appointment': if (typeof FeaturePanel !== 'undefined') FeaturePanel.openQuickAdd(Utils.getTodayStr()); break;
        case 'Analytics Hub': AppState.analyticsTab = 'meetings'; if (typeof FeaturePanel !== 'undefined') FeaturePanel.show('analytics', '📊 Analytics Hub'); break;
        case 'Keyboard Shortcuts': if (typeof FeaturePanel !== 'undefined') FeaturePanel.show('shortcuts', '⌨️ Keyboard Shortcuts'); break;
        case 'Export to CSV': Data.exportToCSV(); break;
        case 'Toggle Theme': document.body.classList.toggle('light'); showToast('Theme toggled', 'info'); break;
        case 'Refresh Data': DOM.get('refreshBtn')?.click(); break;
        case 'Bulk Actions': openBulkActions(); break;
        case 'Objection Handler': if (window.ObjectionHandler) window.ObjectionHandler.toggle(); else showToast('Objection Handler loading...', 'info'); break;
        case 'Prospects': openProspectManager(); break;
        case 'Close Panel': handleEscapeKey(); break;
        default: showToast(`Action: ${action}`, 'info');
    }
}

function showAppointmentDetail(appointmentId) {
    const appt = Data.getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    AppState.currentAppointmentId = appointmentId;
    const modal = DOM.get('appointmentDetailModal');
    if (!modal) return;
    const status = Utils.getStatus(appt);
    const score = Utils.calculateLeadScore(appt);
    const qualityScore = Utils.calculateQualityScore(appt);
    const emailStatus = Utils.getEmailStatus(appt.email);
    const emailStatusLabel = emailStatus === 'valid' ? '✅ Valid' : emailStatus === 'bounced' ? '⚠️ Bounced' : emailStatus === 'invalid' ? '❌ Invalid' : '❓ Unknown';
    const titleEl = DOM.get('appointmentDetailTitle');
    if (titleEl) titleEl.textContent = `📋 ${appt.business} - ${appt.contactName}`;
    const contentEl = DOM.get('appointmentDetailContent');
    if (contentEl) {
        contentEl.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding-bottom:12px; border-bottom:2px solid var(--border-color);">
                    <div><div style="font-size:1.1rem; font-weight:700;">${Utils.escapeHtml(appt.business)}</div>
                    <div style="font-size:0.9rem; color:var(--text-secondary);">${Utils.escapeHtml(appt.contactName)}</div></div>
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <span class="status-tag ${Utils.getStatusClass(status)}">${status}</span>
                        <span class="score-badge ${Utils.getScoreColor(score)}">${score} Pts</span>
                        ${qualityScore !== null && qualityScore !== undefined ? `<span class="score-badge ${Utils.getScoreColorClass(qualityScore) === 'green' ? 'score-high' : Utils.getScoreColorClass(qualityScore) === 'yellow' ? 'score-medium' : 'score-low'}">⭐ ${qualityScore.toFixed(1)}</span>` : ''}
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                    <div style="background:var(--bg-primary); border-radius:8px; padding:12px;"><div style="font-size:0.7rem; color:var(--text-muted);">📞 Phone</div><div style="font-weight:500;">${Utils.escapeHtml(appt.phone || 'N/A')}</div></div>
                    <div style="background:var(--bg-primary); border-radius:8px; padding:12px;"><div style="font-size:0.7rem; color:var(--text-muted);">✉️ Email</div><div style="font-weight:500;">${Utils.escapeHtml(appt.email || 'N/A')}</div>${appt.email ? `<div style="font-size:0.6rem; color:${emailStatus === 'valid' ? 'var(--success)' : 'var(--danger)'};">${emailStatusLabel}</div>` : ''}</div>
                    <div style="background:var(--bg-primary); border-radius:8px; padding:12px;"><div style="font-size:0.7rem; color:var(--text-muted);">📅 Date</div><div style="font-weight:500;">${Utils.formatDate(appt.date)}</div></div>
                    <div style="background:var(--bg-primary); border-radius:8px; padding:12px;"><div style="font-size:0.7rem; color:var(--text-muted);">🕐 Time</div><div style="font-weight:500;">${Utils.escapeHtml(appt.time || 'N/A')}</div></div>
                </div>
                <div style="display:flex; gap:16px; flex-wrap:wrap; padding:8px 0; border-bottom:1px solid var(--border-color);">
                    <div><span style="color:var(--text-muted);">👤 Assigned:</span> <strong>${Utils.escapeHtml(appt.assigned || 'Daniel')}</strong></div>
                    <div><span style="color:var(--text-muted);">💼 Role:</span> <strong>${Utils.escapeHtml(appt.role || 'Owner')}</strong></div>
                    ${appt.tags && appt.tags.length > 0 ? `<div><span style="color:var(--text-muted);">🏷️ Tags:</span> ${appt.tags.map(t => `<span class="status-tag" style="background:var(--bg-primary);">#${t}</span>`).join(' ')}</div>` : ''}
                    ${qualityScore !== null && qualityScore !== undefined ? `<div><span style="color:var(--text-muted);">⭐ Quality Score:</span> <strong>${qualityScore.toFixed(1)} / 10</strong></div>` : ''}
                </div>
                ${appt.notes ? `<div style="background:var(--bg-primary); border-radius:8px; padding:12px; margin-top:4px;"><div style="font-size:0.7rem; color:var(--text-muted);">📝 Notes</div><div style="white-space:pre-wrap; margin-top:4px;">${Utils.escapeHtml(appt.notes)}</div></div>` : ''}
                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; padding-top:12px; border-top:2px solid var(--border-color);">
                    <button class="btn-icon" onclick="window.editAppointment && window.editAppointment('${appt.id}')" style="background:var(--warning); color:#1e293b;"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-icon" onclick="window.rescheduleAppointment && window.rescheduleAppointment('${appt.id}')" style="background:var(--secondary); color:white;"><i class="fas fa-calendar-alt"></i> Reschedule</button>
                    <button class="btn-icon" onclick="window.completeAppointment && window.completeAppointment('${appt.id}')" style="background:var(--success); color:white;"><i class="fas fa-check"></i> Complete</button>
                    <button class="btn-icon" onclick="window.cancelAppointment && window.cancelAppointment('${appt.id}')" style="background:var(--danger); color:white;"><i class="fas fa-times"></i> Cancel</button>
                </div>
            </div>
        `;
    }
    modal.style.display = 'flex';
}

function closeAppointmentDetail() { const modal = DOM.get('appointmentDetailModal'); if (modal) modal.style.display = 'none'; AppState.currentAppointmentId = null; }

function editAppointment(appointmentId) {
    const appt = Data.getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    closeAppointmentDetail();
    if (typeof FeaturePanel !== 'undefined') FeaturePanel.openQuickAdd(appt.date);
    setTimeout(() => {
        const businessInput = DOM.get('newApptBusiness');
        const contactInput = DOM.get('newApptContact');
        const phoneInput = DOM.get('newApptPhone');
        const emailInput = DOM.get('newApptEmail');
        const timeInput = DOM.get('newApptTime');
        const statusSelect = DOM.get('newApptStatus');
        const notesInput = DOM.get('newApptNotes');
        const assignedSelect = DOM.get('newApptAssigned');
        if (businessInput) businessInput.value = appt.business;
        if (contactInput) contactInput.value = appt.contactName;
        if (phoneInput) phoneInput.value = appt.phone || '';
        if (emailInput) emailInput.value = appt.email || '';
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
        Data.updateAppointment(appt.date, appt.id, { date: newDate.trim(), time: newTime || appt.time, status: 'Rescheduled' });
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

async function initApp() {
    console.log('🚀 Starting ScriptFlow Pro...');
    console.log('📝 Parser available:', Utils.isParserAvailable());
    updateLoadingProgress(10, 'Initializing application...');

    // Check Firebase status
    AppState.isFirebaseReady = window.__FIREBASE_READY__ || false;
    
    if (!AppState.isFirebaseReady) {
        console.log('⏳ Waiting for Firebase to be ready...');
        await new Promise((resolve) => {
            const checkReady = setInterval(() => {
                if (window.__FIREBASE_READY__) {
                    clearInterval(checkReady);
                    AppState.isFirebaseReady = true;
                    resolve();
                }
            }, 500);
            setTimeout(() => {
                clearInterval(checkReady);
                resolve();
            }, 10000);
        });
    }
    
    console.log(`🔥 Firebase status: ${AppState.isFirebaseReady ? '✅ Ready' : '⚠️ Not ready - using offline mode'}`);

    // Load custom shortcuts
    AppState.customShortcuts = JSON.parse(localStorage.getItem(STORAGE_KEYS.customShortcuts) || '{}');
    AppState.shortcuts = { ...CONFIG.DEFAULT_SHORTCUTS, ...AppState.customShortcuts };
    AppState.scriptFavorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.scriptFavorites) || '[]');

    const savedFilters = localStorage.getItem(STORAGE_KEYS.analyticsFilters);
    if (savedFilters) { try { AppState.analyticsFilters = { ...AppState.analyticsFilters, ...JSON.parse(savedFilters) }; } catch (e) {} }

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

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') handleEscapeKey(); });
    updateLoadingProgress(65, 'Loading features...');

    // Tool items
    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            if (tool === 'calendar') FeaturePanel.show('calendar', '📅 Appointment & Handoff Calendar');
            else if (tool === 'tasks') FeaturePanel.show('tasks', '📋 Follow-up Tasks Manager');
            else if (tool === 'analytics') { AppState.analyticsTab = 'meetings'; FeaturePanel.show('analytics', '📊 Analytics Hub'); }
            else if (tool === 'shortcuts') FeaturePanel.show('shortcuts', '⌨️ Keyboard Shortcuts');
            else if (tool === 'prospects') openProspectManager();
            else if (tool === 'objections') { if (window.ObjectionHandler) window.ObjectionHandler.toggle(); else showToast('Objection Handler loading...', 'info'); }
            else if (tool === 'theme') { document.body.classList.toggle('light'); showToast('Theme toggled', 'info'); }
            else if (tool === 'signOut') Auth.signOut();
        });
    });

    // Feature panel close
    const closeFeatureBtn = DOM.get('closeFeaturePanelBtn');
    if (closeFeatureBtn) closeFeatureBtn.addEventListener('click', () => { FeaturePanel.hide(); Scripts.loadScript('opening'); });

    // Script buttons
    const editScriptBtn = DOM.get('editScriptBtn');
    const saveScriptBtn = DOM.get('saveScriptBtn');
    const cancelEditBtn = DOM.get('cancelEditBtn');
    const copyScriptBtn = DOM.get('copyScriptBtn');
    const resetScriptBtn = DOM.get('resetScriptBtn');
    const favoriteScriptBtn = DOM.get('favoriteScriptBtn');
    if (editScriptBtn) editScriptBtn.addEventListener('click', () => Scripts.startEdit());
    if (saveScriptBtn) saveScriptBtn.addEventListener('click', () => { const textarea = DOM.get('editTextarea'); if (textarea) { Scripts.saveScriptContent(textarea.value); Scripts.finishEdit(); } });
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => Scripts.cancelEdit());
    if (copyScriptBtn) copyScriptBtn.addEventListener('click', () => { const script = AppState.scripts[AppState.currentScriptId]; if (script) copyToClipboard(script.content); });
    if (resetScriptBtn) resetScriptBtn.addEventListener('click', () => Scripts.resetScript());
    if (favoriteScriptBtn) favoriteScriptBtn.addEventListener('click', () => Scripts.toggleFavorite(AppState.currentScriptId));

    // Smart Import buttons
    const quickReportBtn = DOM.get('quickReportBtn');
    const parseBtn = DOM.get('parseImportBtn');
    const saveImportBtn = DOM.get('saveImportBtn');
    const closeImportBtn = DOM.get('closeImportBtn');
    const templateBtn = DOM.get('quickTemplateBtn');
    const clipboardBtn = DOM.get('clipboardImportBtn');
    if (quickReportBtn) quickReportBtn.addEventListener('click', window.openSmartImportEnhanced);
    if (parseBtn) parseBtn.addEventListener('click', window.parseAndPreviewImportEnhanced);
    if (saveImportBtn) saveImportBtn.addEventListener('click', window.saveAllImportedAppointments);
    if (closeImportBtn) closeImportBtn.addEventListener('click', window.closeSmartImportEnhanced);
    if (templateBtn) templateBtn.addEventListener('click', window.generateImportTemplate);
    if (clipboardBtn) clipboardBtn.addEventListener('click', window.quickImportFromClipboard);

    // Prospect buttons
    const addProspectBtn = DOM.get('addProspectBtn');
    if (addProspectBtn) addProspectBtn.addEventListener('click', openAddProspect);

    // Bulk actions
    const closeBulkBtn = DOM.get('closeBulkModalBtn');
    const executeBulkBtn = DOM.get('executeBulkActionBtn');
    const bulkActionSelect = DOM.get('bulkActionSelect');
    if (closeBulkBtn) closeBulkBtn.addEventListener('click', () => { const modal = DOM.get('bulkActionsModal'); if (modal) modal.style.display = 'none'; });
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
        try { showToast('Refreshing data...', 'info'); await Data.loadUserData(true); FeaturePanel.refreshCurrentView(); showToast('Data refreshed!', 'success'); }
        catch (error) { handleError(error, 'Refresh'); }
        finally { AppState.isRefreshing = false; refreshBtn.classList.remove('spinning'); refreshBtn.disabled = false; }
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
    if (globalSearchClose) globalSearchClose.addEventListener('click', () => { const modal = DOM.get('globalSearchModal'); if (modal) modal.style.display = 'none'; });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!AppState.shortcutsEnabled || AppState.isEditing) {
            if (e.key === 'Escape') handleEscapeKey();
            return;
        }
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            const visible = Utils.getOrderedVisible(AppState.scripts, AppState.scriptOrder);
            if (index < visible.length) { e.preventDefault(); Scripts.loadScript(visible[index]); showToast(`Switched to: ${AppState.scripts[visible[index]]?.name}`, 'info'); }
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

    // Firebase auth - Properly handle auth state
    try {
        if (AppState.isFirebaseReady) {
            console.log('🔥 Setting up Firebase auth listener...');
            firebase.auth().onAuthStateChanged(async (user) => {
                console.log('👤 Auth state changed:', user ? 'User logged in' : 'No user');
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
            console.log('⚠️ Firebase not ready - showing auth modal with offline data');
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

    document.addEventListener('click', (e) => { if (e.target.classList.contains('modal-overlay')) e.target.style.display = 'none'; });

    console.log('🚀 ScriptFlow Pro initialized successfully!');
    console.log('📥 Smart Import: Click the "Smart Import" button, paste text, click Parse, review, and Save!');
    console.log('📝 Parser status:', Utils.isParserAvailable() ? '✅ Available' : '⚠️ Fallback mode');
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
window.DOM = DOM;
window.transcriptParser = transcriptParser || null;

// Start the app
document.addEventListener('DOMContentLoaded', initApp);

console.log('🚀 ScriptFlow Pro loaded successfully');
console.log('🔌 Firebase Ready:', AppState.isFirebaseReady);
console.log('📝 Parser Available:', Utils.isParserAvailable());