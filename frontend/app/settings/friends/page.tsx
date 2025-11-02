"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MessengerPopup } from "@/components/messenger-popup"
import { SearchPanel } from "@/components/search-panel"
import { NotificationsPanel } from "@/components/notifications-panel"
import { CreatePostModal } from "@/components/create-post-modal"
import { ArrowLeft, Search, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mockFriends = [
  {
    id: "1",
    username: "reallife.english",
    displayName: "RealLife English",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=reallife",
  },
  {
    id: "2",
    username: "noahoanohan",
    displayName: "hoan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=noah",
  },
  {
    id: "3",
    username: "feat.fish",
    displayName: "am",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fish",
  },
  {
    id: "4",
    username: "hewuu.eian",
    displayName: "/teian/",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hewuu",
  },
  {
    id: "5",
    username: "shippo.potamus_",
    displayName: "carvyn",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=shippo",
  },
  {
    id: "6",
    username: "mquan_2103",
    displayName: "Nguyễn Minh Quân",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mquan",
  },
  {
    id: "7",
    username: "m_chau1112",
    displayName: "Châu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chau",
  },
  {
    id: "8",
    username: "tudayyyy",
    displayName: "Nguyễn Mậu Tú",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tu",
  },
]

export default function FriendsListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [messengerOpen, setMessengerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string>("All")

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

  const filteredFriends = mockFriends.filter(
    (friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUnfriend = (friendId: string) => {
    console.log("[v0] Unfriend:", friendId)
    // TODO: Implement unfriend logic
  }

  const handleBlock = (friendId: string) => {
    console.log("[v0] Block:", friendId)
    // TODO: Implement block logic
  }

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
                <h1 className="text-2xl font-semibold">Friends List</h1>
              </div>
              <p className="text-sm text-[#a8a8a8] mb-4">
                Manage your friends list. You can unfriend or block users from here.
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

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.username} />
                      <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{friend.username}</div>
                      <div className="text-sm text-[#a8a8a8] truncate">{friend.displayName}</div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-[#262626] rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5 text-[#a8a8a8]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#262626] border-white/10">
                      <DropdownMenuItem
                        onClick={() => router.push(`/profile/${friend.username}`)}
                        className="cursor-pointer"
                      >
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUnfriend(friend.id)} className="cursor-pointer">
                        Unfriend
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBlock(friend.id)}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                      >
                        Block
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
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
