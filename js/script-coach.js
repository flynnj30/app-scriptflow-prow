// ================================================================
// SCRIPT COACH - KARAOKE-STYLE SCRIPT PLAYER
// ================================================================

// ================================================================
// SCRIPT COACH CONFIGURATION
// ================================================================

const SCRIPT_COACH_CONFIG = {
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
    
    METRICS: {
        tonality: { label: 'Tonality', icon: '🎵' },
        pacing: { label: 'Pacing', icon: ⏱️' },
        phrasing: { label: 'Phrasing', icon: '📝' },
        emphasis: { label: 'Emphasis', icon: '🔊' },
        pauses: { label: 'Pause Usage', icon: '⏸️' },
        confidence: { label: 'Confidence', icon: '💪' },
        objections: { label: 'Objection Handling', icon: '🛡️' },
        flow: { label: 'Conversational Flow', icon: '🌊' }
    },
    
    TOP_PERFORMING_TONES: ['confident', 'consultative', 'conversational'],
    DEFAULT_TONE: 'confident',
    
    THRESHOLDS: {
        excellent: 0.85,
        good: 0.7,
        fair: 0.5,
        needs_improvement: 0.3
    },
    
    // Playback speeds
    PLAYBACK_SPEEDS: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
    
    // Section markers for navigation
    SECTION_MARKERS: [
        { id: 'introduction', label: 'Introduction', icon: '👋', pattern: /introduction|intro|opening|greeting|start|begin/i },
        { id: 'qualification', label: 'Qualification', icon: '🔍', pattern: /qualif|discover|need|problem|pain|challenge|situation/i },
        { id: 'value_proposition', label: 'Value Prop', icon: '💎', pattern: /value|benefit|solution|offer|proposition|result|outcome/i },
        { id: 'objection_handling', label: 'Objection Handling', icon: '🛡️', pattern: /objection|concern|issue|worry|hesitat|doubt|question|understand/i },
        { id: 'closing', label: 'Closing', icon: '🤝', pattern: /close|next step|call to action|cta|schedule|book|calendar|appointment|commit|decide/i }
    ]
};

// ================================================================
// SCRIPT COACH STATE
// ================================================================

const ScriptCoachState = {
    isAnalyzing: false,
    isPlaying: false,
    isPaused: false,
    currentScriptId: null,
    currentScriptContent: '',
    selectedTone: SCRIPT_COACH_CONFIG.DEFAULT_TONE,
    analysisResults: null,
    analysisComplete: false,
    playbackSpeed: 1.0,
    currentWordIndex: 0,
    words: [],
    sentences: [],
    playbackInterval: null,
    audioContext: null,
    currentSection: null,
    isLooping: false,
    loopStart: 0,
    loopEnd: 0,
    progress: 0,
    isRecording: false,
    recordedAudio: null,
    recordingStartTime: null,
    mediaRecorder: null,
    audioChunks: [],
    sentenceMode: true, // true = sentence highlighting, false = word highlighting
    dimNonActive: true,
    showSpeakerLabels: true,
    autoScroll: true
};

// ================================================================
// KARAOKE SCRIPT PLAYER UI
// ================================================================

/**
 * Add Karaoke Script Coach UI to script header
 */
function addScriptCoachUI() {
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
    
    const favoriteBtn = scriptActions.querySelector('#favoriteScriptBtn');
    if (favoriteBtn) {
        scriptActions.insertBefore(coachGroup, favoriteBtn);
    } else {
        scriptActions.appendChild(coachGroup);
    }
    
    // Add karaoke controls after script body
    addKaraokeControls();
    
    // Event listeners
    const scanBtn = document.getElementById('coachScanBtn');
    const playBtn = document.getElementById('coachPlayBtn');
    const toneSelect = document.getElementById('coachToneSelect');
    
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
                pauseScriptPlayback();
            } else if (ScriptCoachState.isPaused) {
                resumeScriptPlayback();
            } else {
                startScriptPlayback();
            }
        });
    }
    
    if (toneSelect) {
        toneSelect.addEventListener('change', (e) => {
            ScriptCoachState.selectedTone = e.target.value;
            if (ScriptCoachState.isPlaying || ScriptCoachState.isPaused) {
                restartScriptPlayback();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKaraokeShortcuts);
}

/**
 * Add karaoke controls panel
 */
function addKaraokeControls() {
    const scriptBody = document.getElementById('scriptBody');
    if (!scriptBody) return;
    
    // Check if controls already exist
    if (document.querySelector('.coach-karaoke-controls')) return;
    
    const controls = document.createElement('div');
    controls.className = 'coach-karaoke-controls';
    controls.id = 'coachKaraokeControls';
    controls.style.display = 'none';
    controls.innerHTML = `
        <div class="coach-controls-top">
            <!-- Progress Bar -->
            <div class="coach-progress-container">
                <div class="coach-progress-bar" id="coachProgressBar">
                    <div class="coach-progress-fill" id="coachProgressFill" style="width:0%;"></div>
                    <div class="coach-progress-thumb" id="coachProgressThumb"></div>
                </div>
                <div class="coach-time-display">
                    <span id="coachCurrentTime">0:00</span>
                    <span id="coachTotalTime">0:00</span>
                </div>
            </div>
            
            <!-- Controls Row -->
            <div class="coach-controls-row">
                <div class="coach-controls-left">
                    <button class="coach-control-btn" id="coachRewindBtn" title="Rewind 5 seconds">
                        <i class="fas fa-backward"></i>
                    </button>
                    <button class="coach-control-btn" id="coachPlayPauseBtn" title="Play/Pause">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="coach-control-btn" id="coachForwardBtn" title="Forward 5 seconds">
                        <i class="fas fa-forward"></i>
                    </button>
                    <button class="coach-control-btn" id="coachRestartBtn" title="Restart">
                        <i class="fas fa-undo-alt"></i>
                    </button>
                </div>
                
                <div class="coach-controls-center">
                    <button class="coach-control-btn ${ScriptCoachState.sentenceMode ? 'active' : ''}" id="coachModeToggle" title="Toggle Word/Sentence Mode">
                        <i class="fas fa-${ScriptCoachState.sentenceMode ? 'paragraph' : 'font'}"></i>
                    </button>
                    <button class="coach-control-btn ${ScriptCoachState.dimNonActive ? 'active' : ''}" id="coachDimToggle" title="Toggle Dimming">
                        <i class="fas fa-adjust"></i>
                    </button>
                    <button class="coach-control-btn ${ScriptCoachState.showSpeakerLabels ? 'active' : ''}" id="coachSpeakerToggle" title="Toggle Speaker Labels">
                        <i class="fas fa-user-tag"></i>
                    </button>
                    <button class="coach-control-btn ${ScriptCoachState.autoScroll ? 'active' : ''}" id="coachScrollToggle" title="Toggle Auto-Scroll">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
                
                <div class="coach-controls-right">
                    <select class="coach-speed-select" id="coachSpeedSelect">
                        ${SCRIPT_COACH_CONFIG.PLAYBACK_SPEEDS.map(speed => `
                            <option value="${speed}" ${speed === 1.0 ? 'selected' : ''}>${speed}x</option>
                        `).join('')}
                    </select>
                    <button class="coach-control-btn" id="coachLoopToggle" title="Toggle Loop">
                        <i class="fas fa-${ScriptCoachState.isLooping ? 'stop-circle' : 'sync-alt'}"></i>
                    </button>
                    <button class="coach-control-btn" id="coachRecordBtn" title="Record Practice">
                        <i class="fas fa-${ScriptCoachState.isRecording ? 'stop' : 'microphone'}"></i>
                    </button>
                </div>
            </div>
            
            <!-- Section Navigation -->
            <div class="coach-section-nav" id="coachSectionNav">
                ${SCRIPT_COACH_CONFIG.SECTION_MARKERS.map(section => `
                    <button class="coach-section-btn" data-section="${section.id}" title="${section.label}">
                        ${section.icon} <span>${section.label}</span>
                    </button>
                `).join('')}
            </div>
            
            <!-- Recording Status -->
            <div class="coach-recording-status" id="coachRecordingStatus" style="display:none;">
                <span class="recording-dot"></span>
                <span>Recording... <span id="coachRecordingTime">0:00</span></span>
                <button class="coach-control-btn" id="coachStopRecordingBtn" style="background:var(--danger); color:white; padding:2px 10px; font-size:0.7rem;">
                    <i class="fas fa-stop"></i> Stop
                </button>
            </div>
        </div>
    `;
    
    scriptBody.appendChild(controls);
    
    // Add event listeners for controls
    setupKaraokeControls();
}

/**
 * Setup karaoke controls event listeners
 */
function setupKaraokeControls() {
    const playPauseBtn = document.getElementById('coachPlayPauseBtn');
    const rewindBtn = document.getElementById('coachRewindBtn');
    const forwardBtn = document.getElementById('coachForwardBtn');
    const restartBtn = document.getElementById('coachRestartBtn');
    const speedSelect = document.getElementById('coachSpeedSelect');
    const loopToggle = document.getElementById('coachLoopToggle');
    const recordBtn = document.getElementById('coachRecordBtn');
    const stopRecordingBtn = document.getElementById('coachStopRecordingBtn');
    const modeToggle = document.getElementById('coachModeToggle');
    const dimToggle = document.getElementById('coachDimToggle');
    const speakerToggle = document.getElementById('coachSpeakerToggle');
    const scrollToggle = document.getElementById('coachScrollToggle');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (ScriptCoachState.isPlaying) {
                pauseScriptPlayback();
            } else {
                resumeScriptPlayback();
            }
        });
    }
    
    if (rewindBtn) {
        rewindBtn.addEventListener('click', () => {
            skipPlayback(-5000);
        });
    }
    
    if (forwardBtn) {
        forwardBtn.addEventListener('click', () => {
            skipPlayback(5000);
        });
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', restartScriptPlayback);
    }
    
    if (speedSelect) {
        speedSelect.addEventListener('change', (e) => {
            ScriptCoachState.playbackSpeed = parseFloat(e.target.value);
            if (ScriptCoachState.isPlaying || ScriptCoachState.isPaused) {
                restartScriptPlayback();
            }
        });
    }
    
    if (loopToggle) {
        loopToggle.addEventListener('click', () => {
            ScriptCoachState.isLooping = !ScriptCoachState.isLooping;
            loopToggle.innerHTML = `<i class="fas fa-${ScriptCoachState.isLooping ? 'stop-circle' : 'sync-alt'}"></i>`;
            loopToggle.classList.toggle('active');
            if (ScriptCoachState.isLooping) {
                showToast('Loop mode enabled', 'info');
            } else {
                showToast('Loop mode disabled', 'info');
            }
        });
    }
    
    if (recordBtn) {
        recordBtn.addEventListener('click', toggleRecording);
    }
    
    if (stopRecordingBtn) {
        stopRecordingBtn.addEventListener('click', stopRecording);
    }
    
    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            ScriptCoachState.sentenceMode = !ScriptCoachState.sentenceMode;
            modeToggle.innerHTML = `<i class="fas fa-${ScriptCoachState.sentenceMode ? 'paragraph' : 'font'}"></i>`;
            modeToggle.classList.toggle('active');
            if (ScriptCoachState.isPlaying || ScriptCoachState.isPaused) {
                restartScriptPlayback();
            }
            showToast(`${ScriptCoachState.sentenceMode ? 'Sentence' : 'Word'} mode activated`, 'info');
        });
    }
    
    if (dimToggle) {
        dimToggle.addEventListener('click', () => {
            ScriptCoachState.dimNonActive = !ScriptCoachState.dimNonActive;
            dimToggle.classList.toggle('active');
            if (ScriptCoachState.isPlaying || ScriptCoachState.isPaused) {
                updateHighlighting();
            }
            showToast(`${ScriptCoachState.dimNonActive ? 'Dimming' : 'Full brightness'} mode`, 'info');
        });
    }
    
    if (speakerToggle) {
        speakerToggle.addEventListener('click', () => {
            ScriptCoachState.showSpeakerLabels = !ScriptCoachState.showSpeakerLabels;
            speakerToggle.classList.toggle('active');
            if (ScriptCoachState.isPlaying || ScriptCoachState.isPaused) {
                restartScriptPlayback();
            }
            showToast(`Speaker labels ${ScriptCoachState.showSpeakerLabels ? 'shown' : 'hidden'}`, 'info');
        });
    }
    
    if (scrollToggle) {
        scrollToggle.addEventListener('click', () => {
            ScriptCoachState.autoScroll = !ScriptCoachState.autoScroll;
            scrollToggle.classList.toggle('active');
            showToast(`Auto-scroll ${ScriptCoachState.autoScroll ? 'enabled' : 'disabled'}`, 'info');
        });
    }
    
    // Section navigation
    document.querySelectorAll('.coach-section-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.getAttribute('data-section');
            navigateToSection(sectionId);
        });
    });
    
    // Progress bar click to seek
    const progressBar = document.getElementById('coachProgressBar');
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            seekToPercentage(percentage);
        });
    }
}

