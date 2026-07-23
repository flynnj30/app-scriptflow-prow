// ================================================================
// SCRIPT COACH - AI-POWERED SCRIPT ANALYSIS & PLAYBACK
// ================================================================

// ================================================================
// SCRIPT COACH CONFIGURATION
// ================================================================

const SCRIPT_COACH_CONFIG = {
    // Tone types with their characteristics
    TONES: {
        confident: {
            label: 'Confident',
            icon: '💪',
            color: '#3b82f6',
            description: 'Strong, authoritative, and decisive',
            speed: 0.85,
            pitch: 0.9,
            emphasis: 0.8,
            pauses: 0.3,
            confidence: 0.95
        },
        conversational: {
            label: 'Conversational',
            icon: '💬',
            color: '#10b981',
            description: 'Friendly, natural, and engaging',
            speed: 0.95,
            pitch: 0.7,
            emphasis: 0.6,
            pauses: 0.5,
            confidence: 0.85
        },
        curious: {
            label: 'Curious',
            icon: '🤔',
            color: '#8b5cf6',
            description: 'Inquisitive, thoughtful, and exploratory',
            speed: 0.8,
            pitch: 0.8,
            emphasis: 0.5,
            pauses: 0.6,
            confidence: 0.75
        },
        consultative: {
            label: 'Consultative',
            icon: '💼',
            color: '#f59e0b',
            description: 'Advisory, solution-oriented, and professional',
            speed: 0.9,
            pitch: 0.75,
            emphasis: 0.7,
            pauses: 0.4,
            confidence: 0.9
        },
        friendly: {
            label: 'Friendly',
            icon: '😊',
            color: '#ec4899',
            description: 'Warm, approachable, and positive',
            speed: 1.0,
            pitch: 0.85,
            emphasis: 0.5,
            pauses: 0.5,
            confidence: 0.8
        }
    },
    
    // Analysis metrics
    METRICS: {
        tonality: { label: 'Tonality', icon: '🎵' },
        pacing: { label: 'Pacing', icon: '⏱️' },
        phrasing: { label: 'Phrasing', icon: '📝' },
        emphasis: { label: 'Emphasis', icon: '🔊' },
        pauses: { label: 'Pause Usage', icon: '⏸️' },
        confidence: { label: 'Confidence', icon: '💪' },
        objections: { label: 'Objection Handling', icon: '🛡️' },
        flow: { label: 'Conversational Flow', icon: '🌊' }
    },
    
    // Top-performing US B2B appointment setter tones
    TOP_PERFORMING_TONES: ['confident', 'consultative', 'conversational'],
    
    // Default tone
    DEFAULT_TONE: 'confident',
    
    // Analysis thresholds
    THRESHOLDS: {
        excellent: 0.85,
        good: 0.7,
        fair: 0.5,
        needs_improvement: 0.3
    }
};

// ================================================================
// SCRIPT COACH STATE
// ================================================================

const ScriptCoachState = {
    isAnalyzing: false,
    isPlaying: false,
    currentScriptId: null,
    currentScriptContent: '',
    selectedTone: SCRIPT_COACH_CONFIG.DEFAULT_TONE,
    analysisResults: null,
    analysisComplete: false,
    playbackSpeed: 1.0,
    isPaused: false,
    currentWordIndex: 0,
    words: [],
    playbackInterval: null,
    highlightedIndices: [],
    audioContext: null
};

// ================================================================
// ENHANCED SCRIPT CARD UI
// ================================================================

/**
 * Add Script Coach buttons to the script header
 */
function addScriptCoachUI() {
    const scriptActions = document.querySelector('.script-actions');
    if (!scriptActions) return;
    
    // Check if already added
    if (document.querySelector('.script-coach-btn-group')) return;
    
    const coachGroup = document.createElement('div');
    coachGroup.className = 'script-coach-btn-group';
    coachGroup.innerHTML = `
        <button class="btn-icon coach-scan-btn" id="coachScanBtn" title="Analyze Script">
            <i class="fas fa-brain"></i> Scan
        </button>
        <button class="btn-icon coach-play-btn" id="coachPlayBtn" title="Play Script" disabled>
            <i class="fas fa-play"></i> Play
        </button>
        <div class="coach-tone-selector" style="display:none;">
            <select id="coachToneSelect" class="coach-tone-select">
                ${Object.entries(SCRIPT_COACH_CONFIG.TONES).map(([key, tone]) => `
                    <option value="${key}" ${key === SCRIPT_COACH_CONFIG.DEFAULT_TONE ? 'selected' : ''}>
                        ${tone.icon} ${tone.label}
                    </option>
                `).join('')}
            </select>
        </div>
        <button class="btn-icon coach-status-btn" id="coachStatusBtn" style="display:none; background:var(--success); color:white; padding:4px 12px; font-size:0.7rem;">
            <i class="fas fa-check-circle"></i> Analyzed
        </button>
    `;
    
    // Insert before the favorite button or at the end
    const favoriteBtn = scriptActions.querySelector('#favoriteScriptBtn');
    if (favoriteBtn) {
        scriptActions.insertBefore(coachGroup, favoriteBtn);
    } else {
        scriptActions.appendChild(coachGroup);
    }
    
    // Add event listeners
    const scanBtn = document.getElementById('coachScanBtn');
    const playBtn = document.getElementById('coachPlayBtn');
    const toneSelect = document.getElementById('coachToneSelect');
    const statusBtn = document.getElementById('coachStatusBtn');
    
    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            const script = AppState.scripts[AppState.currentScriptId];
            if (script) {
                runScriptAnalysis(script.content);
            }
        });
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (ScriptCoachState.isPlaying) {
                stopScriptPlayback();
            } else {
                startScriptPlayback();
            }
        });
    }
    
    if (toneSelect) {
        toneSelect.addEventListener('change', (e) => {
            ScriptCoachState.selectedTone = e.target.value;
            if (ScriptCoachState.isPlaying) {
                stopScriptPlayback();
                startScriptPlayback();
            }
        });
    }
}

