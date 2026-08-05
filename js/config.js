// ================================================================
// APPLICATION CONFIGURATION - CENTRALIZED (No AI)
// ================================================================

const APP_CONFIG = {
    // Feature Flags - AI DISABLED
    features: {
        enableAI: false,
        enableFallback: true,
        enableConfidenceScoring: true,
        enableDuplicateDetection: true,
        enableAIInsights: false,
        enableQualityScoring: true
    },
    
    // UI Configuration
    ui: {
        showConfidence: true,
        showEvidence: true,
        showAIStatus: false,
        showQualityScore: true,
        showMissingFields: true
    },
    
    // LocalStorage Keys
    storageKeys: {
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
    console.log('🤖 AI features: DISABLED');
    console.log('📊 Using rule-based parsing only');
    console.log('⚙️ Configuration loaded successfully');
})();

// ================================================================
// CONFIGURATION HELPER FUNCTIONS
// ================================================================

/**
 * Check if AI is configured (always false)
 * @returns {boolean}
 */
function isAIConfigured() {
    return false;
}

/**
 * Check if AI features are enabled (always false)
 * @returns {boolean}
 */
function isAIEnabled() {
    return false;
}

/**
 * Get AI configuration (returns disabled state)
 * @returns {object}
 */
function getAIConfig() {
    return {
        isConfigured: false,
        isEnabled: false,
        features: {
            enableAI: false,
            enableAIInsights: false
        }
    };
}

/**
 * Get API key status (always none)
 * @returns {object}
 */
function getApiKeyStatus() {
    return {
        hasKey: false,
        isValid: false,
        length: 0,
        masked: null,
        source: 'none'
    };
}

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

window.APP_CONFIG = APP_CONFIG;
window.isAIConfigured = isAIConfigured;
window.isAIEnabled = isAIEnabled;
window.getAIConfig = getAIConfig;
window.getApiKeyStatus = getApiKeyStatus;

console.log('⚙️ Configuration loaded (AI disabled)');