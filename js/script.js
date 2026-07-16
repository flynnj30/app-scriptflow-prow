// ================================================================
// SCRIPTFLOW PRO - COMPLETE CENTRALIZED APPLICATION
// ================================================================

let currentUser = null;
let authModalOpen = false;
let authInProgress = false;
let appointments = {};
let goals = { daily: 3, weekly: 15, monthly: 60 };
let scripts = {};
let scriptOrder = [];
let customOrder = [];
let currentScriptId = "opening";
let isEditing = false;
let searchTerm = "";
let versionHistory = {};
let currentVersionIndex = {};
let tasks = [];
let taskFilter = 'all';
let isAppInitialized = false;
let isRefreshing = false;

let appointmentsUnsubscribe = null;
let tasksUnsubscribe = null;

let currentCalDate = new Date();
let selectedCalDate = getTodayStr();

let dashboardDatePreset = 'today';
let dashboardDateRange = { start: getTodayStr(), end: getTodayStr() };
let currentView = 'calendar';
let currentStatusFilter = 'all';
let currentTagFilter = 'all';
let currentListSearchTerm = '';
let currentSort = 'time';
let currentAnalyticsTab = 'insights';
let selectedAppointments = new Set();

let toolsOpen = localStorage.getItem('toolsMenuOpen') === 'true';
let featureChartInstance = null;
let draggedItem = null;

// Handoffs Integrated directly into main status pathways
const STATUS_OPTIONS = [
    'Warm Callback',
    'Completed',
    'Canceled',
    'Pending',
    'Hot Transfer',
    'Warm Call Booked',
    'Meeting Booked',
    'Rescheduled',
    'Held'
];

const TAG_OPTIONS = [
    { id: 'qualified_warm_call', name: 'Qualified Warm Call', color: '#10b981', colorClass: 'tag-qualified-warm-call-bg' },
    { id: 'unqualified_warm_callback', name: 'Unqualified Warm Callback', color: '#f59e0b', colorClass: 'tag-unqualified-warm-callback-bg' },
    { id: 'vip', name: 'VIP', color: '#3b82f6', colorClass: 'tag-vip-bg' },
    { id: 'negligent_warm_callback', name: 'Negligent Warm Callback', color: '#ef4444', colorClass: 'tag-negligent-warm-callback-bg' }
];

const WORKSPACE_CONFIG = {
    HOME_URL: 'https://sales.regen-digital.com/campaigns',
    SEARCH_ENGINE: 'https://www.google.com/search?q=',
    MAX_TABS: 20,
    AUTO_SAVE_INTERVAL: 30000,
    SESSION_KEY: 'workspace_session_state'
};

let workspaceState = {
    tabs: [],
    activeTabId: null,
    tabCounter: 0,
    history: {},
    historyIndex: {},
    bookmarks: JSON.parse(localStorage.getItem('workspace_bookmarks') || '[]'),
    clipboardHistory: JSON.parse(localStorage.getItem('workspace_clipboard') || '[]'),
    notes: localStorage.getItem('workspace_notes') || '',
    script: localStorage.getItem('workspace_script') || 'Hi [Name], this is [Your Name] from Regen Digital...',
    quickCopyItems: JSON.parse(localStorage.getItem('workspace_quickcopy') || '[]'),
    sessionState: null,
    splitMode: false,
    splitDirection: 'horizontal',
    panels: {
        notepad: { visible: false, minimized: false, x: 100, y: 100, width: 320, height: 250 },
        callscript: { visible: false, minimized: false, x: 440, y: 100, width: 380, height: 300 },
        calculator: { visible: false, minimized: false, x: 100, y: 400, width: 280, height: 320 },
        timer: { visible: false, minimized: false, x: 400, y: 400, width: 280, height: 200 },
        clipboard: { visible: false, minimized: false, x: 700, y: 100, width: 300, height: 250 }
    }
};

let splitModeActive = false;
let splitRatio = 50;
let commandPaletteOpen = false;

