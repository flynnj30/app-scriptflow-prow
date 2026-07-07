// ================================================================
// NOTEPAD MODULE - COMPLETE FIX
// ================================================================

// ---- NOTEPAD STATE ----
const NOTEPAD_STATE = {
  notes: [],
  currentNoteId: null,
  viewMode: 'list',
  searchTerm: '',
  filter: {
    folder: 'all',
    tag: 'all',
    sort: 'recent',
    showArchived: false,
    showTrash: false
  },
  isMarkdownMode: false,
  isPlainTextMode: false,
  isDarkMode: document.body?.classList?.contains('dark') || false,
  noteVersions: {},
  currentVersionIndex: {},
  reminders: [],
  autoSaveInterval: null,
  undoStack: [],
  redoStack: [],
  isLocked: false,
  pin: localStorage.getItem('notepad_pin') || null,
  autoLockTimer: null,
  isDirty: false,
  isInitialized: false
};

// ---- SAFE DOM HELPERS ----
function safeGetElement(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[Notepad] Element not found: #${id}`);
  }
  return el;
}

function safeSetText(id, text) {
  const el = safeGetElement(id);
  if (el) {
    el.textContent = text;
    return true;
  }
  return false;
}

function safeSetHTML(id, html) {
  const el = safeGetElement(id);
  if (el) {
    el.innerHTML = html;
    return true;
  }
  return false;
}

function safeAddEventListener(id, event, handler) {
  const el = safeGetElement(id);
  if (el) {
    el.addEventListener(event, handler);
    return true;
  }
  return false;
}

// ---- NOTE DATA STORAGE ----
function loadNotesFromStorage() {
  try {
    const data = localStorage.getItem('notepad_data');
    if (data) {
      const parsed = JSON.parse(data);
      NOTEPAD_STATE.notes = parsed.notes || [];
      NOTEPAD_STATE.noteVersions = parsed.versions || {};
      NOTEPAD_STATE.reminders = parsed.reminders || [];
      NOTEPAD_STATE.currentVersionIndex = {};
      NOTEPAD_STATE.notes.forEach(note => {
        if (NOTEPAD_STATE.noteVersions[note.id]) {
          NOTEPAD_STATE.currentVersionIndex[note.id] = NOTEPAD_STATE.noteVersions[note.id].length - 1;
        } else {
          NOTEPAD_STATE.noteVersions[note.id] = [{ content: note.content, timestamp: note.updatedAt || new Date().toISOString() }];
          NOTEPAD_STATE.currentVersionIndex[note.id] = 0;
        }
      });
      return true;
    }
  } catch (e) {
    console.warn('[Notepad] Error loading notes:', e);
  }
  return false;
}

function saveNotesToStorage() {
  try {
    const data = {
      notes: NOTEPAD_STATE.notes,
      versions: NOTEPAD_STATE.noteVersions,
      reminders: NOTEPAD_STATE.reminders
    };
    localStorage.setItem('notepad_data', JSON.stringify(data));
    updateNoteCount();
    return true;
  } catch (e) {
    console.error('[Notepad] Error saving notes:', e);
    return false;
  }
}

function generateNoteId() {
  return 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
}

function createNote(data) {
  const note = {
    id: generateNoteId(),
    title: data.title || 'Untitled',
    content: data.content || '',
    folder: data.folder || 'none',
    tags: data.tags || [],
    color: data.color || 'default',
    pinned: data.pinned || false,
    favorite: data.favorite || false,
    archived: data.archived || false,
    trashed: data.trashed || false,
    locked: data.locked || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: data.dueDate || null,
    reminder: data.reminder || null,
    checklist: data.checklist || [],
    template: data.template || null
  };
  NOTEPAD_STATE.notes.unshift(note);
  NOTEPAD_STATE.noteVersions[note.id] = [{ content: note.content, timestamp: note.createdAt }];
  NOTEPAD_STATE.currentVersionIndex[note.id] = 0;
  saveNotesToStorage();
  return note;
}

function updateNote(id, updates) {
  const note = NOTEPAD_STATE.notes.find(n => n.id === id);
  if (!note) return null;
  
  if (updates.content && updates.content !== note.content) {
    saveNoteVersion(id, note.content);
  }
  
  Object.assign(note, updates);
  note.updatedAt = new Date().toISOString();
  saveNotesToStorage();
  return note;
}

function deleteNotePermanently(id) {
  NOTEPAD_STATE.notes = NOTEPAD_STATE.notes.filter(n => n.id !== id);
  delete NOTEPAD_STATE.noteVersions[id];
  delete NOTEPAD_STATE.currentVersionIndex[id];
  if (NOTEPAD_STATE.currentNoteId === id) {
    NOTEPAD_STATE.currentNoteId = null;
  }
  saveNotesToStorage();
}

function saveNoteVersion(id, content) {
  if (!NOTEPAD_STATE.noteVersions[id]) {
    NOTEPAD_STATE.noteVersions[id] = [];
  }
  if (NOTEPAD_STATE.currentVersionIndex[id] < NOTEPAD_STATE.noteVersions[id].length - 1) {
    NOTEPAD_STATE.noteVersions[id] = NOTEPAD_STATE.noteVersions[id].slice(0, NOTEPAD_STATE.currentVersionIndex[id] + 1);
  }
  NOTEPAD_STATE.noteVersions[id].push({
    content: content,
    timestamp: new Date().toISOString()
  });
  NOTEPAD_STATE.currentVersionIndex[id] = NOTEPAD_STATE.noteVersions[id].length - 1;
  saveNotesToStorage();
}

function getNoteVersions(id) {
  return NOTEPAD_STATE.noteVersions[id] || [];
}

function restoreNoteVersion(id, index) {
  const versions = NOTEPAD_STATE.noteVersions[id];
  if (!versions || index < 0 || index >= versions.length) return null;
  NOTEPAD_STATE.currentVersionIndex[id] = index;
  const content = versions[index].content;
  updateNote(id, { content });
  return content;
}

