"use client"

import { useState, useEffect, useCallback } from "react"
import { MomentCard } from "./moment-card"
import { FriendDropdown, FeedFilterOption } from "./friend-dropdown"
import { getMomentFeed, MomentResponseDTO } from "@/lib/api"
import { Loader2, ImageOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function MomentFeed() {
  const [moments, setMoments] = useState<MomentResponseDTO[]>([])
  const [filter, setFilter] = useState<FeedFilterOption>('all')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const { toast } = useToast()

  const loadMoments = useCallback(async (currentPage: number = 0, currentFilter: FeedFilterOption = filter) => {
    try {
      setLoading(true)
      const data = await getMomentFeed(currentFilter, currentPage, 20)

      if (currentPage === 0) {
        // First page - replace all moments
        setMoments(data.content || [])
      } else {
        // Next pages - append
        setMoments(prev => [...prev, ...(data.content || [])])
      }

      setHasMore(data.hasNext || false)
    } catch (error: any) {
      console.error("Failed to load moments:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load moments",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [filter, toast])

  // Load moments when filter changes
  useEffect(() => {
    setPage(0)
    loadMoments(0, filter)
  }, [filter, loadMoments])

  const handleFilterChange = (newFilter: FeedFilterOption) => {
    setFilter(newFilter)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadMoments(nextPage, filter)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Moments</h1>
        <FriendDropdown
          selectedFilter={filter}
          onSelectFilter={handleFilterChange}
        />
      </div>

      {/* Loading State */}
      {loading && moments.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && moments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <ImageOff className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No moments yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            {filter === 'friends'
              ? "Your friends haven't shared any moments yet. Be the first to share!"
              : filter === 'mine'
              ? "You haven't created any moments yet. Click 'Create' to share your first moment!"
              : "No moments to show. Start by adding friends or creating your first moment!"}
          </p>
        </div>
      )}

      {/* Moments Grid */}
      {moments.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {moments.map((moment) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                onClick={() => {
                  // TODO: Open moment viewer modal
                  console.log("Open moment:", moment.id)
                }}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

