"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserStatus, UserStatusDto } from '@/lib/types/userStatus';
import { userStatusService } from '@/lib/services/userStatusService';
import { websocketService } from '@/lib/services/websocketService';
import { useAuth } from '@/lib/auth/authContext';

interface UserStatusContextType {
  userStatuses: Map<number, UserStatusDto>;
  myStatus: UserStatus | null;
  setMyStatus: (status: UserStatus) => Promise<void>;
  getUserStatus: (userId: number) => UserStatusDto | undefined;
  recordActivity: () => void;
}

const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export function UserStatusProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [userStatuses, setUserStatuses] = useState<Map<number, UserStatusDto>>(new Map());
  const [myStatus, setMyStatusState] = useState<UserStatus | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Load my status on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadMyStatus();

      // Set user ONLINE when component mounts
      userStatusService.setOnline().catch(console.error);

      // Load friends' status after a short delay
      setTimeout(() => {
        loadFriendsStatus();
      }, 1000);
    }
  }, [isAuthenticated, user]);

  // Subscribe to WebSocket status updates
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Ensure WebSocket is connected first
    if (!websocketService.isConnected()) {
      console.log('🔌 WebSocket not connected, connecting for user:', user.id);
      websocketService.connect(user.id);
    }

    const unsubscribe = websocketService.onUserStatus((statusUpdate: UserStatusDto) => {
      console.log('👤 Received status update:', statusUpdate);

      setUserStatuses(prev => {
        const updated = new Map(prev);
        updated.set(statusUpdate.userId, statusUpdate);
        return updated;
      });

      // Update my status if it's me
      if (user && statusUpdate.userId === user.id) {
        setMyStatusState(statusUpdate.status);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, user]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleActivity = () => {
      const now = Date.now();
      // Only record if more than 30 seconds since last activity
      if (now - lastActivity > 30000) {
        setLastActivity(now);
        userStatusService.recordActivity();
      }
    };

    // Listen to user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, user, lastActivity]);

  // Set OFFLINE when user leaves
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable logout status update
      const token = localStorage.getItem('token');
      if (token) {
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-status/offline`,
          JSON.stringify({})
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, user]);

  const loadMyStatus = async () => {
    try {
      const status = await userStatusService.getMyStatus();
      setMyStatusState(status.status);
      setUserStatuses(prev => {
        const updated = new Map(prev);
        updated.set(status.userId, status);
        return updated;
      });
    } catch (error) {
      console.error('Failed to load my status:', error);
    }
  };

  const loadFriendsStatus = async () => {
    try {
      // Load friends list
      const { friendService } = await import('@/lib/services/friendService');
      const friends = await friendService.getFriends();

      if (friends.length > 0) {
        // Get friend IDs
        const friendIds = friends.map(f => f.id);
        console.log('📥 Loading status for friends:', friendIds);

        // Batch fetch their statuses
        const statuses = await userStatusService.getUsersStatus(friendIds);
        console.log('✅ Received statuses:', statuses);

        // Update state
        setUserStatuses(prev => {
          const updated = new Map(prev);
          statuses.forEach(status => {
            updated.set(status.userId, status);
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to load friends status:', error);
    }
  };

  const setMyStatus = async (status: UserStatus) => {
    try {
      const updated = await userStatusService.updateMyStatus(status);
      setMyStatusState(updated.status);
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  };

  const getUserStatus = (userId: number): UserStatusDto | undefined => {
    return userStatuses.get(userId);
  };

  const recordActivity = () => {
    const now = Date.now();
    if (now - lastActivity > 30000) {
      setLastActivity(now);
      userStatusService.recordActivity();
    }
  };

  return (
    <UserStatusContext.Provider value={{
      userStatuses,
      myStatus,
      setMyStatus,
      getUserStatus,
      recordActivity
    }}>
      {children}
    </UserStatusContext.Provider>
  );
}

export function useUserStatus() {
  const context = useContext(UserStatusContext);
  if (context === undefined) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
}

