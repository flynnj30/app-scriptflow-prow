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
try {
    // Configure settings using the recommended caching mechanism in v9 compat to prevent deprecation warnings
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        merge: true
    });
} catch (error) {}

try {
    // Calling enablePersistence without { synchronizeTabs: true } to prevent deprecation warnings on compat
    db.enablePersistence().catch(err => { console.warn("Persistence Issue:", err); });
} catch (err) {}

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
let appointments = {};
let goals = { daily: 3, weekly: 15, monthly: 60 };
let scripts = {};
let scriptOrder = [];
let currentScriptId = "opening";
let isEditing = false;
let tasks = [];

let currentCalDate = new Date();
let selectedCalDate = getTodayStr();
let currentView = 'calendar';
let draggedScriptId = null;

const STATUS_OPTIONS = [
    'Warm Callback', 'Completed', 'Canceled', 'Pending', 'Hot Transfer',
    'Warm Call Booked', 'Meeting Booked', 'Rescheduled', 'Held'
];

// Standalone Notes Engine integration
window.Notepad = window.Notepad || {
    notes: [], currentNoteId: null, isLoaded: false,
    async init() {
        await this.loadNotes();
        const container = document.getElementById('featurePanelBody');
        if (container && currentView === 'notepad') this.render(container);
    },
    async loadNotes() {
        if (currentUser) {
            try {
                const snap = await db.collection('users').doc(currentUser.uid).collection('notes').orderBy('updatedAt', 'desc').get();
                this.notes = [];
                snap.forEach(doc => { this.notes.push({ id: doc.id, ...doc.data() }); });
            } catch (e) {
                this.notes = JSON.parse(localStorage.getItem('sf_local_notes') || '[]');
            }
        } else {
            this.notes = JSON.parse(localStorage.getItem('sf_local_notes') || '[]');
        }
        if (this.notes.length > 0 && !this.currentNoteId) this.currentNoteId = this.notes[0].id;
        this.isLoaded = true;
    },
    async saveNote(id, title, content) {
        const updatedNote = { title: title || 'Untitled Note', content: content || '', updatedAt: new Date().toISOString() };
        const idx = this.notes.findIndex(n => n.id === id);
        if (idx !== -1) this.notes[idx] = { ...this.notes[idx], ...updatedNote };
        else { updatedNote.id = id; updatedNote.createdAt = new Date().toISOString(); this.notes.unshift(updatedNote); }
        localStorage.setItem('sf_local_notes', JSON.stringify(this.notes));
        if (currentUser) {
            try { await db.collection('users').doc(currentUser.uid).collection('notes').doc(id).set(updatedNote, { merge: true }); } 
            catch (e) { console.error("Cloud note save failed:", e); }
        }
    },
    async deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        localStorage.setItem('sf_local_notes', JSON.stringify(this.notes));
        if (this.currentNoteId === id) this.currentNoteId = this.notes.length > 0 ? this.notes[0].id : null;
        if (currentUser) {
            try { await db.collection('users').doc(currentUser.uid).collection('notes').doc(id).delete(); } 
            catch (e) { console.error("Cloud note deletion failed:", e); }
        }
    },
    render(container) {
        if (!container) return;
        const currentNote = this.notes.find(n => n.id === this.currentNoteId) || { id: '', title: '', content: '' };
        
        container.innerHTML = `
            <div style="display: flex; gap: 20px; height: 100%; min-height: 450px;">
                <div style="width: 200px; border-right: 1px solid var(--border-color); padding-right: 12px; display: flex; flex-direction: column; gap: 8px;">
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
                <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
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
                    const activeSpan = container.querySelector(`.np-note-item[data-id="${this.currentNoteId}"] span`);
                    if (activeSpan) activeSpan.textContent = titleInput.value || 'Untitled Note';
                }
            }, 500);
        };
        titleInput?.addEventListener('input', triggerAutoSave);
        contentInput?.addEventListener('input', triggerAutoSave);
    }
};

function generateUniqueId() { return Date.now().toString() + '_' + Math.random().toString(36).substring(2, 11); }
function getStatus(appt) { return appt && appt.status ? appt.status : 'Pending'; }

function getStatusClassSmall(status) {
    switch (status) {
        case 'Warm Callback': return 'status-warm-callback-sm';
        case 'Completed': return 'status-completed-sm';
        case 'Canceled': return 'status-canceled-sm';
        case 'Hot Transfer': return 'status-hot-transfer-sm';
        default: return 'status-pending-sm';
    }
}

function calculateLeadScore(appt) {
    let score = 0;
    const status = getStatus(appt);
    
    if (status === 'Hot Transfer') score += 50; 
    else if (status === 'Completed') score += 40;
    else if (status === 'Warm Callback') score += 30;
    else if (status === 'Pending') score += 10;

    if (appt.notes && appt.notes.length > 10) score += 5;
    if (appt.phone) score += 5;
    return Math.max(0, Math.min(100, score));
}

function getTodayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function escapeHtml(s) { return s ? String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])) : ''; }
function showToast(msg, type = 'success') {
    const existing = document.querySelectorAll('.toast');
    existing.forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = `toast ${type === 'error' ? 'error' : (type === 'info' ? 'info' : '')}`;
    t.innerHTML = `${type === 'success' ? '✓' : (type === 'error' ? '⚠️' : 'ℹ️')} ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function updateSidebarProfile(user) {
    const container = document.getElementById('userInfo');
    if (!container) return;
    if (!user) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    const email = user.email || user.displayName || 'User';
    container.innerHTML = `
        <div class="user-profile">
            <div class="user-avatar-placeholder">${email.charAt(0).toUpperCase()}</div>
            <span class="user-email">${email}</span>
        </div>`;
}

async function signInWithGoogle() {
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
    } catch (e) { showToast('Sign In Error', 'error'); }
}

