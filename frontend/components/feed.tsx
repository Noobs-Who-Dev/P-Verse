"use client"

import { Post } from "@/components/post"
import { useState } from "react"
import { SendToFriendsModal } from "@/components/send-to-friends-modal"

const posts = [
  {
    id: "1",
    username: "sarah_johnson",
    userAvatar: "/placeholder.svg?height=32&width=32",
    status: "Playing Delta Force Game",
    image: "/tokyo-city-night-skyline.jpg",
    likes: 1234,
    caption: "I swear this wasn't planned ✨",
    comments: [
      { username: "mike_chen", text: "Stunning view!" },
      { username: "emma_wilson", text: "I miss Tokyo so much 😍" },
    ],
    timeAgo: "36m",
  },
  {
    id: "2",
    username: "mike_chen",
    userAvatar: "/placeholder.svg?height=32&width=32",
    status: "Listening to Spotify",
    image: "/golden-gate-bridge-sunset.jpg",
    likes: 856,
    caption: "Golden hour hits different 🌅",
    comments: [{ username: "david_lee", text: "Beautiful shot!" }],
    timeAgo: "2h",
  },
  {
    id: "3",
    username: "emma_wilson",
    userAvatar: "/placeholder.svg?height=32&width=32",
    status: "Watching Netflix",
    image: "/eiffel-tower-evening-paris.jpg",
    likes: 2341,
    caption: "Living my best life rn 💕",
    comments: [
      { username: "sarah_johnson", text: "So jealous! 😍" },
      { username: "mike_chen", text: "Need to visit soon" },
    ],
    timeAgo: "5h",
  },
]

interface FeedProps {
  selectedFriend: string
}

export function Feed({ selectedFriend }: FeedProps) {
  const [sendToFriendsModal, setSendToFriendsModal] = useState<{ image: string; username: string } | null>(null)

  // Filter posts based on selected friend
  const filteredPosts =
    selectedFriend === "All"
      ? posts
      : posts.filter((post) => post.username === selectedFriend.toLowerCase().replace(" ", "_"))

  return (
    <>
      <div className="flex flex-col gap-6">
        {filteredPosts.map((post) => (
          <Post
            key={post.id}
            {...post}
            onSendToFriends={() => setSendToFriendsModal({ image: post.image, username: post.username })}
          />
        ))}
      </div>

      {sendToFriendsModal && (
        <SendToFriendsModal
          isOpen={true}
          onClose={() => setSendToFriendsModal(null)}
          image={sendToFriendsModal.image}
          username={sendToFriendsModal.username}
        />
      )}
    </>
  )
}
