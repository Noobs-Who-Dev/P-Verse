import axiosInstance from '../api/axios';

export const userService = {
    getAllUsers: async () => {
        const response = await axiosInstance.get('/users');
        return response.data;
    },

    getUserById: async (id: number) => {
        const response = await axiosInstance.get(`/users/${id}`);
        return response.data;
    },

    createUser: async (userData: any) => {
        const response = await axiosInstance.post('/users', userData);
        return response.data;
    },

    updateUser: async (id: number, userData: any) => {
        const response = await axiosInstance.put(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id: number) => {
        const response = await axiosInstance.delete(`/users/${id}`);
        return response.data;
    },

    updateOnlineStatus: async (id: number, isOnline: boolean) => {
        const response = await axiosInstance.patch(`/users/${id}/online-status`, { isOnline });
        return response.data;
    }
};
