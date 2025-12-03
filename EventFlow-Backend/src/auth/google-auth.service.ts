import { Injectable, Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private client: OAuth2Client | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      this.logger.warn('⚠️ GOOGLE_CLIENT_ID não configurado. Login com Google desabilitado.');
      return;
    }

    this.client = new OAuth2Client(clientId);
    this.logger.log('✅ Google OAuth Client inicializado');
  }

  /**
   * Verifica se o Google OAuth está configurado
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Verifica um token ID do Google e retorna as informações do usuário
   * @param idToken - Token ID recebido do frontend após login com Google
   */
  async verifyIdToken(idToken: string): Promise<GoogleUserInfo | null> {
    if (!this.client) {
      this.logger.error('Google OAuth não está configurado');
      return null;
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        this.logger.error('Payload do token Google está vazio');
        return null;
      }

      return {
        id: payload.sub,
        email: payload.email || '',
        name: payload.name || payload.email?.split('@')[0] || 'Usuário',
        picture: payload.picture,
        emailVerified: payload.email_verified || false,
      };
    } catch (error) {
      this.logger.error(`Erro ao verificar token Google: ${(error as Error).message}`);
      return null;
    }
  }
}
