"use client"

import { useState, useEffect } from "react"
import { getReceivedRequests, toggleFriendRequest, type UserSearchDto, getRecentFriendMomentsForNotifications, type MomentResponseDTO } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface NotificationsPanelProps {
  onClose: () => void
}

const mockPostNotifications = [
  {
    id: 101,
    user: {
      username: "john_doe",
      displayName: "John Doe",
      avatarUrl: null,
    },
    caption: "A new sunny day!",
    imagePath: "/data/uploads/moments/8/file_20251120_232407_29aabe23.jpg",
    timeAgo: "just now",
  },
  {
    id: 102,
    user: {
      username: "mika_chan",
      displayName: "Mika Chan",
      avatarUrl: null,
    },
    caption: "Story update ✨",
    imagePath: "data/uploads/moments/15/file_20251119_002533_8bd525e3.jpg",
    timeAgo: "2 minutes ago",
  }
]

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [friendRequests, setFriendRequests] = useState<UserSearchDto[]>([])
  const [postNotifications, setPostNotifications] = useState<MomentResponseDTO[] | any[]>([])
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    const stored = localStorage.getItem("dismissedNotifications")
    if (stored) {
      try {
        setDismissedNotifications(new Set(JSON.parse(stored)))
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("dismissedNotifications", JSON.stringify([...dismissedNotifications]))
  }, [dismissedNotifications])

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
        setPostNotifications(mockPostNotifications)
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

  const handleDismiss = (id: number) => {
    setDismissedNotifications(prev => new Set(prev).add(id))
  }

  const noNotifications =
    !isLoading &&
    friendRequests.length === 0 &&
    postNotifications.filter(n => !dismissedNotifications.has(n.id)).length === 0

  return (
    <div className="fixed left-[73px] top-0 bottom-0 w-[400px] bg-background border-r border-border z-30 animate-in slide-in-from-left overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Notifications</h2>

        {/* FRIEND REQUESTS FIRST */}
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
              .filter(post => !dismissedNotifications.has(post.id))
              .map(post => {
                const isMoment = "user" in post

                if (isMoment) {
                  const moment = post as MomentResponseDTO
                  return (
                    <div
                      key={moment.id}
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
                        onClick={() => handleDismiss(moment.id)}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                }

                return (
                  <div key={post.id} className="relative p-3 hover:bg-muted rounded-lg mb-3 border border-border">
                    <button
                      onClick={() => handleDismiss(post.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-3 pr-8">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={getAvatarUrl(post.avatarUrl)} />
                        <AvatarFallback>{post.displayName[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="font-medium text-sm mb-2">{post.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          @{post.username} {post.message}
                        </div>
                      </div>
                    </div>
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