// Standalone Notes Engine integration
window.Notepad = window.Notepad || {
    notes: [],
    currentNoteId: null,
    isLoaded: false,
    async init() {
        await this.loadNotes();
        const container = document.getElementById('featurePanelBody');
        if (container && currentView === 'notepad') {
            this.render(container);
        }
    },
    async loadNotes() {
        if (currentUser) {
            try {
                const snap = await db.collection('users').doc(currentUser.uid).collection('notes').orderBy('updatedAt', 'desc').get();
                this.notes = [];
                snap.forEach(doc => {
                    this.notes.push({ id: doc.id, ...doc.data() });
                });
            } catch (e) {
                console.warn("Firestore notes loading bypassed, fallback to local:", e);
                this.notes = JSON.parse(localStorage.getItem('sf_local_notes') || '[]');
            }
        } else {
            this.notes = JSON.parse(localStorage.getItem('sf_local_notes') || '[]');
        }
        if (this.notes.length > 0 && !this.currentNoteId) {
            this.currentNoteId = this.notes[0].id;
        }
        this.isLoaded = true;
    },
    async saveNote(id, title, content) {
        const updatedNote = {
            title: title || 'Untitled Note',
            content: content || '',
            updatedAt: new Date().toISOString()
        };
        const idx = this.notes.findIndex(n => n.id === id);
        if (idx !== -1) {
            this.notes[idx] = { ...this.notes[idx], ...updatedNote };
        } else {
            updatedNote.id = id;
            updatedNote.createdAt = new Date().toISOString();
            this.notes.unshift(updatedNote);
        }
        localStorage.setItem('sf_local_notes', JSON.stringify(this.notes));
        if (currentUser) {
            try {
                await db.collection('users').doc(currentUser.uid).collection('notes').doc(id).set(updatedNote, { merge: true });
            } catch (e) {
                console.error("Cloud note save failed:", e);
            }
        }
    },
    async deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        localStorage.setItem('sf_local_notes', JSON.stringify(this.notes));
        if (this.currentNoteId === id) {
            this.currentNoteId = this.notes.length > 0 ? this.notes[0].id : null;
        }
        if (currentUser) {
            try {
                await db.collection('users').doc(currentUser.uid).collection('notes').doc(id).delete();
            } catch (e) {
                console.error("Cloud note deletion failed:", e);
            }
        }
    },
    render(container) {
        if (!container) return;
        const currentNote = this.notes.find(n => n.id === this.currentNoteId) || { id: '', title: '', content: '' };
        
        container.innerHTML = `
            <div class="notepad-wrapper" style="display: flex; gap: 20px; height: 100%; min-height: 450px;">
                <div class="notepad-sidebar" style="width: 200px; border-right: 1px solid var(--border-color); padding-right: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <button id="npNewNoteBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--primary); color:white;"><i class="fas fa-plus"></i> New Note</button>
                    <div id="npNotesList" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:6px; margin-top:10px;">
                        ${this.notes.map(n => `
                            <div class="np-note-item ${n.id === this.currentNoteId ? 'active' : ''}" data-id="${n.id}" style="padding:10px; border-radius:8px; cursor:pointer; background:${n.id === this.currentNoteId ? 'var(--primary)' : 'var(--bg-primary)'}; color:${n.id === this.currentNoteId ? 'white' : 'var(--text-primary)'}; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:120px;">${escapeHtml(n.title)}</span>
                                <i class="fas fa-trash np-delete-note-icon" data-id="${n.id}" style="font-size:0.75rem; opacity:0.6; cursor:pointer;"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="notepad-editor" style="flex:1; display:flex; flex-direction:column; gap:12px;">
                    <input type="text" id="npNoteTitle" placeholder="Note Title" value="${escapeHtml(currentNote.title || '')}" style="font-size:1.2rem; font-weight:700; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); width:100%;" ${!this.currentNoteId ? 'disabled' : ''}/>
                    <textarea id="npNoteContent" placeholder="Write your notes here..." style="flex:1; padding:12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-family:inherit; font-size:0.95rem; line-height:1.5; resize:none;" ${!this.currentNoteId ? 'disabled' : ''}>${escapeHtml(currentNote.content || '')}</textarea>
                    <div style="text-align:right; font-size:0.75rem; color:var(--text-muted);">Auto-saved locally and to cloud</div>
                </div>
            </div>
        `;
        
        this.attachEvents(container);
    },
    attachEvents(container) {
        container.querySelector('#npNewNoteBtn')?.addEventListener('click', async () => {
            const id = 'note_' + generateUniqueId();
            await this.saveNote(id, 'New Note', '');
            this.currentNoteId = id;
            this.render(container);
        });

        container.querySelectorAll('.np-note-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('np-delete-note-icon')) return;
                this.currentNoteId = item.getAttribute('data-id');
                this.render(container);
            });
        });

        container.querySelectorAll('.np-delete-note-icon').forEach(icon => {
            icon.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = icon.getAttribute('data-id');
                if (confirm('Delete this note permanently?')) {
                    await this.deleteNote(id);
                    this.render(container);
                    showToast('Note deleted', 'info');
                }
            });
        });

        const titleInput = container.querySelector('#npNoteTitle');
        const contentInput = container.querySelector('#npNoteContent');

        let saveTimeout;
        const triggerAutoSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
                if (this.currentNoteId) {
                    await this.saveNote(this.currentNoteId, titleInput.value, contentInput.value);
                    const activeListItemSpan = container.querySelector(`.np-note-item[data-id="${this.currentNoteId}"] span`);
                    if (activeListItemSpan) {
                        activeListItemSpan.textContent = titleInput.value || 'Untitled Note';
                    }
                }
            }, 500);
        };

        titleInput?.addEventListener('input', triggerAutoSave);
        contentInput?.addEventListener('input', triggerAutoSave);
    }
};

// Error Handling Function
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    let message = 'An error occurred. Please try again.';
    if (error.code === 'auth/network-request-failed') {
        message = 'Network connection lost. Please check your internet connection.';
        showOfflineIndicator(true);
    } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please wait a moment and try again.';
    } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
    } else if (error.message) {
        message = error.message;
    }
    showToast(message, 'error');
    return { success: false, message };
}

function showOfflineIndicator(show) {
    let indicator = document.getElementById('offlineIndicator');
    if (!indicator) {
        const div = document.createElement('div');
        div.id = 'offlineIndicator';
        div.className = 'offline-indicator';
        div.innerHTML = '<i class="fas fa-wifi"></i> Working offline. Data will sync automatically when reconnected.';
        document.body.prepend(div);
        indicator = div;
    }
    if (show) {
        indicator.classList.add('show');
    } else {
        indicator.classList.remove('show');
    }
}

// Utility Helpers
function generateUniqueId() {
    return Date.now().toString() + '_' + Math.random().toString(36).substring(2, 11);
}

function getStatus(appt) {
    if (!appt || !appt.status) return 'Pending';
    return appt.status;
}

function getStatusClassSmall(status) {
    switch (status) {
        case 'Warm Callback': return 'status-warm-callback-sm';
        case 'Completed': return 'status-completed-sm';
        case 'Canceled': return 'status-canceled-sm';
        case 'Pending': return 'status-pending-sm';
        case 'Hot Transfer': return 'status-hot-transfer-sm';
        case 'Warm Call Booked': return 'status-warm-call-booked-sm';
        case 'Meeting Booked': return 'status-meeting-booked-sm';
        case 'Rescheduled': return 'status-rescheduled-sm';
        case 'Held': return 'status-held-sm';
        default: return 'status-pending-sm';
    }
}

function getTagDisplay(tags) {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return '';
    return tags.map(tagId => {
        const tag = TAG_OPTIONS.find(t => t.id === tagId);
        if (!tag) return '';
        return `<span class="tag-pill ${tag.colorClass}"><i class="fas fa-tag" aria-hidden="true"></i> ${tag.name}</span>`;
    }).join('');
}

function getScoreColor(score) {
    if (score >= 70) return 'score-hot';
    if (score >= 40) return 'score-warm';
    return 'score-cold';
}

function getScoreLabel(score) {
    if (score >= 70) return '🔥 Hot';
    if (score >= 40) return 'Warm';
    return '❄️ Cold';
}

// Centralized Lead Scoring with support for handoffs
function calculateLeadScore(appt) {
    let score = 0;
    const status = getStatus(appt);
    
    // Custom workflow rules for Handoff metrics
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
    if (appt.crmLink) score += 5;
    return Math.max(0, Math.min(100, score));
}

function getTodayStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
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
}

function formatDateShort(dateStr) {
    if (!dateStr) return '';
    let d = new Date(dateStr.replace(/-/g, '/'));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatToLocalDateStr(dateInput) {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function escapeHtml(s) {
    return s ? String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])) : '';
}

function showToast(msg, type = 'success') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = `toast ${type === 'error' ? 'error' : (type === 'info' ? 'info' : '')}`;
    t.innerHTML = `${type === 'success' ? '✓' : (type === 'error' ? '⚠️' : 'ℹ️')} ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
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

// Authentication Handlers
function getUserPhotoURL(user) {
    if (!user) return null;
    if (user.photoURL) return user.photoURL;
    if (user.providerData && user.providerData.length > 0) {
        const googleProvider = user.providerData.find(p => p.providerId === 'google.com');
        if (googleProvider && googleProvider.photoURL) return googleProvider.photoURL;
    }
    return null;
}

function updateSidebarProfile(user) {
    const userInfoContainer = document.getElementById('userInfo');
    if (!userInfoContainer) return;
    if (!user) {
        userInfoContainer.style.display = 'none';
        return;
    }
    userInfoContainer.style.display = 'block';
    let avatarContainer = userInfoContainer.querySelector('.user-profile');
    if (!avatarContainer) {
        avatarContainer = document.createElement('div');
        avatarContainer.className = 'user-profile';
        userInfoContainer.innerHTML = '';
        userInfoContainer.appendChild(avatarContainer);
    }
    const photoURL = getUserPhotoURL(user);
    const displayName = user.displayName || user.email || 'User';
    let avatarHtml = '';
    if (photoURL) {
        avatarHtml = `<img src="${photoURL}" alt="${displayName}" class="user-avatar" referrerpolicy="no-referrer" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'user-avatar-placeholder\\'>${displayName.charAt(0).toUpperCase()}</div>'" />`;
    } else {
        const initials = displayName.charAt(0).toUpperCase();
        avatarHtml = `<div class="user-avatar-placeholder">${initials}</div>`;
    }
    avatarContainer.innerHTML = `${avatarHtml}<span class="user-email">${user.email || displayName}</span>`;
}

async function signInWithGoogle() {
    if (authInProgress) { showToast('Sign in already in progress...', 'info'); return; }
    authInProgress = true;
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        if (result.user) {
            currentUser = result.user;
            updateSidebarProfile(currentUser);
            await loadUserData();
            showToast('Welcome back! 👋', 'success');
            closeAuthModal();
            authInProgress = false;
            return true;
        }
    } catch (error) {
        authInProgress = false;
        handleError(error, 'Google Sign-In');
        return false;
    }
}

