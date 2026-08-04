// ================================================================
// APPLICATION CONFIGURATION - CENTRALIZED
// ================================================================

const APP_CONFIG = {
    // Gemini AI Configuration
    gemini: {
        // Your Gemini API Key - Set this here or in localStorage
        apiKey: 'AQ.Ab8RN6JFZQI0-gFgMDUVTeuMDan3e7_8DAEGRffNQRwkEhPtzw',
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
    
    // 1. Load API key from localStorage first (user's saved key)
    const storedKey = localStorage.getItem(APP_CONFIG.storageKeys.geminiApiKey);
    if (storedKey && storedKey.trim().length > 10) {
        APP_CONFIG.gemini.apiKey = storedKey.trim();
        console.log('🔑 Gemini API key loaded from localStorage');
    }
    
    // 2. If no stored key, check if we have a default key set in the config
    if (!APP_CONFIG.gemini.apiKey || APP_CONFIG.gemini.apiKey.length < 10) {
        // The default key is already set in the config above
        // But we need to save it to localStorage for persistence
        if (APP_CONFIG.gemini.apiKey && APP_CONFIG.gemini.apiKey.length > 10) {
            localStorage.setItem(APP_CONFIG.storageKeys.geminiApiKey, APP_CONFIG.gemini.apiKey);
            console.log('🔑 Gemini API key saved from config to localStorage');
        }
    }
    
    // 3. Check for global variable (for development/testing)
    if (window.GEMINI_API_KEY && window.GEMINI_API_KEY.trim().length > 10) {
        APP_CONFIG.gemini.apiKey = window.GEMINI_API_KEY.trim();
        localStorage.setItem(APP_CONFIG.storageKeys.geminiApiKey, APP_CONFIG.gemini.apiKey);
        console.log('🔑 Gemini API key loaded from global variable');
    }
    
    // 4. Validate API key format
    if (APP_CONFIG.gemini.apiKey) {
        const isValid = APP_CONFIG.gemini.apiKey.length > 10;
        if (!isValid) {
            console.warn('⚠️ Gemini API key appears to be invalid (too short)');
            APP_CONFIG.gemini.apiKey = null;
        } else {
            console.log('✅ Gemini API key validated (length: ' + APP_CONFIG.gemini.apiKey.length + ' chars)');
        }
    } else {
        console.warn('⚠️ No Gemini API key found. AI features will be limited.');
        console.info('ℹ️ To set your API key, run: setGeminiApiKey("YOUR_API_KEY") in the console');
    }
    
    // 5. Log configuration status
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
 * Get the Gemini API key
 * @returns {string|null}
 */
function getGeminiApiKey() {
    return APP_CONFIG.gemini.apiKey || null;
}

/**
 * Set the Gemini API key with validation
 * @param {string} key - The API key to set
 * @returns {boolean} - Whether the key was set successfully
 */
function setGeminiApiKey(key) {
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
    
    // Save to localStorage
    try {
        localStorage.setItem(APP_CONFIG.storageKeys.geminiApiKey, trimmedKey);
        console.log('✅ Gemini API key saved successfully');
        
        // Update global service if available
        if (window.geminiService && typeof window.geminiService.setApiKey === 'function') {
            window.geminiService.setApiKey(trimmedKey);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Failed to save API key:', error);
        return false;
    }
}

/**
 * Clear the Gemini API key
 * @returns {boolean}
 */
function clearGeminiApiKey() {
    APP_CONFIG.gemini.apiKey = null;
    try {
        localStorage.removeItem(APP_CONFIG.storageKeys.geminiApiKey);
        console.log('🗑️ Gemini API key cleared');
        return true;
    } catch (error) {
        console.error('❌ Failed to clear API key:', error);
        return false;
    }
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

console.log('⚙️ Configuration helpers exposed globally');