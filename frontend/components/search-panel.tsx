"use client"

import { Search, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

const recentSearches = [
  { username: "sarah_johnson", name: "Sarah Johnson", avatar: "/placeholder.svg?height=44&width=44" },
  { username: "mike_chen", name: "Mike Chen", avatar: "/placeholder.svg?height=44&width=44" },
  { username: "emma_wilson", name: "Emma Wilson", avatar: "/placeholder.svg?height=44&width=44" },
]

interface SearchPanelProps {
  onClose: () => void
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Recent</h3>
            <button className="text-sm text-[#0095f6] hover:opacity-70 font-semibold">Clear all</button>
          </div>

          <div className="flex flex-col gap-2">
            {recentSearches.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