async function signUp(email, password, username) {
    if (authInProgress) { showToast('Sign in progress...', 'info'); return; }
    authInProgress = true;
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        if (result.user) {
            await result.user.updateProfile({ displayName: username });
            await db.collection('users').doc(result.user.uid).set({
                uid: result.user.uid,
                email: email,
                username: username,
                displayName: username,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                goals: { daily: 3, weekly: 15, monthly: 60 },
                scriptOrder: ['opening', 'owner_yes', 'owner_no', 'objection_website', 'objection_webguy', 'objection_cost', 'objection_busy', 'objection_not_interested', 'objection_info', 'objection_found_me', 'closing']
            });
            showToast('Account created! 🎉', 'success');
            currentUser = result.user;
            updateSidebarProfile(currentUser);
            await loadUserData();
            closeAuthModal();
            authInProgress = false;
            return true;
        }
    } catch (error) {
        authInProgress = false;
        handleError(error, 'Sign Up');
        return false;
    }
}

async function signIn(email, password) {
    if (authInProgress) { showToast('Sign in progress...', 'info'); return; }
    authInProgress = true;
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        if (result.user) {
            currentUser = result.user;
            updateSidebarProfile(currentUser);
            await loadUserData();
            showToast('Welcome back! 👋', 'success');
            closeAuthModal();
            authInProgress = false;
            return true;
        }
    } catch (error) {
        authInProgress = false;
        handleError(error, 'Sign In');
        return false;
    }
}

async function signOut() {
    try {
        if (appointmentsUnsubscribe) { appointmentsUnsubscribe(); appointmentsUnsubscribe = null; }
        if (tasksUnsubscribe) { tasksUnsubscribe(); tasksUnsubscribe = null; }
        currentUser = null;
        appointments = {};
        tasks = [];
        scripts = {};
        scriptOrder = [];
        updateSidebarProfile(null);
        updateStats();
        renderSidebar();
        await auth.signOut();
        showToast('Signed out successfully', 'info');
        setTimeout(() => { showAuthModal(); }, 300);
    } catch (error) {
        handleError(error, 'Sign Out');
    }
}

