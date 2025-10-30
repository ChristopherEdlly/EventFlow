import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  controllers: [EventsController],
  providers: [PrismaService, JwtAuthGuard],
})
export class EventsModule {}
