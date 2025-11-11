"use client"

import type React from "react"

import { Search, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

// Recent search terms (not people)
const recentSearchTerms = ["digital art", "photography", "design", "travel"]

// Mock user data for search results
const allUsers = [
  { username: "sarah_johnson", name: "Sarah Johnson", avatar: "/placeholder.svg?height=44&width=44", status: "friend" },
  { username: "mike_chen", name: "Mike Chen", avatar: "/placeholder.svg?height=44&width=44", status: "not_friend" },
  { username: "emma_wilson", name: "Emma Wilson", avatar: "/placeholder.svg?height=44&width=44", status: "not_friend" },
  { username: "john_designer", name: "John Designer", avatar: "/placeholder.svg?height=44&width=44", status: "friend" },
  {
    username: "alex_digital",
    name: "Alex Digital",
    avatar: "/placeholder.svg?height=44&width=44",
    status: "not_friend",
  },
  {
    username: "digital_photo",
    name: "Digital Photo",
    avatar: "/placeholder.svg?height=44&width=44",
    status: "pending",
  },
]

interface SearchPanelProps {
  onClose: () => void
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<(typeof allUsers)[0][]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [friendStates, setFriendStates] = useState<Record<string, "friend" | "add" | "pending">>(
    Object.fromEntries(allUsers.map((user) => [user.username, user.status as "friend" | "add" | "pending"])),
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearch = (query: string = searchQuery) => {
    if (!query.trim()) {
      setHasSearched(false)
      setSearchResults([])
      return
    }

    const results = allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.name.toLowerCase().includes(query.toLowerCase()),
    )
    setSearchResults(results)
    setHasSearched(true)
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

  const toggleFriendStatus = (username: string) => {
    setFriendStates((prev) => {
      const currentStatus = prev[username]
      let newStatus: "friend" | "add" | "pending"

      if (currentStatus === "add") {
        newStatus = "pending"
      } else if (currentStatus === "pending") {
        newStatus = "add"
      } else {
        // "friend" stays as is, no toggle
        return prev
      }

      return { ...prev, [username]: newStatus }
    })
  }

  const renderFriendButton = (username: string) => {
    const status = friendStates[username]

    if (status === "friend") {
      return (
        <button className="px-6 py-1.5 bg-muted text-foreground rounded-full text-sm font-semibold hover:bg-accent transition-colors">
          Message
        </button>
      )
    }

    if (status === "pending") {
      return (
        <button
          onClick={() => toggleFriendStatus(username)}
          className="px-6 py-1.5 bg-muted text-foreground rounded-full text-sm font-semibold hover:bg-accent transition-colors"
        >
          Pending
        </button>
      )
    }

    // status === "add"
    return (
      <button
        onClick={() => toggleFriendStatus(username)}
        className="px-6 py-1.5 bg-[#0095f6] text-white rounded-full text-sm font-semibold hover:bg-[#0078d4] transition-colors"
      >
        Add
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
              className="w-full bg-muted text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
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
                {searchResults.length > 0 ? "Results" : "No results found"}
              </h3>

              <div className="flex flex-col gap-2">
                {searchResults.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.name}</p>
                      </div>
                    </div>
                    {renderFriendButton(user.username)}
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
