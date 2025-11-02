import React, { useState, useEffect } from 'react';
import { eventsService, type Event, type GuestStatus } from '../services/events';
import type { ApiError } from '../services/api';
import EmptyState from '../components/EmptyState';

interface MyInvitesPageProps {
  onBack: () => void;
  onViewEvent: (eventId: string) => void;
}

export default function MyInvitesPage({ onBack, onViewEvent }: MyInvitesPageProps) {
  const [invites, setInvites] = useState<Array<Event & { myGuestStatus?: GuestStatus; myGuestId?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setIsLoading(true);
      const events = await eventsService.getMyInvites();
      setInvites(events as Array<Event & { myGuestStatus?: GuestStatus; myGuestId?: string }>);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load invites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (eventId: string, status: GuestStatus, guestId?: string, _reason?: string) => {
    if (!guestId) {
      setError('ID do convite não encontrado');
      return;
    }

    setRespondingTo(eventId);
    try {
      await eventsService.updateGuestStatus(eventId, guestId, status);
      await loadInvites();
      if (status === 'NO') {
        setShowDeclineModal(false);
        setDeclineReason('');
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to respond to invite');
    } finally {
      setRespondingTo(null);
    }
  };

  const openDeclineModal = (eventId: string, guestId: string) => {
    setSelectedEventId(eventId);
    setSelectedGuestId(guestId);
    setShowDeclineModal(true);
  };

  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const handleDecline = () => {
    if (selectedEventId && selectedGuestId) {
      handleRespond(selectedEventId, 'NO', selectedGuestId, declineReason);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'YES':
        return 'bg-success-100 text-success-700';
      case 'NO':
        return 'bg-error-100 text-error-700';
      case 'MAYBE':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'YES':
        return 'Confirmado';
      case 'NO':
        return 'Recusado';
      case 'MAYBE':
        return 'Talvez';
      default:
        return 'Pendente';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-neutral-900">Meus Convites</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-neutral-600">Carregando convites...</p>
            </div>
          </div>
        ) : invites.length === 0 ? (
          <EmptyState
            title="Nenhum convite pendente"
            description="Quando você receber convites, eles aparecerão aqui"
            icon={
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-4">
            {invites.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-md border border-neutral-200 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {event.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.myGuestStatus)}`}>
                        {getStatusLabel(event.myGuestStatus)}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-neutral-600 text-sm mb-3">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                        {event.time && ` às ${event.time}`}
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2">
                    {/* Botão para ver detalhes do evento */}
                    <button
                      onClick={() => onViewEvent(event.id)}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalhes
                    </button>

                    {(!event.myGuestStatus || event.myGuestStatus === 'PENDING') && event.myGuestId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(event.id, 'YES', event.myGuestId)}
                          disabled={respondingTo === event.id}
                          className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Aceitar
                        </button>

                        <button
                          onClick={() => handleRespond(event.id, 'MAYBE', event.myGuestId)}
                          disabled={respondingTo === event.id}
                          className="px-4 py-2 bg-warning-600 hover:bg-warning-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          Talvez
                        </button>

                        <button
                          onClick={() => event.myGuestId && openDeclineModal(event.id, event.myGuestId)}
                          disabled={respondingTo === event.id}
                          className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Recusar
                        </button>
                      </div>
                    )}

                    {/* Botão para alterar resposta se já respondeu */}
                    {event.myGuestStatus && event.myGuestStatus !== 'PENDING' && event.myGuestId && (
                      <div className="flex gap-2">
                        {event.myGuestStatus !== 'YES' && (
                          <button
                            onClick={() => handleRespond(event.id, 'YES', event.myGuestId)}
                            disabled={respondingTo === event.id}
                            className="px-3 py-2 bg-success-600 hover:bg-success-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            Alterar para Sim
                          </button>
                        )}
                        {event.myGuestStatus !== 'MAYBE' && (
                          <button
                            onClick={() => handleRespond(event.id, 'MAYBE', event.myGuestId)}
                            disabled={respondingTo === event.id}
                            className="px-3 py-2 bg-warning-600 hover:bg-warning-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            Alterar para Talvez
                          </button>
                        )}
                        {event.myGuestStatus !== 'NO' && (
                          <button
                            onClick={() => event.myGuestId && openDeclineModal(event.id, event.myGuestId)}
                            disabled={respondingTo === event.id}
                            className="px-3 py-2 bg-error-600 hover:bg-error-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            Alterar para Não
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Recusar Convite
            </h3>

            <p className="text-neutral-600 mb-4">
              Gostaria de informar o motivo? (opcional)
            </p>

            <textarea
              rows={4}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Ex: Tenho outro compromisso neste dia..."
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                className="flex-1 py-3 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 py-3 px-4 bg-error-600 hover:bg-error-700 text-white font-medium rounded-lg transition-colors"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
