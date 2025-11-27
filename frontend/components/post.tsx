"use client"

import { Heart, MoreHorizontal, ThumbsUp, Laugh, Frown, Angry, PartyPopper, Smile, Bookmark, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect } from "react"
import { PhotoEditModal } from "./photo-edit-modal"
import { useToast } from "@/hooks/use-toast"
import { addMomentReaction, getMyReaction, getRecentReactions, saveMoment, unsaveMoment, commentOnMoment, type ReactionType } from "@/lib/api"
import { ActivityModal } from "./activity-modal"
import { useAuth } from "@/lib/auth/authContext"
import { useUserStatus } from "@/lib/contexts/UserStatusContext"
import { UserStatus } from "@/lib/types/userStatus"
import { useI18n } from "@/lib/i18n/I18nContext"
import { getStatusIndicator, isUserOnline, getShortLastSeenText } from "@/lib/utils/userStatusUtils"
import SimplifiedPostModal from "@/components/ui/SimplifiedPostModal"

interface PostProps {
  id?: string
  userId?: number            // User ID to fetch status
  username: string
  displayName?: string
  userAvatar: string
  location?: string
  image: string
  likes: number
  caption: string
  comments: Array<{ username: string; text: string }>
  timeAgo: string
  status?: string
  isOnline?: boolean
  // NEW PROPS
  isOwner?: boolean              // Detect if current user owns the post
  allowJoinIn?: boolean          // Show "Join in" button
  onActivityClick?: () => void   // Handler for Activity button
  onSendToFriends?: () => void
  isSaved?: boolean              // Whether current user has saved this moment
}

const reactions = [
  { icon: ThumbsUp, color: "#1877f2", label: "like", bgColor: "bg-[#1877f2]" },
  { icon: Heart, color: "#f33e5b", label: "love", bgColor: "bg-[#f33e5b]" },
  { icon: Laugh, color: "#f7b125", label: "haha", bgColor: "bg-[#f7b125]" },
  { icon: PartyPopper, color: "#f7b125", label: "wow", bgColor: "bg-[#f7b125]" },
  { icon: Frown, color: "#f7b125", label: "sad", bgColor: "bg-[#f7b125]" },
  { icon: Angry, color: "#e9710f", label: "angry", bgColor: "bg-[#e9710f]" },
]