function undoNote(id) {
  const versions = NOTEPAD_STATE.noteVersions[id];
  if (!versions || NOTEPAD_STATE.currentVersionIndex[id] <= 0) return null;
  NOTEPAD_STATE.currentVersionIndex[id]--;
  const content = versions[NOTEPAD_STATE.currentVersionIndex[id]].content;
  updateNote(id, { content });
  return content;
}

function redoNote(id) {
  const versions = NOTEPAD_STATE.noteVersions[id];
  if (!versions || NOTEPAD_STATE.currentVersionIndex[id] >= versions.length - 1) return null;
  NOTEPAD_STATE.currentVersionIndex[id]++;
  const content = versions[NOTEPAD_STATE.currentVersionIndex[id]].content;
  updateNote(id, { content });
  return content;
}

// ---- FILTERING & SORTING ----
function getFilteredNotes() {
  let notes = [...NOTEPAD_STATE.notes];
  
  if (NOTEPAD_STATE.filter.showArchived) {
    notes = notes.filter(n => n.archived);
  } else if (NOTEPAD_STATE.filter.showTrash) {
    notes = notes.filter(n => n.trashed);
  } else {
    notes = notes.filter(n => !n.archived && !n.trashed);
  }
  
  if (NOTEPAD_STATE.filter.folder !== 'all') {
    notes = notes.filter(n => n.folder === NOTEPAD_STATE.filter.folder);
  }
  
  if (NOTEPAD_STATE.filter.tag !== 'all') {
    notes = notes.filter(n => n.tags && n.tags.includes(NOTEPAD_STATE.filter.tag));
  }
  
  if (NOTEPAD_STATE.searchTerm) {
    const term = NOTEPAD_STATE.searchTerm.toLowerCase();
    notes = notes.filter(n => 
      n.title.toLowerCase().includes(term) ||
      n.content.toLowerCase().includes(term) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(term)))
    );
  }
  
  switch (NOTEPAD_STATE.filter.sort) {
    case 'recent':
      notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      break;
    case 'name':
      notes.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'created':
      notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'pinned':
      notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      break;
    case 'favorite':
      notes.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
      break;
    default:
      notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
  
  return notes;
}

function updateNoteCount() {
  const count = NOTEPAD_STATE.notes.filter(n => !n.archived && !n.trashed).length;
  const badge = safeGetElement('noteCount');
  if (badge) badge.textContent = count;
}

