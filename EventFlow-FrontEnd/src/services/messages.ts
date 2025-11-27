/**
 * Messages Service
 * API calls for private messaging between participants and organizers
 */

import { api } from './api';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  eventId: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SendMessageDto {
  content: string;
  receiverId?: string; // Required when organizer is replying
}

class MessagesService {
  /**
   * Send a message in an event
   * - Participants send to organizer (receiverId is automatic)
   * - Organizers must specify receiverId when replying
   */
  async sendMessage(eventId: string, data: SendMessageDto): Promise<Message> {
    return api.post<Message>(`/events/${eventId}/messages`, data);
  }

  /**
   * Get all conversations for an event (organizer only)
   * Returns a list of participants with their last message and unread count
   */
  async getConversations(eventId: string): Promise<Conversation[]> {
    return api.get<Conversation[]>(`/events/${eventId}/messages/conversations`);
  }

  /**
   * Get message thread between current user and another user
   * - For participants: otherUserId is the organizer's ID
   * - For organizers: otherUserId is the participant's ID
   */
  async getMessageThread(eventId: string, otherUserId: string): Promise<Message[]> {
    return api.get<Message[]>(`/events/${eventId}/messages/${otherUserId}`);
  }

  /**
   * Mark a message as read
   */
  async markAsRead(eventId: string, messageId: string): Promise<Message> {
    return api.patch<Message>(`/events/${eventId}/messages/${messageId}/read`, {});
  }
}

export const messagesService = new MessagesService();
