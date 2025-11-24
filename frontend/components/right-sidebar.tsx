"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/authContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { friendService, type UserSearchDto } from "@/lib/services/friendService"
import { API_BASE_URL } from "@/lib/api/axios"
import { AccountSwitcherModal } from "@/components/account-switcher-modal"
import { useI18n } from "@/lib/i18n/I18nContext"

export function RightSidebar() {
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const [friends, setFriends] = useState<UserSearchDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      // Load actual friends list
      const data = await friendService.getFriends()
      setFriends(data)
    } catch (error) {
      console.error('Failed to load friends:', error)
      setFriends([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchAccount = () => {
    // Show account switcher modal
    setShowAccountSwitcher(true)
  }

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    // Remove leading slash if present to avoid double slash
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${API_BASE_URL}/${cleanPath}`
  }

  const footerLinks = [
    { key: 'aboutUs', label: t('aboutUs') },
    { key: 'help', label: t('help') },
    { key: 'press', label: t('press') },
    { key: 'api', label: t('api') },
    { key: 'jobs', label: t('jobs') },
    { key: 'privacyFooter', label: t('privacyFooter') },
    { key: 'terms', label: t('terms') },
    { key: 'locations', label: t('locations') },
    { key: 'metaVerified', label: t('metaVerified') },
  ]

  return (
    <aside className="fixed right-0 top-0 w-[320px] h-screen pt-8 pr-8 hidden xl:block">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11">
              <AvatarImage src={getAvatarUrl(user?.avatarUrl)} />
              <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{user?.username || "User"}</p>
              <p className="text-sm text-[#a8a8a8]">{user?.displayName || ""}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-[#0095f6] text-xs font-semibold hover:text-white"
            onClick={handleSwitchAccount}
          >
            {t('switch')}
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#a8a8a8]">{t('friends')}</p>
            <button className="text-xs font-semibold text-white hover:text-[#a8a8a8]">{t('seeAll')}</button>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              <p className="text-xs text-[#a8a8a8]">{t('loadingFriends')}</p>
            ) : friends.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-[#a8a8a8] mb-2">{t('noFriendsYet')}</p>
                <p className="text-xs text-[#737373]">{t('searchAndAddFriends')}</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={getAvatarUrl(friend.avatarUrl)} />
                      <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{friend.username}</p>
                      <p className="text-xs text-[#a8a8a8]">{friend.displayName}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-[#0095f6] text-xs font-semibold hover:text-white h-auto p-0"
                  >
                    Message
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#737373] mb-4">
            {footerLinks.map((link, index) => (
              <span key={link.key}>
                <button className="hover:underline">{link.label}</button>
                {index < footerLinks.length - 1 && <span className="ml-2">·</span>}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#737373]">© 2025 P-VERSE FROM NOOBS-WHO-DEV</p>
        </div>
      </div>

      {/* Account Switcher Modal */}
      <AccountSwitcherModal
        isOpen={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
      />
    </aside>
  )
}