// ---- RENDER FUNCTIONS ----
function renderNoteList() {
  const container = safeGetElement('noteList');
  if (!container) {
    console.warn('[Notepad] Note list container not found');
    return;
  }
  
  const notes = getFilteredNotes();
  
  if (notes.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
        <i class="fas fa-sticky-note" style="font-size: 32px; display: block; margin-bottom: 12px; opacity: 0.3;"></i>
        <p style="margin: 0; font-size: 0.9rem;">${NOTEPAD_STATE.searchTerm ? 'No notes match your search' : 'No notes yet'}</p>
        <button class="btn-icon" id="emptyNewNoteBtn" style="margin-top: 12px; background: var(--primary); color: white; font-size: 0.8rem;">
          <i class="fas fa-plus"></i> Create Note
        </button>
      </div>
    `;
    const btn = safeGetElement('emptyNewNoteBtn');
    if (btn) btn.addEventListener('click', () => createNewNote());
    return;
  }
  
  container.innerHTML = notes.map(note => {
    const isActive = note.id === NOTEPAD_STATE.currentNoteId;
    const preview = note.content.replace(/<[^>]*>/g, '').substring(0, 80) + (note.content.length > 80 ? '...' : '');
    const tagDisplay = note.tags && note.tags.length > 0 ? note.tags.slice(0, 2).map(t => 
      `<span class="meta-tag">#${escapeHtml(t)}</span>`
    ).join('') : '';
    const hasMoreTags = note.tags && note.tags.length > 2;
    const colorStyle = note.color && note.color !== 'default' ? `background: ${note.color};` : '';
    
    return `
      <div class="note-item ${isActive ? 'active' : ''}" data-id="${note.id}" draggable="true">
        ${note.color && note.color !== 'default' ? `<div class="note-item-color" style="${colorStyle}"></div>` : ''}
        <div class="note-item-content">
          <div class="note-item-title">
            ${note.pinned ? '<i class="fas fa-thumbtack" style="color:var(--warning); font-size:0.7rem; margin-right:4px;"></i>' : ''}
            ${note.favorite ? '<i class="fas fa-star" style="color:var(--warning); font-size:0.7rem; margin-right:4px;"></i>' : ''}
            ${escapeHtml(note.title)}
            ${note.locked ? '<i class="fas fa-lock" style="color:var(--text-muted); font-size:0.6rem; margin-left:4px;"></i>' : ''}
          </div>
          <div class="note-item-preview">${escapeHtml(preview)}</div>
          <div class="note-item-meta">
            <span>${formatDateShort(note.updatedAt)}</span>
            ${note.folder !== 'none' ? `<span class="meta-tag">📁 ${escapeHtml(note.folder)}</span>` : ''}
            ${tagDisplay}
            ${hasMoreTags ? `<span class="meta-tag">+${note.tags.length - 2}</span>` : ''}
            ${note.reminder ? `<span class="meta-tag"><i class="fas fa-bell"></i></span>` : ''}
            ${note.dueDate ? `<span class="meta-tag">📅</span>` : ''}
          </div>
        </div>
        <div class="note-item-actions">
          <button class="pin-item" data-id="${note.id}" title="Pin">
            <i class="fas ${note.pinned ? 'fa-thumbtack' : 'fa-thumbtack'}" style="color:${note.pinned ? 'var(--warning)' : ''}"></i>
          </button>
          <button class="favorite-item" data-id="${note.id}" title="Favorite">
            <i class="fas ${note.favorite ? 'fa-star' : 'fa-star'}" style="color:${note.favorite ? 'var(--warning)' : ''}"></i>
          </button>
          <button class="archive-item" data-id="${note.id}" title="Archive">
            <i class="fas fa-archive"></i>
          </button>
          <button class="delete-item" data-id="${note.id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Attach events
  container.querySelectorAll('.note-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.note-item-actions')) return;
      const id = el.dataset.id;
      selectNote(id);
    });
  });
  
  container.querySelectorAll('.pin-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      togglePinNote(id);
    });
  });
  
  container.querySelectorAll('.favorite-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      toggleFavoriteNote(id);
    });
  });
  
  container.querySelectorAll('.archive-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      archiveNote(id);
    });
  });
  
  container.querySelectorAll('.delete-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (confirm('Move this note to trash?')) {
        trashNote(id);
      }
    });
  });
  
  setupNoteDragAndDrop();
}

function renderNoteEditor(note) {
  const emptyState = safeGetElement('noteEmptyState');
  const editorContent = safeGetElement('noteEditorContent');
  const titleInput = safeGetElement('noteTitleInput');
  const editorBody = safeGetElement('noteEditorBody');
  const markdownPreview = safeGetElement('noteMarkdownPreview');
  
  if (!note) {
    if (emptyState) emptyState.style.display = 'flex';
    if (editorContent) editorContent.style.display = 'none';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  if (editorContent) editorContent.style.display = 'flex';
  
  // Check if note is locked
  if (note.locked && !NOTEPAD_STATE.isLocked) {
    showLockModal(note.id);
    return;
  }
  
  // Title - SAFE CHECK
  if (titleInput) titleInput.value = note.title;
  
  // Content
  if (NOTEPAD_STATE.isMarkdownMode) {
    if (editorBody) editorBody.style.display = 'none';
    if (markdownPreview) {
      markdownPreview.style.display = 'block';
      markdownPreview.innerHTML = renderMarkdown(note.content);
    }
  } else if (NOTEPAD_STATE.isPlainTextMode) {
    if (editorBody) {
      editorBody.style.display = 'block';
      editorBody.textContent = note.content;
    }
    if (markdownPreview) markdownPreview.style.display = 'none';
  } else {
    if (editorBody) {
      editorBody.style.display = 'block';
      editorBody.innerHTML = note.content || '';
    }
    if (markdownPreview) markdownPreview.style.display = 'none';
  }
  
  // Folder - SAFE CHECK
  const folderSelect = safeGetElement('noteFolderSelect');
  if (folderSelect) folderSelect.value = note.folder || 'none';
  
  // Tags
  renderNoteTags(note.tags || []);
  
  // Color
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.color === (note.color || 'default'));
  });
  
  // Meta
  updateNoteMeta(note);
  
  // Status
  updateEditorStatus('Loaded');
}

function renderNoteTags(tags) {
  const container = safeGetElement('noteTagList');
  if (!container) return;
  container.innerHTML = tags.map(tag => `
    <span class="tag-pill">
      #${escapeHtml(tag)}
      <button class="tag-remove" data-tag="${escapeHtml(tag)}">×</button>
    </span>
  `).join('');
  
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      removeTagFromCurrentNote(tag);
    });
  });
}

function updateNoteMeta(note) {
  if (!note) return;
  
  const wordCount = countWords(note.content);
  const charCount = note.content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  
  // SAFE: Only update if elements exist
  safeSetText('wordCount', `${wordCount} words`);
  safeSetText('charCount', `${charCount} chars`);
  safeSetText('readingTime', `${readingTime} min read`);
  safeSetText('noteLastEdited', `Last edited: ${formatDate(note.updatedAt)}`);
}

function updateEditorStatus(status, isError = false) {
  const statusEl = safeGetElement('noteStatus');
  if (!statusEl) return;
  statusEl.className = isError ? 'error' : (status === 'Saving...' ? 'saving' : 'saved');
  statusEl.innerHTML = `<i class="fas ${status === 'Saving...' ? 'fa-spinner fa-spin' : (isError ? 'fa-exclamation-circle' : 'fa-check')}"></i> ${status}`;
}

function renderVersionHistory(noteId) {
  const container = safeGetElement('versionList');
  if (!container) return;
  
  const versions = getNoteVersions(noteId);
  if (!versions || versions.length === 0) {
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No versions found</div>';
    return;
  }
  
  const currentIndex = NOTEPAD_STATE.currentVersionIndex[noteId] || 0;
  
  container.innerHTML = versions.map((v, index) => `
    <div class="version-item ${index === currentIndex ? 'current' : ''}">
      <div class="version-info">
        <div class="version-date">${formatDate(v.timestamp)}</div>
        <div class="version-preview">${escapeHtml(v.content.replace(/<[^>]*>/g, '').substring(0, 100))}${v.content.length > 100 ? '...' : ''}</div>
      </div>
      <div class="version-actions">
        ${index === currentIndex ? '<span class="current-badge">Current</span>' : ''}
        <button class="restore-btn" data-index="${index}">Restore</button>
      </div>
    </div>
  `).join('');
  
  container.querySelectorAll('.restore-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      restoreNoteVersion(noteId, index);
      const note = NOTEPAD_STATE.notes.find(n => n.id === noteId);
      if (note) renderNoteEditor(note);
      renderNoteList();
      const versionModal = safeGetElement('versionHistoryModal');
      if (versionModal) versionModal.style.display = 'none';
      showToast('Version restored', 'success');
    });
  });
}

// ---- MARKDOWN RENDERER ----
function renderMarkdown(text) {
  if (!text) return '';
  
  let html = escapeHtml(text);
  
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');
  html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^[0-9]+\. (.*$)/gim, '<li>$1</li>');
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/^---$/gim, '<hr>');
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

// ---- NOTE ACTIONS ----
function createNewNote(template = null) {
  let content = '';
  let title = 'Untitled';
  
  if (template) {
    const templates = {
      meeting: {
        title: 'Meeting Notes',
        content: `# Meeting Notes\n\n## Date: ${new Date().toLocaleDateString()}\n\n## Agenda\n- \n\n## Discussion Points\n- \n\n## Action Items\n- [ ] \n- [ ] \n\n## Next Meeting\n`
      },
      sales: {
        title: 'Sales Call Notes',
        content: `# Sales Call Notes\n\n## Client: \n## Date: ${new Date().toLocaleDateString()}\n\n## Call Summary\n\n## Pain Points\n- \n\n## Objections\n- \n\n## Next Steps\n- [ ] \n- [ ] \n`
      },
      followup: {
        title: 'Follow-up Notes',
        content: `# Follow-up Notes\n\n## Date: ${new Date().toLocaleDateString()}\n\n## Previous Discussion\n\n## Follow-up Items\n- [ ] \n- [ ] \n\n## Next Contact\n`
      },
      daily: {
        title: `Daily Notes - ${new Date().toLocaleDateString()}`,
        content: `# Daily Notes\n\n## Today's Focus\n- \n\n## Completed\n- [x] \n- [ ] \n\n## Tomorrow's Plan\n- \n\n## Notes\n`
      }
    };
    const t = templates[template];
    if (t) {
      title = t.title;
      content = t.content;
    }
  }
  
  const note = createNote({ title, content });
  selectNote(note.id);
  renderNoteList();
  showToast('New note created', 'success');
}

