"use client"

import { useState } from "react"
import { X, ImageIcon } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Smile } from "lucide-react"

const friends = [
  { id: "all", name: "All" },
  { id: "1", name: "Sarah Johnson", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "2", name: "Mike Chen", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "3", name: "Emma Wilson", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "4", name: "David Lee", avatar: "/placeholder.svg?height=32&width=32" },
]

interface CreatePostModalProps {
  onClose: () => void
  selectedFriend: string
  onSelectFriend: (friend: string) => void
}

export function CreatePostModal({ onClose, selectedFriend, onSelectFriend }: CreatePostModalProps) {
  const [caption, setCaption] = useState("")

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-full max-w-[540px] max-h-[90vh] overflow-hidden border border-border">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <button onClick={onClose} className="text-foreground hover:text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-base font-semibold text-foreground">Create new post</h2>
          <Button className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold h-auto px-4 py-1.5">
            Share
          </Button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Post to:</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <span className="text-sm font-semibold text-foreground">{selectedFriend}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px] bg-card border-border">
                {friends.map((friend) => (
                  <DropdownMenuItem
                    key={friend.id}
                    onClick={() => onSelectFriend(friend.name)}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted focus:bg-muted text-foreground"
                  >
                    {friend.id !== "all" && friend.avatar && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-sm">{friend.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-8">
          <div className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center gap-4 hover:border-muted-foreground transition-colors cursor-pointer">
            <ImageIcon className="w-24 h-24 text-muted-foreground" />
            <p className="text-xl font-light text-foreground">Drag photos and videos here</p>
            <Button className="bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold">Select from computer</Button>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-3 mb-4">
            <button className="bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
              Fancy
            </button>
            <button className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
              Nature
            </button>
            <button className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
              Fire
            </button>
          </div>

          <div className="flex gap-3">
            <Avatar className="w-7 h-7">
              <AvatarImage src="/placeholder.svg?height=28&width=28" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <button className="text-muted-foreground hover:text-foreground">
              <Smile className="w-5 h-5" />
            </button>
            <span className="text-xs text-muted-foreground">{caption.length}/2,200</span>
          </div>
        </div>
      </div>
    </div>
  )
}
