import axiosInstance from '@/lib/api/axios';

export const userService = {
    getUserById: async (id: number) => {
        const response = await axiosInstance.get(`/users/${id}`);
        return response.data;
    },

    updateUser: async (id: number, data: any) => {
        const response = await axiosInstance.put(`/users/${id}`, data);
        return response.data;
    },

    updateOnlineStatus: async (id: number, isOnline: boolean) => {
        await axiosInstance.patch(`/users/${id}/online-status`, { isOnline });
    }
};
