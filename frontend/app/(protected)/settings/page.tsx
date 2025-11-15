"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Sidebar } from "@/components/sidebar"
import { MessengerPopup } from "@/components/messenger-popup"
import { SearchPanel } from "@/components/search-panel"
import { NotificationsPanel } from "@/components/notifications-panel"
import { CreatePostModal } from "@/components/create-post-modal"
import { FriendsListDetail } from "@/components/settings/friends-list-detail"
import { FriendRequestsDetail } from "@/components/settings/friend-requests-detail"
import { SentRequestsDetail } from "@/components/settings/sent-requests-detail"
import {
  User,
  Users,
  Bell,
  Palette,
  Camera,
  Sparkles,
  Zap,
  Rocket,
  Info,
  ChevronRight,
  ChevronLeft,
  X,
  Smartphone,
  Trash2,
  Key,
  Edit,
  AlertTriangle,
  Sun,
  Moon,
  Globe,
  Plus,
  Trash,
  Music,
  Gamepad2,
  Sticker,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const settingsCategories = [
  {
    title: "App Settings",
    items: [
      { id: "account", label: "Account", icon: User },
      { id: "social", label: "Social", icon: Users },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "appearance", label: "Appearance & Experience", icon: Palette },
    ],
  },
  {
    title: "Feature Settings",
    items: [
      { id: "moments", label: "Moments & Capture", icon: Camera },
      { id: "smart-context", label: "Smart Context", icon: Sparkles },
      { id: "interaction-tools", label: "Direct Interaction Tools", icon: Zap },
    ],
  },
  {
    title: "Advanced & Support",
    items: [
      { id: "startup", label: "Startup & Performance", icon: Rocket },
      { id: "about", label: "About", icon: Info },
    ],
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [selectedSetting, setSelectedSetting] = useState("notifications")
  const [detailView, setDetailView] = useState<string | null>(null)
  const [messengerOpen, setMessengerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [emailRevealed, setEmailRevealed] = useState(false)
  const [phoneRevealed, setPhoneRevealed] = useState(false)
  const [language, setLanguage] = useState("en")
  const [notificationSettings, setNotificationSettings] = useState({
    desktopNotifications: false,
    newMoments: false,
    newMessages: false,
    newMessagesSound: false,
    joinInRequests: false,
    joinInRequestsSound: false,
    creativeChainRequests: false,
    creativeChainResults: false,
    friendEndorsements: false,
    doNotDisturbStart: "00:00",
    doNotDisturbEnd: "23:59",
  })
  const [socialSettings, setSocialSettings] = useState({
    statusVisibility: "all-friends",
  })

  const [momentsSettings, setMomentsSettings] = useState({
    screenshotHotkey: "Ctrl+Shift+S",
    saveLocalCopy: true,
    localCopyFolder: "~/Pictures/Captures",
  })

  const [smartContextSettings, setSmartContextSettings] = useState({
    enableContextRecognition: true,
    spotify: true,
    lol: true,
    steam: true,
    customApps: [
      { id: "1", name: "Visual Studio Code", enabled: true },
      { id: "2", name: "Discord", enabled: true },
    ],
  })

  const [interactionToolsSettings, setInteractionToolsSettings] = useState({
    showSticker: true,
    showPinNotes: true,
    showVoiceFeedback: true,
    stickerPacks: [
      { id: "1", name: "Emoji Pack", installed: true },
      { id: "2", name: "Anime Pack", installed: true },
      { id: "3", name: "Cute Animals", installed: false },
    ],
  })

  const [startupSettings, setStartupSettings] = useState({
    launchWithOS: false,
    runInBackground: true,
  })

  const [aboutSettings] = useState({
    version: "1.0.0",
    buildDate: "October 17, 2025",
    licenses: [
      { name: "React", version: "18.2.0", license: "MIT" },
      { name: "Next.js", version: "15.0.0", license: "MIT" },
      { name: "Tailwind CSS", version: "4.0.0", license: "MIT" },
      { name: "Lucide Icons", version: "0.263.1", license: "ISC" },
    ],
    supportEmail: "support@locket.app",
    supportUrl: "https://support.locket.app",
  })

  const [accountInfo, setAccountInfo] = useState({
    displayName: "Hoàng Nguyên",
    username: "jbleclgt",
    email: "hoang.nguyen@example.com",
    phone: "+84 123 456 789",
  })

  const mockDevices = [
    {
      id: "1",
      name: "Windows PC",
      location: "Ho Chi Minh City, Vietnam",
      lastActive: "Active now",
      current: true,
    },
    {
      id: "2",
      name: "iPhone 14 Pro",
      location: "Ho Chi Minh City, Vietnam",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: "3",
      name: "MacBook Pro",
      location: "Hanoi, Vietnam",
      lastActive: "1 day ago",
      current: false,
    },
  ]

  const mockBlockedUsers = [
    { id: "1", username: "spam.account", name: "Spam Account", avatar: "/generic-profile.jpg" },
    { id: "2", username: "toxic.user", name: "Toxic User", avatar: "/anonymous-profile.jpg" },
  ]

  const handleNavClick = (item: string) => {
    if (item === "Home") {
      router.push("/")
    } else if (item === "Search") {
      // Toggle: if already open, close it; if closed, open it
      if (activePanel === "search") {
        setSidebarCollapsed(false)
        setActivePanel(null)
      } else {
        setSidebarCollapsed(true)
        setActivePanel("search")
      }
    } else if (item === "Notifications") {
      // Toggle: if already open, close it; if closed, open it
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
    } else if (item === "Profile") {
      router.push("/profile")
    } else {
      setSidebarCollapsed(false)
      setActivePanel(null)
    }
  }

  const handleClosePanel = () => {
    setSidebarCollapsed(false)
    setActivePanel(null)
  }

  const handleOpenFullMessenger = (username?: string) => {
    if (username) {
      router.push(`/messages?user=${username}`)
    } else {
      router.push("/messages")
    }
    setMessengerOpen(false)
  }

  const getSelectedSettingLabel = () => {
    for (const category of settingsCategories) {
      const item = category.items.find((i) => i.id === selectedSetting)
      if (item) return item.label
    }
    return ""
  }

  const renderNotificationSettings = () => {
    return (
      <div className="space-y-6">
        {/* Desktop Notifications */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Enable Desktop Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications on your desktop when you're not actively using the app.
              </p>
            </div>
            <Switch
              checked={notificationSettings.desktopNotifications}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, desktopNotifications: checked })
              }
            />
          </div>
        </div>

        {/* Detailed Notification Settings */}
        <div className="border border-border rounded-xl p-6 bg-card space-y-6">
          <h3 className="text-lg font-semibold mb-4">Notification Details</h3>

          {/* New Moments */}
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">New Moments from Friends</h4>
              <p className="text-sm text-muted-foreground">Get notified when friends share new moments.</p>
            </div>
            <Switch
              checked={notificationSettings.newMoments}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newMoments: checked })}
            />
          </div>

          {/* New Messages */}
          <div className="pb-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-base font-medium mb-1">New Chat Messages</h4>
                <p className="text-sm text-muted-foreground">Receive notifications for new direct messages.</p>
              </div>
              <Switch
                checked={notificationSettings.newMessages}
                onCheckedChange={(checked) =>
                  setNotificationSettings({ ...notificationSettings, newMessages: checked })
                }
              />
            </div>
            {notificationSettings.newMessages && (
              <div className="flex items-center justify-between pl-4">
                <span className="text-sm text-muted-foreground">Play sound</span>
                <Switch
                  checked={notificationSettings.newMessagesSound}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, newMessagesSound: checked })
                  }
                />
              </div>
            )}
          </div>

          {/* Join In Requests */}
          <div className="pb-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-base font-medium mb-1">Join In Requests</h4>
                <p className="text-sm text-muted-foreground">Get notified when someone wants to join your moment.</p>
              </div>
              <Switch
                checked={notificationSettings.joinInRequests}
                onCheckedChange={(checked) =>
                  setNotificationSettings({ ...notificationSettings, joinInRequests: checked })
                }
              />
            </div>
            {notificationSettings.joinInRequests && (
              <div className="flex items-center justify-between pl-4">
                <span className="text-sm text-muted-foreground">Play sound</span>
                <Switch
                  checked={notificationSettings.joinInRequestsSound}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, joinInRequestsSound: checked })
                  }
                />
              </div>
            )}
          </div>

          {/* Creative Chain Requests */}
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">Creative Chain Requests</h4>
              <p className="text-sm text-muted-foreground">
                Receive invitations to join creative collaboration chains.
              </p>
            </div>
            <Switch
              checked={notificationSettings.creativeChainRequests}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, creativeChainRequests: checked })
              }
            />
          </div>

          {/* Creative Chain Results */}
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">Creative Chain Results</h4>
              <p className="text-sm text-muted-foreground">
                Get notified when a creative chain you participated in is complete.
              </p>
            </div>
            <Switch
              checked={notificationSettings.creativeChainResults}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, creativeChainResults: checked })
              }
            />
          </div>

          {/* Friend Endorsements */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">Friend Endorsement Requests</h4>
              <p className="text-sm text-muted-foreground">
                Receive requests when someone wants you to endorse their friendship.
              </p>
            </div>
            <Switch
              checked={notificationSettings.friendEndorsements}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, friendEndorsements: checked })
              }
            />
          </div>
        </div>

        {/* Do Not Disturb */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Do Not Disturb</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Automatically disable notifications during specific hours. You won't receive any notifications during this
            time.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Start time</label>
              <Select
                value={notificationSettings.doNotDisturbStart}
                onValueChange={(value) =>
                  setNotificationSettings({ ...notificationSettings, doNotDisturbStart: value })
                }
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, "0")
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">End time</label>
              <Select
                value={notificationSettings.doNotDisturbEnd}
                onValueChange={(value) => setNotificationSettings({ ...notificationSettings, doNotDisturbEnd: value })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, "0")
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    )
  }


  const renderBlockedUsersDetail = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setDetailView(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold">Blocked Users</h2>
        </div>

        {/* Blocked Users List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {mockBlockedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-muted-foreground">{user.name}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-border hover:bg-muted bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Unblock
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderSocialSettings = () => {
    return (
      <div className="space-y-6">
        {/* Friends List */}
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <h3 className="text-lg font-semibold mb-4">Friends List</h3>

          <button
            onClick={() => setDetailView("friends-list")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">View Friends List</h4>
              <p className="text-sm text-muted-foreground">See all your current friends and manage connections.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          </button>

          <button
            onClick={() => setDetailView("friend-requests")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">Pending Friend Requests</h4>
              <p className="text-sm text-muted-foreground">View and manage incoming friend requests.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          </button>

          <button
            onClick={() => setDetailView("sent-requests")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">Sent Friend Requests</h4>
              <p className="text-sm text-muted-foreground">View and manage your outgoing friend requests.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          </button>
        </div>

        {/* Privacy */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Privacy</h3>
          <div>
            <h4 className="text-base font-medium mb-2">Who can see my status?</h4>
            <p className="text-sm text-muted-foreground mb-4">Control who can view your online status and activity.</p>
            <RadioGroup
              value={socialSettings.statusVisibility}
              onValueChange={(value) => setSocialSettings({ ...socialSettings, statusVisibility: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value="all-friends" id="all-friends" />
                <Label htmlFor="all-friends" className="flex-1 cursor-pointer">
                  <div className="font-medium">All Friends</div>
                  <div className="text-sm text-muted-foreground">
                    Everyone on your friends list can see your status.
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value="custom-list" id="custom-list" />
                <Label htmlFor="custom-list" className="flex-1 cursor-pointer">
                  <div className="font-medium">Custom List Only</div>
                  <div className="text-sm text-muted-foreground">Only selected friends can see your status.</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value="no-one" id="no-one" />
                <Label htmlFor="no-one" className="flex-1 cursor-pointer">
                  <div className="font-medium">No One</div>
                  <div className="text-sm text-muted-foreground">Your status will be hidden from everyone.</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Blocked Users */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Blocked Users</h3>
          <button
            onClick={() => setDetailView("blocked-users")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">Manage Blocked Users</h4>
              <p className="text-sm text-muted-foreground">View and manage your list of blocked users.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          </button>
        </div>
      </div>
    )
  }

  const renderAccountSettings = () => {
    return (
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="border border-border rounded-xl p-6 bg-card space-y-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

          {/* Display Name */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">Display Name</h4>
              <p className="text-sm text-muted-foreground">{accountInfo.displayName}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-[#0095f6] hover:text-[#0095f6]/90 hover:bg-transparent">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Username */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">Username</h4>
              <p className="text-sm text-muted-foreground">{accountInfo.username}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-[#0095f6] hover:text-[#0095f6]/90 hover:bg-transparent">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">Email</h4>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {emailRevealed ? accountInfo.email : maskEmail(accountInfo.email)}
                </p>
                <button
                  onClick={() => setEmailRevealed(!emailRevealed)}
                  className="text-sm text-[#0095f6] hover:underline"
                >
                  {emailRevealed ? "Hide" : "Reveal"}
                </button>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-[#0095f6] hover:text-[#0095f6]/90 hover:bg-transparent">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Phone Number */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">Phone Number</h4>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {phoneRevealed ? accountInfo.phone : maskPhone(accountInfo.phone)}
                </p>
                <button
                  onClick={() => setPhoneRevealed(!phoneRevealed)}
                  className="text-sm text-[#0095f6] hover:underline"
                >
                  {phoneRevealed ? "Hide" : "Reveal"}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-500/90 hover:bg-transparent">
                Remove
              </Button>
              <Button variant="ghost" size="sm" className="text-[#0095f6] hover:text-[#0095f6]/90 hover:bg-transparent">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Password & Authentication */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Password & Authentication</h3>
          <Button className="bg-[#0095f6] hover:bg-[#0095f6]/90">
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </div>

        {/* Device Management */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Device Management</h3>
          <button
            onClick={() => setDetailView("device-management")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">Manage Devices</h4>
              <p className="text-sm text-muted-foreground">
                View logged-in devices and remotely log out from any device.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          </button>
        </div>

        {/* Delete Account */}
        <div className="border border-red-500/20 rounded-xl p-6 bg-card">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-500 mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDeviceManagementDetail = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setDetailView(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold">Device Management</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Manage devices where you're currently logged in. You can remotely log out from any device.
        </p>

        {/* Devices List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {mockDevices.map((device) => (
            <div key={device.id} className="p-4 border border-border rounded-xl bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {device.name}
                      {device.current && (
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Current</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{device.location}</div>
                    <div className="text-xs text-muted-foreground mt-1">{device.lastActive}</div>
                  </div>
                </div>
                {!device.current && (
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted bg-transparent">
                    Log Out
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderAppearanceSettings = () => {
    return (
      <div className="space-y-6">
        {/* Theme Toggle */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Theme</h3>
              <p className="text-sm text-muted-foreground">Choose between light and dark mode for the interface.</p>
            </div>
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-muted-foreground" />
              <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
              <Moon className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-start gap-4">
            <Globe className="w-5 h-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Language</h3>
              <p className="text-sm text-muted-foreground mb-4">Select your preferred display language.</p>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full max-w-xs bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMomentsSettings = () => {
    return (
      <div className="space-y-6">
        {/* Screenshot Hotkey */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Screenshot Hotkey</h3>
              <p className="text-sm text-muted-foreground">Customize keyboard shortcut to activate screenshot mode.</p>
            </div>
          </div>
          <div className="mt-4">
            <Input
              type="text"
              value={momentsSettings.screenshotHotkey}
              onChange={(e) => setMomentsSettings({ ...momentsSettings, screenshotHotkey: e.target.value })}
              className="bg-secondary border-border max-w-xs"
              placeholder="e.g., Ctrl+Shift+S"
            />
            <p className="text-xs text-muted-foreground mt-2">Press keys to record your custom hotkey</p>
          </div>
        </div>

        {/* Save Local Copy */}
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Save Local Copy</h3>
              <p className="text-sm text-muted-foreground">
                Automatically save a copy of captured images to a folder on your computer.
              </p>
            </div>
            <Switch
              checked={momentsSettings.saveLocalCopy}
              onCheckedChange={(checked) => setMomentsSettings({ ...momentsSettings, saveLocalCopy: checked })}
            />
          </div>

          {momentsSettings.saveLocalCopy && (
            <div className="pt-4 border-t border-border">
              <label className="text-sm text-muted-foreground mb-2 block">Save location</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={momentsSettings.localCopyFolder}
                  onChange={(e) => setMomentsSettings({ ...momentsSettings, localCopyFolder: e.target.value })}
                  className="bg-secondary border-border flex-1"
                  placeholder="Select folder path"
                />
                <Button variant="outline" className="border-border hover:bg-muted bg-transparent">
                  Browse
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Captured images will be saved to this folder automatically
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSmartContextSettings = () => {
    return (
      <div className="space-y-6">
        {/* Enable Context Recognition */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Enable Context Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Disable this feature completely if you don't want context detection.
              </p>
            </div>
            <Switch
              checked={smartContextSettings.enableContextRecognition}
              onCheckedChange={(checked) =>
                setSmartContextSettings({ ...smartContextSettings, enableContextRecognition: checked })
              }
            />
          </div>
        </div>

        {/* App Management */}
        {smartContextSettings.enableContextRecognition && (
          <div className="border border-border rounded-xl p-6 bg-card space-y-6">
            <h3 className="text-lg font-semibold mb-4">App Management</h3>
            <p className="text-sm text-muted-foreground">
              Similar to registered games in Discord. Toggle recognition for specific apps.
            </p>

            {/* Built-in Apps */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Built-in Apps</h4>

              {/* Spotify */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium">Spotify</div>
                    <div className="text-xs text-muted-foreground">Music streaming service</div>
                  </div>
                </div>
                <Switch
                  checked={smartContextSettings.spotify}
                  onCheckedChange={(checked) => setSmartContextSettings({ ...smartContextSettings, spotify: checked })}
                />
              </div>

              {/* League of Legends */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">League of Legends</div>
                    <div className="text-xs text-muted-foreground">Multiplayer online game</div>
                  </div>
                </div>
                <Switch
                  checked={smartContextSettings.lol}
                  onCheckedChange={(checked) => setSmartContextSettings({ ...smartContextSettings, lol: checked })}
                />
              </div>

              {/* Steam */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Steam</div>
                    <div className="text-xs text-muted-foreground">Gaming platform</div>
                  </div>
                </div>
                <Switch
                  checked={smartContextSettings.steam}
                  onCheckedChange={(checked) => setSmartContextSettings({ ...smartContextSettings, steam: checked })}
                />
              </div>
            </div>

            {/* Custom Apps */}
            <div className="pt-6 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">Custom Apps</h4>
                <Button size="sm" variant="outline" className="border-border hover:bg-muted bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Add App
                </Button>
              </div>

              {smartContextSettings.customApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border"
                >
                  <div className="flex-1">
                    <div className="font-medium">{app.name}</div>
                    <div className="text-xs text-muted-foreground">Custom application</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={app.enabled} />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-500/90 hover:bg-transparent"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderInteractionToolsSettings = () => {
    return (
      <div className="space-y-6">
        {/* Sticker Library - File Upload */}
        <div className="border border-border rounded-xl p-6 bg-card space-y-6">
          <h3 className="text-lg font-semibold mb-4">Sticker Library</h3>
          <p className="text-sm text-muted-foreground">Upload sticker packs to add to your library.</p>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <Sticker className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium mb-1">Drag and drop sticker files here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Supported formats: .zip, .png, .jpg</p>
            </div>
            <input type="file" multiple accept=".zip,.png,.jpg,.jpeg" className="hidden" />
          </div>

          {/* Installed Sticker Packs */}
          {interactionToolsSettings.stickerPacks.length > 0 && (
            <div className="pt-6 border-t border-border space-y-3">
              <h4 className="text-sm font-medium">Installed Packs</h4>
              {interactionToolsSettings.stickerPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Sticker className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{pack.name}</div>
                      <div className="text-xs text-muted-foreground">Installed</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-500/90 hover:bg-transparent">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderStartupSettings = () => {
    return (
      <div className="space-y-6">
        {/* Launch with OS */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Launch with Windows/macOS</h3>
              <p className="text-sm text-muted-foreground">
                Automatically start the application when you turn on your computer.
              </p>
            </div>
            <Switch
              checked={startupSettings.launchWithOS}
              onCheckedChange={(checked) => setStartupSettings({ ...startupSettings, launchWithOS: checked })}
            />
          </div>
        </div>

        {/* Run in Background */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Run in Background</h3>
              <p className="text-sm text-muted-foreground">
                Keep the application running in the background when you close the main window.
              </p>
            </div>
            <Switch
              checked={startupSettings.runInBackground}
              onCheckedChange={(checked) => setStartupSettings({ ...startupSettings, runInBackground: checked })}
            />
          </div>
        </div>
      </div>
    )
  }

  const renderAboutSettings = () => {
    return (
      <div className="space-y-6">
        {/* App Version */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">App Version</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="font-medium">{aboutSettings.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Build Date</span>
              <span className="font-medium">{aboutSettings.buildDate}</span>
            </div>
          </div>
        </div>

        {/* Licenses */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Licenses</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Open source libraries and their licenses used in this application.
          </p>
          <div className="space-y-3">
            {aboutSettings.licenses.map((lib, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border"
              >
                <div>
                  <div className="font-medium">{lib.name}</div>
                  <div className="text-xs text-muted-foreground">
                    v{lib.version} • {lib.license}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Contact */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Support Contact</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Need help? Reach out to our support team through the following channels.
          </p>
          <div className="space-y-3">
            <a
              href={`mailto:${aboutSettings.supportEmail}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border"
            >
              <div>
                <div className="font-medium">Email Support</div>
                <div className="text-sm text-[#0095f6]">{aboutSettings.supportEmail}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </a>
            <a
              href={aboutSettings.supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border"
            >
              <div>
                <div className="font-medium">Support Portal</div>
                <div className="text-sm text-[#0095f6]">Visit our support website</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  const renderSettingsContent = () => {
    if (detailView === "friends-list") {
      return <FriendsListDetail searchQuery={searchQuery} setSearchQuery={setSearchQuery} onBack={() => setDetailView(null)} />
    }
    if (detailView === "friend-requests") {
      return <FriendRequestsDetail onBack={() => setDetailView(null)} />
    }
    if (detailView === "sent-requests") {
      return <SentRequestsDetail onBack={() => setDetailView(null)} />
    }
    if (detailView === "blocked-users") {
      return renderBlockedUsersDetail()
    }
    if (detailView === "device-management") {
      return renderDeviceManagementDetail()
    }

    if (selectedSetting === "account") {
      return renderAccountSettings()
    }
    if (selectedSetting === "notifications") {
      return renderNotificationSettings()
    }
    if (selectedSetting === "social") {
      return renderSocialSettings()
    }
    if (selectedSetting === "appearance") {
      return renderAppearanceSettings()
    }
    if (selectedSetting === "moments") {
      return renderMomentsSettings()
    }
    if (selectedSetting === "smart-context") {
      return renderSmartContextSettings()
    }
    if (selectedSetting === "interaction-tools") {
      return renderInteractionToolsSettings()
    }
    if (selectedSetting === "startup") {
      return renderStartupSettings()
    }
    if (selectedSetting === "about") {
      return renderAboutSettings()
    }
    return (
      <div className="text-muted-foreground">
        <p>Settings details for {getSelectedSettingLabel()} will be displayed here.</p>
      </div>
    )
  }

  const maskEmail = (email: string) => {
    const atIndex = email.indexOf("@")
    if (atIndex === -1) return email
    return "*".repeat(16) + email.substring(atIndex)
  }

  const maskPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "")
    const lastFour = digits.slice(-4)
    return "*".repeat(8) + lastFour
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onNavClick={handleNavClick} />

        {activePanel === "search" && <SearchPanel onClose={handleClosePanel} />}
        {activePanel === "notifications" && <NotificationsPanel onClose={handleClosePanel} />}


        <main className={`flex-1 ${sidebarCollapsed ? "ml-[73px]" : "ml-[245px]"} transition-all duration-300`}>
          <div className="flex h-screen">
            {/* Left sidebar - Settings categories */}
            <div className="w-[400px] border-r border-border overflow-y-auto bg-background">
              <div className="p-8">
                <h1 className="text-2xl font-semibold mb-8">Settings</h1>

                <div className="space-y-6">
                  {settingsCategories.map((category) => (
                    <div key={category.title}>
                      <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-3">{category.title}</h2>
                      <div className="space-y-1">
                        {category.items.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedSetting(item.id)
                                setDetailView(null)
                              }}
                              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                                selectedSetting === item.id
                                  ? "bg-muted text-foreground"
                                  : "text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <span className="text-sm">{item.label}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right content - Settings detail */}
            <div className="flex-1 overflow-y-auto bg-background">
              <div className="p-8">
                {!detailView && <h2 className="text-2xl font-semibold mb-8">{getSelectedSettingLabel()}</h2>}
                {renderSettingsContent()}
              </div>
            </div>
          </div>
        </main>
      </div>

      <MessengerPopup
        isOpen={messengerOpen}
        onToggle={() => setMessengerOpen(!messengerOpen)}
        onOpenFullMessenger={handleOpenFullMessenger}
      />

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          selectedFriend={selectedFriend}
          onSelectFriend={setSelectedFriend}
        />
      )}
    </div>
  )
}
