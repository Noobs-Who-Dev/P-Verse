"use client"

import { ArrowLeft, Phone, Video, Info, Search, Smile, ImageIcon, Mic, Heart, Send, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { SearchPanel } from "@/components/search-panel"
import { NotificationsPanel } from "@/components/notifications-panel"
import { CreatePostModal } from "@/components/create-post-modal"
import { friendService, type UserSearchDto } from "@/lib/services/friendService"
import { websocketService, type MessageData } from "@/lib/services/websocketService"
import { messageService, type MessageDTO, type ConversationDTO } from "@/lib/services/messageService"
import { API_BASE_URL } from "@/lib/api/axios"
import { useUserStatus } from "@/lib/contexts/UserStatusContext"
import { useI18n } from "@/lib/i18n/I18nContext"
import { getStatusIndicator, isUserOnline, getShortLastSeenText } from "@/lib/utils/userStatusUtils"

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const { getUserStatus } = useUserStatus()
  const [selectedUser, setSelectedUser] = useState<UserSearchDto | null>(null)
  const [message, setMessage] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [activePanel, setActivePanel] = useState<"search" | "notifications" | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [conversations, setConversations] = useState<ConversationDTO[]>([])
  const [friends, setFriends] = useState<UserSearchDto[]>([])
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initializeWebSocket()
    loadFriendsAndConversations()
  }, [])

  useEffect(() => {
    const username = searchParams.get("user")
    if (username && friends.length > 0) {
      const friend = friends.find((f) => f.username === username)
      if (friend) {
        handleSelectUser(friend)
      }
    }
  }, [searchParams, friends])

  useEffect(() => {
    if (selectedUser && conversationId) {
      loadMessages()
    }
  }, [selectedUser, conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Subscribe to incoming messages (only once on mount)
    console.log('🎣 Setting up message listener');
    const unsubscribe = websocketService.onMessage((messageData: MessageData) => {
      console.log('📨 Received message from WebSocket:', messageData)
      console.log('   Message ID:', messageData.id)
      console.log('   Sender ID:', messageData.senderId)
      console.log('   Receiver ID:', messageData.receiverId)
      console.log('   Conversation ID:', messageData.conversationId)
      console.log('   Content:', messageData.content)

      // Add message to state if it's relevant to current user
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        if (messageData.id && prev.some(m => m.id === messageData.id)) {
          console.log('⚠️ Message already exists, skipping');
          return prev;
        }

        // Add the message
        console.log('✅ Adding message to state');
        return [...prev, messageData as MessageDTO];
      })

      // Update conversationId if we don't have it yet
      setConversationId(prevId => {
        if (!prevId && messageData.conversationId) {
          console.log('📝 Setting conversation ID:', messageData.conversationId);
          return messageData.conversationId;
        }
        return prevId;
      });

      // Reload conversations to update last message
      loadConversations();
    })

    console.log('✅ Message listener set up');
    return () => {
      console.log('🧹 Cleaning up message listener');
      unsubscribe()
    }
  }, []) // Empty deps - only run once on mount

  const initializeWebSocket = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUserId(user.id)

      if (!websocketService.isConnected()) {
        websocketService.connect(user.id)
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadFriendsAndConversations = async () => {
    try {
      const friendsData = await friendService.getFriends()
      setFriends(friendsData)

      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        await loadConversations()
      }
    } catch (error) {
      console.error('Failed to load friends:', error)
    }
  }

  const loadConversations = async () => {
    const userStr = localStorage.getItem('user')
    if (!userStr) return

    try {
      const user = JSON.parse(userStr)
      const conversationsData = await messageService.getUserConversations(user.id)
      setConversations(conversationsData)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadMessages = async () => {
    if (!conversationId) return

    try {
      const response = await messageService.getMessages(conversationId, 0, 50)
      setMessages(response.content)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSelectUser = async (friend: UserSearchDto) => {
    // Prevent clicking on the same user that is already selected
    if (selectedUser && selectedUser.id === friend.id) {
      console.log('⚠️ Already chatting with', friend.username);
      return;
    }

    setSelectedUser(friend)
    setMessages([])

    if (!currentUserId) return

    try {
      // Find conversation
      const conversation = conversations.find(c =>
        c.user1.id === friend.id || c.user2.id === friend.id
      )

      if (conversation) {
        setConversationId(conversation.id)

        // Load messages immediately here
        console.log('📥 Loading messages for conversation:', conversation.id);
        try {
          const response = await messageService.getMessages(conversation.id, 0, 50)
          console.log('✅ Messages loaded:', response.content.length, 'messages');
          setMessages(response.content)
        } catch (error) {
          console.error('❌ Failed to load messages:', error)
        }
      } else {
        // No conversation yet
        setConversationId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const handleSendMessage = () => {
    console.log('=== handleSendMessage called (Messages Page) ===');
    console.log('Message content:', message);
    console.log('Selected user:', selectedUser);
    console.log('Current user ID:', currentUserId);
    console.log('WebSocket connected:', websocketService.isConnected());

    if (!message.trim()) {
      console.log('❌ Message is empty');
      return;
    }

    if (!selectedUser) {
      console.log('❌ No user selected');
      return;
    }

    if (!currentUserId) {
      console.log('❌ No current user ID');
      return;
    }

    const messageData: MessageData = {
      senderId: currentUserId,
      receiverId: selectedUser.id,
      content: message.trim(),
      messageType: 'TEXT'
    }

    console.log('📤 Preparing to send message:', messageData);
    websocketService.sendMessage(messageData)
    console.log('✅ Message sent to WebSocket service');
    setMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!selectedUser || !currentUserId) {
      console.log('❌ No user selected or no current user')
      return
    }

    console.log('📸 Image selected:', file.name, file.size, 'bytes')

    try {
      console.log('📤 Uploading image...')
      const response = await messageService.sendImageMessage(
        currentUserId,
        selectedUser.id,
        file
      )
      console.log('✅ Image message sent:', response)

      // Image will be added via WebSocket
    } catch (error) {
      console.error('❌ Failed to send image:', error)
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Get sorted chat list - conversations with messages first (sorted by last message), then friends without conversations
  const getSortedChatList = () => {
    if (!currentUserId) return []

    // Get friends with conversations
    const friendsWithConversations = conversations
      .map(conversation => {
        // Find the OTHER user in this conversation (not current user)
        const otherUserId = conversation.user1.id === currentUserId ? conversation.user2.id : conversation.user1.id
        const friend = friends.find(f => f.id === otherUserId)
        if (!friend) return null

        return {
          friend,
          conversation,
          lastMessageAt: conversation.lastMessageAt
        }
      })
      .filter(item => item !== null)
      .sort((a, b) => {
        // Sort by last message time (newest first)
        if (!a!.lastMessageAt) return 1
        if (!b!.lastMessageAt) return -1
        return new Date(b!.lastMessageAt).getTime() - new Date(a!.lastMessageAt).getTime()
      })

    // Get friends without conversations
    const friendsWithoutConversations = friends
      .filter(friend => !conversations.some(c =>
        (c.user1.id === currentUserId && c.user2.id === friend.id) ||
        (c.user2.id === currentUserId && c.user1.id === friend.id)
      ))
      .map(friend => ({
        friend,
        conversation: null,
        lastMessageAt: null
      }))

    // Combine: friends with messages first, then friends without messages
    return [...friendsWithConversations, ...friendsWithoutConversations]
  }

  const handleNavClick = (item: string) => {
    if (item === "Home") {
      router.push("/")
    } else if (item === "Profile") {
      router.push("/profile")
    } else if (item === "Search") {
      // Toggle: if already open, close it; if closed, open it
      if (activePanel === "search") {
        setSidebarCollapsed(true)
        setActivePanel(null)
      } else {
        setSidebarCollapsed(true)
        setActivePanel("search")
      }
    } else if (item === "Notifications") {
      // Toggle: if already open, close it; if closed, open it
      if (activePanel === "notifications") {
        setSidebarCollapsed(true)
        setActivePanel(null)
      } else {
        setSidebarCollapsed(true)
        setActivePanel("notifications")
      }
    } else if (item === "Create") {
      setShowCreateModal(true)
    } else if (item === "Messages") {
      setSidebarCollapsed(true)
      setActivePanel(null)
    } else {
      setSidebarCollapsed(true)
      setActivePanel(null)
    }
  }

  const handleClosePanel = () => {
    setSidebarCollapsed(true)
    setActivePanel(null)
  }

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onNavClick={handleNavClick} />

      {activePanel === "search" && <SearchPanel onClose={handleClosePanel} />}
      {activePanel === "notifications" && <NotificationsPanel onClose={handleClosePanel} />}


      <div className="w-[400px] border-r border-border flex flex-col ml-[73px] h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <button onClick={() => router.push("/")} className="hover:opacity-70">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold">Messages</h2>
          <div className="w-6" />
        </div>

        <div className="p-4">
          <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {getSortedChatList()
            .filter(item =>
              item.friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => {
              const { friend, conversation } = item

              // Get user status
              const friendStatus = getUserStatus(friend.id)
              const statusIndicator = getStatusIndicator(friendStatus?.status)
              const friendOnline = isUserOnline(friendStatus?.status)
              const shortLastSeen = !friendOnline ? getShortLastSeenText(friendStatus?.lastSeenAt, t) : null

              return (
                <button
                  key={friend.id}
                  onClick={() => handleSelectUser(friend)}
                  disabled={selectedUser?.id === friend.id}
                  className={`w-full flex items-center gap-3 p-4 transition-colors ${
                    selectedUser?.id === friend.id
                      ? "bg-muted cursor-not-allowed"
                      : "hover:bg-muted/50 cursor-pointer"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={friend.avatarUrl ? `${API_BASE_URL}${friend.avatarUrl}` : "/placeholder.svg"} />
                      <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {/* Status indicator - green (ONLINE only) */}
                    {statusIndicator.show && (
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${statusIndicator.className} border-2 border-background rounded-full z-10`}></span>
                    )}
                    {/* Short last seen text at bottom-right corner (compact) */}
                    {!friendOnline && shortLastSeen && (
                      <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-md rounded-tr-lg">
                        {shortLastSeen}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">{friend.displayName || friend.username}</p>
                      {conversation?.lastMessageAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                        {conversation?.lastMessage ? (() => {
                          // Check if current user sent the last message
                          const isOwnMessage = conversation.lastMessageSenderId === currentUserId
                          const prefix = isOwnMessage ? "You: " : ""
                          const message = conversation.lastMessage
                          const fullText = prefix + message

                          // Truncate if too long
                          return fullText.length > 30
                            ? fullText.substring(0, 30) + '...'
                            : fullText
                        })() : "Start a conversation"}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedUser.avatarUrl ? `${API_BASE_URL}${selectedUser.avatarUrl}` : "/placeholder.svg"} />
                    <AvatarFallback>{selectedUser.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {/* Status indicator for selected user */}
                  {(() => {
                    const selectedStatus = getUserStatus(selectedUser.id)
                    const selectedIndicator = getStatusIndicator(selectedStatus?.status)
                    const selectedOnline = isUserOnline(selectedStatus?.status)
                    const selectedShortLastSeen = !selectedOnline ? getShortLastSeenText(selectedStatus?.lastSeenAt, t) : null

                    return (
                      <>
                        {selectedIndicator.show && (
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${selectedIndicator.className} border-2 border-background rounded-full z-10`}></span>
                        )}
                        {!selectedOnline && selectedShortLastSeen && (
                          <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-md rounded-tr-lg">
                            {selectedShortLastSeen}
                          </span>
                        )}
                      </>
                    )
                  })()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedUser.displayName || selectedUser.username}</p>
                  <p className="text-xs text-muted-foreground">@{selectedUser.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="hover:opacity-70">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="hover:opacity-70">
                  <Video className="w-5 h-5" />
                </button>
                <button className="hover:opacity-70">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 px-6 py-4">
              {(() => {
                // Filter messages for current conversation
                const conversationMessages = messages.filter(msg => {
                  if (!selectedUser || !currentUserId) return false;

                  // Message is part of this conversation if:
                  // - sender is current user and receiver is selected user, OR
                  // - sender is selected user and receiver is current user
                  return (
                    (msg.senderId === currentUserId && msg.receiverId === selectedUser.id) ||
                    (msg.senderId === selectedUser.id && msg.receiverId === currentUserId)
                  );
                });

                if (conversationMessages.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">No messages yet. Say hi! 👋</p>
                    </div>
                  );
                }

                return (
                  <div className="w-full space-y-4 font-normal">
                    {conversationMessages.map((msg, index) => {
                      const isOwn = msg.senderId === currentUserId
                      const isMomentReply = msg.messageType === 'MOMENT_REPLY'
                      const isImage = msg.messageType === 'IMAGE'

                      return (
                        <div key={msg.id || index} className={`flex gap-2 ${isOwn ? "justify-end" : ""}`}>
                          {!isOwn && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={selectedUser.avatarUrl ? `${API_BASE_URL}${selectedUser.avatarUrl}` : "/placeholder.svg"} />
                              <AvatarFallback>{selectedUser.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`flex flex-col ${isOwn ? "items-end" : ""}`}>
                            <div
                              className={`rounded-2xl overflow-hidden max-w-md ${
                                isOwn ? "bg-[#0095f6] text-white" : "bg-muted text-foreground"
                              }`}
                            >
                              {/* Hiển thị ảnh moment nếu là MOMENT_REPLY */}
                              {isMomentReply && msg.repliedMomentImagePath && (
                                <div className="w-full aspect-square bg-black">
                                  <img
                                    src={`${API_BASE_URL}/${msg.repliedMomentImagePath.startsWith('/') ? msg.repliedMomentImagePath.substring(1) : msg.repliedMomentImagePath}`}
                                    alt="Moment"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.error('❌ Failed to load moment image:', msg.repliedMomentImagePath);
                                      console.error('   Full URL:', `${API_BASE_URL}/${msg.repliedMomentImagePath}`);
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.jpg';
                                    }}
                                  />
                                </div>
                              )}

                              {/* Hiển thị ảnh nếu là IMAGE message */}
                              {isImage && msg.imagePath && (
                                <div className="w-full max-w-[300px]">
                                  <img
                                    src={`${API_BASE_URL}${msg.imagePath.startsWith('/') ? msg.imagePath : '/' + msg.imagePath}`}
                                    alt="Shared image"
                                    className="w-full h-auto object-cover rounded-t-2xl"
                                    onError={(e) => {
                                      console.error('❌ Failed to load image:', msg.imagePath);
                                      console.error('   Full URL:', `${API_BASE_URL}${msg.imagePath}`);
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder.jpg';
                                    }}
                                  />
                                </div>
                              )}

                              {/* Hiển thị text content nếu có */}
                              {(msg.content || isMomentReply) && (
                                <div className="px-4 py-2">
                                  {isMomentReply && (
                                    <p className="text-xs opacity-70 mb-1">
                                      💬 Commented on {isOwn ? 'their' : 'your'} moment
                                    </p>
                                  )}
                                  {msg.content && (
                                    <p className="text-sm break-words">{msg.content}</p>
                                  )}
                                </div>
                              )}

                              {/* Timestamp cho IMAGE messages without caption */}
                              {isImage && !msg.content && msg.createdAt && (
                                <div className="px-4 py-2">
                                  <span className="text-xs opacity-70">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                            {msg.createdAt && (msg.content || isMomentReply) && (
                              <span className="text-xs text-muted-foreground mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-border">
              <div className="w-full flex items-center justify-between gap-3 font-normal">
                <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-3">
                  <button className="text-muted-foreground hover:text-foreground">
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message..."
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleImageButtonClick}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
                {message ? (
                  <button
                    onClick={handleSendMessage}
                    className="text-[#0095f6] hover:opacity-70 font-semibold text-sm"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button className="text-muted-foreground hover:text-foreground">
                    <Heart className="w-6 h-6" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
              <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
