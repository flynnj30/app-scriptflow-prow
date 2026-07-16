// ================================================================
// SCRIPTFLOW PRO - COMPLETE CENTRALIZED APPLICATION
// ================================================================

// Firebase Configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase initialized successfully');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

const db = firebase.firestore();
const auth = firebase.auth();

try {
    db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED, merge: true });
    db.enablePersistence({ synchronizeTabs: true }).catch(err => {
        if (err.code !== 'failed-precondition' && err.code !== 'unavailable') {
            console.warn('Firebase persistence error:', err);
        }
    });
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
        console.warn('Auth persistence error:', err);
    });
} catch (err) {
    console.warn('Firebase setup:', err);
}

// Global State
let currentUser = null;
let appointments = {};
let scripts = {};
let currentScriptId = "opening";
let currentCalDate = new Date();
let selectedCalDate = getTodayStr();
let tasks = [];
let currentView = 'calendar';

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

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateUniqueId() {
    return Date.now().toString() + '_' + Math.random().toString(36).substring(2, 11);
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

// Centralized Lead Scoring with support for handoffs
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

// ============================================================
// APPOINTMENT MANAGEMENT
// ============================================================
function addAppointment(dateStr, business, contactName, phone, status = 'Pending', notes = '') {
    if (!currentUser) { showToast('Please sign in first', 'error'); return; }
    if (!STATUS_OPTIONS.includes(status)) { status = 'Pending'; }
    
    const newAppt = {
        id: generateUniqueId(),
        business,
        contactName,
        phone: phone || '',
        status,
        notes: notes || '',
        date: dateStr,
        createdAt: new Date().toISOString()
    };
    
    syncAppointment(newAppt);
    return newAppt;
}

async function syncAppointment(appointment) {
    if (!currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).collection('appointments').doc(appointment.id.toString()).set(appointment, { merge: true });
    } catch (e) {
        console.error('Error syncing appointment:', e);
    }
}

function deleteAppointment(dateStr, id) {
    if (appointments[dateStr]?.reports) {
        appointments[dateStr].reports = appointments[dateStr].reports.filter(r => r.id !== id);
        if (appointments[dateStr].reports.length === 0) delete appointments[dateStr];
        db.collection('users').doc(currentUser.uid).collection('appointments').doc(id.toString()).delete();
        updateStats();
        return true;
    }
    return false;
}

// ============================================================
// STATISTICS
// ============================================================
function updateStats() {
    const todayCount = appointments[getTodayStr()]?.reports?.length || 0;
    document.getElementById('statToday').innerText = todayCount;
    
    let weekTotal = 0, monthTotal = 0, scoreTotal = 0, scoreCount = 0;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    for (let d in appointments) {
        const date = new Date(d);
        if (appointments[d].reports) {
            if (date >= monthStart) monthTotal += appointments[d].reports.length;
            if (date >= weekStart) weekTotal += appointments[d].reports.length;
            appointments[d].reports.forEach(a => {
                scoreTotal += calculateLeadScore(a);
                scoreCount++;
            });
        }
    }
    
    document.getElementById('statWeek').innerText = weekTotal;
    document.getElementById('statMonth').innerText = monthTotal;
    document.getElementById('avgScore').innerText = scoreCount > 0 ? Math.round(scoreTotal / scoreCount) : 0;
    document.getElementById('pendingTasks').innerText = tasks.filter(t => !t.completed).length;
}

