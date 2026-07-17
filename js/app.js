// ================================================================
// SCRIPTFLOW PRO - ENHANCED APPLICATION MODULE
// ================================================================

// ================================================================
// CONFIGURATION
// ================================================================

const CONFIG = {
    STATUS_OPTIONS: ['Warm Callback', 'Completed', 'Canceled', 'Pending', 'Hot Transfer', 'Warm Call Booked', 'Meeting Booked', 'Rescheduled', 'Held'],
    TAG_OPTIONS: [
        { id: 'qualified_warm_call', name: 'Qualified Warm Call', color: '#10b981' },
        { id: 'unqualified_warm_callback', name: 'Unqualified Warm Callback', color: '#f59e0b' },
        { id: 'vip', name: 'VIP', color: '#3b82f6' },
        { id: 'negligent_warm_callback', name: 'Negligent Warm Callback', color: '#ef4444' }
    ],
    TEAM_MEMBERS: [
        { id: 'daniel', name: 'Daniel', email: 'daniel@scriptflow.com', role: 'Team Lead', avatar: '👨‍💼', color: '#3b82f6' },
        { id: 'sarah', name: 'Sarah', email: 'sarah@scriptflow.com', role: 'Senior Agent', avatar: '👩‍💼', color: '#8b5cf6' },
        { id: 'mike', name: 'Mike', email: 'mike@scriptflow.com', role: 'Agent', avatar: '👨‍💻', color: '#10b981' },
        { id: 'jessica', name: 'Jessica', email: 'jessica@scriptflow.com', role: 'Agent', avatar: '👩‍💻', color: '#f59e0b' },
        { id: 'david', name: 'David', email: 'david@scriptflow.com', role: 'Junior Agent', avatar: '👨‍🎓', color: '#ef4444' }
    ],
    FIELD_MAPPINGS: {
        'name': ['name', 'client', 'prospect', 'contact', 'customer', 'person', 'full name', 'contact name'],
        'business': ['business', 'company', 'organization', 'org', 'firm', 'brand', 'store'],
        'phone': ['phone', 'mobile', 'cell', 'telephone', 'number', 'contact number', 'phone number', 'mobile number'],
        'email': ['email', 'e-mail', 'mail', 'email address', 'e-mail address'],
        'date': ['date', 'appointment date', 'schedule date', 'meeting date', 'call date', 'day'],
        'time': ['time', 'appointment time', 'schedule time', 'meeting time', 'call time', 'hour'],
        'status': ['status', 'state', 'stage', 'lead status', 'appointment status', 'call status'],
        'notes': ['notes', 'note', 'comment', 'remarks', 'additional notes', 'info', 'details'],
        'assigned': ['assigned', 'assigned to', 'owner', 'agent', 'representative', 'rep', 'assigned agent']
    },
    DEFAULT_SHORTCUTS: {
        'Smart Import': { keys: ['Ctrl', 'Shift', 'I'], description: 'Open Smart Import modal' },
        'Appointment Calendar': { keys: ['Ctrl', 'Shift', 'C'], description: 'Open Appointment Calendar' },
        'Call Scripts': { keys: ['Ctrl', 'Shift', 'S'], description: 'Open Call Scripts' },
        'Global Search': { keys: ['Ctrl', 'Shift', 'F'], description: 'Open Global Search' },
        'Quick Add Appointment': { keys: ['Ctrl', 'Shift', 'A'], description: 'Quick Add Appointment' },
        'Analytics Hub': { keys: ['Ctrl', 'Shift', 'H'], description: 'Open Analytics Hub' },
        'Team Management': { keys: ['Ctrl', 'Shift', 'T'], description: 'Open Team Management' },
        'Keyboard Shortcuts': { keys: ['Ctrl', 'Shift', '?'], description: 'Open Keyboard Shortcuts' },
        'Export to CSV': { keys: ['Ctrl', 'Shift', 'E'], description: 'Export data to CSV' },
        'Toggle Theme': { keys: ['Ctrl', 'Shift', 'L'], description: 'Toggle Dark/Light Mode' },
        'Refresh Data': { keys: ['Ctrl', 'Shift', 'R'], description: 'Refresh data from server' },
        'Bulk Actions': { keys: ['Ctrl', 'Shift', 'B'], description: 'Open Bulk Actions' },
        'Close Panel': { keys: ['Escape'], description: 'Close current panel and return to scripts' }
    }
};

// ================================================================
// STATE MANAGEMENT
// ================================================================

