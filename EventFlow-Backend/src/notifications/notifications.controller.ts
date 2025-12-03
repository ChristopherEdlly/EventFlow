import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /notifications - Lista notificações do usuário
   */
  @Get()
  async getNotifications(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const userId = req.user.userId;
    return this.notificationsService.findByUser(userId, {
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
      unreadOnly: unreadOnly === 'true',
    });
  }

  /**
   * GET /notifications/unread-count - Conta notificações não lidas
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.userId;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  /**
   * PATCH /notifications/:id/read - Marca notificação como lida
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.markAsRead(id, userId);
  }

  /**
   * POST /notifications/mark-all-read - Marca todas como lidas
   */
  @Post('mark-all-read')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.userId;
    const count = await this.notificationsService.markAllAsRead(userId);
    return { message: `${count} notificações marcadas como lidas` };
  }

  /**
   * DELETE /notifications/:id - Deleta uma notificação
   */
  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    await this.notificationsService.delete(id, userId);
    return { message: 'Notificação deletada' };
  }

  // ============== Push Subscription Endpoints ==============

  /**
   * POST /notifications/subscribe - Registra token FCM para push
   */
  @Post('subscribe')
  async subscribePush(
    @Body() body: { fcmToken: string; deviceType?: string; deviceName?: string },
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const { fcmToken, deviceType, deviceName } = body;

    if (!fcmToken) {
      throw new BadRequestException('fcmToken é obrigatório');
    }

    // Verifica se já existe
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { fcmToken },
    });

    if (existing) {
      // Atualiza se necessário
      if (existing.userId !== userId || !existing.isActive) {
        await this.prisma.pushSubscription.update({
          where: { fcmToken },
          data: { userId, isActive: true, lastUsed: new Date() },
        });
      }
      return { message: 'Subscription atualizada', subscriptionId: existing.id };
    }

    // Cria nova subscription
    const subscription = await this.prisma.pushSubscription.create({
      data: {
        userId,
        fcmToken,
        deviceType,
        deviceName,
      },
    });

    return { message: 'Subscription criada', subscriptionId: subscription.id };
  }

  /**
   * POST /notifications/unsubscribe - Remove token FCM
   * Usando POST porque DELETE com body não é bem suportado em alguns clientes
   */
  @Post('unsubscribe')
  async unsubscribePush(@Body() body: { fcmToken: string }, @Req() req: any) {
    const { fcmToken } = body;

    if (!fcmToken) {
      throw new BadRequestException('fcmToken é obrigatório');
    }

    await this.prisma.pushSubscription.updateMany({
      where: { fcmToken },
      data: { isActive: false },
    });

    return { message: 'Unsubscribed' };
  }

  /**
   * GET /notifications/subscriptions - Lista subscriptions do usuário
   */
  @Get('subscriptions')
  async getSubscriptions(@Req() req: any) {
    const userId = req.user.userId;
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        fcmToken: true,
        deviceType: true,
        deviceName: true,
        isActive: true,
        lastUsed: true,
        createdAt: true,
      },
    });
    return subscriptions;
  }
}
