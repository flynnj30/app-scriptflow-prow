// ================================================================
// CALENDAR ICS INTEGRATION - External Meetings Importer
// ================================================================

const CalendarICSIntegration = {
    // Configuration
    timezone: 'America/Chicago',
    autoSync: false,
    syncInterval: null,
    externalMeetings: [],
    lastSync: null,
    isProcessing: false,

    /**
     * Initialize the ICS integration module
     */
    init: function(config = {}) {
        this.timezone = config.timezone || this.timezone;
        this.autoSync = config.autoSync || false;
        
        console.log('📅 Calendar ICS Integration initialized');
        this.injectStyles();
        this.setupUI();
        
        if (this.autoSync) {
            this.startAutoSync(config.syncInterval || 300000);
        }
        
        return this;
    },

    /**
     * Setup UI event listeners
     */
    setupUI: function() {
        // ICS Import button in top bar
        const icsImportBtn = document.getElementById('icsImportBtn');
        if (icsImportBtn) {
            icsImportBtn.addEventListener('click', () => this.openImportModal());
        }
        
        // Modal events
        const fetchBtn = document.getElementById('icsFetchBtn');
        if (fetchBtn) {
            fetchBtn.addEventListener('click', () => this.handleFetchImport());
        }
        
        const closeBtn = document.getElementById('icsCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeImportModal());
        }
        
        // Close on overlay click
        const modal = document.getElementById('icsImportModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeImportModal();
            });
        }
    },

    /**
     * Open the import modal
     */
    openImportModal: function() {
        const modal = document.getElementById('icsImportModal');
        if (modal) {
            modal.style.display = 'flex';
            // Reset results
            document.getElementById('icsImportResults').style.display = 'none';
            document.getElementById('icsImportProgress').style.display = 'none';
            document.getElementById('icsImportStats').innerHTML = '';
            document.getElementById('icsImportedEvents').innerHTML = '';
        }
    },

    /**
     * Close the import modal
     */
    closeImportModal: function() {
        const modal = document.getElementById('icsImportModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * Handle fetch and import
     */
    handleFetchImport: async function() {
        if (this.isProcessing) return;
        
        const urlInput = document.getElementById('icsUrlInput');
        const url = urlInput ? urlInput.value.trim() : '';
        
        if (!url) {
            showToast('Please enter a valid ICS URL', 'warning');
            return;
        }
        
        const createProspect = document.getElementById('icsCreateProspect')?.checked || true;
        const updateExisting = document.getElementById('icsUpdateExisting')?.checked || false;
        
        this.isProcessing = true;
        
        // Show progress
        const progressContainer = document.getElementById('icsImportProgress');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
        this.updateProgress(10, 'Fetching calendar data...');
        
        try {
            // Try to fetch the ICS file
            const events = await this.fetchICS(url);
            
            if (!events || events.length === 0) {
                this.updateProgress(100, 'No events found in calendar');
                showToast('No events found in the calendar', 'warning');
                this.isProcessing = false;
                return;
            }
            
            this.updateProgress(50, `Found ${events.length} events. Importing...`);
            
            // Import the events
            const result = this.importMeetings(events, {
                updateExisting: updateExisting,
                createProspect: createProspect,
                defaultStatus: 'Meeting Booked',
                source: 'Calendar Import'
            });
            
            this.updateProgress(100, 'Import complete!');
            
            // Show results
            this.showImportResults(result, events);
            
            showToast(`Imported ${result.imported} meeting(s)!`, 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            showToast('Failed to import calendar: ' + error.message, 'error');
        } finally {
            this.isProcessing = false;
            setTimeout(() => {
                const progressContainer = document.getElementById('icsImportProgress');
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
            }, 2000);
        }
    },

    /**
     * Update import progress
     */
    updateProgress: function(percent, message) {
        const bar = document.getElementById('icsProgressBar');
        const status = document.getElementById('icsProgressStatus');
        
        if (bar) {
            bar.style.width = Math.min(percent, 100) + '%';
        }
        if (status && message) {
            status.textContent = message;
        }
    },

    /**
     * Show import results
     */
    showImportResults: function(result, events) {
        const resultsContainer = document.getElementById('icsImportResults');
        const statsContainer = document.getElementById('icsImportStats');
        const eventsContainer = document.getElementById('icsImportedEvents');
        
        if (!resultsContainer || !statsContainer || !eventsContainer) return;
        
        resultsContainer.style.display = 'block';
        
        // Stats
        statsContainer.innerHTML = `
            <div class="ics-stat">
                <div class="stat-number" style="color:var(--success);">${result.imported}</div>
                <div class="stat-label">✅ Imported</div>
            </div>
            <div class="ics-stat">
                <div class="stat-number" style="color:var(--warning);">${result.skipped}</div>
                <div class="stat-label">⏭️ Skipped</div>
            </div>
            <div class="ics-stat">
                <div class="stat-number" style="color:var(--danger);">${result.errors}</div>
                <div class="stat-label">❌ Errors</div>
            </div>
            <div class="ics-stat">
                <div class="stat-number">${events.length}</div>
                <div class="stat-label">📋 Total Events</div>
            </div>
        `;
        
        // Imported events list
        if (result.importedEvents && result.importedEvents.length > 0) {
            let eventsHtml = '<div style="font-weight:600; margin-bottom:8px;">Imported Meetings:</div>';
            result.importedEvents.forEach(item => {
                const appt = item.appointment;
                eventsHtml += `
                    <div class="ics-imported-event">
                        <span class="event-title">${Utils.escapeHtml(appt.business)}</span>
                        <span class="event-date">${Utils.formatDate(appt.date)} ${appt.time || ''}</span>
                    </div>
                `;
            });
            eventsContainer.innerHTML = eventsHtml;
        } else {
            eventsContainer.innerHTML = '<div style="color:var(--text-muted); padding:8px;">No events were imported</div>';
        }
    },

    /**
     * Fetch and parse an ICS file from a URL
     */
    fetchICS: async function(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            return this.parseICS(text);
        } catch (error) {
            console.error('Error fetching ICS file:', error);
            // Try to parse as text if fetch fails
            if (url.startsWith('data:text/calendar')) {
                const text = url.replace(/^data:text\/calendar[^,]*,/, '');
                return this.parseICS(decodeURIComponent(text));
            }
            throw error;
        }
    },

    /**
     * Parse ICS text content into structured data
     */
    parseICS: function(icsText) {
        const events = [];
        const lines = icsText.split(/\r?\n/);
        let currentEvent = null;
        let inEvent = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === 'BEGIN:VEVENT') {
                inEvent = true;
                currentEvent = {};
                continue;
            }
            
            if (line === 'END:VEVENT') {
                inEvent = false;
                if (currentEvent) {
                    const parsedEvent = this.normalizeEvent(currentEvent);
                    if (parsedEvent) {
                        events.push(parsedEvent);
                    }
                }
                currentEvent = null;
                continue;
            }
            
            if (inEvent && currentEvent) {
                // Handle multi-line values (folded lines)
                let value = line;
                while (i + 1 < lines.length && lines[i + 1].startsWith(' ')) {
                    i++;
                    value += lines[i].trim();
                }
                
                const colonIndex = value.indexOf(':');
                if (colonIndex !== -1) {
                    const key = value.substring(0, colonIndex).trim();
                    const val = value.substring(colonIndex + 1).trim();
                    currentEvent[key] = val;
                }
            }
        }
        
        return events;
    },

    /**
     * Normalize and clean up event data
     */
    normalizeEvent: function(rawEvent) {
        if (!rawEvent || !rawEvent['SUMMARY']) {
            return null;
        }
        
        // Parse dates
        let startDate = null;
        let endDate = null;
        let startTime = '';
        let endTime = '';
        
        if (rawEvent['DTSTART']) {
            const parsed = this.parseICSDate(rawEvent['DTSTART']);
            startDate = parsed.date;
            startTime = parsed.time;
        }
        
        if (rawEvent['DTEND']) {
            const parsed = this.parseICSDate(rawEvent['DTEND']);
            endDate = parsed.date;
            endTime = parsed.time;
        }
        
        // Extract contact information
        const summary = rawEvent['SUMMARY'] || '';
        const description = rawEvent['DESCRIPTION'] || '';
        const location = rawEvent['LOCATION'] || '';
        const organizer = rawEvent['ORGANIZER'] || '';
        const attendees = rawEvent['ATTENDEE'] || '';
        
        // Parse contact details from summary/description
        const contactInfo = this.extractContactInfo(summary, description);
        
        return {
            id: rawEvent['UID'] || Date.now().toString(),
            summary: summary,
            description: description,
            location: location,
            organizer: organizer,
            attendees: attendees,
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
            status: rawEvent['STATUS'] || 'CONFIRMED',
            created: rawEvent['CREATED'] || null,
            lastModified: rawEvent['LAST-MODIFIED'] || null,
            contact: contactInfo,
            raw: rawEvent,
            source: 'external_ics',
            isExternal: true
        };
    },

    /**
     * Parse ICS date format: 20250114T150000Z
     */
    parseICSDate: function(dateStr) {
        if (!dateStr) return { date: null, time: '' };
        
        let cleaned = dateStr.replace(/Z$/, '');
        // Format: YYYYMMDDTHHMMSS
        const match = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
        
        if (match) {
            const year = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;
            const day = parseInt(match[3]);
            const hour = parseInt(match[4]);
            const minute = parseInt(match[5]);
            const second = parseInt(match[6]);
            
            const date = new Date(year, month, day, hour, minute, second);
            const dateStrFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const timeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            
            return {
                date: dateStrFormatted,
                time: timeFormatted,
                dateObj: date
            };
        }
        
        // Try parsing as simple date (YYYYMMDD)
        const simpleMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})$/);
        if (simpleMatch) {
            const year = parseInt(simpleMatch[1]);
            const month = parseInt(simpleMatch[2]) - 1;
            const day = parseInt(simpleMatch[3]);
            const date = new Date(year, month, day);
            const dateStrFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            return {
                date: dateStrFormatted,
                time: '',
                dateObj: date
            };
        }
        
        return { date: dateStr, time: '' };
    },

    /**
     * Extract contact info from summary and description
     */
    extractContactInfo: function(summary, description) {
        const info = {
            name: null,
            business: null,
            phone: null,
            email: null,
            notes: null
        };
        
        // Try to extract name from summary
        const nameMatch = summary.match(/^(?:Meeting|Call|Appointment|Discussion|with)\s+(?:with|for|-\s*)?([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
        if (nameMatch) {
            info.name = nameMatch[1].trim();
        } else {
            // Try to extract name from "with" pattern
            const withMatch = summary.match(/\s+with\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
            if (withMatch) {
                info.name = withMatch[1].trim();
            }
        }
        
        // Try to extract business from summary
        const businessMatch = summary.match(/(?:with|for|-\s*)([A-Z][a-zA-Z0-9\s&]+?)(?:\s+-\s+|\s+\(|$)/);
        if (businessMatch && businessMatch[1] && !businessMatch[1].toLowerCase().includes('meeting')) {
            info.business = businessMatch[1].trim();
        }
        
        // Look for phone in description
        const phoneMatch = description.match(/(?:phone|call|number|tel)[:\s]+([+\d\s\-\(\)]{7,20})/i);
        if (phoneMatch) {
            info.phone = phoneMatch[1].trim();
        }
        
        // Look for email in description
        const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) {
            info.email = emailMatch[1].trim();
        }
        
        // Store description as notes
        if (description && description.length > 0) {
            info.notes = description.substring(0, 500);
        }
        
        return info;
    },

    /**
     * Import external meetings into the calendar
     */
    importMeetings: function(events, options = {}) {
        const {
            updateExisting = false,
            createProspect = true,
            defaultStatus = 'Meeting Booked',
            source = 'Calendar Import'
        } = options;
        
        if (!events || events.length === 0) {
            return { imported: 0, skipped: 0, errors: 0, importedEvents: [] };
        }
        
        let imported = 0;
        let skipped = 0;
        let errors = 0;
        const importedEvents = [];
        
        events.forEach(event => {
            try {
                // Check if event already exists
                const existing = this.findExistingEvent(event);
                
                if (existing && !updateExisting) {
                    skipped++;
                    return;
                }
                
                // Prepare appointment data
                const apptData = {
                    date: event.startDate || Utils.getTodayStr(),
                    business: event.contact.business || this.extractBusinessFromSummary(event.summary) || 'External Meeting',
                    contactName: event.contact.name || this.extractNameFromSummary(event.summary) || 'Unknown Contact',
                    role: 'Contact',
                    phone: event.contact.phone || '',
                    time: event.startTime || '',
                    notes: this.buildNotes(event),
                    assigned: 'Daniel',
                    status: defaultStatus,
                    tags: ['imported', 'external'],
                    email: event.contact.email || ''
                };
                
                // Check if prospect exists
                let prospectId = null;
                if (createProspect && AppState.prospectManagerReady && AppState.prospectManager) {
                    prospectId = this.findOrCreateProspect(event);
                }
                
                // Add appointment
                const result = Data.addAppointment(
                    apptData.date,
                    apptData.business,
                    apptData.contactName,
                    apptData.role,
                    apptData.phone,
                    apptData.time,
                    apptData.notes + (prospectId ? `\nProspect ID: ${prospectId}` : ''),
                    apptData.assigned,
                    null,
                    apptData.status,
                    '',
                    apptData.tags
                );
                
                if (result) {
                    imported++;
                    importedEvents.push({
                        event: event,
                        appointment: result,
                        prospectId: prospectId
                    });
                } else {
                    errors++;
                }
            } catch (error) {
                console.error('Error importing event:', error);
                errors++;
            }
        });
        
        // Refresh views
        if (typeof FeaturePanel !== 'undefined') {
            FeaturePanel.refreshCurrentView();
        }
        Stats.updateAll();
        
        return { imported, skipped, errors, importedEvents };
    },

    /**
     * Extract business name from summary
     */
    extractBusinessFromSummary: function(summary) {
        if (!summary) return null;
        
        const patterns = [
            /(?:with|for|-\s*)([A-Z][a-zA-Z0-9\s&]+?)(?:\s+-\s+|\s+\(|$)/,
            /(?:Company|Business|Corp|Inc|LLC|Ltd|Agency|Studio|Designs|Solutions|Services|Consulting|Group|Partners|&|Associates)/i
        ];
        
        for (const pattern of patterns) {
            const match = summary.match(pattern);
            if (match && match[1] && !match[1].toLowerCase().includes('meeting')) {
                return match[1].trim();
            }
        }
        return null;
    },

    /**
     * Extract name from summary
     */
    extractNameFromSummary: function(summary) {
        if (!summary) return null;
        
        const patterns = [
            /^(?:Meeting|Call|Appointment|Discussion|with)\s+(?:with|for|-\s*)?([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
            /\s+with\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
            /-\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i
        ];
        
        for (const pattern of patterns) {
            const match = summary.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return null;
    },

    /**
     * Find existing event by UID
     */
    findExistingEvent: function(event) {
        if (!event || !event.id) return null;
        
        const allAppointments = Data.getAllAppointments();
        return allAppointments.find(a => 
            a.externalId === event.id || 
            (a.notes && a.notes.includes(`UID: ${event.id}`))
        ) || null;
    },

    /**
     * Find or create a prospect from event data
     */
    findOrCreateProspect: function(event) {
        if (!AppState.prospectManager) return null;
        
        const contact = event.contact;
        const name = contact.name || this.extractNameFromSummary(event.summary) || 'Unknown';
        const business = contact.business || this.extractBusinessFromSummary(event.summary) || name + '\'s Business';
        
        // Search for existing prospect
        try {
            const prospects = AppState.prospectManager.getAll();
            const existing = prospects.find(p => {
                const nameMatch = p.name && name && p.name.toLowerCase() === name.toLowerCase();
                const emailMatch = p.email && contact.email && p.email.toLowerCase() === contact.email.toLowerCase();
                const phoneMatch = p.phone && contact.phone && p.phone.replace(/[^\d+]/g, '') === contact.phone.replace(/[^\d+]/g, '');
                return nameMatch || emailMatch || phoneMatch;
            });
            
            if (existing) {
                return existing.id;
            }
        } catch (error) {
            console.warn('Error searching for prospect:', error);
        }
        
        // Create new prospect
        try {
            const newProspect = AppState.prospectManager.create({
                name: name,
                business: business,
                phone: contact.phone || '',
                email: contact.email || '',
                notes: `Imported from calendar: ${event.summary}\n${event.description || ''}`,
                source: 'Calendar Import',
                tags: ['imported', 'external']
            });
            
            return newProspect.id;
        } catch (error) {
            console.warn('Failed to create prospect:', error);
            return null;
        }
    },

    /**
     * Build notes from event data
     */
    buildNotes: function(event) {
        let notes = '';
        
        if (event.summary) {
            notes += `Meeting: ${event.summary}\n`;
        }
        if (event.description) {
            notes += `Description: ${event.description}\n`;
        }
        if (event.location) {
            notes += `Location: ${event.location}\n`;
        }
        if (event.organizer) {
            notes += `Organizer: ${event.organizer}\n`;
        }
        if (event.attendees) {
            notes += `Attendees: ${event.attendees}\n`;
        }
        if (event.id) {
            notes += `UID: ${event.id}\n`;
        }
        if (event.contact.phone) {
            notes += `Phone: ${event.contact.phone}\n`;
        }
        if (event.contact.email) {
            notes += `Email: ${event.contact.email}\n`;
        }
        if (event.startDate) {
            notes += `Start Date: ${event.startDate} ${event.startTime || ''}\n`;
        }
        if (event.endDate) {
            notes += `End Date: ${event.endDate} ${event.endTime || ''}\n`;
        }
        notes += `Source: External Calendar Import\n`;
        
        return notes.trim();
    },

    /**
     * Start auto-sync for external calendars
     */
    startAutoSync: function(interval = 300000) {
        if (this.syncInterval) {
            this.stopAutoSync();
        }
        
        this.autoSync = true;
        this.syncInterval = setInterval(() => {
            this.syncAllCalendars();
        }, interval);
        
        console.log(`🔄 Auto-sync started (every ${interval/1000}s)`);
    },

    /**
     * Stop auto-sync
     */
    stopAutoSync: function() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.autoSync = false;
        console.log('🔄 Auto-sync stopped');
    },

    /**
     * Sync all registered calendars
     */
    syncAllCalendars: async function() {
        const calendars = this.getRegisteredCalendars();
        for (const cal of calendars) {
            try {
                await this.syncCalendar(cal.url, cal.options);
            } catch (error) {
                console.error(`Error syncing calendar "${cal.name}":`, error);
            }
        }
    },

    /**
     * Register a calendar URL for syncing
     */
    registerCalendar: function(name, url, options = {}) {
        const calendars = JSON.parse(localStorage.getItem('external_calendars') || '[]');
        // Check if already exists
        const existing = calendars.find(c => c.name === name);
        if (existing) {
            existing.url = url;
            existing.options = options;
        } else {
            calendars.push({ name, url, options, lastSync: null });
        }
        localStorage.setItem('external_calendars', JSON.stringify(calendars));
        console.log(`📅 Calendar "${name}" registered`);
        return true;
    },

    /**
     * Get all registered calendars
     */
    getRegisteredCalendars: function() {
        return JSON.parse(localStorage.getItem('external_calendars') || '[]');
    },

    /**
     * Remove a registered calendar
     */
    removeCalendar: function(name) {
        let calendars = JSON.parse(localStorage.getItem('external_calendars') || '[]');
        calendars = calendars.filter(c => c.name !== name);
        localStorage.setItem('external_calendars', JSON.stringify(calendars));
        console.log(`📅 Calendar "${name}" removed`);
        return true;
    },

    /**
     * Sync a specific calendar by URL
     */
    syncCalendar: async function(url, options = {}) {
        try {
            const events = await this.fetchICS(url);
            if (events && events.length > 0) {
                return this.importMeetings(events, options);
            }
            return { imported: 0, skipped: 0, errors: 1, importedEvents: [] };
        } catch (error) {
            console.error('Error syncing calendar:', error);
            return { imported: 0, skipped: 0, errors: 1, importedEvents: [] };
        }
    },

    /**
     * Import from a data URL (for manual paste)
     */
    importFromDataUrl: function(dataUrl, options = {}) {
        try {
            const text = decodeURIComponent(dataUrl.replace(/^data:text\/calendar[^,]*,/, ''));
            const events = this.parseICS(text);
            return this.importMeetings(events, options);
        } catch (error) {
            console.error('Error importing from data URL:', error);
            return { imported: 0, skipped: 0, errors: 1, importedEvents: [] };
        }
    },

    /**
     * Inject styles for the calendar integration
     */
    injectStyles: function() {
        if (document.getElementById('calendar-ics-styles')) return;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'calendar-ics-styles';
        styleEl.textContent = `
            /* Calendar Integration Styles */
            .ics-import-section {
                padding: 16px;
                background: var(--bg-card);
                border-radius: 12px;
                border: 1px solid var(--border-color);
                margin-bottom: 16px;
            }
            
            .ics-import-section h4 {
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .ics-url-input-group {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .ics-url-input-group input {
                flex: 1;
                min-width: 200px;
                padding: 8px 12px;
                border-radius: 10px;
                border: 1px solid var(--border-color);
                background: var(--bg-primary);
                color: var(--text-primary);
                font-size: 0.85rem;
            }
            
            .ics-url-input-group input:focus {
                outline: 2px solid var(--primary);
                border-color: var(--primary);
            }
            
            .ics-import-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 8px;
                margin-top: 12px;
            }
            
            .ics-stat {
                text-align: center;
                padding: 8px;
                background: var(--bg-primary);
                border-radius: 8px;
            }
            
            .ics-stat .stat-number {
                font-size: 1.2rem;
                font-weight: 700;
            }
            
            .ics-stat .stat-label {
                font-size: 0.65rem;
                color: var(--text-muted);
            }
            
            .ics-imported-events {
                margin-top: 12px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .ics-imported-event {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: var(--bg-primary);
                border-radius: 8px;
                margin-bottom: 4px;
                border-left: 3px solid var(--success);
            }
            
            .ics-imported-event .event-title {
                font-weight: 500;
                font-size: 0.85rem;
            }
            
            .ics-imported-event .event-date {
                font-size: 0.75rem;
                color: var(--text-muted);
            }
        `;
        document.head.appendChild(styleEl);
    }
};

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

window.CalendarICSIntegration = CalendarICSIntegration;

console.log('📅 Calendar ICS Integration module loaded');