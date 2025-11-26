import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { eventsService, type Event, type EventState, type GuestStatus } from '../services/events';
import type { ApiError } from '../services/api';
import EventFormModal from '../components/EventFormModal';
import EditEventModal from '../components/EditEventModal';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import Dropdown, { type DropdownOption } from '../components/Dropdown';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import EventCalendar from '../components/EventCalendar';
import CompactCalendar from '../components/CompactCalendar';
import ActivityTimeline from '../components/ActivityTimeline';
 // import QuickActions, { type QuickAction } from '../components/QuickActions';
 // import PendingInvites from '../components/PendingInvites';
 // import QuickShortcuts, { type Shortcut } from '../components/QuickShortcuts';

interface DashboardPageProps {
  onLogout: () => void;
  onNavigateToPublicEvents: () => void;
  onNavigateToMyInvites: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToHistory?: () => void;
  onViewEvent?: (eventId: string) => void;
}

type FilterState = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'ARCHIVED';
type SortBy = 'date' | 'title' | 'guests';

export default function DashboardPage({ onLogout, onNavigateToPublicEvents, onNavigateToMyInvites, onNavigateToProfile, onNavigateToHistory, onViewEvent }: DashboardPageProps) {
  // Adiciona estado para data pré-selecionada
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar' | 'dashboard'>('dashboard');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stateChangeEvent, setStateChangeEvent] = useState<{ event: Event; newState: EventState } | null>(null);
  const [isChangingState, setIsChangingState] = useState(false);
  const [invites, setInvites] = useState<Array<Event & { myGuestStatus?: GuestStatus; myGuestId?: string }>>([]);

  useEffect(() => {
    loadEvents();
    loadInvites();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsService.getMyEvents();
      setEvents(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvites = async () => {
    try {
      const data = await eventsService.getMyInvites();
      setInvites(data as Array<Event & { myGuestStatus?: GuestStatus; myGuestId?: string }>);
    } catch (err) {
      console.error('Failed to load invites:', err);
    }
  };

  const handleInviteRespond = async (eventId: string, status: GuestStatus, guestId: string) => {
    try {
      await eventsService.updateGuestStatus(eventId, guestId, status);
      await loadInvites();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to respond to invite');
    }
  };

  const handleLogout = () => {
    api.logout();
    onLogout();
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    setIsDeleting(true);
    setError('');

    try {
      await eventsService.deleteEvent(deletingEvent.id);
      setDeletingEvent(null);
      await loadEvents();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao deletar evento');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeState = async () => {
    if (!stateChangeEvent) return;

    setIsChangingState(true);
    setError('');

    try {
      await eventsService.updateEvent(stateChangeEvent.event.id, {
        state: stateChangeEvent.newState,
      });
      setStateChangeEvent(null);
      await loadEvents();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao alterar estado do evento');
    } finally {
      setIsChangingState(false);
    }
  };

  const handleDuplicateEvent = (event: Event) => {
    // Open the create modal with the event data pre-filled (except the date)
    setEditingEvent({ ...event, id: '', date: '', state: 'DRAFT' } as Event);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter(e => new Date(e.date) > new Date() && e.state === 'PUBLISHED').length;
    const drafts = events.filter(e => e.state === 'DRAFT').length;
    const totalGuests = events.reduce((sum, e) => sum + (e._count?.guests || 0), 0);
    const pendingInvites = invites.filter(i => !i.myGuestStatus || i.myGuestStatus === 'PENDING').length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const activitiesToday = events.filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    }).length;

    return { total, upcoming, drafts, totalGuests, pendingInvites, activitiesToday };
  }, [events, invites]);


  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by state
    if (filterState !== 'ALL') {
      filtered = filtered.filter(e => e.state === filterState);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term) ||
        e.location?.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'guests':
          return (b._count?.guests || 0) - (a._count?.guests || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, filterState, searchTerm, sortBy]);

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

  const getEventActions = (event: Event): DropdownOption[] => {
    const actions: DropdownOption[] = [
      {
        label: 'Ver Detalhes',
        value: 'view',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        onClick: () => onViewEvent && onViewEvent(event.id),
      },
      {
        label: 'Editar',
        value: 'edit',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        onClick: () => setEditingEvent(event),
      },
    ];

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
        onClick: () => setStateChangeEvent({ event, newState: 'PUBLISHED' }),
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
        onClick: () => setStateChangeEvent({ event, newState: 'CANCELLED' }),
      });

      actions.push({
        label: 'Marcar como Concluído',
        value: 'complete',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        onClick: () => setStateChangeEvent({ event, newState: 'COMPLETED' }),
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
        onClick: () => setStateChangeEvent({ event, newState: 'ARCHIVED' }),
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
        onClick: () => setStateChangeEvent({ event, newState: 'PUBLISHED' }),
      });
    }

    actions.push({
      label: 'Compartilhar',
      value: 'share',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      onClick: () => {
        const url = `${window.location.origin}/events/${event.id}`;
        navigator.clipboard.writeText(url);
        window.alert('Link copiado para a área de transferência!');
      },
    });

    actions.push({
      label: 'Duplicar',
      value: 'duplicate',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => handleDuplicateEvent(event),
    });

    actions.push({
      label: 'Excluir',
      value: 'delete',
      variant: 'danger',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: () => setDeletingEvent(event),
    });

    return actions;
  };

  // Função para abrir modal de criar evento com data pré-selecionada
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <main className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Calendário puro com botão de acessibilidade */}
        <div className="relative">
          <EventCalendar
            events={events}
            onEventClick={(id) => onViewEvent && onViewEvent(id)}
            onDayClick={handleDayClick}
          />
          {/* Botão flutuante de acessibilidade para criar evento */}
          <button
            className="fixed bottom-8 right-8 z-50 bg-primary-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl font-bold hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
            title="Criar novo evento"
            aria-label="Criar novo evento"
            onClick={() => setShowCreateModal(true)}
          >
            +
          </button>
        </div>
      </main>

      {/* Modal de criar evento com data pré-selecionada */}
      {showCreateModal && (
        <EventFormModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
          onSuccess={loadEvents}
          initialDate={selectedDate}
        />
      )}
      {/* ...modais de edição, exclusão e alteração de estado podem ser mantidos conforme necessário... */}
    </div>
  );
}
