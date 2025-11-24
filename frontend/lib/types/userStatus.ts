// User Status Types
export enum UserStatus {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  OFFLINE = 'OFFLINE'
}

export interface UserStatusDto {
  userId: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: UserStatus;
  lastSeenAt?: string;
  lastActivityAt?: string;
}

export interface UserWithStatus {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  status: UserStatus;
  lastSeenAt?: string;
  lastActivityAt?: string;
}

