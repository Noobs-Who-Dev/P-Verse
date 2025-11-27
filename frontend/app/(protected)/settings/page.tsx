"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Sidebar } from "@/components/sidebar"
import { SearchPanel } from "@/components/search-panel"
import { NotificationsPanel } from "@/components/notifications-panel"
import { CreatePostModal } from "@/components/create-post-modal"
import { MessengerPopup } from "@/components/messenger-popup"
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
  Save,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState, useRef } from 'react';
import { settingsService } from '@/app/(protected)/services/settingsService';
import { profileService } from '@/lib/services/profileService';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/lib/auth/authContext';
import { useI18n } from '@/lib/i18n/I18nContext';
import { FriendsListDetail } from '@/components/settings/friends-list-detail';
import { FriendRequestsDetail } from '@/components/settings/friend-requests-detail';
import { SentRequestsDetail } from '@/components/settings/sent-requests-detail';


export default function SettingsPage() {
  // ✅ Lấy userId từ user đã login (AuthContext)
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const userId = user?.id; // Dynamic userId from authenticated user

  // ✅ Use i18n context for language
  const { language, setLanguage, t } = useI18n();

  // Settings categories with translations
  const settingsCategories = [
    {
      title: t('appSettings'),
      items: [
        { id: "account", label: t('account'), icon: User },
        { id: "social", label: t('social'), icon: Users },
        { id: "notifications", label: t('notifications'), icon: Bell },
        { id: "appearance", label: t('appearance'), icon: Palette },
      ],
    },
    {
      title: t('featureSettings'),
      items: [
        { id: "moments", label: t('moments'), icon: Camera },
        { id: "smart-context", label: t('smartContext'), icon: Sparkles },
        { id: "interaction-tools", label: t('interactionTools'), icon: Zap },
      ],
    },
    {
      title: t('advancedSupport'),
      items: [
        { id: "startup", label: t('startup'), icon: Rocket },
        { id: "about", label: t('about'), icon: Info },
      ],
    },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()
  const { theme: nextTheme, setTheme } = useTheme()
  const { toast } = useToast()

  // Default to "account" tab
  const [selectedSetting, setSelectedSetting] = useState("account")
  const [detailView, setDetailView] = useState<string | null>(null)
  const [messengerOpen, setMessengerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [emailRevealed, setEmailRevealed] = useState(false)

  // Ref to track if component has mounted and settings loaded
  const hasLoadedSettings = useRef(false);


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

  const [interactionToolsSettings] = useState({
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
    displayName: "",
    username: "",
    email: "",
    bio: "",
  })

  // Edit mode states
  const [editMode, setEditMode] = useState<string | null>(null) // "displayName", "username", "email", "bio"
  const [editValue, setEditValue] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Change Password modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Load settings from backend
  useEffect(() => {
    // ✅ Check if auth is still loading
    if (authLoading) {
      console.log('[Settings] Waiting for auth...');
      return;
    }

    // Only load settings once
    if (hasLoadedSettings.current) {
      console.log('[Settings] Skipping reload - already loaded');
      return;
    }

    // ✅ Check if user is authenticated (snapshot current value)
    const currentUser = user;
    const currentUserId = currentUser?.id;

    if (!currentUser || !currentUserId) {
      console.error('[Settings] No authenticated user, redirecting to login...');
      router.push('/login');
      return;
    }

    const loadSettings = async () => {
      try {
        console.log('[Settings] Loading settings for user:', currentUserId);
        const data = await settingsService.getSettings(currentUserId);

        // Sync backend data với UI state
        const themeValue = data.theme?.toLowerCase() || 'light';
        setTheme(themeValue);

        // Sync language with i18n context
        const backendLang = data.language === 'VI' ? 'vi' : 'en';
        setLanguage(backendLang as 'vi' | 'en');

        if (data.notificationsEnabled !== undefined) {
          setNotificationSettings(prev => ({
            ...prev,
            desktopNotifications: data.notificationsEnabled
          }));
        }


        console.log('[Settings] Loaded:', { theme: themeValue, language: backendLang });
        setIsLoading(false);
        hasLoadedSettings.current = true; // Mark as loaded
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]); // Only run when authLoading changes, not when user changes

  // Update selectedSetting when URL parameter changes
  useEffect(() => {
    // Read tab from URL on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get("tab");
      if (tabFromUrl) {
        setSelectedSetting(tabFromUrl);
      }
    }
  }, [])

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return;

      try {
        const profileData = await profileService.getUserProfile(user.id);
        setAccountInfo({
          displayName: profileData.user.displayName || "",
          username: profileData.user.username || "",
          email: profileData.user.email || "",
          bio: profileData.user.bio || "",
        });
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadUserProfile();
  }, [user?.id])


  // Show loading if auth or settings are still loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Authenticating...' : 'Loading settings...'}
          </p>
        </div>
      </div>
    );
  }

  // Helper functions
  const maskEmail = (email: string) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    if (!domain) return email;
    const maskedUsername = username.charAt(0) + "*".repeat(Math.max(username.length - 2, 1)) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  // Edit handlers
  const handleStartEdit = (field: string) => {
    setEditMode(field);
    setEditValue(accountInfo[field as keyof typeof accountInfo] || "");
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setEditValue("");
  };

  const handleSaveEdit = async () => {
    if (!editMode || !userId) return;

    try {
      setIsSavingProfile(true);

      const updateData: any = {};
      updateData[editMode] = editValue;

      await profileService.updateProfile(updateData);

      // Refresh user data in AuthContext - this will update all components
      await refreshUser();

      // Update local state
      setAccountInfo(prev => ({
        ...prev,
        [editMode]: editValue,
      }));

      toast({
        title: "Thành công",
        description: "Cập nhật thông tin thành công!",
      });

      setEditMode(null);
      setEditValue("");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password handlers
  const handleOpenChangePassword = () => {
    setShowChangePasswordModal(true);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleCloseChangePassword = () => {
    setShowChangePasswordModal(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const validatePasswordForm = (): boolean => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    let isValid = true;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
      isValid = false;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
      isValid = false;
    } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
      errors.newPassword = "Mật khẩu phải có ít nhất 1 chữ hoa";
      isValid = false;
    } else if (!/[a-z]/.test(passwordForm.newPassword)) {
      errors.newPassword = "Mật khẩu phải có ít nhất 1 chữ thường";
      isValid = false;
    } else if (!/[0-9]/.test(passwordForm.newPassword)) {
      errors.newPassword = "Mật khẩu phải có ít nhất 1 số";
      isValid = false;
    } else if (passwordForm.newPassword === passwordForm.currentPassword) {
      errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setIsChangingPassword(true);
      await profileService.changePassword(passwordForm);

      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công! Mật khẩu mới đã được lưu.",
      });

      handleCloseChangePassword();
    } catch (error: any) {
      console.error("Failed to change password:", error);
      const errorMessage = error.response?.data?.message || "Không thể đổi mật khẩu";

      // Set specific error if it's about current password
      if (errorMessage.includes("Current password")) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: "Mật khẩu hiện tại không đúng",
        }));
      } else {
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNavClick = (item: string) => {
    if (item === "Home") {
      router.push("/")
    } else if (item === "Search") {
      setSidebarCollapsed(true)
      setActivePanel("search")
    } else if (item === "Notifications") {
      setSidebarCollapsed(true)
      setActivePanel("notifications")
    } else if (item === "Create") {
      setShowCreateModal(true
      )} else if (item === "Messages") {
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
              <h3 className="text-base font-semibold mb-1">{t('desktopNotifications')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('desktopNotificationsDesc')}
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
          <h3 className="text-lg font-semibold mb-4">{t('notificationDetails')}</h3>

          {/* New Moments */}
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">{t('newMomentsFromFriends')}</h4>
              <p className="text-sm text-muted-foreground">{t('getNotifiedWhenFriendsShare')}</p>
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
                <h4 className="text-base font-medium mb-1">{t('newChatMessages')}</h4>
                <p className="text-sm text-muted-foreground">{t('receiveNotificationsForDM')}</p>
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
                <span className="text-sm text-muted-foreground">{t('playSound')}</span>
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
                <h4 className="text-base font-medium mb-1">{t('joinInRequests')}</h4>
                <p className="text-sm text-muted-foreground">{t('getNotifiedJoinMoment')}</p>
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
                <span className="text-sm text-muted-foreground">{t('playSound')}</span>
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
              <h4 className="text-base font-medium mb-1">{t('creativeChainRequests')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('receiveInvitationsToJoin')}
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
              <h4 className="text-base font-medium mb-1">{t('creativeChainResults')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('getNotifiedChainComplete')}
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
              <h4 className="text-base font-medium mb-1">{t('friendEndorsementRequests')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('receiveEndorsementRequests')}
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
          <h3 className="text-lg font-semibold mb-4">{t('doNotDisturb')}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t('autoDisableNotifications')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">{t('startTime')}</label>
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
              <label className="text-sm text-muted-foreground mb-2 block">{t('endTime')}</label>
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
    // TODO: Implement blocked users API
    const blockedUsers: any[] = []; // Replace with API call later

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setDetailView(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold">{t('blockedUsers')}</h2>
        </div>

        {/* Blocked Users List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {blockedUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">{t('noBlockedUsers')}</p>
            </div>
          ) : (
            blockedUsers.map((user) => (
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
                  {t('unblock')}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const renderSocialSettings = () => {
    return (
      <div className="space-y-6">
        {/* Friends List */}
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <h3 className="text-lg font-semibold mb-4">{t('friendsList')}</h3>

          <button
            onClick={() => setDetailView("friends-list")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">{t('viewFriendsList')}</h4>
              <p className="text-sm text-muted-foreground">{t('seeAllCurrentFriends')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          </button>

          <button
            onClick={() => setDetailView("friend-requests")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">{t('pendingFriendRequests')}</h4>
              <p className="text-sm text-muted-foreground">{t('viewManageIncomingRequests')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          </button>

          <button
            onClick={() => setDetailView("sent-requests")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">{t('sentFriendRequests')}</h4>
              <p className="text-sm text-muted-foreground">{t('viewManageSentRequests')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          </button>
        </div>

        {/* Privacy */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">{t('privacy')}</h3>
          <div>
            <h4 className="text-base font-medium mb-2">{t('whoCanSeeMyStatus')}</h4>
            <p className="text-sm text-muted-foreground mb-4">{t('controlWhoCanView')}</p>
            <RadioGroup
              value={socialSettings.statusVisibility}
              onValueChange={(value) => setSocialSettings({ ...socialSettings, statusVisibility: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value="all-friends" id="all-friends" />
                <Label htmlFor="all-friends" className="flex-1 cursor-pointer">
                  <div className="font-medium">{t('allFriends')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('allFriendsDesc')}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value="custom-list" id="custom-list" />
                <Label htmlFor="custom-list" className="flex-1 cursor-pointer">
                  <div className="font-medium">{t('customListOnly')}</div>
                  <div className="text-sm text-muted-foreground">{t('customListDesc')}</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <RadioGroupItem value="no-one" id="no-one" />
                <Label htmlFor="no-one" className="flex-1 cursor-pointer">
                  <div className="font-medium">{t('noOne')}</div>
                  <div className="text-sm text-muted-foreground">{t('noOneDesc')}</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Blocked Users */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">{t('blockedUsers')}</h3>
          <button
            onClick={() => setDetailView("blocked-users")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">{t('manageBlockedUsers')}</h4>
              <p className="text-sm text-muted-foreground">{t('viewManageBlockedUsers')}</p>
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
          <h3 className="text-lg font-semibold mb-4">{t('personalInfo')}</h3>

          {/* Display Name */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">{t('displayName')}</h4>
              {editMode === "displayName" ? (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={t('enterDisplayName')}
                    className="max-w-xs"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSavingProfile || !editValue.trim()}
                    className="bg-[#0095f6] hover:bg-[#0095f6]/90"
                  >
                    {isSavingProfile ? t('saving') : t('save')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSavingProfile}
                  >
                    {t('cancel')}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{accountInfo.displayName || t('notSet')}</p>
              )}
            </div>
            {editMode !== "displayName" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#0095f6] hover:text-[#0095f6]/90 hover:bg-transparent"
                onClick={() => handleStartEdit("displayName")}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
            )}
          </div>

          {/* Username */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">{t('username')}</h4>
              {editMode === "username" ? (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={t('enterUsername')}
                    className="max-w-xs"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSavingProfile || !editValue.trim()}
                    className="bg-[#0095f6] hover:bg-[#0095f6]/90"
                  >
                    {isSavingProfile ? t('saving') : t('save')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSavingProfile}
                  >
                    {t('cancel')}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{accountInfo.username || t('notSet')}</p>
              )}
            </div>
            {editMode !== "username" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#0095f6] hover:text-[#0095f6]/90 hover:bg-transparent"
                onClick={() => handleStartEdit("username")}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">{t('email')}</h4>
              {editMode === "email" ? (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="email"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={t('enterEmail')}
                    className="max-w-xs"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSavingProfile || !editValue.trim()}
                    className="bg-[#0095f6] hover:bg-[#0095f6]/90"
                  >
                    {isSavingProfile ? t('saving') : t('save')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSavingProfile}
                  >
                    {t('cancel')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    {emailRevealed ? accountInfo.email : maskEmail(accountInfo.email)}
                  </p>
                  {accountInfo.email && (
                    <button
                      onClick={() => setEmailRevealed(!emailRevealed)}
                      className="text-sm text-[#0095f6] hover:underline"
                    >
                      {emailRevealed ? t('hide') : t('reveal')}
                    </button>
                  )}
                </div>
              )}
            </div>
            {editMode !== "email" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#0095f6] hover:text-[#0095f6]/90 hover:bg-transparent"
                onClick={() => handleStartEdit("email")}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
            )}
          </div>

          {/* Bio */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-base font-medium mb-1">{t('bio')}</h4>
              {editMode === "bio" ? (
                <div className="flex flex-col gap-2 mt-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={t('enterBio')}
                    className="w-full max-w-lg p-2 border border-border rounded-md resize-none bg-background text-foreground"
                    rows={3}
                    maxLength={500}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSavingProfile}
                      className="bg-[#0095f6] hover:bg-[#0095f6]/90"
                    >
                      {isSavingProfile ? t('saving') : t('save')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSavingProfile}
                    >
                      {t('cancel')}
                    </Button>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {editValue.length}/500
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {accountInfo.bio || t('tellUsAboutYourself')}
                </p>
              )}
            </div>
            {editMode !== "bio" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#0095f6] hover:text-[#0095f6]/90 hover:bg-transparent"
                onClick={() => handleStartEdit("bio")}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
            )}
          </div>
        </div>

        {/* Password & Authentication */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">{t('passwordAuthentication')}</h3>
          <Button
            className="bg-[#0095f6] hover:bg-[#0095f6]/90"
            onClick={handleOpenChangePassword}
          >
            <Key className="w-4 h-4 mr-2" />
            {t('changePassword')}
          </Button>
        </div>

        {/* Device Management */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">{t('deviceManagement')}</h3>
          <button
            onClick={() => setDetailView("device-management")}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <div className="flex-1 text-left">
              <h4 className="text-base font-medium mb-1">{t('manageDevices')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('viewLoggedInDevices')}
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
              <h3 className="text-lg font-semibold text-red-500 mb-2">{t('deleteAccount')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('permanentlyDeleteAccount')}
              </p>
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('deleteAccount')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDeviceManagementDetail = () => {
    // TODO: Implement device management API
    const devices: any[] = []; // Replace with API call later

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setDetailView(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold">{t('deviceManagement')}</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {t('manageDevicesDesc')}
        </p>

        {/* Devices List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {devices.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">{t('noDevicesFound')}</p>
            </div>
          ) : (
            devices.map((device) => (
              <div key={device.id} className="p-4 border border-border rounded-xl bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {device.name}
                        {device.current && (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">{t('current')}</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{device.location}</div>
                      <div className="text-xs text-muted-foreground mt-1">{device.lastActive}</div>
                    </div>
                  </div>
                  {!device.current && (
                    <Button variant="outline" size="sm" className="border-border hover:bg-muted bg-transparent">
                      {t('logOut')}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const renderAppearanceSettings = () => {
    const handleThemeToggle = async (checked: boolean) => {
      const newTheme = checked ? "dark" : "light";
      console.log('[Theme Toggle] Changing theme to:', newTheme);

      if (!userId) {
        toast({
          title: "Error",
          description: "User not authenticated. Please login again.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Update theme using next-themes
        setTheme(newTheme);

        // Save to database immediately
        await settingsService.updateTheme(userId, newTheme.toUpperCase());

        toast({
          title: "Success",
          description: `Theme changed to ${newTheme} mode`,
        });
      } catch (error) {
        console.error('Failed to update theme:', error);
        toast({
          title: "Error",
          description: "Failed to update theme. Please try again.",
          variant: "destructive",
        });
        // Revert theme on error
        setTheme(newTheme === "dark" ? "light" : "dark");
      }
    };

    const handleLanguageChange = async (newLanguage: 'vi' | 'en') => {
      if (!userId) {
        toast({
          title: "Error",
          description: "User not authenticated. Please login again.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Update language in context
        setLanguage(newLanguage);

        // Save to database immediately
        const backendLang = newLanguage === 'vi' ? 'VI' : 'EN';
        await settingsService.updateLanguage(userId, backendLang);

        toast({
          title: "Success",
          description: `Language changed to ${newLanguage === 'vi' ? 'Tiếng Việt' : 'English'}`,
        });
      } catch (error) {
        console.error('Failed to update language:', error);
        toast({
          title: "Error",
          description: "Failed to update language. Please try again.",
          variant: "destructive",
        });
        // Revert language on error
        setLanguage(newLanguage === 'vi' ? 'en' : 'vi');
      }
    };

    return (
      <div className="space-y-6">
        {/* Theme Toggle */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">{t('theme')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('chooseThemeDesc')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-muted-foreground" />
              <Switch
                checked={nextTheme === "dark"}
                onCheckedChange={handleThemeToggle}
              />
              <Moon className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-start gap-4">
            <Globe className="w-5 h-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">{t('language')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('languageDescription')}</p>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full max-w-xs bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('english')}</SelectItem>
                  <SelectItem value="vi">{t('vietnamese')}</SelectItem>
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
              <h3 className="text-base font-semibold mb-1">{t('screenshotHotkey')}</h3>
              <p className="text-sm text-muted-foreground">{t('customizeKeyboardShortcut')}</p>
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
            <p className="text-xs text-muted-foreground mt-2">{t('pressKeysToRecord')}</p>
          </div>
        </div>

        {/* Save Local Copy */}
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">{t('saveLocalCopy')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('autoSaveCapturedImages')}
              </p>
            </div>
            <Switch
              checked={momentsSettings.saveLocalCopy}
              onCheckedChange={(checked) => setMomentsSettings({ ...momentsSettings, saveLocalCopy: checked })}
            />
          </div>

          {momentsSettings.saveLocalCopy && (
            <div className="pt-4 border-t border-border">
              <label className="text-sm text-muted-foreground mb-2 block">{t('saveLocation')}</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={momentsSettings.localCopyFolder}
                  onChange={(e) => setMomentsSettings({ ...momentsSettings, localCopyFolder: e.target.value })}
                  className="bg-secondary border-border flex-1"
                  placeholder={t('selectFolderPath')}
                />
                <Button variant="outline" className="border-border hover:bg-muted bg-transparent">
                  {t('browse')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t('capturedImagesSaved')}
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
              <h3 className="text-base font-semibold mb-1">{t('enableContextRecognition')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('disableContextDetection')}
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
            <h3 className="text-lg font-semibold mb-4">{t('appManagement')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('similarToDiscord')}
            </p>

            {/* Built-in Apps */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">{t('builtInApps')}</h4>

              {/* Spotify */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium">{t('spotify')}</div>
                    <div className="text-xs text-muted-foreground">{t('musicStreamingService')}</div>
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
                    <div className="font-medium">{t('leagueOfLegends')}</div>
                    <div className="text-xs text-muted-foreground">{t('multiplayerOnlineGame')}</div>
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
                    <div className="font-medium">{t('steam')}</div>
                    <div className="text-xs text-muted-foreground">{t('gamingPlatform')}</div>
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
                <h4 className="text-sm font-medium text-muted-foreground">{t('customApps')}</h4>
                <Button size="sm" variant="outline" className="border-border hover:bg-muted bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addApp')}
                </Button>
              </div>

              {smartContextSettings.customApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border"
                >
                  <div className="flex-1">
                    <div className="font-medium">{app.name}</div>
                    <div className="text-xs text-muted-foreground">{t('customApplication')}</div>
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
          <h3 className="text-lg font-semibold mb-4">{t('stickerLibrary')}</h3>
          <p className="text-sm text-muted-foreground">{t('uploadStickerPacks')}</p>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <Sticker className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium mb-1">{t('dragAndDropStickers')}</p>
                <p className="text-sm text-muted-foreground">{t('orClickToBrowse')}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t('supportedFormats')}</p>
            </div>
            <input type="file" multiple accept=".zip,.png,.jpg,.jpeg" className="hidden" />
          </div>

          {/* Installed Sticker Packs */}
          {interactionToolsSettings.stickerPacks.length > 0 && (
            <div className="pt-6 border-t border-border space-y-3">
              <h4 className="text-sm font-medium">{t('installedPacks')}</h4>
              {interactionToolsSettings.stickerPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Sticker className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{pack.name}</div>
                      <div className="text-xs text-muted-foreground">{t('installed')}</div>
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
              <h3 className="text-base font-semibold mb-1">{t('launchWithOS')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('autoStartApp')}
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
              <h3 className="text-base font-semibold mb-1">{t('runInBackground')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('keepAppRunning')}
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
          <h3 className="text-lg font-semibold mb-4">{t('appVersion')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-sm text-muted-foreground">{t('version')}</span>
              <span className="font-medium">{aboutSettings.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('buildDate')}</span>
              <span className="font-medium">{aboutSettings.buildDate}</span>
            </div>
          </div>
        </div>

        {/* Licenses */}
        <div className="border border-border rounded-xl p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">{t('licenses')}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t('openSourceLibraries')}
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
          <h3 className="text-lg font-semibold mb-4">{t('supportContact')}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t('needHelp')}
          </p>
          <div className="space-y-3">
            <a
              href={`mailto:${aboutSettings.supportEmail}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border"
            >
              <div>
                <div className="font-medium">{t('emailSupport')}</div>
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
                <div className="font-medium">{t('supportPortal')}</div>
                <div className="text-sm text-[#0095f6]">{t('visitSupportWebsite')}</div>
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


  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onNavClick={handleNavClick} />

        {activePanel === "search" && <SearchPanel onClose={handleClosePanel} />}
        {activePanel === "notifications" && <NotificationsPanel onClose={handleClosePanel} />}

        {/* No overlay in settings page - search panel should be fully usable */}

        <main className={`flex-1 ${sidebarCollapsed ? "ml-[73px]" : "ml-[245px]"} transition-all duration-300`}>
          <div className="flex h-screen">
            {/* Left sidebar - Settings categories */}
            <div className="w-[400px] border-r border-border overflow-y-auto bg-background">
              <div className="p-8">
                <h1 className="text-2xl font-semibold mb-8">{t('settingsTitle')}</h1>

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
        />
      )}

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {t('changePassword')}
            </DialogTitle>
            <DialogDescription>
              {t('enterYourCurrentPassword')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">{t('currentPassword')}</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                  setPasswordErrors({ ...passwordErrors, currentPassword: "" });
                }}
                placeholder={t('enterCurrentPassword')}
                className={passwordErrors.currentPassword ? "border-red-500" : ""}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('newPassword')}</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                  setPasswordErrors({ ...passwordErrors, newPassword: "" });
                }}
                placeholder={t('minPasswordRequirements')}
                className={passwordErrors.newPassword ? "border-red-500" : ""}
              />
              {passwordErrors.newPassword ? (
                <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t('passwordMustContain')}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('confirmNewPassword')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                  setPasswordErrors({ ...passwordErrors, confirmPassword: "" });
                }}
                placeholder={t('enterConfirmPassword')}
                className={passwordErrors.confirmPassword ? "border-red-500" : ""}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseChangePassword}
              disabled={isChangingPassword}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-[#0095f6] hover:bg-[#0095f6]/90"
            >
              {isChangingPassword ? t('changing') : t('changePassword')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
