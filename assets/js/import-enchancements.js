// Smart Import Enhancements
class SmartImport {
    constructor() {
        this.parsedRecords = [];
        this.savedCount = 0;
        this.allSaved = false;
    }

    parseText(text) {
        const records = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        // Try to detect format
        const format = this.detectFormat(lines);
        
        switch(format) {
            case 'csv':
                return this.parseCSV(lines);
            case 'key-value':
                return this.parseKeyValue(lines);
            case 'bullet':
                return this.parseBulletPoints(lines);
            case 'transcript':
                return this.parseTranscript(text);
            default:
                return this.parseMixed(text);
        }
    }

    detectFormat(lines) {
        if (lines.length === 0) return 'mixed';
        
        // Check for CSV
        if (lines.some(line => line.includes(',') && line.split(',').length >= 3)) {
            return 'csv';
        }
        
        // Check for key-value
        if (lines.some(line => line.includes(':') || line.includes('='))) {
            return 'key-value';
        }
        
        // Check for bullet points
        if (lines.some(line => line.match(/^[\s]*[-*•]/))) {
            return 'bullet';
        }
        
        // Check for transcript-like format
        const transcriptKeywords = ['call', 'agent', 'customer', 'lead', 'hello', 'hi', 'thanks'];
        if (lines.some(line => transcriptKeywords.some(kw => line.toLowerCase().includes(kw)))) {
            return 'transcript';
        }
        
        return 'mixed';
    }

    parseCSV(lines) {
        const records = [];
        let headers = [];
        
        // Find header row
        for (let i = 0; i < Math.min(3, lines.length); i++) {
            const parts = lines[i].split(',').map(s => s.trim());
            if (parts.some(p => ['name', 'business', 'phone', 'email', 'date', 'time', 'status'].some(h => 
                p.toLowerCase().includes(h)
            ))) {
                headers = parts;
                // Process from next line
                for (let j = i + 1; j < lines.length; j++) {
                    const values = lines[j].split(',').map(s => s.trim());
                    const record = {};
                    headers.forEach((h, idx) => {
                        const key = h.toLowerCase().replace(/[^a-z]/g, '');
                        record[key] = values[idx] || '';
                    });
                    records.push(this.extractFields(record));
                }
                break;
            }
        }
        
        // If no headers found, try to parse as simple rows
        if (records.length === 0) {
            lines.forEach(line => {
                const values = line.split(',').map(s => s.trim());
                if (values.length >= 2) {
                    const record = {
                        business: values[0] || '',
                        contactName: values[1] || '',
                        phone: values[2] || '',
                        email: values[3] || '',
                        date: values[4] || '',
                        time: values[5] || '',
                        status: values[6] || 'Pending',
                        notes: values.slice(7).join(', ') || ''
                    };
                    records.push(this.extractFields(record));
                }
            });
        }
        
        return records;
    }

    parseKeyValue(lines) {
        const records = [];
        let currentRecord = {};
        
        lines.forEach(line => {
            const parts = line.split(/[:=]/);
            if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase();
                const value = parts.slice(1).join(':').trim();
                
                // If we have a record and this looks like a new record start
                if (key === 'business' || key === 'contact' || key === 'name') {
                    if (Object.keys(currentRecord).length > 0) {
                        records.push(this.extractFields(currentRecord));
                    }
                    currentRecord = {};
                }
                currentRecord[key] = value;
            }
        });
        
        if (Object.keys(currentRecord).length > 0) {
            records.push(this.extractFields(currentRecord));
        }
        
