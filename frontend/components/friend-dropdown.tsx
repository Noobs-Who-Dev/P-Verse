"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Users, Globe, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { getFriends, UserSearchDto } from "@/lib/api"
import { Loader2 } from "lucide-react"

export type FeedFilterOption = 'all' | 'friends' | 'mine' | `friend-${number}`;

interface FilterOption {
  id: FeedFilterOption;
  name: string;
  icon: typeof Globe;
}

const baseFilterOptions: FilterOption[] = [
  { id: "all", name: "All", icon: Globe },
  { id: "mine", name: "Mine", icon: User },
]

interface FriendDropdownProps {
  selectedFilter: FeedFilterOption
  onSelectFilter: (filter: FeedFilterOption) => void
}

export function FriendDropdown({ selectedFilter, onSelectFilter }: FriendDropdownProps) {
  const [friends, setFriends] = useState<UserSearchDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const data = await getFriends()
      setFriends(data)
    } catch (error) {
      console.error("Failed to load friends:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedOption = () => {
    // Check if it's a specific friend
    if (selectedFilter.startsWith('friend-')) {
      const friendId = parseInt(selectedFilter.replace('friend-', ''))
      const friend = friends.find(f => f.id === friendId)
      return friend ? { name: friend.displayName || friend.username, icon: null, friend } : baseFilterOptions[0]
    }

    return baseFilterOptions.find(opt => opt.id === selectedFilter) || baseFilterOptions[0]
  }

  const selectedOption = getSelectedOption()
  const SelectedIcon = selectedOption.icon

  const getAvatarUrl = (url: string | null) => {
    if (!url) return "/placeholder-user.jpg"
    if (url.startsWith('http')) return url
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${url}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 px-5 py-2.5 bg-card rounded-full hover:bg-muted transition-colors border border-border shadow-md hover:shadow-lg">
        {selectedOption.friend ? (
          <Avatar className="w-5 h-5">
            <AvatarImage src={getAvatarUrl(selectedOption.friend.avatarUrl)} />
            <AvatarFallback className="text-xs">{(selectedOption.friend.displayName || selectedOption.friend.username)[0]}</AvatarFallback>
          </Avatar>
        ) : SelectedIcon ? (
          <SelectedIcon className="w-5 h-5 text-muted-foreground" />
        ) : null}
        <span className="text-sm font-semibold text-foreground">{selectedOption.name}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[220px] bg-card border-border max-h-[400px] overflow-y-auto">
        {/* Base Filter Options */}
        {baseFilterOptions.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onSelectFilter(option.id)}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted focus:bg-muted text-foreground"
            >
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm">{option.name}</span>
            </DropdownMenuItem>
          )
        })}

        {/* Separator */}
        {friends.length > 0 && <DropdownMenuSeparator />}

        {/* Individual Friends */}
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : (
          friends.map((friend) => (
            <DropdownMenuItem
              key={friend.id}
              onClick={() => onSelectFilter(`friend-${friend.id}` as FeedFilterOption)}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted focus:bg-muted text-foreground"
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={getAvatarUrl(friend.avatarUrl)} />
                <AvatarFallback>{(friend.displayName || friend.username)[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-sm block truncate">{friend.displayName || friend.username}</span>
                {friend.isOnline && (
                  <span className="text-xs text-green-500">● Online</span>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}

        {/* Friends Count Info */}
        {!loading && friends.length > 0 && (
          <div className="px-3 py-2 border-t border-border mt-2">
            <span className="text-xs text-muted-foreground">
              {friends.length} friend{friends.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
