// Types for Profile feature

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
    lastSeenAt?: string;
    createdAt: string;
  };
  stats: ProfileStats;
  isOwnProfile: boolean;
  relationshipStatus?: "FRIEND" | "PENDING_SENT" | "PENDING_RECEIVED" | "STRANGER" | "BLOCKED";
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
}

