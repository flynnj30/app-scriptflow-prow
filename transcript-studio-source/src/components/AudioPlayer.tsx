import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Gauge
} from 'lucide-react';
import { formatTime } from '../utils/audioUtils';

interface AudioPlayerProps {
  audioBlobUrl?: string;
  durationSeconds: number;
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  volume?: number;
  onVolumeChange?: (vol: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  durationSeconds,
  currentTime,
  isPlaying,
  onPlayPause,
  onSeek,
  playbackSpeed,
  onSpeedChange,
  volume = 1,
  onVolumeChange
}) => {
  const [localVolume, setLocalVolume] = useState(volume);
  const [isMuted, setIsMuted] = useState(false);
  const [hoverSeekPercent, setHoverSeekPercent] = useState<number | null>(null);
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

  const handleSkip = (deltaSeconds: number) => {
    const target = Math.max(0, Math.min(durationSeconds, currentTime + deltaSeconds));
    onSeek(target);
  };

  const handleCycleSpeed = () => {
    const currentIndex = SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % SPEEDS.length;
    onSpeedChange(SPEEDS[nextIndex]);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || durationSeconds <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = clickX / rect.width;
    onSeek(percent * durationSeconds);
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setHoverSeekPercent(clickX / rect.width);
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange?.(localVolume || 1);
    } else {
      setIsMuted(true);
      onVolumeChange?.(0);
    }
  };

  const handleVolumeSlider = (val: number) => {
    setLocalVolume(val);
    if (isMuted) setIsMuted(false);
    onVolumeChange?.(val);
  };

  const currentPercent = durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0;

  return (
    <div className="w-full bg-slate-900/80 border-t border-white/10 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center gap-4 z-30 shadow-2xl backdrop-blur-md">
      {/* Left playback buttons */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* -15s */}
        <button
          onClick={() => handleSkip(-15)}
          className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-colors focus:outline-none cursor-pointer backdrop-blur-sm"
          title="Rewind 15 seconds"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-indigo-300 font-mono">15</span>
        </button>

        {/* Play/Pause Main Circular Button */}
        <button
          onClick={onPlayPause}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/40 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all focus:outline-none cursor-pointer shrink-0"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* +15s */}
        <button
          onClick={() => handleSkip(15)}
          className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-colors focus:outline-none cursor-pointer backdrop-blur-sm"
          title="Forward 15 seconds"
        >
          <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-indigo-300 font-mono">15</span>
        </button>
      </div>

      {/* Center Seekbar & Times */}
      <div className="flex-1 w-full flex items-center gap-3">
        {/* Current Time */}
        <span className="text-xs font-mono font-bold text-slate-100 w-11 text-right shrink-0 select-none">
          {formatTime(currentTime)}
        </span>

        {/* Progress Bar Container */}
        <div 
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          onMouseMove={handleProgressBarMouseMove}
          onMouseLeave={() => setHoverSeekPercent(null)}
          className="relative flex-1 h-6 flex items-center cursor-pointer group"
        >
          {/* Background track */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
            {/* Hover ghost bar */}
            {hoverSeekPercent !== null && (
              <div 
                className="absolute top-0 bottom-0 left-0 bg-indigo-500/30 rounded-full pointer-events-none"
                style={{ width: `${hoverSeekPercent * 100}%` }}
              />
            )}
            {/* Active filled bar */}
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-[width] duration-75"
              style={{ width: `${currentPercent}%` }}
            />
          </div>

          {/* Draggable handle */}
          <div 
            className="absolute w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full shadow-md -translate-x-1/2 opacity-90 group-hover:opacity-100 group-hover:scale-125 transition-transform pointer-events-none"
            style={{ left: `${currentPercent}%` }}
          />

          {/* Hover Time Tooltip */}
          {hoverSeekPercent !== null && (
            <div 
              className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900/90 border border-white/15 text-[10px] font-mono text-slate-200 pointer-events-none shadow-md backdrop-blur-sm"
              style={{ left: `${hoverSeekPercent * 100}%` }}
            >
              {formatTime(hoverSeekPercent * durationSeconds)}
            </div>
          )}
        </div>

        {/* Total Duration */}
        <span className="text-xs font-mono font-medium text-slate-400 w-11 shrink-0 select-none">
          {formatTime(durationSeconds)}
        </span>
      </div>

      {/* Right controls: Volume & Speed */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mute / Volume */}
        <div className="flex items-center gap-1.5 group">
          <button
            onClick={handleVolumeToggle}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || localVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : localVolume}
            onChange={(e) => handleVolumeSlider(parseFloat(e.target.value))}
            className="w-16 h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Speed toggle */}
        <button
          onClick={handleCycleSpeed}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer backdrop-blur-sm"
          title="Playback speed"
        >
          <span>{playbackSpeed.toFixed(1)}x</span>
        </button>
      </div>
    </div>
  );
};
