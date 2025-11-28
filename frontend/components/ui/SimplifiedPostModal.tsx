"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getMomentById, MomentResponseDTO } from "@/lib/api"

interface SimplePostModalProps {
  id: number
  onClose: () => void
}

export default function SimplifiedPostModal({ id, onClose }: SimplePostModalProps) {
  const [fetchedPost, setFetchedPost] = useState<MomentResponseDTO | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      const postData = await getMomentById(id)
      setFetchedPost(postData)
    }

    if (id) {
      fetchPost()
    }
  }, [id])

  const displayPost = fetchedPost

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith("http")) return avatarUrl
    const cleanPath = avatarUrl.startsWith("/") ? avatarUrl.substring(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${cleanPath}`
  }

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith("http")) return imagePath
    const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/${cleanPath}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg overflow-hidden max-w-2xl w-full max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex flex-col">

          {/* Image */}
          <div className="bg-black flex items-center justify-center max-h-[85vh] overflow-hidden">
            <Image
              src={getImageUrl(displayPost?.imagePath)}
              alt="Post Image"
              width={800}
              height={800}
              className="max-h-[85vh] w-auto h-auto object-contain"
            />
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-t border-border flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={getAvatarUrl(displayPost?.user.avatarUrl || null)} />
              <AvatarFallback>
                {displayPost?.user.displayName?.charAt(0).toUpperCase() ||
                  displayPost?.user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <span className="text-base font-semibold">
              {displayPost?.user.displayName || displayPost?.user.username}
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
