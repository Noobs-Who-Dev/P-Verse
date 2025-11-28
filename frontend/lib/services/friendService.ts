import axiosInstance from '../api/axios';

export interface FriendshipStatus {
    status: 'FRIEND' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'STRANGER';
}

export interface UserSearchDto {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string;
    friendshipStatus: FriendshipStatus;
    mutualFriendsCount?: number;
}

export const friendService = {
    // Search users - empty keyword returns all users
    searchUsers: async (keyword: string = ''): Promise<UserSearchDto[]> => {
        const response = await axiosInstance.get('/friends/search', {
            params: { keyword }
        });
        return response.data;
    },

    // Get friends list
    getFriends: async (): Promise<UserSearchDto[]> => {
        const response = await axiosInstance.get('/friends');
        return response.data;
    },

    // Get received friend requests
    getReceivedRequests: async (): Promise<UserSearchDto[]> => {
        const response = await axiosInstance.get('/friends/requests/received');
        return response.data;
    },

    // Get sent friend requests
    getSentRequests: async (): Promise<UserSearchDto[]> => {
        const response = await axiosInstance.get('/friends/requests/sent');
        return response.data;
    },

    // Toggle friend request (send/cancel)
    toggleFriendRequest: async (targetUserId: number) => {
        const response = await axiosInstance.post('/friends/request', {
            targetUserId
        });
        return response.data;
    },

    // Unfriend
    unfriend: async (targetUserId: number) => {
        const response = await axiosInstance.delete(`/friends/${targetUserId}`);
        return response.data;
    },

    // Get suggested users (users who are not friends yet)
    getSuggestedUsers: async (limit: number = 5): Promise<UserSearchDto[]> => {
        // Use search with empty keyword to get all users
        const allUsers = await friendService.searchUsers('');

        // Filter to get only strangers (not friends, not pending)
        const strangers = allUsers.filter(user =>
            user.friendshipStatus.status === 'STRANGER'
        );

        // Return limited results
        return strangers.slice(0, limit);
    }
};

