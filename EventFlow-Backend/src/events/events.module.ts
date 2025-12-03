import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsArchiverService } from './events-archiver.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MailModule, NotificationsModule],
  controllers: [EventsController],
  providers: [PrismaService, JwtAuthGuard, EventsArchiverService],
})
export class EventsModule {}
