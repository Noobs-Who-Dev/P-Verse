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
  Sun,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/authContext"
import { useI18n } from "@/lib/i18n/I18nContext"
import { getAvatarUrl } from "@/lib/utils/avatar"
import { useTheme } from "next-themes"
import { ActivityModal } from "@/components/activity-modal"
import { ReportProblemModal } from "@/components/report-problem-modal"
import { YourActivityModal } from "@/components/your-activity-modal"
import { settingsService } from "@/app/(protected)/services/settingsService"
import { useToast } from "@/hooks/use-toast"
import { UserStatusIndicator } from "@/components/ui/user-status-indicator"
import { useUserStatus } from "@/lib/contexts/UserStatusContext"
import { UserStatus } from "@/lib/types/userStatus"

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
  const { user, logout } = useAuth()
  const { t, language } = useI18n()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const { myStatus } = useUserStatus() // Get current user status
  const [activeItem, setActiveItem] = useState("Home")
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showYourActivityModal, setShowYourActivityModal] = useState(false)

  const handleClick = (label: string) => {
    setActiveItem(label)
    if (label === "Profile") {
      router.push("/profile")
    }
    onNavClick(label)
  }

  const handleThemeToggle = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated. Please login again.",
        variant: "destructive",
      })
      return
    }

    try {
      // Toggle theme
      const newTheme = theme === "dark" ? "light" : "dark"
      setTheme(newTheme)

      // Save to database
      await settingsService.updateTheme(user.id, newTheme.toUpperCase())

      toast({
        title: "Success",
        description: `Theme changed to ${newTheme} mode`,
      })
    } catch (error) {
      console.error("Failed to update theme:", error)
      toast({
        title: "Error",
        description: "Failed to update theme. Please try again.",
        variant: "destructive",
      })
      // Revert theme on error
      setTheme(theme === "dark" ? "light" : "dark")
    }
  }

  const handleMoreItemClick = (action: string) => {
    setShowMoreDropdown(false)

    if (action === "Settings") {
      router.push("/settings")
    } else if (action === "Saved") {
      router.push("/profile") // Navigate to profile with saved tab
    } else if (action === "Switch appearance") {
      // Toggle theme and save to database
      handleThemeToggle()
    } else if (action === "Your activity") {
      // Open your activity modal
      setShowYourActivityModal(true)
    } else if (action === "Report a problem") {
      // Open report problem modal
      setShowReportModal(true)
    } else if (action === "Log out") {
      logout()
    }
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
                <div className="relative">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={getAvatarUrl(user?.avatarUrl)} />
                    <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <UserStatusIndicator
                    status={myStatus || UserStatus.OFFLINE}
                    size="sm"
                    className="absolute -bottom-0.5 -right-0.5 border-2 border-background"
                  />
                </div>
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
                <span>{t('yourActivity')}</span>
              </button>
              <button
                onClick={() => handleMoreItemClick("Saved")}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                <Bookmark className="w-5 h-5" />
                <span>{t('saved')}</span>
              </button>
              <button
                onClick={() => handleMoreItemClick("Switch appearance")}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span>{t('switchAppearance')}</span>
              </button>
              <button
                onClick={() => handleMoreItemClick("Report a problem")}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors w-full text-left"
              >
                <AlertCircle className="w-5 h-5" />
                <span>{t('reportProblem')}</span>
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

      {/* Activity Modal */}
      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        username={user?.username || ""}
      />

      {/* Report Problem Modal */}
      <ReportProblemModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Your Activity Modal */}
      <YourActivityModal
        isOpen={showYourActivityModal}
        onClose={() => setShowYourActivityModal(false)}
      />
    </aside>
  )
}
