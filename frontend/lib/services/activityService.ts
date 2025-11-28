import axiosInstance from '@/lib/api/axios'

export interface UserActivityStats {
  totalPosts: number
  totalComments: number
  totalLikes: number
  timeSpentToday: string
  timeSpentWeek: string
  totalMoments: number
}

export interface ActivityItem {
  id: number
  type: 'post' | 'comment' | 'like' | 'moment'
  content: string
  timestamp: string
  timeAgo: string
  target?: {
    id: number
    username: string
    displayName: string
    avatarUrl?: string
  }
}

export const activityService = {
  /**
   * Get user activity statistics
   */
  getActivityStats: async (): Promise<UserActivityStats> => {
    const response = await axiosInstance.get('/activity/stats')
    return response.data
  },

  /**
   * Get recent activity items
   */
  getRecentActivity: async (limit: number = 20): Promise<ActivityItem[]> => {
    const response = await axiosInstance.get('/activity/recent', {
      params: { limit }
    })
    return response.data
  }
}

