// ================================================================
// SCRIPTFLOW PRO - COMPLETE APPLICATION (FULLY INTEGRATED)
// ================================================================

// ================================================================
// ERROR SUPPRESSION - BROWSER EXTENSION ERRORS
// ================================================================

// Suppress the chrome-extension://invalid/ error that comes from browser extensions
(function suppressExtensionErrors() {
    const originalConsoleError = console.error;
    
    console.error = function() {
        const args = Array.from(arguments);
        const message = args.join(' ');
        
        if (message && (
            message.includes('chrome-extension://invalid') ||
            message.includes('message channel closed') ||
            message.includes('listener indicated an asynchronous response') ||
            message.includes('Extension context invalidated') ||
            message.includes('Could not establish connection') ||
            message.includes('ERR_BLOCKED_BY_CLIENT')
        )) {
            return;
        }
        
        originalConsoleError.apply(console, arguments);
    };
    
    window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && (
            String(event.reason).includes('chrome-extension') ||
            String(event.reason).includes('message channel closed') ||
            String(event.reason).includes('listener indicated an asynchronous response') ||
            String(event.reason).includes('Extension context invalidated') ||
            String(event.reason).includes('ERR_BLOCKED_BY_CLIENT')
        )) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
    });
    
    console.log('🛡️ Extension error suppression enabled');
})();

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
    DEFAULT_CLOSERS: [
        { id: 'kailan', name: 'Kailan', email: 'kailan@company.com', phone: '+1-555-0201', active: true, default: true },
        { id: 'seif', name: 'Seif', email: 'seif@company.com', phone: '+1-555-0202', active: true, default: false },
        { id: 'seun', name: 'Seun', email: 'seun@company.com', phone: '+1-555-0203', active: true, default: false }
    ],
    DEFAULT_SCRIPTS: {
        "opening": { 
            name: "🎯 Opening Script", 
            content: '"Hey, is this [Company Name]?"\n\n"Awesome — this is Flynn. We created a free, modern preview version inspired by your current site. There\'s no cost or obligation. Would you be open to taking a quick look later today and sharing your thoughts?"', 
            version: 1 
        },
        "owner_yes": { 
            name: "👑 Owner - Yes", 
            content: "Perfect! Daniel will call you shortly to showcase your preview concept. Is this the best number to connect with you?", 
            version: 1 
        },
        "owner_no": { 
            name: "🤤 Not Owner", 
            content: "No worries! Who usually drives your design or advertising decisions? What is the best coordinate to reach them today?", 
            version: 1 
        },
        "objection_website": { 
            name: "💻 Objection - Website", 
            content: "I completely understand your concern about the website. Our preview is designed to show you what's possible without any commitment.", 
            version: 1 
        },
        "objection_cost": { 
            name: "💰 Objection - Cost", 
            content: "Great question about pricing. The preview is completely free—there's no cost or obligation. We believe in showing value first.", 
            version: 1 
        },
        "closing": { 
            name: "🤝 Closing Script", 
            content: "Thank you for your time today! I'll have our team prepare the preview and reach out with next steps.", 
            version: 1 
        }
    },
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
        'assigned': ['assigned', 'assigned to', 'owner', 'agent', 'representative', 'rep', 'assigned agent'],
        'closer': ['closer', 'closer name', 'booking agent', 'demo closer', 'appointment closer']
    },
    DEFAULT_SHORTCUTS: {
        'Smart Import': { keys: ['Ctrl', 'Shift', 'I'], description: 'Open Smart Import modal' },
        'Appointment Calendar': { keys: ['Ctrl', 'Shift', 'C'], description: 'Open Appointment Calendar' },
        'Call Scripts': { keys: ['Ctrl', 'Shift', 'S'], description: 'Open Call Scripts' },
        'Global Search': { keys: ['Ctrl', 'Shift', 'F'], description: 'Open Global Search' },
        'Quick Add Appointment': { keys: ['Ctrl', 'Shift', 'A'], description: 'Quick Add Appointment' },
        'Analytics Hub': { keys: ['Ctrl', 'Shift', 'H'], description: 'Open Analytics Hub' },
        'Closer Management': { keys: ['Ctrl', 'Shift', 'M'], description: 'Open Closer Management' },
        'Keyboard Shortcuts': { keys: ['Ctrl', 'Shift', '?'], description: 'Open Keyboard Shortcuts' },
        'Export to CSV': { keys: ['Ctrl', 'Shift', 'E'], description: 'Export data to CSV' },
        'Toggle Theme': { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle Dark/Light Mode' },
        'Refresh Data': { keys: ['Ctrl', 'Shift', 'R'], description: 'Refresh data from server' },
        'Bulk Actions': { keys: ['Ctrl', 'Shift', 'B'], description: 'Open Bulk Actions' },
        'Objection Handler': { keys: ['Ctrl', 'Shift', 'O'], description: 'Open Objection Handler' },
        'Close Panel': { keys: ['Escape'], description: 'Close current panel and return to scripts' }
    }
};

// ================================================================
// THEME MANAGEMENT - PERSISTENT
// ================================================================

const ThemeManager = {
    load: function() {
        const savedTheme = localStorage.getItem('scriptflow_theme') || 'dark';
        document.body.className = savedTheme;
        AppState.theme = savedTheme;
        return savedTheme;
    },
    
    toggle: function() {
        const isDark = document.body.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        document.body.className = newTheme;
        localStorage.setItem('scriptflow_theme', newTheme);
        AppState.theme = newTheme;
        if (typeof showToast === 'function') {
            showToast(`Switched to ${newTheme} mode`, 'info');
        }
        return newTheme;
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
        date: { pattern: /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$|^\d{4}-\d{2}-\d{2}$|^[A-Za-z]+\s+\d{1,2},?\s+\d{4}$/ },
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
        role: ['role', 'title', 'position', 'job title', 'designation', 'function', 'department'],
        closer: ['closer', 'closer name', 'booking agent', 'demo closer', 'appointment closer', 'closer assigned', 'demo closer name']
    }
};

// ================================================================
// STATE MANAGEMENT
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
    closers: [],
    goals: { daily: 3, weekly: 15, monthly: 60 },

    currentScriptId: 'opening',
    isEditing: false,
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
    
    activeDate: null,
    
    isImportSaving: false,
    importSaveComplete: false,
    
    isAppReady: false,
    
    // Theme
    theme: 'dark',
    
    // Drag state
    isDraggingAppointment: false,
    draggedAppointmentId: null,
    
    shortcutsHelpOpen: false,
    
    // Flag to prevent multiple initializations
    _initialized: false,
    _loadingComplete: false
};

// ================================================================
// IMPORT STATE MANAGEMENT
// ================================================================

