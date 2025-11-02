"use client"

import { Heart, MoreHorizontal, ThumbsUp, Laugh, Frown, Angry, PartyPopper, Smile, Bookmark } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { PhotoEditModal } from "./photo-edit-modal"

interface PostProps {
  username: string
  userAvatar: string
  location?: string
  image: string
  likes: number
  caption: string
  comments: Array<{ username: string; text: string }>
  timeAgo: string
  status?: string
  onSendToFriends?: () => void
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
  username,
  userAvatar,
  location,
  image,
  likes,
  caption,
  comments,
  timeAgo,
  status,
  onSendToFriends,
}: PostProps) {
  const [selectedReaction, setSelectedReaction] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isReactionOpen, setIsReactionOpen] = useState(false)
  const [isJoinedIn, setIsJoinedIn] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  const handleReactionClick = (index: number) => {
    setSelectedReaction(selectedReaction === index ? null : index)
    setIsReactionOpen(false)
  }

  const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😍", "🤔", "👏", "🙌", "💯", "✨"]

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(messageInput + emoji)
    setIsEmojiPickerOpen(false)
  }

  const SelectedReactionIcon = selectedReaction !== null ? reactions[selectedReaction].icon : Heart
  const selectedReactionColor = selectedReaction !== null ? reactions[selectedReaction].color : "currentColor"

  return (
    <>
      <article className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Post Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userAvatar || "/placeholder.svg?height=32&width=32&query=user+profile+avatar"} />
              <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{username}</span>
              {status && (
                <span className="text-xs text-[#a8a8a8] flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {status}
                </span>
              )}
            </div>
          </div>
          <button className="hover:opacity-70 transition-opacity">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Post Image with caption overlay (Locket style) */}
        <div className="relative aspect-square bg-muted">
          <img
            src={image || "/placeholder.svg?height=600&width=600&query=instagram+post+photo"}
            alt={`Post by ${username}`}
            className="w-full h-full object-cover"
          />

          {/* Caption overlay on image */}
          {caption && (
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
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
              onClick={() => setIsSaved(!isSaved)}
              title={isSaved ? "Unsave" : "Save"}
            >
              <Bookmark className="h-8 w-8 scale-150" fill={isSaved ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>

        <div className="px-4 h-12"></div>

        <div className="border-t border-border px-4 py-3">
          <div className="flex items-stretch gap-3">
            {/* Send message input - takes 5/6 width */}
            <div className="flex-[5] flex items-center gap-3 bg-muted rounded-full px-4 h-12">
              <input
                type="text"
                placeholder="Send message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center gap-2">
                {/* Edit photo icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-secondary"
                  onClick={() => setIsEditModalOpen(true)}
                  title="Edit photo"
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

                {/* Emoji picker button - stays as button icon */}
                <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-secondary relative"
                      title="Add emoji"
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
              </div>
            </div>

            {/* Join in button - takes 1/6 width, full height with text */}
            {username === "mike_chen" && (
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
    </>
  )
}
