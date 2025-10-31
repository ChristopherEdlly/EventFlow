import React, { useState, useEffect } from 'react';
import { eventsService, type Event, type Guest } from '../services/events';
import { api, type ApiError } from '../services/api';
import EditEventModal from '../components/EditEventModal';
import AnnouncementSection from '../components/AnnouncementSection';
import GuestList from '../components/GuestList';
import ConfirmDialog from '../components/ConfirmDialog';
import Dropdown, { type DropdownOption } from '../components/Dropdown';
import { downloadICalFile, getGoogleCalendarUrl, getOutlookCalendarUrl, getYahooCalendarUrl } from '../utils/calendar';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stateChangeDialog, setStateChangeDialog] = useState<{ newState: string } | null>(null);
  const [isChangingState, setIsChangingState] = useState(false);

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

  const handleDeleteEvent = async () => {
    if (!event) return;

    setIsDeleting(true);
    setError('');

    try {
      await eventsService.deleteEvent(event.id);
      // Navigate back after successful deletion
      onBack();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao deletar evento');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleChangeState = async () => {
    if (!event || !stateChangeDialog) return;

    setIsChangingState(true);
    setError('');

    try {
      await eventsService.updateEvent(event.id, {
        state: stateChangeDialog.newState as any,
      });
      setStateChangeDialog(null);
      await loadEventDetails();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao alterar estado do evento');
    } finally {
      setIsChangingState(false);
    }
  };

  const isOwner = event && currentUserId && event.ownerId === currentUserId;

  const handleExportGuests = () => {
    const csv = [
      ['Nome', 'Email', 'Status', 'Data do Convite'].join(','),
      ...guests.map(g => [
        g.name,
        g.email,
        g.status === 'YES' ? 'Confirmado' : g.status === 'NO' ? 'Recusou' : g.status === 'MAYBE' ? 'Talvez' : 'Pendente',
        new Date(g.createdAt).toLocaleString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `convidados_${event?.title.replace(/\s+/g, '_')}.csv`);
    link.click();
  };

  const getEventActions = (): DropdownOption[] => {
    if (!event) return [];

    const actions: DropdownOption[] = [];

    // State change options based on current state
    if (event.state === 'DRAFT') {
      actions.push({
        label: 'Publicar',
        value: 'publish',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        onClick: () => setStateChangeDialog({ newState: 'PUBLISHED' }),
      });
    }

    if (event.state === 'PUBLISHED') {
      actions.push({
        label: 'Cancelar Evento',
        value: 'cancel',
        variant: 'danger',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        onClick: () => setStateChangeDialog({ newState: 'CANCELLED' }),
      });

      actions.push({
        label: 'Marcar como Concluído',
        value: 'complete',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        onClick: () => setStateChangeDialog({ newState: 'COMPLETED' }),
      });
    }

    if (event.state === 'COMPLETED' || event.state === 'CANCELLED') {
      actions.push({
        label: 'Arquivar',
        value: 'archive',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        onClick: () => setStateChangeDialog({ newState: 'ARCHIVED' }),
      });
    }

    if (event.state === 'ARCHIVED') {
      actions.push({
        label: 'Restaurar',
        value: 'restore',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        onClick: () => setStateChangeDialog({ newState: 'PUBLISHED' }),
      });
    }

    actions.push({
      label: 'Excluir Evento',
      value: 'delete',
      variant: 'danger',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: () => setShowDeleteDialog(true),
    });

    return actions;
  };

  const getCalendarOptions = (): DropdownOption[] => {
    if (!event) return [];

    return [
      {
        label: 'Google Calendar',
        value: 'google',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018 0-3.878 3.132-7.018 7-7.018 1.89 0 3.47.697 4.682 1.829l-1.974 1.978c-.447-.415-1.253-.906-2.708-.906-2.31 0-4.187 1.895-4.187 4.217s1.877 4.217 4.187 4.217c2.654 0 3.64-1.915 3.796-2.905h-3.796v-2.52h6.418c.059.333.105.638.105 1.132 0 3.654-2.458 6.249-6.523 6.249z"/>
          </svg>
        ),
        onClick: () => window.open(getGoogleCalendarUrl(event), '_blank'),
      },
      {
        label: 'Outlook',
        value: 'outlook',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.59q0-.48.33-.8.33-.32.8-.32h14.45q.46 0 .8.33.33.32.33.8zm-17.88 0q0-.6.21-1.13.2-.53.58-.93.37-.4.86-.65.48-.24 1.04-.24.53 0 1 .24.48.26.85.65.37.4.57.93.2.53.2 1.13t-.2 1.12q-.2.54-.57.93-.37.4-.85.65-.47.24-1 .24-.56 0-1.04-.24-.49-.25-.86-.65-.38-.39-.58-.93-.21-.52-.21-1.12zM21 2.59v3.54h1.12q.35 0 .59-.25.25-.24.25-.59t-.25-.59q-.24-.25-.59-.25h-1.71zm5.52 14H22v2.42h4.52q0-.25-.25-.41z"/>
          </svg>
        ),
        onClick: () => window.open(getOutlookCalendarUrl(event), '_blank'),
      },
      {
        label: 'Yahoo Calendar',
        value: 'yahoo',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.354 0h5.87l-7.265 11.905v6.378H7.203v-6.378L0 0h5.932l4.092 7.185z"/>
          </svg>
        ),
        onClick: () => window.open(getYahooCalendarUrl(event), '_blank'),
      },
      {
        label: 'Baixar .ics',
        value: 'download',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        onClick: () => downloadICalFile(event),
      },
    ];
  };

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
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-neutral-900">{event.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(event.state)}`}>
                  {getStateLabel(event.state)}
                </span>
                {isOwner && (
                  <Dropdown
                    trigger={
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    }
                    options={getEventActions()}
                  />
                )}
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              {isOwner && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Evento
                  </button>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Convidados
                  </button>
                </>
              )}
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 px-4 py-2 bg-info-600 hover:bg-info-700 text-white font-medium rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Adicionar à Agenda
                  </button>
                }
                options={getCalendarOptions()}
              />
            </div>

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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neutral-900">
                    Convites Enviados ({guests.length})
                  </h3>
                  {isOwner && (
                    <button
                      onClick={handleExportGuests}
                      className="flex items-center gap-2 px-4 py-2 text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Exportar CSV
                    </button>
                  )}
                </div>

                {/* Guest List Component */}
                <GuestList
                  guests={guests}
                  eventId={eventId}
                  isOwner={!!isOwner}
                  onGuestsChanged={loadEventDetails}
                  eventTitle={event?.title}
                />
              </div>
            )}

            {/* Announcements Section */}
            <AnnouncementSection eventId={eventId} isOwner={!!isOwner} />
          </div>
        </div>
      </main>

      {/* Edit Event Modal */}
      {showEditModal && event && (
        <EditEventModal
          event={event}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            loadEventDetails();
          }}
        />
      )}

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
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none mb-4"
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

      {/* Delete Event Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Excluir Evento"
        message={`Tem certeza que deseja excluir o evento "${event?.title}"? Esta ação não pode ser desfeita e todos os convidados serão removidos.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* State Change Confirmation */}
      <ConfirmDialog
        isOpen={!!stateChangeDialog}
        title={
          stateChangeDialog?.newState === 'PUBLISHED' ? 'Publicar Evento' :
          stateChangeDialog?.newState === 'CANCELLED' ? 'Cancelar Evento' :
          stateChangeDialog?.newState === 'COMPLETED' ? 'Marcar como Concluído' :
          stateChangeDialog?.newState === 'ARCHIVED' ? 'Arquivar Evento' :
          'Alterar Estado'
        }
        message={
          stateChangeDialog?.newState === 'PUBLISHED' ? `Deseja publicar o evento "${event?.title}"?` :
          stateChangeDialog?.newState === 'CANCELLED' ? `Tem certeza que deseja cancelar o evento "${event?.title}"? Os convidados serão notificados.` :
          stateChangeDialog?.newState === 'COMPLETED' ? `Deseja marcar o evento "${event?.title}" como concluído?` :
          stateChangeDialog?.newState === 'ARCHIVED' ? `Deseja arquivar o evento "${event?.title}"? Ele ficará oculto da lista principal.` :
          'Deseja alterar o estado deste evento?'
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant={stateChangeDialog?.newState === 'CANCELLED' ? 'danger' : 'info'}
        isLoading={isChangingState}
        onConfirm={handleChangeState}
        onCancel={() => setStateChangeDialog(null)}
      />
    </div>
  );
}
