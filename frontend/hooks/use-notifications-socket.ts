import { useEffect } from 'react';
import { websocketService } from '@/lib/services/websocketService';
import { useAuth } from '@/lib/auth/authContext';

export function useNotificationsSocket(onNotification: (data: any) => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Connect WebSocket if not connected
    if (!websocketService.isConnected()) {
      websocketService.connect(user.id);
    }

    // Subscribe to notifications
    const unsubscribe = websocketService.onNotification(onNotification);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [user?.id, onNotification]);
}