// ================================================================
// PLAYBACK CORE FUNCTIONS
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
    
    // Parse content into sentences and words
    parseScriptContent(content);
    
    // Show karaoke controls
    const controls = document.getElementById('coachKaraokeControls');
    if (controls) {
        controls.style.display = 'block';
    }
    
    ScriptCoachState.isPlaying = true;
    ScriptCoachState.isPaused = false;
    ScriptCoachState.currentWordIndex = 0;
    
    // Update play button
    const playBtn = document.getElementById('coachPlayBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        playBtn.style.background = 'var(--warning)';
        playBtn.style.color = '#1e293b';
    }
    
    // Update play/pause button in controls
    const playPauseBtn = document.getElementById('coachPlayPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    // Render highlighted script
    renderKaraokeScript(contentDiv);
    
    // Start playback
    startPlaybackInterval();
}

/**
 * Parse script content into sentences and words
 */
function parseScriptContent(content) {
    // Split into sentences (by period, question mark, exclamation, or newline)
    const sentenceDelimiters = /[.!?]\s+|\n+/;
    const rawSentences = content.split(sentenceDelimiters).filter(s => s.trim().length > 0);
    
    const sentences = rawSentences.map(s => ({
        text: s.trim(),
        words: s.trim().split(/\s+/).filter(w => w.length > 0),
        isSetter: !s.trim().startsWith('"') && !s.trim().startsWith('[') && !s.trim().startsWith('(')
    }));
    
    ScriptCoachState.sentences = sentences;
    ScriptCoachState.words = sentences.flatMap(s => s.words);
    
    // Calculate total estimated duration
    const totalWords = ScriptCoachState.words.length;
    const baseDuration = totalWords * 300; // 300ms per word average
    ScriptCoachState.totalDuration = baseDuration;
    
    // Update total time display
    const totalTimeEl = document.getElementById('coachTotalTime');
    if (totalTimeEl) {
        totalTimeEl.textContent = formatTime(baseDuration / 1000);
    }
}

