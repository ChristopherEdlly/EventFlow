import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'devsecret';
    
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        
        if (req && req.cookies) {
          token = req.cookies['jwt'];
        }
        // Also check Authorization header as fallback
        if (!token && req.headers.authorization) {
          const parts = req.headers.authorization.split(' ');
          if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
          }
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { userId: string }) {
    const user = await this.authService.validateToken(payload);
    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }
    return user;
  }
}
