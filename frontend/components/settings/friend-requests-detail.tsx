"use client"

import { useState, useEffect } from "react"
import { getReceivedRequests, toggleFriendRequest, type UserSearchDto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, UserCheck, UserX } from "lucide-react"

interface FriendRequestsDetailProps {
  onBack: () => void
}

export function FriendRequestsDetail({ onBack }: FriendRequestsDetailProps) {
  const [requests, setRequests] = useState<UserSearchDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setIsLoading(true)
    try {
      const data = await getReceivedRequests()
      console.log('[FriendRequestsDetail] Loaded requests from API:', data)
      console.log('[FriendRequestsDetail] Number of requests:', data.length)
      setRequests(data)
    } catch (error) {
      console.error("Error loading requests:", error)
      toast({
        title: "Error",
        description: "Failed to load friend requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (userId: number) => {
    if (isUpdating[userId]) return

    setIsUpdating((prev) => ({ ...prev, [userId]: true }))
    try {
      const response = await toggleFriendRequest(userId)
      if (response.success) {
        setRequests((prev) => prev.filter((req) => req.id !== userId))
        toast({ title: "Success", description: response.message })
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      })
    } finally {
      setIsUpdating((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleDecline = async (userId: number) => {
    if (isUpdating[userId]) return

    setIsUpdating((prev) => ({ ...prev, [userId]: true }))
    try {
      const response = await toggleFriendRequest(userId)
      if (response.success) {
        setRequests((prev) => prev.filter((req) => req.id !== userId))
        toast({ title: "Success", description: "Friend request declined" })
      }
    } catch (error) {
      console.error("Error declining request:", error)
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive",
      })
    } finally {
      setIsUpdating((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-semibold">Friend Requests</h2>
      </div>

      {/* Friend Requests List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No pending friend requests</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="p-4 border border-border rounded-xl bg-card">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={request.avatarUrl || "/placeholder.svg"} alt={request.displayName} />
                  <AvatarFallback>{request.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{request.username}</div>
                  <div className="text-sm text-muted-foreground">{request.displayName}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAccept(request.id)}
                  disabled={isUpdating[request.id]}
                  className="flex-1 bg-[#0095f6] hover:bg-[#0095f6]/90 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {isUpdating[request.id] ? "..." : "Accept"}
                </Button>
                <Button
                  onClick={() => handleDecline(request.id)}
                  disabled={isUpdating[request.id]}
                  variant="outline"
                  className="flex-1 border-border hover:bg-muted bg-transparent disabled:opacity-50"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  {isUpdating[request.id] ? "..." : "Decline"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

