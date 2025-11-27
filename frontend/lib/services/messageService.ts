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
}

export const messageService = new MessageService();

