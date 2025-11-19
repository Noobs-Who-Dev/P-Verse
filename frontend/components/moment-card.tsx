"use client"

import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Send } from "lucide-react"
import { MomentResponseDTO } from "@/lib/api"

interface MomentCardProps {
  moment: MomentResponseDTO
  onClick?: () => void
}

export function MomentCard({ moment, onClick }: MomentCardProps) {
  const getImageUrl = (imagePath: string) => {
    // If imagePath is already full URL, return it
    if (imagePath.startsWith('http')) return imagePath
    // Remove leading slash if present, then prepend backend URL
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  return (
    <div
      className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-square w-full">
        <Image
          src={getImageUrl(moment.imagePath)}
          alt={moment.caption || "Moment"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={getAvatarUrl(moment.user.avatarUrl)} />
            <AvatarFallback>{(moment.user.displayName || moment.user.username)[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {moment.user.displayName || moment.user.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {moment.timeAgo}
            </p>
          </div>
        </div>

        {/* Caption */}
        {moment.caption && (
          <p className="text-sm text-foreground line-clamp-2 mb-3">
            {moment.caption}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
            <Heart className={`w-5 h-5 ${moment.hasReacted ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-xs">{moment.reactionCount || 0}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">0</span>
          </button>
          <button className="hover:text-primary transition-colors ml-auto">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

