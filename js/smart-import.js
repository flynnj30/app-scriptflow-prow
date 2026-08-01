// ================================================================
// SMART IMPORT - Centralized Import Module
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
            labels: ['date', 'appointment date', 'demo date', 'schedule date', 'meeting date', 'call date', 'day', 'best time', 'callback date', 'scheduled date', 'event date', 'when', 'demo time & date', 'appointment', 'meeting scheduled', 'booked for'],
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
        },
        meetingLink: {
            labels: ['meeting link', 'zoom', 'google meet', 'teams', 'webex', 'join link', 'video call', 'conference link'],
            confidence: 0.7
        },
        meetingDuration: {
            labels: ['duration', 'length', 'meeting length', 'call duration', 'estimated time'],
            confidence: 0.6
        },
        meetingAgenda: {
            labels: ['agenda', 'topics', 'discussion points', 'what to cover', 'meeting agenda'],
            confidence: 0.6
        },
        timezone: {
            labels: ['timezone', 'tz', 'est', 'edt', 'cst', 'cdt', 'mst', 'mdt', 'pst', 'pdt', 'gmt', 'utc'],
            confidence: 0.7
        }
    },

    // Meeting detection patterns - keywords that indicate a meeting is booked
    MEETING_DETECTION_PATTERNS: {
        confirmed: [
            /meeting\s+booked/i,
            /confirmed\s+(?:meeting|appointment|call|demo)/i,
            /scheduled\s+(?:meeting|appointment|call|demo)/i,
            /booked\s+(?:meeting|appointment|call|demo)/i,
            /meeting\s+confirmed/i,
            /appointment\s+confirmed/i,
            /demo\s+booked/i,
            /call\s+booked/i,
            /meeting\s+scheduled/i,
            /appointment\s+scheduled/i,
            /demo\s+scheduled/i,
            /calendar\s+invite\s+sent/i,
            /invitation\s+sent/i,
            /meeting\s+set/i,
            /call\s+set/i,
            /demo\s+set/i
        ],
        meeting_keywords: [
            /meeting/i,
            /appointment/i,
            /demo/i,
            /call/i,
            /discovery call/i,
            /sales call/i,
            /walkthrough/i,
            /preview/i,
            /presentation/i,
            /discussion/i,
            /consultation/i,
            /review/i
        ],
        date_indicators: [
            /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}/i,
            /\d{1,2}\/\d{1,2}\/\d{2,4}/,
            /\d{4}-\d{2}-\d{2}/,
            /tomorrow/i,
            /today/i,
            /next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            /this\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
        ],
        time_indicators: [
            /\d{1,2}:\d{2}\s*(?:AM|PM)/i,
            /\d{1,2}\s*(?:AM|PM)/i,
            /at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM)/i,
            /\d{1,2}(?::\d{2})?\s*(?:AM|PM)\s*(?:EST|EDT|CST|CDT|MST|MDT|PST|PDT|GMT|UTC)?/i
        ],
        timezone_patterns: [
            /(?:EST|EDT|CST|CDT|MST|MDT|PST|PDT|GMT|UTC)/i,
            /eastern/i,
            /central/i,
            /mountain/i,
            /pacific/i,
            /european/i,
            /london/i,
            /uk/i,
            /et|ct|mt|pt/i
        ]
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
        { pattern: /meeting booked|confirmed|scheduled|booked/i, tag: 'meeting_confirmed' },
        { pattern: /demo|walkthrough|presentation|showcase/i, tag: 'demo' },
        { pattern: /discovery call|exploratory/i, tag: 'discovery_call' }
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
        autoDetectMeetings: true,
        autoAssignClosers: true
    }
};

// ================================================================
// SMART IMPORT ENGINE
// ================================================================

class SmartImportEngine {
    constructor() {
        this.config = SmartImportState.parseConfig;
        this.fieldMappings = SMART_IMPORT.FIELD_MAPPINGS;
        this.autoTagRules = SMART_IMPORT.AUTO_TAG_RULES;
        this.sentimentPatterns = SMART_IMPORT.SENTIMENT_PATTERNS;
        this.sourcePatterns = SMART_IMPORT.SOURCE_PATTERNS;
        this.meetingPatterns = SMART_IMPORT.MEETING_DETECTION_PATTERNS;
        this._initialized = true;
    }

