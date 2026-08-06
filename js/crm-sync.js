// ================================================================
// CRM SYNC SERVICE
// ================================================================

class CRMSyncService {
    constructor() {
        this.version = '1.0.0';
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.syncStats = { total: 0, created: 0, updated: 0, failed: 0 };
    }

    async importTranscript(transcript, options = {}) {
        try {
            this.syncInProgress = true;
            const startTime = Date.now();
            
            const metadata = {
                phone: options.phone || null,
                date: options.date || null,
                source: options.source || 'Smart Import'
            };
            
            const parsed = smartParser.parse(transcript, metadata);
            const validation = smartParser.validate(parsed);
            
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            const crmRecord = smartParser.toCRMRecord(parsed);
            const contact = await this._upsertContact(crmRecord);
            
            let appointment = null;
            if (parsed.appointment && parsed.appointment.confirmed) {
                appointment = await this._createAppointment(contact, parsed, crmRecord);
            }
            
            await this._updateAnalytics(parsed, contact, appointment);
            await this._updatePipeline(parsed, contact);
            
            this.syncStats.total++;
            this.syncStats.updated++;
            this.lastSyncTime = new Date();
            this.syncInProgress = false;
            
            return {
                success: true,
                parsed: parsed,
                contact: contact,
                appointment: appointment,
                crmRecord: crmRecord,
                validation: validation,
                syncTime: Date.now() - startTime,
                warnings: validation.warnings
            };
            
        } catch (error) {
            console.error('CRM Import Error:', error);
            this.syncStats.failed++;
            this.syncInProgress = false;
            return { success: false, error: error.message, parsed: null, contact: null, appointment: null };
        }
    }

    async _upsertContact(crmRecord) {
        const existingContacts = Data.getAllAppointments();
        let existing = null;
        
        for (const appt of existingContacts) {
            if (appt.business && crmRecord.businessName && 
                appt.business.toLowerCase().trim() === crmRecord.businessName.toLowerCase().trim()) {
                existing = appt;
                break;
            }
            if (appt.phone && crmRecord.phone && 
                appt.phone.replace(/[^\d+]/g, '') === crmRecord.phone.replace(/[^\d+]/g, '')) {
                existing = appt;
                break;
            }
        }
        
        if (existing) {
            const updates = {
                business: crmRecord.businessName || existing.business,
                contactName: crmRecord.contactName || existing.contactName,
                role: crmRecord.role || existing.role,
                phone: crmRecord.phone || existing.phone,
                email: crmRecord.email || existing.email,
                notes: crmRecord.notes || existing.notes,
                tags: crmRecord.tags || existing.tags,
                updatedAt: new Date().toISOString()
            };
            Data.updateAppointment(existing.date, existing.id, updates);
            return { ...existing, ...updates, id: existing.id, isNew: false };
        } else {
            const newAppt = Data.addAppointment(
                crmRecord.date || Utils.getTodayStr(),
                crmRecord.businessName || 'Unknown Business',
                crmRecord.contactName || 'Unknown Contact',
                crmRecord.role || 'Owner',
                crmRecord.phone || '',
                crmRecord.time || '',
                crmRecord.notes || '',
                crmRecord.assigned || 'Daniel',
                null,
                crmRecord.status || 'Pending',
                '',
                crmRecord.tags || []
            );
            this.syncStats.created++;
            return { ...newAppt, isNew: true };
        }
    }

    async _createAppointment(contact, parsed, crmRecord) {
        if (!parsed.appointment || !parsed.appointment.confirmed) return null;
        
        const appointmentDate = parsed.appointment.datetime || Utils.getTodayStr();
        const appointmentTime = this._formatTimeForDisplay(parsed.appointment.datetime);
        
        const existingAppointments = Data.getAllAppointments();
        let existing = null;
        
        for (const appt of existingAppointments) {
            if (appt.contactName === contact.contactName && 
                appt.business === contact.business &&
                appt.date === appointmentDate) {
                existing = appt;
                break;
            }
        }
        
        if (existing) {
            const updates = {
                time: appointmentTime || existing.time,
                status: 'Meeting Booked',
                notes: (existing.notes || '') + '\n' + (crmRecord.notes || ''),
                updatedAt: new Date().toISOString()
            };
            Data.updateAppointment(existing.date, existing.id, updates);
            return { ...existing, ...updates, isNew: false };
        } else {
            const newAppt = Data.addAppointment(
                appointmentDate,
                contact.business,
                contact.contactName,
                contact.role || 'Owner',
                contact.phone || '',
                appointmentTime || '',
                crmRecord.notes || '',
                contact.assigned || 'Daniel',
                null,
                'Meeting Booked',
                '',
                crmRecord.tags || []
            );
            this.syncStats.created++;
            return { ...newAppt, isNew: true };
        }
    }

    _formatTimeForDisplay(datetime) {
        if (!datetime) return '';
        try {
            const date = new Date(datetime);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            }
        } catch (e) {}
        return '';
    }

    async _updateAnalytics(parsed, contact, appointment) {
        try {
            Stats.updateAll();
            if (appointment) {
                const meetingStats = Stats.getMeetingStats();
                if (typeof FeaturePanel !== 'undefined') {
                    FeaturePanel.refreshCurrentView();
                }
            }
            console.log('Analytics updated:', {
                contact: contact.contactName,
                status: parsed.status,
                appointment: appointment ? 'Created' : 'Not created'
            });
        } catch (error) {
            console.warn('Analytics update error:', error);
        }
    }

    async _updatePipeline(parsed, contact) {
        try {
            if (AppState.prospectManagerReady && AppState.prospectManager) {
                const prospects = AppState.prospectManager.getAll();
                const existingProspect = prospects.find(p => 
                    p.business && contact.business && 
                    p.business.toLowerCase().trim() === contact.business.toLowerCase().trim()
                );
                
                if (existingProspect) {
                    const updates = {
                        status: parsed.status,
                        leadScore: Utils.calculateLeadScore(contact),
                        notes: parsed.notes ? parsed.notes.join('\n') : existingProspect.notes,
                        tags: parsed.tags || existingProspect.tags,
                        updatedAt: new Date().toISOString()
                    };
                    await AppState.prospectManager.update(existingProspect.id, updates);
                } else {
                    const newProspect = {
                        business: contact.business,
                        name: contact.contactName,
                        role: contact.role,
                        phone: contact.phone,
                        email: contact.email,
                        status: parsed.status,
                        notes: parsed.notes ? parsed.notes.join('\n') : '',
                        tags: parsed.tags || [],
                        source: 'Smart Import',
                        leadScore: Utils.calculateLeadScore(contact),
                        createdAt: new Date().toISOString()
                    };
                    await AppState.prospectManager.create(newProspect);
                }
            }
        } catch (error) {
            console.warn('Pipeline update error:', error);
        }
    }
}

// Create singleton instance
const crmSync = new CRMSyncService();

window.CRMSyncService = CRMSyncService;
window.crmSync = crmSync;

console.log('CRM Sync Service initialized');