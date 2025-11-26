import React, { useState, useEffect } from 'react';
import { eventsService, type Event, type Guest } from '../services/events';
import { api } from '../services/api';
import EditEventModal from '../components/EditEventModal';

interface EventDetailsPageProps {
  eventId: string;
  onBack: () => void;
}

type TabType = 'guests' | 'announcements';

export default function EventDetailsPage({ eventId, onBack }: EventDetailsPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('guests');
  const [isOwner, setIsOwner] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [currentUserGuest, setCurrentUserGuest] = useState<Guest | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Check if user is owner
      try {
        const profile = await api.getProfile();
        setCurrentUserEmail(profile.email);

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

        // Check if current user is already a guest
        const userGuest = guestsData.find(g => g.email === profile.email);
        setCurrentUserGuest(userGuest || null);
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
    maybe: guests.filter(g => g.status === 'MAYBE').length,
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
      {/* Header redesenhado com melhor visual */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-3xl overflow-hidden mb-8 shadow-xl">
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative px-8 py-6">
          {/* Botão Voltar */}
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-200 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Voltar</span>
          </button>

          {/* Título e Status */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight break-words">{event.title}</h1>
              {event.description && (
                <p className="text-lg text-white/90 leading-relaxed break-words max-w-3xl">{event.description}</p>
              )}
            </div>

            {/* Badges de Status */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-md backdrop-blur-sm ${event.visibility === 'PUBLIC'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-500/90 text-white'
                }`}>
                {event.visibility === 'PUBLIC' ? '🌐 Público' : '🔒 Privado'}
              </span>
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-md backdrop-blur-sm ${event.availability === 'PUBLISHED' ? 'bg-emerald-500/90 text-white' :
                  event.availability === 'CANCELLED' ? 'bg-red-500/90 text-white' :
                    event.availability === 'COMPLETED' ? 'bg-gray-500/90 text-white' :
                      'bg-gray-400/90 text-white'
                }`}>
                {event.availability === 'PUBLISHED' ? '✓ Publicado' :
                  event.availability === 'CANCELLED' ? '✕ Cancelado' :
                    event.availability === 'COMPLETED' ? '✓ Concluído' :
                      'Indefinido'}
              </span>
            </div>
          </div>

          {/* Info Cards - Data, Local, Participantes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Data e Hora */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Data e Hora</p>
                  <p className="text-white font-semibold mt-1 truncate">
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  {event.time && <p className="text-white/90 text-sm">{event.time}</p>}
                </div>
              </div>
            </div>

            {/* Local */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Local</p>
                  <p className="text-white font-semibold mt-1 truncate" title={event.location || undefined}>
                    {event.location || 'A definir'}
                  </p>
                </div>
              </div>
            </div>

            {/* Participantes */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Participantes</p>
                  <p className="text-white font-semibold mt-1">
                    {guests.filter(g => g.status === 'YES').length}
                    {event.capacity && <span className="text-white/70"> / {event.capacity}</span>}
                  </p>
                  {!event.capacity && <p className="text-white/70 text-sm">confirmados</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Stats Cards e ações: só para o dono */}
      {isOwner && (
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
            <div className="space-y-2 mt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Editar Evento
                </button>
                <button
                  onClick={() => alert('Funcionalidade de exportação em desenvolvimento. Em breve você poderá exportar a lista de convidados em CSV ou PDF.')}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Exportar Lista
                </button>
              </div>

              {/* Status Change */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Mudar Status</label>
                <select
                  value={event.availability}
                  onChange={async (e) => {
                    const newAvailability = e.target.value as 'CANCELLED';
                    if (newAvailability === 'CANCELLED') {
                      try {
                        await eventsService.updateEvent(eventId, { availability: newAvailability });
                        await loadData();
                      } catch (err) {
                        alert('Erro ao cancelar evento');
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="CANCELLED">✕ Cancelar Evento</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão de inscrição/status para não-dono */}
      {!isOwner && event.visibility === 'PUBLIC' && event.availability === 'PUBLISHED' && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6 shadow-md">
          {currentUserGuest ? (
            // Usuário já está inscrito - mostrar status
            <div className="text-center">
              <div className="mb-3">
                <span className="text-sm text-gray-600">Seu Status: </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentUserGuest.status === 'YES' ? 'bg-emerald-100 text-emerald-700' :
                    currentUserGuest.status === 'NO' ? 'bg-red-100 text-red-700' :
                      currentUserGuest.status === 'MAYBE' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                  }`}>
                  {currentUserGuest.status === 'YES' ? 'Confirmado' :
                    currentUserGuest.status === 'NO' ? 'Recusado' :
                      currentUserGuest.status === 'MAYBE' ? 'Talvez' :
                        'Pendente'}
                </span>
              </div>

              {/* Botões para alterar status */}
              <div className="flex gap-2 justify-center flex-wrap">
                {currentUserGuest.status !== 'YES' && (
                  <button
                    onClick={async () => {
                      try {
                        await eventsService.updateGuestStatus(eventId, currentUserGuest.id, 'YES');
                        await loadData();
                      } catch (err: any) {
                        setRegisterError(err?.message || 'Erro ao atualizar status');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                  >
                    Confirmar Presença
                  </button>
                )}

                {currentUserGuest.status !== 'MAYBE' && (
                  <button
                    onClick={async () => {
                      try {
                        await eventsService.updateGuestStatus(eventId, currentUserGuest.id, 'MAYBE');
                        await loadData();
                      } catch (err: any) {
                        setRegisterError(err?.message || 'Erro ao atualizar status');
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition"
                  >
                    Talvez
                  </button>
                )}

                {currentUserGuest.status !== 'NO' && (
                  <button
                    onClick={async () => {
                      try {
                        await eventsService.updateGuestStatus(eventId, currentUserGuest.id, 'NO');
                        await loadData();
                      } catch (err: any) {
                        setRegisterError(err?.message || 'Erro ao atualizar status');
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                  >
                    Recusar
                  </button>
                )}
              </div>

              {registerError && <p className="mt-3 text-error-600 text-sm">{registerError}</p>}
            </div>
          ) : (
            // Usuário não está inscrito - mostrar botão de inscrição
            <div className="text-center">
              <button
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isRegistering}
                onClick={async () => {
                  setIsRegistering(true);
                  setRegisterError('');
                  setRegisterSuccess('');
                  try {
                    // Usar formato correto da API: { emails: string[] }
                    await eventsService.addGuestsByEmail(eventId, [currentUserEmail]);
                    setRegisterSuccess('Inscrição realizada com sucesso!');

                    // Recarregar dados para atualizar status
                    await loadData();
                  } catch (err: any) {
                    setRegisterError(err?.message || 'Erro ao inscrever no evento');
                  } finally {
                    setIsRegistering(false);
                  }
                }}
              >
                {isRegistering ? 'Inscrevendo...' : 'Inscrever-se no evento'}
              </button>

              {registerError && <p className="mt-2 text-error-600 text-sm">{registerError}</p>}
              {registerSuccess && <p className="mt-2 text-success-600 text-sm">{registerSuccess}</p>}
            </div>
          )}
        </div>
      )}

      {/* Tabs: só para o dono */}
      {isOwner && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setCurrentTab('guests')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${currentTab === 'guests'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Convidados ({stats.total})
            </button>
            <button
              onClick={() => setCurrentTab('announcements')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${currentTab === 'announcements'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Anúncios
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">

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

                {/* Guest List - barra de rolagem personalizada, z-index fix para Dropdown */}
                <div className="space-y-2 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-gray-100 pr-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Lista de Convidados</h3>
                  {guests.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum convidado ainda</p>
                  ) : (
                    guests.map((guest, idx) => (
                      <div key={guest.id} className="flex items-center justify-between p-4 bg-white/80 rounded-lg hover:bg-primary-50 transition-colors relative" style={{ zIndex: guests.length - idx }}>
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${guest.status === 'YES' ? 'bg-emerald-100 text-emerald-700' :
                            guest.status === 'NO' ? 'bg-red-100 text-red-700' :
                              guest.status === 'MAYBE' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {guest.status === 'YES' ? 'Confirmado' :
                            guest.status === 'NO' ? 'Recusado' :
                              guest.status === 'MAYBE' ? 'Talvez' :
                                'Pendente'}
                        </span>
                        {/* Espaço extra para Dropdown no último item */}
                        {idx === guests.length - 1 && <div className="h-8"></div>}
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
      )}

      {/* Modal de Edição de Evento */}
      {isEditModalOpen && event && (
        <EditEventModal
          event={event}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            loadData();
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
