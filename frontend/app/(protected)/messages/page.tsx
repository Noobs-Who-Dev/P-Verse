"use client"

import { ArrowLeft, Phone, Video, Info, Search, Smile, ImageIcon, Mic, Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { SearchPanel } from "@/components/search-panel"
import { NotificationsPanel } from "@/components/notifications-panel"
import { CreatePostModal } from "@/components/create-post-modal"

const conversations = [
  {
    username: "sarah_johnson",
    avatar: "/placeholder.svg?height=56&width=56",
    lastMessage: "See you tomorrow!",
    time: "2m",
    unread: 2,
  },
  {
    username: "mike_chen",
    avatar: "/placeholder.svg?height=56&width=56",
    lastMessage: "Thanks for the help!",
    time: "1h",
    unread: 0,
  },
  {
    username: "emma_wilson",
    avatar: "/placeholder.svg?height=56&width=56",
    lastMessage: "That sounds great 😊",
    time: "3h",
    unread: 1,
  },
  {
    username: "alex_rodriguez",
    avatar: "/placeholder.svg?height=56&width=56",
    lastMessage: "Let's catch up soon",
    time: "1d",
    unread: 0,
  },
]

const messages = [
  { sender: "sarah_johnson", text: "Hey! How are you?", time: "10:30 AM", isOwn: false },
  { sender: "me", text: "I'm good! Thanks for asking 😊", time: "10:32 AM", isOwn: true },
  { sender: "sarah_johnson", text: "Want to grab coffee tomorrow?", time: "10:33 AM", isOwn: false },
  { sender: "me", text: "What time works for you?", time: "10:35 AM", isOwn: true },
  { sender: "sarah_johnson", text: "How about 2pm at the usual place?", time: "10:36 AM", isOwn: false },
  { sender: "me", text: "Perfect! See you then 👍", time: "10:37 AM", isOwn: true },
  { sender: "sarah_johnson", text: "See you tomorrow!", time: "10:38 AM", isOwn: false },
]

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedUser, setSelectedUser] = useState("sarah_johnson")
  const [message, setMessage] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string>("All")

  useEffect(() => {
    const user = searchParams.get("user")
    if (user) {
      setSelectedUser(user)
    }
  }, [searchParams])

  const handleNavClick = (item: string) => {
    if (item === "Home") {
      router.push("/")
    } else if (item === "Profile") {
      router.push("/profile")
    } else if (item === "Search") {
      // Toggle: if already open, close it; if closed, open it
      if (activePanel === "search") {
        setSidebarCollapsed(true)
        setActivePanel(null)
      } else {
        setSidebarCollapsed(true)
        setActivePanel("search")
      }
    } else if (item === "Notifications") {
      // Toggle: if already open, close it; if closed, open it
      if (activePanel === "notifications") {
        setSidebarCollapsed(true)
        setActivePanel(null)
      } else {
        setSidebarCollapsed(true)
        setActivePanel("notifications")
      }
    } else if (item === "Create") {
      setShowCreateModal(true)
    } else if (item === "Messages") {
      setSidebarCollapsed(true)
      setActivePanel(null)
    } else {
      setSidebarCollapsed(true)
      setActivePanel(null)
    }
  }

  const handleClosePanel = () => {
    setSidebarCollapsed(true)
    setActivePanel(null)
  }

  const selectedConversation = conversations.find((c) => c.username === selectedUser)

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar collapsed={sidebarCollapsed} onNavClick={handleNavClick} />

      {activePanel === "search" && <SearchPanel onClose={handleClosePanel} />}
      {activePanel === "notifications" && <NotificationsPanel onClose={handleClosePanel} />}


      <div className="w-[400px] border-r border-border flex flex-col ml-[73px]">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <button onClick={() => router.push("/")} className="hover:opacity-70">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold">Messages</h2>
          <div className="w-6" />
        </div>

        <div className="p-4">
          <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages"
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.username}
              onClick={() => setSelectedUser(conv.username)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors ${
                selectedUser === conv.username ? "bg-muted/50" : ""
              }`}
            >
              <Avatar className="w-14 h-14">
                <AvatarImage src={conv.avatar || "/placeholder.svg"} />
                <AvatarFallback>{conv.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{conv.username}</p>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${conv.unread > 0 ? "font-semibold" : "text-muted-foreground"}`}>
                    {conv.lastMessage}
                  </p>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-[#0095f6] rounded-full flex items-center justify-center text-xs text-white">
                      {conv.unread}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedConversation?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{selectedUser[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{selectedUser}</p>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:opacity-70">
              <Phone className="w-5 h-5" />
            </button>
            <button className="hover:opacity-70">
              <Video className="w-5 h-5" />
            </button>
            <button className="hover:opacity-70">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 px-6 py-4">
          <div className="w-full space-y-4 font-normal">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2 ${msg.isOwn ? "justify-end" : ""}`}>
                {!msg.isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedConversation?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{selectedUser[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${msg.isOwn ? "items-end" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-md ${msg.isOwn ? "bg-[#0095f6] text-white" : "bg-muted text-foreground"}`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="w-full flex items-center justify-between gap-3 font-normal">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-3">
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
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="text-muted-foreground hover:text-foreground">
                <Mic className="w-5 h-5" />
              </button>
            </div>
            {message ? (
              <button className="text-[#0095f6] hover:opacity-70 font-semibold text-sm">Send</button>
            ) : (
              <button className="text-muted-foreground hover:text-foreground">
                <Heart className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