const ImportState = {
    parsedRecords: [],
    validatedRecords: [],
    duplicates: [],
    errors: [],
    warnings: [],
    totalProcessed: 0,
    totalValid: 0,
    totalInvalid: 0,
    totalDuplicates: 0,
    processingStatus: 'idle',
    progress: 0,
    isSaving: false,
    saveComplete: false
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
        if (typeof date === 'string') return date;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    formatTime(timeStr) {
        if (!timeStr) return 'No time';
        return timeStr;
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

    isCompletedStatus(status) {
        const primary = this.getPrimaryStatus(status);
        return primary === 'Completed' || CONFIG.SECONDARY_STATUSES.includes(status);
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
                    if (rawKey.includes('best time') || rawKey.includes('callback')) {
                        const dateMatch = rawValue.match(/(\w+\s+\d{1,2},\s+\d{4})/i);
                        const timeMatch = rawValue.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
                        if (dateMatch) {
                            result['date'] = dateMatch[1];
                            confidence['date'] = 0.8;
                        }
                        if (timeMatch) {
                            result['time'] = timeMatch[1];
                            confidence['time'] = 0.8;
                        }
                        if (!result['notes']) {
                            result['notes'] = `Best time: ${rawValue}`;
                            confidence['notes'] = 0.6;
                        }
                    } else {
                        for (const [field, aliases] of Object.entries(CONFIG.FIELD_MAPPINGS)) {
                            if (aliases.some(alias => rawKey.includes(alias) || alias.includes(rawKey))) {
                                result[field] = rawValue;
                                confidence[field] = 1.0;
                                break;
                            }
                        }
                    }
                }
            });
        }
        
        if (!result['date']) {
            const fullText = lines.join(' ');
            const dateMatch = fullText.match(/(\w+\s+\d{1,2},\s+\d{4})/i);
            if (dateMatch) {
                result['date'] = dateMatch[1];
                confidence['date'] = 0.5;
            }
        }
        
        if (!result['time']) {
            const fullText = lines.join(' ');
            const timeMatch = fullText.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
            if (timeMatch) {
                result['time'] = timeMatch[1];
                confidence['time'] = 0.5;
            }
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
    
    getActiveDate() {
        return AppState.activeDate || this.getTodayStr();
    },
    
    setActiveDate(dateStr) {
        AppState.activeDate = dateStr;
        if (dateStr) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);
                AppState.calendarCurrentDate = new Date(year, month, day);
                AppState.selectedCalDate = dateStr;
            }
        }
        document.dispatchEvent(new CustomEvent('activeDateChanged', { detail: { date: dateStr } }));
        return dateStr;
    },
    
    syncCalendarToDate(dateStr) {
        if (dateStr) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);
                AppState.calendarCurrentDate = new Date(year, month, day);
                AppState.selectedCalDate = dateStr;
                AppState.activeDate = dateStr;
            }
        }
    },
    
    formatDateForDisplay(dateStr) {
        if (!dateStr) return 'No date';
        try {
            const d = new Date(dateStr + 'T00:00:00');
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    },
    
    isValidDate(dateStr) {
        if (!dateStr) return false;
        const d = new Date(dateStr + 'T00:00:00');
        return !isNaN(d.getTime());
    },

    extractEmail(text) {
        if (!text) return null;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex);
        if (matches && matches.length > 0) {
            return matches[0].toLowerCase().trim();
        }
        return null;
    },

    extractPhone(text) {
        if (!text) return null;
        const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const matches = text.match(phoneRegex);
        if (matches && matches.length > 0) {
            return matches[0].trim();
        }
        return null;
    },

    hasTimeSet(timeStr) {
        return timeStr && timeStr.trim() && timeStr.trim() !== 'No time' && timeStr.trim() !== 'No time set';
    },

    determineAutoStatus(appointment) {
        const hasTime = this.hasTimeSet(appointment.time);
        const hasDate = appointment.date && this.isValidDate(appointment.date);
        
        if (hasTime && hasDate) {
            return 'Meeting Booked';
        }
        
        if (hasDate && !hasTime) {
            return 'Pending';
        }
        
        return 'Pending';
    },

    // ================================================================
    // DEFAULT SCRIPTS - FALLBACK WHEN FIREBASE IS UNAVAILABLE
    // ================================================================
    getDefaultScripts: function() {
        return {
            "opening": { 
                name: "🎯 Opening Script", 
                content: '"Hey, is this [Company Name]?"\n\n"Awesome — this is Flynn. We created a free, modern preview version inspired by your current site. There\'s no cost or obligation. Would you be open to taking a quick look later today and sharing your thoughts?"', 
                version: 1 
            },
            "owner_yes": { 
                name: "👑 Owner - Yes", 
                content: "Perfect! Daniel will call you shortly to showcase your preview concept. Is this the best number to connect with you?", 
                version: 1 
            },
            "owner_no": { 
                name: "🤤 Not Owner", 
                content: "No worries! Who usually drives your design or advertising decisions? What is the best coordinate to reach them today?", 
                version: 1 
            },
            "objection_website": { 
                name: "💻 Objection - Website", 
                content: "I completely understand your concern about the website. Our preview is designed to show you what's possible without any commitment.", 
                version: 1 
            },
            "objection_cost": { 
                name: "💰 Objection - Cost", 
                content: "Great question about pricing. The preview is completely free—there's no cost or obligation. We believe in showing value first.", 
                version: 1 
            },
            "closing": { 
                name: "🤝 Closing Script", 
                content: "Thank you for your time today! I'll have our team prepare the preview and reach out with next steps.", 
                version: 1 
            }
        };
    },

    // ================================================================
    // ENSURE SCRIPTS EXIST - FIX FOR "NO SCRIPTS AVAILABLE"
    // ================================================================
    ensureScriptsExist: function() {
        if (!AppState.scripts || Object.keys(AppState.scripts).length === 0) {
            console.log('📝 No scripts found, loading defaults...');
            const defaultScripts = this.getDefaultScripts();
            AppState.scripts = defaultScripts;
            AppState.scriptOrder = Object.keys(defaultScripts);
            
            // Save to localStorage for offline use
            try {
                localStorage.setItem('scripts_fallback', JSON.stringify(defaultScripts));
                localStorage.setItem('scriptOrder', JSON.stringify(AppState.scriptOrder));
            } catch (e) {
                console.warn('Could not save scripts to localStorage:', e);
            }
            
            // Also try to save to Firebase if available
            if (AppState.currentUser && AppState.isFirebaseReady) {
                const db = Data._getDb ? Data._getDb() : null;
                if (db) {
                    try {
                        const batch = db.batch();
                        const ref = db.collection('users').doc(AppState.currentUser.uid).collection('scripts');
                        for (const [id, script] of Object.entries(defaultScripts)) {
                            batch.set(ref.doc(id), {
                                name: script.name,
                                content: script.content,
                                version: script.version || 1,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                        batch.commit().catch(e => console.warn('Could not save default scripts to Firebase:', e));
                    } catch (e) {
                        console.warn('Could not save default scripts to Firebase:', e);
                    }
                }
            }
            
            return true;
        }
        return false;
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
// AUTHENTICATION
// ================================================================

const Auth = {
    _authInstance: null,
    _isInitialized: false,

    _getAuth: function() {
        if (this._authInstance) return this._authInstance;
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isReady()) {
            this._authInstance = FirebaseManager.getAuth();
            return this._authInstance;
        }
        return null;
    },

    _ensureFirebase: async function() {
        if (typeof FirebaseManager !== 'undefined') {
            try {
                await FirebaseManager.waitForReady();
                AppState.isFirebaseReady = FirebaseManager.isReady();
                return AppState.isFirebaseReady;
            } catch (e) {
                console.warn('Firebase wait failed:', e);
                AppState.isFirebaseReady = false;
                return false;
            }
        }
        AppState.isFirebaseReady = false;
        return false;
    },

    signInWithGoogle: async function() {
        if (AppState.authInProgress) return false;
        
        await this._ensureFirebase();
        if (!AppState.isFirebaseReady) {
            showToast('Firebase unavailable. Please try again.', 'error');
            return false;
        }

        const auth = this._getAuth();
        if (!auth) {
            showToast('Authentication service unavailable', 'error');
            return false;
        }

        AppState.authInProgress = true;
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await auth.signInWithPopup(provider);
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
            } else if (error.code === 'auth/network-request-failed') {
                showToast('Network error. Please check your connection.', 'error');
            } else {
                handleError(error, 'Google Sign-In');
            }
            return false;
        }
        AppState.authInProgress = false;
        return false;
    },

    signUp: async function(email, password, username) {
        if (AppState.authInProgress) return false;
        
        await this._ensureFirebase();
        if (!AppState.isFirebaseReady) {
            showToast('Firebase unavailable. Please try again.', 'error');
            return false;
        }

        const auth = this._getAuth();
        if (!auth) {
            showToast('Authentication service unavailable', 'error');
            return false;
        }

        AppState.authInProgress = true;
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            if (result.user) {
                await result.user.updateProfile({ displayName: username });
                const db = FirebaseManager.getFirestore();
                if (db) {
                    await db.collection('users').doc(result.user.uid).set({
                        uid: result.user.uid,
                        email: email,
                        username: username,
                        displayName: username,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        goals: { daily: 3, weekly: 15, monthly: 60 },
                        scriptOrder: ['opening'],
                        closers: CONFIG.DEFAULT_CLOSERS
                    });
                }
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
        AppState.authInProgress = false;
        return false;
    },

    signIn: async function(email, password) {
        if (AppState.authInProgress) return false;
        
        await this._ensureFirebase();
        if (!AppState.isFirebaseReady) {
            showToast('Firebase unavailable. Please try again.', 'error');
            return false;
        }

        const auth = this._getAuth();
        if (!auth) {
            showToast('Authentication service unavailable', 'error');
            return false;
        }

        AppState.authInProgress = true;
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
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
        AppState.authInProgress = false;
        return false;
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
            AppState.closers = [];
            
            this.updateUI();
            Stats.updateAll();
            Scripts.renderSidebar();
            
            if (AppState.isFirebaseReady) {
                const auth = this._getAuth();
                if (auth) await auth.signOut();
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

        const isFirebaseReady = AppState.isFirebaseReady;

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
                ${isFirebaseReady ? `
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
                        <br><small>Please check your internet connection and refresh.</small>
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

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    },

    closeModal: function() {
        const modal = DOM.get('authModal');
        if (modal) modal.remove();
        AppState.authModalOpen = false;
    },

    initAuthListener: function() {
        if (this._isInitialized) return;
        this._isInitialized = true;

        if (AppState.isFirebaseReady) {
            const auth = this._getAuth();
            if (auth) {
                auth.onAuthStateChanged(async (user) => {
                    if (user) {
                        AppState.currentUser = user;
                        this.updateUI();
                        await Data.loadUserData();
                    } else {
                        AppState.currentUser = null;
                        this.updateUI();
                        setTimeout(() => {
                            this.showModal();
                        }, 500);
                    }
                });
                console.log('✅ Auth listener initialized');
            }
        }
    }
};

// ================================================================
// DATA LAYER - WITH OFFLINE SUPPORT
// ================================================================

const Data = {
    _db: null,
    _auth: null,

    _getDb: function() {
        if (this._db) return this._db;
        if (AppState.isFirebaseReady && typeof FirebaseManager !== 'undefined') {
            this._db = FirebaseManager.getFirestore();
            return this._db;
        }
        return null;
    },

    _getAuth: function() {
        if (this._auth) return this._auth;
        if (AppState.isFirebaseReady && typeof FirebaseManager !== 'undefined') {
            this._auth = FirebaseManager.getAuth();
            return this._auth;
        }
        return null;
    },

    loadUserData: async function(showLoading = true) {
        // Ensure scripts exist before anything else
        Utils.ensureScriptsExist();

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
                    AppState.closers = data.closers || CONFIG.DEFAULT_CLOSERS;
                    
                    // Ensure scripts exist after loading
                    Utils.ensureScriptsExist();
                    
                    showToast('Loaded offline data', 'info');
                    Stats.updateAll();
                    Scripts.renderSidebar();
                    Scripts.loadScript('opening');
                    return;
                } catch (e) {
                    console.warn('Failed to load offline data:', e);
                }
            }
            
            // If no user and no data, load defaults
            Utils.ensureScriptsExist();
            Stats.updateAll();
            Scripts.renderSidebar();
            Scripts.loadScript('opening');
            return;
        }

        if (!AppState.isFirebaseReady) {
            showToast('Firebase unavailable - using offline mode', 'warning');
            Utils.ensureScriptsExist();
            Stats.updateAll();
            Scripts.renderSidebar();
            Scripts.loadScript('opening');
            return;
        }

        const db = this._getDb();
        if (!db) {
            showToast('Database unavailable', 'error');
            Utils.ensureScriptsExist();
            Stats.updateAll();
            Scripts.renderSidebar();
            Scripts.loadScript('opening');
            return;
        }

        try {
            const statusEl = DOM.get('saveStatus');
            if (statusEl && showLoading) statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

            await new Promise(resolve => setTimeout(resolve, 100));

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
                    scriptOrder: ['opening'],
                    closers: CONFIG.DEFAULT_CLOSERS
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
            AppState.closers = userData.closers || CONFIG.DEFAULT_CLOSERS;

            this.subscribeToChanges();

            const scriptsSnapshot = await userRef.collection('scripts').get();
            AppState.scripts = {};
            scriptsSnapshot.forEach(doc => {
                const data = doc.data();
                AppState.scripts[doc.id] = { name: data.name, content: data.content, version: data.version || 1 };
            });
            
            // CRITICAL FIX: If no scripts found in Firebase, use defaults
            if (Object.keys(AppState.scripts).length === 0) {
                console.log('📝 No scripts found in Firebase, creating defaults...');
                await this.createDefaultScripts();
                // Reload scripts after creation
                const reloadedScripts = await userRef.collection('scripts').get();
                AppState.scripts = {};
                reloadedScripts.forEach(doc => {
                    const data = doc.data();
                    AppState.scripts[doc.id] = { name: data.name, content: data.content, version: data.version || 1 };
                });
            }
            
            // Ensure scripts exist after all loading
            Utils.ensureScriptsExist();

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
                teamMembers: AppState.teamMembers,
                closers: AppState.closers
            }));

            Stats.updateAll();
            Scripts.renderSidebar();
            Scripts.loadScript('opening');
            Auth.closeModal();
            if (statusEl) statusEl.innerHTML = '<i class="fas fa-check"></i> Synced';
        } catch (error) {
            console.error('Data Load Error:', error);
            handleError(error, 'Loading Data');
            
            // Fallback to localStorage
            const localData = localStorage.getItem('userData_fallback');
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    AppState.scripts = data.scripts || {};
                    AppState.scriptOrder = data.scriptOrder || [];
                    AppState.appointments = data.appointments || {};
                    AppState.tasks = data.tasks || {};
                    AppState.teamMembers = data.teamMembers || CONFIG.DEFAULT_TEAM_MEMBERS;
                    AppState.closers = data.closers || CONFIG.DEFAULT_CLOSERS;
                    
                    // Ensure scripts exist
                    Utils.ensureScriptsExist();
                    
                    showToast('Using offline data', 'info');
                    Stats.updateAll();
                    Scripts.renderSidebar();
                    Scripts.loadScript('opening');
                } catch (e) {
                    console.warn('Failed to load offline data:', e);
                    // Ultimate fallback - load defaults
                    Utils.ensureScriptsExist();
                    Stats.updateAll();
                    Scripts.renderSidebar();
                    Scripts.loadScript('opening');
                }
            } else {
                // No localStorage data - load defaults
                Utils.ensureScriptsExist();
                Stats.updateAll();
                Scripts.renderSidebar();
                Scripts.loadScript('opening');
            }
        }
    },

    subscribeToChanges: function() {
        if (!AppState.currentUser || !AppState.isFirebaseReady) return;
        if (AppState.appointmentsUnsubscribe) AppState.appointmentsUnsubscribe();
        if (AppState.tasksUnsubscribe) AppState.tasksUnsubscribe();
        if (AppState.teamMembersUnsubscribe) AppState.teamMembersUnsubscribe();

        const db = this._getDb();
        if (!db) {
            console.warn('⚠️ Firestore not available, skipping subscriptions');
            return;
        }

        try {
            const userRef = db.collection('users').doc(AppState.currentUser.uid);

            const setupSubscriptions = () => {
                try {
                    AppState.appointmentsUnsubscribe = userRef.collection('appointments')
                        .orderBy('createdAt', 'desc')
                        .onSnapshot(snap => {
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
                            if (error.message && (
                                error.message.includes('message channel closed') ||
                                error.message.includes('listener indicated an asynchronous response') ||
                                error.message.includes('Extension context invalidated') ||
                                error.message.includes('ERR_BLOCKED_BY_CLIENT')
                            )) {
                                return;
                            }
                            console.warn('Appointments subscription error:', error);
                        });

                    AppState.tasksUnsubscribe = userRef.collection('tasks')
                        .orderBy('createdAt', 'desc')
                        .onSnapshot(snap => {
                            AppState.tasks = [];
                            snap.forEach(doc => AppState.tasks.push({ ...doc.data(), id: doc.id }));
                            Stats.updateTaskStats();
                            FeaturePanel.refreshCurrentView();
                            localStorage.setItem('tasks_fallback', JSON.stringify(AppState.tasks));
                        }, error => {
                            if (error.message && (
                                error.message.includes('message channel closed') ||
                                error.message.includes('listener indicated an asynchronous response') ||
                                error.message.includes('Extension context invalidated') ||
                                error.message.includes('ERR_BLOCKED_BY_CLIENT')
                            )) {
                                return;
                            }
                            console.warn('Tasks subscription error:', error);
                        });

                    AppState.teamMembersUnsubscribe = userRef.collection('teamMembers')
                        .onSnapshot(snap => {
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
                            if (error.message && (
                                error.message.includes('message channel closed') ||
                                error.message.includes('listener indicated an asynchronous response') ||
                                error.message.includes('Extension context invalidated') ||
                                error.message.includes('ERR_BLOCKED_BY_CLIENT')
                            )) {
                                return;
                            }
                            console.warn('Team members subscription error:', error);
                        });
                        
                    console.log('✅ Firestore subscriptions active');
                } catch (setupError) {
                    if (setupError.message && !(
                        setupError.message.includes('message channel closed') ||
                        setupError.message.includes('listener indicated an asynchronous response') ||
                        setupError.message.includes('Extension context invalidated') ||
                        setupError.message.includes('ERR_BLOCKED_BY_CLIENT')
                    )) {
                        console.warn('Error setting up subscriptions:', setupError);
                    }
                    setTimeout(() => {
                        if (AppState.currentUser && AppState.isFirebaseReady) {
                            console.log('🔄 Retrying subscription setup...');
                            this.subscribeToChanges();
                        }
                    }, 2000);
                }
            };

            setTimeout(setupSubscriptions, 200);
            
        } catch (error) {
            if (error.message && !(
                error.message.includes('message channel closed') ||
                error.message.includes('listener indicated an asynchronous response') ||
                error.message.includes('Extension context invalidated') ||
                error.message.includes('ERR_BLOCKED_BY_CLIENT')
            )) {
                console.warn('Subscription setup error:', error);
            }
            
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
        const db = this._getDb();
        if (!db) return;

        const defaultScripts = Utils.getDefaultScripts();
        const batch = db.batch();
        const ref = db.collection('users').doc(AppState.currentUser.uid).collection('scripts');
        for (const [id, script] of Object.entries(defaultScripts)) {
            batch.set(ref.doc(id), {
                name: script.name,
                content: script.content,
                version: script.version || 1,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        await batch.commit();
        console.log('✅ Default scripts created in Firebase');
    },

    saveScriptOrder: async function() {
        if (!AppState.currentUser || !AppState.isFirebaseReady) return;
        const db = this._getDb();
        if (!db) return;
        try {
            await db.collection('users').doc(AppState.currentUser.uid).update({ scriptOrder: AppState.scriptOrder });
        } catch (error) {
            console.error('Error saving script order:', error);
        }
    },

    saveClosers: async function() {
        if (!AppState.currentUser || !AppState.isFirebaseReady) return;
        const db = this._getDb();
        if (!db) return;
        try {
            await db.collection('users').doc(AppState.currentUser.uid).update({ closers: AppState.closers });
            localStorage.setItem('userData_fallback', JSON.stringify({
                scripts: AppState.scripts,
                scriptOrder: AppState.scriptOrder,
                appointments: AppState.appointments,
                tasks: AppState.tasks,
                teamMembers: AppState.teamMembers,
                closers: AppState.closers
            }));
        } catch (error) {
            console.error('Error saving closers:', error);
        }
    },

    addAppointment: function(dateStr, business, contactName, role, phone, time, notes, assigned, editId = null, status = 'Pending', crmLink = '', tags = [], closer = null) {
        if (!AppState.currentUser) { showToast('Please sign in first', 'error'); return null; }
        if (!AppState.appointments[dateStr]) {
            AppState.appointments[dateStr] = { count: 0, note: '', reports: [] };
        }
        if (!CONFIG.STATUS_OPTIONS.includes(status)) status = 'Pending';
        
        if (!closer) {
            const defaultCloser = AppState.closers.find(c => c.default);
            closer = defaultCloser ? defaultCloser.name : 'Kailan';
        }
        
        let email = '';
        if (notes) {
            const extractedEmail = Utils.extractEmail(notes);
            if (extractedEmail) {
                email = extractedEmail;
            }
        }
        
        let finalStatus = status;
        if (Utils.hasTimeSet(time) && status === 'Pending') {
            finalStatus = 'Meeting Booked';
        }
        
        const newAppt = {
            id: editId || Utils.generateId(),
            business: business || 'Unknown Business',
            contactName: contactName || 'Unknown Contact',
            role: role || 'Owner',
            phone: phone || '',
            time: time || '',
            notes: notes || '',
            assigned: assigned || 'Daniel',
            status: finalStatus,
            crmLink: crmLink || '',
            tags: tags || [],
            closer: closer,
            date: dateStr,
            email: email,
            createdAt: new Date().toISOString()
        };
        
        this.syncAppointment(newAppt);
        return newAppt;
    },

    syncAppointment: async function(appointment) {
        if (!AppState.currentUser) return;
        const db = this._getDb();
        if (AppState.isFirebaseReady && db) {
            try {
                await db.collection('users').doc(AppState.currentUser.uid).collection('appointments').doc(appointment.id.toString()).set(appointment, { merge: true });
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
            const db = this._getDb();
            if (AppState.isFirebaseReady && AppState.currentUser && db) {
                db.collection('users').doc(AppState.currentUser.uid).collection('appointments').doc(id.toString()).delete().catch(e => console.warn('Delete error:', e));
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

    getAppointmentsInDateRange: function(startDate, endDate) {
        const result = [];
        const startStr = Utils.formatDateForCompare(startDate);
        const endStr = Utils.formatDateForCompare(endDate);

        for (let date in AppState.appointments) {
            if (date >= startStr && date <= endStr) {
                if (AppState.appointments[date].reports) {
                    result.push(...AppState.appointments[date].reports);
                }
            }
        }
        return result;
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
        const db = this._getDb();
        if (AppState.isFirebaseReady && AppState.currentUser && db) {
            db.collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(task.id).set(task).catch(e => console.warn('Task save error:', e));
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
            const db = this._getDb();
            if (AppState.isFirebaseReady && AppState.currentUser && db) {
                db.collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(id).update({ completed: task.completed }).catch(e => console.warn('Task update error:', e));
            }
            localStorage.setItem('tasks_fallback', JSON.stringify(AppState.tasks));
            Stats.updateTaskStats();
            FeaturePanel.refreshCurrentView();
        }
    },

    deleteTask: function(id) {
        AppState.tasks = AppState.tasks.filter(t => t.id !== id);
        const db = this._getDb();
        if (AppState.isFirebaseReady && AppState.currentUser && db) {
            db.collection('users').doc(AppState.currentUser.uid).collection('tasks').doc(id).delete().catch(e => console.warn('Task delete error:', e));
        }
        localStorage.setItem('tasks_fallback', JSON.stringify(AppState.tasks));
        Stats.updateTaskStats();
        FeaturePanel.refreshCurrentView();
    },

    exportToCSV: function(selectedIds = null) {
        let csv = 'Business,Contact,Phone,Email,Date,Time,Status,PrimaryStatus,Closer,Notes,Assigned\n';
        const appointments = selectedIds ? this.getSelectedAppointments(selectedIds) : this.getAllAppointments();

        appointments.forEach(appt => {
            const status = Utils.getStatus(appt);
            const primaryStatus = Utils.getPrimaryStatus(status);
            csv += `"${appt.business || ''}","${appt.contactName || ''}","${appt.phone || ''}","${appt.email || ''}","${appt.date || ''}","${appt.time || ''}","${status}","${primaryStatus}","${appt.closer || 'Kailan'}","${appt.notes || ''}","${appt.assigned || 'Daniel'}"\n`;
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
        
        const db = this._getDb();
        if (AppState.isFirebaseReady && AppState.currentUser && db) {
            try {
                await db.collection('users').doc(AppState.currentUser.uid).collection('teamMembers').doc(newMember.id).set(newMember);
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
        
        const db = this._getDb();
        if (AppState.isFirebaseReady && AppState.currentUser && db) {
            try {
                await db.collection('users').doc(AppState.currentUser.uid).collection('teamMembers').doc(id).update(updates);
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
        
        const db = this._getDb();
        if (AppState.isFirebaseReady && AppState.currentUser && db) {
            try {
                await db.collection('users').doc(AppState.currentUser.uid).collection('teamMembers').doc(id).delete();
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

        // Ensure scripts exist
        Utils.ensureScriptsExist();

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
            
            const db = Data._getDb();
            if (AppState.isFirebaseReady && AppState.currentUser && db) {
                db.collection('users')
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

        const db = Data._getDb();
        if (AppState.isFirebaseReady && AppState.currentUser && db) {
            db.collection('users')
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
                    Data.saveScriptOrder();
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
            Data.saveScriptOrder();
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
        // Ensure scripts exist
        Utils.ensureScriptsExist();
        
        if (!AppState.scripts[id]) {
            const ids = Object.keys(AppState.scripts);
            if (ids.length > 0) {
                id = ids[0];
            } else {
                // If still no scripts, create defaults
                Utils.ensureScriptsExist();
                const newIds = Object.keys(AppState.scripts);
                if (newIds.length > 0) {
                    id = newIds[0];
                } else {
                    showToast('No scripts available. Create a new script.', 'warning');
                    return;
                }
            }
        }
        if (AppState.isEditing) {
            if (!confirm('You have unsaved changes. Discard them?')) return;
            this.cancelEdit();
        }
        AppState.currentScriptId = id;
        const script = AppState.scripts[id];
        if (!script) {
            Utils.ensureScriptsExist();
            const newIds = Object.keys(AppState.scripts);
            if (newIds.length > 0) {
                AppState.currentScriptId = newIds[0];
                const newScript = AppState.scripts[newIds[0]];
                DOM.setText('currentScriptName', newScript.name);
                DOM.setHTML('scriptContent', `<div class="script-display">${Utils.escapeHtml(newScript.content).replace(/\n/g, '<br>')}</div>`);
                DOM.setText('versionNumber', newScript.version || 1);
            }
            this.renderSidebar();
            this.updateKeyHints();
            setTimeout(() => { renderScriptActions(); }, 50);
            return;
        }
        DOM.setText('currentScriptName', script.name);
        DOM.setHTML('scriptContent', `<div class="script-display">${Utils.escapeHtml(script.content).replace(/\n/g, '<br>')}</div>`);
        DOM.setText('versionNumber', script.version || 1);
        this.updateFavoriteStar();
        this.renderSidebar();
        this.updateKeyHints();
        
        setTimeout(() => {
            renderScriptActions();
        }, 50);
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
        const star = document.getElementById('favoriteScriptBtn');
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

        const editBtn = document.getElementById('editScriptBtn');
        const saveBtn = document.getElementById('saveScriptBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const badge = document.getElementById('editStatusBadge');
        
        if (editBtn) editBtn.style.display = 'none';
        if (saveBtn) { saveBtn.style.display = 'inline-flex'; saveBtn.style.background = 'var(--success)'; }
        if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        if (badge) badge.style.display = 'inline-flex';

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

        const db = Data._getDb();
        if (AppState.isFirebaseReady && db) {
            db.collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(AppState.currentScriptId).set(updatedScript, { merge: true })
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
        
        const editBtn = document.getElementById('editScriptBtn');
        const saveBtn = document.getElementById('saveScriptBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const badge = document.getElementById('editStatusBadge');
        
        if (editBtn) editBtn.style.display = 'inline-flex';
        if (saveBtn) saveBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (badge) badge.style.display = 'none';
        
        this.loadScript(AppState.currentScriptId);
        showToast('Changes saved', 'success');
    },

    cancelEdit: function() {
        if (!confirm('Discard your changes?')) return;
        AppState.isEditing = false;
        AppState.shortcutsEnabled = true;
        
        const editBtn = document.getElementById('editScriptBtn');
        const saveBtn = document.getElementById('saveScriptBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const badge = document.getElementById('editStatusBadge');
        
        if (editBtn) editBtn.style.display = 'inline-flex';
        if (saveBtn) saveBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (badge) badge.style.display = 'none';
        
        this.loadScript(AppState.currentScriptId);
    },

    resetScript: function() {
        if (!confirm('Reset this script to its original content?')) return;
        if (AppState.currentUser && AppState.currentScriptId) {
            const script = AppState.scripts[AppState.currentScriptId];
            const db = Data._getDb();
            if (AppState.isFirebaseReady && db) {
                db.collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(AppState.currentScriptId).set({
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

        const db = Data._getDb();
        if (AppState.isFirebaseReady && db) {
            db.collection('users')
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
            Data.saveScriptOrder();
        }
    },

    saveScriptOrder: function() {
        Data.saveScriptOrder();
    },

    isEditing: function() {
        return AppState.isEditing;
    }
};

// ================================================================
// SCRIPT ACTIONS RENDERER
// ================================================================

function renderScriptActions() {
    const container = document.getElementById('scriptActionsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const buttons = [
        { id: 'editScriptBtn', icon: 'fa-pen', text: 'Edit', style: '', extraClass: '' },
        { id: 'saveScriptBtn', icon: 'fa-save', text: 'Save', style: 'display:none; background:var(--success);', extraClass: '' },
        { id: 'cancelEditBtn', icon: 'fa-times', text: 'Cancel', style: 'display:none;', extraClass: '' },
        { id: 'copyScriptBtn', icon: 'fa-copy', text: 'Copy', style: '', extraClass: '' },
        { id: 'resetScriptBtn', icon: 'fa-undo-alt', text: 'Reset', style: '', extraClass: '' },
        { id: 'favoriteScriptBtn', icon: 'fa-star', text: '', style: '', extraClass: '' },
        { id: 'objectionToggleBtn', icon: 'fa-shield-alt', text: 'Objections', style: 'background:var(--secondary); color:white;', extraClass: 'objection-btn' }
    ];
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.id = btn.id;
        button.className = `btn-icon ${btn.extraClass || ''}`;
        if (btn.style) {
            button.setAttribute('style', btn.style);
        }
        if (btn.disabled) {
            button.disabled = true;
        }
        button.setAttribute('data-action', btn.id.replace('Btn', '').replace('Script', '').toLowerCase());
        button.innerHTML = `<i class="fas ${btn.icon}"></i> ${btn.text}`;
        container.appendChild(button);
    });
    
    updateFavoriteStarUI();
    attachScriptActionEvents();
    attachObjectionHandlerButtons();
}

function updateFavoriteStarUI() {
    const star = document.getElementById('favoriteScriptBtn');
    if (star) {
        const isFavorite = AppState.scriptFavorites.includes(AppState.currentScriptId);
        star.innerHTML = `<i class="fas fa-star" style="color:${isFavorite ? 'var(--favorite-color)' : 'var(--text-muted)'}"></i>`;
        star.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    }
}

function attachScriptActionEvents() {
    const editScriptBtn = document.getElementById('editScriptBtn');
    if (editScriptBtn) {
        editScriptBtn.removeEventListener('click', Scripts.startEdit);
        editScriptBtn.addEventListener('click', () => Scripts.startEdit());
    }
    
    const saveScriptBtn = document.getElementById('saveScriptBtn');
    if (saveScriptBtn) {
        saveScriptBtn.removeEventListener('click', handleSaveScript);
        saveScriptBtn.addEventListener('click', handleSaveScript);
    }
    
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.removeEventListener('click', () => Scripts.cancelEdit());
        cancelEditBtn.addEventListener('click', () => Scripts.cancelEdit());
    }
    
    const copyScriptBtn = document.getElementById('copyScriptBtn');
    if (copyScriptBtn) {
        copyScriptBtn.removeEventListener('click', handleCopyScript);
        copyScriptBtn.addEventListener('click', handleCopyScript);
    }
    
    const resetScriptBtn = document.getElementById('resetScriptBtn');
    if (resetScriptBtn) {
        resetScriptBtn.removeEventListener('click', () => Scripts.resetScript());
        resetScriptBtn.addEventListener('click', () => Scripts.resetScript());
    }
    
    const favoriteScriptBtn = document.getElementById('favoriteScriptBtn');
    if (favoriteScriptBtn) {
        favoriteScriptBtn.removeEventListener('click', handleFavoriteScript);
        favoriteScriptBtn.addEventListener('click', handleFavoriteScript);
    }
}

function handleSaveScript() {
    const textarea = document.getElementById('editTextarea');
    if (textarea) {
        Scripts.saveScriptContent(textarea.value);
        Scripts.finishEdit();
    }
}

function handleCopyScript() {
    const script = AppState.scripts[AppState.currentScriptId];
    if (script) copyToClipboard(script.content);
}

function handleFavoriteScript() {
    Scripts.toggleFavorite(AppState.currentScriptId);
}

// ================================================================
// OBJECTION HANDLER BUTTON WIRING - FIXED
// ================================================================

function attachObjectionHandlerButtons() {
    const buttons = document.querySelectorAll('#objectionToggleBtn, .objection-btn, [data-action="objection"]');
    
    buttons.forEach(btn => {
        if (btn._objectionAttached) return;
        btn._objectionAttached = true;
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (typeof ObjectionHandler !== 'undefined' && ObjectionHandler) {
                if (typeof ObjectionHandler.openModal === 'function') {
                    ObjectionHandler.openModal();
                } else if (typeof ObjectionHandler.init === 'function') {
                    ObjectionHandler.init();
                    setTimeout(() => {
                        if (typeof ObjectionHandler.openModal === 'function') {
                            ObjectionHandler.openModal();
                        } else {
                            showToast('Objection handler is initializing...', 'warning');
                        }
                    }, 300);
                } else {
                    showToast('Objection handler not available. Please refresh.', 'warning');
                }
            } else {
                showToast('Objection handler not loaded. Please refresh.', 'warning');
            }
        });
    });
}

// ================================================================
// SHORTCUTS HELP MODAL
// ================================================================

function openShortcutsHelp() {
    const modal = document.getElementById('shortcutsHelpModal');
    if (!modal) return;
    modal.style.display = 'flex';
    
    const closeBtn = document.getElementById('closeShortcutsHelpBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.style.display = 'none';
    });
}

// ================================================================
// CLOSER MANAGEMENT
// ================================================================

function openCloserManagement() {
    const modal = document.getElementById('closerManagementModal');
    if (!modal) return;
    modal.style.display = 'flex';
    renderClosersList();
}

function closeCloserManagement() {
    const modal = document.getElementById('closerManagementModal');
    if (modal) modal.style.display = 'none';
}

function renderClosersList() {
    const container = document.getElementById('closersList');
    if (!container) return;
    
    const closers = AppState.closers || [];
    
    if (closers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-tie"></i>
                <p>No closers added yet. Add your first closer!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    closers.forEach(closer => {
        html += `
            <div class="closer-item ${closer.active ? 'active' : 'inactive'}" data-id="${closer.id}">
                <div class="closer-info">
                    <div class="closer-avatar">👤</div>
                    <div class="closer-details">
                        <div class="closer-name">${Utils.escapeHtml(closer.name)} ${closer.default ? '⭐' : ''}</div>
                        <div class="closer-email">${Utils.escapeHtml(closer.email || '')}</div>
                        <div class="closer-phone">${Utils.escapeHtml(closer.phone || '')}</div>
                    </div>
                </div>
                <div class="closer-actions">
                    ${!closer.default ? `
                        <button class="btn-icon set-default-btn" data-id="${closer.id}" style="background:var(--primary); color:white; padding:4px 12px; font-size:0.7rem;">
                            <i class="fas fa-star"></i> Set Default
                        </button>
                        <button class="btn-icon toggle-closer-btn" data-id="${closer.id}" style="background:${closer.active ? 'var(--warning)' : 'var(--success)'}; color:white; padding:4px 12px; font-size:0.7rem;">
                            <i class="fas ${closer.active ? 'fa-pause' : 'fa-play'}"></i> ${closer.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="btn-icon delete-closer-btn" data-id="${closer.id}" style="background:var(--danger); color:white; padding:4px 12px; font-size:0.7rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <span class="badge" style="background:var(--success); color:white; padding:4px 12px; border-radius:20px; font-size:0.7rem;">
                            <i class="fas fa-check-circle"></i> Default
                        </span>
                    `}
                    <span class="status-badge ${closer.active ? 'active' : 'inactive'}">
                        ${closer.active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    container.querySelectorAll('.set-default-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            setDefaultCloser(id);
        });
    });
    
    container.querySelectorAll('.toggle-closer-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            toggleCloserActive(id);
        });
    });
    
    container.querySelectorAll('.delete-closer-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            deleteCloser(id);
        });
    });
}

