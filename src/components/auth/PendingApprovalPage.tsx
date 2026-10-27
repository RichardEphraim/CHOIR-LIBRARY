import React, { useState } from 'react';
import { AuthUser } from '../../types/auth';
import { Clock, Church, ArrowLeft, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { AuthApi } from '../../services/authApi';

interface PendingApprovalPageProps {
  user: AuthUser;
  onStatusApproved: (updatedUser: AuthUser) => void;
  onGoToLogIn: () => void;
}

export const PendingApprovalPage: React.FC<PendingApprovalPageProps> = ({
  user,
  onStatusApproved,
  onGoToLogIn,
}) => {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const session = AuthApi.getCurrentSession();
    setChecking(false);

    if (session && session.status === 'APPROVED') {
      setStatusMessage('Your account has been approved! Redirecting to library...');
      setTimeout(() => {
        onStatusApproved(session);
      }, 800);
    } else {
      setStatusMessage('Your request is still pending review by the choir admin.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 sm:py-10 px-6 sm:px-8 rounded-2xl border border-neutral-200 shadow-xs text-center space-y-6">
          {/* Animated or High-Contrast Pending Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-2xs">
            <Clock className="h-7 w-7" />
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-neutral-100 text-neutral-700 border border-neutral-300 mb-2">
              Pending Admin Approval
            </span>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Join Request Submitted
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Account created! Your join request for{' '}
              <strong className="text-neutral-900">{user.churchName || 'your church'}</strong> has been submitted.
              You will gain full access once your Choir Admin approves your account.
            </p>
          </div>

          {/* Details Card */}
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">Applicant:</span>
              <span className="font-semibold text-neutral-900">
                {user.fullName || user.name} (@{user.username})
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">Target Church:</span>
              <span className="font-semibold text-neutral-900 flex items-center gap-1">
                <Church className="h-3.5 w-3.5 text-neutral-500" />
                <span>{user.churchName || 'Choir Ensemble'}</span>
              </span>
            </div>

            {user.roomCode && (
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Church Room Number:</span>
                <span className="font-mono-num font-bold text-neutral-900 px-2 py-0.5 bg-neutral-200 rounded text-[11px]">
                  {user.roomCode}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">Voice Section:</span>
              <span className="font-medium text-neutral-800">{user.voicePart}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Access Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-neutral-800">
                <span className="h-2 w-2 rounded-full bg-neutral-900 animate-pulse" />
                <span>Awaiting Choir Admin</span>
              </span>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center justify-center gap-2 ${
                statusMessage.includes('approved')
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
              }`}
            >
              {statusMessage.includes('approved') ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking Status...' : 'Check Approval Status'}</span>
            </button>

            <button
              onClick={onGoToLogIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Sign In</span>
            </button>
          </div>

          <p className="text-[11px] text-neutral-400">
            For rapid access during rehearsal, notify your choir director or section leader to approve your username.
          </p>
        </div>
      </div>
    </div>
  );
};
