// ================================================================
// GEMINI AI SERVICE - Centralized AI Module
// ================================================================

/**
 * Gemini AI Service Configuration
 */
const GEMINI_CONFIG = {
    // API Configuration
    apiKey: null,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-1.5-flash',
    
    // Request Configuration
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    
    // Rate Limiting
    rateLimit: {
        maxRequestsPerMinute: 60,
        currentRequests: 0,
        resetTime: null
    },
    
    // Token Limits
    maxInputTokens: 8000,
    maxOutputTokens: 2000,
    
    // Temperature (0.0 - 1.0)
    temperature: 0.3,
    topK: 40,
    topP: 0.95
};

/**
 * Gemini AI Service Class
 */
class GeminiService {
    constructor() {
        this.isInitialized = false;
        this.apiKey = null;
        this.isRateLimited = false;
        this.requestQueue = [];
        this.isProcessing = false;
        this._initAttempted = false;
        this._initPromise = null;
        this._lastRequestTime = 0;
        this._requestCount = 0;
        this._prompts = null;
    }

    /**
     * Initialize the Gemini service
     */
    async init(apiKey = null) {
        if (this.isInitialized) return true;
        if (this._initAttempted && this._initPromise) return this._initPromise;
        
        this._initAttempted = true;
        this._initPromise = this._doInit(apiKey);
        return this._initPromise;
    }

    async _doInit(apiKey) {
        try {
            // Try to get API key from various sources
            if (apiKey) {
                this.apiKey = apiKey;
            } else if (window.APP_CONFIG && window.APP_CONFIG.gemini && window.APP_CONFIG.gemini.apiKey) {
                this.apiKey = window.APP_CONFIG.gemini.apiKey;
            } else if (window.GEMINI_API_KEY) {
                this.apiKey = window.GEMINI_API_KEY;
            } else if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
                this.apiKey = process.env.GEMINI_API_KEY;
            } else {
                // Try to load from localStorage (for development)
                const storedKey = localStorage.getItem('gemini_api_key');
                if (storedKey) {
                    this.apiKey = storedKey;
                }
            }

            if (!this.apiKey) {
                console.warn('⚠️ Gemini API key not found. AI features will be limited.');
                this.isInitialized = false;
                return false;
            }

            // Test the API key with a lightweight request
            const testResult = await this._testConnection();
            
            if (testResult) {
                this.isInitialized = true;
                console.log('✅ Gemini AI Service initialized successfully');
                return true;
            } else {
                console.warn('⚠️ Gemini API key validation failed');
                this.isInitialized = false;
                return false;
            }
        } catch (error) {
            console.error('❌ Failed to initialize Gemini AI Service:', error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Test the API connection
     */
    async _testConnection() {
        try {
            const response = await this._makeRequest('models', {
                method: 'GET',
                timeout: 5000,
                retries: 1
            });
            return response && response.models && response.models.length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Set API key (for runtime updates)
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        if (apiKey) {
            localStorage.setItem('gemini_api_key', apiKey);
            this.isInitialized = false;
            this._initAttempted = false;
            this.init();
        }
    }

    /**
     * Check if service is ready
     */
    isReady() {
        return this.isInitialized && this.apiKey;
    }

    /**
     * Get API key status
     */
    getApiKeyStatus() {
        return {
            hasKey: !!this.apiKey,
            isInitialized: this.isInitialized,
            keyPreview: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : null
        };
    }

    /**
     * Make a request to the Gemini API with retry logic
     */
    async _makeRequest(endpoint, options = {}) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not configured');
        }

        // Rate limiting
        await this._checkRateLimit();

        const url = `${GEMINI_CONFIG.baseUrl}/${endpoint}?key=${this.apiKey}`;
        
        let lastError = null;
        let retryCount = 0;
        const maxRetries = options.retries || GEMINI_CONFIG.maxRetries;

        while (retryCount <= maxRetries) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), options.timeout || GEMINI_CONFIG.timeout);

