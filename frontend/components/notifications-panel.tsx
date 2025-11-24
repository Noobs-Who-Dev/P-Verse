"use client"

import { useState, useEffect } from "react"
import { getReceivedRequests, toggleFriendRequest, type UserSearchDto, getRecentFriendMomentsForNotifications, type MomentResponseDTO, deleteNotification } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/authContext"
import { useNotificationsSocket } from "@/hooks/use-notifications-socket"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface NotificationsPanelProps {
  onClose: () => void
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [friendRequests, setFriendRequests] = useState<UserSearchDto[]>([])
  const [postNotifications, setPostNotifications] = useState<Array<{
    notificationId: number;
    type: string;
    sender: UserSearchDto;
    moment: MomentResponseDTO;
  }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith("http")) return avatarUrl
    const clean = avatarUrl.startsWith("/") ? avatarUrl.slice(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${clean}`
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith("http")) return imagePath
    const clean = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${clean}`
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const friendData = await getReceivedRequests()
      setFriendRequests(friendData)

      try {
        const posts = await getRecentFriendMomentsForNotifications(10)
        setPostNotifications(posts)
      } catch {
        setPostNotifications([])
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (userId: number) => {
    if (isAccepting[userId]) return
    setIsAccepting(p => ({ ...p, [userId]: true }))
    try {
      const res = await toggleFriendRequest(userId)
      if (res.success) {
        setFriendRequests(prev => prev.filter(r => r.id !== userId))
        toast({ title: "Success", description: "Friend request accepted" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to accept request", variant: "destructive" })
    } finally {
      setIsAccepting(p => ({ ...p, [userId]: false }))
    }
  }

  const handleDismiss = async (notificationId: number) => {
    // Optimistic update: Remove from UI immediately
    setPostNotifications(prev => prev.filter(n => n.notificationId !== notificationId))

    try {
      await deleteNotification(notificationId)
    } catch (error) {
      console.error("Failed to delete notification", error)
      // Optionally rollback UI if needed
      loadNotifications() // Reload to sync state
    }
  }

  const handleNewNotification = (data: any) => {
    // Since we use hard delete, reload to get new notifications
    loadNotifications()
  }

  useNotificationsSocket(handleNewNotification);

  const noNotifications =
    !isLoading &&
    friendRequests.length === 0 &&
    postNotifications.length === 0

  return (
    <div className="fixed left-[73px] top-0 bottom-0 w-[400px] bg-background border-r border-border z-30 animate-in slide-in-from-left overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Notifications</h2>

        {/* FRIEND REQUESTS */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : friendRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Friend Requests</h3>

            {friendRequests.map(request => (
              <div key={request.id} className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg mb-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={getAvatarUrl(request.avatarUrl)} />
                  <AvatarFallback>{(request.displayName || request.username)[0].toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="font-medium text-sm">{request.displayName || request.username}</div>
                  <div className="text-xs text-muted-foreground">@{request.username}</div>
                </div>

                <Button
                  onClick={() => handleAccept(request.id)}
                  disabled={isAccepting[request.id]}
                  size="sm"
                  className="bg-[#0095f6] hover:bg-[#0095f6]/90 text-white"
                >
                  {isAccepting[request.id] ? "..." : "Accept"}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* POSTS SECTION */}
        {postNotifications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Posts</h3>

            {postNotifications
              .map(post => {
                // Post notification (NEW_POST)
                const moment = post.moment
                return (
                  <div
                    key={post.notificationId}
                    className="relative flex items-center gap-3 p-3 hover:bg-muted rounded-lg mb-2 border border-border"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getAvatarUrl(moment.user.avatarUrl)} />
                      <AvatarFallback>{moment.user.displayName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-semibold">{moment.user.displayName}</span>
                        <span className="text-muted-foreground ml-1">posted a new photo</span>
                      </div>

                      {moment.caption && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          "{moment.caption}"
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-1">{moment.timeAgo}</div>
                    </div>

                    <img
                      src={getImageUrl(moment.imagePath)}
                      className="w-12 h-12 rounded-md object-cover"
                    />

                    <button
                      onClick={() => handleDismiss(post.notificationId)}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
          </div>
        )}

        {/* NO NOTIFICATIONS (only when BOTH are empty) */}
        {noNotifications && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  )
}
