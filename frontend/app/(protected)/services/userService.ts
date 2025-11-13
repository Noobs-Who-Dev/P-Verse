const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const userService = {
    getUserById: async (id: number) => {
        const res = await fetch(`${API_URL}/users/${id}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
    },

    updateUser: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    },

    updateOnlineStatus: async (id: number, isOnline: boolean) => {
        const res = await fetch(`${API_URL}/users/${id}/online-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isOnline })
        });
        if (!res.ok) throw new Error('Failed to update online status');
    }
};