const AppState = {
    // User
    currentUser: null,
    currentUserEmail: null,
    isFirebaseReady: false,
    authInProgress: false,
    authModalOpen: false,

    // Data
    appointments: {},
    scripts: {},
    scriptOrder: [],
    scriptFavorites: [],
    tasks: [],
    teamMembers: [],
    goals: { daily: 3, weekly: 15, monthly: 60 },

    // UI State
    currentScriptId: 'opening',
    isEditing: false,
    isTyping: false,
    searchTerm: '',
    currentEditContent: '',
    toolsOpen: false,
    currentView: 'calendar',
    calendarView: 'calendar',
    analyticsTab: 'insights',
    pipelineView: 'my',
    taskFilter: 'all',
    selectedAppointments: new Set(),
    currentAppointmentId: null,
    selectedCalDate: null,
    currentCalDate: null,
    editingTeamMemberId: null,

    // Date Filters
    dateFilter: 'today',
    customStartDate: null,
    customEndDate: null,

    // Subscriptions
    appointmentsUnsubscribe: null,
    tasksUnsubscribe: null,
    teamMembersUnsubscribe: null,

    // Charts
    chartInstances: {},

    // Shortcuts
    shortcuts: {},
    customShortcuts: {},
    shortcutsEnabled: true,

    // Parsed Import
    parsedImportData: {},
    importConfidence: {},

    // Loading
    isLoading: false,
    isRefreshing: false,
    teamSearchTerm: ''
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
            'Warm Callback': 'status-warm-callback-sm',
            'Completed': 'status-completed-sm',
            'Canceled': 'status-canceled-sm',
            'Pending': 'status-pending-sm',
            'Hot Transfer': 'status-hot-transfer-sm',
            'Warm Call Booked': 'status-warm-call-booked-sm',
            'Meeting Booked': 'status-meeting-booked-sm',
            'Rescheduled': 'status-rescheduled-sm',
            'Held': 'status-held-sm'
        };
        return map[status] || 'status-pending-sm';
    },

    getScoreColor(score) {
        if (score >= 70) return 'score-hot';
        if (score >= 40) return 'score-warm';
        return 'score-cold';
    },

    calculateLeadScore(appt) {
        let score = 0;
        const status = Utils.getStatus(appt);

        if (status === 'Hot Transfer') score += 50;
        else if (status === 'Completed') score += 40;
        else if (status === 'Warm Callback') score += 30;
        else if (status === 'Held' || status === 'Meeting Booked') score += 25;
        else if (status === 'Warm Call Booked') score += 15;
        else if (status === 'Pending') score += 10;
        else if (status === 'Rescheduled') score += 5;
        else if (status === 'Canceled') score -= 20;

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

    parseAppointmentText(text) {
        const result = {};
        const confidence = {};
        const lines = text.split('\n').filter(line => line.trim());
        const hasKeyValue = lines.some(line => line.includes(':'));

        if (hasKeyValue) {
            lines.forEach(line => {
                const [key, ...valueParts] = line.split(':');
                const rawKey = key.trim().toLowerCase();
                const rawValue = valueParts.join(':').trim();
                if (rawValue) {
                    for (const [field, aliases] of Object.entries(CONFIG.FIELD_MAPPINGS)) {
                        if (aliases.some(alias => rawKey.includes(alias) || alias.includes(rawKey))) {
                            result[field] = rawValue;
                            confidence[field] = 1.0;
                            break;
                        }
                    }
                }
            });
        }
        for (const field of ['name', 'business', 'phone', 'email', 'date', 'time', 'status']) {
            if (result[field] && !confidence[field]) confidence[field] = 0.5;
        }
        return { result, confidence };
    },

    checkDuplicate(appointment, appointments) {
        if (!appointment.name && !appointment.phone && !appointment.email) return null;
        for (let date in appointments) {
            if (appointments[date]?.reports) {
                for (const existing of appointments[date].reports) {
                    let matchCount = 0, totalChecks = 0;
                    if (appointment.name && existing.contactName) {
                        totalChecks++;
                        if (appointment.name.toLowerCase() === existing.contactName.toLowerCase()) matchCount++;
                    }
                    if (appointment.phone && existing.phone) {
                        totalChecks++;
                        if (appointment.phone === existing.phone) matchCount++;
                    }
                    if (appointment.email && existing.email) {
                        totalChecks++;
                        if (appointment.email.toLowerCase() === existing.email.toLowerCase()) matchCount++;
                    }
                    if (appointment.business && existing.business) {
                        totalChecks++;
                        if (appointment.business.toLowerCase() === existing.business.toLowerCase()) matchCount++;
                    }
                    if (totalChecks > 0 && matchCount / totalChecks >= 0.6) return existing;
                }
            }
        }
        return null;
    },

    getOrderedVisible(scripts, scriptOrder) {
        if (scriptOrder && scriptOrder.length > 0) {
            return scriptOrder.filter(id => scripts[id]);
        }
        return Object.keys(scripts);
    },

    getTeamMemberStats(memberId, appointments, teamMembers) {
        let total = 0, hotTransfers = 0, warmCallbacks = 0, completed = 0, pending = 0, canceled = 0;
        let scoreTotal = 0, scoreCount = 0;

        for (let date in appointments) {
            if (appointments[date].reports) {
                appointments[date].reports.forEach(appt => {
                    if (appt.assigned === memberId) {
                        total++;
                        const status = Utils.getStatus(appt);
                        if (status === 'Hot Transfer') hotTransfers++;
                        else if (status === 'Warm Callback') warmCallbacks++;
                        else if (status === 'Completed') completed++;
                        else if (status === 'Pending') pending++;
                        else if (status === 'Canceled') canceled++;
                        scoreTotal += Utils.calculateLeadScore(appt);
                        scoreCount++;
                    }
                });
            }
        }

        const avgScore = scoreCount > 0 ? Math.round(scoreTotal / scoreCount) : 0;
        const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, hotTransfers, warmCallbacks, completed, pending, canceled, avgScore, conversionRate };
    },

    getTeamMemberById(id, teamMembers) {
        return teamMembers.find(m => m.id === id);
    },

    getTeamMemberByName(name, teamMembers) {
        return teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase());
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
    },

    qs(selector, context = document) {
        return context.querySelector(selector);
    },

    qsa(selector, context = document) {
        return context.querySelectorAll(selector);
    }
};

