// API service for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

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
  | "FRIEND"           // Đã là bạn bè
  | "PENDING_SENT"     // Đã gửi lời mời kết bạn
  | "PENDING_RECEIVED" // Nhận được lời mời kết bạn
  | "STRANGER"         // Người lạ
  | "BLOCKED"          // Đã bị block

export interface ToggleFriendRequestResponse {
  success: boolean
  newStatus: FriendshipStatus
  message: string
  error?: string
}

// Helper function to get auth token (you'll need to implement this based on your auth system)
function getAuthToken(): string {
  // TODO: Implement getting token from cookies, localStorage, or context
  // For now, return a mock token or empty string
  return typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : ''
}

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const fullUrl = `${API_BASE_URL}${url}`
    console.log(`[API] Calling: ${options.method || 'GET'} ${fullUrl}`)

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response
  } catch (error) {
    // Check if it's a network error (backend not running)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend server is running on port 8080.`
      )
    }
    throw error
  }
}

/**
 * Tìm kiếm users theo keyword
 * GET /api/friends/search?keyword=john
 */
export async function searchUsers(keyword: string): Promise<UserSearchDto[]> {
  if (!keyword.trim()) {
    return []
  }

  const response = await fetchWithAuth(
    `/api/friends/search?keyword=${encodeURIComponent(keyword)}`
  )

  return response.json()
}

/**
 * Toggle friend request (Add/Cancel)
 * POST /api/friends/request
 */
export async function toggleFriendRequest(
  targetUserId: number
): Promise<ToggleFriendRequestResponse> {
  const response = await fetchWithAuth('/api/friends/request', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  })

  return response.json()
}

/**
 * Unfriend
 * DELETE /api/friends/{targetUserId}
 */
export async function unfriend(targetUserId: number): Promise<{ success: boolean; message: string }> {
  const response = await fetchWithAuth(`/api/friends/${targetUserId}`, {
    method: 'DELETE',
  })

  return response.json()
}

/**
 * Lấy danh sách bạn bè
 * GET /api/friends
 */
export async function getFriends(): Promise<UserSearchDto[]> {
  const response = await fetchWithAuth('/api/friends')
  return response.json()
}

/**
 * Lấy danh sách friend requests đã nhận
 * GET /api/friends/requests/received
 */
export async function getReceivedRequests(): Promise<UserSearchDto[]> {
  const response = await fetchWithAuth('/api/friends/requests/received')
  return response.json()
}

/**
 * Lấy danh sách friend requests đã gửi
 * GET /api/friends/requests/sent
 */
export async function getSentRequests(): Promise<UserSearchDto[]> {
  const response = await fetchWithAuth('/api/friends/requests/sent')
  return response.json()
}

