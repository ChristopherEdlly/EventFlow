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
          {filteredEvents.map((event, index) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            // Formatar data
            const formattedDate = (() => {
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
              return {
                day: dateObj.getUTCDate(),
                month: dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
                weekday: dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }),
                full: dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
              };
            })();
            
            // Calcular ocupação
            const guestCount = event._count?.guests || 0;
            const occupancyPercent = event.capacity ? Math.min((guestCount / event.capacity) * 100, 100) : 0;
            const isAlmostFull = event.capacity && occupancyPercent >= 80;
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden group cursor-pointer transition-all duration-300 ${
                  isPast 
                    ? 'opacity-60 border-gray-200' 
                    : 'border-gray-200 hover:border-primary-300 hover:shadow-xl'
                }`}
                onClick={() => onViewEvent(event.id)}
              >
                {/* Image Area - Header */}
                <div className="relative h-36 overflow-hidden">
                  {/* Imagem customizada ou gradiente padrão */}
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500" />
                      {/* Ícone central decorativo */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-3xl">📅</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Badges no topo */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    {/* Badge esquerdo - Contagem regressiva ou status */}
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 shadow-sm">
                      {isPast ? (
                        <>⏰ Encerrado</>
                      ) : daysUntil === 0 ? (
                        <span className="text-amber-600 font-bold">🔥 Hoje!</span>
                      ) : daysUntil === 1 ? (
                        <span className="text-primary-600 font-semibold">⏰ Amanhã!</span>
                      ) : daysUntil <= 7 ? (
                        <span className="text-primary-600">📆 Em {daysUntil} dias</span>
                      ) : (
                        <>📅 {formattedDate.full}</>
                      )}
                    </span>

                    {/* Badge direito - Público + Vagas */}
                    {isAlmostFull && !isPast ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">
                        🎟️ Últimas vagas!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white shadow-sm">
                        🌐 Público
                      </span>
                    )}
                  </div>

                  {/* Título sobre a imagem */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <h3 className="font-bold text-white text-lg leading-tight drop-shadow-md line-clamp-2">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 space-y-3">
                  {/* Data & Hora */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary-500">📅</span>
                    <span className="font-medium text-gray-700 capitalize">
                      {formattedDate.weekday}, {formattedDate.full}
                    </span>
                    {event.time && (
                      <span className="text-gray-400">• {event.time}</span>
                    )}
                  </div>

                  {/* Local */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-500 flex-shrink-0">📍</span>
                    <span className={`truncate max-w-[180px] ${event.location ? 'text-gray-700' : 'text-gray-400 italic'}`} title={event.location || undefined}>
                      {event.location || 'Local a definir'}
                    </span>
                  </div>

                  {/* Participantes & Vagas */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-500">👥</span>
                      <span className="text-gray-600">
                        {guestCount} {guestCount === 1 ? 'confirmado' : 'confirmados'}
                      </span>
                    </div>
                    {event.capacity && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        occupancyPercent >= 90 
                          ? 'bg-red-100 text-red-700' 
                          : occupancyPercent >= 70 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {event.capacity - guestCount > 0 
                          ? `${event.capacity - guestCount} vagas`
                          : 'Lotado'
                        }
                      </span>
                    )}
                  </div>

                  {/* Botão */}
                  <button 
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      isPast 
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isPast ? 'Ver Resumo' : 'Ver Evento'}
                    {!isPast && (
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )
      }
    </div>
  );
}
