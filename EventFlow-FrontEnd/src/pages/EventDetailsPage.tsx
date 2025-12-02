import React, { useState, useEffect } from 'react';
import { eventsService, type Event, type Guest } from '../services/events';
import { api } from '../services/api';
import EditEventModal from '../components/EditEventModal';
import { MessageThread } from '../components/MessageThread';
import { ConversationList } from '../components/ConversationList';
import { ReportEventModal } from '../components/ReportEventModal';

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
  const [showMessageThread, setShowMessageThread] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [guestSearch, setGuestSearch] = useState('');
  const [guestFilter, setGuestFilter] = useState<'ALL' | 'YES' | 'NO' | 'MAYBE' | 'PENDING'>('ALL');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

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
        setCurrentUserId(profile.id);

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

  // Filtrar convidados
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
                          guest.email.toLowerCase().includes(guestSearch.toLowerCase());
    const matchesFilter = guestFilter === 'ALL' || guest.status === guestFilter;
    return matchesSearch && matchesFilter;
  });

  // Função para criar anúncio
  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;

    try {
      setIsCreatingAnnouncement(true);
      const response = await fetch(`/events/${eventId}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: newAnnouncement }),
      });

      if (!response.ok) throw new Error('Erro ao criar anúncio');

      setNewAnnouncement('');
      setShowAnnouncementForm(false);
      await loadData();
    } catch (err) {
      alert('Erro ao criar anúncio. Tente novamente.');
    } finally {
      setIsCreatingAnnouncement(false);
    }
  };

  // Mapear categoria para texto legível
  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      FESTA: '🎉 Festa',
      REUNIAO: '👔 Reunião',
      WORKSHOP: '🛠️ Workshop',
      CONFERENCIA: '🎤 Conferência',
      ESPORTE: '⚽ Esporte',
      OUTRO: '📌 Outro',
    };
    return categories[category] || category;
  };

  // Mapear tipo de evento
  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      PRESENCIAL: '📍 Presencial',
      ONLINE: '💻 Online',
      HIBRIDO: '🔄 Híbrido',
    };
    return types[type] || type;
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
          {/* Botões de navegação */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-200 group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Voltar</span>
            </button>

            {/* Botão de denúncia (apenas para não-proprietários) */}
            {!isOwner && (
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border border-red-400/50"
                title="Denunciar evento"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium text-sm">Denunciar</span>
              </button>
            )}
          </div>

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

      {/* Seção de Informações Adicionais do Evento - visível para todos */}
      {(event as any).category || (event as any).eventType || (event as any).price !== undefined ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informações do Evento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(event as any).category && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl">
                <div className="text-3xl">{getCategoryLabel((event as any).category).split(' ')[0]}</div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Categoria</p>
                  <p className="text-sm font-semibold text-gray-900">{getCategoryLabel((event as any).category).split(' ').slice(1).join(' ')}</p>
                </div>
              </div>
            )}
            {(event as any).eventType && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-3xl">{getEventTypeLabel((event as any).eventType).split(' ')[0]}</div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Tipo</p>
                  <p className="text-sm font-semibold text-gray-900">{getEventTypeLabel((event as any).eventType).split(' ').slice(1).join(' ')}</p>
                </div>
              </div>
            )}
            {(event as any).price !== undefined && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                <div className="text-3xl">💰</div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Preço</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {(event as any).price === 0 ? 'Gratuito' : `R$ ${(event as any).price.toFixed(2)}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Card do Organizador - visível para não-donos */}
      {!isOwner && event && (event as any).owner && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Organizador
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {(event as any).owner.name?.charAt(0).toUpperCase() || 'O'}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{(event as any).owner.name || 'Organizador'}</p>
              <p className="text-sm text-gray-600">{(event as any).owner.email || ''}</p>
            </div>
          </div>
        </div>
      )}

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
              <div className="space-y-2">
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
                <button
                  onClick={() => setShowConversationList(true)}
                  className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Ver Mensagens
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

      {/* Botão de mensagem para participantes */}
      {!isOwner && currentUserGuest && (
        <div className="mb-6">
          <button
            onClick={() => setShowMessageThread(true)}
            className="w-full px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Enviar mensagem ao organizador
          </button>
        </div>
      )}

      {/* Seção de Anúncios para participantes */}
      {!isOwner && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Anúncios do Evento
            </h2>
          </div>
          <div className="p-6">
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Nenhum anúncio publicado ainda</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                    <p className="text-gray-900 leading-relaxed">{announcement.message}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(announcement.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seção de Outros Participantes Confirmados - para não-donos */}
      {!isOwner && guests.filter(g => g.status === 'YES').length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Participantes Confirmados ({guests.filter(g => g.status === 'YES').length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {guests.filter(g => g.status === 'YES').map((guest) => (
              <div key={guest.id} className="flex flex-col items-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mb-2">
                  {guest.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-medium text-gray-900 text-center truncate w-full" title={guest.name}>
                  {guest.name}
                </p>
              </div>
            ))}
          </div>
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
                {/* Guest Stats - Melhorados */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-xs text-gray-600 font-medium">Total</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">{stats.confirmed}</div>
                    <div className="text-xs text-emerald-600 font-medium">Confirmados</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <div className="text-2xl font-bold text-amber-700">{stats.maybe}</div>
                    <div className="text-xs text-amber-600 font-medium">Talvez</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">{stats.pending}</div>
                    <div className="text-xs text-blue-600 font-medium">Pendentes</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="text-2xl font-bold text-red-700">{stats.declined}</div>
                    <div className="text-xs text-red-600 font-medium">Recusados</div>
                  </div>
                </div>

                {/* Response Chart - Melhorado */}
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 mb-6 border border-primary-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Taxa de Confirmação
                  </h3>
                  <div className="flex items-center justify-center gap-8">
                    <div className="relative w-40 h-40">
                      {/* Circular progress */}
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="14"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="14"
                          strokeDasharray={`${stats.confirmationRate * 4.4} 440`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-primary-700">{stats.confirmationRate}%</div>
                        <div className="text-xs text-gray-600">de confirmação</div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-gray-700">Confirmados: {stats.confirmed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm text-gray-700">Talvez: {stats.maybe}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-700">Pendentes: {stats.pending}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-700">Recusados: {stats.declined}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtros e Busca */}
                <div className="mb-6 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtrar Convidados
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Busca */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={guestSearch}
                        onChange={(e) => setGuestSearch(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {/* Filtro por Status */}
                    <select
                      value={guestFilter}
                      onChange={(e) => setGuestFilter(e.target.value as any)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium"
                    >
                      <option value="ALL">Todos ({stats.total})</option>
                      <option value="YES">Confirmados ({stats.confirmed})</option>
                      <option value="MAYBE">Talvez ({stats.maybe})</option>
                      <option value="PENDING">Pendentes ({stats.pending})</option>
                      <option value="NO">Recusados ({stats.declined})</option>
                    </select>
                  </div>
                  {(guestSearch || guestFilter !== 'ALL') && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                      <p className="text-sm text-blue-700">
                        Mostrando <span className="font-semibold">{filteredGuests.length}</span> de {stats.total} convidados
                      </p>
                      <button
                        onClick={() => {
                          setGuestSearch('');
                          setGuestFilter('ALL');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Limpar filtros
                      </button>
                    </div>
                  )}
                </div>

                {/* Guest List - Com filtros aplicados */}
                <div className="space-y-2 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-gray-100 pr-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Lista de Convidados</h3>
                  {filteredGuests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">
                        {guests.length === 0 ? 'Nenhum convidado ainda' : 'Nenhum convidado encontrado com esses filtros'}
                      </p>
                    </div>
                  ) : (
                    filteredGuests.map((guest, idx) => (
                      <div key={guest.id} className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-primary-50 transition-all border border-gray-200 hover:border-primary-300 hover:shadow-sm relative" style={{ zIndex: filteredGuests.length - idx }}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                            guest.status === 'YES' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                            guest.status === 'NO' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                            guest.status === 'MAYBE' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                            'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            {guest.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{guest.name}</p>
                            <p className="text-sm text-gray-600">{guest.email}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-xs font-semibold shadow-sm ${
                          guest.status === 'YES' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          guest.status === 'NO' ? 'bg-red-100 text-red-700 border border-red-300' :
                          guest.status === 'MAYBE' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          'bg-blue-100 text-blue-700 border border-blue-300'
                        }`}>
                          {guest.status === 'YES' ? '✓ Confirmado' :
                            guest.status === 'NO' ? '✕ Recusado' :
                              guest.status === 'MAYBE' ? '? Talvez' :
                                '⏳ Pendente'}
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
                {/* Formulário de Criar Anúncio */}
                {isOwner && (
                  <div className="mb-6">
                    {!showAnnouncementForm ? (
                      <button
                        onClick={() => setShowAnnouncementForm(true)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Criar Novo Anúncio
                      </button>
                    ) : (
                      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 border-2 border-primary-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                          Novo Anúncio
                        </h3>
                        <textarea
                          value={newAnnouncement}
                          onChange={(e) => setNewAnnouncement(e.target.value)}
                          placeholder="Digite sua mensagem aqui... (ex: 'Lembrete: O evento começará às 19h em ponto!')"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                          rows={4}
                          disabled={isCreatingAnnouncement}
                        />
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={handleCreateAnnouncement}
                            disabled={!newAnnouncement.trim() || isCreatingAnnouncement}
                            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isCreatingAnnouncement ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Publicando...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Publicar
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowAnnouncementForm(false);
                              setNewAnnouncement('');
                            }}
                            disabled={isCreatingAnnouncement}
                            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors border-2 border-gray-300 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Lista de Anúncios */}
                {announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Nenhum anúncio publicado ainda</p>
                    <p className="text-gray-400 text-xs mt-2">Os anúncios serão visíveis para todos os participantes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <p className="text-gray-900 leading-relaxed">{announcement.message}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(announcement.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
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

      {/* Modal de Mensagem para Participantes */}
      {showMessageThread && event && !isOwner && (
        <MessageThread
          eventId={eventId}
          otherUserId={event.ownerId}
          otherUserName="Organizador"
          onClose={() => setShowMessageThread(false)}
          isOrganizer={false}
        />
      )}

      {/* Modal de Conversas para Organizadores */}
      {showConversationList && isOwner && (
        <ConversationList
          eventId={eventId}
          onClose={() => setShowConversationList(false)}
        />
      )}

      {/* Modal de Denúncia */}
      {showReportModal && event && (
        <ReportEventModal
          eventId={eventId}
          eventTitle={event.title}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
