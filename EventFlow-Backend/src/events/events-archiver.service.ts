import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsArchiverService {
  private readonly logger = new Logger(EventsArchiverService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs daily at midnight to archive events that have passed
   * Events are archived if:
   * 1. They are in PUBLISHED state
   * 2. Their date has passed
   * 3. They are at least 1 day old
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archivePastEvents() {
    this.logger.log('Running automatic event archiver...');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      // Find events that should be archived
      const eventsToArchive = await this.prisma.event.findMany({
        where: {
          state: 'PUBLISHED',
          date: {
            lt: yesterday,
          },
        },
        select: {
          id: true,
          title: true,
          date: true,
        },
      });

      if (eventsToArchive.length === 0) {
        this.logger.log('No events to archive');
        return;
      }

      // Archive events
      const result = await this.prisma.event.updateMany({
        where: {
          id: {
            in: eventsToArchive.map((e) => e.id),
          },
        },
        data: {
          state: 'COMPLETED',
        },
      });

      this.logger.log(
        `Successfully archived ${result.count} events: ${eventsToArchive.map((e) => e.title).join(', ')}`,
      );
    } catch (error) {
      this.logger.error('Error archiving events:', error);
    }
  }

  /**
   * Manually trigger the archiver (for testing purposes)
   */
  async triggerArchiver() {
    this.logger.log('Manually triggering event archiver...');
    await this.archivePastEvents();
  }
}
