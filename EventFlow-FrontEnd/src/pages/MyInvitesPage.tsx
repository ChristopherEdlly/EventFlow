import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventsService, type Event, type GuestStatus } from '../services/events';
import type { ApiError } from '../services/api';
import GradientHeader from '../components/GradientHeader';
import { HeaderSkeleton, EventListSkeleton } from '../components/Skeleton';
import EnhancedEmptyState from '../components/EnhancedEmptyState';

interface MyInvitesPageProps {
  onBack: () => void;
  onViewEvent: (eventId: string) => void;
}

interface InviteEvent extends Event {
  myGuestStatus?: GuestStatus;
  myGuestId?: string;
}

type FilterType = 'all' | 'pending' | 'accepted' | 'declined';

export default function MyInvitesPage({ onBack, onViewEvent }: MyInvitesPageProps) {
  const [invites, setInvites] = useState<InviteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Modal states
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedInvite, setSelectedInvite] = useState<InviteEvent | null>(null);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setIsLoading(true);
      const events = await eventsService.getMyInvites();
      setInvites(events as InviteEvent[]);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar convites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (invite: InviteEvent, status: GuestStatus) => {
    if (!invite.myGuestId) {
      setError('ID do convite não encontrado');
      return;
    }

    setRespondingTo(invite.id);
    try {
      await eventsService.updateGuestStatus(invite.id, invite.myGuestId, status);
      await loadInvites();
      setShowDeclineModal(false);
      setDeclineReason('');
      setSelectedInvite(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao responder convite');
    } finally {
      setRespondingTo(null);
    }
  };

  const openDeclineModal = (invite: InviteEvent) => {
    setSelectedInvite(invite);
    setShowDeclineModal(true);
  };

  // Filtrar convites
  const filteredInvites = invites.filter(invite => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !invite.myGuestStatus || invite.myGuestStatus === 'PENDING';
    if (filter === 'accepted') return invite.myGuestStatus === 'YES';
    if (filter === 'declined') return invite.myGuestStatus === 'NO';
    return true;
  });

  // Estatísticas
  const stats = {
    total: invites.length,
    pending: invites.filter(i => !i.myGuestStatus || i.myGuestStatus === 'PENDING').length,
    accepted: invites.filter(i => i.myGuestStatus === 'YES').length,
    maybe: invites.filter(i => i.myGuestStatus === 'MAYBE').length,
    declined: invites.filter(i => i.myGuestStatus === 'NO').length,
  };

  const formatEventDate = (event: InviteEvent) => {
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
    return event.time ? `${dateStr} às ${event.time}` : dateStr;
  };

  const getStatusConfig = (status?: GuestStatus) => {
    switch (status) {
      case 'YES':
        return { label: 'Confirmado', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' };
      case 'NO':
        return { label: 'Recusado', bg: 'bg-red-100', text: 'text-red-700', icon: '✕' };
      case 'MAYBE':
        return { label: 'Talvez', bg: 'bg-amber-100', text: 'text-amber-700', icon: '?' };
      default:
        return { label: 'Pendente', bg: 'bg-blue-100', text: 'text-blue-700', icon: '⏳' };
    }
  };

  const isEventPast = (event: InviteEvent) => {
    const eventDate = new Date(event.date);
    return eventDate < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GradientHeader
        title="Meus Convites"
        subtitle="Convites recebidos para eventos privados"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        stats={stats.total > 0 ? [
          { value: stats.pending, label: 'Pendentes' },
          { value: stats.accepted, label: 'Aceitos' },
        ] : undefined}
      />

      {/* Erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-6">
          <HeaderSkeleton />
          {/* Filtros skeleton */}
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <EventListSkeleton count={4} />
        </div>
      ) : invites.length === 0 ? (
        /* Empty State */
        <EnhancedEmptyState
          variant="noInvites"
          title="Nenhum convite recebido"
          description="Quando você for convidado para eventos privados, eles aparecerão aqui. Fique de olho!"
          size="lg"
        />
      ) : (
        <>
          {/* Filtros */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap items-center gap-2"
          >
            {[
              { key: 'all', label: 'Todos', count: stats.total },
              { key: 'pending', label: 'Pendentes', count: stats.pending },
              { key: 'accepted', label: 'Aceitos', count: stats.accepted },
              { key: 'declined', label: 'Recusados', count: stats.declined },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as FilterType)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === key
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Lista de Convites */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4"
          >
            {filteredInvites.length === 0 ? (
              <EnhancedEmptyState
                variant="noResults"
                title="Nenhum convite encontrado"
                description={`Você não possui convites ${filter === 'pending' ? 'pendentes' : filter === 'accepted' ? 'aceitos' : 'recusados'}.`}
                size="sm"
              />
            ) : (
              filteredInvites.map((invite, index) => {
                const statusConfig = getStatusConfig(invite.myGuestStatus);
                const isPast = isEventPast(invite);
                const isPending = !invite.myGuestStatus || invite.myGuestStatus === 'PENDING';

                return (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                      isPast ? 'border-gray-200 opacity-75' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Info Principal */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {invite.title}
                              </h3>
                              {isPast && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  Passado
                                </span>
                              )}
                            </div>
                            {invite.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{invite.description}</p>
                            )}
                          </div>

                          {/* Status Badge */}
                          <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <span>{statusConfig.icon}</span>
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatEventDate(invite)}</span>
                          </div>

                          {invite.location && (
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate max-w-[200px]">{invite.location}</span>
                            </div>
                          )}

                          {invite._count?.guests !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{invite._count.guests} convidados</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex lg:flex-col items-center justify-end gap-2 p-4 lg:p-5 bg-gray-50 lg:bg-transparent lg:border-l border-t lg:border-t-0 border-gray-100">
                        {/* Ver Detalhes */}
                        <button
                          onClick={() => onViewEvent(invite.id)}
                          className="flex-1 lg:flex-none lg:w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Ver</span>
                        </button>

                        {/* Botões de Resposta - Apenas se pendente e não passou */}
                        {isPending && !isPast && (
                          <>
                            <button
                              onClick={() => handleRespond(invite, 'YES')}
                              disabled={respondingTo === invite.id}
                              className="flex-1 lg:flex-none lg:w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Aceitar</span>
                            </button>

                            <button
                              onClick={() => handleRespond(invite, 'MAYBE')}
                              disabled={respondingTo === invite.id}
                              className="flex-1 lg:flex-none lg:w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-medium rounded-xl transition-colors"
                            >
                              Talvez
                            </button>

                            <button
                              onClick={() => openDeclineModal(invite)}
                              disabled={respondingTo === invite.id}
                              className="flex-1 lg:flex-none lg:w-full px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Recusar</span>
                            </button>
                          </>
                        )}

                        {/* Alterar resposta - Se já respondeu e não passou */}
                        {!isPending && !isPast && invite.myGuestId && (
                          <div className="flex lg:flex-col gap-1 w-full">
                            <p className="hidden lg:block text-xs text-gray-500 mb-1 text-center">Alterar para:</p>
                            <div className="flex lg:flex-col gap-1 flex-1">
                              {invite.myGuestStatus !== 'YES' && (
                                <button
                                  onClick={() => handleRespond(invite, 'YES')}
                                  disabled={respondingTo === invite.id}
                                  className="flex-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-lg transition-colors"
                                >
                                  ✓ Sim
                                </button>
                              )}
                              {invite.myGuestStatus !== 'MAYBE' && (
                                <button
                                  onClick={() => handleRespond(invite, 'MAYBE')}
                                  disabled={respondingTo === invite.id}
                                  className="flex-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium rounded-lg transition-colors"
                                >
                                  ? Talvez
                                </button>
                              )}
                              {invite.myGuestStatus !== 'NO' && (
                                <button
                                  onClick={() => openDeclineModal(invite)}
                                  disabled={respondingTo === invite.id}
                                  className="flex-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors"
                                >
                                  ✕ Não
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </>
      )}

      {/* Modal de Recusa */}
      {showDeclineModal && selectedInvite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Recusar Convite</h3>
              <p className="text-sm text-gray-500 mt-1">
                Evento: {selectedInvite.title}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo (opcional)
              </label>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Ex: Tenho outro compromisso neste dia..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                O organizador poderá ver o motivo da sua recusa.
              </p>
            </div>

            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                  setSelectedInvite(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => selectedInvite && handleRespond(selectedInvite, 'NO')}
                disabled={respondingTo === selectedInvite?.id}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
              >
                {respondingTo === selectedInvite?.id ? 'Recusando...' : 'Confirmar Recusa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
