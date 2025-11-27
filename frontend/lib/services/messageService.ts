import axiosInstance from '@/lib/api/axios';

export interface MessageDTO {
  id?: number;
  conversationId?: number;
  senderId: number;
  receiverId?: number;
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

export interface ConversationDTO {
  id: number;
  user1: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  user2: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  lastMessageAt?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

class MessageService {
  async getMessages(conversationId: number, page = 0, size = 20): Promise<PageResponse<MessageDTO>> {
    const response = await axiosInstance.get(`/chat/${conversationId}/messages`, {
      params: { page, size }
    });
    return response.data;
  }

  async markAsRead(conversationId: number, userId: number): Promise<void> {
    await axiosInstance.post(`/chat/read/${conversationId}/${userId}`);
  }

  async getUserConversations(userId: number): Promise<ConversationDTO[]> {
    const response = await axiosInstance.get(`/chat/conversations/${userId}`);
    return response.data;
  }

  async sendImageMessage(
    senderId: number,
    receiverId: number,
    image: File,
    caption?: string
  ): Promise<MessageDTO> {
    console.log('🖼️ Sending image message...');
    console.log('   From:', senderId, 'To:', receiverId);
    console.log('   Image:', image.name, '(' + (image.size / 1024).toFixed(2) + ' KB)');

    const formData = new FormData();
    formData.append('image', image);
    formData.append('senderId', senderId.toString());
    formData.append('receiverId', receiverId.toString());
    if (caption && caption.trim()) {
      formData.append('caption', caption.trim());
    }

    const response = await axiosInstance.post('/chat/send-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Image message sent successfully');
    return response.data;
  }
}

// Create singleton instance
const messageServiceInstance = new MessageService();

// Export as named export
export { messageServiceInstance as messageService };

// Also export default for compatibility
export default messageServiceInstance;