function showAuthModal() {
    if (authModalOpen) return;
    authModalOpen = true;
    const existingModal = document.getElementById('authModal');
    if (existingModal) { existingModal.remove(); }
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'authModal';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 420px;">
            <h2 style="text-align:center; margin-bottom: 20px;">
                <i class="fas fa-microphone-alt" style="color:var(--primary);"></i>
                ScriptFlow Pro
            </h2>
            <p style="text-align:center; color:var(--text-muted); margin-bottom:20px; font-size:0.9rem;">
                Sign in to manage and hand off your leads
            </p>
            <button id="googleSignInBtn" class="btn-icon" style="width:100%; justify-content:center; background:#ffffff; color:#333; border:1px solid #dadce0; margin-bottom:16px; padding:10px;">
                <svg style="width:18px; height:18px; margin-right:8px; flex-shrink:0;" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span style="font-weight:500;">Sign in with Google</span>
            </button>
            <div class="auth-divider">or continue with email</div>
            <div id="authFormContainer">
                <div style="display:flex; gap:8px; margin-bottom:20px;">
                    <button id="loginTabBtn" class="view-btn active" style="flex:1; justify-content:center;">Sign In</button>
                    <button id="signupTabBtn" class="view-btn" style="flex:1; justify-content:center;">Sign Up</button>
                </div>
                <div id="loginForm">
                    <div class="form-group"><label for="loginEmailInput">Email</label><input type="email" id="loginEmailInput" placeholder="you@example.com" /></div>
                    <div class="form-group"><label for="loginPasswordInput">Password</label><input type="password" id="loginPasswordInput" placeholder="••••••••" /></div>
                    <button id="loginBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--primary); color:white;"><i class="fas fa-sign-in-alt"></i> Sign In</button>
                </div>
                <div id="signupForm" style="display:none;">
                    <div class="form-group"><label for="signupUsernameInput">Username</label><input type="text" id="signupUsernameInput" placeholder="Choose a username" /></div>
                    <div class="form-group"><label for="signupEmailInput">Email</label><input type="email" id="signupEmailInput" placeholder="you@example.com" /></div>
                    <div class="form-group"><label for="signupPasswordInput">Password</label><input type="password" id="signupPasswordInput" placeholder="•••••••• (min 6 chars)" /></div>
                    <button id="signupBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--success); color:white;"><i class="fas fa-user-plus"></i> Create Account</button>
                </div>
            </div>
            <div style="margin-top:16px; text-align:center; font-size:0.8rem; color:var(--text-muted);">🔒 Secure Cloud Data Integration</div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('googleSignInBtn').addEventListener('click', async (e) => { e.preventDefault(); await signInWithGoogle(); });
    document.getElementById('loginTabBtn').addEventListener('click', () => {
        document.getElementById('loginTabBtn').classList.add('active');
        document.getElementById('signupTabBtn').classList.remove('active');
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
    });
    document.getElementById('signupTabBtn').addEventListener('click', () => {
        document.getElementById('signupTabBtn').classList.add('active');
        document.getElementById('loginTabBtn').classList.remove('active');
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
    });
    document.getElementById('loginBtn').addEventListener('click', async () => {
        const email = document.getElementById('loginEmailInput').value;
        const password = document.getElementById('loginPasswordInput').value;
        if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
        await signIn(email, password);
    });
    document.getElementById('signupBtn').addEventListener('click', async () => {
        const username = document.getElementById('signupUsernameInput').value;
        const email = document.getElementById('signupEmailInput').value;
        const password = document.getElementById('signupPasswordInput').value;
        if (!username || !email || !password) { showToast('Please fill in all fields', 'error'); return; }
        if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
        await signUp(email, password, username);
    });
    modal.querySelectorAll('input').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (document.getElementById('loginForm').style.display !== 'none') {
                    document.getElementById('loginBtn').click();
                } else {
                    document.getElementById('signupBtn').click();
                }
            }
        });
    });
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) { modal.remove(); authModalOpen = false; }
}

async function refreshData() {
    if (isRefreshing) return;
    isRefreshing = true;
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) { refreshBtn.classList.add('spinning'); refreshBtn.disabled = true; }
    try {
        showToast('Refreshing data...', 'info');
        await loadUserData(true);
        refreshCurrentView();
        showToast('Data refreshed!', 'success');
    } catch (error) {
        handleError(error, 'Refresh');
    } finally {
        isRefreshing = false;
        if (refreshBtn) { refreshBtn.classList.remove('spinning'); refreshBtn.disabled = false; }
    }
}

// Data Pipeline Core
async function loadUserData(showLoading = true) {
    if (!currentUser) return;
    try {
        if (showLoading) {
            document.getElementById('saveStatus').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        }
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        if (!userData) {
            await db.collection('users').doc(currentUser.uid).set({
                uid: currentUser.uid,
                email: currentUser.email,
                username: currentUser.displayName || currentUser.email,
                displayName: currentUser.displayName || currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                goals: { daily: 3, weekly: 15, monthly: 60 },
                scriptOrder: ['opening', 'owner_yes', 'owner_no', 'objection_website', 'objection_webguy', 'objection_cost', 'objection_busy', 'objection_not_interested', 'objection_info', 'objection_found_me', 'closing']
            });
            return loadUserData();
        }
        if (userData.goals) {
            goals = { daily: userData.goals.daily || 3, weekly: userData.goals.weekly || 15, monthly: userData.goals.monthly || 60 };
        }
        scriptOrder = userData.scriptOrder || [];
        
        // Load Realtime Data Listeners
        subscribeToChanges();
        
        const scriptsSnapshot = await db.collection('users').doc(currentUser.uid).collection('scripts').get();
        scripts = {};
        scriptsSnapshot.forEach(doc => {
            const data = doc.data();
            scripts[doc.id] = { name: data.name, content: data.content };
        });
        if (Object.keys(scripts).length === 0) {
            await createDefaultScripts();
            return loadUserData();
        }
        
        await window.Notepad.loadNotes();
        
        updateStats();
        renderSidebar();
        loadScript('opening');
        closeAuthModal();
        document.getElementById('saveStatus').innerHTML = '<i class="fas fa-check"></i> Synced';
    } catch (error) {
        console.error('Data Load Error:', error);
        handleError(error, 'Loading Data');
    }
}

