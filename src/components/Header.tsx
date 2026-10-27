import React, { useState } from 'react';
import { ChurchTenant, UserProfile } from '../types/choir';
import { Music, Church, ShieldCheck, User, LogOut, Users, Copy, CheckCheck, Hash } from 'lucide-react';

interface HeaderProps {
  currentChurch: ChurchTenant;
  currentUser: UserProfile;
  activeTab: 'library' | 'favorites' | 'members';
  favoritesCount: number;
  pendingRequestsCount?: number;
  onTabChange: (tab: 'library' | 'favorites' | 'members') => void;
  onOpenTenantSwitcher: () => void;
  onToggleUserRole: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentChurch,
  currentUser,
  activeTab,
  favoritesCount,
  pendingRequestsCount = 0,
  onTabChange,
  onOpenTenantSwitcher,
  onToggleUserRole,
  onLogout,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'ADMIN';

  const handleCopyRoomCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentChurch.roomCode) {
      navigator.clipboard.writeText(currentChurch.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Desktop Nav */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
                <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <span className="font-cinzel text-base sm:text-lg font-bold tracking-wider text-neutral-900 whitespace-nowrap">
                CANTORIA
              </span>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => onTabChange('library')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'library'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Song Library
              </button>

              <button
                onClick={() => onTabChange('favorites')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span>Favorites</span>
                {favoritesCount > 0 && (
                  <span
                    className={`font-mono-num text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                      activeTab === 'favorites'
                        ? 'bg-neutral-700 text-white'
                        : 'bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Admin Member Management Tab */}
              {isAdmin && (
                <button
                  onClick={() => onTabChange('members')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Members</span>
                  {pendingRequestsCount > 0 && (
                    <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full font-bold bg-neutral-900 text-white border border-neutral-600 animate-pulse">
                      {pendingRequestsCount} pending
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* Right Actions: Room Code Badge, Church Selector & Role Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Room Code Badge */}
            {currentChurch.roomCode && (
              <button
                type="button"
                onClick={handleCopyRoomCode}
                className="hidden lg:flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer"
                title="Click to copy Church Room Code"
              >
                <Hash className="h-3 w-3 text-neutral-400" />
                <span className="font-mono font-bold text-neutral-900">{currentChurch.roomCode}</span>
                {copiedCode ? (
                  <CheckCheck className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-neutral-400" />
                )}
              </button>
            )}

            {/* Church Tenant Selector */}
            <button
              onClick={onOpenTenantSwitcher}
              title="Switch church organization"
              className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 border border-neutral-200 transition-colors whitespace-nowrap max-w-[120px] sm:max-w-[160px] cursor-pointer"
            >
              <Church className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{currentChurch.name}</span>
            </button>

            {/* User Info / Role Badge */}
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-200">
              {isAdmin ? (
                <ShieldCheck className="h-3.5 w-3.5 text-neutral-900 shrink-0" />
              ) : (
                <User className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              )}
              <span className="font-mono text-[11px] font-semibold text-neutral-900 max-w-[80px] sm:max-w-[110px] truncate">
                @{currentUser.username || currentUser.name.split(' ')[0].toLowerCase()}
              </span>
            </div>

            {/* Role Switcher (Admin/Member testing toggle) */}
            <button
              onClick={onToggleUserRole}
              title={`Switch role for testing (currently ${isAdmin ? 'Admin' : 'Member'})`}
              className={`hidden md:flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
                isAdmin
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <span>{isAdmin ? 'Admin' : 'Member'}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1 sm:p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (visible only on small screens) */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 pb-2 pt-0.5 border-t border-neutral-100">
          <button
            onClick={() => onTabChange('library')}
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'library'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Song Library
          </button>
          <button
            onClick={() => onTabChange('favorites')}
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span
                className={`font-mono-num text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  activeTab === 'favorites'
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-200 text-neutral-800'
                }`}
              >
                {favoritesCount}
              </span>
            )}
          </button>
          {isAdmin && (
            <button
              onClick={() => onTabChange('members')}
              className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${
                activeTab === 'members'
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>Members</span>
              {pendingRequestsCount > 0 && (
                <span className="font-mono text-[9px] px-1 py-0.2 rounded-full bg-neutral-800 text-white">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
