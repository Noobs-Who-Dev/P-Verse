import axiosInstance from '../api/axios';
import { UserProfile, UpdateProfileData } from '../types/profile';

export const profileService = {
  /**
   * Get user profile by ID
   */
  getUserProfile: async (userId: number): Promise<UserProfile> => {
    const response = await axiosInstance.get(`/users/${userId}/profile`);
    return response.data.data; // ApiResponse wrapper
  },

  /**
   * Update own profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<any> => {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<any> => {
    const response = await axiosInstance.get('/users/me');
    return response.data.data;
  },
};

