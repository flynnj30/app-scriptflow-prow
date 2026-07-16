// ================================================================
// SCRIPTFLOW PRO - COMPLETE APPLICATION LOGIC
// ================================================================

// Global State
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
let notes = [];
let currentNoteId = null;
let shownReminders = new Set();
let scriptOrder = [];

const STATUS_OPTIONS = [
    'Warm Callback', 'Completed', 'Canceled', 'Pending',
    'Hot Transfer', 'Warm Call Booked', 'Meeting Booked',
    'Rescheduled', 'Held'
];

// ========== UTILITY FUNCTIONS ==========
function getTodayStr() { 
    const d = new Date(); 
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; 
}

function generateUniqueId() { 
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9); 
}

function escapeHtml(s) { 
    return s ? String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])) : ''; 
}

function showToast(msg, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = `toast ${type === 'error' ? 'error' : (type === 'info' ? 'info' : (type === 'warning' ? 'warning' : ''))}`;
    t.innerHTML = `${type === 'success' ? '✓' : (type === 'error' ? '⚠️' : 'ℹ️')} ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function getStatus(a) { return a?.status || 'Pending'; }

function getStatusClassSmall(s) {
    const m = {
        'Warm Callback': 'status-warm-callback-sm', 'Completed': 'status-completed-sm',
        'Canceled': 'status-canceled-sm', 'Pending': 'status-pending-sm',
        'Hot Transfer': 'status-hot-transfer-sm', 'Warm Call Booked': 'status-warm-call-booked-sm',
        'Meeting Booked': 'status-meeting-booked-sm', 'Rescheduled': 'status-rescheduled-sm',
        'Held': 'status-held-sm'
    };
    return m[s] || 'status-pending-sm';
}

function getScoreColor(s) { return s >= 70 ? 'score-hot' : (s >= 40 ? 'score-warm' : 'score-cold'); }
function getScoreLabel(s) { return s >= 70 ? '🔥 Hot' : (s >= 40 ? 'Warm' : '❄️ Cold'); }

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

// ========== APPOINTMENT MANAGEMENT ==========
function addAppointment(dateStr, business, contactName, phone, time, notes, status = 'Pending', crmLink = '', tags = []) {
    if (!currentUser) { showToast('Please sign in first', 'error'); return null; }
    if (!STATUS_OPTIONS.includes(status)) status = 'Pending';
    
    // Check if db is available
    if (typeof db === 'undefined') {
        showToast('Database not initialized. Please reload the page.', 'error');
        return null;
    }
    
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
    if (!currentUser || typeof db === 'undefined') return;
    try {
        await db.collection('users').doc(currentUser.uid).collection('appointments')
            .doc(appointment.id.toString()).set(appointment, { merge: true });
    } catch (e) { 
        console.error('Error syncing appointment:', e);
        showToast('Error saving appointment. Please try again.', 'error');
    }
}

function deleteAppointment(dateStr, id) {
    if (appointments[dateStr]?.reports) {
        appointments[dateStr].reports = appointments[dateStr].reports.filter(r => r.id !== id);
        if (appointments[dateStr].reports.length === 0) delete appointments[dateStr];
        if (currentUser && typeof db !== 'undefined') {
            db.collection('users').doc(currentUser.uid).collection('appointments')
                .doc(id.toString()).delete().catch(e => console.error('Delete error:', e));
        }
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
            if (newStatus === 'Warm Callback' && appt.tags) {
                appt.tags = appt.tags.filter(t => t !== 'qualified_warm_call' && t !== 'unqualified_warm_callback');
            }
            syncAppointment(appt);
            updateStats();
            return true;
        }
    }
    return false;
}

function updateAppointment(appt) {
    syncAppointment(appt);
}

function findAppointmentById(id) {
    for (let date in appointments) {
        if (appointments[date].reports) {
            const found = appointments[date].reports.find(a => a.id === id);
            if (found) return found;
        }
    }
    return null;
}

function moveAppointmentToDate(apptId, newDate) {
    const appt = findAppointmentById(apptId);
    if (appt && appt.date !== newDate) {
        deleteAppointment(appt.date, apptId);
        appt.date = newDate;
        syncAppointment(appt);
        showToast(`Appointment moved to ${newDate}`, 'success');
    }
}

function copyAppointment(appt) {
    const newAppt = {
        ...appt,
        id: generateUniqueId(),
        createdAt: new Date().toISOString()
    };
    syncAppointment(newAppt);
    showToast('📋 Appointment copied!', 'success');
    refreshCurrentView();
}

// ========== TASK MANAGEMENT ==========
function addTask(desc, dueDate, priority = 'medium', appointmentId = null) {
    if (!currentUser || typeof db === 'undefined') return;
    const task = { 
        id: generateUniqueId(), 
        description: desc, 
        dueDate, 
        priority, 
        appointmentId, 
        completed: false, 
        createdAt: new Date().toISOString() 
    };
    db.collection('users').doc(currentUser.uid).collection('tasks')
        .doc(task.id).set(task).catch(e => console.error('Task save error:', e));
}

function toggleTaskComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task && typeof db !== 'undefined') { 
        task.completed = !task.completed; 
        db.collection('users').doc(currentUser.uid).collection('tasks')
            .doc(id).update({ completed: task.completed }).catch(e => console.error('Task update error:', e));
    }
}

function deleteTask(id) { 
    if (typeof db !== 'undefined') {
        db.collection('users').doc(currentUser.uid).collection('tasks')
            .doc(id).delete().catch(e => console.error('Task delete error:', e)); 
    }
}

// ========== STATISTICS ==========
function getTodayCount() { return appointments[getTodayStr()]?.reports?.length || 0; }

function getWeekCount() {
    const now = new Date(); 
    const start = new Date(now); 
    start.setDate(now.getDate() - now.getDay());
    let total = 0;
    for (let d in appointments) { 
        if (new Date(d) >= start && appointments[d].reports) 
            total += appointments[d].reports.length; 
    }
    return total;
}

function getMonthCount() {
    const now = new Date(); 
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    let total = 0;
    for (let d in appointments) { 
        if (new Date(d) >= start && appointments[d].reports) 
            total += appointments[d].reports.length; 
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
    const weekElem = document.getElementById('statWeek');
    const monthElem = document.getElementById('statMonth');
    const avgElem = document.getElementById('avgScore');
    const taskElem = document.getElementById('pendingTasks');
    
    if (todayElem) todayElem.innerText = getTodayCount();
    if (weekElem) weekElem.innerText = getWeekCount();
    if (monthElem) monthElem.innerText = getMonthCount();
    if (avgElem) avgElem.innerText = getAverageScore();
    if (taskElem) taskElem.innerText = tasks.filter(t => !t.completed).length;
}

// ========== SMART IMPORT PARSER ==========
function smartParseBooking(text) {
    const result = {
        business: '',
        contactName: '',
        phone: '',
        date: getTodayStr(),
        time: '',
        status: 'Pending',
        notes: ''
    };

    // Business name patterns
    const businessPatterns = [
        /(?:business|company|organization|firm|client|account)[:\s]+(.+?)(?:\n|$|,|\.)/i,
        /^(.+?)(?:\n|,|\.|$)/i,
        /(?:at|for|with)\s+(.+?)(?:\n|,|\.|$)/i
    ];

    // Contact name patterns
    const contactPatterns = [
        /(?:contact|person|name|owner|manager|decision maker|point of contact)[:\s]+(.+?)(?:\n|$|,|\.)/i,
        /(?:spoke with|talked to|met with|called)\s+(.+?)(?:\n|$|,|\.)/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\n|,|\.)/i
    ];

    // Phone patterns
    const phonePatterns = [
        /(?:phone|tel|mobile|cell|contact|number|call)[:\s]*([+\d\s\-\(\)]{7,})/i,
        /([+\d]{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}/,
        /(\d{3}[\s\-]\d{3}[\s\-]\d{4})/
    ];

    // Date patterns
    const datePatterns = [
        /(?:date|schedule|appointment|meeting|booking)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(\d{4}[\-\/]\d{1,2}[\-\/]\d{1,2})/,
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
        /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i
    ];

    // Time patterns
    const timePatterns = [
        /(?:time|at|@)[:\s]*(\d{1,2}:\d{2}\s*(?:am|pm)?)/i,
        /(\d{1,2}:\d{2}\s*(?:am|pm))/i,
        /(\d{1,2}\s*(?:am|pm))/i
    ];

    // Extract business name
    for (const pattern of businessPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 2) {
            result.business = match[1].trim();
            break;
        }
    }

    // Extract contact name
    for (const pattern of contactPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 2 && !match[1].match(/^\d/)) {
            result.contactName = match[1].trim();
            break;
        }
    }

    // Extract phone
    for (const pattern of phonePatterns) {
        const match = text.match(pattern);
        if (match) {
            const phone = match[1] || match[0];
            if (phone && phone.replace(/[\s\-\(\)]/g, '').length >= 7) {
                result.phone = phone.trim();
                break;
            }
        }
    }

    // Extract date
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            const dateStr = match[1] || match[0];
            try {
                const parsed = new Date(dateStr);
                if (!isNaN(parsed.getTime())) {
                    result.date = parsed.toISOString().split('T')[0];
                    break;
                }
            } catch (e) {}
        }
    }

    // Extract time
    for (const pattern of timePatterns) {
        const match = text.match(pattern);
        if (match) {
            result.time = match[1] || match[0];
            break;
        }
    }

    // Fallback: use first line as business
    if (!result.business) {
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length > 0) result.business = lines[0].trim().substring(0, 100);
    }

    // Fallback: use second line as contact
    if (!result.contactName) {
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length > 1) {
            const secondLine = lines[1].trim();
            if (!secondLine.match(/^\d/)) result.contactName = secondLine.substring(0, 100);
        }
    }

    result.notes = text.substring(0, 500);
    return result;
}

// ========== SMART IMPORT MODAL ==========
function showSmartImportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'smartImportModal';
    modal.innerHTML = `
        <div class="modal-card" style="max-width:600px;">
            <h3><i class="fas fa-magic"></i> Smart Import Booking</h3>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">
                Paste any text containing booking details. The system will intelligently parse business name, contact, phone, date, and time.
            </p>
            <div class="form-group">
                <label>Paste Booking Text</label>
                <textarea id="smartImportText" class="smart-import-textarea" placeholder="Example:
Business: ABC Corp
Contact: John Smith
Phone: (555) 123-4567
Date: 2024-12-25
Time: 2:00 PM
Status: Hot Transfer
Notes: Follow up next week"></textarea>
            </div>
            <div id="parsedPreview" class="parsed-preview" style="display:none;">
                <h4 style="margin-bottom:12px;"><i class="fas fa-search"></i> Parsed Results</h4>
                <div id="parsedFields"></div>
            </div>
            <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:16px;">
                <button id="parseSmartImportBtn" class="btn-icon" style="background:var(--info); color:white;"><i class="fas fa-magic"></i> Parse</button>
                <button id="saveSmartImportBtn" class="btn-icon" style="background:var(--success); color:white; display:none;"><i class="fas fa-save"></i> Save Booking</button>
                <button id="cancelSmartImportBtn" class="btn-icon">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    let parsedData = null;

    document.getElementById('parseSmartImportBtn').addEventListener('click', () => {
        const text = document.getElementById('smartImportText').value.trim();
        if (!text) { showToast('Please paste booking details first', 'error'); return; }

        parsedData = smartParseBooking(text);
        const preview = document.getElementById('parsedPreview');
        const fields = document.getElementById('parsedFields');
        
        fields.innerHTML = `
            <div class="parsed-field"><span class="field-label">Business</span><span class="field-value ${parsedData.business ? '' : 'missing'}">${parsedData.business || '❌ Not detected'}</span></div>
            <div class="parsed-field"><span class="field-label">Contact</span><span class="field-value ${parsedData.contactName ? '' : 'missing'}">${parsedData.contactName || '❌ Not detected'}</span></div>
            <div class="parsed-field"><span class="field-label">Phone</span><span class="field-value ${parsedData.phone ? '' : 'missing'}">${parsedData.phone || '❌ Not detected'}</span></div>
            <div class="parsed-field"><span class="field-label">Date</span><span class="field-value">${parsedData.date}</span></div>
            <div class="parsed-field"><span class="field-label">Time</span><span class="field-value ${parsedData.time ? '' : 'missing'}">${parsedData.time || 'Not detected'}</span></div>
            <div class="parsed-field"><span class="field-label">Status</span><span class="field-value">${parsedData.status}</span></div>
        `;

        preview.style.display = 'block';
        const canSave = parsedData.business && parsedData.contactName;
        document.getElementById('saveSmartImportBtn').style.display = canSave ? 'inline-flex' : 'none';
        
        if (!canSave) {
            showToast('Business and Contact are required to save. Please ensure the text contains this information.', 'warning');
        } else {
            showToast('✅ Parsing successful! You can now save the booking.', 'success');
        }
    });

    document.getElementById('saveSmartImportBtn').addEventListener('click', () => {
        if (!parsedData || !parsedData.business || !parsedData.contactName) {
            showToast('Cannot save without Business and Contact details', 'error');
            return;
        }
        addAppointment(parsedData.date, parsedData.business, parsedData.contactName, parsedData.phone, parsedData.time, parsedData.notes, parsedData.status);
        modal.remove();
        showToast('✅ Booking imported successfully!', 'success');
        refreshCurrentView();
    });

    document.getElementById('cancelSmartImportBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ========== EDIT APPOINTMENT MODAL ==========
function openEditAppointmentModal(appt) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'editAppointmentModal';
    modal.innerHTML = `
        <div class="modal-card" style="max-width:500px;">
            <h3><i class="fas fa-edit"></i> Edit Appointment</h3>
            <div class="form-group"><label>Date</label><input type="date" id="editApptDate" value="${appt.date}" /></div>
            <div class="form-group"><label>Business Name *</label><input type="text" id="editApptBusiness" value="${escapeHtml(appt.business)}" /></div>
            <div class="form-group"><label>Contact Name *</label><input type="text" id="editApptContact" value="${escapeHtml(appt.contactName)}" /></div>
            <div class="form-group"><label>Phone</label><input type="text" id="editApptPhone" value="${escapeHtml(appt.phone || '')}" /></div>
            <div class="form-group"><label>Time</label><input type="time" id="editApptTime" value="${appt.time || ''}" /></div>
            <div class="form-group"><label>Status</label><select id="editApptStatus">${STATUS_OPTIONS.map(s => `<option value="${s}" ${getStatus(appt) === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
            <div class="form-group"><label>Notes</label><textarea id="editApptNotes" rows="3">${escapeHtml(appt.notes || '')}</textarea></div>
            <div style="display:flex; gap:12px; justify-content:flex-end;">
                <button id="saveEditApptBtn" class="btn-icon" style="background:var(--success); color:white;">💾 Save Changes</button>
                <button id="cancelEditApptBtn" class="btn-icon">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('saveEditApptBtn').addEventListener('click', () => {
        const newDate = document.getElementById('editApptDate').value;
        const business = document.getElementById('editApptBusiness').value.trim();
        const contact = document.getElementById('editApptContact').value.trim();
        const phone = document.getElementById('editApptPhone').value.trim();
        const time = document.getElementById('editApptTime').value;
        const status = document.getElementById('editApptStatus').value;
        const notes = document.getElementById('editApptNotes').value.trim();

        if (!business || !contact) { showToast('Business and Contact are required', 'error'); return; }

        if (newDate !== appt.date) {
            deleteAppointment(appt.date, appt.id);
        }

        appt.date = newDate;
        appt.business = business;
        appt.contactName = contact;
        appt.phone = phone;
        appt.time = time;
        appt.status = status;
        appt.notes = notes;
        updateAppointment(appt);
        
        modal.remove();
        showToast('✅ Appointment updated!', 'success');
        refreshCurrentView();
    });

    document.getElementById('cancelEditApptBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ========== SCRIPT MANAGEMENT WITH REORDERING ==========
function loadScript(id) {
    if (!scripts[id] || isEditing) return;
    currentScriptId = id;
    document.getElementById('currentScriptName').innerHTML = scripts[id].name;
    document.getElementById('scriptContent').innerHTML = `<div class="script-display">${escapeHtml(scripts[id].content).replace(/\n/g, '<br>')}</div>`;
    renderSidebar();
}

function getOrderedScriptIds() {
    if (scriptOrder.length > 0 && scriptOrder.every(id => scripts[id])) {
        return scriptOrder;
    }
    return Object.keys(scripts);
}

function renderSidebar() {
    const container = document.getElementById('scriptListContainer');
    if (!container) return;
    const orderedIds = getOrderedScriptIds();
    let html = '';
    orderedIds.forEach((id, idx) => {
        const s = scripts[id];
        const active = currentScriptId === id;
        html += `
            <div class="script-item ${active ? 'active' : ''}" data-id="${id}" draggable="true">
                <span class="script-order-badge">${idx + 1}</span>
                <i class="fas fa-grip-vertical script-drag-handle" title="Drag to reorder"></i>
                <span class="script-name">${escapeHtml(s.name)}</span>
                <span class="key-hint">${idx < 9 ? idx + 1 : ''}</span>
            </div>
        `;
    });
    container.innerHTML = html;
    
    container.querySelectorAll('.script-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.script-drag-handle')) return;
            loadScript(el.getAttribute('data-id'));
        });
    });

    let draggedItem = null;
    container.querySelectorAll('.script-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            container.querySelectorAll('.script-item').forEach(el => el.classList.remove('drag-over'));
            draggedItem = null;
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (item !== draggedItem) item.classList.add('drag-over');
        });
        item.addEventListener('dragleave', () => { item.classList.remove('drag-over'); });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            if (draggedItem && draggedItem !== item) {
                const allItems = [...container.querySelectorAll('.script-item')];
                const fromIndex = allItems.indexOf(draggedItem);
                const toIndex = allItems.indexOf(item);
                const orderedIds = getOrderedScriptIds();
                const [movedId] = orderedIds.splice(fromIndex, 1);
                orderedIds.splice(toIndex, 0, movedId);
                scriptOrder = orderedIds;
                saveScriptOrder();
                renderSidebar();
            }
        });
    });
}

