import React, { useState, useEffect } from 'react';
import { eventsService, type Event, type Guest } from '../services/events';
import { api, type ApiError } from '../services/api';

interface EventDetailsPageProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetailsPage({ eventId, onBack }: EventDetailsPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [guestEmails, setGuestEmails] = useState('');
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setIsLoading(true);

      // Load user profile to check if they own the event
      try {
        const profile = await api.getProfile();
        setCurrentUserId(profile.id);
      } catch {
        // User might not be authenticated
        setCurrentUserId(null);
      }

      const eventData = await eventsService.getEvent(eventId);
      setEvent(eventData as Event);

      // Try to load guests if user has permission
      try {
        const guestsData = await eventsService.getEventGuests(eventId);
        setGuests(guestsData);
      } catch {
        // User might not have permission to see guests
        setGuests([]);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'DRAFT':
        return 'bg-neutral-100 text-neutral-700';
      case 'PUBLISHED':
        return 'bg-success-100 text-success-700';
      case 'CANCELLED':
        return 'bg-error-100 text-error-700';
      case 'COMPLETED':
        return 'bg-info-100 text-info-700';
      case 'ARCHIVED':
        return 'bg-neutral-200 text-neutral-600';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'DRAFT':
        return 'Rascunho';
      case 'PUBLISHED':
        return 'Publicado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'COMPLETED':
        return 'Concluído';
      case 'ARCHIVED':
        return 'Arquivado';
      default:
        return state;
    }
  };

  const handleSendInvites = async () => {
    if (!guestEmails.trim()) {
      setError('Por favor, insira pelo menos um email');
      return;
    }

    setIsSendingInvites(true);
    setError('');
    setInviteSuccess('');

    try {
      const emails = guestEmails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emails.length === 0) {
        setError('Nenhum email válido encontrado');
        return;
      }

      const result = await eventsService.addGuestsByEmail(eventId, emails);
      setInviteSuccess(result.message);
      setGuestEmails('');

      // Reload guests list
      try {
        const guestsData = await eventsService.getEventGuests(eventId);
        setGuests(guestsData);
      } catch {
        // User might not have permission to see guests
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess('');
      }, 2000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao enviar convites');
    } finally {
      setIsSendingInvites(false);
    }
  };

  const isOwner = event && currentUserId && event.ownerId === currentUserId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-neutral-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <header className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={onBack}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error-800">{error || 'Evento não encontrado'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={onBack}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-neutral-900">Detalhes do Evento</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-3xl font-bold text-neutral-900">{event.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(event.state)}`}>
                {getStateLabel(event.state)}
              </span>
            </div>

            {isOwner && (
              <div className="mb-6">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar Convidados
                </button>
              </div>
            )}

            {event.description && (
              <p className="text-neutral-700 text-lg mb-6">{event.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Data e Hora</p>
                  <p className="text-lg text-neutral-900">
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {event.time && <p className="text-lg text-neutral-900">{event.time}</p>}
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Local</p>
                    <p className="text-lg text-neutral-900">{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Visibilidade</p>
                  <p className="text-lg text-neutral-900">
                    {event.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
                  </p>
                </div>
              </div>

              {event.capacity && (
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Capacidade</p>
                    <p className="text-lg text-neutral-900">
                      {guests.filter(g => g.status === 'YES').length} / {event.capacity} confirmados
                    </p>
                  </div>
                </div>
              )}
            </div>

            {guests.length > 0 && (
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  Convidados ({guests.length})
                </h3>
                <div className="space-y-2">
                  {guests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">{guest.name}</p>
                        <p className="text-sm text-neutral-600">{guest.email}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          guest.status === 'YES'
                            ? 'bg-success-100 text-success-700'
                            : guest.status === 'NO'
                            ? 'bg-error-100 text-error-700'
                            : guest.status === 'MAYBE'
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {guest.status === 'YES'
                          ? 'Confirmado'
                          : guest.status === 'NO'
                          ? 'Recusou'
                          : guest.status === 'MAYBE'
                          ? 'Talvez'
                          : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Guests Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Adicionar Convidados
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-800">{error}</p>
              </div>
            )}

            {inviteSuccess && (
              <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-sm text-success-800">{inviteSuccess}</p>
              </div>
            )}

            <p className="text-neutral-600 mb-4">
              Digite os emails dos convidados separados por vírgula ou quebra de linha:
            </p>

            <textarea
              rows={6}
              value={guestEmails}
              onChange={(e) => setGuestEmails(e.target.value)}
              placeholder="exemplo1@email.com, exemplo2@email.com&#10;exemplo3@email.com"
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none mb-4"
              disabled={isSendingInvites}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setGuestEmails('');
                  setError('');
                  setInviteSuccess('');
                }}
                className="flex-1 py-3 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg transition-colors"
                disabled={isSendingInvites}
              >
                Cancelar
              </button>
              <button
                onClick={handleSendInvites}
                disabled={isSendingInvites}
                className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingInvites ? 'Enviando...' : 'Enviar Convites'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
