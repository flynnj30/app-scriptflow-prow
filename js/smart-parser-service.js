// ================================================================
// SMART TRANSCRIPT PARSER SERVICE
// Centralized CRM Extraction Engine
// ================================================================

class SmartParserService {
    constructor() {
        this.version = '3.0.0';
        this.confidenceThreshold = 0.6;
        
        // Entity extraction patterns
        this.patterns = {
            business: [
                /(?:business|company|organization|org|firm|brand|store|shop)[:\s]+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[,.\n]|$)/i,
                /(?:from|at|with|for)\s+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[,.\n]|$)/i,
                /(?:called|named)\s+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[,.\n]|$)/i,
                /is this\s+([A-Z][A-Za-z0-9\s&'\-.,]+?)(?:[?.,!]|$)/i
            ],
            name: [
                /(?:name|contact|client|customer|person|full name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
                /(?:from|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
                /(?:my name is|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
                /Prospect:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
            ],
            role: [
                /(?:role|title|position|job title|designation)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
                /(?:owner|manager|ceo|director|supervisor|team lead|president|founder|co-founder|administrator)/i
            ],
            phone: [
                /(?:phone|mobile|cell|telephone|number|call|contact)[:\s]+([+\d\s\-\(\)]{7,20})/i,
                /([+\d\s\-\(\)]{10,20})(?:\s*(?:is|was|will be|the|their|his|her))/i,
                /(\d{3}[-.]?\d{3}[-.]?\d{4})/,
                /\(\d{3}\)\s*\d{3}[-.]?\d{4}/
            ],
            email: [
                /([^\s@]+@[^\s@]+\.[^\s@]+)/,
                /(?:email|e-mail|mail|address)[:\s]+([^\s@]+@[^\s@]+\.[^\s@]+)/i
            ]
        };

        // Status detection patterns
        this.statusPatterns = {
            'Hot Transfer': /(?:hot transfer|hot lead|ready to transfer|transferring now|take it over|hand off|immediate transfer)/i,
            'Warm Callback': /(?:warm callback|call back|follow up|follow-up|callback|call me back|get back to|touch base|will call back)/i,
            'Meeting Booked': /(?:meeting booked|booked|scheduled|confirmed|set up|locked in|calendar invite|demo scheduled|walkthrough scheduled)/i,
            'Held': /(?:held|meeting done|conversation had|discussed|walked through|presented|call completed|demo completed)/i,
            'Completed': /(?:completed|done|finished|closed|wrapped up|finalized)/i,
            'Rescheduled': /(?:rescheduled|reschedule|postponed|pushed back|moved to|another time|new date)/i,
            'Canceled': /(?:canceled|cancelled|no show|didn't show|not interested|no longer|passed)/i,
            'Pending': /(?:pending|waiting|undecided|thinking|considering|maybe|will get back)/i
        };

        // Note patterns
        this.notePatterns = {
            websitePreview: /(?:created|made|prepared|built|designed).*(?:website preview|preview|demo|walkthrough|presentation)/i,
            noWebsite: /(?:don't have|doesn't have|no website|no site|no web presence|first website|needs website|wants website)/i,
            interestLevel: /(?:very interested|extremely interested|excited|enthusiastic|love it|like it|impressed|sounds good|great|perfect)/i,
            objection: /(?:not interested|no thanks|don't need|too busy|too expensive|already have|cost|price|budget|concerned|worried)/i,
            followUp: /(?:follow up|follow-up|next steps|schedule call|call me back|get back to|touch base|keep in touch)/i,
            decisionMaker: /(?:owner|ceo|president|founder|director|decision maker|manager|executive|i decide|i make decisions)/i
        };
    }

    parse(transcript, metadata = {}) {
        const startTime = Date.now();
        const cleanText = this._normalizeTranscript(transcript);
        const lines = cleanText.split('\n').filter(line => line.trim());
        const fullText = lines.join(' ');
        
        const result = {
            businessName: this._extractBusiness(fullText, lines) || '',
            name: this._extractName(fullText, lines) || '',
            role: this._extractRole(fullText) || 'Owner',
            phoneNumber: metadata.phone || this._extractPhone(fullText) || '',
            email: this._extractEmail(fullText) || '',
            appointment: this._extractAppointment(fullText, metadata.date),
            status: this._determineStatus(fullText),
            notes: [],
            tags: [],
            confidence: {},
            _raw: {
                transcript: transcript,
                cleanText: cleanText,
                fullText: fullText,
                lines: lines,
                parseTime: 0,
                wordCount: fullText.split(/\s+/).length
            }
        };
        
        result.notes = this._generateNotes(fullText, result);
        result.tags = this._generateTags(fullText, result);
        result.confidence = this._calculateConfidence(result);
        result._raw.parseTime = Date.now() - startTime;
        
        return result;
    }

    _normalizeTranscript(transcript) {
        if (!transcript) return '';
        return transcript
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\b(?:ur|your|you're)\b/gi, 'your')
            .replace(/\b(?:u|you)\b/gi, 'you')
            .replace(/\b(?:plz|please)\b/gi, 'please')
            .replace(/\b(?:thx|thanks|thanx)\b/gi, 'thanks')
            .replace(/\s+/g, ' ')
            .trim();
    }

    _extractBusiness(fullText, lines) {
        for (const pattern of this.patterns.business) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
                const value = match[1].trim();
                if (value && value.length > 1) return value;
            }
        }
        return null;
    }

    _extractName(fullText, lines) {
        for (const pattern of this.patterns.name) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
                const value = match[1].trim();
                if (value && value.length > 1) return value;
            }
        }
        return null;
    }

    _extractRole(fullText) {
        for (const pattern of this.patterns.role) {
            const match = fullText.match(pattern);
            if (match) {
                if (match[1]) {
                    const value = match[1].trim();
                    if (value && value.length > 1) return value;
                }
                const roleKeywords = ['owner', 'manager', 'ceo', 'director', 'supervisor', 'president', 'founder'];
                for (const role of roleKeywords) {
                    if (new RegExp(`\\b${role}\\b`, 'i').test(fullText)) {
                        return role.charAt(0).toUpperCase() + role.slice(1);
                    }
                }
            }
        }
        return 'Owner';
    }

    _extractPhone(fullText) {
        for (const pattern of this.patterns.phone) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
                const value = match[1].trim();
                const cleaned = value.replace(/[^+\d]/g, '');
                if (cleaned.length >= 10) return cleaned;
            }
        }
        return null;
    }

    _extractEmail(fullText) {
        for (const pattern of this.patterns.email) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
                const value = match[1].trim().toLowerCase();
                if (value && value.length > 5) return value;
            }
        }
        return null;
    }

    _extractAppointment(fullText, defaultDate) {
        const bookingKeywords = ['booked', 'schedule', 'meeting', 'call', 'demo', 'walkthrough', 'presentation', 'appointment'];
        const hasBookingIntent = bookingKeywords.some(word => fullText.toLowerCase().includes(word));
        
        if (!hasBookingIntent) {
            return { confirmed: false, datetime: null, timezone: null };
        }
        
        let datetime = this._parseDate(fullText, defaultDate);
        let timezone = this._detectTimezone(fullText);
        
        const confirmedPatterns = [
            /(?:booked|confirmed|scheduled|set up|locked in|calendar invite sent|meeting set)/i,
            /(?:i'll call|i will call|we'll call|we will call).*(?:at|on)/i,
            /(?:call you|call me|meet).*(?:at|on)/i
        ];
        
        const confirmed = confirmedPatterns.some(p => p.test(fullText));
        
        return {
            confirmed: confirmed || !!datetime,
            datetime: datetime,
            timezone: timezone
        };
    }

    _parseDate(fullText, defaultDate) {
        const datePatterns = [
            /(?:date|appointment|scheduled|meeting|call|day|on)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
            /(\d{1,2}\/\d{1,2}\/\d{4})/,
            /(\d{4}-\d{2}-\d{2})/,
            /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/,
            /\b(tomorrow|today|yesterday)\b/i,
            /(?:this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
        ];
        
        for (const pattern of datePatterns) {
            const match = fullText.match(pattern);
            if (match) {
                const dateStr = match[1] || match[0];
                const parsed = this._parseDateString(dateStr);
                if (parsed) return parsed;
            }
        }
        
        // Try to parse natural dates
        const now = new Date();
        if (/\btoday\b/i.test(fullText)) {
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }
        if (/\btomorrow\b/i.test(fullText)) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        }
        
        if (defaultDate) return defaultDate;
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

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

    _detectTimezone(fullText) {
        const zones = {
            'EST': 'America/New_York',
            'EDT': 'America/New_York',
            'PST': 'America/Los_Angeles',
            'PDT': 'America/Los_Angeles',
            'MST': 'America/Denver',
            'MDT': 'America/Denver',
            'CST': 'America/Chicago',
            'CDT': 'America/Chicago',
            'GMT': 'Europe/London',
            'UTC': 'UTC'
        };
        
        for (const [key, value] of Object.entries(zones)) {
            if (fullText.includes(key)) return value;
        }
        return 'America/New_York';
    }

    _determineStatus(fullText) {
        for (const [status, pattern] of Object.entries(this.statusPatterns)) {
            if (pattern.test(fullText)) return status;
        }
        return 'Pending';
    }

    _generateNotes(fullText, result) {
        const notes = [];
        const detected = [];
        
        for (const [key, pattern] of Object.entries(this.notePatterns)) {
            if (pattern.test(fullText)) detected.push(key);
        }
        
        const noteMap = {
            websitePreview: 'Free custom website preview presented.',
            noWebsite: 'No existing website confirmed.',
            interestLevel: 'Prospect expressed positive interest.',
            objection: 'Objections were raised during the conversation.',
            followUp: 'Follow-up actions were discussed.',
            decisionMaker: 'Prospect is the primary decision maker.'
        };
        
        for (const key of detected) {
            if (noteMap[key]) notes.push(noteMap[key]);
        }
        
        if (result.businessName && result.businessName !== '') {
            notes.push(`Business: ${result.businessName}`);
        }
        if (result.name && result.name !== '') {
            notes.push(`Contact: ${result.name}`);
        }
        if (result.status && result.status !== 'Pending') {
            notes.push(`Status: ${result.status}`);
        }
        
        return notes;
    }

    _generateTags(fullText, result) {
        const tags = [];
        if (result.status === 'Hot Transfer') tags.push('hot_lead');
        if (result.status === 'Meeting Booked') tags.push('meeting_scheduled');
        if (result.status === 'Warm Callback') tags.push('follow_up_needed');
        if (/vip|priority|important|key account/i.test(fullText)) tags.push('vip');
        if (/decision maker|owner|ceo|president|founder/i.test(fullText)) tags.push('decision_maker');
        if (/no website|needs website|new website/i.test(fullText)) tags.push('no_website');
        if (/interested|excited|enthusiastic|love it/i.test(fullText)) tags.push('high_interest');
        return tags.slice(0, 10);
    }

    _calculateConfidence(result) {
        const confidence = {
            businessName: 0,
            name: 0,
            role: 0,
            phoneNumber: 0,
            email: 0,
            appointment: 0,
            status: 0,
            overall: 0
        };
        
        if (result.businessName && result.businessName.length > 2) {
            confidence.businessName = Math.min(1, 0.5 + (result.businessName.length / 50));
        }
        if (result.name && result.name.length > 1) {
            confidence.name = Math.min(1, 0.5 + (result.name.length / 30));
        }
        if (result.phoneNumber && result.phoneNumber.length >= 10) {
            confidence.phoneNumber = 0.9;
        }
        if (result.email && result.email.includes('@')) {
            confidence.email = 0.95;
        }
        if (result.appointment && result.appointment.confirmed && result.appointment.datetime) {
            confidence.appointment = 0.85;
        }
        if (result.status && result.status !== 'Pending') {
            confidence.status = 0.7;
        }
        
        const weights = {
            businessName: 0.2,
            name: 0.2,
            phoneNumber: 0.15,
            email: 0.15,
            appointment: 0.15,
            status: 0.15
        };
        
        let total = 0;
        let weightSum = 0;
        for (const [key, weight] of Object.entries(weights)) {
            if (confidence[key] !== undefined) {
                total += confidence[key] * weight;
                weightSum += weight;
            }
        }
        confidence.overall = weightSum > 0 ? Math.round((total / weightSum) * 100) / 100 : 0;
        
        return confidence;
    }

    toCRMRecord(parsed) {
        return {
            businessName: parsed.businessName || '',
            contactName: parsed.name || '',
            role: parsed.role || 'Owner',
            phone: parsed.phoneNumber || '',
            email: parsed.email || '',
            date: parsed.appointment && parsed.appointment.datetime ? parsed.appointment.datetime : '',
            time: parsed.appointment && parsed.appointment.datetime ? this._formatTime(parsed.appointment.datetime) : '',
            status: parsed.status || 'Pending',
            notes: parsed.notes ? parsed.notes.join('\n') : '',
            tags: parsed.tags || [],
            timezone: parsed.appointment && parsed.appointment.timezone ? parsed.appointment.timezone : 'America/New_York',
            assigned: 'Daniel',
            confidence: parsed.confidence || {}
        };
    }

    _formatTime(datetime) {
        if (!datetime) return '';
        try {
            const date = new Date(datetime);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            }
        } catch (e) {}
        return '';
    }

    validate(parsed) {
        const errors = [];
        const warnings = [];
        if (!parsed.businessName || parsed.businessName === '') {
            errors.push('Business name is required');
        }
        if (!parsed.name || parsed.name === '') {
            errors.push('Contact name is required');
        }
        if (parsed.phoneNumber && parsed.phoneNumber.length < 10) {
            warnings.push('Phone number may be incomplete');
        }
        if (parsed.email && !parsed.email.includes('@')) {
            warnings.push('Email format may be invalid');
        }
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            confidence: parsed.confidence ? parsed.confidence.overall : 0
        };
    }
}

// Create singleton instance
const smartParser = new SmartParserService();

// Create transcriptParser alias for backward compatibility
const transcriptParser = smartParser;

// Expose globally
window.SmartParserService = SmartParserService;
window.smartParser = smartParser;
window.transcriptParser = transcriptParser;

console.log('Smart Parser Service initialized');
console.log(`Version: ${smartParser.version}`);
console.log('transcriptParser alias created for compatibility');