/**
 * Update Script Coach UI state
 */
function updateCoachUI(analyzed = false) {
    const playBtn = document.getElementById('coachPlayBtn');
    const toneSelect = document.getElementById('coachToneSelect');
    const statusBtn = document.getElementById('coachStatusBtn');
    const scanBtn = document.getElementById('coachScanBtn');
    
    if (analyzed) {
        ScriptCoachState.analysisComplete = true;
        if (playBtn) {
            playBtn.disabled = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        }
        if (toneSelect) {
            toneSelect.style.display = 'inline-block';
            // Auto-select the best tone
            const bestTone = getBestTone();
            if (bestTone) {
                toneSelect.value = bestTone;
                ScriptCoachState.selectedTone = bestTone;
            }
        }
        if (statusBtn) {
            statusBtn.style.display = 'inline-flex';
        }
        if (scanBtn) {
            scanBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Re-Scan';
        }
    } else {
        ScriptCoachState.analysisComplete = false;
        if (playBtn) {
            playBtn.disabled = true;
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        }
        if (toneSelect) {
            toneSelect.style.display = 'none';
        }
        if (statusBtn) {
            statusBtn.style.display = 'none';
        }
        if (scanBtn) {
            scanBtn.innerHTML = '<i class="fas fa-brain"></i> Scan';
        }
    }
}

// ================================================================
// SCRIPT ANALYSIS ENGINE
// ================================================================

/**
 * Run script analysis with loading animation
 */
function runScriptAnalysis(content) {
    if (ScriptCoachState.isAnalyzing) return;
    ScriptCoachState.isAnalyzing = true;
    ScriptCoachState.currentScriptContent = content;
    
    // Show loading animation
    showAnalysisLoading();
    
    // Simulate AI analysis with progressive updates
    const analysisSteps = [
        { progress: 10, message: 'Analyzing tonality...' },
        { progress: 25, message: 'Evaluating pacing...' },
        { progress: 40, message: 'Assessing phrasing...' },
        { progress: 55, message: 'Detecting emphasis patterns...' },
        { progress: 70, message: 'Analyzing pauses...' },
        { progress: 80, message: 'Evaluating confidence...' },
        { progress: 90, message: 'Reviewing objection handling...' },
        { progress: 95, message: 'Measuring conversational flow...' }
    ];
    
    let stepIndex = 0;
    const analysisInterval = setInterval(() => {
        if (stepIndex < analysisSteps.length) {
            const step = analysisSteps[stepIndex];
            updateAnalysisLoading(step.progress, step.message);
            stepIndex++;
        } else {
            clearInterval(analysisInterval);
            // Complete analysis
            completeScriptAnalysis(content);
        }
    }, 400);
}

/**
 * Show analysis loading animation
 */
function showAnalysisLoading() {
    // Remove existing loading overlay
    const existing = document.querySelector('.coach-loading-overlay');
    if (existing) existing.remove();
    
    const scriptBody = document.getElementById('scriptBody');
    if (!scriptBody) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'coach-loading-overlay';
    overlay.id = 'coachLoadingOverlay';
    overlay.innerHTML = `
        <div class="coach-loading-content">
            <div class="coach-loading-icon">
                <div class="coach-brain-animation">
                    <i class="fas fa-brain"></i>
                    <div class="coach-pulse-ring"></div>
                    <div class="coach-pulse-ring delay-1"></div>
                    <div class="coach-pulse-ring delay-2"></div>
                </div>
            </div>
            <div class="coach-loading-title">AI Analysis in Progress</div>
            <div class="coach-loading-message" id="coachLoadingMessage">Initializing analysis...</div>
            <div class="coach-progress-track">
                <div class="coach-progress-fill" id="coachProgressFill" style="width:0%;"></div>
            </div>
            <div class="coach-progress-text" id="coachProgressText">0%</div>
            <div class="coach-loading-dots">
                <span class="dot"></span>
                <span class="dot delay-1"></span>
                <span class="dot delay-2"></span>
                <span class="dot delay-3"></span>
            </div>
        </div>
    `;
    
    scriptBody.appendChild(overlay);
}

/**
 * Update analysis loading progress
 */
