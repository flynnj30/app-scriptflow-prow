import React from 'react';
import { Sparkles, FileAudio, RotateCcw, Github } from 'lucide-react';
import { AppPhase } from '../types';

interface HeaderProps {
  currentPhase: AppPhase;
  onReset: () => void;
  fileName?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPhase, onReset, fileName }) => {
  return (
    <header className="w-full border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={onReset}
          className="flex items-center gap-3 group focus:outline-none cursor-pointer"
          title="Return to Home"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <FileAudio className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Transcript Studio
              </span>
              <span className="text-indigo-400 font-medium text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-indigo-500/20 rounded border border-indigo-500/30">
                PRO AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              High-Precision AI Speech-to-Text & Intelligence
            </p>
          </div>
        </button>

        {/* Phase / Action */}
        <div className="flex items-center gap-3">
          {currentPhase === 'completed' && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Transcribe Another File</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3.5 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] tracking-wide">16kHz PCM Whisper Engine Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
