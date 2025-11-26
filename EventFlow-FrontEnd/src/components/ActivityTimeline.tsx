import React from 'react';
import { type Event } from '../services/events';

interface Activity {
  id: string;
  type: 'created' | 'published' | 'updated' | 'cancelled' | 'completed' | 'guest_added';
  event: Event;
  timestamp: Date;
  description: string;
}

interface ActivityTimelineProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
}

export default function ActivityTimeline({ events, onEventClick }: ActivityTimelineProps) {
  // Gerar atividades baseadas nos eventos
  const activities: Activity[] = React.useMemo(() => {
    const acts: Activity[] = [];

    events.forEach(event => {
      // Atividade de criação (usando a data do evento como proxy)
      acts.push({
        id: `${event.id}-created`,
        type: 'created',
        event,
        timestamp: new Date(event.date),
        description: `Evento "${event.title}" criado`,
      });

      // Atividade baseada no estado
      if (event.state === 'PUBLISHED') {
        acts.push({
          id: `${event.id}-published`,
          type: 'published',
          event,
          timestamp: new Date(event.date),
          description: `Evento "${event.title}" publicado`,
        });
      } else if (event.state === 'CANCELLED') {
        acts.push({
          id: `${event.id}-cancelled`,
          type: 'cancelled',
          event,
          timestamp: new Date(event.date),
          description: `Evento "${event.title}" cancelado`,
        });
      } else if (event.state === 'COMPLETED') {
        acts.push({
          id: `${event.id}-completed`,
          type: 'completed',
          event,
          timestamp: new Date(event.date),
          description: `Evento "${event.title}" concluído`,
        });
      }

      // Atividade de convidados
      if (event._count?.guests && event._count.guests > 0) {
        acts.push({
          id: `${event.id}-guests`,
          type: 'guest_added',
          event,
          timestamp: new Date(event.date),
          description: `${event._count.guests} convidado${event._count.guests > 1 ? 's' : ''} em "${event.title}"`,
        });
      }
    });

    // Ordenar por data mais recente
    return acts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }, [events]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'published':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'updated':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'guest_added':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return {
          bg: 'bg-info-500',
          text: 'text-info-700',
          bgLight: 'bg-info-50',
        };
      case 'published':
        return {
          bg: 'bg-success-500',
          text: 'text-success-700',
          bgLight: 'bg-success-50',
        };
      case 'updated':
        return {
          bg: 'bg-warning-500',
          text: 'text-warning-700',
          bgLight: 'bg-warning-50',
        };
      case 'cancelled':
        return {
          bg: 'bg-error-500',
          text: 'text-error-700',
          bgLight: 'bg-error-50',
        };
      case 'completed':
        return {
          bg: 'bg-primary-500',
          text: 'text-primary-700',
          bgLight: 'bg-primary-50',
        };
      case 'guest_added':
        return {
          bg: 'bg-secondary-500',
          text: 'text-secondary-700',
          bgLight: 'bg-secondary-50',
        };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 30) {
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    } else if (days > 0) {
      return `há ${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
      return 'agora';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-4 sm:p-6">
      <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Atividade Recente
      </h3>

      {activities.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary-200 via-neutral-200 to-transparent"></div>

          {/* Lista de atividades */}
          <div className="space-y-6 relative">
            {activities.map((activity, index) => {
              const colors = getActivityColor(activity.type);
              return (
                <button
                  key={activity.id}
                  onClick={() => onEventClick(activity.event.id)}
                  className="w-full flex items-start gap-4 text-left group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Ícone */}
                  <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} text-white rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 z-10 relative`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className={`${colors.bgLight} rounded-lg p-4 border-2 border-transparent group-hover:border-${activity.type === 'created' ? 'info' : activity.type === 'published' ? 'success' : activity.type === 'cancelled' ? 'error' : 'primary'}-300 transition-all duration-300 group-hover:shadow-md`}>
                      <p className="font-medium text-neutral-900 mb-1 group-hover:text-primary-700 transition-colors">
                        {activity.description}
                      </p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
