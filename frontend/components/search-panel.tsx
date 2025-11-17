"use client"

import type React from "react"

import { Search, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { searchUsers, toggleFriendRequest, type UserSearchDto, type FriendshipStatus } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Recent search terms (not people)
const recentSearchTerms = ["digital art", "photography", "design", "travel"]


interface SearchPanelProps {
  onClose: () => void
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserSearchDto[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isUpdatingFriend, setIsUpdatingFriend] = useState<Record<number, boolean>>({})
  const [searchError, setSearchError] = useState<string | null>(null)


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setHasSearched(false)
      setSearchResults([])
      setSearchError(null)
      return
    }

    setIsSearching(true)
    setSearchError(null)
    try {
      const results = await searchUsers(query)
      setSearchResults(results)
      setHasSearched(true)
    } catch (error) {
      console.error("Error searching users:", error)
      const errorMessage = error instanceof Error ? error.message : "Unable to search users. Please try again."
      setSearchError(errorMessage)
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      })
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchTermClick = (term: string) => {
    setSearchQuery(term)
    handleSearch(term)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleToggleFriend = async (userId: number, currentStatus: FriendshipStatus) => {
    // Prevent multiple simultaneous requests for the same user
    if (isUpdatingFriend[userId]) {
      return
    }

    // Don't allow toggling if already friends
    if (currentStatus === "FRIEND") {
      toast({
        title: "Already friends",
        description: "You are already friends with this user.",
      })
      return
    }

    // Don't allow toggling if blocked
    if (currentStatus === "BLOCKED") {
      toast({
        title: "Cannot add friend",
        description: "This user is blocked.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingFriend(prev => ({ ...prev, [userId]: true }))

    try {
      const response = await toggleFriendRequest(userId)

      if (response.success) {
        // Update the user's status in search results
        setSearchResults(prev =>
          prev.map(user =>
            user.id === userId
              ? { ...user, friendshipStatus: response.newStatus }
              : user
          )
        )

        toast({
          title: "Success",
          description: response.message,
        })
      } else {
        throw new Error(response.error || "Failed to update friend status")
      }
    } catch (error) {
      console.error("Error toggling friend request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to update friend status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingFriend(prev => ({ ...prev, [userId]: false }))
    }
  }

  const renderFriendButton = (user: UserSearchDto) => {
    const isLoading = isUpdatingFriend[user.id]
    const status = user.friendshipStatus

    // Debug logging
    console.log(`[SearchPanel] User ${user.username} (ID: ${user.id}):`, {
      status,
      displayName: user.displayName,
      friendshipStatus: user.friendshipStatus
    });

    // Already friends - show Message button
    if (status === "FRIEND") {
      return (
        <button className="px-6 py-1.5 bg-muted text-foreground rounded-full text-sm font-semibold hover:bg-accent transition-colors">
          Message
        </button>
      )
    }

    // Blocked - show disabled button
    if (status === "BLOCKED") {
      return (
        <button
          disabled
          className="px-6 py-1.5 bg-muted text-muted-foreground rounded-full text-sm font-semibold cursor-not-allowed"
        >
          Blocked
        </button>
      )
    }

    // Pending sent - show Pending button (can cancel)
    if (status === "PENDING_SENT") {
      return (
        <button
          onClick={() => handleToggleFriend(user.id, status)}
          disabled={isLoading}
          className="px-6 py-1.5 bg-muted text-foreground rounded-full text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "Pending"}
        </button>
      )
    }

    // Pending received - show Accept button
    if (status === "PENDING_RECEIVED") {
      return (
        <button
          onClick={() => handleToggleFriend(user.id, status)}
          disabled={isLoading}
          className="px-6 py-1.5 bg-[#0095f6] text-white rounded-full text-sm font-semibold hover:bg-[#0078d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "Accept"}
        </button>
      )
    }

    // Stranger - show Add button
    return (
      <button
        onClick={() => handleToggleFriend(user.id, status)}
        disabled={isLoading}
        className="px-6 py-1.5 bg-[#0095f6] text-white rounded-full text-sm font-semibold hover:bg-[#0078d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "..." : "Add"}
      </button>
    )
  }

  return (
    <div className="fixed left-[73px] top-0 bottom-0 w-[400px] bg-background border-r border-border z-30 animate-in slide-in-from-left">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-6">Search</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
              className="w-full bg-muted text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          {!hasSearched ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Recent</h3>
                <button className="text-sm text-[#0095f6] hover:opacity-70 font-semibold">Clear all</button>
              </div>

              <div className="flex flex-col gap-2">
                {recentSearchTerms.map((term) => (
                  <div
                    key={term}
                    onClick={() => handleSearchTermClick(term)}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{term}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Clear individual search term
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold mb-4">
                {isSearching ? "Searching..." : searchResults.length > 0 ? "Results" : "No results found"}
              </h3>

              {searchError && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium mb-2">⚠️ Connection Error</p>
                  <p className="text-xs text-muted-foreground mb-3">{searchError}</p>
                  {searchError.includes("Cannot connect to backend") && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold">Quick fix:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Open terminal in backend folder</li>
                        <li>Run: <code className="bg-muted px-1 py-0.5 rounded">mvnw spring-boot:run</code></li>
                        <li>Wait for "Started" message</li>
                        <li>Refresh this page</li>
                      </ol>
                      <p className="mt-2">
                        See <a href="/BACKEND_SETUP.md" className="text-[#0095f6] hover:underline" target="_blank">BACKEND_SETUP.md</a> for details.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback>{user.displayName?.[0] || user.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      </div>
                    </div>
                    {renderFriendButton(user)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
