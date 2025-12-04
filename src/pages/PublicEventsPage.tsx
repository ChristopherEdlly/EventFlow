import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventsService, type Event } from '../services/events';
import type { ApiError } from '../services/api';
import GradientHeader from '../components/GradientHeader';
import { HeaderSkeleton, EventGridSkeleton } from '../components/Skeleton';
import EnhancedEmptyState from '../components/EnhancedEmptyState';

interface PublicEventsPageProps {
  onBack: () => void;
  onViewEvent: (eventId: string) => void;
}

export default function PublicEventsPage({ onBack, onViewEvent }: PublicEventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPublicEvents();
  }, []);

  const loadPublicEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsService.getEvents();
      // Backend already filters PUBLIC events, no need to filter again
      setEvents(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Eventos Públicos"
        subtitle="Descubra eventos públicos acontecendo na sua região"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        stats={[
          { value: events.length, label: 'Disponíveis' },
        ]}
      />

      {/* Barra de Busca */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <HeaderSkeleton />
          {/* Search skeleton */}
          <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
          <EventGridSkeleton count={6} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <EnhancedEmptyState
          variant="illustrated"
          illustration={searchTerm ? 'noResults' : 'noEvents'}
          title={searchTerm ? 'Nenhum evento encontrado' : 'Nenhum evento público disponível'}
          description={searchTerm ? 'Tente buscar com outros termos ou volte mais tarde' : 'Aguarde novos eventos serem publicados na plataforma'}
          size="lg"
          action={searchTerm ? {
            label: 'Limpar busca',
            onClick: () => setSearchTerm('')
          } : undefined}
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-primary-300 group cursor-pointer"
              onClick={() => onViewEvent(event.id)}
            >
              <div className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors mb-3">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {(() => {
                        const eventDate = new Date(event.date);
                        let dateObj;
                        if (event.time) {
                          const [hour, minute] = event.time.split(':');
                          dateObj = new Date(Date.UTC(
                            eventDate.getUTCFullYear(),
                            eventDate.getUTCMonth(),
                            eventDate.getUTCDate(),
                            Number(hour),
                            Number(minute)
                          ));
                        } else {
                          dateObj = new Date(Date.UTC(
                            eventDate.getUTCFullYear(),
                            eventDate.getUTCMonth(),
                            eventDate.getUTCDate()
                          ));
                        }
                        return dateObj.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        });
                      })()}
                      {event.time && ` às ${event.time}`}
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    )}

                    {event._count && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {event._count.guests} {event._count.guests === 1 ? 'confirmado' : 'confirmados'}
                        {event.capacity && ` de ${event.capacity}`}
                      </div>
                    )}
                  </div>

                  <button className="w-full py-2 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg">
                    Ver Detalhes
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )
      }
    </div>
  );
}
