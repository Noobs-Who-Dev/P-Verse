"use client"

import { useState, useEffect } from "react"
import { X, MoreVertical, Copy, Trash2, Edit, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { MomentResponseDTO, getMomentActivity, commentOnMoment } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/authContext"

interface Reaction {
  userId: number
  username: string
  avatarUrl: string
  reactionType: string
  emoji: string
  reactedAt: string
}

interface PostDetailModalProps {
  post: MomentResponseDTO
  onClose: () => void
  onEdit?: (post: MomentResponseDTO) => void
  onDelete?: (postId: number) => void
}

export function PostDetailModal({ post, onClose, onEdit, onDelete }: PostDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState("")
  const [isSendingComment, setIsSendingComment] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Load reactions when modal opens
  useEffect(() => {
    loadReactions()
  }, [post.id])

  const loadReactions = async () => {
    try {
      setLoading(true)
      const data = await getMomentActivity(post.id)
      setReactions(data.reactions || [])
    } catch (error) {
      console.error("Failed to load reactions:", error)
      setReactions([])
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post)
    }
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      if (onDelete) {
        onDelete(post.id)
      }
      onClose()
    }, 300)
  }

  const handleSendComment = async () => {
    if (!comment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive"
      })
      return
    }

    // Không cho phép comment vào post của chính mình
    if (user && user.id === post.user.id) {
      toast({
        title: "Cannot comment",
        description: "You cannot comment on your own post",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSendingComment(true)
      console.log("📤 Sending comment:", { momentId: post.id, comment })

      await commentOnMoment(post.id, comment)

      toast({
        title: "Comment sent!",
        description: "Your comment has been sent to the chat",
      })

      setComment("")
      onClose()
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

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  // Helper function to get image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith('http')) return imagePath
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
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
              src={getImageUrl(post.imagePath)}
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
                  <AvatarImage src={getAvatarUrl(post.user.avatarUrl)} />
                  <AvatarFallback>{post.user.displayName?.charAt(0).toUpperCase() || post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold">{post.user.displayName || post.user.username}</span>
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
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {loading ? "Loading reactions..." : `${reactions.length} REACTIONS`}
                </p>
              </div>

              <div className="space-y-2">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading reactions...</p>
                ) : reactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No reactions yet</p>
                ) : (
                  reactions.map((item, index) => (
                    <div key={`${item.userId}-${item.reactionType}`} className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={getAvatarUrl(item.avatarUrl)} />
                        <AvatarFallback>{item.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground flex-1">{item.username}</span>
                      <span className="text-lg">{item.emoji}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats footer */}
            <div className="px-4 py-3 border-t border-border text-center text-sm text-muted-foreground">
              <div className="flex justify-center gap-4">
                <span>❤️ {post.reactionCount} reacts</span>
              </div>
            </div>

            {/* Comment input - chỉ hiển thị nếu không phải là post của mình */}
            {user && user.id !== post.user.id && (
              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isSendingComment) {
                        handleSendComment()
                      }
                    }}
                    disabled={isSendingComment}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendComment}
                    disabled={isSendingComment || !comment.trim()}
                    size="icon"
                    className="shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your comment will be sent to the chat with this post
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
