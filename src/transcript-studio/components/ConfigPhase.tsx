import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Link as LinkIcon, 
  Trash2, 
  Mic, 
  Languages, 
  Subtitles, 
  Users, 
  Sparkles, 
  Clock, 
  Headphones, 
  Check, 
  Loader2,
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { TranscriptionOptions } from '../types';
import { HelpTooltip } from './HelpTooltip';

interface ConfigPhaseProps {
  fileName: string;
  fileSizeFormatted: string;
  durationFormatted: string;
  onStartTranscription: (options: TranscriptionOptions) => void;
  onRemoveFile: () => void;
  isProcessing: boolean;
  processingProgress: number;
  processingStageText: string;
}

const LANGUAGES = [
  'English',
  'Auto-detect',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese (Mandarin)',
  'Italian',
  'Portuguese',
  'Dutch',
  'Russian',
  'Korean',
  'Arabic',
  'Hindi'
];

export const ConfigPhase: React.FC<ConfigPhaseProps> = ({
  fileName,
  fileSizeFormatted,
  durationFormatted,
  onStartTranscription,
  onRemoveFile,
  isProcessing,
  processingProgress,
  processingStageText
}) => {
  const [options, setOptions] = useState<TranscriptionOptions>({
    language: 'English',
    enableTranslation: false,
    targetLanguage: 'Spanish',
    generateSubtitles: true,
    speakerIdentification: true,
    summaryType: 'general',
    intelligenceTier: 'fast'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    onStartTranscription(options);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Outer Frosted Glass Card Container */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-7 backdrop-blur-md">
        
        {/* Navigation Tabs at Top */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-slate-900/60 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
            >
              <FileText className="w-4 h-4" />
              <span>File upload</span>
            </button>

            <button
              type="button"
              onClick={onRemoveFile}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Paste link</span>
            </button>
          </div>
        </div>

        {/* Uploaded File Info Card */}
        <div className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 sm:p-5 mb-6 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3.5 sm:gap-4 overflow-hidden">
            {/* Audio Document Icon */}
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0 shadow-lg shadow-indigo-500/20">
              <Headphones className="w-6 h-6" />
            </div>

            <div className="truncate">
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                {fileName}
              </h3>
              <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-1 font-mono">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {durationFormatted || '06:54'}
                </span>
                <span>•</span>
                <span>{fileSizeFormatted || '1.79 MB'}</span>
              </div>
            </div>
          </div>

          {/* Delete / Replace button */}
          <button
            type="button"
            onClick={onRemoveFile}
            disabled={isProcessing}
            title="Remove file"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 transition-all shrink-0 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 mb-6"></div>

        {/* Options List */}
        <div className="w-full space-y-5 mb-8">
          
          {/* 1. Audio Language */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Audio Language</h4>
                <p className="text-xs text-slate-400">
                  Choose the language spoken in your audio. Not your translation language.
                </p>
              </div>
            </div>

            <select
              value={options.language}
              disabled={isProcessing}
              onChange={(e) => setOptions({ ...options, language: e.target.value })}
              className="bg-slate-800/80 border border-white/10 text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-400 min-w-[130px] backdrop-blur-sm"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* 2. Translation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Translation</h4>
                <p className="text-xs text-slate-400">
                  Translate the transcript after transcription finishes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {options.enableTranslation && (
                <select
                  value={options.targetLanguage}
                  disabled={isProcessing}
                  onChange={(e) => setOptions({ ...options, targetLanguage: e.target.value })}
                  className="bg-slate-800/80 border border-white/10 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 backdrop-blur-sm"
                >
                  <option value="Spanish">into Spanish</option>
                  <option value="French">into French</option>
                  <option value="German">into German</option>
                  <option value="Japanese">into Japanese</option>
                  <option value="Chinese">into Chinese</option>
                  <option value="Portuguese">into Portuguese</option>
                </select>
              )}

              {/* Custom styled toggle switch */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setOptions({ ...options, enableTranslation: !options.enableTranslation })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border border-white/10 ${
                  options.enableTranslation ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    options.enableTranslation ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 3. Generate Subtitle */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Subtitles className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-slate-100">Generate Subtitle</h4>
                <HelpTooltip 
                  title="Subtitle Export (.SRT & .VTT)"
                  content="Creates millisecond time-aligned SubRip and WebVTT subtitle files ready for YouTube, Premiere, or VLC."
                  side="top"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setOptions({ ...options, generateSubtitles: !options.generateSubtitles })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border border-white/10 ${
                options.generateSubtitles ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  options.generateSubtitles ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4. Speaker identification */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-slate-100">Speaker identification</h4>
                <HelpTooltip 
                  title="Speaker Diarization"
                  content="Identifies and labels individual conversational voices (e.g., Prospect, Sales Rep, Host) throughout the audio."
                  side="top"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setOptions({ ...options, speakerIdentification: !options.speakerIdentification })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border border-white/10 ${
                options.speakerIdentification ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  options.speakerIdentification ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. AI Summary */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-slate-100">AI Summary</h4>
                <HelpTooltip 
                  title="AI Meeting Summaries"
                  content="Extracts high-level key takeaways, action items, executive briefs, and mind map topic trees."
                  side="top"
                />
              </div>
            </div>

            <select
              value={options.summaryType}
              disabled={isProcessing}
              onChange={(e) => setOptions({ ...options, summaryType: e.target.value as any })}
              className="bg-slate-800/80 border border-white/10 text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-400 min-w-[140px] backdrop-blur-sm"
            >
              <option value="general">General Summary</option>
              <option value="takeaways">Key Takeaways</option>
              <option value="action_items">Action Items</option>
              <option value="detailed">Executive Brief</option>
              <option value="off">Off</option>
            </select>
          </div>

          {/* 6. Intelligence Tier */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-slate-100">Intelligence Tier</h4>
                <HelpTooltip 
                  title="Model Intelligence Tier"
                  content="Fast uses Gemini 3.7/3.5 Flash for rapid throughput. Deep enables advanced reasoning for difficult accents and complex terminology."
                  side="top"
                />
              </div>
            </div>

            <select
              value={options.intelligenceTier || 'fast'}
              disabled={isProcessing}
              onChange={(e) => setOptions({ ...options, intelligenceTier: e.target.value as 'fast' | 'deep' })}
              className="bg-slate-800/80 border border-white/10 text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-400 min-w-[140px] backdrop-blur-sm"
            >
              <option value="fast">Fast (Low Latency)</option>
              <option value="deep">Deep (High Thinking)</option>
            </select>
          </div>
        </div>

        {/* For Best Results Guidance Banner */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>For Best Results</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Auto-normalization & PCM 16kHz conversion will be safely applied for maximum acoustic clarity.</li>
            <li>Low-volume audio or quiet speech sections will be boosted without distorting background silence.</li>
            <li>For fast multi-speaker conversations, keep Speaker Identification toggled ON.</li>
          </ul>
        </div>

        {/* Primary Action Button: "Transcribe for Free" */}
        <div className="w-full">
          {isProcessing ? (
            /* Animated Processing State */
            <div className="w-full">
              <div className="relative w-full h-12 sm:h-14 rounded-xl overflow-hidden bg-slate-800/80 border border-white/15 flex items-center justify-center shadow-2xl backdrop-blur-md">
                {/* Background progress fill */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-indigo-600 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(8, processingProgress))}%` }}
                />
                
                {/* Glowing light shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />

                {/* Progress Content */}
                <div className="relative z-10 flex items-center gap-2.5 text-white font-semibold text-sm sm:text-base">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-indigo-200" />
                  <span>{processingStageText}</span>
                  <span className="text-indigo-200 text-xs sm:text-sm font-mono font-normal">
                    {Math.round(processingProgress)}%
                  </span>
                </div>
              </div>

              {/* Progress details line */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1 font-mono">
                <span>PCM 16kHz Decoding Pipeline</span>
                <span>Est. &lt; 5s remaining</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full h-12 sm:h-14 rounded-xl text-white font-bold text-sm sm:text-base bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all shadow-xl shadow-indigo-600/25 border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Transcribe for Free</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
