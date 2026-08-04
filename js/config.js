// ================================================================
// APPLICATION CONFIGURATION - CENTRALIZED
// ================================================================

const APP_CONFIG = {
    // Gemini AI Configuration
    gemini: {
        // IMPORTANT: Set your API key using:
        // 1. Browser console: setGeminiApiKey('YOUR_API_KEY')
        // 2. Environment variable on Render.com
        // 3. localStorage (auto-persisted after setting)
        apiKey: null,
        model: 'gemini-1.5-flash',
        temperature: 0.3,
        maxTokens: 2000,
        timeout: 30000
    },
    
    // Feature Flags
    features: {
        enableAI: true,
        enableFallback: true,
        enableConfidenceScoring: true,
        enableDuplicateDetection: true,
        enableAIInsights: true,
        enableQualityScoring: true
    },
    
    // UI Configuration
    ui: {
        showConfidence: true,
        showEvidence: true,
        showAIStatus: true,
        showQualityScore: true,
        showMissingFields: true
    },
    
    // LocalStorage Keys
    storageKeys: {
        geminiApiKey: 'gemini_api_key',
        userData: 'userData_fallback',
        appointments: 'appointments_fallback',
        tasks: 'tasks_fallback',
        teamMembers: 'teamMembers_fallback',
        scripts: 'scripts_fallback',
        scriptFavorites: 'scriptFavorites',
        customShortcuts: 'customShortcuts',
        toolsMenuOpen: 'toolsMenuOpen',
        analyticsFilters: 'analyticsFilters',
        prospectsCache: 'prospects_cache',
        objectionFavorites: 'objectionFavorites'
    }
};

// ================================================================
// CONFIGURATION INITIALIZATION
// ================================================================

(function initializeConfig() {
    console.log('⚙️ Initializing application configuration...');
    
    // 1. Load API key from localStorage
    const storedKey = localStorage.getItem(APP_CONFIG.storageKeys.geminiApiKey);
    if (storedKey && storedKey.trim().length > 10) {
        APP_CONFIG.gemini.apiKey = storedKey.trim();
        console.log('🔑 Gemini API key loaded from localStorage');
    }
    
    // 2. Check for global variable (for development/testing)
    if (window.GEMINI_API_KEY && window.GEMINI_API_KEY.trim().length > 10) {
        APP_CONFIG.gemini.apiKey = window.GEMINI_API_KEY.trim();
        localStorage.setItem(APP_CONFIG.storageKeys.geminiApiKey, APP_CONFIG.gemini.apiKey);
        console.log('🔑 Gemini API key loaded from global variable');
    }
    
    // 3. Check for environment variable (for Render.com)
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
        const envKey = process.env.GEMINI_API_KEY.trim();
        if (envKey.length > 10) {
            APP_CONFIG.gemini.apiKey = envKey;
            localStorage.setItem(APP_CONFIG.storageKeys.geminiApiKey, envKey);
            console.log('🔑 Gemini API key loaded from environment variable');
        }
    }
    
    // 4. Validate API key format
    if (APP_CONFIG.gemini.apiKey) {
        const isValid = APP_CONFIG.gemini.apiKey.length > 10;
        if (!isValid) {
            console.warn('⚠️ Gemini API key appears to be invalid (too short)');
            APP_CONFIG.gemini.apiKey = null;
        } else {
            const maskedKey = APP_CONFIG.gemini.apiKey.substring(0, 8) + '...' + APP_CONFIG.gemini.apiKey.substring(APP_CONFIG.gemini.apiKey.length - 4);
            console.log('✅ Gemini API key validated: ' + maskedKey);
        }
    } else {
        console.warn('⚠️ No Gemini API key found. AI features will be limited.');
        console.info('ℹ️ To set your API key:');
        console.info('  - Browser: setGeminiApiKey("YOUR_API_KEY")');
        console.info('  - Render: Add GEMINI_API_KEY environment variable');
    }
    
    console.log('⚙️ Configuration loaded successfully');
    console.log(`🤖 Gemini AI: ${APP_CONFIG.gemini.apiKey ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🔧 Features: ${Object.keys(APP_CONFIG.features).filter(k => APP_CONFIG.features[k]).join(', ')}`);
})();

// ================================================================
// CONFIGURATION HELPER FUNCTIONS
// ================================================================

/**
 * Check if AI is configured and available
 * @returns {boolean}
 */
function isAIConfigured() {
    return !!(APP_CONFIG.gemini.apiKey && APP_CONFIG.gemini.apiKey.trim().length > 10);
}

