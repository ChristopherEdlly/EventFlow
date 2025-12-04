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
import { GoogleAuthService } from './google-auth.service';
import { EmailVerificationService } from './email-verification.service';

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
});

const RequestEmailChangeSchema = z.object({
  newEmail: z.string().email('Email inválido'),
  password: z.string().optional(), // Obrigatório apenas para contas LOCAL
});

const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

const VerifyResetCodeSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
});

const ResetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly emailVerificationService: EmailVerificationService,
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
    const user = await this.prisma.user.create({ 
      data: { 
        name, 
        email, 
        password: hash,
        authProvider: 'LOCAL',
        emailVerified: false,
      } 
    });
    
    // Enviar código de verificação
    await this.emailVerificationService.sendVerificationCode(email, user.id);
    
    // NÃO fazer login automático - exigir verificação de email primeiro
    res.status(201).json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      emailVerified: false,
      requiresVerification: true,
      message: 'Conta criada! Verifique seu email para ativar a conta. Enviamos um código de 6 dígitos.',
    });
  }

  @Post('login')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async login(@Body() body: any, @Res() res: Response) {
    const { email, password } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    
    // Verificar se usuário tem senha (pode ser OAuth)
    if (!user.password) {
      throw new UnauthorizedException('Esta conta usa login com Google. Use o botão "Entrar com Google".');
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');
    
    // Verificar se email está verificado
    if (!user.emailVerified) {
      // Enviar novo código de verificação
      await this.emailVerificationService.sendVerificationCode(email, user.id);
      throw new UnauthorizedException('Email não verificado. Enviamos um novo código de verificação para seu email.');
    }
    
    const token = this.jwtService.sign({ userId: user.id });
    res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      emailVerified: user.emailVerified,
      authProvider: user.authProvider,
      token 
    });
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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authProvider: true,
        emailVerified: true,
        pendingEmail: true,
        createdAt: true
      },
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

    const { name } = parsed.data;

    // Check if there's at least one field to update
    if (!name) {
      throw new BadRequestException('Nenhum campo para atualizar');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return updatedUser;
  }

  @Post('request-email-change')
  @UseGuards(JwtAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requestEmailChange(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('Não autenticado');

    const parsed = RequestEmailChangeSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message || 'Dados inválidos');
    }

    const { newEmail, password } = parsed.data;

    // Get current user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, authProvider: true, password: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // Check if new email is same as current
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      throw new BadRequestException('O novo email é igual ao atual');
    }

    // For LOCAL accounts, verify password
    if (user.authProvider === 'LOCAL') {
      if (!password) {
        throw new BadRequestException('Senha é obrigatória para confirmar a mudança de email');
      }

      if (!user.password) {
        throw new BadRequestException('Erro ao verificar senha');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new BadRequestException('Senha incorreta');
      }
    }

    // Check if new email is already in use
    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existing) {
      throw new BadRequestException('Este email já está em uso');
    }

    // Store pending email and send verification code
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: newEmail,
        emailVerified: false, // Mark as unverified until new email is confirmed
      },
    });

    // Send verification code to NEW email
    await this.emailVerificationService.sendVerificationCode(newEmail, userId);

    return {
      message: 'Código de verificação enviado para o novo email. Verifique para completar a mudança.',
      pendingEmail: newEmail,
    };
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

    // Verificar se usuário tem senha (pode ser OAuth)
    if (!user.password) {
      throw new BadRequestException('Esta conta usa login com Google e não possui senha para alterar.');
    }

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

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, email: true, authProvider: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // Para usuários OAuth, não exige senha
    if (user.authProvider === 'LOCAL') {
      // Validate password is provided
      if (!password || password.length < 6) {
        throw new BadRequestException('Senha é obrigatória para confirmar exclusão');
      }

      // Verify password
      if (!user.password) {
        throw new BadRequestException('Erro ao verificar senha');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new BadRequestException('Senha incorreta');
      }
    }

    try {
      // Delete in order: announcements -> guests -> events -> user
      // First, get all events owned by the user
      const userEvents = await this.prisma.event.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });

      const eventIds = userEvents.map((e: { id: string }) => e.id);

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

  // ============== Google OAuth ==============

  /**
   * GET /auth/google/config - Retorna configuração do Google OAuth
   */
  @Get('google/config')
  getGoogleConfig() {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || null,
      configured: this.googleAuthService.isConfigured(),
    };
  }

  /**
   * POST /auth/google - Login/Registro com Google
   */
  @Post('google')
  async googleAuth(@Body() body: { idToken: string }, @Res() res: Response) {
    const { idToken } = body;

    if (!idToken) {
      throw new BadRequestException('Token do Google é obrigatório');
    }

    // Verificar token com Google
    const googleUser = await this.googleAuthService.verifyIdToken(idToken);

    if (!googleUser) {
      throw new UnauthorizedException('Token do Google inválido');
    }

    // Verificar se usuário já existe
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.id },
          { email: googleUser.email },
        ],
      },
    });

    if (user) {
      // Atualizar googleId se necessário
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            authProvider: 'GOOGLE',
            emailVerified: true, // Google já verifica o email
          },
        });
      }
    } else {
      // Criar novo usuário
      user = await this.prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.id,
          authProvider: 'GOOGLE',
          emailVerified: true, // Google já verifica o email
          password: null, // Sem senha para OAuth
        },
      });
    }

    // Gerar JWT
    const token = this.jwtService.sign({ userId: user.id });
    res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax' });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      authProvider: user.authProvider,
      token,
    });
  }

  // ============== Email Verification ==============

  /**
   * POST /auth/send-verification - Envia código de verificação
   */
  @Post('send-verification')
  async sendVerification(@Body() body: { email: string }) {
    const { email } = body;

    if (!email) {
      throw new BadRequestException('Email é obrigatório');
    }

    // Verificar se email é válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Email inválido');
    }

    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      throw new BadRequestException('Este email já está cadastrado e verificado');
    }

    // Enviar código
    const result = await this.emailVerificationService.sendVerificationCode(
      email,
      existingUser?.id,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return { message: 'Código de verificação enviado para o email' };
  }

  /**
   * POST /auth/verify-email-and-login - Verifica código e faz login (para novos registros)
   */
  @Post('verify-email-and-login')
  async verifyEmailAndLogin(@Body() body: { email: string; code: string }, @Res() res: Response) {
    const { email, code } = body;

    if (!email || !code || code.length !== 6) {
      throw new BadRequestException('Email e código de verificação são obrigatórios');
    }

    // Buscar usuário pelo email
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Este email já está verificado. Faça login normalmente.');
    }

    // Verificar código
    const result = await this.emailVerificationService.verifyCode(user.id, code);

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    // Código válido - fazer login
    const token = this.jwtService.sign({ userId: user.id });
    res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax' });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: true,
      authProvider: user.authProvider,
      token,
      message: 'Email verificado com sucesso!',
    });
  }

  /**
   * POST /auth/verify-email - Verifica código de email (para usuário já logado)
   * Se houver pendingEmail, completa a mudança de email
   */
  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  async verifyEmail(@Body() body: { code: string }, @Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('Não autenticado');

    const { code } = body;

    if (!code || code.length !== 6) {
      throw new BadRequestException('Código de verificação inválido');
    }

    const result = await this.emailVerificationService.verifyCode(userId, code);

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    // Verificar se há mudança de email pendente
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pendingEmail: true, email: true },
    });

    if (user?.pendingEmail) {
      // Completar mudança de email
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          email: user.pendingEmail,
          pendingEmail: null,
          emailVerified: true,
        },
      });

      return {
        message: 'Email alterado e verificado com sucesso!',
        emailVerified: true,
        emailChanged: true,
      };
    }

    // Se não há pendingEmail, apenas marca como verificado
    return { message: result.message, emailVerified: true };
  }

  /**
   * POST /auth/cancel-email-change - Cancela mudança de email pendente
   */
  @Post('cancel-email-change')
  @UseGuards(JwtAuthGuard)
  async cancelEmailChange(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('Não autenticado');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pendingEmail: true, authProvider: true },
    });

    if (!user?.pendingEmail) {
      throw new BadRequestException('Não há mudança de email pendente');
    }

    // Reverter para estado verificado anterior (se era LOCAL já tinha email verificado)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: null,
        emailVerified: true, // Restaurar verificação do email original
      },
    });

    return { message: 'Mudança de email cancelada com sucesso' };
  }

  /**
   * POST /auth/resend-verification - Reenvia código de verificação
   */
  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerification(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('Não autenticado');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    if (user.emailVerified) {
      throw new BadRequestException('Email já verificado');
    }

    const result = await this.emailVerificationService.sendVerificationCode(
      user.email,
      userId,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return { message: 'Código reenviado com sucesso' };
  }

  /**
   * GET /auth/verification-status - Verifica status de verificação do email
   */
  @Get('verification-status')
  @UseGuards(JwtAuthGuard)
  async getVerificationStatus(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('Não autenticado');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, authProvider: true },
    });

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    return {
      emailVerified: user.emailVerified,
      authProvider: user.authProvider,
    };
  }

  // ============== Password Recovery ==============

  /**
   * POST /auth/forgot-password - Solicita recuperação de senha
   * Envia código de 6 dígitos para o email
   */
  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message || 'Dados inválidos');
    }

    const { email } = parsed.data;

    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, authProvider: true },
    });

    // Não revelar se o email existe ou não (segurança)
    if (!user) {
      return {
        message: 'Se o email existir, você receberá um código de recuperação.',
      };
    }

    // Verificar se é conta LOCAL (OAuth não tem senha)
    if (user.authProvider !== 'LOCAL') {
      return {
        message: 'Esta conta usa login com Google e não possui senha para recuperar.',
      };
    }

    // Enviar código de verificação
    const result = await this.emailVerificationService.sendVerificationCode(
      email,
      user.id,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return {
      message: 'Código de recuperação enviado para o email.',
    };
  }

  /**
   * POST /auth/verify-reset-code - Verifica se o código de reset é válido
   */
  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: any) {
    const parsed = VerifyResetCodeSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message || 'Dados inválidos');
    }

    const { email, code } = parsed.data;

    // Buscar usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    // Verificar código
    const result = await this.emailVerificationService.verifyCode(user.id, code);

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return {
      message: 'Código verificado com sucesso',
      valid: true,
    };
  }

  /**
   * POST /auth/reset-password - Define nova senha após verificação
   */
  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message || 'Dados inválidos');
    }

    const { email, code, newPassword } = parsed.data;

    // Buscar usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, authProvider: true },
    });

    if (!user) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    // Verificar se é conta LOCAL
    if (user.authProvider !== 'LOCAL') {
      throw new BadRequestException('Esta conta usa login com Google e não possui senha.');
    }

    // Verificar código
    const result = await this.emailVerificationService.verifyCode(user.id, code);

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    // Hash da nova senha
    const hash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    return {
      message: 'Senha alterada com sucesso! Você já pode fazer login.',
    };
  }
}
