import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Guard para verificar se usuário não está banido
 * Pode ser usado em combinação com JwtAuthGuard
 */
@Injectable()
export class NotBannedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('Não autenticado');
    }

    // Buscar usuário e verificar ban
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isBanned: true,
        bannedUntil: true,
        banReason: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Se está banido, verificar se é permanente ou temporário
    if (user.isBanned) {
      // Ban temporário que já expirou
      if (user.bannedUntil && new Date() > new Date(user.bannedUntil)) {
        // Desbanir automaticamente
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            isBanned: false,
            bannedUntil: null,
            bannedAt: null,
            banReason: null,
          },
        });
        return true;
      }

      // Ban ainda ativo
      const message = user.bannedUntil
        ? `Conta suspensa até ${new Date(user.bannedUntil).toLocaleDateString('pt-BR')}. Motivo: ${user.banReason || 'Não especificado'}`
        : `Conta banida permanentemente. Motivo: ${user.banReason || 'Não especificado'}`;

      throw new ForbiddenException(message);
    }

    return true;
  }
}
