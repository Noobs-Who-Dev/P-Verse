"use client"

import { MessageCircle, X, Maximize2, Smile, ImageIcon, Mic, ArrowLeft, Edit, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, useRef } from "react"
import { friendService, type UserSearchDto } from "@/lib/services/friendService"
import { API_BASE_URL } from "@/lib/api/axios"
import { websocketService, type MessageData } from "@/lib/services/websocketService"
import { messageService, type MessageDTO } from "@/lib/services/messageService"

interface MessengerPopupProps {
  isOpen: boolean
  onToggle: () => void
  onOpenFullMessenger: (username?: string) => void
}

export function MessengerPopup({ isOpen, onToggle, onOpenFullMessenger }: MessengerPopupProps) {
  const [recentChats, setRecentChats] = useState<UserSearchDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChat, setSelectedChat] = useState<UserSearchDto | null>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadFriends()
      initializeWebSocket()
    }
  }, [isOpen])

  useEffect(() => {
    if (conversationId) {
      console.log('📥 Loading messages for conversation:', conversationId);
      loadMessages()
    } else {
      console.log('⚠️ No conversationId yet, skipping message load');
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Subscribe to incoming messages
    console.log('🎧 Setting up message listener...');
    console.log('   Selected chat:', selectedChat?.id, selectedChat?.username);
    console.log('   Conversation ID:', conversationId);

    const unsubscribe = websocketService.onMessage((messageData: MessageData) => {
      console.log('💬 ===== MESSAGE RECEIVED IN POPUP =====');
      console.log('   Message:', messageData);
      console.log('   Sender ID:', messageData.senderId);
      console.log('   Receiver ID:', messageData.receiverId);
      console.log('   Current selected chat ID:', selectedChat?.id);
      console.log('   Current conversation ID:', conversationId);

      // Only add message if it's for the current conversation
      if (selectedChat &&
          (messageData.senderId === selectedChat.id || messageData.receiverId === selectedChat.id)) {
        console.log('✅ Message matches current chat - checking for duplicates');

        setMessages(prev => {
          // Check if message already exists (by ID)
          if (messageData.id && prev.some(m => m.id === messageData.id)) {
            console.log('⚠️ Message already exists, skipping duplicate');
            return prev;
          }

          console.log('   Previous messages count:', prev.length);
          const newMessages = [...prev, messageData as MessageDTO];
          console.log('   New messages count:', newMessages.length);
          return newMessages;
        });

        // Update conversationId if we don't have it yet
        if (!conversationId && messageData.conversationId) {
          console.log('   Setting conversation ID:', messageData.conversationId);
          setConversationId(messageData.conversationId);
        }
      } else {
        console.log('⚠️ Message does not match current chat - ignoring');
        console.log('   Reason: selectedChat =', selectedChat?.id, ', sender =', messageData.senderId, ', receiver =', messageData.receiverId);
      }
      console.log('=======================================');
    });

    return () => {
      console.log('🎧 Unsubscribing from message listener');
      unsubscribe();
    }
  }, [selectedChat, conversationId])

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

  const loadMessages = async () => {
    if (!conversationId) {
      console.log('⚠️ loadMessages called but conversationId is null');
      return;
    }

    console.log('📥 Loading messages from database...');
    console.log('   Conversation ID:', conversationId);

    try {
      const response = await messageService.getMessages(conversationId, 0, 50)
      console.log('✅ Messages loaded:', response.content.length, 'messages');
      console.log('   Messages:', response.content);
      setMessages(response.content)
    } catch (error) {
      console.error('❌ Failed to load messages:', error)
    }
  }

  const loadFriends = async () => {
    setIsLoading(true)
    try {
      const data = await friendService.getFriends()
      setRecentChats(data.slice(0, 6)) // Show only first 6 friends
    } catch (error) {
      console.error('Failed to load friends:', error)
      setRecentChats([])
    } finally {
      setIsLoading(false)
    }
  }

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return "/placeholder-user.jpg"
    if (avatarUrl.startsWith('http')) return avatarUrl
    return `${API_BASE_URL}/${avatarUrl}`
  }

  const handleChatClick = async (friend: UserSearchDto) => {
    console.log('💬 Chat clicked:', friend.username);
    setSelectedChat(friend)
    setMessages([])

    if (!currentUserId) {
      console.log('❌ No currentUserId');
      return;
    }

    console.log('🔍 Finding conversation between user', currentUserId, 'and', friend.id);
    try {
      // Get conversations to find the conversation ID
      const conversations = await messageService.getUserConversations(currentUserId)
      console.log('📋 User has', conversations.length, 'conversations');

      const conversation = conversations.find(c =>
        c.user1.id === friend.id || c.user2.id === friend.id
      )

      if (conversation) {
        console.log('✅ Found existing conversation:', conversation.id);
        setConversationId(conversation.id)
        // Load messages will be called by useEffect when conversationId changes
      } else {
        console.log('⚠️ No conversation found - will be created on first message');
        // No conversation yet
        setConversationId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('❌ Failed to load conversation:', error)
    }
  }

  const handleBackToList = () => {
    setSelectedChat(null)
    setMessages([])
    setConversationId(null)
  }

  const handleExpand = () => {
    onOpenFullMessenger(selectedChat?.username)
  }

  const handleSendMessage = () => {
    console.log('=== handleSendMessage called ===');
    console.log('Message content:', message);
    console.log('Selected chat:', selectedChat);
    console.log('Current user ID:', currentUserId);
    console.log('WebSocket connected:', websocketService.isConnected());

    if (!message.trim()) {
      console.log('❌ Message is empty');
      return;
    }

    if (!selectedChat) {
      console.log('❌ No chat selected');
      return;
    }

    if (!currentUserId) {
      console.log('❌ No current user ID');
      return;
    }

    const messageData: MessageData = {
      senderId: currentUserId,
      receiverId: selectedChat.id,
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

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-card border border-border rounded-full px-4 py-3 flex items-center gap-3 shadow-lg hover:bg-muted transition-colors z-50"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold">Messages</span>
        <div className="flex -space-x-2">
          {recentChats.slice(0, 3).map((chat) => (
            <Avatar key={chat.id} className="w-6 h-6 border-2 border-card">
              <AvatarImage src={getAvatarUrl(chat.avatarUrl)} />
              <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </button>
    )
  }

  if (selectedChat) {
    return (
      <div className="fixed bottom-0 right-6 w-[350px] h-[500px] bg-card border border-border rounded-t-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToList} className="hover:opacity-70">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={getAvatarUrl(selectedChat.avatarUrl)} />
              <AvatarFallback>{selectedChat.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold">{selectedChat.displayName || selectedChat.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExpand} className="text-muted-foreground hover:text-foreground">
              <Maximize2 className="w-5 h-5" />
            </button>
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No messages yet. Say hi! 👋</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, index) => {
                const isOwnMessage = msg.senderId === currentUserId
                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-[#0095f6] text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      {msg.createdAt && (
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
            <button className="text-muted-foreground hover:text-foreground">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="text-muted-foreground hover:text-foreground">
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 right-6 w-[350px] h-[500px] bg-card border border-border rounded-t-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-base font-semibold">Messages</h3>
        <div className="flex items-center gap-2">
          <button onClick={handleExpand} className="text-muted-foreground hover:text-foreground">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : recentChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start chatting with your friends</p>
          </div>
        ) : (
          recentChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="w-14 h-14">
                <AvatarImage src={getAvatarUrl(chat.avatarUrl)} />
                <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{chat.displayName || chat.username}</p>
                </div>
                <p className="text-xs text-muted-foreground truncate">@{chat.username}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Compose button */}
      <button className="absolute bottom-6 right-6 w-12 h-12 bg-[#0095f6] rounded-full flex items-center justify-center hover:bg-[#0084d9] transition-colors shadow-lg">
        <Edit className="w-5 h-5 text-white" />
      </button>
    </div>
  )
}
