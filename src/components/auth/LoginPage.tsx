import React, { useState } from 'react';
import { ChurchTenant, VoicePart } from '../../types/choir';
import { LoginPayload, OnboardingType } from '../../types/auth';
import { SocialButtons } from './SocialButtons';
import { SocialChurchSetupModal } from './SocialChurchSetupModal';
import { Music, AlertCircle, ArrowLeft, Eye, EyeOff, Check, KeyRound } from 'lucide-react';

interface LoginPageProps {
  tenants: ChurchTenant[];
  isLoading: boolean;
  onLoginSubmit: (payload: LoginPayload) => void;
  onSocialAuth: (provider: 'google' | 'apple', churchData: {
    onboardingType: OnboardingType;
    newChurchName?: string;
    newChurchCity?: string;
    newChurchDenomination?: string;
    existingChurchId?: string;
    inviteCode?: string;
    voicePart?: VoicePart;
  }) => void;
  onForgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  onGoToSignUp: () => void;
  onGoToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  tenants,
  isLoading,
  onLoginSubmit,
  onSocialAuth,
  onForgotPassword,
  onGoToSignUp,
  onGoToLanding,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFeedback, setForgotFeedback] = useState<{ success?: boolean; text?: string } | null>(null);

  // Social Modal state
  const [activeSocialProvider, setActiveSocialProvider] = useState<'google' | 'apple' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    onLoginSubmit({ email, password });
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotFeedback({ success: false, text: 'Please enter a valid email address.' });
      return;
    }
    const res = await onForgotPassword(forgotEmail);
    setForgotFeedback({ success: res.success, text: res.message });
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
      onSocialAuth(activeSocialProvider, churchData);
      setActiveSocialProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
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
          Sign In to Cantoria
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-500">
          Access your church choir repertoire and rehearsal tracks
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-5 sm:px-8 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
          {/* Social Sign-In Section */}
          <div>
            <SocialButtons
              onGoogleClick={() => setActiveSocialProvider('google')}
              onAppleClick={() => setActiveSocialProvider('apple')}
              isLoading={isLoading}
            />

            {/* Hairline Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2.5 text-[11px] text-neutral-400 font-medium">
                  or sign in with email
                </span>
              </div>
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-neutral-800 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="choirmaster@gracecathedral.org"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotFeedback(null);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-900 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-transform active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins for Instant Testing */}
          <div className="pt-2 border-t border-neutral-100">
            <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Quick Test Accounts
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@gracecathedral.org', 'password123')}
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-neutral-900 truncate">Admin</div>
                <div className="text-[10px] text-neutral-500 truncate">@admin_grace</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('member@gracecathedral.org', 'password123')}
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-neutral-900 truncate">Approved</div>
                <div className="text-[10px] text-neutral-500 truncate">@soprano_eleanor</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('pending@gracecathedral.org', 'password123')}
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-neutral-900 truncate">Pending</div>
                <div className="text-[10px] text-neutral-500 truncate">@solomon_tenor</div>
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-2 border-t border-neutral-100">
            <span className="text-xs text-neutral-500">Don't have an account? </span>
            <button
              onClick={onGoToSignUp}
              className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-neutral-900" />
              <h3 className="font-cinzel text-base font-bold text-neutral-900">
                Reset Password
              </h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Enter your registered choir email address to receive password reset instructions.
            </p>

            {forgotFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs ${
                  forgotFeedback.success
                    ? 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {forgotFeedback.text}
              </div>
            )}

            <form onSubmit={handleSendReset} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your.email@church.org"
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Onboarding Modal */}
      {activeSocialProvider && (
        <SocialChurchSetupModal
          isOpen={Boolean(activeSocialProvider)}
          provider={activeSocialProvider}
          socialName={activeSocialProvider === 'apple' ? 'Apple User' : 'Google User'}
          socialEmail={activeSocialProvider === 'apple' ? 'user@icloud.com' : 'user@gmail.com'}
          tenants={tenants}
          onClose={() => setActiveSocialProvider(null)}
          onConfirm={handleConfirmSocialSetup}
        />
      )}
    </div>
  );
};
