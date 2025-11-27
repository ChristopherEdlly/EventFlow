import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { NotBannedGuard } from '../auth/not-banned.guard';
import { z } from 'zod';

const ReportCreateSchema = z.object({
  eventId: z.string().uuid(),
  reason: z.enum(['SPAM', 'INAPPROPRIATE', 'FRAUD', 'SCAM', 'MISLEADING', 'HARASSMENT', 'OTHER']),
  details: z.string().max(500).optional(),
});

const ReportReviewSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  reviewNotes: z.string().max(500).optional(),
});

const PenaltyCreateSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['WARNING', 'SUSPENSION', 'BAN']),
  reason: z.string().min(1).max(200),
  details: z.string().max(500).optional(),
  duration: z.number().int().min(1).max(365).optional(), // dias
});

@Controller('moderation')
export class ModerationController {
  constructor(private readonly prisma: PrismaService) {}

  // ============== DENÚNCIAS (USUÁRIOS) ==============

  /**
   * Criar uma denúncia de evento
   * Qualquer usuário autenticado pode denunciar um evento
   */
  @UseGuards(JwtAuthGuard, NotBannedGuard)
  @Post('reports')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createReport(@Body() body: any, @Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    const parsed = ReportCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const { eventId, reason, details } = parsed.data;

    // Verificar se evento existe
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { ownerId: true, title: true },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    // Não pode denunciar próprio evento
    if (event.ownerId === uid) {
      throw new BadRequestException('Você não pode denunciar seu próprio evento');
    }

    // Verificar se já denunciou este evento
    const existingReport = await this.prisma.report.findUnique({
      where: {
        eventId_reportedBy: {
          eventId,
          reportedBy: uid,
        },
      },
    });

    if (existingReport) {
      throw new BadRequestException('Você já denunciou este evento');
    }

    // Criar denúncia
    const report = await this.prisma.report.create({
      data: {
        eventId,
        reportedBy: uid,
        reason,
        details: details || null,
      },
      include: {
        event: {
          select: { title: true, ownerId: true },
        },
        reporter: {
          select: { name: true, email: true },
        },
      },
    });

    // Incrementar contador de denúncias no evento
    await this.prisma.event.update({
      where: { id: eventId },
      data: { reportCount: { increment: 1 } },
    });

    // Sistema automático: ocultar evento se atingir 3 denúncias
    const reportCount = await this.prisma.report.count({
      where: { eventId, status: 'PENDING' },
    });

    if (reportCount >= 3) {
      await this.prisma.event.update({
        where: { id: eventId },
        data: {
          isHidden: true,
          hiddenReason: 'Múltiplas denúncias (oculto automaticamente)',
          hiddenAt: new Date(),
        },
      });
    }

    return {
      message: 'Denúncia registrada com sucesso',
      report,
      autoHidden: reportCount >= 3,
    };
  }