/**
 * Get the Gemini API key (masked for security)
 * @param {boolean} masked - Whether to mask the key for display
 * @returns {string|null}
 */
function getGeminiApiKey(masked = false) {
    const key = APP_CONFIG.gemini.apiKey || null;
    if (masked && key) {
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    }
    return key;
}

/**
 * Set the Gemini API key with validation
 * @param {string} key - The API key to set
 * @param {boolean} persist - Whether to persist to localStorage
 * @returns {boolean} - Whether the key was set successfully
 */
function setGeminiApiKey(key, persist = true) {
    if (!key || typeof key !== 'string') {
        console.error('❌ Invalid API key: key must be a string');
        return false;
    }
    
    const trimmedKey = key.trim();
    if (trimmedKey.length < 10) {
        console.error('❌ Invalid API key: key is too short (min 10 chars)');
        return false;
    }
    
    // Save to configuration
    APP_CONFIG.gemini.apiKey = trimmedKey;
    
    // Save to localStorage if requested
    if (persist) {
        try {
            localStorage.setItem(APP_CONFIG.storageKeys.geminiApiKey, trimmedKey);
            console.log('✅ Gemini API key saved to localStorage');
        } catch (error) {
            console.error('❌ Failed to save API key to localStorage:', error);
            return false;
        }
    }
    
    // Update global service if available
    if (window.geminiService && typeof window.geminiService.setApiKey === 'function') {
        try {
            window.geminiService.setApiKey(trimmedKey);
            console.log('✅ Gemini API key updated in service');
        } catch (error) {
            console.warn('⚠️ Could not update service:', error);
        }
    }
    
    const maskedKey = trimmedKey.substring(0, 8) + '...' + trimmedKey.substring(trimmedKey.length - 4);
    console.log(`✅ Gemini API key set successfully: ${maskedKey}`);
    return true;
}

/**
 * Clear the Gemini API key
 * @param {boolean} persist - Whether to remove from localStorage
 * @returns {boolean}
 */
function clearGeminiApiKey(persist = true) {
    APP_CONFIG.gemini.apiKey = null;
    if (persist) {
        try {
            localStorage.removeItem(APP_CONFIG.storageKeys.geminiApiKey);
            console.log('🗑️ Gemini API key cleared from localStorage');
        } catch (error) {
            console.error('❌ Failed to clear API key:', error);
            return false;
        }
    }
    console.log('🗑️ Gemini API key cleared');
    return true;
}

/**
 * Check if AI features are enabled
 * @returns {boolean}
 */
function isAIEnabled() {
    return APP_CONFIG.features.enableAI && isAIConfigured();
}

/**
 * Get AI configuration for services
 * @returns {object}
 */
function getAIConfig() {
    return {
        apiKey: APP_CONFIG.gemini.apiKey,
        model: APP_CONFIG.gemini.model,
        temperature: APP_CONFIG.gemini.temperature,
        maxTokens: APP_CONFIG.gemini.maxTokens,
        timeout: APP_CONFIG.gemini.timeout,
        isConfigured: isAIConfigured(),
        isEnabled: isAIEnabled()
    };
}

/**
 * Get API key status
 * @returns {object}
 */
function getApiKeyStatus() {
    const key = APP_CONFIG.gemini.apiKey;
    return {
        hasKey: !!key,
        isValid: key ? key.length > 10 : false,
        length: key ? key.length : 0,
        masked: key ? key.substring(0, 8) + '...' + key.substring(key.length - 4) : null,
        source: key ? (localStorage.getItem(APP_CONFIG.storageKeys.geminiApiKey) ? 'localStorage' : 'config') : 'none'
    };
}

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

// Make configuration and helpers available globally
window.APP_CONFIG = APP_CONFIG;
window.isAIConfigured = isAIConfigured;
window.getGeminiApiKey = getGeminiApiKey;
window.setGeminiApiKey = setGeminiApiKey;
window.clearGeminiApiKey = clearGeminiApiKey;
window.isAIEnabled = isAIEnabled;
window.getAIConfig = getAIConfig;
window.getApiKeyStatus = getApiKeyStatus;

console.log('⚙️ Configuration helpers exposed globally');

// Log API key status on load
const status = getApiKeyStatus();
if (status.hasKey) {
    console.log(`🔑 API Key: ${status.masked} (${status.source})`);
} else {
    console.log('🔑 No API Key configured. Set it with: setGeminiApiKey("YOUR_KEY")');
}