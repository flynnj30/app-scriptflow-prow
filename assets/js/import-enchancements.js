// ================================================================
// IMPORT ENHANCEMENTS - RELIABILITY & PERFORMANCE
// ================================================================

// ================================================================
// ENHANCED DATA VALIDATION & SANITIZATION
// ================================================================

const ValidationUtils = {
    /**
     * Sanitize input text to prevent injection and normalize whitespace
     */
    sanitizeText: function(text) {
        if (!text) return '';
        return text
            .replace(/[^\w\s@.,\-+()&]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Validate and format phone number with country code support
     */
    validatePhone: function(phone) {
        if (!phone) return { valid: false, formatted: '', error: 'Phone number is required' };
        
        let cleaned = phone.replace(/[^\d+]/g, '');
        
        if (cleaned.length < 7) {
            return { valid: false, formatted: cleaned, error: 'Phone number too short (minimum 7 digits)' };
        }
        
        if (cleaned.length > 15) {
            return { valid: false, formatted: cleaned, error: 'Phone number too long (maximum 15 digits)' };
        }
        
        let formatted = cleaned;
        if (cleaned.startsWith('+')) {
            if (cleaned.length === 11 && cleaned.startsWith('+1')) {
                formatted = `+1 (${cleaned.substring(2, 5)}) ${cleaned.substring(5, 8)}-${cleaned.substring(8)}`;
            } else {
                formatted = cleaned;
            }
        } else if (cleaned.length === 10) {
            formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
        } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
            formatted = `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
        }
        
        return { valid: true, formatted: formatted, error: null };
    },

    /**
     * Validate and normalize email address
     */
    validateEmail: function(email) {
        if (!email) return { valid: false, formatted: '', error: 'Email is required' };
        
        const trimmed = email.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(trimmed)) {
            return { valid: false, formatted: trimmed, error: 'Invalid email format' };
        }
        
        const disposableDomains = ['tempmail.com', 'throwaway.com', '10minutemail.com', 'guerrillamail.com'];
        const domain = trimmed.split('@')[1];
        if (disposableDomains.includes(domain)) {
            return { valid: true, formatted: trimmed, error: 'Disposable email detected' };
        }
        
        return { valid: true, formatted: trimmed, error: null };
    },

    /**
     * Validate and normalize date
     */
    validateDate: function(dateStr, allowPast = true) {
        if (!dateStr) {
            const today = new Date();
            return { 
                valid: true, 
                formatted: Utils.formatDateForCompare(today), 
                error: 'Using today\'s date',
                isDefault: true 
            };
        }
        
        const parsed = Utils.parseDateString(dateStr);
        if (!parsed) {
            return { 
                valid: false, 
                formatted: dateStr, 
                error: 'Invalid date format. Use MM/DD/YYYY or Month DD, YYYY' 
            };
        }
        
        const dateObj = new Date(parsed);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!allowPast && dateObj < today) {
            return { 
                valid: true, 
                formatted: parsed, 
                error: 'Date is in the past. Please verify.' 
            };
        }
        
        return { valid: true, formatted: parsed, error: null };
    },

    /**
     * Validate and normalize time
     */
    validateTime: function(timeStr) {
        if (!timeStr) return { valid: true, formatted: '', error: 'No time provided' };
        
        const trimmed = timeStr.trim();
        let hour, minute, period;
        let match = trimmed.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/i);
        
        if (!match) {
            return { valid: false, formatted: trimmed, error: 'Invalid time format. Use HH:MM AM/PM' };
        }
        
        hour = parseInt(match[1]);
        minute = parseInt(match[2] || '00');
        period = match[3] ? match[3].toUpperCase() : null;
        
        if (hour < 1 || hour > 12) {
            return { valid: false, formatted: trimmed, error: 'Hour must be between 1 and 12' };
        }
        
        if (minute < 0 || minute > 59) {
            return { valid: false, formatted: trimmed, error: 'Minutes must be between 0 and 59' };
        }
        
        if (!period) {
            if (hour >= 6 && hour <= 11) {
                period = 'AM';
            } else if (hour === 12) {
                period = 'PM';
            } else if (hour >= 1 && hour <= 5) {
                period = 'PM';
            } else {
                period = 'AM';
            }
        }
        
        const formatted = `${hour}:${String(minute).padStart(2, '0')} ${period}`;
        return { valid: true, formatted: formatted, error: null };
    },

    /**
     * Extract and validate business name
     */
    validateBusinessName: function(name) {
        if (!name || name.trim().length < 2) {
            return { valid: false, formatted: '', error: 'Business name is required (minimum 2 characters)' };
        }
        
        const cleaned = name.trim().replace(/\s+/g, ' ');
        if (cleaned.length > 100) {
            return { valid: true, formatted: cleaned.substring(0, 100), error: 'Business name truncated to 100 characters' };
        }
        
        return { valid: true, formatted: cleaned, error: null };
    },

    /**
     * Validate contact name
     */
    validateContactName: function(name) {
        if (!name || name.trim().length < 2) {
            return { valid: false, formatted: '', error: 'Contact name is required (minimum 2 characters)' };
        }
        
        const cleaned = name.trim().replace(/\s+/g, ' ');
        if (!/^[a-zA-Z\s.'-]+$/.test(cleaned)) {
            return { valid: true, formatted: cleaned, error: 'Name contains unusual characters' };
        }
        
        return { valid: true, formatted: cleaned, error: null };
    }
};

// ================================================================
// ENHANCED DUPLICATE DETECTION
// ================================================================

const DuplicateDetector = {
    /**
     * Calculate similarity between two strings using Levenshtein distance
     */
    calculateSimilarity: function(str1, str2) {
        if (!str1 || !str2) return 0;
        
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();
        
        if (s1 === s2) return 1;
        if (s1.length === 0 || s2.length === 0) return 0;
        
        const matrix = [];
        for (let i = 0; i <= s1.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= s2.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= s1.length; i++) {
            for (let j = 1; j <= s2.length; j++) {
                const cost = s1[i-1] === s2[j-1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i-1][j] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j-1] + cost
                );
            }
        }
        
        const distance = matrix[s1.length][s2.length];
        const maxLen = Math.max(s1.length, s2.length);
        return 1 - (distance / maxLen);
    },

    /**
     * Calculate weighted match score with field importance
     */
    calculateMatchScore: function(newData, existing) {
        const weights = {
            email: 0.35,
            phone: 0.30,
            name: 0.20,
            business: 0.15
        };
        
        let totalScore = 0;
        let totalWeight = 0;
        const matches = [];
        
        if (newData.email && existing.email) {
            const similarity = this.calculateSimilarity(newData.email, existing.email);
            const score = similarity * weights.email;
            totalScore += score;
            totalWeight += weights.email;
            if (similarity > 0.9) {
                matches.push({ field: 'email', score: similarity });
            }
        }
        
        if (newData.phone && existing.phone) {
            const newPhone = newData.phone.replace(/[^\d+]/g, '');
            const existingPhone = existing.phone.replace(/[^\d+]/g, '');
            const similarity = newPhone === existingPhone ? 1 : 0;
            const score = similarity * weights.phone;
            totalScore += score;
            totalWeight += weights.phone;
            if (similarity > 0) {
                matches.push({ field: 'phone', score: similarity });
            }
        }
        
        if (newData.name && existing.contactName) {
            const similarity = this.calculateSimilarity(newData.name, existing.contactName);
            const score = similarity * weights.name;
            totalScore += score;
            totalWeight += weights.name;
            if (similarity > 0.7) {
                matches.push({ field: 'name', score: similarity });
            }
        }
        
        if (newData.business && existing.business) {
            const similarity = this.calculateSimilarity(newData.business, existing.business);
            const score = similarity * weights.business;
            totalScore += score;
            totalWeight += weights.business;
            if (similarity > 0.7) {
                matches.push({ field: 'business', score: similarity });
            }
        }
        
        const confidence = totalWeight > 0 ? totalScore / totalWeight : 0;
        return { confidence, matches, totalWeight };
    },

    /**
     * Find duplicates with advanced matching
     */
    findDuplicates: function(newData, existingAppointments) {
        const results = [];
        
        if (!existingAppointments || existingAppointments.length === 0) {
            return results;
        }
        
        for (const existing of existingAppointments) {
            const { confidence, matches } = this.calculateMatchScore(newData, existing);
            
            if (confidence >= 0.4) {
                const level = confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low';
                results.push({
                    existing: existing,
                    confidence: Math.round(confidence * 100),
                    level: level,
                    matches: matches,
                    status: existing.status || 'Pending',
                    date: existing.date
                });
            }
        }
        
        results.sort((a, b) => b.confidence - a.confidence);
        return results;
    },

    /**
     * Determine if duplicate should be auto-merged
     */
    shouldAutoMerge: function(duplicate) {
        if (duplicate.confidence >= 85) {
            const hasConflict = duplicate.matches.some(m => m.score < 0.8);
            return !hasConflict;
        }
        return false;
    }
};

// ================================================================
// IMPORT QUEUE & BATCH PROCESSING
// ================================================================

const ImportQueue = {
    queue: [],
    processing: false,
    batchSize: 5,
    processed: 0,
    total: 0,
    errors: [],
    savedIds: [],
    
    /**
     * Add records to import queue
     */
    addToQueue: function(records) {
        this.queue.push(...records);
        this.total = this.queue.length;
        this.processed = 0;
        this.errors = [];
        this.savedIds = [];
        this.startProcessing();
    },
    
    /**
     * Process queue in batches
     */
    startProcessing: async function() {
        if (this.processing) return;
        this.processing = true;
        
        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.batchSize);
            await this.processBatch(batch);
        }
        
        this.processing = false;
        this.onComplete();
    },
    
    /**
     * Process a batch of records
     */
    processBatch: async function(batch) {
        const promises = batch.map(record => this.processRecord(record));
        const results = await Promise.allSettled(promises);
        
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.errors.push({
                    record: batch[index],
                    error: result.reason
                });
            } else {
                this.processed++;
                if (result.value && result.value.id) {
                    this.savedIds.push(result.value.id);
                }
                this.onProgress(this.processed, this.total);
            }
        });
        
        // Update progress via the global function if available
        if (typeof updateImportProgress === 'function') {
            updateImportProgress(
                (this.processed / this.total) * 100,
                `Processing ${this.processed} of ${this.total} records...`
            );
        }
    },
    
    /**
     * Process a single record
     */
    processRecord: function(record) {
        return new Promise((resolve, reject) => {
            try {
                // Use the global validateAppointmentData function
                const validation = typeof validateAppointmentData === 'function' 
                    ? validateAppointmentData(record) 
                    : { isValid: true, validated: record, errors: [], warnings: [] };
                    
                if (!validation.isValid) {
                    reject({ record: record, errors: validation.errors });
                    return;
                }
                
                const duplicates = DuplicateDetector.findDuplicates(
                    record, 
                    typeof Data !== 'undefined' ? Data.getAllAppointments() : []
                );
                
                if (duplicates.length > 0 && duplicates[0].confidence >= 80) {
                    if (DuplicateDetector.shouldAutoMerge(duplicates[0])) {
                        const id = ImportQueue.mergeDuplicate(record, duplicates[0].existing);
                        resolve({ status: 'merged', duplicate: duplicates[0], id: id });
                        return;
                    } else {
                        reject({ 
                            record: record, 
                            errors: ['Potential duplicate found'],
                            duplicate: duplicates[0]
                        });
                        return;
                    }
                }
                
                // Use the global Data.addAppointment function
                if (typeof Data !== 'undefined' && Data.addAppointment) {
                    const result = Data.addAppointment(
                        record.date || (typeof Utils !== 'undefined' ? Utils.getTodayStr() : new Date().toISOString().split('T')[0]),
                        record.business,
                        record.name,
                        record.role || 'Owner',
                        record.phone || '',
                        record.time || '',
                        record.notes || '',
                        record.assigned || 'Daniel',
                        null,
                        record.status || 'Pending',
                        '',
                        record.tags || [],
                        record.closer || null
                    );
                    resolve({ status: 'saved', result: result, id: result?.id });
                } else {
                    reject({ record: record, errors: ['Data service not available'] });
                }
                
            } catch (error) {
                reject(error);
            }
        });
    },
    
    /**
     * Merge duplicate records
     */
    mergeDuplicate: function(newData, existing) {
        const updates = {};
        let mergedId = existing.id;
        
        if (newData.name && !existing.contactName) updates.contactName = newData.name;
        if (newData.business && !existing.business) updates.business = newData.business;
        if (newData.phone && !existing.phone) updates.phone = newData.phone;
        if (newData.email && !existing.email) updates.email = newData.email;
        if (newData.time && !existing.time) updates.time = newData.time;
        if (newData.closer && !existing.closer) updates.closer = newData.closer;
        
        if (newData.notes) {
            updates.notes = existing.notes ? 
                existing.notes + '\n\n--- Imported Notes ---\n' + newData.notes : 
                newData.notes;
        }
        
        if (newData.tags) {
            const existingTags = existing.tags || [];
            const newTags = newData.tags.filter(t => !existingTags.includes(t));
            if (newTags.length > 0) {
                updates.tags = [...existingTags, ...newTags];
            }
        }
        
        if (Object.keys(updates).length > 0) {
            if (typeof Data !== 'undefined' && Data.updateAppointment) {
                Data.updateAppointment(existing.date, existing.id, updates);
            }
        }
        
        return mergedId;
    },
    
    /**
     * Progress callback
     */
    onProgress: function(processed, total) {
        const progress = (processed / total) * 100;
        if (typeof updateImportProgress === 'function') {
            updateImportProgress(progress, `Processed ${processed} of ${total} records`);
        }
    },
    
    /**
     * Complete callback
     */
    onComplete: function() {
        const saved = this.processed;
        const failed = this.errors.length;
        
        let message = `Import complete! ${saved} record(s) saved.`;
        if (failed > 0) {
            message += ` ${failed} record(s) failed.`;
        }
        
        if (typeof showToast === 'function') {
            showToast(message, failed > 0 ? 'warning' : 'success');
        }
        
        // Save to history
        ImportHistory.addSession({
            savedCount: saved,
            errorCount: failed,
            recordIds: this.savedIds,
            summary: `Imported ${saved} records, ${failed} errors`
        });
        
        if (typeof FeaturePanel !== 'undefined' && FeaturePanel.refreshCurrentView) {
            FeaturePanel.refreshCurrentView();
        }
        if (typeof Stats !== 'undefined' && Stats.updateAll) {
            Stats.updateAll();
        }
        
        // Show error report if there were errors
        if (failed > 0) {
            setTimeout(() => {
                if (typeof showImportErrorReport === 'function') {
                    showImportErrorReport(this.errors);
                }
            }, 500);
        }
    }
};

// ================================================================
// IMPORT HISTORY & ROLLBACK
// ================================================================

const ImportHistory = {
    history: [],
    maxHistoryItems: 50,
    
    /**
     * Add import session to history
     */
    addSession: function(session) {
        this.history.unshift({
            id: typeof Utils !== 'undefined' ? Utils.generateId() : Date.now().toString() + '_' + Math.random().toString(36).substring(2, 11),
            timestamp: new Date().toISOString(),
            ...session
        });
        
        if (this.history.length > this.maxHistoryItems) {
            this.history = this.history.slice(0, this.maxHistoryItems);
        }
        
        try {
            localStorage.setItem('importHistory', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Failed to save import history:', e);
        }
    },
    
    /**
     * Load import history from storage
     */
    loadHistory: function() {
        try {
            const stored = localStorage.getItem('importHistory');
            if (stored) {
                this.history = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load import history:', e);
        }
        return this.history;
    },
    
    /**
     * Rollback an import session
     */
    rollbackSession: function(sessionId) {
        const session = this.history.find(s => s.id === sessionId);
        if (!session) {
            if (typeof showToast === 'function') {
                showToast('Session not found', 'error');
            }
            return false;
        }
        
        if (!confirm(`Rollback import from ${new Date(session.timestamp).toLocaleString()}? This will delete ${session.savedCount} record(s).`)) {
            return false;
        }
        
        let deletedCount = 0;
        if (typeof Data !== 'undefined' && Data.getAppointmentById && Data.deleteAppointment) {
            for (const recordId of session.recordIds || []) {
                const appt = Data.getAppointmentById(recordId);
                if (appt) {
                    Data.deleteAppointment(appt.date, recordId);
                    deletedCount++;
                }
            }
        }
        
        session.rolledBack = true;
        session.rolledBackAt = new Date().toISOString();
        
        try {
            localStorage.setItem('importHistory', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Failed to save import history:', e);
        }
        
        if (typeof showToast === 'function') {
            showToast(`Rolled back ${deletedCount} record(s)`, 'success');
        }
        
        if (typeof FeaturePanel !== 'undefined' && FeaturePanel.refreshCurrentView) {
            FeaturePanel.refreshCurrentView();
        }
        if (typeof Stats !== 'undefined' && Stats.updateAll) {
            Stats.updateAll();
        }
        
        return true;
    },
    
    /**
     * Get import statistics
     */
    getStats: function() {
        const totalSessions = this.history.length;
        const totalRecords = this.history.reduce((sum, s) => sum + (s.savedCount || 0), 0);
        const totalErrors = this.history.reduce((sum, s) => sum + (s.errorCount || 0), 0);
        const rolledBack = this.history.filter(s => s.rolledBack).length;
        
        return {
            totalSessions,
            totalRecords,
            totalErrors,
            rolledBack,
            lastImport: this.history.length > 0 ? this.history[0] : null
        };
    }
};

// ================================================================
// AUTO-SAVE & RECOVERY
// ================================================================

const ImportRecovery = {
    /**
     * Auto-save import state for recovery
     */
    autoSave: function() {
        try {
            const state = {
                records: typeof ImportState !== 'undefined' ? ImportState.parsedRecords : [],
                timestamp: new Date().toISOString(),
                totalProcessed: typeof ImportState !== 'undefined' ? ImportState.totalProcessed : 0,
                totalValid: typeof ImportState !== 'undefined' ? ImportState.totalValid : 0,
                totalInvalid: typeof ImportState !== 'undefined' ? ImportState.totalInvalid : 0,
                totalDuplicates: typeof ImportState !== 'undefined' ? ImportState.totalDuplicates : 0
            };
            localStorage.setItem('import_recovery', JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to auto-save import state:', e);
        }
    },
    
    /**
     * Check for saved import state
     */
    checkRecovery: function() {
        try {
            const saved = localStorage.getItem('import_recovery');
            if (!saved) return null;
            
            const state = JSON.parse(saved);
            const age = Date.now() - new Date(state.timestamp).getTime();
            
            if (age < 3600000 && state.records && state.records.length > 0) {
                return state;
            }
            
            localStorage.removeItem('import_recovery');
            return null;
        } catch (e) {
            console.warn('Failed to check import recovery:', e);
            return null;
        }
    },
    
    /**
     * Restore saved import state
     */
    restore: function() {
        const state = this.checkRecovery();
        if (!state) return false;
        
        if (confirm(`Recover import from ${new Date(state.timestamp).toLocaleString()}? (${state.records.length} records)`)) {
            if (typeof ImportState !== 'undefined') {
                ImportState.parsedRecords = state.records;
                ImportState.totalProcessed = state.totalProcessed;
                ImportState.totalValid = state.totalValid;
                ImportState.totalInvalid = state.totalInvalid;
                ImportState.totalDuplicates = state.totalDuplicates;
                ImportState.processingStatus = 'complete';
            }
            
            if (typeof renderImportResultsEnhanced === 'function') {
                renderImportResultsEnhanced(state.records);
            }
            
            if (typeof showToast === 'function') {
                showToast(`Recovered ${state.records.length} records from import`, 'info');
            }
            
            localStorage.removeItem('import_recovery');
            
            const modal = document.getElementById('smartImportModal');
            if (modal) modal.style.display = 'flex';
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Clear recovery data
     */
    clear: function() {
        localStorage.removeItem('import_recovery');
    }
};

// ================================================================
// ENHANCED IMPORT UI FUNCTIONS
// ================================================================

/**
 * Show import history modal
 */
function showImportHistory() {
    const history = ImportHistory.loadHistory();
    const stats = ImportHistory.getStats();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'importHistoryModal';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 700px;">
            <h3><i class="fas fa-history"></i> Import History</h3>
            
            <div class="import-stats-grid" style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:16px 0;">
                <div class="import-stat ${stats.totalSessions > 0 ? 'success' : ''}">
                    <span class="stat-number">${stats.totalSessions}</span>
                    <span class="stat-label">Total Imports</span>
                </div>
                <div class="import-stat ${stats.totalRecords > 0 ? 'success' : ''}">
                    <span class="stat-number">${stats.totalRecords}</span>
                    <span class="stat-label">Records Imported</span>
                </div>
                <div class="import-stat ${stats.totalErrors > 0 ? 'warning' : 'success'}">
                    <span class="stat-number">${stats.totalErrors}</span>
                    <span class="stat-label">Errors</span>
                </div>
                <div class="import-stat ${stats.rolledBack > 0 ? 'warning' : ''}">
                    <span class="stat-number">${stats.rolledBack}</span>
                    <span class="stat-label">Rolled Back</span>
                </div>
            </div>
            
            <div style="max-height:400px; overflow-y:auto;">
                ${history.length === 0 ? '<p style="color:var(--text-muted); text-align:center; padding:20px;">No import history found.</p>' : 
                history.map(session => `
                    <div class="history-item" style="padding:12px; border:1px solid var(--border-color); border-radius:8px; margin-bottom:8px; ${session.rolledBack ? 'opacity:0.5;' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                            <div>
                                <strong>${new Date(session.timestamp).toLocaleString()}</strong>
                                <span style="font-size:0.8rem; color:var(--text-muted); margin-left:8px;">
                                    ${session.savedCount || 0} records saved
                                </span>
                                ${session.errorCount > 0 ? `<span style="color:var(--danger); font-size:0.8rem;">⚠️ ${session.errorCount} errors</span>` : ''}
                                ${session.rolledBack ? '<span style="color:var(--warning); font-size:0.8rem;">↩️ Rolled back</span>' : ''}
                            </div>
                            <div style="display:flex; gap:8px;">
                                ${!session.rolledBack ? `
                                    <button class="btn-icon" onclick="window.rollbackImport('${session.id}')" style="background:var(--danger); color:white; padding:4px 12px; font-size:0.7rem;">
                                        <i class="fas fa-undo"></i> Rollback
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        ${session.summary ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${session.summary}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            
            <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:16px;">
                <button id="closeHistoryBtn" class="btn-icon">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('#closeHistoryBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.remove());
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Rollback an import session
 */
function rollbackImport(sessionId) {
    ImportHistory.rollbackSession(sessionId);
    const modal = document.getElementById('importHistoryModal');
    if (modal) {
        modal.remove();
        showImportHistory();
    }
}

/**
 * Show detailed error report for import
 */
function showImportErrorReport(errors) {
    if (!errors || errors.length === 0) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'importErrorModal';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 700px;">
            <h3><i class="fas fa-exclamation-triangle" style="color:var(--danger);"></i> Import Errors</h3>
            <p style="color:var(--text-muted); margin-bottom:16px;">${errors.length} record(s) failed to import.</p>
            
            <div style="max-height:400px; overflow-y:auto;">
                ${errors.map((error, index) => `
                    <div class="error-item" style="padding:10px; border:1px solid var(--border-color); border-radius:8px; margin-bottom:8px; border-left:3px solid var(--danger);">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                            <strong style="font-size:0.85rem;">Record #${index + 1}</strong>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${error.record?.business || 'Unknown'}</span>
                        </div>
                        <div style="font-size:0.8rem; color:var(--danger); margin-top:4px;">
                            ${Array.isArray(error.error?.errors) ? error.error.errors.join('; ') : (typeof error.error === 'string' ? error.error : 'Unknown error')}
                        </div>
                        ${error.duplicate ? `
                            <div style="font-size:0.75rem; color:var(--warning); margin-top:4px;">
                                ⚠️ Duplicate found: ${error.duplicate.existing?.business} (${error.duplicate.confidence}% match)
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:16px;">
                <button id="closeErrorBtn" class="btn-icon">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('#closeErrorBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.remove());
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Enhanced appointment data validation
 */
function validateAppointmentDataEnhanced(data) {
    const errors = [];
    const warnings = [];
    const validated = {};
    
    const businessResult = ValidationUtils.validateBusinessName(data.business);
    if (!businessResult.valid) {
        errors.push({ field: 'business', message: businessResult.error });
    } else {
        validated.business = businessResult.formatted;
        if (businessResult.error) warnings.push({ field: 'business', message: businessResult.error });
    }
    
    const nameResult = ValidationUtils.validateContactName(data.name);
    if (!nameResult.valid) {
        errors.push({ field: 'name', message: nameResult.error });
    } else {
        validated.name = nameResult.formatted;
        if (nameResult.error) warnings.push({ field: 'name', message: nameResult.error });
    }
    
    if (data.phone) {
        const phoneResult = ValidationUtils.validatePhone(data.phone);
        if (!phoneResult.valid) {
            warnings.push({ field: 'phone', message: phoneResult.error });
        }
        validated.phone = phoneResult.formatted || data.phone;
    }
    
    if (data.email) {
        const emailResult = ValidationUtils.validateEmail(data.email);
        if (!emailResult.valid) {
            warnings.push({ field: 'email', message: emailResult.error });
        }
        validated.email = emailResult.formatted || data.email;
        if (emailResult.error === 'Disposable email detected') {
            warnings.push({ field: 'email', message: 'Disposable email address detected' });
        }
    }
    
    const dateResult = ValidationUtils.validateDate(data.date);
    if (!dateResult.valid) {
        errors.push({ field: 'date', message: dateResult.error });
    } else {
        validated.date = dateResult.formatted;
        if (dateResult.error) warnings.push({ field: 'date', message: dateResult.error });
    }
    
    if (data.time) {
        const timeResult = ValidationUtils.validateTime(data.time);
        if (!timeResult.valid) {
            warnings.push({ field: 'time', message: timeResult.error });
        }
        validated.time = timeResult.formatted || data.time;
    }
    
    if (data.status) {
        const statusOptions = CONFIG?.STATUS_OPTIONS || SMART_IMPORT_CONFIG?.VALIDATION?.status?.allowed || ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held'];
        const matchedStatus = statusOptions.find(s => 
            s.toLowerCase() === data.status.toLowerCase() ||
            s.toLowerCase().includes(data.status.toLowerCase()) ||
            data.status.toLowerCase().includes(s.toLowerCase())
        );
        if (matchedStatus) {
            validated.status = matchedStatus;
        } else {
            warnings.push({ field: 'status', message: `Status "${data.status}" not recognized. Using "Pending".` });
            validated.status = 'Pending';
        }
    } else {
        validated.status = 'Pending';
    }
    
    ['assigned', 'role', 'notes', 'tags', 'email', 'closer'].forEach(field => {
        if (data[field]) {
            validated[field] = data[field];
        }
    });
    
    return {
        validated,
        errors,
        warnings,
        isValid: errors.length === 0
    };
}

/**
 * Render enhanced record with better visual feedback
 */
function renderRecordEnhanced(record) {
    const statusClass = record.isValid ? 'valid' : 'invalid';
    const hasDuplicate = record.hasDuplicate;
    const hasWarnings = record.warnings && record.warnings.length > 0;
    
    const avgConfidence = getAverageConfidence(record.confidence);
    const confColor = avgConfidence >= 0.7 ? 'high' : avgConfidence >= 0.4 ? 'medium' : 'low';
    
    const fieldsHtml = renderRecordFieldsEnhanced(record);
    
    return `
        <div class="import-record ${statusClass} ${hasDuplicate ? 'duplicate' : ''} fade-in">
            <div class="record-header" onclick="toggleImportRecord(this)">
                <div class="record-status">
                    <span class="status-icon ${statusClass}">${record.isValid ? '✅' : '⚠️'}</span>
                    <span class="record-index">#${record.index}</span>
                </div>
                <div class="record-summary">
                    <span class="record-name">${typeof Utils !== 'undefined' ? Utils.escapeHtml(record.validated.name || record.parsed.name || 'Unknown') : (record.validated.name || record.parsed.name || 'Unknown')}</span>
                    <span class="record-business">${typeof Utils !== 'undefined' ? Utils.escapeHtml(record.validated.business || record.parsed.business || 'Unknown Business') : (record.validated.business || record.parsed.business || 'Unknown Business')}</span>
                </div>
                <div class="record-badges">
                    ${hasDuplicate ? '<span class="badge duplicate">🔄 Duplicate</span>' : ''}
                    ${hasWarnings ? `<span class="badge warning">⚠️ ${record.warnings.length}</span>` : ''}
                    ${!record.isValid ? `<span class="badge error">❌ ${record.errors.length}</span>` : ''}
                    <span class="badge confidence ${confColor}">${Math.round(avgConfidence * 100)}%</span>
                </div>
                <span class="record-toggle">▼</span>
            </div>
            <div class="record-body" style="display:none;">
                <div class="record-fields">
                    ${fieldsHtml}
                </div>
                
                ${!record.isValid ? `
                    <div class="validation-summary" style="margin:8px 0; padding:12px; background:rgba(239,68,68,0.1); border-radius:8px; border-left:3px solid var(--danger);">
                        <strong style="color:var(--danger);">❌ Required fields missing:</strong>
                        <ul style="margin:4px 0 0 16px; color:var(--danger);">
                            ${record.errors.map(e => `<li>${e.field}: ${e.message}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${hasWarnings ? `
                    <div class="validation-summary" style="margin:8px 0; padding:12px; background:rgba(245,158,11,0.1); border-radius:8px; border-left:3px solid var(--warning);">
                        <strong style="color:var(--warning);">⚠️ Warnings:</strong>
                        <ul style="margin:4px 0 0 16px; color:var(--warning);">
                            ${record.warnings.map(w => `<li>${w.field}: ${w.message}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${record.hasDuplicate ? `
                    <div class="record-duplicates">
                        <strong>🔄 Potential Duplicates:</strong>
                        <ul>${record.duplicates.filter(d => d.confidence >= 60).map(d => 
                            `<li>
                                ${typeof Utils !== 'undefined' ? Utils.escapeHtml(d.existing.business) : d.existing.business} - ${typeof Utils !== 'undefined' ? Utils.escapeHtml(d.existing.contactName) : d.existing.contactName} 
                                (${d.confidence}% match - ${d.level})
                                ${d.matches.length > 0 ? `- Matched on: ${d.matches.map(m => m.field).join(', ')}` : ''}
                            </li>`
                        ).join('')}</ul>
                        ${record.duplicates.some(d => d.confidence >= 80) ? `
                            <button class="btn-icon" onclick="window.autoMergeDuplicate('${record.index}')" style="background:var(--warning); color:#1e293b; margin-top:8px;">
                                <i class="fas fa-merge"></i> Auto-Merge
                            </button>
                        ` : `
                            <button class="btn-icon" onclick="window.mergeDuplicate('${record.index}')" style="background:var(--warning); color:#1e293b; margin-top:8px;">
                                <i class="fas fa-merge"></i> Review & Merge
                            </button>
                        `}
                    </div>
                ` : ''}
                
                <div class="record-actions">
                    <button class="btn-icon" onclick="window.editImportRecord('${record.index}')" style="background:var(--primary); color:white;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-icon" onclick="window.skipImportRecord('${record.index}')" style="background:var(--danger); color:white;">
                        <i class="fas fa-times"></i> Skip
                    </button>
                    ${record.isValid ? `
                        <button class="btn-icon" onclick="window.saveSingleRecord('${record.index}')" style="background:var(--success); color:white;">
                            <i class="fas fa-save"></i> Save
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Auto-merge duplicate with highest confidence
 */
function autoMergeDuplicate(index) {
    const record = typeof ImportState !== 'undefined' ? ImportState.parsedRecords.find(r => r.index === index) : null;
    if (!record) return;
    
    const bestDuplicate = record.duplicates && record.duplicates.length > 0 ? record.duplicates[0] : null;
    if (!bestDuplicate || bestDuplicate.confidence < 80) {
        if (typeof showToast === 'function') {
            showToast('No high-confidence duplicate found to auto-merge', 'warning');
        }
        return;
    }
    
    if (!confirm(`Auto-merge with "${bestDuplicate.existing.business}" (${bestDuplicate.confidence}% match)?`)) return;
    
    ImportQueue.mergeDuplicate(record.parsed, bestDuplicate.existing);
    
    if (typeof ImportState !== 'undefined') {
        ImportState.parsedRecords = ImportState.parsedRecords.filter(r => r.index !== index);
        ImportState.validatedRecords = ImportState.validatedRecords.filter(r => r.index !== index);
    }
    
    if (typeof renderImportResultsEnhanced === 'function') {
        renderImportResultsEnhanced(ImportState.parsedRecords);
    }
    
    if (typeof showToast === 'function') {
        showToast(`Auto-merged with ${bestDuplicate.existing.business}`, 'success');
    }
}

/**
 * Download import template
 */
function downloadImportTemplate() {
    const template = `Business Name,Contact Name,Phone,Email,Date,Time,Status,Assigned,Closer,Notes
ABC Company,John Doe,(555) 123-4567,john@abc.com,2024-07-20,2:30 PM,Warm Callback,Daniel,Kailan,"High interest, referred by Sarah"
XYZ Corp,Jane Smith,(555) 987-6543,jane@xyz.com,2024-07-21,10:00 AM,Hot Transfer,Sarah,Seif,"Decision maker, urgent need"
Tech Solutions,Bob Johnson,(555) 456-7890,bob@tech.com,2024-07-22,3:00 PM,Pending,Mike,Seun,"Follow up on proposal"
`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_template_${typeof Utils !== 'undefined' ? Utils.getTodayStr() : new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
        showToast('Template downloaded!', 'success');
    }
}

/**
 * Quick import from clipboard
 */
async function quickImportFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            if (typeof openSmartImportEnhanced === 'function') {
                openSmartImportEnhanced();
            }
            const textArea = document.getElementById('importTextArea');
            if (textArea) {
                textArea.value = text;
                setTimeout(() => {
                    if (typeof parseAndPreviewImportEnhanced === 'function') {
                        parseAndPreviewImportEnhanced();
                    }
                }, 300);
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('Clipboard is empty', 'warning');
            }
        }
    } catch (error) {
        if (typeof showToast === 'function') {
            showToast('Unable to read clipboard. Please paste manually.', 'error');
        }
    }
}

/**
 * Add import toolbar to the main interface
 */
function addImportToolbar() {
    const container = document.getElementById('action-buttons');
    if (!container) return;
    
    // Check if toolbar already exists
    if (container.querySelector('.import-toolbar')) return;
    
    const toolbarHtml = `
        <div class="import-toolbar" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-left:8px;">
            <button class="btn-icon" id="quickImportBtn" style="background:var(--primary); color:white;">
                <i class="fas fa-magic"></i> Quick Import
            </button>
            <button class="btn-icon" id="importHistoryBtn" style="background:var(--secondary); color:white;">
                <i class="fas fa-history"></i> History
            </button>
            <button class="btn-icon" id="importTemplateBtn" style="background:var(--success); color:white;">
                <i class="fas fa-download"></i> Template
            </button>
            <button class="btn-icon" id="clipboardImportBtn" style="background:var(--warning); color:#1e293b;">
                <i class="fas fa-clipboard"></i> Paste
            </button>
            <span style="font-size:0.65rem; color:var(--text-muted); margin-left:4px;">
                <i class="fas fa-info-circle"></i> CSV, Natural Language, Key-Value
            </span>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toolbarHtml);
    
    const quickImportBtn = document.getElementById('quickImportBtn');
    const historyBtn = document.getElementById('importHistoryBtn');
    const templateBtn = document.getElementById('importTemplateBtn');
    const clipboardBtn = document.getElementById('clipboardImportBtn');
    
    if (quickImportBtn) {
        quickImportBtn.addEventListener('click', function() {
            if (typeof openSmartImportEnhanced === 'function') {
                openSmartImportEnhanced();
            }
        });
    }
    
    if (historyBtn) {
        historyBtn.addEventListener('click', showImportHistory);
    }
    
    if (templateBtn) {
        templateBtn.addEventListener('click', downloadImportTemplate);
    }
    
    if (clipboardBtn) {
        clipboardBtn.addEventListener('click', quickImportFromClipboard);
    }
}

// ================================================================
// EXPOSE GLOBAL FUNCTIONS
// ================================================================

window.ValidationUtils = ValidationUtils;
window.DuplicateDetector = DuplicateDetector;
window.ImportQueue = ImportQueue;
window.ImportHistory = ImportHistory;
window.ImportRecovery = ImportRecovery;
window.showImportHistory = showImportHistory;
window.rollbackImport = rollbackImport;
window.showImportErrorReport = showImportErrorReport;
window.validateAppointmentDataEnhanced = validateAppointmentDataEnhanced;
window.renderRecordEnhanced = renderRecordEnhanced;
window.autoMergeDuplicate = autoMergeDuplicate;
window.downloadImportTemplate = downloadImportTemplate;
window.quickImportFromClipboard = quickImportFromClipboard;
window.addImportToolbar = addImportToolbar;

// ================================================================
// AUTO-INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Check for recovery state after auth is loaded
    setTimeout(() => {
        if (ImportRecovery.checkRecovery()) {
            // Don't auto-restore - let user decide
            console.log('📦 Import recovery data found');
        }
    }, 2000);
    
    // Add import toolbar when DOM is ready
    setTimeout(addImportToolbar, 1000);
});

console.log('📦 Import Enhancements loaded');