// ================================================================
// LOADING SCREEN CONTROLLER
// ================================================================

const LoadingController = {
    _progress: 0,
    _steps: [
        { progress: 10, message: 'Initializing application...' },
        { progress: 20, message: 'Loading team data...' },
        { progress: 35, message: 'Connecting to services...' },
        { progress: 50, message: 'Setting up UI...' },
        { progress: 65, message: 'Loading features...' },
        { progress: 85, message: 'Loading your data...' },
        { progress: 100, message: 'Ready!' }
    ],

    update(progress, message) {
        this._progress = Math.min(progress, 100);
        const bar = DOM.get('loadingProgress');
        const percentDisplay = DOM.get('loadingPercent');
        const subtitle = document.querySelector('.loading-subtitle');

        if (bar) bar.style.width = this._progress + '%';
        if (percentDisplay) percentDisplay.textContent = this._progress + '%';
        if (subtitle && message) subtitle.textContent = message;
    },

    nextStep() {
        for (const step of this._steps) {
            if (step.progress > this._progress) {
                this.update(step.progress, step.message);
                return step;
            }
        }
        return null;
    },

    hide() {
        const screen = DOM.get('loadingScreen');
        const appWrapper = DOM.get('appWrapper');

        if (screen) {
            screen.classList.add('hidden');
            setTimeout(() => {
                screen.style.display = 'none';
            }, 600);
        }
        if (appWrapper) {
            appWrapper.style.display = 'flex';
        }
    },

    show() {
        const screen = DOM.get('loadingScreen');
        if (screen) {
            screen.classList.remove('hidden');
            screen.style.display = 'flex';
        }
        this._progress = 0;
        this.update(0, 'Starting up...');
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
// KEYBOARD SHORTCUTS MANAGER
// ================================================================

const ShortcutManager = {
    enableShortcuts() {
        AppState.shortcutsEnabled = true;
    },

    disableShortcuts() {
        AppState.shortcutsEnabled = false;
    },

    isTyping() {
        return AppState.isTyping || AppState.isEditing;
    },

    handleKeydown(e) {
        if (e.key === 'Escape') {
            AppState.handleEscapeKey();
            return;
        }

        if (!AppState.shortcutsEnabled || this.isTyping()) {
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                return;
            }
            return;
        }

        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            const visible = Utils.getOrderedVisible(AppState.scripts, AppState.scriptOrder);
            if (index < visible.length) {
                e.preventDefault();
                AppState.loadScript(visible[index]);
                showToast(`Switched to: ${AppState.scripts[visible[index]]?.name}`, 'info');
            }
            return;
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
                    AppState.handleShortcutAction(action);
                    return;
                }
            }
        }
    },

    setupListeners() {
        document.addEventListener('focusin', (e) => {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.closest('[contenteditable="true"]')) {
                AppState.isTyping = true;
                this.disableShortcuts();
            }
        });

        document.addEventListener('focusout', (e) => {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.closest('[contenteditable="true"]')) {
                AppState.isTyping = false;
                if (!AppState.isEditing) {
                    this.enableShortcuts();
                }
            }
        });

        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        const originalStartEdit = AppState.startEdit;
        AppState.startEdit = function() {
            AppState.isEditing = true;
            ShortcutManager.disableShortcuts();
            return originalStartEdit.apply(this, arguments);
        };

        const originalFinishEdit = AppState.finishEdit;
        AppState.finishEdit = function() {
            AppState.isEditing = false;
            ShortcutManager.enableShortcuts();
            return originalFinishEdit.apply(this, arguments);
        };

        const originalCancelEdit = AppState.cancelEdit;
        AppState.cancelEdit = function() {
            AppState.isEditing = false;
            ShortcutManager.enableShortcuts();
            return originalCancelEdit.apply(this, arguments);
        };
    }
};

