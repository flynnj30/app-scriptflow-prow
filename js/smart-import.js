// ================================================================
// SMART IMPORT - Enhanced with Hybrid Parser + Puter.js AI
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
    useAI: true,
    fallbackToRuleBased: true,
    parsedData: null,
    aiAvailable: false
};

// ================================================================
// SMART IMPORT CONFIG
// ================================================================

const SMART_IMPORT_CONFIG = {
    useAI: true,
    fallbackToRuleBased: true,
    showConfidence: true,
    showEvidence: true,
    showAIStatus: true,
    defaultStatus: 'Meeting Booked',
    defaultAssigned: 'Daniel',
    aiModel: 'gemini-3.6-flash',
    confidenceThreshold: 0.6
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
// CHECK AI AVAILABILITY
// ================================================================

function checkAIAvailability() {
    return typeof puter !== 'undefined' && puter.ai && typeof puter.ai.chat === 'function';
}

// ================================================================
// OPEN SMART IMPORT
// ================================================================

function openSmartImportEnhanced() {
    console.log('📥 Opening Smart Import...');
    const modal = SmartImportDOM.get('smartImportModal');
    if (!modal) {
        console.warn('⚠️ Smart Import modal not found');
        if (window.showToast) window.showToast('Smart Import modal not found', 'error');
        return;
    }
    
    modal.style.display = 'flex';
    
    AppState.importRecords = [];
    AppState.importProcessing = false;
    AppState.importProgress = 0;
    SmartImportState.isParsing = false;
    SmartImportState.parsedData = null;
    SmartImportState.aiAvailable = checkAIAvailability();
    
    const dateInput = SmartImportDOM.get('importDefaultDate');
    if (dateInput) {
        dateInput.value = Utils.getTodayStr();
    }
    
    const textArea = SmartImportDOM.get('importTextArea');
    if (textArea) {
        textArea.value = '';
        textArea.placeholder = `Paste your conversation transcript here. The hybrid parser will extract all CRM fields.

Example transcript:
"Flynn: Hey, is this RG77 Tires?
Prospect: Yes, sir.
Flynn: Awesome, Flynn here. I found you online and my team created a custom website preview for your business. I was wondering if you have a few moments tomorrow to look at it?
Prospect: Honestly, tomorrow I ain't gonna be here.
Flynn: What date this week would be best?
Prospect: Thursday morning.
Flynn: Great, I'll call you Thursday at 9:00 AM EDT. May I ask for the best email to send the invite?
Prospect: Right now, my email doesn't work, it's full. Just call me Thursday.
Flynn: I'll try to call you back Thursday if you have an update on the email. My manager will prepare a 10-minute walkthrough."`;
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
    
    // Update status display
    const statusEl = SmartImportDOM.get('aiStatusDisplay');
    if (statusEl) {
        const aiAvailable = checkAIAvailability();
        statusEl.textContent = aiAvailable ? '🤖 AI Enhanced - Ready' : '📋 Rule-Based Parser - Ready';
        statusEl.className = 'ai-status-display';
        if (aiAvailable) {
            statusEl.style.borderColor = 'var(--success)';
            statusEl.style.background = 'rgba(16, 185, 129, 0.1)';
            statusEl.style.color = 'var(--success)';
        }
    }
    
    // Update parse button
    const parseBtn = SmartImportDOM.get('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
        parseBtn.disabled = false;
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
}

// ================================================================
// PARSE AND PREVIEW - HYBRID APPROACH
// ================================================================

async function parseAndPreviewImportEnhanced() {
    console.log('🔍 Parsing transcript...');
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
    
    updateImportProgress(10, '📋 Initializing parser...');
    
    try {
        // Step 1: Use the hybrid parser
        updateImportProgress(20, '🔍 Running hybrid parser...');
        
        let parsed = transcriptParser.parse(text);
        
        updateImportProgress(40, '📊 Analyzing extracted data...');
        
        // Step 2: If AI is available, enhance the parsing
        const aiAvailable = checkAIAvailability();
        SmartImportState.aiAvailable = aiAvailable;
        
        let enhancedParsed = null;
        if (aiAvailable && SMART_IMPORT_CONFIG.useAI) {
            updateImportProgress(50, '🧠 Enhancing with AI...');
            
            try {
                const aiResult = await enhanceWithAI(text, parsed);
                if (aiResult) {
                    enhancedParsed = aiResult;
                    updateImportProgress(70, '✅ AI enhancement complete');
                    
                    // Update status
                    const statusEl = SmartImportDOM.get('aiStatusDisplay');
                    if (statusEl) {
                        statusEl.textContent = '🤖 AI Enhanced - Complete';
                        statusEl.className = 'ai-status-display success';
                    }
                }
            } catch (aiError) {
                console.warn('AI enhancement failed, using base parser:', aiError);
                const statusEl = SmartImportDOM.get('aiStatusDisplay');
                if (statusEl) {
                    statusEl.textContent = '⚠️ AI unavailable - Using rule-based parser';
                    statusEl.className = 'ai-status-display warning';
                }
            }
        }
        
        // Step 3: Merge AI enhancements if available
        const finalResult = enhancedParsed || parsed;
        
        updateImportProgress(80, '📝 Creating record...');
        
        // Step 4: Create record from parsed data
        const record = createImportRecord(finalResult, text, defaultDate);
        
        AppState.importRecords = [record];
        SmartImportState.parsedData = record;
        
        updateImportProgress(90, '✅ Analysis complete!');
        
        const parseTime = ((Date.now() - SmartImportState.parseStartTime) / 1000).toFixed(1);
        
        setTimeout(() => {
            renderImportResults([record], Math.round(record.avgConfidence * 100), parseTime);
            AppState.importProcessing = false;
            SmartImportState.isParsing = false;
            updateImportProgress(100, '✨ Ready! Review and save.');
            
            setTimeout(() => {
                if (progressContainer) progressContainer.style.display = 'none';
            }, 1500);
            
            if (parseBtn) {
                parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
                parseBtn.disabled = false;
            }
            
            if (window.showToast) {
                window.showToast('✅ Analysis complete! Review the extracted data below.', 'success');
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
// AI ENHANCEMENT WITH PUTER.JS
// ================================================================

async function enhanceWithAI(transcript, parsed) {
    if (typeof puter === 'undefined' || !puter.ai || typeof puter.ai.chat !== 'function') {
        return null;
    }
    
    try {
        // Build prompt with existing parsed data
        const prompt = buildAIPrompt(transcript, parsed);
        
        const response = await puter.ai.chat(prompt, {
            model: SMART_IMPORT_CONFIG.aiModel,
            stream: false
        });
        
        // Parse AI response
        let aiData = response;
        if (typeof response === 'string') {
            // Try to extract JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    aiData = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.warn('Failed to parse AI response as JSON');
                }
            }
        }
        
        if (aiData && typeof aiData === 'object') {
            return mergeAIData(parsed, aiData);
        }
        
        return null;
    } catch (error) {
        console.warn('AI enhancement error:', error);
        return null;
    }
}

function buildAIPrompt(transcript, parsed) {
    return `You are a sales transcript analyzer. Analyze this conversation and extract structured data.

TRANSCRIPT:
"""
${transcript}
"""

CURRENTLY EXTRACTED DATA:
${JSON.stringify(parsed, null, 2)}

Please enhance and correct this data. Return a JSON object with the following fields:
{
  "business": "Business name",
  "name": "Contact name",
  "role": "Role (Owner, Manager, etc.)",
  "phone": "Phone number",
  "email": "Email address",
  "date": "Meeting date in YYYY-MM-DD format",
  "time": "Meeting time (e.g., 9:00 AM EDT)",
  "status": "Status (Hot Transfer, Warm Callback, Meeting Booked, Completed, Canceled, Rescheduled, Pending)",
  "websiteStatus": "Website status (Has Website, No Website, Needs Website)",
  "businessGoals": "Business goals",
  "acquisitionMethod": "How they found you",
  "websitePurpose": "Purpose of website",
  "brandingPreferences": "Branding/design preferences",
  "interestLevel": "Interest level (Very High, High, Medium, Low, Very Low)",
  "followUpActions": ["Action 1", "Action 2"],
  "sentiment": "Sentiment (Very Positive, Positive, Neutral, Negative, Very Negative)",
  "objections": ["Objection 1", "Objection 2"],
  "callSummary": "2-3 sentence summary",
  "meetingQualityScore": 0-10,
  "developerNotes": "Concise developer notes"
}

Return ONLY valid JSON. No additional text.`;
}

function mergeAIData(parsed, aiData) {
    const merged = JSON.parse(JSON.stringify(parsed));
    
    const fields = [
        'business', 'name', 'role', 'phone', 'email', 
        'date', 'time', 'status', 'websiteStatus',
        'businessGoals', 'acquisitionMethod', 'websitePurpose',
        'brandingPreferences', 'interestLevel', 'sentiment',
        'callSummary', 'developerNotes', 'meetingQualityScore'
    ];
    
    for (const field of fields) {
        if (aiData[field] && aiData[field] !== 'N/A' && aiData[field] !== '') {
            merged[field] = {
                value: aiData[field],
                confidence: 0.9,
                evidence: 'AI enhanced'
            };
        }
    }
    
    if (aiData.followUpActions && Array.isArray(aiData.followUpActions) && aiData.followUpActions.length > 0) {
        merged.followUpActions = {
            value: aiData.followUpActions,
            confidence: 0.85,
            evidence: 'AI suggested'
        };
    }
    
    if (aiData.objections && Array.isArray(aiData.objections) && aiData.objections.length > 0) {
        merged.objections = {
            value: aiData.objections.map(o => ({ text: o, type: 'detected' })),
            confidence: 0.85,
            evidence: 'AI detected'
        };
    }
    
    return merged;
}

// ================================================================
// CREATE IMPORT RECORD
// ================================================================

function createImportRecord(parsed, text, defaultDate) {
    const data = parsed;
    
    // Extract values
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
    
    const getEvidence = (field) => {
        if (data[field] && data[field].evidence) {
            return data[field].evidence;
        }
        return '';
    };
    
    // Calculate average confidence
    const confidenceFields = ['business', 'name', 'phone', 'email', 'date', 'time'];
    let totalConf = 0;
    let confCount = 0;
    for (const field of confidenceFields) {
        if (getValue(field) !== 'N/A') {
            totalConf += getConfidence(field);
            confCount++;
        }
    }
    const avgConfidence = confCount > 0 ? totalConf / confCount : 0;
    
    const record = {
        index: 1,
        raw: text,
        parsed: parsed,
        confidence: {},
        validated: {
            business: getValue('business'),
            name: getValue('name'),
            role: getValue('role'),
            phone: getValue('phone'),
            email: getValue('email'),
            date: getValue('date') !== 'N/A' ? getValue('date') : defaultDate,
            time: getValue('time'),
            status: getValue('status') !== 'N/A' ? getValue('status') : 'Meeting Booked',
            assigned: 'Daniel',
            notes: getValue('developerNotes') || getValue('callSummary') || '',
            tags: data.tags && data.tags.value ? data.tags.value : []
        },
        isValid: getValue('business') !== 'N/A' && getValue('name') !== 'N/A',
        errors: [],
        warnings: [],
        uncertainFields: [],
        hasDuplicate: false,
        duplicates: [],
        avgConfidence: avgConfidence,
        qualityScore: getValue('meetingQualityScore') !== 'N/A' ? parseFloat(getValue('meetingQualityScore')) : 5,
        callSummary: getValue('callSummary'),
        detectedObjections: data.objections && data.objections.value ? data.objections.value : [],
        missingInformation: data.missingInformation && data.missingInformation.value ? data.missingInformation.value : [],
        suggestedFollowUp: data.suggestedFollowUp && data.suggestedFollowUp.value ? data.suggestedFollowUp.value : [],
        tags: data.tags && data.tags.value ? data.tags.value : [],
        sentiment: getValue('sentiment'),
        businessGoals: getValue('businessGoals'),
        websiteStatus: getValue('websiteStatus'),
        interestLevel: getValue('interestLevel'),
        followUpActions: data.followUpActions && data.followUpActions.value ? data.followUpActions.value : []
    };
    
    // Check for duplicates
    const existingAppointments = Data.getAllAppointments();
    for (const existing of existingAppointments) {
        if (record.validated.business !== 'N/A' && existing.business && 
            record.validated.business.toLowerCase().trim() === existing.business.toLowerCase().trim() &&
            record.validated.phone !== 'N/A' && existing.phone &&
            record.validated.phone.replace(/[^\d+]/g, '') === existing.phone.replace(/[^\d+]/g, '')) {
            record.hasDuplicate = true;
            record.duplicates.push({
                existing: existing,
                confidence: 85,
                matchedFields: ['business', 'phone'],
                score: 1
            });
            break;
        }
    }
    
    // Check for uncertain fields
    const uncertain = [];
    for (const field of confidenceFields) {
        if (getValue(field) === 'N/A') {
            uncertain.push({ field, message: `Missing ${field}` });
        } else if (getConfidence(field) < 0.4) {
            uncertain.push({ field, message: `Low confidence in ${field}` });
        }
    }
    record.uncertainFields = uncertain;
    
    return record;
}

// ================================================================
// RENDER IMPORT RESULTS
// ================================================================

function renderImportResults(records, avgConfidence, parseTime) {
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
                    <span class="stat-label">✅ Valid</span>
                </div>
                <div class="import-stat ${invalid > 0 ? 'warning' : ''}">
                    <span class="stat-number">${invalid}</span>
                    <span class="stat-label">⚠️ Needs Review</span>
                </div>
                <div class="import-stat ${duplicates > 0 ? 'warning' : ''}">
                    <span class="stat-number">${duplicates}</span>
                    <span class="stat-label">🔄 Duplicates</span>
                </div>
                <div class="import-stat ${uncertain > 0 ? 'warning' : ''}">
                    <span class="stat-number">${uncertain}</span>
                    <span class="stat-label">❓ Uncertain Fields</span>
                </div>
                <div class="import-stat" style="grid-column: span 1;">
                    <span class="stat-number" style="color: var(--${confidenceColor});">${avgConfidence}%</span>
                    <span class="stat-label">📊 Confidence (${confidenceLabel})</span>
                </div>
                <div class="import-stat" style="grid-column: span 1;">
                    <span class="stat-number">${parseTime || '0.0'}s</span>
                    <span class="stat-label">⏱️ Parse Time</span>
                </div>
            </div>
        `;
    }
    
    let resultsHtml = '';
    records.forEach((record) => {
        const data = record.validated || {};
        const confidence = record.confidence || {};
        
        const fields = [
            { key: 'business', label: 'Business Name', value: data.business, confidence: record.avgConfidence },
            { key: 'name', label: 'Contact Name', value: data.name, confidence: record.avgConfidence },
            { key: 'role', label: 'Role', value: data.role, confidence: record.avgConfidence },
            { key: 'phone', label: 'Phone Number', value: data.phone, confidence: record.avgConfidence },
            { key: 'email', label: 'Email', value: data.email, confidence: record.avgConfidence },
            { key: 'date', label: 'Date', value: data.date, confidence: record.avgConfidence },
            { key: 'time', label: 'Time', value: data.time, confidence: record.avgConfidence },
            { key: 'status', label: 'Status', value: data.status, confidence: record.avgConfidence }
        ];
        
        const fieldRows = fields.map(f => {
            const isNA = f.value === 'N/A' || !f.value;
            const valueDisplay = f.key === 'date' && f.value !== 'N/A' ? Utils.formatDate(f.value) : f.value;
            const conf = f.confidence || 0;
            const confLabel = conf >= 0.8 ? 'High' : (conf >= 0.5 ? 'Medium' : 'Low');
            const confClass = conf >= 0.8 ? 'high' : (conf >= 0.5 ? 'medium' : 'low');
            
            return `
                <div class="field-row ${isNA ? 'na-field' : ''} ${confClass}">
                    <span class="field-label">${f.label}</span>
                    <span class="field-value ${isNA ? 'na-value' : ''}">${isNA ? 'N/A' : Utils.escapeHtml(valueDisplay)}</span>
                    <span class="field-confidence ${confClass}">${isNA ? 'Missing' : confLabel}</span>
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
            .filter(f => f.value && f.value !== 'N/A')
            .map(f => `
                <div class="field-row" style="background: var(--bg-primary);">
                    <span class="field-label">${f.label}</span>
                    <span class="field-value">${Utils.escapeHtml(f.value)}</span>
                </div>
            `).join('');
        
        resultsHtml += `
            <div class="import-record ${record.isValid ? 'valid' : 'invalid'}">
                <div class="record-header" onclick="window.toggleImportRecord(this)">
                    <div class="record-status">
                        <span class="status-icon">${record.isValid ? '✅' : '⚠️'}</span>
                        <span class="record-index">#${record.index}</span>
                    </div>
                    <div class="record-summary">
                        <span class="record-name">${data.name && data.name !== 'N/A' ? Utils.escapeHtml(data.name) : 'Unknown'}</span>
                        <span class="record-business">${data.business && data.business !== 'N/A' ? Utils.escapeHtml(data.business) : 'Unknown Business'}</span>
                        ${data.status && data.status !== 'N/A' ? `<span class="record-status-badge">${Utils.escapeHtml(data.status)}</span>` : ''}
                        ${record.interestLevel && record.interestLevel !== 'N/A' ? `<span class="record-quality" style="background: ${record.interestLevel === 'Very High' || record.interestLevel === 'High' ? 'var(--success)' : record.interestLevel === 'Medium' ? 'var(--warning)' : 'var(--danger)'};">${record.interestLevel}</span>` : ''}
                    </div>
                    <div class="record-badges">
                        ${record.hasDuplicate ? '<span class="badge duplicate">🔄 Duplicate</span>' : ''}
                        ${record.uncertainFields && record.uncertainFields.length > 0 ? `<span class="badge warning">❓ ${record.uncertainFields.length}</span>` : ''}
                        ${record.tags && record.tags.length > 0 ? `<span class="badge confidence high">🏷️ ${record.tags.length}</span>` : ''}
                        <span class="badge confidence ${record.avgConfidence >= 0.7 ? 'high' : record.avgConfidence >= 0.4 ? 'medium' : 'low'}">${Math.round(record.avgConfidence * 100)}%</span>
                    </div>
                    <span class="record-toggle">▼</span>
                </div>
                <div class="record-body" style="display:none;">
                    <div class="record-fields">${fieldRows}</div>
                    ${extendedRows ? `<div class="record-fields" style="border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 10px;">${extendedRows}</div>` : ''}
                    
                    ${record.callSummary ? `
                        <div style="padding:8px 12px; background:var(--bg-primary); border-radius:6px; margin-top:8px;">
                            <strong>📝 Summary:</strong>
                            <div style="margin-top:4px; font-size:0.8rem; color:var(--text-secondary);">${Utils.escapeHtml(record.callSummary)}</div>
                        </div>
                    ` : ''}
                    
                    ${record.followUpActions && record.followUpActions.length > 0 ? `
                        <div style="padding:8px 12px; background:var(--bg-primary); border-radius:6px; margin-top:8px;">
                            <strong>📌 Follow-up Actions:</strong>
                            <ul style="margin:4px 0 0 16px; font-size:0.8rem; color:var(--text-secondary);">
                                ${record.followUpActions.map(a => `<li>${Utils.escapeHtml(a)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${record.detectedObjections && record.detectedObjections.length > 0 ? `
                        <div style="padding:8px 12px; background:var(--bg-primary); border-radius:6px; margin-top:8px; border-left: 3px solid var(--warning);">
                            <strong>🛡️ Objections Detected:</strong>
                            <ul style="margin:4px 0 0 16px; font-size:0.8rem; color:var(--text-secondary);">
                                ${record.detectedObjections.map(o => `<li>${Utils.escapeHtml(o.text || o)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${record.uncertainFields && record.uncertainFields.length > 0 ? `
                        <div class="record-uncertain">
                            <strong>❓ Uncertain Fields:</strong>
                            <ul>${record.uncertainFields.map(u => `<li>${u.field}: ${u.message}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    
                    ${record.missingInformation && record.missingInformation.length > 0 ? `
                        <div class="record-uncertain" style="border-left-color: var(--warning);">
                            <strong>📋 Missing Information:</strong>
                            <ul>${record.missingInformation.map(m => `<li>${m}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    
                    ${record.hasDuplicate && record.duplicates && record.duplicates.length > 0 ? `
                        <div class="record-duplicates">
                            <strong>🔄 Potential Duplicate:</strong>
                            <ul>${record.duplicates.map(d => 
                                `<li>${Utils.escapeHtml(d.existing.business)} - ${Utils.escapeHtml(d.existing.contactName)} (${d.confidence}% match)</li>`
                            ).join('')}</ul>
                            <div class="duplicate-actions">
                                <button class="btn-icon review-duplicate" onclick="window.reviewDuplicate('${record.index}')">Review</button>
                                <button class="btn-icon update-duplicate" onclick="window.updateDuplicate('${record.index}')">Update</button>
                                <button class="btn-icon import-new" onclick="window.importAsNew('${record.index}')">Import as New</button>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${record.tags && record.tags.length > 0 ? `
                        <div style="padding:8px 12px; margin-top:8px;">
                            <strong>🏷️ Tags:</strong>
                            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
                                ${record.tags.map(tag => `<span class="prospect-tag">#${Utils.escapeHtml(tag)}</span>`).join('')}
                            </div>
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
    } else if (saveBtn) {
        saveBtn.style.display = 'none';
    }
}

// ================================================================
// SAVE ALL IMPORTED APPOINTMENTS
// ================================================================

function saveAllImportedAppointments() {
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
    
    validRecords.forEach(record => {
        const data = record.validated;
        if (data.business === 'N/A' || data.name === 'N/A') {
            skippedCount++;
            return;
        }
        
        // Build notes with all available data
        let notes = data.notes || '';
        if (record.callSummary && record.callSummary !== 'N/A') {
            notes += (notes ? '\n\n' : '') + 'Call Summary: ' + record.callSummary;
        }
        if (record.detectedObjections && record.detectedObjections.length > 0) {
            const objections = record.detectedObjections.map(o => o.text || o).join(', ');
            notes += (notes ? '\n' : '') + 'Objections: ' + objections;
        }
        if (record.followUpActions && record.followUpActions.length > 0) {
            notes += (notes ? '\n' : '') + 'Follow-up: ' + record.followUpActions.join(', ');
        }
        if (record.businessGoals && record.businessGoals !== 'N/A') {
            notes += (notes ? '\n' : '') + 'Goals: ' + record.businessGoals;
        }
        if (record.websiteStatus && record.websiteStatus !== 'N/A') {
            notes += (notes ? '\n' : '') + 'Website: ' + record.websiteStatus;
        }
        if (record.interestLevel && record.interestLevel !== 'N/A') {
            notes += (notes ? '\n' : '') + 'Interest: ' + record.interestLevel;
        }
        if (record.sentiment && record.sentiment !== 'N/A') {
            notes += (notes ? '\n' : '') + 'Sentiment: ' + record.sentiment;
        }
        
        // Map status to valid options
        let status = data.status || 'Meeting Booked';
        const validStatuses = window.CONFIG?.STATUS_OPTIONS || 
            ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held'];
        
        if (!validStatuses.includes(status)) {
            status = 'Meeting Booked';
        }
        
        const result = Data.addAppointment(
            data.date || Utils.getTodayStr(),
            data.business,
            data.name,
            data.role && data.role !== 'N/A' ? data.role : 'Owner',
            data.phone && data.phone !== 'N/A' ? data.phone : '',
            data.time && data.time !== 'N/A' ? data.time : '',
            notes,
            data.assigned && data.assigned !== 'N/A' ? data.assigned : 'Daniel',
            null,
            status,
            '',
            record.tags || []
        );
        if (result) savedCount++;
    });
    
    if (window.showToast) {
        window.showToast(`✅ Imported ${savedCount} appointment(s)! ${skippedCount > 0 ? `⏭️ Skipped ${skippedCount}` : ''}`, 'success');
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

Notes: [Enter notes about the conversation, interest level, and next steps]`;
    if (textArea.value && !confirm('This will replace your current text. Continue?')) return;
    textArea.value = template;
    if (window.showToast) window.showToast('📋 Template inserted!', 'success');
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
    if (window.showToast) window.showToast('🧹 Cleared all extracted data', 'info');
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
        if (window.showToast) window.showToast(`✅ Updated record for ${duplicate.existing.business}`, 'success');
        record.isValid = false;
        record.saved = true;
    }
}

function importAsNew(index) {
    const record = AppState.importRecords.find(r => r.index === index);
    if (record) {
        record.forceImport = true;
        if (window.showToast) window.showToast(`✅ Will import "${record.validated.business}" as new`, 'info');
    }
}

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

window.openSmartImportEnhanced = openSmartImportEnhanced;
window.closeSmartImportEnhanced = closeSmartImportEnhanced;
window.parseAndPreviewImportEnhanced = parseAndPreviewImportEnhanced;
window.renderImportResults = renderImportResults;
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

window.SmartImport = {
    open: openSmartImportEnhanced,
    close: closeSmartImportEnhanced,
    parse: parseAndPreviewImportEnhanced,
    render: renderImportResults,
    save: saveAllImportedAppointments,
    state: SmartImportState,
    config: SMART_IMPORT_CONFIG,
    checkAI: checkAIAvailability
};

console.log('📥 Smart Import (Hybrid Parser) loaded successfully');
console.log('🤖 AI Available:', checkAIAvailability() ? '✅ Yes' : '❌ No');
console.log('📊 Use "Parse Transcript" to extract data from conversations');