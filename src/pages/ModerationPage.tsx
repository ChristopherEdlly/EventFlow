import { useState, useEffect } from 'react';
import {
  moderationService,
  type Report,
  type ModerationStats,
  translateReportReason,
  translateReportStatus,
} from '../services/moderation';

export default function ModerationPage() {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, reportsData] = await Promise.all([
        moderationService.getStats(),
        moderationService.getPendingReports(),
      ]);
      setStats(statsData);
      setReports(reportsData);
      setError('');
    } catch (err) {
      console.error('Error loading moderation data:', err);
      setError('Erro ao carregar dados de moderação');
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(reportId: string, status: 'ACCEPTED' | 'REJECTED') {
    try {
      setProcessing(true);
      await moderationService.reviewReport(reportId, {
        status,
        reviewNotes: reviewNotes.trim() || undefined,
      });
      setSelectedReport(null);
      setReviewNotes('');
      loadData();
    } catch (err) {
      console.error('Error reviewing report:', err);
      alert('Erro ao revisar denúncia');
    } finally {
      setProcessing(false);
    }
  }

  async function handlePenalize(userId: string, type: 'WARNING' | 'SUSPENSION' | 'BAN') {
    const reason = prompt('Motivo da penalidade:');
    if (!reason) return;

    let duration: number | undefined;
    if (type === 'SUSPENSION') {
      const daysStr = prompt('Duração em dias:');
      if (!daysStr) return;
      duration = parseInt(daysStr);
      if (isNaN(duration) || duration < 1) {
        alert('Duração inválida');
        return;
      }
    }

    try {
      setProcessing(true);
      await moderationService.createPenalty({
        userId,
        type,
        reason,
        duration,
      });
      alert(`${type === 'WARNING' ? 'Advertência' : type === 'SUSPENSION' ? 'Suspensão' : 'Ban'} aplicado com sucesso`);
      loadData();
    } catch (err) {
      console.error('Error creating penalty:', err);
      alert('Erro ao aplicar penalidade');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Painel de Moderação</h1>
        <p className="text-gray-600 mt-1">Gerencie denúncias e penalidades</p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-700">{stats.pendingReports}</div>
            <div className="text-sm text-yellow-600">Denúncias Pendentes</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-700">{stats.totalReports}</div>
            <div className="text-sm text-blue-600">Total de Denúncias</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-700">{stats.bannedUsers}</div>
            <div className="text-sm text-red-600">Usuários Banidos</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-700">{stats.hiddenEvents}</div>
            <div className="text-sm text-orange-600">Eventos Ocultos</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-700">{stats.activePenalties}</div>
            <div className="text-sm text-purple-600">Penalidades Ativas</div>
          </div>
        </div>
      )}

      {/* Lista de Denúncias */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Denúncias Pendentes</h2>
        </div>
        <div className="divide-y">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma denúncia pendente
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{report.event?.title}</h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">Motivo:</span> {translateReportReason(report.reason)}
                          </p>
                          {report.details && (
                            <p className="text-gray-600">
                              <span className="font-medium">Detalhes:</span> {report.details}
                            </p>
                          )}
                          <p className="text-gray-600">
                            <span className="font-medium">Denunciado por:</span> {report.reporter?.name} ({report.reporter?.email})
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Organizador:</span> {report.event?.owner?.name} ({report.event?.owner?.email})
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(report.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 space-y-2">
                    {selectedReport?.id === report.id ? (
                      <div className="w-80 space-y-2">
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Notas de revisão (opcional)..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(report.id, 'ACCEPTED')}
                            disabled={processing}
                            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            Aceitar
                          </button>
                          <button
                            onClick={() => handleReview(report.id, 'REJECTED')}
                            disabled={processing}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            Rejeitar
                          </button>
                          <button
                            onClick={() => setSelectedReport(null)}
                            className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePenalize(report.event!.ownerId, 'WARNING')}
                            disabled={processing}
                            className="flex-1 px-3 py-1.5 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600"
                          >
                            Advertir
                          </button>
                          <button
                            onClick={() => handlePenalize(report.event!.ownerId, 'SUSPENSION')}
                            disabled={processing}
                            className="flex-1 px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600"
                          >
                            Suspender
                          </button>
                          <button
                            onClick={() => handlePenalize(report.event!.ownerId, 'BAN')}
                            disabled={processing}
                            className="flex-1 px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800"
                          >
                            Banir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Revisar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
