"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MessengerPopup } from "@/components/messenger-popup"
import { SearchPanel } from "@/components/search-panel"
import { NotificationsPanel } from "@/components/notifications-panel"
import { CreatePostModal } from "@/components/create-post-modal"
import { PostDetailModal } from "@/components/post-detail-modal"
import { SavedPostDetailModal } from "@/components/saved-post-detail-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, Grid3x3, Bookmark, Camera, Trash2, X } from "lucide-react"
import Image from "next/image"
import { profileService } from "@/lib/services/profileService"
import { toggleFriendRequest, unfriend, getMomentFeed, getSavedMoments, deleteMoment } from "@/lib/api"
import { UserProfile } from "@/lib/types/profile"
import { useAuth } from "@/lib/auth/authContext"
import { useToast } from "@/hooks/use-toast"
import { getAvatarUrl } from "@/lib/utils/avatar"
import { ImageCropModal } from "@/components/image-crop-modal"

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
  const [selectedPost, setSelectedPost] = useState<MomentResponseDTO | null>(null)
  const [selectedSavedPost, setSelectedSavedPost] = useState<MomentResponseDTO | null>(null)
  const [editPost, setEditPost] = useState<MomentResponseDTO | null>(null)

  // New states for API integration
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [userPosts, setUserPosts] = useState<MomentResponseDTO[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [savedPosts, setSavedPosts] = useState<MomentResponseDTO[]>([])
  const [isLoadingSavedPosts, setIsLoadingSavedPosts] = useState(false)

  // Image crop states
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userIdParam = searchParams.get('userId')
  const targetUserId = userIdParam ? parseInt(userIdParam) : currentUser?.id

  useEffect(() => {
    if (targetUserId) {
      loadProfile(targetUserId)
    }
  }, [targetUserId])

  useEffect(() => {
    if (activeTab === "saved" && profile?.isOwnProfile) {
      loadSavedPosts()
    }
  }, [activeTab, profile?.isOwnProfile])

  const loadProfile = async (userId: number) => {
    try {
      setIsLoading(true)
      const data = await profileService.getUserProfile(userId)
      setProfile(data)

      // Load user posts
      await loadUserPosts(userId)
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

  const loadUserPosts = async (userId: number) => {
    try {
      setIsLoadingPosts(true)
      // Get user's own posts (mine filter)
      const data = await getMomentFeed('mine', 0, 50) // Get up to 50 posts
      setUserPosts(data.content || [])
    } catch (error: any) {
      console.error("Failed to load user posts:", error)
      setUserPosts([])
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const loadSavedPosts = async () => {
    try {
      setIsLoadingSavedPosts(true)
      const data = await getSavedMoments(0, 50) // Get up to 50 saved posts
      setSavedPosts(data.content || [])
    } catch (error: any) {
      console.error("Failed to load saved posts:", error)
      setSavedPosts([])
    } finally {
      setIsLoadingSavedPosts(false)
    }
  }

  const handleAvatarUpdate = () => {
    // Trigger file input click
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      })
      return
    }

    // Create preview URL and show crop modal
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageToCrop(reader.result as string)
      setShowCropModal(true)
    }
    reader.readAsDataURL(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setIsUploadingAvatar(true)
      setShowCropModal(false)

      // Convert blob to file
      const croppedFile = new File([croppedImageBlob], "avatar.jpg", {
        type: "image/jpeg",
      })

      // Upload to server
      const updatedUser = await profileService.uploadAvatar(croppedFile)

      // Update profile with new avatar
      if (profile && targetUserId) {
        const refreshedProfile = await profileService.getUserProfile(targetUserId)
        setProfile(refreshedProfile)
      }

      toast({
        title: "Thành công",
        description: "Cập nhật ảnh đại diện thành công!",
      })
    } catch (error: any) {
      console.error("Failed to upload avatar:", error)
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể upload ảnh đại diện",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
      setImageToCrop(null)
    }
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    setImageToCrop(null)
  }

  const handleRemoveAvatar = async () => {
    try {
      setIsUploadingAvatar(true)

      // Call API to remove avatar
      await profileService.removeAvatar()

      // Refresh profile
      if (profile && targetUserId) {
        const refreshedProfile = await profileService.getUserProfile(targetUserId)
        setProfile(refreshedProfile)
      }

      toast({
        title: "Thành công",
        description: "Đã xóa ảnh đại diện",
      })
    } catch (error: any) {
      console.error("Failed to remove avatar:", error)
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa ảnh đại diện",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith('http')) return imagePath
    // Remove leading slash if exists to avoid double slash
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  const handleEditPost = (post: MomentResponseDTO) => {
    setEditPost(post)
    setSelectedPost(null) // Close detail modal
  }

  const handleUpdatePost = (updatedPost: MomentResponseDTO) => {
    // Update the post in the local state
    setUserPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
    setSavedPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
    setEditPost(null)

    toast({
      title: "Success!",
      description: "Post updated successfully",
    })
  }

  const handleDeletePost = async (postId: number) => {
    try {
      await deleteMoment(postId)

      // Remove from local state
      setUserPosts(prev => prev.filter(p => p.id !== postId))
      setSavedPosts(prev => prev.filter(p => p.id !== postId))

      toast({
        title: "Success!",
        description: "Post deleted successfully",
      })
    } catch (error: any) {
      console.error("Failed to delete post:", error)
      toast({
        title: "Failed to delete",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive"
      })
    }
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
                    <DropdownMenuTrigger asChild disabled={isUploadingAvatar}>
                      <div className="cursor-pointer group relative">
                        <Avatar className="w-[150px] h-[150px]">
                          <AvatarImage src={getAvatarUrl(profile?.user.avatarUrl)} />
                          <AvatarFallback>{profile?.user.displayName?.charAt(0).toUpperCase() || "JB"}</AvatarFallback>
                        </Avatar>
                        {isUploadingAvatar ? (
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem onClick={handleAvatarUpdate} className="cursor-pointer" disabled={isUploadingAvatar}>
                        <Camera className="mr-2 h-4 w-4" />
                        <span>Update photos</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleRemoveAvatar}
                        className="cursor-pointer text-destructive"
                        disabled={isUploadingAvatar || !profile?.user.avatarUrl}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Remove current Photo</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" disabled={isUploadingAvatar}>
                        <X className="mr-2 h-4 w-4" />
                        <span>Cancel</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Avatar className="w-[150px] h-[150px]">
                    <AvatarImage src={getAvatarUrl(profile?.user.avatarUrl)} />
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
                        onClick={() => router.push("/settings?tab=account")}
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
                {profile?.isOwnProfile && (
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
                )}
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
                        src={getImageUrl(post.imagePath)}
                        alt="Post"
                        fill
                        className="object-cover"
                        sizes="(max-width: 935px) 33vw, 310px"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <span>❤️</span>
                          <span>{post.reactionCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "saved" && (
                <div className="grid grid-cols-3 gap-1">
                  {savedPosts.map((post) => {
                    const isOwnPost = currentUser?.id !== null && post.user.id === currentUser?.id
                    return (
                      <div
                        key={post.id}
                        className="aspect-square relative group cursor-pointer"
                        onClick={() => {
                          if (isOwnPost) {
                            setSelectedPost(post)
                          } else {
                            setSelectedSavedPost(post)
                          }
                        }}
                      >
                        <Image
                          src={getImageUrl(post.imagePath)}
                          alt="Saved Post"
                          fill
                          className="object-cover"
                          sizes="(max-width: 935px) 33vw, 310px"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                          <div className="flex items-center gap-2 text-white font-semibold">
                            <span>❤️</span>
                            <span>{post.reactionCount}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
        />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onSendMessage={handleOpenFullMessenger}
        />
      )}

      {editPost && (
        <CreatePostModal
          editPost={editPost}
          onUpdate={handleUpdatePost}
          onClose={() => setEditPost(null)}
          getImageUrl={getImageUrl}
        />
      )}

      {selectedSavedPost && (
        <SavedPostDetailModal
          post={selectedSavedPost}
          onClose={() => setSelectedSavedPost(null)}
          onSendMessage={handleOpenFullMessenger}
        />
      )}

      {showCropModal && imageToCrop && (
        <ImageCropModal
          image={imageToCrop}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
