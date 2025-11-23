"use client"

import { X, Send, Tag, MessageSquare, Pen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { friendService, type UserSearchDto } from "@/lib/services/friendService"
import { API_BASE_URL } from "@/lib/api/axios"

interface SendToFriendsModalProps {
  isOpen: boolean
  onClose: () => void
  image: string
  username: string
}

export function SendToFriendsModal({ isOpen, onClose, image, username }: SendToFriendsModalProps) {
  const [friends, setFriends] = useState<UserSearchDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFriends, setSelectedFriends] = useState<number[]>([])
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"icons" | "tags" | "comment">("icons")

  useEffect(() => {
    if (isOpen) {
      loadFriends()
    }
  }, [isOpen])

  const loadFriends = async () => {
    setIsLoading(true)
    try {
      const data = await friendService.getFriends()
      setFriends(data)
    } catch (error) {
      console.error('Failed to load friends:', error)
      setFriends([])
    } finally {
      setIsLoading(false)
    }
  }

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${API_BASE_URL}/${cleanPath}`
  }

  if (!isOpen) return null

  const toggleFriend = (friendId: number) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((f) => f !== friendId) : [...prev, friendId],
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-5xl h-[90vh] flex overflow-hidden">
        {/* Left side - Image */}
        <div className="flex-1 bg-muted flex items-center justify-center relative">
          <img src={image || "/placeholder.jpg"} alt="Post" className="max-w-full max-h-full object-contain" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-foreground hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Right side - Tools and friends */}
        <div className="w-[400px] flex flex-col bg-background">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Send to friends</h3>
          </div>

          {/* Tools tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("icons")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "icons" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
              }`}
            >
              <Pen className="w-4 h-4 mx-auto mb-1" />
              Icons
            </button>
            <button
              onClick={() => setActiveTab("tags")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "tags" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
              }`}
            >
              <Tag className="w-4 h-4 mx-auto mb-1" />
              Tag
            </button>
            <button
              onClick={() => setActiveTab("comment")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "comment" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4 mx-auto mb-1" />
              Comment
            </button>
          </div>

          {/* Tool content */}
          <div className="p-4 border-b border-border">
            {activeTab === "icons" && (
              <div className="grid grid-cols-6 gap-3">
                {["❤️", "🔥", "😂", "👍", "😍", "🎉", "✨", "💯", "🙌", "👏", "🎈", "🌟"].map((emoji, i) => (
                  <button key={i} className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-muted rounded">
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            {activeTab === "tags" && (
              <div className="text-sm text-muted-foreground">
                <p>Click on the image to tag people</p>
              </div>
            )}
            {activeTab === "comment" && (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a comment..."
                className="w-full h-24 bg-muted border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-muted-foreground text-foreground placeholder:text-muted-foreground"
              />
            )}
          </div>

          {/* Friends list */}
          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="text-sm font-semibold mb-3 text-foreground">Select friends</h4>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading friends...</p>
            ) : friends.length === 0 ? (
              <p className="text-sm text-muted-foreground">No friends to send to</p>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => toggleFriend(friend.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      selectedFriends.includes(friend.id) ? "bg-[#0095f6]/20" : "hover:bg-muted"
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getAvatarUrl(friend.avatarUrl)} />
                      <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1 text-left text-foreground">{friend.username}</span>
                    {selectedFriends.includes(friend.id) && (
                      <div className="w-5 h-5 bg-[#0095f6] rounded-full flex items-center justify-center">
                        <span className="text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Send button */}
          <div className="p-4 border-t border-border">
            <button
              disabled={selectedFriends.length === 0}
              className="w-full bg-[#0095f6] hover:bg-[#0095f6]/80 disabled:bg-[#0095f6]/50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
              Send to {selectedFriends.length} {selectedFriends.length === 1 ? "friend" : "friends"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