// ============================================================
// CALENDAR PANEL
// ============================================================
function renderCalendarPanel(container) {
    if (!container) return;
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let daysHtml = '';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => daysHtml += `<div class="day-name">${d}</div>`);
    for (let i = 0; i < firstDay; i++) daysHtml += `<div class="calendar-day empty"></div>`;
    
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
    
    // Handoff metrics
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
                    ${selectedAppts.length === 0 ? '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No appointments for this date</p></div>' : 
                    selectedAppts.map(a => {
                        const score = calculateLeadScore(a);
                        return `
                            <div class="appointment-card">
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
                                ${a.notes ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">📝 ${escapeHtml(a.notes)}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    // Event listeners
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
    document.getElementById('quickAddCalBtn')?.addEventListener('click', () => openQuickReportWithDate(selectedCalDate));
    
    container.querySelectorAll('.delete-appt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this lead registration?')) {
                deleteAppointment(selectedCalDate, btn.getAttribute('data-id'));
                renderCalendarPanel(container);
            }
        });
    });
}

// ============================================================
// QUICK REPORT MODAL
// ============================================================
function openQuickReportWithDate(defaultDate) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'quickReportModal';
    modal.innerHTML = `
        <div class="modal-card" style="max-width:500px;">
            <h3><i class="fas fa-plus-circle"></i> Add New CRM Entry</h3>
            <div class="form-group"><label>Date</label><input type="date" id="newApptDate" value="${defaultDate}" /></div>
            <div class="form-group"><label>Business Name *</label><input type="text" id="newApptBusiness" placeholder="Company name" /></div>
            <div class="form-group"><label>Contact Name *</label><input type="text" id="newApptContact" placeholder="Full name" /></div>
            <div class="form-group"><label>Phone Coordinate</label><input type="text" id="newApptPhone" placeholder="+1 (555) 000-0000" /></div>
            <div class="form-group">
                <label>Lead Handoff Status</label>
                <select id="newApptStatus">
                    ${STATUS_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Notes / Context</label><textarea id="newApptNotes" rows="3" placeholder="Additional details..."></textarea></div>
            <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:16px;">
                <button id="saveNewApptBtn" class="btn-icon" style="background:var(--success); color:white;">💾 Save Entry</button>
                <button id="cancelNewApptBtn" class="btn-icon">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('saveNewApptBtn').addEventListener('click', () => {
        const date = document.getElementById('newApptDate').value;
        const bus = document.getElementById('newApptBusiness').value.trim();
        const contact = document.getElementById('newApptContact').value.trim();
        const phone = document.getElementById('newApptPhone').value.trim();
        const status = document.getElementById('newApptStatus').value;
        const notes = document.getElementById('newApptNotes').value.trim();

        if (!bus || !contact) { showToast('Business and Contact fields are required', 'error'); return; }
        if (!date) { showToast('Please select a date', 'error'); return; }

        addAppointment(date, bus, contact, phone, status, notes);
        modal.remove();
        showToast('✅ CRM Registration Added Successfully!', 'success');
        refreshCurrentView();
    });

    document.getElementById('cancelNewApptBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ============================================================
// TASKS PANEL
// ============================================================
function renderTasksPanel(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="tasks-section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3><i class="fas fa-tasks"></i> Follow-up Tasks Board</h3>
                <button id="addNewTaskBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> New Task</button>
            </div>
            <div class="tasks-list">
                ${tasks.length === 0 ? '<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>No tasks yet</p></div>' : 
                tasks.map(t => `
                    <div class="task-card ${t.completed ? 'task-completed' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600;">${escapeHtml(t.description)}</span>
                            <button class="toggle-task-btn btn-icon" data-id="${t.id}"><i class="fas ${t.completed ? 'fa-undo' : 'fa-check'}"></i></button>
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Due: ${t.dueDate || 'N/A'} | Priority: ${t.priority || 'medium'}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('addNewTaskBtn')?.addEventListener('click', () => {
        const desc = prompt('Enter task description:');
        if (desc && desc.trim()) {
            addTask(desc.trim(), getTodayStr(), 'medium');
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

function addTask(description, dueDate, priority = 'medium') {
    if (!currentUser) return;
    const task = {
        id: generateUniqueId(),
        description,
        dueDate,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
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

// ============================================================
// ANALYTICS HUB
// ============================================================
function renderAnalyticsHub(container) {
    if (!container) return;
    
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
        <div class="analytics-container">
            <h3><i class="fas fa-chart-pie"></i> Lead Conversion Dynamics</h3>
            <div class="report-metrics">
                <div class="metric-card">
                    <div class="metric-value">${total}</div>
                    <div class="metric-label">Total Pipeline</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color:#dc2626;">${hTransfers}</div>
                    <div class="metric-label">Hot Transfers</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color:var(--warning);">${wCallbacks}</div>
                    <div class="metric-label">Warm Callbacks</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color:var(--success);">${completedCount}</div>
                    <div class="metric-label">Completed</div>
                </div>
            </div>
            
            <div class="feature-card">
                <h4>📊 Lead Qualification Performance</h4>
                <div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>🔥 Hot Transfers (${hTransfers})</span>
                            <span>${total > 0 ? Math.round((hTransfers/total)*100) : 0}%</span>
                        </div>
                        <div style="background:var(--bg-primary); height:8px; border-radius:4px;">
                            <div style="background:#dc2626; width:${total > 0 ? (hTransfers/total)*100 : 0}%; height:100%; border-radius:4px;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>📞 Warm Callbacks (${wCallbacks})</span>
                            <span>${total > 0 ? Math.round((wCallbacks/total)*100) : 0}%</span>
                        </div>
                        <div style="background:var(--bg-primary); height:8px; border-radius:4px;">
                            <div style="background:var(--warning); width:${total > 0 ? (wCallbacks/total)*100 : 0}%; height:100%; border-radius:4px;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>✅ Completed (${completedCount})</span>
                            <span>${total > 0 ? Math.round((completedCount/total)*100) : 0}%</span>
                        </div>
                        <div style="background:var(--bg-primary); height:8px; border-radius:4px;">
                            <div style="background:var(--success); width:${total > 0 ? (completedCount/total)*100 : 0}%; height:100%; border-radius:4px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// SMART WORKSPACE
// ============================================================
function renderSmartWorkspace(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="workspace-container">
            <div style="display:flex; gap:10px; align-items:center; background:var(--bg-secondary); padding:12px; border-radius:12px; border:1px solid var(--border-color);">
                <input type="text" id="wsInputUrl" value="https://sales.regen-digital.com/campaigns" style="flex:1; padding:8px 12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:0.85rem;" />
                <button id="wsNavigateBtn" class="btn-icon" style="background:var(--primary); color:white;">Go</button>
            </div>
            <div style="flex:1; background:white; border-radius:12px; border:1px solid var(--border-color); position:relative; overflow:hidden; min-height:300px;">
                <iframe id="wsIframe" src="https://sales.regen-digital.com/campaigns" style="width:100%; height:100%; border:none;"></iframe>
            </div>
        </div>
    `;

    document.getElementById('wsNavigateBtn')?.addEventListener('click', () => {
        const url = document.getElementById('wsInputUrl').value;
        const iframe = document.getElementById('wsIframe');
        if (iframe && url) iframe.src = url;
    });
}

// ============================================================
// FEATURE PANEL MANAGEMENT
// ============================================================
function showFeaturePanel(featureType, title) {
    document.getElementById('scriptPanel').style.display = 'none';
    document.getElementById('featurePanel').style.display = 'block';
    document.getElementById('featurePanelTitle').innerHTML = title;
    currentView = featureType;
    
    const body = document.getElementById('featurePanelBody');
    if (featureType === 'calendar') renderCalendarPanel(body);
    else if (featureType === 'tasks') renderTasksPanel(body);
    else if (featureType === 'analytics') renderAnalyticsHub(body);
    else if (featureType === 'smartworkspace') renderSmartWorkspace(body);
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
    else if (currentView === 'smartworkspace') renderSmartWorkspace(body);
}

// ============================================================
// DATA LOADING
// ============================================================
async function loadUserData() {
    if (!currentUser) return;
    try {
        document.getElementById('saveStatus').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        
        // Load appointments in real-time
        db.collection('users').doc(currentUser.uid).collection('appointments').orderBy('createdAt', 'desc').onSnapshot(snap => {
            appointments = {};
            snap.forEach(doc => {
                const appt = doc.data();
                if (!appointments[appt.date]) appointments[appt.date] = { count: 0, reports: [] };
                appointments[appt.date].reports.push({ ...appt, id: doc.id });
                appointments[appt.date].count = appointments[appt.date].reports.length;
            });
            updateStats();
            refreshCurrentView();
        });

        // Load tasks in real-time
        db.collection('users').doc(currentUser.uid).collection('tasks').orderBy('createdAt', 'desc').onSnapshot(snap => {
            tasks = [];
            snap.forEach(doc => { tasks.push({ ...doc.data(), id: doc.id }); });
            updateStats();
        });

        // Load scripts
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
        
        loadScript('opening');
        document.getElementById('saveStatus').innerHTML = '<i class="fas fa-check"></i> Synced';
    } catch (error) {
        console.error('Data Load Error:', error);
        showToast('Error loading data. Please refresh.', 'error');
    }
}

async function createDefaultScripts() {
    if (!currentUser) return;
    const defaultScripts = {
        "opening": {
            name: "🎯 Opening Script",
            content: "\"Hey, is this [Company Name]?\"\n\n\"Awesome — this is Flynn. We created a free, modern preview version inspired by your current site. There's no cost or obligation. Would you be open to taking a quick look later today and sharing your thoughts?\""
        },
        "owner_yes": {
            name: "👑 Owner - Yes",
            content: "Perfect! Daniel will call you shortly to showcase your preview concept. Is this the best number to connect with you?"
        },
        "owner_no": {
            name: "🤝 Not Owner",
            content: "No worries! Who usually drives your design or advertising decisions? What is the best coordinate to reach them today?"
        }
    };
    
    const batch = db.batch();
    const scriptsRef = db.collection('users').doc(currentUser.uid).collection('scripts');
    for (const [id, script] of Object.entries(defaultScripts)) {
        batch.set(scriptsRef.doc(id), { name: script.name, content: script.content });
    }
    await batch.commit();
}

function loadScript(id) {
    if (!scripts[id]) return;
    currentScriptId = id;
    document.getElementById('currentScriptName').innerHTML = scripts[id].name;
    document.getElementById('scriptContent').innerHTML = `<div class="script-display">${escapeHtml(scripts[id].content).replace(/\n/g, '<br>')}</div>`;
}

// ============================================================
// AUTHENTICATION
// ============================================================
function signOut() {
    currentUser = null;
    appointments = {};
    tasks = [];
    scripts = {};
    updateStats();
    auth.signOut();
    showToast('Signed out successfully', 'info');
    setTimeout(() => location.reload(), 500);
}

function showAuthModal() {
    const existingModal = document.getElementById('authModal');
    if (existingModal) existingModal.remove();
    
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
                <svg style="width:18px; height:18px; margin-right:8px;" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span style="font-weight:500;">Sign in with Google</span>
            </button>
            <div style="text-align:center; margin:12px 0; color:var(--text-muted); font-size:0.8rem;">or continue with email</div>
            <div class="form-group"><label>Email</label><input type="email" id="loginEmailInput" placeholder="you@example.com" /></div>
            <div class="form-group"><label>Password</label><input type="password" id="loginPasswordInput" placeholder="••••••••" /></div>
            <button id="loginBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--primary); color:white;"><i class="fas fa-sign-in-alt"></i> Sign In</button>
            <div style="margin-top:16px; text-align:center; font-size:0.8rem; color:var(--text-muted);">🔒 Secure Cloud Data Integration</div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('googleSignInBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            await auth.signInWithPopup(provider);
        } catch (error) {
            showToast('Sign in failed: ' + error.message, 'error');
        }
    });

    document.getElementById('loginBtn').addEventListener('click', async () => {
        const email = document.getElementById('loginEmailInput').value;
        const password = document.getElementById('loginPasswordInput').value;
        if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            showToast('Login failed: ' + error.message, 'error');
        }
    });
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            document.getElementById('userInfo').style.display = 'block';
            document.getElementById('userEmail').innerText = user.email;
            await loadUserData();
            hideFeaturePanel();
        } else {
            showAuthModal();
        }
    });

    // Sidebar Tools Navigation
    document.addEventListener('click', (e) => {
        const toolItem = e.target.closest('.tool-item');
        if (toolItem) {
            const tool = toolItem.getAttribute('data-tool');
            if (tool === 'calendar') showFeaturePanel('calendar', '📅 Appointment & Handoff Calendar');
            else if (tool === 'tasks') showFeaturePanel('tasks', '📋 Follow-up Tasks Manager');
            else if (tool === 'analytics') showFeaturePanel('analytics', '📊 Pipeline Performance');
            else if (tool === 'smartworkspace') showFeaturePanel('smartworkspace', '🚀 CRM Workspace');
            else if (tool === 'theme') document.body.classList.toggle('dark');
            else if (tool === 'help') showToast('Handoffs (Warm callback, Completed, Canceled, Pending, Hot transfers) integrated globally! 📞', 'info');
            else if (tool === 'reset') { if (confirm('Clear all local data?')) { localStorage.clear(); location.reload(); } }
        }
    });

    // Top Bar Buttons
    document.getElementById('closeFeaturePanelBtn')?.addEventListener('click', hideFeaturePanel);
    document.getElementById('quickReportBtn')?.addEventListener('click', () => openQuickReportWithDate(getTodayStr()));
    document.getElementById('signOutBtn')?.addEventListener('click', signOut);
    document.getElementById('workspaceLauncherBtn')?.addEventListener('click', () => showFeaturePanel('smartworkspace', '🚀 CRM Workspace'));
    
    // Refresh Button
    document.getElementById('refreshBtn')?.addEventListener('click', async () => {
        if (currentUser) {
            document.getElementById('refreshBtn').classList.add('spinning');
            await loadUserData();
            setTimeout(() => document.getElementById('refreshBtn').classList.remove('spinning'), 1000);
            showToast('Data refreshed!', 'success');
        }
    });

    // Tools Menu Toggle
    document.getElementById('toolsHeader')?.addEventListener('click', () => {
        const menu = document.getElementById('toolsMenu');
        const chevron = document.getElementById('toolsChevron');
        menu.classList.toggle('open');
        chevron.classList.toggle('rotated');
    });
});