async function signIn(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        if (result.user) {
            currentUser = result.user;
            updateSidebarProfile(currentUser);
            await loadUserData();
            showToast('Welcome back! 👋', 'success');
            closeAuthModal();
        }
    } catch (e) { showToast('Sign In Failed', 'error'); }
}

async function signUp(email, password, username) {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        if (result.user) {
            await result.user.updateProfile({ displayName: username });
            await db.collection('users').doc(result.user.uid).set({
                uid: result.user.uid, email, username, displayName: username,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                scriptOrder: ['opening', 'owner_yes', 'owner_no']
            });
            showToast('Account created! 🎉', 'success');
            currentUser = result.user;
            updateSidebarProfile(currentUser);
            await loadUserData();
            closeAuthModal();
        }
    } catch (e) { showToast('Sign Up Failed', 'error'); }
}

function showAuthModal() {
    if (authModalOpen) return;
    authModalOpen = true;
    const existing = document.getElementById('authModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'authModal';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 420px;">
            <h2 style="text-align:center; margin-bottom: 20px;"><i class="fas fa-microphone-alt" style="color:var(--primary);"></i> ScriptFlow Pro</h2>
            <button id="googleSignInBtn" class="btn-icon" style="width:100%; justify-content:center; background:#ffffff; color:#333; border:1px solid #dadce0; margin-bottom:16px; padding:10px;">
                <span style="font-weight:500;">Sign in with Google</span>
            </button>
            <div style="text-align:center; font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">or continue with email</div>
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
        </div>`;
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
    document.getElementById('loginBtn').addEventListener('click', () => { signIn(document.getElementById('loginEmailInput').value, document.getElementById('loginPasswordInput').value); });
    document.getElementById('signupBtn').addEventListener('click', () => { signUp(document.getElementById('signupEmailInput').value, document.getElementById('signupPasswordInput').value, document.getElementById('signupUsernameInput').value); });
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
            await db.collection('users').doc(currentUser.uid).set({
                uid: currentUser.uid, email: currentUser.email,
                displayName: currentUser.displayName, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        scriptOrder = userDoc.data()?.scriptOrder || [];
        db.collection('users').doc(currentUser.uid).collection('appointments').onSnapshot(snap => {
            appointments = {};
            snap.forEach(doc => {
                const appt = doc.data();
                if (!appointments[appt.date]) appointments[appt.date] = { reports: [] };
                appointments[appt.date].reports.push({ ...appt, id: doc.id });
            });
            updateStats();
            refreshCurrentView();
        });

        db.collection('users').doc(currentUser.uid).collection('tasks').onSnapshot(snap => {
            tasks = [];
            snap.forEach(doc => tasks.push({ ...doc.data(), id: doc.id }));
            updateStats();
            refreshCurrentView();
        });
        
        const scriptsSnapshot = await db.collection('users').doc(currentUser.uid).collection('scripts').get();
        scripts = {};
        scriptsSnapshot.forEach(doc => { scripts[doc.id] = { name: doc.data().name, content: doc.data().content }; });
        
        if (Object.keys(scripts).length === 0) await createDefaultScripts();
        else {
            // Guarantee all scripts exist in order array
            const currentKeys = Object.keys(scripts);
            const verifiedOrder = scriptOrder.filter(id => currentKeys.includes(id));
            currentKeys.forEach(id => { if (!verifiedOrder.includes(id)) verifiedOrder.push(id); });
            scriptOrder = verifiedOrder;
        }

        await window.Notepad.loadNotes();
        updateStats();
        renderSidebar();
        loadScript(scriptOrder[0] || 'opening');
        closeAuthModal();
    } catch (e) { console.error('Data Load Error:', e); }
}

async function createDefaultScripts() {
    const defaults = {
        "opening": { name: "🎯 Opening Script", content: "\"Hey, is this [Company]?\"\n\n\"Awesome — this is Flynn...\"" },
        "owner_yes": { name: "👑 Owner - Yes", content: "Perfect! Daniel will call you shortly to showcase your preview concept. Is this the best number to connect with you?" },
        "owner_no": { name: "🤤 Not Owner", content: "No worries! Who usually drives your design or advertising decisions? What is the best coordinate to reach them today?" }
    };
    const batch = db.batch();
    const ref = db.collection('users').doc(currentUser.uid).collection('scripts');
    for (const [id, script] of Object.entries(defaults)) {
        batch.set(ref.doc(id), { name: script.name, content: script.content });
    }
    scriptOrder = Object.keys(defaults);
    await db.collection('users').doc(currentUser.uid).update({ scriptOrder });
    await batch.commit();
    await loadUserData();
}

function addAppointment(dateStr, business, contactName, phone, notes, status, editId = null) {
    if (!currentUser) return;
    const newAppt = {
        id: editId || generateUniqueId(),
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
    container.innerHTML = scriptOrder.map((id, idx) => {
        const script = scripts[id];
        if (!script) return '';
        return `
            <div class="script-item ${currentScriptId === id ? 'active' : ''}" data-id="${id}" draggable="true">
                <i class="fas fa-grip-vertical drag-handle-script"></i>
                <span class="script-name">${escapeHtml(script.name)}</span>
                <span class="key-hint">${idx < 9 ? idx + 1 : ''}</span>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.script-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('drag-handle-script')) return; // ignore clicks on grab handle
            loadScript(el.getAttribute('data-id'));
        });
        
        // Setup Drag & Drop Handlers for Reordering Scripts
        el.addEventListener('dragstart', (e) => {
            draggedScriptId = el.getAttribute('data-id');
            e.dataTransfer.effectAllowed = 'move';
            el.classList.add('dragging');
        });
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            el.classList.add('drag-over-script');
        });
        el.addEventListener('dragleave', () => el.classList.remove('drag-over-script'));
        el.addEventListener('drop', async (e) => {
            e.preventDefault();
            el.classList.remove('drag-over-script');
            const targetId = el.getAttribute('data-id');
            if (draggedScriptId && draggedScriptId !== targetId) {
                const fromIdx = scriptOrder.indexOf(draggedScriptId);
                const toIdx = scriptOrder.indexOf(targetId);
                scriptOrder.splice(fromIdx, 1);
                scriptOrder.splice(toIdx, 0, draggedScriptId);
                renderSidebar();
                await db.collection('users').doc(currentUser.uid).update({ scriptOrder });
            }
        });
        el.addEventListener('dragend', () => el.classList.remove('dragging'));
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

