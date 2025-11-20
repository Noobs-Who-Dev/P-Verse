"use client"

import { useState, useRef, useEffect } from "react"
import { X, ImageIcon, Smile, Loader2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { createMoment, updateMoment, getFriends, UserSearchDto, MomentVisibility } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Emoji suggestions for different themes
const emojiSuggestions = {
  fancy: ["✨", "💎", "👑", "🎩", "🌟", "💫", "🎭", "🎪"],
  nature: ["🌿", "🌱", "🌸", "🌺", "🌻", "🌼", "🍃", "🌾"],
  fire: ["🔥", "⚡", "💥", "🌟", "✨", "💫", "🚀", "⭐"]
}

interface CreatePostModalProps {
  onClose: () => void
  editPost?: MomentResponseDTO
  onUpdate?: (updatedPost: MomentResponseDTO) => void
  getImageUrl?: (imagePath: string) => string
}

export function CreatePostModal({ onClose, editPost, onUpdate, getImageUrl }: CreatePostModalProps) {
  const [caption, setCaption] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [friends, setFriends] = useState<UserSearchDto[]>([])
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingFriends, setLoadingFriends] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const isEditMode = !!editPost

  const loadFriends = async () => {
    try {
      setLoadingFriends(true)
      const friendsData = await getFriends()
      setFriends(friendsData)
      // Set default to "All Friends"
      setSelectedFriend({ id: "all", name: "All Friends" })
    } catch (error) {
      console.error("Failed to load friends:", error)
      toast({
        title: "Error",
        description: "Failed to load friends list",
        variant: "destructive"
      })
    } finally {
      setLoadingFriends(false)
    }
  }

  // Load friends on mount
  useEffect(() => {
    loadFriends()
  }, [])

  // Load edit data
  useEffect(() => {
    if (editPost) {
      setCaption(editPost.caption || "")
      setImagePreview(getImageUrl ? getImageUrl(editPost.imagePath) : editPost.imagePath)

      // Set visibility
      if (editPost.visibility === "ALL_FRIENDS") {
        setSelectedFriend({ id: "all", name: "All Friends" })
      } else if (editPost.visibility === "PRIVATE") {
        setSelectedFriend({ id: "private", name: "Only Me" })
      } else if (editPost.specificUser) {
        setSelectedFriend({
          id: editPost.specificUser.id.toString(),
          name: editPost.specificUser.displayName || editPost.specificUser.username
        })
      }
    }
  }, [editPost, getImageUrl])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 10MB",
        variant: "destructive"
      })
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleThemeClick = (theme: keyof typeof emojiSuggestions) => {
    const emojis = emojiSuggestions[theme]
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
    setCaption(prev => prev + randomEmoji)
  }

  const handleEmojiClick = () => {
    // Simple emoji picker - you can replace with a proper emoji picker library
    const commonEmojis = ["😀", "😍", "🥰", "😎", "🤩", "😊", "😂", "🤣", "😭", "😔"]
    const randomEmoji = commonEmojis[Math.floor(Math.random() * commonEmojis.length)]
    setCaption(prev => prev + randomEmoji)
  }

  const handleShare = async () => {
    // In edit mode, image is optional (can keep existing image)
    if (!isEditMode && !selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to share",
        variant: "destructive"
      })
      return
    }

    if (caption.length > 2200) {
      toast({
        title: "Caption too long",
        description: "Caption must be less than 2200 characters",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)

      // Determine visibility
      let visibility: MomentVisibility
      let specificUserId: number | undefined

      if (!selectedFriend || selectedFriend.id === "all") {
        visibility = "ALL_FRIENDS"
      } else if (selectedFriend.id === "private") {
        visibility = "PRIVATE"
      } else {
        visibility = "SPECIFIC_PERSON"
        specificUserId = parseInt(selectedFriend.id)
      }

      if (isEditMode && editPost) {
        // Update existing post
        const updateRequest = {
          caption: caption || undefined,
          visibility,
          specificUserId
        }

        // Only include image if user selected a new one
        if (selectedImage) {
          updateRequest.image = selectedImage
        }

        const updatedPost = await updateMoment(editPost.id, updateRequest)

        toast({
          title: "Success!",
          description: "Your post has been updated",
        })

        if (onUpdate) {
          onUpdate(updatedPost)
        }
      } else {
        // Create new post
        await createMoment({
          image: selectedImage!,
          caption: caption || undefined,
          visibility,
          specificUserId
        })

        toast({
          title: "Success!",
          description: "Your moment has been shared",
        })
      }

      onClose()
    } catch (error: any) {
      console.error("Failed to create/update moment:", error)
      toast({
        title: isEditMode ? "Failed to update" : "Failed to share",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFriendOptions = () => {
    const options = [
      { id: "all", name: "All Friends", avatar: null },
      { id: "private", name: "Only Me", avatar: null },
      ...friends.map(f => ({
        id: f.id.toString(),
        name: f.displayName || f.username,
        avatar: f.avatarUrl
      }))
    ]
    return options
  }

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-card z-10">
          <button onClick={onClose} className="text-foreground hover:text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-base font-semibold text-foreground">
            {isEditMode ? "Edit post" : "Create new post"}
          </h2>
          <Button
            onClick={handleShare}
            disabled={(!selectedImage && !isEditMode) || isLoading}
            className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold h-auto px-4 py-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Sharing..."}
              </>
            ) : (
              isEditMode ? "Update" : "Share"
            )}
          </Button>
        </div>

        {/* Post to dropdown */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Post to:</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <span className="text-sm font-semibold text-foreground">
                  {selectedFriend?.name || "All Friends"}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px] bg-card border-border max-h-[300px] overflow-y-auto">
                {loadingFriends ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  getFriendOptions().map((friend) => (
                    <DropdownMenuItem
                      key={friend.id}
                      onClick={() => setSelectedFriend({ id: friend.id, name: friend.name })}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted focus:bg-muted text-foreground"
                    >
                      {friend.avatar ? (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback>{friend.name[0]}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-semibold">{friend.name[0]}</span>
                        </div>
                      )}
                      <span className="text-sm">{friend.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Image selection/preview */}
        <div className="p-8">
          {imagePreview ? (
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src={imagePreview}
                alt="Preview"
                width={500}
                height={500}
                className="w-full h-auto object-cover"
              />
              <button
                onClick={() => {
                  setSelectedImage(null)
                  setImagePreview(null)
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center gap-4 hover:border-muted-foreground transition-colors cursor-pointer"
            >
              <ImageIcon className="w-24 h-24 text-muted-foreground" />
              <p className="text-xl font-light text-foreground">Drag photos and videos here</p>
              <Button className="bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold">
                Select from computer
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Caption and emoji suggestions */}
        <div className="p-4 border-t border-border">
          {/* Theme suggestions */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <button
              onClick={() => handleThemeClick('fancy')}
              className="bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              ✨ Fancy
            </button>
            <button
              onClick={() => handleThemeClick('nature')}
              className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              🌿 Nature
            </button>
            <button
              onClick={() => handleThemeClick('fire')}
              className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              🔥 Fire
            </button>
          </div>

          {/* Caption input */}
          <div className="flex gap-3">
            <Avatar className="w-7 h-7">
              <AvatarImage src="/placeholder.svg?height=28&width=28" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2200}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm"
              rows={3}
            />
          </div>

          {/* Emoji button and character count */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={handleEmojiClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <Smile className="w-5 h-5" />
            </button>
            <span className={`text-xs ${caption.length > 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {caption.length}/2,200
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
