import React from 'react';
import { Song } from '../types/choir';
import { Play, Pause, X, RotateCcw, FastForward } from 'lucide-react';

interface PersistentAudioPlayerProps {
  song: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSpeedChange: (speed: number) => void;
  onClose: () => void;
  onOpenDetails: (song: Song) => void;
}

export const PersistentAudioPlayer: React.FC<PersistentAudioPlayerProps> = ({
  song,
  isPlaying,
  currentTime,
  duration,
  speed,
  onTogglePlay,
  onSeek,
  onSpeedChange,
  onClose,
  onOpenDetails,
}) => {
  if (!song) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      role="region"
      aria-label="Rehearsal audio player"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-md shadow-lg p-3 sm:px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-6">
        {/* Left: Song Info */}
        <div className="flex items-center gap-2.5 w-full sm:w-1/3 min-w-0">
          <button
            onClick={() => onOpenDetails(song)}
            className="text-left min-w-0 group cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-xs sm:text-sm text-neutral-900 truncate group-hover:text-neutral-600 transition-colors">
                {song.title}
              </h4>
              {song.keySignature && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 font-medium shrink-0 font-mono-num">
                  {song.keySignature}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 truncate">
              {song.composer || song.broughtBy}
            </p>
          </button>
        </div>

        {/* Center: Playback Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1 w-full sm:w-1/2">
          {/* Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSeek(Math.max(0, currentTime - 10))}
              title="Rewind 10s"
              aria-label="Rewind 10 seconds"
              className="p-1 text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause rehearsal track' : 'Play rehearsal track'}
              className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => onSeek(Math.min(duration, currentTime + 10))}
              title="Forward 10s"
              aria-label="Forward 10 seconds"
              className="p-1 text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              <FastForward className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Time & Progress bar */}
          <div className="flex items-center gap-2 w-full text-[11px] font-mono-num text-neutral-500">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="flex-1 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Rehearsal Speed & Close */}
        <div className="flex items-center justify-end gap-2.5 w-full sm:w-1/3">
          {/* Rehearsal Speed Selector */}
          <div className="flex items-center gap-0.5 bg-neutral-100 border border-neutral-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onSpeedChange(0.75)}
              className={`px-2 py-0.5 rounded font-mono-num text-[11px] cursor-pointer ${speed === 0.75 ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:text-neutral-900'}`}
              title="Slow tempo"
            >
              0.75x
            </button>
            <button
              onClick={() => onSpeedChange(1.0)}
              className={`px-2 py-0.5 rounded font-mono-num text-[11px] cursor-pointer ${speed === 1.0 ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:text-neutral-900'}`}
              title="Standard tempo"
            >
              1.0x
            </button>
            <button
              onClick={() => onSpeedChange(1.25)}
              className={`px-2 py-0.5 rounded font-mono-num text-[11px] cursor-pointer ${speed === 1.25 ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:text-neutral-900'}`}
              title="Brisk tempo"
            >
              1.25x
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="Close audio player"
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
