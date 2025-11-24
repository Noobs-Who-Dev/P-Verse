"use client"

import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { getMomentActivity, type ReactionType } from "@/lib/api"

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  momentId?: number
}

interface Viewer {
  username: string
  avatar: string
}

interface Reaction {
  username: string
  avatar: string
  emoji: string
}

export function ActivityModal({ isOpen, onClose, username, momentId }: ActivityModalProps) {
  const [activeTab, setActiveTab] = useState<"views" | "reactions">("views")
  const [activityData, setActivityData] = useState<{
    viewers: Array<{
      userId: number;
      username: string;
      avatarUrl: string;
      viewedAt: string;
    }>;
    reactions: Array<{
      userId: number;
      username: string;
      avatarUrl: string;
      reactionType: ReactionType;
      emoji: string;
      reactedAt: string;
    }>;
    totalViews: number;
    totalReactions: number;
  } | null>(null)
  const [loading, setLoading] = useState(false)

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  useEffect(() => {
    if (isOpen && momentId) {
      loadActivityData()
    }
  }, [isOpen, momentId])

  const loadActivityData = async () => {
    if (!momentId) return

    setLoading(true)
    try {
      const data = await getMomentActivity(momentId)
      setActivityData(data)
      console.log("✅ Loaded activity data:", data)
    } catch (error) {
      console.error("❌ Failed to load activity data:", error)
      // Fallback to empty data
      setActivityData({
        viewers: [],
        reactions: [],
        totalViews: 0,
        totalReactions: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Activity</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("views")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "views" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Views ({activityData?.totalViews ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("reactions")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "reactions" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Reactions ({activityData?.totalReactions ?? 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "views" && (
            <div className="p-4">
              {loading ? (
                <div className="text-center py-4">
                  <span className="text-sm text-muted-foreground">Loading viewers...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityData?.viewers.map((viewer) => (
                    <div key={viewer.username} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={getAvatarUrl(viewer.avatarUrl) || "/placeholder.svg"} />
                          <AvatarFallback>{viewer.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{viewer.username}</span>
                          <span className="text-xs text-muted-foreground">Viewed your moment</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reactions" && (
            <div className="p-4">
              {loading ? (
                <div className="text-center py-4">
                  <span className="text-sm text-muted-foreground">Loading reactions...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityData?.reactions.map((reaction) => (
                    <div key={`${reaction.username}-${reaction.emoji}`} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={getAvatarUrl(reaction.avatarUrl) || "/placeholder.svg"} />
                          <AvatarFallback>{reaction.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{reaction.username}</span>
                          <span className="text-xs text-muted-foreground">Reacted with {reaction.emoji}</span>
                        </div>
                      </div>
                      <span className="text-2xl">{reaction.emoji}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}