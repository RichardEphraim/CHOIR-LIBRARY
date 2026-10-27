import React, { useState } from 'react';
import { AuthUser } from '../../types/auth';
import { Check, ArrowRight, ShieldCheck, User, Church, Copy, CheckCheck, Hash } from 'lucide-react';

interface SignUpStatusPageProps {
  user: AuthUser;
  onEnterDashboard: () => void;
  onGoToLogIn: () => void;
}

export const SignUpStatusPage: React.FC<SignUpStatusPageProps> = ({
  user,
  onEnterDashboard,
  onGoToLogIn,
}) => {
  const [copied, setCopied] = useState(false);
  const isAdmin = user.role === 'ADMIN' || user.role === 'admin';

  const handleCopyCode = () => {
    if (user.roomCode) {
      navigator.clipboard.writeText(user.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 sm:py-10 px-6 sm:px-8 rounded-2xl border border-neutral-200 shadow-xs text-center space-y-6">
          {/* Checkmark Icon in solid black circle */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-2xs">
            <Check className="h-7 w-7 stroke-[3]" />
          </div>

          <div>
            <h2 className="font-cinzel text-2xl font-bold tracking-tight text-neutral-900">
              Account Created Successfully!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500">
              Welcome to Cantoria, <strong className="text-neutral-900">{user.fullName || user.name}</strong> (@{user.username}).
            </p>
          </div>

          {/* Generated Church Room Number Highlight (Required for Admins) */}
          {user.roomCode && (
            <div className="rounded-xl border-2 border-neutral-900 bg-neutral-50 p-4 text-center space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                Church Code / Room Number
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono-num text-2xl sm:text-3xl font-extrabold tracking-wider text-neutral-900">
                  {user.roomCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer active:scale-95"
                  title="Copy room code to clipboard"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500">
                Share this Room Number with your choir members so they can register and request access to your library.
              </p>
            </div>
          )}

          {/* Account Details Summary Card */}
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">Church Organization:</span>
              <span className="font-semibold text-neutral-900 flex items-center gap-1">
                <Church className="h-3.5 w-3.5 text-neutral-600" />
                <span>{user.churchName || user.churchId}</span>
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">Choir Role:</span>
              <span className="font-semibold text-neutral-900 flex items-center gap-1">
                {isAdmin ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-neutral-900" />
                    <span>Church Admin (Approved)</span>
                  </>
                ) : (
                  <>
                    <User className="h-3.5 w-3.5 text-neutral-600" />
                    <span>Choir Member ({user.voicePart})</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">Username:</span>
              <span className="font-mono-num font-semibold text-neutral-900">@{user.username}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Registered Email:</span>
              <span className="font-mono-num text-neutral-800">{user.email}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={onEnterDashboard}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-transform active:scale-[0.99] cursor-pointer"
            >
              <span>Enter Choir Song Library</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onGoToLogIn}
              className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Return to Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
