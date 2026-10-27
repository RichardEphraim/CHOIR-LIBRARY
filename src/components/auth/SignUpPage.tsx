import React, { useState } from 'react';
import { ChurchTenant, VoicePart } from '../../types/choir';
import { SignUpPayload, OnboardingType } from '../../types/auth';
import { SocialButtons } from './SocialButtons';
import { SocialChurchSetupModal } from './SocialChurchSetupModal';
import { Music, ShieldCheck, User, AlertCircle, ArrowLeft, Eye, EyeOff, Hash, Building2 } from 'lucide-react';

interface SignUpPageProps {
  tenants: ChurchTenant[];
  isLoading: boolean;
  onSignUpSubmit: (payload: SignUpPayload) => void;
  onSocialAuth: (provider: 'google' | 'apple', churchData: {
    roleType: 'ADMIN' | 'MEMBER';
    username?: string;
    churchName?: string;
    roomCode?: string;
    voicePart?: VoicePart;
    onboardingType: OnboardingType;
    newChurchName?: string;
    newChurchCity?: string;
    newChurchDenomination?: string;
    existingChurchId?: string;
    inviteCode?: string;
  }) => void;
  onGoToLogIn: () => void;
  onGoToLanding: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  tenants,
  isLoading,
  onSignUpSubmit,
  onSocialAuth,
  onGoToLogIn,
  onGoToLanding,
}) => {
  // Role Selection: Option 1 (Admin) vs Option 2 (Member)
  const [roleType, setRoleType] = useState<'ADMIN' | 'MEMBER'>('ADMIN');

  // Common Registration Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin Specific Fields
  const [churchName, setChurchName] = useState('');
  const [churchCity, setChurchCity] = useState('');
  const [churchDenomination, setChurchDenomination] = useState('');

  // Member Specific Fields
  const [roomCode, setRoomCode] = useState('');
  const [voicePart, setVoicePart] = useState<VoicePart>('Soprano');

  const [error, setError] = useState('');

  // Social Modal state
  const [activeSocialProvider, setActiveSocialProvider] = useState<'google' | 'apple' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanUser = username.trim().replace(/^@/, '').toLowerCase();
    if (!cleanUser || cleanUser.length < 3) {
      setError('Please choose a username with at least 3 characters.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(cleanUser)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (roleType === 'ADMIN') {
      if (!churchName.trim() || churchName.trim().length < 3) {
        setError('Please enter your Church / Choir organization name.');
        return;
      }
    } else {
      const code = roomCode.trim().toUpperCase();
      if (!code) {
        setError('Please enter your choir Church Room Number / Access Code.');
        return;
      }
      // Instant client-side check against available room codes
      const matched = tenants.find(
        (t) =>
          t.roomCode?.toUpperCase() === code ||
          t.inviteCode?.toUpperCase() === code
      );
      if (!matched) {
        setError('Invalid Church Room Code. Please check with your choir admin.');
        return;
      }
    }

    onSignUpSubmit({
      name,
      username: cleanUser,
      email,
      password,
      confirmPassword,
      roleType,
      churchName: roleType === 'ADMIN' ? churchName : undefined,
      newChurchCity: churchCity,
      newChurchDenomination: churchDenomination,
      roomCode: roleType === 'MEMBER' ? roomCode.trim().toUpperCase() : undefined,
      voicePart: roleType === 'MEMBER' ? voicePart : 'Director',
      // Compatibility fields
      onboardingType: roleType === 'ADMIN' ? 'create_church' : 'join_church',
      newChurchName: churchName,
      inviteCode: roomCode,
    });
  };

  const handleStartSocialAuth = (provider: 'google' | 'apple') => {
    setActiveSocialProvider(provider);
  };

  const handleConfirmSocialSetup = (churchData: {
    onboardingType: OnboardingType;
    newChurchName?: string;
    newChurchCity?: string;
    newChurchDenomination?: string;
    existingChurchId?: string;
    inviteCode?: string;
    voicePart?: VoicePart;
  }) => {
    if (activeSocialProvider) {
      const isCreate = churchData.onboardingType === 'create_church';
      onSocialAuth(activeSocialProvider, {
        roleType: isCreate ? 'ADMIN' : 'MEMBER',
        username: username.trim().replace(/^@/, '') || 'chorister_' + Math.floor(100 + Math.random() * 900),
        churchName: churchData.newChurchName,
        roomCode: churchData.inviteCode,
        voicePart: churchData.voicePart,
        ...churchData,
      });
      setActiveSocialProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back Link & Brand */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </button>
          <span className="font-cinzel text-xs tracking-wider text-neutral-400 font-bold uppercase">
            CANTORIA
          </span>
        </div>

        <div className="flex justify-center mb-2">
          <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
            <Music className="h-5 w-5" />
          </div>
        </div>

        <h2 className="text-center font-cinzel text-2xl font-bold tracking-tight text-neutral-900">
          Create Choir Account
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-500">
          Join an existing church room or establish a new choir workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-5 sm:px-8 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
          {/* STEP 1: ROLE SELECTION AT SIGN-UP */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Select Account Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Option 1: Church Admin */}
              <button
                type="button"
                onClick={() => setRoleType('ADMIN')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  roleType === 'ADMIN'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <ShieldCheck className={`h-4 w-4 ${roleType === 'ADMIN' ? 'text-white' : 'text-neutral-800'}`} />
                  <span>Church Admin</span>
                </div>
                <p className={`text-[11px] mt-1 leading-tight ${roleType === 'ADMIN' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Register new church & generate Room Code
                </p>
              </button>

              {/* Option 2: Choir Member */}
              <button
                type="button"
                onClick={() => setRoleType('MEMBER')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  roleType === 'MEMBER'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <User className={`h-4 w-4 ${roleType === 'MEMBER' ? 'text-white' : 'text-neutral-800'}`} />
                  <span>Choir Member</span>
                </div>
                <p className={`text-[11px] mt-1 leading-tight ${roleType === 'MEMBER' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Join with Church Room Number
                </p>
              </button>
            </div>
          </div>

          {/* Social Sign-In Section */}
          <div>
            <SocialButtons
              onGoogleClick={() => handleStartSocialAuth('google')}
              onAppleClick={() => handleStartSocialAuth('apple')}
              isLoading={isLoading}
            />

            {/* Hairline Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2.5 text-[11px] text-neutral-400 font-medium">
                  or continue with form
                </span>
              </div>
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-neutral-800 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={roleType === 'ADMIN' ? 'Dr. Alistair Sterling' : 'Eleanor Vance'}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900"
              />
            </div>

            {/* Unique Username */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Unique Username *
                </label>
                <span className="text-[11px] text-neutral-400">Used for song attribution tag</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={roleType === 'ADMIN' ? 'admin_grace' : 'soprano_emma'}
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900 font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="choir@sanctuary.org"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900"
              />
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900"
                />
              </div>
            </div>

            {/* Dynamic Role Fields */}
            {roleType === 'ADMIN' ? (
              /* Option 1: Admin Flow */
              <div className="pt-2 border-t border-neutral-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Church / Choir Organization</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Church Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    placeholder="e.g. Grace Cathedral Choral Guild"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900"
                  />
                  <p className="mt-1 text-[11px] text-neutral-500">
                    A unique 6-character Church Room Code (e.g. GC-8492) will be generated for your choir room.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={churchCity}
                      onChange={(e) => setChurchCity(e.target.value)}
                      placeholder="e.g. St. Louis, MO"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">Denomination / Tradition</label>
                    <input
                      type="text"
                      value={churchDenomination}
                      onChange={(e) => setChurchDenomination(e.target.value)}
                      placeholder="e.g. Anglican / Liturgical"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Option 2: Choir Member Flow */
              <div className="pt-2 border-t border-neutral-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                  <Hash className="h-3.5 w-3.5" />
                  <span>Church Room Verification</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-neutral-700">
                      Church Room Number / Access Code *
                    </label>
                    <span className="text-[11px] text-neutral-400">e.g. GC-1042</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. GC-1042 or SJ-2045)"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 font-mono tracking-wider focus:outline-none focus:bg-white focus:border-neutral-900"
                  />
                  {/* Quick helper for active demo room codes */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] text-neutral-500">
                    <span>Available demo rooms:</span>
                    {tenants.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setRoomCode(t.roomCode || '')}
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 cursor-pointer"
                        title={t.name}
                      >
                        {t.roomCode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Voice Part / Section
                  </label>
                  <select
                    value={voicePart}
                    onChange={(e) => setVoicePart(e.target.value as VoicePart)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 cursor-pointer"
                  >
                    <option value="Soprano">Soprano</option>
                    <option value="Alto">Alto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Bass">Bass</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-600">
                  Note: Upon registration, your request will be queued for your Choir Admin to approve before library access is granted.
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading
                  ? 'Creating Account...'
                  : roleType === 'ADMIN'
                  ? 'Create Admin Account & Generate Room Code'
                  : 'Submit Join Request for Approval'}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="pt-2 text-center text-xs text-neutral-500 border-t border-neutral-100">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onGoToLogIn}
              className="font-semibold text-neutral-900 hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Social Onboarding Setup Modal */}
      {activeSocialProvider && (
        <SocialChurchSetupModal
          tenants={tenants}
          onConfirm={handleConfirmSocialSetup}
          onCancel={() => setActiveSocialProvider(null)}
        />
      )}
    </div>
  );
};
