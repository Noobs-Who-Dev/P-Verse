"use client"
import { ChevronDown, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const friends = [
  { id: "all", name: "All", avatar: "" },
  { id: "1", name: "Sarah Johnson", avatar: "/placeholder.svg?height=36&width=36" },
  { id: "2", name: "Mike Chen", avatar: "/placeholder.svg?height=36&width=36" },
  { id: "3", name: "Emma Wilson", avatar: "/placeholder.svg?height=36&width=36" },
  { id: "4", name: "David Lee", avatar: "/placeholder.svg?height=36&width=36" },
]

interface FriendDropdownProps {
  selectedFriend: string
  onSelectFriend: (friend: string) => void
}

export function FriendDropdown({ selectedFriend, onSelectFriend }: FriendDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 px-5 py-2.5 bg-card rounded-full hover:bg-muted transition-colors border border-border shadow-md hover:shadow-lg">
        <Users className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">{selectedFriend}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[220px] bg-card border-border">
        {friends.map((friend) => (
          <DropdownMenuItem
            key={friend.id}
            onClick={() => onSelectFriend(friend.name)}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted focus:bg-muted text-foreground"
          >
            {friend.id !== "all" ? (
              <Avatar className="w-9 h-9">
                <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                <AvatarFallback>{friend.name[0]}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm">{friend.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