export function Post({
  id,
  userId,
  username,
  displayName,
  userAvatar,
  location,
  image,
  likes,
  caption,
  comments,
  timeAgo,
  status,
  isOnline,
  isOwner = false,           // NEW: Default false
  allowJoinIn = false,       // NEW: Default false
  onActivityClick,           // NEW: Activity handler
  onSendToFriends,
  isSaved = false,           // NEW: Default false
}: PostProps) {
  const [selectedReaction, setSelectedReaction] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isReactionOpen, setIsReactionOpen] = useState(false)
  const [isJoinedIn, setIsJoinedIn] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [isSavedState, setIsSaved] = useState(isSaved)
  const [reactionCount, setReactionCount] = useState(likes || 0)
  const [isReacting, setIsReacting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingComment, setIsSendingComment] = useState(false)
  const [recentReactors, setRecentReactors] = useState<Array<{
    userId: number;
    username: string;
    avatarUrl: string;
    reactionType: ReactionType;
    createdAt: string;
  }>>([])
  const { toast } = useToast()
  const { user } = useAuth()
  const { t } = useI18n()

  // Get user status from context
  const { getUserStatus } = useUserStatus()
  const userStatusData = userId ? getUserStatus(userId) : undefined

  // Get status indicator configuration
  const statusIndicator = getStatusIndicator(userStatusData?.status)
  const userOnline = isUserOnline(userStatusData?.status)

  // Get short time text for offline users (to show in avatar overlay)
  const shortLastSeen = !userOnline ? getShortLastSeenText(userStatusData?.lastSeenAt, t) : null

  // Debug: Log isOwner prop
  console.log('🎨 [Post] Rendering:', {
    id,
    username,
    isOwner,
    allowJoinIn,
    hasActivityHandler: !!onActivityClick
  })

  // Map frontend reaction index to backend ReactionType
  const reactionTypeMap = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY']
  const reactionTypeToIndex: Record<string, number> = {
    'LIKE': 0,
    'LOVE': 1,
    'HAHA': 2,
    'WOW': 3,
    'SAD': 4,
    'ANGRY': 5,
  }

  // Load current user's reaction on mount
  const loadMyReaction = async () => {
    if (!id || isLoading) return

    setIsLoading(true)
    try {
      const result = await getMyReaction(Number(id))

      if (result && result.reactionType && reactionTypeToIndex[result.reactionType] !== undefined) {
        setSelectedReaction(reactionTypeToIndex[result.reactionType])
        console.log('✅ Loaded existing reaction:', result.reactionType)
      } else {
        // No reaction yet - this is normal
        setSelectedReaction(null)
      }
    } catch (error: any) {
      // Network error or other issues - just log and continue
      // Don't break the UI if we can't load reactions
      console.error('⚠️ Could not load reaction (backend might be down):', error.message || error)
      setSelectedReaction(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Load reaction on mount
  useEffect(() => {
    if (id) {
      loadMyReaction()
    }
  }, [id])

  // Load recent reactions for Activity button (only for owner)
  const loadRecentReactions = async () => {
    if (!id || !isOwner) return

    try {
      const result = await getRecentReactions(Number(id))
      setRecentReactors(result.reactors || [])
      console.log('✅ Loaded recent reactions:', result.count)
    } catch (error: any) {
      console.error('⚠️ Could not load recent reactions:', error.message || error)
      setRecentReactors([])
    }
  }

  // Load recent reactions when component mounts (for owner only)
  useEffect(() => {
    if (id && isOwner) {
      loadRecentReactions()
    }
  }, [id, isOwner])

  const handleReactionClick = async (index: number) => {
    if (!id || isReacting) return

    // Save previous state for rollback
    const previousReaction = selectedReaction
    const previousCount = reactionCount
    const isSameReaction = selectedReaction === index

    // OPTIMISTIC UI UPDATE - Immediate feedback
    if (isSameReaction) {
      // Toggle off - remove reaction
      setSelectedReaction(null)
      setReactionCount(prev => Math.max(0, prev - 1))
    } else if (selectedReaction === null) {
      // New reaction - add
      setSelectedReaction(index)
      setReactionCount(prev => prev + 1)
    } else {
      // Change reaction - count stays same
      setSelectedReaction(index)
    }

    setIsReacting(true)

    try {
      console.log('🎯 Reacting to moment:', id, 'with type:', reactionTypeMap[index])

      const result = await addMomentReaction(Number(id), reactionTypeMap[index] as ReactionType)
      console.log('✅ Reaction response:', result)

      // SYNC WITH SERVER DATA - Ensure consistency
      if (result.action === 'removed') {
        setSelectedReaction(null)
      } else {
        setSelectedReaction(index)
      }
      setReactionCount(result.totalReactions || 0)

      // Show success toast
      toast({
        title: result.action === 'removed' ? 'Reaction removed' : 'Reacted!',
        description: result.action === 'removed'
          ? 'Your reaction has been removed'
          : `You reacted with ${reactions[index].label}`,
      })
    } catch (error: any) {
      // ERROR HANDLING - Rollback optimistic update
      console.error('❌ Error reacting to moment:', error)

      // Rollback to previous state
      setSelectedReaction(previousReaction)
      setReactionCount(previousCount)

      // Show error toast
      const status = error.response?.status
      toast({
        title: 'Failed to react',
        description: status === 403
          ? "You don't have permission to react to this moment"
          : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsReacting(false)
      setIsReactionOpen(false)
    }
  }

  const handleSaveClick = async () => {
    if (!id || isSaving) return

    // OPTIMISTIC UI UPDATE - Immediate feedback
    const newSavedState = !isSavedState
    setIsSaved(newSavedState)

    setIsSaving(true)

    try {
      console.log('💾 Saving moment:', id, 'action:', newSavedState ? 'save' : 'unsave')

      if (newSavedState) {
        await saveMoment(Number(id))
      } else {
        await unsaveMoment(Number(id))
      }

      console.log('✅ Save action completed')

      // Show success toast
      toast({
        title: newSavedState ? 'Moment saved!' : 'Moment unsaved',
        description: newSavedState
          ? 'This moment has been added to your saved collection'
          : 'This moment has been removed from your saved collection',
      })
    } catch (error: any) {
      // ERROR HANDLING - Rollback optimistic update
      console.error('❌ Error saving moment:', error)

      // Rollback to previous state
      setIsSaved(!newSavedState)

      // Show error toast
      const status = error.response?.status
      toast({
        title: 'Failed to save',
        description: status === 403
          ? "You don't have permission to save this moment"
          : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😍", "🤔", "👏", "🙌", "💯", "✨"]

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(messageInput + emoji)
    setIsEmojiPickerOpen(false)
  }

  const handleSendComment = async () => {
    if (!messageInput.trim() || !id) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive"
      })
      return
    }

    // Không cho phép comment vào post của chính mình
    if (isOwner) {
      toast({
        title: "Cannot comment",
        description: "You cannot comment on your own post",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSendingComment(true)
      console.log("📤 Sending comment from post:", { momentId: id, comment: messageInput })

      await commentOnMoment(Number(id), messageInput)

      toast({
        title: "Comment sent!",
        description: "Your comment has been sent to the chat",
      })

      setMessageInput("")
    } catch (error) {
      console.error("Failed to send comment:", error)
      toast({
        title: "Failed to send comment",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsSendingComment(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSendingComment) {
      handleSendComment()
    }
  }
  const SelectedReactionIcon = selectedReaction !== null ? reactions[selectedReaction].icon : Heart
  const selectedReactionColor = selectedReaction !== null ? reactions[selectedReaction].color : "currentColor"

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  return (
    <>
      <article className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Post Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={userAvatar || "/placeholder.svg?height=32&width=32&query=user+profile+avatar"} />
                <AvatarFallback>{(displayName || username)[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              {/* Status indicator dot - green (ONLINE only) */}
              {statusIndicator.show && (
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${statusIndicator.className} border-2 border-card rounded-full z-10`}></span>
              )}
              {/* Short last seen text at bottom-right corner (compact) */}
              {!userOnline && shortLastSeen && (
                <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[7px] font-bold px-1 py-0.5 rounded-bl-md rounded-tr-lg">
                  {shortLastSeen}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{displayName || username}</span>
            </div>
          </div>
          <button className="hover:opacity-70 transition-opacity">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Post Image with caption overlay (Locket style) */}
        <div className="relative aspect-square bg-muted">
          <img
            src={image || "/placeholder.jpg"}
            alt={`Post by ${username}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setIsPostModalOpen(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />

          {/* Caption overlay on image */}
          {caption && (
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center z-10">
              <div className="bg-muted/90 backdrop-blur-sm rounded-2xl px-4 py-3 inline-block">
                <p className="text-sm text-foreground">{caption}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center font-normal px-2 py-2.5">
          <div className="flex items-center justify-between w-full py-0">
            {/* Heart reaction button on the left - smaller container, larger icon */}
            <Popover open={isReactionOpen} onOpenChange={setIsReactionOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 hover:bg-muted shrink-0"
                  onMouseEnter={() => setIsReactionOpen(true)}
                >
                  <SelectedReactionIcon
                    className="w-8 h-8 scale-150 border-0 opacity-100"
                    fill={selectedReaction !== null ? selectedReactionColor : "none"}
                    stroke={selectedReactionColor}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                className="w-auto p-2 bg-card border-border"
                onMouseLeave={() => setIsReactionOpen(false)}
              >
                <div className="flex items-center gap-1">
                  {reactions.map((reaction, index) => {
                    const Icon = reaction.icon
                    return (
                      <button
                        key={index}
                        onClick={() => handleReactionClick(index)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-125 transition-transform ${
                          selectedReaction === index ? reaction.bgColor : "hover:bg-muted"
                        }`}
                        title={reaction.label}
                      >
                        <Icon
                          className="w-6 h-6"
                          fill={selectedReaction === index ? "white" : reaction.color}
                          stroke={selectedReaction === index ? "white" : reaction.color}
                        />
                      </button>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* User info in center */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              <Avatar className="w-6 h-6">
                <AvatarImage src={userAvatar || "/placeholder.svg?height=24&width=24&query=user+avatar"} />
                <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">{username}</span>
              <span className="text-xs text-[#a8a8a8]">{timeAgo}</span>
            </div>

            {/* Save button on the right for balance */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:bg-muted shrink-0"
              onClick={handleSaveClick}
              title={isSavedState ? "Unsave" : "Save"}
            >
              <Bookmark className="h-8 w-8 scale-150" fill={isSavedState ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>

        <div className="px-4 h-12"></div>

        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center justify-center">
            {(() => {
              console.log('🎯 [Post Bottom] Rendering bottom section for:', username, 'isOwner:', isOwner)
              return null
            })()}

            {/* CASE 1: Owner's post → Show Activity button */}
            {isOwner ? (
              <Button
                onClick={onActivityClick || (() => setIsActivityOpen(true))}
                variant="ghost"
                className="h-12 px-4 rounded-full hover:bg-muted flex items-center gap-2 w-fit"
              >
                <span className="text-sm font-medium">✨ Activity</span>
                <div className="flex -space-x-2">
                  {/* Show avatars of recent reactors or "No recent activity" text */}
                  {recentReactors.length > 0 ? (
                    recentReactors.slice(0, 5).map((reactor, index) => (
                      <Avatar key={reactor.userId} className="w-6 h-6 border border-background">
                        <AvatarImage src={getAvatarUrl(reactor.avatarUrl)} />
                        <AvatarFallback>{reactor.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground ml-2">
                      No recent activity
                    </span>
                  )}
                </div>
              </Button>
            ) : (
              /* CASE 2: Other's post → Show message input + optional Join in */
              <div className="flex items-stretch gap-3 w-full">
                {/* Send message input */}
                <div className="flex-[5] flex items-center gap-3 bg-muted rounded-full px-4 h-12">
                  <input
                    type="text"
                    placeholder="Send message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSendingComment}
                    className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                  />
                  <div className="flex items-center gap-2">
                    {/* Edit photo icon */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-secondary"
                      onClick={() => setIsEditModalOpen(true)}
                      title="Edit photo"
                      disabled={isSendingComment}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 scale-150"
                      >
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </Button>

                    {/* Emoji picker */}
                    <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-secondary relative"
                          title="Add emoji"
                          disabled={isSendingComment}
                        >
                          <Smile className="w-5 h-5 scale-150" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="w-auto p-3 bg-card border-border">
                        <div className="grid grid-cols-6 gap-2">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-2xl"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Send button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-secondary"
                      onClick={handleSendComment}
                      disabled={isSendingComment || !messageInput.trim()}
                      title="Send comment"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Join in button (conditional) */}
                {allowJoinIn && (
                  <Button
                    variant="ghost"
                    onClick={() => setIsJoinedIn(!isJoinedIn)}
                    className={`flex-1 rounded-full h-12 transition-all flex items-center justify-center ${
                      isJoinedIn
                        ? "bg-muted text-muted-foreground hover:bg-secondary"
                        : "bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:opacity-90"
                    }`}
                    title="Join in"
                  >
                    <span className="text-sm font-medium">Join in</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Photo Edit Modal */}
      <PhotoEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        imageUrl={image}
        username={username}
        userAvatar={userAvatar}
      />

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        username={username}
        momentId={id ? Number(id) : undefined}
      />

      {/* Post Modal */}
      {isPostModalOpen && id && (
        <SimplifiedPostModal
          id={Number(id)}
          onClose={() => setIsPostModalOpen(false)}
        />
      )}
    </>
  )
}
