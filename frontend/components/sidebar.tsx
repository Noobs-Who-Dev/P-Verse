"use client"

import {
  Home,
  Search,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
  Menu,
  Settings,
  BarChart3,
  Bookmark,
  Moon,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/authContext"
import { useI18n } from "@/lib/i18n/I18nContext"

const navItems = [
  { icon: Home, label: "Home", key: "home" as const },
  { icon: Search, label: "Search", key: "search" as const },
  { icon: MessageCircle, label: "Messages", key: "messages" as const },
  { icon: Heart, label: "Notifications", key: "notifications" as const },
  { icon: PlusSquare, label: "Create", key: "createPost" as const },
  { icon: User, label: "Profile", key: "profile" as const },
]

interface SidebarProps {
  collapsed: boolean
  onNavClick: (item: string) => void
}

export function Sidebar({ collapsed, onNavClick }: SidebarProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const { t, language } = useI18n()
  const [activeItem, setActiveItem] = useState("Home")
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)

  const handleClick = (label: string) => {
    setActiveItem(label)
    if (label === "Profile") {
      router.push("/profile")
    }
    onNavClick(label)
  }

  const handleMoreItemClick = (action: string) => {
    setShowMoreDropdown(false)
    if (action === "Settings") {
      router.push("/settings")
    } else if (action === "Saved") {
      router.push("/profile") // Navigate to profile with saved tab
    } else if (action === "Log out") {
      logout()
    }
    // Add other actions as needed
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-background border-r border-border pt-8 px-3 transition-all duration-300 z-40",
        collapsed ? "w-[73px]" : "w-[245px]",
      )}
    >
      <div className="mb-8 px-3">
        {!collapsed ? (
          <h1 className="text-2xl" style={{ fontFamily: "'Brush Script MT', cursive" }}>
            P-verse
          </h1>
        ) : (
          <div className="w-6 h-6 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-lg" />
        )}
      </div>

      <nav className="flex flex-col gap-1 h-[calc(100vh-120px)]">
        <div className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item.label)}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-secondary transition-colors",
                activeItem === item.label && "font-bold",
              )}
              title={collapsed ? t(item.key) : undefined}
            >
              {item.label === "Profile" ? (
                <Avatar className="w-6 h-6">
                  <AvatarImage src="/placeholder.svg?height=24&width=24" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ) : (
                <item.icon className="w-6 h-6" strokeWidth={activeItem === item.label ? 2.5 : 2} />
              )}
              {!collapsed && <span className="text-base">{t(item.key)}</span>}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-border relative">
          {showMoreDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-[266px] bg-secondary rounded-lg shadow-lg overflow-hidden border border-border">
              <button
                onClick={() => handleMoreItemClick("Settings")}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                <Settings className="w-5 h-5" />
                <span>{t('settings')}</span>
              </button>
              <button
                onClick={() => handleMoreItemClick("Your activity")}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                <BarChart3 className="w-5 h-5" />
                <span>{language === 'vi' ? 'Hoạt động của bạn' : 'Your activity'}</span>
              </button>
              <button
                onClick={() => handleMoreItemClick("Saved")}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                <Bookmark className="w-5 h-5" />
                <span>{language === 'vi' ? 'Đã lưu' : 'Saved'}</span>
              </button>
              <button
                onClick={() => handleMoreItemClick("Switch appearance")}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                <Moon className="w-5 h-5" />
                <span>{language === 'vi' ? 'Chuyển giao diện' : 'Switch appearance'}</span>
              </button>
              <button
                onClick={() => handleMoreItemClick("Report a problem")}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                <AlertCircle className="w-5 h-5" />
                <span>{language === 'vi' ? 'Báo cáo sự cố' : 'Report a problem'}</span>
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => handleMoreItemClick("Switch accounts")}
                className="px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                <span>{t('switchAccount')}</span>
              </button>
              <div className="border-t border-border" />
              <button
                onClick={() => handleMoreItemClick("Log out")}
                className="px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                <span>{t('logout')}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowMoreDropdown(!showMoreDropdown)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-secondary transition-colors w-full"
            title={collapsed ? (language === 'vi' ? 'Thêm' : 'More') : undefined}
          >
            <Menu className="w-6 h-6" />
            {!collapsed && <span className="text-base">{language === 'vi' ? 'Thêm' : 'More'}</span>}
          </button>
        </div>
      </nav>
    </aside>
  )
}
