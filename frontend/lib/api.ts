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

// ============================================
// MOMENT API (Instagram Stories)
// ============================================

export type MomentVisibility = 'ALL_FRIENDS' | 'PRIVATE' | 'SPECIFIC_PERSON';

export interface CreateMomentRequest {
  image: File;
  caption?: string;
  visibility: MomentVisibility;
  specificUserId?: number;
}

export interface MomentResponseDTO {
  id: number;
  user: {
    id: number;
    username: string;
    avatarUrl: string | null;
    displayName: string;
  };
  caption: string | null;
  imagePath: string;
  visibility: MomentVisibility;
  specificUser: {
    id: number;
    username: string;
    avatarUrl: string | null;
    displayName: string;
  } | null;
  createdAt: string;
  reactionCount: number;
  hasReacted: boolean;
  reactionType: ReactionType | null;
  isSaved: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

/**
 * Tạo moment mới
 * POST /api/moments
 */
export async function createMoment(request: CreateMomentRequest): Promise<MomentResponseDTO> {
  try {
    const formData = new FormData();
    formData.append('image', request.image);

    if (request.caption) {
      formData.append('caption', request.caption);
    }

    formData.append('visibility', request.visibility);

    if (request.specificUserId) {
      formData.append('specificUserId', request.specificUserId.toString());
    }

    const response = await axiosInstance.post<ApiResponse<MomentResponseDTO>>(
      '/moments',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('[API] Create moment failed:', error);
    throw error;
  }
}

/**
 * Lấy moment feed với filter
 * GET /api/moments/feed?filter=all&page=0&size=20
 */
export async function getMomentFeed(
  filter: 'all' | 'friends' | 'mine' = 'all',
  page: number = 0,
  size: number = 20
) {
  try {
    const response = await axiosInstance.get<ApiResponse<any>>('/moments/feed', {
      params: { filter, page, size }
    });
    return response.data.data;
  } catch (error) {
    console.error('[API] Get moment feed failed:', error);
    throw error;
  }
}

/**
 * Lấy moment theo ID
 * GET /api/moments/{id}
 */
export async function getMomentById(id: number): Promise<MomentResponseDTO> {
  try {
    const response = await axiosInstance.get<ApiResponse<MomentResponseDTO>>(`/moments/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('[API] Get moment failed:', error);
    throw error;
  }
}

/**
 * Xóa moment
 * DELETE /api/moments/{id}
 */
export async function deleteMoment(id: number): Promise<void> {
  try {
    await axiosInstance.delete(`/moments/${id}`);
  } catch (error) {
    console.error('[API] Delete moment failed:', error);
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

// ============================================
// MOMENT REACTION API
// ============================================

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';

export interface ReactionRequest {
  reactionType: ReactionType;
}

export interface ReactionResponse {
  action: 'added' | 'removed' | 'updated';
  reactionType: ReactionType | null;
  totalReactions: number;
}

export interface UserReactionResponse {
  reactionType: ReactionType;
  createdAt: string;
}

/**
 * Add or toggle reaction to a moment
 * POST /api/moments/{momentId}/reactions
 */
export async function addMomentReaction(
  momentId: number,
  reactionType: ReactionType
): Promise<ReactionResponse> {
  try {
    const response = await axiosInstance.post<ApiResponse<ReactionResponse>>(
      `/moments/${momentId}/reactions`,
      { reactionType }
    );
    return response.data.data;
  } catch (error) {
    console.error('[API] Add moment reaction failed:', error);
    throw error;
  }
}

/**
 * Get current user's reaction for a moment
 * GET /api/moments/{momentId}/reactions/me
 */
export async function getMyReaction(momentId: number): Promise<UserReactionResponse | null> {
  try {
    const response = await axiosInstance.get<ApiResponse<UserReactionResponse>>(
      `/moments/${momentId}/reactions/me`
    );
    return response.data.data;
  } catch (error: any) {
    // 204 No Content means no reaction yet - this is normal
    if (error.response?.status === 204) {
      return null;
    }
    // Log other errors but don't throw - let component handle gracefully
    console.error('[API] Get my reaction failed:', error.message || error);
    return null; // Return null instead of throwing for better UX
  }
}

/**
 * Remove reaction from a moment
 * DELETE /api/moments/{momentId}/reactions
 */
export async function removeMomentReaction(momentId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/moments/${momentId}/reactions`);
  } catch (error) {
    console.error('[API] Remove moment reaction failed:', error);
    throw error;
  }
}

/**
 * Get recent reactions for a moment (for Activity button)
 * GET /api/moments/{momentId}/reactions/recent
 */
export async function getRecentReactions(momentId: number): Promise<{
  count: number;
  reactors: Array<{
    userId: number;
    username: string;
    avatarUrl: string;
    reactionType: ReactionType;
    createdAt: string;
  }>;
}> {
  try {
    const response = await axiosInstance.get<ApiResponse<{
      count: number;
      reactors: Array<{
        userId: number;
        username: string;
        avatarUrl: string;
        reactionType: string;
        createdAt: string;
      }>;
    }>>(`/moments/${momentId}/reactions/recent`);
    return response.data.data;
  } catch (error) {
    console.error('[API] Get recent reactions failed:', error);
    throw error;
  }
}

/**
 * Get activity data for a moment (views and reactions)
 * GET /api/moments/{momentId}/activity
 */
export async function getMomentActivity(momentId: number): Promise<{
  viewers: Array<{
    userId: number;
    username: string;
    avatarUrl: string;
    viewedAt: string;
  }>;
  reactions: Array<{
    userId: number;
    username: string;
    avatarUrl: string;
    reactionType: ReactionType;
    emoji: string;
    reactedAt: string;
  }>;
  totalViews: number;
  totalReactions: number;
}> {
  try {
    const response = await axiosInstance.get<ApiResponse<{
      viewers: Array<{
        userId: number;
        username: string;
        avatarUrl: string;
        viewedAt: string;
      }>;
      reactions: Array<{
        userId: number;
        username: string;
        avatarUrl: string;
        reactionType: string;
        emoji: string;
        reactedAt: string;
      }>;
      totalViews: number;
      totalReactions: number;
    }>>(`/moments/${momentId}/activity`);
    return response.data.data;
  } catch (error) {
    console.error('[API] Get moment activity failed:', error);
    throw error;
  }
}

// ============================================
// MOMENT SAVE API
// ============================================

/**
 * Save a moment
 * POST /api/moments/{momentId}/save
 */
export async function saveMoment(momentId: number): Promise<void> {
  try {
    await axiosInstance.post(`/moments/${momentId}/save`);
  } catch (error) {
    console.error('[API] Save moment failed:', error);
    throw error;
  }
}

/**
 * Unsave a moment
 * DELETE /api/moments/{momentId}/save
 */
export async function unsaveMoment(momentId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/moments/${momentId}/save`);
  } catch (error) {
    console.error('[API] Unsave moment failed:', error);
    throw error;
  }
}

/**
 * Get saved moments for current user
 * GET /api/moments/saved?page=0&size=20
 */
export async function getSavedMoments(
  page: number = 0,
  size: number = 20
): Promise<{
  content: MomentResponseDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: any;
  empty: boolean;
}> {
  try {
    const response = await axiosInstance.get<ApiResponse<any>>('/moments/saved', {
      params: { page, size }
    });
    return response.data.data;
  } catch (error) {
    console.error('[API] Get saved moments failed:', error);
    throw error;
  }
}

/**
 * Cập nhật moment
 * PUT /api/moments/{id}
 */
export async function updateMoment(id: number, request: UpdateMomentRequest): Promise<MomentResponseDTO> {
  try {
    const formData = new FormData();

    if (request.image) {
      formData.append('image', request.image);
    }

    if (request.caption !== undefined) {
      formData.append('caption', request.caption);
    }

    if (request.visibility) {
      formData.append('visibility', request.visibility);
    }

    if (request.specificUserId) {
      formData.append('specificUserId', request.specificUserId.toString());
    }

    const response = await axiosInstance.put<ApiResponse<MomentResponseDTO>>(
      `/moments/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('[API] Update moment failed:', error);
    throw error;
  }
}
