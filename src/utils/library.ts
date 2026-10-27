import { Song, FavoriteRecord, SearchFilterState, SongOrigin, SongCategory } from '../types/choir';

/**
 * Strict Tenant Isolation: Filters all songs to ensure zero data overlap between churches.
 */
export function filterSongsByChurch(songs: Song[], churchId: string): Song[] {
  if (!churchId) return [];
  return songs.filter((s) => s.churchId === churchId);
}

/**
 * Advanced Multi-Facet Filter & Fuzzy Search for Choir Song Libraries.
 */
export function filterAndSortSongs(
  songs: Song[],
  filters: SearchFilterState
): Song[] {
  const query = filters.searchQuery.trim().toLowerCase();

  const filtered = songs.filter((song) => {
    // 1. Text Search across Title, Composer, BroughtBy, and Lyrics
    if (query) {
      const matchTitle = song.title.toLowerCase().includes(query);
      const matchComposer = song.composer.toLowerCase().includes(query);
      const matchBroughtBy = song.broughtBy.toLowerCase().includes(query);
      const matchLyrics = song.lyrics ? song.lyrics.toLowerCase().includes(query) : false;
      const matchTags = song.tags.some((t) => t.toLowerCase().includes(query));

      if (!matchTitle && !matchComposer && !matchBroughtBy && !matchLyrics && !matchTags) {
        return false;
      }
    }

    // 2. Origin Filter (Original vs External)
    if (filters.origin !== 'all' && song.origin !== filters.origin) {
      return false;
    }

    // 3. Category / Tag Filter
    if (filters.tag !== 'all' && !song.tags.includes(filters.tag as SongCategory)) {
      return false;
    }

    // 4. Brought By Filter
    if (filters.broughtBy !== 'all' && song.broughtBy.toLowerCase() !== filters.broughtBy.toLowerCase()) {
      return false;
    }

    // 5. Composer Filter
    if (filters.composer !== 'all' && song.composer.toLowerCase() !== filters.composer.toLowerCase()) {
      return false;
    }

    // 6. Year Brought Filter
    if (filters.yearBrought !== 'all') {
      const songYear = song.dateBrought ? song.dateBrought.slice(0, 4) : '';
      if (songYear !== filters.yearBrought) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  return [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'dateBrought-desc':
        return (b.dateBrought || '').localeCompare(a.dateBrought || '');
      case 'dateBrought-asc':
        return (a.dateBrought || '').localeCompare(b.dateBrought || '');
      case 'title-asc':
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      case 'title-desc':
        return b.title.localeCompare(a.title, undefined, { sensitivity: 'base' });
      default:
        return 0;
    }
  });
}

/**
 * Checks if a song is favorited by the current user within their church tenant.
 */
export function isSongFavorite(
  favorites: FavoriteRecord[],
  userId: string,
  churchId: string,
  songId: string
): boolean {
  return favorites.some(
    (f) => f.userId === userId && f.churchId === churchId && f.songId === songId
  );
}

/**
 * Toggles a user's favorite song within the tenant boundary.
 */
export function toggleFavoriteRecord(
  favorites: FavoriteRecord[],
  userId: string,
  churchId: string,
  songId: string
): FavoriteRecord[] {
  const exists = isSongFavorite(favorites, userId, churchId, songId);
  if (exists) {
    return favorites.filter(
      (f) => !(f.userId === userId && f.churchId === churchId && f.songId === songId)
    );
  } else {
    return [
      ...favorites,
      {
        userId,
        churchId,
        songId,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

/**
 * Extracts unique available filter options from the current song library.
 */
export function extractFilterFacets(songs: Song[]) {
  const broughtBySet = new Set<string>();
  const composerSet = new Set<string>();
  const yearSet = new Set<string>();
  const tagsSet = new Set<SongCategory>();

  songs.forEach((s) => {
    if (s.broughtBy) broughtBySet.add(s.broughtBy);
    if (s.composer) composerSet.add(s.composer);
    if (s.dateBrought && s.dateBrought.length >= 4) {
      yearSet.add(s.dateBrought.slice(0, 4));
    }
    s.tags.forEach((t) => tagsSet.add(t));
  });

  return {
    broughtByOptions: Array.from(broughtBySet).sort(),
    composerOptions: Array.from(composerSet).sort(),
    yearOptions: Array.from(yearSet).sort((a, b) => b.localeCompare(a)),
    tagOptions: Array.from(tagsSet).sort(),
  };
}

export interface SongValidationErrors {
  title?: string;
  broughtBy?: string;
  dateBrought?: string;
  origin?: string;
  lyricsOrSheet?: string;
}

/**
 * Validates a song submission for required fields and logical constraints.
 */
export function validateSongPayload(song: Partial<Song>): {
  isValid: boolean;
  errors: SongValidationErrors;
} {
  const errors: SongValidationErrors = {};

  if (!song.title || !song.title.trim()) {
    errors.title = 'Song title is required.';
  } else if (song.title.trim().length < 2) {
    errors.title = 'Song title must be at least 2 characters.';
  }

  if (!song.broughtBy || !song.broughtBy.trim()) {
    errors.broughtBy = 'Please state who introduced this song to the choir.';
  }

  if (!song.dateBrought) {
    errors.dateBrought = 'Date brought is required.';
  }

  if (!song.origin || !['Original', 'External'].includes(song.origin)) {
    errors.origin = 'Classification must be either Original or External.';
  }

  const hasTypedLyrics = Boolean(song.lyrics && song.lyrics.trim().length > 0);
  const hasSheetImage = Boolean(song.lyricSheetImage && song.lyricSheetImage.trim().length > 0);

  if (!hasTypedLyrics && !hasSheetImage) {
    errors.lyricsOrSheet = 'Please provide either typed lyrics or an uploaded sheet music scan.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
