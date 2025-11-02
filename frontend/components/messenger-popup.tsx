"use client"

import { MessageCircle, X, Maximize2, Smile, ImageIcon, Mic, ArrowLeft, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

const recentChats = [
  {
    username: "Jessica Parker",
    avatar: "/placeholder.svg?height=56&width=56",
    status: "Active 18h ago",
    lastMessage: "",
    hasCloud: true,
  },
  {
    username: "Michael Chen",
    avatar: "/placeholder.svg?height=56&width=56",
    status: "See you tomorrow!",
    time: "2h",
  },
  {
    username: "Emma Rodriguez",
    avatar: "/placeholder.svg?height=56&width=56",
    status: "Reacted ❤️ to your message",
    time: "5h",
  },
  {
    username: "David Thompson",
    avatar: "/placeholder.svg?height=56&width=56",
    status: "That sounds amazing!",
    time: "1d",
  },
  {
    username: "Sophie Anderson",
    avatar: "/placeholder.svg?height=56&width=56",
    status: "You: Check out this playlist...",
    time: "2d",
  },
  {
    username: "James Wilson",
    avatar: "/placeholder.svg?height=56&width=56",
    status: "You: Thanks for the help!",
    time: "3d",
  },
]

const chatMessages = [
  { sender: "Michael Chen", text: "Hey! How's it going?", time: "Jun 27, 2025, 6:11 PM", isOwn: false },
  {
    sender: "me",
    text: "Pretty good! Just finished that project",
    time: "Jul 30, 2025, 11:35 PM",
    isOwn: true,
    replyTo: "@Michael's story",
    emoji: "🎉",
  },
  { sender: "Michael Chen", text: "Nice work!", time: "Jul 31, 2025, 8:13 AM", isOwn: false },
  { sender: "Michael Chen", text: "Want to grab coffee later?", time: "Jul 31, 2025, 8:13 AM", isOwn: false },
]

interface MessengerPopupProps {
  isOpen: boolean
  onToggle: () => void
  onOpenFullMessenger: (username?: string) => void
}

export function MessengerPopup({ isOpen, onToggle, onOpenFullMessenger }: MessengerPopupProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const handleChatClick = (username: string) => {
    setSelectedChat(username)
  }

  const handleBackToList = () => {
    setSelectedChat(null)
  }

  const handleExpand = () => {
    onOpenFullMessenger(selectedChat || undefined)
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
          {recentChats.slice(0, 3).map((chat, i) => (
            <Avatar key={i} className="w-6 h-6 border-2 border-card">
              <AvatarImage src={chat.avatar || "/placeholder.svg"} />
              <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </button>
    )
  }

  if (selectedChat) {
    const selectedChatData = recentChats.find((c) => c.username === selectedChat)
    return (
      <div className="fixed bottom-0 right-6 w-[350px] h-[500px] bg-card border border-border rounded-t-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToList} className="hover:opacity-70">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={selectedChatData?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{selectedChat[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold">{selectedChat}</span>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, index) => (
            <div key={index}>
              {/* Timestamp */}
              <div className="text-center text-xs text-muted-foreground mb-2">{msg.time}</div>

              {/* Message */}
              <div className={`flex gap-2 ${msg.isOwn ? "justify-end" : ""}`}>
                {!msg.isOwn && (
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={selectedChatData?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{selectedChat[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${msg.isOwn ? "items-end" : ""}`}>
                  {msg.replyTo && <div className="text-xs text-muted-foreground mb-1">Replied to {msg.replyTo}</div>}
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[250px] ${msg.isOwn ? "bg-[#0095f6] text-white" : "bg-muted text-foreground"}`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    {msg.emoji && <span className="text-lg ml-1">{msg.emoji}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <button className="text-muted-foreground hover:text-foreground">
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
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
        {recentChats.map((chat) => (
          <button
            key={chat.username}
            onClick={() => handleChatClick(chat.username)}
            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
          >
            <Avatar className="w-14 h-14">
              <AvatarImage src={chat.avatar || "/placeholder.svg"} />
              <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold flex items-center gap-1">
                  {chat.username}
                  {chat.hasCloud && <span className="text-xs">☁️</span>}
                </p>
                {chat.time && <span className="text-xs text-muted-foreground">{chat.time}</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{chat.status}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Compose button */}
      <button className="absolute bottom-6 right-6 w-12 h-12 bg-[#0095f6] rounded-full flex items-center justify-center hover:bg-[#0084d9] transition-colors shadow-lg">
        <Edit className="w-5 h-5 text-white" />
      </button>
    </div>
  )
}
