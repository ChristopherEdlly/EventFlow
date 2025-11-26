import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsArchiverService {
  private readonly logger = new Logger(EventsArchiverService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Serviço de arquivamento desativado: sistema de estados removido
  // Caso precise lógica futura, adapte para nova estrutura sem estados
  // Funções mantidas apenas para compatibilidade
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archivePastEvents() {
    this.logger.log('Serviço de arquivamento desativado: sistema de estados removido');
    // Nenhuma ação realizada
  }

  async triggerArchiver() {
    this.logger.log('Serviço de arquivamento desativado: sistema de estados removido');
    // Nenhuma ação realizada
  }
}
