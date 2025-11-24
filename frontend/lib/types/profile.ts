// Types for Profile feature

import { UserStatus } from './userStatus';

export interface ProfileStats {
  userId: number;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface UserProfile {
  user: {
    id: number;
    username: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    bio?: string;
    isOnline: boolean;
    status: UserStatus;
    lastSeenAt?: string;
    lastActivityAt?: string;
    createdAt: string;
  };
  stats: ProfileStats;
  isOwnProfile: boolean;
  relationshipStatus?: "FRIEND" | "PENDING_SENT" | "PENDING_RECEIVED" | "STRANGER" | "BLOCKED";
}

export interface UpdateProfileData {
  username?: string;
  displayName?: string;
  email?: string;
  bio?: string;
}

