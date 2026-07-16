// ================================================================
// SCRIPTFLOW PRO - COMPLETE CENTRALIZED APPLICATION
// ================================================================

// ============================================================
// APPLICATION STATE
// ============================================================

let currentUser = null;
let authModalOpen = false;
let authInProgress = false;
let appointments = {};
let goals = { daily: 3, weekly: 15, monthly: 60 };
let scripts = {};
let scriptOrder = [];
let scriptFavorites = JSON.parse(localStorage.getItem('scriptFavorites') || '[]');
let currentScriptId = "opening";
let isEditing = false;
let searchTerm = "";
let tasks = [];
let taskFilter = 'all';
let isRefreshing = false;
let sortableInstance = null;
let autoSaveTimer = null;
let currentEditContent = '';

let appointmentsUnsubscribe = null;
let tasksUnsubscribe = null;

let currentCalDate = new Date();
let selectedCalDate = getTodayStr();
let calendarView = 'calendar';

let currentView = 'calendar';
let analyticsTab = 'insights'; // 'insights', 'reports', 'team'
let selectedAppointments = new Set();
let currentAppointmentId = null;

let toolsOpen = localStorage.getItem('toolsMenuOpen') === 'true';
let chartInstances = {};

// Keyboard Shortcuts
const DEFAULT_SHORTCUTS = {
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
    'Close Panel': { keys: ['Escape'], description: 'Close current panel and return to scripts' }
};

let customShortcuts = JSON.parse(localStorage.getItem('customShortcuts') || '{}');
let shortcuts = { ...DEFAULT_SHORTCUTS, ...customShortcuts };

const STATUS_OPTIONS = [
    'Warm Callback', 'Completed', 'Canceled', 'Pending', 'Hot Transfer',
    'Warm Call Booked', 'Meeting Booked', 'Rescheduled', 'Held'
];

const TAG_OPTIONS = [
    { id: 'qualified_warm_call', name: 'Qualified Warm Call', color: '#10b981' },
    { id: 'unqualified_warm_callback', name: 'Unqualified Warm Callback', color: '#f59e0b' },
    { id: 'vip', name: 'VIP', color: '#3b82f6' },
    { id: 'negligent_warm_callback', name: 'Negligent Warm Callback', color: '#ef4444' }
];

const FIELD_MAPPINGS = {
    'name': ['name', 'client', 'prospect', 'contact', 'customer', 'person', 'full name', 'contact name'],
    'business': ['business', 'company', 'organization', 'org', 'firm', 'brand', 'store'],
    'phone': ['phone', 'mobile', 'cell', 'telephone', 'number', 'contact number', 'phone number', 'mobile number'],
    'email': ['email', 'e-mail', 'mail', 'email address', 'e-mail address'],
    'date': ['date', 'appointment date', 'schedule date', 'meeting date', 'call date', 'day'],
    'time': ['time', 'appointment time', 'schedule time', 'meeting time', 'call time', 'hour'],
    'status': ['status', 'state', 'stage', 'lead status', 'appointment status', 'call status'],
    'notes': ['notes', 'note', 'comment', 'remarks', 'additional notes', 'info', 'details'],
    'assigned': ['assigned', 'assigned to', 'owner', 'agent', 'representative', 'rep', 'assigned agent']
};

// Team Members Data
const TEAM_MEMBERS = [
    { id: 'daniel', name: 'Daniel', role: 'Team Lead', avatar: '👨‍💼', color: '#3b82f6' },
    { id: 'sarah', name: 'Sarah', role: 'Senior Agent', avatar: '👩‍💼', color: '#8b5cf6' },
    { id: 'mike', name: 'Mike', role: 'Agent', avatar: '👨‍💻', color: '#10b981' },
    { id: 'jessica', name: 'Jessica', role: 'Agent', avatar: '👩‍💻', color: '#f59e0b' },
    { id: 'david', name: 'David', role: 'Junior Agent', avatar: '👨‍🎓', color: '#ef4444' }
];

// ============================================================
// UTILITY HELPERS
// ============================================================

function generateUniqueId() {
    return Date.now().toString() + '_' + Math.random().toString(36).substring(2, 11);
}