function saveScriptOrder() {
    if (currentUser && typeof db !== 'undefined') {
        db.collection('users').doc(currentUser.uid).collection('settings')
            .doc('scriptOrder').set({ order: scriptOrder }).catch(() => {});
    }
    localStorage.setItem('sf_script_order', JSON.stringify(scriptOrder));
}

function loadScriptOrder() {
    const saved = localStorage.getItem('sf_script_order');
    if (saved) {
        try { scriptOrder = JSON.parse(saved); } catch (e) { scriptOrder = []; }
    }
}

// ========== CALENDAR PANEL WITH DRAG-DROP ==========
function renderCalendarPanel(container) {
    if (!container) return;
    const year = currentCalDate.getFullYear(), month = currentCalDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let daysHtml = '';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => daysHtml += `<div class="day-name">${d}</div>`);
    for (let i = 0; i < firstDay; i++) daysHtml += '<div class="calendar-day empty"></div>';
    
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
        daysHtml += `<div class="calendar-day ${isSelected ? 'selected' : ''}" data-date="${dateStr}" data-droppable="true"><span class="day-number">${d}</span>${indicatorHtml}</div>`;
    }

    const selectedAppts = appointments[selectedCalDate]?.reports || [];
    const stats = {
        hotTransfers: selectedAppts.filter(a => getStatus(a) === 'Hot Transfer').length,
        warmCallbacks: selectedAppts.filter(a => getStatus(a) === 'Warm Callback').length,
        completed: selectedAppts.filter(a => getStatus(a) === 'Completed').length,
        pending: selectedAppts.filter(a => getStatus(a) === 'Pending').length
    };

    container.innerHTML = `
        <div class="calendar-section">
            <div class="calendar-nav" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3><i class="fas fa-calendar-alt"></i> ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</h3>
                <div class="calendar-nav-actions" style="display:flex; gap:6px;">
                    <button id="calPrevBtn" class="btn-icon"><i class="fas fa-chevron-left"></i></button>
                    <button id="calTodayBtn" class="btn-icon">Today</button>
                    <button id="calNextBtn" class="btn-icon"><i class="fas fa-chevron-right"></i></button>
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
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4>Appointments (${selectedAppts.length})</h4>
                    <button id="quickAddCalBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> Add Lead</button>
                </div>
                <div class="appointments-list">
                    ${selectedAppts.length === 0 ? '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No appointments for this date</p></div>' : 
                    selectedAppts.map(a => {
                        const score = calculateLeadScore(a);
                        return `
                            <div class="appointment-card" data-id="${a.id}" data-date="${a.date}" draggable="true">
                                <div class="card-row">
                                    <div class="business-name">
                                        <i class="fas fa-grip-vertical" style="color:var(--text-muted); cursor:grab; margin-right:4px;"></i>
                                        <input type="checkbox" class="bulk-checkbox" data-id="${a.id}" />
                                        <strong>${escapeHtml(a.business)}</strong>
                                        <span class="status-tag ${getStatusClassSmall(getStatus(a))}">${getStatus(a)}</span>
                                        <span class="score-badge ${getScoreColor(score)}">${score} Pts</span>
                                    </div>
                                </div>
                                <div style="font-size:0.8rem; margin-top:4px;">👤 ${escapeHtml(a.contactName)} ${a.phone ? '| 📞 ' + escapeHtml(a.phone) : ''} ${a.time ? '| 🕐 ' + a.time : ''}</div>
                                <div class="appointment-actions">
                                    <button class="appointment-action-btn copy-btn" data-id="${a.id}" title="Copy"><i class="fas fa-copy"></i> Copy</button>
                                    <button class="appointment-action-btn edit-btn" data-id="${a.id}" title="Edit"><i class="fas fa-edit"></i> Edit</button>
                                    <button class="appointment-action-btn delete-btn" data-id="${a.id}" title="Delete"><i class="fas fa-trash"></i> Delete</button>
                                    <select class="status-change-select" data-id="${a.id}" data-date="${selectedCalDate}" style="margin-left:auto;">
                                        ${STATUS_OPTIONS.map(s => `<option value="${s}" ${getStatus(a) === s ? 'selected' : ''}>${s}</option>`).join('')}
                                    </select>
                                </div>
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
        el.addEventListener('click', () => { selectedCalDate = el.getAttribute('data-date'); renderCalendarPanel(container); });
        el.addEventListener('dragover', (e) => { e.preventDefault(); el.style.background = 'var(--cal-day-hover)'; });
        el.addEventListener('dragleave', () => { el.style.background = ''; });
        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.style.background = '';
            const apptId = e.dataTransfer.getData('text/plain');
            const newDate = el.getAttribute('data-date');
            if (apptId && newDate) {
                moveAppointmentToDate(apptId, newDate);
                renderCalendarPanel(container);
            }
        });
    });

    document.getElementById('calPrevBtn')?.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() - 1); renderCalendarPanel(container); });
    document.getElementById('calNextBtn')?.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() + 1); renderCalendarPanel(container); });
    document.getElementById('calTodayBtn')?.addEventListener('click', () => { currentCalDate = new Date(); selectedCalDate = getTodayStr(); renderCalendarPanel(container); });
    document.getElementById('quickAddCalBtn')?.addEventListener('click', () => openQuickReportWithDate(selectedCalDate));
    
    container.querySelectorAll('.appointment-card[draggable]').forEach(card => {
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
            e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', () => { card.classList.remove('dragging'); });
    });

    container.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const appt = findAppointmentById(btn.getAttribute('data-id'));
            if (appt) copyAppointment(appt);
        });
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const appt = findAppointmentById(btn.getAttribute('data-id'));
            if (appt) openEditAppointmentModal(appt);
        });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this appointment?')) {
                deleteAppointment(selectedCalDate, btn.getAttribute('data-id'));
                renderCalendarPanel(container);
                showToast('Appointment deleted', 'info');
            }
        });
    });

    container.querySelectorAll('.status-change-select').forEach(select => {
        select.addEventListener('change', (e) => {
            e.stopPropagation();
            updateAppointmentStatus(selectedCalDate, select.getAttribute('data-id'), select.value);
            showToast('Status updated', 'success');
        });
    });

    container.querySelectorAll('.bulk-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            e.stopPropagation();
            if (cb.checked) selectedAppointments.add(cb.getAttribute('data-id'));
            else selectedAppointments.delete(cb.getAttribute('data-id'));
        });
    });
}