function selectNote(id) {
  NOTEPAD_STATE.currentNoteId = id;
  const note = NOTEPAD_STATE.notes.find(n => n.id === id);
  if (note) {
    renderNoteEditor(note);
    renderNoteList();
    document.querySelectorAll('.note-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });
  }
}

function deleteNote(id) {
  const note = NOTEPAD_STATE.notes.find(n => n.id === id);
  if (!note) return;
  
  if (note.trashed) {
    if (confirm('Permanently delete this note?')) {
      deleteNotePermanently(id);
      renderNoteList();
      if (NOTEPAD_STATE.currentNoteId === id) {
        const notes = getFilteredNotes();
        if (notes.length > 0) {
          selectNote(notes[0].id);
        } else {
          NOTEPAD_STATE.currentNoteId = null;
          renderNoteEditor(null);
        }
      }
      showToast('Note permanently deleted', 'info');
    }
  } else {
    trashNote(id);
  }
}

function trashNote(id) {
  updateNote(id, { trashed: true, archived: false });
  renderNoteList();
  if (NOTEPAD_STATE.currentNoteId === id) {
    const notes = getFilteredNotes();
    if (notes.length > 0) {
      selectNote(notes[0].id);
    } else {
      NOTEPAD_STATE.currentNoteId = null;
      renderNoteEditor(null);
    }
  }
  showToast('Note moved to trash', 'info');
}

function archiveNote(id) {
  const note = NOTEPAD_STATE.notes.find(n => n.id === id);
  if (!note) return;
  updateNote(id, { archived: !note.archived, trashed: false });
  renderNoteList();
  if (NOTEPAD_STATE.currentNoteId === id) {
    const notes = getFilteredNotes();
    if (notes.length > 0) {
      selectNote(notes[0].id);
    } else {
      NOTEPAD_STATE.currentNoteId = null;
      renderNoteEditor(null);
    }
  }
  showToast(note.archived ? 'Note unarchived' : 'Note archived', 'info');
}

function togglePinNote(id) {
  const note = NOTEPAD_STATE.notes.find(n => n.id === id);
  if (!note) return;
  updateNote(id, { pinned: !note.pinned });
  renderNoteList();
  showToast(note.pinned ? 'Note unpinned' : 'Note pinned', 'info');
}

function toggleFavoriteNote(id) {
  const note = NOTEPAD_STATE.notes.find(n => n.id === id);
  if (!note) return;
  updateNote(id, { favorite: !note.favorite });
  renderNoteList();
  showToast(note.favorite ? 'Note unfavorited' : 'Note favorited', 'info');
}

function duplicateNote(id) {
  const original = NOTEPAD_STATE.notes.find(n => n.id === id);
  if (!original) return;
  
  const newNote = createNote({
    title: `${original.title} (Copy)`,
    content: original.content,
    folder: original.folder,
    tags: [...original.tags],
    color: original.color
  });
  
  selectNote(newNote.id);
  renderNoteList();
  showToast('Note duplicated', 'success');
}

function saveCurrentNote() {
  const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
  if (!note) return;
  
  const titleInput = safeGetElement('noteTitleInput');
  const editorBody = safeGetElement('noteEditorBody');
  const folderSelect = safeGetElement('noteFolderSelect');
  
  let content = '';
  if (NOTEPAD_STATE.isMarkdownMode) {
    content = note.content;
  } else if (NOTEPAD_STATE.isPlainTextMode) {
    content = editorBody ? editorBody.textContent || '' : '';
  } else {
    content = editorBody ? editorBody.innerHTML || '' : '';
  }
  
  const title = titleInput ? titleInput.value.trim() : 'Untitled';
  const folder = folderSelect ? folderSelect.value : 'none';
  
  if (content !== note.content || title !== note.title || folder !== note.folder) {
    updateNote(note.id, {
      title: title || 'Untitled',
      content: content,
      folder: folder
    });
    updateEditorStatus('Saved');
    renderNoteList();
    updateNoteMeta(note);
    NOTEPAD_STATE.isDirty = false;
  } else {
    updateEditorStatus('No changes');
  }
}

function autoSaveNote() {
  if (NOTEPAD_STATE.currentNoteId && NOTEPAD_STATE.isDirty) {
    saveCurrentNote();
  }
}

function setNoteColor(color) {
  if (!NOTEPAD_STATE.currentNoteId) return;
  updateNote(NOTEPAD_STATE.currentNoteId, { color: color || 'default' });
  renderNoteList();
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.color === (color || 'default'));
  });
}

