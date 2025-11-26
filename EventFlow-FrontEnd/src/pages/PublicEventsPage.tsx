import React, { useState, useEffect } from 'react';
import { eventsService, type Event } from '../services/events';
import type { ApiError } from '../services/api';
import EmptyState from '../components/EmptyState';

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* ...existing code... */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

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
              <p className="text-neutral-600">Carregando eventos...</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'Nenhum evento encontrado' : 'Nenhum evento público disponível'}
            description={searchTerm ? 'Tente buscar com outros termos' : 'Aguarde novos eventos serem publicados'}
            icon={
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 hover:border-primary-300 group cursor-pointer"
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
