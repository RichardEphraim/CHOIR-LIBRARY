import React from 'react';
import { Song, UserProfile } from '../types/choir';
import {
  Play,
  Pause,
  Star,
  FileText,
  Image as ImageIcon,
  Edit3,
  Trash2,
} from 'lucide-react';

interface SongListViewProps {
  songs: Song[];
  currentUser: UserProfile;
  favorites: string[];
  currentPlayingSongId: string | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPauseSong: () => void;
  onToggleFavorite: (songId: string) => void;
  onOpenDetails: (song: Song, defaultTab?: 'lyrics' | 'sheet') => void;
  onEditSong: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
}

export const SongListView: React.FC<SongListViewProps> = ({
  songs,
  currentUser,
  favorites,
  currentPlayingSongId,
  isPlaying,
  onPlaySong,
  onPauseSong,
  onToggleFavorite,
  onOpenDetails,
  onEditSong,
  onDeleteSong,
}) => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
      {/* Desktop Column Header */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
        <div className="col-span-1 text-center">Fav</div>
        <div className="col-span-1 text-center">Audio</div>
        <div className="col-span-4">Song Title & Composer</div>
        <div className="col-span-2">Classification</div>
        <div className="col-span-2">Brought By</div>
        <div className="col-span-2 text-right pr-2">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-neutral-100">
        {songs.map((song) => {
          const isFav = favorites.includes(song.id);
          const isTrackPlaying = isPlaying && currentPlayingSongId === song.id;

          return (
            <div
              key={song.id}
              className="p-3.5 sm:px-4 sm:py-3 hover:bg-neutral-50/80 transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-2.5 md:gap-3"
            >
              {/* Top/Left: Star & Play */}
              <div className="flex items-center justify-between md:contents">
                <div className="flex items-center gap-2 md:contents">
                  {/* Favorite Toggle Star */}
                  <div className="md:col-span-1 flex justify-center">
                    <button
                      onClick={() => onToggleFavorite(song.id)}
                      aria-label={isFav ? `Remove ${song.title} from favorites` : `Add ${song.title} to favorites`}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        isFav
                          ? 'text-neutral-900 hover:text-neutral-700'
                          : 'text-neutral-300 hover:text-neutral-600'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${isFav ? 'fill-neutral-900' : ''}`} />
                    </button>
                  </div>

                  {/* Play Audio Button */}
                  <div className="md:col-span-1 flex justify-center">
                    <button
                      onClick={() => (isTrackPlaying ? onPauseSong() : onPlaySong(song))}
                      aria-label={isTrackPlaying ? 'Pause rehearsal track' : 'Play rehearsal track'}
                      className={`p-2 rounded-full transition-colors cursor-pointer ${
                        isTrackPlaying
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                      }`}
                    >
                      {isTrackPlaying ? (
                        <Pause className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Right: Quick Sheet/Lyrics badge triggers */}
                <div className="flex md:hidden items-center gap-1">
                  {song.lyricSheetImage && (
                    <button
                      onClick={() => onOpenDetails(song, 'sheet')}
                      title="Sheet Music"
                      className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onOpenDetails(song, 'lyrics')}
                    title="Lyrics"
                    className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Title & Composer */}
              <div className="md:col-span-4 min-w-0">
                <button
                  onClick={() => onOpenDetails(song)}
                  className="text-left font-semibold text-sm text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer truncate block w-full"
                >
                  {song.title}
                </button>
                <div className="text-xs text-neutral-500 truncate mt-0.5">
                  {song.composer ? `Composed by ${song.composer}` : 'Chorister Original'}
                  {song.keySignature && (
                    <span className="font-mono-num ml-1.5 text-neutral-400">
                      · {song.keySignature}
                    </span>
                  )}
                </div>
              </div>

              {/* Classification / Origin */}
              <div className="md:col-span-2">
                <span
                  className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
                    song.origin === 'Original'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                  }`}
                >
                  {song.origin === 'Original' ? 'Original' : 'External'}
                </span>
                {song.tags && song.tags[0] && (
                  <span className="ml-1.5 text-xs text-neutral-400">
                    {song.tags[0]}
                  </span>
                )}
              </div>

              {/* Brought By & Date */}
              <div className="md:col-span-2 text-xs text-neutral-600">
                <div className="font-medium text-neutral-800 truncate flex items-center gap-1">
                  <span className="text-neutral-400">By</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {song.broughtByName
                      ? `@${song.broughtByName.replace(/^@/, '')}`
                      : song.broughtBy.startsWith('@')
                      ? song.broughtBy
                      : song.broughtBy}
                  </span>
                </div>
                <div className="text-[11px] font-mono-num text-neutral-400">
                  {song.dateBrought}
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex md:col-span-2 items-center justify-end gap-1">
                {song.lyricSheetImage && (
                  <button
                    onClick={() => onOpenDetails(song, 'sheet')}
                    title="View Scanned Sheet Music"
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => onOpenDetails(song, 'lyrics')}
                  title="Read Lyrics"
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                </button>

                {(currentUser.role === 'ADMIN' || currentUser.role === 'admin' || song.uploadedByUserId === currentUser.id) && (
                  <>
                    <button
                      onClick={() => onEditSong(song)}
                      title="Edit Song"
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {(currentUser.role === 'ADMIN' || currentUser.role === 'admin') && (
                      <button
                        onClick={() => onDeleteSong(song.id)}
                        title="Delete Song"
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
