// ================================================================
// SMART IMPORT - Enhanced with Gemini AI Integration
// ================================================================

const SMART_IMPORT_CONFIG = {
    useAI: true,
    fallbackToRuleBased: true,
    showConfidence: true,
    showEvidence: true,
    showAIStatus: true,
    defaultStatus: 'Meeting Booked',
    defaultAssigned: 'Daniel'
};

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
    aiResult: null,
    aiStatus: 'idle',
    aiErrorMessage: null,
    isEditable: false,
    useAI: true,
    fallbackToRuleBased: true,
    parsedData: null
};

// ================================================================
// AI SERVICE INITIALIZATION
// ================================================================

async function initAIService() {
    try {
        if (typeof geminiService === 'undefined') {
            console.warn('⚠️ Gemini service not loaded');
            return false;
        }
        const initialized = await geminiService.init();
        if (initialized) {
            console.log('🤖 Gemini AI Service ready');
            return true;
        }
        console.warn('⚠️ Gemini AI Service not available');
        return false;
    } catch (error) {
        console.error('❌ Failed to initialize AI service:', error);
        return false;
    }
}

function isAIConfigured() {
    return !!(window.APP_CONFIG?.gemini?.apiKey || window.GEMINI_API_KEY || localStorage.getItem('gemini_api_key'));
}

// ================================================================
// AI TRANSCRIPT PARSING
// ================================================================

async function parseTranscriptWithAI(transcript, defaultDate = null) {
    if (!transcript || transcript.trim().length === 0) {
        throw new Error('Please paste a transcript to parse');
    }

    SmartImportState.aiStatus = 'loading';
    SmartImportState.aiErrorMessage = null;
    SmartImportState.currentTranscript = transcript;
    SmartImportState.parseStartTime = Date.now();
    
    updateAIStatus('🧠 AI analyzing transcript...');

    try {
        const aiAvailable = await initAIService();
        let result;
        
        if (aiAvailable && SmartImportState.useAI) {
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('AI analysis timeout')), 30000);
                });
                const analysisPromise = geminiService.analyzeTranscript(transcript, { defaultDate });
                result = await Promise.race([analysisPromise, timeoutPromise]);
                SmartImportState.aiResult = result;
                SmartImportState.aiStatus = 'success';
                updateAIStatus('✅ AI analysis complete!');
            } catch (aiError) {
                console.warn('AI analysis failed:', aiError);
                SmartImportState.aiStatus = 'warning';
                updateAIStatus('⚠️ AI error, using fallback');
                result = await parseTranscriptWithFallback(transcript, defaultDate);
            }
        } else {
            SmartImportState.aiStatus = 'warning';
            updateAIStatus('⚠️ Using fallback parser');
            result = await parseTranscriptWithFallback(transcript, defaultDate);
        }

        SmartImportState.parseEndTime = Date.now();
        const parseTime = ((SmartImportState.parseEndTime - SmartImportState.parseStartTime) / 1000).toFixed(1);
        updateAIStatus(`✅ Analysis complete in ${parseTime}s`);

        return result;
    } catch (error) {
        console.error('Transcript parsing error:', error);
        SmartImportState.aiStatus = 'error';
        SmartImportState.aiErrorMessage = error.message || 'Failed to parse transcript';
        updateAIStatus(`❌ ${SmartImportState.aiErrorMessage}`);
        if (SmartImportState.fallbackToRuleBased) {
            updateAIStatus('⚠️ Falling back to rule-based parser...');
            return await parseTranscriptWithFallback(transcript, defaultDate);
        }
        throw error;
    }
}

async function parseTranscriptWithFallback(transcript, defaultDate) {
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
    result.suggestedFollowUp = { value: [], confidence: 0, evidence: '' };
    result.tags = { value: [], confidence: 0, evidence: '' };
    result.sentiment = { value: 'Neutral', confidence: 0, evidence: '' };
    
    return result;
}