function getStatus(appt) {
    if (!appt || !appt.status) return 'Pending';
    return appt.status;
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

function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function showToast(msg, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = `toast ${type === 'error' ? 'error' : (type === 'info' ? 'info' : (type === 'warning' ? 'warning' : ''))}`;
    t.innerHTML = `${type === 'success' ? '✓' : (type === 'error' ? '⚠️' : (type === 'warning' ? '⚠️' : 'ℹ️'))} ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
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
    if (error.code === 'auth/network-request-failed') {
        message = 'Network connection lost. Please check your internet connection.';
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

// ============================================================
// DOM ELEMENT SAFETY HELPERS
// ============================================================

function getEl(id) {
    return document.getElementById(id);
}

function showEl(id) {
    const el = getEl(id);
    if (el) el.style.display = 'flex';
}

function hideEl(id) {
    const el = getEl(id);
    if (el) el.style.display = 'none';
}

function setText(id, text) {
    const el = getEl(id);
    if (el) el.textContent = text;
}

function setHTML(id, html) {
    const el = getEl(id);
    if (el) el.innerHTML = html;
}

// ============================================================
// ESC KEY HANDLER - Return to Opening Script
// ============================================================

function handleEscapeKey() {
    if (isEditing) {
        cancelEdit();
        return true;
    }
    
    const featurePanel = getEl('featurePanel');
    if (featurePanel && featurePanel.style.display !== 'none') {
        hideFeaturePanel();
        loadScript('opening');
        showToast('Returned to Opening Script', 'info');
        return true;
    }
    
    // Close any open modals
    const openModals = document.querySelectorAll('.modal-overlay');
    openModals.forEach(modal => {
        if (modal.style.display !== 'none') {
            modal.style.display = 'none';
        }
    });
    return true;
}

// ============================================================
// KEYBOARD SHORTCUTS MANAGER
// ============================================================

function checkShortcutConflict(newKeys, excludeAction = null) {
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
}

function updateShortcut(action, newKeys) {
    const conflicts = checkShortcutConflict(newKeys, action);
    if (conflicts.length > 0) {
        showToast(`Conflict with: ${conflicts.join(', ')}`, 'warning');
        return false;
    }
    
    if (shortcuts[action]) {
        shortcuts[action].keys = newKeys;
        customShortcuts[action] = shortcuts[action];
        localStorage.setItem('customShortcuts', JSON.stringify(customShortcuts));
        showToast(`Shortcut updated for ${action}`, 'success');
        return true;
    }
    return false;
}

function resetShortcutsToDefaults() {
    if (confirm('Reset all keyboard shortcuts to default values?')) {
        customShortcuts = {};
        localStorage.removeItem('customShortcuts');
        shortcuts = { ...DEFAULT_SHORTCUTS };
        showToast('Shortcuts reset to defaults', 'success');
        renderShortcutsList();
    }
}

function renderShortcutsList() {
    const container = getEl('shortcutsList');
    if (!container) return;
    
    let html = '';
    for (const [action, shortcut] of Object.entries(shortcuts)) {
        const isDefault = DEFAULT_SHORTCUTS[action] && 
            JSON.stringify(DEFAULT_SHORTCUTS[action].keys) === JSON.stringify(shortcut.keys);
        const conflict = checkShortcutConflict(shortcut.keys, action);
        
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
                    <i class="fas fa-pen shortcut-edit" onclick="openShortcutEdit('${action}')" title="Edit shortcut"></i>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

function openShortcutEdit(action) {
    const currentKeys = shortcuts[action]?.keys || [];
    const keysString = currentKeys.join('+');
    const newKeysString = prompt(`Enter new shortcut for "${action}" (e.g., Ctrl+Shift+I):`, keysString);
    if (newKeysString && newKeysString !== keysString) {
        const newKeys = newKeysString.split('+').map(k => k.trim());
        updateShortcut(action, newKeys);
        renderShortcutsList();
    }
}

// ============================================================
// GLOBAL SEARCH
// ============================================================

function openGlobalSearch() {
    const modal = getEl('globalSearchModal');
    if (!modal) return;
    modal.style.display = 'flex';
    const input = getEl('globalSearchInput');
    if (input) { input.value = ''; input.focus(); }
    const results = getEl('globalSearchResults');
    if (results) results.innerHTML = '';
}

function performGlobalSearch(query) {
    const results = getEl('globalSearchResults');
    if (!results) return;
    if (!query || query.length < 2) {
        results.innerHTML = '<p style="color:var(--text-muted); padding:12px;">Type at least 2 characters to search...</p>';
        return;
    }
    
    const searchResults = [];
    const q = query.toLowerCase();
    
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(appt => {
                const searchable = `${appt.business} ${appt.contactName} ${appt.phone || ''} ${appt.email || ''} ${appt.notes || ''}`.toLowerCase();
                if (searchable.includes(q)) {
                    searchResults.push({ type: 'appointment', data: appt, date: date });
                }
            });
        }
    }
    
    tasks.forEach(task => {
        if (task.description.toLowerCase().includes(q)) {
            searchResults.push({ type: 'task', data: task });
        }
    });
    
    for (const [id, script] of Object.entries(scripts)) {
        if (script.name.toLowerCase().includes(q) || script.content.toLowerCase().includes(q)) {
            searchResults.push({ type: 'script', data: { id, ...script } });
        }
    }
    
    if (searchResults.length === 0) {
        results.innerHTML = '<p style="color:var(--text-muted); padding:12px;">No results found.</p>';
        return;
    }
    
    let html = `<div style="display:flex; flex-direction:column; gap:8px;">`;
    searchResults.slice(0, 20).forEach(result => {
        if (result.type === 'appointment') {
            html += `
                <div class="list-item" style="cursor:pointer; padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);" onclick="showAppointmentDetail('${result.data.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span style="font-weight:600;">${escapeHtml(result.data.business)}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${formatDate(result.data.date)}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(result.data.contactName)}</div>
                </div>
            `;
        } else if (result.type === 'task') {
            html += `
                <div class="list-item" style="padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span style="font-weight:600;">${escapeHtml(result.data.description)}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${result.data.completed ? '✅ Done' : '⏳ Pending'}</span>
                    </div>
                </div>
            `;
        } else if (result.type === 'script') {
            html += `
                <div class="list-item" style="cursor:pointer; padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);" onclick="loadScript('${result.data.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span style="font-weight:600;">${escapeHtml(result.data.name)}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">📜 Script</span>
                    </div>
                </div>
            `;
        }
    });
    html += `</div>`;
    results.innerHTML = html;
}

// ============================================================
// SCRIPT MANAGEMENT
// ============================================================

function updateKeyHints() {
    const visible = getOrderedVisible();
    document.querySelectorAll('.script-item').forEach((item, idx) => {
        const hint = item.querySelector('.key-hint');
        if (hint && idx < 9) {
            hint.textContent = idx + 1;
        } else if (hint) {
            hint.textContent = '';
        }
    });
    
    const activeHint = getEl('activeShortcutHint');
    if (activeHint) {
        const idx = visible.indexOf(currentScriptId);
        activeHint.textContent = (idx >= 0 && idx < 9) ? (idx + 1) : '—';
    }
}

function loadScript(id) {
    if (!scripts[id]) return;
    if (isEditing) {
        if (!confirm('You have unsaved changes. Discard them?')) return;
        cancelEdit();
    }
    currentScriptId = id;
    const script = scripts[id];
    setText('currentScriptName', script.name);
    setHTML('scriptContent', `<div class="script-display">${escapeHtml(script.content).replace(/\n/g, '<br>')}</div>`);
    setText('versionNumber', script.version || 1);
    updateFavoriteStar();
    renderSidebar();
    updateKeyHints();
}

function getOrderedVisible() {
    if (scriptOrder && scriptOrder.length > 0) {
        return scriptOrder.filter(id => scripts[id]);
    }
    return Object.keys(scripts);
}

function renderSidebar() {
    const container = getEl('scriptListContainer');
    if (!container) return;
    
    const visible = getOrderedVisible();
    const sorted = [...visible].sort((a, b) => {
        const aFav = scriptFavorites.includes(a);
        const bFav = scriptFavorites.includes(b);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return visible.indexOf(a) - visible.indexOf(b);
    });
    
    let html = '';
    sorted.forEach((id, idx) => {
        const s = scripts[id];
        if (!s) return;
        const active = currentScriptId === id;
        const isFavorite = scriptFavorites.includes(id);
        html += `
            <div class="script-item ${active ? 'active' : ''}" data-id="${id}">
                <i class="fas fa-grip-vertical drag-handle" aria-hidden="true"></i>
                <span class="script-name">${escapeHtml(s.name)}</span>
                <i class="fas fa-star favorite-star ${isFavorite ? 'active' : ''}" data-id="${id}" aria-hidden="true"></i>
                <span class="key-hint">${idx < 9 ? idx + 1 : ''}</span>
            </div>
        `;
    });
    container.innerHTML = html;
    
    if (sortableInstance) sortableInstance.destroy();
    
    sortableInstance = new Sortable(container, {
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
            scriptOrder = newOrder;
            await saveScriptOrder();
            renderSidebar();
            updateKeyHints();
        }
    });
    
    container.querySelectorAll('.script-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            if (e.target.closest('.favorite-star')) return;
            loadScript(el.getAttribute('data-id'));
        });
    });
    
    container.querySelectorAll('.favorite-star').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(el.getAttribute('data-id'));
        });
    });
    
    updateKeyHints();
}

function toggleFavorite(id) {
    const index = scriptFavorites.indexOf(id);
    if (index > -1) {
        scriptFavorites.splice(index, 1);
    } else {
        scriptFavorites.push(id);
    }
    localStorage.setItem('scriptFavorites', JSON.stringify(scriptFavorites));
    renderSidebar();
    updateFavoriteStar();
    showToast(index > -1 ? 'Removed from favorites' : 'Added to favorites', 'info');
}

function updateFavoriteStar() {
    const star = getEl('favoriteScriptBtn');
    if (star) {
        const isFavorite = scriptFavorites.includes(currentScriptId);
        star.innerHTML = `<i class="fas fa-star" style="color:${isFavorite ? 'var(--favorite-color)' : 'var(--text-muted)'}"></i>`;
        star.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    }
}

// ============================================================
// SCRIPT EDITING
// ============================================================

function startEdit() {
    if (!scripts[currentScriptId]) return;
    isEditing = true;
    const script = scripts[currentScriptId];
    currentEditContent = script.content;
    
    const editBtn = getEl('editScriptBtn');
    const saveBtn = getEl('saveScriptBtn');
    const cancelBtn = getEl('cancelEditBtn');
    const statusBadge = getEl('editStatusBadge');
    
    if (editBtn) editBtn.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'inline-flex';
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';
    if (statusBadge) statusBadge.style.display = 'inline-flex';
    
    const contentDiv = getEl('scriptContent');
    if (contentDiv) {
        contentDiv.innerHTML = `
            <textarea class="edit-textarea" id="editTextarea">${escapeHtml(script.content)}</textarea>
            <div class="auto-save-indicator">Auto-saving...</div>
        `;
    }
    
    const textarea = getEl('editTextarea');
    if (textarea) {
        textarea.focus();
        
        textarea.addEventListener('input', () => {
            currentEditContent = textarea.value;
            const indicator = document.querySelector('.auto-save-indicator');
            if (indicator) {
                indicator.textContent = 'Saving...';
                indicator.style.color = 'var(--warning)';
            }
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveScriptContent(textarea.value);
                const indicator = document.querySelector('.auto-save-indicator');
                if (indicator) {
                    indicator.textContent = '✓ Auto-saved';
                    indicator.style.color = 'var(--success)';
                }
            }, 1000);
        });
        
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cancelEdit();
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveScriptContent(textarea.value);
                finishEdit();
            }
        });
    }
}

function saveScriptContent(content) {
    if (!currentUser || !currentScriptId) return;
    const script = scripts[currentScriptId];
    if (!script) return;
    
    const updatedScript = {
        ...script,
        content: content,
        version: (script.version || 1) + 1
    };
    
    db.collection('users').doc(currentUser.uid).collection('scripts').doc(currentScriptId).set(updatedScript, { merge: true })
        .then(() => {
            scripts[currentScriptId] = updatedScript;
            showToast('Script saved!', 'success');
        })
        .catch(err => handleError(err, 'Saving script'));
}

function finishEdit() {
    isEditing = false;
    const editBtn = getEl('editScriptBtn');
    const saveBtn = getEl('saveScriptBtn');
    const cancelBtn = getEl('cancelEditBtn');
    const statusBadge = getEl('editStatusBadge');
    
    if (editBtn) editBtn.style.display = 'inline-flex';
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (statusBadge) statusBadge.style.display = 'none';
    loadScript(currentScriptId);
    showToast('Changes saved', 'success');
}

function cancelEdit() {
    if (!confirm('Discard your changes?')) return;
    isEditing = false;
    const editBtn = getEl('editScriptBtn');
    const saveBtn = getEl('saveScriptBtn');
    const cancelBtn = getEl('cancelEditBtn');
    const statusBadge = getEl('editStatusBadge');
    
    if (editBtn) editBtn.style.display = 'inline-flex';
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (statusBadge) statusBadge.style.display = 'none';
    loadScript(currentScriptId);
}

// ============================================================
// AUTHENTICATION
// ============================================================

function updateSidebarProfile(user) {
    const container = getEl('userInfo');
    if (!container) return;
    if (!user) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    setText('userEmail', user.email || '');
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
                scriptOrder: ['opening']
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
        if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; }
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
        setTimeout(() => showAuthModal(), 300);
    } catch (error) {
        handleError(error, 'Sign Out');
    }
}

function showAuthModal() {
    if (authModalOpen) return;
    authModalOpen = true;
    const existing = getEl('authModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
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
            <div id="authFormContainer">
                <div style="display:flex; gap:8px; margin-bottom:20px;">
                    <button id="loginTabBtn" class="view-btn active" style="flex:1; justify-content:center;">Sign In</button>
                    <button id="signupTabBtn" class="view-btn" style="flex:1; justify-content:center;">Sign Up</button>
                </div>
                <div id="loginForm">
                    <div class="form-group"><label>Email</label><input type="email" id="loginEmailInput" placeholder="you@example.com" /></div>
                    <div class="form-group"><label>Password</label><input type="password" id="loginPasswordInput" placeholder="••••••••" /></div>
                    <button id="loginBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--primary); color:white;"><i class="fas fa-sign-in-alt"></i> Sign In</button>
                </div>
                <div id="signupForm" style="display:none;">
                    <div class="form-group"><label>Username</label><input type="text" id="signupUsernameInput" placeholder="Choose a username" /></div>
                    <div class="form-group"><label>Email</label><input type="email" id="signupEmailInput" placeholder="you@example.com" /></div>
                    <div class="form-group"><label>Password</label><input type="password" id="signupPasswordInput" placeholder="•••••••• (min 6 chars)" /></div>
                    <button id="signupBtn" class="btn-icon" style="width:100%; justify-content:center; background:var(--success); color:white;"><i class="fas fa-user-plus"></i> Create Account</button>
                </div>
            </div>
            <div style="margin-top:16px; text-align:center; font-size:0.8rem; color:var(--text-muted);">🔒 Secure Cloud Data Integration</div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const googleBtn = getEl('googleSignInBtn');
    const loginTab = getEl('loginTabBtn');
    const signupTab = getEl('signupTabBtn');
    const loginBtn = getEl('loginBtn');
    const signupBtn = getEl('signupBtn');
    
    if (googleBtn) googleBtn.addEventListener('click', (e) => { e.preventDefault(); signInWithGoogle(); });
    if (loginTab) loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        if (signupTab) signupTab.classList.remove('active');
        const loginForm = getEl('loginForm');
        const signupForm = getEl('signupForm');
        if (loginForm) loginForm.style.display = 'block';
        if (signupForm) signupForm.style.display = 'none';
    });
    if (signupTab) signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');
        const loginForm = getEl('loginForm');
        const signupForm = getEl('signupForm');
        if (loginForm) loginForm.style.display = 'none';
        if (signupForm) signupForm.style.display = 'block';
    });
    if (loginBtn) loginBtn.addEventListener('click', async () => {
        const email = getEl('loginEmailInput')?.value;
        const password = getEl('loginPasswordInput')?.value;
        if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
        await signIn(email, password);
    });
    if (signupBtn) signupBtn.addEventListener('click', async () => {
        const username = getEl('signupUsernameInput')?.value;
        const email = getEl('signupEmailInput')?.value;
        const password = getEl('signupPasswordInput')?.value;
        if (!username || !email || !password) { showToast('Please fill in all fields', 'error'); return; }
        if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
        await signUp(email, password, username);
    });
}

function closeAuthModal() {
    const modal = getEl('authModal');
    if (modal) modal.remove();
    authModalOpen = false;
}

// ============================================================
// DATA LOADING
// ============================================================

async function loadUserData(showLoading = true) {
    if (!currentUser) return;
    try {
        const statusEl = getEl('saveStatus');
        if (statusEl && showLoading) statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        
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
                scriptOrder: ['opening']
            });
            return loadUserData();
        }
        if (userData.goals) {
            goals = { daily: userData.goals.daily || 3, weekly: userData.goals.weekly || 15, monthly: userData.goals.monthly || 60 };
        }
        scriptOrder = userData.scriptOrder || [];
        
        subscribeToChanges();
        
        const scriptsSnapshot = await db.collection('users').doc(currentUser.uid).collection('scripts').get();
        scripts = {};
        scriptsSnapshot.forEach(doc => {
            const data = doc.data();
            scripts[doc.id] = { name: data.name, content: data.content, version: data.version || 1 };
        });
        if (Object.keys(scripts).length === 0) {
            await createDefaultScripts();
            return loadUserData();
        }
        
        updateStats();
        renderSidebar();
        loadScript('opening');
        closeAuthModal();
        if (statusEl) statusEl.innerHTML = '<i class="fas fa-check"></i> Synced';
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
            if (!appointments[appt.date]) appointments[appt.date] = { count: 0, note: '', reports: [] };
            appointments[appt.date].reports.push({ ...appt, id: doc.id });
            appointments[appt.date].count = appointments[appt.date].reports.length;
        });
        updateStats();
        refreshCurrentView();
    });

    tasksUnsubscribe = db.collection('users').doc(currentUser.uid).collection('tasks').orderBy('createdAt', 'desc').onSnapshot(snap => {
        tasks = [];
        snap.forEach(doc => tasks.push({ ...doc.data(), id: doc.id }));
        updateTaskStats();
        refreshCurrentView();
    });
}

async function createDefaultScripts() {
    if (!currentUser) return;
    const defaultScripts = {
        "opening": { name: "🎯 Opening Script", content: '"Hey, is this [Company Name]?"\n\n"Awesome — this is Flynn. We created a free, modern preview version inspired by your current site. There\'s no cost or obligation. Would you be open to taking a quick look later today and sharing your thoughts?"' },
        "owner_yes": { name: "👑 Owner - Yes", content: "Perfect! Daniel will call you shortly to showcase your preview concept. Is this the best number to connect with you?" },
        "owner_no": { name: "🤤 Not Owner", content: "No worries! Who usually drives your design or advertising decisions? What is the best coordinate to reach them today?" },
        "objection_website": { name: "💻 Objection - Website", content: "I completely understand your concern about the website. Our preview is designed to show you what's possible without any commitment." },
        "objection_cost": { name: "💰 Objection - Cost", content: "Great question about pricing. The preview is completely free—there's no cost or obligation. We believe in showing value first." },
        "closing": { name: "🤝 Closing Script", content: "Thank you for your time today! I'll have our team prepare the preview and reach out with next steps." }
    };
    const batch = db.batch();
    const ref = db.collection('users').doc(currentUser.uid).collection('scripts');
    for (const [id, script] of Object.entries(defaultScripts)) {
        batch.set(ref.doc(id), { name: script.name, content: script.content, version: 1, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }
    await batch.commit();
}

async function saveScriptOrder() {
    if (!currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).update({ scriptOrder: scriptOrder });
    } catch (error) {
        console.error('Error saving script order:', error);
    }
}

// ============================================================
// APPOINTMENT HANDLERS
// ============================================================

function addAppointment(dateStr, business, contactName, role, phone, time, notes, assigned, editId = null, status = 'Pending', crmLink = '', tags = []) {
    if (!currentUser) { showToast('Please sign in first', 'error'); return null; }
    if (!appointments[dateStr]) appointments[dateStr] = { count: 0, note: '', reports: [] };
    if (!STATUS_OPTIONS.includes(status)) status = 'Pending';
    const newAppt = {
        id: editId || generateUniqueId(),
        business, contactName, role: role || 'Owner', phone: phone || '',
        time: time || '', notes: notes || '', assigned: assigned || 'Daniel',
        status: status, crmLink: crmLink || '', tags: tags || [],
        date: dateStr, createdAt: new Date().toISOString()
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
        refreshCurrentView();
        return true;
    }
    return false;
}

function updateAppointment(dateStr, id, updates) {
    const appt = appointments[dateStr]?.reports?.find(r => r.id === id);
    if (!appt) return false;
    Object.assign(appt, updates);
    syncAppointment(appt);
    updateStats();
    refreshCurrentView();
    return true;
}

function getAppointmentById(id) {
    for (let date in appointments) {
        if (appointments[date].reports) {
            const found = appointments[date].reports.find(r => r.id === id);
            if (found) return found;
        }
    }
    return null;
}

// ============================================================
// METRICS
// ============================================================

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
    const todayEl = getEl('statToday');
    const weekEl = getEl('statWeek');
    const monthEl = getEl('statMonth');
    const avgEl = getEl('avgScore');
    if (todayEl) todayEl.innerText = getTodayCount();
    if (weekEl) weekEl.innerText = getWeekCount();
    if (monthEl) monthEl.innerText = getMonthCount();
    if (avgEl) avgEl.innerText = getAverageScore();
    updateTaskStats();
}

// ============================================================
// TASKS SYSTEM
// ============================================================

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

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    db.collection('users').doc(currentUser.uid).collection('tasks').doc(id).delete();
    updateTaskStats();
    refreshCurrentView();
}

function updateTaskStats() {
    const pending = tasks.filter(t => !t.completed).length;
    const pendingEl = getEl('pendingTasks');
    if (pendingEl) pendingEl.innerText = pending;
}

// ============================================================
// SMART IMPORT
// ============================================================

let parsedImportData = {};
let importConfidence = {};

function parseAppointmentText(text) {
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
                for (const [field, aliases] of Object.entries(FIELD_MAPPINGS)) {
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
}

function checkDuplicate(appointment) {
    if (!appointment.name && !appointment.phone && !appointment.email) return null;
    for (let date in appointments) {
        if (appointments[date].reports) {
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
}

function openSmartImport() {
    const modal = getEl('smartImportModal');
    if (!modal) return;
    modal.style.display = 'flex';
    const textArea = getEl('importTextArea');
    if (textArea) textArea.value = '';
    const preview = getEl('importPreview');
    if (preview) preview.style.display = 'none';
    const saveBtn = getEl('saveImportBtn');
    if (saveBtn) saveBtn.style.display = 'none';
    parsedImportData = {};
    importConfidence = {};
}

function renderParsedPreview(data, confidence) {
    const preview = getEl('importPreview');
    const fieldsContainer = getEl('parsedFields');
    const confidenceContainer = getEl('confidenceScore');
    const missingContainer = getEl('missingFields');
    const duplicateContainer = getEl('duplicateWarning');
    
    if (!preview) return;
    preview.style.display = 'block';
    
    let fieldsHtml = '', totalConfidence = 0, fieldCount = 0;
    const requiredFields = ['name', 'business'];
    const missingFields = [];
    
    for (const [field, value] of Object.entries(data)) {
        if (!value) continue;
        const conf = confidence[field] || 0.5;
        totalConfidence += conf;
        fieldCount++;
        const confClass = conf >= 0.7 ? 'high' : (conf >= 0.4 ? 'medium' : 'low');
        const confLabel = conf >= 0.7 ? 'High' : (conf >= 0.4 ? 'Medium' : 'Low');
        fieldsHtml += `
            <div class="parsed-field">
                <span class="field-label">${field.charAt(0).toUpperCase() + field.slice(1)}</span>
                <span class="field-value" contenteditable="true" data-field="${field}">${escapeHtml(value)}</span>
                <span class="field-confidence ${confClass}">${confLabel} (${Math.round(conf * 100)}%)</span>
                <i class="fas fa-pen field-edit" data-field="${field}" title="Edit value"></i>
            </div>
        `;
        if (requiredFields.includes(field) && !value) missingFields.push(field);
    }
    
    for (const field of requiredFields) {
        if (!data[field] || !data[field].trim()) missingFields.push(field);
    }
    
    if (fieldsContainer) fieldsContainer.innerHTML = fieldsHtml;
    if (fieldsContainer) {
        fieldsContainer.querySelectorAll('.field-value').forEach(el => {
            el.addEventListener('blur', function() {
                const field = this.getAttribute('data-field');
                parsedImportData[field] = this.textContent.trim();
                updateImportValidation();
            });
        });
        fieldsContainer.querySelectorAll('.field-edit').forEach(el => {
            el.addEventListener('click', function() {
                const field = this.getAttribute('data-field');
                const valueEl = fieldsContainer.querySelector(`.field-value[data-field="${field}"]`);
                if (valueEl) valueEl.focus();
            });
        });
    }
    
    parsedImportData = { ...data };
    importConfidence = { ...confidence };
    
    const avgConf = fieldCount > 0 ? totalConfidence / fieldCount : 0;
    if (confidenceContainer) {
        confidenceContainer.innerHTML = `
            <strong>Overall Confidence:</strong> ${Math.round(avgConf * 100)}% 
            <span style="font-size:0.75rem; color:var(--text-muted); margin-left:8px;">(${fieldCount} fields parsed)</span>
        `;
    }
    
    if (duplicateContainer) {
        const duplicate = checkDuplicate(data);
        if (duplicate) {
            duplicateContainer.style.display = 'block';
            duplicateContainer.innerHTML = `⚠️ <strong>Potential duplicate found!</strong> Similar appointment exists: ${duplicate.business} - ${duplicate.contactName} on ${formatDate(duplicate.date)}`;
        } else {
            duplicateContainer.style.display = 'none';
        }
    }
    
    if (missingContainer) {
        if (missingFields.length > 0) {
            missingContainer.innerHTML = `⚠️ <strong>Missing required fields:</strong> ${missingFields.join(', ')}<br><span style="font-size:0.75rem;">Please fill in all required fields before saving.</span>`;
            missingContainer.style.color = 'var(--danger)';
            const saveBtn = getEl('saveImportBtn');
            if (saveBtn) saveBtn.disabled = true;
        } else {
            missingContainer.innerHTML = '✅ All required fields are filled';
            missingContainer.style.color = 'var(--success)';
            const saveBtn = getEl('saveImportBtn');
            if (saveBtn) saveBtn.disabled = false;
        }
    }
    updateImportValidation();
}

function updateImportValidation() {
    const requiredFields = ['name', 'business'];
    const allFilled = requiredFields.every(field => parsedImportData[field] && parsedImportData[field].trim());
    const saveBtn = getEl('saveImportBtn');
    if (saveBtn) {
        if (allFilled) {
            saveBtn.style.display = 'inline-flex';
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        } else {
            saveBtn.style.display = 'inline-flex';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.5';
        }
    }
}

function saveImportedAppointment() {
    if (!currentUser) { showToast('Please sign in first', 'error'); return; }
    const data = parsedImportData;
    if (!data.name || !data.business) { showToast('Name and Business are required', 'error'); return; }
    
    const date = data.date || getTodayStr();
    const status = data.status || 'Pending';
    const time = data.time || '';
    const phone = data.phone || '';
    const email = data.email || '';
    const notes = data.notes || '';
    const assigned = data.assigned || 'Daniel';
    
    const duplicate = checkDuplicate(data);
    if (duplicate && !confirm(`This appears to be a duplicate appointment with ${duplicate.business}. Do you still want to add it?`)) return;
    
    addAppointment(date, data.business, data.name, 'Owner', phone, time, notes + (email ? `\nEmail: ${email}` : ''), assigned, null, status);
    showToast('Appointment imported successfully! 🎉', 'success');
    closeSmartImport();
    refreshCurrentView();
}

function closeSmartImport() {
    const modal = getEl('smartImportModal');
    if (modal) modal.style.display = 'none';
    parsedImportData = {};
    importConfidence = {};
}

// ============================================================
// APPOINTMENT DETAIL MODAL
// ============================================================

function showAppointmentDetail(appointmentId) {
    const appt = getAppointmentById(appointmentId);
    if (!appt) { showToast('Appointment not found', 'error'); return; }
    currentAppointmentId = appointmentId;
    const modal = getEl('appointmentDetailModal');
    if (!modal) return;
    const titleEl = getEl('appointmentDetailTitle');
    if (titleEl) titleEl.textContent = `📋 ${appt.business} - ${appt.contactName}`;
    const contentEl = getEl('appointmentDetailContent');
    if (contentEl) {
        contentEl.innerHTML = `
            <div class="detail-row"><span class="detail-label">Business</span><span class="detail-value">${escapeHtml(appt.business)}</span></div>
            <div class="detail-row"><span class="detail-label">Contact</span><span class="detail-value">${escapeHtml(appt.contactName)}</span></div>
            <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${escapeHtml(appt.phone || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escapeHtml(appt.email || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(appt.date)}</span></div>
            <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${escapeHtml(appt.time || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="status-tag ${getStatusClassSmall(getStatus(appt))}">${getStatus(appt)}</span></span></div>
            <div class="detail-row"><span class="detail-label">Assigned</span><span class="detail-value">${escapeHtml(appt.assigned || 'Daniel')}</span></div>
            <div class="detail-row"><span class="detail-label">Lead Score</span><span class="detail-value"><span class="score-badge ${getScoreColor(calculateLeadScore(appt))}">${calculateLeadScore(appt)} Pts</span></span></div>
            ${appt.notes ? `<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value" style="white-space:pre-wrap;">${escapeHtml(appt.notes)}</span></div>` : ''}
            ${appt.tags && appt.tags.length > 0 ? `<div class="detail-row"><span class="detail-label">Tags</span><span class="detail-value">${appt.tags.map(t => `#${t}`).join(' ')}</span></div>` : ''}
        `;
    }
    modal.style.display = 'flex';
}

function closeAppointmentDetail() {
    const modal = getEl('appointmentDetailModal');
    if (modal) modal.style.display = 'none';
    currentAppointmentId = null;
}

// ============================================================
// QUICK ADD APPOINTMENT
// ============================================================

function openQuickReportWithDate(defaultDate) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'quickAddModal';
    modal.innerHTML = `
        <div class="modal-card">
            <h3><i class="fas fa-plus-circle"></i> Add New Appointment</h3>
            <div class="form-group"><label>Date</label><input type="date" id="newApptDate" value="${defaultDate}" /></div>
            <div class="form-group"><label>Business Name *</label><input type="text" id="newApptBusiness" placeholder="Enter business name" /><div class="error-message">Business name is required</div></div>
            <div class="form-group"><label>Contact Name *</label><input type="text" id="newApptContact" placeholder="Enter contact name" /><div class="error-message">Contact name is required</div></div>
            <div class="form-group"><label>Phone</label><input type="text" id="newApptPhone" placeholder="Enter phone number" /></div>
            <div class="form-group"><label>Email</label><input type="email" id="newApptEmail" placeholder="Enter email address" /></div>
            <div class="form-group"><label>Time</label><input type="time" id="newApptTime" /></div>
            <div class="form-group"><label>Lead Status</label><select id="newApptStatus">${STATUS_OPTIONS.map(s => `<option value="${s}" ${s === 'Pending' ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
            <div class="form-group"><label>Notes</label><textarea id="newApptNotes" rows="3" placeholder="Add any additional notes..."></textarea></div>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:16px; flex-wrap:wrap;">
                <button id="saveQuickApptBtn" class="btn-icon" style="background:var(--success); color:white;"><i class="fas fa-save"></i> Save</button>
                <button id="cancelQuickApptBtn" class="btn-icon">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const saveBtn = getEl('saveQuickApptBtn');
    const cancelBtn = getEl('cancelQuickApptBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const date = getEl('newApptDate')?.value || '';
            const bus = getEl('newApptBusiness')?.value?.trim() || '';
            const contact = getEl('newApptContact')?.value?.trim() || '';
            const phone = getEl('newApptPhone')?.value?.trim() || '';
            const email = getEl('newApptEmail')?.value?.trim() || '';
            const time = getEl('newApptTime')?.value || '';
            const status = getEl('newApptStatus')?.value || 'Pending';
            const notes = getEl('newApptNotes')?.value?.trim() || '';
            if (!bus || !contact) { showToast('Please fill in all required fields', 'error'); return; }
            addAppointment(date, bus, contact, 'Owner', phone, time, notes + (email ? `\nEmail: ${email}` : ''), 'Daniel', null, status);
            modal.remove();
            showToast('Appointment added successfully! 🎉', 'success');
            refreshCurrentView();
        });
    }
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ============================================================
// FEATURE PANEL
// ============================================================

function showFeaturePanel(featureType, title) {
    const scriptPanel = getEl('scriptPanel');
    const featurePanel = getEl('featurePanel');
    const featureTitle = getEl('featurePanelTitle');
    const featureBody = getEl('featurePanelBody');
    if (!scriptPanel || !featurePanel) return;
    currentView = featureType;
    if (featureTitle) {
        const iconMap = { 'calendar': 'fa-calendar-alt', 'tasks': 'fa-tasks', 'analytics': 'fa-chart-pie', 'shortcuts': 'fa-keyboard' };
        featureTitle.innerHTML = `<i class="fas ${iconMap[featureType] || 'fa-sticky-note'}"></i> ${title}`;
    }
    
    const container = getEl('viewToggleContainer');
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
                    <button id="insightsTabBtn" class="view-btn ${analyticsTab === 'insights' ? 'active' : ''}">📊 Insights</button>
                    <button id="reportsTabBtn" class="view-btn ${analyticsTab === 'reports' ? 'active' : ''}">📈 Reports</button>
                    <button id="teamTabBtn" class="view-btn ${analyticsTab === 'team' ? 'active' : ''}">👥 Team</button>
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
        } else if (featureType === 'shortcuts') {
            html = `
                <div class="view-toggle" id="shortcutsViewToggle">
                    <button id="shortcutsListBtn" class="view-btn active">📋 All</button>
                    <button id="shortcutsCustomBtn" class="view-btn">✏️ Customize</button>
                </div>
            `;
        }
        container.innerHTML = html;
        
        // Attach event listeners for analytics tabs
        if (featureType === 'analytics') {
            const insightsBtn = getEl('insightsTabBtn');
            const reportsBtn = getEl('reportsTabBtn');
            const teamBtn = getEl('teamTabBtn');
            
            if (insightsBtn) {
                insightsBtn.addEventListener('click', () => {
                    analyticsTab = 'insights';
                    insightsBtn.classList.add('active');
                    if (reportsBtn) reportsBtn.classList.remove('active');
                    if (teamBtn) teamBtn.classList.remove('active');
                    renderAnalyticsHub(featureBody);
                });
            }
            if (reportsBtn) {
                reportsBtn.addEventListener('click', () => {
                    analyticsTab = 'reports';
                    reportsBtn.classList.add('active');
                    if (insightsBtn) insightsBtn.classList.remove('active');
                    if (teamBtn) teamBtn.classList.remove('active');
                    renderAnalyticsHub(featureBody);
                });
            }
            if (teamBtn) {
                teamBtn.addEventListener('click', () => {
                    analyticsTab = 'team';
                    teamBtn.classList.add('active');
                    if (insightsBtn) insightsBtn.classList.remove('active');
                    if (reportsBtn) reportsBtn.classList.remove('active');
                    renderAnalyticsHub(featureBody);
                });
            }
        }
    }
    
    scriptPanel.style.display = 'none';
    featurePanel.style.display = 'block';
    
    if (featureBody) {
        if (featureType === 'calendar') renderCalendarPanel(featureBody);
        else if (featureType === 'tasks') renderTasksPanel(featureBody);
        else if (featureType === 'analytics') renderAnalyticsHub(featureBody);
        else if (featureType === 'shortcuts') renderShortcutsPanel(featureBody);
        else if (featureType === 'notepad') {
            showToast('📝 Notes feature coming soon!', 'info');
            featurePanel.style.display = 'none';
            scriptPanel.style.display = 'block';
        }
    }
}

function hideFeaturePanel() {
    const featurePanel = getEl('featurePanel');
    const scriptPanel = getEl('scriptPanel');
    if (featurePanel) featurePanel.style.display = 'none';
    if (scriptPanel) scriptPanel.style.display = 'block';
}

function refreshCurrentView() {
    const body = getEl('featurePanelBody');
    if (!body) return;
    if (currentView === 'calendar') renderCalendarPanel(body);
    else if (currentView === 'tasks') renderTasksPanel(body);
    else if (currentView === 'analytics') renderAnalyticsHub(body);
    else if (currentView === 'shortcuts') renderShortcutsPanel(body);
}

// ============================================================
// ANALYTICS HUB WITH ALL TABS
// ============================================================

function renderAnalyticsHub(container) {
    if (!container) return;
    
    if (analyticsTab === 'insights') {
        renderAnalyticsInsights(container);
    } else if (analyticsTab === 'reports') {
        renderAnalyticsReports(container);
    } else if (analyticsTab === 'team') {
        renderAnalyticsTeam(container);
    }
}

// ============================================================
// ANALYTICS - INSIGHTS TAB
// ============================================================

function renderAnalyticsInsights(container) {
    let total = 0, hTransfers = 0, wCallbacks = 0, completedCount = 0, pendingCount = 0, canceledCount = 0;
    let statusCounts = {};
    let dailyData = {};
    
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(a => {
                total++;
                const status = getStatus(a);
                statusCounts[status] = (statusCounts[status] || 0) + 1;
                if (status === 'Hot Transfer') hTransfers++;
                else if (status === 'Warm Callback') wCallbacks++;
                else if (status === 'Completed') completedCount++;
                else if (status === 'Pending') pendingCount++;
                else if (status === 'Canceled') canceledCount++;
                dailyData[date] = (dailyData[date] || 0) + 1;
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
            
            <div class="analytics-filters slide-up">
                <label>Date Range</label>
                <input type="date" id="analyticsStartDate" value="${getTodayStr()}" />
                <input type="date" id="analyticsEndDate" value="${getTodayStr()}" />
                <label>View</label>
                <select id="analyticsViewSelect">
                    <option value="overview">Overview</option>
                    <option value="status">By Status</option>
                </select>
                <button id="analyticsApplyFilters" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-filter"></i> Apply</button>
                <button id="analyticsExportPDF" class="btn-icon" style="background:var(--secondary); color:white;"><i class="fas fa-file-pdf"></i> Export PDF</button>
            </div>
            
            <div class="report-metrics scale-in">
                <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700;">${total}</div><div class="metric-label">Total Pipeline</div></div>
                <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:#dc2626;">${hTransfers}</div><div class="metric-label">🔥 Hot Transfers</div></div>
                <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--warning);">${wCallbacks}</div><div class="metric-label">📞 Warm Callbacks</div></div>
                <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--success);">${completedCount}</div><div class="metric-label">✅ Completed</div></div>
                <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--text-muted);">${pendingCount}</div><div class="metric-label">⏳ Pending</div></div>
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
        initAnalyticsCharts(dailyData, statusCounts);
    }, 200);

    const applyBtn = getEl('analyticsApplyFilters');
    const exportBtn = getEl('analyticsExportPDF');
    if (applyBtn) applyBtn.addEventListener('click', () => showToast('Filters applied', 'info'));
    if (exportBtn) exportBtn.addEventListener('click', () => showToast('PDF export coming soon!', 'info'));
}

// ============================================================
// ANALYTICS - REPORTS TAB
// ============================================================

function renderAnalyticsReports(container) {
    let total = 0, completedCount = 0, hTransfers = 0, wCallbacks = 0;
    let dailyData = {};
    let assignedStats = {};
    
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(a => {
                total++;
                const status = getStatus(a);
                if (status === 'Completed') completedCount++;
                if (status === 'Hot Transfer') hTransfers++;
                if (status === 'Warm Callback') wCallbacks++;
                dailyData[date] = (dailyData[date] || 0) + 1;
                
                const assigned = a.assigned || 'Unassigned';
                assignedStats[assigned] = (assignedStats[assigned] || 0) + 1;
            });
        }
    }

    const conversionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const avgScore = getAverageScore();

    container.innerHTML = `
        <div class="analytics-container fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:8px;">
                <h3><i class="fas fa-chart-line"></i> Advanced Reports</h3>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button id="reportsExportCSV" class="btn-icon" style="background:var(--success); color:white;"><i class="fas fa-file-csv"></i> Export CSV</button>
                    <button id="reportsExportPDF" class="btn-icon" style="background:var(--secondary); color:white;"><i class="fas fa-file-pdf"></i> Export PDF</button>
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
            
            <div class="feature-card scale-in">
                <h4>📋 Detailed Breakdown</h4>
                <div style="overflow-x:auto; margin-top:8px;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border-color);">
                                <th style="padding:8px; text-align:left;">Metric</th>
                                <th style="padding:8px; text-align:center;">Count</th>
                                <th style="padding:8px; text-align:center;">Percentage</th>
                                <th style="padding:8px; text-align:center;">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(assignedStats).map(([name, count]) => `
                                <tr style="border-bottom:1px solid var(--border-color);">
                                    <td style="padding:8px; font-weight:500;">${name}</td>
                                    <td style="padding:8px; text-align:center;">${count}</td>
                                    <td style="padding:8px; text-align:center;">${Math.round((count/total)*100)}%</td>
                                    <td style="padding:8px; text-align:center;">${count > total/2 ? '📈' : count > total/4 ? '➡️' : '📉'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const trendCtx = getEl('reportsTrendChart')?.getContext('2d');
        if (trendCtx) {
            const dates = Object.keys(dailyData).sort().slice(-7);
            const values = dates.map(d => dailyData[d]);
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: dates.map(d => formatDate(d)),
                    datasets: [{ label: 'Appointments', data: values, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }
        
        const assignedCtx = getEl('reportsAssignedChart')?.getContext('2d');
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

    const exportCSV = getEl('reportsExportCSV');
    const exportPDF = getEl('reportsExportPDF');
    if (exportCSV) exportCSV.addEventListener('click', () => showToast('CSV export coming soon!', 'info'));
    if (exportPDF) exportPDF.addEventListener('click', () => showToast('PDF export coming soon!', 'info'));
}

// ============================================================
// ANALYTICS - TEAM TAB
// ============================================================

function renderAnalyticsTeam(container) {
    let teamStats = {};
    TEAM_MEMBERS.forEach(member => {
        teamStats[member.id] = {
            ...member,
            appointments: 0,
            completed: 0,
            hotTransfers: 0,
            warmCallbacks: 0,
            score: 0
        };
    });

    let totalAppts = 0;
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(a => {
                totalAppts++;
                const assigned = a.assigned || 'unassigned';
                const status = getStatus(a);
                
                if (teamStats[assigned]) {
                    teamStats[assigned].appointments++;
                    if (status === 'Completed') teamStats[assigned].completed++;
                    if (status === 'Hot Transfer') teamStats[assigned].hotTransfers++;
                    if (status === 'Warm Callback') teamStats[assigned].warmCallbacks++;
                    teamStats[assigned].score += calculateLeadScore(a);
                }
            });
        }
    }

    Object.values(teamStats).forEach(member => {
        if (member.appointments > 0) {
            member.score = Math.round(member.score / member.appointments);
        }
        member.conversionRate = member.appointments > 0 ? Math.round((member.completed / member.appointments) * 100) : 0;
    });

    const topPerformer = Object.values(teamStats).sort((a, b) => b.score - a.score)[0];

    container.innerHTML = `
        <div class="analytics-container fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:8px;">
                <h3><i class="fas fa-users"></i> Team Performance Dashboard</h3>
                <span class="version-chip"><i class="fas fa-crown"></i> ${topPerformer ? `${topPerformer.avatar} ${topPerformer.name} is leading!` : 'No data yet'}</span>
            </div>
            
            <div class="report-metrics scale-in">
                <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700;">${TEAM_MEMBERS.length}</div><div class="metric-label">👥 Team Members</div></div>
                <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--success);">${totalAppts}</div><div class="metric-label">📋 Total Appointments</div></div>
                <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--primary);">${topPerformer ? topPerformer.score : 0}</div><div class="metric-label">🏆 Top Score</div></div>
                <div class="metric-card"><div class="metric-value" style="font-size:1.8rem; font-weight:700; color:var(--warning);">${topPerformer ? topPerformer.conversionRate : 0}%</div><div class="metric-label">📈 Top Conversion</div></div>
            </div>
            
            <div class="feature-card slide-up">
                <h4>👤 Team Member Performance</h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:12px;">
                    ${Object.values(teamStats).map(member => `
                        <div style="background:var(--bg-primary); border-radius:12px; padding:16px; border-left: 4px solid ${member.color}; transition:all 0.3s ease;">
                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                                <span style="font-size:2rem;">${member.avatar}</span>
                                <div>
                                    <div style="font-weight:600;">${member.name}</div>
                                    <div style="font-size:0.7rem; color:var(--text-muted);">${member.role}</div>
                                </div>
                                ${member.id === topPerformer?.id ? '<span style="margin-left:auto; font-size:1.2rem;">👑</span>' : ''}
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:0.8rem;">
                                <span>📋 ${member.appointments}</span>
                                <span>✅ ${member.completed}</span>
                                <span>🔥 ${member.hotTransfers}</span>
                                <span>📞 ${member.warmCallbacks}</span>
                                <span style="font-weight:600;">Score: ${member.score}</span>
                                <span style="font-weight:600;">Conv: ${member.conversionRate}%</span>
                            </div>
                            <div style="margin-top:8px; background:var(--bg-card); height:4px; border-radius:4px; overflow:hidden;">
                                <div style="background:${member.color}; width:${member.conversionRate}%; height:100%; border-radius:4px; transition:width 0.8s ease;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="feature-card scale-in">
                <h4>📊 Team Performance Chart</h4>
                <div class="chart-container" style="height:200px;">
                    <canvas id="teamChart"></canvas>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const teamCtx = getEl('teamChart')?.getContext('2d');
        if (teamCtx) {
            const labels = Object.values(teamStats).map(m => m.name);
            const scores = Object.values(teamStats).map(m => m.score);
            const colors = Object.values(teamStats).map(m => m.color);
            new Chart(teamCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Lead Score',
                        data: scores,
                        backgroundColor: colors.map(c => c + '80'),
                        borderColor: colors,
                        borderWidth: 2,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    }, 200);
}

// ============================================================
// ANALYTICS - CHART HELPERS
// ============================================================

function initAnalyticsCharts(dailyData, statusCounts) {
    Object.values(chartInstances).forEach(chart => { if (chart) chart.destroy(); });
    chartInstances = {};
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#06b6d4', '#ec4899'];

    const trendCtx = getEl('trendChart')?.getContext('2d');
    if (trendCtx) {
        const dates = Object.keys(dailyData).sort();
        const values = dates.map(d => dailyData[d]);
        chartInstances.trend = new Chart(trendCtx, {
            type: 'line',
            data: { labels: dates.map(d => formatDate(d)), datasets: [{ label: 'Appointments', data: values, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    }

    const donutCtx = getEl('donutChart')?.getContext('2d');
    if (donutCtx) {
        const labels = Object.keys(statusCounts);
        const data = Object.values(statusCounts);
        const backgroundColors = labels.map((_, i) => colors[i % colors.length]);
        chartInstances.donut = new Chart(donutCtx, {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: backgroundColors, borderWidth: 2, borderColor: 'var(--bg-secondary)' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } } }, cutout: '60%' }
        });
    }

    const barCtx = getEl('barChart')?.getContext('2d');
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
        chartInstances.bar = new Chart(barCtx, {
            type: 'bar',
            data: { labels: weekDays, datasets: [{ label: 'This Week', data: weekData, backgroundColor: 'rgba(59,130,246,0.7)', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    }
}

// ============================================================
// SHORTCUTS PANEL
// ============================================================

function renderShortcutsPanel(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="shortcuts-container fade-in">
            <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts Manager</h3>
            <p style="color:var(--text-muted); margin-bottom:16px;">View and customize keyboard shortcuts for quick access to features.</p>
            <div style="margin-bottom:16px; display:flex; gap:8px; flex-wrap:wrap;">
                <button id="shortcutsResetDefaultsBtn" class="btn-icon" style="background:var(--warning); color:#1e293b;"><i class="fas fa-undo"></i> Reset Defaults</button>
                <span style="font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center;">⚠️ Conflicts are highlighted in red</span>
            </div>
            <div id="shortcutsListContainer" style="max-height:450px; overflow-y:auto;"></div>
        </div>
    `;
    renderShortcutsList();
    const resetBtn = getEl('shortcutsResetDefaultsBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetShortcutsToDefaults);
}

// ============================================================
// TASKS PANEL
// ============================================================

function renderTasksPanel(container) {
    if (!container) return;
    const filteredTasks = taskFilter === 'all' ? tasks : tasks.filter(t => !t.completed);
    
    container.innerHTML = `
        <div class="tasks-section fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                <h3><i class="fas fa-tasks"></i> Follow-up Tasks</h3>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <button id="taskFilterAll" class="view-btn ${taskFilter === 'all' ? 'active' : ''}">All</button>
                    <button id="taskFilterPending" class="view-btn ${taskFilter === 'pending' ? 'active' : ''}">Pending</button>
                    <button id="taskFilterToday" class="view-btn ${taskFilter === 'today' ? 'active' : ''}">Today</button>
                    <button id="addNewTaskBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> New</button>
                </div>
            </div>
            <div class="tasks-list">
                ${filteredTasks.length === 0 ? '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No tasks found</p></div>' : 
                filteredTasks.map(t => `
                    <div class="task-card ${t.completed ? 'task-completed' : ''}">
                        <div class="task-row">
                            <div class="task-title">
                                <input type="checkbox" ${t.completed ? 'checked' : ''} class="toggle-task-checkbox" data-id="${t.id}" />
                                <span>${escapeHtml(t.description)}</span>
                            </div>
                            <div class="task-actions">
                                <button class="delete-task-btn" data-id="${t.id}" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="task-meta">
                            ${t.dueDate ? `<span><i class="far fa-calendar"></i> Due: ${formatDate(t.dueDate)}</span>` : ''}
                            <span class="task-priority-${t.priority || 'medium'}">${t.priority || 'Medium'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const filterAll = getEl('taskFilterAll');
    const filterPending = getEl('taskFilterPending');
    const filterToday = getEl('taskFilterToday');
    const addBtn = getEl('addNewTaskBtn');
    
    if (filterAll) filterAll.addEventListener('click', () => { taskFilter = 'all'; renderTasksPanel(container); });
    if (filterPending) filterPending.addEventListener('click', () => { taskFilter = 'pending'; renderTasksPanel(container); });
    if (filterToday) filterToday.addEventListener('click', () => { taskFilter = 'today'; renderTasksPanel(container); });
    if (addBtn) addBtn.addEventListener('click', () => {
        const desc = prompt('Enter task description:');
        if (desc && desc.trim()) {
            const dueDate = prompt('Enter due date (YYYY-MM-DD) or leave blank:', getTodayStr());
            addTask(desc.trim(), dueDate || '', 'medium', null);
            refreshCurrentView();
            showToast('Task added!', 'success');
        }
    });

    container.querySelectorAll('.toggle-task-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            toggleTaskComplete(cb.getAttribute('data-id'));
            setTimeout(() => renderTasksPanel(container), 100);
        });
    });

    container.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this task?')) {
                deleteTask(btn.getAttribute('data-id'));
                renderTasksPanel(container);
            }
        });
    });
}

// ============================================================
// CALENDAR PANEL
// ============================================================

function renderCalendarPanel(container) {
    if (!container) return;
    if (calendarView === 'list') {
        renderListView(container);
        return;
    }
    
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let daysHtml = '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(d => daysHtml += `<div class="day-name">${d}</div>`);
    for (let i = 0; i < firstDay; i++) daysHtml += `<div class="calendar-day empty"></div>`;
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const appts = appointments[dateStr]?.reports || [];
        const count = appts.length;
        const isSelected = dateStr === selectedCalDate;
        let indicatorHtml = '';
        if (count > 0) {
            const dots = appts.slice(0, 3).map(a => {
                const s = getStatus(a);
                const colors = { 'Hot Transfer': '#dc2626', 'Completed': 'var(--success)', 'Warm Callback': 'var(--warning)', 'Pending': 'var(--text-muted)' };
                return `<span class="appt-dot" style="background:${colors[s] || 'var(--primary)'};"></span>`;
            }).join('');
            indicatorHtml = `<div class="appt-indicator">${dots}</div>`;
        }
        daysHtml += `
            <div class="calendar-day ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
                <span class="day-number">${d}</span>
                ${indicatorHtml}
                ${count > 0 ? `<span class="appt-badge">${count}</span>` : ''}
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
        <div class="calendar-section fade-in">
            <div class="calendar-nav">
                <h3><i class="fas fa-calendar-alt"></i> ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</h3>
                <div class="calendar-nav-actions">
                    <button id="calPrevBtn" class="btn-icon">Prev</button>
                    <button id="calTodayBtn" class="btn-icon">Today</button>
                    <button id="calNextBtn" class="btn-icon">Next</button>
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
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                    <h4>Appointments (${selectedAppts.length})</h4>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button id="quickAddCalBtn" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> Add Lead</button>
                        <button id="switchToListView" class="btn-icon"><i class="fas fa-list"></i> List View</button>
                    </div>
                </div>
                <div class="appointments-list" id="appointmentsList">
                    ${selectedAppts.map(a => {
                        const score = calculateLeadScore(a);
                        const isHotTransfer = getStatus(a) === 'Hot Transfer';
                        return `
                            <div class="appointment-card" data-id="${a.id}" data-date="${selectedCalDate}" style="border-left: 4px solid ${isHotTransfer ? '#dc2626' : 'var(--border-color)'};">
                                <i class="fas fa-grip-vertical drag-handle" aria-hidden="true"></i>
                                <div class="card-row">
                                    <div class="business-name" onclick="showAppointmentDetail('${a.id}')">
                                        <strong>${escapeHtml(a.business)}</strong>
                                        <span class="status-tag ${getStatusClassSmall(getStatus(a))}">${getStatus(a)}</span>
                                        <span class="score-badge ${getScoreColor(score)}">${score} Pts</span>
                                    </div>
                                    <div class="card-actions">
                                        <button class="delete-appt-btn" data-id="${a.id}" title="Delete"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                <div style="font-size:0.8rem; margin-top:4px; display:flex; gap:12px; flex-wrap:wrap;">
                                    <span>Contact: ${escapeHtml(a.contactName)}</span>
                                    ${a.phone ? `<span>📞 ${escapeHtml(a.phone)}</span>` : ''}
                                    ${a.time ? `<span>🕐 ${escapeHtml(a.time)}</span>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('.calendar-day[data-date]').forEach(el => {
        el.addEventListener('click', () => { selectedCalDate = el.getAttribute('data-date'); renderCalendarPanel(container); });
    });
    
    const prevBtn = getEl('calPrevBtn');
    const nextBtn = getEl('calNextBtn');
    const todayBtn = getEl('calTodayBtn');
    const addBtn = getEl('quickAddCalBtn');
    const listBtn = getEl('switchToListView');
    
    if (prevBtn) prevBtn.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() - 1); renderCalendarPanel(container); });
    if (nextBtn) nextBtn.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() + 1); renderCalendarPanel(container); });
    if (todayBtn) todayBtn.addEventListener('click', () => { currentCalDate = new Date(); selectedCalDate = getTodayStr(); renderCalendarPanel(container); });
    if (addBtn) addBtn.addEventListener('click', () => openQuickReportWithDate(selectedCalDate));
    if (listBtn) listBtn.addEventListener('click', () => { calendarView = 'list'; renderCalendarPanel(container); });

    container.querySelectorAll('.delete-appt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this appointment permanently?')) {
                deleteAppointment(selectedCalDate, btn.getAttribute('data-id'));
                renderCalendarPanel(container);
                showToast('Appointment deleted', 'info');
            }
        });
    });

    const appointmentsList = getEl('appointmentsList');
    if (appointmentsList) {
        new Sortable(appointmentsList, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: function() {
                const items = appointmentsList.querySelectorAll('.appointment-card');
                const newOrder = [];
                items.forEach(item => {
                    const id = item.getAttribute('data-id');
                    if (id) newOrder.push(id);
                });
                if (appointments[selectedCalDate]) {
                    const sortedReports = [];
                    newOrder.forEach(id => {
                        const found = appointments[selectedCalDate].reports.find(r => r.id === id);
                        if (found) sortedReports.push(found);
                    });
                    appointments[selectedCalDate].reports = sortedReports;
                }
                showToast('Appointments reordered', 'info');
            }
        });
    }
}

// ============================================================
// LIST VIEW
// ============================================================

function renderListView(container) {
    const allAppointments = [];
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(appt => {
                allAppointments.push({ ...appt, dateKey: date });
            });
        }
    }
    allAppointments.sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));

    container.innerHTML = `
        <div class="list-view-container fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                <h4><i class="fas fa-list"></i> All Appointments (${allAppointments.length})</h4>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button id="switchToCalendarView" class="btn-icon"><i class="fas fa-calendar-alt"></i> Calendar View</button>
                    <button id="addApptFromList" class="btn-icon" style="background:var(--primary); color:white;"><i class="fas fa-plus"></i> Add</button>
                </div>
            </div>
            <div class="appointments-toolbar">
                <div class="search-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" id="listSearchInput" placeholder="Search appointments..." />
                </div>
                <select id="listStatusFilter"><option value="all">All Status</option>${STATUS_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
                <select id="listTagFilter"><option value="all">All Tags</option>${TAG_OPTIONS.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select>
            </div>
            <div class="list-header">
                <span>Business</span><span>Contact</span><span>Status</span><span>Date</span><span>Score</span><span>Actions</span>
            </div>
            <div id="listItemsContainer">
                ${allAppointments.map(appt => `
                    <div class="list-item" onclick="showAppointmentDetail('${appt.id}')">
                        <span class="list-business"><strong>${escapeHtml(appt.business)}</strong></span>
                        <span class="list-contact">${escapeHtml(appt.contactName)}</span>
                        <span class="list-status ${getStatusClassSmall(getStatus(appt))}">${getStatus(appt)}</span>
                        <span>${formatDate(appt.dateKey)}</span>
                        <span><span class="score-badge ${getScoreColor(calculateLeadScore(appt))}">${calculateLeadScore(appt)}</span></span>
                        <span><button class="delete-appt-btn" data-id="${appt.id}" data-date="${appt.dateKey}" style="background:none; border:none; cursor:pointer; color:var(--danger);"><i class="fas fa-trash"></i></button></span>
                    </div>
                `).join('')}
            </div>
            ${allAppointments.length === 0 ? '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No appointments found</p></div>' : ''}
        </div>
    `;

    const calendarBtn = getEl('switchToCalendarView');
    const addBtn = getEl('addApptFromList');
    const searchInput = getEl('listSearchInput');
    const statusFilter = getEl('listStatusFilter');
    const tagFilter = getEl('listTagFilter');
    
    if (calendarBtn) calendarBtn.addEventListener('click', () => { calendarView = 'calendar'; renderCalendarPanel(container); });
    if (addBtn) addBtn.addEventListener('click', () => openQuickReportWithDate(getTodayStr()));
    if (searchInput) searchInput.addEventListener('input', filterListItems);
    if (statusFilter) statusFilter.addEventListener('change', filterListItems);
    if (tagFilter) tagFilter.addEventListener('change', filterListItems);

    container.querySelectorAll('.delete-appt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this appointment?')) {
                deleteAppointment(btn.getAttribute('data-date'), btn.getAttribute('data-id'));
                renderListView(container);
                showToast('Appointment deleted', 'info');
            }
        });
    });
}

function filterListItems() {
    const searchInput = getEl('listSearchInput');
    const statusFilter = getEl('listStatusFilter');
    const tagFilter = getEl('listTagFilter');
    
    const search = searchInput?.value?.toLowerCase() || '';
    const statusFilterValue = statusFilter?.value || 'all';
    const tagFilterValue = tagFilter?.value || 'all';
    const items = document.querySelectorAll('#listItemsContainer .list-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const status = item.querySelector('.list-status')?.textContent || '';
        let show = true;
        if (search && !text.includes(search)) show = false;
        if (statusFilterValue !== 'all' && status !== statusFilterValue) show = false;
        item.style.display = show ? 'grid' : 'none';
    });
}

// ============================================================
// BULK ACTIONS
// ============================================================

function openBulkActions() {
    const modal = getEl('bulkActionsModal');
    const container = getEl('bulkSelectionContainer');
    if (!modal || !container) return;
    modal.style.display = 'flex';
    selectedAppointments = new Set();
    let html = '';
    for (let date in appointments) {
        if (appointments[date].reports) {
            appointments[date].reports.forEach(appt => {
                html += `
                    <div class="bulk-item">
                        <input type="checkbox" class="bulk-checkbox" value="${appt.id}" data-date="${date}" />
                        <span><strong>${escapeHtml(appt.business)}</strong> - ${escapeHtml(appt.contactName)} (${getStatus(appt)})</span>
                    </div>
                `;
            });
        }
    }
    container.innerHTML = html || '<p style="color:var(--text-muted);">No appointments found</p>';
    container.querySelectorAll('.bulk-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) selectedAppointments.add(cb.value);
            else selectedAppointments.delete(cb.value);
        });
    });
}

// ============================================================
// APPLICATION INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    // Setup Tools Menu
    const toolsHeader = getEl('toolsHeader');
    const toolsMenu = getEl('toolsMenu');
    const toolsChevron = getEl('toolsChevron');
    
    if (toolsHeader && toolsMenu && toolsChevron) {
        if (toolsOpen) { toolsMenu.classList.add('open'); toolsChevron.classList.add('rotated'); }
        toolsHeader.addEventListener('click', () => {
            toolsOpen = !toolsOpen;
            toolsMenu.classList.toggle('open');
            toolsChevron.classList.toggle('rotated');
            localStorage.setItem('toolsMenuOpen', toolsOpen);
        });
    }

    // Menu Toggle
    const menuToggle = getEl('menuToggleBtn');
    const sidebar = getEl('mainSidebar');
    const mainContent = getEl('mainContent');
    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            mainContent.classList.toggle('expanded');
        });
    }

    // ESC Key Handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            handleEscapeKey();
        }
    });

    // Tool Items
    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            if (tool === 'notepad') showToast('📝 Notes feature coming soon!', 'info');
            else if (tool === 'calendar') showFeaturePanel('calendar', '📅 Appointment & Handoff Calendar');
            else if (tool === 'tasks') showFeaturePanel('tasks', '📋 Follow-up Tasks Manager');
            else if (tool === 'analytics') {
                analyticsTab = 'insights';
                showFeaturePanel('analytics', '📊 Analytics Hub');
            }
            else if (tool === 'shortcuts') showFeaturePanel('shortcuts', '⌨️ Keyboard Shortcuts');
            else if (tool === 'theme') { document.body.classList.toggle('dark'); showToast('Theme toggled', 'info'); }
            else if (tool === 'help') showToast('Handoffs: Warm Callback, Completed, Canceled, Pending, Hot Transfer - All integrated!', 'info');
            else if (tool === 'reset') {
                if (confirm('⚠️ This will clear all local data and reset the app. Continue?')) {
                    localStorage.clear();
                    if (currentUser) db.collection('users').doc(currentUser.uid).delete();
                    location.reload();
                }
            } else if (tool === 'export') exportToCSV();
        });
    });

    // Close Feature Panel
    const closeFeatureBtn = getEl('closeFeaturePanelBtn');
    if (closeFeatureBtn) closeFeatureBtn.addEventListener('click', () => {
        hideFeaturePanel();
        loadScript('opening');
    });

    // Smart Import
    const quickReportBtn = getEl('quickReportBtn');
    const parseBtn = getEl('parseImportBtn');
    const saveImportBtn = getEl('saveImportBtn');
    const closeImportBtn = getEl('closeImportBtn');
    
    if (quickReportBtn) quickReportBtn.addEventListener('click', openSmartImport);
    if (parseBtn) parseBtn.addEventListener('click', () => {
        const textArea = getEl('importTextArea');
        if (!textArea) return;
        const text = textArea.value;
        if (!text.trim()) { showToast('Please paste some text to parse', 'warning'); return; }
        const { result, confidence } = parseAppointmentText(text);
        renderParsedPreview(result, confidence);
    });
    if (saveImportBtn) saveImportBtn.addEventListener('click', saveImportedAppointment);
    if (closeImportBtn) closeImportBtn.addEventListener('click', closeSmartImport);

    // Appointment Detail
    const copyBtn = getEl('apptCopyBtn');
    const editBtn = getEl('apptEditBtn');
    const deleteBtn = getEl('apptDeleteBtn');
    const closeDetailBtn = getEl('apptCloseBtn');
    
    if (copyBtn) copyBtn.addEventListener('click', () => {
        const appt = getAppointmentById(currentAppointmentId);
        if (appt) copyToClipboard(`Business: ${appt.business}\nContact: ${appt.contactName}\nPhone: ${appt.phone || 'N/A'}\nStatus: ${getStatus(appt)}\nDate: ${formatDate(appt.date)}${appt.time ? `\nTime: ${appt.time}` : ''}${appt.notes ? `\nNotes: ${appt.notes}` : ''}`);
    });
    if (editBtn) editBtn.addEventListener('click', () => {
        const appt = getAppointmentById(currentAppointmentId);
        if (appt) {
            closeAppointmentDetail();
            openQuickReportWithDate(appt.date);
            setTimeout(() => {
                const businessInput = getEl('newApptBusiness');
                const contactInput = getEl('newApptContact');
                const phoneInput = getEl('newApptPhone');
                const timeInput = getEl('newApptTime');
                const statusSelect = getEl('newApptStatus');
                const notesInput = getEl('newApptNotes');
                if (businessInput) businessInput.value = appt.business;
                if (contactInput) contactInput.value = appt.contactName;
                if (phoneInput) phoneInput.value = appt.phone || '';
                if (timeInput) timeInput.value = appt.time || '';
                if (statusSelect) statusSelect.value = getStatus(appt);
                if (notesInput) notesInput.value = appt.notes || '';
                deleteAppointment(appt.date, appt.id);
            }, 100);
        }
    });
    if (deleteBtn) deleteBtn.addEventListener('click', () => {
        const appt = getAppointmentById(currentAppointmentId);
        if (appt && confirm('Delete this appointment permanently?')) {
            deleteAppointment(appt.date, appt.id);
            closeAppointmentDetail();
            showToast('Appointment deleted', 'info');
        }
    });
    if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeAppointmentDetail);

    // Script Editing
    const editScriptBtn = getEl('editScriptBtn');
    const saveScriptBtn = getEl('saveScriptBtn');
    const cancelEditBtn = getEl('cancelEditBtn');
    const copyScriptBtn = getEl('copyScriptBtn');
    const resetScriptBtn = getEl('resetScriptBtn');
    const favoriteScriptBtn = getEl('favoriteScriptBtn');
    
    if (editScriptBtn) editScriptBtn.addEventListener('click', startEdit);
    if (saveScriptBtn) saveScriptBtn.addEventListener('click', () => {
        const textarea = getEl('editTextarea');
        if (textarea) { saveScriptContent(textarea.value); finishEdit(); }
    });
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelEdit);
    if (copyScriptBtn) copyScriptBtn.addEventListener('click', () => {
        const script = scripts[currentScriptId];
        if (script) copyToClipboard(script.content);
    });
    if (resetScriptBtn) resetScriptBtn.addEventListener('click', () => {
        if (confirm('Reset this script to its original content?')) {
            if (currentUser && currentScriptId) {
                db.collection('users').doc(currentUser.uid).collection('scripts').doc(currentScriptId).set({
                    name: scripts[currentScriptId].name,
                    content: scripts[currentScriptId].content,
                    version: 1
                }, { merge: true }).then(() => { showToast('Script reset', 'info'); loadUserData(true); });
            }
        }
    });
    if (favoriteScriptBtn) favoriteScriptBtn.addEventListener('click', () => toggleFavorite(currentScriptId));

    // Bulk Actions
    const bulkActionsBtn = getEl('bulkActionsBtn');
    const closeBulkBtn = getEl('closeBulkModalBtn');
    const executeBulkBtn = getEl('executeBulkActionBtn');
    const bulkActionSelect = getEl('bulkActionSelect');
    
    if (bulkActionsBtn) bulkActionsBtn.addEventListener('click', openBulkActions);
    if (closeBulkBtn) closeBulkBtn.addEventListener('click', () => {
        const modal = getEl('bulkActionsModal');
        if (modal) modal.style.display = 'none';
    });
    if (executeBulkBtn) executeBulkBtn.addEventListener('click', () => {
        const action = bulkActionSelect?.value || 'status';
        const selected = Array.from(selectedAppointments);
        if (selected.length === 0) { showToast('Please select at least one appointment', 'warning'); return; }
        if (action === 'delete') {
            if (!confirm(`Delete ${selected.length} appointment(s)?`)) return;
            selected.forEach(id => {
                for (let date in appointments) {
                    if (appointments[date].reports) {
                        const found = appointments[date].reports.find(r => r.id === id);
                        if (found) { deleteAppointment(date, id); break; }
                    }
                }
            });
            showToast(`${selected.length} appointment(s) deleted`, 'success');
        } else if (action === 'status') {
            const statusSelect = getEl('bulkStatusSelect');
            const newStatus = statusSelect?.value || 'Pending';
            selected.forEach(id => {
                for (let date in appointments) {
                    if (appointments[date].reports) {
                        const found = appointments[date].reports.find(r => r.id === id);
                        if (found) { updateAppointment(date, id, { status: newStatus }); break; }
                    }
                }
            });
            showToast(`${selected.length} appointment(s) updated to ${newStatus}`, 'success');
        } else if (action === 'tag') {
            const tagSelect = getEl('bulkTagSelect');
            const tag = tagSelect?.value || '';
            selected.forEach(id => {
                for (let date in appointments) {
                    if (appointments[date].reports) {
                        const found = appointments[date].reports.find(r => r.id === id);
                        if (found) {
                            const tags = found.tags || [];
                            if (!tags.includes(tag)) { tags.push(tag); updateAppointment(date, id, { tags }); }
                            break;
                        }
                    }
                }
            });
            showToast(`Tag added to ${selected.length} appointment(s)`, 'success');
        } else if (action === 'export') {
            exportSelectedToCSV(selected);
        }
        const modal = getEl('bulkActionsModal');
        if (modal) modal.style.display = 'none';
        refreshCurrentView();
    });
    if (bulkActionSelect) bulkActionSelect.addEventListener('change', () => {
        const value = bulkActionSelect.value;
        const statusGroup = getEl('bulkStatusGroup');
        const tagGroup = getEl('bulkTagGroup');
        const options = getEl('bulkActionOptions');
        if (statusGroup) statusGroup.style.display = value === 'status' ? 'block' : 'none';
        if (tagGroup) tagGroup.style.display = value === 'tag' ? 'block' : 'none';
        if (options) options.style.display = (value === 'status' || value === 'tag') ? 'block' : 'none';
    });

    // Sign Out
    const signOutBtn = getEl('signOutBtn');
    if (signOutBtn) signOutBtn.addEventListener('click', signOut);

    // Refresh
    const refreshBtn = getEl('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', async () => {
        if (isRefreshing) return;
        isRefreshing = true;
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;
        try {
            showToast('Refreshing data...', 'info');
            await loadUserData(true);
            refreshCurrentView();
            showToast('Data refreshed!', 'success');
        } catch (error) { handleError(error, 'Refresh'); }
        finally {
            isRefreshing = false;
            refreshBtn.classList.remove('spinning');
            refreshBtn.disabled = false;
        }
    });

    // Add Script
    const addScriptBtn = getEl('addScriptBtnSide');
    if (addScriptBtn) addScriptBtn.addEventListener('click', () => {
        if (!currentUser) { showToast('Please sign in first', 'error'); return; }
        const name = prompt('Enter script name:');
        if (name && name.trim()) {
            const id = 'script_' + generateUniqueId();
            db.collection('users').doc(currentUser.uid).collection('scripts').doc(id).set({
                name: name.trim(),
                content: 'New script content...',
                version: 1,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => { showToast('Script created!', 'success'); loadUserData(true); })
            .catch(err => handleError(err, 'Creating script'));
        }
    });

    // Search Scripts
    const scriptSearch = getEl('scriptSearch');
    if (scriptSearch) scriptSearch.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.script-item').forEach(item => {
            const name = item.querySelector('.script-name')?.textContent?.toLowerCase() || '';
            item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Global Search
    const searchGlobalBtn = getEl('searchGlobalBtn');
    const globalSearchInput = getEl('globalSearchInput');
    const globalSearchClose = getEl('globalSearchCloseBtn');
    
    if (searchGlobalBtn) searchGlobalBtn.addEventListener('click', openGlobalSearch);
    if (globalSearchInput) globalSearchInput.addEventListener('input', (e) => performGlobalSearch(e.target.value));
    if (globalSearchClose) globalSearchClose.addEventListener('click', () => {
        const modal = getEl('globalSearchModal');
        if (modal) modal.style.display = 'none';
    });

    // CSV Upload
    const csvFileInput = getEl('csvFileInput');
    if (csvFileInput) csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const csvText = event.target.result;
                    const lines = csvText.split('\n').filter(line => line.trim());
                    if (lines.length > 0) {
                        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                        let imported = 0;
                        for (let i = 1; i < lines.length; i++) {
                            const values = lines[i].split(',').map(v => v.trim());
                            const data = {};
                            headers.forEach((h, idx) => data[h] = values[idx] || '');
                            if (data.name || data.business) {
                                addAppointment(
                                    data.date || getTodayStr(),
                                    data.business || data.company || 'Unknown Business',
                                    data.name || data.contact || 'Unknown Contact',
                                    'Owner',
                                    data.phone || data.mobile || '',
                                    data.time || '',
                                    data.notes || '',
                                    'Daniel',
                                    null,
                                    data.status || 'Pending'
                                );
                                imported++;
                            }
                        }
                        showToast(`Imported ${imported} appointments from CSV!`, 'success');
                        refreshCurrentView();
                    }
                } catch (err) { showToast('Error parsing CSV: ' + err.message, 'error'); }
            };
            reader.readAsText(file);
        }
        e.target.value = '';
    });

    // Export functions
    function exportToCSV() {
        let csv = 'Business,Contact,Phone,Email,Date,Time,Status,Notes,Assigned\n';
        for (let date in appointments) {
            if (appointments[date].reports) {
                appointments[date].reports.forEach(appt => {
                    csv += `"${appt.business}","${appt.contactName}","${appt.phone || ''}","${appt.email || ''}","${appt.date}","${appt.time || ''}","${getStatus(appt)}","${appt.notes || ''}","${appt.assigned || 'Daniel'}"\n`;
                });
            }
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments_${getTodayStr()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('CSV exported!', 'success');
    }

    function exportSelectedToCSV(selectedIds) {
        let csv = 'Business,Contact,Phone,Email,Date,Time,Status,Notes,Assigned\n';
        selectedIds.forEach(id => {
            for (let date in appointments) {
                if (appointments[date].reports) {
                    const appt = appointments[date].reports.find(r => r.id === id);
                    if (appt) {
                        csv += `"${appt.business}","${appt.contactName}","${appt.phone || ''}","${appt.email || ''}","${appt.date}","${appt.time || ''}","${getStatus(appt)}","${appt.notes || ''}","${appt.assigned || 'Daniel'}"\n`;
                        break;
                    }
                }
            }
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected_appointments_${getTodayStr()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`${selectedIds.length} appointment(s) exported!`, 'success');
    }

    // History button
    const historyBtn = getEl('historyBtn');
    if (historyBtn) historyBtn.addEventListener('click', () => showToast('Version history coming soon!', 'info'));

    // Keyboard Shortcuts - Global
    document.addEventListener('keydown', (e) => {
        // Script shortcuts (1-9)
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            const visible = getOrderedVisible();
            if (index < visible.length) {
                loadScript(visible[index]);
                showToast(`Switched to: ${scripts[visible[index]]?.name}`, 'info');
            }
        }

        // Check for custom shortcuts
        for (const [action, shortcut] of Object.entries(shortcuts)) {
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

    function handleShortcutAction(action) {
        switch(action) {
            case 'Smart Import': openSmartImport(); break;
            case 'Appointment Calendar': showFeaturePanel('calendar', '📅 Appointment & Handoff Calendar'); break;
            case 'Call Scripts': hideFeaturePanel(); loadScript('opening'); break;
            case 'Global Search': openGlobalSearch(); break;
            case 'Quick Add Appointment': openQuickReportWithDate(getTodayStr()); break;
            case 'Floating Notepad': showToast('📝 Notes feature coming soon!', 'info'); break;
            case 'Analytics Hub': analyticsTab = 'insights'; showFeaturePanel('analytics', '📊 Analytics Hub'); break;
            case 'Keyboard Shortcuts': showFeaturePanel('shortcuts', '⌨️ Keyboard Shortcuts'); break;
            case 'Export to CSV': exportToCSV(); break;
            case 'Toggle Theme': document.body.classList.toggle('dark'); showToast('Theme toggled', 'info'); break;
            case 'Refresh Data': { const btn = getEl('refreshBtn'); if (btn) btn.click(); break; }
            case 'Bulk Actions': openBulkActions(); break;
            case 'Close Panel': handleEscapeKey(); break;
            default: showToast(`Action: ${action}`, 'info');
        }
    }

    // Auth state listener
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            updateSidebarProfile(currentUser);
            await loadUserData();
        } else {
            showAuthModal();
        }
    });

    // Close modals on overlay click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    });

    // Close modals with Escape key (already handled above)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                if (modal.style.display !== 'none') modal.style.display = 'none';
            });
            if (isEditing) cancelEdit();
        }
    });

    console.log('🚀 ScriptFlow Pro initialized successfully!');
    console.log('📊 Handoff statuses integrated:', STATUS_OPTIONS.join(', '));
    console.log('🎯 Drag & drop enabled for scripts and appointments');
    console.log('✨ Smart import ready with field validation');
    console.log('⌨️ Keyboard shortcuts loaded:', Object.keys(shortcuts).length);
    console.log('📈 Analytics tabs: Insights, Reports, Team');
    console.log('🔑 Press ESC to return to Opening Script');
});
