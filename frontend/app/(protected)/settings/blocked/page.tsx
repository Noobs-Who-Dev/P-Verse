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

const mockBlockedUsers = [
  {
    id: "1",
    username: "blocked_user1",
    displayName: "Blocked User 1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blocked1",
  },
  {
    id: "2",
    username: "blocked_user2",
    displayName: "Blocked User 2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blocked2",
  },
]

export default function BlockedUsersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [messengerOpen, setMessengerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string>("All")
  const [blockedUsers, setBlockedUsers] = useState(mockBlockedUsers)

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

  const handleUnblock = (userId: string) => {
    console.log("[v0] Unblock user:", userId)
    setBlockedUsers(blockedUsers.filter((user) => user.id !== userId))
  }

  const filteredUsers = blockedUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
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
                <h1 className="text-2xl font-semibold">Blocked Users</h1>
              </div>
              <p className="text-sm text-[#a8a8a8] mb-4">
                Manage users you've blocked. Blocked users cannot see your profile or contact you.
              </p>

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

            {/* Blocked Users List */}
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#a8a8a8]">No blocked users</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{user.username}</div>
                        <div className="text-sm text-[#a8a8a8] truncate">{user.displayName}</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleUnblock(user.id)}
                      variant="outline"
                      className="bg-transparent border-white/10 hover:bg-[#1a1a1a]"
                    >
                      Unblock
                    </Button>
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