// ================================================================
// TEAM MANAGEMENT - CENTRALIZED DATA MODEL
// ================================================================

const TeamManager = {
    loadMembers() {
        const stored = localStorage.getItem('teamMembers');
        if (stored) {
            try {
                AppState.teamMembers = JSON.parse(stored);
                return;
            } catch (e) {}
        }
        AppState.teamMembers = JSON.parse(JSON.stringify(CONFIG.TEAM_MEMBERS));
        this.saveMembers();
    },

    saveMembers() {
        localStorage.setItem('teamMembers', JSON.stringify(AppState.teamMembers));
        document.dispatchEvent(new CustomEvent('teamMembersUpdated', { detail: AppState.teamMembers }));
    },

    getById(id) {
        return AppState.teamMembers.find(m => m.id === id);
    },

    getByName(name) {
        return AppState.teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase());
    },

    addMember(member) {
        if (AppState.teamMembers.some(m => m.email === member.email)) {
            showToast('A team member with this email already exists', 'error');
            return false;
        }
        const newMember = {
            id: Utils.generateId(),
            name: member.name,
            email: member.email,
            role: member.role || 'Agent',
            avatar: member.avatar || '👤',
            color: member.color || '#6b7280'
        };
        AppState.teamMembers.push(newMember);
        this.saveMembers();
        showToast(`Team member ${member.name} added successfully!`, 'success');
        return true;
    },

    updateMember(id, updates) {
        const index = AppState.teamMembers.findIndex(m => m.id === id);
        if (index === -1) { showToast('Team member not found', 'error'); return false; }

        const duplicate = AppState.teamMembers.some((m, i) => m.email === updates.email && i !== index);
        if (duplicate) {
            showToast('A team member with this email already exists', 'error');
            return false;
        }

        AppState.teamMembers[index] = { ...AppState.teamMembers[index], ...updates };
        this.saveMembers();
        showToast('Team member updated successfully!', 'success');
        return true;
    },

    deleteMember(id) {
        const member = this.getById(id);
        if (!member) { showToast('Team member not found', 'error'); return false; }
        if (!confirm(`Are you sure you want to delete ${member.name}?`)) return false;

        AppState.teamMembers = AppState.teamMembers.filter(m => m.id !== id);
        this.saveMembers();
        showToast(`Team member ${member.name} deleted`, 'info');
        return true;
    },

    getStats(memberId) {
        return Utils.getTeamMemberStats(memberId, AppState.appointments, AppState.teamMembers);
    },

    getAllStats() {
        return AppState.teamMembers.map(member => ({
            ...member,
            ...this.getStats(member.id)
        }));
    }
};

// ================================================================
// EXPOSE MODULES TO GLOBAL SCOPE
// ================================================================

window.AppState = AppState;
window.Utils = Utils;
window.DOM = DOM;
window.LoadingController = LoadingController;
window.showToast = showToast;
window.copyToClipboard = copyToClipboard;
window.handleError = handleError;
window.ShortcutManager = ShortcutManager;
window.TeamManager = TeamManager;
window.CONFIG = CONFIG;

console.log('📦 ScriptFlow Pro modules loaded successfully');