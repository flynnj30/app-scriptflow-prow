import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronDown,
  Share2, 
  MoreHorizontal, 
  Download, 
  Search, 
  Copy, 
  Check, 
  Edit3, 
  Users, 
  Sparkles, 
  Lightbulb, 
  CheckSquare, 
  FileText, 
  Languages, 
  X,
  RefreshCw,
  Eye,
  Type,
  Calendar,
  Layers,
  HelpCircle,
  Video,
  Zap,
  Subtitles,
  Code,
  FileCode
} from 'lucide-react';
import { TranscriptResult, TranscriptSegment, SummaryData, BookingInfo, VideoAnalysisData } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { ExportModal } from './ExportModal';
import { MindMapViewer } from './MindMapViewer';
import { BookingNotesCard } from './BookingNotesCard';
import { VideoAnalysisCard } from './VideoAnalysisCard';
import { LowLatencyChatCard } from './LowLatencyChatCard';
import { HelpTooltip } from './HelpTooltip';
import { 
  createSyntheticAudioBlob, 
  generateTxt, 
  generateJsonExport, 
  generateSrt, 
  generateVtt, 
  downloadExportFile 
} from '../utils/audioUtils';
import { extractBookingInfoWithServer, formatBookingInfoForClipboard } from '../utils/bookingExtractor';

interface TranscriptPhaseProps {
  result: TranscriptResult;
  onBackToHome: () => void;
  onRetranscribeWithSpeakers?: () => void;
  onUpdateBookingInfo?: (info: BookingInfo) => void;
}

type FontSize = 'sm' | 'base' | 'lg' | 'xl';

