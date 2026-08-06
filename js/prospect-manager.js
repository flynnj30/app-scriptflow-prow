// ================================================================
// PROSPECT MANAGER - Complete
// ================================================================

const PROSPECT_SCHEMA = {
    business: { type: 'string', required: true, minLength: 2, maxLength: 100, label: 'Business Name', section: 'core' },
    name: { type: 'string', required: true, minLength: 2, maxLength: 100, label: 'Contact Name', section: 'core' },
    role: { type: 'string', required: false, maxLength: 50, label: 'Role', section: 'core', options: ['Owner', 'Manager', 'CEO', 'Director', 'Supervisor', 'Team Lead', 'Other'] },
    phone: { type: 'string', required: false, label: 'Phone Number', section: 'contact' },
    email: { type: 'string', required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'Email Address', section: 'contact' },
    date: { type: 'date', required: false, label: 'Appointment Date', section: 'appointment' },
    time: { type: 'string', required: false, label: 'Appointment Time', section: 'appointment' },
    status: { type: 'string', required: false, label: 'Status', section: 'appointment', options: ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held'] },
    notes: { type: 'text', required: false, maxLength: 2000, label: 'Notes', section: 'notes' },
    tags: { type: 'array', required: false, label: 'Tags', section: 'meta' },
    leadScore: { type: 'number', required: false, label: 'Lead Score', section: 'meta', min: 0, max: 100 },
    source: { type: 'string', required: false, label: 'Source', section: 'meta', options: ['Smart Import', 'Manual Entry', 'CSV Import', 'API', 'Web Form', 'Other'] }
};

class ProspectManager {
    constructor() {
        this.collection = 'prospects';
        this.cache = new Map();
        this.listeners = [];
        this.isInitialized = false;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.unsubscribe = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this._initAttempted = false;
    }

    init() {
        if (this.isInitialized) return this;
        if (this._initAttempted) return this;
        this._initAttempted = true;
        console.log('Initializing Prospect Manager...');
        this.isInitialized = true;
        this.loadFromCache();
        this.setupListeners();
        return this;
    }

    setupListeners() {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            if (window.AppState && window.AppState.currentUser) {
                this.subscribeToFirebase();
            }
        }
    }

    subscribeToFirebase() {
        if (this.unsubscribe) { this.unsubscribe(); this.unsubscribe = null; }
        try {
            const db = firebase.firestore();
            const userRef = db.collection('users').doc(window.AppState.currentUser.uid);
            this.unsubscribe = userRef.collection('prospects').orderBy('createdAt', 'desc').onSnapshot(snap => {
                if (this.syncInProgress) return;
                snap.docChanges().forEach(change => {
                    const data = change.doc.data();
                    const id = change.doc.id;
                    if (change.type === 'removed') { this.cache.delete(id); }
                    else { this.cache.set(id, { ...data, id }); }
                });
                this.saveToCache();
                this.notifyListeners();
                this.lastSyncTime = new Date();
                this.retryCount = 0;
            }, error => {
                console.warn('Prospect subscription error:', error);
                this.loadFromCache();
                this.retryConnection();
            });
        } catch (error) {
            console.warn('Prospect subscription setup error:', error);
            this.loadFromCache();
            this.retryConnection();
        }
    }

    retryConnection() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => {
                console.log(`Retrying Firebase connection (${this.retryCount}/${this.maxRetries})...`);
                this.subscribeToFirebase();
            }, 2000 * this.retryCount);
        }
    }

    loadFromCache() {
        try {
            const data = localStorage.getItem('prospects_cache');
            if (data) {
                const parsed = JSON.parse(data);
                this.cache = new Map(Object.entries(parsed));
                console.log(`Loaded ${this.cache.size} prospects from cache`);
            }
        } catch (e) { console.warn('Failed to load prospects from cache:', e); }
    }

    saveToCache() {
        try {
            const obj = Object.fromEntries(this.cache);
            localStorage.setItem('prospects_cache', JSON.stringify(obj));
        } catch (e) { console.warn('Failed to save prospects to cache:', e); }
    }

    async create(data) {
        const validation = this.validate(data);
        if (!validation.isValid) {
            const error = new Error(`Validation failed: ${validation.errors.join(', ')}`);
            error.errors = validation.errors;
            error.warnings = validation.warnings;
            throw error;
        }

        const prospect = this.normalize(data);
        prospect.id = prospect.id || this.generateId();
        prospect.createdAt = new Date().toISOString();
        prospect.updatedAt = new Date().toISOString();
        prospect.leadScore = this.calculateLeadScore(prospect);

        this.cache.set(prospect.id, prospect);
        this.saveToCache();
        await this.syncToFirebase(prospect);
        this.notifyListeners();
        return prospect;
    }

    get(id) { return this.cache.get(id) || null; }

    getAll(filters = {}) {
        let prospects = Array.from(this.cache.values());
        if (prospects.length === 0) return prospects;
        
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            prospects = prospects.filter(p => statuses.includes(p.status));
        }
        if (filters.assigned) {
            prospects = prospects.filter(p => p.assigned === filters.assigned);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            prospects = prospects.filter(p => {
                const searchable = `${p.business || ''} ${p.name || ''} ${p.phone || ''} ${p.email || ''} ${p.notes || ''}`.toLowerCase();
                return searchable.includes(search);
            });
        }
        if (filters.limit) {
            prospects = prospects.slice(0, filters.limit);
        }
        prospects.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        });
        return prospects;
    }

    async update(id, updates) {
        const existing = this.cache.get(id);
        if (!existing) throw new Error(`Prospect with ID ${id} not found`);

        const merged = { ...existing, ...updates };
        const validation = this.validate(merged);
        if (!validation.isValid) {
            const error = new Error(`Validation failed: ${validation.errors.join(', ')}`);
            error.errors = validation.errors;
            error.warnings = validation.warnings;
            throw error;
        }

        const prospect = this.normalize(merged);
        prospect.updatedAt = new Date().toISOString();
        prospect.leadScore = this.calculateLeadScore(prospect);

        this.cache.set(id, prospect);
        this.saveToCache();
        await this.syncToFirebase(prospect, true);
        this.notifyListeners();
        return prospect;
    }

    async delete(id) {
        const existing = this.cache.get(id);
        if (!existing) throw new Error(`Prospect with ID ${id} not found`);

        this.cache.delete(id);
        this.saveToCache();

        if (window.AppState && window.AppState.isFirebaseReady && window.AppState.currentUser) {
            try {
                this.syncInProgress = true;
                await firebase.firestore().collection('users').doc(window.AppState.currentUser.uid).collection('prospects').doc(id).delete();
                this.syncInProgress = false;
            } catch (error) {
                this.syncInProgress = false;
                console.warn('Failed to sync prospect deletion to Firebase:', error);
                this.cache.set(id, existing);
                this.saveToCache();
                throw error;
            }
        }
        this.notifyListeners();
        return true;
    }

    async syncToFirebase(prospect, isUpdate = false) {
        if (window.AppState && window.AppState.isFirebaseReady && window.AppState.currentUser) {
            try {
                this.syncInProgress = true;
                const docRef = firebase.firestore().collection('users').doc(window.AppState.currentUser.uid).collection('prospects').doc(prospect.id);
                if (isUpdate) { await docRef.update(prospect); }
                else { await docRef.set(prospect); }
                this.syncInProgress = false;
            } catch (error) {
                this.syncInProgress = false;
                console.warn('Failed to sync prospect to Firebase:', error);
                throw error;
            }
        }
    }

    generateId() {
        return Date.now().toString() + '_' + Math.random().toString(36).substring(2, 11);
    }

    validate(data) {
        const errors = [];
        const warnings = [];

        for (const [field, schema] of Object.entries(PROSPECT_SCHEMA)) {
            const value = data[field];
            
            if (schema.required) {
                const isEmpty = value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
                if (isEmpty) { errors.push(`${schema.label} is required`); continue; }
            }

            if (value === undefined || value === null || value === '') continue;

            if (schema.type === 'string') {
                if (typeof value !== 'string') { errors.push(`${schema.label} must be a string`); continue; }
                if (schema.minLength && value.length < schema.minLength) { errors.push(`${schema.label} must be at least ${schema.minLength} characters`); }
                if (schema.maxLength && value.length > schema.maxLength) { warnings.push(`${schema.label} exceeds ${schema.maxLength} characters (${value.length})`); }
                if (schema.pattern && !schema.pattern.test(value)) { warnings.push(`${schema.label} format seems invalid`); }
            }
            if (schema.type === 'number') {
                if (typeof value !== 'number' || isNaN(value)) { errors.push(`${schema.label} must be a number`); }
                if (schema.min !== undefined && value < schema.min) { warnings.push(`${schema.label} should be at least ${schema.min}`); }
                if (schema.max !== undefined && value > schema.max) { warnings.push(`${schema.label} should be at most ${schema.max}`); }
            }
            if (schema.type === 'date') {
                const date = new Date(value);
                if (isNaN(date.getTime())) { errors.push(`${schema.label} must be a valid date`); }
            }
            if (schema.type === 'array') {
                if (!Array.isArray(value)) { errors.push(`${schema.label} must be an array`); }
            }
            if (schema.type === 'text') {
                if (typeof value !== 'string') { errors.push(`${schema.label} must be text`); }
                if (schema.maxLength && value.length > schema.maxLength) { warnings.push(`${schema.label} exceeds ${schema.maxLength} characters`); }
            }
            if (schema.options && Array.isArray(schema.options) && value) {
                if (!schema.options.includes(value)) { warnings.push(`"${value}" is not in the recommended options for ${schema.label}`); }
            }
        }

        return { isValid: errors.length === 0, errors, warnings };
    }

    normalize(data) {
        const normalized = { ...data };
        if (normalized.business) normalized.business = normalized.business.trim();
        if (normalized.name) normalized.name = normalized.name.trim();
        if (normalized.phone) normalized.phone = normalized.phone.replace(/[^\d+]/g, '');
        if (normalized.email) normalized.email = normalized.email.toLowerCase().trim();
        if (normalized.tags) {
            if (typeof normalized.tags === 'string') { normalized.tags = normalized.tags.split(',').map(t => t.trim()).filter(t => t); }
            else if (!Array.isArray(normalized.tags)) { normalized.tags = []; }
        } else { normalized.tags = []; }
        return normalized;
    }

    calculateLeadScore(prospect) {
        let score = 0;
        const statusScores = { 'Hot Transfer': 50, 'Completed': 40, 'Warm Callback': 30, 'Meeting Booked': 25, 'Held': 20, 'Rescheduled': 15, 'Pending': 10, 'Canceled': -20 };
        score += statusScores[prospect.status] || 0;
        if (prospect.phone) score += 10;
        if (prospect.email) score += 10;
        if (prospect.notes) {
            if (prospect.notes.length > 10) score += 5;
            if (prospect.notes.length > 50) score += 5;
        }
        if (prospect.tags && prospect.tags.length > 0) {
            const tagScores = { 'vip': 20, 'qualified_warm_call': 15, 'high_interest': 15, 'decision_maker': 10, 'callback_requested': 10 };
            prospect.tags.forEach(tag => { score += tagScores[tag] || 0; });
        }
        if (prospect.role) {
            const roleScores = { 'Owner': 15, 'CEO': 15, 'Director': 12, 'Manager': 10, 'Supervisor': 8 };
            score += roleScores[prospect.role] || 0;
        }
        return Math.max(0, Math.min(100, score));
    }

    addListener(callback) {
        this.listeners.push(callback);
        return () => { this.listeners = this.listeners.filter(cb => cb !== callback); };
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            try { callback(this.getAll()); } catch (error) { console.warn('Error in prospect listener:', error); }
        });
    }

    getStats() {
        const prospects = this.getAll();
        const stats = { total: prospects.length, byStatus: {}, bySource: {}, byAssigned: {}, avgScore: 0 };
        let totalScore = 0;
        prospects.forEach(p => {
            const status = p.status || 'Unknown';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            const source = p.source || 'Unknown';
            stats.bySource[source] = (stats.bySource[source] || 0) + 1;
            const assigned = p.assigned || 'Unassigned';
            stats.byAssigned[assigned] = (stats.byAssigned[assigned] || 0) + 1;
            totalScore += p.leadScore || 0;
        });
        stats.avgScore = prospects.length > 0 ? Math.round(totalScore / prospects.length) : 0;
        return stats;
    }

    search(query) { return this.getAll({ search: query }); }
    getByStatus(status) { return this.getAll({ status }); }
    getRecent(limit = 10) { return this.getAll({ limit }); }
}

