import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Res,
  Req,
  Query,
  UnauthorizedException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
});

const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async register(@Body() body: any, @Res() res: Response) {
    const { name, email, password } = body;
    if (!name || !email || !password || password.length < 6) {
      throw new BadRequestException('Dados inválidos');
    }
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('E-mail já cadastrado');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { name, email, password: hash } });
    const token = this.jwtService.sign({ userId: user.id });
  res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ id: user.id, name: user.name, email: user.email, token });
  }

  @Post('login')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async login(@Body() body: any, @Res() res: Response) {
    const { email, password } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');
    const token = this.jwtService.sign({ userId: user.id });
  res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ id: user.id, name: user.name, email: user.email, token });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt');
    res.json({ ok: true });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getProfile(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('Não autenticado');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    return user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateProfile(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('Não autenticado');

    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message || 'Dados inválidos');
    }

    const { name, email } = parsed.data;

    // Check if there's at least one field to update
    if (!name && !email) {
      throw new BadRequestException('Nenhum campo para atualizar');
    }

    // If email is being changed, check if it's already in use
    if (email) {
      const existing = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existing && existing.id !== userId) {
        throw new BadRequestException('Este email já está em uso');
      }
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return updatedUser;
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updatePassword(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('Não autenticado');

    const parsed = UpdatePasswordSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message || 'Dados inválidos');
    }

    const { currentPassword, newPassword } = parsed.data;

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });

    return { message: 'Senha atualizada com sucesso' };
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteAccount(@Query('password') password: string, @Req() req: any, @Res() res: Response) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('Não autenticado');

    // Validate password is provided
    if (!password || password.length < 6) {
      throw new BadRequestException('Senha é obrigatória para confirmar exclusão');
    }

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, email: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new BadRequestException('Senha incorreta');
    }

    try {
      // Delete in order: announcements -> guests -> events -> user
      // First, get all events owned by the user
      const userEvents = await this.prisma.event.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });

      const eventIds = userEvents.map(e => e.id);

      // Delete all announcements from user's events
      if (eventIds.length > 0) {
        await this.prisma.announcement.deleteMany({
          where: { eventId: { in: eventIds } },
        });

        // Delete all guests from user's events
        await this.prisma.guest.deleteMany({
          where: { eventId: { in: eventIds } },
        });

        // Delete all events owned by user
        await this.prisma.event.deleteMany({
          where: { ownerId: userId },
        });
      }

      // Delete guest entries where user is a guest (by email)
      await this.prisma.guest.deleteMany({
        where: { email: user.email },
      });

      // Finally, delete the user
      await this.prisma.user.delete({
        where: { id: userId },
      });

      // Clear the cookie
      res.clearCookie('jwt');

      return res.json({ message: 'Conta deletada com sucesso' });
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new BadRequestException('Erro ao deletar conta. Por favor, tente novamente.');
    }
  }
}
