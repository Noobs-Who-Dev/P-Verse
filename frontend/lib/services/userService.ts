import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Configure axios interceptors
if (typeof window !== 'undefined') {
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
            return Promise.reject(error);
        }
    );
}

export const userService = {
    getAllUsers: async () => {
        const response = await axios.get(`${API_BASE_URL}/users`);
        return response.data;
    },

    getUserById: async (id: number) => {
        const response = await axios.get(`${API_BASE_URL}/users/${id}`);
        return response.data;
    },

    createUser: async (userData: any) => {
        const response = await axios.post(`${API_BASE_URL}/users`, userData);
        return response.data;
    },

    updateUser: async (id: number, userData: any) => {
        const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id: number) => {
        const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
        return response.data;
    },

    updateOnlineStatus: async (id: number, isOnline: boolean) => {
        const response = await axios.patch(`${API_BASE_URL}/users/${id}/online-status`, { isOnline });
        return response.data;
    }
};
