import { AuthUser, SignUpPayload, LoginPayload, SocialAuthPayload, AuthResponse } from '../types/auth';
import { ChurchTenant, UserRole, UserStatus, VoicePart, UserProfile } from '../types/choir';
import { INITIAL_TENANTS } from '../data/seedData';

const SESSION_STORAGE_KEY = 'cantoria_auth_session';
const REGISTERED_USERS_KEY = 'cantoria_registered_users';

export interface StoredUserAccount extends AuthUser {
  passwordHash?: string;
}

/**
 * Generates an uppercase initials + 4-digit Church Room Code (e.g. GC-8492).
 */
export function generateChurchRoomCode(churchName: string): string {
  const words = churchName.trim().split(/\s+/).filter(Boolean);
  let prefix = '';
  if (words.length >= 2) {
    prefix = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    prefix = words[0].slice(0, 2).toUpperCase();
  } else {
    prefix = 'CH';
  }
  prefix = prefix.replace(/[^A-Z0-9]/g, 'C').padEnd(2, 'H').slice(0, 2);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

// Seed initial users into local accounts
function getInitialAccounts(): StoredUserAccount[] {
  return [
    {
      id: 'user-admin-grace',
      name: 'Dr. Alistair Sterling',
      fullName: 'Dr. Alistair Sterling',
      username: 'admin_grace',
      email: 'admin@gracecathedral.org',
      role: 'ADMIN',
      status: 'APPROVED',
      voicePart: 'Director',
      churchId: 'grace-cathedral',
      churchName: 'Grace Cathedral Choral Guild',
      roomCode: 'GC-1042',
      provider: 'local',
      passwordHash: 'password123',
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'user-chorister-grace',
      name: 'Eleanor Vance',
      fullName: 'Eleanor Vance',
      username: 'soprano_eleanor',
      email: 'member@gracecathedral.org',
      role: 'MEMBER',
      status: 'APPROVED',
      voicePart: 'Soprano',
      churchId: 'grace-cathedral',
      churchName: 'Grace Cathedral Choral Guild',
      roomCode: 'GC-1042',
      provider: 'local',
      passwordHash: 'password123',
      createdAt: '2023-02-15T00:00:00Z',
    },
    {
      id: 'user-pending-grace',
      name: 'Solomon Davies',
      fullName: 'Solomon Davies',
      username: 'solomon_tenor',
      email: 'pending@gracecathedral.org',
      role: 'MEMBER',
      status: 'PENDING',
      voicePart: 'Tenor',
      churchId: 'grace-cathedral',
      churchName: 'Grace Cathedral Choral Guild',
      roomCode: 'GC-1042',
      provider: 'local',
      passwordHash: 'password123',
      createdAt: '2026-10-25T14:30:00Z',
    },
    {
      id: 'user-admin-stjude',
      name: 'Minister Danielle Washington',
      fullName: 'Minister Danielle Washington',
      username: 'admin_danielle',
      email: 'danielle@stjudegospel.org',
      role: 'ADMIN',
      status: 'APPROVED',
      voicePart: 'Director',
      churchId: 'st-jude-gospel',
      churchName: 'St. Jude Gospel Sanctuary Ensemble',
      roomCode: 'SJ-2045',
      provider: 'local',
      passwordHash: 'password123',
      createdAt: '2023-01-10T00:00:00Z',
    },
    {
      id: 'user-pending-stjude',
      name: 'Miriam O\'Connor',
      fullName: 'Miriam O\'Connor',
      username: 'miriam_alto',
      email: 'miriam@stjudegospel.org',
      role: 'MEMBER',
      status: 'PENDING',
      voicePart: 'Alto',
      churchId: 'st-jude-gospel',
      churchName: 'St. Jude Gospel Sanctuary Ensemble',
      roomCode: 'SJ-2045',
      provider: 'local',
      passwordHash: 'password123',
      createdAt: '2026-10-26T09:15:00Z',
    },
  ];
}

function getStoredAccounts(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      const initials = getInitialAccounts();
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(initials));
      return initials;
    }
    const parsed: StoredUserAccount[] = JSON.parse(raw);
    // Ensure all accounts have username, role, status
    let changed = false;
    const sanitized = parsed.map((a) => {
      let mod = false;
      const copy = { ...a };
      if (!copy.username) {
        copy.username = copy.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
        mod = true;
      }
      if (!copy.status) {
        copy.status = 'APPROVED';
        mod = true;
      }
      if (copy.role === 'admin') copy.role = 'ADMIN';
      if (copy.role === 'member') copy.role = 'MEMBER';
      if (mod) changed = true;
      return copy;
    });
    if (changed) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return getInitialAccounts();
  }
}

