// ================================================================
// SCRIPT COACH - KARAOKE-STYLE SCRIPT PLAYBACK & COACHING
// ================================================================

// ================================================================
// SCRIPT COACH CONFIGURATION
// ================================================================

const SCRIPT_COACH_CONFIG = {
    DEFAULT_TONE: 'conversational',
    TONES: {
        confident: {
            label: 'Confident',
            icon: '💪',
            color: '#3b82f6',
            description: 'Strong, authoritative, and decisive',
            speed: 0.85,
            pitch: 0.9,
            emphasis: 0.8,
            pauses: 0.3
        },
        conversational: {
            label: 'Conversational',
            icon: '💬',
            color: '#10b981',
            description: 'Friendly, natural, and engaging',
            speed: 0.95,
            pitch: 0.7,
            emphasis: 0.6,
            pauses: 0.5
        },
        curious: {
            label: 'Curious',
            icon: '🤔',
            color: '#8b5cf6',
            description: 'Inquisitive, thoughtful, and exploratory',
            speed: 0.8,
            pitch: 0.8,
            emphasis: 0.5,
            pauses: 0.6
        },
        consultative: {
            label: 'Consultative',
            icon: '💼',
            color: '#f59e0b',
            description: 'Advisory, solution-oriented, and professional',
            speed: 0.9,
            pitch: 0.75,
            emphasis: 0.7,
            pauses: 0.4
        },
        friendly: {
            label: 'Friendly',
            icon: '😊',
            color: '#ec4899',
            description: 'Warm, approachable, and positive',
            speed: 1.0,
            pitch: 0.85,
            emphasis: 0.5,
            pauses: 0.5
        }
    },
    METRICS: {
        tonality: { label: 'Tonality', icon: '🎵' },
        pacing: { label: 'Pacing', icon: '⏱️' },
        phrasing: { label: 'Phrasing', icon: '📝' },
        emphasis: { label: 'Emphasis', icon: '🔊' },
        pauses: { label: 'Pause Usage', icon: '⏸️' },
        confidence: { label: 'Confidence', icon: '💪' },
        objections: { label: 'Objections', icon: '🛡️' },
        flow: { label: 'Flow', icon: '🌊' }
    },
    SPEEDS: [0.75, 1.0, 1.25, 1.5],
    SECTIONS: [
        { id: 'introduction', label: 'Introduction', icon: '👋', pattern: /(?:hi|hello|hey|greetings|introduction|intro)/i },
        { id: 'qualification', label: 'Qualification', icon: '🔍', pattern: /(?:qualif|understand|tell me about|current situation|business|company)/i },
        { id: 'value_proposition', label: 'Value Proposition', icon: '💎', pattern: /(?:value|benefit|solution|offer|help|improve|increase|save)/i },
        { id: 'objection_handling', label: 'Objections', icon: '🛡️', pattern: /(?:objection|concern|understand|appreciate|that\'s a great question|valid point)/i },
        { id: 'closing', label: 'Closing', icon: '🎯', pattern: /(?:close|next steps|follow up|thank you|appreciate|schedule|call|meeting)/i }
    ],
    EMPHASIS_CUES: [
        { pattern: /\!/, label: 'Exclamation', color: '#f59e0b' },
        { pattern: /\?/, label: 'Question', color: '#3b82f6' },
        { pattern: /\.\.\./, label: 'Pause', color: '#8b5cf6' },
        { pattern: /\b(?:absolutely|definitely|certainly|guarantee|promise|ensure|always|never|crucial|critical|essential)\b/i, label: 'Emphasis', color: '#ef4444' },
        { pattern: /\b(?:but|however|although|though|yet)\b/i, label: 'Contrast', color: '#f97316' },
        { pattern: /\b(?:and|also|additionally|furthermore|moreover)\b/i, label: 'Addition', color: '#10b981' }
    ]
};

// ================================================================
// SCRIPT COACH STATE (mirrors AppState.coach* properties)
// ================================================================

const ScriptCoach = {
    // State
    isAnalyzing: false,
    isPlaying: false,
    isPaused: false,
    currentScriptId: null,
    currentScriptContent: '',
    selectedTone: 'conversational',
    analysisResults: null,
    analysisComplete: false,
    playbackSpeed: 1.0,
    currentWordIndex: 0,
    words: [],
    wordTimings: [],
    playbackInterval: null,
    audioContext: null,
    currentSection: 0,
    isLooping: false,
    loopStart: 0,
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    focusMode: true,
    showCues: true,
    progress: 0,
    totalDuration: 0,
    currentTime: 0,
    isDragging: false,
    activeLineIndex: -1,
    lines: [],
    sectionMarkers: [],

    // DOM Elements
    elements: {},

    // Methods
    init: function() {
        console.log('🎤 Script Coach initialized');
        this.setupUI();
        this.setupKeyboardShortcuts();
    },

    setupUI: function() {
        this.addCoachButtons();
    },

    addCoachButtons: function() {
        const scriptActions = document.querySelector('.script-actions');
        if (!scriptActions) return;
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
                        <option value="${key}" ${key === this.selectedTone ? 'selected' : ''}>
                            ${tone.icon} ${tone.label}
                        </option>
                    `).join('')}
                </select>
            </div>
            <button class="btn-icon coach-status-btn" id="coachStatusBtn" style="display:none; background:var(--success); color:white; padding:4px 12px; font-size:0.7rem;">
                <i class="fas fa-check-circle"></i> Analyzed
            </button>
        `;

        const favoriteBtn = document.querySelector('#favoriteScriptBtn');
        if (favoriteBtn) {
            scriptActions.insertBefore(coachGroup, favoriteBtn);
        } else {
            scriptActions.appendChild(coachGroup);
        }

        this.elements.scanBtn = document.getElementById('coachScanBtn');
        this.elements.playBtn = document.getElementById('coachPlayBtn');
        this.elements.toneSelect = document.getElementById('coachToneSelect');
        this.elements.statusBtn = document.getElementById('coachStatusBtn');

        if (this.elements.scanBtn) {
            this.elements.scanBtn.addEventListener('click', () => {
                const script = window.AppState?.scripts?.[window.AppState?.currentScriptId];
                if (script) {
                    this.runAnalysis(script.content);
                } else {
                    showToast('No script loaded to analyze', 'warning');
                }
            });
        }

        if (this.elements.playBtn) {
            this.elements.playBtn.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.stopPlayback();
                } else if (this.isPaused) {
                    this.resumePlayback();
                } else {
                    this.startPlayback();
                }
            });
        }

        if (this.elements.toneSelect) {
            this.elements.toneSelect.addEventListener('change', (e) => {
                this.selectedTone = e.target.value;
                if (this.isPlaying || this.isPaused) {
                    this.stopPlayback();
                    this.startPlayback();
                }
            });
        }
    },

    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Only handle if coach is active (karaoke container exists)
            if (!document.querySelector('.coach-karaoke-container')) return;

            // Don't interfere with input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    if (this.isPlaying) {
                        this.pausePlayback();
                    } else if (this.isPaused) {
                        this.resumePlayback();
                    } else {
                        this.startPlayback();
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey || e.metaKey) break;
                    e.preventDefault();
                    if (this.isPlaying || this.isPaused) {
                        this.stopPlayback();
                        this.currentWordIndex = 0;
                        this.startPlayback();
                    }
                    break;
                case 'l':
                case 'L':
                    e.preventDefault();
                    this.toggleLoop();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFocusMode();
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    this.toggleCues();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSection();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSection();
                    break;
            }
        });
    },

    // Called when a script is loaded
    onScriptLoaded: function(scriptId, content) {
        this.currentScriptId = scriptId;
        this.currentScriptContent = content || '';
        this.isPlaying = false;
        this.isPaused = false;
        this.isAnalyzing = false;
        this.analysisResults = null;
        this.analysisComplete = false;
        this.currentWordIndex = 0;
        this.activeLineIndex = -1;
        this.progress = 0;

        // Remove existing karaoke container
        const existing = document.getElementById('coachKaraokeContainer');
        if (existing) existing.remove();

        this.updateUI(false);
        setTimeout(() => this.addCoachButtons(), 100);
    },

    updateUI: function(analyzed = false) {
        const playBtn = this.elements.playBtn;
        const toneSelect = this.elements.toneSelect;
        const statusBtn = this.elements.statusBtn;
        const scanBtn = this.elements.scanBtn;

        if (analyzed) {
            this.analysisComplete = true;
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            }
            if (toneSelect) {
                toneSelect.style.display = 'inline-block';
                const bestTone = this.getBestTone();
                if (bestTone) {
                    toneSelect.value = bestTone;
                    this.selectedTone = bestTone;
                }
            }
            if (statusBtn) {
                statusBtn.style.display = 'inline-flex';
            }
            if (scanBtn) {
                scanBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Re-Scan';
            }
        } else {
            this.analysisComplete = false;
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
    },

    // ================================================================
    // SCRIPT ANALYSIS ENGINE
    // ================================================================

    runAnalysis: function(content) {
        if (this.isAnalyzing) return;
        if (!content || content.trim().length === 0) {
            showToast('Script content is empty. Please add some content first.', 'warning');
            return;
        }

        this.isAnalyzing = true;
        this.currentScriptContent = content;

        this.showLoadingOverlay();

        const steps = [
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
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                const step = steps[stepIndex];
                this.updateLoadingOverlay(step.progress, step.message);
                stepIndex++;
            } else {
                clearInterval(interval);
                this.completeAnalysis(content);
            }
        }, 350);
    },

    showLoadingOverlay: function() {
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
        // Also hide any existing script content
        const contentDiv = document.getElementById('scriptContent');
        if (contentDiv) {
            contentDiv.style.opacity = '0.3';
        }
    },

    updateLoadingOverlay: function(progress, message) {
        const fill = document.getElementById('coachProgressFill');
        const text = document.getElementById('coachProgressText');
        const msg = document.getElementById('coachLoadingMessage');

        if (fill) fill.style.width = progress + '%';
        if (text) text.textContent = progress + '%';
        if (msg) msg.textContent = message;
    },

    completeAnalysis: function(content) {
        this.isAnalyzing = false;

        const results = this.analyzeScriptContent(content);
        this.analysisResults = results;

        const overlay = document.getElementById('coachLoadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                const contentDiv = document.getElementById('scriptContent');
                if (contentDiv) {
                    contentDiv.style.opacity = '1';
                }
                this.showResults(results);
            }, 500);
        } else {
            const contentDiv = document.getElementById('scriptContent');
            if (contentDiv) {
                contentDiv.style.opacity = '1';
            }
            this.showResults(results);
        }
    },

    analyzeScriptContent: function(content) {
        if (!content) return null;

        const words = content.split(/\s+/).filter(w => w.length > 0);
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);

        // Initialize all metrics
        const metrics = {
            tonality: 0.5,
            pacing: 0.5,
            phrasing: 0.5,
            emphasis: 0.5,
            pauses: 0.5,
            confidence: 0.5,
            objections: 0.5,
            flow: 0.5
        };
        let totalScore = 0;

        const tonalityScore = this.analyzeTonality(content);
        metrics.tonality = tonalityScore;
        totalScore += tonalityScore;

        const pacingScore = this.analyzePacing(sentences);
        metrics.pacing = pacingScore;
        totalScore += pacingScore;

        const phrasingScore = this.analyzePhrasing(words);
        metrics.phrasing = phrasingScore;
        totalScore += phrasingScore;

        const emphasisScore = this.analyzeEmphasis(content);
        metrics.emphasis = emphasisScore;
        totalScore += emphasisScore;

        const pausesScore = this.analyzePauses(content);
        metrics.pauses = pausesScore;
        totalScore += pausesScore;

        const confidenceScore = this.analyzeConfidence(content);
        metrics.confidence = confidenceScore;
        totalScore += confidenceScore;

        const objectionsScore = this.analyzeObjections(content);
        metrics.objections = objectionsScore;
        totalScore += objectionsScore;

        const flowScore = this.analyzeFlow(content);
        metrics.flow = flowScore;
        totalScore += flowScore;

        const overallScore = Math.round((totalScore / 8) * 100);
        const recommendations = this.generateRecommendations(metrics);
        const bestTone = this.identifyBestTone(metrics);
        const wordAnnotations = this.generateWordAnnotations(words, metrics);
        const wordTimings = this.generateWordTimings(words, wordAnnotations);
        const totalDuration = wordTimings.reduce((sum, w) => sum + w.duration, 0);
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        const sections = this.detectSections(content);

        return {
            overall: overallScore,
            metrics: metrics,
            recommendations: recommendations,
            bestTone: bestTone,
            wordAnnotations: wordAnnotations,
            wordTimings: wordTimings,
            words: words,
            sentences: sentences,
            paragraphs: paragraphs,
            lines: lines,
            sections: sections,
            wordCount: words.length,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,
            totalDuration: totalDuration
        };
    },

    detectSections: function(content) {
        const sections = [];
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        let currentSection = 0;

        lines.forEach((line, index) => {
            let matched = false;
            for (let i = 0; i < SCRIPT_COACH_CONFIG.SECTIONS.length; i++) {
                const section = SCRIPT_COACH_CONFIG.SECTIONS[i];
                if (section.pattern.test(line)) {
                    currentSection = i;
                    matched = true;
                    break;
                }
            }
            sections.push({
                lineIndex: index,
                sectionId: currentSection,
                sectionLabel: SCRIPT_COACH_CONFIG.SECTIONS[currentSection].label,
                sectionIcon: SCRIPT_COACH_CONFIG.SECTIONS[currentSection].icon
            });
        });

        return sections;
    },

    generateWordTimings: function(words, annotations) {
        const timings = [];
        let totalTime = 0;
        const baseDuration = 250;

        words.forEach((word, index) => {
            const annotation = (annotations && annotations[index]) ? annotations[index] : {};
            let duration = baseDuration;
            if (annotation.emphasis > 0.7) duration *= 1.3;
            if (annotation.hasPause) duration += 150;
            if (annotation.isPunctuation) duration += 100;
            if (annotation.confidence < 0.4) duration *= 1.2;

            timings.push({
                word: word,
                index: index,
                startTime: totalTime,
                duration: duration,
                endTime: totalTime + duration,
                emphasis: annotation.emphasis || 0.5,
                confidence: annotation.confidence || 0.5,
                hasPause: annotation.hasPause || false,
                pitchVariation: annotation.pitchVariation || 0
            });
            totalTime += duration;
        });
        return timings;
    },

    analyzeTonality: function(content) {
        let score = 0.5;
        const lower = content.toLowerCase();
        const positiveWords = ['great', 'excellent', 'awesome', 'wonderful', 'fantastic', 'perfect', 'amazing', 'brilliant', 'outstanding', 'superb'];
        const negativeWords = ['sorry', 'unfortunately', 'apologize', 'issue', 'problem', 'concern', 'difficult', 'challenging'];

        let positiveCount = 0, negativeCount = 0;
        positiveWords.forEach(w => { if (lower.includes(w)) positiveCount++; });
        negativeWords.forEach(w => { if (lower.includes(w)) negativeCount++; });

        if (positiveCount > 0 || negativeCount > 0) {
            const ratio = positiveCount / (positiveCount + negativeCount + 1);
            score = 0.3 + (ratio * 0.7);
        }

        const questionCount = (content.match(/\?/g) || []).length;
        if (questionCount > 0) score = Math.min(1, score + 0.1);
        return Math.max(0, Math.min(1, score));
    },

    analyzePacing: function(sentences) {
        if (!sentences || sentences.length === 0) return 0.5;
        const lengths = sentences.map(s => s.split(/\s+/).length);
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        if (avg >= 8 && avg <= 18) return 0.8;
        else if (avg >= 5 && avg <= 25) return 0.6;
        else return 0.4;
    },

    analyzePhrasing: function(words) {
        if (!words || words.length === 0) return 0.5;
        const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
        const ratio = uniqueWords / words.length;
        if (ratio >= 0.5 && ratio <= 0.8) return 0.8;
        else if (ratio >= 0.3) return 0.6;
        else return 0.4;
    },

    analyzeEmphasis: function(content) {
        let score = 0.5;
        const lower = content.toLowerCase();
        const emphasisWords = ['absolutely', 'definitely', 'certainly', 'without a doubt', 'guarantee', 'promise', 'ensure', 'always', 'never'];
        emphasisWords.forEach(w => { if (lower.includes(w)) score += 0.05; });
        const exclamationCount = (content.match(/!/g) || []).length;
        if (exclamationCount > 0) score = Math.min(1, score + 0.05 * exclamationCount);
        return Math.max(0, Math.min(1, score));
    },

    analyzePauses: function(content) {
        let score = 0.5;
        const commaCount = (content.match(/,/g) || []).length;
        const periodCount = (content.match(/\./g) || []).length;
        const ellipsisCount = (content.match(/\.\.\./g) || []).length;
        const totalPauses = commaCount + periodCount + ellipsisCount;
        const words = content.split(/\s+/).length;
        if (words > 0) {
            const pauseRatio = totalPauses / words;
            if (pauseRatio >= 0.05 && pauseRatio <= 0.15) score = 0.8;
            else if (pauseRatio >= 0.02 && pauseRatio <= 0.2) score = 0.6;
            else score = 0.4;
        }
        return Math.max(0, Math.min(1, score));
    },

    analyzeConfidence: function(content) {
        let score = 0.5;
        const lower = content.toLowerCase();
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
    },

    analyzeObjections: function(content) {
        let score = 0.5;
        const lower = content.toLowerCase();
        const objectionPatterns = ['understand', 'concern', 'appreciate', 'that\'s a great question', 'good question', 'valid point', 'i see', 'i understand', 'that\'s fair', 'makes sense', 'you\'re right', 'agree with you', 'let me address', 'to clarify', 'to explain', 'the reason is'];
        let patternCount = 0;
        objectionPatterns.forEach(p => { if (lower.includes(p)) patternCount++; });
        if (patternCount > 0) score = Math.min(1, 0.5 + (patternCount * 0.05));
        return Math.max(0, Math.min(1, score));
    },

    analyzeFlow: function(content) {
        let score = 0.5;
        const lower = content.toLowerCase();
        const conversationalMarkers = ['right', 'okay', 'so', 'now', 'well', 'you know', 'i mean', 'let\'s', 'we\'ll', 'we\'re', 'you\'re', 'i\'m'];
        let markerCount = 0;
        conversationalMarkers.forEach(m => { if (lower.includes(m)) markerCount++; });
        const questionCount = (content.match(/\?/g) || []).length;
        const periodCount = (content.match(/\./g) || []).length;
        if (questionCount > 0 && periodCount > 0) {
            const ratio = questionCount / (periodCount + 1);
            if (ratio >= 0.1 && ratio <= 0.3) score += 0.2;
        }
        if (markerCount > 0) score = Math.min(1, score + (markerCount * 0.02));
        return Math.max(0, Math.min(1, score));
    },

    generateRecommendations: function(metrics) {
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
            tonality: { low: 'Use more positive and engaging language. Try incorporating words like "great", "excellent", and "wonderful" to create a more positive tone.', high: 'Your tonality is strong and engaging. Continue using positive language to build rapport.' },
            pacing: { low: 'Vary your sentence length. Mix short, punchy sentences with longer, more detailed ones to create better pacing.', high: 'Your pacing is excellent. You balance short and long sentences effectively.' },
            phrasing: { low: 'Expand your vocabulary. Try using more varied language to keep your script interesting and engaging.', high: 'Your phrasing is varied and engaging. Great work on vocabulary diversity.' },
            emphasis: { low: 'Add more emphasis to key points. Use powerful words like "absolutely", "definitely", and "guarantee" to strengthen your message.', high: 'You use emphasis effectively. Your key points stand out clearly.' },
            pauses: { low: 'Add more pauses to your script. Use commas, periods, and ellipses to create natural breaks that improve comprehension.', high: 'You use pauses effectively. This helps with comprehension and retention.' },
            confidence: { low: 'Use more confident language. Replace "I think" with "I know", and "maybe" with "definitely" to sound more authoritative.', high: 'Your language is confident and authoritative. This builds trust with prospects.' },
            objections: { low: 'Add more objection handling phrases. Include responses to common concerns like "I understand your concern" or "That\'s a great question".', high: 'You handle objections well. Continue to address concerns proactively.' },
            flow: { low: 'Make your script more conversational. Use transition words like "so", "now", and "well" to create natural flow.', high: 'Your script has great conversational flow. It feels natural and engaging.' }
        };
        lowMetrics.forEach(([key, value]) => {
            const recommendation = recommendationsMap[key]?.low;
            if (recommendation) recommendations.push({ metric: metricNames[key] || key, severity: value < 0.3 ? 'high' : 'medium', recommendation: recommendation });
        });
        highMetrics.forEach(([key, value]) => {
            const recommendation = recommendationsMap[key]?.high;
            if (recommendation && lowMetrics.length > 0) recommendations.push({ metric: metricNames[key] || key, severity: 'positive', recommendation: recommendation });
        });
        const severityOrder = { high: 0, medium: 1, positive: 2 };
        recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        return recommendations;
    },

    identifyBestTone: function(metrics) {
        const toneScores = {};
        for (const [toneKey, toneConfig] of Object.entries(SCRIPT_COACH_CONFIG.TONES)) {
            let score = 0, count = 0;
            for (const [metricKey, metricValue] of Object.entries(metrics)) {
                let matchScore = 0;
                switch (toneKey) {
                    case 'confident': if (metricKey === 'confidence') matchScore = metricValue * 1.0; if (metricKey === 'emphasis') matchScore = metricValue * 0.8; break;
                    case 'conversational': if (metricKey === 'flow') matchScore = metricValue * 1.0; if (metricKey === 'phrasing') matchScore = metricValue * 0.8; break;
                    case 'curious': if (metricKey === 'tonality') matchScore = metricValue * 0.9; if (metricKey === 'pacing') matchScore = metricValue * 0.7; break;
                    case 'consultative': if (metricKey === 'objections') matchScore = metricValue * 1.0; if (metricKey === 'confidence') matchScore = metricValue * 0.9; break;
                    case 'friendly': if (metricKey === 'tonality') matchScore = metricValue * 1.0; if (metricKey === 'flow') matchScore = metricValue * 0.8; break;
                    default: matchScore = metricValue * 0.5;
                }
                score += matchScore; count++;
            }
            toneScores[toneKey] = count > 0 ? score / count : 0;
        }
        const sorted = Object.entries(toneScores).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : 'conversational';
    },

    getBestTone: function() {
        if (this.analysisResults) {
            return this.analysisResults.bestTone || 'conversational';
        }
        return 'conversational';
    },

    generateWordAnnotations: function(words, metrics) {
        const annotations = [];
        const confidence = metrics.confidence || 0.5;
        const emphasis = metrics.emphasis || 0.5;
        const pauses = metrics.pauses || 0.5;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const lower = word.toLowerCase();
            let wordEmphasis = emphasis;
            const emphasisWords = ['absolutely', 'definitely', 'certainly', 'guarantee', 'promise', 'ensure', 'always', 'never', 'crucial', 'critical', 'essential'];
            if (emphasisWords.some(w => lower.includes(w))) wordEmphasis = Math.min(1, emphasis + 0.3);
            let hasPause = false;
            const pauseWords = ['and', 'but', 'so', 'now', 'well', 'right', 'okay', 'you know'];
            if (pauseWords.some(w => lower.includes(w)) && pauses > 0.5) hasPause = true;
            const hasPunctuation = /[.,!?;:]/.test(word);
            if (hasPunctuation) hasPause = true;
            let pitchVariation = 0;
            const questionWord = /^[Ww]hy|[Ww]hat|[Ww]hen|[Ww]here|[Ww]ho|[Hh]ow/.test(word);
            if (questionWord) pitchVariation = 0.3;
            let wordConfidence = confidence;
            if (lower.includes('maybe') || lower.includes('perhaps') || lower.includes('think')) wordConfidence = Math.max(0, confidence - 0.2);
            annotations.push({ word: word, confidence: wordConfidence, emphasis: wordEmphasis, hasPause: hasPause, pitchVariation: pitchVariation, isPunctuation: hasPunctuation });
        }
        return annotations;
    },

    // ================================================================
    // ANALYSIS RESULTS UI
    // ================================================================

    showResults: function(results) {
        if (!results) return;

        const scriptBody = document.getElementById('scriptBody');
        if (!scriptBody) return;

        const existing = document.querySelector('.coach-results-overlay');
        if (existing) existing.remove();

        const metrics = results.metrics || {};
        const overall = results.overall || 0;
        const recommendations = results.recommendations || [];
        const wordCount = results.wordCount || 0;
        const sentenceCount = results.sentenceCount || 0;
        const paragraphCount = results.paragraphCount || 0;
        const bestTone = results.bestTone || 'conversational';

        const overlay = document.createElement('div');
        overlay.className = 'coach-results-overlay';
        overlay.id = 'coachResultsOverlay';
        overlay.innerHTML = `
            <div class="coach-results-content">
                <div class="coach-results-header">
                    <h3><i class="fas fa-brain" style="color:var(--primary);"></i> Script Analysis Complete</h3>
                    <button class="coach-results-close" onclick="window.ScriptCoach.closeResults()"><i class="fas fa-times"></i></button>
                </div>
                <div class="coach-results-body">
                    <div class="coach-overall-score">
                        <div class="coach-score-circle">
                            <svg viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" stroke-width="10"/>
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" stroke-width="10" stroke-dasharray="${Math.max(0, (overall / 100) * 314)}" stroke-dashoffset="157" stroke-linecap="round" transform="rotate(-90 60 60)"/>
                            </svg>
                            <span class="coach-score-number">${overall}%</span>
                        </div>
                        <div class="coach-score-label">Overall Score</div>
                    </div>
                    <div class="coach-metrics-grid">
                        ${Object.entries(metrics).map(([key, value]) => `
                            <div class="coach-metric-item">
                                <div class="coach-metric-header">
                                    <span class="coach-metric-icon">${SCRIPT_COACH_CONFIG.METRICS[key]?.icon || '📊'}</span>
                                    <span class="coach-metric-name">${SCRIPT_COACH_CONFIG.METRICS[key]?.label || key}</span>
                                    <span class="coach-metric-value ${value >= 0.7 ? 'good' : value >= 0.5 ? 'fair' : 'poor'}">${Math.round(value * 100)}%</span>
                                </div>
                                <div class="coach-metric-bar"><div class="coach-metric-fill" style="width:${value * 100}%;"></div></div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="coach-recommendations">
                        <h4><i class="fas fa-lightbulb" style="color:var(--warning);"></i> Recommendations</h4>
                        <div class="coach-recommendations-list">
                            ${recommendations.length > 0 ? recommendations.map(rec => `
                                <div class="coach-recommendation ${rec.severity}">
                                    <div class="coach-rec-header">
                                        <span class="coach-rec-metric">${rec.metric}</span>
                                        <span class="coach-rec-badge ${rec.severity}">${rec.severity === 'high' ? '🚨 Priority' : rec.severity === 'medium' ? '📌 Suggested' : '✅ Great'}</span>
                                    </div>
                                    <p class="coach-rec-text">${rec.recommendation}</p>
                                </div>
                            `).join('') : `<div class="coach-recommendation positive"><p>🎉 Excellent script! All metrics are strong. Keep up the great work!</p></div>`}
                        </div>
                    </div>
                    <div class="coach-stats">
                        <div class="coach-stat-item"><span class="coach-stat-label">📝 Words</span><span class="coach-stat-value">${wordCount}</span></div>
                        <div class="coach-stat-item"><span class="coach-stat-label">📄 Sentences</span><span class="coach-stat-value">${sentenceCount}</span></div>
                        <div class="coach-stat-item"><span class="coach-stat-label">📚 Paragraphs</span><span class="coach-stat-value">${paragraphCount}</span></div>
                        <div class="coach-stat-item"><span class="coach-stat-label">🏆 Best Tone</span><span class="coach-stat-value" style="color:${SCRIPT_COACH_CONFIG.TONES[bestTone]?.color || 'var(--primary)'}">${SCRIPT_COACH_CONFIG.TONES[bestTone]?.icon || '🎯'} ${SCRIPT_COACH_CONFIG.TONES[bestTone]?.label || bestTone}</span></div>
                    </div>
                </div>
                <div class="coach-results-footer">
                    <button class="btn-icon" onclick="window.ScriptCoach.closeResults()" style="background:var(--primary); color:white;"><i class="fas fa-check"></i> Got it!</button>
                </div>
            </div>
        `;

        scriptBody.appendChild(overlay);
        this.updateUI(true);
        showToast('✅ Script analysis complete! Click Play to start karaoke-style coaching.', 'success');
        this.playSuccessSound();
    },

    closeResults: function() {
        const overlay = document.getElementById('coachResultsOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    },

    playSuccessSound: function() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = 523.25;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.15;
            oscillator.start();
            setTimeout(() => { oscillator.frequency.value = 659.25; }, 150);
            setTimeout(() => { oscillator.frequency.value = 783.99; }, 300);
            setTimeout(() => { oscillator.stop(); }, 500);
        } catch (e) {}
    },

    // ================================================================
    // KARAOKE-STYLE SCRIPT PLAYBACK
    // ================================================================

    startPlayback: function() {
        if (!this.analysisResults) {
            showToast('Please scan the script first before playing.', 'warning');
            return;
        }
        if (this.isPlaying) return;

        const content = this.currentScriptContent;
        if (!content) { showToast('No script content to play.', 'error'); return; }

        let karaokeContainer = document.getElementById('coachKaraokeContainer');
        if (!karaokeContainer) {
            karaokeContainer = this.createKaraokeContainer();
        }

        const contentDiv = document.getElementById('scriptContent');
        if (!contentDiv) return;

        contentDiv.innerHTML = '';
        contentDiv.appendChild(karaokeContainer);

        const words = this.analysisResults.words || content.split(/\s+/).filter(w => w.length > 0);
        const wordTimings = this.analysisResults.wordTimings || [];
        const lines = this.analysisResults.lines || [];

        // Ensure wordTimings matches words length
        while (wordTimings.length < words.length) {
            wordTimings.push({
                word: words[wordTimings.length],
                index: wordTimings.length,
                startTime: wordTimings.reduce((sum, w) => sum + w.duration, 0),
                duration: 250,
                endTime: wordTimings.reduce((sum, w) => sum + w.duration, 0) + 250,
                emphasis: 0.5,
                confidence: 0.5,
                hasPause: false,
                pitchVariation: 0
            });
        }

        this.words = words;
        this.wordTimings = wordTimings;
        this.isPlaying = true;
        this.isPaused = false;
        this.currentWordIndex = 0;
        this.progress = 0;
        this.currentTime = 0;

        const playBtn = this.elements.playBtn;
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            playBtn.style.background = 'var(--warning)';
            playBtn.style.color = '#1e293b';
        }

        this.renderKaraokeDisplay(karaokeContainer, words, wordTimings, lines);

        const totalDuration = wordTimings.reduce((sum, w) => sum + w.duration, 0);
        this.totalDuration = totalDuration;

        this.startKaraokePlayback();
        this.showKaraokeControls(karaokeContainer);
    },

    createKaraokeContainer: function() {
        const container = document.createElement('div');
        container.id = 'coachKaraokeContainer';
        container.className = 'coach-karaoke-container';
        container.innerHTML = `
            <div class="coach-karaoke-header">
                <div class="coach-karaoke-title">
                    <span class="coach-karaoke-icon">🎤</span>
                    <span>Karaoke Mode</span>
                </div>
                <div class="coach-karaoke-controls">
                    <button class="coach-speed-btn" data-speed="0.75">0.75x</button>
                    <button class="coach-speed-btn active" data-speed="1.0">1x</button>
                    <button class="coach-speed-btn" data-speed="1.25">1.25x</button>
                    <button class="coach-speed-btn" data-speed="1.5">1.5x</button>
                </div>
            </div>
            <div class="coach-karaoke-progress">
                <div class="coach-progress-bar" id="coachProgressBar">
                    <div class="coach-progress-fill" id="coachProgressFill" style="width:0%;"></div>
                    <div class="coach-progress-handle" id="coachProgressHandle"></div>
                </div>
                <div class="coach-progress-time">
                    <span id="coachCurrentTime">0:00</span>
                    <span id="coachTotalTime">0:00</span>
                </div>
            </div>
            <div class="coach-karaoke-sections" id="coachSectionsContainer">
                ${SCRIPT_COACH_CONFIG.SECTIONS.map((section, i) => `
                    <button class="coach-section-btn" data-section="${i}" title="${section.label}">
                        ${section.icon} ${section.label}
                    </button>
                `).join('')}
            </div>
            <div class="coach-karaoke-body" id="coachKaraokeBody">
                <div class="coach-karaoke-lines" id="coachKaraokeLines"></div>
            </div>
            <div class="coach-karaoke-footer">
                <div class="coach-karaoke-actions">
                    <button class="coach-action-btn" id="coachLoopBtn" title="Loop Section"><i class="fas fa-repeat"></i></button>
                    <button class="coach-action-btn" id="coachReplayBtn" title="Replay"><i class="fas fa-undo"></i></button>
                    <button class="coach-action-btn" id="coachFocusBtn" title="Focus Mode"><i class="fas fa-eye"></i></button>
                    <button class="coach-action-btn" id="coachCuesBtn" title="Show Cues"><i class="fas fa-flag"></i></button>
                    <button class="coach-action-btn" id="coachRecordBtn" title="Record"><i class="fas fa-microphone"></i></button>
                </div>
                <div class="coach-karaoke-status" id="coachStatusDisplay">
                    <span class="coach-status-text">Ready</span>
                </div>
            </div>
        `;

        // Speed buttons
        container.querySelectorAll('.coach-speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.coach-speed-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.playbackSpeed = parseFloat(btn.dataset.speed);
                if (this.isPlaying || this.isPaused) {
                    this.stopPlayback();
                    this.startPlayback();
                }
            });
        });

        // Section navigation
        container.querySelectorAll('.coach-section-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionIndex = parseInt(btn.dataset.section);
                this.navigateToSection(sectionIndex);
            });
        });

        // Loop button
        const loopBtn = container.querySelector('#coachLoopBtn');
        if (loopBtn) {
            loopBtn.addEventListener('click', () => this.toggleLoop());
        }

        // Replay button
        const replayBtn = container.querySelector('#coachReplayBtn');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                this.stopPlayback();
                this.currentWordIndex = 0;
                this.startPlayback();
            });
        }

        // Focus mode button
        const focusBtn = container.querySelector('#coachFocusBtn');
        if (focusBtn) {
            focusBtn.addEventListener('click', () => this.toggleFocusMode());
            focusBtn.classList.add('active');
        }

        // Cues button
        const cuesBtn = container.querySelector('#coachCuesBtn');
        if (cuesBtn) {
            cuesBtn.addEventListener('click', () => this.toggleCues());
            cuesBtn.classList.add('active');
        }

        // Record button
        const recordBtn = container.querySelector('#coachRecordBtn');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
        }

        // Progress bar seeking
        const progressBar = container.querySelector('#coachProgressBar');
        if (progressBar) {
            progressBar.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.updateProgressFromEvent(e);
            });
            document.addEventListener('mousemove', (e) => {
                if (this.isDragging) {
                    this.updateProgressFromEvent(e);
                }
            });
            document.addEventListener('mouseup', () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    this.seekToPosition();
                }
            });
            progressBar.addEventListener('touchstart', (e) => {
                this.isDragging = true;
                this.updateProgressFromTouch(e);
            });
            progressBar.addEventListener('touchmove', (e) => {
                if (this.isDragging) {
                    this.updateProgressFromTouch(e);
                }
            });
            progressBar.addEventListener('touchend', () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    this.seekToPosition();
                }
            });
        }

        return container;
    },

    updateProgressFromEvent: function(e) {
        const progressBar = document.getElementById('coachProgressBar');
        if (!progressBar) return;
        const rect = progressBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const fill = document.getElementById('coachProgressFill');
        if (fill) fill.style.width = (x * 100) + '%';
        this.progress = x;

        const currentTime = document.getElementById('coachCurrentTime');
        if (currentTime && this.totalDuration) {
            const time = x * this.totalDuration;
            currentTime.textContent = this.formatTime(time);
        }
    },

    updateProgressFromTouch: function(e) {
        const progressBar = document.getElementById('coachProgressBar');
        if (!progressBar) return;
        const rect = progressBar.getBoundingClientRect();
        const touch = e.touches[0];
        const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const fill = document.getElementById('coachProgressFill');
        if (fill) fill.style.width = (x * 100) + '%';
        this.progress = x;

        const currentTime = document.getElementById('coachCurrentTime');
        if (currentTime && this.totalDuration) {
            const time = x * this.totalDuration;
            currentTime.textContent = this.formatTime(time);
        }
    },

    seekToPosition: function() {
        const index = Math.floor(this.progress * this.words.length);
        this.currentWordIndex = Math.max(0, Math.min(index, this.words.length - 1));
        if (this.isPlaying || this.isPaused) {
            this.stopPlayback();
            this.startPlayback();
        }
    },

    formatTime: function(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    },

    renderKaraokeDisplay: function(container, words, wordTimings, lines) {
        const linesContainer = container.querySelector('#coachKaraokeLines');
        if (!linesContainer) return;

        if (!lines || lines.length === 0) {
            const content = this.currentScriptContent;
            const sentenceLines = content ? content.split(/[.!?]\s+/).filter(l => l.trim().length > 0) : [];
            this.renderWordByWord(linesContainer, words, wordTimings);
            return;
        }

        let html = '';
        let wordIndex = 0;

        lines.forEach((line, lineIndex) => {
            const lineWords = line.split(/\s+/).filter(w => w.length > 0);
            const isActive = lineIndex === this.activeLineIndex;
            const isSetter = line.toLowerCase().includes('setter') || line.toLowerCase().includes('agent') || line.toLowerCase().includes('rep');
            const isProspect = line.toLowerCase().includes('prospect') || line.toLowerCase().includes('client') || line.toLowerCase().includes('customer');

            let lineClass = 'coach-line';
            if (isActive) lineClass += ' active';
            if (isSetter) lineClass += ' setter';
            if (isProspect) lineClass += ' prospect';
            if (this.focusMode && !isActive) lineClass += ' dimmed';

            html += `<div class="${lineClass}" data-line="${lineIndex}">`;

            if (isSetter || isProspect) {
                html += `<span class="coach-speaker-label">${isSetter ? '👤 Setter' : '👥 Prospect'}</span>`;
            }

            lineWords.forEach((word) => {
                const timing = (wordTimings && wordTimings[wordIndex]) ? wordTimings[wordIndex] : { emphasis: 0.5, confidence: 0.5, hasPause: false };
                const isCurrent = wordIndex === this.currentWordIndex;
                const emphasis = timing.emphasis || 0.5;
                const confidence = timing.confidence || 0.5;

                let wordClass = 'coach-word';
                if (isCurrent) wordClass += ' current';
                if (isCurrent && this.isPlaying) wordClass += ' speaking';
                if (emphasis > 0.7) wordClass += ' emphasis';
                if (confidence < 0.4) wordClass += ' low-confidence';
                if (timing.hasPause) wordClass += ' pause';

                const color = this.getWordColor(emphasis, confidence);
                html += `<span class="${wordClass}" data-index="${wordIndex}" style="color:${color};">${word}</span>`;

                if (this.showCues) {
                    const cue = this.getWordCue(word);
                    if (cue) {
                        html += `<span class="coach-cue" style="color:${cue.color};">${cue.label}</span>`;
                    }
                }
                wordIndex++;
            });
            html += `</div>`;
        });
        linesContainer.innerHTML = html;
    },

    renderWordByWord: function(container, words, wordTimings) {
        let html = '<div class="coach-line active">';
        words.forEach((word, index) => {
            const timing = (wordTimings && wordTimings[index]) ? wordTimings[index] : { emphasis: 0.5, confidence: 0.5, hasPause: false };
            const isCurrent = index === this.currentWordIndex;
            const emphasis = timing.emphasis || 0.5;
            const confidence = timing.confidence || 0.5;

            let wordClass = 'coach-word';
            if (isCurrent) wordClass += ' current';
            if (isCurrent && this.isPlaying) wordClass += ' speaking';
            if (emphasis > 0.7) wordClass += ' emphasis';
            if (confidence < 0.4) wordClass += ' low-confidence';
            if (timing.hasPause) wordClass += ' pause';

            const color = this.getWordColor(emphasis, confidence);
            html += `<span class="${wordClass}" data-index="${index}" style="color:${color};">${word}</span>`;

            if (this.showCues) {
                const cue = this.getWordCue(word);
                if (cue) {
                    html += `<span class="coach-cue" style="color:${cue.color};">${cue.label}</span>`;
                }
            }
        });
        html += '</div>';
        container.innerHTML = html;
    },

    getWordCue: function(word) {
        for (const cue of SCRIPT_COACH_CONFIG.EMPHASIS_CUES) {
            if (cue.pattern.test(word)) {
                return cue;
            }
        }
        return null;
    },

    startKaraokePlayback: function() {
        const wordTimings = this.wordTimings;
        const words = this.words;
        let startIndex = this.currentWordIndex;
        let startTime = Date.now();
        let elapsed = 0;
        let currentIndex = startIndex;
        let lastHighlightIndex = -1;

        const speed = this.playbackSpeed;
        const totalDuration = this.totalDuration;

        this.highlightWord(startIndex);
        this.updateActiveLine(startIndex);

        const totalTimeEl = document.getElementById('coachTotalTime');
        if (totalTimeEl) totalTimeEl.textContent = this.formatTime(totalDuration);

        this.playbackInterval = setInterval(() => {
            if (this.isPaused) {
                startTime = Date.now() - elapsed;
                return;
            }
            if (this.isDragging) return;

            elapsed = (Date.now() - startTime) * speed;
            let accumulatedTime = 0;

            let foundIndex = -1;
            for (let i = startIndex; i < wordTimings.length; i++) {
                if (elapsed >= accumulatedTime && elapsed < accumulatedTime + wordTimings[i].duration) {
                    foundIndex = i;
                    break;
                }
                accumulatedTime += wordTimings[i].duration;
            }

            if (foundIndex === -1 && elapsed >= accumulatedTime) {
                this.stopPlayback();
                showToast('✅ Playback complete!', 'success');
                return;
            }

            if (foundIndex !== -1 && foundIndex !== lastHighlightIndex) {
                currentIndex = foundIndex;
                lastHighlightIndex = foundIndex;
                this.currentWordIndex = currentIndex;

                this.highlightWord(currentIndex);
                this.updateActiveLine(currentIndex);
                this.playWordSound(currentIndex);

                const progress = currentIndex / words.length;
                this.progress = progress;
                const fill = document.getElementById('coachProgressFill');
                if (fill) fill.style.width = (progress * 100) + '%';

                const currentTimeEl = document.getElementById('coachCurrentTime');
                if (currentTimeEl) {
                    const currentTime = currentIndex > 0 ? 
                        wordTimings.slice(0, currentIndex).reduce((sum, w) => sum + w.duration, 0) / speed : 0;
                    currentTimeEl.textContent = this.formatTime(currentTime);
                    this.currentTime = currentTime;
                }

                this.updateSectionIndicator(currentIndex);
            }

            if (this.isLooping && currentIndex >= this.words.length - 1) {
                this.currentWordIndex = this.loopStart;
                startTime = Date.now();
                elapsed = 0;
                lastHighlightIndex = -1;
                showToast('🔄 Loop repeat', 'info');
            }
        }, 50);
    },

    highlightWord: function(index) {
        const wordElements = document.querySelectorAll('.coach-word');
        wordElements.forEach((el, i) => {
            el.classList.remove('current', 'speaking');
            if (i === index) {
                el.classList.add('current', 'speaking');
                const line = el.closest('.coach-line');
                if (line) {
                    const container = document.getElementById('coachKaraokeBody');
                    if (container) {
                        const lineTop = line.offsetTop;
                        const containerHeight = container.clientHeight;
                        const lineHeight = line.offsetHeight;
                        const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);
                        container.scrollTo({
                            top: Math.max(0, scrollTo),
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    },

    updateActiveLine: function(index) {
        const lines = document.querySelectorAll('.coach-line');
        const wordElements = document.querySelectorAll('.coach-word');
        let currentLineIndex = -1;

        wordElements.forEach((el, i) => {
            if (i === index) {
                const line = el.closest('.coach-line');
                if (line) {
                    const allLines = document.querySelectorAll('.coach-line');
                    allLines.forEach((l, idx) => {
                        if (l === line) currentLineIndex = idx;
                    });
                }
            }
        });

        this.activeLineIndex = currentLineIndex;

        lines.forEach((line, i) => {
            line.classList.remove('active');
            if (this.focusMode) {
                line.classList.add('dimmed');
            }
            if (i === currentLineIndex) {
                line.classList.add('active');
                line.classList.remove('dimmed');
            }
        });
    },

    updateSectionIndicator: function(index) {
        const sections = this.analysisResults?.sections || [];
        const sectionButtons = document.querySelectorAll('.coach-section-btn');

        let currentSection = 0;
        for (let i = 0; i < sections.length; i++) {
            if (sections[i] && sections[i].lineIndex <= index) {
                currentSection = sections[i].sectionId;
            }
        }

        sectionButtons.forEach((btn, i) => {
            btn.classList.remove('active');
            if (i === currentSection) {
                btn.classList.add('active');
            }
        });
    },

    navigateToSection: function(sectionIndex) {
        const sections = this.analysisResults?.sections || [];
        let targetIndex = 0;

        for (let i = 0; i < sections.length; i++) {
            if (sections[i] && sections[i].sectionId === sectionIndex) {
                targetIndex = sections[i].lineIndex;
                const lines = document.querySelectorAll('.coach-line');
                if (lines[i]) {
                    const firstWord = lines[i].querySelector('.coach-word');
                    if (firstWord) {
                        const wordIndex = parseInt(firstWord.dataset.index);
                        if (!isNaN(wordIndex)) {
                            this.currentWordIndex = wordIndex;
                            if (this.isPlaying || this.isPaused) {
                                this.stopPlayback();
                                this.startPlayback();
                            }
                            return;
                        }
                    }
                }
            }
        }
        showToast(`Navigated to ${SCRIPT_COACH_CONFIG.SECTIONS[sectionIndex]?.label || 'Section'}`, 'info');
    },

    pausePlayback: function() {
        if (!this.isPlaying) return;
        this.isPaused = true;
        const playBtn = this.elements.playBtn;
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            playBtn.style.background = 'var(--success)';
            playBtn.style.color = 'white';
        }
        document.querySelectorAll('.coach-word.speaking').forEach(el => {
            el.classList.remove('speaking');
        });
        showToast('⏸️ Paused', 'info');
    },

    resumePlayback: function() {
        if (!this.isPaused) return;
        this.isPaused = false;
        const playBtn = this.elements.playBtn;
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            playBtn.style.background = 'var(--warning)';
            playBtn.style.color = '#1e293b';
        }
        this.startKaraokePlayback();
        showToast('▶️ Resumed', 'info');
    },

    stopPlayback: function() {
        this.isPlaying = false;
        this.isPaused = false;

        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }

        const playBtn = this.elements.playBtn;
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            playBtn.style.background = '';
            playBtn.style.color = '';
        }

        document.querySelectorAll('.coach-word').forEach(el => {
            el.classList.remove('current', 'speaking');
        });

        const statusDisplay = document.getElementById('coachStatusDisplay');
        if (statusDisplay) {
            const statusText = statusDisplay.querySelector('.coach-status-text');
            if (statusText) statusText.textContent = 'Stopped';
        }

        if (this.isRecording) {
            this.stopRecording();
        }
    },

    showKaraokeControls: function(container) {
        const statusDisplay = document.getElementById('coachStatusDisplay');
        if (statusDisplay) {
            const statusText = statusDisplay.querySelector('.coach-status-text');
            if (statusText) statusText.textContent = '▶️ Playing...';
        }
    },

    playWordSound: function(index) {
        try {
            const annotation = this.analysisResults?.wordAnnotations?.[index] || {};
            const tone = SCRIPT_COACH_CONFIG.TONES[this.selectedTone] || SCRIPT_COACH_CONFIG.TONES['conversational'];
            const audioCtx = this.audioContext;
            if (!audioCtx) return;

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            let baseFreq = 440 + (annotation.pitchVariation || 0) * 100;
            if (tone.pitch) baseFreq = baseFreq * (0.8 + (tone.pitch * 0.4));

            oscillator.frequency.value = baseFreq;
            oscillator.type = 'sine';
            const volume = 0.06 + (annotation.emphasis || 0.5) * 0.08;
            gainNode.gain.value = volume;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 60);
        } catch (e) {}
    },

    getWordColor: function(emphasis, confidence) {
        const hue = 210 + (emphasis * 60);
        const lightness = 50 + (confidence * 30);
        return `hsl(${hue}, 80%, ${lightness}%)`;
    },

    // ================================================================
    // LOOP, FOCUS, CUES TOGGLES
    // ================================================================

    toggleLoop: function() {
        this.isLooping = !this.isLooping;
        const loopBtn = document.getElementById('coachLoopBtn');
        if (loopBtn) {
            loopBtn.classList.toggle('active');
            if (this.isLooping) {
                this.loopStart = this.currentWordIndex;
                showToast('🔁 Loop start set', 'info');
            } else {
                showToast('🔁 Loop disabled', 'info');
            }
        }
    },

    toggleFocusMode: function() {
        this.focusMode = !this.focusMode;
        const focusBtn = document.getElementById('coachFocusBtn');
        if (focusBtn) {
            focusBtn.classList.toggle('active');
        }
        // Re-render display
        const container = document.getElementById('coachKaraokeContainer');
        if (container) {
            this.renderKaraokeDisplay(container, this.words, this.wordTimings, this.analysisResults?.lines || []);
            // Re-highlight current word
            if (this.currentWordIndex >= 0) {
                this.highlightWord(this.currentWordIndex);
                this.updateActiveLine(this.currentWordIndex);
            }
        }
        showToast(this.focusMode ? '👁️ Focus mode enabled' : '👁️ Focus mode disabled', 'info');
    },

    toggleCues: function() {
        this.showCues = !this.showCues;
        const cuesBtn = document.getElementById('coachCuesBtn');
        if (cuesBtn) {
            cuesBtn.classList.toggle('active');
        }
        // Re-render display
        const container = document.getElementById('coachKaraokeContainer');
        if (container) {
            this.renderKaraokeDisplay(container, this.words, this.wordTimings, this.analysisResults?.lines || []);
            if (this.currentWordIndex >= 0) {
                this.highlightWord(this.currentWordIndex);
            }
        }
        showToast(this.showCues ? '🏁 Cues shown' : '🏁 Cues hidden', 'info');
    },

    nextSection: function() {
        const next = Math.min(this.currentSection + 1, SCRIPT_COACH_CONFIG.SECTIONS.length - 1);
        this.navigateToSection(next);
    },

    prevSection: function() {
        const prev = Math.max(this.currentSection - 1, 0);
        this.navigateToSection(prev);
    },

    // ================================================================
    // RECORDING FUNCTIONALITY
    // ================================================================

    toggleRecording: function() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    },

    startRecording: function() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showToast('Recording not supported in this browser.', 'error');
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.recordedChunks = [];
                this.isRecording = true;

                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.recordedChunks.push(event.data);
                    }
                };

                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                    const url = URL.createObjectURL(blob);
                    const audio = document.createElement('audio');
                    audio.src = url;
                    audio.controls = true;
                    audio.style.width = '100%';
                    audio.style.marginTop = '8px';

                    const statusDisplay = document.getElementById('coachStatusDisplay');
                    if (statusDisplay) {
                        const existingAudio = statusDisplay.querySelector('audio');
                        if (existingAudio) existingAudio.remove();
                        statusDisplay.appendChild(audio);
                    }

                    const downloadBtn = document.createElement('button');
                    downloadBtn.className = 'btn-icon';
                    downloadBtn.style.cssText = 'margin-top:8px; background:var(--primary); color:white; padding:4px 12px; font-size:0.7rem;';
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Recording';
                    downloadBtn.onclick = () => {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `recording_${new Date().toISOString()}.webm`;
                        a.click();
                    };

                    if (statusDisplay) {
                        statusDisplay.appendChild(downloadBtn);
                    }

                    showToast('Recording saved! 🎙️', 'success');
                    this.isRecording = false;
                    this.updateRecordButton(false);
                };

                this.mediaRecorder.start();
                this.updateRecordButton(true);
                showToast('🎙️ Recording... Click stop when done.', 'info');
            })
            .catch(err => {
                showToast('Unable to access microphone: ' + err.message, 'error');
            });
    },

    stopRecording: function() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            this.updateRecordButton(false);
        }
    },

    updateRecordButton: function(isRecording) {
        const recordBtn = document.getElementById('coachRecordBtn');
        if (recordBtn) {
            if (isRecording) {
                recordBtn.innerHTML = '<i class="fas fa-stop"></i>';
                recordBtn.style.background = 'var(--danger)';
                recordBtn.style.color = 'white';
            } else {
                recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                recordBtn.style.background = '';
                recordBtn.style.color = '';
            }
        }
    }
};

// ================================================================
// SCRIPT COACH INITIALIZATION
// ================================================================

function initScriptCoach() {
    // Store reference to original loadScript
    const originalLoadScript = window.Scripts?.loadScript;

    // Override loadScript to notify coach
    if (window.Scripts) {
        window.Scripts.loadScript = function(id) {
            if (originalLoadScript) {
                originalLoadScript.call(this, id);
            }
            const content = window.AppState?.scripts?.[id]?.content || '';
            ScriptCoach.onScriptLoaded(id, content);
        };
    }

    // Initialize audio context on user interaction
    document.addEventListener('click', () => {
        if (!ScriptCoach.audioContext) {
            try {
                ScriptCoach.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported');
            }
        }
    }, { once: true });

    // Initialize coach
    ScriptCoach.init();

    // If there's already a script loaded, notify coach
    if (window.AppState?.currentScriptId && window.AppState?.scripts?.[window.AppState.currentScriptId]) {
        const script = window.AppState.scripts[window.AppState.currentScriptId];
        ScriptCoach.onScriptLoaded(window.AppState.currentScriptId, script.content);
    }

    console.log('🎤 Karaoke Script Coach initialized');
}

// ================================================================
// EXPOSE GLOBAL FUNCTIONS
// ================================================================

window.ScriptCoach = ScriptCoach;
window.initScriptCoach = initScriptCoach;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initScriptCoach, 500);
});