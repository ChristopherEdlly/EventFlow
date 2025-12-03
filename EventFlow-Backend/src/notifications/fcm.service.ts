import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

interface FcmMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private initialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    // Verificar se as credenciais do Firebase estão configuradas
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        '⚠️ Firebase não configurado. Push notifications desabilitadas. ' +
        'Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no .env'
      );
      return;
    }

    try {
      // Evitar inicialização duplicada
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
      }
      this.initialized = true;
      this.logger.log('✅ Firebase Admin SDK inicializado');
    } catch (error) {
      this.logger.error(`❌ Erro ao inicializar Firebase: ${(error as Error).message}`);
    }
  }

  /**
   * Verifica se o Firebase está configurado
   */
  isConfigured(): boolean {
    return this.initialized;
  }

  /**
   * Envia push notification para um dispositivo
   */
  async sendToDevice(token: string, message: FcmMessage): Promise<boolean> {
    if (!this.initialized) {
      this.logger.debug('Firebase não configurado, pulando push notification');
      return false;
    }

    try {
      const response = await admin.messaging().send({
        token,
        notification: {
          title: message.title,
          body: message.body,
          imageUrl: message.imageUrl,
        },
        data: message.data,
        webpush: {
          fcmOptions: {
            link: message.data?.actionUrl || '/',
          },
          notification: {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [200, 100, 200],
          },
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#6366f1',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            },
          },
        },
      });

      this.logger.debug(`Push enviado com sucesso: ${response}`);
      return true;
    } catch (error) {
      const err = error as { code?: string; message?: string };
      this.logger.error(`Erro ao enviar push: ${err.message}`);
      
      // Se o token é inválido, retornar false para marcá-lo como inativo
      if (
        err.code === 'messaging/invalid-registration-token' ||
        err.code === 'messaging/registration-token-not-registered'
      ) {
        return false;
      }
      
      throw error;
    }
  }

  /**
   * Envia push notification para múltiplos dispositivos
   */
  async sendToMultiple(tokens: string[], message: FcmMessage): Promise<{ success: number; failure: number }> {
    if (!this.initialized) {
      this.logger.debug('Firebase não configurado, pulando push notifications');
      return { success: 0, failure: 0 };
    }

    if (tokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: message.title,
          body: message.body,
          imageUrl: message.imageUrl,
        },
        data: message.data,
        webpush: {
          fcmOptions: {
            link: message.data?.actionUrl || '/',
          },
          notification: {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          },
        },
      });

      this.logger.debug(`Push enviado: ${response.successCount} sucesso, ${response.failureCount} falhas`);
      
      return {
        success: response.successCount,
        failure: response.failureCount,
      };
    } catch (error) {
      this.logger.error(`Erro ao enviar push em lote: ${(error as Error).message}`);
      return { success: 0, failure: tokens.length };
    }
  }

  /**
   * Envia push para um tópico (todos inscritos)
   */
  async sendToTopic(topic: string, message: FcmMessage): Promise<boolean> {
    if (!this.initialized) {
      return false;
    }

    try {
      await admin.messaging().send({
        topic,
        notification: {
          title: message.title,
          body: message.body,
        },
        data: message.data,
      });
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar para tópico ${topic}: ${(error as Error).message}`);
      return false;
    }
  }
}
