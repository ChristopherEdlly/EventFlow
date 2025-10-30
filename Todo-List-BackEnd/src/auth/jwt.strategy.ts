import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['jwt'];
          this.logger.debug(`Token from cookies: ${token ? 'Found' : 'Not found'}`);
        }
        // Also check Authorization header as fallback
        if (!token && req.headers.authorization) {
          const parts = req.headers.authorization.split(' ');
          if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
            this.logger.debug('Token from Authorization header: Found');
          }
        }
        this.logger.debug(`Final token: ${token ? 'Present' : 'Missing'}`);
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'devsecret',
    });
  }

  async validate(payload: { userId: string }) {
    this.logger.debug(`Validating payload: ${JSON.stringify(payload)}`);
    const user = await this.authService.validateToken(payload);
    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }
    this.logger.debug(`User validated: ${user.email}`);
    return user;
  }
}
