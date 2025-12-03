import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FcmService } from './fcm.service';

export type NotificationType = 
  | 'EVENT_INVITE'
  | 'EVENT_REMINDER'
  | 'EVENT_UPDATE'
  | 'EVENT_CANCELLED'
  | 'RSVP_RESPONSE'
  | 'NEW_MESSAGE'
  | 'ANNOUNCEMENT'
  | 'SYSTEM';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  sendPush?: boolean;
}

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  eventId?: string | null;
  data?: string | null;
  actionUrl?: string | null;
  read: boolean;
  readAt?: Date | null;
  createdAt: Date;
  event?: {
    id: string;
    title: string;
  } | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private fcmService: FcmService,
  ) {}

  /**
   * Cria uma notificação para um usuário
   */
  async create(dto: CreateNotificationDto): Promise<NotificationResponse> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        eventId: dto.eventId,
        data: dto.data ? JSON.stringify(dto.data) : null,
        actionUrl: dto.actionUrl,
      },
      include: {
        event: {
          select: { id: true, title: true },
        },
      },
    });

    // Enviar push notification se solicitado
    if (dto.sendPush !== false) {
      await this.sendPushNotification(dto.userId, notification.id, dto.title, dto.message);
    }

    return notification;
  }

  /**
   * Cria notificações para múltiplos usuários
   */
  async createMany(userIds: string[], dto: Omit<CreateNotificationDto, 'userId'>): Promise<number> {
    const notifications = userIds.map(userId => ({
      userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      eventId: dto.eventId,
      data: dto.data ? JSON.stringify(dto.data) : null,
      actionUrl: dto.actionUrl,
    }));

    const result = await this.prisma.notification.createMany({
      data: notifications,
    });

    // Enviar push notifications
    if (dto.sendPush !== false) {
      for (const userId of userIds) {
        await this.sendPushNotification(userId, null, dto.title, dto.message);
      }
    }

    return result.count;
  }

  /**
   * Busca notificações de um usuário
   */
  async findByUser(
    userId: string,
    options: { limit?: number; offset?: number; unreadOnly?: boolean } = {},
  ): Promise<{ notifications: NotificationResponse[]; total: number; unreadCount: number }> {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    const where = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          event: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return { notifications, total, unreadCount };
  }

  /**
   * Conta notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponse> {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true, readAt: new Date() },
      include: {
        event: {
          select: { id: true, title: true },
        },
      },
    });
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return result.count;
  }

  /**
   * Deleta uma notificação
   */
  async delete(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id: notificationId, userId },
    });
  }

  /**
   * Deleta notificações antigas (mais de 30 dias)
   */
  async deleteOld(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        read: true,
      },
    });
    return result.count;
  }

  /**
   * Envia push notification para um usuário
   */
  private async sendPushNotification(
    userId: string,
    notificationId: string | null,
    title: string,
    body: string,
  ): Promise<void> {
    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId, isActive: true },
      });

      if (subscriptions.length === 0) {
        return;
      }

      const tokens = subscriptions.map(s => s.fcmToken);
      await this.fcmService.sendToMultiple(tokens, { title, body });

      // Atualizar status de push enviado
      if (notificationId) {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: { pushSent: true, pushSentAt: new Date() },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${(error as Error).message}`);
    }
  }

  // ============== Métodos de conveniência para criar notificações específicas ==============

  async notifyEventInvite(userId: string, eventId: string, eventTitle: string, organizerName: string) {
    return this.create({
      userId,
      type: 'EVENT_INVITE',
      title: 'Novo convite de evento',
      message: `${organizerName} convidou você para "${eventTitle}"`,
      eventId,
      actionUrl: `/events/${eventId}`,
    });
  }

  async notifyEventReminder(userId: string, eventId: string, eventTitle: string, timeUntil: string) {
    return this.create({
      userId,
      type: 'EVENT_REMINDER',
      title: 'Lembrete de evento',
      message: `"${eventTitle}" começa ${timeUntil}`,
      eventId,
      actionUrl: `/events/${eventId}`,
    });
  }

  async notifyEventUpdate(userId: string, eventId: string, eventTitle: string, changes: string) {
    return this.create({
      userId,
      type: 'EVENT_UPDATE',
      title: 'Evento atualizado',
      message: `"${eventTitle}" foi atualizado: ${changes}`,
      eventId,
      actionUrl: `/events/${eventId}`,
    });
  }

  async notifyEventCancelled(userId: string, eventId: string, eventTitle: string) {
    return this.create({
      userId,
      type: 'EVENT_CANCELLED',
      title: 'Evento cancelado',
      message: `O evento "${eventTitle}" foi cancelado`,
      eventId,
    });
  }

  async notifyRsvpResponse(userId: string, eventId: string, eventTitle: string, guestName: string, status: string) {
    const statusText = status === 'YES' ? 'confirmou presença' : status === 'NO' ? 'recusou o convite' : 'respondeu "talvez"';
    return this.create({
      userId,
      type: 'RSVP_RESPONSE',
      title: 'Resposta de convidado',
      message: `${guestName} ${statusText} em "${eventTitle}"`,
      eventId,
      actionUrl: `/events/${eventId}/guests`,
    });
  }

  async notifyNewMessage(userId: string, eventId: string, senderName: string) {
    return this.create({
      userId,
      type: 'NEW_MESSAGE',
      title: 'Nova mensagem',
      message: `${senderName} enviou uma mensagem`,
      eventId,
      actionUrl: `/events/${eventId}`,
    });
  }

  async notifyAnnouncement(userId: string, eventId: string, eventTitle: string) {
    return this.create({
      userId,
      type: 'ANNOUNCEMENT',
      title: 'Novo comunicado',
      message: `Novo comunicado em "${eventTitle}"`,
      eventId,
      actionUrl: `/events/${eventId}`,
    });
  }
}