function addCloser() {
    const name = prompt('Enter closer name:');
    if (!name || !name.trim()) return;
    
    const email = prompt('Enter closer email (optional):');
    const phone = prompt('Enter closer phone (optional):');
    
    const newCloser = {
        id: Utils.generateId(),
        name: name.trim(),
        email: email ? email.trim() : '',
        phone: phone ? phone.trim() : '',
        active: true,
        default: false
    };
    
    AppState.closers.push(newCloser);
    Data.saveClosers();
    renderClosersList();
    updateCloserSelects();
    showToast(`Closer ${newCloser.name} added!`, 'success');
}

function setDefaultCloser(id) {
    AppState.closers.forEach(c => c.default = false);
    const closer = AppState.closers.find(c => c.id === id);
    if (closer) {
        closer.default = true;
        Data.saveClosers();
        renderClosersList();
        updateCloserSelects();
        showToast(`${closer.name} is now the default closer`, 'success');
    }
}

function toggleCloserActive(id) {
    const closer = AppState.closers.find(c => c.id === id);
    if (closer) {
        closer.active = !closer.active;
        Data.saveClosers();
        renderClosersList();
        updateCloserSelects();
        showToast(`${closer.name} ${closer.active ? 'activated' : 'deactivated'}`, 'info');
    }
}

function deleteCloser(id) {
    const closer = AppState.closers.find(c => c.id === id);
    if (!closer) return;
    
    if (closer.default) {
        showToast('Cannot delete the default closer. Set another closer as default first.', 'warning');
        return;
    }
    
    if (!confirm(`Delete closer "${closer.name}"?`)) return;
    
    AppState.closers = AppState.closers.filter(c => c.id !== id);
    Data.saveClosers();
    renderClosersList();
    updateCloserSelects();
    showToast(`Closer ${closer.name} deleted`, 'info');
}

function updateCloserSelects() {
    const closerSelect = document.getElementById('newApptCloser');
    if (closerSelect) {
        const activeClosers = AppState.closers.filter(c => c.active);
        const currentValue = closerSelect.value;
        closerSelect.innerHTML = activeClosers.map(c => 
            `<option value="${c.name}" ${c.default ? 'selected' : ''}>${c.name} ${c.default ? '⭐' : ''}</option>`
        ).join('');
        if (currentValue && activeClosers.some(c => c.name === currentValue)) {
            closerSelect.value = currentValue;
        }
    }
}

// ================================================================
// APPOINTMENT DETAIL FUNCTIONS
// ================================================================

