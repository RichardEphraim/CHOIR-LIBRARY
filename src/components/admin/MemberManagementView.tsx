import React, { useState } from 'react';
import { ChurchTenant, UserProfile } from '../../types/choir';
import { StoredUserAccount, AuthApi } from '../../services/authApi';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Copy,
  Check,
  Search,
  CheckCheck,
  Hash,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface MemberManagementViewProps {
  currentChurch: ChurchTenant;
  currentUser: UserProfile;
  onRefresh: () => void;
}

export const MemberManagementView: React.FC<MemberManagementViewProps> = ({
  currentChurch,
  currentUser,
  onRefresh,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch real-time members for this church
  const { pending, approved } = AuthApi.getChurchMembers(currentChurch.id);

  const handleCopyRoomCode = () => {
    if (currentChurch.roomCode) {
      navigator.clipboard.writeText(currentChurch.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleApprove = async (user: StoredUserAccount) => {
    const success = await AuthApi.approveMember(user.id);
    if (success) {
      setFeedback({
        type: 'success',
        message: `Approved @${user.username} (${user.fullName || user.name}). They can now access the song library!`,
      });
      onRefresh();
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleReject = async (user: StoredUserAccount) => {
    if (window.confirm(`Are you sure you want to reject the join request from @${user.username}?`)) {
      const success = await AuthApi.rejectMember(user.id);
      if (success) {
        setFeedback({
          type: 'success',
          message: `Join request for @${user.username} has been rejected.`,
        });
        onRefresh();
        setTimeout(() => setFeedback(null), 3500);
      }
    }
  };

  // Filter approved roster by search
  const filteredApproved = approved.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.voicePart?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Room Code */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white">
              Admin Access Control
            </span>
            <span className="text-xs text-neutral-500">
              {currentChurch.name}
            </span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-neutral-900">
            Choir Member Management
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Approve pending join requests and manage your choir room roster.
          </p>
        </div>

        {/* Church Room Code Quick Share Box */}
        <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-300 rounded-xl p-3 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span>Church Room Number</span>
            </div>
            <div className="font-mono-num text-lg sm:text-xl font-extrabold text-neutral-900 tracking-wider">
              {currentChurch.roomCode || currentChurch.inviteCode}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyRoomCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all active:scale-95 shadow-2xs cursor-pointer"
            title="Copy room code to share"
          >
            {copiedCode ? (
              <>
                <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Feedback Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline text-neutral-400 hover:text-white cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: PENDING ACCESS REQUESTS */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span>Pending Access Requests</span>
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded-full font-bold ${
                    pending.length > 0
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {pending.length}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                Choristers waiting for your authorization to enter the song library
              </p>
            </div>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="h-10 w-10 mx-auto rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-neutral-700">
              All caught up! No pending member requests.
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              New singers who register with Church Room Code{' '}
              <strong className="text-neutral-900">{currentChurch.roomCode}</strong> will appear here for your review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Chorister</th>
                  <th className="py-3 px-4 font-semibold">Username</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Voice Section</th>
                  <th className="py-3 px-4 font-semibold">Requested</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {pending.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-neutral-900">
                      {user.fullName || user.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-neutral-800">
                      @{user.username}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-medium text-[11px]">
                        {user.voicePart || 'Soprano'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap text-[11px]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApprove(user)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer active:scale-95"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(user)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: APPROVED MEMBER ROSTER */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span>Approved Member Roster</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-semibold">
                  {approved.length}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                Active choristers with full library access and song upload privileges
              </p>
            </div>
          </div>

          {/* Quick Roster Search */}
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @username..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Username Tag</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Voice Section</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredApproved.map((member) => {
                const isAdmin = member.role === 'ADMIN' || member.role === 'admin';
                return (
                  <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-neutral-900">
                      <div className="flex items-center gap-2">
                        <span>{member.fullName || member.name}</span>
                        {member.id === currentUser.id && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700 font-bold">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">
                      @{member.username}
                    </td>
                    <td className="py-3.5 px-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900 text-white text-[11px] font-semibold">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 text-[11px] font-medium">
                          <span>Member</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700 font-medium">
                      {member.voicePart || (isAdmin ? 'Director' : 'Soprano')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {member.email}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900">
                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
