// ================================================================
// SMART IMPORT - Rule-Based Only (No AI)
// Complete replacement for smart-import.js
// ================================================================

/**
 * Smart Import Configuration - AI DISABLED
 */
const SMART_IMPORT_CONFIG = {
    useAI: false, // AI disabled
    fallbackToRuleBased: true,
    showConfidence: false,
    showEvidence: false,
    showAIStatus: false,
    defaultStatus: 'Meeting Booked',
    defaultAssigned: 'Daniel'
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
    isEditable: false,
    useAI: false,
    fallbackToRuleBased: true,
    parsedData: null
};

// ================================================================
// DOM HELPERS
// ================================================================

const SmartImportDOM = window.DOM || {
    get: function(id) { return document.getElementById(id); },
    show: function(id) { 
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    },
    hide: function(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    },
    setText: function(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },
    setHTML: function(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }
};

// ================================================================
// ENHANCED RULE-BASED PARSER
// ================================================================

function parseTranscriptEnhanced(transcript, defaultDate) {
    const result = {
        business: { value: 'N/A', confidence: 0, evidence: '' },
        name: { value: 'N/A', confidence: 0, evidence: '' },
        role: { value: 'N/A', confidence: 0, evidence: '' },
        phone: { value: 'N/A', confidence: 0, evidence: '' },
        email: { value: 'N/A', confidence: 0, evidence: '' },
        date: { value: defaultDate || new Date().toISOString().split('T')[0], confidence: 0.3, evidence: '' },
        time: { value: 'N/A', confidence: 0, evidence: '' },
        status: { value: 'Meeting Booked', confidence: 0.3, evidence: '' },
        assigned: { value: 'Daniel', confidence: 0.3, evidence: '' },
        notes: { value: '', confidence: 0.5, evidence: '' },
        callSummary: { value: '', confidence: 0, evidence: '' },
        meetingQualityScore: { value: 5, confidence: 0, evidence: '' },
        detectedObjections: { value: [], confidence: 0, evidence: '' },
        missingInformation: { value: [], confidence: 0, evidence: '' },
        suggestedFollowUp: { value: [], confidence: 0, evidence: '' },
        tags: { value: [], confidence: 0, evidence: '' },
        sentiment: { value: 'Neutral', confidence: 0, evidence: '' }
    };

    const cleanText = transcript.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n').filter(line => line.trim());
    const fullText = lines.join(' ');

    // ============================================================
    // PATTERN DEFINITIONS
    // ============================================================

    // Business name patterns
    const businessPatterns = [
        /(?:business|company|organization|org|firm|brand|store|shop)[:\s]+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[,.\n]|$)/i,
        /(?:from|at|with|for)\s+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[,.\n]|$)/i,
        /(?:called|named)\s+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[,.\n]|$)/i,
        /^([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:\s+(?:is|are|was|were|has|have|had|said|wants))/i
    ];

    // Name patterns
    const namePatterns = [
        /(?:name|contact|client|customer|person|full name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /(?:from|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:from|at|with|said|wants|would like)/i,
        /(?:my name is|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
    ];

    // Phone patterns
    const phonePatterns = [
        /(?:phone|mobile|cell|telephone|number|call|contact)[:\s]+([+\d\s\-\(\)]{7,20})/i,
        /([+\d\s\-\(\)]{10,20})(?:\s*(?:is|was|will be|the|their|his|her))/i,
        /(\d{3}[-.]?\d{3}[-.]?\d{4})/,
        /\(\d{3}\)\s*\d{3}[-.]?\d{4}/,
        /(\+\d{1,3}[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})/
    ];

    // Email patterns
    const emailPatterns = [
        /([^\s@]+@[^\s@]+\.[^\s@]+)/,
        /(?:email|e-mail|mail|address)[:\s]+([^\s@]+@[^\s@]+\.[^\s@]+)/i
    ];

    // Role patterns
    const rolePatterns = [
        /(?:role|title|position|job title|designation)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /(?:owner|manager|ceo|director|supervisor|team lead|president|founder|co-founder)/i
    ];

    // Date patterns
    const datePatterns = [
        /(?:date|appointment|scheduled|meeting|call|day|on)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
        /(\d{1,2}\/\d{1,2}\/\d{4})/,
        /(\d{4}-\d{2}-\d{2})/,
        /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/,
        /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i
    ];

    // Time patterns
    const timePatterns = [
        /(?:time|at|for)[:\s]+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
        /(?:time|at|for)[:\s]+(\d{1,2}\s*(?:AM|PM|am|pm))/i,
        /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/,
        /(\d{1,2}\s*(?:AM|PM|am|pm))/
    ];

    // Status patterns
    const statusPatterns = {
        'Hot Transfer': /(?:hot transfer|hot lead|ready to transfer|transferring now|take it over)/i,
        'Warm Callback': /(?:warm callback|call back|follow up|follow-up|callback|call me back|get back to)/i,
        'Completed': /(?:completed|done|finished|closed|wrapped up|finalized)/i,
        'Canceled': /(?:canceled|cancelled|no show|didn't show|not interested|no longer|passed)/i,
        'Rescheduled': /(?:rescheduled|reschedule|postponed|pushed back|moved to|another time)/i,
        'Meeting Booked': /(?:meeting booked|booked|scheduled|confirmed|set up|locked in|calendar invite)/i,
        'Held': /(?:held|meeting done|conversation had|discussed|walked through|presented)/i,
        'Pending': /(?:pending|waiting|undecided|thinking|considering|maybe)/i
    };

    // Sentiment patterns
    const sentimentPatterns = {
        'Very Positive': /(?:amazing|excellent|outstanding|fantastic|perfect|brilliant|incredible|wonderful|extraordinary|love it|great job)/i,
        'Positive': /(?:great|good|nice|positive|happy|pleased|satisfied|impressed|interested|excited|enthusiastic|awesome|sounds good|like it)/i,
        'Neutral': /(?:okay|fine|alright|neutral|average|decent|moderate|standard|normal|not bad|so-so)/i,
        'Negative': /(?:bad|poor|terrible|awful|horrible|disappointed|unhappy|frustrated|annoyed|irritated|not good|don't like)/i,
        'Very Negative': /(?:worst|horrible|disgusting|atrocious|abysmal|appalling|dreadful|unacceptable|never|hate)/i
    };

    // Objection patterns
    const objectionPatterns = [
        /(?:not interested|no thanks|don't need|not right now)/i,
        /(?:too busy|don't have time|busy right now|can't talk)/i,
        /(?:already have|already got|we already|currently have)/i,
        /(?:too expensive|cost too much|price is high|budget)/i,
        /(?:call me back|not now|later|some other time)/i,
        /(?:send info|email me|just send|information)/i,
        /(?:who is this|how did you|where did you|why are you)/i
    ];

    // Tag patterns
    const tagPatterns = {
        'vip': /(?:vip|priority|important|key|major|top|high value)/i,
        'qualified_warm_call': /(?:qualified|warm call|good fit|ideal|perfect fit|qualified lead|interested|positive)/i,
        'high_interest': /(?:high interest|very interested|excited|enthusiastic|love it)/i,
        'decision_maker': /(?:owner|ceo|president|founder|director|decision maker|manager)/i,
        'callback_requested': /(?:callback|call back|return call|follow up|follow-up|next steps|schedule call|call me)/i,
        'referred': /(?:referred|reference|referral|recommended|suggested|from|sent by)/i,
        'no_website': /(?:no website|doesn't have a website|needs website|wants website|website redesign|new site)/i,
        'negligent_warm_callback': /(?:negligent|unqualified|not interested|no interest|poor fit|bad fit)/i
    };

    // Assigned agent patterns
    const assignedPatterns = [
        /(?:assigned|assigned to|owner|agent|representative|rep)[:\s]+([A-Z][a-z]+)/i,
        /(?:kailan|seif|daniel|sarah|mike|jessica|david)/i
    ];

    // ============================================================
    // EXTRACTION FUNCTIONS
    // ============================================================

    function extractField(patterns, text, defaultValue = 'N/A') {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const value = match[1].trim();
                if (value && value.length > 1) {
                    return value;
                }
            }
            // For regex patterns that don't use capture groups (like role patterns)
            if (typeof pattern === 'string' || !pattern.exec) {
                const match2 = text.match(pattern);
                if (match2 && match2[0]) {
                    const value = match2[0].trim();
                    if (value && value.length > 1) {
                        return value;
                    }
                }
            }
        }
        return defaultValue;
    }

    function extractAllMatches(pattern, text) {
        const matches = [];
        let match;
        const regex = new RegExp(pattern, 'gi');
        while ((match = regex.exec(text)) !== null) {
            if (match[1]) {
                matches.push(match[1].trim());
            } else if (match[0]) {
                matches.push(match[0].trim());
            }
        }
        return matches;
    }

    function extractStatus(text) {
        for (const [status, pattern] of Object.entries(statusPatterns)) {
            if (pattern.test(text)) {
                return status;
            }
        }
        return 'Meeting Booked';
    }

    function extractSentiment(text) {
        for (const [sentiment, pattern] of Object.entries(sentimentPatterns)) {
            if (pattern.test(text)) {
                return sentiment;
            }
        }
        return 'Neutral';
    }

    function extractTags(text) {
        const tags = [];
        for (const [tag, pattern] of Object.entries(tagPatterns)) {
            if (pattern.test(text)) {
                tags.push(tag);
            }
        }
        return tags;
    }

    function extractObjections(text) {
        const objections = [];
        for (const pattern of objectionPatterns) {
            if (pattern.test(text)) {
                const match = text.match(pattern);
                if (match) {
                    objections.push(match[0].trim());
                }
            }
        }
        // Remove duplicates
        return [...new Set(objections)];
    }

    function parseDateString(dateStr) {
        if (!dateStr) return null;
        const trimmed = dateStr.trim();
        
        // ISO format: YYYY-MM-DD
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
        
        // US format: MM/DD/YYYY
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
        
        // Natural format: Month Day, Year
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

        // Month Day format (without year)
        const monthDayMatch = trimmed.match(/([A-Za-z]+)\s+(\d{1,2})/i);
        if (monthDayMatch) {
            const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            const monthName = monthDayMatch[1].toLowerCase();
            const monthIndex = months.indexOf(monthName);
            if (monthIndex !== -1) {
                const day = parseInt(monthDayMatch[2]);
                const year = new Date().getFullYear();
                const date = new Date(year, monthIndex, day);
                // If date is in the past, use next year
                if (date < new Date() && monthIndex < new Date().getMonth()) {
                    date.setFullYear(year + 1);
                }
                if (!isNaN(date.getTime())) {
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                }
            }
        }
        
        // Today/Tomorrow/Yesterday
        if (/today/i.test(trimmed)) {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        if (/tomorrow/i.test(trimmed)) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        }
        if (/yesterday/i.test(trimmed)) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        }
        
        return null;
    }

    // ============================================================
    // EXECUTE EXTRACTION
    // ============================================================

    // Extract business name
    let business = extractField(businessPatterns, fullText);
    if (business === 'N/A') {
        // Try to find business after "is this" pattern
        const isThisMatch = fullText.match(/is this\s+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[?.,!]|$)/i);
        if (isThisMatch && isThisMatch[1]) {
            business = isThisMatch[1].trim();
        }
    }
    if (business && business !== 'N/A') {
        result.business.value = business;
        result.business.confidence = 0.7;
    }

    // Extract name
    let name = extractField(namePatterns, fullText);
    if (name === 'N/A') {
        // Try "Prospect: Name" pattern
        const prospectMatch = fullText.match(/Prospect:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        if (prospectMatch && prospectMatch[1]) {
            name = prospectMatch[1].trim();
        }
    }
    if (name && name !== 'N/A') {
        result.name.value = name;
        result.name.confidence = 0.7;
    }

    // Extract phone
    let phone = extractField(phonePatterns, fullText);
    if (phone && phone !== 'N/A') {
        // Clean up phone number
        phone = phone.replace(/[^+\d]/g, '');
        if (phone.length >= 10) {
            result.phone.value = phone;
            result.phone.confidence = 0.8;
        }
    }

    // Extract email
    let email = extractField(emailPatterns, fullText);
    if (email && email !== 'N/A') {
        result.email.value = email.toLowerCase();
        result.email.confidence = 0.9;
    }

    // Extract role
    let role = extractField(rolePatterns, fullText);
    if (role && role !== 'N/A') {
        result.role.value = role;
        result.role.confidence = 0.5;
    }

    // Extract date
    let date = extractField(datePatterns, fullText);
    if (date && date !== 'N/A') {
        const parsedDate = parseDateString(date);
        if (parsedDate) {
            result.date.value = parsedDate;
            result.date.confidence = 0.8;
        }
    }

    // Extract time
    let time = extractField(timePatterns, fullText);
    if (time && time !== 'N/A') {
        result.time.value = time;
        result.time.confidence = 0.8;
    }

    // Extract status
    const status = extractStatus(fullText);
    result.status.value = status;
    result.status.confidence = 0.6;

    // Extract assigned
    let assigned = extractField(assignedPatterns, fullText);
    if (assigned && assigned !== 'N/A') {
        result.assigned.value = assigned;
        result.assigned.confidence = 0.5;
    }

    // Extract sentiment
    const sentiment = extractSentiment(fullText);
    result.sentiment.value = sentiment;
    result.sentiment.confidence = 0.5;

    // Extract tags
    const tags = extractTags(fullText);
    if (tags.length > 0) {
        result.tags.value = tags;
        result.tags.confidence = 0.5;
    }

    // Extract objections
    const objections = extractObjections(fullText);
    if (objections.length > 0) {
        result.detectedObjections.value = objections;
        result.detectedObjections.confidence = 0.5;
    }

    // Extract notes - everything that wasn't captured
    let notes = '';
    for (const line of lines) {
        // Skip lines that are likely just speaker labels
        if (/^[A-Za-z]+:/.test(line) && !/Prospect:/.test(line) && !/Flynn:/.test(line)) {
            notes += line + '\n';
        } else if (!/^[A-Za-z]+:/.test(line) && line.length > 3) {
            notes += line + '\n';
        }
    }
    if (notes.trim()) {
        result.notes.value = notes.trim();
        result.notes.confidence = 0.5;
    }

    // Generate call summary
    const firstLines = lines.slice(0, 3).join(' ');
    if (firstLines) {
        result.callSummary.value = firstLines.substring(0, 150) + (firstLines.length > 150 ? '...' : '');
        result.callSummary.confidence = 0.4;
    }

    // Detect missing information
    const missing = [];
    if (result.business.value === 'N/A') missing.push('Business Name');
    if (result.name.value === 'N/A') missing.push('Contact Name');
    if (result.phone.value === 'N/A') missing.push('Phone Number');
    if (result.email.value === 'N/A') missing.push('Email');
    if (result.time.value === 'N/A') missing.push('Time');
    if (missing.length > 0) {
        result.missingInformation.value = missing;
        result.missingInformation.confidence = 0.9;
    }

    // Generate follow-up suggestions
    const suggestions = [];
    if (result.status.value === 'Warm Callback') {
        suggestions.push('Schedule follow-up call');
    }
    if (result.status.value === 'Meeting Booked') {
        suggestions.push('Send calendar invite');
    }
    if (result.status.value === 'Hot Transfer') {
        suggestions.push('Transfer to closer immediately');
    }
    if (result.status.value === 'Pending') {
        suggestions.push('Follow up in 2-3 days');
    }
    if (result.tags.value.includes('no_website')) {
        suggestions.push('Prepare website preview');
    }
    if (result.tags.value.includes('vip')) {
        suggestions.push('Priority follow-up');
    }
    if (suggestions.length > 0) {
        result.suggestedFollowUp.value = suggestions;
        result.suggestedFollowUp.confidence = 0.5;
    }

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
    
    // Remove AI status display if exists
    const aiStatusEl = SmartImportDOM.get('aiStatusDisplay');
    if (aiStatusEl) {
        aiStatusEl.textContent = '📋 Ready to parse';
        aiStatusEl.className = 'ai-status-display';
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
    SmartImportState.parsedData = null;
}

/**
 * Parse and preview import (rule-based only)
 */
function parseAndPreviewImportEnhanced() {
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
    
    const parseBtn = SmartImportDOM.get('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Parsing...';
        parseBtn.disabled = true;
    }
    
    updateImportProgress(10, '📋 Analyzing transcript...');
    
    try {
        // Use enhanced rule-based parser
        updateImportProgress(30, '🔍 Extracting fields...');
        
        const parsed = parseTranscriptEnhanced(text, defaultDate);
        
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
            suggestedFollowUp: parsed.suggestedFollowUp.value || [],
            tags: parsed.tags.value || []
        };
        
        // Check for uncertain fields
        const uncertain = [];
        for (const [field, data] of Object.entries(parsed)) {
            if (data.confidence < 0.3 && data.value !== 'N/A') {
                uncertain.push({ field, message: `Low confidence in ${field}` });
            }
        }
        record.uncertainFields = uncertain;
        
        // Check for duplicates
        const existingAppointments = Data.getAllAppointments();
        for (const existing of existingAppointments) {
            if (parsed.business.value !== 'N/A' && existing.business && 
                parsed.business.value.toLowerCase().trim() === existing.business.toLowerCase().trim() &&
                parsed.phone.value !== 'N/A' && existing.phone &&
                parsed.phone.value.replace(/[^\d+]/g, '') === existing.phone.replace(/[^\d+]/g, '')) {
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
        
        updateImportProgress(85, '✅ Analysis complete!');
        
        const parseTime = ((Date.now() - SmartImportState.parseStartTime) / 1000).toFixed(1);
        
        setTimeout(() => {
            renderImportResults([record], 65, parseTime);
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
 * Render import results
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
                    <span class="stat-number">${avgConfidence}%</span>
                    <span class="stat-label">📊 Confidence</span>
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
            const valueDisplay = f.key === 'date' && f.value !== 'N/A' ? Utils.formatDate(f.value) : f.value;
            return `
                <div class="field-row ${isNA ? 'na-field' : ''}">
                    <span class="field-label">${f.label}</span>
                    <span class="field-value ${isNA ? 'na-value' : ''}">${isNA ? 'N/A' : Utils.escapeHtml(valueDisplay)}</span>
                    <span class="field-label" style="font-size:0.6rem; min-width:auto;">${isNA ? 'Missing' : '✓'}</span>
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
                        ${record.tags && record.tags.length > 0 ? `<span class="badge confidence high">🏷️ ${record.tags.length}</span>` : ''}
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
                    ${record.suggestedFollowUp && record.suggestedFollowUp.length > 0 ? `
                        <div class="record-uncertain" style="border-left-color: var(--success);">
                            <strong>📌 Suggested Follow-ups:</strong>
                            <ul>${record.suggestedFollowUp.map(s => `<li>${s}</li>`).join('')}</ul>
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
                    ${record.callSummary ? `
                        <div style="padding:8px 12px; background:var(--bg-primary); border-radius:6px; margin-top:8px;">
                            <strong>📝 Summary:</strong>
                            <div style="margin-top:4px; font-size:0.8rem; color:var(--text-secondary);">${Utils.escapeHtml(record.callSummary)}</div>
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

// Export SmartImport object
window.SmartImport = {
    open: openSmartImportEnhanced,
    close: closeSmartImportEnhanced,
    parse: parseAndPreviewImportEnhanced,
    render: renderImportResults,
    save: saveAllImportedAppointments,
    state: SmartImportState,
    config: SMART_IMPORT_CONFIG
};

console.log('📥 Smart Import (Rule-Based) loaded successfully');
console.log('📊 Use "Parse Transcript" to extract data from conversations');