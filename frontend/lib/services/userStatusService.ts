import axiosInstance from '../api/axios';
import { UserStatus, UserStatusDto } from '../types/userStatus';

/**
 * User Status Service
 * Quản lý status của user (ONLINE, OFFLINE)
 */
export const userStatusService = {
  /**
   * Lấy status của user hiện tại
   */
  getMyStatus: async (): Promise<UserStatusDto> => {
    const response = await axiosInstance.get('/user-status/me');
    return response.data.data;
  },

  /**
   * Lấy status của một user cụ thể
   */
  getUserStatus: async (userId: number): Promise<UserStatusDto> => {
    const response = await axiosInstance.get(`/user-status/${userId}`);
    return response.data.data;
  },

  /**
   * Lấy status của nhiều users
   */
  getUsersStatus: async (userIds: number[]): Promise<UserStatusDto[]> => {
    const response = await axiosInstance.post('/user-status/batch', userIds);
    return response.data.data;
  },

  /**
   * Cập nhật status của user hiện tại
   */
  updateMyStatus: async (status: UserStatus): Promise<UserStatusDto> => {
    const response = await axiosInstance.put('/user-status/me', { status });
    return response.data.data;
  },

  /**
   * Ghi nhận hoạt động của user (reset OFFLINE timer)
   */
  recordActivity: async (): Promise<void> => {
    try {
      await axiosInstance.post('/user-status/activity');
    } catch (error) {
      console.error('Failed to record activity:', error);
    }
  },

  /**
   * Set user ONLINE
   */
  setOnline: async (): Promise<void> => {
    await axiosInstance.post('/user-status/online');
  },


  /**
   * Set user OFFLINE
   */
  setOffline: async (): Promise<void> => {
    await axiosInstance.post('/user-status/offline');
  },
};