/**
 * Render karaoke-style script
 */
function renderKaraokeScript(container) {
    const sentences = ScriptCoachState.sentences;
    const showLabels = ScriptCoachState.showSpeakerLabels;
    
    let html = '<div class="coach-karaoke-display">';
    
    let globalWordIndex = 0;
    
    sentences.forEach((sentence, sentIndex) => {
        const speakerClass = sentence.isSetter ? 'coach-speaker-setter' : 'coach-speaker-prospect';
        const speakerLabel = sentence.isSetter ? '📞 Setter' : '👤 Prospect';
        
        html += `<div class="coach-sentence-group" data-sentence-index="${sentIndex}">`;
        
        if (showLabels) {
            html += `<div class="coach-speaker-label ${speakerClass}">${speakerLabel}</div>`;
        }
        
        html += `<div class="coach-sentence" data-sentence-index="${sentIndex}">`;
        
        sentence.words.forEach((word, wordIndex) => {
            const isPunctuation = /[.,!?;:]/.test(word);
            const isEmphasis = ['absolutely', 'definitely', 'certainly', 'guarantee', 'promise', 'ensure'].includes(word.toLowerCase());
            const isPause = ['and', 'but', 'so', 'now', 'well', 'right', 'okay'].includes(word.toLowerCase());
            
            let wordClass = 'coach-karaoke-word';
            if (isPunctuation) wordClass += ' coach-punctuation';
            if (isEmphasis) wordClass += ' coach-emphasis-word';
            if (isPause) wordClass += ' coach-pause-word';
            
            html += `<span class="${wordClass}" data-word-index="${globalWordIndex}" data-sentence-index="${sentIndex}">${word}</span>`;
            globalWordIndex++;
        });
        
        html += '</div></div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Start the playback interval
 */
function startPlaybackInterval() {
    if (ScriptCoachState.playbackInterval) {
        clearInterval(ScriptCoachState.playbackInterval);
    }
    
    const speed = ScriptCoachState.playbackSpeed;
    const baseInterval = 300 / speed; // Base delay between words in ms
    
    let startTime = Date.now();
    let elapsed = 0;
    let lastWordIndex = -1;
    
    ScriptCoachState.playbackInterval = setInterval(() => {
        if (ScriptCoachState.isPaused) return;
        
        const index = ScriptCoachState.currentWordIndex;
        const words = ScriptCoachState.words;
        
        if (index >= words.length) {
            // End of script
            if (ScriptCoachState.isLooping) {
                // Loop back to start
                ScriptCoachState.currentWordIndex = 0;
                updateHighlighting();
                return;
            } else {
                stopScriptPlayback();
                return;
            }
        }
        
        // Update highlighting
        updateHighlighting();
        
        // Play audio for the word
        playWordSound(index);
        
        // Update progress
        ScriptCoachState.progress = (index / words.length) * 100;
        updateProgressBar();
        
        // Update current time
        const currentTimeEl = document.getElementById('coachCurrentTime');
        if (currentTimeEl) {
            const elapsedSeconds = (index / words.length) * (ScriptCoachState.totalDuration / 1000);
            currentTimeEl.textContent = formatTime(elapsedSeconds);
        }
        
        // Auto-scroll to active word
        if (ScriptCoachState.autoScroll) {
            scrollToActiveWord();
        }
        
        ScriptCoachState.currentWordIndex++;
        
        // Check if we need to update section
        updateCurrentSection();
        
    }, 150); // Faster update for smooth highlighting
}

/**
 * Update highlighting of current word/sentence
 */
function updateHighlighting() {
    const words = document.querySelectorAll('.coach-karaoke-word');
    const sentences = document.querySelectorAll('.coach-sentence');
    const currentIndex = ScriptCoachState.currentWordIndex;
    const isSentenceMode = ScriptCoachState.sentenceMode;
    const dimNonActive = ScriptCoachState.dimNonActive;
    
    // Get current sentence index
    let currentSentenceIndex = -1;
    words.forEach((el, i) => {
        if (i === currentIndex) {
            currentSentenceIndex = parseInt(el.getAttribute('data-sentence-index'));
        }
    });
    
    // Update words
    words.forEach((el, i) => {
        const wordIndex = parseInt(el.getAttribute('data-word-index'));
        const sentenceIndex = parseInt(el.getAttribute('data-sentence-index'));
        
        // Remove all states
        el.classList.remove('coach-active-word', 'coach-active-sentence', 'coach-dimmed', 'coach-done');
        
        if (isSentenceMode) {
            // Sentence mode: highlight entire sentence
            if (sentenceIndex === currentSentenceIndex) {
                el.classList.add('coach-active-sentence');
                if (dimNonActive) {
                    // All words in active sentence are bright
                }
            } else if (sentenceIndex < currentSentenceIndex) {
                el.classList.add('coach-done');
                if (dimNonActive) {
                    el.classList.add('coach-dimmed');
                }
            } else {
                if (dimNonActive) {
                    el.classList.add('coach-dimmed');
                }
            }
        } else {
            // Word mode: highlight current word only
            if (i === currentIndex) {
                el.classList.add('coach-active-word');
            } else if (i < currentIndex) {
                el.classList.add('coach-done');
                if (dimNonActive) {
                    el.classList.add('coach-dimmed');
                }
            } else {
                if (dimNonActive) {
                    el.classList.add('coach-dimmed');
                }
            }
        }
    });
    
    // Update sentences for dimming
    sentences.forEach((el, i) => {
        el.classList.remove('coach-sentence-active');
        if (i === currentSentenceIndex) {
            el.classList.add('coach-sentence-active');
        }
    });
}

/**
 * Scroll to active word
 */
function scrollToActiveWord() {
    const activeWord = document.querySelector('.coach-active-word, .coach-active-sentence');
    if (activeWord) {
        const container = document.getElementById('scriptContent');
        if (container) {
            const wordRect = activeWord.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const scrollOffset = wordRect.top - containerRect.top - containerRect.height / 2 + wordRect.height / 2;
            container.scrollTop += scrollOffset;
        }
    }
}

/**
 * Pause script playback
 */
function pauseScriptPlayback() {
    if (!ScriptCoachState.isPlaying) return;
    
    ScriptCoachState.isPaused = true;
    ScriptCoachState.isPlaying = false;
    
    // Update play button
    const playBtn = document.getElementById('coachPlayBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        playBtn.style.background = 'var(--primary)';
        playBtn.style.color = 'white';
    }
    
    const playPauseBtn = document.getElementById('coachPlayPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    showToast('⏸️ Paused', 'info');
}

/**
 * Resume script playback
 */
function resumeScriptPlayback() {
    if (!ScriptCoachState.isPaused) return;
    
    ScriptCoachState.isPaused = false;
    ScriptCoachState.isPlaying = true;
    
    // Update play button
    const playBtn = document.getElementById('coachPlayBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        playBtn.style.background = 'var(--warning)';
        playBtn.style.color = '#1e293b';
    }
    
    const playPauseBtn = document.getElementById('coachPlayPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    showToast('▶️ Resumed', 'info');
}

/**
 * Restart script playback
 */
function restartScriptPlayback() {
    ScriptCoachState.currentWordIndex = 0;
    ScriptCoachState.progress = 0;
    updateProgressBar();
    
    if (ScriptCoachState.isPlaying) {
        // Restart while playing
        const contentDiv = document.getElementById('scriptContent');
        if (contentDiv) {
            renderKaraokeScript(contentDiv);
        }
        updateHighlighting();
        scrollToActiveWord();
    } else if (ScriptCoachState.isPaused) {
        // Resume from start
        ScriptCoachState.isPaused = false;
        ScriptCoachState.isPlaying = true;
        const contentDiv = document.getElementById('scriptContent');
        if (contentDiv) {
            renderKaraokeScript(contentDiv);
        }
        updateHighlighting();
        scrollToActiveWord();
        startPlaybackInterval();
    } else {
        // Start from beginning
        startScriptPlayback();
    }
}

/**
 * Stop script playback
 */
function stopScriptPlayback() {
    ScriptCoachState.isPlaying = false;
    ScriptCoachState.isPaused = false;
    
    if (ScriptCoachState.playbackInterval) {
        clearInterval(ScriptCoachState.playbackInterval);
        ScriptCoachState.playbackInterval = null;
    }
    
    // Reset play button
    const playBtn = document.getElementById('coachPlayBtn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        playBtn.style.background = '';
        playBtn.style.color = '';
    }
    
    const playPauseBtn = document.getElementById('coachPlayPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    // Reset highlighting
    const words = document.querySelectorAll('.coach-karaoke-word');
    words.forEach(el => {
        el.classList.remove('coach-active-word', 'coach-active-sentence', 'coach-dimmed', 'coach-done');
    });
    
    // Reset progress
    ScriptCoachState.progress = 0;
    updateProgressBar();
    ScriptCoachState.currentWordIndex = 0;
}

/**
 * Skip playback by milliseconds
 */
function skipPlayback(ms) {
    const words = ScriptCoachState.words;
    if (!words || words.length === 0) return;
    
    const totalDuration = ScriptCoachState.totalDuration || (words.length * 300);
    const skipRatio = ms / totalDuration;
    const skipWords = Math.floor(skipRatio * words.length);
    
    let newIndex = ScriptCoachState.currentWordIndex + skipWords;
    newIndex = Math.max(0, Math.min(words.length - 1, newIndex));
    
    ScriptCoachState.currentWordIndex = newIndex;
    updateHighlighting();
    updateProgressBar();
    scrollToActiveWord();
}

/**
 * Seek to percentage of script
 */
function seekToPercentage(percentage) {
    const words = ScriptCoachState.words;
    if (!words || words.length === 0) return;
    
    const index = Math.floor(percentage * words.length);
    ScriptCoachState.currentWordIndex = Math.max(0, Math.min(words.length - 1, index));
    updateHighlighting();
    updateProgressBar();
    scrollToActiveWord();
}

/**
 * Navigate to a section
 */
function navigateToSection(sectionId) {
    const content = ScriptCoachState.currentScriptContent;
    if (!content) return;
    
    const section = SCRIPT_COACH_CONFIG.SECTION_MARKERS.find(s => s.id === sectionId);
    if (!section) return;
    
    // Find the section in the content
    const lines = content.split('\n');
    let foundIndex = -1;
    let wordOffset = 0;
    
    for (let i = 0; i < lines.length; i++) {
        if (section.pattern.test(lines[i])) {
            foundIndex = i;
            break;
        }
        wordOffset += lines[i].split(/\s+/).filter(w => w.length > 0).length;
    }
    
    if (foundIndex !== -1) {
        ScriptCoachState.currentWordIndex = wordOffset;
        updateHighlighting();
        updateProgressBar();
        scrollToActiveWord();
        showToast(`📍 Jumped to ${section.label}`, 'success');
    } else {
        showToast(`Section "${section.label}" not found in script`, 'warning');
    }
}

/**
 * Update current section
 */
function updateCurrentSection() {
    const words = ScriptCoachState.words;
    if (!words || words.length === 0) return;
    
    const currentIndex = ScriptCoachState.currentWordIndex;
    const word = words[currentIndex] || '';
    const text = word.toLowerCase();
    
    let foundSection = null;
    for (const section of SCRIPT_COACH_CONFIG.SECTION_MARKERS) {
        if (section.pattern.test(text)) {
            foundSection = section;
            break;
        }
    }
    
    if (foundSection && foundSection.id !== ScriptCoachState.currentSection) {
        ScriptCoachState.currentSection = foundSection.id;
        // Highlight active section button
        document.querySelectorAll('.coach-section-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-section') === foundSection.id);
        });
    }
}

/**
 * Update progress bar
 */
function updateProgressBar() {
    const fill = document.getElementById('coachProgressFill');
    const thumb = document.getElementById('coachProgressThumb');
    if (fill) {
        fill.style.width = ScriptCoachState.progress + '%';
    }
    if (thumb) {
        thumb.style.left = ScriptCoachState.progress + '%';
    }
}

/**
 * Format time for display
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

// ================================================================
// RECORDING FUNCTIONALITY
// ================================================================

/**
 * Toggle recording
 */
async function toggleRecording() {
    if (ScriptCoachState.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

/**
 * Start recording
 */
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ScriptCoachState.mediaRecorder = new MediaRecorder(stream);
        ScriptCoachState.audioChunks = [];
        ScriptCoachState.isRecording = true;
        ScriptCoachState.recordingStartTime = Date.now();
        
        ScriptCoachState.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                ScriptCoachState.audioChunks.push(event.data);
            }
        };
        
        ScriptCoachState.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(ScriptCoachState.audioChunks, { type: 'audio/wav' });
            ScriptCoachState.recordedAudio = audioBlob;
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            // Show download button
            const downloadLink = document.createElement('a');
            downloadLink.href = audioUrl;
            downloadLink.download = `practice_recording_${new Date().toISOString()}.wav`;
            downloadLink.textContent = 'Download Recording';
            downloadLink.className = 'btn-icon';
            downloadLink.style.cssText = 'margin-top:8px; background:var(--primary); color:white;';
            
            showToast('📹 Recording saved!', 'success');
            
            // Add download button to recording status
            const status = document.getElementById('coachRecordingStatus');
            if (status) {
                status.appendChild(downloadLink);
                setTimeout(() => {
                    if (downloadLink.parentNode) {
                        downloadLink.remove();
                    }
                }, 5000);
            }
        };
        
        ScriptCoachState.mediaRecorder.start();
        
        // Update UI
        const recordBtn = document.getElementById('coachRecordBtn');
        if (recordBtn) {
            recordBtn.innerHTML = '<i class="fas fa-stop"></i>';
            recordBtn.style.background = 'var(--danger)';
            recordBtn.style.color = 'white';
        }
        
        const status = document.getElementById('coachRecordingStatus');
        if (status) {
            status.style.display = 'flex';
        }
        
        // Update recording time
        const timeEl = document.getElementById('coachRecordingTime');
        if (timeEl) {
            const interval = setInterval(() => {
                if (!ScriptCoachState.isRecording) {
                    clearInterval(interval);
                    return;
                }
                const elapsed = (Date.now() - ScriptCoachState.recordingStartTime) / 1000;
                timeEl.textContent = formatTime(elapsed);
            }, 1000);
        }
        
        showToast('🎙️ Recording started...', 'info');
        
    } catch (error) {
        showToast('Microphone access denied. Please allow microphone access.', 'error');
        console.error('Recording error:', error);
    }
}