function updateAnalysisLoading(progress, message) {
    const fill = document.getElementById('coachProgressFill');
    const text = document.getElementById('coachProgressText');
    const msg = document.getElementById('coachLoadingMessage');
    
    if (fill) fill.style.width = progress + '%';
    if (text) text.textContent = progress + '%';
    if (msg) msg.textContent = message;
}

/**
 * Complete script analysis
 */
function completeScriptAnalysis(content) {
    ScriptCoachState.isAnalyzing = false;
    
    // Generate analysis results
    const results = analyzeScriptContent(content);
    ScriptCoachState.analysisResults = results;
    
    // Hide loading overlay with fade
    const overlay = document.getElementById('coachLoadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            showAnalysisResults(results);
        }, 500);
    } else {
        showAnalysisResults(results);
    }
}

/**
 * Analyze script content for coaching metrics
 */
function analyzeScriptContent(content) {
    if (!content) return null;
    
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
    
    // Calculate metrics
    const metrics = {};
    let totalScore = 0;
    
    // Tonality - based on word choice and sentence structure
    const tonalityScore = analyzeTonality(content);
    metrics.tonality = tonalityScore;
    totalScore += tonalityScore;
    
    // Pacing - based on sentence length variation
    const pacingScore = analyzePacing(sentences);
    metrics.pacing = pacingScore;
    totalScore += pacingScore;
    
    // Phrasing - based on vocabulary variety
    const phrasingScore = analyzePhrasing(words);
    metrics.phrasing = phrasingScore;
    totalScore += phrasingScore;
    
    // Emphasis - based on powerful words and patterns
    const emphasisScore = analyzeEmphasis(content);
    metrics.emphasis = emphasisScore;
    totalScore += emphasisScore;
    
    // Pauses - based on punctuation and structure
    const pausesScore = analyzePauses(content);
    metrics.pauses = pausesScore;
    totalScore += pausesScore;
    
    // Confidence - based on assertive language
    const confidenceScore = analyzeConfidence(content);
    metrics.confidence = confidenceScore;
    totalScore += confidenceScore;
    
    // Objection Handling - based on objection-related phrases
    const objectionsScore = analyzeObjections(content);
    metrics.objections = objectionsScore;
    totalScore += objectionsScore;
    
    // Conversational Flow - based on natural language patterns
    const flowScore = analyzeFlow(content);
    metrics.flow = flowScore;
    totalScore += flowScore;
    
    // Calculate overall score
    const overallScore = Math.round((totalScore / 8) * 100);
    
    // Generate recommendations
    const recommendations = generateRecommendations(metrics);
    
    // Identify best tone
    const bestTone = identifyBestTone(metrics);
    
    // Generate word-level annotations for playback
    const wordAnnotations = generateWordAnnotations(words, metrics);
    
    return {
        overall: overallScore,
        metrics: metrics,
        recommendations: recommendations,
        bestTone: bestTone,
        wordAnnotations: wordAnnotations,
        words: words,
        sentences: sentences,
        paragraphs: paragraphs,
        wordCount: words.length,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length
    };
}

/**
 * Analyze tonality
 */
function analyzeTonality(content) {
    let score = 0.5;
    const lower = content.toLowerCase();
    
    // Positive tonality indicators
    const positiveWords = ['great', 'excellent', 'awesome', 'wonderful', 'fantastic', 'perfect', 'amazing', 'brilliant', 'outstanding', 'superb'];
    const negativeWords = ['sorry', 'unfortunately', 'unfortunately', 'apologize', 'issue', 'problem', 'concern', 'difficult', 'challenging'];
    
    let positiveCount = 0, negativeCount = 0;
    positiveWords.forEach(w => { if (lower.includes(w)) positiveCount++; });
    negativeWords.forEach(w => { if (lower.includes(w)) negativeCount++; });
    
    if (positiveCount > 0 || negativeCount > 0) {
        const ratio = positiveCount / (positiveCount + negativeCount + 1);
        score = 0.3 + (ratio * 0.7);
    }
    
    // Question usage - good for engagement
    const questionCount = (content.match(/\?/g) || []).length;
    if (questionCount > 0) {
        score = Math.min(1, score + 0.1);
    }
    
    return Math.max(0, Math.min(1, score));
}

/**
 * Analyze pacing
 */
function analyzePacing(sentences) {
    if (sentences.length === 0) return 0.5;
    
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    
    // Ideal sentence length is 10-15 words
    if (avg >= 8 && avg <= 18) {
        return 0.8;
    } else if (avg >= 5 && avg <= 25) {
        return 0.6;
    } else {
        return 0.4;
    }
}

/**
 * Analyze phrasing
 */
function analyzePhrasing(words) {
    if (words.length === 0) return 0.5;
    
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const ratio = uniqueWords / words.length;
    
    // More variety is better (0.5 - 0.8 range is good)
    if (ratio >= 0.5 && ratio <= 0.8) {
        return 0.8;
    } else if (ratio >= 0.3) {
        return 0.6;
    } else {
        return 0.4;
    }
}

/**
 * Analyze emphasis
 */
