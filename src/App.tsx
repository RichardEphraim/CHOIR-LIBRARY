import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChurchTenant,
  UserProfile,
  UserRole,
  Song,
  FavoriteRecord,
  SearchFilterState,
  VoicePart,
} from './types/choir';
import {
  AuthUser,
  SignUpPayload,
  LoginPayload,
  OnboardingType,
} from './types/auth';
import {
  INITIAL_TENANTS,
  INITIAL_USERS,
  INITIAL_SONGS,
} from './data/seedData';
import {
  filterSongsByChurch,
  filterAndSortSongs,
  toggleFavoriteRecord,
  extractFilterFacets,
} from './utils/library';
import { SyntheticRehearsalPlayer } from './utils/audioEngine';
import { AuthApi } from './services/authApi';

// Auth Components
import { LandingPage } from './components/auth/LandingPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpStatusPage } from './components/auth/SignUpStatusPage';
import { PendingApprovalPage } from './components/auth/PendingApprovalPage';

// Repertoire Hub Components
import { Header } from './components/Header';
import { ChurchSubheader } from './components/ChurchSubheader';
import { SongFilterBar } from './components/SongFilterBar';
import { SongListView } from './components/SongListView';
import { SongDetailModal } from './components/SongDetailModal';
import { SongUploadModal } from './components/SongUploadModal';
import { PersistentAudioPlayer } from './components/PersistentAudioPlayer';
import { TenantSwitcherModal } from './components/TenantSwitcherModal';
import { FavoritesView } from './components/FavoritesView';
import { MemberManagementView } from './components/admin/MemberManagementView';

