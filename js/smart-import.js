// ================================================================
// SMART IMPORT - ENHANCED WITH TEMPLATE MANAGEMENT
// ================================================================

// ================================================================
// SMART IMPORT STATE
// ================================================================

const SmartImportState = {
    records: [],
    validRecords: [],
    invalidRecords: [],
    duplicates: [],
    processing: false,
    progress: 0,
    isParsing: false,
    parseStartTime: null,
    parseEndTime: null,
    currentTranscript: null,
    isEditable: false,
    useAI: false,
    fallbackToRuleBased: true,
    parsedData: null,
    aiAvailable: false,
    aiEnabled: false,
    templates: [],
    activeTemplate: null,
    showTemplateManager: false
};

// ================================================================
// SMART IMPORT CONFIG
// ================================================================

const SMART_IMPORT_CONFIG = {
    useAI: false,
    fallbackToRuleBased: true,
    showConfidence: true,
    showEvidence: true,
    showAIStatus: true,
    defaultStatus: 'Meeting Booked',
    defaultAssigned: 'Daniel',
    confidenceThreshold: 0.6,
    templatesKey: 'smart_import_templates',
    activeTemplateKey: 'smart_import_active_template'
};

// ================================================================
// DOM HELPERS
// ================================================================

const SmartImportDOM = window.DOM || {
    get(id) { return document.getElementById(id); },
    show(id) { const el = document.getElementById(id); if (el) el.style.display = 'block'; },
    hide(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; },
    setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; },
    setHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
};

// ================================================================
// TEMPLATE MANAGEMENT
// ================================================================

