// ================================================================
// SMART IMPORT - Enhanced with Transcript Parser
// ================================================================

/**
 * Smart Import Configuration
 */
const SMART_IMPORT_CONFIG = {
    useParser: true,
    showConfidence: true,
    showEvidence: true,
    showAIStatus: false,
    defaultStatus: 'Meeting Booked',
    defaultAssigned: 'Daniel',
    minConfidence: 0.3
};

/**
 * Smart Import State
 */
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
    parserResult: null,
    isEditable: false,
    useParser: true,
    parsedData: null
};

// ================================================================
// DOM HELPERS
// ================================================================

const SmartImportDOM = window.DOM || {
    get: function(id) { return document.getElementById(id); },
    show: function(id) { const el = document.getElementById(id); if (el) el.style.display = 'block'; },
    hide: function(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; },
    setText: function(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; },
    setHTML: function(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
};

// ================================================================
// ENHANCED TRANSCRIPT PARSING WITH NEW PARSER
// ================================================================

async function parseTranscriptEnhanced(transcript, defaultDate) {
    console.log('📝 Starting enhanced transcript parsing...');
    
    // Check if the new parser is available
    if (typeof transcriptParser !== 'undefined') {
        try {
            // Use the new parser
            const result = transcriptParser.parse(transcript, defaultDate);
            console.log('✅ Parser result:', result);
            
            // Format the result for the existing smart import structure
            return {
                business: { 
                    value: result.business || 'N/A', 
                    confidence: result._confidence?.business || 0.7, 
                    evidence: result._evidence?.business || '' 
                },
                name: { 
                    value: result.name || 'N/A', 
                    confidence: result._confidence?.name || 0.7, 
                    evidence: result._evidence?.name || '' 
                },
                role: { 
                    value: result.role || 'N/A', 
                    confidence: result._confidence?.role || 0.5, 
                    evidence: result._evidence?.role || '' 
                },
                phone: { 
                    value: result.phone || 'N/A', 
                    confidence: result._confidence?.phone || 0.8, 
                    evidence: result._evidence?.phone || '' 
                },
                email: { 
                    value: result.email || 'N/A', 
                    confidence: result._confidence?.email || 0.8, 
                    evidence: result._evidence?.email || '' 
                },
                date: { 
                    value: result.date || defaultDate || 'N/A', 
                    confidence: result._confidence?.date || 0.7, 
                    evidence: result._evidence?.date || '' 
                },
                time: { 
                    value: result.time || 'N/A', 
                    confidence: result._confidence?.time || 0.7, 
                    evidence: result._evidence?.time || '' 
                },
                status: { 
                    value: result.status || 'Meeting Booked', 
                    confidence: result._confidence?.status || 0.6, 
                    evidence: result._evidence?.status || '' 
                },
                assigned: { 
                    value: result.assigned || 'Daniel', 
                    confidence: result._confidence?.assigned || 0.5, 
                    evidence: result._evidence?.assigned || '' 
                },
                notes: { 
                    value: result.notes || '', 
                    confidence: 0.6, 
                    evidence: 'Extracted from conversation' 
                },
                callSummary: { 
                    value: result.callSummary || '', 
                    confidence: 0.5, 
                    evidence: '' 
                },
                meetingQualityScore: { 
                    value: result.meetingQualityScore || 5, 
                    confidence: 0.5, 
                    evidence: '' 
                },
                detectedObjections: { 
                    value: result.detectedObjections || [], 
                    confidence: 0.5, 
                    evidence: '' 
                },
                missingInformation: { 
                    value: result.missingInformation || [], 
                    confidence: 0.9, 
                    evidence: '' 
                },
                tags: { 
                    value: result.tags || [], 
                    confidence: 0.5, 
                    evidence: '' 
                },
                sentiment: { 
                    value: result.sentiment || 'Neutral', 
                    confidence: 0.5, 
                    evidence: '' 
                },
                _parserResult: result
            };
        } catch (error) {
            console.error('Parser error:', error);
            // Fallback to basic extraction
            return await parseTranscriptWithFallback(transcript, defaultDate);
        }
    } else {
        console.warn('⚠️ Transcript parser not available, using fallback');
        return await parseTranscriptWithFallback(transcript, defaultDate);
    }
}

/**
 * Parse transcript with fallback (rule-based)
 */
async function parseTranscriptWithFallback(transcript, defaultDate) {
    console.log('📝 Using fallback parser...');
    
    // Simple fallback extraction
    const result = {};
    const patterns = {
        business: /(?:business|company|firm|brand|store)[:\s]+([^\n]+)/i,
        name: /(?:name|contact|client|customer)[:\s]+([^\n]+)/i,
        role: /(?:role|title|position)[:\s]+([^\n]+)/i,
        phone: /(?:phone|mobile|cell|number)[:\s]+([+\d\s\-\(\)]+)/i,
        email: /([^\s@]+@[^\s@]+\.[^\s@]+)/,
        date: /(?:date|appointment|meeting|call)[:\s]+([^\n]+)/i,
        time: /(?:time|at)[:\s]+([^\n]+)/i,
        status: /(?:status|outcome)[:\s]+([^\n]+)/i,
        assigned: /(?:assigned|owner|agent)[:\s]+([^\n]+)/i,
        notes: /(?:notes|remarks|summary)[:\s]+([^\n]+)/i
    };
    
    for (const [field, pattern] of Object.entries(patterns)) {
        const match = transcript.match(pattern);
        if (match && match[1]) {
            result[field] = { value: match[1].trim(), confidence: 0.6, evidence: match[0] };
        } else {
            result[field] = { value: 'N/A', confidence: 0, evidence: '' };
        }
    }
    
    if (result.date?.value === 'N/A' && defaultDate) {
        result.date.value = defaultDate;
        result.date.confidence = 0.3;
    }
    
    result.callSummary = { value: 'Call summary not available', confidence: 0, evidence: '' };
    result.meetingQualityScore = { value: 5, confidence: 0, evidence: '' };
    result.detectedObjections = { value: [], confidence: 0, evidence: '' };
    result.missingInformation = { value: [], confidence: 0, evidence: '' };
    result.tags = { value: [], confidence: 0, evidence: '' };
    result.sentiment = { value: 'Neutral', confidence: 0, evidence: '' };
    
    return result;
}

// ================================================================
// SMART IMPORT UI FUNCTIONS
// ================================================================

/**
 * Open the Smart Import modal
 */
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
    SmartImportState.parserResult = null;
    SmartImportState.parsedData = null;
    
    const dateInput = SmartImportDOM.get('importDefaultDate');
    if (dateInput) {
        dateInput.value = Utils.getTodayStr();
    }
    
    const textArea = SmartImportDOM.get('importTextArea');
    if (textArea) {
        textArea.value = '';
        textArea.placeholder = `Paste your conversation transcript here. The parser will intelligently extract all CRM fields.

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
    
    // Update parse button text
    const parseBtn = SmartImportDOM.get('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
        parseBtn.disabled = false;
    }
    
    // Update status display
    const statusEl = SmartImportDOM.get('aiStatusDisplay');
    if (statusEl) {
        const parserAvailable = typeof transcriptParser !== 'undefined';
        statusEl.textContent = parserAvailable ? '📝 Enhanced parser ready' : '📋 Ready to parse (basic)';
        statusEl.className = 'ai-status-display';
    }
}

/**
 * Close the Smart Import modal
 */
function closeSmartImportEnhanced() {
    const modal = SmartImportDOM.get('smartImportModal');
    if (modal) modal.style.display = 'none';
    AppState.importRecords = [];
    AppState.importProcessing = false;
    SmartImportState.isParsing = false;
    SmartImportState.currentTranscript = null;
    SmartImportState.parserResult = null;
    SmartImportState.parsedData = null;
}

/**
 * Parse and preview import with enhanced parser
 */
async function parseAndPreviewImportEnhanced() {
    console.log('🔍 Parsing transcript with enhanced parser...');
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
    
    const parseBtn = SmartImportDOM.get('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Parsing...';
        parseBtn.disabled = true;
    }
    
    updateImportProgress(10, '📝 Analyzing transcript...');
    
    try {
        // Use enhanced parser
        updateImportProgress(30, '🔍 Extracting fields...');
        
        const parsed = await parseTranscriptEnhanced(text, defaultDate);
        
        updateImportProgress(60, '📊 Processing results...');
        
        // Create record
        const record = {
            index: 1,
            raw: text,
            parsed: parsed,
            confidence: {},
            validated: {
                business: parsed.business.value,
                name: parsed.name.value,
                role: parsed.role.value,
                phone: parsed.phone.value,
                email: parsed.email.value,
                date: parsed.date.value,
                time: parsed.time.value,
                status: parsed.status.value,
                assigned: parsed.assigned.value,
                notes: parsed.notes.value
            },
            isValid: parsed.business.value !== 'N/A' && parsed.name.value !== 'N/A',
            errors: [],
            warnings: [],
            uncertainFields: [],
            hasDuplicate: false,
            duplicates: [],
            avgConfidence: 0.5,
            qualityScore: parsed.meetingQualityScore.value || 5,
            callSummary: parsed.callSummary.value || '',
            detectedObjections: parsed.detectedObjections.value || [],
            missingInformation: parsed.missingInformation.value || [],
            suggestedFollowUp: parsed.suggestedFollowUp?.value || [],
            tags: parsed.tags.value || [],
            sentiment: parsed.sentiment.value || 'Neutral',
            _confidence: {
                business: parsed.business.confidence || 0,
                name: parsed.name.confidence || 0,
                role: parsed.role.confidence || 0,
                phone: parsed.phone.confidence || 0,
                email: parsed.email.confidence || 0,
                date: parsed.date.confidence || 0,
                time: parsed.time.confidence || 0,
                status: parsed.status.confidence || 0
            }
        };
        
        // Calculate average confidence
        const confValues = Object.values(record._confidence);
        record.avgConfidence = confValues.reduce((a, b) => a + b, 0) / Math.max(1, confValues.length);
        
        // Check for uncertain fields
        const uncertain = [];
        for (const [field, conf] of Object.entries(record._confidence)) {
            if (conf < 0.4 && conf > 0) {
                uncertain.push({ field, message: `Low confidence (${Math.round(conf * 100)}%)` });
            }
        }
        record.uncertainFields = uncertain;
        
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
        
        AppState.importRecords = [record];
        SmartImportState.parsedData = record;
        SmartImportState.parserResult = parsed;
        
        updateImportProgress(85, '✅ Analysis complete!');
        
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

/**
 * Render import results with confidence indicators
 */
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
        const confidence = record._confidence || {};
        
        const fields = [
            { key: 'business', label: 'Business Name', value: data.business },
            { key: 'name', label: 'Contact Name', value: data.name },
            { key: 'role', label: 'Role', value: data.role },
            { key: 'phone', label: 'Phone Number', value: data.phone },
            { key: 'email', label: 'Email', value: data.email },
            { key: 'date', label: 'Date', value: data.date },
            { key: 'time', label: 'Time', value: data.time },
            { key: 'status', label: 'Status', value: data.status },
            { key: 'assigned', label: 'Assigned', value: data.assigned }
        ];
        
        const fieldRows = fields.map(f => {
            const isNA = f.value === 'N/A' || !f.value;
            const conf = confidence[f.key] || 0;
            const confLabel = conf >= 0.7 ? 'High' : (conf >= 0.4 ? 'Medium' : 'Low');
            const confClass = conf >= 0.7 ? 'high' : (conf >= 0.4 ? 'medium' : 'low');
            const valueDisplay = f.key === 'date' && f.value !== 'N/A' ? Utils.formatDate(f.value) : f.value;
            return `
                <div class="field-row ${isNA ? 'na-field' : ''} ${confClass}">
                    <span class="field-label">${f.label}</span>
                    <span class="field-value ${isNA ? 'na-value' : ''}">${isNA ? 'N/A' : Utils.escapeHtml(valueDisplay)}</span>
                    <span class="field-confidence ${confClass}">${isNA ? 'N/A' : confLabel}</span>
                </div>
            `;
        }).join('');
        
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
                        ${record.sentiment && record.sentiment !== 'N/A' ? `<span class="record-status-badge" style="background:${record.sentiment === 'Positive' ? 'var(--success)' : record.sentiment === 'Negative' ? 'var(--danger)' : 'var(--warning)'};">${record.sentiment}</span>` : ''}
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
                    ${record.uncertainFields && record.uncertainFields.length > 0 ? `
                        <div class="record-uncertain">
                            <strong>❓ Uncertain Fields:</strong>
                            <ul>${record.uncertainFields.map(u => `<li>${u.field}: ${u.message}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${record.missingInformation && record.missingInformation.length > 0 ? `
                        <div class="record-uncertain">
                            <strong>📋 Missing Information:</strong>
                            <ul>${record.missingInformation.map(m => `<li>${m}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${record.detectedObjections && record.detectedObjections.length > 0 ? `
                        <div class="record-uncertain" style="border-left-color: var(--warning);">
                            <strong>🛡️ Detected Objections:</strong>
                            <ul>${record.detectedObjections.map(o => `<li>${o}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${record.tags && record.tags.length > 0 ? `
                        <div class="record-uncertain" style="border-left-color: var(--primary);">
                            <strong>🏷️ Tags:</strong>
                            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
                                ${record.tags.map(t => `<span style="background:rgba(59,130,246,0.1); padding:2px 10px; border-radius:12px; font-size:0.7rem;">#${t}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${record.callSummary ? `
                        <div style="padding:8px 12px; background:var(--bg-primary); border-radius:6px; margin-top:8px;">
                            <strong>📝 Summary:</strong>
                            <div style="margin-top:4px; font-size:0.8rem; color:var(--text-secondary);">${Utils.escapeHtml(record.callSummary)}</div>
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

/**
 * Save all imported appointments
 */
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
        if (record.callSummary) {
            notes += (notes ? '\n\n' : '') + 'Call Summary: ' + record.callSummary;
        }
        if (record.detectedObjections && record.detectedObjections.length > 0) {
            notes += (notes ? '\n' : '') + 'Objections: ' + record.detectedObjections.join(', ');
        }
        if (record.suggestedFollowUp && record.suggestedFollowUp.length > 0) {
            notes += (notes ? '\n' : '') + 'Follow-up: ' + record.suggestedFollowUp.join(', ');
        }
        if (record.tags && record.tags.length > 0) {
            notes += (notes ? '\n' : '') + 'Tags: ' + record.tags.join(', ');
        }
        if (record.sentiment && record.sentiment !== 'Neutral') {
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
window.parseTranscriptEnhanced = parseTranscriptEnhanced;

// Export SmartImport object
window.SmartImport = {
    open: openSmartImportEnhanced,
    close: closeSmartImportEnhanced,
    parse: parseAndPreviewImportEnhanced,
    render: renderImportResults,
    save: saveAllImportedAppointments,
    state: SmartImportState,
    config: SMART_IMPORT_CONFIG,
    parseEnhanced: parseTranscriptEnhanced
};

console.log('📥 Smart Import (Enhanced with Parser) loaded successfully');
console.log('📊 Use "Parse Transcript" to extract data from conversations');