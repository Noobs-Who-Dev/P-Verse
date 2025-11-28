"use client"

import { useState, useEffect } from "react"
import { getFriends, unfriend, type UserSearchDto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, Search, MoreVertical, MessageCircle, UserMinus, Ban } from "lucide-react"

interface FriendsListDetailProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onBack: () => void
}

export function FriendsListDetail({ searchQuery, setSearchQuery, onBack }: FriendsListDetailProps) {
  const [friends, setFriends] = useState<UserSearchDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${cleanPath}`
  }

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    setIsLoading(true)
    try {
      const data = await getFriends()
      setFriends(data)
    } catch (error) {
      console.error("Error loading friends:", error)
      toast({
        title: "Error",
        description: "Failed to load friends list",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnfriend = async (userId: number) => {
    try {
      const response = await unfriend(userId)
      if (response.success) {
        setFriends((prev) => prev.filter((f) => f.id !== userId))
        toast({ title: "Success", description: response.message })
      }
    } catch (error) {
      console.error("Error unfriending:", error)
      toast({
        title: "Error",
        description: "Failed to unfriend user",
        variant: "destructive",
      })
    }
  }

  const filteredFriends = friends.filter(
    (friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-muted rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-semibold">Friends List</h2>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary border-none"
        />
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No friends found</p>
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={getAvatarUrl(friend.avatarUrl)} alt={friend.displayName || friend.username} />
                  <AvatarFallback>{(friend.displayName || friend.username)[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{friend.displayName || friend.username}</div>
                  <div className="text-sm text-muted-foreground">@{friend.username}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem className="hover:bg-muted cursor-pointer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUnfriend(friend.id)} className="hover:bg-muted cursor-pointer">
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfriend
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 hover:bg-muted cursor-pointer">
                    <Ban className="w-4 h-4 mr-2" />
                    Block
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