export const TranscriptPhase: React.FC<TranscriptPhaseProps> = ({
  result,
  onBackToHome,
  onRetranscribeWithSpeakers,
  onUpdateBookingInfo
}) => {
  // Audio playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(result.segments[0]?.id || null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // UI tabs and controls
  const [activeRightTab, setActiveRightTab] = useState<'booking' | 'video' | 'chat' | 'summary' | 'mindmap'>('booking');
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  
  // Video Analysis State
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysisData | undefined>(result.videoAnalysis);
  
  // Modals & Popovers
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);
  const [speakerBannerDismissed, setSpeakerBannerDismissed] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedBookingTop, setCopiedBookingTop] = useState(false);
  const [copiedSegmentId, setCopiedSegmentId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [isReExtractingBooking, setIsReExtractingBooking] = useState(false);

  // Close download dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        downloadDropdownRef.current &&
        !downloadDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDownloadDropdownOpen(false);
      }
    };
    if (isDownloadDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDownloadDropdownOpen]);

  // Editable segments
  const [segments, setSegments] = useState<TranscriptSegment[]>(result.segments);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Booking Info State
  const [currentBookingInfo, setCurrentBookingInfo] = useState<BookingInfo>(
    result.bookingInfo || {
      businessName: 'Not specified',
      name: 'Not specified',
      role: 'Not specified',
      phoneNumber: 'Not specified',
      demoTimeDate: 'Not specified',
      email: 'Not specified',
      notesForDeveloper: 'Not specified',
      interestLevel: 'Not specified'
    }
  );

  // AI Summary state
  const [summaryTemplate, setSummaryTemplate] = useState<string>(result.summary?.template || 'general');
  const [summaryData, setSummaryData] = useState<SummaryData | undefined>(result.summary);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const segmentsContainerRef = useRef<HTMLDivElement>(null);

  // Sync when result updates
  useEffect(() => {
    setSegments(result.segments);
    if (result.bookingInfo) {
      setCurrentBookingInfo(result.bookingInfo);
    }
    if (result.summary) {
      setSummaryData(result.summary);
    }
  }, [result]);

  // Setup Audio Object from user's attached file or URL
  useEffect(() => {
    let url = result.audioBlobUrl;
    if (!url) {
      // Fallback synthetic audio for smooth scrubbable playback
      url = createSyntheticAudioBlob(result.durationSeconds || 414);
    }
    setAudioUrl(url);

    if (audioElementRef.current) {
      audioElementRef.current.src = url;
      audioElementRef.current.playbackRate = playbackSpeed;
      audioElementRef.current.volume = volume;
    }
  }, [result.audioBlobUrl, result.durationSeconds]);

  // Sync playback speed and volume with audio element
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = playbackSpeed;
      audioElementRef.current.volume = volume;
    }
  }, [playbackSpeed, volume]);

  const handlePlayPause = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback resume interaction required:', err);
      });
    }
  };

  const handleSeek = (seconds: number) => {
    if (!audioElementRef.current) return;
    audioElementRef.current.currentTime = seconds;
    setCurrentTime(seconds);

    const current = segments.find(s => seconds >= s.startSec && seconds <= s.endSec + 1);
    if (current) {
      setActiveSegmentId(current.id);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
  };

  // Jump audio when clicking segment
  const handleSegmentClick = (segment: TranscriptSegment) => {
    handleSeek(segment.startSec);
  };

  // Copy full transcript
  const handleCopyFullTranscript = () => {
    const fullText = segments.map(s => {
      const speaker = s.speaker ? `[${s.speaker}] ` : '';
      return `[${s.timestamp}] ${speaker}${s.text}`;
    }).join('\n\n');

    navigator.clipboard.writeText(fullText);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  // Quick 1-click Copy Booking Info from Top Toolbar
  const handleTopCopyBooking = () => {
    const formatted = formatBookingInfoForClipboard(currentBookingInfo);
    navigator.clipboard.writeText(formatted);
    setCopiedBookingTop(true);
    setTimeout(() => setCopiedBookingTop(false), 2000);
  };

  // Copy single segment
  const handleCopySegment = (e: React.MouseEvent, seg: TranscriptSegment) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`[${seg.timestamp}] ${seg.speaker ? seg.speaker + ': ' : ''}${seg.text}`);
    setCopiedSegmentId(seg.id);
    setTimeout(() => setCopiedSegmentId(null), 1800);
  };

  // Quick 1-click Download Handlers for Dropdown
  const baseFileName = result.fileName.replace(/\.[^/.]+$/, '');

  const handleDownloadTxt = () => {
    const text = generateTxt({ ...result, segments });
    downloadExportFile(text, `${baseFileName}.txt`, 'text/plain;charset=utf-8');
    setIsDownloadDropdownOpen(false);
  };

  const handleDownloadSrt = () => {
    const srt = generateSrt(segments);
    downloadExportFile(srt, `${baseFileName}.srt`, 'text/plain;charset=utf-8');
    setIsDownloadDropdownOpen(false);
  };

  const handleDownloadJson = () => {
    const jsonStr = generateJsonExport({ 
      ...result, 
      segments, 
      bookingInfo: currentBookingInfo, 
      summary: summaryData 
    });
    downloadExportFile(jsonStr, `${baseFileName}.json`, 'application/json;charset=utf-8');
    setIsDownloadDropdownOpen(false);
  };

  // Inline Segment text editing
  const startEditSegment = (seg: TranscriptSegment) => {
    setEditingSegmentId(seg.id);
    setEditingText(seg.text);
  };

  const saveEditSegment = (segId: string) => {
    const updated = segments.map(s => s.id === segId ? { ...s, text: editingText } : s);
    setSegments(updated);
    setEditingSegmentId(null);
  };

  // Update booking info handler
  const handleUpdateBooking = (newInfo: BookingInfo) => {
    setCurrentBookingInfo(newInfo);
    onUpdateBookingInfo?.(newInfo);
  };

  // Re-extract booking info with AI
  const handleReExtractBooking = async () => {
    setIsReExtractingBooking(true);
    try {
      const fullText = segments.map(s => `${s.speaker ? s.speaker + ': ' : ''}${s.text}`).join('\n\n');
      const extracted = await extractBookingInfoWithServer(fullText);
      setCurrentBookingInfo(extracted);
      onUpdateBookingInfo?.(extracted);
    } catch (e) {
      console.warn('Re-extraction error:', e);
    } finally {
      setIsReExtractingBooking(false);
    }
  };

  // Generate / Refresh AI Summary
  const handleGenerateSummary = async (template: string) => {
    setIsGeneratingSummary(true);
    try {
      const fullText = segments.map(s => `${s.speaker ? s.speaker + ': ' : ''}${s.text}`).join('\n\n');
      const response = await fetch('/transcript-browser/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: fullText || result.fullTranscript,
          template: template
        })
      });
      const cType = response.headers.get('content-type') || '';
      if (response.ok && cType.includes('application/json')) {
        const data = await response.json();
        if (data.summary) {
          setSummaryData(data.summary);
        }
      }
    } catch (err) {
      console.warn('Using local structured summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopySummaryText = () => {
    if (!summaryData) return;
    let text = `AI SUMMARY: ${result.fileName}\n\n`;
    if (summaryData.overview?.length) {
      text += `OVERVIEW:\n${summaryData.overview.map(o => `• ${o}`).join('\n')}\n\n`;
    }
    if (summaryData.keyPoints?.length) {
      text += `KEY POINTS:\n${summaryData.keyPoints.map(k => `• ${k}`).join('\n')}\n\n`;
    }
    if (summaryData.takeaways?.length) {
      text += `TAKEAWAYS:\n${summaryData.takeaways.map(t => `• ${t}`).join('\n')}\n\n`;
    }
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  // High-visibility search query highlighting
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-amber-400 text-slate-950 font-bold px-1 rounded shadow-sm">
          {part}
        </mark>
      ) : part
    );
  };

  // Filtered segments based on search
  const filteredSegments = segments.filter(seg => 
    seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (seg.speaker && seg.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const cleanTitle = result.fileName.replace(/\.[^/.]+$/, '');

  // Speaker Badge Helper
  const getSpeakerBadge = (speaker?: string) => {
    if (!speaker) return null;
    const isHost = speaker.toLowerCase().includes('host') || speaker.toLowerCase().includes('representative') || speaker.toLowerCase().includes('flynn') || speaker.toLowerCase().includes('speaker 1');
    const isProspect = speaker.toLowerCase().includes('prospect') || speaker.toLowerCase().includes('owner') || speaker.toLowerCase().includes('aldis') || speaker.toLowerCase().includes('serge') || speaker.toLowerCase().includes('speaker 2');

    if (isHost) {
      return (
        <span className="text-xs font-bold text-indigo-200 bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          {speaker}
        </span>
      );
    }
    if (isProspect) {
      return (
        <span className="text-xs font-bold text-emerald-200 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          {speaker}
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-cyan-200 bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 rounded-full">
        {speaker}
      </span>
    );
  };

  // Font size class mapper
  const getFontSizeClass = (size: FontSize) => {
    switch (size) {
      case 'sm': return 'text-xs sm:text-sm leading-relaxed';
      case 'base': return 'text-sm sm:text-base leading-relaxed';
      case 'lg': return 'text-base sm:text-lg leading-relaxed';
      case 'xl': return 'text-lg sm:text-xl leading-relaxed';
      default: return 'text-sm sm:text-base leading-relaxed';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-slate-100 min-h-screen">
      
      {/* Hidden Native Audio Element bound to exact attached recording */}
      <audio
        ref={audioElementRef}
        onTimeUpdate={() => {
          if (audioElementRef.current) {
            const time = audioElementRef.current.currentTime;
            setCurrentTime(time);
            const current = segments.find(s => time >= s.startSec && time <= s.endSec + 1);
            if (current && current.id !== activeSegmentId) {
              setActiveSegmentId(current.id);
            }
          }
        }}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* 1. Top Navigation Bar (Frosted Glass Header Bar) */}
      <div className="w-full bg-white/5 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between z-20 backdrop-blur-md">
        {/* Left: Back Arrow + File Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-slate-300 hover:text-white font-medium text-sm sm:text-base group transition-colors cursor-pointer"
            title="Return to upload"
          >
            <ChevronLeft className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
            <span className="font-bold truncate max-w-[200px] sm:max-w-md text-white">
              {cleanTitle}
            </span>
          </button>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Copy Booking Info Button */}
          <button
            onClick={handleTopCopyBooking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-200 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 transition-colors cursor-pointer backdrop-blur-sm"
            title="Copy Formatted Booking Info & Notes"
          >
            {copiedBookingTop ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Booking!</span>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Copy Booking Info</span>
                <span className="sm:hidden">Copy Info</span>
              </>
            )}
          </button>

          {/* Share button */}
          <button
            onClick={handleShareClick}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-colors relative cursor-pointer backdrop-blur-sm"
            title="Share transcript link"
          >
            <Share2 className="w-4 h-4" />
            {shareToast && (
              <span className="absolute -bottom-8 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap animate-in fade-in z-30">
                Link Copied!
              </span>
            )}
          </button>

          {/* Download Dropdown (Direct .TXT, .SRT, .JSON + Full Export) */}
          <div ref={downloadDropdownRef} className="relative">
            <div className="inline-flex rounded-xl shadow-lg shadow-indigo-600/25">
              <button
                onClick={() => setIsExportOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-l-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 border-y border-l border-indigo-400/40 transition-all cursor-pointer"
                title="Open Full Export Dialog"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setIsDownloadDropdownOpen(prev => !prev)}
                className="px-2.5 py-2 rounded-r-xl bg-indigo-700 hover:bg-indigo-600 text-white border-y border-r border-l border-indigo-400/40 transition-colors cursor-pointer flex items-center justify-center"
                title="Download dropdown (.TXT, .SRT, .JSON)"
                aria-label="Download options"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDownloadDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDownloadDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 p-2 bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Download Dropdown</span>
                  <HelpTooltip 
                    title="Export Formats"
                    content="Download verbatim plain text (.txt), time-synced video subtitles (.srt), or full metadata & timestamp JSON."
                    side="bottom"
                  />
                </div>

                {/* TXT Option */}
                <button
                  onClick={handleDownloadTxt}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Plain Text (.txt)</span>
                      <span className="text-[10px] text-slate-400">Verbatim readable transcript</span>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300" />
                </button>

                {/* SRT Option */}
                <button
                  onClick={handleDownloadSrt}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <Subtitles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">SubRip Subtitles (.srt)</span>
                      <span className="text-[10px] text-slate-400">Accurate time-synced captions</span>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-300" />
                </button>

                {/* JSON Option */}
                <button
                  onClick={handleDownloadJson}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Code className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">JSON Data (.json)</span>
                      <span className="text-[10px] text-slate-400">Timestamps, booking & metadata</span>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300" />
                </button>

                <div className="my-1 border-t border-white/10"></div>

                {/* More Formats / Modal Button */}
                <button
                  onClick={() => {
                    setIsDownloadDropdownOpen(false);
                    setIsExportOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white hover:bg-indigo-600/30 transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                  <span>All Formats (.vtt, .md, .doc)...</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Two-Column Workspace */}
      <div className="flex-1 w-full max-w-[1800px] mx-auto flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT COLUMN: Transcript Viewer & Audio Synchronizer */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden bg-slate-900/50 backdrop-blur-md">
          
          {/* Transcript Toolbar (Search + Text Scaling + Actions) */}
          <div className="p-4 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm">
            
            {/* Title, Duration Pill, & High Visibility Badges */}
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Transcript</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {result.durationFormatted || '06:54'}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 hidden sm:inline">
                {result.wordCount || segments.reduce((acc, s) => acc + s.text.split(' ').length, 0)} words
              </span>
            </div>

            {/* Controls: Font Size Switcher + Search + Copy */}
            <div className="flex items-center gap-2 flex-1 max-w-md ml-auto justify-end">
              
              {/* Font Size Adjuster Aa */}
              <div className="flex items-center bg-slate-800/80 border border-white/10 rounded-xl p-0.5 backdrop-blur-sm">
                {(['sm', 'base', 'lg', 'xl'] as FontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      fontSize === size
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={`Text Size: ${size.toUpperCase()}`}
                  >
                    {size === 'sm' ? 'S' : size === 'base' ? 'M' : size === 'lg' ? 'L' : 'XL'}
                  </button>
                ))}
              </div>

              {/* Search Box with High Contrast Highlighting */}
              <div className="relative flex-1 min-w-[140px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keywords..."
                  className="w-full bg-slate-800/80 border border-white/10 focus:border-indigo-400 focus:outline-none rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-400 backdrop-blur-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Copy Full Transcript */}
              <button
                onClick={handleCopyFullTranscript}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0 backdrop-blur-sm"
                title={copiedFull ? 'Copied full transcript!' : 'Copy full transcript'}
              >
                {copiedFull ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Translate / Export Modal trigger */}
              <button
                onClick={() => setIsExportOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0 backdrop-blur-sm"
                title="Translate & Export"
              >
                <Languages className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Speaker Recognition Banner */}
          {!speakerBannerDismissed && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs text-slate-200 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Multi-speaker recognition enabled with synchronized turn-by-turn timestamps.</span>
                <span className="hidden sm:inline text-slate-400">|</span>
                <button
                  onClick={onRetranscribeWithSpeakers}
                  className="font-bold text-indigo-300 hover:text-indigo-200 hover:underline transition-colors cursor-pointer"
                >
                  Enhance diarization
                </button>
              </div>

              <button
                onClick={() => setSpeakerBannerDismissed(true)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Transcript Scrollable Segments Area (High Visibility Layout) */}
          <div 
            ref={segmentsContainerRef}
            className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[calc(100vh-270px)]"
          >
            {filteredSegments.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No matching transcript segments found for "{searchQuery}".
              </div>
            ) : (
              filteredSegments.map((seg) => {
                const isActive = activeSegmentId === seg.id;
                const isEditing = editingSegmentId === seg.id;

                return (
                  <div
                    key={seg.id}
                    onClick={() => handleSegmentClick(seg)}
                    className={`rounded-2xl p-4 sm:p-5 transition-all border cursor-pointer group relative backdrop-blur-md shadow-md ${
                      isActive
                        ? 'bg-indigo-950/60 border-indigo-400 shadow-xl shadow-indigo-950/60 ring-1 ring-indigo-400/40'
                        : 'bg-white/[0.05] border-white/10 hover:bg-white/[0.09] hover:border-white/20'
                    }`}
                  >
                    {/* Timestamp & Speaker Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        {/* Timestamp badge */}
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                          isActive 
                            ? 'bg-indigo-500/40 text-indigo-100 border-indigo-400/60 shadow-sm' 
                            : 'bg-white/10 text-indigo-300 border-white/15'
                        }`}>
                          {seg.timestamp}
                        </span>

                        {/* Speaker tag with Distinct Colors */}
                        {getSpeakerBadge(seg.speaker)}
                      </div>

                      {/* Hover Actions */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditSegment(seg); }}
                          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          title="Edit text"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleCopySegment(e, seg)}
                          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          title="Copy segment"
                        >
                          {copiedSegmentId === seg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Segment Body Text (High Visibility & Crisp Typography) */}
                    {isEditing ? (
                      <div onClick={(e) => e.stopPropagation()} className="mt-2 space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full bg-slate-950 border border-indigo-400 rounded-xl p-3 text-sm sm:text-base text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 leading-relaxed font-sans"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingSegmentId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEditSegment(seg.id)}
                            className="px-4 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className={`${getFontSizeClass(fontSize)} text-slate-100 font-normal select-text tracking-normal`}>
                        {renderHighlightedText(seg.text, searchQuery)}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Audio Player Bar */}
          <AudioPlayer
            audioBlobUrl={audioUrl}
            durationSeconds={result.durationSeconds || 414}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            playbackSpeed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>

        {/* RIGHT COLUMN: Booking & Notes | AI Summary | Mind Map */}
        <div className="w-full lg:w-[480px] xl:w-[560px] flex flex-col bg-slate-900/70 border-l border-white/10 backdrop-blur-md overflow-y-auto max-h-[calc(100vh-60px)]">
          
          {/* Right Column Header Tabs */}
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-sm sticky top-0 z-20 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              
              {/* Tab 1: Booking & Notes (Primary) */}
              <button
                onClick={() => setActiveRightTab('booking')}
                className={`text-xs sm:text-sm font-bold pb-1 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeRightTab === 'booking'
                    ? 'text-white border-b-2 border-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Booking & Notes</span>
              </button>

              {/* Tab 2: Fast Q&A (Low-Latency gemini-3.1-flash-lite) */}
              <button
                onClick={() => setActiveRightTab('chat')}
                className={`text-xs sm:text-sm font-bold pb-1 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeRightTab === 'chat'
                    ? 'text-white border-b-2 border-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Fast Q&A</span>
              </button>

              {/* Tab 3: Video Intel (Gemini Pro gemini-3.1-pro-preview) */}
              <button
                onClick={() => setActiveRightTab('video')}
                className={`text-xs sm:text-sm font-bold pb-1 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeRightTab === 'video'
                    ? 'text-white border-b-2 border-purple-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-4 h-4 text-purple-400" />
                <span>Video Intel</span>
              </button>

              {/* Tab 4: AI Summary */}
              <button
                onClick={() => setActiveRightTab('summary')}
                className={`text-xs sm:text-sm font-bold pb-1 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeRightTab === 'summary'
                    ? 'text-white border-b-2 border-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI Summary</span>
              </button>

              {/* Tab 5: Mind Map */}
              <button
                onClick={() => setActiveRightTab('mindmap')}
                className={`text-xs sm:text-sm font-bold pb-1 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeRightTab === 'mindmap'
                    ? 'text-white border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Mind Map</span>
              </button>
            </div>

            {/* Summary controls when on summary tab */}
            {activeRightTab === 'summary' && (
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <select
                  value={summaryTemplate}
                  onChange={(e) => {
                    setSummaryTemplate(e.target.value);
                    if (e.target.value !== 'off') {
                      handleGenerateSummary(e.target.value);
                    }
                  }}
                  className="bg-slate-800/80 border border-white/10 text-slate-200 text-xs rounded-xl px-2 py-1 focus:outline-none focus:border-indigo-400 backdrop-blur-sm"
                >
                  <option value="general">General</option>
                  <option value="takeaways">Takeaways</option>
                  <option value="action_items">Action Items</option>
                  <option value="off">Off</option>
                </select>

                <button
                  onClick={() => handleGenerateSummary(summaryTemplate)}
                  disabled={isGeneratingSummary}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Regenerate summary"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSummary ? 'animate-spin text-indigo-400' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: AUTOMATIC BOOKING INFORMATION & MEETING NOTES */}
          {activeRightTab === 'booking' && (
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <BookingNotesCard
                bookingInfo={currentBookingInfo}
                onUpdateBookingInfo={handleUpdateBooking}
                onReExtract={handleReExtractBooking}
                isReExtracting={isReExtractingBooking}
              />
            </div>
          )}

          {/* TAB 2: FAST Q&A / LOW LATENCY GEMINI LITE ASSISTANT */}
          {activeRightTab === 'chat' && (
            <div className="flex-1 flex flex-col">
              <LowLatencyChatCard
                transcript={segments.map(s => `[${s.timestamp}] ${s.speaker || 'Speaker'}: ${s.text}`).join('\n')}
                fileName={result.fileName}
              />
            </div>
          )}

          {/* TAB 3: VIDEO UNDERSTANDING VIA GEMINI PRO */}
          {activeRightTab === 'video' && (
            <div className="flex-1 flex flex-col">
              <VideoAnalysisCard
                videoAnalysis={videoAnalysis}
                transcript={segments.map(s => `[${s.timestamp}] ${s.speaker || 'Speaker'}: ${s.text}`).join('\n')}
                fileName={result.fileName}
                durationSeconds={result.durationSeconds || 300}
                onSeekToTime={(sec) => {
                  handleSeek(sec);
                  if (!isPlaying) {
                    handlePlayPause();
                  }
                }}
                onUpdateVideoAnalysis={(data) => setVideoAnalysis(data)}
              />
            </div>
          )}

          {/* TAB 2: AI SUMMARY TAB CONTENT */}
          {activeRightTab === 'summary' && (
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              {summaryTemplate === 'off' || (!summaryData && !isGeneratingSummary) ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-md shadow-lg">
                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-6">
                      <Sparkles className="w-4 h-4" />
                      <span>Generate an AI summary for this transcript</span>
                    </div>

                    <div className="space-y-4 text-left mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1.5 pt-1">
                          <span className="text-xs font-bold text-slate-200">Overview</span>
                          <div className="h-2 w-full bg-white/10 rounded"></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1.5 pt-1">
                          <span className="text-xs font-bold text-slate-200">Key Points</span>
                          <div className="h-2 w-full bg-white/10 rounded"></div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSummaryTemplate('general');
                        handleGenerateSummary('general');
                      }}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      Generate Summary Now
                    </button>
                  </div>
                </div>
              ) : isGeneratingSummary ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-sm font-medium text-slate-200">Synthesizing audio summary with AI...</p>
                </div>
              ) : summaryData ? (
                <div className="space-y-5">
                  {/* Overview Section */}
                  {summaryData.overview && summaryData.overview.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
                      <div className="flex items-center gap-2 mb-3 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-indigo-400" />
                        <span>Executive Overview</span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed list-disc list-inside">
                        {summaryData.overview.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Points */}
                  {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
                      <div className="flex items-center gap-2 mb-3 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                        <span>Key Discussion Points</span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed list-disc list-inside">
                        {summaryData.keyPoints.map((kp, i) => (
                          <li key={i}>{kp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Items */}
                  {summaryData.actionItems && summaryData.actionItems.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
                      <div className="flex items-center gap-2 mb-3 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span>Action Items & Next Steps</span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed list-disc list-inside">
                        {summaryData.actionItems.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: MIND MAP TAB CONTENT */}
          {activeRightTab === 'mindmap' && (
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <MindMapViewer
                rootNode={result.mindMap}
                fileName={result.fileName}
              />
            </div>
          )}

        </div>
      </div>

      {/* Export / Translate Modal */}
      {isExportOpen && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          transcriptResult={result}
          segments={segments}
        />
      )}

    </div>
  );
};