function showAppointmentDetail(appointmentId) {
    const appt = Data.getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    AppState.currentAppointmentId = appointmentId;

    const modal = DOM.get('appointmentDetailModal');
    if (!modal) return;

    const status = Utils.getStatus(appt);
    const primaryStatus = Utils.getPrimaryStatus(status);
    const isSecondary = CONFIG.SECONDARY_STATUSES.includes(status);
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
                        ${appt.email ? `<div style="font-size:0.8rem; color:var(--text-muted);">✉️ ${Utils.escapeHtml(appt.email)}</div>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="status-tag ${Utils.getStatusClass(status)}">${status}</span>
                        ${isSecondary ? `<span style="font-size:0.7rem; color:var(--text-muted);">→ ${primaryStatus}</span>` : ''}
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
                    <button class="btn-icon" onclick="window.openContactDetail('${appt.id}')" style="background:var(--primary); color:white;">
                        <i class="fas fa-user"></i> Open Contact
                    </button>
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

function openContactDetail(appointmentId) {
    const appt = Data.getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    
    AppState.calendarViewMode = 'list';
    AppState.calendarSearchTerm = appt.business;
    FeaturePanel.refreshCurrentView();
    closeAppointmentDetail();
    showToast(`Showing appointments for ${appt.business}`, 'info');
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
        const formattedDate = Utils.parseDateStringEnhanced ? 
            Utils.parseDateStringEnhanced(newDate.trim()) : 
            Utils.parseDateString(newDate.trim());
        if (formattedDate) {
            const newTime = prompt('Enter new time (e.g., 2:30 PM):', appt.time || '');
            Data.updateAppointment(appt.date, appt.id, { 
                date: formattedDate,
                time: newTime || appt.time,
                status: 'Rescheduled'
            });
            closeAppointmentDetail();
            Utils.syncCalendarToDate(formattedDate);
            showToast(`Appointment rescheduled to ${Utils.formatDate(formattedDate)}`, 'success');
        } else {
            showToast('Invalid date format. Please use YYYY-MM-DD.', 'error');
        }
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
// SMART IMPORT FUNCTIONS
// ================================================================

let _isImportSaving = false;

function openSmartImportEnhanced() {
    const modal = DOM.get('smartImportModal');
    if (!modal) return;
    
    _isImportSaving = false;
    ImportState.isSaving = false;
    
    modal.style.display = 'flex';
    
    ImportState.parsedRecords = [];
    ImportState.validatedRecords = [];
    ImportState.duplicates = [];
    ImportState.errors = [];
    ImportState.warnings = [];
    ImportState.totalProcessed = 0;
    ImportState.totalValid = 0;
    ImportState.totalInvalid = 0;
    ImportState.totalDuplicates = 0;
    ImportState.processingStatus = 'idle';
    ImportState.progress = 0;
    
    const dateInput = DOM.get('importDefaultDate');
    if (dateInput) {
        const activeDate = Utils.getActiveDate();
        dateInput.value = activeDate;
    }
    
    const textArea = DOM.get('importTextArea');
    if (textArea) {
        textArea.value = '';
        textArea.placeholder = `Paste appointment details here. The system will intelligently parse:
        Example:
Business Name/Company : Correa and Son's Landscaping LLC
Name : Kelvin
Role : Owner
Email: kelvin@correa.com
Phone Number: +12678808990
Best Time for Warm Callback: Tomorrow at 1pm EDT
Notes: Custom website preview offered + no website currently + high interest, positive and booked a manager callback to review the website.`;
    }
    
    const preview = DOM.get('importPreview');
    if (preview) preview.style.display = 'none';
    
    const saveBtn = DOM.get('saveImportBtn');
    if (saveBtn) {
        saveBtn.style.display = 'none';
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Records';
    }
    
    const resultsContainer = DOM.get('importResultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';
    
    const progressContainer = DOM.get('importProgressContainer');
    if (progressContainer) progressContainer.style.display = 'none';
    
    const summary = DOM.get('importSummary');
    if (summary) summary.style.display = 'none';
    
    AppState.parsedImportData = {};
    AppState.importConfidence = {};
}

function closeSmartImportEnhanced() {
    const modal = DOM.get('smartImportModal');
    if (modal) modal.style.display = 'none';
    AppState.parsedImportData = {};
    AppState.importConfidence = {};
    ImportState.processingStatus = 'idle';
    ImportState.isSaving = false;
    _isImportSaving = false;
}

function updateImportProgress(percent, message) {
    ImportState.progress = percent;
    const progressBar = DOM.get('importProgressBar');
    const progressText = DOM.get('importProgressText');
    const progressStatus = DOM.get('importProgressStatus');
    
    if (progressBar) {
        progressBar.style.width = Math.min(percent, 100) + '%';
    }
    if (progressText) {
        progressText.textContent = Math.min(percent, 100) + '%';
    }
    if (progressStatus && message) {
        progressStatus.textContent = message;
    }
}

function renderImportResultsEnhanced(records) {
    const preview = DOM.get('importPreview');
    const resultsContainer = DOM.get('importResultsContainer');
    const saveBtn = DOM.get('saveImportBtn');
    const progressContainer = DOM.get('importProgressContainer');
    const summary = DOM.get('importSummary');
    
    if (!preview || !resultsContainer) return;
    
    preview.style.display = 'block';
    
    if (progressContainer) progressContainer.style.display = 'block';
    
    if (summary) {
        const total = records.length;
        const valid = records.filter(r => r.isValid).length;
        const invalid = records.filter(r => !r.isValid).length;
        const duplicates = records.filter(r => r.hasDuplicate).length;
        
        summary.style.display = 'block';
        summary.innerHTML = `
            <div class="import-summary-grid">
                <div class="import-stat ${valid > 0 ? 'success' : ''}">
                    <span class="stat-number">${valid}</span>
                    <span class="stat-label">Valid Records</span>
                </div>
                <div class="import-stat ${invalid > 0 ? 'warning' : ''}">
                    <span class="stat-number">${invalid}</span>
                    <span class="stat-label">Needs Review</span>
                </div>
                <div class="import-stat ${duplicates > 0 ? 'warning' : ''}">
                    <span class="stat-number">${duplicates}</span>
                    <span class="stat-label">Potential Duplicates</span>
                </div>
                <div class="import-stat">
                    <span class="stat-number">${total}</span>
                    <span class="stat-label">Total Processed</span>
                </div>
            </div>
        `;
    }
    
    let resultsHtml = '';
    
    records.forEach((record, idx) => {
        const statusClass = record.isValid ? 'valid' : 'invalid';
        const hasDuplicate = record.hasDuplicate;
        const hasWarnings = record.warnings && record.warnings.length > 0;
        
        const avgConfidence = getAverageConfidence(record.confidence);
        const confColor = avgConfidence >= 0.7 ? 'high' : avgConfidence >= 0.4 ? 'medium' : 'low';
        
        const synonyms = record.context?.synonyms || {};
        const hasSynonyms = Object.values(synonyms).some(arr => arr && arr.length > 0);
        
        const emailDisplay = record.parsed.email || record.validated.email || '';
        const timeDisplay = record.parsed.time || record.validated.time || '';
        
        resultsHtml += `
            <div class="import-record ${statusClass} ${hasDuplicate ? 'duplicate' : ''}">
                <div class="record-header" onclick="toggleImportRecord(this)">
                    <div class="record-status">
                        <span class="status-icon ${statusClass}">${record.isValid ? '✅' : '⚠️'}</span>
                        <span class="record-index">#${record.index}</span>
                    </div>
                    <div class="record-summary">
                        <span class="record-name">${Utils.escapeHtml(record.validated.name || record.parsed.name || 'Unknown')}</span>
                        <span class="record-business">${Utils.escapeHtml(record.validated.business || record.parsed.business || 'Unknown Business')}</span>
                        ${record.parsed.date ? `<span class="record-date">📅 ${Utils.escapeHtml(record.parsed.date)}</span>` : ''}
                        ${timeDisplay ? `<span class="record-date" style="margin-left:6px;">🕐 ${Utils.escapeHtml(timeDisplay)}</span>` : ''}
                    </div>
                    <div class="record-badges">
                        ${emailDisplay ? `<span class="badge" style="background:var(--primary); color:white;">✉️</span>` : ''}
                        ${hasSynonyms ? `<span class="badge synonym">🔍 Synonyms</span>` : ''}
                        ${hasDuplicate ? '<span class="badge duplicate">🔄 Duplicate</span>' : ''}
                        ${hasWarnings ? `<span class="badge warning">⚠️ ${record.warnings.length}</span>` : ''}
                        ${!record.isValid ? `<span class="badge error">❌ ${record.errors.length}</span>` : ''}
                        <span class="badge confidence ${confColor}">${Math.round(avgConfidence * 100)}%</span>
                    </div>
                    <span class="record-toggle">▼</span>
                </div>
                <div class="record-body" style="display:none;">
                    <div class="record-fields">
                        ${renderRecordFieldsEnhanced(record)}
                    </div>
                    
                    ${hasSynonyms ? `
                        <div class="record-synonyms">
                            <strong>🔍 Detected Synonyms:</strong>
                            <ul>${Object.entries(synonyms).filter(([key, arr]) => arr && arr.length > 0).map(([key, arr]) => 
                                `<li><strong>${key}:</strong> ${arr.join(', ')}</li>`
                            ).join('')}</ul>
                        </div>
                    ` : ''}
                    
                    ${record.warnings && record.warnings.length > 0 ? `
                        <div class="record-warnings">
                            <strong>⚠️ Warnings:</strong>
                            <ul>${record.warnings.map(w => `<li>${w.field}: ${w.message}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    
                    ${!record.isValid ? `
                        <div class="record-errors">
                            <strong>❌ Errors:</strong>
                            <ul>${record.errors.map(e => `<li>${e.field}: ${e.message}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    
                    ${record.hasDuplicate ? `
                        <div class="record-duplicates">
                            <strong>🔄 Potential Duplicates:</strong>
                            <ul>${record.duplicates.filter(d => d.confidence >= 60).map(d => 
                                `<li>${Utils.escapeHtml(d.existing.business)} - ${Utils.escapeHtml(d.existing.contactName)} (${d.confidence}% match)</li>`
                            ).join('')}</ul>
                            <button class="btn-icon merge-btn" data-index="${record.index}" style="background:var(--warning); color:#1e293b; margin-top:8px;">
                                <i class="fas fa-merge"></i> Merge
                            </button>
                        </div>
                    ` : ''}
                    
                    <div class="record-actions">
                        <button class="btn-icon edit-btn" data-index="${record.index}" style="background:var(--primary); color:white;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-icon skip-btn" data-index="${record.index}" style="background:var(--danger); color:white;">
                            <i class="fas fa-times"></i> Skip
                        </button>
                        ${record.isValid ? `
                            <button class="btn-icon save-single-btn" data-index="${record.index}" style="background:var(--success); color:white;">
                                <i class="fas fa-save"></i> Save
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHtml;
    
    resultsContainer.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        if (target.classList.contains('edit-btn')) {
            const index = parseInt(target.dataset.index);
            editImportRecord(index);
            return;
        }
        
        if (target.classList.contains('skip-btn')) {
            const index = parseInt(target.dataset.index);
            skipImportRecord(index);
            return;
        }
        
        if (target.classList.contains('save-single-btn')) {
            const index = parseInt(target.dataset.index);
            saveSingleRecord(index);
            return;
        }
        
        if (target.classList.contains('merge-btn')) {
            const index = parseInt(target.dataset.index);
            mergeDuplicate(index);
            return;
        }
    });
    
    const validRecords = records.filter(r => r.isValid);
    if (saveBtn && validRecords.length > 0) {
        saveBtn.style.display = 'inline-flex';
        saveBtn.disabled = false;
        saveBtn.textContent = `Save ${validRecords.length} Record(s)`;
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            saveAllImportedAppointments();
        };
    } else if (saveBtn) {
        saveBtn.style.display = 'none';
    }
}

function renderRecordFieldsEnhanced(record) {
    const fields = record.validated || record.parsed || {};
    const confidence = record.confidence || {};
    
    const fieldLabels = {
        name: '👤 Name',
        business: '🏢 Business',
        phone: '📞 Phone',
        email: '✉️ Email',
        date: '📅 Date',
        time: '🕐 Time',
        status: '📊 Status',
        assigned: '👤 Assigned',
        role: '💼 Role',
        notes: '📝 Notes'
    };
    
    const fieldOrder = ['name', 'business', 'phone', 'email', 'date', 'time', 'status', 'assigned', 'role', 'notes'];
    
    let html = '';
    for (const field of fieldOrder) {
        if (fields[field]) {
            const conf = confidence[field] || 0.5;
            const confClass = conf >= 0.7 ? 'high' : (conf >= 0.4 ? 'medium' : 'low');
            const isDate = field === 'date';
            const valueDisplay = isDate ? Utils.formatDate(fields[field]) : Utils.escapeHtml(fields[field]);
            html += `
                <div class="field-row ${isDate ? 'date-field' : ''}">
                    <span class="field-label">${fieldLabels[field] || field}</span>
                    <span class="field-value">${valueDisplay}</span>
                    <span class="field-confidence ${confClass}">${Math.round(conf * 100)}%</span>
                </div>
            `;
        }
    }
    
    return html;
}

function getAverageConfidence(confidence) {
    const values = Object.values(confidence || {});
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function toggleImportRecord(header) {
    const body = header.nextElementSibling;
    if (body) {
        const isVisible = body.style.display !== 'none';
        body.style.display = isVisible ? 'none' : 'block';
        const toggle = header.querySelector('.record-toggle');
        if (toggle) {
            toggle.textContent = isVisible ? '▶' : '▼';
        }
    }
}

function parseAppointmentTextEnhanced(text, defaultDate = null) {
    const result = {};
    const confidence = {};
    const context = {
        hasKeyValue: false,
        hasBulletPoints: false,
        hasNaturalLanguage: false,
        detectedFormat: 'unknown',
        synonyms: {
            date: [],
            time: [],
            status: [],
            assigned: []
        }
    };
    
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n').filter(line => line.trim());
    const fullText = lines.join(' ');
    
    context.hasKeyValue = lines.some(line => line.includes(':') || line.includes('=') || line.includes('->'));
    context.hasBulletPoints = lines.some(line => /^[\s]*[•\-*]\s/.test(line));
    context.hasNaturalLanguage = !context.hasKeyValue && !context.hasBulletPoints;
    
    if (context.hasKeyValue) context.detectedFormat = 'key_value';
    else if (context.hasBulletPoints) context.detectedFormat = 'bullet_points';
    else if (context.hasNaturalLanguage) context.detectedFormat = 'natural_language';
    
    if (context.detectedFormat === 'key_value') {
        parseKeyValueFormatEnhanced(lines, result, confidence, context);
    } else if (context.detectedFormat === 'bullet_points') {
        parseBulletPointFormat(lines, result, confidence);
    } else {
        parseNaturalLanguageFormat(fullText, lines, result, confidence);
    }
    
    enhanceParsedDataEnhanced(result, confidence, fullText, context, defaultDate);
    
    return { result, confidence, context };
}

function parseKeyValueFormatEnhanced(lines, result, confidence, context) {
    const separators = [':', '=', '->', '=>'];
    
    const synonymMap = {
        'best time': 'time',
        'callback time': 'time',
        'callback date': 'date',
        'scheduled date': 'date',
        'appointment date': 'date',
        'meeting date': 'date',
        'call date': 'date',
        'scheduled time': 'time',
        'meeting time': 'time',
        'appointment time': 'time',
        'call time': 'time',
        'lead status': 'status',
        'call status': 'status',
        'appointment status': 'status',
        'assigned agent': 'assigned',
        'assigned to': 'assigned',
        'team member': 'assigned',
        'handler': 'assigned',
        'contact number': 'phone',
        'mobile number': 'phone',
        'cell phone': 'phone',
        'business name': 'business',
        'company name': 'business',
        'organization name': 'business',
        'full name': 'name',
        'contact name': 'name',
        'client name': 'name',
        'customer name': 'name',
        'person name': 'name'
    };
    
    lines.forEach(line => {
        let separatorIndex = -1;
        let separatorUsed = '';
        
        for (const sep of separators) {
            const idx = line.indexOf(sep);
            if (idx !== -1 && (separatorIndex === -1 || idx < separatorIndex)) {
                separatorIndex = idx;
                separatorUsed = sep;
            }
        }
        
        if (separatorIndex !== -1) {
            let key = line.substring(0, separatorIndex).trim().toLowerCase();
            const value = line.substring(separatorIndex + separatorUsed.length).trim();
            
            if (value) {
                let matchedField = null;
                
                if (synonymMap[key]) {
                    matchedField = synonymMap[key];
                    context.synonyms[matchedField] = context.synonyms[matchedField] || [];
                    context.synonyms[matchedField].push(key);
                }
                
                if (!matchedField) {
                    matchedField = matchFieldName(key);
                }
                
                if (key.includes('best time') || key.includes('callback') && key.includes('time')) {
                    const dateMatch = value.match(/(\w+\s+\d{1,2},?\s+\d{4})/i);
                    const timeMatch = value.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
                    const relativeDateMatch = value.match(/\b(today|tomorrow|yesterday|next week|this week)\b/i);
                    
                    if (dateMatch) {
                        result['date'] = dateMatch[1];
                        confidence['date'] = 0.9;
                        context.synonyms.date.push('best time');
                    }
                    if (timeMatch) {
                        result['time'] = timeMatch[1];
                        confidence['time'] = 0.9;
                        context.synonyms.time.push('best time');
                    }
                    if (relativeDateMatch) {
                        const relativeDate = parseRelativeDate(relativeDateMatch[1]);
                        if (relativeDate) {
                            result['date'] = relativeDate;
                            confidence['date'] = 0.85;
                            context.synonyms.date.push(relativeDateMatch[1]);
                        }
                    }
                    if (!result['notes']) {
                        result['notes'] = '';
                    }
                    result['notes'] += (result['notes'] ? '\n' : '') + `Best time: ${value}`;
                    confidence['notes'] = 0.6;
                } else if (matchedField) {
                    result[matchedField] = value;
                    confidence[matchedField] = 0.9;
                    if (matchedField === 'date') {
                        const parsedDate = parseDateStringEnhanced(value);
                        if (parsedDate) {
                            result['date'] = parsedDate;
                            confidence['date'] = 0.95;
                        }
                    }
                    if (matchedField !== 'email') {
                        const extractedEmail = Utils.extractEmail(value);
                        if (extractedEmail && !result.email) {
                            result.email = extractedEmail;
                            confidence.email = 0.8;
                        }
                    }
                } else {
                    const extractedEmail = Utils.extractEmail(value);
                    if (extractedEmail && !result.email) {
                        result.email = extractedEmail;
                        confidence.email = 0.7;
                    } else if (!result['notes']) {
                        result['notes'] = '';
                    }
                    result['notes'] += (result['notes'] ? '\n' : '') + `${key}: ${value}`;
                    confidence['notes'] = 0.5;
                }
            }
        } else if (line.trim()) {
            const extractedEmail = Utils.extractEmail(line);
            if (extractedEmail && !result.email) {
                result.email = extractedEmail;
                confidence.email = 0.6;
            } else if (!result['notes']) {
                result['notes'] = '';
            }
            result['notes'] += (result['notes'] ? '\n' : '') + line.trim();
            confidence['notes'] = 0.4;
        }
    });
}

function parseBulletPointFormat(lines, result, confidence) {
    const bulletPattern = /^[\s]*[•\-*]\s*(.*)$/;
    let currentSection = 'notes';
    
    lines.forEach(line => {
        const match = line.match(bulletPattern);
        if (match) {
            const content = match[1].trim();
            
            const extractedEmail = Utils.extractEmail(content);
            if (extractedEmail && !result.email) {
                result.email = extractedEmail;
                confidence.email = 0.7;
            }
            
            const fieldMatch = content.match(/^([^:]+):\s*(.*)$/);
            if (fieldMatch) {
                const key = fieldMatch[1].trim().toLowerCase();
                const value = fieldMatch[2].trim();
                const matchedField = matchFieldName(key);
                if (matchedField) {
                    result[matchedField] = value;
                    confidence[matchedField] = 0.85;
                    currentSection = matchedField;
                } else {
                    if (!result.notes) result.notes = '';
                    result.notes += (result.notes ? '\n' : '') + content;
                    confidence.notes = 0.4;
                }
            } else {
                if (result[currentSection] && currentSection !== 'notes') {
                    result[currentSection] += ' ' + content;
                } else {
                    if (!result.notes) result.notes = '';
                    result.notes += (result.notes ? '\n' : '') + content;
                    confidence.notes = 0.4;
                }
            }
        }
    });
}

function parseNaturalLanguageFormat(fullText, lines, result, confidence) {
    const namePatterns = [
        /(?:name|contact|client|customer|person|full name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /(?:from|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:from|at|with|said|wants|would like)/i,
        /contact:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
    ];
    
    for (const pattern of namePatterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
            result.name = match[1].trim();
            confidence.name = 0.7;
            break;
        }
    }
    
    const businessPatterns = [
        /(?:business|company|organization|org|firm|brand|store)[:\s]+([A-Z][a-zA-Z0-9\s&]+?)(?:[,.\n]|$)/i,
        /(?:from|at|with)\s+([A-Z][a-zA-Z0-9\s&]+?)(?:[,.\n]|$)/i,
        /(?:company|business)[:\s]*([A-Z][a-zA-Z0-9\s&]+?)(?:[,.\n]|$)/i
    ];
    
    for (const pattern of businessPatterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
            result.business = match[1].trim();
            confidence.business = 0.7;
            break;
        }
    }
    
    const phonePatterns = [
        /(?:phone|mobile|cell|telephone|number|call)[:\s]+([+\d\s\-\(\)]{7,20})/i,
        /([+\d\s\-\(\)]{10,20})(?:\s*(?:is|was|will be|the|their|his|her))/i,
        /(?:call|reach|contact)\s+(?:at|on|via)\s+([+\d\s\-\(\)]{10,20})/i,
        /(\d{3}[-.]?\d{3}[-.]?\d{4})/,
        /\(\d{3}\)\s*\d{3}[-.]?\d{4}/
    ];
    
    for (const pattern of phonePatterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
            result.phone = match[1].trim();
            confidence.phone = 0.85;
            break;
        }
    }
    
    const emailPatterns = [
        /(?:email|e-mail|mail)[:\s]+([^\s@]+@[^\s@]+\.[^\s@]+)/i,
        /([^\s@]+@[^\s@]+\.[^\s@]+)/
    ];
    
    for (const pattern of emailPatterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
            result.email = match[1].trim().toLowerCase();
            confidence.email = 0.9;
            break;
        }
    }
    
    if (!result.email) {
        const emailMatch = Utils.extractEmail(fullText);
        if (emailMatch) {
            result.email = emailMatch;
            confidence.email = 0.6;
        }
    }
    
    const datePatterns = [
        /(?:date|appointment|scheduled|meeting|call|day)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
        /(?:best time|callback)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
        /(\d{1,2}\/\d{1,2}\/\d{4})/,
        /(\d{4}-\d{2}-\d{2})/,
        /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/
    ];
    
    for (const pattern of datePatterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
            result.date = match[1].trim();
            confidence.date = 0.8;
            break;
        }
    }
    
    const timePatterns = [
        /(?:time|at|scheduled|appointment|meeting|call)[:\s]+(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
        /(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
        /(\d{1,2}\s*(?:AM|PM|am|pm))/i
    ];
    
    for (const pattern of timePatterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
            const time = match[1].trim();
            if (!time.includes(':')) {
                const parts = time.match(/(\d+)\s*(AM|PM)/i);
                if (parts) {
                    result.time = `${parts[1]}:00 ${parts[2].toUpperCase()}`;
                    confidence.time = 0.8;
                }
            } else {
                result.time = time;
                confidence.time = 0.85;
            }
            break;
        }
    }
    
    const statusValues = SMART_IMPORT_CONFIG.VALIDATION.status.allowed;
    for (const status of statusValues) {
        if (fullText.toLowerCase().includes(status.toLowerCase())) {
            result.status = status;
            confidence.status = 0.7;
            break;
        }
    }
    
    const assignedPatterns = [
        /(?:assigned to|owner|agent|representative|rep|handler|manager)[:\s]+([A-Z][a-z]+)/i,
        /(?:with|by|to)\s+([A-Z][a-z]+)(?:\s+(?:from|at|is|will))/i
    ];
    
    for (const pattern of assignedPatterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
            result.assigned = match[1].trim();
            confidence.assigned = 0.65;
            break;
        }
    }
    
    if (Object.keys(result).length === 0) {
        result.notes = fullText;
        confidence.notes = 0.3;
    }
}

function matchFieldName(key) {
    const normalizedKey = key.toLowerCase().trim();
    
    for (const [field, aliases] of Object.entries(SMART_IMPORT_CONFIG.FIELD_ALIASES)) {
        if (aliases.some(alias => 
            normalizedKey === alias || 
            normalizedKey.includes(alias) || 
            alias.includes(normalizedKey) ||
            normalizedKey.split(' ').some(word => word === alias.split(' ')[0])
        )) {
            return field;
        }
    }
    return null;
}

function parseRelativeDate(expression) {
    const today = new Date();
    const expr = expression.toLowerCase().trim();
    
    if (expr === 'today') {
        return Utils.formatDateForCompare(today);
    }
    if (expr === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return Utils.formatDateForCompare(tomorrow);
    }
    if (expr === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return Utils.formatDateForCompare(yesterday);
    }
    if (expr === 'next week' || expr === 'next week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return Utils.formatDateForCompare(nextWeek);
    }
    if (expr === 'this week') {
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() + (7 - thisWeek.getDay()));
        return Utils.formatDateForCompare(thisWeek);
    }
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = dayNames.indexOf(expr);
    if (dayIndex !== -1) {
        const currentDay = today.getDay();
        let daysUntil = dayIndex - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + daysUntil);
        return Utils.formatDateForCompare(targetDate);
    }
    
    return null;
}

function parseDateStringEnhanced(dateStr) {
    if (!dateStr) return null;
    
    const trimmed = dateStr.trim();
    
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1]);
        const month = parseInt(isoMatch[2]) - 1;
        const day = parseInt(isoMatch[3]);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
            return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }
    
    const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usMatch) {
        const month = parseInt(usMatch[1]) - 1;
        const day = parseInt(usMatch[2]);
        const year = parseInt(usMatch[3]);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
            return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }
    
    const naturalMatch = trimmed.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
    if (naturalMatch) {
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const monthName = naturalMatch[1].toLowerCase();
        const monthIndex = months.indexOf(monthName);
        if (monthIndex !== -1) {
            const day = parseInt(naturalMatch[2]);
            const year = parseInt(naturalMatch[3]);
            const date = new Date(year, monthIndex, day);
            if (!isNaN(date.getTime())) {
                return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
    }
    
    const reverseMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (reverseMatch) {
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const monthName = reverseMatch[2].toLowerCase();
        const monthIndex = months.indexOf(monthName);
        if (monthIndex !== -1) {
            const day = parseInt(reverseMatch[1]);
            const year = parseInt(reverseMatch[3]);
            const date = new Date(year, monthIndex, day);
            if (!isNaN(date.getTime())) {
                return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
    }
    
    if (/today/i.test(trimmed)) {
        return Utils.getTodayStr();
    }
    if (/tomorrow/i.test(trimmed)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return Utils.formatDateForCompare(tomorrow);
    }
    if (/yesterday/i.test(trimmed)) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return Utils.formatDateForCompare(yesterday);
    }
    
    return null;
}

function enhanceParsedDataEnhanced(result, confidence, fullText, context, defaultDate) {
    if (result.phone) {
        result.phone = normalizePhoneNumber(result.phone);
    }
    
    if (result.email) {
        result.email = result.email.toLowerCase().trim();
    } else {
        if (result.notes) {
            const extractedEmail = Utils.extractEmail(result.notes);
            if (extractedEmail) {
                result.email = extractedEmail;
                confidence.email = 0.6;
            }
        }
    }
    
    if (result.date) {
        const parsedDate = parseDateStringEnhanced(result.date);
        if (parsedDate) {
            result.date = parsedDate;
            confidence.date = Math.max(confidence.date || 0, 0.9);
        }
    } else if (defaultDate) {
        result.date = defaultDate;
        confidence.date = 1.0;
        context.synonyms.date = context.synonyms.date || [];
        context.synonyms.date.push('user selected');
    }
    
    if (result.time) {
        const normalizedTime = normalizeTimeEnhanced(result.time);
        if (normalizedTime) {
            result.time = normalizedTime;
            confidence.time = Math.max(confidence.time || 0, 0.9);
        }
    }
    
    if (Utils.hasTimeSet(result.time) && (!result.status || result.status === 'Pending')) {
        result.status = 'Meeting Booked';
        confidence.status = 0.9;
    }
    
    if (!result.role && result.notes) {
        const roleMatch = result.notes.match(/(?:role|title|position|job title)[:\s]+([A-Za-z\s]+?)(?:[,.\n]|$)/i);
        if (roleMatch && roleMatch[1]) {
            result.role = roleMatch[1].trim();
            confidence.role = 0.6;
        }
    }
    
    if (result.notes) {
        const sentimentIndicators = {
            high_interest: /(?:high interest|very interested|excited|enthusiastic|positive|great|excellent|wants|would like|looking forward)/i,
            medium_interest: /(?:interested|considering|thinking about|maybe|possibly|curious|willing to discuss)/i,
            low_interest: /(?:not interested|no interest|uninterested|not sure|hesitant|maybe later|not now)/i,
            cooperative: /(?:cooperative|helpful|easy to talk to|friendly|polite|professional|warm|great conversation)/i,
            difficult: /(?:difficult|challenging|uncooperative|rude|unpleasant|hostile|argumentative)/i,
            urgent: /(?:urgent|asap|immediately|quickly|as soon as possible|emergency|time sensitive)/i,
            decision_maker: /(?:owner|ceo|president|founder|director|vp|vice president|head of|lead|manager|decision maker)/i,
            no_website: /(?:no website|doesn't have a website|needs website|wants website|website redesign|new website)/i,
            callback_requested: /(?:callback|call back|return call|follow up|follow-up|next steps|schedule call)/i,
            referred: /(?:referred|reference|referral|recommended|suggested|from|sent by)/i
        };
        
        const tags = result.tags || [];
        for (const [key, pattern] of Object.entries(sentimentIndicators)) {
            if (pattern.test(result.notes)) {
                if (!tags.includes(key)) {
                    tags.push(key);
                }
                confidence.tags = 0.6;
                context.synonyms[key] = context.synonyms[key] || [];
                context.synonyms[key].push(key);
            }
        }
        result.tags = tags;
    }
}

function normalizeTimeEnhanced(timeStr) {
    if (!timeStr) return null;
    
    let cleaned = timeStr.trim();
    
    const timezoneMatch = cleaned.match(/\b(EST|EDT|CST|CDT|MST|MDT|PST|PDT|GMT|UTC|ET|CT|MT|PT)\b/i);
    let timezone = null;
    if (timezoneMatch) {
        timezone = timezoneMatch[1].toUpperCase();
        cleaned = cleaned.replace(/\b(EST|EDT|CST|CDT|MST|MDT|PST|PDT|GMT|UTC|ET|CT|MT|PT)\b/i, '').trim();
    }
    
    let hour, minute, period;
    let match = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/i);
    
    if (!match) {
        match = cleaned.match(/at\s+(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
        if (!match) {
            match = cleaned.match(/^(\d{1,2})\s*(AM|PM)$/i);
            if (match) {
                hour = parseInt(match[1]);
                period = match[2].toUpperCase();
                minute = 0;
            } else {
                return null;
            }
        } else {
            hour = parseInt(match[1]);
            minute = parseInt(match[2] || '0');
            period = match[3] ? match[3].toUpperCase() : null;
        }
    } else {
        hour = parseInt(match[1]);
        minute = parseInt(match[2] || '0');
        period = match[3] ? match[3].toUpperCase() : null;
    }
    
    if (hour < 1 || hour > 12) {
        return null;
    }
    
    if (minute < 0 || minute > 59) {
        return null;
    }
    
    if (!period) {
        if (hour >= 6 && hour <= 11) {
            period = 'AM';
        } else if (hour === 12) {
            period = 'PM';
        } else if (hour >= 1 && hour <= 5) {
            period = 'PM';
        } else {
            period = 'AM';
        }
    }
    
    let formatted = `${hour}:${String(minute).padStart(2, '0')} ${period}`;
    if (timezone) {
        formatted += ` ${timezone}`;
    }
    
    return formatted;
}

function normalizePhoneNumber(phone) {
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = cleaned.substring(1);
    }
    
    if (cleaned.length === 10 && /^\d{10}$/.test(cleaned)) {
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    
    return cleaned;
}

function validateAppointmentData(data) {
    const errors = [];
    const warnings = [];
    const validated = {};
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Contact name is required (minimum 2 characters)' });
    } else {
        validated.name = data.name.trim();
    }
    
    if (!data.business || data.business.trim().length < 2) {
        errors.push({ field: 'business', message: 'Business name is required (minimum 2 characters)' });
    } else {
        validated.business = data.business.trim();
    }
    
    if (data.phone) {
        const cleanPhone = data.phone.replace(/[^\d+]/g, '');
        if (cleanPhone.length < 7 || cleanPhone.length > 15) {
            warnings.push({ field: 'phone', message: 'Phone number seems invalid. Expected 7-15 digits.' });
        }
        validated.phone = cleanPhone;
    }
    
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            warnings.push({ field: 'email', message: 'Email format seems invalid.' });
        } else {
            validated.email = data.email.toLowerCase().trim();
        }
    }
    
    if (data.date) {
        const parsedDate = parseDateStringEnhanced(data.date);
        if (parsedDate) {
            validated.date = parsedDate;
        } else {
            warnings.push({ field: 'date', message: 'Date format not recognized. Using today\'s date.' });
            validated.date = Utils.getTodayStr();
        }
    } else {
        validated.date = Utils.getTodayStr();
    }
    
    if (data.time) {
        let timeStr = data.time.trim();
        if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
            const hourMatch = timeStr.match(/^(\d{1,2}):?(\d{2})?$/);
            if (hourMatch) {
                const hour = parseInt(hourMatch[1]);
                const minute = hourMatch[2] || '00';
                if (hour >= 1 && hour <= 12) {
                    timeStr = `${hour}:${minute} ${hour >= 6 && hour <= 11 ? 'AM' : 'PM'}`;
                } else if (hour >= 13 && hour <= 23) {
                    const adjustedHour = hour - 12;
                    timeStr = `${adjustedHour}:${minute} PM`;
                }
            }
        }
        validated.time = timeStr;
    }
    
    if (data.status) {
        const statusOptions = SMART_IMPORT_CONFIG.VALIDATION.status.allowed;
        const matchedStatus = statusOptions.find(s => 
            s.toLowerCase() === data.status.toLowerCase() ||
            s.toLowerCase().includes(data.status.toLowerCase()) ||
            data.status.toLowerCase().includes(s.toLowerCase())
        );
        if (matchedStatus) {
            validated.status = matchedStatus;
        } else {
            warnings.push({ field: 'status', message: `Status "${data.status}" not recognized. Using "Pending".` });
            validated.status = 'Pending';
        }
    } else {
        if (Utils.hasTimeSet(data.time)) {
            validated.status = 'Meeting Booked';
        } else {
            validated.status = 'Pending';
        }
    }
    
    ['assigned', 'role', 'notes', 'tags', 'email'].forEach(field => {
        if (data[field]) {
            validated[field] = data[field];
        }
    });
    
    return {
        validated,
        errors,
        warnings,
        isValid: errors.length === 0
    };
}

function detectDuplicatesEnhanced(newData, existingAppointments) {
    const duplicates = [];
    const allAppointments = Data.getAllAppointments();
    
    if (allAppointments.length === 0) return duplicates;
    
    const newName = (newData.name || '').toLowerCase().trim();
    const newBusiness = (newData.business || '').toLowerCase().trim();
    const newPhone = (newData.phone || '').replace(/[^\d+]/g, '');
    const newEmail = (newData.email || '').toLowerCase().trim();
    
    for (const existing of allAppointments) {
        let score = 0;
        let matchedFields = [];
        let totalFields = 0;
        
        if (newName && existing.contactName) {
            const existingName = existing.contactName.toLowerCase().trim();
            totalFields++;
            if (newName === existingName) {
                score += 0.6;
                matchedFields.push('name');
            } else if (newName.includes(existingName) || existingName.includes(newName)) {
                score += 0.3;
                matchedFields.push('name_partial');
            }
        }
        
        if (newBusiness && existing.business) {
            const existingBusiness = existing.business.toLowerCase().trim();
            totalFields++;
            if (newBusiness === existingBusiness) {
                score += 0.5;
                matchedFields.push('business');
            } else if (newBusiness.includes(existingBusiness) || existingBusiness.includes(newBusiness)) {
                score += 0.25;
                matchedFields.push('business_partial');
            }
        }
        
        if (newPhone && existing.phone) {
            const existingPhone = existing.phone.replace(/[^\d+]/g, '');
            totalFields++;
            if (newPhone === existingPhone) {
                score += 0.7;
                matchedFields.push('phone');
            } else if (newPhone.includes(existingPhone) || existingPhone.includes(newPhone)) {
                score += 0.3;
                matchedFields.push('phone_partial');
            }
        }
        
        if (newEmail && existing.email) {
            const existingEmail = existing.email.toLowerCase().trim();
            totalFields++;
            if (newEmail === existingEmail) {
                score += 0.8;
                matchedFields.push('email');
            }
        }
        
        const confidence = totalFields > 0 ? Math.min(score + (totalFields - 1) * 0.1, 1) : 0;
        
        if (confidence >= 0.5) {
            duplicates.push({
                existing: existing,
                confidence: Math.round(confidence * 100),
                matchedFields: matchedFields,
                score: score
            });
        }
    }
    
    duplicates.sort((a, b) => b.confidence - a.confidence);
    return duplicates;
}

function splitAppointments(text) {
    const appointments = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let currentAppointment = [];
    let inAppointment = false;
    
    for (const line of lines) {
        const isNewAppointment = 
            line.match(/^[A-Z][a-zA-Z]+\s+(?:Company|Corp|Inc|LLC|Ltd|Agency|Studio|Designs|Solutions|Services|Consulting|Group|Partners|&|Associates)/) ||
            line.match(/^---+\s*$/) ||
            line.match(/^={3,}\s*$/) ||
            line.match(/^Appointment\s+#\d+/) ||
            line.match(/^\d+\.\s*[A-Z]/);
        
        if (isNewAppointment && currentAppointment.length > 0) {
            appointments.push(currentAppointment.join('\n'));
            currentAppointment = [];
            inAppointment = false;
        }
        
        if (line.includes(':') && line.split(':')[0].trim().length > 0 && line.split(':')[0].trim().length < 30) {
            const key = line.split(':')[0].trim().toLowerCase();
            const isField = SMART_IMPORT_CONFIG.FIELD_ALIASES[key] || 
                           Object.keys(SMART_IMPORT_CONFIG.FIELD_ALIASES).some(f => 
                               SMART_IMPORT_CONFIG.FIELD_ALIASES[f].includes(key)
                           );
            if (isField && currentAppointment.length === 0 && !inAppointment) {
                inAppointment = true;
            }
        }
        
        currentAppointment.push(line);
    }
    
    if (currentAppointment.length > 0) {
        appointments.push(currentAppointment.join('\n'));
    }
    
    if (appointments.length === 0 && text.trim()) {
        appointments.push(text.trim());
    }
    
    return appointments;
}

function parseAndPreviewImportEnhanced() {
    if (_isImportSaving || ImportState.isSaving) {
        showToast('Please wait for current operation to complete', 'warning');
        return;
    }
    
    const textArea = DOM.get('importTextArea');
    if (!textArea) return;
    
    const text = textArea.value;
    if (!text.trim()) {
        showToast('Please paste some text to parse', 'warning');
        return;
    }
    
    const dateInput = DOM.get('importDefaultDate');
    let defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
    
    if (!Utils.isValidDate(defaultDate)) {
        defaultDate = Utils.getTodayStr();
        if (dateInput) dateInput.value = defaultDate;
    }
    
    Utils.setActiveDate(defaultDate);
    
    ImportState.processingStatus = 'parsing';
    updateImportProgress(10, 'Parsing input text...');
    
    const appointments = splitAppointments(text);
    const total = appointments.length;
    ImportState.totalProcessed = total;
    
    if (total === 0) {
        showToast('No appointments detected in the text', 'warning');
        ImportState.processingStatus = 'idle';
        return;
    }
    
    const parsedResults = [];
    const allDuplicates = [];
    const allErrors = [];
    const allWarnings = [];
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    
    appointments.forEach((apptText, index) => {
        updateImportProgress(10 + (index / total) * 50, `Parsing appointment ${index + 1} of ${total}...`);
        
        const { result, confidence, context } = parseAppointmentTextEnhanced(apptText, defaultDate);
        const validationResult = validateAppointmentData(result);
        const duplicates = detectDuplicatesEnhanced(result, AppState.appointments);
        const hasSignificantDuplicate = duplicates.some(d => d.confidence >= 70);
        
        if (validationResult.isValid) {
            validCount++;
        } else {
            invalidCount++;
            allErrors.push({
                index: index + 1,
                errors: validationResult.errors
            });
        }
        
        if (hasSignificantDuplicate) {
            duplicateCount++;
            allDuplicates.push({
                index: index + 1,
                duplicates: duplicates.filter(d => d.confidence >= 70)
            });
        }
        
        if (validationResult.warnings.length > 0) {
            allWarnings.push({
                index: index + 1,
                warnings: validationResult.warnings
            });
        }
        
        parsedResults.push({
            index: index + 1,
            raw: apptText,
            parsed: result,
            confidence: confidence,
            context: context,
            validated: validationResult.validated,
            isValid: validationResult.isValid,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            hasDuplicate: hasSignificantDuplicate,
            duplicates: duplicates
        });
    });
    
    ImportState.parsedRecords = parsedResults;
    ImportState.validatedRecords = parsedResults.filter(r => r.isValid);
    ImportState.duplicates = allDuplicates;
    ImportState.errors = allErrors;
    ImportState.warnings = allWarnings;
    ImportState.totalValid = validCount;
    ImportState.totalInvalid = invalidCount;
    ImportState.totalDuplicates = duplicateCount;
    ImportState.processingStatus = 'complete';
    
    updateImportProgress(100, 'Parsing complete!');
    
    renderImportResultsEnhanced(parsedResults);
}

function generateImportTemplate() {
    const dateInput = DOM.get('importDefaultDate');
    let defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
    if (!Utils.isValidDate(defaultDate)) {
        defaultDate = Utils.getTodayStr();
        if (dateInput) dateInput.value = defaultDate;
    }
    const formattedDate = defaultDate ? Utils.formatDate(defaultDate) : 'Today';
    
    const template = `Business Name/Company : [Enter Business Name]
Name : [Enter Contact Name]
Role : [Owner/Manager/Decision Maker]
Email: [Enter Email Address]
Phone Number: [Enter Phone Number]
Best Time for Warm Callback: ${formattedDate} at [Time] [Timezone]

Notes: [Enter notes about the conversation, interest level, and next steps]`;
    
    const textArea = DOM.get('importTextArea');
    if (textArea) {
        if (textArea.value) {
            if (!confirm('This will replace your current text. Continue?')) return;
        }
        textArea.value = template;
        showToast('Template inserted! Fill in the details and click Parse.', 'success');
    }
}

async function quickImportFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            const dateInput = DOM.get('importDefaultDate');
            let defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
            if (!Utils.isValidDate(defaultDate)) {
                defaultDate = Utils.getTodayStr();
                if (dateInput) dateInput.value = defaultDate;
            }
            
            const hasBusiness = /business|company|organization/i.test(text);
            const hasName = /name|contact|client/i.test(text);
            const hasPhone = /phone|mobile|call|number/i.test(text);
            
            if (hasBusiness && hasName && hasPhone) {
                openSmartImportEnhanced();
                const textArea = DOM.get('importTextArea');
                if (textArea) {
                    textArea.value = text;
                    if (dateInput) {
                        dateInput.value = defaultDate;
                    }
                    setTimeout(() => {
                        parseAndPreviewImportEnhanced();
                    }, 300);
                }
            } else {
                showToast('Clipboard content doesn\'t match appointment format. Please paste manually.', 'warning');
            }
        } else {
            showToast('Clipboard is empty', 'warning');
        }
    } catch (error) {
        showToast('Unable to read clipboard. Please paste manually.', 'error');
    }
}

function expandAllRecords() {
    document.querySelectorAll('.import-record .record-body').forEach(body => {
        body.style.display = 'block';
    });
    document.querySelectorAll('.import-record .record-toggle').forEach(toggle => {
        toggle.textContent = '▼';
    });
}

function collapseAllRecords() {
    document.querySelectorAll('.import-record .record-body').forEach(body => {
        body.style.display = 'none';
    });
    document.querySelectorAll('.import-record .record-toggle').forEach(toggle => {
        toggle.textContent = '▶';
    });
}

function editImportRecord(index) {
    const record = ImportState.parsedRecords.find(r => r.index === index);
    if (!record) {
        showToast('Record not found', 'error');
        return;
    }
    
    const recordElements = document.querySelectorAll('.import-record');
    let targetElement = null;
    for (const el of recordElements) {
        const header = el.querySelector('.record-header');
        if (header) {
            const indexSpan = header.querySelector('.record-index');
            if (indexSpan && indexSpan.textContent === `#${index}`) {
                targetElement = el;
                break;
            }
        }
    }
    
    if (!targetElement) {
        showToast('Record element not found', 'error');
        return;
    }
    
    const body = targetElement.querySelector('.record-body');
    if (!body) return;
    
    body.style.display = 'block';
    const toggle = targetElement.querySelector('.record-toggle');
    if (toggle) toggle.textContent = '▼';
    
    const fields = record.validated || record.parsed || {};
    const fieldOrder = ['name', 'business', 'phone', 'email', 'date', 'time', 'status', 'assigned', 'role', 'notes'];
    
    let editHtml = '<div class="edit-fields">';
    for (const field of fieldOrder) {
        if (fields[field] || field === 'notes') {
            const value = fields[field] || '';
            const label = {
                name: 'Name *',
                business: 'Business *',
                phone: 'Phone',
                email: 'Email',
                date: 'Date',
                time: 'Time',
                status: 'Status',
                assigned: 'Assigned',
                role: 'Role',
                notes: 'Notes'
            }[field] || field;
            
            const isRequired = ['name', 'business'].includes(field);
            const isSelect = field === 'status' || field === 'assigned';
            const isTextarea = field === 'notes';
            
            if (isSelect) {
                let options = '';
                if (field === 'status') {
                    const statusOptions = SMART_IMPORT_CONFIG.VALIDATION.status.allowed;
                    options = statusOptions.map(s => 
                        `<option value="${s}" ${s === value ? 'selected' : ''}>${s}</option>`
                    ).join('');
                } else if (field === 'assigned') {
                    const teamMembers = AppState.teamMembers || [];
                    options = teamMembers.map(m => 
                        `<option value="${m.name}" ${m.name === value ? 'selected' : ''}>${m.name}</option>`
                    ).join('');
                    if (!teamMembers.some(m => m.name === value)) {
                        options += `<option value="${value}" selected>${value}</option>`;
                    }
                }
                editHtml += `
                    <div class="edit-field">
                        <label>${label} ${isRequired ? '*' : ''}</label>
                        <select class="edit-input" data-field="${field}">${options}</select>
                    </div>
                `;
            } else if (isTextarea) {
                editHtml += `
                    <div class="edit-field">
                        <label>${label}</label>
                        <textarea class="edit-input" data-field="${field}" rows="2">${Utils.escapeHtml(value)}</textarea>
                    </div>
                `;
            } else {
                editHtml += `
                    <div class="edit-field">
                        <label>${label} ${isRequired ? '*' : ''}</label>
                        <input class="edit-input" data-field="${field}" value="${Utils.escapeHtml(value)}" ${isRequired ? 'required' : ''} />
                    </div>
                `;
            }
        }
    }
    editHtml += `
        <div class="edit-actions">
            <button class="btn-icon save-edit-btn" data-index="${index}" style="background:var(--success); color:white;">
                <i class="fas fa-save"></i> Save Changes
            </button>
            <button class="btn-icon cancel-edit-btn" data-index="${index}" style="background:var(--danger); color:white;">
                <i class="fas fa-times"></i> Cancel
            </button>
        </div>
    </div>`;
    
    const fieldsContainer = body.querySelector('.record-fields');
    if (fieldsContainer) {
        fieldsContainer.innerHTML = editHtml;
    }
}

function saveImportRecordEdit(index) {
    const record = ImportState.parsedRecords.find(r => r.index === index);
    if (!record) {
        showToast('Record not found', 'error');
        return;
    }
    
    const recordElements = document.querySelectorAll('.import-record');
    let targetElement = null;
    for (const el of recordElements) {
        const header = el.querySelector('.record-header');
        if (header) {
            const indexSpan = header.querySelector('.record-index');
            if (indexSpan && indexSpan.textContent === `#${index}`) {
                targetElement = el;
                break;
            }
        }
    }
    
    if (!targetElement) {
        showToast('Record element not found', 'error');
        return;
    }
    
    const inputs = targetElement.querySelectorAll('.edit-input');
    const updatedData = { ...record.parsed };
    
    inputs.forEach(input => {
        const field = input.getAttribute('data-field');
        if (field) {
            updatedData[field] = input.value.trim();
        }
    });
    
    const validationResult = validateAppointmentData(updatedData);
    
    record.parsed = updatedData;
    record.validated = validationResult.validated;
    record.isValid = validationResult.isValid;
    record.errors = validationResult.errors;
    record.warnings = validationResult.warnings;
    
    renderImportResultsEnhanced(ImportState.parsedRecords);
    
    if (validationResult.isValid) {
        showToast(`Record #${index} updated successfully!`, 'success');
    } else {
        showToast(`Record #${index} has errors that need fixing.`, 'warning');
    }
}

function cancelImportRecordEdit(index) {
    renderImportResultsEnhanced(ImportState.parsedRecords);
}

function skipImportRecord(index) {
    if (!confirm(`Skip record #${index}?`)) return;
    
    ImportState.parsedRecords = ImportState.parsedRecords.filter(r => r.index !== index);
    ImportState.validatedRecords = ImportState.validatedRecords.filter(r => r.index !== index);
    
    renderImportResultsEnhanced(ImportState.parsedRecords);
    showToast(`Record #${index} skipped`, 'info');
}

function mergeDuplicate(index) {
    const record = ImportState.parsedRecords.find(r => r.index === index);
    if (!record) {
        showToast('Record not found', 'error');
        return;
    }
    
    const duplicate = record.duplicates && record.duplicates.length > 0 ? record.duplicates[0] : null;
    if (!duplicate) {
        showToast('No duplicate found to merge', 'warning');
        return;
    }
    
    if (!confirm(`Merge this record with existing appointment "${duplicate.existing.business}"?`)) {
        return;
    }
    
    const existing = duplicate.existing;
    const newData = record.validated || record.parsed;
    
    const updates = {};
    if (newData.name && !existing.contactName) updates.contactName = newData.name;
    if (newData.business && !existing.business) updates.business = newData.business;
    if (newData.phone && !existing.phone) updates.phone = newData.phone;
    if (newData.email && !existing.email) updates.email = newData.email;
    if (newData.time && !existing.time) updates.time = newData.time;
    if (newData.notes) {
        updates.notes = existing.notes ? existing.notes + '\n\n' + newData.notes : newData.notes;
    }
    if (newData.tags) {
        const existingTags = existing.tags || [];
        const newTags = newData.tags.filter(t => !existingTags.includes(t));
        if (newTags.length > 0) {
            updates.tags = [...existingTags, ...newTags];
        }
    }
    
    if (Object.keys(updates).length > 0) {
        Data.updateAppointment(existing.date, existing.id, updates);
        showToast(`Merged into ${existing.business}`, 'success');
    } else {
        showToast('No new information to merge', 'info');
    }
    
    ImportState.parsedRecords = ImportState.parsedRecords.filter(r => r.index !== index);
    ImportState.validatedRecords = ImportState.validatedRecords.filter(r => r.index !== index);
    renderImportResultsEnhanced(ImportState.parsedRecords);
}

function saveSingleRecord(index) {
    const record = ImportState.parsedRecords.find(r => r.index === index);
    if (!record) {
        showToast('Record not found', 'error');
        return;
    }
    
    if (!record.isValid) {
        showToast('Cannot save invalid record. Please fix errors first.', 'error');
        return;
    }
    
    const data = record.validated || record.parsed;
    
    const duplicates = detectDuplicatesEnhanced(data, AppState.appointments);
    if (duplicates.length > 0 && duplicates[0].confidence >= 70) {
        if (!confirm(`This appears to be a duplicate (${duplicates[0].confidence}% match). Continue anyway?`)) {
            return;
        }
    }
    
    let finalStatus = data.status || 'Pending';
    if (Utils.hasTimeSet(data.time) && finalStatus === 'Pending') {
        finalStatus = 'Meeting Booked';
    }
    
    const result = Data.addAppointment(
        data.date || Utils.getTodayStr(),
        data.business,
        data.name,
        data.role || 'Owner',
        data.phone || '',
        data.time || '',
        data.notes || '',
        data.assigned || 'Daniel',
        null,
        finalStatus,
        '',
        data.tags || []
    );
    
    if (result) {
        showToast(`Saved "${data.business}" successfully!`, 'success');
        ImportState.parsedRecords = ImportState.parsedRecords.filter(r => r.index !== index);
        ImportState.validatedRecords = ImportState.validatedRecords.filter(r => r.index !== index);
        renderImportResultsEnhanced(ImportState.parsedRecords);
        FeaturePanel.refreshCurrentView();
        Stats.updateAll();
        if (result.date) {
            Utils.syncCalendarToDate(result.date);
        }
    }
}

function saveAllImportedAppointments() {
    if (_isImportSaving) {
        showToast('Save already in progress...', 'warning');
        return;
    }
    
    const validRecords = ImportState.parsedRecords.filter(r => r.isValid);
    
    if (validRecords.length === 0) {
        showToast('No valid records to save', 'warning');
        return;
    }
    
    if (!AppState.currentUser) {
        showToast('Please sign in first', 'error');
        return;
    }
    
    _isImportSaving = true;
    ImportState.isSaving = true;
    
    const saveBtn = DOM.get('saveImportBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }
    
    const duplicateCount = validRecords.filter(r => r.hasDuplicate).length;
    
    let proceed = true;
    if (duplicateCount > 0) {
        proceed = confirm(`⚠️ ${duplicateCount} of ${validRecords.length} records appear to be duplicates. Do you want to continue?`);
    } else if (validRecords.length > 1) {
        proceed = confirm(`Save ${validRecords.length} appointment(s)?`);
    }
    
    if (!proceed) {
        _isImportSaving = false;
        ImportState.isSaving = false;
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = `Save ${validRecords.length} Record(s)`;
        }
        return;
    }
    
    let savedCount = 0;
    let skippedCount = 0;
    let savedAppointments = [];
    
    validRecords.forEach(record => {
        const data = record.validated || record.parsed;
        
        if (record.hasDuplicate) {
            const duplicate = record.duplicates && record.duplicates.length > 0 ? record.duplicates[0] : null;
            if (duplicate && duplicate.confidence >= 80) {
                skippedCount++;
                return;
            }
        }
        
        let finalStatus = data.status || 'Pending';
        if (Utils.hasTimeSet(data.time) && finalStatus === 'Pending') {
            finalStatus = 'Meeting Booked';
        }
        
        const result = Data.addAppointment(
            data.date || Utils.getTodayStr(),
            data.business,
            data.name,
            data.role || 'Owner',
            data.phone || '',
            data.time || '',
            data.notes || '',
            data.assigned || 'Daniel',
            null,
            finalStatus,
            '',
            data.tags || []
        );
        
        if (result) {
            savedCount++;
            savedAppointments.push(result);
        }
    });
    
    if (savedAppointments.length > 0 && savedAppointments[0].date) {
        Utils.syncCalendarToDate(savedAppointments[0].date);
    }
    
    let message = `Saved ${savedCount} appointment(s)!`;
    if (skippedCount > 0) {
        message += ` ${skippedCount} potential duplicates were skipped.`;
    }
    showToast(message, 'success');
    
    _isImportSaving = false;
    ImportState.isSaving = false;
    ImportState.parsedRecords = [];
    ImportState.validatedRecords = [];
    ImportState.processingStatus = 'idle';
    
    closeSmartImportEnhanced();
    FeaturePanel.refreshCurrentView();
    Stats.updateAll();
    
    if (AppState.currentView === 'calendar') {
        const body = DOM.get('featurePanelBody');
        if (body) {
            CalendarView.render(body);
        }
    }
}

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
            const iconMap = { 
                'calendar': 'fa-calendar-alt', 
                'tasks': 'fa-tasks', 
                'analytics': 'fa-chart-pie', 
                'shortcuts': 'fa-keyboard',
                'closers': 'fa-user-tie'
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
            } else if (featureType === 'closers') {
                html = `
                    <div class="view-toggle" id="closerViewToggle">
                        <button id="closerManageBtn" class="view-btn active"><i class="fas fa-user-tie"></i> Manage Closers</button>
                    </div>
                `;
            }
            container.innerHTML = html;
            this.attachViewToggleEvents(featureType);
        }

        scriptPanel.style.display = 'none';
        featurePanel.style.display = 'block';

        if (featureBody) {
            if (featureType === 'calendar') {
                CalendarView.render(featureBody);
            } else if (featureType === 'tasks') {
                this.renderTasks(featureBody);
            } else if (featureType === 'analytics') {
                this.renderAnalytics(featureBody);
            } else if (featureType === 'shortcuts') {
                openShortcutsHelp();
            } else if (featureType === 'closers') {
                this.renderClosers(featureBody);
            } else if (featureType === 'notepad') {
                showToast('📝 Notes feature coming soon!', 'info');
                this.hide();
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
        if (AppState.currentView === 'calendar') {
            CalendarView.render(body);
        } else if (AppState.currentView === 'tasks') {
            this.renderTasks(body);
        } else if (AppState.currentView === 'analytics') {
            this.renderAnalytics(body);
        } else if (AppState.currentView === 'shortcuts') {
            openShortcutsHelp();
        } else if (AppState.currentView === 'closers') {
            this.renderClosers(body);
        }
    },

    renderClosers: function(container) {
        if (!container) return;
        container.innerHTML = `
            <div class="closer-management-container fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
                    <h3><i class="fas fa-user-tie"></i> Closer Management</h3>
                    <button id="addCloserFromPanelBtn" class="btn-icon" style="background:var(--success); color:white;">
                        <i class="fas fa-plus"></i> Add Closer
                    </button>
                </div>
                <div id="closersPanelList">
                    ${renderClosersListHTML()}
                </div>
            </div>
        `;
        
        const addBtn = container.querySelector('#addCloserFromPanelBtn');
        if (addBtn) {
            addBtn.addEventListener('click', addCloser);
        }
        
        container.querySelectorAll('.set-default-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                setDefaultCloser(id);
                FeaturePanel.refreshCurrentView();
            });
        });
        
        container.querySelectorAll('.toggle-closer-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                toggleCloserActive(id);
                FeaturePanel.refreshCurrentView();
            });
        });
        
        container.querySelectorAll('.delete-closer-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                deleteCloser(id);
                FeaturePanel.refreshCurrentView();
            });
        });
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

    renderAnalytics: function(container) {
        if (!container) return;
        if (AppState.analyticsTab === 'insights') this.renderAnalyticsInsights(container);
        else if (AppState.analyticsTab === 'reports') this.renderAnalyticsReports(container);
    },

    renderAnalyticsInsights: function(container) {
        let total = 0, hTransfers = 0, wCallbacks = 0, completedCount = 0, pendingCount = 0, canceledCount = 0;
        let statusCounts = {};
        let dailyData = {};

        for (let date in AppState.appointments) {
            if (AppState.appointments[date].reports) {
                AppState.appointments[date].reports.forEach(a => {
                    total++;
                    const status = Utils.getStatus(a);
                    const primaryStatus = Utils.getPrimaryStatus(status);
                    statusCounts[primaryStatus] = (statusCounts[primaryStatus] || 0) + 1;
                    if (primaryStatus === 'Hot Transfer') hTransfers++;
                    else if (primaryStatus === 'Warm Callback') wCallbacks++;
                    else if (primaryStatus === 'Completed') completedCount++;
                    else if (primaryStatus === 'Pending') pendingCount++;
                    else if (primaryStatus === 'Canceled') canceledCount++;
                    dailyData[a.date] = (dailyData[a.date] || 0) + 1;
                });
            }
        }

        const conversionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        const hotTransferRate = total > 0 ? Math.round((hTransfers / total) * 100) : 0;
        const warmCallbackRate = total > 0 ? Math.round((wCallbacks / total) * 100) : 0;

        container.innerHTML = `
            <div class="analytics-container fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:8px;">
                    <h3><i class="fas fa-chart-pie"></i> Pipeline Insights Dashboard</h3>
                    <span class="version-chip"><i class="fas fa-sync-alt"></i> Live Data</span>
                </div>

                <div class="report-metrics scale-in">
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700;">${total}</div><div class="metric-label">Total Pipeline</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:#dc2626;">${hTransfers}</div><div class="metric-label">🔥 Hot Transfers</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--warning);">${wCallbacks}</div><div class="metric-label">📞 Warm Callbacks</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--success);">${completedCount}</div><div class="metric-label">✅ Completed</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--text-muted);">${pendingCount}</div><div class="metric-label">⏳ Pending</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--danger);">${canceledCount}</div><div class="metric-label">❌ Canceled</div></div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div class="feature-card slide-up">
                        <h4>📊 Conversion Rates</h4>
                        <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px;">
                            <div><div style="display:flex; justify-content:space-between; font-size:0.85rem;"><span>Completed Rate</span><span>${conversionRate}%</span></div><div style="background:var(--bg-primary); height:8px; border-radius:4px; margin-top:4px; overflow:hidden;"><div style="background:var(--success); width:${conversionRate}%; height:100%; border-radius:4px; transition:width 0.8s ease;"></div></div></div>
                            <div><div style="display:flex; justify-content:space-between; font-size:0.85rem;"><span>Hot Transfer Rate</span><span>${hotTransferRate}%</span></div><div style="background:var(--bg-primary); height:8px; border-radius:4px; margin-top:4px; overflow:hidden;"><div style="background:#dc2626; width:${hotTransferRate}%; height:100%; border-radius:4px; transition:width 0.8s ease;"></div></div></div>
                            <div><div style="display:flex; justify-content:space-between; font-size:0.85rem;"><span>Warm Callback Rate</span><span>${warmCallbackRate}%</span></div><div style="background:var(--bg-primary); height:8px; border-radius:4px; margin-top:4px; overflow:hidden;"><div style="background:var(--warning); width:${warmCallbackRate}%; height:100%; border-radius:4px; transition:width 0.8s ease;"></div></div></div>
                        </div>
                    </div>

                    <div class="feature-card slide-up">
                        <h4>📈 Status Distribution</h4>
                        <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px; max-height:200px; overflow-y:auto;">
                            ${Object.entries(statusCounts).map(([status, count]) => `
                                <div style="display:flex; justify-content:space-between; padding:4px 8px; background:var(--bg-primary); border-radius:6px; transition:all 0.3s ease;">
                                    <span>${status}</span>
                                    <span style="font-weight:600;">${count} (${Math.round((count/total)*100)}%)</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="feature-card scale-in" style="margin-top:8px;">
                    <h4>📈 Appointment Trend</h4>
                    <div class="chart-container" style="height:200px;">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:8px;">
                    <div class="feature-card scale-in">
                        <h4>🍩 Status Distribution</h4>
                        <div class="chart-container-sm" style="height:180px;">
                            <canvas id="donutChart"></canvas>
                        </div>
                    </div>
                    <div class="feature-card scale-in">
                        <h4>📊 Weekly Performance</h4>
                        <div class="chart-container-sm" style="height:180px;">
                            <canvas id="barChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.initAnalyticsCharts(dailyData, statusCounts);
        }, 200);
    },

    renderAnalyticsReports: function(container) {
        let total = 0, completedCount = 0, hTransfers = 0, wCallbacks = 0;
        let dailyData = {};
        let assignedStats = {};

        for (let date in AppState.appointments) {
            if (AppState.appointments[date].reports) {
                AppState.appointments[date].reports.forEach(a => {
                    total++;
                    const status = Utils.getStatus(a);
                    const primaryStatus = Utils.getPrimaryStatus(status);
                    if (primaryStatus === 'Completed') completedCount++;
                    if (primaryStatus === 'Hot Transfer') hTransfers++;
                    if (primaryStatus === 'Warm Callback') wCallbacks++;
                    dailyData[a.date] = (dailyData[a.date] || 0) + 1;

                    const assigned = a.assigned || 'Unassigned';
                    assignedStats[assigned] = (assignedStats[assigned] || 0) + 1;
                });
            }
        }

        const conversionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        const avgScore = Stats.getAverageScore();

        container.innerHTML = `
            <div class="analytics-container fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:8px;">
                    <h3><i class="fas fa-chart-line"></i> Advanced Reports</h3>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button id="reportsExportCSV" class="btn-icon" style="background:var(--success); color:white;"><i class="fas fa-file-csv"></i> Export CSV</button>
                    </div>
                </div>

                <div class="report-metrics scale-in">
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700;">${total}</div><div class="metric-label">Total Appointments</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--success);">${completedCount}</div><div class="metric-label">✅ Completed</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:#dc2626;">${hTransfers}</div><div class="metric-label">🔥 Hot Transfers</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--warning);">${wCallbacks}</div><div class="metric-label">📞 Warm Callbacks</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--primary);">${conversionRate}%</div><div class="metric-label">Conversion Rate</div></div>
                    <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--secondary);">${avgScore}</div><div class="metric-label">Avg Lead Score</div></div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div class="feature-card slide-up">
                        <h4>📈 Daily Trend</h4>
                        <div class="chart-container" style="height:180px;">
                            <canvas id="reportsTrendChart"></canvas>
                        </div>
                    </div>
                    <div class="feature-card slide-up">
                        <h4>👤 Assigned Distribution</h4>
                        <div class="chart-container" style="height:180px;">
                            <canvas id="reportsAssignedChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            const trendCtx = DOM.get('reportsTrendChart')?.getContext('2d');
            if (trendCtx) {
                const dates = Object.keys(dailyData).sort().slice(-7);
                const values = dates.map(d => dailyData[d]);
                new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: dates.map(d => Utils.formatDate(d)),
                        datasets: [{ label: 'Appointments', data: values, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
                });
            }

            const assignedCtx = DOM.get('reportsAssignedChart')?.getContext('2d');
            if (assignedCtx) {
                const labels = Object.keys(assignedStats);
                const data = Object.values(assignedStats);
                const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#f97316'];
                new Chart(assignedCtx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{ label: 'Appointments', data: data, backgroundColor: colors.slice(0, labels.length), borderRadius: 4 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
                });
            }
        }, 200);

        const exportCSV = DOM.get('reportsExportCSV');
        if (exportCSV) exportCSV.addEventListener('click', () => Data.exportToCSV());
    },

    initAnalyticsCharts: function(dailyData, statusCounts) {
        Object.values(AppState.chartInstances).forEach(chart => { if (chart) chart.destroy(); });
        AppState.chartInstances = {};
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#06b6d4', '#ec4899'];

        const trendCtx = DOM.get('trendChart')?.getContext('2d');
        if (trendCtx) {
            const dates = Object.keys(dailyData).sort();
            const values = dates.map(d => dailyData[d]);
            AppState.chartInstances.trend = new Chart(trendCtx, {
                type: 'line',
                data: { labels: dates.map(d => Utils.formatDate(d)), datasets: [{ label: 'Appointments', data: values, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }

        const donutCtx = DOM.get('donutChart')?.getContext('2d');
        if (donutCtx) {
            const labels = Object.keys(statusCounts);
            const data = Object.values(statusCounts);
            const backgroundColors = labels.map((_, i) => colors[i % colors.length]);
            AppState.chartInstances.donut = new Chart(donutCtx, {
                type: 'doughnut',
                data: { labels, datasets: [{ data, backgroundColor: backgroundColors, borderWidth: 2, borderColor: 'var(--bg-secondary)' }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } } }, cutout: '60%' }
            });
        }

        const barCtx = DOM.get('barChart')?.getContext('2d');
        if (barCtx) {
            const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const weekData = weekDays.map(() => 0);
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay() + 1);
            for (let date in dailyData) {
                const d = new Date(date);
                const dayIndex = (d.getDay() + 6) % 7;
                if (d >= startOfWeek && d <= now) weekData[dayIndex] += dailyData[date];
            }
            AppState.chartInstances.bar = new Chart(barCtx, {
                type: 'bar',
                data: { labels: weekDays, datasets: [{ label: 'This Week', data: weekData, backgroundColor: 'rgba(59,130,246,0.7)', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 4 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }
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
        if (dateInput) {
            const dateToUse = defaultDate || Utils.getActiveDate();
            dateInput.value = dateToUse;
        }

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

        updateCloserSelects();

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
                const closer = DOM.get('newApptCloser')?.value || 'Kailan';
                const notes = DOM.get('newApptNotes')?.value?.trim() || '';

                if (!bus || !contact) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }

                let finalDate = date;
                if (!Utils.isValidDate(finalDate)) {
                    finalDate = Utils.getTodayStr();
                    if (dateInput) dateInput.value = finalDate;
                }

                let finalStatus = status;
                if (Utils.hasTimeSet(time) && status === 'Pending') {
                    finalStatus = 'Meeting Booked';
                }

                const member = AppState.teamMembers.find(m => m.id === assigned);
                Data.addAppointment(finalDate, bus, contact, 'Owner', phone, time, notes + (email ? `\nEmail: ${email}` : ''), member ? member.name : 'Daniel', null, finalStatus, '', [], closer);
                modal.style.display = 'none';
                Utils.setActiveDate(finalDate);
                showToast('Appointment added successfully! 🎉', 'success');
                FeaturePanel.refreshCurrentView();
            };
        }

        if (cancelBtn) cancelBtn.onclick = () => { modal.style.display = 'none'; };

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    },

    attachViewToggleEvents: function(featureType) {
        if (featureType === 'calendar') {
            const calendarBtn = DOM.get('calendarViewBtn');
            const listBtn = DOM.get('listViewBtn');
            if (calendarBtn) calendarBtn.addEventListener('click', () => {
                AppState.calendarView = 'calendar';
                calendarBtn.classList.add('active');
                if (listBtn) listBtn.classList.remove('active');
                this.refreshCurrentView();
            });
            if (listBtn) listBtn.addEventListener('click', () => {
                AppState.calendarView = 'list';
                listBtn.classList.add('active');
                if (calendarBtn) calendarBtn.classList.remove('active');
                this.refreshCurrentView();
            });
        } else if (featureType === 'analytics') {
            const insightsBtn = DOM.get('insightsTabBtn');
            const reportsBtn = DOM.get('reportsTabBtn');
            if (insightsBtn) insightsBtn.addEventListener('click', () => {
                AppState.analyticsTab = 'insights';
                insightsBtn.classList.add('active');
                if (reportsBtn) reportsBtn.classList.remove('active');
                this.refreshCurrentView();
            });
            if (reportsBtn) reportsBtn.addEventListener('click', () => {
                AppState.analyticsTab = 'reports';
                reportsBtn.classList.add('active');
                if (insightsBtn) insightsBtn.classList.remove('active');
                this.refreshCurrentView();
            });
        } else if (featureType === 'tasks') {
            const allBtn = DOM.get('taskListViewBtn');
            const pendingBtn = DOM.get('taskPendingBtn');
            const todayBtn = DOM.get('taskTodayBtn');

            if (allBtn) allBtn.addEventListener('click', () => {
                AppState.taskFilter = 'all';
                allBtn.classList.add('active');
                if (pendingBtn) pendingBtn.classList.remove('active');
                if (todayBtn) todayBtn.classList.remove('active');
                this.refreshCurrentView();
            });
            if (pendingBtn) pendingBtn.addEventListener('click', () => {
                AppState.taskFilter = 'pending';
                pendingBtn.classList.add('active');
                if (allBtn) allBtn.classList.remove('active');
                if (todayBtn) todayBtn.classList.remove('active');
                this.refreshCurrentView();
            });
            if (todayBtn) todayBtn.addEventListener('click', () => {
                AppState.taskFilter = 'today';
                todayBtn.classList.add('active');
                if (allBtn) allBtn.classList.remove('active');
                if (pendingBtn) pendingBtn.classList.remove('active');
                this.refreshCurrentView();
            });
        } else if (featureType === 'closers') {
            const manageBtn = DOM.get('closerManageBtn');
            if (manageBtn) {
                manageBtn.addEventListener('click', () => {
                    openCloserManagement();
                });
            }
        }
    }
};

// ================================================================
// CALENDAR VIEW
// ================================================================

const CalendarView = {
    render: function(container) {
        if (!container) return;
        
        const mode = AppState.calendarViewMode || 'month';
        
        const headerHtml = this.buildHeader();
        
        let bodyHtml = '';
        switch(mode) {
            case 'month':
                bodyHtml = this.renderMonthView();
                break;
            case 'week':
                bodyHtml = this.renderWeekView();
                break;
            case 'day':
                bodyHtml = this.renderDayView();
                break;
            case 'list':
                bodyHtml = this.renderListView();
                break;
            default:
                bodyHtml = this.renderMonthView();
        }
        
        container.innerHTML = `
            <div class="calendar-full-container fade-in">
                ${headerHtml}
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
                    ${bodyHtml}
                </div>
            </div>
        `;
        
        this.attachEvents(container);
        setTimeout(enableAppointmentDrag, 200);
    },
    
    buildHeader: function() {
        const currentDate = AppState.calendarCurrentDate || new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        return `
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
                    <span class="calendar-current-month">${monthYear}</span>
                </div>
                <div class="calendar-toolbar-right">
                    <div class="search-wrapper">
                        <i class="fas fa-search"></i>
                        <input type="text" id="calendarSearchInput" placeholder="Search contact..." value="${AppState.calendarSearchTerm || ''}" />
                    </div>
                    <select id="calendarTimezoneSelect" class="timezone-select">
                        <option value="Central CDT" ${AppState.calendarTimezone === 'Central CDT' ? 'selected' : ''}>Central (CDT)</option>
                        <option value="Eastern EDT" ${AppState.calendarTimezone === 'Eastern EDT' ? 'selected' : ''}>Eastern (EDT)</option>
                        <option value="Mountain MDT" ${AppState.calendarTimezone === 'Mountain MDT' ? 'selected' : ''}>Mountain (MDT)</option>
                        <option value="Pacific PDT" ${AppState.calendarTimezone === 'Pacific PDT' ? 'selected' : ''}>Pacific (PDT)</option>
                        <option value="UTC" ${AppState.calendarTimezone === 'UTC' ? 'selected' : ''}>UTC</option>
                    </select>
                    <button class="btn-icon" id="calendarAddEventBtn"><i class="fas fa-plus"></i> Add</button>
                </div>
            </div>
        `;
    },
    
    renderMonthView: function() {
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
            if (!appointmentsByDate[appt.date]) {
                appointmentsByDate[appt.date] = [];
            }
            appointmentsByDate[appt.date].push(appt);
        });
        
        let html = '<div class="calendar-month-grid">';
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(name => {
            html += `<div class="calendar-day-header">${name}</div>`;
        });
        
        const startDay = firstDay;
        for (let i = startDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const hasEvents = appointmentsByDate[dateStr] && appointmentsByDate[dateStr].length > 0;
            html += `
                <div class="calendar-day other-month ${isToday ? 'today' : ''}" data-date="${dateStr}">
                    <span class="day-number">${day}</span>
                    ${hasEvents ? `<span class="day-event-indicator">${appointmentsByDate[dateStr].length}</span>` : ''}
                </div>
            `;
        }
        
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const hasEvents = appointmentsByDate[dateStr] && appointmentsByDate[dateStr].length > 0;
            const events = appointmentsByDate[dateStr] || [];
            
            let eventsHtml = '';
            if (hasEvents) {
                eventsHtml = `
                    <div class="day-events">
                        ${events.slice(0, 3).map(event => {
                            const status = Utils.getStatus(event);
                            const color = this.getEventColor(event);
                            return `
                                <div class="day-event" style="border-left-color: ${color};" data-id="${event.id}" onclick="window.showAppointmentDetail('${event.id}')">
                                    <span class="event-time">${event.time || 'No time'}</span>
                                    <span class="event-title">${Utils.escapeHtml(event.business)}</span>
                                </div>
                            `;
                        }).join('')}
                        ${events.length > 3 ? `<div class="day-event-more">+${events.length - 3} more</div>` : ''}
                    </div>
                `;
            }
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" data-date="${dateStr}">
                    <span class="day-number">${d}</span>
                    ${eventsHtml}
                </div>
            `;
        }
        
        const totalDays = startDay + daysInMonth;
        const remainingDays = (7 - (totalDays % 7)) % 7;
        for (let d = 1; d <= remainingDays; d++) {
            const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            html += `
                <div class="calendar-day other-month" data-date="${dateStr}">
                    <span class="day-number">${d}</span>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },
    
    renderWeekView: function() {
        const currentDate = AppState.calendarCurrentDate || new Date();
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        
        const today = new Date();
        const todayStr = Utils.getTodayStr();
        
        let html = `
            <div class="calendar-week-view">
                <div class="week-time-column">
                    <div class="time-slot-header"></div>
        `;
        
        for (let hour = 6; hour <= 22; hour++) {
            const timeStr = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
            html += `<div class="time-slot-label">${timeStr}</div>`;
        }
        html += '</div>';
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const dateStr = Utils.formatDateForCompare(dayDate);
            const isToday = dateStr === todayStr;
            const isWeekend = i === 0 || i === 6;
            
            html += `
                <div class="week-day-column ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}" data-date="${dateStr}">
                    <div class="week-day-header">
                        <span class="week-day-name">${dayNames[i]}</span>
                        <span class="week-day-number ${isToday ? 'today-number' : ''}">${dayDate.getDate()}</span>
                    </div>
                    <div class="week-day-body">
            `;
            
            const dayAppointments = this.getAppointmentsForDate(dateStr);
            const filtered = this.filterAppointments(dayAppointments);
            
            for (let hour = 6; hour <= 22; hour++) {
                const hasAppointment = filtered.some(appt => {
                    if (!appt.time) return false;
                    const apptHour = parseInt(appt.time.split(':')[0]);
                    const apptPeriod = appt.time.includes('PM') ? 12 : 0;
                    const adjustedHour = apptHour + (apptPeriod === 12 && apptHour !== 12 ? 12 : 0);
                    return adjustedHour === hour;
                });
                
                if (hasAppointment) {
                    const appts = filtered.filter(appt => {
                        if (!appt.time) return false;
                        const apptHour = parseInt(appt.time.split(':')[0]);
                        const apptPeriod = appt.time.includes('PM') ? 12 : 0;
                        const adjustedHour = apptHour + (apptPeriod === 12 && apptHour !== 12 ? 12 : 0);
                        return adjustedHour === hour;
                    });
                    
                    html += `
                        <div class="week-time-slot has-event">
                            ${appts.map(appt => {
                                const color = this.getEventColor(appt);
                                const status = Utils.getStatus(appt);
                                return `
                                    <div class="week-event" style="border-left-color: ${color};" data-id="${appt.id}" onclick="window.showAppointmentDetail('${appt.id}')">
                                        <span class="event-time">${appt.time || ''}</span>
                                        <span class="event-title">${Utils.escapeHtml(appt.business)}</span>
                                        <span class="event-status ${Utils.getStatusClass(status)}">${status}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                } else {
                    html += `<div class="week-time-slot"></div>`;
                }
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },
    
    renderDayView: function() {
        const currentDate = AppState.calendarCurrentDate || new Date();
        const dateStr = Utils.formatDateForCompare(currentDate);
        const todayStr = Utils.getTodayStr();
        const isToday = dateStr === todayStr;
        
        const dayAppointments = this.getAppointmentsForDate(dateStr);
        const filtered = this.filterAppointments(dayAppointments);
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        let html = `
            <div class="calendar-day-view">
                <div class="day-view-header">
                    <h3>${dayNames[currentDate.getDay()]}, ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ${isToday ? '<span class="today-badge">Today</span>' : ''}</h3>
                    <span class="day-event-count">${filtered.length} events</span>
                </div>
                <div class="day-view-body">
        `;
        
        const sortedAppointments = filtered.sort((a, b) => {
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
        });
        
        if (sortedAppointments.length === 0) {
            html += `<div class="empty-state"><i class="fas fa-calendar-day"></i><p>No appointments for this day</p></div>`;
        } else {
            sortedAppointments.forEach(appt => {
                const color = this.getEventColor(appt);
                const status = Utils.getStatus(appt);
                html += `
                    <div class="day-event-card" style="border-left: 4px solid ${color};" onclick="window.showAppointmentDetail('${appt.id}')">
                        <div class="day-event-time">
                            <i class="fas fa-clock"></i> ${appt.time || 'No time set'}
                        </div>
                        <div class="day-event-content">
                            <div class="day-event-business">${Utils.escapeHtml(appt.business)}</div>
                            <div class="day-event-contact">${Utils.escapeHtml(appt.contactName)}</div>
                            ${appt.email ? `<div class="day-event-contact" style="font-size:0.7rem; color:var(--text-muted);">✉️ ${Utils.escapeHtml(appt.email)}</div>` : ''}
                            <div class="day-event-meta">
                                <span class="status-tag ${Utils.getStatusClass(status)}">${status}</span>
                                <span class="day-event-assigned">👤 ${Utils.escapeHtml(appt.assigned || 'Unassigned')}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    },
    
    renderListView: function() {
        const allAppointments = Data.getAllAppointments();
        const filtered = this.filterAppointments(allAppointments);
        
        const searchTerm = AppState.calendarSearchTerm || '';
        const searched = searchTerm ? filtered.filter(appt => {
            const searchable = `${appt.business} ${appt.contactName} ${appt.phone || ''} ${appt.email || ''}`.toLowerCase();
            return searchable.includes(searchTerm.toLowerCase());
        }) : filtered;
        
        const grouped = {};
        searched.forEach(appt => {
            if (!grouped[appt.date]) {
                grouped[appt.date] = [];
            }
            grouped[appt.date].push(appt);
        });
        
        const sortedDates = Object.keys(grouped).sort();
        
        let html = `
            <div class="calendar-list-view">
                <div class="list-view-stats">
                    <span>${searched.length} appointments found</span>
                    ${searchTerm ? `<span class="search-term">Search: "${searchTerm}"</span>` : ''}
                </div>
                <div class="list-view-items">
        `;
        
        if (sortedDates.length === 0) {
            html += `<div class="empty-state"><i class="fas fa-list"></i><p>No appointments found</p></div>`;
        } else {
            sortedDates.forEach(date => {
                const dateObj = new Date(date);
                const isToday = date === Utils.getTodayStr();
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                html += `
                    <div class="list-date-group">
                        <div class="list-date-header ${isToday ? 'today' : ''}">
                            <span class="list-date-label">${dayName} ${monthDay}</span>
                            <span class="list-date-count">${grouped[date].length} events</span>
                        </div>
                        <div class="list-date-events">
                `;
                
                grouped[date].sort((a, b) => {
                    if (!a.time) return 1;
                    if (!b.time) return -1;
                    return a.time.localeCompare(b.time);
                }).forEach(appt => {
                    const color = this.getEventColor(appt);
                    const status = Utils.getStatus(appt);
                    html += `
                        <div class="list-event-item" style="border-left-color: ${color};" onclick="window.showAppointmentDetail('${appt.id}')">
                            <span class="list-event-time">${appt.time || 'No time'}</span>
                            <span class="list-event-business">${Utils.escapeHtml(appt.business)}</span>
                            <span class="list-event-contact">${Utils.escapeHtml(appt.contactName)}</span>
                            ${appt.email ? `<span class="list-event-contact" style="font-size:0.65rem; color:var(--text-muted);">✉️ ${Utils.escapeHtml(appt.email)}</span>` : ''}
                            <span class="status-tag ${Utils.getStatusClass(status)}">${status}</span>
                            <span class="list-event-actions">
                                <button class="btn-icon-sm" onclick="event.stopPropagation(); window.showAppointmentDetail('${appt.id}')"><i class="fas fa-eye"></i></button>
                            </span>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    },
    
    getAppointmentsForMonth: function(year, month) {
        const result = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (AppState.appointments[dateStr]?.reports) {
                result.push(...AppState.appointments[dateStr].reports);
            }
        }
        return result;
    },
    
    getAppointmentsForDate: function(dateStr) {
        return AppState.appointments[dateStr]?.reports || [];
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
    
    getEventColor: function(appt) {
        const status = Utils.getStatus(appt);
        const colorMap = {
            'Hot Transfer': '#dc2626',
            'Meeting Booked': '#3b82f6',
            'Held': '#06b6d4',
            'Warm Callback': '#f59e0b',
            'Pending': '#94a3b8',
            'Rescheduled': '#f97316',
            'Completed': '#10b981',
            'Canceled': '#ef4444'
        };
        return colorMap[status] || '#94a3b8';
    },
    
    attachEvents: function(container) {
        container.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                AppState.calendarViewMode = view;
                this.render(container);
            });
        });
        
        const prevBtn = container.querySelector('#calPrevBtn');
        const nextBtn = container.querySelector('#calNextBtn');
        const todayBtn = container.querySelector('#calTodayBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const current = AppState.calendarCurrentDate || new Date();
                if (AppState.calendarViewMode === 'month') {
                    current.setMonth(current.getMonth() - 1);
                } else if (AppState.calendarViewMode === 'week') {
                    current.setDate(current.getDate() - 7);
                } else if (AppState.calendarViewMode === 'day') {
                    current.setDate(current.getDate() - 1);
                }
                AppState.calendarCurrentDate = current;
                this.render(container);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const current = AppState.calendarCurrentDate || new Date();
                if (AppState.calendarViewMode === 'month') {
                    current.setMonth(current.getMonth() + 1);
                } else if (AppState.calendarViewMode === 'week') {
                    current.setDate(current.getDate() + 7);
                } else if (AppState.calendarViewMode === 'day') {
                    current.setDate(current.getDate() + 1);
                }
                AppState.calendarCurrentDate = current;
                this.render(container);
            });
        }
        
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                AppState.calendarCurrentDate = new Date();
                AppState.selectedCalDate = Utils.getTodayStr();
                AppState.activeDate = Utils.getTodayStr();
                this.render(container);
            });
        }
        
        container.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.getAttribute('data-filter');
                AppState.calendarFilters[filter] = !AppState.calendarFilters[filter];
                this.render(container);
            });
        });
        
        const searchInput = container.querySelector('#calendarSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                AppState.calendarSearchTerm = e.target.value;
                if (AppState.calendarViewMode === 'list') {
                    this.render(container);
                }
            });
        }
        
        const timezoneSelect = container.querySelector('#calendarTimezoneSelect');
        if (timezoneSelect) {
            timezoneSelect.addEventListener('change', (e) => {
                AppState.calendarTimezone = e.target.value;
                showToast(`Timezone changed to ${e.target.value}`, 'info');
            });
        }
        
        const addBtn = container.querySelector('#calendarAddEventBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const activeDate = Utils.getActiveDate();
                FeaturePanel.openQuickAdd(activeDate);
            });
        }
        
        container.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('dblclick', () => {
                const date = day.getAttribute('data-date');
                if (date) {
                    Utils.setActiveDate(date);
                    FeaturePanel.openQuickAdd(date);
                }
            });
            day.addEventListener('click', () => {
                const date = day.getAttribute('data-date');
                if (date) {
                    Utils.setActiveDate(date);
                }
            });
        });
    }
};

// ================================================================
// CALENDAR DRAG-TO-RESCHEDULE - FIXED
// ================================================================

function enableAppointmentDrag() {
    const appointments = document.querySelectorAll('.day-event, .week-event, .list-event-item');
    
    appointments.forEach(appt => {
        if (appt._dragAttached) return;
        appt._dragAttached = true;
        
        appt.draggable = true;
        appt.addEventListener('dragstart', function(e) {
            const id = this.dataset.id;
            if (id) {
                AppState.isDraggingAppointment = true;
                AppState.draggedAppointmentId = id;
                e.dataTransfer.setData('text/plain', id);
                this.classList.add('appointment-dragging');
            }
        });
        
        appt.addEventListener('dragend', function(e) {
            this.classList.remove('appointment-dragging');
            AppState.isDraggingAppointment = false;
            AppState.draggedAppointmentId = null;
        });
    });
    
    const days = document.querySelectorAll('.calendar-day, .week-day-column');
    days.forEach(day => {
        if (day._dragAttached) return;
        day._dragAttached = true;
        
        day.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        day.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
        });
        
        day.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const appointmentId = e.dataTransfer.getData('text/plain');
            const newDate = this.dataset.date;
            
            if (appointmentId && newDate) {
                const appt = Data.getAppointmentById(appointmentId);
                if (appt) {
                    if (confirm(`Move "${appt.business}" to ${Utils.formatDate(newDate)}?`)) {
                        Data.updateAppointment(appt.date, appt.id, { date: newDate, status: 'Rescheduled' });
                        showToast(`Moved ${appt.business} to ${Utils.formatDate(newDate)}`, 'success');
                        FeaturePanel.refreshCurrentView();
                    }
                }
            }
        });
    });
}

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
    
    AppState.closers.forEach(closer => {
        if (closer.name.toLowerCase().includes(q) || (closer.email && closer.email.toLowerCase().includes(q))) {
            searchResults.push({ type: 'closer', data: closer });
        }
    });

    renderGlobalSearchResults(searchResults);
}

function renderGlobalSearchResults(results) {
    const container = document.getElementById('globalSearchResults');
    if (!container) return;
    
    if (!results || results.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); padding:12px;">No results found. Try a different search term.</p>';
        return;
    }
    
    let html = '<div style="display:flex; flex-direction:column; gap:8px;">';
    results.slice(0, 20).forEach(result => {
        if (result.type === 'appointment') {
            html += `
                <div class="global-search-result" onclick="window.showAppointmentDetail('${result.data.id}')">
                    <div class="result-title">${Utils.escapeHtml(result.data.business)}</div>
                    <div class="result-subtitle">${Utils.escapeHtml(result.data.contactName)}</div>
                    <div class="result-meta">${Utils.formatDate(result.data.date)} · ${Utils.getStatus(result.data)}</div>
                </div>
            `;
        } else if (result.type === 'task') {
            html += `
                <div class="global-search-result" onclick="window.toggleTaskComplete('${result.data.id}')">
                    <div class="result-title">${Utils.escapeHtml(result.data.description)}</div>
                    <div class="result-meta">${result.data.completed ? '✅ Done' : '⏳ Pending'} · ${result.data.dueDate ? 'Due ' + Utils.formatDate(result.data.dueDate) : 'No due date'}</div>
                </div>
            `;
        } else if (result.type === 'script') {
            html += `
                <div class="global-search-result" onclick="window.loadScript('${result.data.id}')">
                    <div class="result-title">${Utils.escapeHtml(result.data.name)}</div>
                    <div class="result-meta">📜 Script · v${result.data.version || 1}</div>
                </div>
            `;
        } else if (result.type === 'closer') {
            html += `
                <div class="global-search-result" onclick="window.openCloserManagement()">
                    <div class="result-title">${Utils.escapeHtml(result.data.name)}</div>
                    <div class="result-meta">${result.data.active ? '🟢 Active' : '🔴 Inactive'} · ${result.data.default ? '⭐ Default' : ''}</div>
                </div>
            `;
        }
    });
    html += '</div>';
    container.innerHTML = html;
}

function openBulkActions() {
    const modal = document.getElementById('bulkActionsModal');
    const container = document.getElementById('bulkSelectionContainer');
    if (!modal || !container) return;
    
    modal.style.display = 'flex';
    AppState.selectedAppointments = new Set();

    let html = '';
    const allApps = Data.getAllAppointments();
    if (allApps.length === 0) {
        html = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No appointments found</p>';
    } else {
        allApps.forEach(appt => {
            html += `
                <div class="bulk-item">
                    <input type="checkbox" class="bulk-checkbox" value="${appt.id}" />
                    <span><strong>${Utils.escapeHtml(appt.business)}</strong> - ${Utils.escapeHtml(appt.contactName)} (${Utils.getStatus(appt)})</span>
                </div>
            `;
        });
    }
    container.innerHTML = html;

    container.querySelectorAll('.bulk-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) AppState.selectedAppointments.add(cb.value);
            else AppState.selectedAppointments.delete(cb.value);
        });
    });

    const options = document.getElementById('bulkActionOptions');
    if (options) options.style.display = 'none';
    
    const select = document.getElementById('bulkActionSelect');
    if (select) {
        select.onchange = function() {
            options.style.display = 'block';
            const statusGroup = document.getElementById('bulkStatusGroup');
            const tagGroup = document.getElementById('bulkTagGroup');
            if (statusGroup) statusGroup.style.display = this.value === 'status' ? 'block' : 'none';
            if (tagGroup) tagGroup.style.display = this.value === 'tag' ? 'block' : 'none';
        };
    }
}

function executeBulkAction() {
    const action = document.getElementById('bulkActionSelect')?.value || 'status';
    const selected = Array.from(AppState.selectedAppointments);

    if (selected.length === 0) {
        showToast('Please select at least one appointment', 'warning');
        return;
    }

    if (action === 'delete') {
        if (!confirm(`Delete ${selected.length} appointment(s)? This cannot be undone.`)) return;
        selected.forEach(id => {
            const appt = Data.getAppointmentById(id);
            if (appt) Data.deleteAppointment(appt.date, id);
        });
        showToast(`${selected.length} appointment(s) deleted`, 'success');
    } else if (action === 'status') {
        const newStatus = document.getElementById('bulkStatusSelect')?.value || 'Pending';
        if (!confirm(`Change ${selected.length} appointment(s) to "${newStatus}"?`)) return;
        selected.forEach(id => {
            const appt = Data.getAppointmentById(id);
            if (appt) Data.updateAppointment(appt.date, id, { status: newStatus });
        });
        showToast(`${selected.length} appointment(s) updated to ${newStatus}`, 'success');
    } else if (action === 'tag') {
        const tag = document.getElementById('bulkTagSelect')?.value || '';
        if (!tag) { showToast('Please select a tag', 'warning'); return; }
        selected.forEach(id => {
            const appt = Data.getAppointmentById(id);
            if (appt) {
                const tags = appt.tags || [];
                if (!tags.includes(tag)) {
                    tags.push(tag);
                    Data.updateAppointment(appt.date, id, { tags });
                }
            }
        });
        showToast(`Tag "${tag}" added to ${selected.length} appointment(s)`, 'success');
    } else if (action === 'export') {
        Data.exportToCSV(selected);
    }

    document.getElementById('bulkActionsModal').style.display = 'none';
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
        case 'Smart Import': openSmartImportEnhanced(); break;
        case 'Appointment Calendar': FeaturePanel.show('calendar', '📅 Appointment & Handoff Calendar'); break;
        case 'Call Scripts': FeaturePanel.hide(); Scripts.loadScript('opening'); break;
        case 'Global Search': openGlobalSearch(); break;
        case 'Quick Add Appointment': 
            const activeDate = Utils.getActiveDate();
            FeaturePanel.openQuickAdd(activeDate); 
            break;
        case 'Analytics Hub': AppState.analyticsTab = 'insights'; FeaturePanel.show('analytics', '📊 Analytics Hub'); break;
        case 'Closer Management': openCloserManagement(); break;
        case 'Keyboard Shortcuts': openShortcutsHelp(); break;
        case 'Export to CSV': Data.exportToCSV(); break;
        case 'Toggle Theme': ThemeManager.toggle(); break;
        case 'Refresh Data': { const btn = DOM.get('refreshBtn'); if (btn) btn.click(); break; }
        case 'Bulk Actions': openBulkActions(); break;
        case 'Objection Handler': 
            if (typeof ObjectionHandler !== 'undefined' && ObjectionHandler.openModal) {
                ObjectionHandler.openModal();
            } else {
                showToast('Objection handler is loading...', 'warning');
                if (typeof ObjectionHandler !== 'undefined' && ObjectionHandler.init) {
                    ObjectionHandler.init();
                    setTimeout(() => {
                        if (ObjectionHandler.openModal) {
                            ObjectionHandler.openModal();
                        }
                    }, 300);
                }
            }
            break;
        case 'Close Panel': handleEscapeKey(); break;
        default: showToast(`Action: ${action}`, 'info');
    }
}

// ================================================================
// RENDER CLOSERS LIST HTML (Helper)
// ================================================================

function renderClosersListHTML() {
    const closers = AppState.closers || [];
    
    if (closers.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-user-tie"></i>
                <p>No closers added yet. Add your first closer!</p>
            </div>
        `;
    }
    
    let html = '';
    closers.forEach(closer => {
        html += `
            <div class="closer-item ${closer.active ? 'active' : 'inactive'}" data-id="${closer.id}">
                <div class="closer-info">
                    <div class="closer-avatar">👤</div>
                    <div class="closer-details">
                        <div class="closer-name">${Utils.escapeHtml(closer.name)} ${closer.default ? '⭐' : ''}</div>
                        <div class="closer-email">${Utils.escapeHtml(closer.email || '')}</div>
                        <div class="closer-phone">${Utils.escapeHtml(closer.phone || '')}</div>
                    </div>
                </div>
                <div class="closer-actions">
                    ${!closer.default ? `
                        <button class="btn-icon set-default-btn" data-id="${closer.id}" style="background:var(--primary); color:white; padding:4px 12px; font-size:0.7rem;">
                            <i class="fas fa-star"></i> Set Default
                        </button>
                        <button class="btn-icon toggle-closer-btn" data-id="${closer.id}" style="background:${closer.active ? 'var(--warning)' : 'var(--success)'}; color:white; padding:4px 12px; font-size:0.7rem;">
                            <i class="fas ${closer.active ? 'fa-pause' : 'fa-play'}"></i> ${closer.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="btn-icon delete-closer-btn" data-id="${closer.id}" style="background:var(--danger); color:white; padding:4px 12px; font-size:0.7rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <span class="badge" style="background:var(--success); color:white; padding:4px 12px; border-radius:20px; font-size:0.7rem;">
                            <i class="fas fa-check-circle"></i> Default
                        </span>
                    `}
                    <span class="status-badge ${closer.active ? 'active' : 'inactive'}">
                        ${closer.active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                </div>
            </div>
        `;
    });
    
    return html;
}

// ================================================================
// STICKY NAVIGATION - Calculate hero height for script panel positioning
// ================================================================

function updateStickyPositions() {
    const heroWrapper = document.querySelector('.hero-sticky-wrapper');
    const scriptWrapper = document.querySelector('.script-panel-wrapper');
    
    if (heroWrapper && scriptWrapper) {
        const heroHeight = heroWrapper.offsetHeight;
        document.documentElement.style.setProperty('--hero-height', heroHeight + 'px');
        scriptWrapper.style.top = heroHeight + 'px';
    }
}

const debouncedUpdateSticky = Utils.debounce(updateStickyPositions, 100);

function handleHeroScroll() {
    const heroWrapper = document.querySelector('.hero-sticky-wrapper');
    if (heroWrapper) {
        if (window.scrollY > 10) {
            heroWrapper.classList.add('scrolled');
        } else {
            heroWrapper.classList.remove('scrolled');
        }
    }
}

// ================================================================
// INITIALIZATION
// ================================================================

function initApp() {
    // Prevent multiple initializations
    if (AppState._initialized) {
        console.log('⚠️ App already initialized, skipping...');
        return;
    }
    AppState._initialized = true;
    
    console.log('🚀 Initializing ScriptFlow Pro...');
    
    // Ensure scripts exist immediately
    Utils.ensureScriptsExist();
    
    // Load theme
    ThemeManager.load();
    
    // Setup UI event listeners
    setupEventListeners();
    
    // Initial render
    Scripts.renderSidebar();
    Scripts.loadScript('opening');
    Stats.updateAll();
    
    // Set active date
    Utils.setActiveDate(Utils.getTodayStr());
    AppState.calendarCurrentDate = new Date();
    
    // Update closer selects
    updateCloserSelects();
    
    // Initialize Objection Handler
    if (typeof ObjectionHandler !== 'undefined') {
        setTimeout(function() {
            try {
                ObjectionHandler.init();
                console.log('✅ ObjectionHandler initialized successfully');
            } catch (e) {
                console.warn('⚠️ ObjectionHandler initialization error:', e);
            }
        }, 300);
    }
    
    // Update sticky positions after render
    setTimeout(updateStickyPositions, 200);
    
    // Mark app as ready and hide loading screen
    AppState.isAppReady = true;
    AppState._loadingComplete = true;
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
        }, 500);
    }
    
    // Show app wrapper
    const appWrapper = document.getElementById('appWrapper');
    if (appWrapper) {
        appWrapper.style.display = 'flex';
        appWrapper.style.opacity = '1';
    }
    
    console.log('✅ App initialized successfully');
    
    // Initialize Firebase and auth after app is ready
    initFirebaseAndAuth();
}

function initFirebaseAndAuth() {
    // Wait for Firebase then initialize auth
    const waitForFirebase = async function() {
        if (typeof FirebaseManager !== 'undefined') {
            try {
                await FirebaseManager.waitForReady();
                AppState.isFirebaseReady = FirebaseManager.isReady();
                console.log('✅ Firebase ready:', AppState.isFirebaseReady);
            } catch (e) {
                console.warn('Firebase wait failed:', e);
                AppState.isFirebaseReady = false;
            }
        } else {
            console.warn('FirebaseManager not found');
            AppState.isFirebaseReady = false;
        }
        
        // Initialize auth regardless of Firebase status
        Auth.initAuthListener();
        
        if (!AppState.isFirebaseReady) {
            console.warn('⚠️ Firebase not ready, showing offline mode');
            // Still show auth modal for offline mode
            setTimeout(() => {
                Auth.showModal();
            }, 500);
        }
    };
    
    waitForFirebase();
}

function setupEventListeners() {
    // Menu toggle
    const menuBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('mainSidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            mainContent.classList.toggle('expanded');
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.className = sidebar.classList.contains('closed') ? 'fas fa-bars' : 'fas fa-times';
            }
            document.dispatchEvent(new CustomEvent('sidebarToggle'));
        });
    }
    
    // Tools toggle
    const toolsHeader = document.getElementById('toolsHeader');
    const toolsMenu = document.getElementById('toolsMenu');
    const toolsChevron = document.getElementById('toolsChevron');
    
    if (toolsHeader && toolsMenu) {
        toolsHeader.addEventListener('click', () => {
            AppState.toolsOpen = !AppState.toolsOpen;
            toolsMenu.classList.toggle('open');
            if (toolsChevron) toolsChevron.classList.toggle('rotated');
            toolsHeader.setAttribute('aria-expanded', AppState.toolsOpen);
        });
    }
    
    // Tool items
    document.querySelectorAll('.tool-item[data-tool]').forEach(item => {
        item.addEventListener('click', () => {
            const tool = item.dataset.tool;
            switch (tool) {
                case 'analytics':
                    AppState.analyticsTab = 'insights';
                    FeaturePanel.show('analytics', '📊 Analytics Hub');
                    break;
                case 'calendar':
                    AppState.calendarViewMode = 'month';
                    FeaturePanel.show('calendar', '📅 Appointment & Handoff Calendar');
                    break;
                case 'tasks':
                    FeaturePanel.show('tasks', '📋 Follow-up Tasks');
                    break;
                case 'closers':
                    FeaturePanel.show('closers', '👔 Closer Management');
                    break;
                case 'shortcuts':
                    openShortcutsHelp();
                    break;
                case 'export':
                    Data.exportToCSV();
                    break;
                case 'theme':
                    ThemeManager.toggle();
                    break;
                case 'help':
                    openShortcutsHelp();
                    break;
                case 'reset':
                    if (confirm('⚠️ Reset all data? This cannot be undone.')) {
                        localStorage.clear();
                        if (AppState.currentUser) {
                            showToast('Please sign out and sign back in to complete reset.', 'warning');
                        }
                        location.reload();
                    }
                    break;
                default:
                    showToast(`Feature "${tool}" coming soon!`, 'info');
            }
        });
    });
    
    // Sign out
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => Auth.signOut());
    }
    
    // Top bar buttons
    const quickReportBtn = document.getElementById('quickReportBtn');
    if (quickReportBtn) {
        quickReportBtn.addEventListener('click', openSmartImportEnhanced);
    }
    
    const bulkActionsBtn = document.getElementById('bulkActionsBtn');
    if (bulkActionsBtn) {
        bulkActionsBtn.addEventListener('click', openBulkActions);
    }
    
    const searchGlobalBtn = document.getElementById('searchGlobalBtn');
    if (searchGlobalBtn) {
        searchGlobalBtn.addEventListener('click', openGlobalSearch);
    }
    
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (AppState.currentUser) {
                Data.loadUserData(true);
                showToast('Data refreshed', 'success');
            } else {
                showToast('Please sign in first', 'warning');
            }
        });
    }
    
    // CSV upload
    const csvInput = document.getElementById('csvFileInput');
    if (csvInput) {
        csvInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                openSmartImportEnhanced();
                const textArea = document.getElementById('importTextArea');
                if (textArea) {
                    textArea.value = text;
                    setTimeout(parseAndPreviewImportEnhanced, 300);
                }
            };
            reader.readAsText(file);
            csvInput.value = '';
        });
    }
    
    // Close feature panel
    const closeFeatureBtn = document.getElementById('closeFeaturePanelBtn');
    if (closeFeatureBtn) {
        closeFeatureBtn.addEventListener('click', () => {
            FeaturePanel.hide();
            Scripts.loadScript('opening');
        });
    }
    
    // Add script button
    const addScriptBtn = document.getElementById('addScriptBtnSide');
    if (addScriptBtn) {
        addScriptBtn.addEventListener('click', () => Scripts.createScript());
    }
    
    // Script search
    const scriptSearch = document.getElementById('scriptSearch');
    if (scriptSearch) {
        scriptSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.script-item');
            items.forEach(item => {
                const name = item.querySelector('.script-name')?.textContent?.toLowerCase() || '';
                item.style.display = name.includes(query) ? 'flex' : 'none';
            });
        });
    }
    
    // Smart Import modal events
    const parseImportBtn = document.getElementById('parseImportBtn');
    if (parseImportBtn) {
        parseImportBtn.addEventListener('click', parseAndPreviewImportEnhanced);
    }
    
    const closeImportBtn = document.getElementById('closeImportBtn');
    if (closeImportBtn) {
        closeImportBtn.addEventListener('click', closeSmartImportEnhanced);
    }
    
    const quickTemplateBtn = document.getElementById('quickTemplateBtn');
    if (quickTemplateBtn) {
        quickTemplateBtn.addEventListener('click', generateImportTemplate);
    }
    
    const clipboardImportBtn = document.getElementById('clipboardImportBtn');
    if (clipboardImportBtn) {
        clipboardImportBtn.addEventListener('click', quickImportFromClipboard);
    }
    
    const expandAllRecordsBtn = document.getElementById('expandAllRecordsBtn');
    if (expandAllRecordsBtn) {
        expandAllRecordsBtn.addEventListener('click', expandAllRecords);
    }
    
    const collapseAllRecordsBtn = document.getElementById('collapseAllRecordsBtn');
    if (collapseAllRecordsBtn) {
        collapseAllRecordsBtn.addEventListener('click', collapseAllRecords);
    }
    
    // Closer Management modal events
    const addCloserBtn = document.getElementById('addCloserBtn');
    if (addCloserBtn) {
        addCloserBtn.addEventListener('click', addCloser);
    }
    
    const closeCloserModalBtn = document.getElementById('closeCloserModalBtn');
    if (closeCloserModalBtn) {
        closeCloserModalBtn.addEventListener('click', closeCloserManagement);
    }
    
    // Bulk Actions modal events
    const executeBulkActionBtn = document.getElementById('executeBulkActionBtn');
    if (executeBulkActionBtn) {
        executeBulkActionBtn.addEventListener('click', executeBulkAction);
    }
    
    const closeBulkModalBtn = document.getElementById('closeBulkModalBtn');
    if (closeBulkModalBtn) {
        closeBulkModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('bulkActionsModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    const bulkActionSelect = document.getElementById('bulkActionSelect');
    if (bulkActionSelect) {
        bulkActionSelect.addEventListener('change', () => {
            const options = document.getElementById('bulkActionOptions');
            const statusGroup = document.getElementById('bulkStatusGroup');
            const tagGroup = document.getElementById('bulkTagGroup');
            if (options) options.style.display = 'block';
            if (statusGroup) statusGroup.style.display = bulkActionSelect.value === 'status' ? 'block' : 'none';
            if (tagGroup) tagGroup.style.display = bulkActionSelect.value === 'tag' ? 'block' : 'none';
        });
    }
    
    // Global Search modal events
    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            performGlobalSearch(e.target.value);
        });
        globalSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('globalSearchModal');
                if (modal) modal.style.display = 'none';
            }
        });
    }
    
    const globalSearchCloseBtn = document.getElementById('globalSearchCloseBtn');
    if (globalSearchCloseBtn) {
        globalSearchCloseBtn.addEventListener('click', () => {
            const modal = document.getElementById('globalSearchModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // Appointment Detail modal events
    const apptCloseBtn = document.getElementById('apptCloseBtn');
    if (apptCloseBtn) {
        apptCloseBtn.addEventListener('click', closeAppointmentDetail);
    }
    
    const apptCopyBtn = document.getElementById('apptCopyBtn');
    if (apptCopyBtn) {
        apptCopyBtn.addEventListener('click', () => {
            const appt = Data.getAppointmentById(AppState.currentAppointmentId);
            if (appt) {
                const text = `${appt.business}\n${appt.contactName}\n${appt.phone || ''}\n${appt.email || ''}\n${appt.date}\n${appt.time || ''}\n${appt.notes || ''}`;
                copyToClipboard(text);
            }
        });
    }
    
    const apptEditBtn = document.getElementById('apptEditBtn');
    if (apptEditBtn) {
        apptEditBtn.addEventListener('click', () => {
            if (AppState.currentAppointmentId) {
                editAppointment(AppState.currentAppointmentId);
            }
        });
    }
    
    const apptDeleteBtn = document.getElementById('apptDeleteBtn');
    if (apptDeleteBtn) {
        apptDeleteBtn.addEventListener('click', () => {
            if (AppState.currentAppointmentId) {
                const appt = Data.getAppointmentById(AppState.currentAppointmentId);
                if (appt && confirm(`Delete appointment with ${appt.business}?`)) {
                    Data.deleteAppointment(appt.date, appt.id);
                    closeAppointmentDetail();
                    showToast('Appointment deleted', 'info');
                }
            }
        });
    }
    
    // Shortcuts Help modal events
    const shortcutsHelpCloseBtn = document.getElementById('closeShortcutsHelpBtn');
    if (shortcutsHelpCloseBtn) {
        shortcutsHelpCloseBtn.addEventListener('click', () => {
            const modal = document.getElementById('shortcutsHelpModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!AppState.shortcutsEnabled) return;
        
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
            return;
        }
        
        if (e.key === 'Escape') {
            handleEscapeKey();
            return;
        }
        
        if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
            const visible = Utils.getOrderedVisible(AppState.scripts, AppState.scriptOrder);
            const idx = parseInt(e.key) - 1;
            if (idx < visible.length) {
                Scripts.loadScript(visible[idx]);
                e.preventDefault();
            }
            return;
        }
        
        const ctrlKey = e.ctrlKey || e.metaKey;
        const shiftKey = e.shiftKey;
        const key = e.key;
        
        for (const [action, shortcut] of Object.entries(AppState.shortcuts)) {
            const keys = shortcut.keys || [];
            const expectedCtrl = keys.includes('Ctrl') || keys.includes('Meta');
            const expectedShift = keys.includes('Shift');
            const expectedKey = keys.find(k => !['Ctrl', 'Meta', 'Shift', 'Alt'].includes(k));
            
            if (expectedKey && ctrlKey === expectedCtrl && shiftKey === expectedShift && key.toLowerCase() === expectedKey.toLowerCase()) {
                e.preventDefault();
                handleShortcutAction(action);
                break;
            }
        }
    });
}

// ================================================================
// START APPLICATION
// ================================================================

function startApp() {
    console.log('🚀 Starting ScriptFlow Pro...');
    
    // Set a timeout to force hide loading screen if something goes wrong
    const safetyTimeout = setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log('⚠️ Safety timeout: forcing loading screen hide');
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
            const appWrapper = document.getElementById('appWrapper');
            if (appWrapper) {
                appWrapper.style.display = 'flex';
                appWrapper.style.opacity = '1';
            }
        }
    }, 8000);
    
    try {
        initApp();
        // Clear safety timeout if app initializes successfully
        clearTimeout(safetyTimeout);
    } catch (e) {
        console.error('App initialization error:', e);
        clearTimeout(safetyTimeout);
        
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
        }
        const appWrapper = document.getElementById('appWrapper');
        if (appWrapper) {
            appWrapper.style.display = 'flex';
            appWrapper.style.opacity = '1';
        }
        showToast('Error loading app. Please refresh.', 'error');
    }
}

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM ready, starting app...');
        setTimeout(startApp, 100);
    });
} else {
    console.log('📄 DOM already ready, starting app...');
    setTimeout(startApp, 100);
}

