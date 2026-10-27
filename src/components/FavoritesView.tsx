import React from 'react';
import { Song, UserProfile } from '../types/choir';
import { SongListView } from './SongListView';
import { Star, ArrowLeft } from 'lucide-react';

interface FavoritesViewProps {
  favoriteSongs: Song[];
  currentUser: UserProfile;
  currentPlayingSongId: string | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPauseSong: () => void;
  onToggleFavorite: (songId: string) => void;
  onOpenDetails: (song: Song, defaultTab?: 'lyrics' | 'sheet') => void;
  onEditSong: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
  onBrowseLibrary: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteSongs,
  currentUser,
  currentPlayingSongId,
  isPlaying,
  onPlaySong,
  onPauseSong,
  onToggleFavorite,
  onOpenDetails,
  onEditSong,
  onDeleteSong,
  onBrowseLibrary,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-neutral-900 fill-neutral-900" />
            <h2 className="font-cinzel text-xl font-bold text-neutral-900">
              Personal Favorites
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Bookmarked practice songs for {currentUser.name}
          </p>
        </div>

        <button
          onClick={onBrowseLibrary}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Library</span>
        </button>
      </div>

      {/* Content */}
      {favoriteSongs.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-neutral-300 bg-white">
          <Star className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-800">No Starred Songs</h3>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
            Click the star next to any song in the library to save it to your personal rehearsal list.
          </p>
          <button
            onClick={onBrowseLibrary}
            className="mt-4 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs cursor-pointer"
          >
            Browse Song Library
          </button>
        </div>
      ) : (
        <SongListView
          songs={favoriteSongs}
          currentUser={currentUser}
          favorites={favoriteSongs.map((s) => s.id)}
          currentPlayingSongId={currentPlayingSongId}
          isPlaying={isPlaying}
          onPlaySong={onPlaySong}
          onPauseSong={onPauseSong}
          onToggleFavorite={onToggleFavorite}
          onOpenDetails={onOpenDetails}
          onEditSong={onEditSong}
          onDeleteSong={onDeleteSong}
        />
      )}
    </div>
  );
};
