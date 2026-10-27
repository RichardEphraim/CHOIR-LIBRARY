import React from 'react';
import { ChurchTenant, UserProfile } from '../types/choir';
import { Plus } from 'lucide-react';

interface ChurchSubheaderProps {
  currentChurch: ChurchTenant;
  currentUser: UserProfile;
  totalSongs: number;
  originalSongsCount: number;
  externalSongsCount: number;
  onAddNewSong: () => void;
}

export const ChurchSubheader: React.FC<ChurchSubheaderProps> = ({
  currentChurch,
  currentUser,
  totalSongs,
  originalSongsCount,
  externalSongsCount,
  onAddNewSong,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-b border-neutral-200">
      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>{currentChurch.city}</span>
          <span aria-hidden="true">·</span>
          <span>{currentChurch.denomination}</span>
        </div>
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">
          {currentChurch.name}
        </h1>
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono-num mt-1">
          <span>{totalSongs} songs in library</span>
          <span aria-hidden="true">·</span>
          <span>{originalSongsCount} originals</span>
          <span aria-hidden="true">·</span>
          <span>{externalSongsCount} external</span>
        </div>
      </div>

      {/* Universal Song Upload: Available to both Admins and approved Members */}
      <button
        onClick={onAddNewSong}
        className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
        title="Add or contribute a song to the choir library"
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        <span>Add Song</span>
      </button>
    </div>
  );
};