// ========== QUICK REPORT MODAL ==========
function openQuickReportWithDate(defaultDate) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'quickReportModal';
    modal.innerHTML = `
        <div class="modal-card" style="max-width:500px;">
            <h3><i class="fas fa-plus-circle"></i> Add New CRM Entry</h3>
            <div style="margin-bottom:12px;">
                <button id="switchToSmartImportBtn" class="btn-icon" style="background:var(--info); color:white; width:100%; justify-content:center;">
                    <i class="fas fa-magic"></i> Use Smart Import Instead
                </button>
            </div>
            <div class="form-group"><label>Date *</label><input type="date" id="newApptDate" value="${defaultDate}" /></div>
            <div class="form-group"><label>Business Name *</label><input type="text" id="newApptBusiness" placeholder="Company name" /></div>
            <div class="form-group"><label>Contact Name *</label><input type="text" id="newApptContact" placeholder="Full name" /></div>
            <div class="form-group"><label>Phone</label><input type="text" id="newApptPhone" placeholder="+1 (555) 000-0000" /></div>
            <div class="form-group"><label>Time</label><input type="time" id="newApptTime" /></div>
            <div class="form-group"><label>Lead Handoff Status</label><select id="newApptStatus">${STATUS_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div>
            <div class="form-group"><label>Notes</label><textarea id="newApptNotes" rows="3" placeholder="Additional details..."></textarea></div>
            <div style="display:flex; gap:12px; justify-content:flex-end;">
                <button id="saveNewApptBtn" class="btn-icon" style="background:var(--success); color:white;">💾 Save Entry</button>
                <button id="cancelNewApptBtn" class="btn-icon">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('switchToSmartImportBtn').addEventListener('click', () => { modal.remove(); showSmartImportModal(); });
    document.getElementById('saveNewApptBtn').addEventListener('click', () => {
        const date = document.getElementById('newApptDate').value;
        const bus = document.getElementById('newApptBusiness').value.trim();
        const contact = document.getElementById('newApptContact').value.trim();
        const phone = document.getElementById('newApptPhone').value.trim();
        const time = document.getElementById('newApptTime').value;
        const status = document.getElementById('newApptStatus').value;
        const notes = document.getElementById('newApptNotes').value.trim();
        if (!bus || !contact) { showToast('Business and Contact fields are required', 'error'); return; }
        addAppointment(date, bus, contact, phone, time, notes, status);
        modal.remove();
        showToast('✅ CRM Registration Added!', 'success');
        refreshCurrentView();
    });
    document.getElementById('cancelNewApptBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ========== NOTES PANEL ==========
function loadNotes() {
    notes = JSON.parse(localStorage.getItem('sf_local_notes') || '[]');
    if (notes.length > 0 && !currentNoteId) currentNoteId = notes[0].id;
}

function saveNote(id, title, content) {
    const updatedNote = { title: title || 'Untitled Note', content: content || '', updatedAt: new Date().toISOString() };
    const idx = notes.findIndex(n => n.id === id);
    if (idx !== -1) notes[idx] = { ...notes[idx], ...updatedNote };
    else { updatedNote.id = id; updatedNote.createdAt = new Date().toISOString(); notes.unshift(updatedNote); }
    localStorage.setItem('sf_local_notes', JSON.stringify(notes));
    if (currentUser && typeof db !== 'undefined') {
        db.collection('users').doc(currentUser.uid).collection('notes')
            .doc(id).set(updatedNote, { merge: true }).catch(() => {});
    }
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('sf_local_notes', JSON.stringify(notes));
    if (currentNoteId === id) currentNoteId = notes.length > 0 ? notes[0].id : null;
    if (currentUser && typeof db !== 'undefined') {
        db.collection('users').doc(currentUser.uid).collection('notes')
            .doc(id).delete().catch(() => {});
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
                    ${notes.map(n => `<div class="np-note-item ${n.id === currentNoteId ? 'active' : ''}" data-id="${n.id}" style="background:${n.id === currentNoteId ? 'var(--primary)' : 'var(--bg-primary)'}; color:${n.id === currentNoteId ? 'white' : 'var(--text-primary)'};"><span>${escapeHtml(n.title)}</span><i class="fas fa-trash np-delete-note-icon" data-id="${n.id}"></i></div>`).join('')}
                </div>
            </div>
            <div class="notepad-editor">
                <input type="text" id="npNoteTitle" value="${escapeHtml(currentNote.title || '')}" style="font-size:1.2rem; font-weight:700; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); width:100%;" />
                <textarea id="npNoteContent" style="flex:1; padding:12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-family:inherit; font-size:0.95rem; resize:none; min-height:300px;">${escapeHtml(currentNote.content || '')}</textarea>
            </div>
        </div>
    `;
    document.getElementById('npNewNoteBtn')?.addEventListener('click', () => { const id = 'note_' + generateUniqueId(); saveNote(id, 'New Note', ''); currentNoteId = id; renderNotesPanel(container); });
    container.querySelectorAll('.np-note-item').forEach(item => {
        item.addEventListener('click', (e) => { if (e.target.classList.contains('np-delete-note-icon')) return; currentNoteId = item.getAttribute('data-id'); renderNotesPanel(container); });
    });
    container.querySelectorAll('.np-delete-note-icon').forEach(icon => {
        icon.addEventListener('click', (e) => { e.stopPropagation(); if (confirm('Delete this note?')) { deleteNote(icon.getAttribute('data-id')); renderNotesPanel(container); } });
    });
    let saveTimeout;
    document.getElementById('npNoteTitle')?.addEventListener('input', () => { clearTimeout(saveTimeout); saveTimeout = setTimeout(() => saveNote(currentNoteId, document.getElementById('npNoteTitle').value, document.getElementById('npNoteContent').value), 500); });
    document.getElementById('npNoteContent')?.addEventListener('input', () => { clearTimeout(saveTimeout); saveTimeout = setTimeout(() => saveNote(currentNoteId, document.getElementById('npNoteTitle').value, document.getElementById('npNoteContent').value), 500); });
}