// ------------------------------------------------------------
// SMART IMPORT MODAL LOGIC
// ------------------------------------------------------------
function openSmartImportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card">
            <h3><i class="fas fa-magic" style="color:var(--success);"></i> Smart Import Booking</h3>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">Paste raw lead text below. The AI parser will dynamically categorize the information.</p>
            
            <textarea id="smartRawInput" class="smart-import-area" placeholder="E.g., Client: John Doe\nCompany: Acme Corp\nPhone: 123-456-7890\nDate: 2026-07-20..."></textarea>
            
            <button id="smartParseBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--primary); color:white; margin-bottom:8px;">Extract Details</button>
            
            <div id="smartParsedArea" style="display:none;">
                <div class="smart-parsed-grid">
                    <div class="smart-parsed-item">
                        <label>Business / Company <span style="color:var(--danger)">*</span></label>
                        <input type="text" id="sptBusiness" placeholder="Required" />
                    </div>
                    <div class="smart-parsed-item">
                        <label>Contact Name <span style="color:var(--danger)">*</span></label>
                        <input type="text" id="sptContact" placeholder="Required" />
                    </div>
                    <div class="smart-parsed-item">
                        <label>Phone / Contact</label>
                        <input type="text" id="sptPhone" />
                    </div>
                    <div class="smart-parsed-item">
                        <label>Date (YYYY-MM-DD)</label>
                        <input type="date" id="sptDate" />
                    </div>
                    <div class="smart-parsed-item" style="grid-column: span 2;">
                        <label>Lead Handoff Status</label>
                        <select id="sptStatus">
                            ${STATUS_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                    <div class="smart-parsed-item" style="grid-column: span 2;">
                        <label>Notes / Context</label>
                        <textarea id="sptNotes" style="min-height:80px;"></textarea>
                    </div>
                </div>
                
                <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
                    <button id="smartSaveBtn" class="btn-icon" style="background:var(--success); color:white;" disabled>Save Entry</button>
                    <button id="smartCancelBtn" class="btn-icon">Cancel</button>
                </div>
            </div>
            
            <button id="smartCloseBtn" class="btn-icon" style="margin-top:12px; width:100%; justify-content:center;">Close</button>
        </div>
    `;
    document.body.appendChild(modal);

    const parseBtn = document.getElementById('smartParseBtn');
    const saveBtn = document.getElementById('smartSaveBtn');
    const closeBtn = document.getElementById('smartCloseBtn');
    const cancelBtn = document.getElementById('smartCancelBtn');
    const parsedArea = document.getElementById('smartParsedArea');
    const bInput = document.getElementById('sptBusiness');
    const cInput = document.getElementById('sptContact');
    const pInput = document.getElementById('sptPhone');
    const dInput = document.getElementById('sptDate');
    const nInput = document.getElementById('sptNotes');

    // Intelligent Text Parsing Logic using Regex & Fallbacks
    parseBtn.addEventListener('click', () => {
        const text = document.getElementById('smartRawInput').value;
        const lines = text.split('\n');
        
        let business = '', contact = '', phone = '', date = '', notes = text;
        const rxBiz = /^(?:company|business|org|organization|client|account)[\s:-]+(.+)/i;
        const rxCon = /^(?:name|contact|person|lead|customer|client name)[\s:-]+(.+)/i;
        const rxPhn = /^(?:phone|number|cell|mobile|tel|contact number)[\s:-]+(.+)/i;
        const rxDat = /^(?:date|time|schedule|appointment|booking|when)[\s:-]+(.+)/i;

        lines.forEach(line => {
            const l = line.trim();
            if(rxBiz.test(l)) business = l.match(rxBiz)[1].trim();
            else if(rxCon.test(l)) contact = l.match(rxCon)[1].trim();
            else if(rxPhn.test(l)) phone = l.match(rxPhn)[1].trim();
            else if(rxDat.test(l)) {
                // Attempt to parse date naturally or map it
                date = l.match(rxDat)[1].trim();
                if(date.toLowerCase().includes('tomorrow')) {
                    const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
                    date = tmrw.toISOString().split('T')[0];
                }
                else if(date.toLowerCase().includes('today')) date = getTodayStr();
                else if(Date.parse(date)) date = new Date(date).toISOString().split('T')[0];
            }
        });

        // Fallbacks
        if(!phone) {
            const pMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
            if(pMatch) phone = pMatch[0];
        }

        bInput.value = business;
        cInput.value = contact;
        pInput.value = phone;
        dInput.value = date || getTodayStr(); // default today
        nInput.value = notes;

        parsedArea.style.display = 'block';
        parseBtn.style.display = 'none';
        closeBtn.style.display = 'none';
        validateSmartForm();
    });

    const validateSmartForm = () => {
        const isOk = bInput.value.trim() !== '' && cInput.value.trim() !== '';
        saveBtn.disabled = !isOk;
        bInput.classList.toggle('invalid', bInput.value.trim() === '');
        cInput.classList.toggle('invalid', cInput.value.trim() === '');
    };

    bInput.addEventListener('input', validateSmartForm);
    cInput.addEventListener('input', validateSmartForm);

    saveBtn.addEventListener('click', () => {
        addAppointment(dInput.value, bInput.value, cInput.value, pInput.value, nInput.value, document.getElementById('sptStatus').value);
        modal.remove();
        showToast('Smart Entry Booked!', 'success');
        refreshCurrentView();
    });

    closeBtn.addEventListener('click', () => modal.remove());
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.remove());
}

// ------------------------------------------------------------
// MANUAL/EDIT REPORT MODAL
// ------------------------------------------------------------
function openQuickReportWithDate(defaultDate, existingAppt = null) {
    const isEdit = existingAppt !== null;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card">
            <h3>${isEdit ? 'Edit CRM Entry' : 'Add New CRM Entry'}</h3>
            <div class="form-group"><label>Date</label><input type="date" id="newApptDate" value="${isEdit ? existingAppt.date : defaultDate}" /></div>
            <div class="form-group"><label>Business Name</label><input type="text" id="newApptBusiness" value="${isEdit ? escapeHtml(existingAppt.business) : ''}" /></div>
            <div class="form-group"><label>Contact Name</label><input type="text" id="newApptContact" value="${isEdit ? escapeHtml(existingAppt.contactName) : ''}" /></div>
            <div class="form-group"><label>Phone Coordinate</label><input type="text" id="newApptPhone" value="${isEdit ? escapeHtml(existingAppt.phone) : ''}" /></div>
            <div class="form-group">
                <label>Lead Handoff Status</label>
                <select id="newApptStatus">
                    ${STATUS_OPTIONS.map(s => `<option value="${s}" ${(isEdit && existingAppt.status === s) ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Notes / Context</label><textarea id="newApptNotes">${isEdit ? escapeHtml(existingAppt.notes) : ''}</textarea></div>
            <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button id="saveNewApptBtn" class="btn-icon" style="background:var(--success); color:white;">${isEdit ? 'Save Changes' : 'Save Entry'}</button>
                <button id="cancelNewApptBtn" class="btn-icon">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('saveNewApptBtn').addEventListener('click', () => {
        const date = document.getElementById('newApptDate').value;
        const bus = document.getElementById('newApptBusiness').value;
        if (!bus) return showToast('Business required', 'error');
        addAppointment(date, bus, document.getElementById('newApptContact').value, document.getElementById('newApptPhone').value, document.getElementById('newApptNotes').value, document.getElementById('newApptStatus').value, isEdit ? existingAppt.id : null);
        modal.remove();
        showToast(isEdit ? 'Changes Saved!' : 'Added!', 'success');
        refreshCurrentView();
    });
    document.getElementById('cancelNewApptBtn').addEventListener('click', () => modal.remove());
}

// ------------------------------------------------------------
// CALENDAR & APPOINTMENT CARDS
// ------------------------------------------------------------
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
            <div class="calendar-grid" id="calendarGrid">${daysHtml}</div>
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
                <div class="appointments-list" id="appointmentsList">
                    ${selectedAppts.map(a => `
                        <div class="appointment-card" draggable="true" data-id="${a.id}">
                            <div class="card-row">
                                <div class="business-name">
                                    <strong>${escapeHtml(a.business)}</strong>
                                    <span class="status-tag ${getStatusClassSmall(getStatus(a))}">${getStatus(a)}</span>
                                </div>
                                <div class="card-actions">
                                    <button class="edit-btn" data-id="${a.id}" title="Edit"><i class="fas fa-edit"></i></button>
                                    <button class="copy-btn" data-id="${a.id}" title="Copy Detail"><i class="fas fa-copy"></i></button>
                                    <button class="delete-btn" data-id="${a.id}" title="Delete"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            <div style="font-size:0.8rem;">Contact: ${escapeHtml(a.contactName)} | Phone: ${escapeHtml(a.phone)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Calendar Navigation & Clicking
    container.querySelectorAll('.calendar-day[data-date]').forEach(el => {
        el.addEventListener('click', () => { selectedCalDate = el.getAttribute('data-date'); renderCalendarPanel(container); });
        
        // Setup Calendar Drop Zones for Appointments
        el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
        el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
        el.addEventListener('drop', e => {
            el.classList.remove('drag-over');
            const apptId = e.dataTransfer.getData('text/plain');
            const targetDate = el.getAttribute('data-date');
            
            // Locate appointment across all current local states to change its date
            let apptData = null;
            for (const d in appointments) {
                const found = appointments[d].reports.find(a => a.id === apptId);
                if (found) { apptData = found; break; }
            }
            if (apptData && apptData.date !== targetDate) {
                db.collection('users').doc(currentUser.uid).collection('appointments').doc(apptId).update({ date: targetDate });
                showToast(`Rescheduled to ${targetDate}`, 'success');
            }
        });
    });

    document.getElementById('calPrevBtn')?.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() - 1); renderCalendarPanel(container); });
    document.getElementById('calNextBtn')?.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() + 1); renderCalendarPanel(container); });
    document.getElementById('calTodayBtn')?.addEventListener('click', () => { currentCalDate = new Date(); selectedCalDate = getTodayStr(); renderCalendarPanel(container); });
    document.getElementById('quickAddCalBtn')?.addEventListener('click', () => openQuickReportWithDate(selectedCalDate));
    
    // Appointments Actions List logic
    container.querySelectorAll('.appointment-card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
            e.dataTransfer.effectAllowed = 'move';
            card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Permanently delete this entry?')) deleteAppointment(selectedCalDate, btn.getAttribute('data-id'));
        });
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const apptData = appointments[selectedCalDate].reports.find(a => a.id === id);
            if (apptData) openQuickReportWithDate(selectedCalDate, apptData);
        });
    });

    container.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const apptData = appointments[selectedCalDate].reports.find(a => a.id === id);
            if (apptData) {
                const text = `Business: ${apptData.business}\nContact: ${apptData.contactName}\nPhone: ${apptData.phone}\nStatus: ${apptData.status}\nNotes: ${apptData.notes}`;
                navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!')).catch(() => showToast('Failed to copy', 'error'));
            }
        });
    });
}

// ------------------------------------------------------------
// TASKS & ANALYTICS
// ------------------------------------------------------------
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
            <div class="feature-card">
                <h4>Pipeline Progress</h4>
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

// ------------------------------------------------------------
// INITIALIZATION
// ------------------------------------------------------------
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
            else if (tool === 'help') showToast('System functionality updated correctly!', 'info');
            else if (tool === 'reset' && confirm('Clear database locally?')) { localStorage.clear(); location.reload(); }
        });
    });

    document.getElementById('closeFeaturePanelBtn')?.addEventListener('click', hideFeaturePanel);
    document.getElementById('quickReportBtn')?.addEventListener('click', () => openQuickReportWithDate(getTodayStr()));
    document.getElementById('smartImportBtn')?.addEventListener('click', openSmartImportModal);
    document.getElementById('signOutBtn')?.addEventListener('click', () => auth.signOut());
    document.getElementById('refreshBtn')?.addEventListener('click', () => loadUserData());
}
