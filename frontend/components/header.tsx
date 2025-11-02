"use client"

import { Search, Heart, PlusSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-background border-b border-border z-50">
      <div className="h-full flex items-center justify-between px-5">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-semibold">Instagram</h1>
        </div>

        <div className="flex-1 max-w-[268px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-muted text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 flex-1 justify-end">
          <button className="hover:opacity-70 transition-opacity">
            <Heart className="w-6 h-6" />
          </button>
          <button className="hover:opacity-70 transition-opacity">
            <PlusSquare className="w-6 h-6" />
          </button>
          <Avatar className="w-7 h-7 cursor-pointer">
            <AvatarImage src="/abstract-geometric-shapes.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
