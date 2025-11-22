"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Heart, MessageCircle, Image as ImageIcon, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/I18nContext"
import { getAvatarUrl } from "@/lib/utils/avatar"
import { Button } from "@/components/ui/button"
import { activityService, type UserActivityStats, type ActivityItem } from "@/lib/services/activityService"
import { useToast } from "@/hooks/use-toast"

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ActivityModal({ isOpen, onClose }: ActivityModalProps) {
  const { t } = useI18n()
  const { toast } = useToast()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<UserActivityStats>({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    timeSpentToday: "0h 0m",
    timeSpentWeek: "0h 0m",
    totalMoments: 0
  })

  useEffect(() => {
    if (isOpen) {
      loadActivity()
    }
  }, [isOpen])

  const loadActivity = async () => {
    setIsLoading(true)
    try {
      // Gọi API thật để lấy stats và activities
      const [statsData, activitiesData] = await Promise.all([
        activityService.getActivityStats(),
        activityService.getRecentActivity(20)
      ])

      setStats(statsData)
      setActivities(activitiesData)

    } catch (error: any) {
      console.error("Failed to load activity:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load activity data",
        variant: "destructive"
      })

      // Fallback to empty data on error
      setStats({
        totalPosts: 0,
        totalComments: 0,
        totalLikes: 0,
        timeSpentToday: "0h 0m",
        timeSpentWeek: "0h 0m",
        totalMoments: 0
      })
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearchHistory = () => {
    // TODO: Implement clear search history
    console.log("Clear search history")
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "post":
        return <ImageIcon className="w-4 h-4" />
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {t('yourActivity')}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="time">Time Spent</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-secondary rounded-lg text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <div className="text-sm text-muted-foreground">{t('posts')}</div>
              </div>
              <div className="p-4 bg-secondary rounded-lg text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stats.totalComments}</div>
                <div className="text-sm text-muted-foreground">{t('comments')}</div>
              </div>
              <div className="p-4 bg-secondary rounded-lg text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{stats.totalLikes}</div>
                <div className="text-sm text-muted-foreground">{t('likes')}</div>
              </div>
            </div>

            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2">Recent Summary</h3>
              <p className="text-sm text-muted-foreground">
                You've been active on P-verse! You posted {stats.totalPosts} times,
                commented {stats.totalComments} times, and liked {stats.totalLikes} posts.
              </p>
            </div>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="recent" className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('loading')}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            ) : (
              activities.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.content}</p>
                    {activity.target && (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={getAvatarUrl(activity.target.avatarUrl)} />
                          <AvatarFallback>{activity.target.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          @{activity.target.username}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Time Spent Tab */}
          <TabsContent value="time" className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Today</h3>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{stats.timeSpentToday}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Time spent on P-verse today
              </p>
            </div>

            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">This Week</h3>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{stats.timeSpentWeek}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Total time this week
              </p>
            </div>

            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-3">Search History</h3>
              <div className="space-y-2 mb-3">
                <div className="text-sm p-2 bg-background rounded">
                  Recent searches will appear here
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearchHistory}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Search History
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