function subscribeToChanges() {
    if (!currentUser) return;
    if (appointmentsUnsubscribe) appointmentsUnsubscribe();
    if (tasksUnsubscribe) tasksUnsubscribe();

    appointmentsUnsubscribe = db.collection('users').doc(currentUser.uid).collection('appointments').orderBy('createdAt', 'desc').onSnapshot(snap => {
        appointments = {};
        snap.forEach(doc => {
            const appt = doc.data();
            if (!appointments[appt.date]) { appointments[appt.date] = { count: 0, note: '', reports: [] }; }
            appointments[appt.date].reports.push({ ...appt, id: doc.id });
            appointments[appt.date].count = appointments[appt.date].reports.length;
        });
        updateStats();
        refreshCurrentView();
    });

    tasksUnsubscribe = db.collection('users').doc(currentUser.uid).collection('tasks').orderBy('createdAt', 'desc').onSnapshot(snap => {
        tasks = [];
        snap.forEach(doc => { tasks.push({ ...doc.data(), id: doc.id }); });
        updateTaskStats();
        refreshCurrentView();
    });
}

async function createDefaultScripts() {
    if (!currentUser) return;
    const defaultScripts = {
        "opening": {
            name: "🎯 Opening Script",
            content: "\"Hey, is this [Company Name]?\"\n\n\"Awesome — this is Flynn. We created a free, modern preview version inspired by your current site. There's no cost or obligation. Would you be open to taking a quick look later today and sharing your thoughts?\""
        },
        "owner_yes": { name: "👑 Owner - Yes", content: "Perfect! Daniel will call you shortly to showcase your preview concept. Is this the best number to connect with you?" },
        "owner_no": { name: "🤤 Not Owner", content: "No worries! Who usually drives your design or advertising decisions? What is the best coordinate to reach them today?" }
    };
    const batch = db.batch();
    const scriptsRef = db.collection('users').doc(currentUser.uid).collection('scripts');
    for (const [id, script] of Object.entries(defaultScripts)) {
        batch.set(scriptsRef.doc(id), { name: script.name, content: script.content, version: 1, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }
    await batch.commit();
}

// Appointment Handlers
function addAppointment(dateStr, business, contactName, role, phone, time, notes, assigned, editId = null, status = 'Pending', crmLink = '', tags = []) {
    if (!currentUser) { showToast('Please sign in first', 'error'); return; }
    if (!appointments[dateStr]) appointments[dateStr] = { count: 0, note: '', reports: [] };
    if (!STATUS_OPTIONS.includes(status)) { status = 'Pending'; }
    const newAppt = {
        id: editId || generateUniqueId(),
        business, contactName, role: role || 'Owner', phone: phone || '',
        time: time || '', notes: notes || '', assigned: assigned || 'Daniel',
        status: status, crmLink: crmLink || '', tags: tags || [],
        date: dateStr, createdAt: new Date().toISOString(),
        fullText: `Business: ${business}\nContact: ${contactName}\nPhone: ${phone}\nStatus: ${status}\nNotes: ${notes}`
    };
    syncAppointment(newAppt);
    return newAppt.fullText;
}

async function syncAppointment(appointment) {
    if (!currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).collection('appointments').doc(appointment.id.toString()).set(appointment, { merge: true });
    } catch (e) {
        console.error('Error syncing appointment:', e);
    }
}

function deleteAppointment(dateStr, id, skipRemote = false) {
    if (appointments[dateStr]?.reports) {
        appointments[dateStr].reports = appointments[dateStr].reports.filter(r => r.id !== id);
        if (appointments[dateStr].reports.length === 0) delete appointments[dateStr];
        if (!skipRemote) {
            db.collection('users').doc(currentUser.uid).collection('appointments').doc(id.toString()).delete();
        }
        updateStats();
        return true;
    }
    return false;
}

// Metrics Tracking
function getTodayCount() { return appointments[getTodayStr()]?.reports?.length || 0; }

function getWeekCount() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    let total = 0;
    for (let d in appointments) {
        const date = new Date(d);
        if (date >= start && appointments[d].reports) {
            total += appointments[d].reports.length;
        }
    }
    return total;
}

function getMonthCount() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    let total = 0;
    for (let d in appointments) {
        const date = new Date(d);
        if (date >= start && appointments[d].reports) {
            total += appointments[d].reports.length;
        }
    }
    return total;
}

function getAverageScore() {
    let total = 0, count = 0;
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(appt => {
                total += calculateLeadScore(appt);
                count++;
            });
        }
    }
    return count > 0 ? Math.round(total / count) : 0;
}

function updateStats() {
    const todayElem = document.getElementById('statToday');
    if (todayElem) todayElem.innerText = getTodayCount();
    const weekElem = document.getElementById('statWeek');
    if (weekElem) weekElem.innerText = getWeekCount();
    const monthElem = document.getElementById('statMonth');
    if (monthElem) monthElem.innerText = getMonthCount();
    const avgScoreElem = document.getElementById('avgScore');
    if (avgScoreElem) avgScoreElem.innerText = getAverageScore();
    updateTaskStats();
}

// Tasks System
function addTask(description, dueDate, priority = 'medium', appointmentId = null) {
    if (!currentUser) return;
    const task = {
        id: generateUniqueId(), description, dueDate, priority,
        appointmentId, completed: false, createdAt: new Date().toISOString()
    };
    db.collection('users').doc(currentUser.uid).collection('tasks').doc(task.id).set(task);
}

function toggleTaskComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        db.collection('users').doc(currentUser.uid).collection('tasks').doc(id).update({ completed: task.completed });
    }
}

function updateTaskStats() {
    const pending = tasks.filter(t => !t.completed).length;
    const pendingTasksElem = document.getElementById('pendingTasks');
    if (pendingTasksElem) pendingTasksElem.innerText = pending;
}

// Script Switching Management
function loadScript(id) {
    if (!scripts[id] || isEditing) return;
    currentScriptId = id;
    document.getElementById('currentScriptName').innerHTML = scripts[id].name;
    document.getElementById('scriptContent').innerHTML = `<div class="script-display">${escapeHtml(scripts[id].content).replace(/\n/g, '<br>')}</div>`;
    renderSidebar();
}

function getOrderedVisible() {
    return Object.keys(scripts);
}

function getKeyMapping() {
    const vis = getOrderedVisible();
    const map = new Map();
    vis.slice(0, 9).forEach((id, i) => map.set((i + 1).toString(), id));
    return map;
}

function renderSidebar() {
    const container = document.getElementById('scriptListContainer');
    if (!container) return;
    const visible = getOrderedVisible();
    let html = '';
    visible.forEach((id, idx) => {
        const s = scripts[id];
        const active = currentScriptId === id;
        html += `
            <div class="script-item ${active ? 'active' : ''}" data-id="${id}">
                <span class="script-name">${escapeHtml(s.name)}</span>
                <span class="key-hint">${idx < 9 ? idx + 1 : ''}</span>
            </div>
        `;
    });
    container.innerHTML = html;
    
    container.querySelectorAll('.script-item').forEach(el => {
        el.addEventListener('click', () => {
            loadScript(el.getAttribute('data-id'));
        });
    });
}

// Workspace Management Panel
function showFeaturePanel(featureType, title) {
    const scriptPanel = document.getElementById('scriptPanel');
    const featurePanel = document.getElementById('featurePanel');
    const featureTitle = document.getElementById('featurePanelTitle');
    const featureBody = document.getElementById('featurePanelBody');
    
    if (!scriptPanel || !featurePanel) return;
    
    currentView = featureType;
    featureTitle.innerHTML = `<i class="fas ${featureType === 'notepad' ? 'fa-sticky-note' : 'fa-globe'}"></i> ${title}`;
    
    scriptPanel.style.display = 'none';
    featurePanel.style.display = 'block';
    
    if (featureType === 'notepad') {
        window.Notepad.init();
    } else if (featureType === 'smartworkspace') {
        renderSmartWorkspace(featureBody);
    } else if (featureType === 'calendar') {
        renderCalendarPanel(featureBody);
    } else if (featureType === 'tasks') {
        renderTasksPanel(featureBody);
    } else if (featureType === 'analytics') {
        renderAnalyticsHub(featureBody);
    }
}

function hideFeaturePanel() {
    document.getElementById('featurePanel').style.display = 'none';
    document.getElementById('scriptPanel').style.display = 'block';
}

function refreshCurrentView() {
    const body = document.getElementById('featurePanelBody');
    if (!body) return;
    if (currentView === 'calendar') renderCalendarPanel(body);
    else if (currentView === 'tasks') renderTasksPanel(body);
    else if (currentView === 'smartworkspace') renderSmartWorkspace(body);
    else if (currentView === 'analytics') renderAnalyticsHub(body);
    else if (currentView === 'notepad') window.Notepad.render(body);
}

