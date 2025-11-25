import React, { useState, useEffect } from 'react';
import { eventsService, type Event, type Guest } from '../services/events';
import { api } from '../services/api';

interface EventDetailsPageProps {
  eventId: string;
  onBack: () => void;
}

type TabType = 'details' | 'guests' | 'announcements';

export default function EventDetailsPage({ eventId, onBack }: EventDetailsPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('details');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Check if user is owner
      try {
        const profile = await api.getProfile();
        const eventData = await eventsService.getEvent(eventId);
        setEvent(eventData as Event);
        setIsOwner(eventData.ownerId === profile.id);

        // Load guests and announcements in parallel
        const [guestsData, announcementsData] = await Promise.all([
          eventsService.getEventGuests(eventId),
          fetch(`/events/${eventId}/announcements`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }).then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        setGuests(guestsData);
        setAnnouncements(announcementsData);
      } catch (err) {
        console.error('Failed to load event:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'YES').length,
    pending: guests.filter(g => g.status === 'PENDING').length,
    declined: guests.filter(g => g.status === 'NO').length,
    confirmationRate: guests.length > 0
      ? Math.round((guests.filter(g => g.status === 'YES').length / guests.length) * 100)
      : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Evento não encontrado</p>
        <button onClick={onBack} className="mt-4 text-primary-600 hover:text-primary-700">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Cover Image */}
      <div className="relative h-64 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <button
            onClick={onBack}
            className="mb-4 text-white/90 hover:text-white flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
          <p className="text-white/90 text-lg">{event.description}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Capacidade</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">de {event.capacity || 200}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Taxa de Confirmação</div>
          <div className="text-3xl font-bold text-gray-900">{stats.confirmationRate}%</div>
          <div className="text-xs text-gray-500 mt-1">{stats.confirmed} confirmados</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Ações Rápidas</div>
          <div className="flex gap-2 mt-2">
            {isOwner && (
              <>
                <button className="flex-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-colors">
                  Editar Evento
                </button>
                <button className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Exportar Lista
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setCurrentTab('details')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              currentTab === 'details'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Detalhes do Evento
          </button>
          <button
            onClick={() => setCurrentTab('guests')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              currentTab === 'guests'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Convidados ({stats.total})
          </button>
          <button
            onClick={() => setCurrentTab('announcements')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              currentTab === 'announcements'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Anúncios
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Details Tab */}
          {currentTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Data e Hora</h3>
                  <p className="text-gray-900">
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Local</h3>
                  <p className="text-gray-900">{event.location || 'Não informado'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Organizador</h3>
                  <p className="text-gray-900">Você</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Visibilidade</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.visibility === 'PUBLIC'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {event.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
                  </span>
                </div>
              </div>

              {event.description && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Descrição</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Guests Tab */}
          {currentTab === 'guests' && (
            <div>
              {/* Guest Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-700">{stats.confirmed}</div>
                  <div className="text-xs text-emerald-600">Confirmados</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-700">{stats.pending}</div>
                  <div className="text-xs text-gray-600">Pendentes</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-700">{stats.declined}</div>
                  <div className="text-xs text-red-600">Recusados</div>
                </div>
              </div>

              {/* Response Chart */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Resumo de Respostas</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Simple circular progress */}
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="none"
                        stroke="currentColor"
                        className="text-primary-500"
                        strokeWidth="16"
                        strokeDasharray={`${stats.confirmationRate * 5.02} 502`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-gray-900">{stats.confirmed}</div>
                      <div className="text-sm text-gray-600">Confirmados</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest List */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Lista de Convidados</h3>
                {guests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum convidado ainda</p>
                ) : (
                  guests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{guest.name}</p>
                          <p className="text-sm text-gray-600">{guest.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        guest.status === 'YES' ? 'bg-emerald-100 text-emerald-700' :
                        guest.status === 'NO' ? 'bg-red-100 text-red-700' :
                        guest.status === 'MAYBE' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {guest.status === 'YES' ? 'Confirmado' :
                         guest.status === 'NO' ? 'Recusado' :
                         guest.status === 'MAYBE' ? 'Talvez' :
                         'Pendente'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {currentTab === 'announcements' && (
            <div>
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  <p className="text-gray-500 mb-4">Nenhum anúncio ainda</p>
                  {isOwner && (
                    <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors">
                      Criar Anúncio
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{announcement.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(announcement.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
