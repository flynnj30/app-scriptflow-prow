// ================================================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ================================================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized successfully');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

const db = firebase.firestore();
try { db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED, merge: true }); } catch (error) { }
try { db.enablePersistence({ synchronizeTabs: true }).catch(() => {}); } catch (err) { }

const auth = firebase.auth();
try { auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {}); } catch (err) { }

window.db = db;
window.auth = auth;
window.firebase = firebase;

// ================================================================
// SCRIPTFLOW PRO - CORE APPLICATION
// ================================================================

let currentUser = null;
let authModalOpen = false;
let authInProgress = false;
let appointments = {};
let goals = { daily: 3, weekly: 15, monthly: 60 };
let scripts = {};
let scriptOrder = [];
let currentScriptId = "opening";
let isEditing = false;
let tasks = [];
let isRefreshing = false;

let appointmentsUnsubscribe = null;
let tasksUnsubscribe = null;

let currentCalDate = new Date();
let selectedCalDate = getTodayStr();
let currentView = 'calendar';

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
    { id: 'qualified_warm_call', name: 'Qualified Warm Call', colorClass: 'tag-qualified-warm-call-bg' },
    { id: 'unqualified_warm_callback', name: 'Unqualified Warm Callback', colorClass: 'tag-unqualified-warm-callback-bg' },
    { id: 'vip', name: 'VIP', colorClass: 'tag-vip-bg' },
    { id: 'negligent_warm_callback', name: 'Negligent Warm Callback', colorClass: 'tag-negligent-warm-callback-bg' }
];

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
                snap.forEach(doc => { this.notes.push({ id: doc.id, ...doc.data() }); });
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

function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    let message = 'An error occurred. Please try again.';
    showToast(message, 'error');
    return { success: false, message };
}

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

function getScoreColor(score) {
    if (score >= 70) return 'score-hot';
    if (score >= 40) return 'score-warm';
    return 'score-cold';
}

function calculateLeadScore(appt) {
    let score = 0;
    const status = getStatus(appt);
    
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
}

function getTodayStr() {
    const d = new Date();
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
    if (authInProgress) return;
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
        }
    } catch (error) {
        handleError(error, 'Google Sign-In');
    } finally {
        authInProgress = false;
    }
}

async function signIn(email, password) {
    if (authInProgress) return;
    authInProgress = true;
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        if (result.user) {
            currentUser = result.user;
            updateSidebarProfile(currentUser);
            await loadUserData();
            showToast('Welcome back! 👋', 'success');
            closeAuthModal();
        }
    } catch (error) {
        handleError(error, 'Sign In');
    } finally {
        authInProgress = false;
    }
}

async function signUp(email, password, username) {
    if (authInProgress) return;
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
                scriptOrder: ['opening', 'owner_yes', 'owner_no']
            });
            showToast('Account created! 🎉', 'success');
            currentUser = result.user;
            updateSidebarProfile(currentUser);
            await loadUserData();
            closeAuthModal();
        }
    } catch (error) {
        handleError(error, 'Sign Up');
    } finally {
        authInProgress = false;
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
                <i class="fas fa-microphone-alt" style="color:var(--primary);"></i> ScriptFlow Pro
            </h2>
            <button id="googleSignInBtn" class="btn-icon" style="width:100%; justify-content:center; background:#ffffff; color:#333; border:1px solid #dadce0; margin-bottom:16px; padding:10px;">
                <span style="font-weight:500;">Sign in with Google</span>
            </button>
            <div class="auth-divider">or continue with email</div>
            <div id="authFormContainer">
                <div style="display:flex; gap:8px; margin-bottom:20px;">
                    <button id="loginTabBtn" class="view-btn active" style="flex:1; justify-content:center;">Sign In</button>
                    <button id="signupTabBtn" class="view-btn" style="flex:1; justify-content:center;">Sign Up</button>
                </div>
                <div id="loginForm">
                    <div class="form-group"><label>Email</label><input type="email" id="loginEmailInput" /></div>
                    <div class="form-group"><label>Password</label><input type="password" id="loginPasswordInput" /></div>
                    <button id="loginBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--primary); color:white;">Sign In</button>
                </div>
                <div id="signupForm" style="display:none;">
                    <div class="form-group"><label>Username</label><input type="text" id="signupUsernameInput" /></div>
                    <div class="form-group"><label>Email</label><input type="email" id="signupEmailInput" /></div>
                    <div class="form-group"><label>Password</label><input type="password" id="signupPasswordInput" /></div>
                    <button id="signupBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--success); color:white;">Create Account</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('googleSignInBtn').addEventListener('click', (e) => { e.preventDefault(); signInWithGoogle(); });
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
    document.getElementById('loginBtn').addEventListener('click', () => {
        signIn(document.getElementById('loginEmailInput').value, document.getElementById('loginPasswordInput').value);
    });
    document.getElementById('signupBtn').addEventListener('click', () => {
        signUp(document.getElementById('signupEmailInput').value, document.getElementById('signupPasswordInput').value, document.getElementById('signupUsernameInput').value);
    });
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) { modal.remove(); authModalOpen = false; }
}

