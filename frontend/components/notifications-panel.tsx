"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const notifications = [
  {
    id: "1",
    type: "follow",
    user: { username: "sarah_johnson", avatar: "/placeholder.svg?height=44&width=44" },
    text: "started following you.",
    time: "2h",
  },
  {
    id: "2",
    type: "like",
    user: { username: "mike_chen", avatar: "/placeholder.svg?height=44&width=44" },
    text: "liked your photo.",
    time: "5h",
    postImage: "/tokyo-city-night-skyline.jpg",
  },
  {
    id: "3",
    type: "comment",
    user: { username: "emma_wilson", avatar: "/placeholder.svg?height=44&width=44" },
    text: "commented: Amazing shot! 🔥",
    time: "1d",
    postImage: "/golden-gate-bridge-sunset.jpg",
  },
  {
    id: "4",
    type: "follow",
    user: { username: "david_lee", avatar: "/placeholder.svg?height=44&width=44" },
    text: "started following you.",
    time: "2d",
  },
]

interface NotificationsPanelProps {
  onClose: () => void
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  return (
    <div className="fixed left-[73px] top-0 bottom-0 w-[400px] bg-background border-r border-border z-30 animate-in slide-in-from-left overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Notifications</h2>

        <div className="flex flex-col gap-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
            >
              <Avatar className="w-11 h-11">
                <AvatarImage src={notification.user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{notification.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{notification.user.username}</span>{" "}
                  <span className="text-muted-foreground">{notification.text}</span>{" "}
                  <span className="text-muted-foreground">{notification.time}</span>
                </p>
              </div>
              {notification.postImage && (
                <img
                  src={notification.postImage || "/placeholder.svg"}
                  alt="Post"
                  className="w-11 h-11 object-cover rounded"
                />
              )}
              {notification.type === "follow" && (
                <button className="px-4 py-1.5 bg-[#0095f6] text-white text-sm font-semibold rounded-lg hover:bg-[#1877f2]">
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