    /**
     * Split text into individual appointments
     * This method is called by app.js when parsing import text
     */
    splitAppointments(text) {
        if (!text || typeof text !== 'string') return [];
        
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
                line.match(/^\d+\.\s*[A-Z]/) ||
                line.match(/^[A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+\s*[:\-]\s*/);
            
            if (isNewAppointment && currentAppointment.length > 0) {
                appointments.push(currentAppointment.join('\n'));
                currentAppointment = [];
                inAppointment = false;
            }
            
            if (line.includes(':') && line.split(':')[0].trim().length > 0 && line.split(':')[0].trim().length < 30) {
                const key = line.split(':')[0].trim().toLowerCase();
                const isField = this.fieldMappings[key] || 
                               Object.keys(this.fieldMappings).some(f => 
                                   this.fieldMappings[f].labels.includes(key)
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

    /**
     * Parse text into structured data with meeting detection
     */
    parseText(text, options = {}) {
        if (!text || typeof text !== 'string') {
            return this._getEmptyResult();
        }

        const config = { ...this.config, ...options };
        const result = {};
        const confidence = {};
        const context = this._analyzeContext(text);

        // Clean and prepare text
        const cleanText = this._cleanText(text);
        const lines = cleanText.split('\n').filter(l => l.trim());
        const fullText = lines.join(' ');

        // Parse based on detected format
        if (context.hasKeyValue) {
            this._parseKeyValue(lines, result, confidence, context);
        } else if (context.hasBulletPoints) {
            this._parseBulletPoints(lines, result, confidence, context);
        } else {
            this._parseNaturalLanguage(fullText, lines, result, confidence, context);
        }

        // ================================================================
        // MEETING DETECTION - Auto-detect if this is a confirmed meeting
        // ================================================================
        const meetingDetection = this._detectMeeting(fullText, result);
        if (meetingDetection.isMeeting && config.autoDetectMeetings) {
            result._meetingDetected = true;
            result._meetingConfidence = meetingDetection.confidence;
            result._meetingDetails = meetingDetection.details;
            
            // Auto-set status to "Meeting Booked" if meeting is confirmed
            if (meetingDetection.confidence >= 0.7) {
                result.status = 'Meeting Booked';
                confidence.status = Math.max(confidence.status || 0, meetingDetection.confidence);
            }
            
            // Extract meeting details
            if (meetingDetection.details) {
                if (meetingDetection.details.link && !result.meetingLink) {
                    result.meetingLink = meetingDetection.details.link;
                    confidence.meetingLink = 0.8;
                }
                if (meetingDetection.details.duration && !result.meetingDuration) {
                    result.meetingDuration = meetingDetection.details.duration;
                    confidence.meetingDuration = 0.7;
                }
                if (meetingDetection.details.agenda && !result.meetingAgenda) {
                    result.meetingAgenda = meetingDetection.details.agenda;
                    confidence.meetingAgenda = 0.7;
                }
                if (meetingDetection.details.timezone && !result.timezone) {
                    result.timezone = meetingDetection.details.timezone;
                    confidence.timezone = 0.8;
                }
                if (config.autoAssignClosers && meetingDetection.confidence >= 0.7) {
                    result._autoAssignCloser = true;
                }
            }
        }

        // Apply default values
        if (!result.date && config.defaultDate) {
            result.date = config.defaultDate;
            confidence.date = 1.0;
        }

        if (!result.status && config.defaultStatus) {
            result.status = config.defaultStatus;
            confidence.status = 0.8;
        }

        if (!result.assigned && config.defaultAssigned) {
            result.assigned = config.defaultAssigned;
            confidence.assigned = 0.7;
        }

        // Enhance parsed data
        this._enhanceData(result, confidence, fullText, context);

        return {
            result,
            confidence,
            context,
            isValid: this._validateRequiredFields(result),
            errors: this._getValidationErrors(result),
            warnings: this._getWarnings(result, confidence),
            meetingDetection: meetingDetection
        };
    }

    /**
     * Parse multiple texts
     */
    parseBatch(texts, options = {}) {
        if (!Array.isArray(texts)) return [];
        
        const results = [];
        const total = texts.length;

        texts.forEach((text, index) => {
            const parsed = this.parseText(text, options);
            results.push({
                index: index + 1,
                raw: text,
                ...parsed
            });
        });

        return results;
    }

    /**
     * Get empty result for invalid input
     */
    _getEmptyResult() {
        return {
            result: {},
            confidence: {},
            context: { detectedFormat: 'unknown' },
            isValid: false,
            errors: [{ field: 'input', message: 'No text provided' }],
            warnings: [],
            meetingDetection: { isMeeting: false, confidence: 0 }
        };
    }

    /**
     * Detect if text contains a confirmed meeting
     */
    _detectMeeting(text, parsedResult) {
        const details = {
            isMeeting: false,
            confidence: 0,
            details: {
                link: null,
                duration: null,
                agenda: null,
                timezone: null,
                meetingType: null
            },
            matchedPatterns: []
        };

        if (!text) return details;

        // Check for confirmation keywords
        let hasConfirmation = false;
        let hasMeetingKeyword = false;
        let hasDate = false;
        let hasTime = false;

        // Check confirmation patterns
        for (const pattern of this.meetingPatterns.confirmed) {
            if (pattern.test(text)) {
                hasConfirmation = true;
                details.matchedPatterns.push('confirmed');
                break;
            }
        }

        // Check meeting keywords
        for (const pattern of this.meetingPatterns.meeting_keywords) {
            if (pattern.test(text)) {
                hasMeetingKeyword = true;
                details.matchedPatterns.push('meeting_keyword');
                break;
            }
        }

        // Check for date indicators
        for (const pattern of this.meetingPatterns.date_indicators) {
            if (pattern.test(text)) {
                hasDate = true;
                details.matchedPatterns.push('date');
                break;
            }
        }

        // Check for time indicators
        for (const pattern of this.meetingPatterns.time_indicators) {
            if (pattern.test(text)) {
                hasTime = true;
                details.matchedPatterns.push('time');
                break;
            }
        }

        // Check for timezone
        for (const pattern of this.meetingPatterns.timezone_patterns) {
            const match = text.match(pattern);
            if (match) {
                details.details.timezone = match[0];
                details.matchedPatterns.push('timezone');
                break;
            }
        }

        // Extract meeting link
        const linkMatch = text.match(/(?:meeting link|zoom|join|https?:\/\/[^\s]+)/i);
        if (linkMatch) {
            details.details.link = linkMatch[0];
        }

        // Extract duration
        const durationMatch = text.match(/(\d+)\s*(?:min|minute|hour|hr)/i);
        if (durationMatch) {
            details.details.duration = durationMatch[0];
        }

        // Extract agenda
        const agendaMatch = text.match(/agenda[:\s]+([^\n]+)/i);
        if (agendaMatch) {
            details.details.agenda = agendaMatch[1].trim();
        }

        // Extract meeting type
        const typeMatch = text.match(/(?:demo|walkthrough|presentation|discovery call|sales call|consultation|review)/i);
        if (typeMatch) {
            details.details.meetingType = typeMatch[0];
        }

        // Calculate confidence
        let confidenceScore = 0;
        if (hasConfirmation) confidenceScore += 0.4;
        if (hasMeetingKeyword) confidenceScore += 0.2;
        if (hasDate) confidenceScore += 0.15;
        if (hasTime) confidenceScore += 0.15;
        if (details.details.timezone) confidenceScore += 0.05;
        if (details.details.link) confidenceScore += 0.05;

        // Boost confidence if parsed result already has meeting-related fields
        if (parsedResult && parsedResult.status === 'Meeting Booked') confidenceScore += 0.1;
        if (parsedResult && parsedResult.date && parsedResult.time) confidenceScore += 0.1;

        details.confidence = Math.min(confidenceScore, 1.0);
        details.isMeeting = details.confidence >= 0.5;

        return details;
    }

    /**
     * Analyze text context
     */
    _analyzeContext(text) {
        if (!text) {
            return {
                hasKeyValue: false,
                hasBulletPoints: false,
                hasDateTime: false,
                hasPhone: false,
                hasEmail: false,
                detectedFormat: 'unknown',
                wordCount: 0,
                lineCount: 0
            };
        }

        const lines = text.split('\n').filter(l => l.trim());
        return {
            hasKeyValue: lines.some(line => /^[^:]+:.+/.test(line)),
            hasBulletPoints: lines.some(line => /^[\s]*[•\-*]\s/.test(line)),
            hasDateTime: /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/i.test(text),
            hasPhone: /[\+\d\s\-\(\)]{7,20}/.test(text),
            hasEmail: /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text),
            detectedFormat: this._detectFormat(lines),
            wordCount: text.split(/\s+/).length,
            lineCount: lines.length
        };
    }

    /**
     * Detect format type
     */
    _detectFormat(lines) {
        if (!lines || lines.length === 0) return 'unknown';
        
        let keyValueCount = 0;
        let bulletCount = 0;

        lines.forEach(line => {
            if (/^[^:]+:.+/.test(line)) keyValueCount++;
            if (/^[\s]*[•\-*]\s/.test(line)) bulletCount++;
        });

        if (keyValueCount > lines.length * 0.3) return 'key_value';
        if (bulletCount > lines.length * 0.3) return 'bullet_points';
        return 'natural_language';
    }

    /**
     * Clean text
     */
    _cleanText(text) {
        if (!text) return '';
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\u2013|\u2014/g, '-')
            .replace(/\u2018|\u2019/g, "'")
            .replace(/\u201C|\u201D/g, '"')
            .trim();
    }

    /**
     * Parse key: value format
     */
    _parseKeyValue(lines, result, confidence, context) {
        const separators = [':', '=', '->', '=>', '—', '-'];

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
                    const matchedField = this._matchField(key);
                    if (matchedField) {
                        if (matchedField === 'date' || matchedField === 'time') {
                            this._parseDateTime(value, result, confidence);
                        } else {
                            result[matchedField] = value;
                            confidence[matchedField] = this.fieldMappings[matchedField]?.confidence || 0.8;
                        }
                    } else {
                        if (!result.notes) result.notes = '';
                        result.notes += (result.notes ? '\n' : '') + `${key}: ${value}`;
                        confidence.notes = 0.5;
                    }
                }
            } else if (line.trim()) {
                if (!result.notes) result.notes = '';
                result.notes += (result.notes ? '\n' : '') + line.trim();
                confidence.notes = 0.4;
            }
        });
    }

    /**
     * Parse bullet points
     */
    _parseBulletPoints(lines, result, confidence, context) {
        const bulletPattern = /^[\s]*[•\-*]\s*(.*)$/;

        lines.forEach(line => {
            const match = line.match(bulletPattern);
            if (match) {
                const content = match[1].trim();
                const fieldMatch = content.match(/^([^:]+):\s*(.*)$/);

                if (fieldMatch) {
                    const key = fieldMatch[1].trim().toLowerCase();
                    const value = fieldMatch[2].trim();
                    const matchedField = this._matchField(key);

                    if (matchedField) {
                        if (matchedField === 'date' || matchedField === 'time') {
                            this._parseDateTime(value, result, confidence);
                        } else {
                            result[matchedField] = value;
                            confidence[matchedField] = this.fieldMappings[matchedField]?.confidence || 0.8;
                        }
                    } else {
                        if (!result.notes) result.notes = '';
                        result.notes += (result.notes ? '\n' : '') + content;
                        confidence.notes = 0.4;
                    }
                } else {
                    if (!result.notes) result.notes = '';
                    result.notes += (result.notes ? '\n' : '') + content;
                    confidence.notes = 0.4;
                }
            }
        });
    }

    /**
     * Parse natural language with enhanced meeting detection
     */
    _parseNaturalLanguage(fullText, lines, result, confidence, context) {
        if (!fullText) return;

        // Extract business name
        const businessPatterns = [
            /(?:business|company|organization|org|firm|brand|store)[:\s]+([A-Z][a-zA-Z0-9\s&]+?)(?:[,.\n]|$)/i,
            /(?:from|at|with)\s+([A-Z][a-zA-Z0-9\s&]+?)(?:[,.\n]|$)/i,
            /^([A-Z][a-zA-Z0-9\s&]+?)\s+(?:business|company|organization)/i,
            /(?:for|about)\s+([A-Z][a-zA-Z0-9\s&]+?)(?:[,.\n]|$)/i,
            /(?:company|business|org|firm)[:\s]+([A-Z][a-zA-Z0-9\s&]+)/i,
            /meeting with\s+([A-Z][a-zA-Z0-9\s&]+)/i,
            /call with\s+([A-Z][a-zA-Z0-9\s&]+)/i,
            /demo for\s+([A-Z][a-zA-Z0-9\s&]+)/i
        ];
        for (const pattern of businessPatterns) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
                result.business = match[1].trim();
                confidence.business = 0.8;
                break;
            }
        }

        // Extract name
        const namePatterns = [
            /(?:name|contact|client|customer|person|full name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:from|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:from|at|with|said|wants|would like|requested)/i,
            /contact[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:name|contact)[:\s]+([A-Z][a-z]+)/i,
            /meeting with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /call with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
        ];
        for (const pattern of namePatterns) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
                result.name = match[1].trim();
                confidence.name = 0.8;
                break;
            }
        }

        // Extract phone
        const phonePatterns = [
            /(?:phone|mobile|cell|telephone|number|call|tel)[:\s]+([+\d\s\-\(\)]{7,20})/i,
            /([+\d\s\-\(\)]{10,20})(?:\s*(?:is|was|will be|the|their|his|her|for))/i,
            /(?:call|reach|contact)\s+(?:at|on|via)\s+([+\d\s\-\(\)]{10,20})/i,
            /(\d{3}[-.]?\d{3}[-.]?\d{4})/,
            /\(\d{3}\)\s*\d{3}[-.]?\d{4}/
        ];
        for (const pattern of phonePatterns) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
                result.phone = match[1].trim();
                confidence.phone = 0.9;
                break;
            }
        }

        // Extract email
        const emailMatch = fullText.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/);
        if (emailMatch) {
            result.email = emailMatch[1].trim().toLowerCase();
            confidence.email = 0.95;
        }

        // Extract date and time together - Enhanced for meeting detection
        const dateTimePatterns = [
            /(?:demo|appointment|meeting|call|schedule|booked|on|at)\s+([A-Za-z]+(?:day)?)\s*,?\s+([A-Za-z]+)\s+(\d{1,2})\s*(?:,?\s*(\d{4}))?\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?\s*(?:([A-Z]{2,4}))?/i,
            /(?:scheduled for|booked for|confirmed for)\s+([A-Za-z]+(?:day)?)\s*,?\s+([A-Za-z]+)\s+(\d{1,2})\s*(?:,?\s*(\d{4}))?\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i,
            /(?:on)\s+([A-Za-z]+(?:day)?)\s*(?:,?\s*([A-Za-z]+)\s+(\d{1,2}))?\s*(?:,?\s*(\d{4}))?\s*(?:at\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM))?/i
        ];

        let dateFound = false;
        let timeFound = false;

        for (const pattern of dateTimePatterns) {
            const match = fullText.match(pattern);
            if (match) {
                const dayName = match[1];
                const monthName = match[2];
                const day = parseInt(match[3]);
                const year = match[4] ? parseInt(match[4]) : new Date().getFullYear();
                const time = match[5];
                const timezone = match[6];

                if (monthName) {
                    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
                    const monthIndex = months.indexOf(monthName.toLowerCase());

                    if (monthIndex !== -1) {
                        const dateObj = new Date(year, monthIndex, day);
                        if (!isNaN(dateObj.getTime())) {
                            result.date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            confidence.date = 0.9;
                            dateFound = true;
                        }
                    }
                }

                if (time) {
                    result.time = time.trim();
                    confidence.time = 0.9;
                    timeFound = true;
                }

                if (timezone) {
                    result.timezone = timezone;
                    confidence.timezone = 0.8;
                }

                if (dateFound && timeFound) break;
            }
        }

        // Extract date from other patterns (if not found above)
        if (!dateFound) {
            const datePatterns = [
                /(?:date|appointment|scheduled|meeting|call|day|demo)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
                /(?:on|for)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
                /(\d{1,2}\/\d{1,2}\/\d{4})/,
                /(\d{4}-\d{2}-\d{2})/,
                /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/,
                /(?:tomorrow|today|next\s+\w+day)/i
            ];
            for (const pattern of datePatterns) {
                const match = fullText.match(pattern);
                if (match && match[1]) {
                    const parsedDate = this._parseDateString(match[1]);
                    if (parsedDate) {
                        result.date = parsedDate;
                        confidence.date = 0.8;
                        dateFound = true;
                        break;
                    }
                }
            }
        }

        // Extract time from other patterns (if not found above)
        if (!timeFound) {
            const timePatterns = [
                /(?:time|at|scheduled|appointment|meeting|call|demo)[:\s]+(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
                /(?:at\s+)(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
                /(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
                /(\d{1,2})\s*(?:AM|PM)/i
            ];
            for (const pattern of timePatterns) {
                const match = fullText.match(pattern);
                if (match && match[1]) {
                    result.time = match[1].trim();
                    confidence.time = 0.85;
                    timeFound = true;
                    break;
                }
            }
        }

        // Extract status - Auto-detect meeting status
        const statusValues = ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held'];
        let statusFound = false;
        for (const status of statusValues) {
            if (fullText.toLowerCase().includes(status.toLowerCase())) {
                result.status = status;
                confidence.status = 0.8;
                statusFound = true;
                break;
            }
        }

        // If no status found but meeting detected, set to "Meeting Booked"
        if (!statusFound) {
            const meetingDetection = this._detectMeeting(fullText, result);
            if (meetingDetection.isMeeting && meetingDetection.confidence >= 0.6) {
                result.status = 'Meeting Booked';
                confidence.status = meetingDetection.confidence;
            }
        }

        // Extract role
        const rolePatterns = [
            /(?:role|title|position|job title|job role)[:\s]+([A-Za-z\s]+?)(?:[,.\n]|$)/i,
            /(?:owner|manager|ceo|director|supervisor|lead|head|vp|president|founder)/i
        ];
        for (const pattern of rolePatterns) {
            const match = fullText.match(pattern);
            if (match) {
                const roleText = match[1] || match[0];
                const roleWords = ['owner', 'manager', 'ceo', 'director', 'supervisor', 'lead', 'head', 'vp', 'president', 'founder'];
                const found = roleWords.find(w => roleText.toLowerCase().includes(w));
                if (found) {
                    result.role = found.charAt(0).toUpperCase() + found.slice(1);
                    confidence.role = 0.7;
                    break;
                }
            }
        }

        // Extract assigned
        const assignedMatch = fullText.match(/(?:assigned|assigned to|owner|agent|representative|rep|handler|manager)[:\s]+([A-Z][a-z]+)/i);
        if (assignedMatch && assignedMatch[1]) {
            result.assigned = assignedMatch[1].trim();
            confidence.assigned = 0.6;
        }

        // Extract website
        const websiteMatch = fullText.match(/(?:website|url|web|site|current website)[:\s]+(https?:\/\/[^\s]+)/i);
        if (websiteMatch && websiteMatch[1]) {
            result.website = websiteMatch[1].trim();
            confidence.website = 0.8;
        }

        // Extract meeting link
        const linkMatch = fullText.match(/(?:meeting link|zoom|join|https?:\/\/[^\s]+)/i);
        if (linkMatch) {
            result.meetingLink = linkMatch[0];
            confidence.meetingLink = 0.7;
        }

        // Extract duration
        const durationMatch = fullText.match(/(\d+)\s*(?:min|minute|hour|hr)/i);
        if (durationMatch) {
            result.meetingDuration = durationMatch[0];
            confidence.meetingDuration = 0.6;
        }

        // Extract agenda
        const agendaMatch = fullText.match(/agenda[:\s]+([^\n]+)/i);
        if (agendaMatch) {
            result.meetingAgenda = agendaMatch[1].trim();
            confidence.meetingAgenda = 0.6;
        }

        // If nothing was parsed, store everything as notes
        if (Object.keys(result).length === 0) {
            result.notes = fullText;
            confidence.notes = 0.3;
        }
    }

    /**
     * Parse date and time together
     */
    _parseDateTime(value, result, confidence) {
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
                    confidence.date = 0.9;
                }
            }

            if (time) {
                result.time = time.trim();
                confidence.time = 0.9;
            }
        }
    }

    /**
     * Match field name to schema
     */
    _matchField(key) {
        const normalizedKey = key.toLowerCase().trim();

        for (const [field, config] of Object.entries(this.fieldMappings)) {
            if (config.labels.some(label =>
                normalizedKey === label ||
                normalizedKey.includes(label) ||
                label.includes(normalizedKey) ||
                normalizedKey.split(' ').some(word => word === label.split(' ')[0])
            )) {
                return field;
            }
        }

        // Special case for "demo time & date"
        if (normalizedKey.includes('demo') && (normalizedKey.includes('time') || normalizedKey.includes('date'))) {
            return 'date';
        }

        return null;
    }

    /**
     * Parse date string to YYYY-MM-DD with enhanced natural language support
     */
    _parseDateString(dateStr) {
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

        // "Next Monday", "This Tuesday", etc.
        const dayMatch = trimmed.match(/(?:next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
        if (dayMatch) {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const targetDay = days.indexOf(dayMatch[1].toLowerCase());
            const today = new Date();
            const todayDay = today.getDay();
            let daysToAdd = targetDay - todayDay;
            if (daysToAdd <= 0) daysToAdd += 7;
            if (dayMatch[0].toLowerCase().startsWith('this') && daysToAdd === 7) daysToAdd = 0;
            const date = new Date(today);
            date.setDate(date.getDate() + daysToAdd);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

    /**
     * Enhance parsed data with additional processing
     */
    _enhanceData(result, confidence, fullText, context) {
        // Normalize phone
        if (result.phone) {
            result.phone = result.phone.replace(/[^\d+]/g, '');
            if (result.phone.length === 10 && /^\d{10}$/.test(result.phone)) {
                result.phone = `(${result.phone.substring(0, 3)}) ${result.phone.substring(3, 6)}-${result.phone.substring(6)}`;
            }
        }

        // Normalize email
        if (result.email) {
            result.email = result.email.toLowerCase().trim();
        }

        // Normalize time
        if (result.time) {
            const timeStr = result.time.trim();
            if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
                const hourMatch = timeStr.match(/^(\d{1,2}):?(\d{2})?$/);
                if (hourMatch) {
                    const hour = parseInt(hourMatch[1]);
                    const minute = hourMatch[2] || '00';
                    if (hour >= 1 && hour <= 12) {
                        result.time = `${hour}:${minute} ${hour >= 6 && hour <= 11 ? 'AM' : 'PM'}`;
                    } else if (hour >= 13 && hour <= 23) {
                        const adjustedHour = hour - 12;
                        result.time = `${adjustedHour}:${minute} PM`;
                    }
                }
            }
        }

        // Auto-detect sentiment
        if (result.notes) {
            let detectedSentiment = null;
            let highestConfidence = 0;

            for (const [sentiment, pattern] of Object.entries(this.sentimentPatterns)) {
                if (pattern.test(result.notes)) {
                    const matchCount = (result.notes.match(pattern) || []).length;
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

        // Auto-detect source
        if (fullText) {
            let detectedSource = null;
            let highestConfidence = 0;

            for (const [source, pattern] of Object.entries(this.sourcePatterns)) {
                if (pattern.test(fullText)) {
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

        // Auto-detect tags
        if (result.notes) {
            const tags = result.tags || [];

            for (const rule of this.autoTagRules) {
                if (rule.pattern.test(result.notes) && !tags.includes(rule.tag)) {
                    tags.push(rule.tag);
                    confidence.tags = 0.6;
                }
            }

            if (tags.length > 0) {
                result.tags = tags;
            }
        }

        // Auto-detect industry
        if (result.notes) {
            const industryPatterns = [
                { pattern: /(?:auto|automotive|car|truck|vehicle|transport|towing|repair|mechanic|service|maintenance)/i, industry: 'Automotive' },
                { pattern: /(?:health|medical|dental|doctor|clinic|hospital|care|wellness|fitness)/i, industry: 'Healthcare' },
                { pattern: /(?:tech|software|saas|app|digital|it|computer|programming|development)/i, industry: 'Technology' },
                { pattern: /(?:construction|building|contractor|remodel|roofing|plumbing|electric|renovation)/i, industry: 'Construction' },
                { pattern: /(?:real estate|property|home|house|condo|apartment|rental|leasing)/i, industry: 'Real Estate' },
                { pattern: /(?:restaurant|catering|food|dining|culinary|chef|bakery|brewery)/i, industry: 'Food & Beverage' },
                { pattern: /(?:retail|shop|store|ecommerce|online|market|boutique|fashion|clothing)/i, industry: 'Retail' },
                { pattern: /(?:legal|law|attorney|lawyer|firm|counsel|solicitor)/i, industry: 'Legal' },
                { pattern: /(?:education|school|university|college|training|course|learning|tutoring)/i, industry: 'Education' },
                { pattern: /(?:landscaping|lawn|garden|tree|outdoor|yard|exterior|painting|cleaning)/i, industry: 'Home Services' }
            ];

            for (const { pattern, industry } of industryPatterns) {
                if (pattern.test(result.notes)) {
                    result.industry = industry;
                    confidence.industry = 0.5;
                    break;
                }
            }
        }

        // If meeting was detected, ensure status is set
        if (result._meetingDetected && result._meetingConfidence >= 0.7) {
            if (!result.status || result.status === 'Pending') {
                result.status = 'Meeting Booked';
                confidence.status = Math.max(confidence.status || 0, 0.8);
            }
        }
    }

    /**
     * Validate required fields
     */
    _validateRequiredFields(result) {
        const required = ['name', 'business'];
        return required.every(field => result[field] && result[field].trim().length > 0);
    }

    /**
     * Get validation errors
     */
    _getValidationErrors(result) {
        const errors = [];

        if (!result.name || result.name.trim().length < 2) {
            errors.push({ field: 'name', message: 'Contact name is required (minimum 2 characters)' });
        }

        if (!result.business || result.business.trim().length < 2) {
            errors.push({ field: 'business', message: 'Business name is required (minimum 2 characters)' });
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
     * Get warnings
     */
    _getWarnings(result, confidence) {
        const warnings = [];

        const requiredFields = ['name', 'business', 'phone', 'email', 'date', 'time', 'status'];
        for (const field of requiredFields) {
            if (result[field] && confidence[field] && confidence[field] < 0.6) {
                warnings.push({ field, message: `Low confidence in detected ${field}` });
            }
        }

        // Meeting-specific warnings
        if (result._meetingDetected && result._meetingConfidence < 0.7) {
            warnings.push({ field: 'meeting', message: `Meeting detected with low confidence (${Math.round(result._meetingConfidence * 100)}%)` });
        }

        return warnings;
    }

    /**
     * Check for duplicates
     */
    checkDuplicates(record, existingAppointments) {
        if (!existingAppointments || existingAppointments.length === 0) return [];
        if (!record) return [];

        const duplicates = [];
        const data = record.result || record;

        const newName = (data.name || '').toLowerCase().trim();
        const newBusiness = (data.business || '').toLowerCase().trim();
        const newPhone = (data.phone || '').replace(/[^\d+]/g, '');
        const newEmail = (data.email || '').toLowerCase().trim();

        for (const existing of existingAppointments) {
            let score = 0;
            let matchedFields = [];
            let totalChecks = 0;

            if (newName && existing.contactName) {
                totalChecks++;
                const existingName = existing.contactName.toLowerCase().trim();
                if (newName === existingName) {
                    score += 0.6;
                    matchedFields.push('name');
                } else if (newName.includes(existingName) || existingName.includes(newName)) {
                    score += 0.3;
                    matchedFields.push('name_partial');
                }
            }

            if (newBusiness && existing.business) {
                totalChecks++;
                const existingBusiness = existing.business.toLowerCase().trim();
                if (newBusiness === existingBusiness) {
                    score += 0.5;
                    matchedFields.push('business');
                } else if (newBusiness.includes(existingBusiness) || existingBusiness.includes(newBusiness)) {
                    score += 0.25;
                    matchedFields.push('business_partial');
                }
            }

            if (newPhone && existing.phone) {
                totalChecks++;
                const existingPhone = existing.phone.replace(/[^\d+]/g, '');
                if (newPhone === existingPhone) {
                    score += 0.7;
                    matchedFields.push('phone');
                } else if (newPhone.includes(existingPhone) || existingPhone.includes(newPhone)) {
                    score += 0.3;
                    matchedFields.push('phone_partial');
                }
            }

            if (newEmail && existing.email) {
                totalChecks++;
                const existingEmail = existing.email.toLowerCase().trim();
                if (newEmail === existingEmail) {
                    score += 0.8;
                    matchedFields.push('email');
                }
            }

            const confidence = totalChecks > 0 ? Math.min(score + (totalChecks - 1) * 0.1, 1) : 0;
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

    /**
     * Format record for display with meeting indicators
     */
    formatRecord(record) {
        if (!record) return '';
        
        const data = record.result || record;
        const confidence = record.confidence || {};

        const fieldLabels = {
            business: '🏢 Business',
            name: '👤 Name',
            role: '💼 Role',
            phone: '📞 Phone',
            email: '✉️ Email',
            date: '📅 Date',
            time: '🕐 Time',
            status: '📊 Status',
            assigned: '👤 Assigned',
            notes: '📝 Notes',
            tags: '🏷️ Tags',
            sentiment: '😊 Sentiment',
            source: '📡 Source',
            industry: '🏭 Industry',
            website: '🌐 Website',
            address: '📍 Address',
            meetingLink: '🔗 Meeting Link',
            meetingDuration: '⏱️ Duration',
            meetingAgenda: '📋 Agenda',
            timezone: '🕐 Timezone'
        };

        const fieldOrder = ['business', 'name', 'role', 'phone', 'email', 'date', 'time', 'status', 'assigned', 'source', 'sentiment', 'industry', 'website', 'address', 'meetingLink', 'meetingDuration', 'meetingAgenda', 'timezone', 'notes', 'tags'];

        // Meeting indicator
        let meetingIndicator = '';
        if (data._meetingDetected) {
            const confPercent = Math.round((data._meetingConfidence || 0) * 100);
            meetingIndicator = `
                <div class="meeting-indicator ${data._meetingConfidence >= 0.7 ? 'confirmed' : 'suspected'}">
                    ${data._meetingConfidence >= 0.7 ? '✅ Meeting Confirmed' : '⚠️ Meeting Suspected'} (${confPercent}%)
                </div>
            `;
        }

        let html = meetingIndicator;
        for (const field of fieldOrder) {
            if (data[field]) {
                const conf = confidence[field] || 0.5;
                const confClass = conf >= 0.7 ? 'high' : (conf >= 0.4 ? 'medium' : 'low');
                const isDate = field === 'date';
                const isMeetingField = field.startsWith('meeting') || field === 'timezone';
                const fieldClass = isMeetingField ? 'meeting-field' : '';
                const valueDisplay = isDate ? this._formatDate(data[field]) : this._escapeHtml(data[field]);

                html += `
                    <div class="field-row ${isDate ? 'date-field' : ''} ${fieldClass}">
                        <span class="field-label">${fieldLabels[field] || field}</span>
                        <span class="field-value">${valueDisplay}</span>
                        <span class="field-confidence ${confClass}">${Math.round(conf * 100)}%</span>
                    </div>
                `;
            }
        }

        return html;
    }

    /**
     * Format date for display
     */
    _formatDate(dateStr) {
        if (!dateStr) return 'No date';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Escape HTML
     */
    _escapeHtml(s) {
        if (!s) return '';
        return String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }
}

// ================================================================
// SMART IMPORT UI COMPONENTS
// ================================================================

const SmartImportUI = {
    /**
     * Render import results
     */
    renderResults(container, records, options = {}) {
        if (!container) return;

        const {
            onSave = null,
            onSkip = null,
            onEdit = null,
            showActions = true,
            compact = false
        } = options;

        if (!records || records.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-import"></i>
                    <p>No records to display</p>
                    <span style="font-size:0.8rem; color:var(--text-muted);">Paste text and click Parse to see results</span>
                </div>
            `;
            return;
        }

        const validRecords = records.filter(r => r.isValid);
        const invalidRecords = records.filter(r => !r.isValid);

        // Count meetings detected
        const meetingsDetected = records.filter(r => r.result && r.result._meetingDetected).length;

        let html = `
            <div class="import-summary-grid">
                <div class="import-stat ${validRecords.length > 0 ? 'success' : ''}">
                    <span class="stat-number">${validRecords.length}</span>
                    <span class="stat-label">✅ Valid</span>
                </div>
                <div class="import-stat ${invalidRecords.length > 0 ? 'warning' : ''}">
                    <span class="stat-number">${invalidRecords.length}</span>
                    <span class="stat-label">⚠️ Needs Review</span>
                </div>
                <div class="import-stat ${meetingsDetected > 0 ? 'success' : ''}">
                    <span class="stat-number">${meetingsDetected}</span>
                    <span class="stat-label">📅 Meetings Detected</span>
                </div>
                <div class="import-stat">
                    <span class="stat-number">${records.length}</span>
                    <span class="stat-label">📋 Total</span>
                </div>
            </div>
            <div class="import-records-list ${compact ? 'compact' : ''}">
        `;

        const engine = new SmartImportEngine();

        records.forEach((record, index) => {
            const statusClass = record.isValid ? 'valid' : 'invalid';
            const hasWarnings = record.warnings && record.warnings.length > 0;
            const hasErrors = record.errors && record.errors.length > 0;
            const isMeeting = record.result && record.result._meetingDetected;

            const confValues = Object.values(record.confidence || {});
            const avgConf = confValues.length > 0 ? confValues.reduce((a, b) => a + b, 0) / confValues.length : 0;
            const confColor = avgConf >= 0.7 ? 'high' : avgConf >= 0.4 ? 'medium' : 'low';

            const data = record.result || {};

            html += `
                <div class="import-record ${statusClass} ${isMeeting ? 'meeting' : ''}" data-index="${record.index || index + 1}">
                    <div class="record-header" onclick="SmartImportUI.toggleRecord(this)">
                        <div class="record-status">
                            <span class="status-icon">${record.isValid ? '✅' : '⚠️'}</span>
                            <span class="record-index">#${record.index || index + 1}</span>
                            ${isMeeting ? '<span class="meeting-badge">📅</span>' : ''}
                        </div>
                        <div class="record-summary">
                            <span class="record-name">${engine._escapeHtml(data.name || 'Unknown')}</span>
                            <span class="record-business">${engine._escapeHtml(data.business || 'Unknown Business')}</span>
                            ${data.date ? `<span class="record-date">📅 ${engine._formatDate(data.date)}</span>` : ''}
                            ${data.status ? `<span class="record-status-tag">${engine._escapeHtml(data.status)}</span>` : ''}
                        </div>
                        <div class="record-badges">
                            ${isMeeting ? `<span class="badge meeting">📅 Meeting</span>` : ''}
                            ${hasWarnings ? `<span class="badge warning">⚠️ ${record.warnings.length}</span>` : ''}
                            ${hasErrors ? `<span class="badge error">❌ ${record.errors.length}</span>` : ''}
                            <span class="badge confidence ${confColor}">${Math.round(avgConf * 100)}%</span>
                        </div>
                        <span class="record-toggle">▼</span>
                    </div>
                    <div class="record-body" style="display:none;">
                        <div class="record-fields">
                            ${engine.formatRecord(record)}
                        </div>

                        ${record.warnings && record.warnings.length > 0 ? `
                            <div class="record-warnings">
                                <strong>⚠️ Warnings:</strong>
                                <ul>${record.warnings.map(w => `<li>${w.field}: ${w.message}</li>`).join('')}</ul>
                            </div>
                        ` : ''}

                        ${record.errors && record.errors.length > 0 ? `
                            <div class="record-errors">
                                <strong>❌ Errors:</strong>
                                <ul>${record.errors.map(e => `<li>${e.field}: ${e.message}</li>`).join('')}</ul>
                            </div>
                        ` : ''}

                        ${showActions ? `
                            <div class="record-actions">
                                ${record.isValid ? `
                                    <button class="btn-icon save-record-btn" onclick="SmartImportUI.saveRecord('${record.index || index + 1}')" style="background:var(--success); color:white;">
                                        <i class="fas fa-save"></i> Save
                                    </button>
                                ` : ''}
                                <button class="btn-icon edit-record-btn" onclick="SmartImportUI.editRecord('${record.index || index + 1}')" style="background:var(--primary); color:white;">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn-icon skip-record-btn" onclick="SmartImportUI.skipRecord('${record.index || index + 1}')" style="background:var(--danger); color:white;">
                                    <i class="fas fa-times"></i> Skip
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;

        // Update counts
        const recordCount = document.getElementById('importRecordCount');
        if (recordCount) {
            recordCount.textContent = records.length;
        }

        // Show save button if there are valid records
        const saveBtn = document.getElementById('saveImportBtn');
        if (saveBtn && validRecords.length > 0) {
            saveBtn.style.display = 'inline-flex';
            saveBtn.textContent = `💾 Save ${validRecords.length} Record(s)`;
        } else if (saveBtn) {
            saveBtn.style.display = 'none';
        }
    },

    /**
     * Toggle record expansion
     */
    toggleRecord(header) {
        const body = header.nextElementSibling;
        if (body) {
            const isVisible = body.style.display !== 'none';
            body.style.display = isVisible ? 'none' : 'block';
            const toggle = header.querySelector('.record-toggle');
            if (toggle) {
                toggle.textContent = isVisible ? '▶' : '▼';
            }
        }
    },

    /**
     * Save single record
     */
    saveRecord(index) {
        const event = new CustomEvent('smartImportSave', { detail: { index } });
        document.dispatchEvent(event);
    },

    /**
     * Edit record
     */
    editRecord(index) {
        const event = new CustomEvent('smartImportEdit', { detail: { index } });
        document.dispatchEvent(event);
    },

    /**
     * Skip record
     */
    skipRecord(index) {
        const event = new CustomEvent('smartImportSkip', { detail: { index } });
        document.dispatchEvent(event);
    },

    /**
     * Render edit form for a record with meeting fields
     */
    renderEditForm(container, record) {
        if (!container || !record) return;

        const data = record.result || {};
        const confidence = record.confidence || {};

        const fieldConfigs = {
            business: { label: 'Business Name *', type: 'text', required: true },
            name: { label: 'Contact Name *', type: 'text', required: true },
            role: { label: 'Role', type: 'text', required: false },
            phone: { label: 'Phone Number', type: 'text', required: false },
            email: { label: 'Email', type: 'email', required: false },
            date: { label: 'Date', type: 'date', required: false },
            time: { label: 'Time', type: 'text', required: false },
            status: {
                label: 'Status',
                type: 'select',
                required: false,
                options: ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held']
            },
            assigned: {
                label: 'Assigned To',
                type: 'select',
                required: false,
                options: ['Daniel', 'Sarah', 'Mike', 'Jessica', 'David', 'Kailan', 'Seif']
            },
            notes: { label: 'Notes', type: 'textarea', required: false },
            tags: { label: 'Tags (comma separated)', type: 'text', required: false },
            sentiment: {
                label: 'Sentiment',
                type: 'select',
                required: false,
                options: ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative']
            },
            industry: { label: 'Industry', type: 'text', required: false },
            website: { label: 'Website', type: 'text', required: false },
            address: { label: 'Address', type: 'text', required: false },
            meetingLink: { label: 'Meeting Link', type: 'text', required: false },
            meetingDuration: { label: 'Duration', type: 'text', required: false },
            meetingAgenda: { label: 'Agenda', type: 'text', required: false },
            timezone: { label: 'Timezone', type: 'text', required: false }
        };

        const fieldOrder = ['business', 'name', 'role', 'phone', 'email', 'date', 'time', 'status', 'assigned', 'notes', 'tags', 'sentiment', 'industry', 'website', 'address', 'meetingLink', 'meetingDuration', 'meetingAgenda', 'timezone'];

        let html = `
            <div class="edit-fields">
        `;

        const engine = new SmartImportEngine();

        for (const field of fieldOrder) {
            if (fieldConfigs[field]) {
                const config = fieldConfigs[field];
                const value = data[field] || '';
                const conf = confidence[field] || 0.5;
                const confClass = conf >= 0.7 ? 'high' : (conf >= 0.4 ? 'medium' : 'low');

                const isMeetingField = field.startsWith('meeting') || field === 'timezone';
                html += `
                    <div class="edit-field ${isMeetingField ? 'meeting-field' : ''}">
                        <label>
                            ${config.label}
                            ${config.required ? '<span class="required-star">*</span>' : ''}
                            ${conf ? `<span class="field-confidence ${confClass}">${Math.round(conf * 100)}%</span>` : ''}
                            ${isMeetingField ? '<span class="meeting-field-badge">📅</span>' : ''}
                        </label>
                `;

                if (config.type === 'select') {
                    const optionsHtml = config.options.map(opt =>
                        `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`
                    ).join('');
                    html += `
                        <select class="edit-input" data-field="${field}">
                            <option value="">Select ${config.label}</option>
                            ${optionsHtml}
                        </select>
                    `;
                } else if (config.type === 'textarea') {
                    html += `
                        <textarea class="edit-input" data-field="${field}" rows="3">${engine._escapeHtml(value)}</textarea>
                    `;
                } else if (config.type === 'date') {
                    html += `
                        <input type="date" class="edit-input" data-field="${field}" value="${value}" />
                    `;
                } else {
                    html += `
                        <input type="${config.type || 'text'}" class="edit-input" data-field="${field}" value="${engine._escapeHtml(value)}" placeholder="Enter ${config.label}" />
                    `;
                }

                html += `
                    </div>
                `;
            }
        }

        html += `
                <div class="edit-actions" style="grid-column: 1 / -1; display:flex; gap:8px; margin-top:8px;">
                    <button class="btn-icon save-edit-btn" style="background:var(--success); color:white;">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    <button class="btn-icon cancel-edit-btn" style="background:var(--danger); color:white;">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Attach event listeners
        const saveBtn = container.querySelector('.save-edit-btn');
        const cancelBtn = container.querySelector('.cancel-edit-btn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const inputs = container.querySelectorAll('.edit-input');
                const updatedData = { ...data };

                inputs.forEach(input => {
                    const field = input.getAttribute('data-field');
                    if (field) {
                        updatedData[field] = input.value.trim();
                    }
                });

                // If status is "Meeting Booked" and no meeting fields, add default values
                if (updatedData.status === 'Meeting Booked') {
                    if (!updatedData.meetingLink) updatedData.meetingLink = 'TBD';
                    if (!updatedData.meetingDuration) updatedData.meetingDuration = '30 min';
                }

                const event = new CustomEvent('smartImportUpdate', {
                    detail: { index: record.index || 0, data: updatedData }
                });
                document.dispatchEvent(event);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                const event = new CustomEvent('smartImportCancelEdit', {
                    detail: { index: record.index || 0 }
                });
                document.dispatchEvent(event);
            });
        }
    }
};

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

.import-records-list.compact .import-record {
    padding: 8px 12px;
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

.import-record.meeting {
    border-left: 4px solid var(--primary);
    background: rgba(59, 130, 246, 0.03);
}

/* Meeting Badge */
.meeting-badge {
    font-size: 0.8rem;
    margin-left: 4px;
}

.record-status-tag {
    font-size: 0.65rem;
    padding: 1px 8px;
    border-radius: 12px;
    background: var(--bg-primary);
    color: var(--text-secondary);
    margin-left: 6px;
}

.badge.meeting {
    background: var(--primary);
    color: white;
}

/* Meeting Indicator */
.meeting-indicator {
    padding: 6px 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
}

.meeting-indicator.confirmed {
    background: rgba(16, 185, 129, 0.15);
    color: var(--success);
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.meeting-indicator.suspected {
    background: rgba(245, 158, 11, 0.15);
    color: var(--warning);
    border: 1px solid rgba(245, 158, 11, 0.3);
}

/* Meeting Fields */
.field-row.meeting-field {
    background: rgba(59, 130, 246, 0.06);
    border: 1px solid rgba(59, 130, 246, 0.1);
}

.edit-field.meeting-field {
    border-left: 2px solid var(--primary);
    padding-left: 10px;
}

.meeting-field-badge {
    font-size: 0.7rem;
    margin-left: 4px;
    opacity: 0.6;
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
.record-errors {
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

.record-warnings ul,
.record-errors ul {
    margin: 4px 0 0 16px;
    font-size: 0.8rem;
}

.record-warnings li {
    color: var(--warning);
}

.record-errors li {
    color: var(--danger);
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
});

// Create engine instance
const smartImportEngine = new SmartImportEngine();

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

// Expose classes and instances
window.SmartImportEngine = SmartImportEngine;
window.SmartImportUI = SmartImportUI;
window.SmartImportState = SmartImportState;
window.SMART_IMPORT = SMART_IMPORT;
window.smartImportEngine = smartImportEngine;

// Expose the splitAppointments method directly for easy access
window.splitAppointments = function(text) {
    if (!window.smartImportEngine) return [];
    return window.smartImportEngine.splitAppointments(text);
};

// Expose the parseText method directly for easy access
window.parseImportText = function(text, options) {
    if (!window.smartImportEngine) return { result: {}, confidence: {}, isValid: false };
    return window.smartImportEngine.parseText(text, options);
};

// Expose the checkDuplicates method directly for easy access
window.checkImportDuplicates = function(record, existing) {
    if (!window.smartImportEngine) return [];
    return window.smartImportEngine.checkDuplicates(record, existing);
};

// Expose meeting detection
window.detectMeeting = function(text) {
    if (!window.smartImportEngine) return { isMeeting: false, confidence: 0 };
    return window.smartImportEngine._detectMeeting(text, {});
};

console.log('📥 Smart Import module loaded successfully');
console.log('📥 Meeting detection enabled - will auto-detect confirmed meetings');
console.log('📥 Use smartImportEngine.splitAppointments() to split text into appointments');
console.log('📥 Use smartImportEngine.parseText() to parse individual appointment text');
console.log('📥 Use smartImportEngine._detectMeeting() to detect meetings in text');