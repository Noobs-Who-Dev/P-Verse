"use client"

import { useState, useEffect } from "react"
import { getSentRequests, toggleFriendRequest, type UserSearchDto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, X } from "lucide-react"

interface SentRequestsDetailProps {
  onBack: () => void
}

export function SentRequestsDetail({ onBack }: SentRequestsDetailProps) {
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
      const data = await getSentRequests()
      setRequests(data)
    } catch (error) {
      console.error("Error loading sent requests:", error)
      toast({
        title: "Error",
        description: "Failed to load sent friend requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (userId: number) => {
    if (isUpdating[userId]) return

    setIsUpdating((prev) => ({ ...prev, [userId]: true }))
    try {
      const response = await toggleFriendRequest(userId)
      if (response.success) {
        setRequests((prev) => prev.filter((req) => req.id !== userId))
        toast({ title: "Success", description: "Friend request cancelled" })
      }
    } catch (error) {
      console.error("Error cancelling request:", error)
      toast({
        title: "Error",
        description: "Failed to cancel friend request",
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
        <h2 className="text-2xl font-semibold">Sent Friend Requests</h2>
      </div>

      {/* Sent Requests List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No pending sent requests</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="p-4 border border-border rounded-xl bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={request.avatarUrl || "/placeholder.svg"} alt={request.displayName} />
                    <AvatarFallback>{request.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{request.username}</div>
                    <div className="text-sm text-muted-foreground">{request.displayName}</div>
                  </div>
                </div>
                <Button
                  onClick={() => handleCancel(request.id)}
                  disabled={isUpdating[request.id]}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-500/90 hover:bg-red-500/10 disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  {isUpdating[request.id] ? "..." : "Cancel"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

