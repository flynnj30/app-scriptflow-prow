/* ScriptFlow Pro - Transcript Studio
 * Client-side transcript workspace. Uses Web Speech API for live transcription
 * and accepts TXT/SRT/VTT/CSV transcript files. No existing CRM data is modified.
 */
(function () {
  'use strict';
  const Studio = {
    transcript: '', rawFileName: '', recognition: null, recording: false,
    init() { this.bindGlobal(); },
    bindGlobal() {
      document.addEventListener('click', e => {
        const item = e.target.closest('[data-tool="transcript"]');
        if (item) { FeaturePanel.show('transcript', '🎙️ Transcript Studio'); }
      });
    },
    render(container) {
      if (!container) return;
      container.innerHTML = `
      <div class="transcript-studio fade-in">
        <div class="ts-hero">
          <div><span class="ts-kicker">SMART TRANSCRIPTION</span><h3>Turn conversations into usable notes</h3><p>Import a transcript, or use your browser microphone for live speech-to-text. Then summarize, extract insights, build a mind map, and export.</p></div>
          <div class="ts-status" id="tsStatus"><i class="fas fa-circle"></i> Ready</div>
        </div>
        <div class="ts-toolbar">
          <label class="ts-upload"><i class="fas fa-upload"></i> Import Transcript <input id="tsFile" type="file" accept=".txt,.srt,.vtt,.csv,.opus,.webm,.mp4,.m4a,.wav,.mp3" hidden></label>
          <button class="btn-icon" id="tsStart"><i class="fas fa-microphone"></i> Start Live Transcription</button>
          <button class="btn-icon" id="tsStop" disabled><i class="fas fa-stop"></i> Stop</button>
          <button class="btn-icon" id="tsClear"><i class="fas fa-eraser"></i> Clear</button>
        </div>
        <div class="ts-grid">
          <section class="ts-card ts-main"><div class="ts-card-head"><h4><i class="fas fa-align-left"></i> Transcript</h4><span id="tsWordCount">0 words</span></div><textarea id="tsEditor" placeholder="Paste a transcript here or start live transcription..."></textarea></section>
          <section class="ts-card"><div class="ts-card-head"><h4><i class="fas fa-wand-magic-sparkles"></i> Summary</h4><button class="btn-icon" id="tsSummarize">Generate</button></div><div id="tsSummary" class="ts-output empty">Add a transcript to generate a concise summary.</div></section>
          <section class="ts-card"><div class="ts-card-head"><h4><i class="fas fa-project-diagram"></i> Mind Map</h4><button class="btn-icon" id="tsMindMap">Generate</button></div><div id="tsMindMapOutput" class="ts-mindmap empty">Key topics will appear here.</div></section>
        </div>
        <section class="ts-card ts-insights"><div class="ts-card-head"><h4><i class="fas fa-lightbulb"></i> Key Insights & Questions</h4><button class="btn-icon" id="tsInsights">Extract</button></div><div id="tsInsightOutput" class="ts-output empty">Extract objections, questions, decisions, and action items.</div></section>
        <section class="ts-card"><div class="ts-card-head"><h4><i class="fas fa-file-export"></i> Export & Share</h4></div><div class="ts-export"><button class="btn-icon" data-export="txt">TXT</button><button class="btn-icon" data-export="csv">CSV</button><button class="btn-icon" data-export="srt">SRT</button><button class="btn-icon" data-export="vtt">VTT</button><button class="btn-icon" data-export="doc">Word</button><button class="btn-icon" id="tsPrint"><i class="fas fa-print"></i> PDF / Print</button></div><small>Exports are generated locally in your browser; no transcript is uploaded by this feature.</small></section>
        <div class="ts-note"><i class="fas fa-circle-info"></i> For uploaded audio/video files, this module accepts the file and records its metadata, but browser speech recognition cannot reliably transcribe an existing OPUS file. Use Live Transcription or import its TXT/SRT/VTT transcript for accurate local processing.</div>
      </div>`;
      this.attach(container);
    },
    attach(c) {
      const editor = c.querySelector('#tsEditor');
      const file = c.querySelector('#tsFile');
      const update = () => { this.transcript = editor.value; c.querySelector('#tsWordCount').textContent = `${this.transcript.trim() ? this.transcript.trim().split(/\s+/).length : 0} words`; };
      editor.addEventListener('input', update);
      file.addEventListener('change', e => this.importFile(e.target.files[0], editor, c));
      c.querySelector('#tsStart').onclick = () => this.start(editor, c);
      c.querySelector('#tsStop').onclick = () => this.stop(c);
      c.querySelector('#tsClear').onclick = () => { this.stop(c); editor.value=''; update(); c.querySelector('#tsSummary').className='ts-output empty'; c.querySelector('#tsSummary').textContent='Add a transcript to generate a concise summary.'; c.querySelector('#tsMindMapOutput').className='ts-mindmap empty'; c.querySelector('#tsMindMapOutput').textContent='Key topics will appear here.'; c.querySelector('#tsInsightOutput').className='ts-output empty'; c.querySelector('#tsInsightOutput').textContent='Extract objections, questions, decisions, and action items.'; };
      c.querySelector('#tsSummarize').onclick = () => this.summarize(editor.value, c);
      c.querySelector('#tsMindMap').onclick = () => this.mindmap(editor.value, c);
      c.querySelector('#tsInsights').onclick = () => this.insights(editor.value, c);
      c.querySelectorAll('[data-export]').forEach(b => b.onclick = () => this.export(editor.value, b.dataset.export));
      c.querySelector('#tsPrint').onclick = () => this.print(editor.value, c.querySelector('#tsSummary').textContent);
    },
    importFile(f, editor, c) {
      if (!f) return; this.rawFileName = f.name;
      if (/\.(txt|srt|vtt|csv)$/i.test(f.name)) { const r=new FileReader(); r.onload=()=>{editor.value=this.cleanTranscript(r.result); editor.dispatchEvent(new Event('input')); this.status(c,`Imported ${f.name}`);}; r.readAsText(f); }
      else { this.status(c,`${f.name} loaded. Use Live Transcription or import a transcript file for text conversion.`); }
    },
    cleanTranscript(t) { return String(t||'').replace(/^WEBVTT.*$/gim,'').replace(/^\d+\s*$/gm,'').replace(/\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*.*$/gm,'').replace(/\r/g,'').replace(/^\s*$/gm,'').trim(); },
    start(editor,c) {
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){this.status(c,'Speech recognition is not supported in this browser.');return;}
      if(this.recording)return; const r=new SR(); r.continuous=true; r.interimResults=true; r.lang=navigator.language||'en-US'; let committed=editor.value.trim();
      r.onstart=()=>{this.recording=true;c.querySelector('#tsStart').disabled=true;c.querySelector('#tsStop').disabled=false;this.status(c,'Listening…');};
      r.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const x=e.results[i][0].transcript;if(e.results[i].isFinal) committed+=(committed?' ':'')+x.trim();else interim+=x;}editor.value=committed+(interim?' '+interim:'');editor.dispatchEvent(new Event('input'));};
      r.onerror=e=>this.status(c,`Speech recognition: ${e.error}`); r.onend=()=>{if(this.recording){try{r.start();}catch(_){}}}; this.recognition=r; try{r.start();}catch(e){this.status(c,'Unable to start microphone recognition.');}
    },
    stop(c){this.recording=false;if(this.recognition){this.recognition.onend=null;try{this.recognition.stop();}catch(_){}this.recognition=null;}if(c){c.querySelector('#tsStart').disabled=false;c.querySelector('#tsStop').disabled=true;this.status(c,'Ready');}},
    status(c,t){const s=c.querySelector('#tsStatus');if(s)s.innerHTML=`<i class="fas fa-circle"></i> ${this.esc(t)}`;},
    summarize(text,c){const t=text.trim();if(!t){this.status(c,'Add transcript text first.');return;}const sentences=t.split(/(?<=[.!?])\s+/).filter(Boolean);const summary=sentences.slice(0,5).join(' ');const words=t.toLowerCase().match(/\b[a-z][a-z'-]{4,}\b/g)||[];const freq={};words.forEach(w=>freq[w]=(freq[w]||0)+1);const topics=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]);c.querySelector('#tsSummary').className='ts-output';c.querySelector('#tsSummary').innerHTML=`<p>${this.esc(summary)}</p><div class="ts-chips">${topics.map(x=>`<span>${this.esc(x)}</span>`).join('')}</div>`;},
    mindmap(text,c){const words=(text.toLowerCase().match(/\b[a-z][a-z'-]{4,}\b/g)||[]);const freq={};words.forEach(w=>freq[w]=(freq[w]||0)+1);const topics=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);const out=c.querySelector('#tsMindMapOutput');out.className='ts-mindmap';out.innerHTML=`<div class="ts-map-center">Conversation</div><div class="ts-map-branches">${topics.length?topics.map(t=>`<span><i class="fas fa-arrow-right"></i>${this.esc(t)}</span>`).join(''):'<span>No strong topics detected.</span>'}</div>`;},
    insights(text,c){const t=text.trim();if(!t){this.status(c,'Add transcript text first.');return;}const lines=t.split(/(?<=[.!?])\s+/).filter(Boolean);const questions=lines.filter(x=>/[?]/.test(x)).slice(0,6);const actions=lines.filter(x=>/\b(need|should|will|action|follow up|send|call|schedule|next step)\b/i.test(x)).slice(0,6);const objections=lines.filter(x=>/\b(but|concern|expensive|price|not sure|already have|think about|objection)\b/i.test(x)).slice(0,6);const box=c.querySelector('#tsInsightOutput');box.className='ts-output';box.innerHTML=`<div class="ts-insight-grid"><div><b>Questions</b>${this.list(questions)}</div><div><b>Action Items</b>${this.list(actions)}</div><div><b>Potential Objections</b>${this.list(objections)}</div></div>`;},
    list(a){return a.length?`<ul>${a.map(x=>`<li>${this.esc(x)}</li>`).join('')}</ul>`:'<p class="ts-muted">None detected.</p>';},
    export(text,type){if(!text.trim()){alert('Add transcript text first.');return;}let data=text,ext=type,mime='text/plain';if(type==='csv'){data='"Timestamp","Text"\n"00:00:00","'+text.replace(/"/g,'""').replace(/\n/g,' ')+'"';mime='text/csv';}if(type==='srt'){data='1\n00:00:00,000 --> 99:59:59,000\n'+text;mime='application/x-subrip';}if(type==='vtt'){data='WEBVTT\n\n00:00:00.000 --> 99:59:59.000\n'+text;mime='text/vtt';}if(type==='doc'){data='<!doctype html><html><body><h1>ScriptFlow Pro Transcript</h1><pre>'+this.esc(text)+'</pre></body></html>';ext='doc';mime='application/msword';}const blob=new Blob([data],{type:mime});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`scriptflow-transcript.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},
    print(text,summary){const w=window.open('','_blank','width=900,height=700');if(!w)return;w.document.write(`<html><head><title>ScriptFlow Transcript</title><style>body{font:15px Arial;padding:40px;line-height:1.6}h1{margin-bottom:4px}.summary{background:#f3f4f6;padding:16px;border-radius:8px}pre{white-space:pre-wrap}</style></head><body><h1>ScriptFlow Pro Transcript</h1><div class="summary"><b>Summary</b><p>${this.esc(summary||'No summary generated.')}</p></div><h2>Transcript</h2><pre>${this.esc(text)}</pre><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close();},
    esc(s){const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML;}
  };
  window.TranscriptStudio=Studio;
  document.addEventListener('DOMContentLoaded',()=>Studio.init());
})();