function updateAIStatus(message) {
    const statusEl = document.getElementById('aiStatusDisplay');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = 'ai-status-display ' + 
            (SmartImportState.aiStatus === 'loading' ? 'loading' : 
             SmartImportState.aiStatus === 'success' ? 'success' : 
             SmartImportState.aiStatus === 'error' ? 'error' : 
             SmartImportState.aiStatus === 'warning' ? 'warning' : '');
    }
}

// ================================================================
// SMART IMPORT UI FUNCTIONS
// ================================================================

function openSmartImportEnhanced() {
    const modal = document.getElementById('smartImportModal');
    if (!modal) return;
    modal.style.display = 'flex';
    
    AppState.importRecords = [];
    AppState.importProcessing = false;
    AppState.importProgress = 0;
    SmartImportState.isParsing = false;
    SmartImportState.aiResult = null;
    SmartImportState.aiStatus = 'idle';
    SmartImportState.aiErrorMessage = null;
    SmartImportState.parsedData = null;
    
    const dateInput = document.getElementById('importDefaultDate');
    if (dateInput) dateInput.value = Utils.getTodayStr();
    
    const textArea = document.getElementById('importTextArea');
    if (textArea) {
        textArea.value = '';
        textArea.placeholder = `Paste your conversation transcript here. The AI will intelligently extract all CRM fields.

Example:
"Flynn: Hey, is this RG77 Tires?
Prospect: Yes, sir.
Flynn: Awesome, Flynn here. I found you online and my team created a custom website preview for your business. I was wondering if you have a few moments tomorrow to look at it?
Prospect: Honestly, tomorrow I ain't gonna be here.
Flynn: What date this week would be best?
Prospect: Thursday morning.
Flynn: Great, I'll call you Thursday at 9:00 AM EDT. May I ask for the best email to send the invite?
Prospect: Right now, my email doesn't work, it's full. Just call me Thursday."`;
    }
    
    const preview = document.getElementById('importPreview');
    if (preview) preview.style.display = 'none';
    
    const saveBtn = document.getElementById('saveImportBtn');
    if (saveBtn) saveBtn.style.display = 'none';
    
    const resultsContainer = document.getElementById('importResultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';
    
    const progressContainer = document.getElementById('importProgressContainer');
    if (progressContainer) progressContainer.style.display = 'none';
    
    const summary = document.getElementById('importSummary');
    if (summary) summary.style.display = 'none';
    
    const parseBtn = document.getElementById('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript (AI)';
        parseBtn.disabled = false;
    }
    
    let aiStatusEl = document.getElementById('aiStatusDisplay');
    if (!aiStatusEl) {
        const statusContainer = document.createElement('div');
        statusContainer.id = 'aiStatusDisplay';
        statusContainer.className = 'ai-status-display';
        statusContainer.textContent = '🤖 AI ready';
        const modalCard = modal.querySelector('.modal-card');
        if (modalCard) {
            modalCard.insertBefore(statusContainer, modalCard.querySelector('.form-group'));
        }
    } else {
        aiStatusEl.textContent = '🤖 AI ready';
        aiStatusEl.className = 'ai-status-display';
    }
}

function closeSmartImportEnhanced() {
    const modal = document.getElementById('smartImportModal');
    if (modal) modal.style.display = 'none';
    AppState.importRecords = [];
    AppState.importProcessing = false;
    SmartImportState.isParsing = false;
    SmartImportState.currentTranscript = null;
    SmartImportState.aiResult = null;
    SmartImportState.aiStatus = 'idle';
    SmartImportState.parsedData = null;
}

async function parseAndPreviewImportEnhanced() {
    const textArea = document.getElementById('importTextArea');
    if (!textArea) return;
    
    const text = textArea.value;
    if (!text.trim()) {
        showToast('Please paste a transcript to parse', 'warning');
        return;
    }
    
    const dateInput = document.getElementById('importDefaultDate');
    const defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
    
    const progressContainer = document.getElementById('importProgressContainer');
    if (progressContainer) progressContainer.style.display = 'block';
    AppState.importProcessing = true;
    SmartImportState.isParsing = true;
    AppState.importProgress = 0;
    SmartImportState.parseStartTime = Date.now();
    
    const parseBtn = document.getElementById('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI Analyzing...';
        parseBtn.disabled = true;
    }
    
    updateImportProgress(5, '🧠 AI analyzing transcript...');
    updateAIStatus('🧠 AI analyzing transcript...');
    
    try {
        const aiAvailable = await initAIService();
        
        if (aiAvailable && SmartImportState.useAI) {
            updateImportProgress(20, '🤖 Sending to AI for analysis...');
            const aiResult = await geminiService.analyzeTranscript(text, { defaultDate });
            
            if (!aiResult) throw new Error('AI returned no results');
            
            SmartImportState.aiResult = aiResult;
            SmartImportState.aiStatus = 'success';
            updateAIStatus('✅ AI analysis complete!');
            
            const mapped = aiResponseMapper.mapToAppointment(aiResult);
            
            const record = {
                index: 1,
                raw: text,
                parsed: mapped,
                confidence: mapped._aiConfidence || {},
                evidence: mapped._aiEvidence || {},
                validated: mapped,
                isValid: mapped.business && mapped.business !== 'N/A' && mapped.name && mapped.name !== 'N/A',
                errors: [],
                warnings: [],
                uncertainFields: [],
                hasDuplicate: false,
                duplicates: [],
                avgConfidence: Object.values(mapped._aiConfidence || {}).reduce((a, b) => a + b, 0) / Math.max(1, Object.values(mapped._aiConfidence || {}).length),
                aiResult: aiResult,
                qualityScore: mapped.meetingQualityScore || 5,
                callSummary: mapped.callSummary || '',
                detectedObjections: mapped.detectedObjections || [],
                missingInformation: mapped.missingInformation || [],
                suggestedFollowUp: mapped.suggestedFollowUp || []
            };
            
            const uncertain = [];
            for (const [field, conf] of Object.entries(mapped._aiConfidence || {})) {
                if (conf < 0.5) uncertain.push({ field, message: `Low confidence in ${field}` });
            }
            record.uncertainFields = uncertain;
            
            const existingAppointments = Data.getAllAppointments();
            for (const existing of existingAppointments) {
                if (mapped.business && existing.business && 
                    mapped.business.toLowerCase().trim() === existing.business.toLowerCase().trim() &&
                    mapped.phone && existing.phone &&
                    mapped.phone.replace(/[^\d+]/g, '') === existing.phone.replace(/[^\d+]/g, '')) {
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
            
            updateImportProgress(85, '✅ AI analysis complete!');
            
            setTimeout(() => {
                renderImportResults([record], Math.round(record.avgConfidence * 100), 
                    ((Date.now() - SmartImportState.parseStartTime) / 1000).toFixed(1));
                AppState.importProcessing = false;
                SmartImportState.isParsing = false;
                updateImportProgress(100, '✨ Ready! Review and save.');
                setTimeout(() => {
                    if (progressContainer) progressContainer.style.display = 'none';
                }, 1500);
                if (parseBtn) {
                    parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript (AI)';
                    parseBtn.disabled = false;
                }
                showToast('✅ AI analysis complete! Review the extracted data below.', 'success');
            }, 400);
        } else {
            updateAIStatus('⚠️ AI unavailable, using fallback');
            updateImportProgress(20, '⚠️ Using fallback parser...');
            
            const result = await parseTranscriptWithFallback(text, defaultDate);
            
            const record = {
                index: 1,
                raw: text,
                parsed: result,
                confidence: {},
                validated: result,
                isValid: result.business?.value !== 'N/A' && result.name?.value !== 'N/A',
                errors: [],
                warnings: [],
                uncertainFields: [],
                hasDuplicate: false,
                duplicates: [],
                avgConfidence: 0.5,
                qualityScore: 5,
                callSummary: '',
                detectedObjections: [],
                missingInformation: [],
                suggestedFollowUp: []
            };
            
            AppState.importRecords = [record];
            SmartImportState.parsedData = record;
            
            updateImportProgress(85, '✅ Analysis complete!');
            
            setTimeout(() => {
                renderImportResults([record], 60, 
                    ((Date.now() - SmartImportState.parseStartTime) / 1000).toFixed(1));
                AppState.importProcessing = false;
                SmartImportState.isParsing = false;
                updateImportProgress(100, '✨ Ready! Review and save.');
                setTimeout(() => {
                    if (progressContainer) progressContainer.style.display = 'none';
                }, 1500);
                if (parseBtn) {
                    parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript (AI)';
                    parseBtn.disabled = false;
                }
                showToast('✅ Analysis complete! Review the extracted data below.', 'success');
            }, 400);
        }
    } catch (error) {
        console.error('Smart Import parse error:', error);
        SmartImportState.aiStatus = 'error';
        SmartImportState.aiErrorMessage = error.message || 'Failed to parse transcript';
        updateAIStatus(`❌ ${SmartImportState.aiErrorMessage}`);
        showToast('Error parsing transcript: ' + error.message, 'error');
        AppState.importProcessing = false;
        SmartImportState.isParsing = false;
        if (progressContainer) progressContainer.style.display = 'none';
        if (parseBtn) {
            parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript (AI)';
            parseBtn.disabled = false;
        }
    }
}

function renderImportResults(records, avgConfidence, parseTime) {
    const preview = document.getElementById('importPreview');
    const resultsContainer = document.getElementById('importResultsContainer');
    const saveBtn = document.getElementById('saveImportBtn');
    const summary = document.getElementById('importSummary');
    const recordCount = document.getElementById('importRecordCount');
    
    if (!preview || !resultsContainer) return;
    preview.style.display = 'block';
    if (recordCount) recordCount.textContent = records.length;
    
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
                <div class="import-stat success"><span class="stat-number">${valid}</span><span class="stat-label">✅ Valid</span></div>
                <div class="import-stat ${invalid > 0 ? 'warning' : ''}"><span class="stat-number">${invalid}</span><span class="stat-label">⚠️ Needs Review</span></div>
                <div class="import-stat ${duplicates > 0 ? 'warning' : ''}"><span class="stat-number">${duplicates}</span><span class="stat-label">🔄 Duplicates</span></div>
                <div class="import-stat ${uncertain > 0 ? 'warning' : ''}"><span class="stat-number">${uncertain}</span><span class="stat-label">❓ Uncertain</span></div>
                <div class="import-stat"><span class="stat-number" style="color: var(--${confidenceColor});">${avgConfidence}%</span><span class="stat-label">🧠 Confidence (${confidenceLabel})</span></div>
                <div class="import-stat"><span class="stat-number">${parseTime || '0.0'}s</span><span class="stat-label">⏱️ Parse Time</span></div>
            </div>
        `;
    }
    
    let resultsHtml = '';
    records.forEach((record) => {
        const data = record.validated || record.parsed || {};
        const confidence = record.confidence || {};
        
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
        
        const fieldRows = fields.filter(f => f.value).map(f => {
            const conf = confidence[f.key] || 0.5;
            const confLabel = conf >= 0.8 ? 'High' : (conf >= 0.5 ? 'Medium' : 'Low');
            const confClass = conf >= 0.8 ? 'high' : (conf >= 0.5 ? 'medium' : 'low');
            const isNA = f.value === 'N/A' || !f.value;
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
                    </div>
                    <div class="record-badges">
                        ${record.hasDuplicate ? '<span class="badge duplicate">🔄 Duplicate</span>' : ''}
                        ${record.uncertainFields && record.uncertainFields.length > 0 ? `<span class="badge warning">❓ ${record.uncertainFields.length}</span>` : ''}
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

function saveAllImportedAppointments() {
    const validRecords = AppState.importRecords.filter(r => r.isValid);
    if (validRecords.length === 0) {
        showToast('No valid records to import', 'warning');
        return;
    }
    if (!AppState.currentUser) {
        showToast('Please sign in first', 'error');
        return;
    }
    
    let savedCount = 0;
    let skippedCount = 0;
    
    validRecords.forEach(record => {
        const data = record.validated || record.parsed;
        if (data.business === 'N/A' || data.name === 'N/A') {
            skippedCount++;
            return;
        }
        const result = Data.addAppointment(
            data.date && data.date !== 'N/A' ? data.date : Utils.getTodayStr(),
            data.business,
            data.name,
            data.role && data.role !== 'N/A' ? data.role : 'Owner',
            data.phone && data.phone !== 'N/A' ? data.phone : '',
            data.time && data.time !== 'N/A' ? data.time : '',
            data.notes && data.notes !== 'N/A' ? data.notes : '',
            data.assigned && data.assigned !== 'N/A' ? data.assigned : 'Daniel',
            null,
            data.status && data.status !== 'N/A' ? data.status : 'Meeting Booked',
            '',
            data.tags || []
        );
        if (result) savedCount++;
    });
    
    showToast(`✅ Imported ${savedCount} appointment(s)! ${skippedCount > 0 ? `⏭️ Skipped ${skippedCount}` : ''}`, 'success');
    closeSmartImportEnhanced();
    if (typeof FeaturePanel !== 'undefined') FeaturePanel.refreshCurrentView();
    Stats.updateAll();
}

function updateImportProgress(percent, message) {
    const progressBar = document.getElementById('importProgressBar');
    const progressStatus = document.getElementById('importProgressStatus');
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
    const dateInput = document.getElementById('importDefaultDate');
    const defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
    const formattedDate = defaultDate ? Utils.formatDate(defaultDate) : 'Today';
    const textArea = document.getElementById('importTextArea');
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
    showToast('📋 Template inserted!', 'success');
}

async function quickImportFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            openSmartImportEnhanced();
            const textArea = document.getElementById('importTextArea');
            if (textArea) textArea.value = text;
            setTimeout(parseAndPreviewImportEnhanced, 500);
        } else {
            showToast('Clipboard is empty', 'warning');
        }
    } catch (error) {
        showToast('Unable to read clipboard. Please paste manually.', 'error');
    }
}

function clearExtractedData() {
    if (!confirm('Clear all extracted data?')) return;
    SmartImportState.parsedData = null;
    AppState.importRecords = [];
    const preview = document.getElementById('importPreview');
    if (preview) preview.style.display = 'none';
    const resultsContainer = document.getElementById('importResultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';
    const summary = document.getElementById('importSummary');
    if (summary) summary.style.display = 'none';
    const saveBtn = document.getElementById('saveImportBtn');
    if (saveBtn) saveBtn.style.display = 'none';
    const textArea = document.getElementById('importTextArea');
    if (textArea) textArea.value = '';
    showToast('🧹 Cleared all extracted data', 'info');
}

function startFieldEdit(el) {
    if (el.textContent === 'N/A') return;
    el.dataset.originalValue = el.textContent;
}

function saveFieldEdit(el) {
    const newValue = el.textContent.trim();
    const field = el.dataset.field;
    const originalValue = el.dataset.originalValue;
    if (newValue !== originalValue && newValue !== '') {
        if (AppState.importRecords && AppState.importRecords.length > 0) {
            const record = AppState.importRecords[0];
            if (record && record.validated) {
                record.validated[field] = newValue;
                record.confidence[field] = 0.95;
            }
        }
        showToast(`✅ ${field} updated to: ${newValue}`, 'success');
    }
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
    const data = record.validated || record.parsed;
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
        showToast(`✅ Updated record for ${duplicate.existing.business}`, 'success');
        record.isValid = false;
        record.saved = true;
    }
}

function importAsNew(index) {
    const record = AppState.importRecords.find(r => r.index === index);
    if (record) {
        record.forceImport = true;
        showToast(`✅ Will import "${record.parsed.business}" as new`, 'info');
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
window.initAIService = initAIService;
window.parseTranscriptWithAI = parseTranscriptWithAI;
window.updateAIStatus = updateAIStatus;
window.startFieldEdit = startFieldEdit;
window.saveFieldEdit = saveFieldEdit;
window.reviewDuplicate = reviewDuplicate;
window.updateDuplicate = updateDuplicate;
window.importAsNew = importAsNew;
window.SmartImportState = SmartImportState;

console.log('📥 Smart Import with Gemini AI loaded');
console.log('🔑 AI Configured:', isAIConfigured() ? '✅ Yes' : '❌ No');