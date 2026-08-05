// ================================================================
// TRANSCRIPT PARSER - Production-Ready Parsing Module
// Hybrid approach: Regex + Rule-based + Fuzzy Matching + Confidence Scoring
// No external APIs required
// ================================================================

/**
 * Transcript Parser Configuration
 */
const PARSER_CONFIG = {
    // Confidence thresholds
    CONFIDENCE: {
        HIGH: 0.85,
        MEDIUM: 0.65,
        LOW: 0.40,
        MINIMUM: 0.30
    },
    // Status options for matching
    STATUS_OPTIONS: [
        'Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 
        'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held'
    ],
    // Role options
    ROLE_OPTIONS: ['Owner', 'Manager', 'CEO', 'Director', 'Supervisor', 'Team Lead', 'President', 'Founder', 'Partner'],
    // Team member options
    TEAM_MEMBERS: ['Kailan', 'Seif', 'Daniel', 'Sarah', 'Mike', 'Jessica', 'David'],
    // Timezone patterns
    TIMEZONES: ['EDT', 'EST', 'CDT', 'CST', 'MDT', 'MST', 'PDT', 'PST', 'GMT', 'UTC', 'ET', 'CT', 'MT', 'PT']
};

/**
 * Main Parser Class
 */
class TranscriptParser {
    constructor() {
        this.confidenceScores = {};
        this.extractedData = {};
        this.rawTranscript = '';
        this.lines = [];
        this.fullText = '';
        this.speakerMap = {};
        this.detectedIntent = null;
        this.meetingDetails = {
            booked: false,
            timeConfirmed: false,
            dateConfirmed: false
        };
    }

    /**
     * Main parse method - Entry point
     */
    parse(transcript, defaultDate = null) {
        console.log('📝 Starting transcript parsing...');
        
        // Reset state
        this.confidenceScores = {};
        this.extractedData = {};
        this.speakerMap = {};
        this.detectedIntent = null;
        this.meetingDetails = { booked: false, timeConfirmed: false, dateConfirmed: false };
        
        // Clean and prepare transcript
        this.rawTranscript = transcript;
        this.fullText = this._cleanText(transcript);
        this.lines = this._splitLines(this.fullText);
        
        // Extract speakers
        this._extractSpeakers();
        
        // Run all extraction modules
        const results = {
            business: this._extractBusiness(),
            name: this._extractName(),
            role: this._extractRole(),
            phone: this._extractPhone(),
            email: this._extractEmail(),
            date: this._extractDate(defaultDate),
            time: this._extractTime(),
            status: this._extractStatus(),
            assigned: this._extractAssigned(),
            notes: this._extractNotes(),
            tags: this._extractTags(),
            sentiment: this._extractSentiment(),
            callSummary: this._extractCallSummary(),
            detectedObjections: this._extractObjections(),
            meetingQualityScore: this._calculateMeetingQuality(),
            missingInformation: this._identifyMissingInfo()
        };
        
        // Calculate overall confidence
        this._calculateOverallConfidence(results);
        
        // Build final output
        const output = this._buildOutput(results);
        
        console.log('✅ Parsing complete. Confidence:', Math.round(output.confidence * 100) + '%');
        
        return output;
    }

    // ================================================================
    // TEXT PREPROCESSING
    // ================================================================

    _cleanText(text) {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }

    _splitLines(text) {
        return text.split('\n').filter(line => line.trim());
    }

    _extractSpeakers() {
        const speakerRegex = /^([A-Za-z\s]+(?:\([^)]+\))?)\s*[:：]/;
        this.speakerMap = {};
        
        this.lines.forEach(line => {
            const match = line.match(speakerRegex);
            if (match) {
                const speaker = match[1].trim();
                if (!this.speakerMap[speaker]) {
                    this.speakerMap[speaker] = [];
                }
                this.speakerMap[speaker].push(line);
            }
        });
        
