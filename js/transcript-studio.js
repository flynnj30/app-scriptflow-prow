/* ScriptFlow Pro - Transcript Studio v2
 * Local/browser transcription workspace with Whisper via Transformers.js.
 * Existing CRM/calendar data is untouched. Audio/transcripts stay in-browser unless
 * the user explicitly imports a remote URL that their browser can access.
 */
(function () {
  'use strict';

  const HF_MODULE = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm';
  const MODELS = {
    fast: 'Xenova/whisper-tiny',
    balanced: 'Xenova/whisper-small',
    accurate: 'Xenova/whisper-base'
  };
  const LANGUAGES = [
    ['auto','Auto-detect'],['en','English'],['es','Spanish'],['fr','French'],['de','German'],['it','Italian'],
    ['pt','Portuguese'],['nl','Dutch'],['pl','Polish'],['tr','Turkish'],['ru','Russian'],['uk','Ukrainian'],
    ['ar','Arabic'],['hi','Hindi'],['id','Indonesian'],['ja','Japanese'],['ko','Korean'],['zh','Chinese'],
    ['vi','Vietnamese'],['th','Thai'],['tl','Filipino'],['sv','Swedish'],['da','Danish'],['no','Norwegian'],
    ['fi','Finnish'],['cs','Czech'],['ro','Romanian'],['hu','Hungarian'],['el','Greek'],['he','Hebrew']
  ];

  const Studio = {
    state: {
      phase: 'upload', file: null, audioUrl: '', fileName: '', transcript: '', chunks: [],
      language: 'auto', translate: false, subtitles: true, speakerId: false,
      summaryMode: 'off', model: 'balanced', pipeline: null, pipelineModel: '', pipelineDevice: '', pipelineDtype: '',
      busy: false, cancelRequested: false, audioDuration: 0, sourceType: '', lastSummary: '', selectedChunkIndex: 0,
      initialized: false, uploadInputBound: false
    },

    init() {
      if (this.state.initialized) return;
      this.state.initialized = true;
      document.addEventListener('click', (e) => {
        const item = e.target.closest('[data-tool="transcript"]');
        if (item && typeof FeaturePanel !== 'undefined') FeaturePanel.show('transcript', '🎙️ Transcript Studio');
      });
    },

    render(container) {
      if (!container) return;
      this.revokeUrl();
      this.state.phase = 'upload';
      this.state.file = null;
      this.state.fileName = '';
      this.state.transcript = '';
      this.state.chunks = [];
      this.state.sourceType = '';
      container.innerHTML = this.uploadView();
      this.bindUpload(container);
    },

    uploadView() {
      return `
      <div class="ts-pro">
        <div class="ts-upload-shell">
          <div class="ts-brand-mark"><i class="fas fa-waveform-lines"></i></div>
          <div class="ts-pro-title">OPUS to Text Converter <span>Powered by AI</span></div>
          <p class="ts-pro-subtitle">Turn long audio into searchable text with browser-based Whisper AI. Choose a file, configure transcription, and review the result before exporting.</p>

          <div class="ts-source-tabs" role="tablist">
            <button class="ts-source-tab active" data-source-tab="file"><i class="far fa-file-audio"></i> File upload</button>
            <button class="ts-source-tab" data-source-tab="link"><i class="fas fa-link"></i> Paste link</button>
          </div>

          <div class="ts-source-panel active" data-source-panel="file">
            <input id="tsFileInput" type="file" hidden accept=".opus,.ogg,.oga,.webm,.mp3,.wav,.m4a,.mp4,.aac,.flac,.txt,.srt,.vtt,.csv,audio/*,video/*" />
            <div class="ts-dropzone" id="tsDropzone" tabindex="0" role="button" aria-label="Upload audio or transcript">
              <div class="ts-drop-icons"><span><i class="fas fa-microphone"></i></span><strong><i class="fas fa-waveform-lines"></i></strong><span><i class="fas fa-video"></i></span></div>
              <h3>Click or drag &amp; drop to upload your file</h3>
              <p>OPUS, OGG, WAV, MP3, M4A, MP4, WebM, FLAC, TXT, SRT, VTT and CSV</p>
              <button class="ts-primary-btn" id="tsChooseFile"><i class="fas fa-upload"></i> Upload a file</button>
              <small>Files are processed locally in your browser. Your audio is not uploaded to ScriptFlow.</small>
            </div>
          </div>

          <div class="ts-source-panel" data-source-panel="link">
            <div class="ts-link-box">
              <i class="fas fa-link"></i>
              <input id="tsUrlInput" type="url" placeholder="Paste a direct audio/video URL" autocomplete="off" />
              <button class="ts-primary-btn" id="tsLoadUrl"><i class="fas fa-arrow-right"></i> Load</button>
            </div>
            <p class="ts-link-help">The remote server must allow browser access (CORS). For private files, upload the file directly instead.</p>
          </div>

          <div class="ts-capability-row">
            <span><i class="fas fa-language"></i> 20+ languages</span>
            <span><i class="fas fa-lock"></i> Local processing</span>
            <span><i class="fas fa-file-export"></i> SRT / VTT / TXT / CSV</span>
          </div>
          <div class="ts-error" id="tsUploadError" hidden></div>
        </div>
      </div>`;
    },

    bindUpload(container) {
      const input = container.querySelector('#tsFileInput');
      const zone = container.querySelector('#tsDropzone');
      const choose = container.querySelector('#tsChooseFile');
      choose.onclick = (e) => { e.stopPropagation(); input.click(); };
      zone.onclick = (e) => { if (e.target.closest('button')) return; input.click(); };
      zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') input.click(); });
      input.onchange = () => this.handleSource(input.files[0], container);
      ['dragenter','dragover'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('dragover'); }));
      ['dragleave','drop'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('dragover'); }));
      zone.addEventListener('drop', e => { const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) this.handleSource(f, container); });

      container.querySelectorAll('[data-source-tab]').forEach(tab => tab.onclick = () => {
        container.querySelectorAll('[data-source-tab]').forEach(x => x.classList.toggle('active', x === tab));
        container.querySelectorAll('[data-source-panel]').forEach(p => p.classList.toggle('active', p.dataset.sourcePanel === tab.dataset.sourceTab));
      });
      container.querySelector('#tsLoadUrl').onclick = () => this.loadUrl(container);
      container.querySelector('#tsUrlInput').addEventListener('keydown', e => { if (e.key === 'Enter') this.loadUrl(container); });
    },

    async loadUrl(container) {
      const url = container.querySelector('#tsUrlInput').value.trim();
      if (!/^https?:\/\//i.test(url)) return this.uploadError(container, 'Enter a valid http(s) audio or video URL.');
      this.uploadError(container, '');
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const blob = await res.blob();
        const ext = this.extFromUrl(url) || this.extFromMime(blob.type);
        const file = new File([blob], `remote-audio${ext || '.audio'}`, { type: blob.type || 'application/octet-stream' });
        this.handleSource(file, container);
      } catch (err) {
        this.uploadError(container, 'This link cannot be loaded in the browser. The server may block CORS. Download the file and upload it directly instead.');
      }
    },

    handleSource(file, container) {
      if (!file) return;
      const name = file.name || 'audio';
      const isText = /\.(txt|srt|vtt|csv)$/i.test(name) || /^text\//i.test(file.type);
      const isAudio = file.type.startsWith('audio/') || /\.(opus|ogg|oga|webm|mp3|wav|m4a|aac|flac)$/i.test(name);
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(name);
      if (!isText && !isAudio && !isVideo) return this.uploadError(container, 'Unsupported file type. Please upload an audio/video file or a transcript file.');
      this.state.file = file;
      this.state.fileName = name;
      this.state.sourceType = isText ? 'text' : 'audio';
      if (isText) {
        const reader = new FileReader();
        reader.onload = () => {
          this.state.transcript = this.cleanTranscript(String(reader.result || ''));
          this.state.chunks = this.state.transcript ? [{ start: 0, end: 0, text: this.state.transcript }] : [];
          this.state.phase = 'result';
          this.renderCurrent(container);
        };
        reader.readAsText(file);
      } else {
        this.state.audioUrl = URL.createObjectURL(file);
        this.state.phase = 'configure';
        this.renderCurrent(container);
      }
    },

    renderCurrent(container) {
      if (this.state.phase === 'configure') {
        container.innerHTML = this.configureView();
        this.bindConfigure(container);
      } else if (this.state.phase === 'result') {
        container.innerHTML = this.resultView();
        this.bindResult(container);
      }
    },

    configureView() {
      const f = this.state.file;
      return `
      <div class="ts-pro ts-config-page">
        <div class="ts-config-card">
          <div class="ts-source-tabs"><button class="ts-source-tab active"><i class="far fa-file-audio"></i> File upload</button><button class="ts-source-tab" disabled><i class="fas fa-link"></i> Paste link</button></div>
          <div class="ts-file-card">
            <div class="ts-file-icon"><i class="fas fa-file-audio"></i></div>
            <div class="ts-file-info"><strong>${this.esc(this.state.fileName)}</strong><span><i class="far fa-clock"></i> Calculating duration</span><small>${this.formatBytes(f ? f.size : 0)}</small></div>
            <button class="ts-icon-btn" id="tsRemoveFile" aria-label="Remove file"><i class="fas fa-trash"></i></button>
          </div>
          <div class="ts-rule"></div>
          <div class="ts-option-row"><div><b><i class="fas fa-microphone-lines"></i> Audio language</b><small>Choose the language spoken in your audio. Auto-detect is recommended when unsure.</small></div><select id="tsLanguage">${LANGUAGES.map(([v,l]) => `<option value="${v}" ${this.state.language===v?'selected':''}>${l}</option>`).join('')}</select></div>
          <div class="ts-option-row"><div><b><i class="fas fa-language"></i> Translation</b><small>Translate the transcript to English after transcription.</small></div><label class="ts-switch"><input id="tsTranslate" type="checkbox" ${this.state.translate?'checked':''}><span></span></label></div>
          <div class="ts-option-row"><div><b><i class="fas fa-closed-captioning"></i> Generate subtitles</b><small>Create timestamped SRT and VTT files from detected speech segments.</small></div><label class="ts-switch"><input id="tsSubtitles" type="checkbox" ${this.state.subtitles?'checked':''}><span></span></label></div>
          <div class="ts-option-row"><div><b><i class="fas fa-users"></i> Speaker labels</b><small>Prepare the transcript for editable Speaker 1 / Speaker 2 labels. Automatic diarization is not claimed as exact.</small></div><label class="ts-switch"><input id="tsSpeaker" type="checkbox" ${this.state.speakerId?'checked':''}><span></span></label></div>
          <div class="ts-option-row"><div><b><i class="fas fa-wand-magic-sparkles"></i> AI summary</b><small>Generate a local extractive summary, key points, questions and action items.</small></div><select id="tsSummaryMode"><option value="off">Off</option><option value="concise" ${this.state.summaryMode==='concise'?'selected':''}>Concise</option><option value="detailed" ${this.state.summaryMode==='detailed'?'selected':''}>Detailed</option></select></div>
          <div class="ts-option-row"><div><b><i class="fas fa-microchip"></i> Transcription model</b><small>Balanced is the recommended accuracy/speed choice. Models download once and are cached by the browser.</small></div><select id="tsModel"><option value="fast" ${this.state.model==='fast'?'selected':''}>Fast · Whisper Tiny</option><option value="balanced" ${this.state.model==='balanced'?'selected':''}>Balanced · Whisper Small</option><option value="accurate" ${this.state.model==='accurate'?'selected':''}>Higher accuracy · Whisper Base</option></select></div>
          <div class="ts-engine-note"><i class="fas fa-shield-halved"></i><div><strong>Private browser processing</strong><span>Audio is decoded and transcribed in your browser. The first run may take longer while the selected AI model downloads and is cached.</span></div></div>
          <button class="ts-transcribe-btn" id="tsTranscribe"><span class="ts-btn-content"><i class="fas fa-wand-magic-sparkles"></i> Transcribe for Free</span><span class="ts-btn-progress" aria-hidden="true"><span class="ts-progress-fill"></span></span><span class="ts-btn-percent">0%</span></button>
          <div class="ts-transcribe-status" id="tsTranscribeStatus">Ready when you are.</div>
          <div class="ts-error" id="tsConfigError" hidden></div>
        </div>
      </div>`;
    },

    bindConfigure(container) {
      const audio = new Audio(); audio.preload = 'metadata'; audio.src = this.state.audioUrl;
      audio.onloadedmetadata = () => {
        this.state.audioDuration = audio.duration || 0;
        const meta = container.querySelector('.ts-file-info span');
        if (meta) meta.innerHTML = `<i class="far fa-clock"></i> ${this.formatDuration(audio.duration)}`;
      };
      container.querySelector('#tsRemoveFile').onclick = () => {
        this.revokeUrl(); this.state.file = null; this.state.phase = 'upload'; this.renderCurrent(container);
      };
      container.querySelector('#tsLanguage').onchange = e => { this.state.language = e.target.value; };
      container.querySelector('#tsTranslate').onchange = e => { this.state.translate = e.target.checked; };
      container.querySelector('#tsSubtitles').onchange = e => { this.state.subtitles = e.target.checked; };
      container.querySelector('#tsSpeaker').onchange = e => { this.state.speakerId = e.target.checked; };
      container.querySelector('#tsSummaryMode').onchange = e => { this.state.summaryMode = e.target.value; };
      container.querySelector('#tsModel').onchange = e => { this.state.model = e.target.value; };
      container.querySelector('#tsTranscribe').onclick = () => this.transcribe(container);
    },

    async transcribe(container) {
      if (this.state.busy || !this.state.file || !this.state.audioUrl) return;
      this.state.busy = true; this.state.cancelRequested = false;
      const btn = container.querySelector('#tsTranscribe');
      const status = container.querySelector('#tsTranscribeStatus');
      const error = container.querySelector('#tsConfigError');
      const content = btn.querySelector('.ts-btn-content');
      const percent = btn.querySelector('.ts-btn-percent');
      const fill = btn.querySelector('.ts-progress-fill');
      btn.disabled = true; btn.classList.add('loading');
      content.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing AI model…';
      const setProgress = (p, text) => {
        const n = Math.max(0, Math.min(100, Math.round(p)));
        fill.style.width = `${n}%`; percent.textContent = `${n}%`; status.textContent = text || 'Processing…';
      };
      try {
        setProgress(3, 'Preparing your audio…');
        await this.ensurePipeline(setProgress);
        if (this.state.cancelRequested) throw new Error('Transcription cancelled.');
        setProgress(20, 'Loading audio…');
        const language = this.state.language;
        const generate = {};
        if (language !== 'auto') generate.language = language;
        generate.task = this.state.translate ? 'translate' : 'transcribe';
        let current = 22;
        const ticker = setInterval(() => {
          current = Math.min(96, current + (current < 70 ? 2 : 0.5));
          setProgress(current, current < 70 ? 'Transcribing audio…' : 'Refining transcript…');
        }, 650);
        const output = await this.state.pipeline(this.state.audioUrl, {
          return_timestamps: true,
          chunk_length_s: 30,
          stride_length_s: 5,
          generate_kwargs: generate
        });
        clearInterval(ticker);
        if (this.state.cancelRequested) throw new Error('Transcription cancelled.');
        setProgress(98, 'Building transcript and timestamps…');
        this.state.transcript = String(output && output.text || '').trim();
        this.state.chunks = (output && Array.isArray(output.chunks) ? output.chunks : []).map(x => ({
          start: Array.isArray(x.timestamp) ? Number(x.timestamp[0] || 0) : 0,
          end: Array.isArray(x.timestamp) ? Number(x.timestamp[1] || 0) : 0,
          text: String(x.text || '').trim()
        })).filter(x => x.text);
        if (!this.state.transcript && this.state.chunks.length) this.state.transcript = this.state.chunks.map(x => x.text).join(' ');
        if (!this.state.transcript) throw new Error('No speech was detected. Try a clearer recording or a different model.');
        setProgress(100, 'Transcription complete.');
        this.state.phase = 'result';
        setTimeout(() => this.renderCurrent(container), 350);
      } catch (err) {
        console.error('Transcript Studio transcription error:', err);
        const errorBox = container.querySelector('#tsError');
        if (errorBox) { errorBox.hidden = false; errorBox.textContent = this.friendlyError(err); }
        content.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Transcribe for Free';
        btn.disabled = false; btn.classList.remove('loading');
        setProgress(0, 'Ready to retry.');
      } finally { this.state.busy = false; }
    },

    async ensurePipeline(setProgress) {
      const model = MODELS[this.state.model] || MODELS.balanced;
      const preferredDevice = navigator.gpu ? 'webgpu' : 'wasm';
      const preferredDtype = preferredDevice === 'webgpu' ? 'fp16' : 'q8';

      // Reuse only when the model, device, and precision all match. This avoids
      // accidentally reusing a CPU/q8 pipeline after switching to WebGPU/fp16.
      if (
        this.state.pipeline &&
        this.state.pipelineModel === model &&
        this.state.pipelineDevice === preferredDevice &&
        this.state.pipelineDtype === preferredDtype
      ) {
        setProgress(18, 'AI model ready from cache.');
        return;
      }

      const mod = await import(HF_MODULE);
      if (!mod || typeof mod.pipeline !== 'function') {
        throw new Error('The transcription engine could not be loaded. Check your internet connection and try again.');
      }

      // Transformers.js emits a content-length warning when a CDN response does
      // not expose that header. The download still works; our own progress UI
      // handles the user-facing progress, so keep library logs to real errors.
      try {
        if (mod.env) {
          if ('useBrowserCache' in mod.env) mod.env.useBrowserCache = true;
          if ('useWasmCache' in mod.env) mod.env.useWasmCache = true;
          if ('logLevel' in mod.env && mod.LogLevel && mod.LogLevel.ERROR !== undefined) {
            mod.env.logLevel = mod.LogLevel.ERROR;
          }
        }
      } catch (_) { /* logging/cache controls are optional */ }

      const progressCallback = info => {
        if (info && typeof info.progress === 'number') {
          const p = 7 + Math.min(12, info.progress * 0.12);
          setProgress(p, `Downloading AI model… ${Math.round(info.progress)}%`);
        }
      };

      const tryModel = async (modelId, device, dtype) => {
        const options = {
          device,
          dtype,
          progress_callback: progressCallback
        };
        return mod.pipeline('automatic-speech-recognition', modelId, options);
      };

      setProgress(
        6,
        `Loading ${this.modelLabel()} model (${preferredDevice === 'webgpu' ? 'GPU · FP16' : 'CPU · Q8'} mode)…`
      );

      try {
        this.state.pipeline = await tryModel(model, preferredDevice, preferredDtype);
        this.state.pipelineModel = model;
        this.state.pipelineDevice = preferredDevice;
        this.state.pipelineDtype = preferredDtype;
      } catch (firstErr) {
        if (preferredDevice === 'webgpu') {
          setProgress(9, 'GPU setup was unavailable. Switching to browser CPU mode…');
          try {
            this.state.pipeline = await tryModel(model, 'wasm', 'q8');
            this.state.pipelineModel = model;
            this.state.pipelineDevice = 'wasm';
            this.state.pipelineDtype = 'q8';
            return;
          } catch (_) { /* continue to lightweight fallback */ }
        }

        if (model !== MODELS.fast) {
          setProgress(10, 'Switching to the lightweight Whisper model…');
          this.state.pipeline = await tryModel(MODELS.fast, 'wasm', 'q8');
          this.state.pipelineModel = MODELS.fast;
          this.state.pipelineDevice = 'wasm';
          this.state.pipelineDtype = 'q8';
        } else {
          throw firstErr;
        }
      }
    },

    resultView() {
      const title = this.baseName(this.state.fileName || 'Transcript');
      const summary = this.state.summaryMode === 'off' ? this.makeSummary(this.state.transcript, 'concise') : this.makeSummary(this.state.transcript, this.state.summaryMode);
      this.state.lastSummary = summary.overview;
      const duration = this.state.audioDuration || (this.state.chunks.length ? this.state.chunks[this.state.chunks.length - 1].end : 0);
      return `
      <div class="ts-pro ts-result-page">
        <div class="ts-result-topbar"><button class="ts-back-btn" id="tsBack"><i class="fas fa-chevron-left"></i></button><div class="ts-result-title"><strong>${this.esc(title)}</strong><span>${this.state.sourceType === 'audio' ? this.formatDuration(duration) : 'Transcript file'}</span></div><div class="ts-result-actions"><button class="ts-icon-btn" id="tsShare" title="Share"><i class="fas fa-share-nodes"></i></button><button class="ts-icon-btn" id="tsMore" title="More"><i class="fas fa-ellipsis"></i></button><button class="ts-export-main" id="tsExportMenu"><i class="fas fa-download"></i> Export</button></div></div>
        <div class="ts-result-layout">
          <section class="ts-transcript-pane">
            <div class="ts-transcript-toolbar"><div class="ts-transcript-label"><strong>Transcript</strong><span>${this.formatDuration(duration)}</span></div><label class="ts-search"><i class="fas fa-search"></i><input id="tsSearch" placeholder="Search transcript" /></label><button class="ts-icon-btn" id="tsCopy" title="Copy"><i class="far fa-copy"></i></button><button class="ts-icon-btn" id="tsTranslateQuick" title="Translate to English"><i class="fas fa-language"></i></button></div>
            ${this.state.speakerId ? '<div class="ts-speaker-notice"><i class="fas fa-users"></i><span>Speaker labels are editable. Automatic diarization is not guaranteed to identify speakers correctly.</span><button id="tsAddSpeaker">Add label</button></div>' : ''}
            <div class="ts-transcript-scroll" id="tsTranscriptScroll">${this.renderChunks()}</div>
            ${this.audioControls(duration)}
          </section>
          <aside class="ts-analysis-pane">
            <div class="ts-analysis-tabs"><button class="active" data-analysis="summary">Summary</button><button data-analysis="mindmap">Mind Map</button><button data-analysis="insights">Insights</button></div>
            <div id="tsAnalysisBody">${this.summaryPanel(summary)}</div>
          </aside>
        </div>
        <div class="ts-export-drawer" id="tsExportDrawer" hidden><div><strong>Export transcript</strong><button id="tsCloseExport" class="ts-icon-btn"><i class="fas fa-xmark"></i></button></div><div class="ts-export-grid"><button data-export="txt">TXT</button><button data-export="srt">SRT</button><button data-export="vtt">VTT</button><button data-export="csv">CSV</button><button data-export="doc">Word</button><button data-export="pdf">PDF / Print</button></div></div>
        <audio id="tsAudio" preload="metadata" src="${this.esc(this.state.audioUrl)}"></audio>
      </div>`;
    },

    renderChunks() {
      if (!this.state.chunks.length) return `<div class="ts-text-only">${this.esc(this.state.transcript).replace(/\n/g,'<br>')}</div>`;
      return this.state.chunks.map((c, i) => `<button class="ts-chunk" data-index="${i}" data-start="${c.start}"><time>${this.formatClock(c.start)}</time><span>${this.esc(c.text)}</span></button>`).join('');
    },

    audioControls(duration) {
      if (this.state.sourceType !== 'audio') return '<div class="ts-no-audio"><i class="fas fa-file-lines"></i> Imported transcript — audio controls are unavailable.</div>';
      return `<div class="ts-player"><button id="tsPlay" class="ts-play"><i class="fas fa-play"></i></button><button id="tsRewind" class="ts-player-small">↶ 10</button><div class="ts-player-time"><span id="tsCurrentTime">00:00</span><input id="tsSeek" type="range" min="0" max="${Math.max(1, duration || 1)}" step="0.1" value="0"><span id="tsDuration">${this.formatDuration(duration)}</span></div><button id="tsVolume" class="ts-player-small"><i class="fas fa-volume-high"></i></button><select id="tsSpeed" class="ts-speed"><option>1.0x</option><option>1.25x</option><option>1.5x</option><option>2.0x</option></select></div>`;
    },

    bindResult(container) {
      const audio = container.querySelector('#tsAudio');
      const play = container.querySelector('#tsPlay');
      if (audio) {
        audio.onloadedmetadata = () => { this.state.audioDuration = audio.duration || this.state.audioDuration; const seek=container.querySelector('#tsSeek'); if(seek) seek.max=audio.duration||1; };
        audio.ontimeupdate = () => { const seek=container.querySelector('#tsSeek'); const t=container.querySelector('#tsCurrentTime'); if(seek) seek.value=audio.currentTime; if(t)t.textContent=this.formatClock(audio.currentTime); this.highlightChunk(container,audio.currentTime); };
        audio.onended = () => { if(play) play.innerHTML='<i class="fas fa-play"></i>'; };
      }
      if(play) play.onclick=()=>{if(audio.paused){audio.play();play.innerHTML='<i class="fas fa-pause"></i>';}else{audio.pause();play.innerHTML='<i class="fas fa-play"></i>';}};
      const seek=container.querySelector('#tsSeek'); if(seek) seek.oninput=()=>{audio.currentTime=Number(seek.value);};
      const rewind=container.querySelector('#tsRewind'); if(rewind) rewind.onclick=()=>{audio.currentTime=Math.max(0,audio.currentTime-10);};
      const speed=container.querySelector('#tsSpeed'); if(speed) speed.onchange=()=>{audio.playbackRate=Number(speed.value.replace('x',''));};
      const vol=container.querySelector('#tsVolume'); if(vol) vol.onclick=()=>{audio.muted=!audio.muted;vol.innerHTML=`<i class="fas ${audio.muted?'fa-volume-xmark':'fa-volume-high'}"></i>`;};
      container.querySelectorAll('.ts-chunk').forEach(el=>el.onclick=()=>{this.state.selectedChunkIndex=Number(el.dataset.index||0);audio.currentTime=Number(el.dataset.start||0);audio.play();if(play)play.innerHTML='<i class="fas fa-pause"></i>';});
      const search=container.querySelector('#tsSearch'); if(search) search.oninput=()=>this.filterChunks(container,search.value);
      container.querySelector('#tsCopy').onclick=()=>this.copyText(this.state.transcript);
      container.querySelector('#tsBack').onclick=()=>{this.revokeUrl();this.state.phase='upload';this.renderCurrent(container);};
      container.querySelector('#tsShare').onclick=()=>this.shareTranscript();
      container.querySelector('#tsTranslateQuick').onclick=()=>this.quickTranslate(container);
      const add=container.querySelector('#tsAddSpeaker'); if(add)add.onclick=()=>this.addSpeakerLabel(container);
      container.querySelectorAll('[data-analysis]').forEach(tab=>tab.onclick=()=>this.renderAnalysisTab(container,tab.dataset.analysis));
      const exportMenu=container.querySelector('#tsExportMenu'); if(exportMenu)exportMenu.onclick=()=>{container.querySelector('#tsExportDrawer').hidden=false;};
      const closeExport=container.querySelector('#tsCloseExport'); if(closeExport)closeExport.onclick=()=>{container.querySelector('#tsExportDrawer').hidden=true;};
      container.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>this.export(this.state.transcript,b.dataset.export));
      container.querySelector('#tsMore').onclick=()=>this.moreMenu(container);
      const regen=container.querySelector('#tsRegenerate'); if(regen) regen.onclick=()=>this.renderAnalysisTab(container,'summary');
      const mapExport=container.querySelector('#tsExportMap'); if(mapExport) mapExport.onclick=()=>this.exportMindMap();
    },

    renderAnalysisTab(container, tab) {
      container.querySelectorAll('[data-analysis]').forEach(t=>t.classList.toggle('active',t.dataset.analysis===tab));
      const body=container.querySelector('#tsAnalysisBody');
      if(tab==='summary') body.innerHTML=this.summaryPanel(this.makeSummary(this.state.transcript,this.state.summaryMode==='detailed'?'detailed':'concise'));
      if(tab==='mindmap') body.innerHTML=this.mindmapPanel(this.state.transcript);
      if(tab==='insights') body.innerHTML=this.insightsPanel(this.state.transcript);
    },

    summaryPanel(s) {
      return `<div class="ts-analysis-card"><div class="ts-analysis-heading"><i class="fas fa-sparkles"></i><strong>Summary</strong><button id="tsRegenerate" class="ts-mini-btn">Regenerate</button></div><div class="ts-skeleton-content"><h4>Overview</h4><p>${this.esc(s.overview)}</p><h4>Key Points</h4>${this.listHtml(s.points)}<h4>Takeaways</h4>${this.listHtml(s.takeaways)}</div></div>`;
    },
    mindmapPanel(text) {
      const topics=this.topTopics(text,7); return `<div class="ts-analysis-card"><div class="ts-analysis-heading"><i class="fas fa-project-diagram"></i><strong>Mind Map</strong><button class="ts-mini-btn" id="tsExportMap">Export</button></div><div class="ts-mindmap-pro"><div class="ts-map-root">Conversation</div><div class="ts-map-grid">${topics.map(t=>`<div class="ts-map-node"><i class="fas fa-arrow-right"></i>${this.esc(t)}</div>`).join('') || '<div class="ts-muted">No strong topics detected.</div>'}</div></div></div>`;
    },
    insightsPanel(text) {
      const s=this.makeInsights(text); return `<div class="ts-analysis-card"><div class="ts-analysis-heading"><i class="fas fa-lightbulb"></i><strong>Key Insights</strong></div><div class="ts-insight-block"><h4>Questions</h4>${this.listHtml(s.questions)}</div><div class="ts-insight-block"><h4>Action Items</h4>${this.listHtml(s.actions)}</div><div class="ts-insight-block"><h4>Potential Objections</h4>${this.listHtml(s.objections)}</div></div>`;
    },

    makeSummary(text,mode) {
      const sentences=this.sentences(text); if(!sentences.length)return{overview:'No transcript available.',points:[],takeaways:[]};
      const limit=mode==='detailed'?8:4; const points=sentences.slice(0,Math.min(limit,sentences.length));
      const take=this.makeInsights(text).actions.slice(0,3);
      return {overview:sentences.slice(0,mode==='detailed'?3:2).join(' '),points,takeaways:take.length?take:['Review the conversation and confirm the next step.']};
    },
    makeInsights(text){
      const s=this.sentences(text); return {
        questions:s.filter(x=>x.includes('?')).slice(0,6),
        actions:s.filter(x=>/\b(need|should|will|send|call|schedule|follow.?up|next step|confirm|email|book|review)\b/i.test(x)).slice(0,6),
        objections:s.filter(x=>/\b(but|however|concern|expensive|price|cost|not sure|already have|think about|permission|consent|too busy|maybe later|no budget)\b/i.test(x)).slice(0,6)
      };
    },
    topTopics(text,count){
      const stop=new Set('about after again against among also because before being between could does doing during each from further have having here how into just like more most other over really should some than that their there these they this those through under very what when where which while with would your you about website business customer customers meeting demo service services call calls'.split(' '));
      const words=(text.toLowerCase().match(/[a-z][a-z'-]{4,}/g)||[]).filter(w=>!stop.has(w));const freq={};words.forEach(w=>freq[w]=(freq[w]||0)+1);return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,count).map(x=>x[0]);
    },
    listHtml(a){return a&&a.length?`<ul>${a.map(x=>`<li>${this.esc(x)}</li>`).join('')}</ul>`:'<p class="ts-muted">None detected.</p>';},
    sentences(t){return String(t||'').replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x.length>8);},

    filterChunks(container,q){const query=q.trim().toLowerCase();container.querySelectorAll('.ts-chunk').forEach(el=>{el.hidden=!!query&&!el.textContent.toLowerCase().includes(query);});},
    highlightChunk(container,time){let best=-1;this.state.chunks.forEach((c,i)=>{if(time>=c.start&&(c.end===0||time<=c.end))best=i;});container.querySelectorAll('.ts-chunk').forEach((el,i)=>el.classList.toggle('playing',i===best));},
    addSpeakerLabel(container){
      const idx=Math.max(0,Math.min(this.state.selectedChunkIndex,this.state.chunks.length-1));
      const chunk=this.state.chunks[idx];
      if(!chunk)return;
      const label=window.prompt('Speaker label for this segment:', 'Speaker 1');
      if(!label)return;
      chunk.text=`${label.trim()}: ${chunk.text.replace(/^[^:]{1,40}:\s*/,'')}`;
      this.state.transcript=this.state.chunks.map(x=>x.text).join(' ');
      const scroll=container.querySelector('#tsTranscriptScroll');
      if(scroll)scroll.innerHTML=this.renderChunks();
      this.bindResult(container);
    },
    async quickTranslate(container){
      if(!this.state.transcript)return;
      if(this.state.sourceType!=='audio' || !this.state.audioUrl){if(typeof showToast==='function')showToast('Translation requires the original audio file.','info');return;}
      const button=container.querySelector('#tsTranslateQuick');button.disabled=true;button.classList.add('loading');button.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
      try{
        await this.ensurePipeline(()=>{});
        const language=this.state.language==='auto'?undefined:this.state.language;
        const output=await this.state.pipeline(this.state.audioUrl,{return_timestamps:true,chunk_length_s:30,stride_length_s:5,generate_kwargs:{...(language?{language}:{ }),task:'translate'}});
        this.state.transcript=String(output&&output.text||'').trim();
        this.state.chunks=(output&&Array.isArray(output.chunks)?output.chunks:[]).map(x=>({start:Array.isArray(x.timestamp)?Number(x.timestamp[0]||0):0,end:Array.isArray(x.timestamp)?Number(x.timestamp[1]||0):0,text:String(x.text||'').trim()})).filter(x=>x.text);
        this.state.translate=true;
        container.innerHTML=this.resultView();
        this.bindResult(container);
        if(typeof showToast==='function')showToast('English translation generated.','success');
      }catch(err){if(typeof showToast==='function')showToast(this.friendlyError(err),'error');}finally{button.disabled=false;button.classList.remove('loading');}
    },
    exportMindMap(){
      const topics=this.topTopics(this.state.transcript,8);
      const data=['ScriptFlow Pro Mind Map','',`Conversation -> ${topics.join(' | ')}`].join('\n');
      const blob=new Blob([data],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${this.slug(this.baseName(this.state.fileName))||'transcript'}-mind-map.txt`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    },
    async shareTranscript(){
      const text=this.state.transcript; if(navigator.share){try{await navigator.share({title:this.baseName(this.state.fileName),text});return;}catch(_){} }
      await this.copyText(text); if(typeof showToast==='function')showToast('Transcript copied to clipboard.','success');
    },
    moreMenu(container){
      const drawer=container.querySelector('#tsExportDrawer'); if(drawer){drawer.hidden=false;}
    },

    export(text,type){
      if(!String(text||'').trim()){if(typeof showToast==='function')showToast('No transcript to export.','info');return;}
      let data='',ext=type,mime='text/plain;charset=utf-8';
      if(type==='txt'){data=text;}
      if(type==='csv'){data='"Start","End","Text"\n'+this.state.chunks.map(c=>`"${this.formatClock(c.start)}","${this.formatClock(c.end)}","${String(c.text).replace(/"/g,'""')}"`).join('\n');mime='text/csv;charset=utf-8';}
      if(type==='srt'){data=this.toSrt();mime='application/x-subrip;charset=utf-8';}
      if(type==='vtt'){data='WEBVTT\n\n'+this.state.chunks.map(c=>`${this.vttTime(c.start)} --> ${this.vttTime(c.end||c.start+3)}\n${c.text}`).join('\n\n');mime='text/vtt;charset=utf-8';}
      if(type==='doc'){data=`<!doctype html><html><body><h1>${this.esc(this.baseName(this.state.fileName))}</h1><p>${this.esc(this.lastSummary||'')}</p><pre>${this.esc(text)}</pre></body></html>`;mime='application/msword';}
      if(type==='pdf'){this.print(text,this.lastSummary);return;}
      const blob=new Blob([data],{type:mime});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${this.slug(this.baseName(this.state.fileName)) || 'scriptflow-transcript'}.${ext}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    },
    toSrt(){return this.state.chunks.map((c,i)=>`${i+1}\n${this.srtTime(c.start)} --> ${this.srtTime(c.end||c.start+3)}\n${c.text}`).join('\n\n');},
    print(text,summary){const w=window.open('','_blank','width=960,height=720');if(!w){if(typeof showToast==='function')showToast('Please allow pop-ups to export PDF/print.','info');return;}w.document.write(`<html><head><title>ScriptFlow Transcript</title><style>body{font-family:Arial,sans-serif;padding:36px;line-height:1.55;color:#111}h1{margin:0 0 6px}section{margin:22px 0;padding:16px;background:#f4f4f5;border-radius:10px}pre{white-space:pre-wrap;font:14px/1.6 Arial}</style></head><body><h1>${this.esc(this.baseName(this.state.fileName))}</h1><section><b>Summary</b><p>${this.esc(summary||'')}</p></section><h2>Transcript</h2><pre>${this.esc(text)}</pre><script>window.onload=function(){window.print()}<\/script></body></html>`);w.document.close();},

    cleanTranscript(t){return String(t||'').replace(/^WEBVTT.*$/gim,'').replace(/^\d+\s*$/gm,'').replace(/\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*.*$/gm,'').replace(/\r/g,'').replace(/^\s*$/gm,'').trim();},
    uploadError(c,msg){const e=c&&c.querySelector('#tsUploadError');if(!e)return;e.hidden=!msg;e.textContent=msg||'';},
    friendlyError(e){const m=String(e&&e.message||e||'Unknown error');if(/decode|audio|unsupported|AudioContext/i.test(m))return 'Your browser could not decode this audio format. Try OGG/Opus, WAV, MP3, M4A, or convert the file to WAV and retry.';if(/memory|out of memory/i.test(m))return 'This recording is too large for the current browser memory. Try the Fast model or split the recording into shorter files.';if(/network|fetch|load|cdn|model/i.test(m))return 'The AI model could not be loaded. Check your internet connection and try again.';return m;},
    modelLabel(){return this.state.model==='fast'?'Whisper Tiny':this.state.model==='accurate'?'Whisper Base':'Whisper Small';},
    formatBytes(n){if(!n)return '0 B';const u=['B','KB','MB','GB'];const i=Math.min(Math.floor(Math.log(n)/Math.log(1024)),u.length-1);return `${(n/Math.pow(1024,i)).toFixed(i?1:0)} ${u[i]}`;},
    formatDuration(sec){if(!isFinite(sec)||sec<0)return '00:00';const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60);return h?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;},
    formatClock(sec){return this.formatDuration(sec);},
    srtTime(sec){const s=Math.max(0,Number(sec)||0);const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),x=Math.floor(s%60),ms=Math.floor((s-Math.floor(s))*1000);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')},${String(ms).padStart(3,'0')}`;},
    vttTime(sec){return this.srtTime(sec).replace(',', '.');},
    baseName(n){return String(n||'Transcript').replace(/\.[^.]+$/,'');}, slug(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');},
    extFromUrl(u){try{const p=new URL(u).pathname.match(/\.[a-z0-9]{2,5}$/i);return p?p[0]:'';}catch(_){return '';}},
    extFromMime(m){const map={'audio/ogg':'.ogg','audio/opus':'.opus','audio/wav':'.wav','audio/mpeg':'.mp3','audio/mp4':'.m4a','video/mp4':'.mp4','audio/webm':'.webm','video/webm':'.webm'};return map[m]||'';},
    async copyText(text){try{await navigator.clipboard.writeText(text);if(typeof showToast==='function')showToast('Copied to clipboard.','success');}catch(_){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}},
    revokeUrl(){if(this.state.audioUrl&&this.state.audioUrl.startsWith('blob:'))URL.revokeObjectURL(this.state.audioUrl);this.state.audioUrl='';},
    esc(s){const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML;}
  };

  window.TranscriptStudio = Studio;
  document.addEventListener('DOMContentLoaded', () => Studio.init());
})();