function analyzeEmphasis(content) {
    let score = 0.5;
    const lower = content.toLowerCase();
    
    // Emphasis indicators
    const emphasisWords = ['absolutely', 'definitely', 'certainly', 'without a doubt', 'guarantee', 'promise', 'ensure', 'always', 'never'];
    emphasisWords.forEach(w => {
        if (lower.includes(w)) score += 0.05;
    });
    
    // Exclamation marks
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 0) {
        score = Math.min(1, score + 0.05 * exclamationCount);
    }
    
    return Math.max(0, Math.min(1, score));
}

/**
 * Analyze pauses
 */
function analyzePauses(content) {
    let score = 0.5;
    
    // Punctuation for pauses
    const commaCount = (content.match(/,/g) || []).length;
    const periodCount = (content.match(/\./g) || []).length;
    const ellipsisCount = (content.match(/\.\.\./g) || []).length;
    
    const totalPauses = commaCount + periodCount + ellipsisCount;
    const words = content.split(/\s+/).length;
    
    if (words > 0) {
        const pauseRatio = totalPauses / words;
        // Ideal pause ratio: 0.05 - 0.15
        if (pauseRatio >= 0.05 && pauseRatio <= 0.15) {
            score = 0.8;
        } else if (pauseRatio >= 0.02 && pauseRatio <= 0.2) {
            score = 0.6;
        } else {
            score = 0.4;
        }
    }
    
    return Math.max(0, Math.min(1, score));
}

/**
 * Analyze confidence
 */
function analyzeConfidence(content) {
    let score = 0.5;
    const lower = content.toLowerCase();
    
    // Confident language
    const confidentPhrases = ['i know', 'i can', 'i will', 'let me', 'here\'s', 'this is', 'that\'s', 'we can', 'we will', 'absolutely', 'definitely'];
    const uncertainPhrases = ['i think', 'i guess', 'i suppose', 'maybe', 'perhaps', 'possibly', 'not sure', 'i hope', 'i wish'];
    
    let confidentCount = 0, uncertainCount = 0;
    confidentPhrases.forEach(p => { if (lower.includes(p)) confidentCount++; });
    uncertainPhrases.forEach(p => { if (lower.includes(p)) uncertainCount++; });
    
    if (confidentCount > 0 || uncertainCount > 0) {
        const ratio = confidentCount / (confidentCount + uncertainCount + 1);
        score = 0.3 + (ratio * 0.7);
    }
    
    return Math.max(0, Math.min(1, score));
}

/**
 * Analyze objection handling
 */
function analyzeObjections(content) {
    let score = 0.5;
    const lower = content.toLowerCase();
    
    // Objection handling patterns
    const objectionPatterns = [
        'understand', 'concern', 'appreciate', 'that\'s a great question',
        'good question', 'valid point', 'i see', 'i understand',
        'that\'s fair', 'makes sense', 'you\'re right', 'agree with you',
        'let me address', 'to clarify', 'to explain', 'the reason is'
    ];
    
    let patternCount = 0;
    objectionPatterns.forEach(p => {
        if (lower.includes(p)) patternCount++;
    });
    
    if (patternCount > 0) {
        score = Math.min(1, 0.5 + (patternCount * 0.05));
    }
    
    return Math.max(0, Math.min(1, score));
}

/**
 * Analyze conversational flow
 */
function analyzeFlow(content) {
    let score = 0.5;
    const lower = content.toLowerCase();
    
    // Conversational markers
    const conversationalMarkers = [
        'right', 'okay', 'so', 'now', 'well', 'you know', 'i mean',
        'let\'s', 'we\'ll', 'we\'re', 'you\'re', 'i\'m'
    ];
    
    let markerCount = 0;
    conversationalMarkers.forEach(m => {
        if (lower.includes(m)) markerCount++;
    });
    
    // Question and response patterns
    const questionCount = (content.match(/\?/g) || []).length;
    const periodCount = (content.match(/\./g) || []).length;
    
    if (questionCount > 0 && periodCount > 0) {
        const ratio = questionCount / (periodCount + 1);
        if (ratio >= 0.1 && ratio <= 0.3) {
            score += 0.2;
        }
    }
    
    if (markerCount > 0) {
        score = Math.min(1, score + (markerCount * 0.02));
    }
    
    return Math.max(0, Math.min(1, score));
}

/**
 * Generate recommendations based on metrics
 */
