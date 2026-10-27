import React, { useState, useEffect } from 'react';
import { Song, UserProfile } from '../types/choir';
import {
  X,
  Play,
  Pause,
  Star,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Edit3,
} from 'lucide-react';

interface SongDetailModalProps {
  song: Song | null;
  isOpen: boolean;
  initialTab?: 'lyrics' | 'sheet';
  currentUser: UserProfile;
  isFavorite: boolean;
  isPlaying: boolean;
  onClose: () => void;
  onPlaySong: (song: Song) => void;
  onPauseSong: () => void;
  onToggleFavorite: (songId: string) => void;
  onEditSong: (song: Song) => void;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({
  song,
  isOpen,
  initialTab = 'lyrics',
  currentUser,
  isFavorite,
  isPlaying,
  onClose,
  onPlaySong,
  onPauseSong,
  onToggleFavorite,
  onEditSong,
}) => {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'sheet'>(initialTab);
  const [lyricsFontSize, setLyricsFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, song?.id]);

  if (!isOpen || !song) return null;

  const handleCopyLyrics = () => {
    if (song.lyrics) {
      navigator.clipboard.writeText(song.lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="song-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-neutral-200 bg-neutral-50/50 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                  song.origin === 'Original'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-200 text-neutral-800'
                }`}
              >
                {song.origin === 'Original' ? 'Original Composition' : 'External Hymn'}
              </span>
              {song.tags.map((tag) => (
                <span key={tag} className="text-xs text-neutral-500 font-medium">
                  · {tag}
                </span>
              ))}
            </div>

            <h2 id="song-detail-title" className="font-cinzel text-xl sm:text-2xl font-bold text-neutral-900">
              {song.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
              <span>{song.composer ? `Composed by ${song.composer}` : 'Chorister Original'}</span>
              <span aria-hidden="true">·</span>
              <span>
                Brought by:{' '}
                <strong className="text-neutral-900 font-mono">
                  {song.broughtByName
                    ? `@${song.broughtByName.replace(/^@/, '')}`
                    : song.broughtBy.startsWith('@')
                    ? song.broughtBy
                    : song.broughtBy}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">{song.dateBrought}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Play/Pause */}
            <button
              onClick={() => (isPlaying ? onPauseSong() : onPlaySong(song))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                  : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play Audio'}</span>
            </button>

            {/* Favorite */}
            <button
              onClick={() => onToggleFavorite(song.id)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-neutral-900 text-neutral-900' : 'text-neutral-400'}`} />
            </button>

            {/* Admin Edit */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  onClose();
                  onEditSong(song);
                }}
                title="Edit Song"
                className="p-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Tabs Bar: Typed Lyrics vs Scanned Sheet */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 sm:px-6 py-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'lyrics'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Typed Lyrics</span>
            </button>

            <button
              onClick={() => setActiveTab('sheet')}
              disabled={!song.lyricSheetImage}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'sheet'
                  ? 'bg-neutral-900 text-white'
                  : song.lyricSheetImage
                  ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer'
                  : 'text-neutral-400 cursor-not-allowed opacity-40'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Scanned Sheet Music</span>
            </button>
          </div>

          {/* Sub-controls depending on active tab */}
          {activeTab === 'lyrics' ? (
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 hidden sm:inline">Text Size:</span>
              <div className="flex items-center bg-neutral-100 rounded-md p-0.5 border border-neutral-200">
                <button
                  onClick={() => setLyricsFontSize('normal')}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${lyricsFontSize === 'normal' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600'}`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setLyricsFontSize('large')}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${lyricsFontSize === 'large' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600'}`}
                >
                  Large
                </button>
                <button
                  onClick={() => setLyricsFontSize('huge')}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${lyricsFontSize === 'huge' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600'}`}
                >
                  Pulpit XL
                </button>
              </div>

              <button
                onClick={handleCopyLyrics}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-neutral-900" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                title="Zoom Out"
                className="p-1 text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="font-mono-num text-[11px] text-neutral-600 w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(250, z + 25))}
                title="Zoom In"
                className="p-1 text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content View Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-neutral-50/50">
          {activeTab === 'lyrics' ? (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Musical Cues Pill Strip */}
              {(song.keySignature || song.tempoBpm || song.notes) && (
                <div className="p-3 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-700 space-y-1">
                  <div className="flex items-center gap-4 flex-wrap font-mono-num">
                    {song.keySignature && (
                      <div>
                        <span className="text-neutral-400">Key:</span> <strong>{song.keySignature}</strong>
                      </div>
                    )}
                    {song.tempoBpm && (
                      <div>
                        <span className="text-neutral-400">Tempo:</span> <strong>{song.tempoBpm} BPM</strong>
                      </div>
                    )}
                  </div>
                  {song.notes && (
                    <div className="pt-1 text-neutral-500 text-xs italic border-t border-neutral-100">
                      Notes: {song.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Formatted Stanzas */}
              <div
                className={`leading-relaxed whitespace-pre-wrap select-text text-neutral-800 font-sans ${
                  lyricsFontSize === 'normal'
                    ? 'text-base'
                    : lyricsFontSize === 'large'
                    ? 'text-lg font-medium'
                    : 'text-xl font-medium leading-loose'
                }`}
              >
                {song.lyrics || (
                  <p className="text-sm text-neutral-400 italic">
                    No typed lyrics available. Please view the Scanned Sheet Music tab.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Scanned Sheet Music Lightbox */
            <div className="flex flex-col items-center justify-center min-h-[350px] overflow-auto">
              {song.lyricSheetImage ? (
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="transition-transform duration-150 inline-block shadow-md rounded-lg overflow-hidden border border-neutral-200 bg-white"
                >
                  <img
                    src={song.lyricSheetImage}
                    alt={`${song.title} sheet music`}
                    referrerPolicy="no-referrer"
                    className="max-w-full h-auto object-contain"
                  />
                </div>
              ) : (
                <div className="text-center p-12 text-neutral-400 text-sm">
                  No scanned sheet music has been uploaded for this song.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
