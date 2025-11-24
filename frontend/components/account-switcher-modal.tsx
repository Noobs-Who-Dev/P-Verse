"use client"

import { useState, useEffect } from "react"
import { X, Plus, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { accountSwitcherService, type SavedAccount } from "@/lib/services/accountSwitcherService"
import { useAuth } from "@/lib/auth/authContext"
import { API_BASE_URL } from "@/lib/api/axios"

interface AccountSwitcherModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountSwitcherModal({ isOpen, onClose }: AccountSwitcherModalProps) {
  const { switchAccount, logout, user } = useAuth()
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([])
  const [currentAccountId, setCurrentAccountId] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Reload accounts every time modal opens
      loadSavedAccounts()

      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden'

      // Add high z-index to body to ensure modal context
      document.body.style.position = 'relative'

      return () => {
        // Re-enable body scroll when modal closes
        document.body.style.overflow = 'unset'
        document.body.style.position = ''
      }
    }
  }, [isOpen, user])

  const loadSavedAccounts = () => {
    const accounts = accountSwitcherService.getSavedAccounts()
    let currentId = accountSwitcherService.getCurrentAccountId()

    // If no current account ID set but we have a logged-in user, sync it
    if (!currentId && user?.id) {
      currentId = user.id
      localStorage.setItem('current_account_id', user.id.toString())
    }

    setSavedAccounts(accounts)
    setCurrentAccountId(currentId)
  }

  const handleSwitchAccount = async (account: SavedAccount) => {
    if (account.id === currentAccountId) {
      // Already on this account
      onClose()
      return
    }

    // Check if token is still valid
    if (!accountSwitcherService.isAccountValid(account.id)) {
      alert('Token đã hết hạn. Vui lòng đăng nhập lại.')
      handleRemoveAccount(account.id)
      return
    }

    try {
      // Switch to the account using saved token
      await switchAccount(account)

      // Update current account ID immediately
      setCurrentAccountId(account.id)

      // Close modal first to show feedback
      onClose()

      // Small delay then reload page to update all data
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Failed to switch account:', error)
      alert('Không thể chuyển tài khoản. Vui lòng đăng nhập lại.')
      handleRemoveAccount(account.id)
    }
  }

  const handleRemoveAccount = (accountId: number) => {
    if (confirm('Bạn có muốn xóa tài khoản này khỏi danh sách?')) {
      accountSwitcherService.removeAccount(accountId)
      loadSavedAccounts()
    }
  }

  const handleAddAccount = () => {
    onClose()
    // Logout and redirect to login page to add new account
    logout()
  }

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl
    return `${API_BASE_URL}/${cleanPath}`
  }

  const formatExpiry = (expiryTime: number) => {
    const now = Date.now()
    const diff = expiryTime - now

    if (diff < 0) return 'Đã hết hạn'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `Còn ${days} ngày`
    if (hours > 0) return `Còn ${hours} giờ`
    return 'Sắp hết hạn'
  }

  if (!isOpen) return null

  return (
    <div
      data-account-switcher-modal
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{
        zIndex: 99999,  // Extremely high z-index
        isolation: 'isolate',
        pointerEvents: 'auto',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl relative"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Chuyển tài khoản</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accounts List */}
        <div className="max-h-[400px] overflow-y-auto">
          {savedAccounts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Chưa có tài khoản nào được lưu</p>
              <Button onClick={handleAddAccount} className="bg-[#0095f6] hover:bg-[#0095f6]/90">
                <Plus className="w-4 h-4 mr-2" />
                Thêm tài khoản
              </Button>
            </div>
          ) : (
            <>
              {savedAccounts.map((account) => {
                const isCurrent = account.id === currentAccountId
                const isExpired = !accountSwitcherService.isAccountValid(account.id)

                return (
                  <div
                    key={account.id}
                    className={`flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border ${
                      isCurrent ? 'bg-muted/50' : ''
                    } ${isExpired ? 'opacity-50' : 'cursor-pointer'}`}
                    onClick={() => !isExpired && handleSwitchAccount(account)}
                  >
                    {/* Avatar */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={getAvatarUrl(account.avatarUrl)} />
                      <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{account.username}</p>
                        {isCurrent && (
                          <Check className="w-4 h-4 text-[#0095f6] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{account.displayName}</p>
                      <p className={`text-xs ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {formatExpiry(account.expiryTime)}
                      </p>
                    </div>

                    {/* Remove button */}
                    {!isCurrent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveAccount(account.id)
                        }}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}

              {/* Add Account Button */}
              <button
                onClick={handleAddAccount}
                className="w-full flex items-center justify-center gap-2 p-4 hover:bg-muted/50 transition-colors text-[#0095f6] font-semibold"
              >
                <Plus className="w-5 h-5" />
                Thêm tài khoản
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