function generateRecommendations(metrics) {
    const recommendations = [];
    
    const lowMetrics = Object.entries(metrics).filter(([key, value]) => value < 0.5);
    const highMetrics = Object.entries(metrics).filter(([key, value]) => value >= 0.7);
    
    const metricNames = {
        tonality: 'Tonality',
        pacing: 'Pacing',
        phrasing: 'Phrasing',
        emphasis: 'Emphasis',
        pauses: 'Pause Usage',
        confidence: 'Confidence',
        objections: 'Objection Handling',
        flow: 'Conversational Flow'
    };
    
    const recommendationsMap = {
        tonality: {
            low: 'Use more positive and engaging language. Try incorporating words like "great", "excellent", and "wonderful" to create a more positive tone.',
            high: 'Your tonality is strong and engaging. Continue using positive language to build rapport.'
        },
        pacing: {
            low: 'Vary your sentence length. Mix short, punchy sentences with longer, more detailed ones to create better pacing.',
            high: 'Your pacing is excellent. You balance short and long sentences effectively.'
        },
        phrasing: {
            low: 'Expand your vocabulary. Try using more varied language to keep your script interesting and engaging.',
            high: 'Your phrasing is varied and engaging. Great work on vocabulary diversity.'
        },
        emphasis: {
            low: 'Add more emphasis to key points. Use powerful words like "absolutely", "definitely", and "guarantee" to strengthen your message.',
            high: 'You use emphasis effectively. Your key points stand out clearly.'
        },
        pauses: {
            low: 'Add more pauses to your script. Use commas, periods, and ellipses to create natural breaks that improve comprehension.',
            high: 'You use pauses effectively. This helps with comprehension and retention.'
        },
        confidence: {
            low: 'Use more confident language. Replace "I think" with "I know", and "maybe" with "definitely" to sound more authoritative.',
            high: 'Your language is confident and authoritative. This builds trust with prospects.'
        },
        objections: {
            low: 'Add more objection handling phrases. Include responses to common concerns like "I understand your concern" or "That\'s a great question".',
            high: 'You handle objections well. Continue to address concerns proactively.'
        },
        flow: {
            low: 'Make your script more conversational. Use transition words like "so", "now", and "well" to create natural flow.',
            high: 'Your script has great conversational flow. It feels natural and engaging.'
        }
    };
    
    // Add recommendations for low-scoring metrics
    lowMetrics.forEach(([key, value]) => {
        const recommendation = recommendationsMap[key]?.low;
        if (recommendation) {
            recommendations.push({
                metric: metricNames[key] || key,
                severity: value < 0.3 ? 'high' : 'medium',
                recommendation: recommendation
            });
        }
    });
    
    // Add positive feedback for high-scoring metrics
    highMetrics.forEach(([key, value]) => {
        const recommendation = recommendationsMap[key]?.high;
        if (recommendation && lowMetrics.length > 0) {
            recommendations.push({
                metric: metricNames[key] || key,
                severity: 'positive',
                recommendation: recommendation
            });
        }
    });
    
    // Sort recommendations by severity
    const severityOrder = { high: 0, medium: 1, positive: 2 };
    recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    
    return recommendations;
}

/**
 * Identify the best tone based on analysis
 */
function identifyBestTone(metrics) {
    const toneScores = {};
    
    for (const [toneKey, toneConfig] of Object.entries(SCRIPT_COACH_CONFIG.TONES)) {
        let score = 0;
        let count = 0;
        
        // Check if metrics match the tone characteristics
        for (const [metricKey, metricValue] of Object.entries(metrics)) {
            // Different tones favor different metrics
            let matchScore = 0;
            
            switch (toneKey) {
                case 'confident':
                    if (metricKey === 'confidence') matchScore = metricValue * 1.0;
                    if (metricKey === 'emphasis') matchScore = metricValue * 0.8;
                    break;
                case 'conversational':
                    if (metricKey === 'flow') matchScore = metricValue * 1.0;
                    if (metricKey === 'phrasing') matchScore = metricValue * 0.8;
                    break;
                case 'curious':
                    if (metricKey === 'tonality') matchScore = metricValue * 0.9;
                    if (metricKey === 'pacing') matchScore = metricValue * 0.7;
                    break;
                case 'consultative':
                    if (metricKey === 'objections') matchScore = metricValue * 1.0;
                    if (metricKey === 'confidence') matchScore = metricValue * 0.9;
                    break;
                case 'friendly':
                    if (metricKey === 'tonality') matchScore = metricValue * 1.0;
                    if (metricKey === 'flow') matchScore = metricValue * 0.8;
                    break;
                default:
                    matchScore = metricValue * 0.5;
            }
            
            score += matchScore;
            count++;
        }
        
        toneScores[toneKey] = count > 0 ? score / count : 0;
    }
    
    // Get the best tone
    const sorted = Object.entries(toneScores).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : SCRIPT_COACH_CONFIG.DEFAULT_TONE;
}

/**
 * Get the best tone based on analysis
 */
function getBestTone() {
    if (ScriptCoachState.analysisResults) {
        return ScriptCoachState.analysisResults.bestTone || SCRIPT_COACH_CONFIG.DEFAULT_TONE;
    }
    return SCRIPT_COACH_CONFIG.DEFAULT_TONE;
}

/**
 * Generate word annotations for playback
 */