/**
 * Stop recording
 */
function stopRecording() {
    if (ScriptCoachState.mediaRecorder && ScriptCoachState.isRecording) {
        ScriptCoachState.mediaRecorder.stop();
        ScriptCoachState.isRecording = false;
        
        // Stop all tracks
        if (ScriptCoachState.mediaRecorder.stream) {
            ScriptCoachState.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        // Update UI
        const recordBtn = document.getElementById('coachRecordBtn');
        if (recordBtn) {
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            recordBtn.style.background = '';
            recordBtn.style.color = '';
        }
        
        const status = document.getElementById('coachRecordingStatus');
        if (status) {
            status.style.display = 'none';
        }
    }
}

// ================================================================
// KEYBOARD SHORTCUTS
// ================================================================

/**
 * Handle keyboard shortcuts
 */
function handleKaraokeShortcuts(e) {
    // Only handle if playing or paused
    if (!ScriptCoachState.isPlaying && !ScriptCoachState.isPaused) return;
    
    // Spacebar - Play/Pause
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (ScriptCoachState.isPlaying) {
            pauseScriptPlayback();
        } else if (ScriptCoachState.isPaused) {
            resumeScriptPlayback();
        }
        return;
    }
    
    // Left arrow - Rewind 5 seconds
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipPlayback(-5000);
        return;
    }
    
    // Right arrow - Forward 5 seconds
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipPlayback(5000);
        return;
    }
    
    // Up arrow - Increase speed
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        const speeds = SCRIPT_COACH_CONFIG.PLAYBACK_SPEEDS;
        const currentIndex = speeds.indexOf(ScriptCoachState.playbackSpeed);
        if (currentIndex < speeds.length - 1) {
            ScriptCoachState.playbackSpeed = speeds[currentIndex + 1];
            const speedSelect = document.getElementById('coachSpeedSelect');
            if (speedSelect) {
                speedSelect.value = ScriptCoachState.playbackSpeed;
            }
            if (ScriptCoachState.isPlaying || ScriptCoachState.isPaused) {
                restartScriptPlayback();
            }
            showToast(`Speed: ${ScriptCoachState.playbackSpeed}x`, 'info');
        }
        return;
    }
    
    // Down arrow - Decrease speed
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        const speeds = SCRIPT_COACH_CONFIG.PLAYBACK_SPEEDS;
        const currentIndex = speeds.indexOf(ScriptCoachState.playbackSpeed);
        if (currentIndex > 0) {
            ScriptCoachState.playbackSpeed = speeds[currentIndex - 1];
            const speedSelect = document.getElementById('coachSpeedSelect');
            if (speedSelect) {
                speedSelect.value = ScriptCoachState.playbackSpeed;
            }
            if (ScriptCoachState.isPlaying || ScriptCoachState.isPaused) {
                restartScriptPlayback();
            }
            showToast(`Speed: ${ScriptCoachState.playbackSpeed}x`, 'info');
        }
        return;
    }
    
    // R key - Restart
    if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        restartScriptPlayback();
        return;
    }
    
    // L key - Loop toggle
    if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        const loopBtn = document.getElementById('coachLoopToggle');
        if (loopBtn) {
            loopBtn.click();
        }
        return;
    }
}