async function loadUserData() {
    if (!currentUser) return;
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (!userDoc.data()) {
            // User setup
            await db.collection('users').doc(currentUser.uid).set({
                uid: currentUser.uid, email: currentUser.email,
                displayName: currentUser.displayName, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        subscribeToChanges();
        
        const scriptsSnapshot = await db.collection('users').doc(currentUser.uid).collection('scripts').get();
        scripts = {};
        scriptsSnapshot.forEach(doc => { scripts[doc.id] = { name: doc.data().name, content: doc.data().content }; });
        if (Object.keys(scripts).length === 0) await createDefaultScripts();
        
        await window.Notepad.loadNotes();
        updateStats();
        renderSidebar();
        loadScript('opening');
        closeAuthModal();
    } catch (error) {
        handleError(error, 'Loading Data');
    }
}

function subscribeToChanges() {
    if (!currentUser) return;
    if (appointmentsUnsubscribe) appointmentsUnsubscribe();
    if (tasksUnsubscribe) tasksUnsubscribe();

    appointmentsUnsubscribe = db.collection('users').doc(currentUser.uid).collection('appointments').onSnapshot(snap => {
        appointments = {};
        snap.forEach(doc => {
            const appt = doc.data();
            if (!appointments[appt.date]) { appointments[appt.date] = { reports: [] }; }
            appointments[appt.date].reports.push({ ...appt, id: doc.id });
        });
        updateStats();
        refreshCurrentView();
    });

    tasksUnsubscribe = db.collection('users').doc(currentUser.uid).collection('tasks').onSnapshot(snap => {
        tasks = [];
        snap.forEach(doc => { tasks.push({ ...doc.data(), id: doc.id }); });
        updateStats();
        refreshCurrentView();
    });
}

async function createDefaultScripts() {
    const defaults = {
        "opening": { name: "🎯 Opening Script", content: "\"Hey, is this [Company]?\"\n\n\"Awesome — this is Flynn...\"" }
    };
    const batch = db.batch();
    const ref = db.collection('users').doc(currentUser.uid).collection('scripts');
    for (const [id, script] of Object.entries(defaults)) {
        batch.set(ref.doc(id), { name: script.name, content: script.content });
    }
    await batch.commit();
    await loadUserData();
}

function addAppointment(dateStr, business, contactName, phone, notes, status) {
    if (!currentUser) return;
    const newAppt = {
        id: generateUniqueId(),
        business, contactName, phone: phone || '', notes: notes || '',
        status: status || 'Pending', date: dateStr, createdAt: new Date().toISOString()
    };
    db.collection('users').doc(currentUser.uid).collection('appointments').doc(newAppt.id).set(newAppt);
}

function deleteAppointment(dateStr, id) {
    if (appointments[dateStr]?.reports) {
        db.collection('users').doc(currentUser.uid).collection('appointments').doc(id).delete();
    }
}

function addTask(description, dueDate) {
    if (!currentUser) return;
    const task = { id: generateUniqueId(), description, dueDate, completed: false, createdAt: new Date().toISOString() };
    db.collection('users').doc(currentUser.uid).collection('tasks').doc(task.id).set(task);
}

function toggleTaskComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        db.collection('users').doc(currentUser.uid).collection('tasks').doc(id).update({ completed: !task.completed });
    }
}

function updateStats() {
    let todayCount = appointments[getTodayStr()]?.reports?.length || 0;
    let totalScore = 0, totalAppts = 0;
    for (let d in appointments) {
        if (appointments[d].reports) {
            appointments[d].reports.forEach(a => {
                totalScore += calculateLeadScore(a);
                totalAppts++;
            });
        }
    }
    let avg = totalAppts > 0 ? Math.round(totalScore / totalAppts) : 0;
    
    document.getElementById('statToday').innerText = todayCount;
    document.getElementById('avgScore').innerText = avg;
    document.getElementById('pendingTasks').innerText = tasks.filter(t => !t.completed).length;
}