export default function App() {
  // --- AUTHENTICATION & ROUTE STATE ---
  const [currentRoute, setCurrentRoute] = useState<
    'landing' | 'signup' | 'login' | 'signup-status' | 'pending-approval' | 'dashboard'
  >(() => {
    const session = AuthApi.getCurrentSession();
    if (!session) return 'landing';
    if (session.status === 'PENDING') return 'pending-approval';
    return 'dashboard';
  });

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    return AuthApi.getCurrentSession();
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [memberRefreshKey, setMemberRefreshKey] = useState(0);

  // --- MULTI-TENANT ORGANIZATIONS & REPERTOIRE STATE ---
  const [tenants, setTenants] = useState<ChurchTenant[]>(() => {
    const saved = localStorage.getItem('cantoria_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [currentChurchId, setCurrentChurchId] = useState<string>(() => {
    const session = AuthApi.getCurrentSession();
    if (session?.churchId) return session.churchId;
    return localStorage.getItem('cantoria_current_church') || 'grace-cathedral';
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('cantoria_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('cantoria_songs');
    return saved ? JSON.parse(saved) : INITIAL_SONGS;
  });

  const [favorites, setFavorites] = useState<FavoriteRecord[]>(() => {
    const saved = localStorage.getItem('cantoria_favorites');
    return saved ? JSON.parse(saved) : [
      {
        userId: 'user-admin-grace',
        churchId: 'grace-cathedral',
        songId: 'gc-song-1',
        createdAt: '2024-01-01',
      },
      {
        userId: 'user-admin-grace',
        churchId: 'grace-cathedral',
        songId: 'gc-song-2',
        createdAt: '2024-01-01',
      },
    ];
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('cantoria_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('cantoria_current_church', currentChurchId);
  }, [currentChurchId]);

  useEffect(() => {
    localStorage.setItem('cantoria_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cantoria_songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('cantoria_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Current Church Organization
  const currentChurch = useMemo(() => {
    return tenants.find((t) => t.id === currentChurchId) || tenants[0];
  }, [tenants, currentChurchId]);

  // Current Active User Profile with username and approval status
  const currentUser: UserProfile = useMemo(() => {
    if (authUser) {
      return {
        id: authUser.id,
        name: authUser.name,
        fullName: authUser.fullName || authUser.name,
        username: authUser.username || authUser.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        email: authUser.email,
        role: authUser.role,
        status: authUser.status || 'APPROVED',
        voicePart: authUser.voicePart || 'Soprano',
        churchId: authUser.churchId || currentChurchId,
      };
    }

    const found = users.find((u) => u.churchId === currentChurchId);
    if (found) return found;

    return {
      id: `user-${currentChurchId}`,
      name: currentChurch.choirMasterName,
      fullName: currentChurch.choirMasterName,
      username: 'choirmaster',
      email: `director@${currentChurch.id}.org`,
      role: 'ADMIN',
      status: 'APPROVED',
      voicePart: 'Director',
      churchId: currentChurchId,
    };
  }, [authUser, users, currentChurchId, currentChurch]);

  // Pending member requests count for current church
  const pendingRequests = useMemo(() => {
    const { pending } = AuthApi.getChurchMembers(currentChurchId);
    return pending;
  }, [currentChurchId, memberRefreshKey]);

  // Navigation tab inside dashboard: 'library' | 'favorites' | 'members'
  const [activeTab, setActiveTab] = useState<'library' | 'favorites' | 'members'>('library');

  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: '',
    origin: 'all',
    tag: 'all',
    broughtBy: 'all',
    composer: 'all',
    yearBrought: 'all',
    sortBy: 'dateBrought-desc',
  });

  // --- STRICT TENANT ISOLATION OF REPERTOIRE ---
  const churchSongs = useMemo(() => {
    return filterSongsByChurch(songs, currentChurchId);
  }, [songs, currentChurchId]);

  const filterFacets = useMemo(() => {
    return extractFilterFacets(churchSongs);
  }, [churchSongs]);

  const displayedSongs = useMemo(() => {
    return filterAndSortSongs(churchSongs, filters);
  }, [churchSongs, filters]);

  const userFavoritesList = useMemo(() => {
    const favSongIds = favorites
      .filter((f) => f.userId === currentUser.id && f.churchId === currentChurchId)
      .map((f) => f.songId);
    return churchSongs.filter((s) => favSongIds.includes(s.id));
  }, [favorites, currentUser.id, currentChurchId, churchSongs]);

  const userFavoriteSongIds = useMemo(() => {
    return favorites
      .filter((f) => f.userId === currentUser.id && f.churchId === currentChurchId)
      .map((f) => f.songId);
  }, [favorites, currentUser.id, currentChurchId]);

  const originalCount = useMemo(() => {
    return churchSongs.filter((s) => s.origin === 'Original').length;
  }, [churchSongs]);

  const externalCount = useMemo(() => {
    return churchSongs.filter((s) => s.origin === 'External').length;
  }, [churchSongs]);

  // --- MODALS STATE ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);
  const [isTenantSwitcherOpen, setIsTenantSwitcherOpen] = useState(false);
  const [selectedSongDetails, setSelectedSongDetails] = useState<Song | null>(null);
  const [detailsInitialTab, setDetailsInitialTab] = useState<'lyrics' | 'sheet'>('lyrics');

  // --- AUDIO REHEARSAL PLAYBACK ENGINE ---
  const [currentPlayingSong, setCurrentPlayingSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackCurrentTime, setPlaybackCurrentTime] = useState<number>(0);
  const [playbackDuration, setPlaybackDuration] = useState<number>(180);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const realAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthPlayerRef = useRef<SyntheticRehearsalPlayer | null>(null);

  useEffect(() => {
    return () => {
      if (synthPlayerRef.current) {
        synthPlayerRef.current.stop();
      }
      if (realAudioRef.current) {
        realAudioRef.current.pause();
      }
    };
  }, []);

  const handlePlaySong = (song: Song) => {
    if (currentPlayingSong?.id === song.id) {
      if (realAudioRef.current && song.audioUrl) {
        realAudioRef.current.playbackRate = playbackSpeed;
        realAudioRef.current.play();
      } else if (synthPlayerRef.current) {
        synthPlayerRef.current.start();
      }
      setIsPlaying(true);
      return;
    }

    if (realAudioRef.current) {
      realAudioRef.current.pause();
      realAudioRef.current = null;
    }
    if (synthPlayerRef.current) {
      synthPlayerRef.current.stop();
      synthPlayerRef.current = null;
    }

    setCurrentPlayingSong(song);
    setPlaybackCurrentTime(0);
    setPlaybackDuration(song.audioDuration || 180);
    setIsPlaying(true);

    if (
      song.audioUrl &&
      (song.audioUrl.startsWith('data:') ||
        song.audioUrl.startsWith('blob:') ||
        song.audioUrl.startsWith('http'))
    ) {
      const audio = new Audio(song.audioUrl);
      audio.playbackRate = playbackSpeed;
      audio.ontimeupdate = () => {
        setPlaybackCurrentTime(audio.currentTime);
      };
      audio.onloadedmetadata = () => {
        setPlaybackDuration(audio.duration || song.audioDuration || 180);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setPlaybackCurrentTime(0);
      };
      audio.play().catch(() => {
        startSynthPlayback(song);
      });
      realAudioRef.current = audio;
    } else {
      startSynthPlayback(song);
    }
  };

  const startSynthPlayback = (song: Song) => {
    const synth = new SyntheticRehearsalPlayer(
      song.keySignature || 'G Major',
      song.tempoBpm || 84,
      song.audioDuration || 180
    );
    synth.setPlaybackRate(playbackSpeed);
    synth.setCallbacks(
      (currentTime) => setPlaybackCurrentTime(currentTime),
      () => {
        setIsPlaying(false);
        setPlaybackCurrentTime(0);
      }
    );
    synth.start();
    synthPlayerRef.current = synth;
  };

  const handlePauseSong = () => {
    if (realAudioRef.current) {
      realAudioRef.current.pause();
    }
    if (synthPlayerRef.current) {
      synthPlayerRef.current.stop();
    }
    setIsPlaying(false);
  };

  const handleSeek = (seconds: number) => {
    setPlaybackCurrentTime(seconds);
    if (realAudioRef.current) {
      realAudioRef.current.currentTime = seconds;
    }
    if (synthPlayerRef.current) {
      synthPlayerRef.current.seek(seconds);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (realAudioRef.current) {
      realAudioRef.current.playbackRate = speed;
    }
    if (synthPlayerRef.current) {
      synthPlayerRef.current.setPlaybackRate(speed);
    }
  };

  const handleClosePlayer = () => {
    handlePauseSong();
    setCurrentPlayingSong(null);
  };

  // --- FAVORITE ACTION ---
  const handleToggleFavorite = (songId: string) => {
    setFavorites((prev) =>
      toggleFavoriteRecord(prev, currentUser.id, currentChurchId, songId)
    );
  };

  // --- SONG CRUD (CHOIRMASTER ADMIN) ---
  const handleSaveSong = (
    songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    if (songData.id) {
      setSongs((prev) =>
        prev.map((s) =>
          s.id === songData.id
            ? {
                ...s,
                ...songData,
                updatedAt: now,
              }
            : s
        )
      );
    } else {
      const newSong: Song = {
        ...songData,
        id: `song-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };
      setSongs((prev) => [newSong, ...prev]);
    }
    setSongToEdit(null);
  };

  const handleDeleteSong = (songId: string) => {
    if (window.confirm('Remove this song from the choir repertoire?')) {
      if (currentPlayingSong?.id === songId) {
        handleClosePlayer();
      }
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      setFavorites((prev) => prev.filter((f) => f.songId !== songId));
    }
  };

  // --- TENANT REGISTRATION HELPER ---
  const handleRegisterTenant = (
    newTenantData: Omit<ChurchTenant, 'id' | 'memberCount'>
  ) => {
    const newId =
      newTenantData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
      '-' +
      Date.now().toString().slice(-4);
    const newTenant: ChurchTenant = {
      ...newTenantData,
      id: newId,
      memberCount: 1,
    };
    setTenants((prev) => [...prev, newTenant]);
    setCurrentChurchId(newId);

    const newAdmin: UserProfile = {
      id: `user-${newId}-admin`,
      name: newTenant.choirMasterName,
      fullName: newTenant.choirMasterName,
      username: newTenant.choirMasterName.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 15) || 'admin',
      email: `director@${newId}.org`,
      role: 'ADMIN',
      status: 'APPROVED',
      voicePart: 'Director',
      churchId: newId,
    };
    setUsers((prev) => [...prev, newAdmin]);
  };

  const handleOpenSongDetails = (song: Song, defaultTab: 'lyrics' | 'sheet' = 'lyrics') => {
    setSelectedSongDetails(song);
    setDetailsInitialTab(defaultTab);
  };

  // --- AUTHENTICATION HANDLERS ---
  const handleSignUpSubmit = async (payload: SignUpPayload) => {
    setAuthLoading(true);
    const res = await AuthApi.signup(payload, tenants, (newTenant) => {
      setTenants((prev) => [...prev, newTenant]);
    });
    setAuthLoading(false);

    if (res.success && res.user) {
      setAuthUser(res.user);
      setCurrentChurchId(res.user.churchId);
      if (res.user.status === 'PENDING') {
        setCurrentRoute('pending-approval');
      } else {
        setCurrentRoute('signup-status');
      }
    } else {
      alert(res.message || 'Registration failed.');
    }
  };

  const handleLoginSubmit = async (payload: LoginPayload) => {
    setAuthLoading(true);
    const res = await AuthApi.login(payload, tenants);
    setAuthLoading(false);

    if (res.success && res.user) {
      setAuthUser(res.user);
      setCurrentChurchId(res.user.churchId);
      if (res.user.status === 'PENDING') {
        setCurrentRoute('pending-approval');
      } else {
        setCurrentRoute('dashboard');
      }
    } else {
      alert(res.message || 'Login failed.');
    }
  };

  const handleSocialAuth = async (
    provider: 'google' | 'apple',
    churchData: {
      roleType?: 'ADMIN' | 'MEMBER';
      username?: string;
      churchName?: string;
      roomCode?: string;
      onboardingType?: OnboardingType;
      newChurchName?: string;
      newChurchCity?: string;
      newChurchDenomination?: string;
      existingChurchId?: string;
      inviteCode?: string;
      voicePart?: VoicePart;
    }
  ) => {
    setAuthLoading(true);
    const res = await AuthApi.socialAuth(
      {
        provider,
        email: provider === 'apple' ? 'chorister@icloud.com' : 'chorister@gmail.com',
        name: provider === 'apple' ? 'Apple Chorister' : 'Google Chorister',
        roleType: churchData.roleType || 'MEMBER',
        ...churchData,
      },
      tenants,
      (newTenant) => {
        setTenants((prev) => [...prev, newTenant]);
      }
    );
    setAuthLoading(false);

    if (res.success && res.user) {
      setAuthUser(res.user);
      setCurrentChurchId(res.user.churchId);
      if (res.user.status === 'PENDING') {
        setCurrentRoute('pending-approval');
      } else {
        setCurrentRoute('signup-status');
      }
    } else {
      alert(res.message || 'Social authentication failed.');
    }
  };

  const handleLogout = () => {
    AuthApi.logout();
    setAuthUser(null);
    handleClosePlayer();
    setCurrentRoute('landing');
  };

  // --- RENDER VIEWS ACCORDING TO CURRENT ROUTE ---

  // 1. Landing Page (Public visitor arrival)
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        onGoToSignUp={() => setCurrentRoute('signup')}
        onGoToLogIn={() => setCurrentRoute('login')}
      />
    );
  }

  // 2. Sign Up Page
  if (currentRoute === 'signup') {
    return (
      <SignUpPage
        tenants={tenants}
        isLoading={authLoading}
        onSignUpSubmit={handleSignUpSubmit}
        onSocialAuth={handleSocialAuth}
        onGoToLogIn={() => setCurrentRoute('login')}
        onGoToLanding={() => setCurrentRoute('landing')}
      />
    );
  }

  // 3. Log In Page
  if (currentRoute === 'login') {
    return (
      <LoginPage
        tenants={tenants}
        isLoading={authLoading}
        onLoginSubmit={handleLoginSubmit}
        onSocialAuth={handleSocialAuth}
        onForgotPassword={AuthApi.forgotPassword}
        onGoToSignUp={() => setCurrentRoute('signup')}
        onGoToLanding={() => setCurrentRoute('landing')}
      />
    );
  }

  // 4a. Post-Sign Up Status Screen (Admin Room Number display)
  if (currentRoute === 'signup-status' && authUser) {
    return (
      <SignUpStatusPage
        user={authUser}
        onEnterDashboard={() => setCurrentRoute('dashboard')}
        onGoToLogIn={handleLogout}
      />
    );
  }

  // 4b. Pending Admin Approval Screen (Access Guard Middleware)
  if ((currentRoute === 'pending-approval' || authUser?.status === 'PENDING') && authUser) {
    return (
      <PendingApprovalPage
        user={authUser}
        onStatusApproved={(approvedUser) => {
          setAuthUser(approvedUser);
          setCurrentRoute('dashboard');
        }}
        onGoToLogIn={handleLogout}
      />
    );
  }

  // 5. Protected Dashboard (Repertoire Hub)
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans pb-24">
      {/* Top Header Bar */}
      <Header
        currentChurch={currentChurch}
        currentUser={currentUser}
        activeTab={activeTab}
        favoritesCount={userFavoritesList.length}
        pendingRequestsCount={pendingRequests.length}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenTenantSwitcher={() => setIsTenantSwitcherOpen(true)}
        onToggleUserRole={() => {
          if (authUser) {
            const currentIsAdmin = authUser.role === 'ADMIN' || authUser.role === 'admin';
            const nextRole: UserRole = currentIsAdmin ? 'MEMBER' : 'ADMIN';
            const updated: AuthUser = { ...authUser, role: nextRole };
            setAuthUser(updated);
            AuthApi.saveSession(updated);
          }
        }}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 sm:space-y-5">
        {/* Minimalist Church Subheader */}
        <ChurchSubheader
          currentChurch={currentChurch}
          currentUser={currentUser}
          totalSongs={churchSongs.length}
          originalSongsCount={originalCount}
          externalSongsCount={externalCount}
          onAddNewSong={() => {
            setSongToEdit(null);
            setIsUploadModalOpen(true);
          }}
        />

        {/* Tab 1: Song Library */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <SongFilterBar
              filters={filters}
              facets={filterFacets}
              resultCount={displayedSongs.length}
              totalChurchSongs={churchSongs.length}
              onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
              onResetFilters={() =>
                setFilters({
                  searchQuery: '',
                  origin: 'all',
                  tag: 'all',
                  broughtBy: 'all',
                  composer: 'all',
                  yearBrought: 'all',
                  sortBy: 'dateBrought-desc',
                })
              }
            />

            {/* Scannable Responsive Song List */}
            {displayedSongs.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-xl border border-dashed border-neutral-300 bg-white">
                <p className="text-neutral-500 text-sm">
                  No choir songs match your search or filter.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      origin: 'all',
                      tag: 'all',
                      broughtBy: 'all',
                      composer: 'all',
                      yearBrought: 'all',
                      sortBy: 'dateBrought-desc',
                    })
                  }
                  className="mt-3 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-800 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <SongListView
                songs={displayedSongs}
                currentUser={currentUser}
                favorites={userFavoriteSongIds}
                currentPlayingSongId={currentPlayingSong?.id || null}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onPauseSong={handlePauseSong}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetails={handleOpenSongDetails}
                onEditSong={(s) => {
                  setSongToEdit(s);
                  setIsUploadModalOpen(true);
                }}
                onDeleteSong={handleDeleteSong}
              />
            )}
          </div>
        )}

        {/* Tab 2: Favorites */}
        {activeTab === 'favorites' && (
          <FavoritesView
            favoriteSongs={userFavoritesList}
            currentUser={currentUser}
            currentPlayingSongId={currentPlayingSong?.id || null}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onPauseSong={handlePauseSong}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetails={handleOpenSongDetails}
            onEditSong={(s) => {
              setSongToEdit(s);
              setIsUploadModalOpen(true);
            }}
            onDeleteSong={handleDeleteSong}
            onBrowseLibrary={() => setActiveTab('library')}
          />
        )}

        {/* Tab 3: Admin Member Management & Access Control */}
        {activeTab === 'members' && (
          <MemberManagementView
            currentChurch={currentChurch}
            currentUser={currentUser}
            onRefresh={() => setMemberRefreshKey((k) => k + 1)}
          />
        )}
      </main>

      {/* Persistent Audio Player */}
      <PersistentAudioPlayer
        song={currentPlayingSong}
        isPlaying={isPlaying}
        currentTime={playbackCurrentTime}
        duration={playbackDuration}
        speed={playbackSpeed}
        onTogglePlay={() => {
          if (isPlaying) {
            handlePauseSong();
          } else if (currentPlayingSong) {
            handlePlaySong(currentPlayingSong);
          }
        }}
        onSeek={handleSeek}
        onSpeedChange={handleSpeedChange}
        onClose={handleClosePlayer}
        onOpenDetails={handleOpenSongDetails}
      />

      {/* Song Details Modal (Lyrics & Zoomable Sheet Music) */}
      <SongDetailModal
        song={selectedSongDetails}
        isOpen={Boolean(selectedSongDetails)}
        initialTab={detailsInitialTab}
        currentUser={currentUser}
        isFavorite={
          selectedSongDetails ? userFavoriteSongIds.includes(selectedSongDetails.id) : false
        }
        isPlaying={isPlaying && currentPlayingSong?.id === selectedSongDetails?.id}
        onClose={() => setSelectedSongDetails(null)}
        onPlaySong={handlePlaySong}
        onPauseSong={handlePauseSong}
        onToggleFavorite={handleToggleFavorite}
        onEditSong={(s) => {
          setSelectedSongDetails(null);
          setSongToEdit(s);
          setIsUploadModalOpen(true);
        }}
      />

      {/* Song Upload/Edit Modal (Universal permissions: both Admins and Members) */}
      <SongUploadModal
        isOpen={isUploadModalOpen}
        churchId={currentChurchId}
        currentUser={currentUser}
        songToEdit={songToEdit}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSongToEdit(null);
        }}
        onSave={handleSaveSong}
      />

      {/* Church Tenant Switcher Modal */}
      <TenantSwitcherModal
        isOpen={isTenantSwitcherOpen}
        tenants={tenants}
        currentTenantId={currentChurchId}
        onSelectTenant={(tenantId) => {
          if (currentPlayingSong) {
            handleClosePlayer();
          }
          setCurrentChurchId(tenantId);
          if (authUser) {
            const updated = { ...authUser, churchId: tenantId };
            setAuthUser(updated);
            AuthApi.saveSession(updated);
          }
        }}
        onRegisterTenant={handleRegisterTenant}
        onClose={() => setIsTenantSwitcherOpen(false)}
      />
    </div>
  );
}