function addTagToCurrentNote(tag) {
  if (!NOTEPAD_STATE.currentNoteId) return;
  const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
  if (!note) return;
  
  const tags = note.tags || [];
  if (!tags.includes(tag)) {
    tags.push(tag);
    updateNote(note.id, { tags });
    renderNoteTags(tags);
    renderNoteList();
  }
}

function removeTagFromCurrentNote(tag) {
  if (!NOTEPAD_STATE.currentNoteId) return;
  const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
  if (!note) return;
  
  const tags = (note.tags || []).filter(t => t !== tag);
  updateNote(note.id, { tags });
  renderNoteTags(tags);
  renderNoteList();
}

function toggleMarkdownMode() {
  NOTEPAD_STATE.isMarkdownMode = !NOTEPAD_STATE.isMarkdownMode;
  if (NOTEPAD_STATE.isMarkdownMode) {
    NOTEPAD_STATE.isPlainTextMode = false;
  }
  const btn = safeGetElement('toggleMarkdownBtn');
  if (btn) btn.classList.toggle('active', NOTEPAD_STATE.isMarkdownMode);
  
  const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
  if (note) renderNoteEditor(note);
}

function togglePlainTextMode() {
  NOTEPAD_STATE.isPlainTextMode = !NOTEPAD_STATE.isPlainTextMode;
  if (NOTEPAD_STATE.isPlainTextMode) {
    NOTEPAD_STATE.isMarkdownMode = false;
  }
  const btn = safeGetElement('togglePlainTextBtn');
  if (btn) btn.classList.toggle('active', NOTEPAD_STATE.isPlainTextMode);
  
  const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
  if (note) renderNoteEditor(note);
}

// ---- EDITOR COMMANDS ----
function executeEditorCommand(command, value = null) {
  const editorBody = safeGetElement('noteEditorBody');
  if (!editorBody) return;
  
  if (document.activeElement !== editorBody) {
    editorBody.focus();
  }
  
  if (command === 'insertImage') {
    const url = prompt('Enter image URL:');
    if (url) document.execCommand('insertImage', false, url);
    return;
  }
  
  if (command === 'createLink') {
    const url = prompt('Enter link URL:');
    if (url) document.execCommand('createLink', false, url);
    return;
  }
  
  if (command === 'insertHTML') {
    document.execCommand('insertHTML', false, value);
    return;
  }
  
  document.execCommand(command, false, value);
  NOTEPAD_STATE.isDirty = true;
  updateEditorStatus('Unsaved changes');
}

// ---- EXPORT FUNCTIONS ----
function exportNote(format) {
  const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
  if (!note) {
    showToast('No note selected', 'error');
    return;
  }
  
  const title = note.title || 'Untitled';
  const content = note.content || '';
  const plainText = content.replace(/<[^>]*>/g, '');
  
  let data = '';
  let filename = `${title}`;
  let mimeType = '';
  
  switch (format) {
    case 'txt':
      data = plainText;
      filename += '.txt';
      mimeType = 'text/plain';
      break;
    case 'pdf':
      const element = document.createElement('div');
      element.innerHTML = `
        <h1>${escapeHtml(title)}</h1>
        <div>${content}</div>
        <div style="margin-top: 40px; font-size: 12px; color: #999;">Exported from ScriptFlow Pro on ${new Date().toLocaleString()}</div>
      `;
      document.body.appendChild(element);
      if (typeof html2pdf !== 'undefined') {
        html2pdf().set({
          margin: 0.5,
          filename: `${title}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).from(element).save().then(() => {
          document.body.removeChild(element);
        });
      } else {
        showToast('PDF export requires html2pdf library', 'error');
        document.body.removeChild(element);
      }
      return;
    case 'docx':
      data = `
        <html>
          <head><meta charset="UTF-8"><title>${escapeHtml(title)}</title></head>
          <body>
            <h1>${escapeHtml(title)}</h1>
            <div>${content}</div>
          </body>
        </html>
      `;
      filename += '.docx';
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
    case 'html':
      data = `
        <html>
          <head><meta charset="UTF-8"><title>${escapeHtml(title)}</title></head>
          <body>
            <h1>${escapeHtml(title)}</h1>
            <div>${content}</div>
          </body>
        </html>
      `;
      filename += '.html';
      mimeType = 'text/html';
      break;
    case 'md':
      data = `# ${title}\n\n${plainText}`;
      filename += '.md';
      mimeType = 'text/markdown';
      break;
    case 'json':
      data = JSON.stringify({
        title: title,
        content: content,
        folder: note.folder,
        tags: note.tags,
        color: note.color,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }, null, 2);
      filename += '.json';
      mimeType = 'application/json';
      break;
    default:
      showToast('Unsupported format', 'error');
      return;
  }
  
  if (format === 'pdf') return;
  
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast(`Exported as ${format.toUpperCase()}`, 'success');
}

function importNote(file, title) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      let content = e.target.result;
      let noteTitle = title || file.name.replace(/\.[^.]+$/, '');
      
      if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(content);
          content = data.content || '';
          noteTitle = data.title || noteTitle;
        } catch (err) {
          // Not valid JSON, treat as text
        }
      }
      
      const note = createNote({ title: noteTitle, content });
      selectNote(note.id);
      renderNoteList();
      showToast('Note imported successfully', 'success');
    } catch (err) {
      showToast('Error importing note', 'error');
    }
  };
  reader.readAsText(file);
}

// ---- REMINDERS ----
function setReminder(noteId, date, time, noteText) {
  const reminder = {
    id: generateNoteId(),
    noteId: noteId,
    date: date,
    time: time,
    note: noteText || '',
    createdAt: new Date().toISOString(),
    completed: false
  };
  
  NOTEPAD_STATE.reminders.push(reminder);
  updateNote(noteId, { reminder: reminder.id });
  saveNotesToStorage();
  showToast('Reminder set', 'success');
  checkReminders();
}

