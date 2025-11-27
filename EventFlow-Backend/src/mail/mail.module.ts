import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const smtpHost = configService.get('SMTP_HOST');
        const smtpPort = configService.get('SMTP_PORT');
        const smtpUser = configService.get('SMTP_USER');
        const smtpPass = configService.get('SMTP_PASS');
        const smtpFrom = configService.get('SMTP_FROM', 'noreply@eventflow.com');

        // Se não houver configuração SMTP, usar modo de teste (ethereal.email)
        if (!smtpHost || !smtpUser) {
          console.warn('⚠️ SMTP não configurado. Usando modo de teste (emails não serão enviados de verdade)');

          return {
            transport: {
              host: 'smtp.ethereal.email',
              port: 587,
              secure: false,
              auth: {
                user: 'test@ethereal.email',
                pass: 'test123',
              },
            },
            defaults: {
              from: `"EventFlow" <${smtpFrom}>`,
            },
            template: {
              dir: join(__dirname, 'templates'),
              adapter: new HandlebarsAdapter(),
              options: {
                strict: true,
              },
            },
          };
        }

        // Configuração SMTP real
        return {
          transport: {
            host: smtpHost,
            port: parseInt(smtpPort, 10) || 587,
            secure: parseInt(smtpPort, 10) === 465, // true para porta 465, false para outras
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          },
          defaults: {
            from: `"EventFlow" <${smtpFrom}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