                const response = await fetch(url, {
                    method: options.method || 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    body: options.body ? JSON.stringify(options.body) : undefined,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || response.statusText;
                    
                    // Handle rate limiting
                    if (response.status === 429) {
                        const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
                        await this._wait(retryAfter * 1000);
                        retryCount++;
                        continue;
                    }
                    
                    // Handle authentication errors
                    if (response.status === 401 || response.status === 403) {
                        this.isInitialized = false;
                        throw new Error('Invalid API key. Please check your Gemini API key.');
                    }
                    
                    throw new Error(`Gemini API Error (${response.status}): ${errorMessage}`);
                }

                this._updateRateLimit();
                return await response.json();

            } catch (error) {
                lastError = error;
                
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                
                if (retryCount < maxRetries && this._isRetryableError(error)) {
                    const delay = GEMINI_CONFIG.retryDelay * Math.pow(2, retryCount);
                    console.warn(`Retry ${retryCount + 1}/${maxRetries} after ${delay}ms`);
                    await this._wait(delay);
                    retryCount++;
                    continue;
                }
                
                throw error;
            }
        }

        throw lastError || new Error('Request failed after retries');
    }

    /**
     * Check if error is retryable
     */
    _isRetryableError(error) {
        const retryableStatuses = [408, 429, 500, 502, 503, 504];
        if (error.message && error.message.includes('timeout')) return true;
        if (error.status && retryableStatuses.includes(error.status)) return true;
        // Check for network errors
        if (error.message && (error.message.includes('network') || error.message.includes('connection'))) {
            return true;
        }
        return false;
    }

    /**
     * Wait for specified milliseconds
     */
    _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check rate limit
     */
    async _checkRateLimit() {
        const now = Date.now();
        const windowMs = 60000; // 1 minute
        
        // Reset counter if window expired
        if (!this._lastRequestTime || now - this._lastRequestTime > windowMs) {
            this._requestCount = 0;
            this._lastRequestTime = now;
        }
        
        if (this._requestCount >= GEMINI_CONFIG.rateLimit.maxRequestsPerMinute) {
            const waitTime = windowMs - (now - this._lastRequestTime);
            console.warn(`Rate limit reached, waiting ${waitTime}ms`);
            await this._wait(waitTime + 100);
            this._requestCount = 0;
            this._lastRequestTime = Date.now();
        }
    }

    /**
     * Update rate limit counter
     */
    _updateRateLimit() {
        this._requestCount++;
        this._lastRequestTime = Date.now();
    }

    /**
     * Generate content using Gemini
     */
    async generateContent(prompt, options = {}) {
        if (!this.isReady()) {
            await this.init();
            if (!this.isReady()) {
                throw new Error('Gemini AI Service is not initialized');
            }
        }

        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Prompt is required');
        }

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: options.temperature || GEMINI_CONFIG.temperature,
                topK: options.topK || GEMINI_CONFIG.topK,
                topP: options.topP || GEMINI_CONFIG.topP,
                maxOutputTokens: options.maxOutputTokens || GEMINI_CONFIG.maxOutputTokens
            }
        };

        try {
            const response = await this._makeRequest(
                `models/${GEMINI_CONFIG.model}:generateContent`,
                {
                    body: requestBody,
                    timeout: options.timeout || GEMINI_CONFIG.timeout,
                    retries: options.retries || GEMINI_CONFIG.maxRetries
                }
            );

            return this._parseResponse(response);
        } catch (error) {
            console.error('Gemini generation error:', error);
            throw error;
        }
    }

    /**
     * Parse Gemini response
     */
    _parseResponse(response) {
        try {
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    const text = candidate.content.parts[0].text;
                    
                    // Try to parse as JSON
                    try {
                        const parsed = JSON.parse(text);
                        return parsed;
                    } catch (e) {
                        // If not JSON, try to extract JSON from text
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            try {
                                return JSON.parse(jsonMatch[0]);
                            } catch (e2) {
                                // Try to extract array JSON
                                const arrayMatch = text.match(/\[[\s\S]*\]/);
                                if (arrayMatch) {
                                    try {
                                        return JSON.parse(arrayMatch[0]);
                                    } catch (e3) {
                                        return { text, raw: text };
                                    }
                                }
                                return { text, raw: text };
                            }
                        }
                        // Check for array JSON
                        const arrayMatch = text.match(/\[[\s\S]*\]/);
                        if (arrayMatch) {
                            try {
                                return JSON.parse(arrayMatch[0]);
                            } catch (e2) {
                                return { text, raw: text };
                            }
                        }
                        return { text, raw: text };
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            return null;
        }
    }

    /**
     * Generate structured transcript analysis
     */
    async analyzeTranscript(transcript, options = {}) {
        if (!this.isReady()) {
            await this.init();
            if (!this.isReady()) {
                throw new Error('Gemini AI Service is not initialized');
            }
        }

        if (!transcript || transcript.trim().length === 0) {
            throw new Error('Transcript is required');
        }

        // Use prompts module if available, otherwise fallback
        let prompt;
        if (window.AIPrompts) {
            prompt = window.AIPrompts.getTranscriptAnalysisPrompt(transcript, options.defaultDate);
        } else {
            // Fallback prompt
            const defaultDate = options.defaultDate || new Date().toISOString().split('T')[0];
            prompt = `Analyze this transcript and extract CRM data. Return JSON.
            
TRANSCRIPT:
"""
${transcript}
"""

EXTRACT: business, contactName, role, phone, email, date (use ${defaultDate}), time, status, assignedTo, developerNotes, callSummary, meetingQualityScore, detectedObjections, missingInformation, suggestedFollowUp, tags, sentiment

Return ONLY valid JSON.`;
        }

        try {
            const result = await this.generateContent(prompt, {
                temperature: 0.2,
                maxOutputTokens: 2000,
                ...options
            });

            return this._validateTranscriptAnalysis(result);
        } catch (error) {
            console.error('Transcript analysis error:', error);
            throw error;
        }
    }

    /**
     * Validate and normalize transcript analysis result
     */
    _validateTranscriptAnalysis(result) {
        if (!result) return null;

        const fields = [
            'business', 'contactName', 'role', 'phone', 'email', 
            'date', 'time', 'status', 'assignedTo', 'developerNotes',
            'callSummary', 'meetingQualityScore', 'detectedObjections',
            'missingInformation', 'suggestedFollowUp', 'tags', 'sentiment'
        ];

        const validated = {};

        for (const field of fields) {
            if (result[field]) {
                validated[field] = {
                    value: result[field].value || 'N/A',
                    confidence: Math.min(1, Math.max(0, result[field].confidence || 0)),
                    evidence: result[field].evidence || ''
                };
            } else {
                // Check if field exists as direct property
                if (result[field] !== undefined) {
                    validated[field] = {
                        value: result[field] || 'N/A',
                        confidence: 0.5,
                        evidence: ''
                    };
                } else {
                    validated[field] = {
                        value: 'N/A',
                        confidence: 0,
                        evidence: ''
                    };
                }
            }
        }

        return validated;
    }

    /**
     * Generate follow-up actions
     */
    async generateFollowUpActions(transcript, options = {}) {
        if (!this.isReady()) {
            await this.init();
            if (!this.isReady()) {
                throw new Error('Gemini AI Service is not initialized');
            }
        }

        let prompt;
        if (window.AIPrompts) {
            prompt = window.AIPrompts.getFollowUpActionsPrompt(transcript);
        } else {
            prompt = `Based on this transcript, suggest 3-5 follow-up actions. Return JSON array.
            
TRANSCRIPT:
"""
${transcript}
"""

Return: [{"action":"","type":"","priority":"","dueIn":0}]`;
        }

        try {
            const result = await this.generateContent(prompt, {
                temperature: 0.3,
                maxOutputTokens: 500,
                ...options
            });
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error('Follow-up generation error:', error);
            return [];
        }
    }

    /**
     * Generate email draft
     */
    async generateEmailDraft(transcript, type = 'followup') {
        if (!this.isReady()) {
            await this.init();
            if (!this.isReady()) {
                throw new Error('Gemini AI Service is not initialized');
            }
        }

        let prompt;
        if (window.AIPrompts) {
            prompt = window.AIPrompts.getEmailDraftPrompt(transcript, type);
        } else {
            prompt = `Generate a professional ${type} email based on this transcript. Return JSON.
            
TRANSCRIPT:
"""
${transcript}
"""

Return: {"subject":"","body":"","tone":"professional"}`;
        }

        try {
            const result = await this.generateContent(prompt, {
                temperature: 0.5,
                maxOutputTokens: 800
            });
            return result;
        } catch (error) {
            console.error('Email generation error:', error);
            return null;
        }
    }

    /**
     * Generate call summary
     */
    async generateCallSummary(transcript) {
        if (!this.isReady()) {
            await this.init();
            if (!this.isReady()) {
                throw new Error('Gemini AI Service is not initialized');
            }
        }

        let prompt;
        if (window.AIPrompts) {
            prompt = window.AIPrompts.getCallSummaryPrompt(transcript);
        } else {
            prompt = `Summarize this call in 2-3 sentences. Return JSON.
            
TRANSCRIPT:
"""
${transcript}
"""

Return: {"summary":"","keyTopics":[],"nextSteps":""}`;
        }

        try {
            const result = await this.generateContent(prompt, {
                temperature: 0.3,
                maxOutputTokens: 300
            });
            return result;
        } catch (error) {
            console.error('Call summary generation error:', error);
            return null;
        }
    }

    /**
     * Generate coaching insights
     */
    async generateCoachingInsights(transcript) {
        if (!this.isReady()) {
            await this.init();
            if (!this.isReady()) {
                throw new Error('Gemini AI Service is not initialized');
            }
        }

        let prompt;
        if (window.AIPrompts) {
            prompt = window.AIPrompts.getCoachingInsightsPrompt(transcript);
        } else {
            prompt = `Analyze this sales call and provide coaching insights. Return JSON.
            
TRANSCRIPT:
"""
${transcript}
"""

Return: {"strengths":[],"improvements":[],"objectionsHandled":[],"missedOpportunities":[],"overallRating":0}`;
        }

        try {
            const result = await this.generateContent(prompt, {
                temperature: 0.3,
                maxOutputTokens: 500
            });
            return result;
        } catch (error) {
            console.error('Coaching insights generation error:', error);
            return null;
        }
    }
}