function saveStoredAccounts(accounts: StoredUserAccount[]): void {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts to localStorage', err);
  }
}

export const AuthApi = {
  /**
   * Retrieves current active session.
   */
  getCurrentSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const user: AuthUser = JSON.parse(raw);
      // Synchronize latest status from stored accounts in case of approval/rejection
      const accounts = getStoredAccounts();
      const updated = accounts.find((a) => a.id === user.id);
      if (updated) {
        const synced: AuthUser = {
          ...user,
          status: updated.status,
          role: updated.role,
          churchId: updated.churchId,
          churchName: updated.churchName,
          roomCode: updated.roomCode,
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(synced));
        return synced;
      }
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Stores user session.
   */
  saveSession(user: AuthUser): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  },

  /**
   * Clears active session.
   */
  logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  /**
   * POST /api/auth/signup
   * Handles user registration + multi-tenant room codes and approval statuses.
   */
  async signup(
    payload: SignUpPayload,
    tenants: ChurchTenant[],
    onAddTenant: (tenant: ChurchTenant) => void
  ): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Basic Validation
    const name = payload.name?.trim();
    const rawUsername = payload.username?.trim();
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;
    const confirmPassword = payload.confirmPassword;
    const isMemberRole = payload.roleType === 'MEMBER' || payload.onboardingType === 'join_church';

    if (!name || name.length < 2) {
      return { success: false, message: 'Please enter your full name.' };
    }

    if (!rawUsername || rawUsername.length < 3) {
      return { success: false, message: 'Please enter a unique username (at least 3 characters).' };
    }
    const cleanUsername = rawUsername.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) {
      return { success: false, message: 'Username must contain letters, numbers, or underscores.' };
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    const accounts = getStoredAccounts();
    const existingEmail = accounts.find((a) => a.email === email);
    if (existingEmail) {
      return { success: false, message: 'An account with this email address already exists. Please sign in.' };
    }

    let churchId = '';
    let churchName = '';
    let roomCode = '';
    let role: UserRole = 'MEMBER';
    let status: UserStatus = 'PENDING';
    const voicePart: VoicePart = payload.voicePart || 'Soprano';

    if (!isMemberRole) {
      // Option 1: Admin Registration Flow
      const newName = (payload.churchName || payload.newChurchName)?.trim();
      if (!newName || newName.length < 3) {
        return { success: false, message: 'Please provide a valid Church Name (minimum 3 characters).' };
      }

      // Generate unique Church Room Code e.g. "GC-8492"
      let generatedCode = generateChurchRoomCode(newName);
      let attempts = 0;
      while (tenants.some((t) => t.roomCode === generatedCode) && attempts < 10) {
        generatedCode = generateChurchRoomCode(newName);
        attempts++;
      }

      churchId = 'church-' + newName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
      churchName = newName;
      roomCode = generatedCode;
      role = 'ADMIN';
      status = 'APPROVED'; // Admins are automatically approved

      // Check username uniqueness in newly created church
      const existingUserInChurch = accounts.find(
        (a) => a.churchId === churchId && a.username.toLowerCase() === cleanUsername
      );
      if (existingUserInChurch) {
        return { success: false, message: `Username @${cleanUsername} is already taken. Please choose another.` };
      }

      const newTenant: ChurchTenant = {
        id: churchId,
        name: newName,
        roomCode: generatedCode,
        city: payload.newChurchCity?.trim() || 'Parish Community',
        denomination: payload.newChurchDenomination?.trim() || 'Ecclesiastical Fellowship',
        memberCount: 1,
        choirMasterName: name,
        motto: 'Sacred Harmony in Worship',
        inviteCode: generatedCode,
        createdAt: new Date().toISOString(),
      };

      onAddTenant(newTenant);
    } else {
      // Option 2: Member Registration Flow
      const enteredCode = (payload.roomCode || payload.inviteCode)?.trim().toUpperCase();
      if (!enteredCode) {
        return { success: false, message: 'Please enter your Church Room Number / Access Code.' };
      }

      // Validate Room Code against existing churches in database
      const matchedTenant = tenants.find(
        (t) =>
          t.roomCode?.toUpperCase() === enteredCode ||
          t.inviteCode?.toUpperCase() === enteredCode
      );

      if (!matchedTenant) {
        return {
          success: false,
          message: 'Invalid Church Room Code. Please check with your choir admin.',
        };
      }

      churchId = matchedTenant.id;
      churchName = matchedTenant.name;
      roomCode = matchedTenant.roomCode;
      role = 'MEMBER';
      status = 'PENDING'; // Member requests are pending approval

      // Enforce username uniqueness per church
      const existingUserInChurch = accounts.find(
        (a) => a.churchId === churchId && a.username.toLowerCase() === cleanUsername
      );
      if (existingUserInChurch) {
        return {
          success: false,
          message: `Username @${cleanUsername} is already taken in this church. Please choose a different username.`,
        };
      }
    }

    const newUser: StoredUserAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      fullName: name,
      username: cleanUsername,
      email,
      role,
      status,
      churchId,
      churchName,
      roomCode,
      voicePart: role === 'ADMIN' ? 'Director' : voicePart,
      provider: 'local',
      passwordHash: password,
      createdAt: new Date().toISOString(),
    };

    accounts.push(newUser);
    saveStoredAccounts(accounts);

    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      churchId: newUser.churchId,
      churchName: newUser.churchName,
      roomCode: newUser.roomCode,
      voicePart: newUser.voicePart,
      provider: newUser.provider,
      createdAt: newUser.createdAt,
    };

    AuthApi.saveSession(authUser);

    return {
      success: true,
      user: authUser,
      token: 'jwt-token-' + Date.now(),
      message:
        status === 'APPROVED'
          ? 'Account created successfully!'
          : `Join request submitted for ${churchName}. Awaiting Admin approval.`,
    };
  },

  /**
   * POST /api/auth/login
   * Authenticates user against registered accounts.
   */
  async login(payload: LoginPayload, tenants: ChurchTenant[]): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    if (!email || !password) {
      return { success: false, message: 'Please enter both your email address and password.' };
    }

    const accounts = getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === email);

    if (!account) {
      return {
        success: false,
        message: 'No account found with this email. Please check your credentials or Sign Up.',
      };
    }

    if (account.passwordHash && account.passwordHash !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    const church = tenants.find((t) => t.id === account.churchId);

    const authUser: AuthUser = {
      id: account.id,
      name: account.name,
      fullName: account.fullName || account.name,
      username: account.username || account.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      email: account.email,
      role: account.role,
      status: account.status || 'APPROVED',
      churchId: account.churchId,
      churchName: church?.name || account.churchName || 'Choir Guild',
      roomCode: church?.roomCode || account.roomCode,
      voicePart: account.voicePart || 'Soprano',
      provider: account.provider,
      createdAt: account.createdAt,
    };

    AuthApi.saveSession(authUser);

    return {
      success: true,
      user: authUser,
      token: 'jwt-token-' + Date.now(),
      message: 'Logged in successfully.',
    };
  },

  /**
   * POST /api/auth/social
   * Handles Google or Apple Social Sign-In with Church Room assignment.
   */
  async socialAuth(
    payload: SocialAuthPayload,
    tenants: ChurchTenant[],
    onAddTenant: (tenant: ChurchTenant) => void
  ): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const email = payload.email.toLowerCase();
    const accounts = getStoredAccounts();
    let account = accounts.find((a) => a.email.toLowerCase() === email);

    if (!account) {
      const isMember = payload.roleType === 'MEMBER' || payload.onboardingType === 'join_church';
      let churchId = '';
      let churchName = '';
      let roomCode = '';
      let role: UserRole = 'MEMBER';
      let status: UserStatus = 'PENDING';
      const voicePart: VoicePart = payload.voicePart || 'Soprano';

      const baseUsername =
        payload.username?.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '') ||
        payload.name.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 12);

      if (!isMember) {
        const newName = (payload.churchName || payload.newChurchName)?.trim() || `${payload.name}'s Choir`;
        roomCode = generateChurchRoomCode(newName);
        churchId = 'church-' + newName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
        churchName = newName;
        role = 'ADMIN';
        status = 'APPROVED';

        const newTenant: ChurchTenant = {
          id: churchId,
          name: newName,
          roomCode,
          city: payload.newChurchCity?.trim() || 'Parish Community',
          denomination: payload.newChurchDenomination?.trim() || 'Ecclesiastical Fellowship',
          memberCount: 1,
          choirMasterName: payload.name,
          motto: 'Sacred Harmony in Worship',
          inviteCode: roomCode,
          createdAt: new Date().toISOString(),
        };
        onAddTenant(newTenant);
      } else {
        const enteredCode = (payload.roomCode || payload.inviteCode)?.trim().toUpperCase();
        let matched = tenants.find(
          (t) =>
            t.roomCode?.toUpperCase() === enteredCode ||
            t.inviteCode?.toUpperCase() === enteredCode
        );
        if (!matched && payload.existingChurchId) {
          matched = tenants.find((t) => t.id === payload.existingChurchId);
        }
        if (!matched) {
          matched = tenants[0];
        }

        churchId = matched.id;
        churchName = matched.name;
        roomCode = matched.roomCode;
        role = 'MEMBER';
        status = 'PENDING';
      }

      account = {
        id: `user-social-${Date.now()}`,
        name: payload.name,
        fullName: payload.name,
        username: baseUsername,
        email,
        role,
        status,
        churchId,
        churchName,
        roomCode,
        voicePart,
        provider: payload.provider,
        createdAt: new Date().toISOString(),
      };
      accounts.push(account);
      saveStoredAccounts(accounts);
    }

    const church = tenants.find((t) => t.id === account.churchId);

    const authUser: AuthUser = {
      id: account.id,
      name: account.name,
      fullName: account.fullName || account.name,
      username: account.username,
      email: account.email,
      role: account.role,
      status: account.status || 'APPROVED',
      churchId: account.churchId,
      churchName: church?.name || account.churchName,
      roomCode: church?.roomCode || account.roomCode,
      voicePart: account.voicePart,
      provider: account.provider,
      createdAt: account.createdAt,
    };

    AuthApi.saveSession(authUser);

    return {
      success: true,
      user: authUser,
      token: 'jwt-social-' + Date.now(),
      message: `Successfully connected with ${payload.provider === 'apple' ? 'Apple' : 'Google'}.`,
    };
  },

  /**
   * Admin Action: Approve a pending choir member.
   */
  async approveMember(userId: string): Promise<boolean> {
    const accounts = getStoredAccounts();
    const target = accounts.find((a) => a.id === userId);
    if (!target) return false;

    target.status = 'APPROVED';
    saveStoredAccounts(accounts);

    // If current session is this user, update session as well
    const session = AuthApi.getCurrentSession();
    if (session && session.id === userId) {
      session.status = 'APPROVED';
      AuthApi.saveSession(session);
    }
    return true;
  },

  /**
   * Admin Action: Reject or remove a choir member request.
   */
  async rejectMember(userId: string): Promise<boolean> {
    const accounts = getStoredAccounts();
    const updated = accounts.filter((a) => a.id !== userId);
    saveStoredAccounts(updated);

    const session = AuthApi.getCurrentSession();
    if (session && session.id === userId) {
      AuthApi.logout();
    }
    return true;
  },

  /**
   * List church members partitioned into pending requests and approved roster.
   */
  getChurchMembers(churchId: string): { pending: StoredUserAccount[]; approved: StoredUserAccount[] } {
    const accounts = getStoredAccounts();
    const churchUsers = accounts.filter((a) => a.churchId === churchId);
    return {
      pending: churchUsers.filter((u) => u.status === 'PENDING'),
      approved: churchUsers.filter((u) => u.status === 'APPROVED' || !u.status),
    };
  },

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please provide a valid registered email address.' };
    }
    return {
      success: true,
      message: `Password reset link has been dispatched to ${email}. Please check your inbox.`,
    };
  },
};
