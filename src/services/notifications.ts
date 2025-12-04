/**
 * Notifications Service
 * API calls for in-app and push notifications
 */

import { api } from './api';

export type NotificationType = 
  | 'EVENT_INVITE'
  | 'EVENT_REMINDER'
  | 'EVENT_UPDATE'
  | 'EVENT_CANCELLED'
  | 'RSVP_RESPONSE'
  | 'NEW_MESSAGE'
  | 'ANNOUNCEMENT'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string;
  data?: string;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface PushSubscription {
  id: string;
  fcmToken: string;
  deviceType?: string;
  deviceName?: string;
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
}

class NotificationsService {
  /**
   * Busca notificações do usuário
   */
  async getNotifications(options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.unreadOnly) params.append('unreadOnly', 'true');
    
    const query = params.toString();
    return api.get(`/notifications${query ? `?${query}` : ''}`);
  }

  /**
   * Busca contagem de não lidas
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.count;
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return api.patch(`/notifications/${notificationId}/read`, {});
  }

  /**
   * Marca todas como lidas
   */
  async markAllAsRead(): Promise<{ message: string }> {
    return api.post('/notifications/mark-all-read', {});
  }

  /**
   * Deleta uma notificação
   */
  async delete(notificationId: string): Promise<{ message: string }> {
    return api.delete(`/notifications/${notificationId}`);
  }

  // ============== Push Subscription ==============

  /**
   * Registra token FCM para push notifications
   */
  async subscribePush(fcmToken: string, deviceInfo?: { deviceType?: string; deviceName?: string }): Promise<{ message: string; subscriptionId: string }> {
    return api.post('/notifications/subscribe', {
      fcmToken,
      ...deviceInfo,
    });
  }

  /**
   * Remove subscription de push
   * Usando POST porque DELETE com body não é suportado
   */
  async unsubscribePush(fcmToken: string): Promise<{ message: string }> {
    return api.post('/notifications/unsubscribe', { fcmToken });
  }

  /**
   * Lista dispositivos registrados
   */
  async getSubscriptions(): Promise<PushSubscription[]> {
    return api.get('/notifications/subscriptions');
  }
}

export const notificationsService = new NotificationsService();

// ============== Convenience functions ==============

export const getNotifications = (options?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}) => notificationsService.getNotifications(options);

export const getUnreadCount = () => notificationsService.getUnreadCount();

export const markAsRead = (notificationId: string) => notificationsService.markAsRead(notificationId);

export const markAllAsRead = () => notificationsService.markAllAsRead();

export const deleteNotification = (notificationId: string) => notificationsService.delete(notificationId);

export const subscribePush = (fcmToken: string, deviceType?: string, deviceName?: string) => 
  notificationsService.subscribePush(fcmToken, { deviceType, deviceName });

export const unsubscribePush = (fcmToken: string) => notificationsService.unsubscribePush(fcmToken);

export const getSubscriptions = () => notificationsService.getSubscriptions();

// ============== Helpers ==============

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    EVENT_INVITE: '📨',
    EVENT_REMINDER: '⏰',
    EVENT_UPDATE: '📝',
    EVENT_CANCELLED: '❌',
    RSVP_RESPONSE: '✋',
    NEW_MESSAGE: '💬',
    ANNOUNCEMENT: '📢',
    SYSTEM: '🔔',
  };
  return icons[type] || '🔔';
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    EVENT_INVITE: 'bg-blue-100 text-blue-600',
    EVENT_REMINDER: 'bg-yellow-100 text-yellow-600',
    EVENT_UPDATE: 'bg-purple-100 text-purple-600',
    EVENT_CANCELLED: 'bg-red-100 text-red-600',
    RSVP_RESPONSE: 'bg-green-100 text-green-600',
    NEW_MESSAGE: 'bg-indigo-100 text-indigo-600',
    ANNOUNCEMENT: 'bg-orange-100 text-orange-600',
    SYSTEM: 'bg-gray-100 text-gray-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
}

export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
