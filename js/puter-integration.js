// ================================================================
// PUTER.JS INTEGRATION MODULE - Production Ready
// Audio Transcription & CRM Field Extraction
// ================================================================

/**
 * PuterIntegration - Complete module for audio transcription
 * and automatic CRM field population from conversations
 */
class PuterIntegration {
    constructor() {
        this.isReady = false;
        this.transcriptHistory = [];
        this.currentTranscript = null;
        this.extractedData = null;
        this.isProcessing = false;
        this.audioFile = null;
        this.uploadQueue = [];
        this.progressCallbacks = [];
        
        // Model options
        this.models = {
            FAST: 'gpt-4o-mini-transcribe',
            STANDARD: 'gpt-4o-transcribe',
            WHISPER: 'whisper-1',
            DIARIZE: 'gpt-4o-transcribe-diarize'
        };
        
        // Default configuration
        this.config = {
            model: this.models.STANDARD,
            translate: false,
            responseFormat: 'verbose_json',
            chunkingStrategy: 'auto',
            diarize: false,
            language: 'en',
            temperature: 0,
            timestampGranularities: ['segment']
        };
        
        // Mapping for CRM field extraction
        this.fieldPatterns = {
            business: {
                patterns: [
                    /(?:business|company|organization|org|firm|brand|store|shop)[:\s]+([A-Z][A-Za-z0-9\s&'\-.,]+)/i,
                    /(?:from|at|with|for)\s+([A-Z][A-Za-z0-9\s&'\-.,]+)/i,
                    /(?:called|named)\s+([A-Z][A-Za-z0-9\s&'\-.,]+)/i,
                    /(?:is this|this is)\s+([A-Z][A-Za-z0-9\s&'\-.,]+)/i
                ],
                confidence: 0.7
            },
            name: {
                patterns: [
                    /(?:name|contact|client|customer|person|full name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
                    /(?:from|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
                    /(?:my name is|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
                    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:from|at|with)/i
                ],
                confidence: 0.7
            },
            phone: {
                patterns: [
                    /(?:phone|mobile|cell|telephone|number|call|contact)[:\s]+([+\d\s\-\(\)]{7,20})/i,
                    /([+\d\s\-\(\)]{10,20})(?:\s*(?:is|was|will be|the|their))/i,
                    /(\d{3}[-.]?\d{3}[-.]?\d{4})/,
                    /\(\d{3}\)\s*\d{3}[-.]?\d{4}/
                ],
                confidence: 0.85
            },
            email: {
                patterns: [
                    /([^\s@]+@[^\s@]+\.[^\s@]+)/,
                    /(?:email|e-mail|mail|address)[:\s]+([^\s@]+@[^\s@]+\.[^\s@]+)/i
                ],
                confidence: 0.9
            },
            date: {
                patterns: [
                    /(?:date|appointment|scheduled|meeting|call|day|on)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
                    /(\d{1,2}\/\d{1,2}\/\d{4})/,
                    /(\d{4}-\d{2}-\d{2})/,
                    /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/
                ],
                confidence: 0.8
            },
            time: {
                patterns: [
                    /(?:time|at|for)[:\s]+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
                    /(\d{1,2}\s*(?:AM|PM|am|pm))/i,
                    /(\d{1,2}:\d{2})/
                ],
                confidence: 0.85
            },
            status: {
                patterns: [
                    /(?:status|outcome)[:\s]+(Hot Transfer|Warm Callback|Completed|Pending|Canceled|Meeting Booked|Rescheduled|Overdue|Held)/i,
                    /(?:booked|scheduled|confirmed|set up)\s+(?:a|the)?\s*(?:meeting|calls?)/i,
                    /(?:transfer|warm transfer|hot transfer)/i,
                    /(?:callback|call back|follow up|follow-up)/i
                ],
                confidence: 0.65
            },
            role: {
                patterns: [
                    /(?:role|title|position|job title|designation)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
                    /(?:owner|manager|ceo|director|supervisor|team lead|president|founder)/i
                ],
                confidence: 0.6
            },
            assigned: {
                patterns: [
                    /(?:assigned|assigned to|owner|agent|representative|rep)[:\s]+([A-Z][a-z]+)/i,
                    /(?:kailan|seif|daniel|sarah|mike|jessica|david)/i
                ],
                confidence: 0.5
            }
        };
        
        // Check if Puter is available
        this.checkAvailability();
    }

    // ================================================================
    // INITIALIZATION & AVAILABILITY
    // ================================================================

    checkAvailability() {
        if (typeof puter !== 'undefined' && puter.ai && typeof puter.ai.speech2txt === 'function') {
            this.isReady = true;
            console.log('✅ Puter.js is available and ready');
            this.log('Puter.js initialized successfully');
        } else {
            console.warn('⚠️ Puter.js not available. Make sure to include the script tag.');
            this.isReady = false;
            // Check again after a delay
            setTimeout(() => this.checkAvailability(), 2000);
        }
    }

    isAvailable() {
        return this.isReady && typeof puter !== 'undefined' && puter.ai && typeof puter.ai.speech2txt === 'function';
    }

    // ================================================================
    // TRANSCRIPTION METHODS
    // ================================================================

    /**
     * Transcribe audio from a file or URL
     */
    async transcribe(audioInput, options = {}) {
        if (!this.isAvailable()) {
            throw new Error('Puter.js is not available. Please check the script tag.');
        }

        this.isProcessing = true;
        this.updateProgress(10, 'Preparing audio...');

        try {
            // Merge with default config
            const config = { ...this.config, ...options };
            
            // Handle different input types
            let file;
            if (typeof audioInput === 'string') {
                // URL string
                file = audioInput;
            } else if (audioInput instanceof File) {
                // File object
                file = audioInput;
            } else if (audioInput && audioInput.target && audioInput.target.files) {
                // File input event
                const files = audioInput.target.files;
                if (!files || files.length === 0) {
                    throw new Error('No file selected');
                }
                file = files[0];
            } else if (audioInput && audioInput.files) {
                // FileList-like object
                file = audioInput.files[0] || audioInput;
            } else {
                throw new Error('Invalid audio input. Provide a URL string, File object, or file input event.');
            }

            this.audioFile = file;
            this.updateProgress(30, 'Transcribing audio...');

            // Build request options
            const requestOptions = {
                model: config.model || this.config.model,
                response_format: config.responseFormat || 'verbose_json',
                chunking_strategy: config.chunkingStrategy || 'auto'
            };

            // Add optional features
            if (config.translate) {
                requestOptions.translate = true;
            }

            if (config.diarize || config.model === this.models.DIARIZE) {
                requestOptions.response_format = 'diarized_json';
            }

            if (config.timestampGranularities) {
                requestOptions.timestamp_granularities = config.timestampGranularities;
            }

            if (config.language) {
                requestOptions.language = config.language;
            }

            if (config.temperature !== undefined) {
                requestOptions.temperature = config.temperature;
            }

            // Call Puter.js API
            const result = await puter.ai.speech2txt(file, requestOptions);

            this.updateProgress(80, 'Processing transcript...');

            // Store transcript
            this.currentTranscript = result;
            this.transcriptHistory.push({
                timestamp: new Date().toISOString(),
                audioFile: this.audioFile,
                result: result,
                config: requestOptions
            });

            // Extract text based on response format
            let transcriptText = '';
            let diarizedSegments = null;

            if (result.text) {
                transcriptText = result.text;
            } else if (result.segments && Array.isArray(result.segments)) {
                // Diarized result
                diarizedSegments = result.segments;
                transcriptText = result.segments.map(s => s.text).join(' ');
            } else if (typeof result === 'string') {
                transcriptText = result;
            } else if (result.content && result.content.parts) {
                transcriptText = result.content.parts[0].text;
            } else {
                transcriptText = JSON.stringify(result);
            }

            // Extract CRM data from transcript
            const extracted = this.extractCRMData(transcriptText, result);
            this.extractedData = extracted;

            this.updateProgress(100, 'Complete!');

            // Dispatch event
            document.dispatchEvent(new CustomEvent('transcription-complete', {
                detail: {
                    transcript: transcriptText,
                    diarizedSegments: diarizedSegments,
                    extractedData: extracted,
                    rawResult: result
                }
            }));

            this.isProcessing = false;

            return {
                transcript: transcriptText,
                diarizedSegments: diarizedSegments,
                extractedData: extracted,
                rawResult: result,
                config: requestOptions
            };

        } catch (error) {
            console.error('Transcription error:', error);
            this.isProcessing = false;
            this.updateProgress(0, 'Error: ' + error.message);
            
            // Dispatch error event
            document.dispatchEvent(new CustomEvent('transcription-error', {
                detail: { error: error.message }
            }));
            
            throw error;
        }
    }

    /**
     * Transcribe and auto-populate CRM fields
     */
    async transcribeAndPopulate(audioInput, options = {}) {
        const result = await this.transcribe(audioInput, options);
        
        // Populate CRM fields
        if (this.extractedData && typeof Data !== 'undefined') {
            const populated = this.populateCRMModal(this.extractedData);
            return {
                ...result,
                populatedFields: populated
            };
        }
        
        return result;
    }

    // ================================================================
    // CRM DATA EXTRACTION
    // ================================================================

    extractCRMData(transcript, rawResult = null) {
        const extracted = {};
        const confidence = {};

        for (const [field, config] of Object.entries(this.fieldPatterns)) {
            const result = this._extractField(transcript, config.patterns);
            if (result) {
                extracted[field] = result.value;
                confidence[field] = result.confidence || config.confidence;
            } else {
                extracted[field] = 'N/A';
                confidence[field] = 0;
            }
        }

        // Special handling for status
        if (extracted.status === 'N/A') {
            const status = this._detectStatus(transcript);
            if (status) {
                extracted.status = status;
                confidence.status = 0.6;
            }
        }

        // Extract sentiment
        const sentiment = this._detectSentiment(transcript);
        if (sentiment) {
            extracted.sentiment = sentiment;
            confidence.sentiment = 0.6;
        }

        // Extract tags
        const tags = this._detectTags(transcript);
        if (tags.length > 0) {
            extracted.tags = tags;
            confidence.tags = 0.5;
        }

        // Extract objections
        const objections = this._detectObjections(transcript);
        if (objections.length > 0) {
            extracted.objections = objections;
            confidence.objections = 0.5;
        }

        // Generate call summary
        extracted.callSummary = this._generateSummary(transcript);
        confidence.callSummary = 0.5;

        // Detect missing information
        extracted.missingInfo = this._detectMissing(extracted);

        // Add confidence data
        extracted._confidence = confidence;

        // Add full transcript
        extracted._fullTranscript = transcript;

        // Normalize data
        this._normalizeExtractedData(extracted);

        return extracted;
    }

    _extractField(text, patterns) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const value = match[1].trim();
                if (value && value.length > 1) {
                    // Clean up the value
                    const cleaned = this._cleanValue(value);
                    if (cleaned) {
                        return { value: cleaned, confidence: 0.85 };
                    }
                }
            }
        }
        return null;
    }

    _cleanValue(value) {
        // Remove extra spaces
        value = value.replace(/\s+/g, ' ').trim();
        
        // Remove trailing punctuation
        value = value.replace(/[,.]$/, '');
        
        // Remove common filler words at start
        value = value.replace(/^(um|uh|like|okay|so|well)\s+/i, '');
        
        return value;
    }

    _detectStatus(text) {
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

        for (const [status, pattern] of Object.entries(statusPatterns)) {
            if (pattern.test(text)) {
                return status;
            }
        }
        return null;
    }

    _detectSentiment(text) {
        const sentimentPatterns = {
            'Very Positive': /(?:amazing|excellent|outstanding|fantastic|perfect|brilliant|incredible|wonderful|extraordinary|love it|great job)/i,
            'Positive': /(?:great|good|nice|positive|happy|pleased|satisfied|impressed|interested|excited|enthusiastic|awesome|sounds good|like it)/i,
            'Neutral': /(?:okay|fine|alright|neutral|average|decent|moderate|standard|normal|not bad|so-so)/i,
            'Negative': /(?:bad|poor|terrible|awful|horrible|disappointed|unhappy|frustrated|annoyed|irritated|not good|don't like)/i,
            'Very Negative': /(?:worst|horrible|disgusting|atrocious|abysmal|appalling|dreadful|unacceptable|never|hate)/i
        };

        let maxScore = 0;
        let detectedSentiment = 'Neutral';

        for (const [sentiment, pattern] of Object.entries(sentimentPatterns)) {
            const matches = text.match(pattern);
            if (matches) {
                const score = matches.length;
                if (score > maxScore) {
                    maxScore = score;
                    detectedSentiment = sentiment;
                }
            }
        }

        return detectedSentiment;
    }

    _detectTags(text) {
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

        const tags = [];
        for (const [tag, pattern] of Object.entries(tagPatterns)) {
            if (pattern.test(text)) {
                tags.push(tag);
            }
        }

        return tags;
    }

    _detectObjections(text) {
        const objectionPatterns = [
            /(?:not interested|no thanks|don't need|not right now)/i,
            /(?:too busy|don't have time|busy right now|can't talk)/i,
            /(?:already have|already got|we already|currently have)/i,
            /(?:too expensive|cost too much|price is high|budget)/i,
            /(?:call me back|not now|later|some other time)/i,
            /(?:send info|email me|just send|information)/i,
            /(?:who is this|how did you|where did you|why are you)/i,
            /(?:we're good|we're fine|we don't need)/i,
            /(?:maybe later|not at this time|not right now)/i
        ];

        const objections = [];
        for (const pattern of objectionPatterns) {
            const match = text.match(pattern);
            if (match) {
                objections.push(match[0].trim());
            }
        }

        return [...new Set(objections)];
    }

    _generateSummary(text) {
        // Get first few lines or sentences
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        if (sentences.length === 0) return text.substring(0, 150) + '...';
        
        let summary = sentences.slice(0, 3).join('. ').trim();
        if (summary.length > 200) {
            summary = summary.substring(0, 200) + '...';
        }
        return summary + '.';
    }

    _detectMissing(extracted) {
        const missing = [];
        const required = ['business', 'name', 'phone', 'email'];
        const important = ['date', 'time', 'status'];
        
        for (const field of required) {
            if (extracted[field] === 'N/A' || !extracted[field]) {
                missing.push(field);
            }
        }
        
        for (const field of important) {
            if (extracted[field] === 'N/A' || !extracted[field]) {
                missing.push(field);
            }
        }
        
        return missing;
    }

    _normalizeExtractedData(extracted) {
        // Normalize phone
        if (extracted.phone && extracted.phone !== 'N/A') {
            extracted.phone = extracted.phone.replace(/[^+\d]/g, '');
            if (extracted.phone.length === 10 && /^\d{10}$/.test(extracted.phone)) {
                extracted.phone = `(${extracted.phone.substring(0, 3)}) ${extracted.phone.substring(3, 6)}-${extracted.phone.substring(6)}`;
            }
        }

        // Normalize email
        if (extracted.email && extracted.email !== 'N/A') {
            extracted.email = extracted.email.toLowerCase().trim();
        }

        // Normalize date
        if (extracted.date && extracted.date !== 'N/A') {
            const parsed = this._parseDate(extracted.date);
            if (parsed) {
                extracted.date = parsed;
            }
        }

        // Normalize status
        if (extracted.status && extracted.status !== 'N/A') {
            const validStatuses = ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked', 'Rescheduled', 'Overdue', 'Held'];
            const matched = validStatuses.find(s => 
                s.toLowerCase() === extracted.status.toLowerCase() ||
                s.toLowerCase().includes(extracted.status.toLowerCase()) ||
                extracted.status.toLowerCase().includes(s.toLowerCase())
            );
            if (matched) {
                extracted.status = matched;
            }
        }
    }

    _parseDate(dateStr) {
        if (!dateStr) return null;
        const trimmed = dateStr.trim();
        
        // ISO format
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
        
        // US format
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
        
        // Natural format
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

    // ================================================================
    // CRM POPULATION
    // ================================================================

    /**
     * Populate CRM modal with extracted data
     */
    populateCRMModal(extractedData) {
        if (!extractedData) return null;

        const populated = {
            business: extractedData.business !== 'N/A' ? extractedData.business : '',
            contactName: extractedData.name !== 'N/A' ? extractedData.name : '',
            role: extractedData.role !== 'N/A' ? extractedData.role : '',
            phone: extractedData.phone !== 'N/A' ? extractedData.phone : '',
            email: extractedData.email !== 'N/A' ? extractedData.email : '',
            date: extractedData.date !== 'N/A' ? extractedData.date : '',
            time: extractedData.time !== 'N/A' ? extractedData.time : '',
            status: extractedData.status !== 'N/A' ? extractedData.status : '',
            assigned: extractedData.assigned !== 'N/A' ? extractedData.assigned : '',
            notes: '',
            tags: extractedData.tags || [],
            sentiment: extractedData.sentiment || 'Neutral'
        };

        // Build notes from extracted data
        const notes = [];
        if (extractedData.callSummary && extractedData.callSummary !== 'N/A') {
            notes.push(`Call Summary: ${extractedData.callSummary}`);
        }
        if (extractedData.objections && extractedData.objections.length > 0) {
            notes.push(`Objections: ${extractedData.objections.join('; ')}`);
        }
        if (extractedData.sentiment && extractedData.sentiment !== 'Neutral') {
            notes.push(`Sentiment: ${extractedData.sentiment}`);
        }
        if (extractedData.missingInfo && extractedData.missingInfo.length > 0) {
            notes.push(`Missing Info: ${extractedData.missingInfo.join(', ')}`);
        }
        if (extractedData._fullTranscript) {
            notes.push(`\n--- Full Transcript ---\n${extractedData._fullTranscript}`);
        }

        populated.notes = notes.join('\n');

        return populated;
    }

    // ================================================================
    // UI HELPERS
    // ================================================================

    /**
     * Create an audio upload UI
     */
    createUploadUI(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} not found`);
            return null;
        }

        const ui = document.createElement('div');
        ui.className = 'puter-upload-ui';
        ui.innerHTML = `
            <div class="puter-upload-area" id="puterDropZone">
                <div class="puter-upload-icon">🎤</div>
                <p class="puter-upload-text">Drop audio file here or click to browse</p>
                <p class="puter-upload-hint">Supports MP3, WAV, OGG, M4A, FLAC</p>
                <input type="file" id="puterFileInput" accept="audio/*" style="display:none;" />
            </div>
            <div class="puter-options">
                <select id="puterModelSelect" class="puter-select">
                    <option value="gpt-4o-transcribe">Standard (GPT-4o)</option>
                    <option value="gpt-4o-mini-transcribe">Fast (GPT-4o Mini)</option>
                    <option value="whisper-1">Whisper</option>
                    <option value="gpt-4o-transcribe-diarize">Diarize (Speaker ID)</option>
                </select>
                <label class="puter-checkbox">
                    <input type="checkbox" id="puterTranslateCheck" />
                    Translate to English
                </label>
                <button id="puterTranscribeBtn" class="puter-btn">Transcribe & Populate</button>
            </div>
            <div id="puterProgressContainer" class="puter-progress" style="display:none;">
                <div class="puter-progress-bar" id="puterProgressBar"></div>
                <span class="puter-progress-text" id="puterProgressText">Processing...</span>
            </div>
            <div id="puterTranscriptResult" class="puter-result" style="display:none;">
                <h4>📝 Transcript</h4>
                <div id="puterTranscriptText" class="puter-transcript-text"></div>
                <h4>📊 Extracted Data</h4>
                <div id="puterExtractedData" class="puter-extracted-data"></div>
                <button id="puterPopulateBtn" class="puter-btn success">📥 Populate CRM</button>
            </div>
        `;

        container.appendChild(ui);

        // Add styles
        this._injectStyles();

        // Setup event listeners
        this._setupUIEvents(ui, options);

        return ui;
    }

    _injectStyles() {
        if (document.getElementById('puter-styles')) return;

        const styles = `
            <style id="puter-styles">
                .puter-upload-ui {
                    background: var(--bg-card, #1e293b);
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid var(--border-color, #334155);
                }

                .puter-upload-area {
                    border: 2px dashed var(--border-color, #334155);
                    border-radius: 12px;
                    padding: 40px 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: var(--bg-primary, #0f172a);
                }

                .puter-upload-area:hover {
                    border-color: var(--primary, #3b82f6);
                    background: var(--bg-card, #1e293b);
                }

                .puter-upload-area.dragover {
                    border-color: var(--primary, #3b82f6);
                    background: rgba(59, 130, 246, 0.1);
                }

                .puter-upload-icon {
                    font-size: 3rem;
                    margin-bottom: 12px;
                }

                .puter-upload-text {
                    font-size: 1rem;
                    color: var(--text-primary, #f1f5f9);
                    margin-bottom: 4px;
                }

                .puter-upload-hint {
                    font-size: 0.8rem;
                    color: var(--text-muted, #94a3b8);
                }

                .puter-options {
                    display: flex;
                    gap: 12px;
                    margin: 16px 0;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .puter-select {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color, #334155);
                    background: var(--bg-primary, #0f172a);
                    color: var(--text-primary, #f1f5f9);
                    font-size: 0.85rem;
                    min-width: 160px;
                }

                .puter-select:focus {
                    outline: 2px solid var(--primary, #3b82f6);
                }

                .puter-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-secondary, #cbd5e1);
                    font-size: 0.85rem;
                    cursor: pointer;
                }

                .puter-checkbox input[type="checkbox"] {
                    accent-color: var(--primary, #3b82f6);
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }

                .puter-btn {
                    padding: 8px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: var(--primary, #3b82f6);
                    color: white;
                }

                .puter-btn:hover {
                    opacity: 0.85;
                    transform: translateY(-2px);
                }

                .puter-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .puter-btn.success {
                    background: var(--success, #10b981);
                }

                .puter-progress {
                    margin-top: 12px;
                    padding: 12px;
                    background: var(--bg-primary, #0f172a);
                    border-radius: 8px;
                }

                .puter-progress-bar {
                    height: 4px;
                    background: var(--primary, #3b82f6);
                    border-radius: 2px;
                    transition: width 0.3s ease;
                    width: 0%;
                }

                .puter-progress-text {
                    font-size: 0.75rem;
                    color: var(--text-muted, #94a3b8);
                    margin-top: 4px;
                    display: block;
                }

                .puter-result {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border-color, #334155);
                }

                .puter-result h4 {
                    margin: 12px 0 8px;
                    font-size: 0.9rem;
                    color: var(--text-secondary, #cbd5e1);
                }

                .puter-transcript-text {
                    background: var(--bg-primary, #0f172a);
                    padding: 12px;
                    border-radius: 8px;
                    max-height: 150px;
                    overflow-y: auto;
                    font-size: 0.85rem;
                    line-height: 1.5;
                    white-space: pre-wrap;
                    color: var(--text-primary, #f1f5f9);
                }

                .puter-extracted-data {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    background: var(--bg-primary, #0f172a);
                    padding: 12px;
                    border-radius: 8px;
                }

                .puter-extracted-data .field {
                    display: flex;
                    flex-direction: column;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background: var(--bg-card, #1e293b);
                }

                .puter-extracted-data .field-label {
                    font-size: 0.6rem;
                    font-weight: 600;
                    color: var(--text-muted, #94a3b8);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .puter-extracted-data .field-value {
                    font-size: 0.8rem;
                    color: var(--text-primary, #f1f5f9);
                    word-break: break-word;
                }

                .puter-extracted-data .field-value.na {
                    color: var(--text-muted, #94a3b8);
                    font-style: italic;
                }

                .puter-extracted-data .field-value.high-confidence {
                    color: var(--success, #10b981);
                }

                .puter-extracted-data .field-value.medium-confidence {
                    color: var(--warning, #f59e0b);
                }

                .puter-extracted-data .field-value.low-confidence {
                    color: var(--danger, #ef4444);
                }

                @media (max-width: 600px) {
                    .puter-extracted-data {
                        grid-template-columns: 1fr;
                    }
                    .puter-options {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .puter-select {
                        width: 100%;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    _setupUIEvents(ui, options) {
        const dropZone = ui.querySelector('#puterDropZone');
        const fileInput = ui.querySelector('#puterFileInput');
        const transcribeBtn = ui.querySelector('#puterTranscribeBtn');
        const modelSelect = ui.querySelector('#puterModelSelect');
        const translateCheck = ui.querySelector('#puterTranslateCheck');
        const progressContainer = ui.querySelector('#puterProgressContainer');
        const progressBar = ui.querySelector('#puterProgressBar');
        const progressText = ui.querySelector('#puterProgressText');
        const resultContainer = ui.querySelector('#puterTranscriptResult');
        const transcriptText = ui.querySelector('#puterTranscriptText');
        const extractedData = ui.querySelector('#puterExtractedData');
        const populateBtn = ui.querySelector('#puterPopulateBtn');

        let currentFile = null;
        let lastResult = null;

        // Click to browse
        dropZone.addEventListener('click', () => fileInput.click());

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleFileSelect(fileInput.files[0]);
            }
        });

        const handleFileSelect = (file) => {
            currentFile = file;
            const name = file.name || 'audio file';
            dropZone.querySelector('.puter-upload-text').textContent = `Selected: ${name}`;
            dropZone.querySelector('.puter-upload-hint').textContent = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
            transcribeBtn.disabled = false;
        };

        // Transcribe button
        transcribeBtn.addEventListener('click', async () => {
            if (!currentFile) {
                alert('Please select an audio file first');
                return;
            }

            if (!this.isAvailable()) {
                alert('Puter.js is not available. Please check the script tag.');
                return;
            }

            transcribeBtn.disabled = true;
            transcribeBtn.textContent = '⏳ Transcribing...';
            resultContainer.style.display = 'none';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            progressText.textContent = 'Starting...';

            try {
                const model = modelSelect.value;
                const translate = translateCheck.checked;

                const result = await this.transcribe(currentFile, {
                    model: model,
                    translate: translate,
                    diarize: model === 'gpt-4o-transcribe-diarize'
                });

                lastResult = result;

                // Show transcript
                transcriptText.textContent = result.transcript;

                // Show extracted data
                const data = result.extractedData;
                let dataHtml = '';
                const fields = [
                    { key: 'business', label: 'Business' },
                    { key: 'name', label: 'Contact' },
                    { key: 'role', label: 'Role' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'email', label: 'Email' },
                    { key: 'date', label: 'Date' },
                    { key: 'time', label: 'Time' },
                    { key: 'status', label: 'Status' },
                    { key: 'sentiment', label: 'Sentiment' }
                ];

                for (const field of fields) {
                    const value = data[field.key] || 'N/A';
                    const conf = data._confidence ? data._confidence[field.key] : 0;
                    const confClass = conf >= 0.7 ? 'high-confidence' : conf >= 0.4 ? 'medium-confidence' : 'low-confidence';
                    const isNA = value === 'N/A' || !value;
                    dataHtml += `
                        <div class="field">
                            <span class="field-label">${field.label}</span>
                            <span class="field-value ${isNA ? 'na' : confClass}">${isNA ? 'N/A' : value}</span>
                        </div>
                    `;
                }

                if (data.tags && data.tags.length > 0) {
                    dataHtml += `
                        <div class="field" style="grid-column: 1 / -1;">
                            <span class="field-label">Tags</span>
                            <span class="field-value">${data.tags.join(', ')}</span>
                        </div>
                    `;
                }

                if (data.missingInfo && data.missingInfo.length > 0) {
                    dataHtml += `
                        <div class="field" style="grid-column: 1 / -1; border-left: 3px solid var(--warning, #f59e0b);">
                            <span class="field-label">⚠️ Missing Info</span>
                            <span class="field-value" style="color: var(--warning, #f59e0b);">${data.missingInfo.join(', ')}</span>
                        </div>
                    `;
                }

                extractedData.innerHTML = dataHtml;
                resultContainer.style.display = 'block';

                progressBar.style.width = '100%';
                progressText.textContent = '✅ Complete!';

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                }, 1500);

                if (options.onComplete) {
                    options.onComplete(result);
                }

            } catch (error) {
                progressText.textContent = '❌ Error: ' + error.message;
                progressBar.style.width = '0%';
                alert('Error: ' + error.message);
                
                if (options.onError) {
                    options.onError(error);
                }
            } finally {
                transcribeBtn.disabled = false;
                transcribeBtn.textContent = '🎤 Transcribe & Populate';
            }
        });

        // Populate CRM button
        if (populateBtn) {
            populateBtn.addEventListener('click', () => {
                if (!lastResult || !lastResult.extractedData) {
                    alert('No data to populate. Please transcribe first.');
                    return;
                }

                const populated = this.populateCRMModal(lastResult.extractedData);
                if (populated) {
                    // Try to populate the CRM modal
                    if (typeof FeaturePanel !== 'undefined' && typeof FeaturePanel.openQuickAdd === 'function') {
                        const date = populated.date || new Date().toISOString().split('T')[0];
                        FeaturePanel.openQuickAdd(date);
                        
                        // Fill in the fields after modal opens
                        setTimeout(() => {
                            const fields = {
                                'newApptBusiness': populated.business,
                                'newApptContact': populated.contactName,
                                'newApptRole': populated.role,
                                'newApptPhone': populated.phone,
                                'newApptEmail': populated.email,
                                'newApptTime': populated.time,
                                'newApptStatus': populated.status,
                                'newApptAssigned': populated.assigned,
                                'newApptNotes': populated.notes
                            };
                            
                            for (const [id, value] of Object.entries(fields)) {
                                const el = document.getElementById(id);
                                if (el && value) {
                                    if (el.tagName === 'SELECT') {
                                        const option = el.querySelector(`option[value="${value}"]`);
                                        if (option) option.selected = true;
                                    } else {
                                        el.value = value;
                                    }
                                }
                            }
                        }, 300);
                        
                        if (typeof showToast === 'function') {
                            showToast('✅ CRM fields populated from transcript!', 'success');
                        }
                    } else {
                        // Fallback - show data in alert
                        let msg = '📋 Populated CRM Data:\n\n';
                        for (const [key, value] of Object.entries(populated)) {
                            if (value && !Array.isArray(value) && key !== 'notes') {
                                msg += `${key}: ${value}\n`;
                            }
                        }
                        if (populated.tags && populated.tags.length > 0) {
                            msg += `\nTags: ${populated.tags.join(', ')}`;
                        }
                        if (populated.notes) {
                            msg += `\n\nNotes:\n${populated.notes.substring(0, 300)}${populated.notes.length > 300 ? '...' : ''}`;
                        }
                        alert(msg);
                    }

                    if (options.onPopulate) {
                        options.onPopulate(populated);
                    }
                }
            });
        }
    }

    // ================================================================
    // PROGRESS TRACKING
    // ================================================================

    updateProgress(percent, message) {
        this.progressCallbacks.forEach(cb => cb(percent, message));
        
        // Update UI if exists
        const progressBar = document.getElementById('puterProgressBar');
        const progressText = document.getElementById('puterProgressText');
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = message || `${percent}%`;
    }

    onProgress(callback) {
        this.progressCallbacks.push(callback);
        return () => {
            this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
        };
    }

    // ================================================================
    // LOGGING
    // ================================================================

    log(message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            message: message,
            data: data
        };
        
        if (!this._logs) this._logs = [];
        this._logs.push(logEntry);
        
        console.log(`[PuterIntegration] ${message}`, data || '');
    }

    getLogs() {
        return this._logs || [];
    }

    clearLogs() {
        this._logs = [];
    }

    // ================================================================
    // TRANSCRIPT HISTORY
    // ================================================================

    getTranscriptHistory() {
        return this.transcriptHistory;
    }

    getLastTranscript() {
        return this.transcriptHistory[this.transcriptHistory.length - 1] || null;
    }

    getLastExtractedData() {
        return this.extractedData;
    }

    isProcessing() {
        return this.isProcessing;
    }

    // ================================================================
    // EXPORT
    // ================================================================

    exportTranscripts() {
        return JSON.stringify(this.transcriptHistory, null, 2);
    }
}

// ================================================================
// SINGLETON INSTANCE
// ================================================================

const puterIntegration = new PuterIntegration();

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

window.PuterIntegration = PuterIntegration;
window.puterIntegration = puterIntegration;

console.log('🎤 Puter Integration module loaded');
console.log(`📊 Status: ${puterIntegration.isAvailable() ? '✅ Ready' : '❌ Not available - waiting for Puter.js'}`);

// ================================================================
// AUTO-INITIALIZE WHEN PUTER.JS LOADS
// ================================================================

// Check periodically for Puter.js
const checkInterval = setInterval(() => {
    if (typeof puter !== 'undefined' && puter.ai && typeof puter.ai.speech2txt === 'function') {
        puterIntegration.isReady = true;
        console.log('✅ Puter.js detected and ready');
        clearInterval(checkInterval);
        document.dispatchEvent(new CustomEvent('puter-ready'));
    }
}, 1000);

// Also listen for script load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof puter !== 'undefined' && puter.ai && typeof puter.ai.speech2txt === 'function') {
            puterIntegration.isReady = true;
            console.log('✅ Puter.js detected on DOM load');
            document.dispatchEvent(new CustomEvent('puter-ready'));
        }
    }, 2000);
});

console.log('🎤 Puter Integration ready for use');