// ================================================================
// WORD SOUND PLAYBACK
// ================================================================

/**
 * Play word sound
 */
function playWordSound(index) {
    try {
        const words = ScriptCoachState.words;
        if (!words || index >= words.length) return;
        
        const word = words[index];
        const tone = SCRIPT_COACH_CONFIG.TONES[ScriptCoachState.selectedTone] || SCRIPT_COACH_CONFIG.TONES[SCRIPT_COACH_CONFIG.DEFAULT_TONE];
        
        const audioCtx = ScriptCoachState.audioContext;
        if (!audioCtx) return;
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Base frequency with variation
        let baseFreq = 440 + (Math.random() * 20 - 10);
        if (tone.pitch) {
            baseFreq = baseFreq * (0.8 + (tone.pitch * 0.4));
        }
        
        oscillator.frequency.value = baseFreq;
        oscillator.type = 'sine';
        
        // Volume based on word emphasis
        const isEmphasis = ['absolutely', 'definitely', 'certainly', 'guarantee', 'promise', 'ensure'].includes(word.toLowerCase());
        const volume = isEmphasis ? 0.15 : 0.08;
        gainNode.gain.value = volume;
        
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 60);
    } catch (e) {
        // Silently fail if audio is not supported
    }
}

// ================================================================
// SCRIPT ANALYSIS (Keep existing functionality)
// ================================================================