// Dynamic Interactive Calendar Panel
function renderCalendarPanel(container) {
    if (!container) return;
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let daysHtml = '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(d => daysHtml += `<div class="day-name">${d}</div>`);
    
    for (let i = 0; i < firstDay; i++) { daysHtml += `<div class="calendar-day empty"></div>`; }
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const appts = appointments[dateStr]?.reports || [];
        const count = appts.length;
        const isSelected = dateStr === selectedCalDate;
        
        let indicatorHtml = '';
        if (count > 0) {
            const dots = appts.slice(0, 3).map(a => {
                let color = 'var(--primary)';
                const s = getStatus(a);
                if (s === 'Hot Transfer') color = '#dc2626';
                else if (s === 'Completed') color = 'var(--success)';
                else if (s === 'Warm Callback') color = 'var(--warning)';
                else if (s === 'Pending') color = 'var(--text-muted)';
                return `<span class="appt-dot" style="background:${color};"></span>`;
            }).join('');
            indicatorHtml = `<div class="appt-indicator">${dots}</div>`;
        }
        
        daysHtml += `
            <div class="calendar-day ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
                <span class="day-number">${d}</span>
                ${indicatorHtml}
            </div>
        `;
    }

    const selectedAppts = appointments[selectedCalDate]?.reports || [];
    
    // Centralized handoff metrics dashboard calculations
    const stats = {
        hotTransfers: selectedAppts.filter(a => getStatus(a) === 'Hot Transfer').length,
        warmCallbacks: selectedAppts.filter(a => getStatus(a) === 'Warm Callback').length,
        completed: selectedAppts.filter(a => getStatus(a) === 'Completed').length,
        pending: selectedAppts.filter(a => getStatus(a) === 'Pending').length,
        canceled: selectedAppts.filter(a => getStatus(a) === 'Canceled').length
    };

    container.innerHTML = `
        <div class="calendar-section">
            <div class="calendar-nav" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3><i class="fas fa-calendar-alt"></i> ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</h3>
                <div class="calendar-nav-actions" style="display:flex; gap:6px;">
                    <button id="calPrevBtn" class="btn-icon">Prev</button>
                    <button id="calTodayBtn" class="btn-icon">Today</button>
                    <button id="calNextBtn" class="btn-icon">Next</button>
                </div>
            </div>
            <div class="calendar-grid" style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; margin-bottom:20px;">
                ${daysHtml}
            </div>
            <div class="kpi-row" style="margin-bottom:16px;">
                <div class="kpi-card"><div class="kpi-value" style="color:#dc2626;">${stats.hotTransfers}</div><div class="kpi-label">🔥 Hot Transfers</div></div>
                <div class="kpi-card"><div class="kpi-value" style="color:var(--warning);">${stats.warmCallbacks}</div><div class="kpi-label">📞 Warm Callbacks</div></div>
                <div class="kpi-card"><div class="kpi-value" style="color:var(--success);">${stats.completed}</div><div class="kpi-label">✅ Completed</div></div>
                <div class="kpi-card"><div class="kpi-value" style="color:var(--text-muted);">${stats.pending}</div><div class="kpi-label">⏳ Pending</div></div>
            </div>
            <div class="appointments-section">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4>Appointments (${selectedAppts.length})</h4>
                    <button id="quickAddCalBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> Add Lead</button>
                </div>
                <div class="appointments-list">
                    ${selectedAppts.map(a => {
                        const score = calculateLeadScore(a);
                        const isHotTransfer = getStatus(a) === 'Hot Transfer';
                        return `
                            <div class="appointment-card" style="border-left: 4px solid ${isHotTransfer ? '#dc2626' : 'var(--border-color)'}; position: relative;">
                                <div class="card-row">
                                    <div class="business-name">
                                        <strong>${escapeHtml(a.business)}</strong>
                                        <span class="status-tag ${getStatusClassSmall(getStatus(a))}">${getStatus(a)}</span>
                                        <span class="score-badge ${getScoreColor(score)}">${score} Pts</span>
                                    </div>
                                    <div class="card-actions">
                                        <button class="delete-appt-btn" data-id="${a.id}"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                <div style="font-size:0.8rem; margin-top:4px;">Contact: ${escapeHtml(a.contactName)} | Phone: ${escapeHtml(a.phone)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    // Hook events
    container.querySelectorAll('.calendar-day[data-date]').forEach(el => {
        el.addEventListener('click', () => {
            selectedCalDate = el.getAttribute('data-date');
            renderCalendarPanel(container);
        });
    });
    
    document.getElementById('calPrevBtn')?.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendarPanel(container);
    });
    
    document.getElementById('calNextBtn')?.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendarPanel(container);
    });
    
    document.getElementById('calTodayBtn')?.addEventListener('click', () => {
        currentCalDate = new Date();
        selectedCalDate = getTodayStr();
        renderCalendarPanel(container);
    });

    document.getElementById('quickAddCalBtn')?.addEventListener('click', () => {
        openQuickReportWithDate(selectedCalDate);
    });

    container.querySelectorAll('.delete-appt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            if (confirm('Delete lead registration?')) {
                deleteAppointment(selectedCalDate, id);
                renderCalendarPanel(container);
            }
        });
    });
}

function openQuickReportWithDate(defaultDate) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card">
            <h3>Add New CRM Entry</h3>
            <div class="form-group"><label>Date</label><input type="date" id="newApptDate" value="${defaultDate}" /></div>
            <div class="form-group"><label>Business Name</label><input type="text" id="newApptBusiness" /></div>
            <div class="form-group"><label>Contact Name</label><input type="text" id="newApptContact" /></div>
            <div class="form-group"><label>Phone Coordinate</label><input type="text" id="newApptPhone" /></div>
            <div class="form-group">
                <label>Lead Handoff Status</label>
                <select id="newApptStatus">
                    ${STATUS_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Notes / Context</label><textarea id="newApptNotes"></textarea></div>
            <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button id="saveNewApptBtn" class="btn-icon" style="background:var(--success); color:white;">Save Entry</button>
                <button id="cancelNewApptBtn" class="btn-icon">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('saveNewApptBtn').addEventListener('click', () => {
        const date = document.getElementById('newApptDate').value;
        const bus = document.getElementById('newApptBusiness').value;
        const contact = document.getElementById('newApptContact').value;
        const phone = document.getElementById('newApptPhone').value;
        const status = document.getElementById('newApptStatus').value;
        const notes = document.getElementById('newApptNotes').value;

        if (!bus || !contact) { showToast('Business and Contact fields required', 'error'); return; }

        addAppointment(date, bus, contact, 'Owner', phone, '', notes, 'Daniel', null, status);
        modal.remove();
        showToast('CRM Registration Added!', 'success');
        refreshCurrentView();
    });

    document.getElementById('cancelNewApptBtn').addEventListener('click', () => modal.remove());
}

