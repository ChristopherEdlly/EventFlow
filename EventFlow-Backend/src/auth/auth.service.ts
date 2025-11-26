import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return this.validateUser(payload.userId);
    } catch {
      return null;
    }
  }

  async validateToken(payload: { userId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true },
    });
    return user ? { userId: user.id, name: user.name, email: user.email } : null;
  }
}
