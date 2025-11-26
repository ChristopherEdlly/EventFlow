import React, { useState, useEffect } from 'react';
import { eventsService, type Event } from '../services/events';
import { api, type ApiError } from '../services/api';

interface HomePageProps {
  onViewEvent: (eventId: string) => void;
}

export default function HomePage({ onViewEvent }: HomePageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Organizador');
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load user profile
      try {
        const profile = await api.getProfile();
        setUserName(profile.name);
      } catch {}

      // Load upcoming events
      const allEvents = await eventsService.getMyEvents();
      const upcoming = allEvents
        .filter(e => new Date(e.date) > new Date() && e.state === 'PUBLISHED')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setEvents(upcoming);

      // Mock pending invites (you can replace with real data)
      setPendingInvites([
        { id: 1, name: 'Ana Clara', days: 2 },
        { id: 2, name: 'Pedro Henrique', days: 3 },
      ]);

      // Mock recent activity (you can replace with real data)
      setRecentActivity([
        { id: 1, user: 'João Silva', action: 'confirmou presença', event: 'Conferência Anual', time: 'Agora mesmo' },
        { id: 2, user: 'Mariana Costa', action: 'deixou um novo comentário', event: 'Workshop de Design', time: 'há 2 minutos' },
        { id: 3, user: 'Carlos Almeida', action: 'confirmou presença', event: 'Conferência Anual', time: 'há 11min' },
      ]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {userName}!</h1>
        <p className="text-gray-600 mt-1">Bem-vindo de volta ao EventFlow</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Eventos Ativos</p>
              <p className="text-3xl font-bold">{events.length}</p>
            </div>
            <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Convites Pendentes</p>
              <p className="text-3xl font-bold text-gray-900">{pendingInvites.length}</p>
            </div>
            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Atividades Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{recentActivity.length}</p>
            </div>
            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eventos Ativos e Próximos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Eventos Ativos e Próximos</h2>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Ver todos os eventos
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  Nenhum evento ativo no momento
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onViewEvent(event.id)}
                    className="relative bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg p-6 text-white cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
                  >
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    <div className="relative z-10">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-white/90 text-sm mb-4">
                        {new Date(event.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <div className="text-sm">
                        <span className="font-medium">Confirmados: {event._count?.guests || 0} de {event.capacity || 150}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewEvent(event.id);
                        }}
                        className="text-sm font-medium hover:underline"
                      >
                        Gerenciar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewEvent(event.id);
                        }}
                        className="text-sm font-medium hover:underline"
                      >
                        Ver Página →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.action} no evento{' '}
                      <span className="font-medium text-primary-700">{activity.event}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Convites Pendentes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Convites Pendentes</h3>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-700">
                        {invite.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invite.name}</p>
                      <p className="text-xs text-gray-500">Enviado há {invite.days} dias</p>
                    </div>
                  </div>
                  <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Reenviar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Atividade Recente Widget */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Atividade Recente</h3>
            <p className="text-xs text-gray-600 mb-4">Últimas atualizações dos seus eventos</p>

            <div className="space-y-3">
              {recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="text-xs">
                  <p className="text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-gray-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
