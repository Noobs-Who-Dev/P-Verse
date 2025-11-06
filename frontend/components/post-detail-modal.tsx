"use client"

import { useState } from "react"
import { X, MoreVertical, Copy, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

interface Reaction {
  username: string
  reaction: string
}

interface PostDetailModalProps {
  post: {
    id: number
    image: string
    likes: number
    comments: number
    reactions?: Reaction[]
  }
  onClose: () => void
}

const reactionEmojis: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😲",
  sad: "😢",
  angry: "😠",
}

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const mockReactions: Reaction[] = post.reactions || [
    { username: "john_doe", reaction: "love" },
    { username: "jane_smith", reaction: "like" },
    { username: "mike_chen", reaction: "haha" },
    { username: "sarah_lee", reaction: "love" },
  ]

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
  }

  const handleEdit = () => {
    console.log("Edit post:", post.id)
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-card border border-border rounded-lg overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col transition-opacity duration-300 ${
          isDeleting ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto flex gap-0">
          {/* Left side - Image */}
          <div className="flex-[2] bg-black flex items-center justify-center">
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post"
              width={600}
              height={600}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right side - Details */}
          <div className="flex-1 flex flex-col bg-card min-w-0">
            {/* User info and menu */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/images/design-mode/image.png" />
                  <AvatarFallback>JB</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold">jbleclgt</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-2 cursor-pointer">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink} className="flex items-center gap-2 cursor-pointer">
                    <Copy className="w-4 h-4" />
                    <span>Copy link</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="flex items-center gap-2 cursor-pointer text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reactions section */}
            <div className="px-4 py-4 border-b border-border flex-1 overflow-y-auto">
              <div className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{mockReactions.length} REACTIONS</p>
              </div>

              <div className="space-y-2">
                {mockReactions.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={`/images/design-mode/image.png`} />
                      <AvatarFallback>{item.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground flex-1">{item.username}</span>
                    <span className="text-lg">{reactionEmojis[item.reaction] || "👍"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats footer */}
            <div className="px-4 py-3 border-t border-border text-center text-sm text-muted-foreground">
              <div className="flex justify-center gap-4">
                <span>❤️ {post.likes} likes</span>
                <span>💬 {post.comments} comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