// Expose globals
window.showToast = showToast;
window.copyToClipboard = copyToClipboard;
window.handleError = handleError;
window.openShortcutsHelp = openShortcutsHelp;
window.openCloserManagement = openCloserManagement;
window.closeCloserManagement = closeCloserManagement;
window.openSmartImportEnhanced = openSmartImportEnhanced;
window.closeSmartImportEnhanced = closeSmartImportEnhanced;
window.parseAndPreviewImportEnhanced = parseAndPreviewImportEnhanced;
window.showAppointmentDetail = showAppointmentDetail;
window.closeAppointmentDetail = closeAppointmentDetail;
window.editAppointment = editAppointment;
window.rescheduleAppointment = rescheduleAppointment;
window.completeAppointment = completeAppointment;
window.cancelAppointment = cancelAppointment;
window.openContactDetail = openContactDetail;
window.openGlobalSearch = openGlobalSearch;
window.performGlobalSearch = performGlobalSearch;
window.openBulkActions = openBulkActions;
window.executeBulkAction = executeBulkAction;
window.toggleTaskComplete = Data.toggleTaskComplete.bind(Data);
window.loadScript = Scripts.loadScript.bind(Scripts);
window.openShortcutEdit = openShortcutEdit;
window.handleShortcutAction = handleShortcutAction;
window.handleEscapeKey = handleEscapeKey;
window.renderScriptActions = renderScriptActions;
window.FeaturePanel = FeaturePanel;
window.CalendarView = CalendarView;
window.ThemeManager = ThemeManager;

console.log('🚀 App bundle loaded');