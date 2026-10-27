import { UserRole, UserStatus, VoicePart } from './choir';

export type AuthProvider = 'local' | 'google' | 'apple';

export interface AuthUser {
  id: string;
  name: string;
  fullName?: string;
  username: string; // Unique per church room
  email: string;
  role: UserRole;
  status: UserStatus;
  churchId: string;
  churchName?: string;
  roomCode?: string;
  voicePart: VoicePart;
  provider: AuthProvider;
  avatarUrl?: string;
  createdAt: string;
}

export type OnboardingType = 'create_church' | 'join_church';

export interface SignUpPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleType: 'ADMIN' | 'MEMBER';
  // If ADMIN (Option 1):
  churchName?: string;
  newChurchCity?: string;
  newChurchDenomination?: string;
  // If MEMBER (Option 2):
  roomCode?: string;
  voicePart?: VoicePart;
  // Compatibility fields
  onboardingType?: OnboardingType;
  newChurchName?: string;
  existingChurchId?: string;
  inviteCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SocialAuthPayload {
  provider: 'google' | 'apple';
  email: string;
  name: string;
  username?: string;
  roleType: 'ADMIN' | 'MEMBER';
  churchName?: string;
  roomCode?: string;
  voicePart?: VoicePart;
  onboardingType?: OnboardingType;
  newChurchName?: string;
  newChurchCity?: string;
  newChurchDenomination?: string;
  existingChurchId?: string;
  inviteCode?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}