// ========== TASKS PANEL ==========
function renderTasksPanel(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="tasks-section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3><i class="fas fa-tasks"></i> Follow-up Tasks (${tasks.filter(t => !t.completed).length} pending)</h3>
                <button id="addNewTaskBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> New Task</button>
            </div>
            <div class="tasks-list">
                ${tasks.length === 0 ? '<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>No tasks yet</p></div>' : 
                tasks.map(t => `
                    <div class="task-card ${t.completed ? 'task-completed' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600;">${escapeHtml(t.description)}</span>
                            <div style="display:flex; gap:6px;">
                                <button class="toggle-task-btn btn-icon" data-id="${t.id}"><i class="fas ${t.completed ? 'fa-undo' : 'fa-check'}"></i></button>
                                <button class="delete-task-btn btn-icon" data-id="${t.id}"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">Due: ${t.dueDate || 'N/A'} | Priority: ${t.priority}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.getElementById('addNewTaskBtn')?.addEventListener('click', () => { const d = prompt('Task:'); if (d) { addTask(d, getTodayStr()); refreshCurrentView(); } });
    container.querySelectorAll('.toggle-task-btn').forEach(b => b.addEventListener('click', () => { toggleTaskComplete(b.dataset.id); refreshCurrentView(); }));
    container.querySelectorAll('.delete-task-btn').forEach(b => b.addEventListener('click', () => { if (confirm('Delete?')) { deleteTask(b.dataset.id); refreshCurrentView(); } }));
}

// ========== ANALYTICS HUB ==========
function renderAnalyticsHub(container) {
    if (!container) return;
    let total = 0, hot = 0, warm = 0, comp = 0, pend = 0, canc = 0;
    for (let d in appointments) {
        if (appointments[d].reports) {
            appointments[d].reports.forEach(a => {
                total++;
                const s = getStatus(a);
                if (s === 'Hot Transfer') hot++;
                else if (s === 'Warm Callback') warm++;
                else if (s === 'Completed') comp++;
                else if (s === 'Pending') pend++;
                else if (s === 'Canceled') canc++;
            });
        }
    }
    container.innerHTML = `
        <div class="analytics-container">
            <h3>Pipeline Overview</h3>
            <div class="report-metrics">
                <div class="metric-card"><div class="metric-value">${total}</div><div class="metric-label">Total</div></div>
                <div class="metric-card"><div class="metric-value" style="color:#dc2626;">${hot}</div><div class="metric-label">🔥 Hot</div></div>
                <div class="metric-card"><div class="metric-value" style="color:var(--warning);">${warm}</div><div class="metric-label">📞 Warm</div></div>
                <div class="metric-card"><div class="metric-value" style="color:var(--success);">${comp}</div><div class="metric-label">✅ Done</div></div>
            </div>
        </div>
    `;
}

// ========== APPOINTMENT REMINDER ==========
function checkAppointmentReminders() {
    if (!currentUser) return;
    const now = new Date(), today = getTodayStr();
    const appts = appointments[today]?.reports || [];
    appts.forEach(a => {
        if (!a.time) return;
        const [ah, am] = a.time.split(':').map(Number);
        if (isNaN(ah) || isNaN(am)) return;
        const diff = Math.abs((ah*60+am) - (now.getHours()*60+now.getMinutes()));
        if (diff <= 2 && !shownReminders.has(a.id)) {
            shownReminders.add(a.id);
            showReminderPopup(a);
        }
    });
}

function showReminderPopup(appt) {
    const popup = document.getElementById('appointmentReminderPopup');
    if (!popup) return;
    document.getElementById('reminderBusiness').textContent = appt.business;
    document.getElementById('reminderContact').textContent = appt.contactName;
    document.getElementById('reminderTime').textContent = `🕐 ${appt.time}`;
    document.getElementById('reminderStatus').textContent = `Status: ${getStatus(appt)}`;
    popup.style.display = 'flex';
    setTimeout(() => popup.classList.add('show'), 50);
    const autoClose = setTimeout(() => { popup.classList.remove('show'); setTimeout(() => popup.style.display = 'none', 400); }, 5000);
    document.getElementById('closeReminderPopup').onclick = () => { clearTimeout(autoClose); popup.classList.remove('show'); setTimeout(() => popup.style.display = 'none', 400); };
}

// ========== BULK ACTIONS ==========
function showBulkActionsModal() {
    const modal = document.getElementById('bulkActionsModal');
    const cont = document.getElementById('bulkSelectionContainer');
    let sel = [];
    for (let d in appointments) if (appointments[d].reports) appointments[d].reports.forEach(a => { if (selectedAppointments.has(a.id)) sel.push(a); });
    cont.innerHTML = sel.length ? sel.map(a => `<div class="bulk-item"><input type="checkbox" checked disabled> ${escapeHtml(a.business)}</div>`).join('') : '<p>No selection</p>';
    modal.style.display = 'flex';
    document.getElementById('bulkActionSelect').onchange = function() { document.getElementById('bulkActionOptions').style.display = this.value === 'status' ? 'block' : 'none'; };
    document.getElementById('executeBulkActionBtn').onclick = () => {
        const act = document.getElementById('bulkActionSelect').value;
        if (act === 'status') { sel.forEach(a => updateAppointmentStatus(a.date, a.id, document.getElementById('bulkStatusSelect').value)); showToast('Updated'); }
        else if (act === 'delete') { if (confirm('Delete?')) { sel.forEach(a => deleteAppointment(a.date, a.id)); } }
        selectedAppointments.clear(); modal.style.display = 'none'; refreshCurrentView();
    };
    document.getElementById('closeBulkModalBtn').onclick = () => modal.style.display = 'none';
}

// ========== CSV EXPORT ==========
function exportToCSV() {
    let csv = 'Date,Business,Contact,Phone,Time,Status,Notes\n';
    for (let d in appointments) if (appointments[d].reports) appointments[d].reports.forEach(a => csv += `"${d}","${a.business}","${a.contactName}","${a.phone}","${a.time}","${getStatus(a)}","${a.notes}"\n`);
    const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `crm_${getTodayStr()}.csv`; a.click();
}

// ========== FEATURE PANEL ==========
function showFeaturePanel(type, title) {
    document.getElementById('scriptPanel').style.display = 'none';
    document.getElementById('featurePanel').style.display = 'block';
    document.getElementById('featurePanelTitle').innerHTML = title;
    currentView = type;
    const body = document.getElementById('featurePanelBody');
    if (type === 'calendar') renderCalendarPanel(body);
    else if (type === 'tasks') renderTasksPanel(body);
    else if (type === 'analytics') renderAnalyticsHub(body);
    else if (type === 'notepad') renderNotesPanel(body);
}

function hideFeaturePanel() { 
    document.getElementById('featurePanel').style.display = 'none'; 
    document.getElementById('scriptPanel').style.display = 'block'; 
}

function refreshCurrentView() {
    const body = document.getElementById('featurePanelBody');
    if (document.getElementById('featurePanel').style.display === 'none') return;
    if (currentView === 'calendar') renderCalendarPanel(body);
    else if (currentView === 'tasks') renderTasksPanel(body);
    else if (currentView === 'analytics') renderAnalyticsHub(body);
    else if (currentView === 'notepad') renderNotesPanel(body);
}

// ========== DATA LOADING ==========
async function loadUserData() {
    if (!currentUser || typeof db === 'undefined') {
        showToast('Database connection error. Please reload.', 'error');
        return;
    }
    
    document.getElementById('saveStatus').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    
    try {
        db.collection('users').doc(currentUser.uid).collection('appointments')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snap => { 
                appointments = {}; 
                snap.forEach(doc => { 
                    const a = doc.data(); 
                    if (!appointments[a.date]) appointments[a.date] = { count: 0, reports: [] }; 
                    appointments[a.date].reports.push({ ...a, id: doc.id }); 
                }); 
                updateStats(); 
                refreshCurrentView(); 
            }, error => {
                console.error('Appointments listener error:', error);
            });

        db.collection('users').doc(currentUser.uid).collection('tasks')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snap => { 
                tasks = []; 
                snap.forEach(doc => tasks.push({ ...doc.data(), id: doc.id })); 
                updateStats(); 
            }, error => {
                console.error('Tasks listener error:', error);
            });

        const scriptsSnapshot = await db.collection('users').doc(currentUser.uid).collection('scripts').get();
        scripts = {}; 
        scriptsSnapshot.forEach(doc => { 
            const d = doc.data(); 
            scripts[doc.id] = { name: d.name, content: d.content }; 
        });
        
        if (Object.keys(scripts).length === 0) { 
            await createDefaultScripts(); 
            return loadUserData(); 
        }
        
        loadScriptOrder();
        loadScript('opening'); 
        renderSidebar();
        document.getElementById('saveStatus').innerHTML = '<i class="fas fa-check"></i> Synced';
    } catch (error) {
        console.error('Data Load Error:', error);
        showToast('Error loading data. Please refresh.', 'error');
    }
}

async function createDefaultScripts() {
    if (typeof db === 'undefined') return;
    const def = { 
        opening: { name: "🎯 Opening Script", content: "Hey, is this [Company Name]?\nAwesome — this is Flynn. We created a free preview. Would you take a quick look?" }, 
        owner_yes: { name: "👑 Owner - Yes", content: "Perfect! Daniel will call you shortly." }, 
        owner_no: { name: "🤝 Not Owner", content: "Who drives your design decisions?" } 
    };
    const batch = db.batch(); 
    const ref = db.collection('users').doc(currentUser.uid).collection('scripts');
    for (let [id, s] of Object.entries(def)) batch.set(ref.doc(id), { name: s.name, content: s.content });
    await batch.commit();
}

// ========== AUTH ==========
function signOut() { 
    currentUser = null; 
    if (typeof auth !== 'undefined') auth.signOut(); 
    showToast('Signed out', 'info'); 
    setTimeout(() => location.reload(), 500); 
}

function showAuthModal() {
    if (typeof auth === 'undefined') {
        showToast('Authentication service not available. Please reload.', 'error');
        return;
    }
    const m = document.createElement('div'); 
    m.className = 'modal-overlay'; 
    m.id = 'authModal';
    m.innerHTML = `
        <div class="modal-card" style="max-width:400px;">
            <h2>ScriptFlow Pro</h2>
            <button id="googleSignInBtn" class="btn-icon" style="width:100%;background:white;color:#333;">Sign in with Google</button>
            <hr>
            <input id="loginEmail" placeholder="Email" style="width:100%;padding:10px;margin:8px 0;border-radius:8px;border:1px solid var(--border-color);">
            <input id="loginPass" type="password" placeholder="Password" style="width:100%;padding:10px;margin:8px 0;border-radius:8px;border:1px solid var(--border-color);">
            <button id="loginBtn" class="btn-icon" style="width:100%;background:var(--primary);color:white;">Sign In</button>
        </div>`;
    document.body.appendChild(m);
    
    document.getElementById('googleSignInBtn').onclick = async () => { 
        try {
            await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); 
        } catch (e) {
            showToast('Google sign-in failed: ' + e.message, 'error');
        }
    };
    
    document.getElementById('loginBtn').onclick = async () => { 
        try {
            await auth.signInWithEmailAndPassword(
                document.getElementById('loginEmail').value, 
                document.getElementById('loginPass').value
            ); 
        } catch (e) {
            showToast('Login failed: ' + e.message, 'error');
        }
    };
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase services are available
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        console.warn('Firebase services not ready. Waiting...');
        // Retry after a short delay
        setTimeout(() => {
            if (typeof auth !== 'undefined' && typeof db !== 'undefined') {
                initApp();
            } else {
                showToast('Unable to connect to database. Please check your internet connection and reload.', 'error');
            }
        }, 2000);
        return;
    }
    
    initApp();
});

function initApp() {
    auth.onAuthStateChanged(async user => {
        if (user) { 
            currentUser = user; 
            document.getElementById('userInfo').style.display = 'block'; 
            document.getElementById('userEmail').textContent = user.email; 
            await loadUserData(); 
            hideFeaturePanel(); 
        }
        else showAuthModal();
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
        if (typeof db !== 'undefined') {
            await db.collection('users').doc(currentUser.uid).collection('scripts')
                .doc(currentScriptId).update({ content: newContent });
        }
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

    // Add Script
    document.getElementById('addScriptBtnSide')?.addEventListener('click', () => {
        const name = prompt('Script name:');
        if (name && name.trim()) {
            const id = 'script_' + generateUniqueId();
            scripts[id] = { name: name.trim(), content: 'Enter your script content here...' };
            if (typeof db !== 'undefined') {
                db.collection('users').doc(currentUser.uid).collection('scripts')
                    .doc(id).set({ name: name.trim(), content: 'Enter your script content here...' });
            }
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

    // Tool Items Navigation
    document.addEventListener('click', (e) => {
        const tool = e.target.closest('.tool-item');
        if (!tool) return;
        const t = tool.dataset.tool;
        if (t === 'calendar') showFeaturePanel('calendar', '📅 Calendar');
        else if (t === 'tasks') showFeaturePanel('tasks', '📋 Tasks');
        else if (t === 'analytics') showFeaturePanel('analytics', '📊 Analytics');
        else if (t === 'notepad') showFeaturePanel('notepad', '📝 Notes');
        else if (t === 'export') exportToCSV();
        else if (t === 'theme') document.body.classList.toggle('dark');
        else if (t === 'help') showToast('Handoffs: Warm callback, Completed, Canceled, Pending, Hot transfers integrated!', 'info');
        else if (t === 'reset') { if (confirm('Clear all?')) { localStorage.clear(); location.reload(); } }
    });

    // Appointment Reminders
    setInterval(checkAppointmentReminders, 30000);
    setTimeout(checkAppointmentReminders, 5000);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const k = parseInt(e.key);
        if (k >= 1 && k <= 9) {
            const ids = getOrderedScriptIds();
            if (ids[k-1]) loadScript(ids[k-1]);
        }
    });
}