  /**
   * Listar denúncias do usuário atual
   */
  @UseGuards(JwtAuthGuard)
  @Get('reports/my')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMyReports(@Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    const reports = await this.prisma.report.findMany({
      where: { reportedBy: uid },
      include: {
        event: {
          select: { title: true, isHidden: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports;
  }

  // ============== MODERAÇÃO (APENAS ADMIN) ==============

  /**
   * Listar todas as denúncias pendentes (Admin)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('reports/pending')
  async getPendingReports() {
    const reports = await this.prisma.report.findMany({
      where: { status: 'PENDING' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            ownerId: true,
            isHidden: true,
            reportCount: true,
            createdAt: true,
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        reporter: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports;
  }

  /**
   * Listar todas as denúncias (Admin)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('reports/all')
  async getAllReports() {
    const reports = await this.prisma.report.findMany({
      include: {
        event: {
          select: {
            title: true,
            isHidden: true,
            owner: {
              select: { name: true, email: true },
            },
          },
        },
        reporter: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports;
  }

  /**
   * Revisar uma denúncia (Admin)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('reports/:id/review')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async reviewReport(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const uid = req.user?.userId;

    const parsed = ReportReviewSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const { status, reviewNotes } = parsed.data;

    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!report) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    if (report.status !== 'PENDING') {
      throw new BadRequestException('Esta denúncia já foi revisada');
    }

    // Atualizar denúncia
    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status,
        reviewedBy: uid,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    });

    // Se rejeitada E evento estava oculto automaticamente, restaurar
    if (status === 'REJECTED' && report.event.isHidden && report.event.hiddenReason?.includes('automaticamente')) {
      // Verificar quantas denúncias pendentes restam
      const pendingCount = await this.prisma.report.count({
        where: {
          eventId: report.eventId,
          status: 'PENDING',
        },
      });

      // Se não há mais denúncias pendentes suficientes, desocultar
      if (pendingCount < 3) {
        await this.prisma.event.update({
          where: { id: report.eventId },
          data: {
            isHidden: false,
            hiddenReason: null,
            hiddenAt: null,
          },
        });
      }
    }

    return updated;
  }

  /**
   * Aplicar penalidade a um usuário (Admin)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('penalties')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createPenalty(@Body() body: any, @Req() req: any) {
    const adminId = req.user?.userId;

    const parsed = PenaltyCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const { userId, type, reason, details, duration } = parsed.data;

    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Não pode penalizar outro admin
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Não é possível penalizar administradores');
    }

    // Validações
    if (type === 'SUSPENSION' && !duration) {
      throw new BadRequestException('Suspensão requer duração em dias');
    }

    if (type === 'WARNING' && duration) {
      throw new BadRequestException('Advertência não aceita duração');
    }

    if (type === 'BAN' && duration) {
      throw new BadRequestException('Ban permanente não aceita duração');
    }

    // Calcular data de expiração para suspensão
    let expiresAt = null;
    if (type === 'SUSPENSION' && duration) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);
    }

    // Criar penalidade
    const penalty = await this.prisma.penalty.create({
      data: {
        userId,
        type,
        reason,
        details: details || null,
        duration: duration || null,
        expiresAt,
        createdBy: adminId,
      },
    });

    // Aplicar ban no usuário se for BAN ou SUSPENSION
    if (type === 'BAN' || type === 'SUSPENSION') {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          bannedAt: new Date(),
          bannedUntil: expiresAt,
          banReason: reason,
        },
      });

      // Se BAN permanente, ocultar todos os eventos do usuário
      if (type === 'BAN') {
        await this.prisma.event.updateMany({
          where: { ownerId: userId },
          data: {
            isHidden: true,
            hiddenReason: 'Organizador banido',
            hiddenAt: new Date(),
          },
        });
      }
    }

    return penalty;
  }

  /**
   * Listar penalidades de um usuário (Admin)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('penalties/user/:userId')
  async getUserPenalties(@Param('userId') userId: string) {
    const penalties = await this.prisma.penalty.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return penalties;
  }

  /**
   * Listar todos usuários banidos (Admin)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('banned-users')
  async getBannedUsers() {
    const users = await this.prisma.user.findMany({
      where: { isBanned: true },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
        bannedAt: true,
        bannedUntil: true,
        banReason: true,
        penalties: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { bannedAt: 'desc' },
    });

    return users;
  }

  /**
   * Desbanir um usuário (Admin)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('unban/:userId')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async unbanUser(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.isBanned) {
      throw new BadRequestException('Usuário não está banido');
    }

    // Desbanir
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedUntil: null,
        banReason: null,
      },
    });

    // Desativar penalidades ativas
    await this.prisma.penalty.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return { message: 'Usuário desbanido com sucesso' };
  }

  /**
   * Estatísticas de moderação (Admin)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('stats')
  async getStats() {
    const [
      pendingReports,
      totalReports,
      bannedUsers,
      hiddenEvents,
      totalPenalties,
    ] = await Promise.all([
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count(),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.event.count({ where: { isHidden: true } }),
      this.prisma.penalty.count({ where: { isActive: true } }),
    ]);

    return {
      pendingReports,
      totalReports,
      bannedUsers,
      hiddenEvents,
      activePenalties: totalPenalties,
    };
  }
}
