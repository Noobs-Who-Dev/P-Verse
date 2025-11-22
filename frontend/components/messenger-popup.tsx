"use client"

import { MessageCircle, X, Maximize2, Smile, ImageIcon, Mic, ArrowLeft, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { friendService, type UserSearchDto } from "@/lib/services/friendService"
import { API_BASE_URL } from "@/lib/api/axios"

interface MessengerPopupProps {
  isOpen: boolean
  onToggle: () => void
  onOpenFullMessenger: (username?: string) => void
}

export function MessengerPopup({ isOpen, onToggle, onOpenFullMessenger }: MessengerPopupProps) {
  const [recentChats, setRecentChats] = useState<UserSearchDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChat, setSelectedChat] = useState<UserSearchDto | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadFriends()
    }
  }, [isOpen])

  const loadFriends = async () => {
    setIsLoading(true)
    try {
      const data = await friendService.getFriends()
      setRecentChats(data.slice(0, 6)) // Show only first 6 friends
    } catch (error) {
      console.error('Failed to load friends:', error)
      setRecentChats([])
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

  const handleChatClick = (friend: UserSearchDto) => {
    setSelectedChat(friend)
  }

  const handleBackToList = () => {
    setSelectedChat(null)
  }

  const handleExpand = () => {
    onOpenFullMessenger(selectedChat?.username)
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-card border border-border rounded-full px-4 py-3 flex items-center gap-3 shadow-lg hover:bg-muted transition-colors z-50"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold">Messages</span>
        <div className="flex -space-x-2">
          {recentChats.slice(0, 3).map((chat) => (
            <Avatar key={chat.id} className="w-6 h-6 border-2 border-card">
              <AvatarImage src={getAvatarUrl(chat.avatarUrl)} />
              <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </button>
    )
  }

  if (selectedChat) {
    return (
      <div className="fixed bottom-0 right-6 w-[350px] h-[500px] bg-card border border-border rounded-t-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToList} className="hover:opacity-70">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={getAvatarUrl(selectedChat.avatarUrl)} />
              <AvatarFallback>{selectedChat.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold">{selectedChat.displayName || selectedChat.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExpand} className="text-muted-foreground hover:text-foreground">
              <Maximize2 className="w-5 h-5" />
            </button>
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages - Placeholder for now */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Messages feature coming soon...</p>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button className="text-muted-foreground hover:text-foreground">
              <Mic className="w-5 h-5" />
            </button>
            <button className="text-muted-foreground hover:text-foreground">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="text-muted-foreground hover:text-foreground">
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 right-6 w-[350px] h-[500px] bg-card border border-border rounded-t-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-base font-semibold">Messages</h3>
        <div className="flex items-center gap-2">
          <button onClick={handleExpand} className="text-muted-foreground hover:text-foreground">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : recentChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start chatting with your friends</p>
          </div>
        ) : (
          recentChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="w-14 h-14">
                <AvatarImage src={getAvatarUrl(chat.avatarUrl)} />
                <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{chat.displayName || chat.username}</p>
                </div>
                <p className="text-xs text-muted-foreground truncate">@{chat.username}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Compose button */}
      <button className="absolute bottom-6 right-6 w-12 h-12 bg-[#0095f6] rounded-full flex items-center justify-center hover:bg-[#0084d9] transition-colors shadow-lg">
        <Edit className="w-5 h-5 text-white" />
      </button>
    </div>
  )
}