function checkReminders() {
  const now = new Date();
  NOTEPAD_STATE.reminders.forEach(reminder => {
    if (reminder.completed) return;
    const reminderDate = new Date(`${reminder.date}T${reminder.time || '00:00'}`);
    if (reminderDate <= now) {
      const note = NOTEPAD_STATE.notes.find(n => n.id === reminder.noteId);
      showToast(`⏰ Reminder: ${note ? note.title : 'Note'} - ${reminder.note || 'Time to review!'}`, 'info');
      reminder.completed = true;
      saveNotesToStorage();
    }
  });
}

// ---- LOCK / PIN ----
function setNotePin(pin) {
  NOTEPAD_STATE.pin = pin;
  localStorage.setItem('notepad_pin', pin);
  showToast('PIN set successfully', 'success');
}

function lockNote(id) {
  updateNote(id, { locked: true });
  renderNoteList();
  showToast('Note locked', 'info');
}

function unlockNote(id, pin) {
  if (pin !== NOTEPAD_STATE.pin) {
    showToast('Incorrect PIN', 'error');
    return false;
  }
  NOTEPAD_STATE.isLocked = true;
  const note = NOTEPAD_STATE.notes.find(n => n.id === id);
  if (note) renderNoteEditor(note);
  
  clearTimeout(NOTEPAD_STATE.autoLockTimer);
  NOTEPAD_STATE.autoLockTimer = setTimeout(() => {
    NOTEPAD_STATE.isLocked = false;
    if (NOTEPAD_STATE.currentNoteId) {
      const n = NOTEPAD_STATE.notes.find(nt => nt.id === NOTEPAD_STATE.currentNoteId);
      if (n && n.locked) {
        renderNoteEditor(n);
      }
    }
  }, 5 * 60 * 1000);
  
  return true;
}

function showLockModal(noteId) {
  const modal = safeGetElement('lockModal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.dataset.noteId = noteId;
  const pinInput = safeGetElement('pinInput');
  if (pinInput) {
    pinInput.value = '';
    pinInput.focus();
  }
}

// ---- DRAG AND DROP ----
function setupNoteDragAndDrop() {
  const items = document.querySelectorAll('.note-item');
  let draggedId = null;
  
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedId = item.dataset.id;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedId);
    });
    
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      item.classList.add('drag-over');
    });
    
    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });
    
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      const sourceId = e.dataTransfer.getData('text/plain');
      const targetId = item.dataset.id;
      if (sourceId && targetId && sourceId !== targetId) {
        reorderNotes(sourceId, targetId);
      }
    });
  });
}

function reorderNotes(sourceId, targetId) {
  const sourceIndex = NOTEPAD_STATE.notes.findIndex(n => n.id === sourceId);
  const targetIndex = NOTEPAD_STATE.notes.findIndex(n => n.id === targetId);
  
  if (sourceIndex === -1 || targetIndex === -1) return;
  
  const [removed] = NOTEPAD_STATE.notes.splice(sourceIndex, 1);
  NOTEPAD_STATE.notes.splice(targetIndex, 0, removed);
  saveNotesToStorage();
  renderNoteList();
}

