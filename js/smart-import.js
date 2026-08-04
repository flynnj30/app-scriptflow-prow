// ================================================================
// SMART IMPORT ENHANCED - Advanced Transcript Parsing
// Complete replacement for smart-import.js
// ================================================================

/**
 * Smart Import Configuration
 */
const SMART_IMPORT = {
    // Field mappings for intelligent parsing
    FIELD_MAPPINGS: {
        business: {
            labels: ['business', 'company', 'organization', 'org', 'firm', 'brand', 'store', 'business name', 'company name', 'client', 'account'],
            confidence: 0.9
        },
        name: {
            labels: ['name', 'contact', 'contact name', 'client name', 'customer name', 'person', 'full name', 'first name', 'last name', 'prospect', 'lead name'],
            confidence: 0.9
        },
        role: {
            labels: ['role', 'title', 'position', 'job title', 'designation', 'function', 'department', 'job role'],
            confidence: 0.85
        },
        phone: {
            labels: ['phone', 'mobile', 'cell', 'telephone', 'number', 'contact number', 'phone number', 'mobile number', 'phone no', 'cell phone', 'work phone', 'home phone', 'tel'],
            confidence: 0.9
        },
        email: {
            labels: ['email', 'e-mail', 'mail', 'email address', 'e-mail address', 'contact email', 'work email', 'personal email'],
            confidence: 0.9
        },
        date: {
            labels: ['date', 'appointment date', 'demo date', 'schedule date', 'meeting date', 'call date', 'day', 'best time', 'callback date', 'scheduled date', 'event date', 'when', 'demo time & date', 'appointment'],
            confidence: 0.85
        },
        time: {
            labels: ['time', 'appointment time', 'demo time', 'schedule time', 'meeting time', 'call time', 'hour', 'callback time', 'scheduled time', 'event time', 'at'],
            confidence: 0.85
        },
        status: {
            labels: ['status', 'state', 'stage', 'lead status', 'appointment status', 'call status', 'phase', 'step', 'demo status'],
            confidence: 0.8,
            options: ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held']
        },
        notes: {
            labels: ['notes', 'note', 'comment', 'remarks', 'additional notes', 'info', 'details', 'description', 'summary', 'observation', 'feedback', 'developer notes', 'notes for the developer'],
            confidence: 0.7
        },
        assigned: {
            labels: ['assigned', 'assigned to', 'owner', 'agent', 'representative', 'rep', 'assigned agent', 'team member', 'handler', 'manager'],
            confidence: 0.7
        },
        tags: {
            labels: ['tags', 'tag', 'label', 'labels', 'category'],
            confidence: 0.6
        },
        sentiment: {
            labels: ['sentiment', 'feeling', 'tone', 'mood', 'attitude'],
            confidence: 0.5
        },
        industry: {
            labels: ['industry', 'sector', 'field', 'type', 'vertical'],
            confidence: 0.5
        },
        website: {
            labels: ['website', 'url', 'web', 'site', 'current website'],
            confidence: 0.6
        },
        address: {
            labels: ['address', 'location', 'street', 'city', 'state', 'zip', 'location'],
            confidence: 0.5
        }
    },

    // Auto-tagging rules
    AUTO_TAG_RULES: [
        { pattern: /no website|doesn't have a website|needs website|wants website|website redesign|no current website|no site/i, tag: 'no_website' },
        { pattern: /high interest|very interested|excited|enthusiastic|positive|great|excellent|wants|would like|looking forward|interested/i, tag: 'high_interest' },
        { pattern: /vip|priority|important|key|major|top|critical|urgent/i, tag: 'vip' },
        { pattern: /callback|call back|return call|follow up|follow-up|next steps|schedule call|demo|walkthrough|meeting/i, tag: 'callback_requested' },
        { pattern: /referred|reference|referral|recommended|suggested|from|sent by/i, tag: 'referred' },
        { pattern: /decision maker|owner|ceo|president|founder|director|manager|leader|head of/i, tag: 'decision_maker' },
        { pattern: /qualified|warm call|good fit|ideal|perfect fit|qualified lead|good prospect/i, tag: 'qualified_warm_call' },
        { pattern: /social media|word of mouth|facebook|instagram|linkedin|social/i, tag: 'social_media' },
        { pattern: /cold call|cold outreach|intro|introduction|first contact/i, tag: 'cold_lead' },
        { pattern: /busy|available|free|schedule|booked|confirmed/i, tag: 'scheduled' },
        { pattern: /discovery|explore|discuss|goals|objectives|needs|requirements/i, tag: 'discovery' },
        { pattern: /deferred|postponed|later|reschedule|another time/i, tag: 'deferred' },
        { pattern: /no show|didn't show|did not show|failed to show|missed|no-show/i, tag: 'no_show' },
        { pattern: /hot transfer|hot lead|ready now|ready to close|urgent|immediate|hot/i, tag: 'hot_lead' },
        { pattern: /meeting booked|booked|demo booked|scheduled|confirmed|appointment set/i, tag: 'booked' }
    ],

    // Sentiment detection patterns
    SENTIMENT_PATTERNS: {
        'Very Positive': /(?:amazing|excellent|outstanding|fantastic|perfect|brilliant|incredible|wonderful|extraordinary|exceptional|superb|phenomenal|remarkable)/i,
        'Positive': /(?:great|good|nice|positive|happy|pleased|satisfied|impressed|interested|excited|enthusiastic|optimistic|favorable)/i,
        'Neutral': /(?:okay|fine|alright|neutral|average|decent|moderate|standard|normal|fair|adequate)/i,
        'Negative': /(?:bad|poor|terrible|awful|horrible|disappointed|unhappy|frustrated|annoyed|irritated|concerned|worried)/i,
        'Very Negative': /(?:worst|horrible|disgusting|atrocious|abysmal|appalling|dreadful|unacceptable|terrible|awful)/i
    },

    // Source detection
    SOURCE_PATTERNS: {
        'Smart Import': /(?:import|pasted|bulk|from text)/i,
        'Manual Entry': /(?:manual|entered|typed|direct)/i,
        'CSV Import': /(?:csv|spreadsheet|excel|sheet)/i,
        'API': /(?:api|integration|sync|imported)/i,
        'Web Form': /(?:form|web|online|submitted)/i
    }
};

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
    totalProcessed: 0,
    totalValid: 0,
    totalInvalid: 0,
    totalDuplicates: 0,
    currentBatch: null,
    results: null,
    parseConfig: {
        defaultDate: null,
        defaultStatus: 'Pending',
        defaultAssigned: 'Daniel',
        autoTag: true,
        autoSentiment: true,
        autoSource: true,
        detectDuplicates: true,
        confidenceThreshold: 0.5,
        duplicateMatchThreshold: 0.7
    }
};

// ================================================================
// SMART IMPORT ENHANCED ENGINE
// ================================================================

class SmartImportEnhanced {
    constructor() {
        this.config = SmartImportState.parseConfig;
        this.fieldMappings = SMART_IMPORT.FIELD_MAPPINGS;
        this.autoTagRules = SMART_IMPORT.AUTO_TAG_RULES;
        this.sentimentPatterns = SMART_IMPORT.SENTIMENT_PATTERNS;
        this.sourcePatterns = SMART_IMPORT.SOURCE_PATTERNS;
    }

    /**
     * Parse transcript text into structured appointment data
     * Enhanced with natural language date/time detection
     */
    parseTranscript(text, options = {}) {
        const config = { ...this.config, ...options };
        const result = {};
        const confidence = {};
        const warnings = [];
        const context = this._analyzeTranscript(text);
        
        const cleanText = this._cleanText(text);
        const lines = cleanText.split('\n').filter(l => l.trim());
        const fullText = lines.join(' ');
        
        // STEP 1: Extract key-value pairs (most reliable)
        this._extractKeyValuePairs(lines, result, confidence, warnings);
        
        // STEP 2: Extract business name
        this._extractBusinessName(fullText, result, confidence);
        
        // STEP 3: Extract contact name
        this._extractContactName(fullText, result, confidence);
        
        // STEP 4: Extract phone number
        this._extractPhoneNumber(fullText, result, confidence);
        
        // STEP 5: Extract email
        this._extractEmail(fullText, result, confidence);
        
        // STEP 6: Extract date and time (natural language)
        this._extractDateTime(fullText, result, confidence, warnings);
        
        // STEP 7: Extract status from context
        this._extractStatus(fullText, result, confidence);
        
        // STEP 8: Extract notes for developer
        this._extractDeveloperNotes(fullText, lines, result, confidence);
        
        // STEP 9: Extract role
        this._extractRole(fullText, result, confidence);
        
        // STEP 10: Extract assigned to
        this._extractAssigned(fullText, result, confidence);
        
        // STEP 11: Detect tags
        this._detectTags(result, confidence);
        
        // STEP 12: Detect sentiment
        this._detectSentiment(result, confidence);
        
        // STEP 13: Detect source
        this._detectSource(fullText, result, confidence);
        
        // STEP 14: Apply defaults
        this._applyDefaults(result, confidence, config);
        
        // STEP 15: Validate
        const isValid = this._validateRequiredFields(result);
        const errors = this._getValidationErrors(result);
        
        // Generate developer notes if empty
        if (!result.notes || result.notes.trim().length < 3) {
            result.notes = this._generateDeveloperNotes(result, fullText);
            confidence.notes = 0.6;
        }
        
        return {
            result,
            confidence,
            context,
            warnings,
            errors,
            isValid: isValid && errors.length === 0
        };
    }
    
    /**
     * Analyze transcript format
     */
    _analyzeTranscript(text) {
        const lines = text.split('\n').filter(l => l.trim());
        return {
            hasKeyValue: lines.some(line => /^[^:]+:.+/.test(line)),
            hasBulletPoints: lines.some(line => /^[\s]*[â€¢\-*]\s/.test(line)),
            hasDateTime: /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/i.test(text),
            hasPhone: /[\+\d\s\-\(\)]{7,20}/.test(text),
            hasEmail: /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text),
            detectedFormat: this._detectFormat(lines),
            wordCount: text.split(/\s+/).length,
            lineCount: lines.length
        };
    }
    
    _detectFormat(lines) {
        let keyValueCount = 0;
        let bulletCount = 0;
        
        lines.forEach(line => {
            if (/^[^:]+:.+/.test(line)) keyValueCount++;
            if (/^[\s]*[â€¢\-*]\s/.test(line)) bulletCount++;
        });
        
        if (keyValueCount > lines.length * 0.25) return 'key_value';
        if (bulletCount > lines.length * 0.25) return 'bullet_points';
        return 'natural_language';
    }
    
    _cleanText(text) {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\u2013|\u2014/g, '-')
            .replace(/\u2018|\u2019/g, "'")
            .replace(/\u201C|\u201D/g, '"')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    /**
     * Extract key-value pairs from transcript
     */
    _extractKeyValuePairs(lines, result, confidence, warnings) {
        const separators = [':', '=', '->', '=>', 'â€”'];
        const fieldPatterns = {
            'business': /(?:business|company|organization|org|firm|brand|store)/i,
            'name': /(?:name|contact|client|customer|person|full name|contact name)/i,
            'phone': /(?:phone|mobile|cell|telephone|number|contact number|phone number)/i,
            'email': /(?:email|e-mail|mail|email address)/i,
            'date': /(?:date|appointment date|demo date|schedule date|meeting date|call date|day|best time|callback date|scheduled date|event date)/i,
            'time': /(?:time|appointment time|demo time|schedule time|meeting time|call time|hour|callback time|scheduled time|event time)/i,
            'status': /(?:status|state|stage|lead status|appointment status|call status|demo status)/i,
            'notes': /(?:notes|note|comment|remarks|additional notes|info|details|description|summary|developer notes)/i,
            'assigned': /(?:assigned|assigned to|owner|agent|representative|rep|handler|manager)/i,
            'role': /(?:role|title|position|job title|designation|job role)/i
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
                    for (const [field, pattern] of Object.entries(fieldPatterns)) {
                        if (pattern.test(key)) {
                            matchedField = field;
                            break;
                        }
                    }
                    
                    if (matchedField) {
                        if (matchedField === 'date' || matchedField === 'time') {
                            this._parseDateTimeField(value, result, confidence);
                        } else {
                            result[matchedField] = value;
                            confidence[matchedField] = 0.9;
                        }
                    } else {
                        // Store as notes
                        if (!result.notes) result.notes = '';
                        result.notes += (result.notes ? '\n' : '') + `${key}: ${value}`;
                        confidence.notes = 0.5;
                    }
                }
            }
        });
    }
    
    /**
     * Parse date/time field
     */
    _parseDateTimeField(value, result, confidence) {
        // Check if it contains both date and time
        const dateTimeMatch = value.match(/([A-Za-z]+(?:day)?)\s*,?\s*([A-Za-z]+)\s*(\d{1,2})\s*(?:,?\s*(\d{4}))?\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i);
        if (dateTimeMatch) {
            const monthName = dateTimeMatch[2];
            const day = parseInt(dateTimeMatch[3]);
            const year = dateTimeMatch[4] ? parseInt(dateTimeMatch[4]) : new Date().getFullYear();
            const time = dateTimeMatch[5];
            
            const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            const monthIndex = months.indexOf(monthName.toLowerCase());
            
            if (monthIndex !== -1) {
                const dateObj = new Date(year, monthIndex, day);
                if (!isNaN(dateObj.getTime())) {
                    result.date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    confidence.date = 0.95;
                }
            }
            
            if (time) {
                result.time = time.trim();
                confidence.time = 0.95;
            }
        } else {
            // Try to parse as date only
            const parsedDate = this._parseDateString(value);
            if (parsedDate) {
                result.date = parsedDate;
                confidence.date = 0.85;
            }
            
            // Try to parse as time only
            const timeMatch = value.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))|(\d{1,2}\s*(?:AM|PM))/i);
            if (timeMatch) {
                result.time = timeMatch[0].trim();
                confidence.time = 0.85;
            }
        }
    }
    
    /**
     * Extract business name
     */
    _extractBusinessName(text, result, confidence) {
        if (result.business) return;
        
        const patterns = [
            /(?:business|company|organization|org|firm|brand|store)[:\s]+([A-Z][a-zA-Z0-9\s&.,\-]+?)(?:[,.\n]|$)/i,
            /(?:from|at|with)\s+([A-Z][a-zA-Z0-9\s&.,\-]+?)(?:[,.\n]|$)/i,
            /^([A-Z][a-zA-Z0-9\s&.,\-]+?)\s+(?:business|company|organization)/i,
            /(?:for|about)\s+([A-Z][a-zA-Z0-9\s&.,\-]+?)(?:[,.\n]|$)/i,
            /(?:company|business)[:\s]+([A-Z][a-zA-Z0-9\s&.,\-]+)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const business = match[1].trim();
                // Clean up common suffixes
                const cleaned = business.replace(/\s*(?:business|company|inc|llc|ltd|corp|corporation|agency|studios?|designs?|solutions|services|consulting|group|partners|associates)\s*$/i, '').trim();
                result.business = cleaned || business;
                confidence.business = 0.85;
                return;
            }
        }
        
        // Try to find capitalized phrase that looks like a business name
        const businessPhrases = text.match(/([A-Z][a-zA-Z0-9\s&.,\-']{2,30})(?:\s+(?:is|are|was|were|has|have|will|would|could|should|may|might))/g);
        if (businessPhrases && businessPhrases.length > 0) {
            // Take the longest one that isn't a person's name
            const sorted = businessPhrases.sort((a, b) => b.length - a.length);
            for (const phrase of sorted) {
                const cleaned = phrase.replace(/\s+(?:is|are|was|were|has|have|will|would|could|should|may|might)$/, '').trim();
                if (cleaned.length > 3 && !this._isPersonName(cleaned)) {
                    result.business = cleaned;
                    confidence.business = 0.6;
                    return;
                }
            }
        }
    }
    
    _isPersonName(text) {
        const parts = text.split(' ');
        if (parts.length === 2 && parts[0] && parts[1]) {
            const first = parts[0];
            const last = parts[1];
            if (first.length >= 2 && last.length >= 2 && 
                /^[A-Z]/.test(first) && /^[A-Z]/.test(last)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Extract contact name
     */
    _extractContactName(text, result, confidence) {
        if (result.name) return;
        
        const patterns = [
            /(?:name|contact|client|customer|person|full name|contact name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:from|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:from|at|with|said|wants|would like|requested|called|spoke|talked)/i,
            /contact[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:name|contact)[:\s]+([A-Z][a-z]+)/i,
            /(?:spoke|talked|connected|chatted|conversed)\s+with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim();
                if (name.length >= 2 && /^[A-Z]/.test(name)) {
                    result.name = name;
                    confidence.name = 0.85;
                    return;
                }
            }
        }
        
        // Try to find capitalized name in text
        const nameMatches = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g);
        if (nameMatches) {
            for (const match of nameMatches) {
                if (match.length >= 2 && match.length < 30) {
                    if (!this._isBusinessName(match)) {
                        result.name = match;
                        confidence.name = 0.5;
                        return;
                    }
                }
            }
        }
    }
    
    _isBusinessName(text) {
        const businessSuffixes = ['company', 'inc', 'llc', 'ltd', 'corp', 'corp', 'agency', 'studio', 'design', 'solution', 'service', 'consulting', 'group', 'partner', 'associate', 'solutions', 'services', 'consultants', 'pro', 'specialists', 'experts', 'team', 'lab', 'labs', 'works', 'workshop'];
        const lower = text.toLowerCase();
        for (const suffix of businessSuffixes) {
            if (lower.includes(suffix)) return true;
        }
        return false;
    }
    
    /**
     * Extract phone number
     */
    _extractPhoneNumber(text, result, confidence) {
        if (result.phone) return;
        
        const patterns = [
            /(?:phone|mobile|cell|telephone|number|call|tel)[:\s]+([+\d\s\-\(\)]{7,20})/i,
            /([+\d\s\-\(\)]{10,20})(?:\s*(?:is|was|will be|the|their|his|her|for|at))/i,
            /(?:call|reach|contact)\s+(?:at|on|via)\s+([+\d\s\-\(\)]{10,20})/i,
            /(\d{3}[-.]?\d{3}[-.]?\d{4})/,
            /\(\d{3}\)\s*\d{3}[-.]?\d{4}/,
            /(\+\d{1,3}[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})/
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let phone = match[1].trim();
                phone = phone.replace(/[^\d+]/g, '');
                if (phone.length >= 7 && phone.length <= 15) {
                    if (phone.length === 10 && /^\d{10}$/.test(phone)) {
                        phone = `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
                    } else if (phone.length === 11 && phone.startsWith('1') && /^\d{11}$/.test(phone)) {
                        phone = `+1 (${phone.substring(1, 4)}) ${phone.substring(4, 7)}-${phone.substring(7)}`;
                    }
                    result.phone = phone;
                    confidence.phone = 0.95;
                    return;
                }
            }
        }
    }
    
    /**
     * Extract email address
     */
    _extractEmail(text, result, confidence) {
        if (result.email) return;
        
        const match = text.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/);
        if (match) {
            result.email = match[1].trim().toLowerCase();
            confidence.email = 0.95;
        }
    }
    
    /**
     * Extract date and time with natural language support
     */
    _extractDateTime(text, result, confidence, warnings) {
        if (result.date && result.time) return;
        
        // First, try to find date/time in key-value pairs already parsed
        if (result.date && !result.time) {
            const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))|(\d{1,2}\s*(?:AM|PM))/i);
            if (timeMatch) {
                result.time = timeMatch[0].trim();
                confidence.time = 0.85;
            }
            return;
        }
        
        // Look for date/time phrases in natural language
        const patterns = [
            /(?:demo|appointment|meeting|call|schedule|booked|on|at|for)\s+([A-Za-z]+(?:day)?)\s*,?\s*([A-Za-z]+)\s*(\d{1,2})\s*(?:,?\s*(\d{4}))?\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i,
            /([A-Za-z]+(?:day)?)\s*,?\s*([A-Za-z]+)\s*(\d{1,2})\s*,?\s*(\d{4})\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i,
            /([A-Za-z]+)\s*(\d{1,2})\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i,
            /(?:today|tomorrow|yesterday)\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                let monthName, day, year, time;
                
                if (match.length >= 5) {
                    if (match[2] && !isNaN(parseInt(match[3]))) {
                        monthName = match[2];
                        day = parseInt(match[3]);
                        year = match[4] ? parseInt(match[4]) : new Date().getFullYear();
                        time = match[5];
                    } else if (match[1] && !isNaN(parseInt(match[2]))) {
                        monthName = match[1];
                        day = parseInt(match[2]);
                        year = match[4] ? parseInt(match[4]) : new Date().getFullYear();
                        time = match[5];
                    }
                } else if (match.length >= 4) {
                    monthName = match[1];
                    day = parseInt(match[2]);
                    year = new Date().getFullYear();
                    time = match[3];
                } else if (match.length >= 2) {
                    const dayStr = match[1].toLowerCase();
                    const date = new Date();
                    if (dayStr === 'today') {
                        // keep current date
                    } else if (dayStr === 'tomorrow') {
                        date.setDate(date.getDate() + 1);
                    } else if (dayStr === 'yesterday') {
                        date.setDate(date.getDate() - 1);
                    }
                    
                    if (!result.date) {
                        result.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        confidence.date = 0.9;
                    }
                    time = match[1];
                }
                
                // Parse month name
                if (monthName) {
                    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
                    const monthIndex = months.indexOf(monthName.toLowerCase());
                    
                    if (monthIndex !== -1 && day) {
                        const dateObj = new Date(year || new Date().getFullYear(), monthIndex, day);
                        if (!isNaN(dateObj.getTime())) {
                            result.date = `${dateObj.getFullYear()}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            confidence.date = 0.95;
                        }
                    }
                }
                
                // Parse time
                if (time) {
                    result.time = time.trim();
                    confidence.time = 0.95;
                }
                
                if (result.date) break;
            }
        }
        
        // If still no date, try date-only patterns
        if (!result.date) {
            const datePatterns = [
                /(?:date|appointment|scheduled|meeting|call|day|demo)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
                /(?:on|for)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
                /(\d{1,2}\/\d{1,2}\/\d{4})/,
                /(\d{4}-\d{2}-\d{2})/
            ];
            for (const pattern of datePatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const parsedDate = this._parseDateString(match[1]);
                    if (parsedDate) {
                        result.date = parsedDate;
                        confidence.date = 0.85;
                        break;
                    }
                }
            }
        }
        
        // If no time, try time-only patterns
        if (!result.time) {
            const timePatterns = [
                /(?:time|at|scheduled|appointment|meeting|call|demo)[:\s]+(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
                /(?:at\s+)(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
                /(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
                /(\d{1,2}\s*(?:AM|PM))/i
            ];
            for (const pattern of timePatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    let time = match[1].trim();
                    if (!time.includes(':') && (time.includes('AM') || time.includes('PM'))) {
                        const hour = parseInt(time);
                        if (hour >= 1 && hour <= 12) {
                            time = `${hour}:00 ${time.replace(/\d+/, '').trim()}`;
                        }
                    }
                    result.time = time;
                    confidence.time = 0.85;
                    break;
                }
            }
        }
        
        // Add warning if date not found
        if (!result.date) {
            warnings.push({ field: 'date', message: 'No date detected, using today\'s date' });
        }
        
        if (!result.time) {
            warnings.push({ field: 'time', message: 'No time detected' });
        }
    }
    
    /**
     * Parse date string to YYYY-MM-DD
     */
    _parseDateString(dateStr) {
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
        
        return null;
    }
    
    /**
     * Extract status from context
     */
    _extractStatus(text, result, confidence) {
        if (result.status) return;
        
        const statusMap = {
            'Hot Transfer': /(?:hot transfer|hot lead|ready now|ready to close|urgent|immediate|hot)/i,
            'Meeting Booked': /(?:meeting booked|booked|demo booked|scheduled|confirmed|appointment set|calendar invite sent)/i,
            'Held': /(?:held|meeting held|demo held|completed meeting|attended|showed up|show up)/i,
            'Rescheduled': /(?:rescheduled|moved|pushed back|postponed|new time|different day)/i,
            'Canceled': /(?:canceled|cancelled|no show|didn\'t show|no-show|not show|failed to show)/i,
            'Completed': /(?:completed|done|finished|closed|finalized)/i,
            'Warm Callback': /(?:warm callback|callback|call back|follow up|follow-up|return call)/i,
            'Pending': /(?:pending|awaiting|waiting|not yet|tbd|to be determined)/i
        };
        
        let highestConfidence = 0;
        let matchedStatus = null;
        
        for (const [status, pattern] of Object.entries(statusMap)) {
            if (pattern.test(text)) {
                const matchCount = (text.match(pattern) || []).length;
                const conf = Math.min(0.5 + matchCount * 0.15, 0.95);
                if (conf > highestConfidence) {
                    highestConfidence = conf;
                    matchedStatus = status;
                }
            }
        }
        
        if (matchedStatus) {
            result.status = matchedStatus;
            confidence.status = highestConfidence;
        }
    }
    
    /**
     * Extract developer notes
     */
    _extractDeveloperNotes(text, lines, result, confidence) {
        if (result.notes && result.notes.length > 10) return;
        
        const notePatterns = [
            /(?:notes|note|comment|remarks|additional notes|info|details|description|summary|developer notes)[:\s]+(.+?)(?=\n\s*\n|$)/i,
            /(?:developer notes?|dev notes?|notes for developer|notes to developer)[:\s]+(.+?)(?=\n\s*\n|$)/i
        ];
        
        for (const pattern of notePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                result.notes = match[1].trim();
                confidence.notes = 0.9;
                return;
            }
        }
        
        const nonKeyLines = lines.filter(line => {
            return !/^[^:]+:.+/.test(line) && !/^[\s]*[â€¢\-*]\s/.test(line);
        });
        
        if (nonKeyLines.length > 0) {
            let notes = nonKeyLines.join('\n').trim();
            notes = notes.replace(/[\+\d\s\-\(\)]{7,20}/g, '').replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '');
            notes = notes.replace(/\s+/g, ' ').trim();
            
            if (notes.length > 0) {
                result.notes = notes;
                confidence.notes = 0.6;
                return;
            }
        }
    }
    
    /**
     * Generate developer notes automatically
     */
    _generateDeveloperNotes(result, text) {
        const parts = [];
        
        if (result.business) {
            parts.push(`Business: ${result.business}`);
        }
        if (result.name) {
            parts.push(`Contact: ${result.name}`);
        }
        if (result.phone) {
            parts.push(`Phone: ${result.phone}`);
        }
        if (result.email) {
            parts.push(`Email: ${result.email}`);
        }
        if (result.date) {
            parts.push(`Date: ${result.date}`);
        }
        if (result.time) {
            parts.push(`Time: ${result.time}`);
        }
        if (result.status) {
            parts.push(`Status: ${result.status}`);
        }
        if (result.role) {
            parts.push(`Role: ${result.role}`);
        }
        if (result.assigned) {
            parts.push(`Assigned to: ${result.assigned}`);
        }
        if (result.tags && result.tags.length > 0) {
            parts.push(`Tags: ${result.tags.join(', ')}`);
        }
        if (result.sentiment) {
            parts.push(`Sentiment: ${result.sentiment}`);
        }
        
        if (parts.length > 0) {
            const sentences = text.match(/[^.!?]+[.!?]+/g);
            if (sentences) {
                const meaningful = sentences
                    .filter(s => s.length > 20 && s.length < 150)
                    .map(s => s.trim())
                    .slice(0, 3);
                if (meaningful.length > 0) {
                    parts.push('\n---\nContext:');
                    parts.push(meaningful.join(' '));
                }
            }
            
            return parts.join('\n');
        }
        
        return 'No notes provided.';
    }
    
    /**
     * Extract role
     */
    _extractRole(text, result, confidence) {
        if (result.role) return;
        
        const rolePatterns = [
            /(?:role|title|position|job title|job role)[:\s]+([A-Za-z\s]+?)(?:[,.\n]|$)/i,
            /(?:owner|manager|ceo|director|supervisor|lead|head|vp|president|founder|administrator|coordinator|specialist|analyst|engineer|developer|designer|consultant|advisor|assistant)/i
        ];
        
        for (const pattern of rolePatterns) {
            const match = text.match(pattern);
            if (match) {
                let role = match[1] || match[0];
                role = role.trim();
                if (role.length > 2 && role.length < 30) {
                    role = role.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                    result.role = role;
                    confidence.role = 0.7;
                    return;
                }
            }
        }
    }
    
    /**
     * Extract assigned to
     */
    _extractAssigned(text, result, confidence) {
        if (result.assigned) return;
        
        const assignedPatterns = [
            /(?:assigned|assigned to|owner|agent|representative|rep|handler|manager)[:\s]+([A-Z][a-z]+)/i,
            /(?:will be|handled by|managed by)\s+([A-Z][a-z]+)/i
        ];
        
        for (const pattern of assignedPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim();
                if (name.length >= 2) {
                    result.assigned = name;
                    confidence.assigned = 0.7;
                    return;
                }
            }
        }
        
        if (window.AppState && window.AppState.teamMembers) {
            for (const member of window.AppState.teamMembers) {
                if (text.toLowerCase().includes(member.name.toLowerCase())) {
                    result.assigned = member.name;
                    confidence.assigned = 0.5;
                    return;
                }
            }
        }
    }
    
    /**
     * Detect tags from text
     */
    _detectTags(result, confidence) {
        if (result.tags && result.tags.length > 0) return;
        
        const tags = [];
        const notes = result.notes || '';
        const searchText = notes + ' ' + (result.business || '') + ' ' + (result.name || '');
        
        for (const rule of this.autoTagRules) {
            if (rule.pattern.test(searchText)) {
                tags.push(rule.tag);
            }
        }
        
        // Check for specific status-related tags
        if (result.status === 'Hot Transfer' && !tags.includes('hot_lead')) {
            tags.push('hot_lead');
        }
        if (result.status === 'Meeting Booked' && !tags.includes('booked')) {
            tags.push('booked');
        }
        if (result.status === 'Held' && !tags.includes('held')) {
            tags.push('held');
        }
        if (result.status === 'Canceled' && !tags.includes('no_show')) {
            tags.push('no_show');
        }
        if (result.status === 'Warm Callback' && !tags.includes('warm_callback')) {
            tags.push('warm_callback');
        }
        if (result.status === 'Completed' && !tags.includes('completed')) {
            tags.push('completed');
        }
        
        if (tags.length > 0) {
            result.tags = tags;
            confidence.tags = 0.6;
        }
    }
    
    /**
     * Detect sentiment from text
     */
    _detectSentiment(result, confidence) {
        if (result.sentiment) return;
        
        const notes = result.notes || '';
        let detectedSentiment = null;
        let highestConfidence = 0;
        
        for (const [sentiment, pattern] of Object.entries(this.sentimentPatterns)) {
            if (pattern.test(notes)) {
                const matchCount = (notes.match(pattern) || []).length;
                const conf = Math.min(0.5 + matchCount * 0.1, 0.9);
                if (conf > highestConfidence) {
                    highestConfidence = conf;
                    detectedSentiment = sentiment;
                }
            }
        }
        
        if (detectedSentiment) {
            result.sentiment = detectedSentiment;
            confidence.sentiment = highestConfidence;
        }
    }
    
    /**
     * Detect source
     */
    _detectSource(text, result, confidence) {
        if (result.source) return;
        
        let detectedSource = null;
        let highestConfidence = 0;
        
        for (const [source, pattern] of Object.entries(this.sourcePatterns)) {
            if (pattern.test(text)) {
                const conf = 0.6;
                if (conf > highestConfidence) {
                    highestConfidence = conf;
                    detectedSource = source;
                }
            }
        }
        
        if (!detectedSource && result.notes && result.notes.length > 0) {
            detectedSource = 'Manual Entry';
            highestConfidence = 0.5;
        }
        
        if (detectedSource) {
            result.source = detectedSource;
            confidence.source = highestConfidence;
        }
    }
    
    /**
     * Apply default values
     */
    _applyDefaults(result, confidence, config) {
        if (!result.date) {
            result.date = config.defaultDate || new Date().toISOString().split('T')[0];
            confidence.date = 0.3;
        }
        
        if (!result.status) {
            result.status = config.defaultStatus || 'Pending';
            confidence.status = 0.5;
        }
        
        if (!result.assigned) {
            result.assigned = config.defaultAssigned || 'Daniel';
            confidence.assigned = 0.4;
        }
        
        if (result.phone) {
            result.phone = result.phone.replace(/[^\d+]/g, '');
            if (result.phone.length === 10 && /^\d{10}$/.test(result.phone)) {
                result.phone = `(${result.phone.substring(0, 3)}) ${result.phone.substring(3, 6)}-${result.phone.substring(6)}`;
            }
        }
    }
    
    /**
     * Validate required fields
     */
    _validateRequiredFields(result) {
        return !!(result.business && result.business.trim().length > 0 && 
                  result.name && result.name.trim().length > 0);
    }
    
    /**
     * Get validation errors
     */
    _getValidationErrors(result) {
        const errors = [];
        
        if (!result.business || result.business.trim().length < 2) {
            errors.push({ field: 'business', message: 'Business name is required (minimum 2 characters)' });
        }
        
        if (!result.name || result.name.trim().length < 2) {
            errors.push({ field: 'name', message: 'Contact name is required (minimum 2 characters)' });
        }
        
        if (result.phone && !/^[\+\d\s\-\(\)]{7,20}$/.test(result.phone)) {
            errors.push({ field: 'phone', message: 'Phone number format seems invalid' });
        }
        
        if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
            errors.push({ field: 'email', message: 'Email format seems invalid' });
        }
        
        return errors;
    }
    
    /**
     * Check for duplicates - Business Name + Phone Number match
     */
    checkDuplicates(record, existingAppointments) {
        if (!existingAppointments || existingAppointments.length === 0) return [];
        
        const duplicates = [];
        const data = record.result || record;
        
        const newBusiness = (data.business || '').toLowerCase().trim();
        const newPhone = (data.phone || '').replace(/[^\d+]/g, '');
        
        if (!newBusiness || newBusiness.length < 2) return [];
        
        for (const existing of existingAppointments) {
            let score = 0;
            let matchedFields = [];
            
            // Primary: Business Name match (must have)
            if (newBusiness && existing.business) {
                const existingBusiness = existing.business.toLowerCase().trim();
                if (newBusiness === existingBusiness) {
                    score += 0.6;
                    matchedFields.push('business_exact');
                } else if (newBusiness.includes(existingBusiness) || existingBusiness.includes(newBusiness)) {
                    score += 0.35;
                    matchedFields.push('business_partial');
                } else {
                    continue;
                }
            } else {
                continue;
            }
            
            // Secondary: Phone match (if both have phone numbers)
            if (newPhone && existing.phone) {
                const existingPhone = existing.phone.replace(/[^\d+]/g, '');
                if (newPhone === existingPhone) {
                    score += 0.4;
                    matchedFields.push('phone_exact');
                } else if (newPhone.includes(existingPhone) || existingPhone.includes(newPhone)) {
                    score += 0.2;
                    matchedFields.push('phone_partial');
                }
            }
            
            // Only consider duplicate if score >= threshold
            if (score >= this.config.duplicateMatchThreshold) {
                duplicates.push({
                    existing: existing,
                    confidence: Math.round(Math.min(score * 1.1, 1) * 100),
                    matchedFields: matchedFields,
                    score: score
                });
            }
        }
        
        duplicates.sort((a, b) => b.confidence - a.confidence);
        return duplicates;
    }
    
    /**
     * Batch parse multiple transcripts
     */
    parseBatch(texts, options = {}) {
        const results = [];
        const total = texts.length;
        
        texts.forEach((text, index) => {
            const parsed = this.parseTranscript(text, options);
            results.push({
                index: index + 1,
                raw: text,
                ...parsed
            });
        });
        
        return results;
    }
    
    /**
     * Split multiple appointments from a single text block
     */
    splitAppointments(text) {
        const appointments = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        let currentAppointment = [];
        let inAppointment = false;
        let businessDetected = false;
        let nameDetected = false;
        
        for (const line of lines) {
            const isNewAppointment = 
                line.match(/^[A-Z][a-zA-Z]+\s+(?:Company|Corp|Inc|LLC|Ltd|Agency|Studio|Designs|Solutions|Services|Consulting|Group|Partners|&|Associates)/) ||
                line.match(/^---+\s*$/) ||
                line.match(/^={3,}\s*$/) ||
                line.match(/^Appointment\s+#\d+/) ||
                line.match(/^\d+\.\s*[A-Z]/) ||
                line.match(/^[A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+\s*[:\-]\s*/);
            
            if (line.includes(':') && line.split(':')[0].trim().length > 0) {
                const key = line.split(':')[0].trim().toLowerCase();
                const isBusinessField = /(?:business|company|organization|org|firm|brand|store)/i.test(key);
                const isNameField = /(?:name|contact|client|customer|person)/i.test(key);
                
                if (isBusinessField && !businessDetected && currentAppointment.length > 0) {
                    if (businessDetected || nameDetected) {
                        appointments.push(currentAppointment.join('\n'));
                        currentAppointment = [];
                        inAppointment = false;
                        businessDetected = false;
                        nameDetected = false;
                    }
                }
                
                if (isBusinessField) businessDetected = true;
                if (isNameField) nameDetected = true;
                
                if (currentAppointment.length === 0 && !inAppointment) {
                    inAppointment = true;
                }
            }
            
            if (businessDetected && nameDetected) {
                inAppointment = true;
            }
            
            if (isNewAppointment && currentAppointment.length > 0) {
                appointments.push(currentAppointment.join('\n'));
                currentAppointment = [];
                inAppointment = false;
                businessDetected = false;
                nameDetected = false;
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
}

// ================================================================
// SMART IMPORT UI FUNCTIONS
// ================================================================

/**
 * Open the Smart Import modal
 */
function openSmartImportEnhanced() {
    const modal = DOM.get('smartImportModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    AppState.importRecords = [];
    AppState.importProcessing = false;
    AppState.importProgress = 0;
    
    const dateInput = DOM.get('importDefaultDate');
    if (dateInput) {
        dateInput.value = Utils.getTodayStr();
    }
    
    const textArea = DOM.get('importTextArea');
    if (textArea) {
        textArea.value = '';
        textArea.placeholder = `Paste transcript text here. The system will intelligently parse:

Example:
Business Name: MS Auto Parts and Services
Name: Mitch
Role: Owner
Phone Number: +17867637501
Demo Time & Date: Tuesday, August 3 at 2:30 PM EDT
Email: mitchsells7501@gmail.com
Status: Meeting Booked
Notes: Custom website preview offered, no website currently, high interest, booked manager callback`;
    }
    
    const preview = DOM.get('importPreview');
    if (preview) preview.style.display = 'none';
    
    const saveBtn = DOM.get('saveImportBtn');
    if (saveBtn) saveBtn.style.display = 'none';
    
    const resultsContainer = DOM.get('importResultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';
    
    const progressContainer = DOM.get('importProgressContainer');
    if (progressContainer) progressContainer.style.display = 'none';
    
    const summary = DOM.get('importSummary');
    if (summary) summary.style.display = 'none';
}

/**
 * Close the Smart Import modal
 */
function closeSmartImportEnhanced() {
    const modal = DOM.get('smartImportModal');
    if (modal) modal.style.display = 'none';
    AppState.importRecords = [];
    AppState.importProcessing = false;
}

/**
 * Parse and preview import
 */
function parseAndPreviewImportEnhanced() {
    const textArea = DOM.get('importTextArea');
    if (!textArea) return;
    
    const text = textArea.value;
    if (!text.trim()) {
        showToast('Please paste some text to parse', 'warning');
        return;
    }
    
    const dateInput = DOM.get('importDefaultDate');
    const defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
    
    const progressContainer = DOM.get('importProgressContainer');
    if (progressContainer) progressContainer.style.display = 'block';
    AppState.importProcessing = true;
    AppState.importProgress = 0;
    updateImportProgress(5, 'Splitting appointments...');
    
    setTimeout(() => {
        try {
            const engine = new SmartImportEnhanced();
            const appointments = engine.splitAppointments(text);
            
            const total = appointments.length;
            AppState.importProgress = 15;
            updateImportProgress(15, `Found ${total} appointment(s). Parsing...`);
            
            if (total === 0) {
                showToast('No appointments detected in the text', 'warning');
                AppState.importProcessing = false;
                if (progressContainer) progressContainer.style.display = 'none';
                return;
            }
            
            const parsedResults = [];
            const existingAppointments = Data.getAllAppointments();
            let validCount = 0;
            let invalidCount = 0;
            
            appointments.forEach((apptText, index) => {
                const progress = 15 + ((index + 1) / total) * 50;
                updateImportProgress(progress, `Processing appointment ${index + 1} of ${total}...`);
                
                const parsed = engine.parseTranscript(apptText, { defaultDate });
                const duplicates = engine.checkDuplicates(parsed, existingAppointments);
                const hasSignificantDuplicate = duplicates.some(d => d.confidence >= 70);
                
                if (parsed.isValid) validCount++;
                else invalidCount++;
                
                parsedResults.push({
                    index: index + 1,
                    raw: apptText,
                    parsed: parsed.result || {},
                    confidence: parsed.confidence || {},
                    context: parsed.context || {},
                    validated: parsed.result || {},
                    isValid: parsed.isValid || false,
                    errors: parsed.errors || [],
                    warnings: parsed.warnings || [],
                    hasDuplicate: hasSignificantDuplicate,
                    duplicates: duplicates
                });
            });
            
            AppState.importRecords = parsedResults;
            AppState.importProgress = 80;
            updateImportProgress(80, 'Generating preview...');
            
            setTimeout(() => {
                renderImportResults(parsedResults);
                AppState.importProcessing = false;
                updateImportProgress(100, 'Complete!');
                
                setTimeout(() => {
                    if (progressContainer) progressContainer.style.display = 'none';
                }, 1500);
                
                showToast(`Parsed ${parsedResults.length} appointment(s)! ${validCount} valid, ${invalidCount} need review`, 'info');
            }, 300);
            
        } catch (error) {
            console.error('Smart Import parse error:', error);
            showToast('Error parsing text: ' + error.message, 'error');
            AppState.importProcessing = false;
            if (progressContainer) progressContainer.style.display = 'none';
        }
    }, 300);
}

/**
 * Render import results
 */
function renderImportResults(records) {
    const preview = DOM.get('importPreview');
    const resultsContainer = DOM.get('importResultsContainer');
    const saveBtn = DOM.get('saveImportBtn');
    const summary = DOM.get('importSummary');
    const recordCount = DOM.get('importRecordCount');
    
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
        
        summary.style.display = 'block';
        summary.innerHTML = `
            <div class="import-summary-grid">
                <div class="import-stat ${valid > 0 ? 'success' : ''}">
                    <span class="stat-number">${valid}</span>
                    <span class="stat-label">✅ Valid</span>
                </div>
                <div class="import-stat ${invalid > 0 ? 'warning' : ''}">
                    <span class="stat-number">${invalid}</span>
                    <span class="stat-label">⚠️ Needs Review</span>
                </div>
                <div class="import-stat ${duplicates > 0 ? 'warning' : ''}">
                    <span class="stat-number">${duplicates}</span>
                    <span class="stat-label">🔄 Potential Duplicates</span>
                </div>
                <div class="import-stat">
                    <span class="stat-number">${total}</span>
                    <span class="stat-label">📋 Total</span>
                </div>
            </div>
        `;
    }
    
    let resultsHtml = '';
    records.forEach((record, idx) => {
        const statusClass = record.isValid ? 'valid' : 'invalid';
        const hasDuplicate = record.hasDuplicate;
        const hasWarnings = record.warnings && record.warnings.length > 0;
        const hasErrors = record.errors && record.errors.length > 0;
        
        const confValues = Object.values(record.confidence || {});
        const avgConf = confValues.length > 0 ? confValues.reduce((a, b) => a + b, 0) / confValues.length : 0;
        const confColor = avgConf >= 0.7 ? 'high' : avgConf >= 0.4 ? 'medium' : 'low';
        
        const data = record.validated || record.parsed || {};
        
        const fields = [
            { key: 'business', label: '🏢 Business', value: data.business },
            { key: 'name', label: '👤 Name', value: data.name },
            { key: 'role', label: '💼 Role', value: data.role },
            { key: 'phone', label: '📞 Phone', value: data.phone },
            { key: 'email', label: '✉️ Email', value: data.email },
            { key: 'date', label: '📅 Date', value: data.date },
            { key: 'time', label: '🕐 Time', value: data.time },
            { key: 'status', label: '📊 Status', value: data.status },
            { key: 'assigned', label: '👤 Assigned', value: data.assigned },
            { key: 'notes', label: '📝 Notes', value: data.notes }
        ];
        
        const fieldRows = fields
            .filter(f => f.value)
            .map(f => {
                const conf = record.confidence[f.key] || 0.5;
                const confClass = conf >= 0.7 ? 'high' : conf >= 0.4 ? 'medium' : 'low';
                const isDate = f.key === 'date' || f.key === 'time';
                const valueDisplay = isDate && f.key === 'date' ? Utils.formatDate(f.value) : Utils.escapeHtml(f.value);
                return `
                    <div class="field-row ${isDate ? 'date-field' : ''}">
                        <span class="field-label">${f.label}</span>
                        <span class="field-value">${valueDisplay}</span>
                        <span class="field-confidence ${confClass}">${Math.round(conf * 100)}%</span>
                    </div>
                `;
            }).join('');
        
        resultsHtml += `
            <div class="import-record ${statusClass} ${hasDuplicate ? 'duplicate' : ''}">
                <div class="record-header" onclick="window.toggleImportRecord(this)">
                    <div class="record-status">
                        <span class="status-icon">${record.isValid ? '✅' : '⚠️'}</span>
                        <span class="record-index">#${record.index}</span>
                    </div>
                    <div class="record-summary">
                        <span class="record-name">${Utils.escapeHtml(data.name || 'Unknown')}</span>
                        <span class="record-business">${Utils.escapeHtml(data.business || 'Unknown Business')}</span>
                        ${data.date ? `<span class="record-date">📅 ${Utils.formatDate(data.date)}</span>` : ''}
                        ${data.time ? `<span class="record-date">🕐 ${Utils.escapeHtml(data.time)}</span>` : ''}
                    </div>
                    <div class="record-badges">
                        ${hasDuplicate ? '<span class="badge duplicate">🔄 Duplicate</span>' : ''}
                        ${hasWarnings ? `<span class="badge warning">⚠️ ${record.warnings.length}</span>` : ''}
                        ${hasErrors ? `<span class="badge error">❌ ${record.errors.length}</span>` : ''}
                        <span class="badge confidence ${confColor}">${Math.round(avgConf * 100)}%</span>
                    </div>
                    <span class="record-toggle">▼</span>
                </div>
                <div class="record-body" style="display:none;">
                    <div class="record-fields">
                        ${fieldRows}
                    </div>
                    
                    ${record.warnings && record.warnings.length > 0 ? `
                        <div class="record-warnings">
                            <strong>⚠️ Warnings:</strong>
                            <ul>${record.warnings.map(w => `<li>${w.field}: ${w.message}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    
                    ${!record.isValid && record.errors && record.errors.length > 0 ? `
                        <div class="record-errors">
                            <strong>❌ Errors:</strong>
                            <ul>${record.errors.map(e => `<li>${e.field}: ${e.message}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    
                    ${record.hasDuplicate && record.duplicates.length > 0 ? `
                        <div class="record-duplicates">
                            <strong>🔄 Potential Duplicates:</strong>
                            <ul>${record.duplicates.filter(d => d.confidence >= 60).map(d => 
                                `<li>${Utils.escapeHtml(d.existing.business)} - ${Utils.escapeHtml(d.existing.contactName)} (${d.confidence}% match)</li>`
                            ).join('')}</ul>
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
        saveBtn.textContent = `💾 Save ${validRecords.length} Record(s)`;
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
        showToast('No valid records to save', 'warning');
        return;
    }
    
    if (!AppState.currentUser) {
        showToast('Please sign in first', 'error');
        return;
    }
    
    const highConfidenceDuplicates = validRecords.filter(r => 
        r.duplicates && r.duplicates.some(d => d.confidence >= 80)
    );
    
    let confirmMsg = `Save ${validRecords.length} appointment(s)?`;
    if (highConfidenceDuplicates.length > 0) {
        confirmMsg += `\n\n⚠️ ${highConfidenceDuplicates.length} of these appear to be high-confidence duplicates.`;
    }
    
    if (!confirm(confirmMsg)) return;
    
    let savedCount = 0;
    let skippedCount = 0;
    
    validRecords.forEach(record => {
        const data = record.validated || record.parsed;
        
        const highDuplicate = record.duplicates && record.duplicates.find(d => d.confidence >= 85);
        if (highDuplicate) {
            if (!confirm(`"${data.business}" appears to be a duplicate (${highDuplicate.confidence}% match with ${highDuplicate.existing.business}). Save anyway?`)) {
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
            data.status || 'Pending',
            '',
            data.tags || []
        );
        
        if (result) {
            savedCount++;
        }
    });
    
    showToast(`✅ Saved ${savedCount} appointment(s)! ${skippedCount > 0 ? `⏭️ Skipped ${skippedCount} duplicates.` : ''}`, 'success');
    
    closeSmartImportEnhanced();
    if (typeof FeaturePanel !== 'undefined') {
        FeaturePanel.refreshCurrentView();
    }
    Stats.updateAll();
}

/**
 * Update import progress
 */
function updateImportProgress(percent, message) {
    const progressBar = DOM.get('importProgressBar');
    const progressStatus = DOM.get('importProgressStatus');
    
    if (progressBar) {
        progressBar.style.width = Math.min(percent, 100) + '%';
    }
    if (progressStatus && message) {
        progressStatus.textContent = message;
    }
}

/**
 * Toggle import record expansion
 */
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

/**
 * Expand all records
 */
function expandAllRecords() {
    document.querySelectorAll('.import-record .record-body').forEach(body => {
        body.style.display = 'block';
    });
    document.querySelectorAll('.import-record .record-toggle').forEach(toggle => {
        toggle.textContent = '▼';
    });
}

/**
 * Collapse all records
 */
function collapseAllRecords() {
    document.querySelectorAll('.import-record .record-body').forEach(body => {
        body.style.display = 'none';
    });
    document.querySelectorAll('.import-record .record-toggle').forEach(toggle => {
        toggle.textContent = '▶';
    });
}

/**
 * Generate import template
 */
function generateImportTemplate() {
    const dateInput = DOM.get('importDefaultDate');
    const defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
    const formattedDate = defaultDate ? Utils.formatDate(defaultDate) : 'Today';
    
    const textArea = DOM.get('importTextArea');
    if (!textArea) return;
    
    const template = `Business Name/Company : [Enter Business Name]
Name : [Enter Contact Name]
Role : [Owner/Manager/Decision Maker]
Phone Number: [Enter Phone Number]
Email: [Enter Email Address]
Demo Time & Date: ${formattedDate} at [Time] [Timezone]

Status: [Pending/Hot Transfer/Warm Callback/Meeting Booked/Completed/Canceled]

Notes: [Enter notes about the conversation, interest level, and next steps]
- Custom website preview offered
- [Add additional details...]`;
    
    if (textArea.value) {
        if (!confirm('This will replace your current text. Continue?')) return;
    }
    textArea.value = template;
    showToast('📋 Template inserted! Fill in the details and click Parse.', 'success');
}

/**
 * Quick import from clipboard
 */
async function quickImportFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            openSmartImportEnhanced();
            const textArea = DOM.get('importTextArea');
            if (textArea) {
                textArea.value = text;
            }
            setTimeout(() => {
                parseAndPreviewImportEnhanced();
            }, 500);
        } else {
            showToast('Clipboard is empty', 'warning');
        }
    } catch (error) {
        showToast('Unable to read clipboard. Please paste manually.', 'error');
    }
}

// ================================================================
// SMART IMPORT STYLES (Injected)
// ================================================================

const SMART_IMPORT_STYLES = `
/* Smart Import Styles */
.import-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
}

.import-stat {
    background: var(--bg-card);
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    text-align: center;
    transition: var(--transition);
}

.import-stat:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}

.import-stat .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    display: block;
}

.import-stat .stat-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.import-stat.success .stat-number { color: var(--success); }
.import-stat.warning .stat-number { color: var(--warning); }
.import-stat.error .stat-number { color: var(--danger); }

.import-records-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 500px;
    overflow-y: auto;
}

.import-records-list::-webkit-scrollbar {
    width: 4px;
}
.import-records-list::-webkit-scrollbar-track {
    background: transparent;
}
.import-records-list::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 4px;
}

.import-record {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: var(--transition);
}

.import-record:hover {
    border-color: var(--primary);
}

.import-record.valid {
    border-left: 4px solid var(--success);
}

.import-record.invalid {
    border-left: 4px solid var(--danger);
}

.import-record.duplicate {
    border-left: 4px solid var(--warning);
}

.record-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    cursor: pointer;
    user-select: none;
    flex-wrap: wrap;
}

.record-header:hover {
    background: var(--bg-primary);
}

.record-status {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 60px;
}

.status-icon {
    font-size: 1rem;
}

.record-index {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
}

.record-summary {
    flex: 1;
    min-width: 120px;
}

.record-name {
    font-weight: 600;
    font-size: 0.9rem;
    margin-right: 6px;
}

.record-business {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.record-date {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-left: 6px;
}

.record-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.badge {
    font-size: 0.6rem;
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.badge.duplicate {
    background: var(--warning);
    color: #1e293b;
}

.badge.warning {
    background: var(--warning);
    color: #1e293b;
}

.badge.error {
    background: var(--danger);
    color: white;
}

.badge.confidence {
    background: var(--primary);
    color: white;
    transition: all 0.3s ease;
}

.badge.confidence:hover {
    transform: scale(1.05);
}

.badge.confidence.low {
    background: var(--danger);
}

.badge.confidence.medium {
    background: var(--warning);
    color: #1e293b;
}

.badge.confidence.high {
    background: var(--success);
}

.record-toggle {
    font-size: 0.7rem;
    color: var(--text-muted);
    transition: transform 0.3s ease;
}

.record-body {
    padding: 0 14px 14px;
    display: none;
    border-top: 1px solid var(--border-color);
}

.record-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px 0;
}

@media (max-width: 600px) {
    .record-fields {
        grid-template-columns: 1fr;
    }
}

.field-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: var(--bg-primary);
    border-radius: 6px;
}

.field-row.date-field {
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.15);
}

.field-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-muted);
    min-width: 60px;
}

.field-value {
    flex: 1;
    font-size: 0.85rem;
    word-break: break-word;
}

.field-confidence {
    font-size: 0.6rem;
    padding: 1px 6px;
    border-radius: 10px;
    font-weight: 600;
}

.field-confidence.high {
    background: var(--success);
    color: white;
}

.field-confidence.medium {
    background: var(--warning);
    color: #1e293b;
}

.field-confidence.low {
    background: var(--danger);
    color: white;
}

.record-warnings,
.record-errors,
.record-duplicates {
    padding: 8px 12px;
    border-radius: 8px;
    margin: 4px 0;
}

.record-warnings {
    background: rgba(245, 158, 11, 0.1);
    border-left: 3px solid var(--warning);
}

.record-errors {
    background: rgba(239, 68, 68, 0.1);
    border-left: 3px solid var(--danger);
}

.record-duplicates {
    background: rgba(245, 158, 11, 0.1);
    border-left: 3px solid var(--warning);
}

.record-warnings ul,
.record-errors ul,
.record-duplicates ul {
    margin: 4px 0 0 16px;
    font-size: 0.8rem;
}

.record-warnings li {
    color: var(--warning);
}

.record-errors li {
    color: var(--danger);
}

.record-duplicates li {
    color: var(--warning);
}

.record-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
    flex-wrap: wrap;
}

.record-actions .btn-icon {
    padding: 4px 12px;
    font-size: 0.75rem;
}

/* Edit Fields */
.edit-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 12px 0;
}

@media (max-width: 600px) {
    .edit-fields {
        grid-template-columns: 1fr;
    }
}

.edit-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.edit-field label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
}

.edit-field .required-star {
    color: var(--danger);
}

.edit-input {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.85rem;
    transition: var(--transition);
    width: 100%;
}

.edit-input:focus {
    outline: 2px solid var(--primary);
    border-color: var(--primary);
}

.edit-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.edit-input::placeholder {
    color: var(--text-muted);
}

.edit-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
}

.import-date-selector {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    background: var(--bg-primary);
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 16px;
}

.import-date-selector label {
    font-weight: 600;
    font-size: 0.85rem;
    margin: 0;
    color: var(--text-secondary);
}

.import-date-selector input[type="date"] {
    padding: 8px 14px;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 0.85rem;
    min-width: 160px;
    flex: 1;
}

.import-date-selector .btn-icon {
    padding: 6px 14px;
    font-size: 0.75rem;
    white-space: nowrap;
}

#importProgressContainer {
    margin: 12px 0;
}

.progress-bar-track {
    width: 100%;
    height: 6px;
    background: var(--border-color);
    border-radius: 4px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background: var(--accent-gradient);
    border-radius: 4px;
    transition: width 0.5s ease;
    width: 0%;
}

#importSummary {
    margin: 12px 0;
}

.import-empty {
    text-align: center;
    padding: 30px 16px;
    color: var(--text-muted);
}

.import-empty i {
    font-size: 2rem;
    display: block;
    margin-bottom: 8px;
    opacity: 0.3;
}

.import-empty p {
    font-size: 0.85rem;
}
`;

// ================================================================
// INITIALIZATION
// ================================================================

// Inject styles
document.addEventListener('DOMContentLoaded', function() {
    const styleEl = document.createElement('style');
    styleEl.id = 'smart-import-styles';
    styleEl.textContent = SMART_IMPORT_STYLES;
    document.head.appendChild(styleEl);
    
    // Expose functions globally if not already exposed by app.js
    if (typeof window.openSmartImportEnhanced === 'undefined') {
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
    }
});

// Create engine instance
const smartImportEnhanced = new SmartImportEnhanced();

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

window.SmartImportEnhanced = SmartImportEnhanced;
window.smartImportEnhanced = smartImportEnhanced;
window.SMART_IMPORT = SMART_IMPORT;
window.SmartImportState = SmartImportState;

console.log('📥 Smart Import Enhanced loaded successfully');
console.log('📥 Use smartImportEnhanced.parseTranscript() for advanced parsing');
console.log('📥 Use smartImportEnhanced.checkDuplicates() for duplicate detection');