/**
 * Moderation Service
 * API calls for reports, penalties, and moderation
 */

import { api } from './api';

export type ReportReason =
  | 'SPAM'
  | 'INAPPROPRIATE'
  | 'FRAUD'
  | 'SCAM'
  | 'MISLEADING'
  | 'HARASSMENT'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

export type PenaltyType = 'WARNING' | 'SUSPENSION' | 'BAN';

export interface Report {
  id: string;
  eventId: string;
  reportedBy: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    description: string | null;
    isHidden: boolean;
    reportCount: number;
    ownerId: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Penalty {
  id: string;
  userId: string;
  type: PenaltyType;
  reason: string;
  details: string | null;
  duration: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface BannedUser {
  id: string;
  name: string;
  email: string;
  isBanned: boolean;
  bannedAt: string | null;
  bannedUntil: string | null;
  banReason: string | null;
  penalties: Penalty[];
}

export interface ModerationStats {
  pendingReports: number;
  totalReports: number;
  bannedUsers: number;
  hiddenEvents: number;
  activePenalties: number;
}

export interface CreateReportDto {
  eventId: string;
  reason: ReportReason;
  details?: string;
}

export interface ReviewReportDto {
  status: 'ACCEPTED' | 'REJECTED';
  reviewNotes?: string;
}

export interface CreatePenaltyDto {
  userId: string;
  type: PenaltyType;
  reason: string;
  details?: string;
  duration?: number; // dias para SUSPENSION
}

class ModerationService {
  // ============== DENÚNCIAS (USUÁRIOS) ==============

  /**
   * Criar uma denúncia de evento
   */
  async createReport(data: CreateReportDto): Promise<{ message: string; report: Report; autoHidden: boolean }> {
    return api.post<{ message: string; report: Report; autoHidden: boolean }>('/moderation/reports', data);
  }

  /**
   * Listar minhas denúncias
   */
  async getMyReports(): Promise<Report[]> {
    return api.get<Report[]>('/moderation/reports/my');
  }

  // ============== MODERAÇÃO (ADMIN) ==============

  /**
   * Listar denúncias pendentes (Admin)
   */
  async getPendingReports(): Promise<Report[]> {
    return api.get<Report[]>('/moderation/reports/pending');
  }

  /**
   * Listar todas as denúncias (Admin)
   */
  async getAllReports(): Promise<Report[]> {
    return api.get<Report[]>('/moderation/reports/all');
  }

  /**
   * Revisar uma denúncia (Admin)
   */
  async reviewReport(reportId: string, data: ReviewReportDto): Promise<Report> {
    return api.patch<Report>(`/moderation/reports/${reportId}/review`, data);
  }

  /**
   * Aplicar penalidade a um usuário (Admin)
   */
  async createPenalty(data: CreatePenaltyDto): Promise<Penalty> {
    return api.post<Penalty>('/moderation/penalties', data);
  }

  /**
   * Listar penalidades de um usuário (Admin)
   */
  async getUserPenalties(userId: string): Promise<Penalty[]> {
    return api.get<Penalty[]>(`/moderation/penalties/user/${userId}`);
  }

  /**
   * Listar usuários banidos (Admin)
   */
  async getBannedUsers(): Promise<BannedUser[]> {
    return api.get<BannedUser[]>('/moderation/banned-users');
  }

  /**
   * Desbanir um usuário (Admin)
   */
  async unbanUser(userId: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/moderation/unban/${userId}`, {});
  }

  /**
   * Obter estatísticas de moderação (Admin)
   */
  async getStats(): Promise<ModerationStats> {
    return api.get<ModerationStats>('/moderation/stats');
  }
}

export const moderationService = new ModerationService();

// Helper functions para tradução
export function translateReportReason(reason: ReportReason): string {
  const translations: Record<ReportReason, string> = {
    SPAM: 'Spam',
    INAPPROPRIATE: 'Conteúdo Inadequado',
    FRAUD: 'Fraude',
    SCAM: 'Golpe',
    MISLEADING: 'Enganoso',
    HARASSMENT: 'Assédio',
    OTHER: 'Outro',
  };
  return translations[reason] || reason;
}

export function translateReportStatus(status: ReportStatus): string {
  const translations: Record<ReportStatus, string> = {
    PENDING: 'Pendente',
    REVIEWED: 'Revisada',
    ACCEPTED: 'Aceita',
    REJECTED: 'Rejeitada',
  };
  return translations[status] || status;
}

export function translatePenaltyType(type: PenaltyType): string {
  const translations: Record<PenaltyType, string> = {
    WARNING: 'Advertência',
    SUSPENSION: 'Suspensão',
    BAN: 'Ban Permanente',
  };
  return translations[type] || type;
}
