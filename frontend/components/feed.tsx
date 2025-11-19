"use client"

import { Post } from "@/components/post"
import { useState, useEffect } from "react"
import { SendToFriendsModal } from "@/components/send-to-friends-modal"
import { getMomentFeed, MomentResponseDTO } from "@/lib/api"
import { Loader2, ImageOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FeedFilterOption } from "@/components/friend-dropdown"

interface FeedProps {
  selectedFilter: FeedFilterOption
}

export function Feed({ selectedFilter }: FeedProps) {
  const [moments, setMoments] = useState<MomentResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [sendToFriendsModal, setSendToFriendsModal] = useState<{ image: string; username: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadMoments()
  }, [selectedFilter])

  const loadMoments = async () => {
    try {
      setLoading(true)

      // Parse filter
      let apiFilter: 'all' | 'friends' | 'mine' = 'all'
      let specificUserId: number | null = null

      if (selectedFilter.startsWith('friend-')) {
        // Specific friend selected
        specificUserId = parseInt(selectedFilter.replace('friend-', ''))
        // We'll filter client-side for specific friend
        apiFilter = 'friends'
      } else if (selectedFilter === 'mine') {
        apiFilter = 'mine'
      } else {
        apiFilter = 'all'
      }

      const data = await getMomentFeed(apiFilter, 0, 20)
      let filteredMoments = data.content || []

      // Client-side filter for specific friend
      if (specificUserId) {
        filteredMoments = filteredMoments.filter(m => m.user.id === specificUserId)
      }

      setMoments(filteredMoments)
    } catch (error: any) {
      console.error("Failed to load moments:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load moments",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith('http')) return imagePath
    // Remove leading slash if exists to avoid double slash
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Empty state
  if (moments.length === 0) {
    let emptyMessage = "No moments to show."

    if (selectedFilter.startsWith('friend-')) {
      emptyMessage = "This friend hasn't shared any moments yet."
    } else if (selectedFilter === 'mine') {
      emptyMessage = "You haven't created any moments yet. Click 'Create' to share your first moment!"
    } else {
      emptyMessage = "No moments to show. Start by adding friends or creating your first moment!"
    }

    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ImageOff className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No moments yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {moments.map((moment) => (
          <Post
            key={moment.id}
            id={moment.id.toString()}
            username={moment.user.username}
            displayName={moment.user.displayName}
            userAvatar={getAvatarUrl(moment.user.avatarUrl)}
            status=""
            isOnline={false} // TODO: Get from backend when user online status is implemented
            image={getImageUrl(moment.imagePath)}
            likes={moment.reactionCount || 0}
            caption={moment.caption || ""}
            comments={[]}
            timeAgo={moment.timeAgo || ""}
            onSendToFriends={() => setSendToFriendsModal({
              image: getImageUrl(moment.imagePath),
              username: moment.user.username
            })}
          />
        ))}
      </div>

      {sendToFriendsModal && (
        <SendToFriendsModal
          isOpen={true}
          onClose={() => setSendToFriendsModal(null)}
          image={sendToFriendsModal.image}
          username={sendToFriendsModal.username}
        />
      )}
    </>
  )
}
