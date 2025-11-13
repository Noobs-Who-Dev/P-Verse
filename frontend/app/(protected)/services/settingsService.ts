const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const settingsService = {
    getSettings: async (userId: number) => {
        const res = await fetch(`${API_URL}/users/${userId}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },

    updateSettings: async (userId: number, settings: { theme?: string; language?: string; notificationsEnabled?: boolean }) => {
        const res = await fetch(`${API_URL}/users/${userId}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        if (!res.ok) throw new Error('Failed to update settings');
        return res.json();
    },

    updateTheme: async (userId: number, theme: string) => {
        const res = await fetch(`${API_URL}/users/${userId}/settings/theme`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme })
        });
        if (!res.ok) throw new Error('Failed to update theme');
        return res.json();
    },

    updateLanguage: async (userId: number, language: string) => {
        const res = await fetch(`${API_URL}/users/${userId}/settings/language`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language })
        });
        if (!res.ok) throw new Error('Failed to update language');
        return res.json();
    },

    toggleNotifications: async (userId: number, enabled: boolean) => {
        const res = await fetch(`${API_URL}/users/${userId}/settings/notifications`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationsEnabled: enabled })
        });
        if (!res.ok) throw new Error('Failed to toggle notifications');
        return res.json();
    }
};

