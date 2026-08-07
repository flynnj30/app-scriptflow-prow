// ================================================================
// FIX: Ensure all global functions are properly exposed
// ================================================================

// Make sure these functions are accessible globally
window.showAppointmentDetail = showAppointmentDetail;
window.closeAppointmentDetail = closeAppointmentDetail;
window.openContactDetail = openContactDetail;
window.editAppointment = editAppointment;
window.rescheduleAppointment = rescheduleAppointment;
window.completeAppointment = completeAppointment;
window.cancelAppointment = cancelAppointment;
window.openShortcutEdit = openShortcutEdit;
window.loadScript = function(id) { Scripts.loadScript(id); };

// ================================================================
// FIX: Update sticky positioning with proper resize handling
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

// Debounced resize handler
const debouncedUpdateSticky = Utils.debounce(updateStickyPositions, 100);

// Listen for scroll to add shadow effect
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

// Update on load and resize
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateStickyPositions, 100);
});

window.addEventListener('resize', debouncedUpdateSticky);
window.addEventListener('scroll', handleHeroScroll);

// ================================================================
// FIX: Objection Handler initialization with retry
// ================================================================

function initObjectionHandler() {
    if (typeof ObjectionHandler !== 'undefined' && ObjectionHandler) {
        try {
            if (typeof ObjectionHandler.init === 'function') {
                ObjectionHandler.init();
                console.log('🎯 Objection Handler initialized');
                return true;
            }
        } catch (e) {
            console.warn('Objection Handler init error:', e);
        }
    }
    
    // Retry after delay
    setTimeout(function() {
        if (typeof ObjectionHandler !== 'undefined' && ObjectionHandler) {
            try {
                if (typeof ObjectionHandler.init === 'function') {
                    ObjectionHandler.init();
                    console.log('🎯 Objection Handler initialized (retry)');
                }
            } catch (e) {
                console.warn('Objection Handler retry failed:', e);
            }
        }
    }, 500);
    
    return false;
}

// Call in initApp
function initApp() {
    console.log('🚀 Initializing ScriptFlow Pro...');
    
    // ... existing code ...
    
    // Initialize Objection Handler (modal mode)
    initObjectionHandler();
    
    // ... rest of initApp ...
}

// ================================================================
// FIX: renderScriptActions - proper event binding
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
        button.innerHTML = `<i class="fas ${btn.icon}"></i> ${btn.text}`;
        container.appendChild(button);
    });
    
    updateFavoriteStarUI();
    attachScriptActionEvents();
}

function attachScriptActionEvents() {
    // Edit
    const editBtn = document.getElementById('editScriptBtn');
    if (editBtn) {
        editBtn.removeEventListener('click', Scripts.startEdit);
        editBtn.addEventListener('click', () => Scripts.startEdit());
    }
    
    // Save
    const saveBtn = document.getElementById('saveScriptBtn');
    if (saveBtn) {
        saveBtn.removeEventListener('click', handleSaveScript);
        saveBtn.addEventListener('click', handleSaveScript);
    }
    
    // Cancel
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.removeEventListener('click', () => Scripts.cancelEdit());
        cancelBtn.addEventListener('click', () => Scripts.cancelEdit());
    }
    
    // Copy
    const copyBtn = document.getElementById('copyScriptBtn');
    if (copyBtn) {
        copyBtn.removeEventListener('click', handleCopyScript);
        copyBtn.addEventListener('click', handleCopyScript);
    }
    
    // Reset
    const resetBtn = document.getElementById('resetScriptBtn');
    if (resetBtn) {
        resetBtn.removeEventListener('click', () => Scripts.resetScript());
        resetBtn.addEventListener('click', () => Scripts.resetScript());
    }
    
    // Favorite
    const favBtn = document.getElementById('favoriteScriptBtn');
    if (favBtn) {
        favBtn.removeEventListener('click', handleFavoriteScript);
        favBtn.addEventListener('click', handleFavoriteScript);
    }
    
    // Objection - FIXED with proper handler
    const objectionBtn = document.getElementById('objectionToggleBtn');
    if (objectionBtn) {
        const newBtn = objectionBtn.cloneNode(true);
        objectionBtn.parentNode.replaceChild(newBtn, objectionBtn);
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            if (typeof ObjectionHandler !== 'undefined' && ObjectionHandler) {
                if (typeof ObjectionHandler.openModal === 'function') {
                    ObjectionHandler.openModal();
                } else {
                    showToast('Objection handler is loading. Please try again.', 'warning');
                }
            } else {
                showToast('Objection handler not available. Please refresh.', 'warning');
            }
        });
        console.log('🎯 Objection button attached');
    }
}