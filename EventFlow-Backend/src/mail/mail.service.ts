import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface EventInviteEmailData {
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventDescription?: string;
  organizerName: string;
  eventId: string;
  guestId: string;
}

export interface EventReminderEmailData {
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  organizerName: string;
  eventId: string;
  guestId: string;
  status: string;
}

export interface EventUpdateEmailData {
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  organizerName: string;
  changes: string;
}

export interface EventCancellationEmailData {
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  organizerName: string;
  reason?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Envia convite para o evento
   */
  async sendEventInvite(data: EventInviteEmailData): Promise<boolean> {
    try {
      const appUrl = this.configService.get('APP_URL', 'http://localhost:5173');
      const rsvpUrl = `${appUrl}/events/${data.eventId}`;

      await this.mailerService.sendMail({
        to: data.guestEmail,
        subject: `Você foi convidado para ${data.eventTitle}`,
        template: './invite', // Nome do template sem extensão
        context: {
          ...data,
          rsvpUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Convite enviado para ${data.guestEmail} - Evento: ${data.eventTitle}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar convite para ${data.guestEmail}:`, error);
      return false;
    }
  }

  /**
   * Envia lembrete do evento
   */
  async sendEventReminder(data: EventReminderEmailData): Promise<boolean> {
    try {
      const appUrl = this.configService.get('APP_URL', 'http://localhost:5173');
      const eventUrl = `${appUrl}/events/${data.eventId}`;

      let subject = `Lembrete: ${data.eventTitle}`;
      if (data.status === 'PENDING') {
        subject = `⏰ Confirme sua presença: ${data.eventTitle}`;
      }

      await this.mailerService.sendMail({
        to: data.guestEmail,
        subject,
        template: './reminder',
        context: {
          ...data,
          eventUrl,
          year: new Date().getFullYear(),
          isPending: data.status === 'PENDING',
        },
      });

      this.logger.log(`Lembrete enviado para ${data.guestEmail} - Evento: ${data.eventTitle}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar lembrete para ${data.guestEmail}:`, error);
      return false;
    }
  }

  /**
   * Envia notificação de atualização do evento
   */
  async sendEventUpdate(data: EventUpdateEmailData): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: data.guestEmail,
        subject: `Atualização: ${data.eventTitle}`,
        template: './update',
        context: {
          ...data,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Atualização enviada para ${data.guestEmail} - Evento: ${data.eventTitle}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar atualização para ${data.guestEmail}:`, error);
      return false;
    }
  }

  /**
   * Envia notificação de cancelamento do evento
   */
  async sendEventCancellation(data: EventCancellationEmailData): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: data.guestEmail,
        subject: `❌ Evento Cancelado: ${data.eventTitle}`,
        template: './cancellation',
        context: {
          ...data,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Cancelamento enviado para ${data.guestEmail} - Evento: ${data.eventTitle}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar cancelamento para ${data.guestEmail}:`, error);
      return false;
    }
  }

  /**
   * Envia lembretes em massa para múltiplos convidados
   */
  async sendBulkReminders(reminders: EventReminderEmailData[]): Promise<{
    sent: number;
    failed: number;
  }> {
    let sent = 0;
    let failed = 0;

    for (const reminder of reminders) {
      const success = await this.sendEventReminder(reminder);
      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Pequeno delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.log(`Lembretes em massa: ${sent} enviados, ${failed} falhas`);
    return { sent, failed };
  }

  /**
   * Teste de configuração de email
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      const adminEmail = this.configService.get('ADMIN_EMAIL', 'admin@eventflow.com');

      await this.mailerService.sendMail({
        to: adminEmail,
        subject: 'Teste de Configuração - EventFlow',
        html: `
          <h1>✅ Configuração de Email Funcionando!</h1>
          <p>Este é um email de teste do sistema EventFlow.</p>
          <p>Se você recebeu este email, a configuração está correta.</p>
          <p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
        `,
      });

      this.logger.log('Email de teste enviado com sucesso!');
      return true;
    } catch (error) {
      this.logger.error('Erro no teste de email:', error);
      return false;
    }
  }
}