function loadScript(id) {
    if (!scripts[id] || isEditing) return;
    currentScriptId = id;
    document.getElementById('currentScriptName').innerHTML = scripts[id].name;
    document.getElementById('scriptContent').innerHTML = `<div class="script-display">${escapeHtml(scripts[id].content).replace(/\n/g, '<br>')}</div>`;
    renderSidebar();
}

function renderSidebar() {
    const container = document.getElementById('scriptListContainer');
    if (!container) return;
    container.innerHTML = Object.keys(scripts).map((id, idx) => `
        <div class="script-item ${currentScriptId === id ? 'active' : ''}" data-id="${id}">
            <span class="script-name">${escapeHtml(scripts[id].name)}</span>
            <span class="key-hint">${idx < 9 ? idx + 1 : ''}</span>
        </div>
    `).join('');
    
    container.querySelectorAll('.script-item').forEach(el => {
        el.addEventListener('click', () => loadScript(el.getAttribute('data-id')));
    });
}

function showFeaturePanel(featureType, title) {
    const scriptPanel = document.getElementById('scriptPanel');
    const featurePanel = document.getElementById('featurePanel');
    if (!scriptPanel || !featurePanel) return;
    
    currentView = featureType;
    document.getElementById('featurePanelTitle').innerHTML = `<i class="fas fa-layer-group"></i> ${title}`;
    
    scriptPanel.style.display = 'none';
    featurePanel.style.display = 'block';
    
    const body = document.getElementById('featurePanelBody');
    if (featureType === 'notepad') window.Notepad.init();
    else if (featureType === 'calendar') renderCalendarPanel(body);
    else if (featureType === 'tasks') renderTasksPanel(body);
    else if (featureType === 'analytics') renderAnalyticsHub(body);
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
    else if (currentView === 'analytics') renderAnalyticsHub(body);
    else if (currentView === 'notepad') window.Notepad.render(body);
}

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
        const isSelected = dateStr === selectedCalDate;
        
        let indicatorHtml = appts.length > 0 ? `<div class="appt-indicator">${appts.slice(0, 3).map(() => `<span class="appt-dot" style="background:var(--primary);"></span>`).join('')}</div>` : '';
        
        daysHtml += `
            <div class="calendar-day ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
                <span class="day-number">${d}</span>
                ${indicatorHtml}
            </div>
        `;
    }

    const selectedAppts = appointments[selectedCalDate]?.reports || [];
    const stats = {
        hotTransfers: selectedAppts.filter(a => getStatus(a) === 'Hot Transfer').length,
        warmCallbacks: selectedAppts.filter(a => getStatus(a) === 'Warm Callback').length,
        completed: selectedAppts.filter(a => getStatus(a) === 'Completed').length,
        pending: selectedAppts.filter(a => getStatus(a) === 'Pending').length,
    };

    container.innerHTML = `
        <div class="calendar-section">
            <div class="calendar-nav">
                <h3><i class="fas fa-calendar-alt"></i> ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</h3>
                <div class="calendar-nav-actions">
                    <button id="calPrevBtn">Prev</button>
                    <button id="calTodayBtn">Today</button>
                    <button id="calNextBtn">Next</button>
                </div>
            </div>
            <div class="calendar-grid">${daysHtml}</div>
            <div class="kpi-row">
                <div class="kpi-card"><div class="kpi-value" style="color:#dc2626;">${stats.hotTransfers}</div><div class="kpi-label">🔥 Hot Transfers</div></div>
                <div class="kpi-card"><div class="kpi-value" style="color:var(--warning);">${stats.warmCallbacks}</div><div class="kpi-label">📞 Warm Callbacks</div></div>
                <div class="kpi-card"><div class="kpi-value" style="color:var(--success);">${stats.completed}</div><div class="kpi-label">✅ Completed</div></div>
                <div class="kpi-card"><div class="kpi-value" style="color:var(--text-muted);">${stats.pending}</div><div class="kpi-label">⏳ Pending</div></div>
            </div>
            <div class="appointments-section">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>Appointments (${selectedAppts.length})</h4>
                    <button id="quickAddCalBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> Add Lead</button>
                </div>
                <div class="appointments-list">
                    ${selectedAppts.map(a => `
                        <div class="appointment-card">
                            <div class="card-row">
                                <div class="business-name">
                                    <strong>${escapeHtml(a.business)}</strong>
                                    <span class="status-tag ${getStatusClassSmall(getStatus(a))}">${getStatus(a)}</span>
                                </div>
                                <div class="card-actions">
                                    <button class="delete-appt-btn" data-id="${a.id}"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            <div style="font-size:0.8rem;">Contact: ${escapeHtml(a.contactName)} | Phone: ${escapeHtml(a.phone)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('.calendar-day[data-date]').forEach(el => {
        el.addEventListener('click', () => { selectedCalDate = el.getAttribute('data-date'); renderCalendarPanel(container); });
    });
    document.getElementById('calPrevBtn')?.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() - 1); renderCalendarPanel(container); });
    document.getElementById('calNextBtn')?.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() + 1); renderCalendarPanel(container); });
    document.getElementById('calTodayBtn')?.addEventListener('click', () => { currentCalDate = new Date(); selectedCalDate = getTodayStr(); renderCalendarPanel(container); });
    document.getElementById('quickAddCalBtn')?.addEventListener('click', () => openQuickReportWithDate(selectedCalDate));
    container.querySelectorAll('.delete-appt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete lead?')) deleteAppointment(selectedCalDate, btn.getAttribute('data-id'));
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
        if (!bus) return showToast('Business required', 'error');
        addAppointment(date, bus, document.getElementById('newApptContact').value, document.getElementById('newApptPhone').value, document.getElementById('newApptNotes').value, document.getElementById('newApptStatus').value);
        modal.remove();
        showToast('Added!', 'success');
    });
    document.getElementById('cancelNewApptBtn').addEventListener('click', () => modal.remove());
}

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
                    <div class="task-card ${t.completed ? 'task-completed' : ''}">
                        <div style="display:flex; justify-content:space-between;">
                            <span style="font-weight:600;">${escapeHtml(t.description)}</span>
                            <button class="toggle-task-btn" data-id="${t.id}"><i class="fas ${t.completed ? 'fa-undo' : 'fa-check'}"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.getElementById('addNewTaskBtn').addEventListener('click', () => {
        const desc = prompt('Enter task details:');
        if (desc) addTask(desc, getTodayStr());
    });
    container.querySelectorAll('.toggle-task-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleTaskComplete(btn.getAttribute('data-id')));
    });
}

