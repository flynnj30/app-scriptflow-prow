import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileText, 
  Subtitles, 
  Code, 
  FileCode, 
  Check, 
  Copy,
  FileCheck2
} from 'lucide-react';
import { TranscriptResult, TranscriptSegment } from '../types';
import { 
  generateSrt, 
  generateVtt, 
  generateMarkdown, 
  generateTxt, 
  generateJsonExport, 
  downloadExportFile 
} from '../utils/audioUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result?: TranscriptResult;
  transcriptResult?: TranscriptResult;
  segments?: TranscriptSegment[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  result, 
  transcriptResult,
  segments: propSegments 
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const activeResult = result || transcriptResult;
  if (!isOpen || !activeResult) return null;

  // Use edited segments if passed
  const currentResult: TranscriptResult = {
    ...activeResult,
    segments: propSegments || activeResult.segments
  };

  const baseName = currentResult.fileName.replace(/\.[^/.]+$/, '');

  const handleExportTxt = () => {
    const text = generateTxt(currentResult);
    downloadExportFile(text, `${baseName}.txt`, 'text/plain;charset=utf-8');
  };

  const handleExportSrt = () => {
    const srt = generateSrt(currentResult.segments);
    downloadExportFile(srt, `${baseName}.srt`, 'text/plain;charset=utf-8');
  };

  const handleExportVtt = () => {
    const vtt = generateVtt(currentResult.segments);
    downloadExportFile(vtt, `${baseName}.vtt`, 'text/vtt;charset=utf-8');
  };

  const handleExportJson = () => {
    const jsonData = generateJsonExport(currentResult);
    downloadExportFile(jsonData, `${baseName}.json`, 'application/json;charset=utf-8');
  };

  const handleExportMd = () => {
    const md = generateMarkdown(currentResult.fileName, currentResult.segments, currentResult.durationFormatted);
    downloadExportFile(md, `${baseName}.md`, 'text/markdown;charset=utf-8');
  };

  const handleExportDoc = () => {
    let html = `<html><head><meta charset="utf-8"><title>${currentResult.fileName}</title></head><body>`;
    html += `<h2>Transcript: ${currentResult.fileName}</h2>`;
    html += `<p><strong>Duration:</strong> ${currentResult.durationFormatted} | <strong>Words:</strong> ${currentResult.wordCount}</p><hr/>`;
    currentResult.segments.forEach(s => {
      html += `<p><strong>[${s.timestamp}] ${s.speaker ? s.speaker + ': ' : ''}</strong>${s.text}</p>`;
    });
    html += `</body></html>`;
    downloadExportFile(html, `${baseName}.doc`, 'application/msword;charset=utf-8');
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(currentResult.fullTranscript);
    setCopiedFormat('raw');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Export Transcript</h3>
            <p className="text-xs text-slate-300">
              Download {baseName} in your preferred format
            </p>
          </div>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          
          {/* TXT */}
          <button
            onClick={handleExportTxt}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/60 hover:bg-white/10 transition-all group text-left cursor-pointer backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Plain Text (.txt)</span>
                <span className="text-[11px] text-slate-400">Standard text file</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* SRT Subtitles */}
          <button
            onClick={handleExportSrt}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/60 hover:bg-white/10 transition-all group text-left cursor-pointer backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Subtitles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">SubRip (.srt)</span>
                <span className="text-[11px] text-slate-400">Time-synced subtitles</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* VTT Subtitles */}
          <button
            onClick={handleExportVtt}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/60 hover:bg-white/10 transition-all group text-left cursor-pointer backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">WebVTT (.vtt)</span>
                <span className="text-[11px] text-slate-400">Web video subtitles</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* JSON */}
          <button
            onClick={handleExportJson}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/60 hover:bg-white/10 transition-all group text-left cursor-pointer backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">JSON Data (.json)</span>
                <span className="text-[11px] text-slate-400">Timestamps & speakers</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* Markdown */}
          <button
            onClick={handleExportMd}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/60 hover:bg-white/10 transition-all group text-left cursor-pointer backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Markdown (.md)</span>
                <span className="text-[11px] text-slate-400">Formatted doc</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* Word (.doc) */}
          <button
            onClick={handleExportDoc}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/60 hover:bg-white/10 transition-all group text-left cursor-pointer backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">MS Word (.doc)</span>
                <span className="text-[11px] text-slate-400">Office document ready</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </button>
        </div>

        {/* Quick Copy Action */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-300">
            {result.wordCount} words • {result.durationFormatted} duration
          </span>

          <button
            onClick={handleCopyRaw}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15 cursor-pointer backdrop-blur-sm"
          >
            {copiedFormat === 'raw' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Transcript</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