// Tasks Board Panel
function renderTasksPanel(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="tasks-section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3>Follow-up Tasks Board</h3>
                <button id="addNewTaskBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> New Task</button>
            </div>
            <div class="tasks-list">
                ${tasks.map(t => `
                    <div class="task-card ${t.completed ? 'task-completed' : ''}" style="padding:12px; margin-bottom:8px; border-radius:8px; background:var(--bg-primary);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600;">${escapeHtml(t.description)}</span>
                            <div style="display:flex; gap:6px;">
                                <button class="toggle-task-btn" data-id="${t.id}"><i class="fas ${t.completed ? 'fa-undo' : 'fa-check'}"></i></button>
                            </div>
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Due: ${t.dueDate || 'N/A'} | Priority: ${t.priority}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('addNewTaskBtn').addEventListener('click', () => {
        const desc = prompt('Enter task details:');
        if (desc) {
            addTask(desc, getTodayStr(), 'medium', null);
            refreshCurrentView();
        }
    });

    container.querySelectorAll('.toggle-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleTaskComplete(btn.getAttribute('data-id'));
            refreshCurrentView();
        });
    });
}

// Centralized Dynamic Funnel Analytics Panel
function renderAnalyticsHub(container) {
    if (!container) return;
    
    // Aggregates complete dynamic conversion metrics
    let total = 0, hTransfers = 0, wCallbacks = 0, completedCount = 0, pendingCount = 0, canceledCount = 0;
    
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(a => {
                total++;
                const status = getStatus(a);
                if (status === 'Hot Transfer') hTransfers++;
                else if (status === 'Warm Callback') wCallbacks++;
                else if (status === 'Completed') completedCount++;
                else if (status === 'Pending') pendingCount++;
                else if (status === 'Canceled') canceledCount++;
            });
        }
    }

    container.innerHTML = `
        <div class="analytics-container" style="display:flex; flex-direction:column; gap:20px;">
            <h3>Lead Conversion Dynamics</h3>
            <div class="report-metrics" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
                <div class="metric-card" style="background:var(--bg-primary); padding:16px; border-radius:12px; text-align:center;">
                    <div class="metric-value" style="font-size:1.8rem; font-weight:700;">${total}</div>
                    <div class="metric-label" style="font-size:0.75rem; color:var(--text-muted);">Total Pipeline</div>
                </div>
                <div class="metric-card" style="background:var(--bg-primary); padding:16px; border-radius:12px; text-align:center;">
                    <div class="metric-value" style="font-size:1.8rem; font-weight:700; color:#dc2626;">${hTransfers}</div>
                    <div class="metric-label" style="font-size:0.75rem; color:var(--text-muted);">Hot Transfers</div>
                </div>
                <div class="metric-card" style="background:var(--bg-primary); padding:16px; border-radius:12px; text-align:center;">
                    <div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--warning);">${wCallbacks}</div>
                    <div class="metric-label" style="font-size:0.75rem; color:var(--text-muted);">Warm Callbacks</div>
                </div>
                <div class="metric-card" style="background:var(--bg-primary); padding:16px; border-radius:12px; text-align:center;">
                    <div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--success);">${completedCount}</div>
                    <div class="metric-label" style="font-size:0.75rem; color:var(--text-muted);">Completed</div>
                </div>
            </div>
            
            <div class="feature-card" style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:16px; border-radius:12px;">
                <h4>Lead Qualification Performance</h4>
                <div style="display:flex; flex-direction:column; gap:8px; margin-top:12px;">
                    <div>Hot Transfers (${hTransfers})</div>
                    <div style="background:var(--bg-primary); height:8px; border-radius:4px;"><div style="background:#dc2626; width:${total > 0 ? (hTransfers/total)*100 : 0}%; height:100%; border-radius:4px;"></div></div>
                    
                    <div>Warm Callbacks (${wCallbacks})</div>
                    <div style="background:var(--bg-primary); height:8px; border-radius:4px;"><div style="background:var(--warning); width:${total > 0 ? (wCallbacks/total)*100 : 0}%; height:100%; border-radius:4px;"></div></div>
                    
                    <div>Completed Registrations (${completedCount})</div>
                    <div style="background:var(--bg-primary); height:8px; border-radius:4px;"><div style="background:var(--success); width:${total > 0 ? (completedCount/total)*100 : 0}%; height:100%; border-radius:4px;"></div></div>
                </div>
            </div>
        </div>
    `;
}

// Integrated Dynamic Workspace Engine
function renderSmartWorkspace(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="workspace-container" style="display:flex; flex-direction:column; gap:16px; height:100%; min-height:450px;">
            <div style="display:flex; gap:10px; align-items:center; background:var(--bg-secondary); padding:12px; border-radius:12px; border:1px solid var(--border-color);">
                <input type="text" id="wsInputUrl" value="https://sales.regen-digital.com/campaigns" style="flex:1; padding:8px 12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:0.85rem;" />
                <button id="wsNavigateBtn" class="btn-icon" style="background:var(--primary); color:white;">Go</button>
            </div>
            <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--border-color); position:relative; overflow:hidden; min-height:300px;">
                <iframe id="wsIframe" src="https://sales.regen-digital.com/campaigns" style="width:100%; height:100%; border:none;"></iframe>
            </div>
        </div>
    `;

    document.getElementById('wsNavigateBtn').addEventListener('click', () => {
        const url = document.getElementById('wsInputUrl').value;
        const iframe = document.getElementById('wsIframe');
        if (iframe && url) {
            iframe.src = url;
        }
    });
}

// Global Core Initialization
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            updateSidebarProfile(currentUser);
            await loadUserData();
            initializeApp();
        } else {
            showAuthModal();
        }
    });
});

function initializeApp() {
    // Left Sidebar Navigation Interactivity
    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', () => {
            const tool = item.getAttribute('data-tool');
            if (tool === 'notepad') {
                showFeaturePanel('notepad', '📝 Notes Workspace');
            } else if (tool === 'calendar') {
                showFeaturePanel('calendar', '📅 Appointment & Handoff Calendar');
            } else if (tool === 'tasks') {
                showFeaturePanel('tasks', '📋 Follow-up Tasks Manager');
            } else if (tool === 'smartworkspace') {
                showFeaturePanel('smartworkspace', '🚀 CRM Workspace');
            } else if (tool === 'analytics') {
                showFeaturePanel('analytics', '📊 Pipeline Performance');
            } else if (tool === 'theme') {
                document.body.classList.toggle('dark');
            } else if (tool === 'help') {
                showToast('Handoffs (Warm callback, Completed, Canceled, Pending, Hot transfers) integrated globally!', 'info');
            } else if (tool === 'reset') {
                if (confirm('Clear local database configuration?')) {
                    localStorage.clear();
                    location.reload();
                }
            }
        });
    });

    document.getElementById('closeFeaturePanelBtn')?.addEventListener('click', () => {
        hideFeaturePanel();
    });

    document.getElementById('quickReportBtn')?.addEventListener('click', () => {
        openQuickReportWithDate(getTodayStr());
    });
}