function generateWordAnnotations(words, metrics) {
    const annotations = [];
    let confidence = metrics.confidence || 0.5;
    let emphasis = metrics.emphasis || 0.5;
    let pacing = metrics.pacing || 0.5;
    let pauses = metrics.pauses || 0.5;
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const lower = word.toLowerCase();
        
        // Determine emphasis
        let wordEmphasis = emphasis;
        const emphasisWords = ['absolutely', 'definitely', 'certainly', 'guarantee', 'promise', 'ensure', 'always', 'never', 'crucial', 'critical', 'essential'];
        if (emphasisWords.some(w => lower.includes(w))) {
            wordEmphasis = Math.min(1, emphasis + 0.3);
        }
        
        // Determine pause after word
        let hasPause = false;
        const pauseWords = ['and', 'but', 'so', 'now', 'well', 'right', 'okay', 'you know'];
        if (pauseWords.includes(lower) && pauses > 0.5) {
            hasPause = true;
        }
        
        // Check for punctuation
        const hasPunctuation = /[.,!?;:]/.test(word);
        if (hasPunctuation) {
            hasPause = true;
        }
        
        // Determine pitch variation
        let pitchVariation = 0;
        const questionWord = /^[Ww]hy|[Ww]hat|[Ww]hen|[Ww]here|[Ww]ho|[Hh]ow/.test(word);
        if (questionWord) {
            pitchVariation = 0.3;
        }
        
        // Determine confidence level
        let wordConfidence = confidence;
        if (lower.includes('maybe') || lower.includes('perhaps') || lower.includes('think')) {
            wordConfidence = Math.max(0, confidence - 0.2);
        }
        
        annotations.push({
            word: word,
            confidence: wordConfidence,
            emphasis: wordEmphasis,
            hasPause: hasPause,
            pitchVariation: pitchVariation,
            isPunctuation: hasPunctuation
        });
    }
    
    return annotations;
}

// ================================================================
// ANALYSIS RESULTS UI
// ================================================================

/**
 * Show analysis results
 */