function renderAnalyticsHub(container) {
    if (!container) return;
    let total = 0, hTransfers = 0, wCallbacks = 0, completedCount = 0;
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(a => {
                total++;
                const status = getStatus(a);
                if (status === 'Hot Transfer') hTransfers++;
                else if (status === 'Warm Callback') wCallbacks++;
                else if (status === 'Completed') completedCount++;
            });
        }
    }
    container.innerHTML = `
        <div class="analytics-container">
            <h3>Lead Conversion Dynamics</h3>
            <div class="report-metrics">
                <div class="metric-card"><div class="metric-value">${total}</div><div class="metric-label">Total Pipeline</div></div>
                <div class="metric-card"><div class="metric-value" style="color:#dc2626;">${hTransfers}</div><div class="metric-label">Hot Transfers</div></div>
                <div class="metric-card"><div class="metric-value" style="color:var(--warning);">${wCallbacks}</div><div class="metric-label">Warm Callbacks</div></div>
                <div class="metric-card"><div class="metric-value" style="color:var(--success);">${completedCount}</div><div class="metric-label">Completed</div></div>
            </div>
        </div>
    `;
}

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
    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', () => {
            const tool = item.getAttribute('data-tool');
            if (tool === 'notepad') showFeaturePanel('notepad', '📝 Notes');
            else if (tool === 'calendar') showFeaturePanel('calendar', '📅 Appointment Calendar');
            else if (tool === 'tasks') showFeaturePanel('tasks', '📋 Tasks Manager');
            else if (tool === 'analytics') showFeaturePanel('analytics', '📊 Pipeline Performance');
            else if (tool === 'theme') document.body.classList.toggle('dark');
            else if (tool === 'help') showToast('Handoffs (Warm callback, Completed, Canceled, Pending, Hot transfers) active!', 'info');
            else if (tool === 'reset' && confirm('Clear database?')) { localStorage.clear(); location.reload(); }
        });
    });

    document.getElementById('closeFeaturePanelBtn')?.addEventListener('click', hideFeaturePanel);
    document.getElementById('quickReportBtn')?.addEventListener('click', () => openQuickReportWithDate(getTodayStr()));
    document.getElementById('signOutBtn')?.addEventListener('click', () => auth.signOut());
    document.getElementById('refreshBtn')?.addEventListener('click', () => loadUserData());
}