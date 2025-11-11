import axiosInstance from '@/lib/api/axios';

const API_URL = '/users';

export const settingsService = {
    getSettings: async (userId: number) => {
        const response = await axiosInstance.get(`${API_URL}/${userId}/settings`);
        return response.data;
    },

    updateSettings: async (userId: number, settings: { theme?: string; language?: string; notificationsEnabled?: boolean }) => {
        const response = await axiosInstance.put(`${API_URL}/${userId}/settings`, settings);
        return response.data;
    },

    updateTheme: async (userId: number, theme: string) => {
        const response = await axiosInstance.put(`${API_URL}/${userId}/settings/theme?theme=${theme}`);
        return response.data;
    },

    updateLanguage: async (userId: number, language: string) => {
        const response = await axiosInstance.put(`${API_URL}/${userId}/settings/language?language=${language}`);
        return response.data;
    },

    toggleNotifications: async (userId: number) => {
        const response = await axiosInstance.put(`${API_URL}/${userId}/settings/notifications`);
        return response.data;
    }
};



