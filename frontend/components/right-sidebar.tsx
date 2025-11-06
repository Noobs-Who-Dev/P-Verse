"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const suggestions = [
  {
    username: "noa.hoanohan",
    subtitle: "Followed by noahoanohan",
    avatar: "/placeholder.svg?height=44&width=44",
  },
  {
    username: "thuysngan_01",
    subtitle: "Followed by trang_tran0103",
    avatar: "/placeholder.svg?height=44&width=44",
  },
  {
    username: "thanhtoctai",
    subtitle: "Followed by trang_tran0103",
    avatar: "/placeholder.svg?height=44&width=44",
  },
  {
    username: "kavin0190",
    subtitle: "Followed by hewuu.elan",
    avatar: "/placeholder.svg?height=44&width=44",
  },
  {
    username: "anot.her_han",
    subtitle: "Followed by hewuu.elan",
    avatar: "/placeholder.svg?height=44&width=44",
  },
]

const footerLinks = [
  "About",
  "Help",
  "Press",
  "API",
  "Jobs",
  "Privacy",
  "Terms",
  "Locations",
  "Language",
  "Meta Verified",
]

export function RightSidebar() {
  return (
    <aside className="fixed right-0 top-0 w-[320px] h-screen pt-8 pr-8 hidden xl:block">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11">
              <AvatarImage src="/placeholder.svg?height=44&width=44" />
              <AvatarFallback>JB</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">jbledgt</p>
              <p className="text-sm text-[#a8a8a8]">Hoàng Nguyễn</p>
            </div>
          </div>
          <Button variant="ghost" className="text-[#0095f6] text-xs font-semibold hover:text-white">
            Switch
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#a8a8a8]">Suggested for you</p>
            <button className="text-xs font-semibold text-white hover:text-[#a8a8a8]">See All</button>
          </div>

          <div className="flex flex-col gap-3">
            {suggestions.map((user) => (
              <div key={user.username} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-xs text-[#a8a8a8]">{user.subtitle}</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-[#0095f6] text-xs font-semibold hover:text-white h-auto p-0">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#737373] mb-4">
            {footerLinks.map((link, index) => (
              <span key={link}>
                <button className="hover:underline">{link}</button>
                {index < footerLinks.length - 1 && <span className="ml-2">·</span>}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#737373]">© 2025 P-VERSE FROM NOOBS-WHO-DEV</p>
        </div>
      </div>
    </aside>
  )
}
