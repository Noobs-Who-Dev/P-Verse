"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MessengerPopup } from "@/components/messenger-popup"
import { SearchPanel } from "@/components/search-panel"
import { NotificationsPanel } from "@/components/notifications-panel"
import { CreatePostModal } from "@/components/create-post-modal"
import { PostDetailModal } from "@/components/post-detail-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, Grid3x3, Bookmark, Camera, Trash2, X } from "lucide-react"
import Image from "next/image"
import { profileService } from "@/lib/services/profileService"
import { toggleFriendRequest, unfriend } from "@/lib/api"
import { UserProfile } from "@/lib/types/profile"
import { useAuth } from "@/lib/auth/authContext"
import { useToast } from "@/hooks/use-toast"

const userPosts = [
  { id: 1, image: "/tokyo-city-night-skyline.jpg", likes: 1234, comments: 56 },
  { id: 2, image: "/golden-gate-bridge-sunset.jpg", likes: 2341, comments: 89 },
  { id: 3, image: "/eiffel-tower-evening-paris.jpg", likes: 3456, comments: 123 },
]

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  // Original states
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts")
  const [messengerOpen, setMessengerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string>("All")
  const [selectedPost, setSelectedPost] = useState<(typeof userPosts)[0] | null>(null)

  // New states for API integration
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userIdParam = searchParams.get('userId')
  const targetUserId = userIdParam ? parseInt(userIdParam) : currentUser?.id

  useEffect(() => {
    if (targetUserId) {
      loadProfile(targetUserId)
    }
  }, [targetUserId])

  const loadProfile = async (userId: number) => {
    try {
      setIsLoading(true)
      const data = await profileService.getUserProfile(userId)
      setProfile(data)
    } catch (error: any) {
      console.error("Failed to load profile:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpdate = () => {
    // Trigger file input click
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Implement actual file upload to server
    // For now, just show preview using FileReader
    const reader = new FileReader()
    reader.onloadend = () => {
      toast({
        title: "Chức năng đang phát triển",
        description: "Upload avatar sẽ được implement sau",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = async () => {
    try {
      // TODO: Call API to remove avatar
      toast({
        title: "Chức năng đang phát triển",
        description: "Remove avatar sẽ được implement sau",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa ảnh đại diện",
        variant: "destructive",
      })
    }
  }

  const handleNavClick = (item: string) => {
    if (item === "Home") {
      router.push("/")
    } else if (item === "Search") {
      if (activePanel === "search") {
        setSidebarCollapsed(false)
        setActivePanel(null)
      } else {
        setSidebarCollapsed(true)
        setActivePanel("search")
      }
    } else if (item === "Notifications") {
      if (activePanel === "notifications") {
        setSidebarCollapsed(false)
        setActivePanel(null)
      } else {
        setSidebarCollapsed(true)
        setActivePanel("notifications")
      }
    } else if (item === "Create") {
      setShowCreateModal(true)
    } else if (item === "Messages") {
      router.push("/messages")
    } else if (item === "Profile") {
      // Already on profile page
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onNavClick={handleNavClick} />

        {activePanel === "search" && <SearchPanel onClose={handleClosePanel} />}
        {activePanel === "notifications" && <NotificationsPanel onClose={handleClosePanel} />}

        <main className={`flex-1 ${sidebarCollapsed ? "ml-[73px]" : "ml-[245px]"} transition-all duration-300`}>
          <div className="max-w-[935px] mx-auto px-5 py-8">
            {/* Profile Header */}
            <div className="flex items-start gap-8 mb-11">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile?.isOwnProfile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="cursor-pointer group relative">
                        <Avatar className="w-[150px] h-[150px]">
                          <AvatarImage src={profile?.user.avatarUrl || "/images/design-mode/image.png"} />
                          <AvatarFallback>{profile?.user.displayName?.charAt(0).toUpperCase() || "JB"}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem onClick={handleAvatarUpdate} className="cursor-pointer">
                        <Camera className="mr-2 h-4 w-4" />
                        <span>Update photos</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleRemoveAvatar} className="cursor-pointer text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Remove current Photo</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <X className="mr-2 h-4 w-4" />
                        <span>Cancel</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Avatar className="w-[150px] h-[150px]">
                    <AvatarImage src={profile?.user.avatarUrl || "/images/design-mode/image.png"} />
                    <AvatarFallback>{profile?.user.displayName?.charAt(0).toUpperCase() || "JB"}</AvatarFallback>
                  </Avatar>
                )}

                {/* Hidden file input for avatar upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {/* Username and buttons */}
                <div className="flex items-center gap-5 mb-5">
                  <h2 className="text-xl">{profile?.user.username || "jbleclgt"}</h2>
                  {profile?.isOwnProfile && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-secondary hover:bg-muted text-foreground h-8"
                        onClick={() => router.push("/settings")}
                      >
                        Edit profile
                      </Button>
                      <Button variant="secondary" size="sm" className="bg-secondary hover:bg-muted text-foreground h-8">
                        View archive
                      </Button>
                      <button className="hover:opacity-70" onClick={() => router.push("/settings")}>
                        <Settings className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-10 mb-5">
                  <div>
                    <span className="font-semibold">{profile?.stats.postsCount || 0}</span>{" "}
                    <span className="text-foreground">post</span>
                  </div>
                  <div>
                    <span className="font-semibold">{profile?.stats.followersCount || 0}/{profile?.stats.followingCount || 0}</span>{" "}
                    <span className="text-foreground">người bạn</span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <p className="font-semibold">{profile?.user.displayName || "Hoàng Nguyên"}</p>
                  {profile?.user.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{profile.user.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <div className="flex items-center justify-center gap-16 mx-0 px-0">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex items-center gap-2 py-4 border-b transition-colors ${
                    activeTab === "posts"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4 scale-150" />
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`flex items-center gap-2 py-4 border-b transition-colors ${
                    activeTab === "saved"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Bookmark className="w-4 h-4 scale-150" />
                </button>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="mt-7">
              {activeTab === "posts" && (
                <div className="grid grid-cols-3 gap-1">
                  {userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="aspect-square relative group cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      <Image
                        src={post.image || "/placeholder.svg"}
                        alt="Post"
                        fill
                        className="object-cover"
                        sizes="(max-width: 935px) 33vw, 310px"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <span>❤️</span>
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <span>💬</span>
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "saved" && (
                <div className="text-center py-16 text-muted-foreground">
                  <p>No saved posts yet</p>
                </div>
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

      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  )
}

