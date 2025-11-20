// Account Switcher Service
// Manages multiple saved accounts for quick switching

export interface SavedAccount {
  id: number
  username: string
  displayName: string
  email: string
  avatarUrl?: string
  token: string
  loginTime: number
  expiryTime: number // 24 hours from login
}

const SAVED_ACCOUNTS_KEY = 'saved_accounts'
const CURRENT_ACCOUNT_ID_KEY = 'current_account_id'
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

export const accountSwitcherService = {
  // Get all saved accounts
  getSavedAccounts(): SavedAccount[] {
    try {
      const data = localStorage.getItem(SAVED_ACCOUNTS_KEY)
      if (!data) return []

      const accounts: SavedAccount[] = JSON.parse(data)

      // Filter out expired accounts
      const validAccounts = accounts.filter(acc => {
        const isValid = Date.now() < acc.expiryTime
        if (!isValid) {
          console.log(`Account ${acc.username} token expired, removing...`)
        }
        return isValid
      })

      // Update storage if some accounts were removed
      if (validAccounts.length !== accounts.length) {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(validAccounts))
      }

      return validAccounts
    } catch (error) {
      console.error('Failed to get saved accounts:', error)
      return []
    }
  },

  // Get current account ID
  getCurrentAccountId(): number | null {
    const id = localStorage.getItem(CURRENT_ACCOUNT_ID_KEY)
    return id ? parseInt(id) : null
  },

  // Save/Update account
  saveAccount(account: {
    id: number
    username: string
    displayName: string
    email: string
    avatarUrl?: string
    token: string
  }): void {
    try {
      const accounts = this.getSavedAccounts()

      const now = Date.now()
      const savedAccount: SavedAccount = {
        ...account,
        loginTime: now,
        expiryTime: now + TOKEN_EXPIRY_MS
      }

      // Remove existing account with same ID
      const filtered = accounts.filter(acc => acc.id !== account.id)

      // Add new/updated account
      filtered.push(savedAccount)

      // Sort by last login (most recent first)
      filtered.sort((a, b) => b.loginTime - a.loginTime)

      // Save to localStorage
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered))
      localStorage.setItem(CURRENT_ACCOUNT_ID_KEY, account.id.toString())

      console.log(`Account ${account.username} saved successfully`)
    } catch (error) {
      console.error('Failed to save account:', error)
    }
  },

  // Remove account
  removeAccount(accountId: number): void {
    try {
      const accounts = this.getSavedAccounts()
      const filtered = accounts.filter(acc => acc.id !== accountId)

      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered))

      // If removed current account, clear current ID
      if (this.getCurrentAccountId() === accountId) {
        localStorage.removeItem(CURRENT_ACCOUNT_ID_KEY)
      }

      console.log(`Account ${accountId} removed`)
    } catch (error) {
      console.error('Failed to remove account:', error)
    }
  },

  // Get account by ID
  getAccountById(accountId: number): SavedAccount | null {
    const accounts = this.getSavedAccounts()
    return accounts.find(acc => acc.id === accountId) || null
  },

  // Check if account token is valid
  isAccountValid(accountId: number): boolean {
    const account = this.getAccountById(accountId)
    if (!account) return false
    return Date.now() < account.expiryTime
  },

  // Clear all saved accounts
  clearAll(): void {
    localStorage.removeItem(SAVED_ACCOUNTS_KEY)
    localStorage.removeItem(CURRENT_ACCOUNT_ID_KEY)
    console.log('All saved accounts cleared')
  },

  // Get accounts count
  getAccountsCount(): number {
    return this.getSavedAccounts().length
  },

  // Check if account already saved
  isAccountSaved(accountId: number): boolean {
    return this.getAccountById(accountId) !== null
  }
}

