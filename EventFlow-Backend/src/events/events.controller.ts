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
  availability: z.enum(['PUBLISHED', 'ARCHIVED', 'COMPLETED']).optional(),
  capacity: z.number().int().positive().nullable().optional(),
  allowWaitlist: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  // Novos campos
  category: z.enum(['CONFERENCIA', 'WORKSHOP', 'PALESTRA', 'FESTA', 'ESPORTIVO', 'CULTURAL', 'EDUCACIONAL', 'NETWORKING', 'CORPORATIVO', 'BENEFICENTE', 'OUTRO']).optional(),
  eventType: z.enum(['PRESENCIAL', 'ONLINE', 'HIBRIDO']).optional(),
  price: z.number().min(0).optional(),
  minAge: z.number().int().min(0).max(120).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  onlineUrl: z.string().url().nullable().optional(),
  tags: z.string().nullable().optional(),
});

const EventUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  date: z.string().optional(),
  time: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  rsvpDeadline: z.string().optional().nullable(),
  capacity: z.number().int().positive().nullable().optional(),
  waitlistEnabled: z.boolean().optional(),
  showGuestList: z.boolean().optional(),
  timezone: z.string().optional(),
  notifyGuests: z.boolean().optional(),
  cancelledReason: z.string().optional().nullable(),
  revision: z.number().int().optional(),
  availability: z.enum(['PUBLISHED', 'ARCHIVED', 'COMPLETED', 'CANCELLED']).optional(),
  // Novos campos
  category: z.enum(['CONFERENCIA', 'WORKSHOP', 'PALESTRA', 'FESTA', 'ESPORTIVO', 'CULTURAL', 'EDUCACIONAL', 'NETWORKING', 'CORPORATIVO', 'BENEFICENTE', 'OUTRO']).optional(),
  eventType: z.enum(['PRESENCIAL', 'ONLINE', 'HIBRIDO']).optional(),
  price: z.number().min(0).optional(),
  minAge: z.number().int().min(0).max(120).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  onlineUrl: z.string().url().nullable().optional(),
  tags: z.string().nullable().optional(),
});