function showAnalysisResults(results) {
    if (!results) return;
    
    const scriptBody = document.getElementById('scriptBody');
    if (!scriptBody) return;
    
    // Remove existing results overlay
    const existing = document.querySelector('.coach-results-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'coach-results-overlay';
    overlay.id = 'coachResultsOverlay';
    overlay.innerHTML = `
        <div class="coach-results-content">
            <div class="coach-results-header">
                <h3><i class="fas fa-brain" style="color:var(--primary);"></i> Script Analysis Complete</h3>
                <button class="coach-results-close" onclick="closeCoachResults()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="coach-results-body">
                <div class="coach-overall-score">
                    <div class="coach-score-circle">
                        <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" stroke-width="10"/>
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" stroke-width="10" 
                                    stroke-dasharray="${results.overall * 3.14}" stroke-dashoffset="157" 
                                    stroke-linecap="round" transform="rotate(-90 60 60)"/>
                        </svg>
                        <span class="coach-score-number">${results.overall}%</span>
                    </div>
                    <div class="coach-score-label">Overall Score</div>
                </div>
                
                <div class="coach-metrics-grid">
                    ${Object.entries(results.metrics).map(([key, value]) => `
                        <div class="coach-metric-item">
                            <div class="coach-metric-header">
                                <span class="coach-metric-icon">${SCRIPT_COACH_CONFIG.METRICS[key]?.icon || '📊'}</span>
                                <span class="coach-metric-name">${SCRIPT_COACH_CONFIG.METRICS[key]?.label || key}</span>
                                <span class="coach-metric-value ${value >= 0.7 ? 'good' : value >= 0.5 ? 'fair' : 'poor'}">${Math.round(value * 100)}%</span>
                            </div>
                            <div class="coach-metric-bar">
                                <div class="coach-metric-fill" style="width:${value * 100}%;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="coach-recommendations">
                    <h4><i class="fas fa-lightbulb" style="color:var(--warning);"></i> Recommendations</h4>
                    <div class="coach-recommendations-list">
                        ${results.recommendations.length > 0 ? 
                            results.recommendations.map(rec => `
                                <div class="coach-recommendation ${rec.severity}">
                                    <div class="coach-rec-header">
                                        <span class="coach-rec-metric">${rec.metric}</span>
                                        <span class="coach-rec-badge ${rec.severity}">${rec.severity === 'high' ? '🚨 Priority' : rec.severity === 'medium' ? '📌 Suggested' : '✅ Great'}</span>
                                    </div>
                                    <p class="coach-rec-text">${rec.recommendation}</p>
                                </div>
                            `).join('') :
                            `<div class="coach-recommendation positive">
                                <p>🎉 Excellent script! All metrics are strong. Keep up the great work!</p>
                            </div>`
                        }
                    </div>
                </div>
                
                <div class="coach-stats">
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">📝 Words</span>
                        <span class="coach-stat-value">${results.wordCount}</span>
                    </div>
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">📄 Sentences</span>
                        <span class="coach-stat-value">${results.sentenceCount}</span>
                    </div>
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">📚 Paragraphs</span>
                        <span class="coach-stat-value">${results.paragraphCount}</span>
                    </div>
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">🏆 Best Tone</span>
                        <span class="coach-stat-value" style="color:${SCRIPT_COACH_CONFIG.TONES[results.bestTone]?.color || 'var(--primary)'}">
                            ${SCRIPT_COACH_CONFIG.TONES[results.bestTone]?.icon || '🎯'} ${SCRIPT_COACH_CONFIG.TONES[results.bestTone]?.label || results.bestTone}
                        </span>
                    </div>
                </div>
            </div>
            <div class="coach-results-footer">
                <button class="btn-icon" onclick="closeCoachResults()" style="background:var(--primary); color:white;">
                    <i class="fas fa-check"></i> Got it!
                </button>
            </div>
        </div>
    `;
    
    scriptBody.appendChild(overlay);
    
    // Update UI state
    updateCoachUI(true);
    
    // Show success notification
    showToast('✅ Script analysis complete! Click Play to hear your script.', 'success');
    
    // Play success sound
    playSuccessSound();
}

/**
 * Close coach results
 */
function closeCoachResults() {
    const overlay = document.getElementById('coachResultsOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    }
}

/**
 * Play success sound
 */
function playSuccessSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';
        gainNode.gain.value = 0.15;
        
        oscillator.start();
        setTimeout(() => {
            oscillator.frequency.value = 659.25; // E5
        }, 150);
        setTimeout(() => {
            oscillator.frequency.value = 783.99; // G5
        }, 300);
        setTimeout(() => {
            oscillator.stop();
        }, 500);
    } catch (e) {
        // Silently fail if audio is not supported
    }
}

// ================================================================
// SCRIPT PLAYBACK ENGINE
// ================================================================

/**
 * Start script playback
 */
function startScriptPlayback() {
    if (!ScriptCoachState.analysisResults) {
        showToast('Please scan the script first before playing.', 'warning');
        return;
    }
    
    if (ScriptCoachState.isPlaying) return;
    
    const content = ScriptCoachState.currentScriptContent;
    if (!content) {
        showToast('No script content to play.', 'error');
        return;
    }
    
    // Get the content display area
    const contentDiv = document.getElementById('scriptContent');
    if (!contentDiv) return;
    
    // Parse the content into words with annotations
    const words = ScriptCoachState.analysisResults.words || content.split(/\s+/).filter(w => w.length > 0);
    const annotations = ScriptCoachState.analysisResults.wordAnnotations || [];
    
    // Ensure annotations match words
    while (annotations.length < words.length) {
        annotations.push({
            word: words[annotations.length],
            confidence: 0.5,
            emphasis: 0.5,
            hasPause: false,
            pitchVariation: 0,
            isPunctuation: false
        });
    }
    
    ScriptCoachState.words = words;
    ScriptCoachState.isPlaying = true;
    ScriptCoachState.currentWordIndex = 0;
    ScriptCoachState.isPaused = false;
    
    // Update play button
    const playBtn = document.getElementById('coachPlayBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        playBtn.style.background = 'var(--danger)';
        playBtn.style.color = 'white';
    }
    
    // Show the script content with word highlighting
    renderHighlightedScript(contentDiv, words, annotations);
    
    // Start playback
    const tone = SCRIPT_COACH_CONFIG.TONES[ScriptCoachState.selectedTone] || SCRIPT_COACH_CONFIG.TONES[SCRIPT_COACH_CONFIG.DEFAULT_TONE];
    const speed = tone.speed * ScriptCoachState.playbackSpeed;
    const baseDelay = 300 / speed;
    
    ScriptCoachState.playbackInterval = setInterval(() => {
        if (ScriptCoachState.isPaused) return;
        
        const index = ScriptCoachState.currentWordIndex;
        if (index >= words.length) {
            stopScriptPlayback();
            return;
        }
        
        // Highlight current word
        highlightWord(index);
        
        // Animate the word
        animateWord(index);
        
        // Play the word sound
        playWordSound(index);
        
        // Check for pause
        const annotation = annotations[index] || {};
        let delay = baseDelay;
        if (annotation.hasPause) {
            delay += 200;
        }
        if (annotation.isPunctuation) {
            delay += 150;
        }
        
        // Adjust for emphasis
        if (annotation.emphasis > 0.7) {
            delay += 100;
        }
        
        ScriptCoachState.currentWordIndex++;
        
        // Update progress
        const progress = (ScriptCoachState.currentWordIndex / words.length) * 100;
        updatePlaybackProgress(progress);
        
    }, 300);
}

/**
 * Render highlighted script
 */
function renderHighlightedScript(container, words, annotations) {
    let html = '<div class="coach-script-display">';
    
    words.forEach((word, index) => {
        const annotation = annotations[index] || {};
        const emphasis = annotation.emphasis || 0.5;
        const confidence = annotation.confidence || 0.5;
        const hasPause = annotation.hasPause || false;
        
        let wordClass = 'coach-word';
        if (emphasis > 0.7) wordClass += ' coach-word-emphasis';
        if (confidence < 0.4) wordClass += ' coach-word-low-confidence';
        if (hasPause) wordClass += ' coach-word-pause';
        
        const color = getWordColor(emphasis, confidence);
        
        html += `<span class="${wordClass}" data-index="${index}" style="color:${color};">${word}</span>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Get word color based on emphasis and confidence
 */
function getWordColor(emphasis, confidence) {
    // Dynamic color based on emphasis and confidence
    const hue = 210 + (emphasis * 60); // Blue to purple range
    const lightness = 50 + (confidence * 30);
    return `hsl(${hue}, 80%, ${lightness}%)`;
}

/**
 * Highlight a specific word
 */
function highlightWord(index) {
    const wordElements = document.querySelectorAll('.coach-word');
    wordElements.forEach((el, i) => {
        el.classList.remove('coach-word-active');
        if (i === index) {
            el.classList.add('coach-word-active');
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    });
}

/**
 * Animate a word
 */
function animateWord(index) {
    const wordElements = document.querySelectorAll('.coach-word');
    const el = wordElements[index];
    if (el) {
        el.style.transform = 'scale(1.2)';
        el.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 200);
    }
}

/**
 * Play word sound
 */
function playWordSound(index) {
    try {
        const annotation = ScriptCoachState.analysisResults?.wordAnnotations?.[index] || {};
        const tone = SCRIPT_COACH_CONFIG.TONES[ScriptCoachState.selectedTone] || SCRIPT_COACH_CONFIG.TONES[SCRIPT_COACH_CONFIG.DEFAULT_TONE];
        
        const audioCtx = ScriptCoachState.audioContext;
        if (!audioCtx) return;
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Base frequency with pitch variation
        let baseFreq = 440 + (annotation.pitchVariation || 0) * 100;
        if (tone.pitch) {
            baseFreq = baseFreq * (0.8 + (tone.pitch * 0.4));
        }
        
        oscillator.frequency.value = baseFreq;
        oscillator.type = 'sine';
        
        // Volume based on emphasis
        const volume = 0.08 + (annotation.emphasis || 0.5) * 0.1;
        gainNode.gain.value = volume;
        
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 80);
    } catch (e) {
        // Silently fail if audio is not supported
    }
}

/**
 * Update playback progress
 */
function updatePlaybackProgress(progress) {
    // Update the script body progress indicator
    const existing = document.querySelector('.coach-playback-progress');
    if (!existing) {
        const scriptBody = document.getElementById('scriptBody');
        if (scriptBody) {
            const progressBar = document.createElement('div');
            progressBar.className = 'coach-playback-progress';
            progressBar.innerHTML = `
                <div class="coach-playback-bar" style="width:0%;"></div>
            `;
            scriptBody.insertBefore(progressBar, scriptBody.firstChild);
        }
    }
    
    const bar = document.querySelector('.coach-playback-bar');
    if (bar) {
        bar.style.width = progress + '%';
    }
}

/**
 * Stop script playback
 */
function stopScriptPlayback() {
    ScriptCoachState.isPlaying = false;
    
    if (ScriptCoachState.playbackInterval) {
        clearInterval(ScriptCoachState.playbackInterval);
        ScriptCoachState.playbackInterval = null;
    }
    
    // Reset word highlighting
    const wordElements = document.querySelectorAll('.coach-word');
    wordElements.forEach(el => {
        el.classList.remove('coach-word-active');
    });
    
    // Reset play button
    const playBtn = document.getElementById('coachPlayBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        playBtn.style.background = '';
        playBtn.style.color = '';
    }
    
    // Remove progress bar
    const progressBar = document.querySelector('.coach-playback-progress');
    if (progressBar) {
        progressBar.remove();
    }
    
    // Restore the original script content
    const contentDiv = document.getElementById('scriptContent');
    if (contentDiv && ScriptCoachState.analysisResults) {
        const content = ScriptCoachState.currentScriptContent;
        contentDiv.innerHTML = `<div class="script-display">${Utils.escapeHtml(content).replace(/\n/g, '<br>')}</div>`;
    }
    
    ScriptCoachState.currentWordIndex = 0;
}

// ================================================================
// SCRIPT COACH INITIALIZATION
// ================================================================

/**
 * Initialize Script Coach
 */
function initScriptCoach() {
    // Listen for script loading
    const originalLoadScript = Scripts.loadScript;
    Scripts.loadScript = function(id) {
        originalLoadScript.call(this, id);
        // Reset coach state
        ScriptCoachState.isPlaying = false;
        ScriptCoachState.isAnalyzing = false;
        ScriptCoachState.currentScriptId = id;
        ScriptCoachState.currentScriptContent = AppState.scripts[id]?.content || '';
        ScriptCoachState.analysisResults = null;
        ScriptCoachState.analysisComplete = false;
        
        // Update UI
        updateCoachUI(false);
        
        // Add coach UI if not present
        setTimeout(addScriptCoachUI, 100);
    };
    
    // Initialize audio context on first user interaction
    document.addEventListener('click', () => {
        if (!ScriptCoachState.audioContext) {
            try {
                ScriptCoachState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported');
            }
        }
    }, { once: true });
    
    // Add coach UI after initial load
    setTimeout(addScriptCoachUI, 200);
    
    console.log('🎯 Script Coach initialized');
}

// ================================================================
// EXPOSE GLOBAL FUNCTIONS
// ================================================================

window.ScriptCoachState = ScriptCoachState;
window.SCRIPT_COACH_CONFIG = SCRIPT_COACH_CONFIG;
window.runScriptAnalysis = runScriptAnalysis;
window.startScriptPlayback = startScriptPlayback;
window.stopScriptPlayback = stopScriptPlayback;
window.closeCoachResults = closeCoachResults;
window.updateCoachUI = updateCoachUI;
window.initScriptCoach = initScriptCoach;
window.getBestTone = getBestTone;
window.analyzeScriptContent = analyzeScriptContent;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initScriptCoach, 500);
});