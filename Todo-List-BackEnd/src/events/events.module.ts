import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsArchiverService } from './events-archiver.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  controllers: [EventsController],
  providers: [PrismaService, JwtAuthGuard, EventsArchiverService],
})
export class EventsModule {}
