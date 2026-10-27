export type UserRole = 'ADMIN' | 'MEMBER' | 'admin' | 'member';

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type VoicePart = 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Director';

export type SongOrigin = 'Original' | 'External';

export type SongCategory =
  | 'Hymn'
  | 'Praise'
  | 'Worship'
  | 'Special Number'
  | 'Anthem'
  | 'Offertory'
  | 'Benediction';

export interface ChurchTenant {
  id: string;
  name: string;
  roomCode: string; // Unique uppercase room code e.g. "GC-8492"
  city: string;
  denomination: string;
  logoUrl?: string;
  memberCount: number;
  choirMasterName: string;
  motto: string;
  inviteCode?: string;
  accentColor?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  fullName?: string;
  username: string; // Unique per church room
  email: string;
  role: UserRole;
  status: UserStatus;
  voicePart: VoicePart;
  churchId: string;
  createdAt?: string;
}

export interface Song {
  id: string;
  churchId: string; // Tenant Scoping: Mandatory for multi-tenancy isolation
  uploadedByUserId?: string; // ID of the chorister who uploaded it
  broughtByName?: string; // Displayed username tag e.g. @soprano_emma
  title: string;
  broughtBy: string; // Chorister display name or username
  dateBrought: string; // YYYY-MM-DD
  origin: SongOrigin; // Original (composed by choristers) vs External
  composer: string; // Author or composer
  lyrics: string; // Formatted typed lyrics
  lyricSheetImage?: string; // Scanned score / handwritten manuscript URL
  audioUrl?: string; // Audio rehearsal track (mp3, wav, m4a, etc)
  audioDuration?: number; // Seconds
  tags: SongCategory[];
  keySignature?: string; // e.g. "D Major", "Bb", "F#"
  tempoBpm?: number;
  notes?: string; // Performance notes (tempo, repeat, choir cues)
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteRecord {
  userId: string;
  churchId: string;
  songId: string;
  createdAt: string;
}

export interface RepertoireSetlist {
  id: string;
  churchId: string;
  title: string;
  serviceDate: string;
  serviceType: string; // e.g. 'Sunday Morning Liturgy', 'Midweek Rehearsal'
  songIds: string[];
  notes?: string;
}

export interface SearchFilterState {
  searchQuery: string;
  origin: 'all' | 'Original' | 'External';
  tag: string; // 'all' or specific category
  broughtBy: string; // 'all' or chorister name
  composer: string; // 'all' or composer name
  yearBrought: string; // 'all' or specific year (e.g. '2024')
  sortBy: 'dateBrought-desc' | 'dateBrought-asc' | 'title-asc' | 'title-desc';
}
