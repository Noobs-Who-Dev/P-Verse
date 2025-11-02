"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MessengerPopup } from "@/components/messenger-popup"
import { SearchPanel } from "@/components/search-panel"
import { NotificationsPanel } from "@/components/notifications-panel"
import { CreatePostModal } from "@/components/create-post-modal"
import { ArrowLeft, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const mockRequests = [
  {
    id: "1",
    username: "john_doe",
    displayName: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    mutualFriends: 5,
  },
  {
    id: "2",
    username: "jane_smith",
    displayName: "Jane Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    mutualFriends: 12,
  },
  {
    id: "3",
    username: "alex_wilson",
    displayName: "Alex Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    mutualFriends: 3,
  },
]

export default function FriendRequestsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [messengerOpen, setMessengerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string>("All")
  const [requests, setRequests] = useState(mockRequests)

  const handleNavClick = (item: string) => {
    if (item === "Home") {
      router.push("/")
    } else if (item === "Search") {
      setSidebarCollapsed(true)
      setActivePanel("search")
    } else if (item === "Notifications") {
      setSidebarCollapsed(true)
      setActivePanel("notifications")
    } else if (item === "Create") {
      setShowCreateModal(true)
    } else if (item === "Messages") {
      router.push("/messages")
    } else if (item === "Profile") {
      router.push("/profile")
    } else {
      setSidebarCollapsed(false)
      setActivePanel(null)
    }
  }

  const handleClosePanel = () => {
    setSidebarCollapsed(false)
    setActivePanel(null)
  }

  const handleOpenFullMessenger = (username?: string) => {
    if (username) {
      router.push(`/messages?user=${username}`)
    } else {
      router.push("/messages")
    }
    setMessengerOpen(false)
  }

  const handleAccept = (requestId: string) => {
    console.log("[v0] Accept request:", requestId)
    setRequests(requests.filter((req) => req.id !== requestId))
  }

  const handleDecline = (requestId: string) => {
    console.log("[v0] Decline request:", requestId)
    setRequests(requests.filter((req) => req.id !== requestId))
  }

  const filteredRequests = requests.filter(
    (request) =>
      request.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onNavClick={handleNavClick} />

        {activePanel === "search" && <SearchPanel onClose={handleClosePanel} />}
        {activePanel === "notifications" && <NotificationsPanel onClose={handleClosePanel} />}

        {activePanel && (
          <div
            className="fixed inset-0 bg-black/20 z-30"
            style={{ marginLeft: sidebarCollapsed ? "73px" : "245px" }}
            onClick={handleClosePanel}
          />
        )}

        <main className={`flex-1 ${sidebarCollapsed ? "ml-[73px]" : "ml-[245px]"} transition-all duration-300`}>
          <div className="max-w-3xl mx-auto h-screen flex flex-col">
            {/* Header */}
            <div className="border-b border-[#262626] p-6">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 hover:bg-[#1a1a1a] rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-semibold">Friend Requests</h1>
              </div>
              <p className="text-sm text-[#a8a8a8] mb-4">Review and respond to pending friend requests.</p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8a8a8]" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#262626] border-none pl-10 py-2 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-white/20"
                />
              </div>
            </div>

            {/* Requests List */}
            <div className="flex-1 overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#a8a8a8]">No pending friend requests</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request.id} className="px-6 py-4 border-b border-[#262626]">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.username} />
                        <AvatarFallback>{request.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{request.username}</div>
                        <div className="text-sm text-[#a8a8a8] truncate">{request.displayName}</div>
                        <div className="text-xs text-[#a8a8a8]">{request.mutualFriends} mutual friends</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAccept(request.id)}
                        className="flex-1 bg-[#0095f6] hover:bg-[#0095f6]/90 text-white"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleDecline(request.id)}
                        variant="outline"
                        className="flex-1 bg-transparent border-white/10 hover:bg-[#1a1a1a]"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <MessengerPopup
        isOpen={messengerOpen}
        onToggle={() => setMessengerOpen(!messengerOpen)}
        onOpenFullMessenger={handleOpenFullMessenger}
      />

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          selectedFriend={selectedFriend}
          onSelectFriend={setSelectedFriend}
        />
      )}
    </div>
  )
}
