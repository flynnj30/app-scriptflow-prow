import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Link as LinkIcon, 
  Upload, 
  Mic, 
  Radio, 
  Video, 
  Info, 
  Sparkles, 
  Play, 
  Clock, 
  HardDrive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_AUDIOS, SampleAudioItem } from '../data/sampleAudios';
import { formatFileSize, formatTime } from '../utils/audioUtils';

interface UploadPhaseProps {
  onFileSelected: (file: File | null, sampleItem?: SampleAudioItem) => void;
}

export const UploadPhase: React.FC<UploadPhaseProps> = ({ onFileSelected }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'record'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);

    // Max 100MB
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(`File is too large (${formatFileSize(file.size)}). Maximum supported size is 100MB.`);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('Selected file is empty. Please choose a valid audio recording.');
      return;
    }

    // Supported formats check: opus, ogg, mp3, wav, m4a, webm, aac, flac, mp4, mov, avi, wma
    const validExtensions = ['.opus', '.ogg', '.mp3', '.wav', '.m4a', '.webm', '.aac', '.flac', '.mp4', '.mov', '.avi', '.wma'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!hasValidExt && !file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      setErrorMessage(`Unsupported format. Please upload a valid audio or video file (.opus, .mp3, .wav, .mp4, .mov, etc.).`);
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    // Create a virtual file placeholder from URL
    try {
      const urlObj = new URL(linkUrl);
      const urlPath = urlObj.pathname;
      const extractedName = urlPath.split('/').pop() || 'web-stream.opus';
      const safeName = extractedName.includes('.') ? extractedName : `${extractedName}.opus`;
      
      const virtualFile = new File(['[Audio stream data]'], safeName, { type: 'audio/ogg' });
      onFileSelected(virtualFile);
    } catch {
      setErrorMessage('Please enter a valid audio or video URL.');
    }
  };

  const startLiveRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine best audio mime type supported
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : 'audio/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const actualMime = mediaRecorder.mimeType || 'audio/webm';
        const ext = actualMime.includes('ogg') ? 'ogg' : actualMime.includes('mp4') ? 'mp4' : 'webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
        const recordedFile = new File([audioBlob], `mic-recording-${Date.now()}.${ext}`, { type: actualMime });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        clearInterval(timerIntervalRef.current);
        
        onFileSelected(recordedFile);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMessage('Microphone access was denied or is not available in your browser.');
    }
  };

  const stopLiveRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
      {/* Title Section (Matching Theme Style) */}
      <div className="text-center max-w-2xl mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Transcript Studio <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">Powered by AI</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          Convert OPUS, MP3, WAV, and audio recordings into high-accuracy text transcripts with speaker diarization, auto-booking intelligence, and developer notes.
        </p>
      </div>

      {/* Main Frosted Glass Card Container */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-7 mb-8 backdrop-blur-md">
        {/* Navigation Tabs (Frosted Glass Pill) */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-slate-900/60 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>File upload</span>
            </button>

            <button
              onClick={() => { setActiveTab('link'); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Paste link</span>
            </button>

            <button
              onClick={() => { setActiveTab('record'); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'record'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Record</span>
            </button>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-950/70 border border-rose-500/40 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-rose-200 backdrop-blur-sm">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: File Upload (Frosted Glass Dropzone) */}
        {activeTab === 'upload' && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full bg-slate-900/50 border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center transition-all backdrop-blur-sm ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                : 'border-white/15 hover:border-indigo-400/50'
            }`}
          >
            {/* 3 Badge Icons Cluster */}
            <div className="flex items-center justify-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 backdrop-blur-sm">
                <Mic className="w-4 h-4" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-lg shadow-indigo-500/20 backdrop-blur-md">
                <Radio className="w-6 h-6 animate-pulse text-indigo-300" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 backdrop-blur-sm">
                <Video className="w-4 h-4" />
              </div>
            </div>

            {/* Prompt text */}
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-5">
              Click or drag & drop to upload your file
            </h3>

            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".opus,.ogg,.mp3,.wav,.m4a,.webm,.aac,.flac,.mp4,audio/*,video/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload-input"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/40 shadow-xl shadow-indigo-600/25 active:scale-95 transition-all mb-4 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload a file</span>
            </button>

            {/* Formats Info Tag */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Supports 20+ audio and video formats</span>
              <span title="Supports OPUS, OGG, MP3, WAV, M4A, FLAC, AAC, WEBM, MP4, MOV, and more">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-300 cursor-help" />
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Paste Link */}
        {activeTab === 'link' && (
          <form onSubmit={handleLinkSubmit} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-8 flex flex-col items-center backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/20">
              <LinkIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">
              Import from Audio or Video URL
            </h3>
            <p className="text-xs text-slate-400 mb-5 text-center max-w-md">
              Paste a direct link to an .opus, podcast stream, or hosted media file.
            </p>

            <div className="w-full max-w-md flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/audio/meeting-recording.opus"
                className="flex-1 bg-slate-800/80 border border-white/10 focus:border-indigo-400 focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-400 backdrop-blur-sm"
                required
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
              >
                Fetch & Transcribe
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Live Microphone Recording */}
        {activeTab === 'record' && (
          <div className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
              isRecording 
                ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-400 scale-110 shadow-lg shadow-rose-500/20' 
                : 'bg-indigo-600/20 border border-indigo-400/40 text-indigo-400'
            }`}>
              <Mic className={`w-8 h-8 ${isRecording ? 'animate-pulse' : ''}`} />
            </div>

            <h3 className="text-base font-semibold text-slate-100 mb-1">
              {isRecording ? 'Recording Live Audio...' : 'Record Voice or Audio Stream'}
            </h3>
            
            <p className="text-xs text-slate-400 mb-4">
              {isRecording ? `Timer: ${formatTime(recordingTime)} • Speaking in OPUS format` : 'Click the button below to capture high-clarity voice speech.'}
            </p>

            {isRecording ? (
              <button
                onClick={stopLiveRecording}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-sm bg-white animate-pulse"></span>
                <span>Stop & Transcribe</span>
              </button>
            ) : (
              <button
                onClick={startLiveRecording}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer border border-indigo-400/30"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Try Reference Samples */}
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest">
            Or try with sample OPUS recordings:
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_AUDIOS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onFileSelected(null, sample)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/40 rounded-2xl p-4 text-left transition-all group flex items-start justify-between cursor-pointer backdrop-blur-md shadow-lg"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {sample.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {sample.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                    {sample.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {sample.durationFormatted}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-slate-400" /> {sample.sizeFormatted}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 shrink-0 self-center">
                Try file →
              </span>
            </button>
          ))}
        </div>

        {/* Privacy Note container matching Design HTML */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-200/80 leading-relaxed backdrop-blur-sm">
          <span className="font-bold text-yellow-500 mr-1">PRIVACY NOTE:</span> All OPUS speech processing is handled within a secure sandbox. Audio stream integrity is preserved end-to-end.
        </div>
      </div>
    </div>
  );
};