        return records;
    }

    parseBulletPoints(lines) {
        const records = [];
        let currentRecord = {};
        let currentKey = '';
        
        lines.forEach(line => {
            const clean = line.replace(/^[\s]*[-*•]\s*/, '').trim();
            if (!clean) return;
            
            // Check if this looks like a field
            if (clean.includes(':') || clean.includes('=')) {
                const parts = clean.split(/[:=]/);
                if (parts.length >= 2) {
                    const key = parts[0].trim().toLowerCase();
                    const value = parts.slice(1).join(':').trim();
                    
                    if (['business', 'contact', 'name', 'phone', 'email', 'date', 'time', 'status'].includes(key)) {
                        currentRecord[key] = value;
                    }
                }
            } else if (currentRecord.business && !currentRecord.contactName) {
                // First non-field line might be contact name
                currentRecord.contactName = clean;
            } else if (Object.keys(currentRecord).length > 0) {
                // Append to notes
                currentRecord.notes = (currentRecord.notes || '') + ' ' + clean;
            }
        });
        
        if (Object.keys(currentRecord).length > 0) {
            records.push(this.extractFields(currentRecord));
        }
        
        return records;
    }

    parseTranscript(text) {
        const records = [];
        let currentRecord = {};
        const lines = text.split('\n');
        
        // Extract business name
        const businessMatch = text.match(/(?:business|company|organization|firm)[\s:]+([^\n,]+)/i);
        if (businessMatch) {
            currentRecord.business = businessMatch[1].trim();
        }
        
        // Extract contact name
        const nameMatch = text.match(/(?:contact|person|customer|client|lead)[\s:]+([^\n,]+)/i);
        if (nameMatch) {
            currentRecord.contactName = nameMatch[1].trim();
        }
        
        // Extract phone
        const phoneMatch = text.match(/\(?\d{3}\)?[-.]?\s?\d{3}[-.]?\s?\d{4}/);
        if (phoneMatch) {
            currentRecord.phone = phoneMatch[0];
        }
        
        // Extract email
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
            currentRecord.email = emailMatch[0];
        }
        
        // Extract date
        const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
            currentRecord.date = dateMatch[0];
        }
        
        // Extract time
        const timeMatch = text.match(/\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)/);
        if (timeMatch) {
            currentRecord.time = timeMatch[0];
        }
        
        // Extract status from keywords
        const statusKeywords = ['hot transfer', 'warm callback', 'completed', 'pending', 'canceled', 'meeting booked'];
        for (const status of statusKeywords) {
            if (text.toLowerCase().includes(status)) {
                currentRecord.status = status.charAt(0).toUpperCase() + status.slice(1);
                break;
            }
        }
        
        // Extract notes - everything after "notes" or "comments"
        const notesMatch = text.match(/(?:notes|comments)[\s:]+([\s\S]+?)(?=\n\n|$)/i);
        if (notesMatch) {
            currentRecord.notes = notesMatch[1].trim();
        }
        
        if (Object.keys(currentRecord).length > 0) {
            records.push(this.extractFields(currentRecord));
        }
        
        return records;
    }

    parseMixed(text) {
        // Fallback parser - try to extract whatever we can
        const records = [];
        const lines = text.split('\n').filter(l => l.trim());
        
        let record = {};
        let currentField = '';
        
        lines.forEach(line => {
            const clean = line.trim();
            
            // Try to detect field patterns
            const fieldMatch = clean.match(/^([^:]+):\s*(.+)$/);
            if (fieldMatch) {
                const key = fieldMatch[1].trim().toLowerCase();
                const value = fieldMatch[2].trim();
                
                const fieldMap = {
                    'business': 'business',
                    'company': 'business',
                    'organization': 'business',
                    'name': 'contactName',
                    'contact': 'contactName',
                    'person': 'contactName',
                    'phone': 'phone',
                    'telephone': 'phone',
                    'email': 'email',
                    'date': 'date',
                    'time': 'time',
                    'status': 'status',
                    'role': 'role',
                    'notes': 'notes',
                    'comments': 'notes'
                };
                
                const mappedKey = fieldMap[key] || key;
                record[mappedKey] = value;
                currentField = mappedKey;
            } else if (currentField && clean) {
                // Append to current field
                record[currentField] = (record[currentField] || '') + ' ' + clean;
            }
        });
        
        if (Object.keys(record).length > 0) {
            records.push(this.extractFields(record));
        }
        
        return records;
    }

    extractFields(data) {
        const result = {
            business: data.business || data.company || data.organization || '',
            contactName: data.contactName || data.contact || data.name || data.person || '',
            phone: data.phone || data.telephone || '',
            email: data.email || '',
            date: data.date || '',
            time: data.time || '',
            status: this.normalizeStatus(data.status || 'Pending'),
            role: data.role || '',
            assigned: data.assigned || '',
            closer: data.closer || '',
            notes: data.notes || data.comments || '',
            tags: data.tags || '',
            crmLink: data.crmLink || data.link || data.url || '',
            _confidence: {}
        };
        
        // Calculate confidence for each field
        result._confidence = {
            business: this.calculateConfidence(result.business),
            contactName: this.calculateConfidence(result.contactName),
            phone: this.calculateConfidence(result.phone, 'phone'),
            email: this.calculateConfidence(result.email, 'email'),
            date: this.calculateConfidence(result.date, 'date'),
            time: this.calculateConfidence(result.time, 'time'),
            status: this.calculateConfidence(result.status)
        };
        
        return result;
    }

    calculateConfidence(value, type = 'text') {
        if (!value) return 'low';
        
        const trimmed = value.trim();
        if (!trimmed) return 'low';
        
        if (type === 'phone') {
            const digits = trimmed.replace(/\D/g, '');
            if (digits.length >= 10) return 'high';
            if (digits.length >= 7) return 'medium';
            return 'low';
        }
        
        if (type === 'email') {
            if (trimmed.includes('@') && trimmed.includes('.')) return 'high';
            if (trimmed.includes('@')) return 'medium';
            return 'low';
        }
        
        if (type === 'date') {
            const datePatterns = [
                /\d{1,2}\/\d{1,2}\/\d{4}/,
                /\d{4}-\d{2}-\d{2}/,
                /\w+\s+\d{1,2},?\s+\d{4}/
            ];
            if (datePatterns.some(p => p.test(trimmed))) return 'high';
            return 'medium';
        }
        
        if (type === 'time') {
            if (/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$/.test(trimmed)) return 'high';
            if (/^\d{1,2}:\d{2}$/.test(trimmed)) return 'medium';
            return 'low';
        }
        
        // General text confidence
        if (trimmed.length >= 10) return 'high';
        if (trimmed.length >= 5) return 'medium';
        return 'low';
    }

    normalizeStatus(status) {
        const statusMap = {
            'hot': 'Hot Transfer',
            'hot transfer': 'Hot Transfer',
            'warm': 'Warm Callback',
            'warm callback': 'Warm Callback',
            'done': 'Completed',
            'complete': 'Completed',
            'completed': 'Completed',
            'pending': 'Pending',
            'cancel': 'Canceled',
            'cancelled': 'Canceled',
            'canceled': 'Canceled',
            'meeting': 'Meeting Booked',
            'booked': 'Meeting Booked',
            'reschedule': 'Rescheduled',
            'rescheduled': 'Rescheduled'
        };
        
        const normalized = status.toLowerCase().trim();
        return statusMap[normalized] || status;
    }

    validateRecord(record) {
        const errors = [];
        
        if (!record.business || record.business.trim().length < 2) {
            errors.push('Business name is required');
        }
        
        if (!record.contactName || record.contactName.trim().length < 2) {
            errors.push('Contact name is required');
        }
        
        if (record.phone && record.phone.replace(/\D/g, '').length < 7) {
            errors.push('Phone number appears incomplete');
        }
        
        if (record.email && !record.email.includes('@')) {
            errors.push('Email appears invalid');
        }
        
        if (!record.date) {
            errors.push('Date is required');
        }
        
        if (!record.time) {
            errors.push('Time is required');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    detectDuplicate(record, existingRecords) {
        if (!existingRecords || existingRecords.length === 0) return false;
        
        const business = record.business?.toLowerCase().trim() || '';
        const phone = record.phone?.replace(/\D/g, '') || '';
        
        return existingRecords.some(existing => {
            const existingBusiness = existing.business?.toLowerCase().trim() || '';
            const existingPhone = existing.phone?.replace(/\D/g, '') || '';
            
            // Check business name match (fuzzy)
            if (business && existingBusiness) {
                const bizMatch = business.includes(existingBusiness) || existingBusiness.includes(business);
                if (bizMatch) return true;
            }
            
            // Check phone match
            if (phone && existingPhone && phone === existingPhone) {
                return true;
            }
            
            return false;
        });
    }
}

// Create global instance
window.SmartImport = SmartImport;
window.smartImport = new SmartImport();