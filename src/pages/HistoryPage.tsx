import React, { useState, useEffect, useMemo } from 'react';
import { eventsService, type Event } from '../services/events';
import type { ApiError } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

interface HistoryPageProps {
  onBack: () => void;
  onViewEvent?: (eventId: string) => void;
}

export default function HistoryPage({ onBack, onViewEvent }: HistoryPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'ALL' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsService.getMyEvents();
      // Filtrar apenas eventos concluídos ou arquivados
      const historicalEvents = data.filter(e => ['COMPLETED', 'CANCELLED'].includes(e.availability));
      setEvents(historicalEvents);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filtrar por disponibilidade
    if (filterAvailability !== 'ALL') {
      filtered = filtered.filter(e => e.availability === filterAvailability);
    }

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, filterAvailability, sortBy]);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'COMPLETED':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'PUBLISHED':
        return 'bg-primary-100 text-primary-700 border-primary-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      case 'PUBLISHED':
        return 'Publicado';
      default:
        return state;
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'COMPLETED':
        return (
          <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'CANCELLED':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'PUBLISHED':
        return (
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: events.length,
    completed: events.filter(e => e.availability === 'COMPLETED').length,
    cancelled: events.filter(e => e.availability === 'CANCELLED').length,
    published: events.filter(e => e.availability === 'PUBLISHED').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* ...existing code... */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
            <p className="text-error-700">{error}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-neutral-200 shadow-sm">
            <div className="text-sm text-neutral-500 font-medium">Total</div>
            <div className="text-3xl font-bold text-neutral-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-success-50 rounded-lg p-4 border border-success-200 shadow-sm">
            <div className="text-sm text-success-600 font-medium">Concluídos</div>
            <div className="text-3xl font-bold text-success-700 mt-1">{stats.completed}</div>
          </div>
          {/* Cancelados removido do sistema de disponibilidade */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm">
            <div className="text-sm text-red-600 font-medium">Cancelados</div>
            <div className="text-3xl font-bold text-red-700 mt-1">{stats.cancelled}</div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterAvailability('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterAvailability === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setFilterAvailability('PUBLISHED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterAvailability === 'PUBLISHED'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'
              }`}
            >
              Publicados ({stats.published})
            </button>
            <button
              onClick={() => setFilterAvailability('COMPLETED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterAvailability === 'COMPLETED'
                  ? 'bg-success-600 text-white'
                  : 'bg-success-50 text-success-700 hover:bg-success-100 border border-success-200'
              }`}
            >
              Concluídos ({stats.completed})
            </button>
            <button
              onClick={() => setFilterAvailability('CANCELLED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterAvailability === 'CANCELLED'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              Cancelados ({stats.cancelled})
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white sm:ml-auto"
          >
            <option value="date">Mais recentes primeiro</option>
            <option value="title">Ordenar por título</option>
          </select>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Nenhum evento no histórico"
            description={
              filterAvailability === 'ALL'
                ? 'Eventos publicados, concluídos ou arquivados aparecerão aqui'
                : `Nenhum evento ${getStateLabel(filterAvailability).toLowerCase()} encontrado`
            }
          />
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg border border-neutral-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStateIcon(event.availability)}
                        <h3 className="text-lg font-semibold text-neutral-900">{event.title}</h3>
                      </div>
                      {event.description && (
                        <p className="text-neutral-600 text-sm line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStateColor(event.availability)}`}>
                      {getStateLabel(event.availability)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(event.date)}</span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-neutral-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{event._count?.guests || 0} convidados</span>
                    </div>
                  </div>

                  {onViewEvent && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <button
                        onClick={() => onViewEvent(event.id)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-2"
                      >
                        Ver detalhes
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
