// ================================================================
// SCRIPTS MODULE
// ================================================================

const Scripts = {
    renderSidebar: function() {
        const container = DOM.get('scriptListContainer');
        if (!container) return;

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
            
            if (AppState.isFirebaseReady && AppState.currentUser) {
                firebase.firestore()
                    .collection('users')
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

        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore()
                .collection('users')
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
                    Scripts.saveScriptOrder();
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
            Scripts.saveScriptOrder();
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
        if (!AppState.scripts[id]) {
            const ids = Object.keys(AppState.scripts);
            if (ids.length > 0) {
                id = ids[0];
            } else {
                showToast('No scripts available. Create a new script.', 'warning');
                return;
            }
        }
        if (AppState.isEditing) {
            if (!confirm('You have unsaved changes. Discard them?')) return;
            this.cancelEdit();
        }
        AppState.currentScriptId = id;
        const script = AppState.scripts[id];
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

        if (AppState.isFirebaseReady) {
            firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(AppState.currentScriptId).set(updatedScript, { merge: true })
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
            if (AppState.isFirebaseReady) {
                firebase.firestore().collection('users').doc(AppState.currentUser.uid).collection('scripts').doc(AppState.currentScriptId).set({
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

        if (AppState.isFirebaseReady) {
            firebase.firestore()
                .collection('users')
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
            Scripts.saveScriptOrder();
        }
    },

    saveScriptOrder: function() {
        if (AppState.isFirebaseReady && AppState.currentUser) {
            firebase.firestore()
                .collection('users')
                .doc(AppState.currentUser.uid)
                .update({ scriptOrder: AppState.scriptOrder })
                .catch(err => console.warn('Error saving script order:', err));
        } else {
            const fallback = JSON.parse(localStorage.getItem('scripts_fallback') || '{}');
            fallback.scriptOrder = AppState.scriptOrder;
            localStorage.setItem('scripts_fallback', JSON.stringify(fallback));
        }
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
        { id: 'objectionToggleBtn', icon: 'fa-shield-alt', text: 'Objections', style: 'background:var(--secondary); color:white;', extraClass: '' }
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
    
    const objectionToggleBtn = document.getElementById('objectionToggleBtn');
    if (objectionToggleBtn && window.ObjectionHandler) {
        objectionToggleBtn.removeEventListener('click', handleObjectionToggle);
        objectionToggleBtn.addEventListener('click', handleObjectionToggle);
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

function handleObjectionToggle() {
    if (window.ObjectionHandler) {
        window.ObjectionHandler.toggleBanner();
    }
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
// SMART IMPORT FUNCTIONS - FULL IMPLEMENTATION
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
Email : kelvin@landscaping.com
Role : Owner
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
                    </div>
                    <div class="record-badges">
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
    
    // Attach event listeners using event delegation
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
        notes: '📝 Notes',
        timezone: '🌐 Timezone'
    };
    
    const fieldOrder = ['name', 'business', 'phone', 'email', 'date', 'time', 'timezone', 'status', 'assigned', 'role', 'notes'];
    
    let html = '';
    for (const field of fieldOrder) {
        if (fields[field]) {
            const conf = confidence[field] || 0.5;
            const confClass = conf >= 0.7 ? 'high' : (conf >= 0.4 ? 'medium' : 'low');
            const isDate = field === 'date';
            const isEmail = field === 'email';
            const valueDisplay = isDate ? Utils.formatDate(fields[field]) : Utils.escapeHtml(fields[field]);
            html += `
                <div class="field-row ${isDate ? 'date-field' : ''} ${isEmail ? 'email-field' : ''}">
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
            assigned: [],
            email: []
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
        'person name': 'name',
        'email address': 'email',
        'business email': 'email',
        'company email': 'email',
        'primary email': 'email'
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
                
                // Special handling for email
                if (key.includes('email') || key.includes('e-mail') || key.includes('mail')) {
                    matchedField = 'email';
                    context.synonyms.email = context.synonyms.email || [];
                    context.synonyms.email.push(key);
                }
                
                if (key.includes('best time') || key.includes('callback') && key.includes('time')) {
                    const dateMatch = value.match(/(\w+\s+\d{1,2},?\s+\d{4})/i);
                    const timeMatch = value.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
                    const relativeDateMatch = value.match(/\b(today|tomorrow|yesterday|next week|this week)\b/i);
                    const timezoneMatch = value.match(/\b(EST|EDT|CST|CDT|MST|MDT|PST|PDT|GMT|UTC|ET|CT|MT|PT)\b/i);
                    
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
                    if (timezoneMatch) {
                        result['timezone'] = Utils.parseTimezone(timezoneMatch[1]);
                        confidence['timezone'] = 0.8;
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
                    // If it's email, validate it
                    if (matchedField === 'email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (emailRegex.test(value)) {
                            result[matchedField] = value.toLowerCase().trim();
                            confidence[matchedField] = 0.95;
                        } else {
                            if (!result['notes']) result['notes'] = '';
                            result['notes'] += (result['notes'] ? '\n' : '') + `${key}: ${value}`;
                            confidence['notes'] = 0.4;
                        }
                    } else {
                        result[matchedField] = value;
                        confidence[matchedField] = 0.9;
                        if (matchedField === 'date') {
                            const parsedDate = parseDateStringEnhanced(value);
                            if (parsedDate) {
                                result['date'] = parsedDate;
                                confidence['date'] = 0.95;
                            }
                        }
                        if (matchedField === 'timezone') {
                            const parsedTz = Utils.parseTimezone(value);
                            if (parsedTz) {
                                result['timezone'] = parsedTz;
                                confidence['timezone'] = 0.9;
                            }
                        }
                    }
                } else {
                    if (!result['notes']) {
                        result['notes'] = '';
                    }
                    result['notes'] += (result['notes'] ? '\n' : '') + `${key}: ${value}`;
                    confidence['notes'] = 0.5;
                }
            }
        } else if (line.trim()) {
            if (!result['notes']) {
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
            
            const fieldMatch = content.match(/^([^:]+):\s*(.*)$/);
            if (fieldMatch) {
                const key = fieldMatch[1].trim().toLowerCase();
                const value = fieldMatch[2].trim();
                const matchedField = matchFieldName(key);
                if (matchedField) {
                    if (matchedField === 'email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (emailRegex.test(value)) {
                            result[matchedField] = value.toLowerCase().trim();
                            confidence[matchedField] = 0.9;
                        }
                    } else {
                        result[matchedField] = value;
                        confidence[matchedField] = 0.85;
                    }
                    currentSection = matchedField;
                } else {
                    if (!result.notes) result.notes = '';
                    result.notes += (result.notes ? '\n' : '') + content;
                    confidence.notes = 0.4;
                }
            } else {
                // Check if the bullet point contains an email
                const emailMatch = content.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/);
                if (emailMatch && !result.email) {
                    result.email = emailMatch[1].toLowerCase().trim();
                    confidence.email = 0.85;
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
    
    // Enhanced email detection
    const emailPatterns = [
        /(?:email|e-mail|mail|contact email|business email)[:\s]+([^\s@]+@[^\s@]+\.[^\s@]+)/i,
        /([^\s@]+@[^\s@]+\.[^\s@]+)/
    ];
    
    for (const pattern of emailPatterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
            const email = match[1].trim().toLowerCase();
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                result.email = email;
                confidence.email = 0.9;
                break;
            }
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
    
    // Timezone detection
    const timezoneMatch = fullText.match(/\b(EST|EDT|CST|CDT|MST|MDT|PST|PDT|GMT|UTC|ET|CT|MT|PT|Eastern|Central|Mountain|Pacific)\b/i);
    if (timezoneMatch) {
        result.timezone = Utils.parseTimezone(timezoneMatch[1]);
        confidence.timezone = 0.7;
    }
    
    // Status detection - use custom statuses
    const statusNames = Utils.getStatusNames();
    for (const status of statusNames) {
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
    if (expr === 'next week') {
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

function enhanceParsedDataEnhanced(result, confidence, fullText, context, defaultDate) {
    if (result.phone) {
        result.phone = normalizePhoneNumber(result.phone);
    }
    
    if (result.email) {
        result.email = result.email.toLowerCase().trim();
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
            validated.email = data.email.toLowerCase().trim();
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
    
    if (data.timezone) {
        validated.timezone = data.timezone;
    }
    
    // Validate status against custom statuses
    if (data.status) {
        const statusNames = Utils.getStatusNames();
        const matchedStatus = statusNames.find(s => 
            s.toLowerCase() === data.status.toLowerCase() ||
            s.toLowerCase().includes(data.status.toLowerCase()) ||
            data.status.toLowerCase().includes(s.toLowerCase())
        );
        if (matchedStatus) {
            validated.status = matchedStatus;
        } else {
            warnings.push({ field: 'status', message: `Status "${data.status}" not recognized. Using default.` });
            validated.status = Utils.getDefaultStatus();
        }
    } else {
        validated.status = Utils.getDefaultStatus();
    }
    
    ['assigned', 'role', 'notes', 'tags'].forEach(field => {
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
Email : [Enter Email Address]
Role : [Owner/Manager/Decision Maker]
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
    const fieldOrder = ['name', 'business', 'phone', 'email', 'date', 'time', 'timezone', 'status', 'assigned', 'role', 'notes'];
    
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
                timezone: 'Timezone',
                status: 'Status',
                assigned: 'Assigned',
                role: 'Role',
                notes: 'Notes'
            }[field] || field;
            
            const isRequired = ['name', 'business'].includes(field);
            const isSelect = field === 'status' || field === 'assigned' || field === 'timezone';
            const isTextarea = field === 'notes';
            
            if (isSelect) {
                let options = '';
                if (field === 'status') {
                    const statusNames = Utils.getStatusNames();
                    options = statusNames.map(s => 
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
                } else if (field === 'timezone') {
                    const tzOptions = ['Eastern EDT', 'Central CDT', 'Mountain MDT', 'Pacific PDT', 'UTC'];
                    options = tzOptions.map(tz => 
                        `<option value="${tz}" ${tz === value ? 'selected' : ''}>${tz}</option>`
                    ).join('');
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
    if (newData.timezone && !existing.timezone) updates.timezone = newData.timezone;
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
        data.status || Utils.getDefaultStatus(),
        '',
        data.tags || [],
        null,
        data.email || '',
        data.timezone || AppState.calendarTimezone || 'Central CDT'
    );
    
    if (result) {
        showToast(`Saved "${data.business}" successfully!`, 'success');
        ImportState.parsedRecords = ImportState.parsedRecords.filter(r => r.index !== index);
        ImportState.validatedRecords = ImportState.validatedRecords.filter(r => r.index !== index);
        renderImportResultsEnhanced(ImportState.parsedRecords);
        FeaturePanel.refreshCurrentView();
        Stats.updateAll();
        Utils.syncCalendarToDate(result.date);
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
            data.status || Utils.getDefaultStatus(),
            '',
            data.tags || [],
            null,
            data.email || '',
            data.timezone || AppState.calendarTimezone || 'Central CDT'
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
                        <button id="closerStatusBtn" class="view-btn" onclick="window.openStatusCustomization()"><i class="fas fa-tags"></i> Statuses</button>
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
                this.renderShortcuts(featureBody);
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
            this.renderShortcuts(body);
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
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button id="addCloserFromPanelBtn" class="btn-icon" style="background:var(--success); color:white;">
                            <i class="fas fa-plus"></i> Add Closer
                        </button>
                        <button id="manageStatusesFromPanelBtn" class="btn-icon" style="background:var(--secondary); color:white;">
                            <i class="fas fa-tags"></i> Manage Statuses
                        </button>
                    </div>
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
        
        const statusBtn = container.querySelector('#manageStatusesFromPanelBtn');
        if (statusBtn) {
            statusBtn.addEventListener('click', openStatusCustomization);
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

        // Update status dropdown with custom statuses
        const statusSelect = DOM.get('newApptStatus');
        if (statusSelect) {
            const statusNames = Utils.getStatusNames();
            const defaultStatus = Utils.getDefaultStatus();
            statusSelect.innerHTML = statusNames.map(s =>
                `<option value="${s}" ${s === defaultStatus ? 'selected' : ''}>${s}</option>`
            ).join('');
        }

        const assignedSelect = DOM.get('newApptAssigned');
        if (assignedSelect) {
            assignedSelect.innerHTML = AppState.teamMembers.map(m =>
                `<option value="${m.id}">${m.name}</option>`
            ).join('');
        }

        updateCloserSelects();

        const fields = ['newApptBusiness', 'newApptContact', 'newApptPhone', 'newApptEmail', 'newApptTime', 'newApptNotes', 'newApptTimezone'];
        fields.forEach(id => { const el = DOM.get(id); if (el) el.value = ''; });

        // Set default timezone
        const tzSelect = DOM.get('newApptTimezone');
        if (tzSelect) {
            tzSelect.value = AppState.calendarTimezone || 'Central CDT';
        }

        const callbackSelect = DOM.get('newApptCallback');
        if (callbackSelect) {
            callbackSelect.value = 'none';
        }
        const customContainer = DOM.get('newApptCustomCallbackContainer');
        if (customContainer) customContainer.style.display = 'none';

        // Callback select change handler
        if (callbackSelect) {
            callbackSelect.onchange = function() {
                const customContainer = DOM.get('newApptCustomCallbackContainer');
                if (customContainer) {
                    customContainer.style.display = this.value === 'custom' ? 'block' : 'none';
                }
            };
        }

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
                const timezone = DOM.get('newApptTimezone')?.value || AppState.calendarTimezone || 'Central CDT';
                const status = DOM.get('newApptStatus')?.value || Utils.getDefaultStatus();
                const assigned = DOM.get('newApptAssigned')?.value || 'daniel';
                const closer = DOM.get('newApptCloser')?.value || 'Kailan';
                const notes = DOM.get('newApptNotes')?.value?.trim() || '';
                const callbackSetting = DOM.get('newApptCallback')?.value || 'none';
                let callbackCustomValue = '';
                let callbackCustomUnit = 'hours';
                if (callbackSetting === 'custom') {
                    callbackCustomValue = DOM.get('newApptCallbackValue')?.value || '';
                    callbackCustomUnit = DOM.get('newApptCallbackUnit')?.value || 'hours';
                }

                if (!bus || !contact) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }

                let finalDate = date;
                if (!Utils.isValidDate(finalDate)) {
                    finalDate = Utils.getTodayStr();
                    if (dateInput) dateInput.value = finalDate;
                }

                const member = AppState.teamMembers.find(m => m.id === assigned);
                Data.addAppointment(
                    finalDate, bus, contact, 'Owner', phone, time, notes, 
                    member ? member.name : 'Daniel', null, status, '', [], closer, 
                    email, timezone, callbackSetting, callbackCustomValue, callbackCustomUnit
                );
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
                            const color = Utils.getStatusColor(status);
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
                                const color = Utils.getStatusColor(Utils.getStatus(appt));
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
                const color = Utils.getStatusColor(Utils.getStatus(appt));
                const status = Utils.getStatus(appt);
                html += `
                    <div class="day-event-card" style="border-left: 4px solid ${color};" onclick="window.showAppointmentDetail('${appt.id}')">
                        <div class="day-event-time">
                            <i class="fas fa-clock"></i> ${appt.time || 'No time set'}
                        </div>
                        <div class="day-event-content">
                            <div class="day-event-business">${Utils.escapeHtml(appt.business)}</div>
                            <div class="day-event-contact">${Utils.escapeHtml(appt.contactName)}</div>
                            <div class="day-event-meta">
                                <span class="status-tag ${Utils.getStatusClass(status)}" style="background:${color}; color:white;">${status}</span>
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
                    const color = Utils.getStatusColor(Utils.getStatus(appt));
                    const status = Utils.getStatus(appt);
                    html += `
                        <div class="list-event-item" style="border-left-color: ${color};" onclick="window.showAppointmentDetail('${appt.id}')">
                            <span class="list-event-time">${appt.time || 'No time'}</span>
                            <span class="list-event-business">${Utils.escapeHtml(appt.business)}</span>
                            <span class="list-event-contact">${Utils.escapeHtml(appt.contactName)}</span>
                            <span class="status-tag ${Utils.getStatusClass(status)}" style="background:${color}; color:white;">${status}</span>
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
// APPOINTMENT DETAIL FUNCTIONS (UPDATED WITH CUSTOM STATUSES)
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
    const statusColor = Utils.getStatusColor(status);
    const callbackTime = appt.callbackTime ? new Date(appt.callbackTime) : null;
    const callbackStatus = appt.callbackTriggered ? 'completed' : 
                          (callbackTime && new Date() > callbackTime) ? 'due' : 
                          (appt.callbackSetting && appt.callbackSetting !== 'none') ? 'scheduled' : 'none';

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
                        ${appt.email ? `<div style="font-size:0.8rem; color:var(--primary);">✉️ ${Utils.escapeHtml(appt.email)}</div>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <span class="status-tag" style="background:${statusColor}; color:white;">${status}</span>
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
                        ${appt.timezone ? `<div style="font-size:0.65rem; color:var(--text-muted);">${Utils.escapeHtml(appt.timezone)}</div>` : ''}
                    </div>
                </div>

                ${appt.callbackSetting && appt.callbackSetting !== 'none' ? `
                    <div class="callback-section">
                        <div class="callback-section-title">
                            <i class="fas fa-clock"></i> Callback Before Meeting
                            <span class="callback-status ${callbackStatus}">
                                ${callbackStatus === 'scheduled' ? '⏳ Scheduled' : 
                                  callbackStatus === 'due' ? '🔴 Due Now' : 
                                  callbackStatus === 'completed' ? '✅ Completed' : 'Not scheduled'}
                            </span>
                        </div>
                        <div class="callback-info">
                            <span>Setting: <strong>${appt.callbackSetting === 'custom' ? 'Custom' : appt.callbackSetting}</strong></span>
                            ${callbackTime ? `<span>Callback at: <span class="callback-time">${callbackTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span></span>` : ''}
                        </div>
                    </div>
                ` : ''}

                <div style="display:flex; gap:16px; flex-wrap:wrap; padding:8px 0; border-bottom:1px solid var(--border-color);">
                    <div><span style="color:var(--text-muted);">👤 Assigned:</span> <strong>${Utils.escapeHtml(appt.assigned || 'Daniel')}</strong></div>
                    <div><span style="color:var(--text-muted);">💼 Role:</span> <strong>${Utils.escapeHtml(appt.role || 'Owner')}</strong></div>
                    ${appt.closer ? `<div><span style="color:var(--text-muted);">🤝 Closer:</span> <strong>${Utils.escapeHtml(appt.closer)}</strong></div>` : ''}
                    ${appt.tags && appt.tags.length > 0 ? `
                        <div><span style="color:var(--text-muted);">🏷️ Tags:</span> ${appt.tags.map(t => `<span class="status-tag" style="background:var(--bg-primary);">#${t}</span>`).join(' ')}</div>
                    ` : ''}
                </div>

                <div class="timestamp-row">
                    <span class="timestamp-item"><i class="fas fa-plus-circle"></i> Created: ${appt.createdAt ? new Date(appt.createdAt).toLocaleString() : 'N/A'}</span>
                    <span class="timestamp-item"><i class="fas fa-edit"></i> Updated: ${appt.updatedAt ? new Date(appt.updatedAt).toLocaleString() : 'N/A'}</span>
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
        const emailInput = DOM.get('newApptEmail');
        const timeInput = DOM.get('newApptTime');
        const statusSelect = DOM.get('newApptStatus');
        const notesInput = DOM.get('newApptNotes');
        const assignedSelect = DOM.get('newApptAssigned');
        const timezoneSelect = DOM.get('newApptTimezone');
        const callbackSelect = DOM.get('newApptCallback');
        const callbackValue = DOM.get('newApptCallbackValue');
        const callbackUnit = DOM.get('newApptCallbackUnit');
        
        if (businessInput) businessInput.value = appt.business;
        if (contactInput) contactInput.value = appt.contactName;
        if (phoneInput) phoneInput.value = appt.phone || '';
        if (emailInput) emailInput.value = appt.email || '';
        if (timeInput) timeInput.value = appt.time || '';
        if (statusSelect) {
            // Check if current status exists in custom statuses
            const statusNames = Utils.getStatusNames();
            if (statusNames.includes(appt.status)) {
                statusSelect.value = appt.status;
            } else {
                statusSelect.value = Utils.getDefaultStatus();
            }
        }
        if (notesInput) notesInput.value = appt.notes || '';
        if (timezoneSelect) timezoneSelect.value = appt.timezone || AppState.calendarTimezone || 'Central CDT';
        if (callbackSelect) callbackSelect.value = appt.callbackSetting || 'none';
        if (callbackValue) callbackValue.value = appt.callbackCustomValue || '';
        if (callbackUnit) callbackUnit.value = appt.callbackCustomUnit || 'hours';
        
        const customContainer = DOM.get('newApptCustomCallbackContainer');
        if (customContainer) {
            customContainer.style.display = (appt.callbackSetting === 'custom') ? 'block' : 'none';
        }
        
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
        const formattedDate = Utils.parseDateStringEnhanced(newDate.trim());
        if (formattedDate) {
            const newTime = prompt('Enter new time (e.g., 2:30 PM):', appt.time || '');
            Data.updateAppointment(appt.date, appt.id, { 
                date: formattedDate,
                time: newTime || appt.time,
                status: 'Rescheduled',
                callbackTriggered: false
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

function dismissCallbackNotification(apptId) {
    Data.dismissCallbackNotification(apptId);
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

    if (searchResults.length === 0) {
        results.innerHTML = '<p style="color:var(--text-muted); padding:12px;">No results found.</p>';
        return;
    }

    let html = `<div style="display:flex; flex-direction:column; gap:8px;">`;
    searchResults.slice(0, 20).forEach(result => {
        if (result.type === 'appointment') {
            html += `
                <div class="list-item" style="cursor:pointer; padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);" onclick="window.showAppointmentDetail('${result.data.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span style="font-weight:600;">${Utils.escapeHtml(result.data.business)}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${Utils.formatDate(result.data.date)}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">${Utils.escapeHtml(result.data.contactName)}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">Status: ${Utils.getStatus(result.data)}</div>
                </div>
            `;
        } else if (result.type === 'task') {
            html += `
                <div class="list-item" style="padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span style="font-weight:600;">${Utils.escapeHtml(result.data.description)}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${result.data.completed ? '✅ Done' : '⏳ Pending'}</span>
                    </div>
                </div>
            `;
        } else if (result.type === 'script') {
            html += `
                <div class="list-item" style="cursor:pointer; padding:10px 12px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-color);" onclick="window.loadScript('${result.data.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span style="font-weight:600;">${Utils.escapeHtml(result.data.name)}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">📜 Script</span>
                    </div>
                </div>
            `;
        }
    });
    html += `</div>`;
    results.innerHTML = html;
}

function openBulkActions() {
    const modal = DOM.get('bulkActionsModal');
    const container = DOM.get('bulkSelectionContainer');
    if (!modal || !container) return;
    modal.style.display = 'flex';
    AppState.selectedAppointments = new Set();

    let html = '';
    for (let date in AppState.appointments) {
        if (AppState.appointments[date].reports) {
            AppState.appointments[date].reports.forEach(appt => {
                html += `
                    <div class="bulk-item">
                        <input type="checkbox" class="bulk-checkbox" value="${appt.id}" data-date="${date}" />
                        <span><strong>${Utils.escapeHtml(appt.business)}</strong> - ${Utils.escapeHtml(appt.contactName)} (${Utils.getStatus(appt)})</span>
                    </div>
                `;
            });
        }
    }
    container.innerHTML = html || '<p style="color:var(--text-muted);">No appointments found</p>';

    container.querySelectorAll('.bulk-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) AppState.selectedAppointments.add(cb.value);
            else AppState.selectedAppointments.delete(cb.value);
        });
    });

    const options = DOM.get('bulkActionOptions');
    if (options) options.style.display = 'none';
}

function executeBulkAction() {
    const action = DOM.get('bulkActionSelect')?.value || 'status';
    const selected = Array.from(AppState.selectedAppointments);

    if (selected.length === 0) { showToast('Please select at least one appointment', 'warning'); return; }

    if (action === 'delete') {
        if (!confirm(`Delete ${selected.length} appointment(s)?`)) return;
        selected.forEach(id => {
            for (let date in AppState.appointments) {
                if (AppState.appointments[date].reports) {
                    const found = AppState.appointments[date].reports.find(r => r.id === id);
                    if (found) { Data.deleteAppointment(date, id); break; }
                }
            }
        });
        showToast(`${selected.length} appointment(s) deleted`, 'success');
    } else if (action === 'status') {
        const statusSelect = DOM.get('bulkStatusSelect');
        const newStatus = statusSelect?.value || Utils.getDefaultStatus();
        selected.forEach(id => {
            for (let date in AppState.appointments) {
                if (AppState.appointments[date].reports) {
                    const found = AppState.appointments[date].reports.find(r => r.id === id);
                    if (found) { 
                        Data.updateAppointment(date, id, { status: newStatus }); 
                        break; 
                    }
                }
            }
        });
        showToast(`${selected.length} appointment(s) updated to ${newStatus}`, 'success');
    } else if (action === 'tag') {
        const tagSelect = DOM.get('bulkTagSelect');
        const tag = tagSelect?.value || '';
        selected.forEach(id => {
            for (let date in AppState.appointments) {
                if (AppState.appointments[date].reports) {
                    const found = AppState.appointments[date].reports.find(r => r.id === id);
                    if (found) {
                        const tags = found.tags || [];
                        if (!tags.includes(tag)) { tags.push(tag); Data.updateAppointment(date, id, { tags }); }
                        break;
                    }
                }
            }
        });
        showToast(`Tag added to ${selected.length} appointment(s)`, 'success');
    } else if (action === 'export') {
        Data.exportToCSV(selected);
    }

    const modal = DOM.get('bulkActionsModal');
    if (modal) modal.style.display = 'none';
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
        case 'Keyboard Shortcuts': FeaturePanel.show('shortcuts', '⌨️ Keyboard Shortcuts'); break;
        case 'Export to CSV': Data.exportToCSV(); break;
        case 'Toggle Theme': document.body.classList.toggle('light'); showToast('Theme toggled', 'info'); break;
        case 'Refresh Data': { const btn = DOM.get('refreshBtn'); if (btn) btn.click(); break; }
        case 'Bulk Actions': openBulkActions(); break;
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
// INITIALIZATION
// ================================================================

function initApp() {
    console.log('🚀 Initializing ScriptFlow Pro...');
    
    // Load shortcuts
    const savedShortcuts = localStorage.getItem('customShortcuts');
    if (savedShortcuts) {
        try {
            AppState.customShortcuts = JSON.parse(savedShortcuts);
            AppState.shortcuts = { ...CONFIG.DEFAULT_SHORTCUTS, ...AppState.customShortcuts };
        } catch (e) {
            AppState.shortcuts = { ...CONFIG.DEFAULT_SHORTCUTS };
        }
    } else {
        AppState.shortcuts = { ...CONFIG.DEFAULT_SHORTCUTS };
    }
    
    // Load favorites
    const savedFavorites = localStorage.getItem('scriptFavorites');
    if (savedFavorites) {
        try {
            AppState.scriptFavorites = JSON.parse(savedFavorites);
        } catch (e) {
            AppState.scriptFavorites = [];
        }
    }
    
    // Load team members
    const savedTeam = localStorage.getItem('teamMembers_fallback');
    if (savedTeam) {
        try {
            AppState.teamMembers = JSON.parse(savedTeam);
        } catch (e) {
            AppState.teamMembers = CONFIG.DEFAULT_TEAM_MEMBERS;
        }
    } else {
        AppState.teamMembers = CONFIG.DEFAULT_TEAM_MEMBERS;
    }
    
    // Load closers
    const savedClosers = localStorage.getItem('closers_fallback');
    if (savedClosers) {
        try {
            AppState.closers = JSON.parse(savedClosers);
        } catch (e) {
            AppState.closers = CONFIG.DEFAULT_CLOSERS;
        }
    } else {
        AppState.closers = CONFIG.DEFAULT_CLOSERS;
    }
    
    // Load custom statuses
    const savedStatuses = localStorage.getItem('customStatuses_fallback');
    if (savedStatuses) {
        try {
            AppState.customStatuses = JSON.parse(savedStatuses);
        } catch (e) {
            AppState.customStatuses = CONFIG.DEFAULT_STATUSES;
        }
    } else {
        AppState.customStatuses = CONFIG.DEFAULT_STATUSES;
    }
    
    // Load default status ID
    const savedDefaultId = localStorage.getItem('defaultStatusId_fallback');
    if (savedDefaultId) {
        AppState.defaultStatusId = savedDefaultId;
    } else {
        AppState.defaultStatusId = 'pending';
    }
    
    // Load callback notifications
    const savedNotifications = localStorage.getItem('callbackNotifications');
    if (savedNotifications) {
        try {
            AppState.callbackNotifications = JSON.parse(savedNotifications);
        } catch (e) {
            AppState.callbackNotifications = {};
        }
    }
    
    // Check Firebase readiness
    AppState.isFirebaseReady = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
    
    // Auth state listener
    if (AppState.isFirebaseReady) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                AppState.currentUser = user;
                Auth.updateUI();
                Data.loadUserData(true);
            } else {
                AppState.currentUser = null;
                Auth.updateUI();
                Auth.showModal();
            }
        });
    } else {
        // Offline mode - show auth modal with offline notice
        setTimeout(() => {
            Auth.showModal();
            const googleBtn = document.getElementById('googleSignInBtn');
            if (googleBtn) {
                googleBtn.style.opacity = '0.5';
                googleBtn.style.cursor = 'not-allowed';
                googleBtn.title = 'Firebase unavailable - offline mode';
            }
        }, 500);
    }
    
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
    
    // Update status selects
    updateStatusSelects();
    
    // Setup callback interval
    Data.startCallbackChecking();
    
    console.log('✅ App initialized successfully');
}

// ================================================================
// EVENT LISTENERS SETUP
// ================================================================

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
                case 'calendar':
                    AppState.calendarViewMode = 'month';
                    FeaturePanel.show('calendar', '📅 Appointment & Handoff Calendar');
                    break;
                case 'tasks':
                    FeaturePanel.show('tasks', '📋 Follow-up Tasks');
                    break;
                case 'analytics':
                    AppState.analyticsTab = 'insights';
                    FeaturePanel.show('analytics', '📊 Analytics Hub');
                    break;
                case 'shortcuts':
                    FeaturePanel.show('shortcuts', '⌨️ Keyboard Shortcuts');
                    break;
                case 'closers':
                    FeaturePanel.show('closers', '👔 Closer Management');
                    break;
                case 'export':
                    Data.exportToCSV();
                    break;
                case 'theme':
                    document.body.classList.toggle('light');
                    showToast('Theme toggled', 'info');
                    break;
                case 'help':
                    showToast('📖 Help: Press Ctrl+Shift+? for shortcuts', 'info');
                    break;
                case 'reset':
                    if (confirm('Reset all data? This cannot be undone.')) {
                        localStorage.clear();
                        location.reload();
                    }
                    break;
                case 'notepad':
                    showToast('📝 Notes feature coming soon!', 'info');
                    break;
                default:
                    showToast(`Feature ${tool} coming soon!`, 'info');
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
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!AppState.shortcutsEnabled) return;
        
        // Don't trigger if in input/textarea
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
            return;
        }
        
        // Escape key
        if (e.key === 'Escape') {
            handleEscapeKey();
            return;
        }
        
        // Number keys 1-9 for scripts
        if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
            const visible = Utils.getOrderedVisible(AppState.scripts, AppState.scriptOrder);
            const idx = parseInt(e.key) - 1;
            if (idx < visible.length) {
                Scripts.loadScript(visible[idx]);
                e.preventDefault();
            }
            return;
        }
        
        // Check custom shortcuts
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
    
    const loadingScreen = document.getElementById('loadingScreen');
    const appWrapper = document.getElementById('appWrapper');
    
    // Safety timeout - force hide loading screen after 3 seconds max
    const safetyTimeout = setTimeout(function() {
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log('⚠️ Safety timeout: forcing loading screen hide');
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
            if (appWrapper) {
                appWrapper.style.display = 'flex';
                appWrapper.style.opacity = '1';
            }
        }
    }, 3000);
    
    // If LoadingManager exists, use it
    if (typeof LoadingManager !== 'undefined' && LoadingManager) {
        console.log('📦 Using LoadingManager');
        LoadingManager.init();
        
        // Start the loading sequence
        LoadingManager.start(function() {
            console.log('✅ Loading sequence completed');
        });
        
        // Force complete after 2 seconds if not already done
        setTimeout(function() {
            if (LoadingManager && !LoadingManager.isComplete()) {
                console.log('⏱️ Force completing loading');
                LoadingManager.forceComplete();
            }
        }, 2000);
    } else {
        // Fallback: hide loading screen manually
        console.log('⚠️ LoadingManager not found, using fallback');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
        }
        if (appWrapper) {
            appWrapper.style.display = 'flex';
            appWrapper.style.opacity = '1';
        }
    }
    
    // Initialize the app
    try {
        initApp();
    } catch (e) {
        console.error('App initialization error:', e);
        // Still try to hide loading screen
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
        }
        if (appWrapper) {
            appWrapper.style.display = 'flex';
            appWrapper.style.opacity = '1';
        }
        showToast('Error loading app. Please refresh.', 'error');
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM ready, starting app...');
    setTimeout(startApp, 50);
});

console.log('🚀 App bundle loaded');