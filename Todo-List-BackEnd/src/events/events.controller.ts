import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { z } from 'zod';

const EventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  time: z.string().optional(),
  location: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  capacity: z.number().int().positive().nullable().optional(),
  allowWaitlist: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
});

const EventUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  date: z.string().optional(),
  time: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  state: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED']).optional(),
  rsvpDeadline: z.string().optional().nullable(),
  capacity: z.number().int().positive().nullable().optional(),
  waitlistEnabled: z.boolean().optional(),
  showGuestList: z.boolean().optional(),
  timezone: z.string().optional(),
  notifyGuests: z.boolean().optional(),
  cancelledReason: z.string().optional().nullable(),
  revision: z.number().int().optional(),
});

@Controller('events')
export class EventsController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAllEvents(@Req() req: any) {
    const uid = req.user?.userId;
    const events = await this.prisma.event.findMany({
      where: {
        OR: [
          { visibility: 'PUBLIC' },
          { ownerId: uid },
        ],
      },
      include: {
        _count: {
          select: { guests: true },
        },
      },
      orderBy: { date: 'asc' },
    });
    return events;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createEvent(@Body() body: any, @Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    const parsed = EventCreateSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const { title, description, date, time, location, visibility, capacity, allowWaitlist, requireApproval } = parsed.data;

    const event = await this.prisma.event.create({
      data: {
        title,
        description: description || '',
        date: new Date(date),
        time: time || '',
        location: location || '',
        visibility: visibility || 'PRIVATE',
        state: 'DRAFT',
        capacity: capacity || null,
        waitlistEnabled: allowWaitlist || false,
        showGuestList: requireApproval || false,
        ownerId: uid,
      },
      include: {
        _count: {
          select: { guests: true },
        },
      },
    });

    return event;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getEvent(@Param('id') id: string, @Req() req: any) {
    const uid = req.user?.userId;
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { guests: true, owner: { select: { id: true, email: true } } },
    });
    if (!event) throw new NotFoundException('Not found');
    if (event.visibility === 'PRIVATE') {
      if (!uid) throw new ForbiddenException('Não autorizado');
      if (event.ownerId !== uid) {
        const user = await this.prisma.user.findUnique({
          where: { id: uid },
          select: { email: true },
        });
        const isGuest = !!event.guests.find((g: { email: string }) => g.email === user?.email);
        if (!isGuest) throw new ForbiddenException('Não autorizado');
      }
    }
    // Remove owner from response for privacy
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { owner, ...rest } = event;
    return rest;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateEvent(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');
    const existing = await this.prisma.event.findUnique({
      where: { id },
      include: { guests: true },
    });
    if (!existing) throw new NotFoundException('Not found');
    if (existing.ownerId !== uid) throw new ForbiddenException('Proibido');
    const parsed = EventUpdateSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const {
      title,
      description,
      date,
      time,
      location,
      visibility,
      state,
      rsvpDeadline,
      capacity,
      waitlistEnabled,
      showGuestList,
      timezone,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      notifyGuests,
      cancelledReason,
    } = parsed.data;
    if (['CANCELLED', 'COMPLETED', 'ARCHIVED'].includes(existing.state)) {
      const updated = await this.prisma.event.update({
        where: { id },
        data: { description: description ?? undefined, showGuestList },
        include: { guests: true },
      });
      // await recordAudit(id, "EVENT_EDIT_READONLY", JSON.stringify({ description: !!description, showGuestList }), uid);
      return updated;
    }
    const nextState = state ?? existing.state;
    const nextDate = date ? new Date(date) : existing.date;
    if (nextState === 'PUBLISHED' && nextDate.getTime() <= Date.now()) {
      throw new BadRequestException('Data deve ser futura para publicar');
    }
    if (existing.state === 'DRAFT' && nextState === 'CANCELLED') {
      throw new BadRequestException('Rascunho não pode ser cancelado');
    }
    if (nextState === 'CANCELLED' && !cancelledReason) {
      throw new BadRequestException('Informe o motivo do cancelamento');
    }
    if (typeof capacity !== 'undefined' && capacity !== null && capacity <= 0) {
      throw new BadRequestException('Capacidade deve ser positiva');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (capacity && existing.guests.filter((g: any) => g.status === 'YES').length > capacity) {
      throw new BadRequestException('Capacidade menor que confirmações atuais');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changes: any = {
      title,
      description: description ?? undefined,
      date: date ? new Date(date) : undefined,
      time,
      location,
      visibility,
      state,
      rsvpDeadline:
        typeof rsvpDeadline !== 'undefined'
          ? rsvpDeadline
            ? new Date(rsvpDeadline)
            : null
          : undefined,
      capacity: typeof capacity !== 'undefined' ? capacity : undefined,
      waitlistEnabled,
      showGuestList,
      timezone,
      cancelledReason: typeof cancelledReason !== 'undefined' ? cancelledReason || null : undefined,
    };
    const updated = await this.prisma.event.update({
      where: { id },
      data: changes,
      include: { guests: true },
    });
    // await recordAudit(id, "EVENT_UPDATED", JSON.stringify(parsed.data), uid);
    // Notificações em cancelamento e mudanças importantes
    // if (notifyGuests) { ... }
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteEvent(@Param('id') id: string, @Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');
    const existing = await this.prisma.event.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!existing) throw new NotFoundException('Not found');
    if (existing.ownerId !== uid) throw new ForbiddenException('Proibido');
    try {
      await this.prisma.guest.deleteMany({ where: { eventId: id } });
      await this.prisma.event.delete({ where: { id } });
      // await recordAudit(id, "EVENT_DELETED", undefined, uid);
      return { ok: true };
    } catch {
      throw new NotFoundException('Not found');
    }
  }
}