        // Detect if this is a call transcript
        if (Object.keys(this.speakerMap).length >= 2) {
            this._detectCallerInfo();
        }
    }

    _detectCallerInfo() {
        const speakers = Object.keys(this.speakerMap);
        // Look for setter/flynn patterns
        for (const speaker of speakers) {
            const lower = speaker.toLowerCase();
            if (lower.includes('flynn') || lower.includes('setter') || lower.includes('agent')) {
                this.speakerMap._setter = speaker;
            } else if (lower.includes('prospect') || lower.includes('client') || lower.includes('customer')) {
                this.speakerMap._prospect = speaker;
            }
        }
    }

    // ================================================================
    // EXTRACTION MODULES
    // ================================================================

    _extractBusiness() {
        const result = { value: 'N/A', confidence: 0, evidence: '' };
        const text = this.fullText;
        
        // Pattern 1: Explicit business name mention
        const explicitPatterns = [
            /(?:business|company|organization|org|firm|brand|store|shop)[:\s]+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[,.\n]|$)/i,
            /(?:from|at|with|for)\s+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[,.\n]|$)/i,
            /(?:called|named)\s+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[,.\n]|$)/i,
            /is this\s+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[?.,!]|$)/i
        ];
        
        for (const pattern of explicitPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const value = match[1].trim();
                if (value.length > 2) {
                    result.value = value;
                    result.confidence = 0.85;
                    result.evidence = match[0];
                    return result;
                }
            }
        }
        
        // Pattern 2: Search for capitalized phrases that sound like business names
        const businessPhrases = text.match(/([A-Z][A-Za-z0-9\s&'\-.,]{2,}(?:Services|Maintenance|Solutions|Products|Tech|Corp|Inc|LLC|Co|Company|Truck|Auto|Plumbing|Electrical|Roofing|Construction|Cleaning|Consulting|Design|Media|Logistics|Transport|Freight|Towing|Repair|Restoration|Remodeling|Landscaping|Painting|Excavation|Paving|Concrete|Framing|Roofing|Siding|Windows|Doors|Cabinets|Flooring|Masonry|Plumbing|HVAC|Electrical|Security|Landscaping|Irrigation|Tree|Stump|Grading|Septic|Well|Pump|Generator|Solar|Insulation|Drywall|Paint|Carpet|Tile|Granite|Marble|Quartz|Laminate|Vinyl|Hardwood|Laminate|Carpet|Tile|Stone|Brick|Block|Steel|Aluminum|Copper|Brass|Iron)/i);
        if (businessPhrases) {
            for (const phrase of businessPhrases) {
                // Check if it's a valid business name (not a person or generic)
                if (phrase.length > 3 && !this._isPersonName(phrase)) {
                    result.value = phrase.trim();
                    result.confidence = 0.65;
                    result.evidence = phrase;
                    return result;
                }
            }
        }
        
        // Pattern 3: Extract from context
        const contextMatch = text.match(/(?:at|for|with)\s+([A-Z][A-Za-z0-9\s&'\-.,]{3,})(?:\s+(?:maintenance|services|repair|solutions|truck|auto|plumbing))/i);
        if (contextMatch && contextMatch[1]) {
            result.value = contextMatch[1].trim();
            result.confidence = 0.55;
            result.evidence = contextMatch[0];
            return result;
        }
        
        return result;
    }

    _extractName() {
        const result = { value: 'N/A', confidence: 0, evidence: '' };
        const text = this.fullText;
        const lines = this.lines;
        
        // Pattern 1: Explicit name mention
        const namePatterns = [
            /(?:name|contact|client|customer|person|full name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:my name is|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:what was your name|your name|name again)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:from|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
        ];
        
        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const value = match[1].trim();
                if (value.length >= 2) {
                    result.value = value;
                    result.confidence = 0.85;
                    result.evidence = match[0];
                    return result;
                }
            }
        }
        
        // Pattern 2: Look for "Prospect: Name" pattern
        for (const line of lines) {
            const match = line.match(/Prospect:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
            if (match && match[1]) {
                result.value = match[1].trim();
                result.confidence = 0.75;
                result.evidence = match[0];
                return result;
            }
        }
        
        // Pattern 3: Look for names in the transcript
        const nameMatches = text.match(/([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)/g);
        if (nameMatches) {
            for (const name of nameMatches) {
                // Filter out common words and false positives
                const commonWords = ['Hello', 'Yeah', 'Okay', 'Thanks', 'Great', 'Perfect', 'Sure', 'Alright', 'Well', 'Good', 'Nice', 'Awesome', 'Right', 'Sorry', 'Please', 'Thank', 'Welcome'];
                if (!commonWords.includes(name) && name.length >= 3) {
                    // Check if it's in the context of an introduction
                    const contextCheck = text.match(new RegExp(`(?:my name is|this is|i'm|i am|what was your name|your name|name again)\\s*${name}`, 'i'));
                    if (contextCheck) {
                        result.value = name;
                        result.confidence = 0.7;
                        result.evidence = contextCheck[0];
                        return result;
                    }
                    // Check if it's likely a name (not a business)
                    if (!this._isBusinessName(name)) {
                        result.value = name;
                        result.confidence = 0.5;
                        result.evidence = name;
                        // Don't return yet, keep looking for better matches
                    }
                }
            }
        }
        
        return result;
    }

    _extractRole() {
        const result = { value: 'N/A', confidence: 0, evidence: '' };
        const text = this.fullText;
        
        const rolePatterns = [
            /(?:role|title|position|job title|designation)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:owner|manager|ceo|director|supervisor|team lead|president|founder|co-founder)/i
        ];
        
        for (const pattern of rolePatterns) {
            const match = text.match(pattern);
            if (match) {
                let value = match[1] ? match[1].trim() : match[0].trim();
                // Normalize role
                const lower = value.toLowerCase();
                if (lower.includes('owner')) value = 'Owner';
                else if (lower.includes('manager')) value = 'Manager';
                else if (lower.includes('ceo')) value = 'CEO';
                else if (lower.includes('director')) value = 'Director';
                else if (lower.includes('supervisor')) value = 'Supervisor';
                else if (lower.includes('lead')) value = 'Team Lead';
                else if (lower.includes('president')) value = 'President';
                else if (lower.includes('founder')) value = 'Founder';
                else if (lower.includes('partner')) value = 'Partner';
                
                if (value !== 'N/A') {
                    result.value = value;
                    result.confidence = 0.7;
                    result.evidence = match[0];
                    return result;
                }
            }
        }
        
        // Check for context clues
        if (text.match(/\b(?:owner|i own|my business|my company)\b/i)) {
            result.value = 'Owner';
            result.confidence = 0.6;
            result.evidence = 'Context indicates ownership';
        } else if (text.match(/\b(?:manager|i manage|i run)\b/i)) {
            result.value = 'Manager';
            result.confidence = 0.55;
            result.evidence = 'Context indicates management';
        }
        
        return result;
    }

    _extractPhone() {
        const result = { value: 'N/A', confidence: 0, evidence: '' };
        const text = this.fullText;
        
        // Phone number patterns (US and international)
        const phonePatterns = [
            /(?:phone|mobile|cell|telephone|number|call|contact)[:\s]+([+\d\s\-\(\)]{7,20})/i,
            /([+\d\s\-\(\)]{10,20})(?:\s*(?:is|was|will be|the|their|his|her))/i,
            /(\+\d{1,3}[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})/,
            /(\d{3}[-.]?\d{3}[-.]?\d{4})/,
            /\(\d{3}\)\s*\d{3}[-.]?\d{4}/
        ];
        
        for (const pattern of phonePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let phone = match[1].trim();
                // Clean up phone number
                phone = phone.replace(/[^\d+]/g, '');
                if (phone.length >= 10) {
                    // Format phone number
                    if (phone.length === 10 && !phone.startsWith('+')) {
                        phone = '+1' + phone;
                    } else if (phone.length === 11 && phone.startsWith('1')) {
                        phone = '+' + phone;
                    }
                    result.value = phone;
                    result.confidence = 0.85;
                    result.evidence = match[0];
                    return result;
                }
            }
        }
        
        return result;
    }

    _extractEmail() {
        const result = { value: 'N/A', confidence: 0, evidence: '' };
        const text = this.fullText;
        
        // Email patterns
        const emailPatterns = [
            /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
            /(?:email|e-mail|mail|address)[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
        ];
        
        for (const pattern of emailPatterns) {
            const match = text.match(pattern);
            if (match) {
                const email = match[1] || match[0];
                if (email && email.includes('@')) {
                    result.value = email.trim().toLowerCase();
                    result.confidence = 0.9;
                    result.evidence = match[0];
                    return result;
                }
            }
        }
        
        // Check for "email doesn't work" or similar
        if (text.match(/email\s*(?:doesn['’]t|does not|is not|isn['’]t|no)\s*(?:work|working|valid|good|available)/i)) {
            result.value = 'Unavailable';
            result.confidence = 0.7;
            result.evidence = 'Email explicitly stated as unavailable';
            return result;
        }
        
        return result;
    }

    _extractDate(defaultDate) {
        const result = { value: defaultDate || 'N/A', confidence: 0.3, evidence: '' };
        const text = this.fullText;
        
        // Date patterns
        const datePatterns = [
            /(?:date|appointment|scheduled|meeting|call|day|on)[:\s]+([A-Za-z]+[\s,]+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
            /(?:date|appointment|scheduled|meeting|call|day|on)[:\s]+([A-Za-z]+[\s,]+\d{1,2}(?:st|nd|rd|th)?)/i,
            /(?:on)\s+([A-Za-z]+[\s,]+(?:the\s+)?\d{1,2}(?:st|nd|rd|th)?)/i,
            /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(?:morning|afternoon|evening|at\s+\d{1,2})/i
        ];
        
        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                let dateStr = match[1] || match[0];
                const parsed = this._parseDateString(dateStr);
                if (parsed) {
                    result.value = parsed;
                    result.confidence = 0.85;
                    result.evidence = match[0];
                    return result;
                }
            }
        }
        
        // Check for day names
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (const day of dayNames) {
            if (text.match(new RegExp(`\\b${day}\\b`, 'i'))) {
                const parsed = this._getDateForDay(day);
                if (parsed) {
                    result.value = parsed;
                    result.confidence = 0.7;
                    result.evidence = day;
                    return result;
                }
            }
        }
        
        return result;
    }

    _parseDateString(dateStr) {
        if (!dateStr) return null;
        const trimmed = dateStr.trim();
        
        // Try to parse various date formats
        const months = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12,
            'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
            'may': 5, 'jun': 6, 'jul': 7, 'aug': 8,
            'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
        };
        
        // Format: Month Day, Year
        const monthDayYearMatch = trimmed.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i);
        if (monthDayYearMatch) {
            const month = months[monthDayYearMatch[1].toLowerCase()];
            const day = parseInt(monthDayYearMatch[2]);
            const year = parseInt(monthDayYearMatch[3]);
            if (month && day && year) {
                const date = new Date(year, month - 1, day);
                if (!isNaN(date.getTime())) {
                    return this._formatDate(date);
                }
            }
        }
        
        // Format: Month Day
        const monthDayMatch = trimmed.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/i);
        if (monthDayMatch) {
            const month = months[monthDayMatch[1].toLowerCase()];
            const day = parseInt(monthDayMatch[2]);
            if (month && day) {
                let year = new Date().getFullYear();
                let date = new Date(year, month - 1, day);
                // If date is in the past, use next year
                if (date < new Date() && month < new Date().getMonth() + 1) {
                    date = new Date(year + 1, month - 1, day);
                }
                if (!isNaN(date.getTime())) {
                    return this._formatDate(date);
                }
            }
        }
        
        // Format: YYYY-MM-DD
        const isoMatch = trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const year = parseInt(isoMatch[1]);
            const month = parseInt(isoMatch[2]);
            const day = parseInt(isoMatch[3]);
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
                return this._formatDate(date);
            }
        }
        
        // Format: MM/DD/YYYY
        const usMatch = trimmed.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (usMatch) {
            const month = parseInt(usMatch[1]);
            const day = parseInt(usMatch[2]);
            const year = parseInt(usMatch[3]);
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
                return this._formatDate(date);
            }
        }
        
        // Check for "today", "tomorrow", "yesterday"
        if (/today/i.test(trimmed)) {
            return this._formatDate(new Date());
        }
        if (/tomorrow/i.test(trimmed)) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return this._formatDate(tomorrow);
        }
        if (/yesterday/i.test(trimmed)) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return this._formatDate(yesterday);
        }
        
        return null;
    }

    _getDateForDay(dayName) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = days.indexOf(dayName);
        if (targetDay === -1) return null;
        
        const today = new Date();
        const todayDay = today.getDay();
        let diff = targetDay - todayDay;
        if (diff <= 0) diff += 7;
        const date = new Date(today);
        date.setDate(date.getDate() + diff);
        return this._formatDate(date);
    }

    _formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    _extractTime() {
        const result = { value: 'N/A', confidence: 0, evidence: '' };
        const text = this.fullText;
        
        // Time patterns
        const timePatterns = [
            /(?:time|at|for)[:\s]+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
            /(?:time|at|for)[:\s]+(\d{1,2}\s*(?:AM|PM|am|pm))/i,
            /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/,
            /(\d{1,2}\s*(?:AM|PM|am|pm))/
        ];
        
        for (const pattern of timePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let time = match[1].trim();
                // Normalize time format
                if (!time.includes(':') && time.match(/\d{1,2}\s*(?:AM|PM|am|pm)/)) {
                    const num = parseInt(time);
                    const period = time.match(/(AM|PM|am|pm)/)[1].toUpperCase();
                    if (num < 10) {
                        time = `0${num}:00 ${period}`;
                    } else {
                        time = `${num}:00 ${period}`;
                    }
                }
                result.value = time;
                result.confidence = 0.85;
                result.evidence = match[0];
                return result;
            }
        }
        
        // Check for time ranges
        const rangeMatch = text.match(/(\d{1,2}:\d{2})\s*(?:to|-)\s*(\d{1,2}:\d{2})/i);
        if (rangeMatch) {
            result.value = `${rangeMatch[1]} - ${rangeMatch[2]}`;
            result.confidence = 0.75;
            result.evidence = rangeMatch[0];
            return result;
        }
        
        // Check for contextual time indicators
        if (text.match(/morning/i)) {
            result.value = 'Morning';
            result.confidence = 0.4;
            result.evidence = 'Morning mentioned';
        } else if (text.match(/afternoon/i)) {
            result.value = 'Afternoon';
            result.confidence = 0.4;
            result.evidence = 'Afternoon mentioned';
        } else if (text.match(/evening/i)) {
            result.value = 'Evening';
            result.confidence = 0.4;
            result.evidence = 'Evening mentioned';
        }
        
        return result;
    }

    _extractStatus() {
        const result = { value: 'Meeting Booked', confidence: 0.3, evidence: '' };
        const text = this.fullText;
        
        // Check for status indicators
        const statusIndicators = {
            'Hot Transfer': /(?:hot transfer|hot lead|ready to transfer|transferring now|take it over|immediate transfer)/i,
            'Warm Callback': /(?:warm callback|call back|follow up|follow-up|callback|call me back|get back to|check back)/i,
            'Completed': /(?:completed|done|finished|closed|wrapped up|finalized|set|booked|confirmed)/i,
            'Canceled': /(?:canceled|cancelled|no show|didn['’]t show|not interested|no longer|passed|declined)/i,
            'Rescheduled': /(?:rescheduled|reschedule|postponed|pushed back|moved to|another time|different time)/i,
            'Meeting Booked': /(?:meeting booked|booked|scheduled|confirmed|set up|locked in|calendar invite|appointment set)/i,
            'Held': /(?:held|meeting done|conversation had|discussed|walked through|presented)/i,
            'Pending': /(?:pending|waiting|undecided|thinking|considering|maybe|not sure)/i
        };
        
        for (const [status, pattern] of Object.entries(statusIndicators)) {
            if (pattern.test(text)) {
                // Check if it's a positive booking
                if (status === 'Meeting Booked' || status === 'Completed' || status === 'Held') {
                    result.confidence = 0.8;
                } else {
                    result.confidence = 0.65;
                }
                result.value = status;
                result.evidence = 'Status indicator found';
                return result;
            }
        }
        
        // Check for meeting confirmation
        if (text.match(/send (?:you|the) (?:details|invite|calendar|appointment)/i) ||
            text.match(/confirm/i)) {
            result.value = 'Meeting Booked';
            result.confidence = 0.7;
            result.evidence = 'Meeting booking confirmed';
        }
        
        return result;
    }

    _extractAssigned() {
        const result = { value: 'Daniel', confidence: 0.3, evidence: '' };
        const text = this.fullText;
        
        // Check for assigned agent mentions
        for (const member of PARSER_CONFIG.TEAM_MEMBERS) {
            if (text.match(new RegExp(`\\b${member}\\b`, 'i'))) {
                result.value = member;
                result.confidence = 0.7;
                result.evidence = `Assigned to ${member}`;
                return result;
            }
        }
        
        // Check for meeting booked assignment logic
        if (this.meetingDetails.booked) {
            // Alternate assignment for meeting bookings
            const meetingCount = this._getMeetingCount();
            result.value = meetingCount % 2 === 0 ? 'Kailan' : 'Seif';
            result.confidence = 0.5;
            result.evidence = 'Rotational assignment';
        }
        
        return result;
    }

    _extractNotes() {
        const result = { value: '', confidence: 0.6, evidence: '' };
        const lines = this.lines;
        const notes = [];
        
        // Extract key points from the conversation
        let hasWebsite = false;
        let hasSocialMedia = false;
        let wantsCallback = false;
        let emailProvided = false;
        let dateTimeSet = false;
        let discoveryStarted = false;
        
        for (const line of lines) {
            const lower = line.toLowerCase();
            
            // Check for website-related information
            if (lower.includes('website') || lower.includes('site')) {
                if (lower.includes('no') || lower.includes('not') || lower.includes('don\'t') || lower.includes('dont')) {
                    notes.push('No current website');
                    hasWebsite = false;
                } else if (lower.includes('free') || lower.includes('custom') || lower.includes('preview')) {
                    notes.push('Free custom website preview offered');
                    hasWebsite = true;
                } else {
                    notes.push('Website mentioned in conversation');
                    hasWebsite = true;
                }
            }
            
            // Check for social media
            if (lower.includes('social media') || lower.includes('facebook') || lower.includes('instagram') || lower.includes('google')) {
                notes.push('Business relies on social media and word-of-mouth');
                hasSocialMedia = true;
            }
            
            // Check for callback requests
            if (lower.includes('call back') || lower.includes('callback') || lower.includes('follow up') || lower.includes('follow-up')) {
                notes.push('Callback requested by prospect');
                wantsCallback = true;
            }
            
            // Check for email
            if (lower.includes('email') && !lower.includes('doesn\'t') && !lower.includes('does not') && !lower.includes('isn\'t')) {
                notes.push('Email captured for meeting invite');
                emailProvided = true;
            }
            
            // Check for date/time confirmation
            if (lower.includes('monday') || lower.includes('tuesday') || lower.includes('wednesday') || 
                lower.includes('thursday') || lower.includes('friday') || lower.includes('saturday') || lower.includes('sunday')) {
                notes.push('Appointment date confirmed');
                dateTimeSet = true;
            }
            if (lower.match(/\d{1,2}:\d{2}/) || lower.match(/\d{1,2}\s*(?:am|pm)/i)) {
                notes.push('Appointment time confirmed');
                dateTimeSet = true;
            }
            
            // Check for discovery
            if (lower.includes('goal') || lower.includes('want') || lower.includes('need') || 
                lower.includes('looking for') || lower.includes('help with')) {
                notes.push('Discovery started but deferred to manager walkthrough');
                discoveryStarted = true;
            }
        }
        
        // Add summary notes
        if (!hasWebsite && !hasSocialMedia) {
            notes.push('No current website or social media presence mentioned');
        }
        
        if (wantsCallback) {
            notes.push('Prospect requested callback');
        }
        
        if (!dateTimeSet) {
            notes.push('Date/time not explicitly confirmed in conversation');
        }
        
        // Build final notes string
        if (notes.length > 0) {
            // Remove duplicates
            const uniqueNotes = [...new Set(notes)];
            result.value = uniqueNotes.join('; ');
            result.confidence = 0.7;
            result.evidence = 'Extracted from conversation context';
        }
        
        return result;
    }

    _extractTags() {
        const result = { value: [], confidence: 0.4, evidence: '' };
        const text = this.fullText;
        const tags = [];
        
        // Tag patterns
        const tagPatterns = {
            'vip': /(?:vip|priority|important|key|major|top|high value)/i,
            'qualified_warm_call': /(?:qualified|warm call|good fit|ideal|perfect fit|qualified lead|interested|positive|great fit)/i,
            'high_interest': /(?:high interest|very interested|excited|enthusiastic|love it|great idea)/i,
            'decision_maker': /(?:owner|ceo|president|founder|director|decision maker|manager)/i,
            'callback_requested': /(?:callback|call back|return call|follow up|follow-up|next steps|schedule call|call me)/i,
            'referred': /(?:referred|reference|referral|recommended|suggested|from|sent by)/i,
            'no_website': /(?:no website|doesn['’]t have a website|needs website|wants website|website redesign|new site)/i,
            'negligent_warm_callback': /(?:negligent|unqualified|not interested|no interest|poor fit|bad fit|maybe)/i
        };
        
        for (const [tag, pattern] of Object.entries(tagPatterns)) {
            if (pattern.test(text)) {
                tags.push(tag);
            }
        }
        
        if (tags.length > 0) {
            result.value = tags;
            result.confidence = 0.55;
            result.evidence = 'Tags detected from conversation';
        }
        
        return result;
    }

    _extractSentiment() {
        const result = { value: 'Neutral', confidence: 0.4, evidence: '' };
        const text = this.fullText;
        
        // Sentiment patterns
        const sentimentPatterns = {
            'Very Positive': /(?:amazing|excellent|outstanding|fantastic|perfect|brilliant|incredible|wonderful|extraordinary|love it|great job|sounds perfect)/i,
            'Positive': /(?:great|good|nice|positive|happy|pleased|satisfied|impressed|interested|excited|enthusiastic|awesome|sounds good|like it|agree|absolutely)/i,
            'Neutral': /(?:okay|fine|alright|neutral|average|decent|moderate|standard|normal|not bad|so-so|maybe|perhaps|possibly)/i,
            'Negative': /(?:bad|poor|terrible|awful|horrible|disappointed|unhappy|frustrated|annoyed|irritated|not good|don't like|dislike)/i,
            'Very Negative': /(?:worst|horrible|disgusting|atrocious|abysmal|appalling|dreadful|unacceptable|never|hate|terrible)/i
        };
        
        let highestConfidence = 0;
        let detectedSentiment = 'Neutral';
        
        for (const [sentiment, pattern] of Object.entries(sentimentPatterns)) {
            if (pattern.test(text)) {
                const matches = text.match(pattern);
                if (matches) {
                    // Higher confidence if multiple matches
                    const count = matches.length;
                    const confidence = Math.min(0.9, 0.4 + (count * 0.1));
                    if (confidence > highestConfidence) {
                        highestConfidence = confidence;
                        detectedSentiment = sentiment;
                    }
                }
            }
        }
        
        if (highestConfidence > 0) {
            result.value = detectedSentiment;
            result.confidence = highestConfidence;
            result.evidence = 'Sentiment detected from conversation';
        }
        
        return result;
    }

    _extractCallSummary() {
        const result = { value: '', confidence: 0.5, evidence: '' };
        const lines = this.lines;
        const summaryParts = [];
        
        // Extract key conversation points
        let hasOffer = false;
        let hasInterest = false;
        let hasBooking = false;
        
        for (const line of lines) {
            const lower = line.toLowerCase();
            
            if (lower.includes('free') || lower.includes('custom') || lower.includes('preview') || lower.includes('website')) {
                if (!hasOffer) {
                    summaryParts.push('Offered free custom website preview');
                    hasOffer = true;
                }
            }
            
            if (lower.includes('interested') || lower.includes('great') || lower.includes('good') || lower.includes('like')) {
                if (!hasInterest) {
                    summaryParts.push('Prospect showed interest');
                    hasInterest = true;
                }
            }
            
            if (lower.includes('monday') || lower.includes('tuesday') || lower.includes('wednesday') || 
                lower.includes('thursday') || lower.includes('friday') || lower.includes('book') || lower.includes('schedule')) {
                if (!hasBooking) {
                    summaryParts.push('Meeting booked for follow-up');
                    hasBooking = true;
                }
            }
        }
        
        // Build summary
        if (summaryParts.length > 0) {
            result.value = summaryParts.join('. ') + '.';
            result.confidence = 0.6;
            result.evidence = 'Summary extracted from conversation';
        } else {
            // Fallback summary
            const firstLines = lines.slice(0, 3).join(' ');
            if (firstLines) {
                result.value = firstLines.substring(0, 150) + (firstLines.length > 150 ? '...' : '');
                result.confidence = 0.3;
                result.evidence = 'Fallback summary from first lines';
            }
        }
        
        return result;
    }

    _extractObjections() {
        const result = { value: [], confidence: 0.4, evidence: '' };
        const text = this.fullText;
        const objections = [];
        
        const objectionPatterns = [
            /(?:not interested|no thanks|don['’]t need|not right now)/i,
            /(?:too busy|don['’]t have time|busy right now|can['’]t talk|busy)/i,
            /(?:already have|already got|we already|currently have|already using)/i,
            /(?:too expensive|cost too much|price is high|budget|money)/i,
            /(?:call me back|not now|later|some other time)/i,
            /(?:send info|email me|just send|information)/i,
            /(?:who is this|how did you|where did you|why are you|unsolicited)/i
        ];
        
        for (const pattern of objectionPatterns) {
            if (pattern.test(text)) {
                const match = text.match(pattern);
                if (match) {
                    objections.push(match[0].trim());
                }
            }
        }
        
        // Remove duplicates
        const uniqueObjections = [...new Set(objections)];
        if (uniqueObjections.length > 0) {
            result.value = uniqueObjections;
            result.confidence = 0.5;
            result.evidence = 'Objections detected';
        }
        
        return result;
    }

    _calculateMeetingQuality() {
        const text = this.fullText;
        let score = 5; // Start at neutral
        
        // Check for positive indicators
        if (text.match(/great|good|nice|excellent|perfect|awesome|love|excited|interested/i)) {
            score += 2;
        }
        if (text.match(/booked|scheduled|confirmed|set up|calendar|invite/i)) {
            score += 2;
        }
        if (text.match(/email|contact|follow[- ]up|next steps/i)) {
            score += 1;
        }
        if (text.match(/website|preview|custom|free/i)) {
            score += 1;
        }
        
        // Check for negative indicators
        if (text.match(/not interested|no thanks|don't need|already have|busy/i)) {
            score -= 2;
        }
        if (text.match(/maybe|perhaps|possibly|not sure|think so/i)) {
            score -= 1;
        }
        if (text.match(/call back|another time|reschedule|later/i)) {
            score -= 1;
        }
        
        // Clamp score between 0 and 10
        return Math.max(0, Math.min(10, score));
    }

    _identifyMissingInfo() {
        const missing = [];
        const data = this.extractedData;
        
        if (!data.business || data.business === 'N/A') missing.push('Business Name');
        if (!data.name || data.name === 'N/A') missing.push('Contact Name');
        if (!data.phone || data.phone === 'N/A') missing.push('Phone Number');
        if (!data.email || data.email === 'N/A') missing.push('Email');
        if (!data.time || data.time === 'N/A') missing.push('Time');
        if (!data.role || data.role === 'N/A') missing.push('Role');
        
        return missing;
    }

    _calculateOverallConfidence(results) {
        let totalConfidence = 0;
        let count = 0;
        
        const fields = ['business', 'name', 'phone', 'email', 'date', 'time', 'status'];
        for (const field of fields) {
            if (results[field] && results[field].confidence > 0) {
                totalConfidence += results[field].confidence;
                count++;
            }
        }
        
        this.confidenceScores.overall = count > 0 ? totalConfidence / count : 0;
    }

    _buildOutput(results) {
        // Map fields to expected output structure
        const output = {
            business: results.business.value,
            name: results.name.value,
            role: results.role.value,
            phone: results.phone.value,
            email: results.email.value,
            date: results.date.value,
            time: results.time.value,
            status: results.status.value,
            assigned: results.assigned.value,
            notes: results.notes.value,
            tags: results.tags.value,
            sentiment: results.sentiment.value,
            callSummary: results.callSummary.value,
            detectedObjections: results.detectedObjections.value,
            meetingQualityScore: results.meetingQualityScore,
            missingInformation: results.missingInformation,
            confidence: this.confidenceScores.overall || 0.5,
            // Include confidence scores for debugging
            _confidence: {
                business: results.business.confidence,
                name: results.name.confidence,
                role: results.role.confidence,
                phone: results.phone.confidence,
                email: results.email.confidence,
                date: results.date.confidence,
                time: results.time.confidence,
                status: results.status.confidence,
                assigned: results.assigned.confidence,
                overall: this.confidenceScores.overall || 0.5
            },
            // Include evidence for debugging
            _evidence: {
                business: results.business.evidence,
                name: results.name.evidence,
                role: results.role.evidence,
                phone: results.phone.evidence,
                email: results.email.evidence,
                date: results.date.evidence,
                time: results.time.evidence,
                status: results.status.evidence,
                assigned: results.assigned.evidence
            }
        };
        
        // Store for reference
        this.extractedData = output;
        
        return output;
    }

    // ================================================================
    // HELPER FUNCTIONS
    // ================================================================

    _isPersonName(text) {
        const commonNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Robert', 'Mary', 'James', 'Patricia', 
                             'Daniel', 'Jennifer', 'Michael', 'Linda', 'William', 'Barbara', 'Richard', 'Susan', 
                             'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 
                             'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Helen', 'Donald', 'Sandra', 'Steven', 
                             'Donna', 'Paul', 'Carol', 'Andrew', 'Ruth', 'Joshua', 'Sharon', 'Kenneth', 'Michelle', 
                             'Kevin', 'Laura', 'Brian', 'Sarah', 'Timothy', 'Kimberly', 'Ronald', 'Deborah'];
        const name = text.trim();
        if (commonNames.includes(name)) return true;
        // Check if it's likely a name (starts with capital, 2+ chars, not all caps)
        if (name.length >= 2 && name.length <= 15 && /^[A-Z][a-z]+$/.test(name)) {
            return true;
        }
        return false;
    }

    _isBusinessName(text) {
        const businessIndicators = ['Services', 'Solutions', 'Products', 'Tech', 'Corp', 'Inc', 'LLC', 'Co', 
                                    'Company', 'Truck', 'Auto', 'Plumbing', 'Electrical', 'Roofing', 'Construction',
                                    'Cleaning', 'Consulting', 'Design', 'Media', 'Logistics', 'Transport', 'Freight',
                                    'Towing', 'Repair', 'Restoration', 'Remodeling', 'Landscaping', 'Painting',
                                    'Excavation', 'Paving', 'Concrete', 'Framing', 'Roofing', 'Siding', 'Windows',
                                    'Doors', 'Cabinets', 'Flooring', 'Masonry', 'HVAC', 'Security', 'Irrigation',
                                    'Maintenance', 'Solutions', 'Group', 'Holdings', 'Ventures', 'Partners'];
        const name = text.trim();
        for (const indicator of businessIndicators) {
            if (name.includes(indicator)) return true;
        }
        return false;
    }

    _getMeetingCount() {
        // This should be integrated with the main app's meeting count
        // For now, return a random number for testing
        return Math.floor(Math.random() * 10) + 1;
    }
}

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

// Create singleton instance
const transcriptParser = new TranscriptParser();

// Expose to window
window.TranscriptParser = TranscriptParser;
window.transcriptParser = transcriptParser;
window.PARSER_CONFIG = PARSER_CONFIG;

console.log('📝 Transcript Parser module loaded');
console.log('📝 Use transcriptParser.parse(transcript) to parse transcripts');

// ES Module support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TranscriptParser, transcriptParser, PARSER_CONFIG };
}