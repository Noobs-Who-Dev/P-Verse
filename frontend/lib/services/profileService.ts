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
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    const response = await axiosInstance.put('/users/password', data);
    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<any> => {
    const response = await axiosInstance.get('/users/me');
    return response.data.data;
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Remove avatar
   */
  removeAvatar: async (): Promise<any> => {
    const response = await axiosInstance.delete('/users/avatar');
    return response.data.data;
  },
};

