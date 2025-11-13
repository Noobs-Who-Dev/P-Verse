// API service for backend communication
import axiosInstance from './api/axios';

// Types matching backend DTOs
export interface UserSearchDto {
  id: number
  username: string
  email: string
  displayName: string
  avatarUrl: string | null
  isOnline: boolean
  lastSeenAt: string | null
  friendshipStatus: FriendshipStatus
}

export type FriendshipStatus =
  | "FRIEND"           // Da la ban be
  | "PENDING_SENT"     // Da gui loi moi ket ban
  | "PENDING_RECEIVED" // Nhan duoc loi moi ket ban
  | "STRANGER"         // Nguoi la
  | "BLOCKED"          // Da bi block

export interface ToggleFriendRequestResponse {
  success: boolean
  newStatus: FriendshipStatus
  message: string
  error?: string
}

/**
 * Tim kiem users theo keyword
 * GET /api/friends/search?keyword=john
 */
export async function searchUsers(keyword: string): Promise<UserSearchDto[]> {
  if (!keyword.trim()) {
    return []
  }

  try {
    const response = await axiosInstance.get(`/friends/search`, {
      params: { keyword: keyword.trim() }
    });
    return response.data;
  } catch (error) {
    console.error('[API] Search users failed:', error);
    throw error;
  }
}

/**
 * Toggle friend request (Add/Cancel)
 * POST /api/friends/request
 */
export async function toggleFriendRequest(
  targetUserId: number
): Promise<ToggleFriendRequestResponse> {
  try {
    const response = await axiosInstance.post('/friends/request', { targetUserId });
    return response.data;
  } catch (error) {
    console.error('[API] Toggle friend request failed:', error);
    throw error;
  }
}

/**
 * Unfriend
 * DELETE /api/friends/{targetUserId}
 */
export async function unfriend(targetUserId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axiosInstance.delete(`/friends/${targetUserId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Unfriend failed:', error);
    throw error;
  }
}

/**
 * Lay danh sach ban be
 * GET /api/friends
 */
export async function getFriends(): Promise<UserSearchDto[]> {
  try {
    const response = await axiosInstance.get('/friends');
    return response.data;
  } catch (error) {
    console.error('[API] Get friends failed:', error);
    throw error;
  }
}

/**
 * Lay danh sach friend requests da nhan
 * GET /api/friends/requests/received
 */
export async function getReceivedRequests(): Promise<UserSearchDto[]> {
  try {
    const response = await axiosInstance.get('/friends/requests/received');
    return response.data;
  } catch (error) {
    console.error('[API] Get received requests failed:', error);
    throw error;
  }
}

/**
 * Lay danh sach friend requests da gui
 * GET /api/friends/requests/sent
 */
export async function getSentRequests(): Promise<UserSearchDto[]> {
  try {
    const response = await axiosInstance.get('/friends/requests/sent');
    return response.data;
  } catch (error) {
    console.error('[API] Get sent requests failed:', error);
    throw error;
  }
}

