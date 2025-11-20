"use client"

import { useState, useEffect } from "react"
import { getReceivedRequests, toggleFriendRequest, type UserSearchDto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"


interface NotificationsPanelProps {
  onClose: () => void
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [friendRequests, setFriendRequests] = useState<UserSearchDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  useEffect(() => {
    loadFriendRequests()
  }, [])

  const loadFriendRequests = async () => {
    setIsLoading(true)
    try {
      const data = await getReceivedRequests()
      setFriendRequests(data)
    } catch (error) {
      console.error("Error loading friend requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (userId: number) => {
    if (isAccepting[userId]) return

    setIsAccepting((prev) => ({ ...prev, [userId]: true }))
    try {
      const response = await toggleFriendRequest(userId)
      if (response.success) {
        setFriendRequests((prev) => prev.filter((req) => req.id !== userId))
        toast({
          title: "Success",
          description: "Friend request accepted"
        })
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      })
    } finally {
      setIsAccepting((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="fixed left-[73px] top-0 bottom-0 w-[400px] bg-background border-r border-border z-30 animate-in slide-in-from-left overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Notifications</h2>

        {/* Friend Requests Section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : friendRequests.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Friend Requests</h3>

            {friendRequests.map((request) => (
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
                  className="bg-[#0095f6] hover:bg-[#0095f6]/90 text-white disabled:opacity-50"
                >
                  {isAccepting[request.id] ? "..." : "Accept"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No new notifications</p>
            <p className="text-sm text-muted-foreground">When you get notifications, they'll appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
