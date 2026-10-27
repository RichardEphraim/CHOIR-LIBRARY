import React, { useState } from 'react';
import { ChurchTenant, VoicePart } from '../../types/choir';
import { OnboardingType } from '../../types/auth';
import { X, Church, ShieldCheck, User, Hash, AlertCircle } from 'lucide-react';

interface SocialChurchSetupModalProps {
  isOpen?: boolean;
  provider?: 'google' | 'apple';
  socialName?: string;
  socialEmail?: string;
  tenants: ChurchTenant[];
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: (data: {
    roleType: 'ADMIN' | 'MEMBER';
    username?: string;
    onboardingType: OnboardingType;
    newChurchName?: string;
    newChurchCity?: string;
    newChurchDenomination?: string;
    existingChurchId?: string;
    inviteCode?: string;
    roomCode?: string;
    voicePart?: VoicePart;
  }) => void;
}

export const SocialChurchSetupModal: React.FC<SocialChurchSetupModalProps> = ({
  isOpen = true,
  provider = 'google',
  socialName = 'Social Chorister',
  socialEmail = 'user@choir.org',
  tenants,
  onClose,
  onCancel,
  onConfirm,
}) => {
  const [roleType, setRoleType] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [username, setUsername] = useState('');
  const [newChurchName, setNewChurchName] = useState('');
  const [newChurchCity, setNewChurchCity] = useState('');
  const [newChurchDenomination, setNewChurchDenomination] = useState('');
  const [roomCode, setRoomCode] = useState(tenants[0]?.roomCode || 'GC-1042');
  const [voicePart, setVoicePart] = useState<VoicePart>('Soprano');
  const [error, setError] = useState('');

  if (isOpen === false) return null;

  const handleClose = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().replace(/^@/, '').toLowerCase();
    if (cleanUser && !/^[a-z0-9_]+$/.test(cleanUser)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    if (roleType === 'ADMIN') {
      if (!newChurchName.trim() || newChurchName.trim().length < 3) {
        setError('Please enter a church or choir organization name.');
        return;
      }
    } else {
      const code = roomCode.trim().toUpperCase();
      if (!code) {
        setError('Please enter your Church Room Number.');
        return;
      }
      const matched = tenants.find(
        (t) => t.roomCode?.toUpperCase() === code || t.inviteCode?.toUpperCase() === code
      );
      if (!matched) {
        setError('Invalid Church Room Code. Please check with your choir admin.');
        return;
      }
    }

    onConfirm({
      roleType,
      username: cleanUser || socialName.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 12),
      onboardingType: roleType === 'ADMIN' ? 'create_church' : 'join_church',
      newChurchName,
      newChurchCity,
      newChurchDenomination,
      existingChurchId: tenants.find((t) => t.roomCode?.toUpperCase() === roomCode.trim().toUpperCase())?.id,
      inviteCode: roomCode.trim().toUpperCase(),
      roomCode: roomCode.trim().toUpperCase(),
      voicePart,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-setup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50/60">
          <div>
            <h2 id="social-setup-title" className="font-cinzel text-lg font-bold text-neutral-900">
              Complete Choir Room Onboarding
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Signing in as <strong className="text-neutral-800">{socialName}</strong> ({socialEmail})
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-md cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-neutral-700" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Role Selector */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
              Select Choir Role *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRoleType('ADMIN')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  roleType === 'ADMIN'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Church Admin</span>
                </div>
                <p className={`text-[11px] mt-0.5 ${roleType === 'ADMIN' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Create new church & room code
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRoleType('MEMBER')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  roleType === 'MEMBER'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <User className="h-4 w-4" />
                  <span>Choir Member</span>
                </div>
                <p className={`text-[11px] mt-0.5 ${roleType === 'MEMBER' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Join with Room Number
                </p>
              </button>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Choir Username Tag
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. solomon_tenor"
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          {/* Conditional Admin vs Member Fields */}
          {roleType === 'ADMIN' ? (
            <div className="space-y-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Church / Choir Name *
                </label>
                <input
                  type="text"
                  required
                  value={newChurchName}
                  onChange={(e) => setNewChurchName(e.target.value)}
                  placeholder="e.g. Grace Cathedral Choral Guild"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newChurchCity}
                    onChange={(e) => setNewChurchCity(e.target.value)}
                    placeholder="e.g. Chicago, IL"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">Denomination</label>
                  <input
                    type="text"
                    value={newChurchDenomination}
                    onChange={(e) => setNewChurchDenomination(e.target.value)}
                    placeholder="e.g. Liturgical"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-neutral-700">
                    Church Room Number / Access Code *
                  </label>
                  <span className="text-[10px] text-neutral-400">e.g. GC-1042</span>
                </div>
                <input
                  type="text"
                  required
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter Room Code (e.g. GC-1042)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Voice Part
                </label>
                <select
                  value={voicePart}
                  onChange={(e) => setVoicePart(e.target.value as VoicePart)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
                >
                  <option value="Soprano">Soprano</option>
                  <option value="Alto">Alto</option>
                  <option value="Tenor">Tenor</option>
                  <option value="Bass">Bass</option>
                </select>
              </div>

              <div className="text-[10px] text-neutral-500">
                Choir member requests require Choir Admin approval before library access.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
            >
              Confirm and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
