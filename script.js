// ================================================================
// SCRIPTFLOW PRO - COMPLETE APPLICATION
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
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
}

const db = firebase.firestore();
const auth = firebase.auth();

try {
    db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED, merge: true });
    db.enablePersistence({ synchronizeTabs: true }).catch(err => {});
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {});
} catch (err) {}

// ============================================================
// GLOBAL STATE
// ============================================================
let currentUser = null;
let appointments = {};
let scripts = {};
let currentScriptId = "opening";
let isEditing = false;
let currentCalDate = new Date();
let selectedCalDate = getTodayStr();
let tasks = [];
let currentView = 'calendar';
let selectedAppointments = new Set();

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
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = `toast ${type === 'error' ? 'error' : (type === 'info' ? 'info' : '')}`;
    t.innerHTML = `${type === 'success' ? '✓' : (type === 'error' ? '⚠️' : 'ℹ️')} ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function getStatus(appt) {
    return appt?.status || 'Pending';
}

function getStatusClassSmall(status) {
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

function formatDateShort(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(/-/g, '/'));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================
// APPOINTMENT MANAGEMENT
// ============================================================
function addAppointment(dateStr, business, contactName, phone, time, notes, status = 'Pending', crmLink = '', tags = []) {
    if (!currentUser) { showToast('Please sign in first', 'error'); return; }
    if (!STATUS_OPTIONS.includes(status)) status = 'Pending';
    
    const newAppt = {
        id: generateUniqueId(),
        business,
        contactName,
        phone: phone || '',
        time: time || '',
        notes: notes || '',
        status,
        crmLink: crmLink || '',
        tags: tags || [],
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

function updateAppointmentStatus(dateStr, id, newStatus) {
    if (appointments[dateStr]?.reports) {
        const appt = appointments[dateStr].reports.find(r => r.id === id);
        if (appt) {
            appt.status = newStatus;
            syncAppointment(appt);
            updateStats();
            return true;
        }
    }
    return false;
}

// ============================================================
// TASK MANAGEMENT
// ============================================================
function addTask(description, dueDate, priority = 'medium', appointmentId = null) {
    if (!currentUser) return;
    const task = {
        id: generateUniqueId(),
        description,
        dueDate,
        priority,
        appointmentId,
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

function deleteTask(id) {
    db.collection('users').doc(currentUser.uid).collection('tasks').doc(id).delete();
}

// ============================================================
// STATISTICS
// ============================================================
function getTodayCount() {
    return appointments[getTodayStr()]?.reports?.length || 0;
}

function getWeekCount() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    let total = 0;
    for (let d in appointments) {
        if (new Date(d) >= start && appointments[d].reports) {
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
        if (new Date(d) >= start && appointments[d].reports) {
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
    document.getElementById('statToday').innerText = getTodayCount();
    document.getElementById('statWeek').innerText = getWeekCount();
    document.getElementById('statMonth').innerText = getMonthCount();
    document.getElementById('avgScore').innerText = getAverageScore();
    document.getElementById('pendingTasks').innerText = tasks.filter(t => !t.completed).length;
}

// ============================================================
// SCRIPT MANAGEMENT
// ============================================================
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
    const visible = Object.keys(scripts);
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
        el.addEventListener('click', () => loadScript(el.getAttribute('data-id')));
    });
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
        const isSelected = dateStr === selectedCalDate;
        let indicatorHtml = '';
        if (appts.length > 0) {
            const dots = appts.slice(0, 3).map(a => {
                let color = 'var(--primary)';
                const s = getStatus(a);
                if (s === 'Hot Transfer') color = '#dc2626';
                else if (s === 'Completed') color = 'var(--success)';
                else if (s === 'Warm Callback') color = 'var(--warning)';
                else if (s === 'Pending') color = 'var(--text-muted)';
                else if (s === 'Canceled') color = 'var(--danger)';
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
    
    const stats = {
        hotTransfers: selectedAppts.filter(a => getStatus(a) === 'Hot Transfer').length,
        warmCallbacks: selectedAppts.filter(a => getStatus(a) === 'Warm Callback').length,
        completed: selectedAppts.filter(a => getStatus(a) === 'Completed').length,
        pending: selectedAppts.filter(a => getStatus(a) === 'Pending').length,
        canceled: selectedAppts.filter(a => getStatus(a) === 'Canceled').length
    };

    container.innerHTML = `
        <div class="calendar-section">
            <div class="calendar-nav">
                <h3><i class="fas fa-calendar-alt"></i> ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</h3>
                <div class="calendar-nav-actions">
                    <button id="calPrevBtn" class="btn-icon"><i class="fas fa-chevron-left"></i> Prev</button>
                    <button id="calTodayBtn" class="btn-icon">Today</button>
                    <button id="calNextBtn" class="btn-icon">Next <i class="fas fa-chevron-right"></i></button>
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
                    ${selectedAppts.length === 0 ? '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No appointments for this date</p></div>' : 
                    selectedAppts.map(a => {
                        const score = calculateLeadScore(a);
                        return `
                            <div class="appointment-card">
                                <div class="card-row">
                                    <div class="business-name">
                                        <input type="checkbox" class="bulk-checkbox" data-id="${a.id}" style="margin-right:8px;" />
                                        <strong>${escapeHtml(a.business)}</strong>
                                        <span class="status-tag ${getStatusClassSmall(getStatus(a))}">${getStatus(a)}</span>
                                        <span class="score-badge ${getScoreColor(score)}">${score} Pts ${getScoreLabel(score)}</span>
                                    </div>
                                    <div class="card-actions">
                                        <select class="status-change-select" data-id="${a.id}" data-date="${selectedCalDate}" style="font-size:0.7rem; padding:4px 8px; border-radius:8px;">
                                            ${STATUS_OPTIONS.map(s => `<option value="${s}" ${getStatus(a) === s ? 'selected' : ''}>${s}</option>`).join('')}
                                        </select>
                                        <button class="delete-appt-btn" data-id="${a.id}" title="Delete"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                <div style="font-size:0.8rem; margin-top:4px;">👤 ${escapeHtml(a.contactName)} ${a.phone ? '| 📞 ' + escapeHtml(a.phone) : ''} ${a.time ? '| 🕐 ' + a.time : ''}</div>
                                ${a.notes ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">📝 ${escapeHtml(a.notes)}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    attachCalendarEvents(container);
}

function attachCalendarEvents(container) {
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
                showToast('Appointment deleted', 'info');
            }
        });
    });

    container.querySelectorAll('.status-change-select').forEach(select => {
        select.addEventListener('change', (e) => {
            e.stopPropagation();
            const id = select.getAttribute('data-id');
            const date = select.getAttribute('data-date');
            const newStatus = select.value;
            updateAppointmentStatus(date, id, newStatus);
            showToast(`Status changed to ${newStatus}`, 'success');
        });
    });

    container.querySelectorAll('.bulk-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            const id = cb.getAttribute('data-id');
            if (cb.checked) {
                selectedAppointments.add(id);
            } else {
                selectedAppointments.delete(id);
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
            <div class="form-group"><label>Date *</label><input type="date" id="newApptDate" value="${defaultDate}" /></div>
            <div class="form-group"><label>Business Name *</label><input type="text" id="newApptBusiness" placeholder="Company name" /></div>
            <div class="form-group"><label>Contact Name *</label><input type="text" id="newApptContact" placeholder="Full name" /></div>
            <div class="form-group"><label>Phone</label><input type="text" id="newApptPhone" placeholder="+1 (555) 000-0000" /></div>
            <div class="form-group"><label>Time</label><input type="time" id="newApptTime" /></div>
            <div class="form-group">
                <label>Lead Handoff Status</label>
                <select id="newApptStatus">
                    ${STATUS_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Notes</label><textarea id="newApptNotes" rows="3" placeholder="Additional details..."></textarea></div>
            <div style="display:flex; gap:12px; justify-content:flex-end;">
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
        const time = document.getElementById('newApptTime').value;
        const status = document.getElementById('newApptStatus').value;
        const notes = document.getElementById('newApptNotes').value.trim();

        if (!bus || !contact) { showToast('Business and Contact fields are required', 'error'); return; }
        if (!date) { showToast('Please select a date', 'error'); return; }

        addAppointment(date, bus, contact, phone, time, notes, status);
        modal.remove();
        showToast('✅ CRM Registration Added!', 'success');
        refreshCurrentView();
    });

    document.getElementById('cancelNewApptBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ============================================================
// NOTES PANEL
// ============================================================
let notes = [];
let currentNoteId = null;

function loadNotes() {
    notes = JSON.parse(localStorage.getItem('sf_local_notes') || '[]');
    if (notes.length > 0 && !currentNoteId) currentNoteId = notes[0].id;
}

function saveNote(id, title, content) {
    const updatedNote = { title: title || 'Untitled Note', content: content || '', updatedAt: new Date().toISOString() };
    const idx = notes.findIndex(n => n.id === id);
    if (idx !== -1) {
        notes[idx] = { ...notes[idx], ...updatedNote };
    } else {
        updatedNote.id = id;
        updatedNote.createdAt = new Date().toISOString();
        notes.unshift(updatedNote);
    }
    localStorage.setItem('sf_local_notes', JSON.stringify(notes));
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).collection('notes').doc(id).set(updatedNote, { merge: true }).catch(() => {});
    }
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('sf_local_notes', JSON.stringify(notes));
    if (currentNoteId === id) currentNoteId = notes.length > 0 ? notes[0].id : null;
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).collection('notes').doc(id).delete().catch(() => {});
    }
}

function renderNotesPanel(container) {
    if (!container) return;
    loadNotes();
    const currentNote = notes.find(n => n.id === currentNoteId) || { id: '', title: '', content: '' };
    
    container.innerHTML = `
        <div class="notepad-wrapper">
            <div class="notepad-sidebar">
                <button id="npNewNoteBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--primary); color:white; margin-bottom:10px;"><i class="fas fa-plus"></i> New Note</button>
                <div id="npNotesList" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                    ${notes.map(n => `
                        <div class="np-note-item ${n.id === currentNoteId ? 'active' : ''}" data-id="${n.id}" style="background:${n.id === currentNoteId ? 'var(--primary)' : 'var(--bg-primary)'}; color:${n.id === currentNoteId ? 'white' : 'var(--text-primary)'};">
                            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:120px;">${escapeHtml(n.title)}</span>
                            <i class="fas fa-trash np-delete-note-icon" data-id="${n.id}" style="font-size:0.7rem; opacity:0.6; cursor:pointer;"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="notepad-editor">
                <input type="text" id="npNoteTitle" placeholder="Note Title" value="${escapeHtml(currentNote.title || '')}" style="font-size:1.2rem; font-weight:700; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); width:100%;" />
                <textarea id="npNoteContent" placeholder="Write your notes here..." style="flex:1; padding:12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-family:inherit; font-size:0.95rem; line-height:1.5; resize:none; min-height:300px;">${escapeHtml(currentNote.content || '')}</textarea>
                <div style="text-align:right; font-size:0.75rem; color:var(--text-muted);">Auto-saved locally</div>
            </div>
        </div>
    `;

    document.getElementById('npNewNoteBtn')?.addEventListener('click', () => {
        const id = 'note_' + generateUniqueId();
        saveNote(id, 'New Note', '');
        currentNoteId = id;
        renderNotesPanel(container);
    });

    container.querySelectorAll('.np-note-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('np-delete-note-icon')) return;
            currentNoteId = item.getAttribute('data-id');
            renderNotesPanel(container);
        });
    });

    container.querySelectorAll('.np-delete-note-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this note permanently?')) {
                deleteNote(icon.getAttribute('data-id'));
                renderNotesPanel(container);
                showToast('Note deleted', 'info');
            }
        });
    });

    let saveTimeout;
    const autoSave = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (currentNoteId) {
                saveNote(currentNoteId, document.getElementById('npNoteTitle').value, document.getElementById('npNoteContent').value);
            }
        }, 500);
    };

    document.getElementById('npNoteTitle')?.addEventListener('input', autoSave);
    document.getElementById('npNoteContent')?.addEventListener('input', autoSave);
}

