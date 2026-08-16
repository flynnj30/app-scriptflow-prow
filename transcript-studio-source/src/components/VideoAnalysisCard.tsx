import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Clock, 
  Play, 
  Check, 
  Copy, 
  Layers, 
  Eye, 
  Activity, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { VideoAnalysisData, VideoScene } from '../types';

interface VideoAnalysisCardProps {
  videoAnalysis?: VideoAnalysisData;
  transcript: string;
  fileName: string;
  durationSeconds: number;
  onSeekToTime: (sec: number) => void;
  onUpdateVideoAnalysis?: (data: VideoAnalysisData) => void;
}

export const VideoAnalysisCard: React.FC<VideoAnalysisCardProps> = ({
  videoAnalysis: initialAnalysis,
  transcript,
  fileName,
  durationSeconds,
  onSeekToTime,
  onUpdateVideoAnalysis
}) => {
  const [analysis, setAnalysis] = useState<VideoAnalysisData | undefined>(initialAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVideoAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/transcript-browser/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          fileName,
          durationSeconds
        })
      });

      const data = await res.json();
      if (data.success && data.videoAnalysis) {
        setAnalysis(data.videoAnalysis);
        if (onUpdateVideoAnalysis) {
          onUpdateVideoAnalysis(data.videoAnalysis);
        }
      } else {
        setError(data.error || 'Failed to analyze video content');
      }
    } catch (err: any) {
      console.error('Video analysis error:', err);
      setError('Connection error while analyzing video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    const text = [
      `=== VIDEO INTELLIGENCE: ${analysis.videoTitle || fileName} ===`,
      `Engine: ${analysis.modelUsed || 'gemini-3.1-pro-preview'}`,
      `\n--- Screen & Visual Overview ---`,
      analysis.screenContentSummary,
      `\n--- Visual Highlights ---`,
      ...(analysis.visualHighlights || []).map(h => `• ${h}`),
      `\n--- Executive Takeaways ---`,
      ...(analysis.executiveTakeaways || []).map(t => `• ${t}`),
      `\n--- Scene Breakdown ---`,
      ...(analysis.scenes || []).map(s => `[${s.timestamp}] ${s.title}: ${s.visualDescription}`)
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 space-y-6 text-slate-100">
      
      {/* Top Banner & Action */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/50 border border-purple-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Gemini Pro Video Understanding
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                gemini-3.1-pro-preview
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Visual Scene & Screen Analysis
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Extracts on-screen presentations, user interface actions, slide checkpoints, and deep visual context.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {analysis && (
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                title="Copy Full Video Analysis"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            <button
              onClick={runVideoAnalysis}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 border border-purple-400/40 shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Pro...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>{analysis ? 'Re-analyze Video' : 'Analyze with Gemini Pro'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200">
            {error}
          </div>
        )}
      </div>

      {!analysis && !isLoading && (
        <div className="text-center py-10 px-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-purple-300 mx-auto mb-3">
            <Video className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">No Video Analysis Generated Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Click &quot;Analyze with Gemini Pro&quot; to unpack visual scenes, UI screen demonstrations, and key visual moments.
          </p>
          <button
            onClick={runVideoAnalysis}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 border border-purple-400/30 shadow-lg shadow-purple-600/25 inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Gemini Pro Video Intelligence</span>
          </button>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          
          {/* 1. Screen & Visual Overview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Screen & Visual Activity</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {analysis.screenContentSummary}
            </p>
          </div>

          {/* 2. Key Visual Highlights */}
          {analysis.visualHighlights && analysis.visualHighlights.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Visual Highlights & UI Demonstrations</span>
              </div>
              <ul className="space-y-2">
                {analysis.visualHighlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Timestamped Scenes & Chapters */}
          {analysis.scenes && analysis.scenes.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Scene Breakdown & Timeline</span>
                </div>
                <span className="text-[11px] text-slate-400">Click timestamp to seek</span>
              </div>

              <div className="space-y-3">
                {analysis.scenes.map((scene: VideoScene, idx: number) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 hover:border-purple-400/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onSeekToTime(scene.startSec)}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 group-hover:bg-purple-600 group-hover:text-white border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Seek audio/video player to this moment"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{scene.timestamp}</span>
                        </button>
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                          {scene.title}
                        </h4>
                      </div>
                      
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {scene.startSec}s - {scene.endSec}s
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-2 leading-relaxed pl-1">
                      {scene.visualDescription}
                    </p>

                    {scene.keyInsights && scene.keyInsights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-1 pt-1 border-t border-white/5">
                        {scene.keyInsights.map((insight, iIdx) => (
                          <span key={iIdx} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{insight}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Speaker Actions & Executive Takeaways */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.speakerActions && analysis.speakerActions.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>Presenter & Attendee Actions</span>
                </div>
                <ul className="space-y-1.5">
                  {analysis.speakerActions.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.executiveTakeaways && analysis.executiveTakeaways.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Executive Takeaways</span>
                </div>
                <ul className="space-y-1.5">
                  {analysis.executiveTakeaways.map((tak, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                      <span>{tak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
