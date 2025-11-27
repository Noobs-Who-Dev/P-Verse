import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '@/lib/api/axios';

export interface MessageData {
  id?: number;
  conversationId?: number;
  senderId: number;
  receiverId: number;
  content: string;
  messageType: string;
  isRead?: boolean;
  createdAt?: string;
  // IMAGE fields
  imagePath?: string;
  // MOMENT_REPLY fields
  repliedMomentId?: number;
  repliedMomentImagePath?: string;
  repliedMomentCaption?: string;
  repliedMomentOwnerId?: number;
}

type MessageCallback = (message: MessageData) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private messageCallbacks: MessageCallback[] = [];
  private currentUserId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  connect(userId: number) {
    if (this.connected && this.currentUserId === userId) {
      console.log('✅ WebSocket already connected for user:', userId);
      return;
    }

    console.log('🔌 Connecting WebSocket for user:', userId);
    this.currentUserId = userId;

    const token = localStorage.getItem('token');
    console.log('🔑 Token exists:', !!token);

    this.client = new Client({
      webSocketFactory: () => {
        console.log('🏭 Creating WebSocket connection to:', `${API_BASE_URL}/ws`);
        return new SockJS(`${API_BASE_URL}/ws`);
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('🔍 STOMP Debug:', str);
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket Connected!');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.subscribeToMessages();
      },
      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame);
        this.connected = false;
      },
      onWebSocketClose: () => {
        console.log('🔌 WebSocket Closed');
        this.connected = false;
        this.handleReconnect();
      },
      onWebSocketError: (error) => {
        console.error('❌ WebSocket Error:', error);
        this.connected = false;
      },
    });

    this.client.activate();
    console.log('⏳ WebSocket activation initiated...');
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        if (this.currentUserId && !this.connected) {
          this.connect(this.currentUserId);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  private subscribeToMessages() {
    if (!this.client || !this.currentUserId) {
      console.error('❌ Cannot subscribe: client or userId missing');
      return;
    }

    const topic = `/topic/chat/${this.currentUserId}`;
    console.log('📡 Subscribing to:', topic);

    // Subscribe to receive messages for this user
    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        console.log('📨 ============ MESSAGE RECEIVED ============');
        console.log('📨 Raw message body:', message.body);
        console.log('📨 Message headers:', message.headers);

        const messageData: MessageData = JSON.parse(message.body);
        console.log('✅ Parsed message data:', messageData);
        console.log('   - ID:', messageData.id);
        console.log('   - Sender ID:', messageData.senderId);
        console.log('   - Receiver ID:', messageData.receiverId);
        console.log('   - Content:', messageData.content);
        console.log('   - Conversation ID:', messageData.conversationId);

        console.log('🔔 Notifying', this.messageCallbacks.length, 'callback(s)');
        this.notifyCallbacks(messageData);
        console.log('✅ ========================================');
      } catch (error) {
        console.error('❌ Error parsing message:', error);
        console.error('Raw message was:', message.body);
      }
    });

    console.log('✅ Subscribed to', topic);
    console.log('   Subscription ID:', subscription.id);
  }

  sendMessage(message: MessageData) {
    if (!this.client || !this.connected) {
      console.error('❌ WebSocket not connected. Connection status:', this.connected);
      console.error('Client exists:', !!this.client);
      return;
    }

    try {
      console.log('📤 Sending message via WebSocket:', message);
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message),
      });
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  onMessage(callback: MessageCallback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyCallbacks(message: MessageData) {
    console.log('🔔 notifyCallbacks called with message:', message);
    console.log('   Number of callbacks:', this.messageCallbacks.length);

    this.messageCallbacks.forEach((callback, index) => {
      try {
        console.log(`   Calling callback #${index + 1}...`);
        callback(message);
        console.log(`   ✅ Callback #${index + 1} executed successfully`);
      } catch (error) {
        console.error(`   ❌ Error in callback #${index + 1}:`, error);
      }
    });

    console.log('🔔 All callbacks notified');
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.currentUserId = null;
      this.messageCallbacks = [];
      console.log('WebSocket disconnected');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const websocketService = new WebSocketService();