// Create singleton instance
const ProspectManagerInstance = new ProspectManager();

// Initialize when ready
function initProspectManagerWhenReady() {
    if (typeof window.AppState !== 'undefined' && window.AppState && window.AppState.currentUser) {
        if (!ProspectManagerInstance.isInitialized) {
            ProspectManagerInstance.init();
        }
        window.ProspectManager = ProspectManagerInstance;
        window.AppState.prospectManager = ProspectManagerInstance;
        window.AppState.prospectManagerReady = true;
        console.log('Prospect Manager initialized successfully');
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initProspectManagerWhenReady, 500);
});

// Start checking for user
let userCheckInterval = null;
function startUserCheck() {
    if (userCheckInterval) return;
    userCheckInterval = setInterval(function() {
        if (typeof window.AppState !== 'undefined' && window.AppState && window.AppState.currentUser) {
            if (!ProspectManagerInstance.isInitialized) {
                ProspectManagerInstance.init();
                window.ProspectManager = ProspectManagerInstance;
                window.AppState.prospectManager = ProspectManagerInstance;
                window.AppState.prospectManagerReady = true;
                console.log('Prospect Manager initialized via interval check');
                clearInterval(userCheckInterval);
                userCheckInterval = null;
            }
        }
    }, 2000);
}
setTimeout(startUserCheck, 1000);

window.initProspectManager = function() { return initProspectManagerWhenReady(); };
window.ProspectManager = ProspectManagerInstance;

console.log('Prospect Manager module loaded');