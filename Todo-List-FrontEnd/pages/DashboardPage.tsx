import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { eventsService, type Event } from '../services/events';
import type { ApiError } from '../services/api';
import EventFormModal from '../components/EventFormModal';
import EditEventModal from '../components/EditEventModal';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import Dropdown, { type DropdownOption } from '../components/Dropdown';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';

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
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stateChangeEvent, setStateChangeEvent] = useState<{ event: Event; newState: string } | null>(null);
  const [isChangingState, setIsChangingState] = useState(false);

  useEffect(() => {
    loadEvents();
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
        state: stateChangeEvent.newState as any,
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

    return { total, upcoming, drafts, totalGuests };
  }, [events]);

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
        alert('Link copiado para a área de transferência!');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header with Glassmorphism */}
      <header className="bg-white/70 border-b border-neutral-200/50 sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-white/80 via-white/70 to-white/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 rounded-xl shadow-lg animate-float">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Event Manager</h1>
                <p className="text-xs text-neutral-500">Gerencie seus eventos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateToPublicEvents}
                className="hidden sm:flex px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300 items-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Públicos
              </button>

              <button
                onClick={onNavigateToMyInvites}
                className="hidden sm:flex px-4 py-2 text-neutral-700 hover:text-secondary-700 hover:bg-secondary-50 rounded-xl transition-all duration-300 items-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Convites
              </button>

              {onNavigateToHistory && (
                <button
                  onClick={onNavigateToHistory}
                  className="hidden sm:flex px-4 py-2 text-neutral-700 hover:text-info-700 hover:bg-info-50 rounded-xl transition-all duration-300 items-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Histórico
                </button>
              )}

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 hover:from-primary-700 hover:via-primary-600 hover:to-secondary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 active:scale-100 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
                <svg className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline relative z-10">Novo Evento</span>
              </button>

              {onNavigateToProfile && (
                <button
                  onClick={onNavigateToProfile}
                  className="px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300 flex items-center gap-2 group"
                  aria-label="Perfil"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-neutral-700 hover:text-error-700 hover:bg-error-50 rounded-xl transition-all duration-300 flex items-center gap-2 group"
                aria-label="Sair"
              >
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with modern background */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/30 to-secondary-100/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary-100/30 to-primary-100/30 rounded-full blur-3xl -z-10"></div>
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Seus Eventos</h2>
          <p className="text-neutral-600">Gerencie e organize todos os seus eventos em um só lugar</p>
        </div>

        {/* Statistics Cards */}
        {!isLoading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total de Eventos"
              value={stats.total}
              color="primary"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatCard
              title="Próximos Eventos"
              value={stats.upcoming}
              color="success"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            <StatCard
              title="Rascunhos"
              value={stats.drafts}
              color="warning"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            <StatCard
              title="Total de Convidados"
              value={stats.totalGuests}
              color="info"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Filters and Search */}
        {!isLoading && events.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
              <svg className="absolute left-3 top-3 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter by State */}
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as FilterState)}
              className="px-4 py-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            >
              <option value="ALL">Todos os Status</option>
              <option value="DRAFT">Rascunhos</option>
              <option value="PUBLISHED">Publicados</option>
              <option value="COMPLETED">Concluídos</option>
              <option value="CANCELLED">Cancelados</option>
              <option value="ARCHIVED">Arquivados</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            >
              <option value="date">Ordenar por Data</option>
              <option value="title">Ordenar por Título</option>
              <option value="guests">Ordenar por Convidados</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-white border border-neutral-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-neutral-600 hover:text-neutral-900'}`}
                aria-label="Visualização em grade"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-neutral-600 hover:text-neutral-900'}`}
                aria-label="Visualização em lista"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-error-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            <LoadingSkeleton variant={viewMode === 'grid' ? 'card' : 'list'} count={6} />
          </div>
        ) : filteredEvents.length === 0 ? (
          // Empty State
          <EmptyState
            title={searchTerm || filterState !== 'ALL' ? 'Nenhum evento encontrado' : 'Nenhum evento ainda'}
            description={searchTerm || filterState !== 'ALL' ? 'Tente ajustar os filtros ou busca' : 'Comece criando seu primeiro evento!'}
            action={{
              label: 'Criar Evento',
              onClick: () => setShowCreateModal(true),
            }}
            icon={
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        ) : (
          // Events Grid/List
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className={`relative bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-neutral-200/50 hover:border-primary-400/50 group backdrop-blur-sm ${viewMode === 'list' ? 'flex' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all duration-500 pointer-events-none"></div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                </div>
                <div className={`relative z-10 p-6 ${viewMode === 'list' ? 'flex-1 flex items-center justify-between' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors mb-1 group-hover:translate-x-1 duration-300">
                          {event.title}
                        </h3>
                        {new Date(event.date) < new Date() && event.state === 'PUBLISHED' && (
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Já ocorreu
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${getStateColor(event.state)} transform group-hover:scale-110 transition-transform duration-300`}>
                          {getStateLabel(event.state)}
                        </span>
                        <Dropdown
                          trigger={
                            <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          }
                          options={getEventActions(event)}
                        />
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2 group-hover:text-neutral-700 transition-colors">
                        {event.description}
                      </p>
                    )}

                    {/* Event meta with icons */}
                    <div className={`${viewMode === 'list' ? 'flex gap-6' : 'space-y-3'} mb-4`}>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 group/item hover:text-primary-600 transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 text-primary-600 group-hover/item:bg-primary-100 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="truncate font-medium">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                          {event.time && ` às ${event.time}`}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600 group/item hover:text-secondary-600 transition-colors">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-50 text-secondary-600 group-hover/item:bg-secondary-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="truncate font-medium">{event.location}</span>
                        </div>
                      )}

                      {event._count && event._count.guests > 0 && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600 group/item hover:text-info-600 transition-colors">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-info-50 text-info-600 group-hover/item:bg-info-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <span className="font-semibold">
                            {event._count.guests}
                          </span>
                          <span className="text-xs">
                            {event._count.guests === 1 ? 'convidado' : 'convidados'}
                          </span>
                        </div>
                      )}
                    </div>

                    {viewMode === 'grid' && (
                      <button
                        onClick={() => onViewEvent && onViewEvent(event.id)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group/button"
                      >
                        <span>Ver Detalhes</span>
                        <svg className="w-4 h-4 transform group-hover/button:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {viewMode === 'list' && (
                    <button
                      onClick={() => onViewEvent && onViewEvent(event.id)}
                      className="ml-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 group/button whitespace-nowrap"
                    >
                      <span>Ver Detalhes</span>
                      <svg className="w-4 h-4 transform group-hover/button:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <EventFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadEvents}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            setEditingEvent(null);
            loadEvents();
          }}
        />
      )}

      {/* Delete Event Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingEvent}
        title="Excluir Evento"
        message={`Tem certeza que deseja excluir o evento "${deletingEvent?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeletingEvent(null)}
      />

      {/* State Change Confirmation */}
      <ConfirmDialog
        isOpen={!!stateChangeEvent}
        title={
          stateChangeEvent?.newState === 'PUBLISHED' ? 'Publicar Evento' :
          stateChangeEvent?.newState === 'CANCELLED' ? 'Cancelar Evento' :
          stateChangeEvent?.newState === 'COMPLETED' ? 'Marcar como Concluído' :
          stateChangeEvent?.newState === 'ARCHIVED' ? 'Arquivar Evento' :
          'Alterar Estado'
        }
        message={
          stateChangeEvent?.newState === 'PUBLISHED' ? `Deseja publicar o evento "${stateChangeEvent?.event.title}"?` :
          stateChangeEvent?.newState === 'CANCELLED' ? `Tem certeza que deseja cancelar o evento "${stateChangeEvent?.event.title}"?` :
          stateChangeEvent?.newState === 'COMPLETED' ? `Deseja marcar o evento "${stateChangeEvent?.event.title}" como concluído?` :
          stateChangeEvent?.newState === 'ARCHIVED' ? `Deseja arquivar o evento "${stateChangeEvent?.event.title}"?` :
          'Deseja alterar o estado deste evento?'
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant={stateChangeEvent?.newState === 'CANCELLED' ? 'danger' : 'info'}
        isLoading={isChangingState}
        onConfirm={handleChangeState}
        onCancel={() => setStateChangeEvent(null)}
      />
    </div>
  );
}
