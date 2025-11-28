"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Feed } from "@/components/feed"
import { FriendDropdown, FeedFilterOption } from "@/components/friend-dropdown"
import { RightSidebar } from "@/components/right-sidebar"
import { SearchPanel } from "@/components/search-panel"
import { NotificationsPanel } from "@/components/notifications-panel"
import { CreatePostModal } from "@/components/create-post-modal"

export function InstagramLayout() {
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState<FeedFilterOption>('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleNavClick = (item: string) => {
    if (item === "Search") {
      if (activePanel === "search") {
        setSidebarCollapsed(false)
        setActivePanel(null)
      } else {
        setSidebarCollapsed(true)
        setActivePanel("search")
      }
    } else if (item === "Notifications") {
      if (activePanel === "notifications") {
        setSidebarCollapsed(false)
        setActivePanel(null)
      } else {
        setSidebarCollapsed(true)
        setActivePanel("notifications")
      }
    } else if (item === "Create") {
      setShowCreateModal(true)
    } else if (item === "Messages") {
      router.push("/messages")
    } else {
      setSidebarCollapsed(false)
      setActivePanel(null)
    }
  }

  const handleClosePanel = () => {
    setSidebarCollapsed(false)
    setActivePanel(null)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onNavClick={handleNavClick} />

        {activePanel === "search" && <SearchPanel onClose={handleClosePanel} />}
        {activePanel === "notifications" && <NotificationsPanel onClose={handleClosePanel} />}

        <main
          className={`flex-1 px-1 py-0 ${sidebarCollapsed ? "ml-[73px]" : "ml-[245px]"} xl:mr-[320px] transition-all duration-300`}
        >
          <div className="relative">
            <div className="sticky top-8 z-40 flex justify-center pointer-events-none">
              <div className="pointer-events-auto">
                <FriendDropdown selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />
              </div>
            </div>
            <div className="max-w-[630px] mx-auto px-4 pt-20">
              <Feed selectedFilter={selectedFilter} />
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>


      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
