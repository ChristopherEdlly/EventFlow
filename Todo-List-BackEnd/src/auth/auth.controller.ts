import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UnauthorizedException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

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
    res.json({ id: user.id, name: user.name, email: user.email });
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
    res.json({ id: user.id, name: user.name, email: user.email });
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
}