function runScriptAnalysis(content) {
    if (ScriptCoachState.isAnalyzing) return;
    ScriptCoachState.isAnalyzing = true;
    ScriptCoachState.currentScriptContent = content;
    
    showAnalysisLoading();
    
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
            completeScriptAnalysis(content);
        }
    }, 400);
}

function showAnalysisLoading() {
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

function updateAnalysisLoading(progress, message) {
    const fill = document.getElementById('coachProgressFill');
    const text = document.getElementById('coachProgressText');
    const msg = document.getElementById('coachLoadingMessage');
    
    if (fill) fill.style.width = progress + '%';
    if (text) text.textContent = progress + '%';
    if (msg) msg.textContent = message;
}

function completeScriptAnalysis(content) {
    ScriptCoachState.isAnalyzing = false;
    
    const results = analyzeScriptContent(content);
    ScriptCoachState.analysisResults = results;
    
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

function analyzeScriptContent(content) {
    if (!content) return null;
    
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
    
    const metrics = {};
    let totalScore = 0;
    
    // Tonality
    const tonalityScore = analyzeTonality(content);
    metrics.tonality = tonalityScore;
    totalScore += tonalityScore;
    
    // Pacing
    const pacingScore = analyzePacing(sentences);
    metrics.pacing = pacingScore;
    totalScore += pacingScore;
    
    // Phrasing
    const phrasingScore = analyzePhrasing(words);
    metrics.phrasing = phrasingScore;
    totalScore += phrasingScore;
    
    // Emphasis
    const emphasisScore = analyzeEmphasis(content);
    metrics.emphasis = emphasisScore;
    totalScore += emphasisScore;
    
    // Pauses
    const pausesScore = analyzePauses(content);
    metrics.pauses = pausesScore;
    totalScore += pausesScore;
    
    // Confidence
    const confidenceScore = analyzeConfidence(content);
    metrics.confidence = confidenceScore;
    totalScore += confidenceScore;
    
    // Objections
    const objectionsScore = analyzeObjections(content);
    metrics.objections = objectionsScore;
    totalScore += objectionsScore;
    
    // Flow
    const flowScore = analyzeFlow(content);
    metrics.flow = flowScore;
    totalScore += flowScore;
    
    const overallScore = Math.round((totalScore / 8) * 100);
    const recommendations = generateRecommendations(metrics);
    const bestTone = identifyBestTone(metrics);
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

function analyzeTonality(content) {
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
    if (questionCount > 0) {
        score = Math.min(1, score + 0.1);
    }
    
    return Math.max(0, Math.min(1, score));
}

function analyzePacing(sentences) {
    if (sentences.length === 0) return 0.5;
    
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    
    if (avg >= 8 && avg <= 18) {
        return 0.8;
    } else if (avg >= 5 && avg <= 25) {
        return 0.6;
    } else {
        return 0.4;
    }
}

function analyzePhrasing(words) {
    if (words.length === 0) return 0.5;
    
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const ratio = uniqueWords / words.length;
    
    if (ratio >= 0.5 && ratio <= 0.8) {
        return 0.8;
    } else if (ratio >= 0.3) {
        return 0.6;
    } else {
        return 0.4;
    }
}

function analyzeEmphasis(content) {
    let score = 0.5;
    const lower = content.toLowerCase();
    
    const emphasisWords = ['absolutely', 'definitely', 'certainly', 'without a doubt', 'guarantee', 'promise', 'ensure', 'always', 'never'];
    emphasisWords.forEach(w => {
        if (lower.includes(w)) score += 0.05;
    });
    
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 0) {
        score = Math.min(1, score + 0.05 * exclamationCount);
    }
    
    return Math.max(0, Math.min(1, score));
}

function analyzePauses(content) {
    let score = 0.5;
    
    const commaCount = (content.match(/,/g) || []).length;
    const periodCount = (content.match(/\./g) || []).length;
    const ellipsisCount = (content.match(/\.\.\./g) || []).length;
    
    const totalPauses = commaCount + periodCount + ellipsisCount;
    const words = content.split(/\s+/).length;
    
    if (words > 0) {
        const pauseRatio = totalPauses / words;
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

function analyzeConfidence(content) {
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
}

function analyzeObjections(content) {
    let score = 0.5;
    const lower = content.toLowerCase();
    
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

function analyzeFlow(content) {
    let score = 0.5;
    const lower = content.toLowerCase();
    
    const conversationalMarkers = [
        'right', 'okay', 'so', 'now', 'well', 'you know', 'i mean',
        'let\'s', 'we\'ll', 'we\'re', 'you\'re', 'i\'m'
    ];
    
    let markerCount = 0;
    conversationalMarkers.forEach(m => {
        if (lower.includes(m)) markerCount++;
    });
    
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
    
    const severityOrder = { high: 0, medium: 1, positive: 2 };
    recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    
    return recommendations;
}

function identifyBestTone(metrics) {
    const toneScores = {};
    
    for (const [toneKey, toneConfig] of Object.entries(SCRIPT_COACH_CONFIG.TONES)) {
        let score = 0;
        let count = 0;
        
        for (const [metricKey, metricValue] of Object.entries(metrics)) {
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
    
    const sorted = Object.entries(toneScores).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : SCRIPT_COACH_CONFIG.DEFAULT_TONE;
}

function getBestTone() {
    if (ScriptCoachState.analysisResults) {
        return ScriptCoachState.analysisResults.bestTone || SCRIPT_COACH_CONFIG.DEFAULT_TONE;
    }
    return SCRIPT_COACH_CONFIG.DEFAULT_TONE;
}

function generateWordAnnotations(words, metrics) {
    const annotations = [];
    let confidence = metrics.confidence || 0.5;
    let emphasis = metrics.emphasis || 0.5;
    let pauses = metrics.pauses || 0.5;
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const lower = word.toLowerCase();
        
        let wordEmphasis = emphasis;
        const emphasisWords = ['absolutely', 'definitely', 'certainly', 'guarantee', 'promise', 'ensure', 'always', 'never', 'crucial', 'critical', 'essential'];
        if (emphasisWords.some(w => lower.includes(w))) {
            wordEmphasis = Math.min(1, emphasis + 0.3);
        }
        
        let hasPause = false;
        const pauseWords = ['and', 'but', 'so', 'now', 'well', 'right', 'okay', 'you know'];
        if (pauseWords.includes(lower) && pauses > 0.5) {
            hasPause = true;
        }
        
        const hasPunctuation = /[.,!?;:]/.test(word);
        if (hasPunctuation) {
            hasPause = true;
        }
        
        let pitchVariation = 0;
        const questionWord = /^[Ww]hy|[Ww]hat|[Ww]hen|[Ww]here|[Ww]ho|[Hh]ow/.test(word);
        if (questionWord) {
            pitchVariation = 0.3;
        }
        
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
// ANALYSIS RESULTS UI (Keep existing)
// ================================================================

function showAnalysisResults(results) {
    if (!results) return;
    
    const scriptBody = document.getElementById('scriptBody');
    if (!scriptBody) return;
    
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
    updateCoachUI(true);
    showToast('✅ Script analysis complete! Click Play to start karaoke practice.', 'success');
    playSuccessSound();
}

function closeCoachResults() {
    const overlay = document.getElementById('coachResultsOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    }
}

function playSuccessSound() {
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
        setTimeout(() => {
            oscillator.frequency.value = 659.25;
        }, 150);
        setTimeout(() => {
            oscillator.frequency.value = 783.99;
        }, 300);
        setTimeout(() => {
            oscillator.stop();
        }, 500);
    } catch (e) {}
}

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
// INITIALIZATION
// ================================================================

function initScriptCoach() {
    const originalLoadScript = Scripts.loadScript;
    Scripts.loadScript = function(id) {
        originalLoadScript.call(this, id);
        ScriptCoachState.isPlaying = false;
        ScriptCoachState.isPaused = false;
        ScriptCoachState.isAnalyzing = false;
        ScriptCoachState.currentScriptId = id;
        ScriptCoachState.currentScriptContent = AppState.scripts[id]?.content || '';
        ScriptCoachState.analysisResults = null;
        ScriptCoachState.analysisComplete = false;
        ScriptCoachState.currentWordIndex = 0;
        ScriptCoachState.progress = 0;
        
        // Hide controls
        const controls = document.getElementById('coachKaraokeControls');
        if (controls) {
            controls.style.display = 'none';
        }
        
        updateCoachUI(false);
        setTimeout(addScriptCoachUI, 100);
    };
    
    document.addEventListener('click', () => {
        if (!ScriptCoachState.audioContext) {
            try {
                ScriptCoachState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported');
            }
        }
    }, { once: true });
    
    setTimeout(addScriptCoachUI, 200);
    console.log('🎯 Karaoke Script Coach initialized');
}

// ================================================================
// EXPOSE GLOBAL FUNCTIONS
// ================================================================

window.ScriptCoachState = ScriptCoachState;
window.SCRIPT_COACH_CONFIG = SCRIPT_COACH_CONFIG;
window.runScriptAnalysis = runScriptAnalysis;
window.startScriptPlayback = startScriptPlayback;
window.pauseScriptPlayback = pauseScriptPlayback;
window.resumeScriptPlayback = resumeScriptPlayback;
window.stopScriptPlayback = stopScriptPlayback;
window.restartScriptPlayback = restartScriptPlayback;
window.closeCoachResults = closeCoachResults;
window.updateCoachUI = updateCoachUI;
window.initScriptCoach = initScriptCoach;
window.getBestTone = getBestTone;
window.analyzeScriptContent = analyzeScriptContent;
window.skipPlayback = skipPlayback;
window.seekToPercentage = seekToPercentage;
window.navigateToSection = navigateToSection;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initScriptCoach, 500);
});