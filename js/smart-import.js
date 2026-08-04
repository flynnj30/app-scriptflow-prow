// ================================================================
// SMART IMPORT AI - Conversation Transcript Parser
// Complete replacement for smart-import.js
// ================================================================

/**
 * Smart Import Configuration
 */
const SMART_IMPORT = {
    // Field mappings for intelligent parsing
    FIELD_MAPPINGS: {
        business: {
            labels: ['business', 'company', 'organization', 'org', 'firm', 'brand', 'store', 'business name', 'company name', 'client', 'account', 'firm name'],
            confidence: 0.9
        },
        name: {
            labels: ['name', 'contact', 'contact name', 'client name', 'customer name', 'person', 'full name', 'first name', 'last name', 'prospect', 'lead name', 'contact person'],
            confidence: 0.9
        },
        role: {
            labels: ['role', 'title', 'position', 'job title', 'designation', 'function', 'department', 'job role', 'job position'],
            confidence: 0.85
        },
        phone: {
            labels: ['phone', 'mobile', 'cell', 'telephone', 'number', 'contact number', 'phone number', 'mobile number', 'phone no', 'cell phone', 'work phone', 'home phone', 'tel', 'telephone number'],
            confidence: 0.9
        },
        email: {
            labels: ['email', 'e-mail', 'mail', 'email address', 'e-mail address', 'contact email', 'work email', 'personal email', 'email id'],
            confidence: 0.9
        },
        date: {
            labels: ['date', 'appointment date', 'demo date', 'schedule date', 'meeting date', 'call date', 'day', 'best time', 'callback date', 'scheduled date', 'event date', 'when', 'demo time & date', 'appointment', 'scheduled for'],
            confidence: 0.85
        },
        time: {
            labels: ['time', 'appointment time', 'demo time', 'schedule time', 'meeting time', 'call time', 'hour', 'callback time', 'scheduled time', 'event time', 'at', 'appointment at'],
            confidence: 0.85
        },
        status: {
            labels: ['status', 'state', 'stage', 'lead status', 'appointment status', 'call status', 'phase', 'step', 'demo status', 'outcome', 'result'],
            confidence: 0.8,
            options: ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held', 'Personal Callback', 'No Show']
        },
        notes: {
            labels: ['notes', 'note', 'comment', 'remarks', 'additional notes', 'info', 'details', 'description', 'summary', 'observation', 'feedback', 'developer notes', 'notes for the developer', 'call notes', 'conversation notes'],
            confidence: 0.7
        },
        assigned: {
            labels: ['assigned', 'assigned to', 'owner', 'agent', 'representative', 'rep', 'assigned agent', 'team member', 'handler', 'manager', 'closer', 'booker'],
            confidence: 0.7
        },
        tags: {
            labels: ['tags', 'tag', 'label', 'labels', 'category', 'categories'],
            confidence: 0.6
        },
        sentiment: {
            labels: ['sentiment', 'feeling', 'tone', 'mood', 'attitude', 'emotion'],
            confidence: 0.5
        },
        industry: {
            labels: ['industry', 'sector', 'field', 'type', 'vertical', 'business type'],
            confidence: 0.5
        },
        website: {
            labels: ['website', 'url', 'web', 'site', 'current website', 'web address'],
            confidence: 0.6
        },
        address: {
            labels: ['address', 'location', 'street', 'city', 'state', 'zip', 'location', 'business address'],
            confidence: 0.5
        }
    },

    // Auto-tagging rules
    AUTO_TAG_RULES: [
        { pattern: /no website|doesn't have a website|needs website|wants website|website redesign|no current website|no site|doesn't have site|needs a website|wants a website/i, tag: 'no_website' },
        { pattern: /high interest|very interested|excited|enthusiastic|positive|great|excellent|wants|would like|looking forward|interested|keen|motivated|willing/i, tag: 'high_interest' },
        { pattern: /vip|priority|important|key|major|top|critical|urgent|hot lead|hot prospect/i, tag: 'vip' },
        { pattern: /callback|call back|return call|follow up|follow-up|next steps|schedule call|demo|walkthrough|meeting|book call|set call|call you back|call back later/i, tag: 'callback_requested' },
        { pattern: /referred|reference|referral|recommended|suggested|from|sent by|introduced|referred by/i, tag: 'referred' },
        { pattern: /decision maker|owner|ceo|president|founder|director|manager|leader|head of|partner|principal/i, tag: 'decision_maker' },
        { pattern: /qualified|warm call|good fit|ideal|perfect fit|qualified lead|good prospect|right fit|great fit/i, tag: 'qualified_warm_call' },
        { pattern: /social media|word of mouth|facebook|instagram|linkedin|social|twitter|youtube|tiktok/i, tag: 'social_media' },
        { pattern: /cold call|cold outreach|intro|introduction|first contact|initial call|first call/i, tag: 'cold_lead' },
        { pattern: /busy|available|free|schedule|booked|confirmed|set|fixed|locked in/i, tag: 'scheduled' },
        { pattern: /discovery|explore|discuss|goals|objectives|needs|requirements|pain points|challenges/i, tag: 'discovery' },
        { pattern: /deferred|postponed|later|reschedule|another time|push back|move/i, tag: 'deferred' },
        { pattern: /no show|didn't show|did not show|failed to show|missed|no-show|didn't attend|skipped/i, tag: 'no_show' },
        { pattern: /hot transfer|hot lead|ready now|ready to close|urgent|immediate|hot|transfer/i, tag: 'hot_lead' },
        { pattern: /meeting booked|booked|demo booked|scheduled|confirmed|appointment set|calendar invite sent|meeting set/i, tag: 'booked' },
        { pattern: /personal callback|personal call|call back personally|call me back|call me directly|my cell/i, tag: 'personal_callback' },
        { pattern: /email full|email doesn't work|email not working|email unavailable|email not functioning|inbox full|email full/i, tag: 'email_issue' }
    ],

    // Sentiment detection patterns
    SENTIMENT_PATTERNS: {
        'Very Positive': /(?:amazing|excellent|outstanding|fantastic|perfect|brilliant|incredible|wonderful|extraordinary|exceptional|superb|phenomenal|remarkable|unbelievable|awesome|spectacular|love it|love that)/i,
        'Positive': /(?:great|good|nice|positive|happy|pleased|satisfied|impressed|interested|excited|enthusiastic|optimistic|favorable|well|fine|glad|okay|alright|awesome|perfect|sounds good)/i,
        'Neutral': /(?:okay|fine|alright|neutral|average|decent|moderate|standard|normal|fair|adequate|acceptable|reasonable|i see|i understand)/i,
        'Negative': /(?:bad|poor|terrible|awful|horrible|disappointed|unhappy|frustrated|annoyed|irritated|concerned|worried|upset|angry|mad|doesn't work|not working|unavailable)/i,
        'Very Negative': /(?:worst|horrible|disgusting|atrocious|abysmal|appalling|dreadful|unacceptable|terrible|awful|hopeless|useless)/i
    },

    // Source detection
    SOURCE_PATTERNS: {
        'Smart Import': /(?:import|pasted|bulk|from text|transcript)/i,
        'Manual Entry': /(?:manual|entered|typed|direct|keyed)/i,
        'CSV Import': /(?:csv|spreadsheet|excel|sheet|tsv)/i,
        'API': /(?:api|integration|sync|imported|webhook)/i,
        'Web Form': /(?:form|web|online|submitted|contact form)/i
    },

    // Meeting outcome detection - Enhanced for conversation analysis
    OUTCOME_PATTERNS: {
        'Meeting Booked': /(?:meeting booked|booked|demo booked|scheduled|confirmed|appointment set|calendar invite sent|meeting set|call scheduled|demo scheduled|walkthrough|quick look|share screen|screen share|preview|show you|take a look|look at it|check it out|send the invite|send you the invite|call you back|call back|thursday|tomorrow|monday|tuesday|wednesday|friday|saturday|sunday|[0-9]{1,2}:[0-9]{2}\s*(?:AM|PM)|(?:at\s+)[0-9]{1,2}\s*(?:AM|PM))/i,
        'Warm Callback': /(?:warm callback|callback|follow up|follow-up|return call|call back later|check back|call you back|call back|give you a call|reach back)/i,
        'Personal Callback': /(?:personal callback|personal call|call me back directly|my cell|personal number|direct line|call me on my cell|reach me at)/i,
        'Hot Transfer': /(?:hot transfer|transfer now|connect now|hot handoff|immediate transfer|transfer you|connect you|hand you off)/i,
        'Completed': /(?:completed|done|finished|closed|finalized|wrapped up|concluded|all set|good to go)/i,
        'Canceled': /(?:canceled|cancelled|off|called off|not happening|no longer|scrapped|not gonna work|cancel|not interested)/i,
        'No Show': /(?:no show|didn't show|did not show|failed to show|missed|no-show|didn't attend|skipped|not attended|didn't make it)/i,
        'Rescheduled': /(?:rescheduled|moved|pushed back|postponed|new time|different day|changed date|moved to|not available|can't make it|won't be here|not gonna be here)/i,
        'Pending': /(?:pending|awaiting|waiting|not yet|tbd|to be determined|undecided|open|unresolved|let me think|i'll get back|i'll call back|let me check)/i
    },

    // Role detection patterns
    ROLE_PATTERNS: {
        'Owner': /(?:owner|founder|proprietor|boss|ceo|president|i own|my company|my business)/i,
        'Manager': /(?:manager|store manager|general manager|operations manager|office manager)/i,
        'Director': /(?:director|executive director|managing director|creative director|sales director)/i,
        'Supervisor': /(?:supervisor|team lead|lead|shift lead|floor supervisor)/i,
        'CEO': /(?:ceo|chief executive officer|executive|top executive)/i,
        'Administrator': /(?:administrator|admin|office admin|system admin)/i,
        'Coordinator': /(?:coordinator|project coordinator|event coordinator|marketing coordinator)/i
    },

    // Date/time phrases for natural language parsing
    DATE_TIME_PHRASES: {
        'today': /today/i,
        'tomorrow': /tomorrow/i,
        'yesterday': /yesterday/i,
        'next week': /next week/i,
        'this week': /this week/i,
        'next month': /next month/i,
        'this month': /this month/i,
        'morning': /morning/i,
        'afternoon': /afternoon/i,
        'evening': /evening/i,
        'monday': /monday/i,
        'tuesday': /tuesday/i,
        'wednesday': /wednesday/i,
        'thursday': /thursday/i,
        'friday': /friday/i,
        'saturday': /saturday/i,
        'sunday': /sunday/i
    },

    // Month names
    MONTHS: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    MONTHS_SHORT: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
    DAYS: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
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
        defaultStatus: 'Meeting Booked',
        defaultAssigned: 'Daniel',
        autoTag: true,
        autoSentiment: true,
        autoSource: true,
        detectDuplicates: true,
        confidenceThreshold: 0.5,
        duplicateMatchThreshold: 0.7
    },
    isParsing: false,
    parseStartTime: null,
    parseEndTime: null,
    currentTranscript: null
};

// ================================================================
// SMART IMPORT AI ENGINE
// ================================================================

class SmartImportAI {
    constructor() {
        this.config = SmartImportState.parseConfig;
        this.fieldMappings = SMART_IMPORT.FIELD_MAPPINGS;
        this.autoTagRules = SMART_IMPORT.AUTO_TAG_RULES;
        this.sentimentPatterns = SMART_IMPORT.SENTIMENT_PATTERNS;
        this.sourcePatterns = SMART_IMPORT.SOURCE_PATTERNS;
        this.outcomePatterns = SMART_IMPORT.OUTCOME_PATTERNS;
        this.rolePatterns = SMART_IMPORT.ROLE_PATTERNS;
        this.dateTimePhrases = SMART_IMPORT.DATE_TIME_PHRASES;
        this.months = SMART_IMPORT.MONTHS;
        this.monthsShort = SMART_IMPORT.MONTHS_SHORT;
        this.days = SMART_IMPORT.DAYS;
    }

    /**
     * AI-Powered parse conversation transcript
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
        
        // Store for reference
        SmartImportState.currentTranscript = fullText;
        
        // STEP 1: Extract speaker lines for better parsing
        const speakers = this._extractSpeakers(lines);
        
        // STEP 2: Extract key-value pairs (most reliable)
        this._extractKeyValuePairs(lines, result, confidence, warnings);
        
        // STEP 3: Extract business name from conversation
        this._extractBusinessName(fullText, result, confidence, speakers);
        
        // STEP 4: Extract contact name
        this._extractContactName(fullText, result, confidence, speakers);
        
        // STEP 5: Extract phone number
        this._extractPhoneNumber(fullText, result, confidence);
        
        // STEP 6: Extract email
        this._extractEmail(fullText, result, confidence);
        
        // STEP 7: Extract date and time (natural language)
        this._extractDateTime(fullText, result, confidence, warnings);
        
        // STEP 8: Extract status/outcome from context
        this._extractStatus(fullText, result, confidence, warnings);
        
        // STEP 9: Extract role
        this._extractRole(fullText, result, confidence);
        
        // STEP 10: Extract assigned to
        this._extractAssigned(fullText, result, confidence);
        
        // STEP 11: Extract notes for developer
        this._extractDeveloperNotes(fullText, lines, result, confidence);
        
        // STEP 12: Detect tags
        this._detectTags(result, confidence);
        
        // STEP 13: Detect sentiment
        this._detectSentiment(result, confidence);
        
        // STEP 14: Detect source
        this._detectSource(fullText, result, confidence);
        
        // STEP 15: Apply defaults
        this._applyDefaults(result, confidence, config);
        
        // STEP 16: Validate
        const isValid = this._validateRequiredFields(result);
        const errors = this._getValidationErrors(result);
        
        // Generate developer notes if empty or too short
        if (!result.notes || result.notes.trim().length < 10) {
            result.notes = this._generateDeveloperNotes(result, fullText, speakers);
            confidence.notes = 0.7;
        }
        
        // Check for missing/uncertain fields
        const uncertainFields = this._getUncertainFields(result, confidence);
        
        // Mark N/A for missing fields
        this._markMissingFields(result, confidence);
        
        return {
            result,
            confidence,
            context,
            warnings,
            errors,
            uncertainFields,
            speakers,
            isValid: isValid && errors.length === 0
        };
    }
    
    /**
     * Extract speakers from conversation
     */
    _extractSpeakers(lines) {
        const speakers = {
            setter: null,
            prospect: null,
            other: []
        };
        
        const speakerPatterns = [
            /^([A-Za-z]+)\s*[\(\[\(]?(?:Setter|Booker|Agent|Rep|Flynn|Kailan|Seif|Daniel|Sarah)[\)\]\)]?\s*[:：]/i,
            /^([A-Za-z]+)\s*[\(\[\(]?(?:Prospect|Client|Customer|Lead)[\)\]\)]?\s*[:：]/i,
            /^([A-Za-z]+)\s*[:：]/i
        ];
        
        let setterFound = false;
        let prospectFound = false;
        
        for (const line of lines) {
            for (const pattern of speakerPatterns) {
                const match = line.match(pattern);
                if (match) {
                    const name = match[1].trim();
                    if (!setterFound && /(?:Flynn|Kailan|Seif|Daniel|Sarah|Agent|Setter|Booker|Rep)/i.test(name)) {
                        speakers.setter = name;
                        setterFound = true;
                    } else if (!prospectFound && !/(?:Flynn|Kailan|Seif|Daniel|Sarah|Agent|Setter|Booker|Rep)/i.test(name)) {
                        speakers.prospect = name;
                        prospectFound = true;
                    } else if (!speakers.setter && !speakers.prospect) {
                        speakers.other.push(name);
                    }
                }
            }
        }
        
        return speakers;
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
            hasConversation: /(?:said|asked|told|called|spoke|talked|conversation|call|transcript)/i.test(text),
            detectedFormat: this._detectFormat(lines),
            wordCount: text.split(/\s+/).length,
            lineCount: lines.length,
            hasSpeakers: this._detectSpeakers(lines)
        };
    }
    
    _detectSpeakers(lines) {
        return lines.some(line => /^[A-Za-z]+\s*[:：]/.test(line));
    }
    
    _detectFormat(lines) {
        let keyValueCount = 0;
        let bulletCount = 0;
        let conversationCount = 0;
        
        lines.forEach(line => {
            if (/^[^:]+:.+/.test(line)) keyValueCount++;
            if (/^[\s]*[â€¢\-*]\s/.test(line)) bulletCount++;
            if (/^[A-Za-z]+\s*[:：]/.test(line)) conversationCount++;
        });
        
        if (keyValueCount > lines.length * 0.25) return 'key_value';
        if (conversationCount > lines.length * 0.3) return 'conversation';
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
        const separators = [':', '=', '->', '=>', 'â€”', '|'];
        const fieldPatterns = {
            'business': /(?:business|company|organization|org|firm|brand|store|company name|business name)/i,
            'name': /(?:name|contact|client|customer|person|full name|contact name|contact person)/i,
            'phone': /(?:phone|mobile|cell|telephone|number|contact number|phone number|mobile number)/i,
            'email': /(?:email|e-mail|mail|email address|e-mail address)/i,
            'date': /(?:date|appointment date|demo date|schedule date|meeting date|call date|day|best time|callback date|scheduled date|event date|scheduled for)/i,
            'time': /(?:time|appointment time|demo time|schedule time|meeting time|call time|hour|callback time|scheduled time|event time|at)/i,
            'status': /(?:status|state|stage|lead status|appointment status|call status|demo status|outcome|result)/i,
            'notes': /(?:notes|note|comment|remarks|additional notes|info|details|description|summary|developer notes|call notes)/i,
            'assigned': /(?:assigned|assigned to|owner|agent|representative|rep|handler|manager|closer|booker)/i,
            'role': /(?:role|title|position|job title|designation|job role|job position)/i
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
                    }
                }
            }
        });
    }
    
    /**
     * Parse date/time field
     */
    _parseDateTimeField(value, result, confidence) {
        const dateTimeMatch = value.match(/([A-Za-z]+(?:day)?)\s*,?\s*([A-Za-z]+)\s*(\d{1,2})\s*(?:,?\s*(\d{4}))?\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i);
        if (dateTimeMatch) {
            const monthName = dateTimeMatch[2];
            const day = parseInt(dateTimeMatch[3]);
            const year = dateTimeMatch[4] ? parseInt(dateTimeMatch[4]) : new Date().getFullYear();
            const time = dateTimeMatch[5];
            
            const monthIndex = this._getMonthIndex(monthName);
            
            if (monthIndex !== -1) {
                const dateObj = new Date(year, monthIndex, day);
                if (!isNaN(dateObj.getTime())) {
                    result.date = this._formatDate(dateObj);
                    confidence.date = 0.95;
                }
            }
            
            if (time) {
                result.time = this._normalizeTime(time.trim());
                confidence.time = 0.95;
            }
        } else {
            const parsedDate = this._parseDateString(value);
            if (parsedDate) {
                result.date = parsedDate;
                confidence.date = 0.85;
            }
            
            const timeMatch = value.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))|(\d{1,2}\s*(?:AM|PM))/i);
            if (timeMatch) {
                result.time = this._normalizeTime(timeMatch[0].trim());
                confidence.time = 0.85;
            }
        }
    }
    
    /**
     * Extract business name from conversation
     */
    _extractBusinessName(text, result, confidence, speakers) {
        if (result.business) return;
        
        // Try to find business name from conversation patterns
        const patterns = [
            /(?:business|company|organization|org|firm|brand|store|business name|company name)[:\s]+([A-Z][a-zA-Z0-9\s&.,\-']+?)(?:[,.\n]|$)/i,
            /(?:from|at|with)\s+([A-Z][a-zA-Z0-9\s&.,\-']+?)(?:[,.\n]|$)/i,
            /^([A-Z][a-zA-Z0-9\s&.,\-']+?)\s+(?:business|company|organization)/i,
            /(?:for|about)\s+([A-Z][a-zA-Z0-9\s&.,\-']+?)(?:[,.\n]|$)/i,
            /(?:company|business)[:\s]+([A-Z][a-zA-Z0-9\s&.,\-']+)/i,
            /(?:working with|dealing with|reaching out to)\s+([A-Z][a-zA-Z0-9\s&.,\-']+?)(?:[,.\n]|$)/i,
            /(?:at\s+)([A-Z][a-zA-Z0-9\s&.,\-']+?)(?:\s+where|\s+and|\s+that|\s+for|\s+with|[,.\n]|$)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const business = match[1].trim();
                const cleaned = business.replace(/\s*(?:business|company|inc|llc|ltd|corp|corporation|agency|studios?|designs?|solutions|services|consulting|group|partners|associates|enterprises?|ventures?)\s*$/i, '').trim();
                if (cleaned.length > 2 && !this._isPersonName(cleaned)) {
                    result.business = cleaned || business;
                    confidence.business = 0.85;
                    return;
                }
            }
        }
        
        // Try to extract from conversation
        const conversationMatch = text.match(/(?:this is|this is called|called|known as|doing business as|dba)\s+([A-Z][a-zA-Z0-9\s&.,\-']{2,30})/i);
        if (conversationMatch && conversationMatch[1]) {
            const business = conversationMatch[1].trim();
            if (business.length > 2 && !this._isPersonName(business)) {
                result.business = business;
                confidence.business = 0.7;
                return;
            }
        }
        
        // Try to find capitalized phrase that looks like a business name
        const businessPhrases = text.match(/([A-Z][a-zA-Z0-9\s&.,\-']{2,30})(?:\s+(?:is|are|was|were|has|have|will|would|could|should|may|might))/g);
        if (businessPhrases && businessPhrases.length > 0) {
            const sorted = businessPhrases.sort((a, b) => b.length - a.length);
            for (const phrase of sorted) {
                const cleaned = phrase.replace(/\s+(?:is|are|was|were|has|have|will|would|could|should|may|might)$/, '').trim();
                if (cleaned.length > 3 && !this._isPersonName(cleaned) && !this._isLocationName(cleaned)) {
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
        if (parts.length === 1 && /^[A-Z][a-z]+$/.test(text) && text.length >= 3) {
            return true;
        }
        return false;
    }
    
    _isLocationName(text) {
        const locationKeywords = ['city', 'town', 'village', 'county', 'state', 'province', 'region', 'district', 'street', 'avenue', 'road', 'lane', 'drive'];
        const lower = text.toLowerCase();
        return locationKeywords.some(kw => lower.includes(kw));
    }
    
    /**
     * Extract contact name from conversation
     */
    _extractContactName(text, result, confidence, speakers) {
        if (result.name) return;
        
        // Use prospect name from speakers if available
        if (speakers && speakers.prospect) {
            result.name = speakers.prospect;
            confidence.name = 0.8;
            return;
        }
        
        const patterns = [
            /(?:name|contact|client|customer|person|full name|contact name|contact person)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:from|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:from|at|with|said|wants|would like|requested|called|spoke|talked)/i,
            /contact[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:name|contact)[:\s]+([A-Z][a-z]+)/i,
            /(?:spoke|talked|connected|chatted|conversed)\s+with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:person)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:this is|this is called|my name is|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim();
                if (name.length >= 2 && /^[A-Z]/.test(name) && !this._isBusinessName(name)) {
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
                if (match.length >= 2 && match.length < 30 && !this._isBusinessName(match) && !this._isRole(match)) {
                    result.name = match;
                    confidence.name = 0.5;
                    return;
                }
            }
        }
    }
    
    _isRole(text) {
        const roles = ['owner', 'manager', 'ceo', 'director', 'supervisor', 'lead', 'head', 'vp', 'president', 'founder', 'administrator', 'coordinator', 'specialist', 'analyst', 'engineer', 'developer', 'designer', 'consultant', 'advisor', 'assistant', 'partner', 'principal', 'executive', 'officer'];
        const lower = text.toLowerCase();
        return roles.some(role => lower.includes(role));
    }
    
    _isBusinessName(text) {
        const businessSuffixes = ['company', 'inc', 'llc', 'ltd', 'corp', 'corp', 'agency', 'studio', 'design', 'solution', 'service', 'consulting', 'group', 'partner', 'associate', 'solutions', 'services', 'consultants', 'pro', 'specialists', 'experts', 'team', 'lab', 'labs', 'works', 'workshop', 'enterprises', 'ventures', 'holdings', 'industries', 'systems', 'technologies', 'tires', 'auto', 'automotive', 'parts', 'services', 'supply', 'supplies', 'equipment', 'tools', 'machinery', 'apparel', 'clothing', 'food', 'beverage', 'restaurant', 'catering'];
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
            /(?:phone|mobile|cell|telephone|number|call|tel|phone number|mobile number)[:\s]+([+\d\s\-\(\)]{7,20})/i,
            /([+\d\s\-\(\)]{10,20})(?:\s*(?:is|was|will be|the|their|his|her|for|at))/i,
            /(?:call|reach|contact)\s+(?:at|on|via)\s+([+\d\s\-\(\)]{10,20})/i,
            /(\d{3}[-.]?\d{3}[-.]?\d{4})/,
            /\(\d{3}\)\s*\d{3}[-.]?\d{4}/,
            /(\+\d{1,3}[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})/,
            /(\d{3}\s+\d{3}\s+\d{4})/
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let phone = match[1].trim();
                phone = phone.replace(/[^\d+]/g, '');
                if (phone.length >= 7 && phone.length <= 15) {
                    phone = this._formatPhoneNumber(phone);
                    result.phone = phone;
                    confidence.phone = 0.95;
                    return;
                }
            }
        }
    }
    
    _formatPhoneNumber(phone) {
        if (phone.length === 10 && /^\d{10}$/.test(phone)) {
            return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
        } else if (phone.length === 11 && phone.startsWith('1') && /^\d{11}$/.test(phone)) {
            return `+1 (${phone.substring(1, 4)}) ${phone.substring(4, 7)}-${phone.substring(7)}`;
        } else if (phone.length > 10) {
            return `+${phone}`;
        }
        return phone;
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
            return;
        }
        
        // Check for email issue mention
        if (/email\s*(?:doesn't work|not working|unavailable|full|not functioning|inbox full|email full)/i.test(text)) {
            result.email = 'N/A (Email unavailable/full)';
            confidence.email = 0.9;
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
                result.time = this._normalizeTime(timeMatch[0].trim());
                confidence.time = 0.85;
            }
            return;
        }
        
        // Look for date/time phrases in natural language
        const patterns = [
            /(?:demo|appointment|meeting|call|schedule|booked|on|at|for|scheduled for|callback)\s+([A-Za-z]+(?:day)?)\s*,?\s*([A-Za-z]+)\s*(\d{1,2})\s*(?:,?\s*(\d{4}))?\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i,
            /([A-Za-z]+(?:day)?)\s*,?\s*([A-Za-z]+)\s*(\d{1,2})\s*,?\s*(\d{4})\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i,
            /([A-Za-z]+)\s*(\d{1,2})\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i,
            /(?:today|tomorrow|yesterday)\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i,
            /(?:next|this|last)\s+(?:week|month)\s*(?:on\s*)?([A-Za-z]+(?:day)?)\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i,
            /(?:morning|afternoon|evening)\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i
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
                    } else if (dayStr === 'next week') {
                        date.setDate(date.getDate() + 7);
                    } else if (dayStr === 'next month') {
                        date.setMonth(date.getMonth() + 1);
                    }
                    
                    if (!result.date) {
                        result.date = this._formatDate(date);
                        confidence.date = 0.9;
                    }
                    
                    if (match[1]) {
                        time = match[1];
                    }
                }
                
                // Parse month name
                if (monthName) {
                    const monthIndex = this._getMonthIndex(monthName);
                    
                    if (monthIndex !== -1 && day) {
                        const dateObj = new Date(year || new Date().getFullYear(), monthIndex, day);
                        if (!isNaN(dateObj.getTime())) {
                            result.date = this._formatDate(dateObj);
                            confidence.date = 0.95;
                        }
                    }
                }
                
                // Parse time
                if (time) {
                    result.time = this._normalizeTime(time.trim());
                    confidence.time = 0.95;
                } else if (match[0] && /morning|afternoon|evening/i.test(match[0])) {
                    const timeOfDay = match[0].match(/(morning|afternoon|evening)/i);
                    if (timeOfDay) {
                        const tod = timeOfDay[1].toLowerCase();
                        if (tod === 'morning') {
                            result.time = '9:00 AM';
                            confidence.time = 0.7;
                        } else if (tod === 'afternoon') {
                            result.time = '1:00 PM';
                            confidence.time = 0.7;
                        } else if (tod === 'evening') {
                            result.time = '6:00 PM';
                            confidence.time = 0.7;
                        }
                    }
                }
                
                if (result.date) break;
            }
        }
        
        // If still no date, try date-only patterns
        if (!result.date) {
            const datePatterns = [
                /(?:date|appointment|scheduled|meeting|call|day|demo|scheduled for|callback)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
                /(?:on|for)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
                /(\d{1,2}\/\d{1,2}\/\d{4})/,
                /(\d{4}-\d{2}-\d{2})/,
                /(\d{1,2}\.\d{1,2}\.\d{4})/
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
                /(?:time|at|scheduled|appointment|meeting|call|demo|callback)[:\s]+(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
                /(?:at\s+)(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
                /(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
                /(\d{1,2}\s*(?:AM|PM))/i
            ];
            for (const pattern of timePatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    result.time = this._normalizeTime(match[1].trim());
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
    
    _getMonthIndex(monthName) {
        const lower = monthName.toLowerCase();
        const index = this.months.indexOf(lower);
        if (index !== -1) return index;
        return this.monthsShort.indexOf(lower);
    }
    
    _formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    _normalizeTime(time) {
        if (!time) return '';
        const parts = time.split(':');
        if (parts.length === 2) {
            let hour = parseInt(parts[0]);
            let minute = parseInt(parts[1].replace(/\D/g, ''));
            const ampm = parts[1].toUpperCase().includes('PM') ? 'PM' : (parts[1].toUpperCase().includes('AM') ? 'AM' : '');
            
            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            
            if (hour >= 12) {
                const displayHour = hour === 12 ? 12 : hour - 12;
                return `${displayHour}:${String(minute).padStart(2, '0')} PM`;
            } else {
                return `${hour === 0 ? 12 : hour}:${String(minute).padStart(2, '0')} AM`;
            }
        }
        return time;
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
                return this._formatDate(date);
            }
        }
        
        const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (usMatch) {
            const month = parseInt(usMatch[1]) - 1;
            const day = parseInt(usMatch[2]);
            const year = parseInt(usMatch[3]);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
                return this._formatDate(date);
            }
        }
        
        const euMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (euMatch) {
            const day = parseInt(euMatch[1]);
            const month = parseInt(euMatch[2]) - 1;
            const year = parseInt(euMatch[3]);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
                return this._formatDate(date);
            }
        }
        
        const naturalMatch = trimmed.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
        if (naturalMatch) {
            const monthIndex = this._getMonthIndex(naturalMatch[1]);
            if (monthIndex !== -1) {
                const day = parseInt(naturalMatch[2]);
                const year = parseInt(naturalMatch[3]);
                const date = new Date(year, monthIndex, day);
                if (!isNaN(date.getTime())) {
                    return this._formatDate(date);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Extract status/outcome from context
     */
    _extractStatus(text, result, confidence, warnings) {
        if (result.status) return;
        
        let highestConfidence = 0;
        let matchedStatus = null;
        let matchedPattern = null;
        
        for (const [status, pattern] of Object.entries(this.outcomePatterns)) {
            if (pattern.test(text)) {
                const matchCount = (text.match(pattern) || []).length;
                const conf = Math.min(0.5 + matchCount * 0.12, 0.95);
                if (conf > highestConfidence) {
                    highestConfidence = conf;
                    matchedStatus = status;
                    matchedPattern = pattern;
                }
            }
        }
        
        if (matchedStatus) {
            result.status = matchedStatus;
            confidence.status = highestConfidence;
        } else {
            // Default to Meeting Booked if there's evidence of a meeting
            if (/meeting|demo|appointment|schedule|book|call|walkthrough|preview|look|check|share screen|screen share/i.test(text)) {
                result.status = 'Meeting Booked';
                confidence.status = 0.5;
            }
        }
    }
    
    /**
     * Extract role from conversation
     */
    _extractRole(text, result, confidence) {
        if (result.role) return;
        
        let highestConfidence = 0;
        let matchedRole = null;
        
        for (const [role, pattern] of Object.entries(this.rolePatterns)) {
            if (pattern.test(text)) {
                const matchCount = (text.match(pattern) || []).length;
                const conf = Math.min(0.5 + matchCount * 0.1, 0.9);
                if (conf > highestConfidence) {
                    highestConfidence = conf;
                    matchedRole = role;
                }
            }
        }
        
        if (matchedRole) {
            result.role = matchedRole;
            confidence.role = highestConfidence;
            return;
        }
        
        const rolePatterns = [
            /(?:role|title|position|job title|job role|job position)[:\s]+([A-Za-z\s]+?)(?:[,.\n]|$)/i,
            /(?:owner|manager|ceo|director|supervisor|lead|head|vp|president|founder|administrator|coordinator|specialist|analyst|engineer|developer|designer|consultant|advisor|assistant|partner|principal|executive|officer)/i
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
            /(?:assigned|assigned to|owner|agent|representative|rep|handler|manager|closer|booker)[:\s]+([A-Z][a-z]+)/i,
            /(?:will be|handled by|managed by)\s+([A-Z][a-z]+)/i,
            /(?:set|book)\s+by\s+([A-Z][a-z]+)/i
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
        
        // Use setter name from speakers if available
        if (SmartImportState.currentTranscript) {
            const setterMatch = SmartImportState.currentTranscript.match(/(?:Flynn|Kailan|Seif|Daniel|Sarah|Agent|Setter|Booker|Rep)/i);
            if (setterMatch) {
                result.assigned = setterMatch[0];
                confidence.assigned = 0.6;
                return;
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
     * Extract developer notes
     */
    _extractDeveloperNotes(text, lines, result, confidence) {
        if (result.notes && result.notes.length > 10) return;
        
        const notePatterns = [
            /(?:notes|note|comment|remarks|additional notes|info|details|description|summary|developer notes|call notes)[:\s]+(.+?)(?=\n\s*\n|$)/i,
            /(?:developer notes?|dev notes?|notes for developer|notes to developer)[:\s]+(.+?)(?=\n\s*\n|$)/i,
            /(?:next steps|follow-up|action items|summary)[:\s]+(.+?)(?=\n\s*\n|$)/i
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
            return !/^[^:]+:.+/.test(line) && !/^[\s]*[â€¢\-*]\s/.test(line) && !/^[A-Za-z]+\s*[:：]/.test(line);
        });
        
        if (nonKeyLines.length > 0) {
            let notes = nonKeyLines.join('\n').trim();
            notes = notes.replace(/[\+\d\s\-\(\)]{7,20}/g, '');
            notes = notes.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '');
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
    _generateDeveloperNotes(result, text, speakers) {
        const parts = [];
        const bullets = [];
        
        // Key information
        if (result.business) {
            bullets.push(`Business: ${result.business}`);
        }
        if (result.name) {
            bullets.push(`Contact: ${result.name}`);
        }
        if (result.phone) {
            bullets.push(`Phone: ${result.phone}`);
        }
        if (result.email && !result.email.includes('N/A')) {
            bullets.push(`Email: ${result.email}`);
        } else if (result.email && result.email.includes('N/A')) {
            bullets.push(`Email: ${result.email}`);
        }
        if (result.date) {
            bullets.push(`Date: ${Utils.formatDate(result.date)}`);
        }
        if (result.time) {
            bullets.push(`Time: ${result.time}`);
        }
        if (result.status) {
            bullets.push(`Status: ${result.status}`);
        }
        if (result.role) {
            bullets.push(`Role: ${result.role}`);
        }
        if (result.assigned) {
            bullets.push(`Assigned to: ${result.assigned}`);
        }
        if (result.tags && result.tags.length > 0) {
            bullets.push(`Tags: ${result.tags.join(', ')}`);
        }
        if (result.sentiment) {
            bullets.push(`Sentiment: ${result.sentiment}`);
        }
        
        // Extract key conversation points
        const keyPhrases = [
            /(?:free|no cost|no obligation|custom|preview|modern|website|site|design|redesign|update|improve|upgrade|new)/i,
            /(?:interest|interested|wants|would like|looking for|needs|wants to|looking to)/i,
            /(?:available|unavailable|busy|free|not here|not in|not available|can't make it)/i,
            /(?:email|inbox|full|not working|unavailable|not functioning|not receiving)/i,
            /(?:callback|follow-up|next steps|schedule|book|set up|arrange)/i,
            /(?:preview|walkthrough|demo|share screen|screen share|presentation|show)/i
        ];
        
        const conversationLines = text.split('\n').filter(l => /^[A-Za-z]+\s*[:：]/.test(l));
        const meaningfulLines = conversationLines.filter(l => {
            return keyPhrases.some(p => p.test(l));
        });
        
        if (meaningfulLines.length > 0) {
            bullets.push('\n--- Key Conversation Points ---');
            meaningfulLines.slice(0, 5).forEach(line => {
                const cleanLine = line.replace(/^[A-Za-z]+\s*[:：]\s*/, '').trim();
                if (cleanLine.length > 10) {
                    bullets.push(`• ${cleanLine}`);
                }
            });
        }
        
        // Add summary from transcript
        if (text.length > 0) {
            const sentences = text.match(/[^.!?]+[.!?]+/g);
            if (sentences) {
                const meaningful = sentences
                    .filter(s => s.length > 20 && s.length < 150 && !/^[A-Za-z]+\s*[:：]/.test(s))
                    .map(s => s.trim())
                    .slice(0, 3);
                if (meaningful.length > 0) {
                    bullets.push('\n--- Summary ---');
                    bullets.push(meaningful.join(' '));
                }
            }
        }
        
        parts.push(bullets.join('\n'));
        
        // Add note about missing information
        const missing = [];
        if (!result.business) missing.push('Business Name');
        if (!result.name) missing.push('Contact Name');
        if (!result.phone) missing.push('Phone Number');
        if (!result.email || result.email.includes('N/A')) missing.push('Email');
        if (!result.date) missing.push('Date');
        if (!result.time) missing.push('Time');
        
        if (missing.length > 0) {
            parts.push(`\n⚠️ Missing Information: ${missing.join(', ')}`);
        }
        
        return parts.join('\n');
    }
    
    /**
     * Mark missing fields as N/A
     */
    _markMissingFields(result, confidence) {
        const fields = ['business', 'name', 'role', 'phone', 'email', 'date', 'time', 'status', 'assigned'];
        
        for (const field of fields) {
            if (!result[field] || result[field].trim().length === 0) {
                result[field] = 'N/A';
                confidence[field] = 0;
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
        
        // Add status-based tags
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
        if (result.status === 'Personal Callback' && !tags.includes('personal_callback')) {
            tags.push('personal_callback');
        }
        if (result.status === 'Rescheduled' && !tags.includes('rescheduled')) {
            tags.push('rescheduled');
        }
        
        // Add email issue tag
        if (result.email && result.email.includes('N/A')) {
            tags.push('email_issue');
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
        if (!result.date || result.date === 'N/A') {
            result.date = config.defaultDate || new Date().toISOString().split('T')[0];
            confidence.date = 0.3;
        }
        
        if (!result.status || result.status === 'N/A') {
            result.status = config.defaultStatus || 'Meeting Booked';
            confidence.status = 0.5;
        }
        
        if (!result.assigned || result.assigned === 'N/A') {
            result.assigned = config.defaultAssigned || 'Daniel';
            confidence.assigned = 0.4;
        }
        
        if (result.phone && result.phone !== 'N/A') {
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
        const businessValid = result.business && result.business !== 'N/A' && result.business.trim().length > 0;
        const nameValid = result.name && result.name !== 'N/A' && result.name.trim().length > 0;
        return !!(businessValid && nameValid);
    }
    
    /**
     * Get validation errors
     */
    _getValidationErrors(result) {
        const errors = [];
        
        if (!result.business || result.business === 'N/A' || result.business.trim().length < 2) {
            errors.push({ field: 'business', message: 'Business name is required' });
        }
        
        if (!result.name || result.name === 'N/A' || result.name.trim().length < 2) {
            errors.push({ field: 'name', message: 'Contact name is required' });
        }
        
        if (result.phone && result.phone !== 'N/A' && !/^[\+\d\s\-\(\)]{7,20}$/.test(result.phone)) {
            errors.push({ field: 'phone', message: 'Phone number format seems invalid' });
        }
        
        if (result.email && result.email !== 'N/A' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
            errors.push({ field: 'email', message: 'Email format seems invalid' });
        }
        
        return errors;
    }
    
    /**
     * Get uncertain fields (low confidence or missing)
     */
    _getUncertainFields(result, confidence) {
        const uncertain = [];
        const fields = ['business', 'name', 'role', 'phone', 'email', 'date', 'time', 'status', 'assigned'];
        
        for (const field of fields) {
            if (!result[field] || result[field] === 'N/A') {
                uncertain.push({ field, message: `Missing ${field}` });
            } else if (confidence[field] && confidence[field] < 0.5) {
                uncertain.push({ field, message: `Low confidence in ${field}` });
            }
        }
        
        return uncertain;
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
        
        if (!newBusiness || newBusiness.length < 2 || newBusiness === 'n/a') return [];
        
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
            if (newPhone && existing.phone && newPhone !== 'n/a') {
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
                line.match(/^[A-Z][a-zA-Z]+\s+(?:Company|Corp|Inc|LLC|Ltd|Agency|Studio|Designs|Solutions|Services|Consulting|Group|Partners|&|Associates|Enterprises|Ventures|Holdings|Industries|Systems|Technologies|Tires|Auto|Automotive|Parts|Services|Supply|Supplies|Equipment|Tools|Machinery|Apparel|Clothing|Food|Beverage|Restaurant|Catering)/) ||
                line.match(/^---+\s*$/) ||
                line.match(/^={3,}\s*$/) ||
                line.match(/^Appointment\s+#\d+/) ||
                line.match(/^\d+\.\s*[A-Z]/) ||
                line.match(/^[A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+\s*[:\-]\s*/);
            
            if (line.includes(':') && line.split(':')[0].trim().length > 0) {
                const key = line.split(':')[0].trim().toLowerCase();
                const isBusinessField = /(?:business|company|organization|org|firm|brand|store|business name|company name)/i.test(key);
                const isNameField = /(?:name|contact|client|customer|person|contact name)/i.test(key);
                
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
    SmartImportState.isParsing = false;
    
    const dateInput = DOM.get('importDefaultDate');
    if (dateInput) {
        dateInput.value = Utils.getTodayStr();
    }
    
    const textArea = DOM.get('importTextArea');
    if (textArea) {
        textArea.value = '';
        textArea.placeholder = `Paste your conversation transcript here. The AI will intelligently extract all CRM fields.

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
    
    // Update parse button text
    const parseBtn = DOM.get('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
        parseBtn.disabled = false;
    }
}

/**
 * Close the Smart Import modal
 */
function closeSmartImportEnhanced() {
    const modal = DOM.get('smartImportModal');
    if (modal) modal.style.display = 'none';
    AppState.importRecords = [];
    AppState.importProcessing = false;
    SmartImportState.isParsing = false;
    SmartImportState.currentTranscript = null;
}

/**
 * AI-Powered parse and preview import
 */
function parseAndPreviewImportEnhanced() {
    const textArea = DOM.get('importTextArea');
    if (!textArea) return;
    
    const text = textArea.value;
    if (!text.trim()) {
        showToast('Please paste a transcript to parse', 'warning');
        return;
    }
    
    const dateInput = DOM.get('importDefaultDate');
    const defaultDate = dateInput ? dateInput.value : Utils.getTodayStr();
    
    const progressContainer = DOM.get('importProgressContainer');
    if (progressContainer) progressContainer.style.display = 'block';
    AppState.importProcessing = true;
    SmartImportState.isParsing = true;
    AppState.importProgress = 0;
    SmartImportState.parseStartTime = Date.now();
    
    // Update parse button
    const parseBtn = DOM.get('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        parseBtn.disabled = true;
    }
    
    updateImportProgress(5, '🧠 AI analyzing transcript...');
    
    setTimeout(() => {
        try {
            const engine = new SmartImportAI();
            
            // Step 1: Split into appointments
            updateImportProgress(15, '📋 Identifying appointments...');
            const appointments = engine.splitAppointments(text);
            
            const total = appointments.length;
            AppState.importProgress = 20;
            
            if (total === 0) {
                showToast('No appointments detected in the transcript', 'warning');
                AppState.importProcessing = false;
                SmartImportState.isParsing = false;
                if (progressContainer) progressContainer.style.display = 'none';
                if (parseBtn) {
                    parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
                    parseBtn.disabled = false;
                }
                return;
            }
            
            updateImportProgress(25, `🔍 Found ${total} appointment(s). Extracting data...`);
            
            const parsedResults = [];
            const existingAppointments = Data.getAllAppointments();
            let validCount = 0;
            let invalidCount = 0;
            let totalConfidence = 0;
            
            // Step 2: Parse each appointment
            appointments.forEach((apptText, index) => {
                const progress = 25 + ((index + 1) / total) * 45;
                updateImportProgress(progress, `🧠 Processing appointment ${index + 1} of ${total}...`);
                
                const parsed = engine.parseTranscript(apptText, { defaultDate });
                const duplicates = engine.checkDuplicates(parsed, existingAppointments);
                const hasSignificantDuplicate = duplicates.some(d => d.confidence >= 70);
                
                if (parsed.isValid) validCount++;
                else invalidCount++;
                
                // Calculate average confidence
                const confValues = Object.values(parsed.confidence || {});
                const avgConf = confValues.length > 0 ? confValues.reduce((a, b) => a + b, 0) / confValues.length : 0;
                totalConfidence += avgConf;
                
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
                    uncertainFields: parsed.uncertainFields || [],
                    hasDuplicate: hasSignificantDuplicate,
                    duplicates: duplicates,
                    avgConfidence: avgConf,
                    speakers: parsed.speakers || {}
                });
            });
            
            const avgOverallConfidence = parsedResults.length > 0 ? 
                Math.round((totalConfidence / parsedResults.length) * 100) : 0;
            
            AppState.importRecords = parsedResults;
            AppState.importProgress = 85;
            SmartImportState.parseEndTime = Date.now();
            const parseTime = ((SmartImportState.parseEndTime - SmartImportState.parseStartTime) / 1000).toFixed(1);
            
            updateImportProgress(85, `✅ Analysis complete! (${parseTime}s)`);
            
            // Step 3: Render results
            setTimeout(() => {
                renderImportResults(parsedResults, avgOverallConfidence, parseTime);
                AppState.importProcessing = false;
                SmartImportState.isParsing = false;
                updateImportProgress(100, '✨ Ready! Review and save.');
                
                setTimeout(() => {
                    if (progressContainer) progressContainer.style.display = 'none';
                }, 1500);
                
                // Reset parse button
                if (parseBtn) {
                    parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
                    parseBtn.disabled = false;
                }
                
                showToast(`✅ Parsed ${parsedResults.length} appointment(s) in ${parseTime}s! ${validCount} valid, ${invalidCount} need review`, 'info');
            }, 400);
            
        } catch (error) {
            console.error('Smart Import parse error:', error);
            showToast('Error parsing transcript: ' + error.message, 'error');
            AppState.importProcessing = false;
            SmartImportState.isParsing = false;
            if (progressContainer) progressContainer.style.display = 'none';
            if (parseBtn) {
                parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
                parseBtn.disabled = false;
            }
        }
    }, 300);
}

/**
 * Render import results with AI analysis summary
 */
function renderImportResults(records, avgConfidence, parseTime) {
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
                    <span class="stat-label">🧠 AI Confidence (${confidenceLabel})</span>
                </div>
                <div class="import-stat" style="grid-column: span 1;">
                    <span class="stat-number">${parseTime || '0.0'}s</span>
                    <span class="stat-label">⏱️ Parse Time</span>
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
        const hasUncertain = record.uncertainFields && record.uncertainFields.length > 0;
        
        const confValues = Object.values(record.confidence || {});
        const avgConf = confValues.length > 0 ? confValues.reduce((a, b) => a + b, 0) / confValues.length : 0;
        const confColor = avgConf >= 0.7 ? 'high' : avgConf >= 0.4 ? 'medium' : 'low';
        
        const data = record.validated || record.parsed || {};
        
        const fields = [
            { key: 'business', label: '🏢 Business', value: data.business, required: true },
            { key: 'name', label: '👤 Name', value: data.name, required: true },
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
                const isUncertain = record.uncertainFields && record.uncertainFields.some(u => u.field === f.key);
                const valueDisplay = isDate && f.key === 'date' ? Utils.formatDate(f.value) : Utils.escapeHtml(f.value);
                const requiredClass = f.required ? 'required' : '';
                const isNA = f.value === 'N/A';
                return `
                    <div class="field-row ${isDate ? 'date-field' : ''} ${isUncertain ? 'uncertain' : ''} ${requiredClass} ${isNA ? 'na-field' : ''}">
                        <span class="field-label">${f.label}</span>
                        <span class="field-value ${isNA ? 'na-value' : ''}">${isNA ? 'N/A' : valueDisplay}</span>
                        <span class="field-confidence ${confClass}">${isNA ? 'N/A' : Math.round(conf * 100) + '%'}</span>
                        ${isUncertain ? '<span class="field-warning">⚠️</span>' : ''}
                        ${isNA ? '<span class="field-na">N/A</span>' : ''}
                    </div>
                `;
            }).join('');
        
        resultsHtml += `
            <div class="import-record ${statusClass} ${hasDuplicate ? 'duplicate' : ''} ${hasUncertain ? 'uncertain' : ''}">
                <div class="record-header" onclick="window.toggleImportRecord(this)">
                    <div class="record-status">
                        <span class="status-icon">${record.isValid ? '✅' : '⚠️'}</span>
                        <span class="record-index">#${record.index}</span>
                    </div>
                    <div class="record-summary">
                        <span class="record-name">${data.name && data.name !== 'N/A' ? Utils.escapeHtml(data.name) : 'Unknown'}</span>
                        <span class="record-business">${data.business && data.business !== 'N/A' ? Utils.escapeHtml(data.business) : 'Unknown Business'}</span>
                        ${data.date && data.date !== 'N/A' ? `<span class="record-date">📅 ${Utils.formatDate(data.date)}</span>` : ''}
                        ${data.time && data.time !== 'N/A' ? `<span class="record-date">🕐 ${Utils.escapeHtml(data.time)}</span>` : ''}
                    </div>
                    <div class="record-badges">
                        ${hasDuplicate ? '<span class="badge duplicate">🔄 Duplicate</span>' : ''}
                        ${hasUncertain ? `<span class="badge warning">❓ ${record.uncertainFields.length}</span>` : ''}
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
                    
                    ${hasUncertain ? `
                        <div class="record-uncertain">
                            <strong>❓ Uncertain Fields:</strong>
                            <ul>${record.uncertainFields.map(u => `<li>${u.field}: ${u.message}</li>`).join('')}</ul>
                            <span style="font-size:0.7rem; color:var(--text-muted);">Please review these fields before saving.</span>
                        </div>
                    ` : ''}
                    
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
    
    // Check for high-confidence duplicates
    const highConfidenceDuplicates = validRecords.filter(r => 
        r.duplicates && r.duplicates.some(d => d.confidence >= 80)
    );
    
    let confirmMsg = `💾 Save ${validRecords.length} appointment(s)?`;
    if (highConfidenceDuplicates.length > 0) {
        confirmMsg += `\n\n⚠️ ${highConfidenceDuplicates.length} of these appear to be high-confidence duplicates.`;
    }
    
    if (!confirm(confirmMsg)) return;
    
    let savedCount = 0;
    let skippedCount = 0;
    
    validRecords.forEach(record => {
        const data = record.validated || record.parsed;
        
        // Skip if business or name is N/A
        if (data.business === 'N/A' || data.name === 'N/A') {
            skippedCount++;
            return;
        }
        
        // Skip high-confidence duplicates unless user confirms
        const highDuplicate = record.duplicates && record.duplicates.find(d => d.confidence >= 85);
        if (highDuplicate) {
            if (!confirm(`"${data.business}" appears to be a duplicate (${highDuplicate.confidence}% match with ${highDuplicate.existing.business}). Save anyway?`)) {
                skippedCount++;
                return;
            }
        }
        
        // Add appointment using the centralized Data layer
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
        
        if (result) {
            savedCount++;
        }
    });
    
    showToast(`✅ Saved ${savedCount} appointment(s)! ${skippedCount > 0 ? `⏭️ Skipped ${skippedCount} invalid records.` : ''}`, 'success');
    
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

Status: [Pending/Hot Transfer/Warm Callback/Meeting Booked/Completed/Canceled/No Show/Rescheduled]

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

.import-record.uncertain {
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
    position: relative;
}

.field-row.required {
    border-left: 2px solid var(--primary);
}

.field-row.uncertain {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.2);
}

.field-row.date-field {
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.15);
}

.field-row.na-field {
    background: rgba(148, 163, 184, 0.08);
    border: 1px solid rgba(148, 163, 184, 0.2);
}

.field-row .na-value {
    color: var(--text-muted);
    font-style: italic;
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

.field-warning {
    font-size: 0.7rem;
    margin-left: 2px;
}

.field-na {
    font-size: 0.6rem;
    color: var(--text-muted);
    background: var(--bg-card);
    padding: 1px 6px;
    border-radius: 10px;
    font-weight: 600;
}

.record-warnings,
.record-errors,
.record-duplicates,
.record-uncertain {
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

.record-uncertain {
    background: rgba(245, 158, 11, 0.08);
    border-left: 3px solid var(--warning);
}

.record-warnings ul,
.record-errors ul,
.record-duplicates ul,
.record-uncertain ul {
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

.record-uncertain li {
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

/* AI Analysis badge */
.ai-analysis-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--primary);
    color: white;
    padding: 2px 12px;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
    .import-summary-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .import-date-selector {
        flex-direction: column;
        align-items: stretch;
    }
    
    .import-date-selector input[type="date"] {
        width: 100%;
    }
    
    .record-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .record-badges {
        justify-content: flex-start;
    }
    
    .record-summary {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
}

@media (max-width: 480px) {
    .import-summary-grid {
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
    
    .import-stat {
        padding: 8px 12px;
    }
    
    .import-stat .stat-number {
        font-size: 1.2rem;
    }
    
    .field-row {
        flex-wrap: wrap;
        gap: 4px;
    }
    
    .field-label {
        min-width: 50px;
        font-size: 0.65rem;
    }
    
    .field-value {
        font-size: 0.75rem;
    }
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
    
    // Ensure the parse button uses the AI icon
    const parseBtn = DOM.get('parseImportBtn');
    if (parseBtn) {
        parseBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Parse Transcript';
    }
    
    // Expose functions globally
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
const smartImportAI = new SmartImportAI();

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

window.SmartImportAI = SmartImportAI;
window.smartImportAI = smartImportAI;
window.SMART_IMPORT = SMART_IMPORT;
window.SmartImportState = SmartImportState;

console.log('🧠 Smart Import AI Enhanced loaded successfully');
console.log('🧠 Use smartImportAI.parseTranscript() for AI-powered parsing');
console.log('🧠 Use smartImportAI.checkDuplicates() for smart duplicate detection');
console.log('🧠 Click the "Parse Transcript" button to analyze your conversation');