// ============================================================
// TASKS PANEL
// ============================================================
function renderTasksPanel(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="tasks-section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3><i class="fas fa-tasks"></i> Follow-up Tasks (${tasks.filter(t => !t.completed).length} pending)</h3>
                <button id="addNewTaskBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> New Task</button>
            </div>
            <div class="tasks-list">
                ${tasks.length === 0 ? '<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>No tasks yet. Create your first task!</p></div>' : 
                tasks.map(t => `
                    <div class="task-card ${t.completed ? 'task-completed' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600;">${escapeHtml(t.description)}</span>
                            <div style="display:flex; gap:6px;">
                                <button class="toggle-task-btn btn-icon" data-id="${t.id}" style="padding:4px 8px;">
                                    <i class="fas ${t.completed ? 'fa-undo' : 'fa-check'}"></i>
                                </button>
                                <button class="delete-task-btn btn-icon" data-id="${t.id}" style="padding:4px 8px;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                            Due: ${t.dueDate || 'N/A'} | Priority: <span style="color:${t.priority === 'high' ? 'var(--danger)' : t.priority === 'medium' ? 'var(--warning)' : 'var(--success)'};">${t.priority}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('addNewTaskBtn')?.addEventListener('click', () => {
        const desc = prompt('Enter task description:');
        if (desc && desc.trim()) {
            const dueDate = prompt('Due date (YYYY-MM-DD):', getTodayStr());
            const priority = prompt('Priority (high/medium/low):', 'medium');
            addTask(desc.trim(), dueDate || getTodayStr(), priority || 'medium');
            refreshCurrentView();
            showToast('Task added!', 'success');
        }
    });

    container.querySelectorAll('.toggle-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleTaskComplete(btn.getAttribute('data-id'));
            refreshCurrentView();
        });
    });

    container.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this task?')) {
                deleteTask(btn.getAttribute('data-id'));
                refreshCurrentView();
                showToast('Task deleted', 'info');
            }
        });
    });
}

// ============================================================
// ANALYTICS HUB
// ============================================================
function renderAnalyticsHub(container) {
    if (!container) return;
    
    let total = 0, hTransfers = 0, wCallbacks = 0, completedCount = 0, pendingCount = 0, canceledCount = 0;
    let scoreTotal = 0, scoreCount = 0;
    
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
                scoreTotal += calculateLeadScore(a);
                scoreCount++;
            });
        }
    }

    const avgScore = scoreCount > 0 ? Math.round(scoreTotal / scoreCount) : 0;
    const conversionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    container.innerHTML = `
        <div class="analytics-container">
            <h3><i class="fas fa-chart-pie"></i> Lead Conversion Dynamics</h3>
            <div class="report-metrics">
                <div class="metric-card"><div class="metric-value">${total}</div><div class="metric-label">Total Pipeline</div></div>
                <div class="metric-card"><div class="metric-value" style="color:#dc2626;">${hTransfers}</div><div class="metric-label">🔥 Hot Transfers</div></div>
                <div class="metric-card"><div class="metric-value" style="color:var(--warning);">${wCallbacks}</div><div class="metric-label">📞 Warm Callbacks</div></div>
                <div class="metric-card"><div class="metric-value" style="color:var(--success);">${completedCount}</div><div class="metric-label">✅ Completed</div></div>
                <div class="metric-card"><div class="metric-value">${pendingCount}</div><div class="metric-label">⏳ Pending</div></div>
                <div class="metric-card"><div class="metric-value" style="color:var(--danger);">${canceledCount}</div><div class="metric-label">❌ Canceled</div></div>
                <div class="metric-card"><div class="metric-value" style="color:var(--secondary);">${avgScore}</div><div class="metric-label">⭐ Avg Score</div></div>
                <div class="metric-card"><div class="metric-value" style="color:var(--success);">${conversionRate}%</div><div class="metric-label">📈 Conversion Rate</div></div>
            </div>
            
            <div class="feature-card">
                <h4>📊 Pipeline Performance</h4>
                <div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">
                    ${[
                        { label: '🔥 Hot Transfers', value: hTransfers, color: '#dc2626' },
                        { label: '📞 Warm Callbacks', value: wCallbacks, color: '#f59e0b' },
                        { label: '✅ Completed', value: completedCount, color: '#10b981' },
                        { label: '⏳ Pending', value: pendingCount, color: '#94a3b8' },
                        { label: '❌ Canceled', value: canceledCount, color: '#ef4444' }
                    ].map(item => `
                        <div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span>${item.label} (${item.value})</span>
                                <span>${total > 0 ? Math.round((item.value/total)*100) : 0}%</span>
                            </div>
                            <div style="background:var(--bg-primary); height:8px; border-radius:4px;">
                                <div style="background:${item.color}; width:${total > 0 ? (item.value/total)*100 : 0}%; height:100%; border-radius:4px; transition: width 0.5s ease;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Render chart if Chart.js is available
    if (typeof Chart !== 'undefined' && total > 0) {
        setTimeout(() => {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'feature-card';
            chartContainer.innerHTML = '<h4>📈 Status Distribution</h4><canvas id="statusChart" style="max-height:300px;"></canvas>';
            container.appendChild(chartContainer);
            
            const ctx = document.getElementById('statusChart')?.getContext('2d');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled'],
                        datasets: [{
                            data: [hTransfers, wCallbacks, completedCount, pendingCount, canceledCount],
                            backgroundColor: ['#dc2626', '#f59e0b', '#10b981', '#94a3b8', '#ef4444']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }
        }, 100);
    }
}

// ============================================================
// BULK ACTIONS
// ============================================================
function showBulkActionsModal() {
    const modal = document.getElementById('bulkActionsModal');
    const container = document.getElementById('bulkSelectionContainer');
    
    let html = '<p style="font-size:0.8rem; color:var(--text-muted);">Selected appointments will be affected.</p>';
    const selectedAppts = [];
    
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(a => {
                if (selectedAppointments.has(a.id)) {
                    selectedAppts.push(a);
                    html += `
                        <div class="bulk-item">
                            <input type="checkbox" checked disabled />
                            <span>${escapeHtml(a.business)} - ${getStatus(a)}</span>
                        </div>
                    `;
                }
            });
        }
    }
    
    if (selectedAppts.length === 0) {
        html = '<p style="text-align:center; padding:20px; color:var(--text-muted);">No appointments selected. Use checkboxes in calendar view.</p>';
    }
    
    container.innerHTML = html;
    modal.style.display = 'flex';
    
    document.getElementById('bulkActionSelect').addEventListener('change', function() {
        document.getElementById('bulkActionOptions').style.display = this.value === 'status' ? 'block' : 'none';
    });
    
    document.getElementById('executeBulkActionBtn').onclick = () => {
        const action = document.getElementById('bulkActionSelect').value;
        if (action === 'status') {
            const newStatus = document.getElementById('bulkStatusSelect').value;
            selectedAppts.forEach(a => updateAppointmentStatus(a.date, a.id, newStatus));
            showToast(`Updated ${selectedAppts.length} appointments to ${newStatus}`, 'success');
        } else if (action === 'delete') {
            if (confirm(`Delete ${selectedAppts.length} appointments?`)) {
                selectedAppts.forEach(a => deleteAppointment(a.date, a.id));
                showToast(`Deleted ${selectedAppts.length} appointments`, 'info');
            }
        }
        selectedAppointments.clear();
        modal.style.display = 'none';
        refreshCurrentView();
    };
    
    document.getElementById('closeBulkModalBtn').onclick = () => {
        modal.style.display = 'none';
    };
}

// ============================================================
// CSV EXPORT
// ============================================================
function exportToCSV() {
    let csv = 'Date,Business,Contact,Phone,Time,Status,Notes,Score\n';
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(a => {
                csv += `"${date}","${a.business}","${a.contactName}","${a.phone}","${a.time}","${getStatus(a)}","${a.notes}",${calculateLeadScore(a)}\n`;
            });
        }
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_export_${getTodayStr()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully!', 'success');
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
    else if (featureType === 'notepad') renderNotesPanel(body);
}

function hideFeaturePanel() {
    document.getElementById('featurePanel').style.display = 'none';
    document.getElementById('scriptPanel').style.display = 'block';
}

function refreshCurrentView() {
    const body = document.getElementById('featurePanelBody');
    if (!body || document.getElementById('featurePanel').style.display === 'none') return;
    if (currentView === 'calendar') renderCalendarPanel(body);
    else if (currentView === 'tasks') renderTasksPanel(body);
    else if (currentView === 'analytics') renderAnalyticsHub(body);
    else if (currentView === 'notepad') renderNotesPanel(body);
}

// ============================================================
// DATA LOADING
// ============================================================
async function loadUserData() {
    if (!currentUser) return;
    try {
        document.getElementById('saveStatus').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        
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

        db.collection('users').doc(currentUser.uid).collection('tasks').orderBy('createdAt', 'desc').onSnapshot(snap => {
            tasks = [];
            snap.forEach(doc => { tasks.push({ ...doc.data(), id: doc.id }); });
            updateStats();
        });

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
        renderSidebar();
        document.getElementById('saveStatus').innerHTML = '<i class="fas fa-check"></i> Synced';
    } catch (error) {
        console.error('Data Load Error:', error);
        showToast('Error loading data', 'error');
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
                <i class="fas fa-microphone-alt" style="color:var(--primary);"></i> ScriptFlow Pro
            </h2>
            <p style="text-align:center; color:var(--text-muted); margin-bottom:20px; font-size:0.9rem;">
                Sign in to manage and hand off your leads
            </p>
            <button id="googleSignInBtn" class="btn-icon" style="width:100%; justify-content:center; background:#ffffff; color:#333; border:1px solid #dadce0; margin-bottom:16px; padding:10px;">
                <span style="font-weight:500;">🔵 Sign in with Google</span>
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

    // Tools Menu Toggle
    document.getElementById('toolsHeader')?.addEventListener('click', () => {
        document.getElementById('toolsMenu').classList.toggle('open');
        document.getElementById('toolsChevron').classList.toggle('rotated');
    });

    // Sidebar Toggle
    document.getElementById('menuToggleBtn')?.addEventListener('click', () => {
        document.getElementById('mainSidebar').classList.toggle('closed');
        document.getElementById('mainContent').classList.toggle('expanded');
    });

    // Close Feature Panel
    document.getElementById('closeFeaturePanelBtn')?.addEventListener('click', hideFeaturePanel);

    // Quick Report
    document.getElementById('quickReportBtn')?.addEventListener('click', () => openQuickReportWithDate(getTodayStr()));

    // Bulk Actions
    document.getElementById('bulkActionsBtn')?.addEventListener('click', showBulkActionsModal);

    // Sign Out
    document.getElementById('signOutBtn')?.addEventListener('click', signOut);

    // Refresh
    document.getElementById('refreshBtn')?.addEventListener('click', async () => {
        if (currentUser) {
            document.getElementById('refreshBtn').classList.add('spinning');
            await loadUserData();
            setTimeout(() => document.getElementById('refreshBtn').classList.remove('spinning'), 1000);
            showToast('Data refreshed!', 'success');
        }
    });

    // Edit Script
    document.getElementById('editScriptBtn')?.addEventListener('click', () => {
        if (!currentScriptId || !scripts[currentScriptId]) return;
        isEditing = true;
        document.getElementById('scriptContent').innerHTML = `<textarea class="edit-textarea" id="editTextarea">${escapeHtml(scripts[currentScriptId].content)}</textarea>`;
        document.getElementById('editScriptBtn').style.display = 'none';
        document.getElementById('saveScriptBtn').style.display = 'inline-flex';
        document.getElementById('cancelEditBtn').style.display = 'inline-flex';
    });

    // Save Script
    document.getElementById('saveScriptBtn')?.addEventListener('click', async () => {
        const newContent = document.getElementById('editTextarea').value;
        scripts[currentScriptId].content = newContent;
        await db.collection('users').doc(currentUser.uid).collection('scripts').doc(currentScriptId).update({ content: newContent });
        isEditing = false;
        loadScript(currentScriptId);
        document.getElementById('editScriptBtn').style.display = 'inline-flex';
        document.getElementById('saveScriptBtn').style.display = 'none';
        document.getElementById('cancelEditBtn').style.display = 'none';
        showToast('Script saved!', 'success');
    });

    // Cancel Edit
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
        isEditing = false;
        loadScript(currentScriptId);
        document.getElementById('editScriptBtn').style.display = 'inline-flex';
        document.getElementById('saveScriptBtn').style.display = 'none';
        document.getElementById('cancelEditBtn').style.display = 'none';
    });

    // Copy Script
    document.getElementById('copyScriptBtn')?.addEventListener('click', () => {
        if (scripts[currentScriptId]) {
            navigator.clipboard.writeText(scripts[currentScriptId].content);
            showToast('Script copied to clipboard!', 'success');
        }
    });

    // Tool Items Navigation (delegated)
    document.addEventListener('click', (e) => {
        const toolItem = e.target.closest('.tool-item');
        if (!toolItem) return;
        const tool = toolItem.getAttribute('data-tool');
        
        switch(tool) {
            case 'calendar': showFeaturePanel('calendar', '📅 Appointment & Handoff Calendar'); break;
            case 'tasks': showFeaturePanel('tasks', '📋 Follow-up Tasks Manager'); break;
            case 'analytics': showFeaturePanel('analytics', '📊 Pipeline Performance'); break;
            case 'notepad': showFeaturePanel('notepad', '📝 Notes'); break;
            case 'export': exportToCSV(); break;
            case 'theme': document.body.classList.toggle('dark'); break;
            case 'help': showToast('Handoffs: Warm callback, Completed, Canceled, Pending, Hot transfers integrated! Use calendar for full management.', 'info'); break;
            case 'reset': 
                if (confirm('Clear all local data? This cannot be undone.')) { 
                    localStorage.clear(); 
                    location.reload(); 
                } 
                break;
        }
    });

    // Add Script Button
    document.getElementById('addScriptBtnSide')?.addEventListener('click', () => {
        const name = prompt('Script name:');
        if (name && name.trim()) {
            const id = 'script_' + generateUniqueId();
            scripts[id] = { name: name.trim(), content: 'Enter your script content here...' };
            db.collection('users').doc(currentUser.uid).collection('scripts').doc(id).set({ name: name.trim(), content: 'Enter your script content here...' });
            renderSidebar();
            loadScript(id);
            showToast('Script created!', 'success');
        }
    });

    // CSV Upload
    document.getElementById('csvFileInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            let imported = 0;
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length >= 4) {
                    const date = cols[0]?.replace(/"/g, '').trim() || getTodayStr();
                    const business = cols[1]?.replace(/"/g, '').trim();
                    const contact = cols[2]?.replace(/"/g, '').trim();
                    const phone = cols[3]?.replace(/"/g, '').trim();
                    const time = cols[4]?.replace(/"/g, '').trim() || '';
                    const status = cols[5]?.replace(/"/g, '').trim() || 'Pending';
                    const notes = cols[6]?.replace(/"/g, '').trim() || '';
                    if (business && contact) {
                        addAppointment(date, business, contact, phone, time, notes, status);
                        imported++;
                    }
                }
            }
            showToast(`Imported ${imported} appointments!`, 'success');
            refreshCurrentView();
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
        const key = parseInt(e.key);
        if (key >= 1 && key <= 9) {
            const visible = Object.keys(scripts);
            if (visible[key - 1]) loadScript(visible[key - 1]);
        }
    });
});