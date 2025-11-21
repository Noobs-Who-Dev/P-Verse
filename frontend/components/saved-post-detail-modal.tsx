"use client"

import { useState, useEffect } from "react"
import { X, MoreVertical, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { MomentResponseDTO } from "@/lib/api"

interface SavedPostDetailModalProps {
  post: MomentResponseDTO
  onClose: () => void
  onSendMessage?: (username: string, message: string) => void
}

export function SavedPostDetailModal({ post, onClose, onSendMessage }: SavedPostDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState("")

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
  }

  const handleSend = () => {
    if (message.trim() === "") return
    onSendMessage?.(post.user.username, message)
    setMessage("")
  }

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith("http")) return avatarUrl
    const cleanPath = avatarUrl.startsWith("/") ? avatarUrl.substring(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${cleanPath}`
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith("http")) return imagePath
    const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${cleanPath}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-card border border-border rounded-lg overflow-hidden max-w-2xl w-full max-height-[90vh] flex flex-col transition-opacity duration-300 ${
          isDeleting ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Saved Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto flex gap-0">
          {/* Left - Image */}
          <div className="flex-[2] bg-black flex items-center justify-center">
            <Image
              src={getImageUrl(post.imagePath)}
              alt="Saved Post"
              width={600}
              height={600}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right - Details */}
          <div className="flex flex-col bg-card min-w-0 w-[260px]">   {/* giới hạn chiều ngang bên phải */}

            {/* User Info */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={getAvatarUrl(post.user.avatarUrl)} />
                  <AvatarFallback>
                    {post.user.displayName?.charAt(0).toUpperCase() || post.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold">
                  {post.user.displayName || post.user.username}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyLink} className="flex items-center gap-2 cursor-pointer">
                    <Copy className="w-4 h-4" />
                    <span>Copy link</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Spacer để đẩy chat xuống dưới */}
            <div className="flex-1"></div>

            {/* Chat Input — chỉ rộng bằng panel bên phải */}
            <div className="px-4 py-3 border-t border-border flex items-center gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-border px-4 py-2 text-sm bg-background focus:outline-none"
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleSend}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
