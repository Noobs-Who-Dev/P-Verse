"use client"

import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/authContext"
import { getUserMoments, getUserReactions, getSavedMoments, MomentResponseDTO, ReactionType } from "@/lib/api"

interface YourActivityModalProps {
  isOpen: boolean
  onClose: () => void
}

export function YourActivityModal({ isOpen, onClose }: YourActivityModalProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"moments" | "reactions" | "saved">("moments")
  const [activityData, setActivityData] = useState<{
    moments: Array<{
      id: number;
      caption: string;
      imagePath: string;
      createdAt: string;
      reactionsCount: number;
    }>;
    reactions: Array<{
      momentId: number;
      momentCaption: string;
      reactionType: string;
      emoji: string;
      reactedAt: string;
    }>;
    saved: Array<{
      momentId: number;
      momentCaption: string;
      momentImagePath: string;
      savedAt: string;
    }>;
  } | null>(null)
  const [loading, setLoading] = useState(false)

  // Helper function to get avatar URL
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith('http')) return imagePath
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  useEffect(() => {
    if (isOpen && user) {
      loadActivityData()
    }
  }, [isOpen, user])

  const loadActivityData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load data for all tabs in parallel
      const [momentsResponse, reactionsResponse, savedResponse] = await Promise.all([
        getUserMoments(0, 20),
        getUserReactions(0, 20),
        getSavedMoments(0, 20)
      ])

      const activityData = {
        moments: momentsResponse.content.map((moment: MomentResponseDTO) => ({
          id: moment.id,
          caption: moment.caption || "No caption",
          imagePath: moment.imagePath,
          createdAt: moment.createdAt,
          reactionsCount: moment.reactionCount,
        })),
        reactions: reactionsResponse.content.map((reaction: any) => ({
          momentId: reaction.momentId,
          momentCaption: reaction.momentCaption,
          reactionType: reaction.reactionType,
          emoji: reaction.emoji,
          reactedAt: reaction.reactedAt
        })),
        saved: savedResponse.content.map((moment: MomentResponseDTO) => ({
          momentId: moment.id,
          momentCaption: moment.caption || "No caption",
          momentImagePath: moment.imagePath,
          savedAt: new Date().toISOString() // TODO: Add savedAt when available
        }))
      }

      setActivityData(activityData)
      console.log("✅ Loaded user activity data:", activityData)
    } catch (error) {
      console.error("❌ Failed to load user activity data:", error)
      setActivityData({
        moments: [],
        reactions: [],
        saved: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Your Activity</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("moments")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "moments" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Your Moments ({activityData?.moments.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("reactions")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "reactions" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Your Reactions ({activityData?.reactions.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "saved" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Saved Moments ({activityData?.saved.length ?? 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "moments" && (
            <div className="p-4">
              {loading ? (
                <div className="text-center py-4">
                  <span className="text-sm text-muted-foreground">Loading your moments...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityData?.moments.map((moment) => (
                    <div key={moment.id} className="flex gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <img
                        src={getImageUrl(moment.imagePath)}
                        alt={moment.caption}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">{moment.caption}</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(moment.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{moment.reactionsCount} reactions</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activityData?.moments.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">You haven't posted any moments yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "reactions" && (
            <div className="p-4">
              {loading ? (
                <div className="text-center py-4">
                  <span className="text-sm text-muted-foreground">Loading your reactions...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityData?.reactions.map((reaction, index) => (
                    <div key={index} className="flex items-center justify-between hover:bg-muted/50 p-3 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{reaction.emoji}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            Reacted to "{reaction.momentCaption}"
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reaction.reactedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activityData?.reactions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">You haven't reacted to any moments yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="p-4">
              {loading ? (
                <div className="text-center py-4">
                  <span className="text-sm text-muted-foreground">Loading saved moments...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityData?.saved.map((saved, index) => (
                    <div key={index} className="flex gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <img
                        src={getImageUrl(saved.momentImagePath)}
                        alt={saved.momentCaption}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">{saved.momentCaption}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved on {new Date(saved.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activityData?.saved.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">You haven't saved any moments yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