const TemplateManager = {
    templates: [],
    activeTemplate: null,

    init() {
        this.loadTemplates();
        this.loadActiveTemplate();
    },

    loadTemplates() {
        try {
            const stored = localStorage.getItem(SMART_IMPORT_CONFIG.templatesKey);
            if (stored) {
                this.templates = JSON.parse(stored);
            } else {
                this.templates = this.getDefaultTemplates();
                this.saveTemplates();
            }
        } catch (e) {
            this.templates = this.getDefaultTemplates();
            this.saveTemplates();
        }
    },

    loadActiveTemplate() {
        try {
            const stored = localStorage.getItem(SMART_IMPORT_CONFIG.activeTemplateKey);
            if (stored) {
                this.activeTemplate = JSON.parse(stored);
            } else {
                this.activeTemplate = this.templates[0] || null;
                this.saveActiveTemplate();
            }
        } catch (e) {
            this.activeTemplate = this.templates[0] || null;
            this.saveActiveTemplate();
        }
    },

    getDefaultTemplates() {
        return [
            {
                id: 'default_001',
                name: 'Standard CRM Format',
                description: 'Default format for CRM data extraction',
                fields: [
                    { key: 'business', label: 'Business Name', required: true },
                    { key: 'name', label: 'Contact Name', required: true },
                    { key: 'role', label: 'Role', required: false },
                    { key: 'phone', label: 'Phone Number', required: false },
                    { key: 'email', label: 'Email', required: false },
                    { key: 'date', label: 'Date', required: false },
                    { key: 'time', label: 'Time', required: false },
                    { key: 'status', label: 'Status', required: false },
                    { key: 'notes', label: 'Notes', required: false }
                ],
                patterns: {
                    business: [
                        /(?:business|company|organization|org|firm)[:\s]+([^\n]+)/i,
                        /(?:from|at|with)\s+([A-Z][A-Za-z0-9\s&'\-.,]+)/i
                    ],
                    name: [
                        /(?:name|contact|client)[:\s]+([^\n]+)/i,
                        /(?:my name is|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
                    ],
                    role: [
                        /(?:role|title|position)[:\s]+([^\n]+)/i,
                        /(?:owner|manager|ceo|director)/i
                    ],
                    phone: [
                        /(?:phone|mobile|cell|number)[:\s]+([+\d\s\-\(\)]+)/i,
                        /(\d{3}[-.]?\d{3}[-.]?\d{4})/
                    ],
                    email: [
                        /(?:email|e-mail)[:\s]+([^\s@]+@[^\s@]+\.[^\s@]+)/i,
                        /([^\s@]+@[^\s@]+\.[^\s@]+)/
                    ],
                    date: [
                        /(?:date|appointment|scheduled)[:\s]+([^\n]+)/i,
                        /(\d{1,2}\/\d{1,2}\/\d{4})/,
                        /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/
                    ],
                    time: [
                        /(?:time|at)[:\s]+([^\n]+)/i,
                        /(\d{1,2}:\d{2}\s*(?:AM|PM))/i
                    ],
                    status: [
                        /(?:status|state)[:\s]+([^\n]+)/i,
                        /(?:hot transfer|warm callback|completed|pending|canceled|meeting booked|rescheduled)/i
                    ],
                    notes: [
                        /(?:notes|note|remarks|summary)[:\s]+([^\n]+)/i
                    ]
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'simple_001',
                name: 'Simple Format',
                description: 'Simple format for quick data entry',
                fields: [
                    { key: 'business', label: 'Business Name', required: true },
                    { key: 'name', label: 'Contact Name', required: true },
                    { key: 'phone', label: 'Phone', required: false },
                    { key: 'date', label: 'Date', required: false },
                    { key: 'status', label: 'Status', required: false }
                ],
                patterns: {
                    business: [
                        /(?:business|company)[:\s]+([^\n]+)/i,
                        /([A-Z][A-Za-z0-9\s&'\-.,]+)/
                    ],
                    name: [
                        /(?:name|contact)[:\s]+([^\n]+)/i,
                        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/
                    ],
                    phone: [
                        /(?:phone|mobile|cell)[:\s]+([+\d\s\-\(\)]+)/i,
                        /(\d{3}[-.]?\d{3}[-.]?\d{4})/
                    ],
                    date: [
                        /(?:date|appointment)[:\s]+([^\n]+)/i,
                        /(\d{1,2}\/\d{1,2}\/\d{4})/
                    ],
                    status: [
                        /(?:status)[:\s]+([^\n]+)/i
                    ]
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'detailed_001',
                name: 'Detailed Format',
                description: 'Detailed format with all fields',
                fields: [
                    { key: 'business', label: 'Business Name', required: true },
                    { key: 'name', label: 'Contact Name', required: true },
                    { key: 'role', label: 'Role', required: false },
                    { key: 'phone', label: 'Phone Number', required: true },
                    { key: 'email', label: 'Email', required: false },
                    { key: 'date', label: 'Appointment Date', required: true },
                    { key: 'time', label: 'Appointment Time', required: false },
                    { key: 'status', label: 'Status', required: true },
                    { key: 'notes', label: 'Developer Notes', required: false },
                    { key: 'websiteStatus', label: 'Website Status', required: false },
                    { key: 'businessGoals', label: 'Business Goals', required: false },
                    { key: 'interestLevel', label: 'Interest Level', required: false }
                ],
                patterns: {
                    business: [
                        /(?:business|company|organization|org|firm)[:\s]+([^\n]+)/i
                    ],
                    name: [
                        /(?:name|contact|client|full name)[:\s]+([^\n]+)/i
                    ],
                    role: [
                        /(?:role|title|position)[:\s]+([^\n]+)/i
                    ],
                    phone: [
                        /(?:phone|mobile|cell|telephone|number)[:\s]+([+\d\s\-\(\)]+)/i
                    ],
                    email: [
                        /(?:email|e-mail|mail|address)[:\s]+([^\s@]+@[^\s@]+\.[^\s@]+)/i
                    ],
                    date: [
                        /(?:date|appointment|scheduled|meeting)[:\s]+([^\n]+)/i
                    ],
                    time: [
                        /(?:time|at)[:\s]+([^\n]+)/i
                    ],
                    status: [
                        /(?:status|state|lead status)[:\s]+([^\n]+)/i
                    ],
                    notes: [
                        /(?:notes|note|remarks|summary|developer notes)[:\s]+([^\n]+)/i
                    ],
                    websiteStatus: [
                        /(?:website|site|web status)[:\s]+([^\n]+)/i
                    ],
                    businessGoals: [
                        /(?:goals|business goals|objectives)[:\s]+([^\n]+)/i
                    ],
                    interestLevel: [
                        /(?:interest|level|interest level)[:\s]+([^\n]+)/i
                    ]
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    },

    saveTemplates() {
        try {
            localStorage.setItem(SMART_IMPORT_CONFIG.templatesKey, JSON.stringify(this.templates));
        } catch (e) {
            console.warn('Failed to save templates:', e);
        }
    },

    saveActiveTemplate() {
        try {
            localStorage.setItem(SMART_IMPORT_CONFIG.activeTemplateKey, JSON.stringify(this.activeTemplate));
        } catch (e) {
            console.warn('Failed to save active template:', e);
        }
    },

    getTemplates() {
        return this.templates;
    },

    getActiveTemplate() {
        return this.activeTemplate;
    },

    setActiveTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            this.activeTemplate = template;
            this.saveActiveTemplate();
            return true;
        }
        return false;
    },

    createTemplate(name, description, fields, patterns) {
        const template = {
            id: 'template_' + Date.now(),
            name: name || 'Custom Template',
            description: description || 'Custom template',
            fields: fields || [],
            patterns: patterns || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.templates.push(template);
        this.saveTemplates();
        return template;
    },

    updateTemplate(templateId, updates) {
        const index = this.templates.findIndex(t => t.id === templateId);
        if (index !== -1) {
            this.templates[index] = { ...this.templates[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveTemplates();
            if (this.activeTemplate && this.activeTemplate.id === templateId) {
                this.activeTemplate = this.templates[index];
                this.saveActiveTemplate();
            }
            return true;
        }
        return false;
    },

    deleteTemplate(templateId) {
        this.templates = this.templates.filter(t => t.id !== templateId);
        this.saveTemplates();
        if (this.activeTemplate && this.activeTemplate.id === templateId) {
            this.activeTemplate = this.templates[0] || null;
            this.saveActiveTemplate();
        }
        return true;
    },

    getTemplateFields() {
        return this.activeTemplate ? this.activeTemplate.fields : [];
    },

    getTemplatePatterns() {
        return this.activeTemplate ? this.activeTemplate.patterns : {};
    },

    parseWithTemplate(text) {
        const patterns = this.getTemplatePatterns();
        const result = {};
        const confidence = {};

        for (const [field, patternList] of Object.entries(patterns)) {
            if (Array.isArray(patternList)) {
                for (const pattern of patternList) {
                    const match = text.match(pattern);
                    if (match && match[1]) {
                        const value = match[1].trim();
                        if (value && value.length > 1) {
                            result[field] = value;
                            confidence[field] = this.calculateConfidence(value, field, text);
                            break;
                        }
                    }
                }
            }
        }

        return { result, confidence };
    },

    calculateConfidence(value, field, text) {
        let confidence = 0.5;
        // Check if field is explicitly labeled
        if (new RegExp(`${field}[\\s]*:`, 'i').test(text)) {
            confidence += 0.2;
        }
        // Check if value appears multiple times
        const occurrences = (text.match(new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
        if (occurrences > 1) confidence += 0.1;
        if (occurrences > 2) confidence += 0.1;
        return Math.min(1, confidence);
    }
};

// ================================================================
// CHECK AI AVAILABILITY
// ================================================================

function checkAIAvailability() {
    return false;
}

// ================================================================
// OPEN SMART IMPORT
// ================================================================

function openSmartImportEnhanced() {
    console.log('Opening Smart Import...');
    const modal = SmartImportDOM.get('smartImportModal');
    if (!modal) {
        console.warn('Smart Import modal not found');
        if (window.showToast) window.showToast('Smart Import modal not found', 'error');
        return;
    }
    
    modal.style.display = 'flex';
    
    // Initialize template manager
    TemplateManager.init();
    
    AppState.importRecords = [];
    AppState.importProcessing = false;
    AppState.importProgress = 0;
    SmartImportState.isParsing = false;
    SmartImportState.parsedData = null;
    SmartImportState.aiAvailable = false;
    SmartImportState.aiEnabled = false;
    SmartImportState.templates = TemplateManager.getTemplates();
    SmartImportState.activeTemplate = TemplateManager.getActiveTemplate();
    SmartImportState.showTemplateManager = false;
    
    const dateInput = SmartImportDOM.get('importDefaultDate');
    if (dateInput) {
        dateInput.value = Utils.getTodayStr();
    }
    
    const textArea = SmartImportDOM.get('importTextArea');
    if (textArea) {
        textArea.value = '';
        textArea.placeholder = `Paste your conversation transcript here. The smart parser will extract all CRM fields using the active template.

Active Template: ${SmartImportState.activeTemplate ? SmartImportState.activeTemplate.name : 'Default'}`;
    }
    
    const preview = SmartImportDOM.get('importPreview');
    if (preview) preview.style.display = 'none';
    
    const saveBtn = SmartImportDOM.get('saveImportBtn');
    if (saveBtn) saveBtn.style.display = 'none';
    
    const resultsContainer = SmartImportDOM.get('importResultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';
    
    const progressContainer = SmartImportDOM.get('importProgressContainer');
    if (progressContainer) progressContainer.style.display = 'none';
    
    const summary = SmartImportDOM.get('importSummary');
    if (summary) summary.style.display = 'none';
    
    // Render template selector
    this.renderTemplateSelector();
    
    // Update status display
    const statusEl = SmartImportDOM.get('aiStatusDisplay');
    if (statusEl) {
        const templateName = SmartImportState.activeTemplate ? SmartImportState.activeTemplate.name : 'Default';
        statusEl.textContent = `Template: ${templateName} | Ready to parse`;
        statusEl.className = 'ai-status-display';
        statusEl.style.borderColor = 'var(--primary)';
        statusEl.style.background = 'rgba(59, 130, 246, 0.1)';
        statusEl.style.color = 'var(--primary)';
    }
    
    // Update parse button
    const parseBtn = SmartImportDOM.get('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
        parseBtn.disabled = false;
    }
}

// ================================================================
// RENDER TEMPLATE SELECTOR
// ================================================================

function renderTemplateSelector() {
    const container = SmartImportDOM.get('templateSelectorContainer');
    if (!container) {
        // Create container if it doesn't exist
        const modalCard = document.querySelector('#smartImportModal .modal-card');
        if (modalCard) {
            const templateSection = document.createElement('div');
            templateSection.id = 'templateSelectorContainer';
            templateSection.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Template:</span>
                        <div id="templateButtonContainer" style="display:flex; gap:4px; flex-wrap:wrap;"></div>
                    </div>
                    <button id="manageTemplatesBtn" class="btn-icon" style="font-size:0.7rem; padding:4px 10px;">
                        <i class="fas fa-cog"></i> Manage
                    </button>
                </div>
            `;
            const formGroup = modalCard.querySelector('.form-group');
            if (formGroup) {
                modalCard.insertBefore(templateSection, formGroup);
            }
        }
    }

    const buttonContainer = SmartImportDOM.get('templateButtonContainer');
    if (buttonContainer) {
        const templates = TemplateManager.getTemplates();
        const activeTemplate = TemplateManager.getActiveTemplate();
        
        buttonContainer.innerHTML = templates.map(t => `
            <button class="template-btn ${activeTemplate && activeTemplate.id === t.id ? 'active' : ''}" 
                    data-id="${t.id}" 
                    style="padding:4px 12px; border-radius:16px; border:1px solid ${activeTemplate && activeTemplate.id === t.id ? 'var(--primary)' : 'var(--border-color)'}; 
                           background: ${activeTemplate && activeTemplate.id === t.id ? 'var(--primary)' : 'transparent'}; 
                           color: ${activeTemplate && activeTemplate.id === t.id ? 'white' : 'var(--text-secondary)'}; 
                           font-size:0.7rem; cursor:pointer; transition:all 0.2s ease;">
                ${t.name}
            </button>
        `).join('');

        buttonContainer.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (TemplateManager.setActiveTemplate(id)) {
                    const activeTemplate = TemplateManager.getActiveTemplate();
                    SmartImportState.activeTemplate = activeTemplate;
                    
                    // Update button styles
                    buttonContainer.querySelectorAll('.template-btn').forEach(b => {
                        b.style.borderColor = 'var(--border-color)';
                        b.style.background = 'transparent';
                        b.style.color = 'var(--text-secondary)';
                    });
                    btn.style.borderColor = 'var(--primary)';
                    btn.style.background = 'var(--primary)';
                    btn.style.color = 'white';
                    
                    // Update status
                    const statusEl = SmartImportDOM.get('aiStatusDisplay');
                    if (statusEl) {
                        statusEl.textContent = `Template: ${activeTemplate.name} | Ready to parse`;
                    }
                    
                    // Update textarea placeholder
                    const textArea = SmartImportDOM.get('importTextArea');
                    if (textArea) {
                        textArea.placeholder = `Paste your conversation transcript here. Using template: ${activeTemplate.name}`;
                    }
                    
                    showToast(`Switched to template: ${activeTemplate.name}`, 'success');
                }
            });
        });
    }

    // Manage templates button
    const manageBtn = SmartImportDOM.get('manageTemplatesBtn');
    if (manageBtn) {
        manageBtn.addEventListener('click', () => {
            SmartImportState.showTemplateManager = !SmartImportState.showTemplateManager;
            if (SmartImportState.showTemplateManager) {
                renderTemplateManager();
            } else {
                const managerContainer = SmartImportDOM.get('templateManagerContainer');
                if (managerContainer) managerContainer.style.display = 'none';
            }
        });
    }
}

// ================================================================
// RENDER TEMPLATE MANAGER
// ================================================================

function renderTemplateManager() {
    let container = SmartImportDOM.get('templateManagerContainer');
    if (!container) {
        const modalCard = document.querySelector('#smartImportModal .modal-card');
        if (modalCard) {
            container = document.createElement('div');
            container.id = 'templateManagerContainer';
            container.style.marginTop = '12px';
            container.style.padding = '12px';
            container.style.border = '1px solid var(--border-color)';
            container.style.borderRadius = '12px';
            container.style.background = 'var(--bg-card)';
            container.style.maxHeight = '300px';
            container.style.overflowY = 'auto';
            const templateSection = SmartImportDOM.get('templateSelectorContainer');
            if (templateSection) {
                templateSection.after(container);
            }
        }
    }

    if (!container) return;

    const templates = TemplateManager.getTemplates();
    const activeTemplate = TemplateManager.getActiveTemplate();

    container.style.display = 'block';
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="font-size:0.85rem; font-weight:600;">Manage Templates</h4>
            <button id="createTemplateBtn" class="btn-icon" style="font-size:0.7rem; padding:4px 10px; background:var(--primary); color:white;">
                <i class="fas fa-plus"></i> New Template
            </button>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
            ${templates.map(t => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--bg-primary); border-radius:8px; border-left: 3px solid ${activeTemplate && activeTemplate.id === t.id ? 'var(--primary)' : 'var(--border-color)'};">
                    <div>
                        <div style="font-size:0.8rem; font-weight:500;">${t.name}</div>
                        <div style="font-size:0.65rem; color:var(--text-muted);">${t.description || 'No description'}</div>
                        <div style="font-size:0.6rem; color:var(--text-muted);">${t.fields ? t.fields.length : 0} fields</div>
                    </div>
                    <div style="display:flex; gap:4px;">
                        <button class="edit-template-btn" data-id="${t.id}" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.7rem; padding:4px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-template-btn" data-id="${t.id}" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:0.7rem; padding:4px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Create template button
    const createBtn = container.querySelector('#createTemplateBtn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            showCreateTemplateDialog();
        });
    }

    // Edit template buttons
    container.querySelectorAll('.edit-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            showEditTemplateDialog(id);
        });
    });

    // Delete template buttons
    container.querySelectorAll('.delete-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const templates = TemplateManager.getTemplates();
            if (templates.length <= 1) {
                showToast('Cannot delete the last template', 'warning');
                return;
            }
            if (confirm('Delete this template?')) {
                TemplateManager.deleteTemplate(id);
                renderTemplateManager();
                renderTemplateSelector();
                showToast('Template deleted', 'info');
            }
        });
    });
}

// ================================================================
// SHOW CREATE TEMPLATE DIALOG
// ================================================================

function showCreateTemplateDialog() {
    const name = prompt('Enter template name:');
    if (!name || !name.trim()) return;
    
    const description = prompt('Enter template description (optional):');
    
    // Create template with default fields
    const defaultFields = [
        { key: 'business', label: 'Business Name', required: true },
        { key: 'name', label: 'Contact Name', required: true },
        { key: 'phone', label: 'Phone Number', required: false },
        { key: 'email', label: 'Email', required: false },
        { key: 'date', label: 'Date', required: false },
        { key: 'status', label: 'Status', required: false }
    ];
    
    const template = TemplateManager.createTemplate(
        name.trim(),
        description || '',
        defaultFields,
        {
            business: [/(?:business|company)[:\s]+([^\n]+)/i],
            name: [/(?:name|contact)[:\s]+([^\n]+)/i],
            phone: [/(?:phone|mobile)[:\s]+([+\d\s\-\(\)]+)/i],
            email: [/(?:email)[:\s]+([^\s@]+@[^\s@]+\.[^\s@]+)/i],
            date: [/(?:date)[:\s]+([^\n]+)/i],
            status: [/(?:status)[:\s]+([^\n]+)/i]
        }
    );
    
    // Show field editor
    const fieldStr = prompt('Enter field keys separated by commas (e.g., business,name,phone,email,date,status):', 
                           'business,name,phone,email,date,status');
    
    if (fieldStr && fieldStr.trim()) {
        const keys = fieldStr.split(',').map(k => k.trim()).filter(k => k);
        const fields = keys.map(key => ({
            key: key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            required: false
        }));
        
        TemplateManager.updateTemplate(template.id, { fields: fields });
    }
    
    renderTemplateManager();
    renderTemplateSelector();
    showToast(`Template "${name.trim()}" created!`, 'success');
}

// ================================================================
// SHOW EDIT TEMPLATE DIALOG
// ================================================================

function showEditTemplateDialog(templateId) {
    const templates = TemplateManager.getTemplates();
    const template = templates.find(t => t.id === templateId);
    if (!template) {
        showToast('Template not found', 'error');
        return;
    }
    
    const newName = prompt('Edit template name:', template.name);
    if (newName !== null && newName.trim() !== '') {
        const newDescription = prompt('Edit template description:', template.description || '');
        const fieldsStr = prompt('Enter field keys (comma separated):', 
                               template.fields.map(f => f.key).join(','));
        
        let fields = template.fields;
        if (fieldsStr !== null && fieldsStr.trim()) {
            const keys = fieldsStr.split(',').map(k => k.trim()).filter(k => k);
            fields = keys.map(key => ({
                key: key,
                label: template.fields.find(f => f.key === key)?.label || 
                       key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                required: template.fields.find(f => f.key === key)?.required || false
            }));
        }
        
        TemplateManager.updateTemplate(templateId, {
            name: newName.trim(),
            description: newDescription || '',
            fields: fields
        });
        
        renderTemplateManager();
        renderTemplateSelector();
        showToast(`Template "${newName.trim()}" updated!`, 'success');
    }
}

// ================================================================
// CLOSE SMART IMPORT
// ================================================================

function closeSmartImportEnhanced() {
    const modal = SmartImportDOM.get('smartImportModal');
    if (modal) modal.style.display = 'none';
    AppState.importRecords = [];
    AppState.importProcessing = false;
    SmartImportState.isParsing = false;
    SmartImportState.currentTranscript = null;
    SmartImportState.parsedData = null;
    SmartImportState.showTemplateManager = false;
}

// ================================================================
// PARSE AND PREVIEW - ENHANCED
// ================================================================

async function parseAndPreviewImportEnhanced() {
    console.log('Parsing transcript with enhanced parser...');
    const textArea = SmartImportDOM.get('importTextArea');
    if (!textArea) {
        if (window.showToast) window.showToast('Text area not found', 'error');
        return;
    }
    
    const text = textArea.value;
    if (!text.trim()) {
        if (window.showToast) window.showToast('Please paste a transcript to parse', 'warning');
        return;
    }
    
    const dateInput = SmartImportDOM.get('importDefaultDate');
    const defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
    
    const progressContainer = SmartImportDOM.get('importProgressContainer');
    if (progressContainer) progressContainer.style.display = 'block';
    AppState.importProcessing = true;
    SmartImportState.isParsing = true;
    AppState.importProgress = 0;
    SmartImportState.parseStartTime = Date.now();
    SmartImportState.currentTranscript = text;
    
    const parseBtn = SmartImportDOM.get('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Parsing...';
        parseBtn.disabled = true;
    }
    
    updateImportProgress(10, 'Initializing parser...');
    
    try {
        // Use template-based parsing
        updateImportProgress(20, 'Using template: ' + (SmartImportState.activeTemplate ? SmartImportState.activeTemplate.name : 'Default'));
        
        const templateResult = TemplateManager.parseWithTemplate(text);
        
        updateImportProgress(40, 'Analyzing extracted data...');
        
        // Also use the main parser for additional fields
        let parsed = transcriptParser.parse(text);
        
        // Merge template results
        for (const [key, value] of Object.entries(templateResult.result)) {
            if (value && value !== 'N/A') {
                if (!parsed[key]) parsed[key] = {};
                parsed[key].value = value;
                parsed[key].confidence = templateResult.confidence[key] || 0.6;
                parsed[key].evidence = 'Template extraction';
            }
        }
        
        updateImportProgress(60, 'Creating record...');
        
        // Create record from parsed data
        const record = createImportRecordEnhanced(parsed, text, defaultDate);
        
        AppState.importRecords = [record];
        SmartImportState.parsedData = record;
        
        updateImportProgress(80, 'Building results...');
        
        const parseTime = ((Date.now() - SmartImportState.parseStartTime) / 1000).toFixed(1);
        
        setTimeout(() => {
            renderImportResultsEnhanced([record], Math.round(record.avgConfidence * 100), parseTime);
            AppState.importProcessing = false;
            SmartImportState.isParsing = false;
            updateImportProgress(100, 'Ready! Review and save.');
            
            setTimeout(() => {
                if (progressContainer) progressContainer.style.display = 'none';
            }, 1500);
            
            if (parseBtn) {
                parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
                parseBtn.disabled = false;
            }
            
            if (window.showToast) {
                window.showToast('Analysis complete! Review the extracted data below.', 'success');
            }
        }, 400);
        
    } catch (error) {
        console.error('Smart Import parse error:', error);
        if (window.showToast) {
            window.showToast('Error parsing transcript: ' + error.message, 'error');
        }
        AppState.importProcessing = false;
        SmartImportState.isParsing = false;
        if (progressContainer) progressContainer.style.display = 'none';
        if (parseBtn) {
            parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
            parseBtn.disabled = false;
        }
    }
}

// ================================================================
// CREATE IMPORT RECORD - ENHANCED
// ================================================================

function createImportRecordEnhanced(parsed, text, defaultDate) {
    const data = parsed;
    
    const getValue = (field) => {
        if (data[field] && data[field].value) {
            return data[field].value;
        }
        return 'N/A';
    };
    
    const getConfidence = (field) => {
        if (data[field] && data[field].confidence) {
            return data[field].confidence;
        }
        return 0;
    };
    
    // Build validated record
    const validated = {
        business: getValue('business'),
        name: getValue('name'),
        role: getValue('role'),
        phone: getValue('phone'),
        email: getValue('email'),
        date: getValue('date') !== 'N/A' ? getValue('date') : defaultDate,
        time: getValue('time'),
        status: getValue('status') !== 'N/A' ? getValue('status') : 'Meeting Booked',
        assigned: 'Daniel',
        notes: getValue('developerNotes') || getValue('callSummary') || getValue('notes') || '',
        tags: data.tags && data.tags.value ? data.tags.value : [],
        websiteStatus: getValue('websiteStatus'),
        businessGoals: getValue('businessGoals'),
        interestLevel: getValue('interestLevel')
    };
    
    // Calculate confidence
    const confidenceFields = ['business', 'name', 'phone', 'email', 'date', 'time'];
    let totalConf = 0;
    let confCount = 0;
    for (const field of confidenceFields) {
        if (getValue(field) !== 'N/A') {
            totalConf += getConfidence(field) || 0.5;
            confCount++;
        }
    }
    const avgConfidence = confCount > 0 ? totalConf / confCount : 0;
    
    const record = {
        index: 1,
        raw: text,
        parsed: parsed,
        validated: validated,
        isValid: getValue('business') !== 'N/A' && getValue('name') !== 'N/A',
        errors: [],
        warnings: [],
        uncertainFields: [],
        hasDuplicate: false,
        duplicates: [],
        avgConfidence: avgConfidence,
        confidence: {},
        qualityScore: 5,
        callSummary: getValue('callSummary') || '',
        detectedObjections: data.objections && data.objections.value ? data.objections.value : [],
        missingInformation: [],
        suggestedFollowUp: [],
        tags: validated.tags || [],
        sentiment: getValue('sentiment') || 'Neutral',
        businessGoals: validated.businessGoals,
        websiteStatus: validated.websiteStatus,
        interestLevel: validated.interestLevel,
        followUpActions: data.followUpActions && data.followUpActions.value ? data.followUpActions.value : [],
        source: 'Smart Import',
        templateUsed: SmartImportState.activeTemplate ? SmartImportState.activeTemplate.name : 'Default'
    };
    
    // Check for missing information
    const requiredFields = ['business', 'name'];
    for (const field of requiredFields) {
        if (validated[field] === 'N/A' || !validated[field]) {
            record.missingInformation.push(field);
        }
    }
    
    // Check for uncertain fields
    for (const field of confidenceFields) {
        if (getValue(field) !== 'N/A' && getConfidence(field) < 0.5) {
            record.uncertainFields.push({ field, message: `Low confidence in ${field}` });
        }
    }
    
    // Check for duplicates
    const existingAppointments = Data.getAllAppointments();
    for (const existing of existingAppointments) {
        if (validated.business !== 'N/A' && existing.business && 
            validated.business.toLowerCase().trim() === existing.business.toLowerCase().trim()) {
            record.hasDuplicate = true;
            record.duplicates.push({
                existing: existing,
                confidence: 85,
                matchedFields: ['business'],
                score: 1
            });
            break;
        }
    }
    
    return record;
}

// ================================================================
// RENDER IMPORT RESULTS - ENHANCED
// ================================================================

function renderImportResultsEnhanced(records, avgConfidence, parseTime) {
    const preview = SmartImportDOM.get('importPreview');
    const resultsContainer = SmartImportDOM.get('importResultsContainer');
    const saveBtn = SmartImportDOM.get('saveImportBtn');
    const summary = SmartImportDOM.get('importSummary');
    const recordCount = SmartImportDOM.get('importRecordCount');
    
    if (!preview || !resultsContainer) return;
    
    preview.style.display = 'block';
    
    if (recordCount) {
        recordCount.textContent = records.length;
    }
    
    if (summary) {
        const total = records.length;
        const valid = records.filter(r => r.isValid).length;
        const invalid = records.filter(r => !r.isValid).length;
        const duplicates = records.filter(r => r.hasDuplicate).length;
        const uncertain = records.filter(r => r.uncertainFields && r.uncertainFields.length > 0).length;
        
        const confidenceLabel = avgConfidence >= 80 ? 'High' : (avgConfidence >= 60 ? 'Medium' : 'Low');
        const confidenceColor = avgConfidence >= 80 ? 'success' : (avgConfidence >= 60 ? 'warning' : 'danger');
        
        summary.style.display = 'block';
        summary.innerHTML = `
            <div class="import-summary-grid">
                <div class="import-stat success">
                    <span class="stat-number">${valid}</span>
                    <span class="stat-label">Valid</span>
                </div>
                <div class="import-stat ${invalid > 0 ? 'warning' : ''}">
                    <span class="stat-number">${invalid}</span>
                    <span class="stat-label">Needs Review</span>
                </div>
                <div class="import-stat ${duplicates > 0 ? 'warning' : ''}">
                    <span class="stat-number">${duplicates}</span>
                    <span class="stat-label">Duplicates</span>
                </div>
                <div class="import-stat ${uncertain > 0 ? 'warning' : ''}">
                    <span class="stat-number">${uncertain}</span>
                    <span class="stat-label">Uncertain Fields</span>
                </div>
                <div class="import-stat" style="grid-column: span 1;">
                    <span class="stat-number" style="color: var(--${confidenceColor});">${avgConfidence}%</span>
                    <span class="stat-label">Confidence (${confidenceLabel})</span>
                </div>
                <div class="import-stat" style="grid-column: span 1;">
                    <span class="stat-number">${parseTime || '0.0'}s</span>
                    <span class="stat-label">Parse Time</span>
                </div>
                ${records[0]?.templateUsed ? `
                    <div class="import-stat" style="grid-column: span 2;">
                        <span class="stat-number" style="font-size:0.8rem;">${records[0].templateUsed}</span>
                        <span class="stat-label">Template Used</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    let resultsHtml = '';
    records.forEach((record) => {
        const data = record.validated || {};
        
        const fields = [
            { key: 'business', label: 'Business Name', value: data.business },
            { key: 'name', label: 'Contact Name', value: data.name },
            { key: 'role', label: 'Role', value: data.role },
            { key: 'phone', label: 'Phone Number', value: data.phone },
            { key: 'email', label: 'Email', value: data.email },
            { key: 'date', label: 'Date', value: data.date },
            { key: 'time', label: 'Time', value: data.time },
            { key: 'status', label: 'Status', value: data.status }
        ];
        
        const fieldRows = fields.map(f => {
            const isNA = f.value === 'N/A' || !f.value || f.value === '';
            const valueDisplay = f.key === 'date' && f.value !== 'N/A' ? Utils.formatDate(f.value) : f.value;
            const conf = record.avgConfidence || 0;
            const confLabel = conf >= 0.8 ? 'High' : (conf >= 0.5 ? 'Medium' : 'Low');
            const confClass = conf >= 0.8 ? 'high' : (conf >= 0.5 ? 'medium' : 'low');
            
            return `
                <div class="field-row ${isNA ? 'na-field' : ''} ${confClass}" 
                     style="display:flex; align-items:center; gap:8px; padding:6px 10px; background:var(--bg-primary); border-radius:6px; margin:2px 0;">
                    <span class="field-label" style="font-size:0.7rem; font-weight:600; color:var(--text-muted); min-width:80px;">${f.label}</span>
                    <span class="field-value ${isNA ? 'na-value' : ''}" style="flex:1; font-size:0.85rem;">${isNA ? 'N/A' : Utils.escapeHtml(valueDisplay)}</span>
                    <span class="field-confidence ${confClass}" style="font-size:0.6rem; padding:2px 8px; border-radius:12px; ${confClass === 'high' ? 'background:var(--success); color:white;' : confClass === 'medium' ? 'background:var(--warning); color:#1e293b;' : 'background:var(--danger); color:white;'}">${isNA ? 'Missing' : confLabel}</span>
                </div>
            `;
        }).join('');
        
        // Extended fields
        const extendedFields = [
            { key: 'websiteStatus', label: 'Website Status', value: record.websiteStatus },
            { key: 'interestLevel', label: 'Interest Level', value: record.interestLevel },
            { key: 'sentiment', label: 'Sentiment', value: record.sentiment },
            { key: 'businessGoals', label: 'Business Goals', value: record.businessGoals }
        ];
        
        const extendedRows = extendedFields
            .filter(f => f.value && f.value !== 'N/A' && f.value !== '')
            .map(f => `
                <div class="field-row" style="display:flex; align-items:center; gap:8px; padding:4px 10px; background:var(--bg-primary); border-radius:6px; margin:2px 0; border-left: 3px solid var(--primary);">
                    <span class="field-label" style="font-size:0.65rem; font-weight:600; color:var(--text-muted); min-width:80px;">${f.label}</span>
                    <span class="field-value" style="flex:1; font-size:0.8rem;">${Utils.escapeHtml(f.value)}</span>
                </div>
            `).join('');
        
        resultsHtml += `
            <div class="import-record ${record.isValid ? 'valid' : 'invalid'}" 
                 style="border:1px solid ${record.isValid ? 'var(--success)' : 'var(--danger)'}; border-radius:12px; margin-bottom:8px; overflow:hidden; background:var(--bg-card);">
                <div class="record-header" onclick="window.toggleImportRecord(this)" 
                     style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; cursor:pointer; user-select:none; background:var(--bg-primary);">
                    <div class="record-status" style="display:flex; align-items:center; gap:8px;">
                        <span class="status-icon">${record.isValid ? '✅' : '⚠️'}</span>
                        <span class="record-index" style="font-size:0.7rem; color:var(--text-muted);">#${record.index}</span>
                    </div>
                    <div class="record-summary" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; flex:1;">
                        <span class="record-name" style="font-weight:600; font-size:0.85rem;">${data.name && data.name !== 'N/A' && data.name !== '' ? Utils.escapeHtml(data.name) : 'Unknown'}</span>
                        <span class="record-business" style="font-size:0.8rem; color:var(--text-secondary);">${data.business && data.business !== 'N/A' && data.business !== '' ? Utils.escapeHtml(data.business) : 'Unknown Business'}</span>
                        ${data.status && data.status !== 'N/A' && data.status !== '' ? `<span class="record-status-badge" style="font-size:0.6rem; padding:2px 10px; border-radius:12px; background:var(--primary); color:white;">${Utils.escapeHtml(data.status)}</span>` : ''}
                        ${record.interestLevel && record.interestLevel !== 'N/A' && record.interestLevel !== '' ? `<span class="record-quality" style="font-size:0.6rem; padding:2px 10px; border-radius:12px; background: ${record.interestLevel === 'Very High' || record.interestLevel === 'High' ? 'var(--success)' : record.interestLevel === 'Medium' ? 'var(--warning)' : 'var(--danger)'};">${record.interestLevel}</span>` : ''}
                    </div>
                    <div class="record-badges" style="display:flex; gap:4px; flex-wrap:wrap;">
                        ${record.hasDuplicate ? '<span class="badge duplicate" style="font-size:0.55rem; padding:2px 8px; border-radius:12px; background:var(--warning); color:#1e293b;">Duplicate</span>' : ''}
                        ${record.uncertainFields && record.uncertainFields.length > 0 ? `<span class="badge warning" style="font-size:0.55rem; padding:2px 8px; border-radius:12px; background:var(--warning); color:#1e293b;">${record.uncertainFields.length} uncertain</span>` : ''}
                        ${record.tags && record.tags.length > 0 ? `<span class="badge confidence high" style="font-size:0.55rem; padding:2px 8px; border-radius:12px; background:var(--success); color:white;">${record.tags.length} tags</span>` : ''}
                        <span class="badge confidence ${record.avgConfidence >= 0.7 ? 'high' : record.avgConfidence >= 0.4 ? 'medium' : 'low'}" 
                              style="font-size:0.55rem; padding:2px 8px; border-radius:12px; ${record.avgConfidence >= 0.7 ? 'background:var(--success); color:white;' : record.avgConfidence >= 0.4 ? 'background:var(--warning); color:#1e293b;' : 'background:var(--danger); color:white;'}">${Math.round(record.avgConfidence * 100)}%</span>
                    </div>
                    <span class="record-toggle" style="font-size:0.7rem; color:var(--text-muted);">▼</span>
                </div>
                <div class="record-body" style="display:none; padding:12px 14px;">
                    <div class="record-fields" style="display:flex; flex-direction:column; gap:4px;">${fieldRows}</div>
                    ${extendedRows ? `<div class="record-fields" style="border-top:1px solid var(--border-color); padding-top:8px; margin-top:8px; display:flex; flex-direction:column; gap:4px;">${extendedRows}</div>` : ''}
                    
                    ${record.callSummary ? `
                        <div style="padding:8px 12px; background:var(--bg-primary); border-radius:6px; margin-top:8px;">
                            <strong style="font-size:0.7rem;">Summary:</strong>
                            <div style="margin-top:4px; font-size:0.8rem; color:var(--text-secondary);">${Utils.escapeHtml(record.callSummary)}</div>
                        </div>
                    ` : ''}
                    
                    ${record.followUpActions && record.followUpActions.length > 0 ? `
                        <div style="padding:8px 12px; background:var(--bg-primary); border-radius:6px; margin-top:8px;">
                            <strong style="font-size:0.7rem;">Follow-up Actions:</strong>
                            <ul style="margin:4px 0 0 16px; font-size:0.8rem; color:var(--text-secondary);">
                                ${record.followUpActions.map(a => `<li>${Utils.escapeHtml(a)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${record.detectedObjections && record.detectedObjections.length > 0 ? `
                        <div style="padding:8px 12px; background:var(--bg-primary); border-radius:6px; margin-top:8px; border-left:3px solid var(--warning);">
                            <strong style="font-size:0.7rem;">Objections Detected:</strong>
                            <ul style="margin:4px 0 0 16px; font-size:0.8rem; color:var(--text-secondary);">
                                ${record.detectedObjections.map(o => `<li>${Utils.escapeHtml(o.text || o)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${record.uncertainFields && record.uncertainFields.length > 0 ? `
                        <div class="record-uncertain" style="padding:8px 12px; background:rgba(245,158,11,0.1); border-radius:6px; margin-top:8px; border-left:3px solid var(--warning);">
                            <strong style="font-size:0.7rem;">Uncertain Fields:</strong>
                            <ul style="margin:4px 0 0 16px; font-size:0.8rem; color:var(--text-secondary);">
                                ${record.uncertainFields.map(u => `<li>${u.field}: ${u.message}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${record.missingInformation && record.missingInformation.length > 0 ? `
                        <div class="record-uncertain" style="padding:8px 12px; background:rgba(239,68,68,0.1); border-radius:6px; margin-top:8px; border-left:3px solid var(--danger);">
                            <strong style="font-size:0.7rem;">Missing Information:</strong>
                            <ul style="margin:4px 0 0 16px; font-size:0.8rem; color:var(--text-secondary);">
                                ${record.missingInformation.map(m => `<li>${m}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${record.hasDuplicate && record.duplicates && record.duplicates.length > 0 ? `
                        <div class="record-duplicates" style="padding:8px 12px; background:rgba(245,158,11,0.1); border-radius:6px; margin-top:8px; border-left:3px solid var(--warning);">
                            <strong style="font-size:0.7rem;">Potential Duplicate:</strong>
                            <ul style="margin:4px 0 0 16px; font-size:0.8rem; color:var(--text-secondary);">
                                ${record.duplicates.map(d => `<li>${Utils.escapeHtml(d.existing.business)} - ${Utils.escapeHtml(d.existing.contactName)} (${d.confidence}% match)</li>`).join('')}
                            </ul>
                            <div class="duplicate-actions" style="display:flex; gap:4px; margin-top:8px; flex-wrap:wrap;">
                                <button class="btn-icon review-duplicate" onclick="window.reviewDuplicate('${record.index}')" style="font-size:0.7rem; padding:4px 12px; background:var(--primary); color:white; border:none; border-radius:20px; cursor:pointer;">Review</button>
                                <button class="btn-icon update-duplicate" onclick="window.updateDuplicate('${record.index}')" style="font-size:0.7rem; padding:4px 12px; background:var(--warning); color:#1e293b; border:none; border-radius:20px; cursor:pointer;">Update</button>
                                <button class="btn-icon import-new" onclick="window.importAsNew('${record.index}')" style="font-size:0.7rem; padding:4px 12px; background:var(--success); color:white; border:none; border-radius:20px; cursor:pointer;">Import as New</button>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${record.tags && record.tags.length > 0 ? `
                        <div style="padding:8px 12px; margin-top:8px;">
                            <strong style="font-size:0.7rem;">Tags:</strong>
                            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
                                ${record.tags.map(tag => `<span class="prospect-tag" style="font-size:0.65rem; padding:2px 10px; border-radius:12px; background:rgba(59,130,246,0.1); color:var(--primary);">#${Utils.escapeHtml(tag)}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${record.templateUsed ? `
                        <div style="padding:4px 12px; margin-top:8px; font-size:0.6rem; color:var(--text-muted); border-top:1px solid var(--border-color); padding-top:8px;">
                            Template: ${record.templateUsed}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHtml;
    
    const validRecords = records.filter(r => r.isValid);
    if (saveBtn && validRecords.length > 0) {
        saveBtn.style.display = 'inline-flex';
        saveBtn.textContent = `💾 Import ${validRecords.length} Appointment(s)`;
        saveBtn.onclick = () => saveAllImportedAppointments();
        saveBtn.style.background = 'var(--success)';
        saveBtn.style.color = 'white';
    } else if (saveBtn) {
        saveBtn.style.display = 'none';
    }
}

// ================================================================
// SAVE ALL IMPORTED APPOINTMENTS
// ================================================================

async function saveAllImportedAppointments() {
    const validRecords = AppState.importRecords.filter(r => r.isValid);
    if (validRecords.length === 0) {
        if (window.showToast) window.showToast('No valid records to import', 'warning');
        return;
    }
    if (!AppState.currentUser) {
        if (window.showToast) window.showToast('Please sign in first', 'error');
        return;
    }
    
    let savedCount = 0;
    let skippedCount = 0;
    
    for (const record of validRecords) {
        try {
            const data = record.validated;
            if (data.business === 'N/A' || data.business === '' || data.name === 'N/A' || data.name === '') {
                skippedCount++;
                continue;
            }
            
            // Build notes
            let notes = data.notes || '';
            if (record.callSummary && record.callSummary !== 'N/A' && record.callSummary !== '') {
                notes += (notes ? '\n\n' : '') + 'Call Summary: ' + record.callSummary;
            }
            if (record.detectedObjections && record.detectedObjections.length > 0) {
                const objections = record.detectedObjections.map(o => o.text || o).join(', ');
                notes += (notes ? '\n' : '') + 'Objections: ' + objections;
            }
            if (record.followUpActions && record.followUpActions.length > 0) {
                notes += (notes ? '\n' : '') + 'Follow-up: ' + record.followUpActions.join(', ');
            }
            if (record.businessGoals && record.businessGoals !== 'N/A' && record.businessGoals !== '') {
                notes += (notes ? '\n' : '') + 'Goals: ' + record.businessGoals;
            }
            if (record.websiteStatus && record.websiteStatus !== 'N/A' && record.websiteStatus !== '') {
                notes += (notes ? '\n' : '') + 'Website: ' + record.websiteStatus;
            }
            if (record.interestLevel && record.interestLevel !== 'N/A' && record.interestLevel !== '') {
                notes += (notes ? '\n' : '') + 'Interest: ' + record.interestLevel;
            }
            if (record.sentiment && record.sentiment !== 'N/A' && record.sentiment !== '') {
                notes += (notes ? '\n' : '') + 'Sentiment: ' + record.sentiment;
            }
            
            // Map status
            let status = data.status || 'Meeting Booked';
            const validStatuses = window.CONFIG?.STATUS_OPTIONS || 
                ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held'];
            if (!validStatuses.includes(status)) {
                status = 'Meeting Booked';
            }
            
            // Add appointment
            const result = Data.addAppointment(
                data.date || Utils.getTodayStr(),
                data.business,
                data.name,
                data.role && data.role !== 'N/A' && data.role !== '' ? data.role : 'Owner',
                data.phone && data.phone !== 'N/A' && data.phone !== '' ? data.phone : '',
                data.time && data.time !== 'N/A' && data.time !== '' ? data.time : '',
                notes,
                data.assigned && data.assigned !== 'N/A' && data.assigned !== '' ? data.assigned : 'Daniel',
                null,
                status,
                '',
                record.tags || []
            );
            if (result) savedCount++;
        } catch (error) {
            skippedCount++;
            console.error('Import error:', error);
        }
    }
    
    if (window.showToast) {
        window.showToast(`✅ Imported ${savedCount} appointment(s)! ${skippedCount > 0 ? `Skipped ${skippedCount}` : ''}`, 'success');
    }
    closeSmartImportEnhanced();
    if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
    Stats.updateAll();
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

function updateImportProgress(percent, message) {
    const progressBar = SmartImportDOM.get('importProgressBar');
    const progressStatus = SmartImportDOM.get('importProgressStatus');
    if (progressBar) progressBar.style.width = Math.min(percent, 100) + '%';
    if (progressStatus && message) progressStatus.textContent = message;
}

function toggleImportRecord(header) {
    const body = header.nextElementSibling;
    if (body) {
        const isVisible = body.style.display !== 'none';
        body.style.display = isVisible ? 'none' : 'block';
        const toggle = header.querySelector('.record-toggle');
        if (toggle) toggle.textContent = isVisible ? '▶' : '▼';
    }
}

function expandAllRecords() {
    document.querySelectorAll('.import-record .record-body').forEach(body => body.style.display = 'block');
    document.querySelectorAll('.import-record .record-toggle').forEach(toggle => toggle.textContent = '▼');
}

function collapseAllRecords() {
    document.querySelectorAll('.import-record .record-body').forEach(body => body.style.display = 'none');
    document.querySelectorAll('.import-record .record-toggle').forEach(toggle => toggle.textContent = '▶');
}

function generateImportTemplate() {
    const dateInput = SmartImportDOM.get('importDefaultDate');
    const defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
    const formattedDate = defaultDate ? Utils.formatDate(defaultDate) : 'Today';
    const textArea = SmartImportDOM.get('importTextArea');
    if (!textArea) return;
    const template = `Business Name/Company : [Enter Business Name]
Name : [Enter Contact Name]
Role : [Owner/Manager/Decision Maker]
Phone Number: [Enter Phone Number]
Email: [Enter Email Address]
Demo Time & Date: ${formattedDate} at [Time] [Timezone]

Status: [Pending/Hot Transfer/Warm Callback/Meeting Booked/Completed/Canceled/No Show/Rescheduled]

Website Status: [Has Website/No Website/Needs Website]
Business Goals: [Enter business goals]
Interest Level: [Very High/High/Medium/Low/Very Low]
Sentiment: [Positive/Neutral/Negative]

Notes: [Enter notes about the conversation]`;
    if (textArea.value && !confirm('This will replace your current text. Continue?')) return;
    textArea.value = template;
    if (window.showToast) window.showToast('Template inserted!', 'success');
}

async function quickImportFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            openSmartImportEnhanced();
            const textArea = SmartImportDOM.get('importTextArea');
            if (textArea) textArea.value = text;
            setTimeout(parseAndPreviewImportEnhanced, 500);
        } else {
            if (window.showToast) window.showToast('Clipboard is empty', 'warning');
        }
    } catch (error) {
        if (window.showToast) window.showToast('Unable to read clipboard. Please paste manually.', 'error');
    }
}

function clearExtractedData() {
    if (!confirm('Clear all extracted data?')) return;
    SmartImportState.parsedData = null;
    AppState.importRecords = [];
    const preview = SmartImportDOM.get('importPreview');
    if (preview) preview.style.display = 'none';
    const resultsContainer = SmartImportDOM.get('importResultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';
    const summary = SmartImportDOM.get('importSummary');
    if (summary) summary.style.display = 'none';
    const saveBtn = SmartImportDOM.get('saveImportBtn');
    if (saveBtn) saveBtn.style.display = 'none';
    const textArea = SmartImportDOM.get('importTextArea');
    if (textArea) textArea.value = '';
    if (window.showToast) window.showToast('Cleared all extracted data', 'info');
}

function reviewDuplicate(index) {
    const record = AppState.importRecords.find(r => r.index === index);
    if (!record || !record.duplicates || record.duplicates.length === 0) return;
    if (window.showAppointmentDetail) {
        window.showAppointmentDetail(record.duplicates[0].existing.id);
    }
}

function updateDuplicate(index) {
    const record = AppState.importRecords.find(r => r.index === index);
    if (!record || !record.duplicates || record.duplicates.length === 0) return;
    const duplicate = record.duplicates[0];
    const data = record.validated;
    if (confirm(`Update existing record for "${duplicate.existing.business}"?`)) {
        const updates = {
            business: data.business || duplicate.existing.business,
            contactName: data.name || duplicate.existing.contactName,
            role: data.role || duplicate.existing.role,
            phone: data.phone || duplicate.existing.phone,
            email: data.email || duplicate.existing.email,
            date: data.date || duplicate.existing.date,
            time: data.time || duplicate.existing.time,
            status: data.status || duplicate.existing.status,
            notes: data.notes || duplicate.existing.notes,
            assigned: data.assigned || duplicate.existing.assigned
        };
        Data.updateAppointment(duplicate.existing.date, duplicate.existing.id, updates);
        if (window.showToast) window.showToast(`Updated record for ${duplicate.existing.business}`, 'success');
        record.isValid = false;
        record.saved = true;
    }
}

function importAsNew(index) {
    const record = AppState.importRecords.find(r => r.index === index);
    if (record) {
        record.forceImport = true;
        if (window.showToast) window.showToast(`Will import "${record.validated.business}" as new`, 'info');
    }
}

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

window.openSmartImportEnhanced = openSmartImportEnhanced;
window.closeSmartImportEnhanced = closeSmartImportEnhanced;
window.parseAndPreviewImportEnhanced = parseAndPreviewImportEnhanced;
window.renderImportResultsEnhanced = renderImportResultsEnhanced;
window.saveAllImportedAppointments = saveAllImportedAppointments;
window.toggleImportRecord = toggleImportRecord;
window.expandAllRecords = expandAllRecords;
window.collapseAllRecords = collapseAllRecords;
window.generateImportTemplate = generateImportTemplate;
window.quickImportFromClipboard = quickImportFromClipboard;
window.updateImportProgress = updateImportProgress;
window.clearExtractedData = clearExtractedData;
window.reviewDuplicate = reviewDuplicate;
window.updateDuplicate = updateDuplicate;
window.importAsNew = importAsNew;
window.SmartImportState = SmartImportState;
window.SmartImportDOM = SmartImportDOM;
window.TemplateManager = TemplateManager;

window.SmartImport = {
    open: openSmartImportEnhanced,
    close: closeSmartImportEnhanced,
    parse: parseAndPreviewImportEnhanced,
    render: renderImportResultsEnhanced,
    save: saveAllImportedAppointments,
    state: SmartImportState,
    config: SMART_IMPORT_CONFIG,
    checkAI: checkAIAvailability,
    templates: TemplateManager
};

console.log('Smart Import (Enhanced with Template Management) loaded successfully');
console.log('Templates available:', TemplateManager.getTemplates().length);