@Controller('events')
export class EventsController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAllEvents(@Req() req: any) {
    // Retorna todos eventos públicos disponíveis (PUBLISHED)
    const events = await this.prisma.event.findMany({
      where: {
        visibility: 'PUBLIC',
        availability: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        time: true,
        location: true,
        visibility: true,
        availability: true,
        capacity: true,
        waitlistEnabled: true,
        showGuestList: true,
        timezone: true,
        // Novos campos
        category: true,
        eventType: true,
        price: true,
        minAge: true,
        imageUrl: true,
        onlineUrl: true,
        tags: true,
        ownerId: true,
        createdAt: true,
      },
      orderBy: { date: 'asc' },
    });
    return events;
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-events')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMyEvents(@Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    const events = await this.prisma.event.findMany({
      where: {
        ownerId: uid,
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        time: true,
        location: true,
        visibility: true,
        availability: true,
        capacity: true,
        waitlistEnabled: true,
        showGuestList: true,
        timezone: true,
        // Novos campos
        category: true,
        eventType: true,
        price: true,
        minAge: true,
        imageUrl: true,
        onlineUrl: true,
        tags: true,
        ownerId: true,
        createdAt: true,
      },
      orderBy: { date: 'asc' },
    });
    return events;
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-invites')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMyInvites(@Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Get user email to find their invites
    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { email: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // Find all events where user is a guest
    const guests = await this.prisma.guest.findMany({
      where: {
        email: user.email,
      },
      include: {
        event: {
          include: {
            _count: {
              select: { guests: true },
            },
          },
        },
      },
      orderBy: { event: { date: 'asc' } },
    });

    // Return events with guest status
    return guests.map((guest: any) => ({
      ...guest.event,
      myGuestStatus: guest.status,
      myGuestId: guest.id,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createEvent(@Body() body: any, @Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    const parsed = EventCreateSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const {
      title, description, date, time, location, visibility, availability, capacity, allowWaitlist, requireApproval,
      category, eventType, price, minAge, imageUrl, onlineUrl, tags
    } = parsed.data;

    // Se não especificado, eventos públicos começam como 'PUBLISHED', privados não aparecem na lista pública
    const event = await this.prisma.event.create({
      data: {
        title,
        description: description || '',
        date: new Date(date),
        time: time || '',
        location: location || '',
        visibility: visibility || 'PRIVATE',
        availability: availability || (visibility === 'PUBLIC' ? 'PUBLISHED' : 'COMPLETED'),
        capacity: capacity || null,
        waitlistEnabled: allowWaitlist || false,
        showGuestList: requireApproval || false,
        // Novos campos
        category: category || 'OUTRO',
        eventType: eventType || 'PRESENCIAL',
        price: price !== undefined ? price : 0,
        minAge: minAge || null,
        imageUrl: imageUrl || null,
        onlineUrl: onlineUrl || null,
        tags: tags || null,
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
      include: {
        guests: true,
        owner: true,
      },
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
      rsvpDeadline,
      capacity,
      waitlistEnabled,
      showGuestList,
      timezone,
      notifyGuests,
      cancelledReason,
      // Novos campos
      category,
      eventType,
      price,
      minAge,
      imageUrl,
      onlineUrl,
      tags,
      // availability removido, pois é controlado por newAvailability
    } = parsed.data;

    if (typeof capacity !== 'undefined' && capacity !== null && capacity <= 0) {
      throw new BadRequestException('Capacidade deve ser positiva');
    }
    if (capacity && existing.guests.filter((g: any) => g.status === 'YES').length > capacity) {
      throw new BadRequestException('Capacidade menor que confirmações atuais');
    }

    // Lógica de disponibilidade
    let newAvailability = existing.availability;
    const now = new Date();
    const newDate = date ? new Date(date) : existing.date;

    // Se usuário está tentando cancelar
    if (parsed.data.availability === 'CANCELLED') {
      newAvailability = 'CANCELLED';
    }
    // Se usuário está tentando arquivar
    else if (parsed.data.availability === 'ARCHIVED') {
      newAvailability = 'ARCHIVED';
    }
    // Se usuário está tentando publicar
    else if (parsed.data.availability === 'PUBLISHED') {
      // Só pode publicar se data for futura
      if (newDate.getTime() > now.getTime()) {
        newAvailability = 'PUBLISHED';
      } else {
        throw new BadRequestException('Só é possível publicar eventos com data futura');
      }
    }

    // Se data foi alterada para futuro, volta para PUBLISHED
    if (existing.availability === 'COMPLETED' && newDate.getTime() > now.getTime()) {
      newAvailability = 'PUBLISHED';
    }
    // Se data foi alterada para passado, marca como COMPLETED
    if (newDate.getTime() <= now.getTime()) {
      newAvailability = 'COMPLETED';
    }

    // CANCELLED só visível para inscritos
    // (visibilidade será tratada no GET)

    const changes: any = {
      title,
      description: description ?? undefined,
      date: date ? newDate : undefined,
      time,
      location,
      visibility,
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
      availability: newAvailability,
      // Novos campos
      category: category !== undefined ? category : undefined,
      eventType: eventType !== undefined ? eventType : undefined,
      price: price !== undefined ? price : undefined,
      minAge: typeof minAge !== 'undefined' ? minAge : undefined,
      imageUrl: typeof imageUrl !== 'undefined' ? imageUrl : undefined,
      onlineUrl: typeof onlineUrl !== 'undefined' ? onlineUrl : undefined,
      tags: typeof tags !== 'undefined' ? tags : undefined,
    };
    const updated = await this.prisma.event.update({
      where: { id },
      data: changes,
      include: { guests: true },
    });
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

  @UseGuards(JwtAuthGuard)
  @Get(':id/guests')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getEventGuests(@Param('id') id: string, @Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { ownerId: true, visibility: true },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');

    // Allow owner or public event guests to see the list
    const isOwner = event.ownerId === uid;
    const isPublic = event.visibility === 'PUBLIC';

    // Check if user is a guest of this event
    const isGuest = await this.prisma.guest.findFirst({
      where: { eventId: id, userId: uid },
    });

    if (!isOwner && !isPublic && !isGuest) {
      throw new ForbiddenException('Você não tem permissão para ver os convidados deste evento');
    }

    const guests = await this.prisma.guest.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'asc' },
    });

    return guests;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/guests')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async addGuests(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { ownerId: true, visibility: true, availability: true },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');

    const emails = body.emails;
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new BadRequestException('Lista de emails inválida');
    }

    // Get current user email
    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { email: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // Verificar permissões:
    // 1. Se é o dono do evento, pode adicionar qualquer email
    // 2. Se NÃO é o dono, só pode adicionar o próprio email em eventos públicos e publicados
    const isOwner = event.ownerId === uid;

    if (!isOwner) {
      // Não é o dono - verificar se está tentando se auto-inscrever em evento público
      if (event.visibility !== 'PUBLIC' || event.availability !== 'PUBLISHED') {
        throw new ForbiddenException('Apenas eventos públicos e publicados permitem auto-inscrição');
      }

      // Verificar se está tentando adicionar apenas o próprio email
      if (emails.length !== 1 || emails[0] !== user.email) {
        throw new ForbiddenException('Você só pode se inscrever em eventos públicos. Apenas o criador pode adicionar outros convidados.');
      }
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        throw new BadRequestException(`Email inválido: ${email}`);
      }
    }

    // Create guests
    const guests = [];
    for (const email of emails) {
      // Check if guest already exists
      const existing = await this.prisma.guest.findFirst({
        where: { eventId: id, email },
      });

      if (!existing) {
        const guest = await this.prisma.guest.create({
          data: {
            email,
            name: email.split('@')[0], // Use email prefix as default name
            status: 'PENDING',
            eventId: id,
          },
        });
        guests.push(guest);
      }
    }

    return {
      message: `${guests.length} convidados adicionados`,
      guests,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':eventId/guests/:guestId')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateGuestStatus(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Get user email
    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { email: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // Find guest
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: { event: true },
    });

    if (!guest) throw new NotFoundException('Convite não encontrado');
    if (guest.eventId !== eventId) throw new BadRequestException('Convite não pertence a este evento');

    // Check if user is event owner or the guest themselves
    const isOwner = guest.event.ownerId === uid;
    const isGuest = guest.email === user.email;

    if (!isOwner && !isGuest) {
      throw new ForbiddenException('Você não pode atualizar este convidado');
    }

    const { status, name } = body;

    // If updating status, validate it
    if (status && !['YES', 'NO', 'MAYBE', 'PENDING', 'WAITLISTED'].includes(status)) {
      throw new BadRequestException('Status inválido. Use: YES, NO, MAYBE, PENDING ou WAITLISTED');
    }

    // Only guest can update their own status, only owner can update name
    if (status && !isGuest) {
      throw new ForbiddenException('Apenas o convidado pode atualizar seu próprio status');
    }

    if (name && !isOwner) {
      throw new ForbiddenException('Apenas o organizador pode editar o nome do convidado');
    }

    // Update guest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      updateData.respondedAt = new Date(); // Register when guest responded
    }
    if (name) updateData.name = name;

    const updated = await this.prisma.guest.update({
      where: { id: guestId },
      data: updateData,
    });

    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':eventId/guests/:guestId')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteGuest(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @Req() req: any,
  ) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Find guest
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: { event: true },
    });

    if (!guest) throw new NotFoundException('Convite não encontrado');
    if (guest.eventId !== eventId) throw new BadRequestException('Convite não pertence a este evento');

    // Only event owner can delete guests
    if (guest.event.ownerId !== uid) {
      throw new ForbiddenException('Apenas o organizador pode remover convidados');
    }

    // Delete guest
    await this.prisma.guest.delete({
      where: { id: guestId },
    });

    return { message: 'Convidado removido com sucesso' };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/announcements')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAnnouncements(@Param('id') id: string, @Req() req: any) {
    const uid = req.user?.userId;

    // Check if user has access to this event (owner or guest)
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { ownerId: true, visibility: true },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');

    // If private, check if user is owner or guest
    if (event.visibility === 'PRIVATE' && uid) {
      if (event.ownerId !== uid) {
        const user = await this.prisma.user.findUnique({
          where: { id: uid },
          select: { email: true },
        });
        const isGuest = await this.prisma.guest.findFirst({
          where: { eventId: id, email: user?.email },
        });
        if (!isGuest) throw new ForbiddenException('Não autorizado');
      }
    }

    // Get announcements
    const announcements = await this.prisma.announcement.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'desc' },
    });

    return announcements;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/announcements')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAnnouncement(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Check if user is the event owner
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');
    if (event.ownerId !== uid) {
      throw new ForbiddenException('Apenas o criador pode adicionar anúncios');
    }

    const { message } = body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new BadRequestException('Mensagem é obrigatória');
    }

    // Create announcement
    const announcement = await this.prisma.announcement.create({
      data: {
        message: message.trim(),
        eventId: id,
        createdBy: uid,
      },
    });

    return announcement;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':eventId/announcements/:announcementId')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateAnnouncement(
    @Param('eventId') eventId: string,
    @Param('announcementId') announcementId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Find the announcement and check ownership
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: { event: true },
    });

    if (!announcement) throw new NotFoundException('Anúncio não encontrado');
    if (announcement.eventId !== eventId) {
      throw new BadRequestException('Anúncio não pertence a este evento');
    }
    if (announcement.event.ownerId !== uid) {
      throw new ForbiddenException('Apenas o criador do evento pode editar anúncios');
    }

    const { message } = body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new BadRequestException('Mensagem é obrigatória');
    }

    // Update announcement
    const updated = await this.prisma.announcement.update({
      where: { id: announcementId },
      data: { message: message.trim() },
    });

    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':eventId/announcements/:announcementId')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteAnnouncement(
    @Param('eventId') eventId: string,
    @Param('announcementId') announcementId: string,
    @Req() req: any,
  ) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Find the announcement and check ownership
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: { event: true },
    });

    if (!announcement) throw new NotFoundException('Anúncio não encontrado');
    if (announcement.eventId !== eventId) {
      throw new BadRequestException('Anúncio não pertence a este evento');
    }
    if (announcement.event.ownerId !== uid) {
      throw new ForbiddenException('Apenas o criador do evento pode deletar anúncios');
    }

    // Delete announcement
    await this.prisma.announcement.delete({
      where: { id: announcementId },
    });

    return { message: 'Anúncio removido com sucesso' };
  }

  // ============== MESSAGE ENDPOINTS ==============

  @UseGuards(JwtAuthGuard)
  @Post(':id/messages')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendMessage(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { ownerId: true, visibility: true },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');

    // Get user email
    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { email: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // Check if user is a guest of this event or the owner
    const isOwner = event.ownerId === uid;
    const isGuest = await this.prisma.guest.findFirst({
      where: { eventId: id, email: user.email },
    });

    if (!isOwner && !isGuest) {
      throw new ForbiddenException('Você deve ser um convidado ou organizador para enviar mensagens');
    }

    const { content } = body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new BadRequestException('Conteúdo da mensagem é obrigatório');
    }

    // Determine sender and receiver
    // If user is owner, they're replying to a participant
    // If user is participant, they're sending to owner
    let receiverId: string;

    if (isOwner) {
      // Owner is replying - need to specify which participant
      receiverId = body.receiverId;
      if (!receiverId) {
        throw new BadRequestException('receiverId é obrigatório ao responder como organizador');
      }
    } else {
      // Participant is sending to owner
      receiverId = event.ownerId;
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        content: content.trim(),
        senderId: uid,
        receiverId,
        eventId: id,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return message;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages/conversations')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getConversations(@Param('id') id: string, @Req() req: any) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Check if user is the event owner
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');
    if (event.ownerId !== uid) {
      throw new ForbiddenException('Apenas o organizador pode ver todas as conversas');
    }

    // Get all messages for this event where owner is sender or receiver
    const messages = await this.prisma.message.findMany({
      where: {
        eventId: id,
        OR: [
          { senderId: uid },
          { receiverId: uid },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group messages by conversation (other user ID)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationsMap = new Map<string, any>();

    for (const message of messages) {
      const otherUserId = message.senderId === uid ? message.receiverId : message.senderId;
      const otherUser = message.senderId === uid ? message.receiver : message.sender;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          userName: otherUser.name,
          userEmail: otherUser.email,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread messages (messages sent TO the owner that are unread)
      if (message.receiverId === uid && !message.read) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    }

    return Array.from(conversationsMap.values());
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages/:otherUserId')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMessageThread(
    @Param('id') id: string,
    @Param('otherUserId') otherUserId: string,
    @Req() req: any,
  ) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');

    // User must be either the owner or the other user
    if (uid !== event.ownerId && uid !== otherUserId) {
      throw new ForbiddenException('Você não tem permissão para ver esta conversa');
    }

    // Get all messages between these two users for this event
    const messages = await this.prisma.message.findMany({
      where: {
        eventId: id,
        OR: [
          { senderId: uid, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: uid },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read if the current user is the receiver
    await this.prisma.message.updateMany({
      where: {
        eventId: id,
        receiverId: uid,
        senderId: otherUserId,
        read: false,
      },
      data: { read: true },
    });

    return messages;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/messages/:messageId/read')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async markMessageAsRead(
    @Param('id') id: string,
    @Param('messageId') messageId: string,
    @Req() req: any,
  ) {
    const uid = req.user?.userId;
    if (!uid) throw new UnauthorizedException('Não autenticado');

    // Find message
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Mensagem não encontrada');
    if (message.eventId !== id) {
      throw new BadRequestException('Mensagem não pertence a este evento');
    }
    if (message.receiverId !== uid) {
      throw new ForbiddenException('Você só pode marcar suas próprias mensagens como lidas');
    }

    // Mark as read
    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    });

    return updated;
  }
}