// ---- UTILITY FUNCTIONS ----
function countWords(text) {
  if (!text) return 0;
  const plain = text.replace(/<[^>]*>/g, '');
  return plain.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Unknown';
  }
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const existing = document.querySelectorAll('.toast');
  existing.forEach(t => t.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : (type === 'info' ? 'info' : '')}`;
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle')}"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function highlightSearchTerm(text, term) {
  if (!term || !text) return text;
  const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---- EVENT BINDING ----
function initNotepadEvents() {
  // New Note
  safeAddEventListener('newNoteBtn', 'click', () => createNewNote());
  safeAddEventListener('newNoteFromEmptyBtn', 'click', () => createNewNote());
  
  // Search
  const searchInput = safeGetElement('noteSearchInput');
  const searchBtn = safeGetElement('searchNoteBtn');
  const clearSearchBtn = safeGetElement('clearSearchBtn');
  const searchBar = safeGetElement('noteSearchBar');
  
  if (searchBtn && searchBar) {
    searchBtn.addEventListener('click', () => {
      searchBar.style.display = searchBar.style.display === 'none' ? 'flex' : 'none';
      if (searchBar.style.display !== 'none' && searchInput) {
        searchInput.focus();
      }
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      NOTEPAD_STATE.searchTerm = e.target.value;
      renderNoteList();
    });
  }
  
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      NOTEPAD_STATE.searchTerm = '';
      renderNoteList();
    });
  }
  
  // Filters
  safeAddEventListener('noteFilterFolder', 'change', (e) => {
    NOTEPAD_STATE.filter.folder = e.target.value;
    renderNoteList();
  });
  
  safeAddEventListener('noteFilterTag', 'change', (e) => {
    NOTEPAD_STATE.filter.tag = e.target.value;
    renderNoteList();
  });
  
  safeAddEventListener('noteSortBy', 'change', (e) => {
    NOTEPAD_STATE.filter.sort = e.target.value;
    renderNoteList();
  });
  
  safeAddEventListener('showArchivedBtn', 'click', () => {
    NOTEPAD_STATE.filter.showArchived = !NOTEPAD_STATE.filter.showArchived;
    NOTEPAD_STATE.filter.showTrash = false;
    renderNoteList();
    if (NOTEPAD_STATE.currentNoteId) {
      const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
      if (!note || note.archived) {
        NOTEPAD_STATE.currentNoteId = null;
        renderNoteEditor(null);
      }
    }
  });
  
  safeAddEventListener('showTrashBtn', 'click', () => {
    NOTEPAD_STATE.filter.showTrash = !NOTEPAD_STATE.filter.showTrash;
    NOTEPAD_STATE.filter.showArchived = false;
    renderNoteList();
    if (NOTEPAD_STATE.currentNoteId) {
      const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
      if (!note || note.trashed) {
        NOTEPAD_STATE.currentNoteId = null;
        renderNoteEditor(null);
      }
    }
  });
  
  // Refresh
  safeAddEventListener('refreshNotesBtn', 'click', () => {
    renderNoteList();
    showToast('Notes refreshed', 'info');
  });
  
  // Save
  safeAddEventListener('saveNoteBtn', 'click', saveCurrentNote);
  
  // Editor commands
  document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
    btn.addEventListener('click', () => {
      const command = btn.dataset.command;
      const value = btn.dataset.value || null;
      if (command === 'formatBlock') {
        executeEditorCommand('formatBlock', value);
      } else if (command === 'insertHTML') {
        executeEditorCommand('insertHTML', value);
      } else {
        executeEditorCommand(command);
      }
    });
  });
  
  // Toggle markdown
  safeAddEventListener('toggleMarkdownBtn', 'click', toggleMarkdownMode);
  safeAddEventListener('togglePlainTextBtn', 'click', togglePlainTextMode);
  
  // Undo/Redo
  safeAddEventListener('undoNoteBtn', 'click', () => {
    if (NOTEPAD_STATE.currentNoteId) {
      const result = undoNote(NOTEPAD_STATE.currentNoteId);
      if (result) {
        const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
        if (note) renderNoteEditor(note);
        showToast('Undo', 'info');
      }
    }
  });
  
  safeAddEventListener('redoNoteBtn', 'click', () => {
    if (NOTEPAD_STATE.currentNoteId) {
      const result = redoNote(NOTEPAD_STATE.currentNoteId);
      if (result) {
        const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
        if (note) renderNoteEditor(note);
        showToast('Redo', 'info');
      }
    }
  });
  
  // Pin, Favorite, Archive, Delete, Duplicate
  safeAddEventListener('pinNoteBtn', 'click', () => {
    if (NOTEPAD_STATE.currentNoteId) togglePinNote(NOTEPAD_STATE.currentNoteId);
  });
  
  safeAddEventListener('favoriteNoteBtn', 'click', () => {
    if (NOTEPAD_STATE.currentNoteId) toggleFavoriteNote(NOTEPAD_STATE.currentNoteId);
  });
  
  safeAddEventListener('archiveNoteBtn', 'click', () => {
    if (NOTEPAD_STATE.currentNoteId) archiveNote(NOTEPAD_STATE.currentNoteId);
  });
  
  safeAddEventListener('deleteNoteBtn', 'click', () => {
    if (NOTEPAD_STATE.currentNoteId) deleteNote(NOTEPAD_STATE.currentNoteId);
  });
  
  safeAddEventListener('duplicateNoteBtn', 'click', () => {
    if (NOTEPAD_STATE.currentNoteId) duplicateNote(NOTEPAD_STATE.currentNoteId);
  });
  
  // Color picker
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      setNoteColor(dot.dataset.color);
    });
  });
  
  // Tags
  safeAddEventListener('addTagBtn', 'click', () => {
    const input = safeGetElement('noteTagInput');
    if (input && input.value.trim()) {
      addTagToCurrentNote(input.value.trim());
      input.value = '';
    }
  });
  
  safeAddEventListener('noteTagInput', 'keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const btn = safeGetElement('addTagBtn');
      if (btn) btn.click();
    }
  });
  
  // Version history
  safeAddEventListener('versionHistoryBtn', 'click', () => {
    if (NOTEPAD_STATE.currentNoteId) {
      renderVersionHistory(NOTEPAD_STATE.currentNoteId);
      const modal = safeGetElement('versionHistoryModal');
      if (modal) modal.style.display = 'flex';
    }
  });
  
  safeAddEventListener('closeVersionBtn', 'click', () => {
    const modal = safeGetElement('versionHistoryModal');
    if (modal) modal.style.display = 'none';
  });
  
  // Export
  safeAddEventListener('exportNoteBtn', 'click', () => {
    const modal = safeGetElement('exportModal');
    if (modal) modal.style.display = 'flex';
  });
  
  safeAddEventListener('exportConfirmBtn', 'click', () => {
    const formatSelect = safeGetElement('exportFormat');
    if (formatSelect) {
      exportNote(formatSelect.value);
      const modal = safeGetElement('exportModal');
      if (modal) modal.style.display = 'none';
    }
  });
  
  safeAddEventListener('closeExportBtn', 'click', () => {
    const modal = safeGetElement('exportModal');
    if (modal) modal.style.display = 'none';
  });
  
  // Import
  safeAddEventListener('importNoteBtn', 'click', () => {
    const modal = safeGetElement('importModal');
    if (modal) modal.style.display = 'flex';
  });
  
  safeAddEventListener('importConfirmBtn', 'click', () => {
    const fileInput = safeGetElement('importFileInput');
    const titleInput = safeGetElement('importTitle');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      importNote(fileInput.files[0], titleInput ? titleInput.value : '');
      const modal = safeGetElement('importModal');
      if (modal) modal.style.display = 'none';
    } else {
      showToast('Please select a file', 'error');
    }
  });
  
  safeAddEventListener('closeImportBtn', 'click', () => {
    const modal = safeGetElement('importModal');
    if (modal) modal.style.display = 'none';
  });
  
  // Templates
  document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      const template = card.dataset.template;
      createNewNote(template);
      const modal = safeGetElement('templateModal');
      if (modal) modal.style.display = 'none';
    });
  });
  
  safeAddEventListener('closeTemplateBtn', 'click', () => {
    const modal = safeGetElement('templateModal');
    if (modal) modal.style.display = 'none';
  });
  
  // Reminders
  safeAddEventListener('saveReminderBtn', 'click', () => {
    const date = safeGetElement('reminderDate');
    const time = safeGetElement('reminderTime');
    const note = safeGetElement('reminderNote');
    if (NOTEPAD_STATE.currentNoteId && date && date.value) {
      setReminder(NOTEPAD_STATE.currentNoteId, date.value, time ? time.value : '', note ? note.value : '');
      const modal = safeGetElement('reminderModal');
      if (modal) modal.style.display = 'none';
    } else {
      showToast('Please select a date', 'error');
    }
  });
  
  safeAddEventListener('closeReminderBtn', 'click', () => {
    const modal = safeGetElement('reminderModal');
    if (modal) modal.style.display = 'none';
  });
  
  // Lock modal
  safeAddEventListener('unlockBtn', 'click', () => {
    const modal = safeGetElement('lockModal');
    const pinInput = safeGetElement('pinInput');
    if (modal && pinInput) {
      const noteId = modal.dataset.noteId;
      if (unlockNote(noteId, pinInput.value)) {
        modal.style.display = 'none';
      }
    }
  });
  
  safeAddEventListener('closeLockBtn', 'click', () => {
    const modal = safeGetElement('lockModal');
    if (modal) modal.style.display = 'none';
  });
  
  safeAddEventListener('pinInput', 'keydown', (e) => {
    if (e.key === 'Enter') {
      const btn = safeGetElement('unlockBtn');
      if (btn) btn.click();
    }
  });
  
  // Auto-save on input
  safeAddEventListener('noteTitleInput', 'input', () => {
    NOTEPAD_STATE.isDirty = true;
    updateEditorStatus('Unsaved changes');
  });
  
  safeAddEventListener('noteEditorBody', 'input', () => {
    NOTEPAD_STATE.isDirty = true;
    updateEditorStatus('Unsaved changes');
    const note = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
    if (note) updateNoteMeta(note);
  });
  
  safeAddEventListener('noteFolderSelect', 'change', () => {
    NOTEPAD_STATE.isDirty = true;
    updateEditorStatus('Unsaved changes');
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentNote();
    }
    
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay[style*="display: flex"]').forEach(modal => {
        modal.style.display = 'none';
      });
    }
  });
  
  // Window events
  window.addEventListener('beforeunload', () => {
    if (NOTEPAD_STATE.isDirty) {
      saveCurrentNote();
    }
  });
  
  // Auto-save interval
  if (NOTEPAD_STATE.autoSaveInterval) {
    clearInterval(NOTEPAD_STATE.autoSaveInterval);
  }
  NOTEPAD_STATE.autoSaveInterval = setInterval(autoSaveNote, 30000);
  
  // Check reminders every minute
  setInterval(checkReminders, 60000);
  
  // Theme toggle
  document.addEventListener('themeChanged', () => {
    NOTEPAD_STATE.isDarkMode = document.body.classList.contains('dark');
  });
  
  NOTEPAD_STATE.isInitialized = true;
  console.log('[Notepad] Events initialized successfully');
}

// ---- INITIALIZATION ----
function initNotepad() {
  console.log('[Notepad] Initializing...');
  
  // Check if DOM elements exist
  const container = safeGetElement('noteList');
  if (!container) {
    console.warn('[Notepad] Note list container not found. Module may not be rendered yet.');
    // Try again after a delay
    setTimeout(() => {
      if (!NOTEPAD_STATE.isInitialized) {
        console.log('[Notepad] Retrying initialization...');
        initNotepad();
      }
    }, 500);
    return;
  }
  
  // Load data
  loadNotesFromStorage();
  
  // If no notes, create a welcome note
  if (NOTEPAD_STATE.notes.length === 0) {
    const welcomeNote = createNote({
      title: 'Welcome to ScriptFlow Notes!',
      content: `
        <h1>Welcome! 👋</h1>
        <p>This is your new notes module. Here are some features to get started:</p>
        <ul>
          <li><strong>Rich Text Editing</strong> - Bold, italic, lists, headings, and more</li>
          <li><strong>Markdown Support</strong> - Toggle between rich text and markdown</li>
          <li><strong>Organization</strong> - Folders, tags, and color labels</li>
          <li><strong>Templates</strong> - Quick templates for meetings, sales calls, and more</li>
          <li><strong>Reminders</strong> - Set reminders for important notes</li>
          <li><strong>Export/Import</strong> - Export to TXT, PDF, DOCX, HTML, Markdown, JSON</li>
        </ul>
        <p>Try creating a new note or using a template to get started!</p>
        <p><em>💡 Tip: Use <strong>Ctrl+S</strong> to save manually</em></p>
      `
    });
    NOTEPAD_STATE.currentNoteId = welcomeNote.id;
  }
  
  // Render
  renderNoteList();
  
  // Select first note if available
  const notes = getFilteredNotes();
  if (notes.length > 0 && !NOTEPAD_STATE.currentNoteId) {
    NOTEPAD_STATE.currentNoteId = notes[0].id;
  }
  
  const currentNote = NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId);
  renderNoteEditor(currentNote || null);
  
  // Bind events
  initNotepadEvents();
  
  // Update count
  updateNoteCount();
  
  console.log('[Notepad] ✅ Initialized successfully');
}

// ---- EXPOSE TO GLOBAL ----
window.Notepad = {
  init: initNotepad,
  createNote: createNewNote,
  selectNote: selectNote,
  saveNote: saveCurrentNote,
  exportNote: exportNote,
  importNote: importNote,
  getNotes: () => NOTEPAD_STATE.notes,
  getCurrentNote: () => NOTEPAD_STATE.notes.find(n => n.id === NOTEPAD_STATE.currentNoteId),
  setPIN: setNotePin,
  lockNote: lockNote,
  unlockNote: unlockNote,
  isReady: () => NOTEPAD_STATE.isInitialized
};

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure DOM is fully rendered
    setTimeout(initNotepad, 100);
  });
} else {
  setTimeout(initNotepad, 100);
}

// Also try to init when window loads (fallback)
window.addEventListener('load', function() {
  if (!NOTEPAD_STATE.isInitialized) {
    console.log('[Notepad] Fallback initialization on window load');
    initNotepad();
  }
});
