// ================================================================
// APPLICATION CONFIGURATION - CENTRALIZED
// ================================================================

const APP_CONFIG = {
    // Gemini AI Configuration
    gemini: {
        // API Key will be loaded from localStorage - DO NOT HARDCODE
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
    
    // 1. Load API key from localStorage first
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
    
    // 3. Validate API key format
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
    
    console.log('⚙️ Configuration loaded successfully');
    console.log(`🤖 Gemini AI: ${APP_CONFIG.gemini.apiKey ? '✅ Configured' : '❌ Not configured'}`);
})();

// ================================================================
// CONFIGURATION HELPER FUNCTIONS
// ================================================================

function isAIConfigured() {
    return !!(APP_CONFIG.gemini.apiKey && APP_CONFIG.gemini.apiKey.trim().length > 10);
}

function getGeminiApiKey() {
    return APP_CONFIG.gemini.apiKey || null;
}

function setGeminiApiKey(key) {
    if (!key || typeof key !== 'string') {
        console.error('❌ Invalid API key');
        return false;
    }
    
    const trimmedKey = key.trim();
    if (trimmedKey.length < 10) {
        console.error('❌ API key too short');
        return false;
    }
    
    APP_CONFIG.gemini.apiKey = trimmedKey;
    try {
        localStorage.setItem(APP_CONFIG.storageKeys.geminiApiKey, trimmedKey);
        if (window.geminiService && typeof window.geminiService.setApiKey === 'function') {
            window.geminiService.setApiKey(trimmedKey);
        }
        console.log('✅ Gemini API key saved');
        return true;
    } catch (error) {
        console.error('❌ Failed to save API key:', error);
        return false;
    }
}

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

window.APP_CONFIG = APP_CONFIG;
window.isAIConfigured = isAIConfigured;
window.getGeminiApiKey = getGeminiApiKey;
window.setGeminiApiKey = setGeminiApiKey;
window.clearGeminiApiKey = clearGeminiApiKey;

console.log('⚙️ Configuration helpers exposed globally');