// ================================================================
// RESPONSE MAPPER - Maps AI output to CRM model
// ================================================================

class AICRMResponseMapper {
    constructor() {
        this.fieldMap = {
            'business': 'business',
            'contactName': 'name',
            'role': 'role',
            'phone': 'phone',
            'email': 'email',
            'date': 'date',
            'time': 'time',
            'status': 'status',
            'assignedTo': 'assigned',
            'developerNotes': 'notes',
            'tags': 'tags',
            'sentiment': 'sentiment'
        };
    }

    /**
     * Map AI response to appointment model
     */
    mapToAppointment(aiResponse) {
        const mapped = {};
        const confidence = {};
        const evidence = {};

        for (const [aiField, appField] of Object.entries(this.fieldMap)) {
            if (aiResponse[aiField]) {
                mapped[appField] = aiResponse[aiField].value || 'N/A';
                confidence[appField] = aiResponse[aiField].confidence || 0;
                evidence[appField] = aiResponse[aiField].evidence || '';
            }
        }

        // Map additional fields
        mapped.callSummary = aiResponse.callSummary?.value || '';
        mapped.meetingQualityScore = aiResponse.meetingQualityScore?.value || null;
        mapped.detectedObjections = aiResponse.detectedObjections?.value || [];
        mapped.missingInformation = aiResponse.missingInformation?.value || [];
        mapped.suggestedFollowUp = aiResponse.suggestedFollowUp?.value || [];
        mapped._aiConfidence = confidence;
        mapped._aiEvidence = evidence;
        mapped._aiRaw = aiResponse;

        return mapped;
    }

    /**
     * Get confidence level label
     */
    getConfidenceLabel(confidence) {
        if (confidence >= 0.8) return 'High';
        if (confidence >= 0.5) return 'Medium';
        return 'Low';
    }

    /**
     * Get confidence color class
     */
    getConfidenceClass(confidence) {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.5) return 'medium';
        return 'low';
    }

    /**
     * Format confidence for display
     */
    formatConfidence(confidence) {
        return {
            label: this.getConfidenceLabel(confidence),
            class: this.getConfidenceClass(confidence),
            score: Math.round(confidence * 100)
        };
    }
}

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

// Create singleton instances
const geminiService = new GeminiService();
const aiResponseMapper = new AICRMResponseMapper();

// Expose to window
window.GeminiService = GeminiService;
window.geminiService = geminiService;
window.AICRMResponseMapper = AICRMResponseMapper;
window.aiResponseMapper = aiResponseMapper;
window.GEMINI_CONFIG = GEMINI_CONFIG;

console.log('🤖 Gemini AI Service module loaded');
console.log('📊 AI Response Mapper loaded');