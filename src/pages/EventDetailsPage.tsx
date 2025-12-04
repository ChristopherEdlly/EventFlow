import React, { useState, useEffect } from 'react';
import { eventsService, type Event, type Guest } from '../services/events';
import { api } from '../services/api';
import EditEventModal from '../components/EditEventModal';
import { MessageThread } from '../components/MessageThread';
import { ConversationList } from '../components/ConversationList';
import { ReportEventModal } from '../components/ReportEventModal';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  eventId: string;
}

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
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [guestToRemove, setGuestToRemove] = useState<Guest | null>(null);
  const [isRemovingGuest, setIsRemovingGuest] = useState(false);

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
          api.get<Announcement[]>(`/events/${eventId}/announcements`).catch(() => [] as Announcement[])
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

        <div className="relative px-6 py-4">
          {/* Header: Voltar + Título + Badges */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={onBack}
                className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-200 group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{event.title}</h1>
            </div>

            {/* Badges de Status + Botão Denúncia */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-md backdrop-blur-sm ${event.visibility === 'PUBLIC'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-500/90 text-white'
                }`}>
                {event.visibility === 'PUBLIC' ? '🌐 Público' : '🔒 Privado'}
              </span>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md backdrop-blur-sm ${event.availability === 'PUBLISHED' ? 'bg-emerald-500/90 text-white' :
                  event.availability === 'CANCELLED' ? 'bg-red-500/90 text-white' :
                    event.availability === 'COMPLETED' ? 'bg-gray-500/90 text-white' :
                      'bg-gray-400/90 text-white'
                }`}>
                {event.availability === 'PUBLISHED' ? '✓ Publicado' :
                  event.availability === 'CANCELLED' ? '✕ Cancelado' :
                    event.availability === 'COMPLETED' ? '✓ Concluído' :
                      'Indefinido'}
              </span>
              {!isOwner && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border border-red-400/50"
                  title="Denunciar evento"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Descrição */}
          {event.description && (
            <p className="text-white/90 text-sm mb-4 line-clamp-2">{event.description}</p>
          )}

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


      {/* ===== VISÃO DO ORGANIZADOR ===== */}
      {isOwner && (
        <div className="space-y-6">
          {/* Barra de Ações do Organizador */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Estatísticas Inline */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{stats.confirmed}</span> confirmados
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{stats.pending}</span> pendentes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{stats.declined}</span> recusados
                  </span>
                </div>
                {event.capacity && (
                  <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                    <span className="text-sm text-gray-600">
                      Capacidade: <span className="font-semibold text-gray-900">{stats.confirmed}/{event.capacity}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConversationList(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Mensagens
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                {event.availability !== 'CANCELLED' && (
                  <button
                    onClick={async () => {
                      if (confirm('Tem certeza que deseja cancelar este evento? Esta ação não pode ser desfeita.')) {
                        try {
                          await eventsService.updateEvent(eventId, { availability: 'CANCELLED' });
                          await loadData();
                        } catch (err) {
                          alert('Erro ao cancelar evento');
                        }
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar Evento
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid Principal: Lista de Convidados + Sidebar de Anúncios */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal: Lista de Convidados */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Header com Filtros */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Convidados
                    <span className="ml-2 text-sm font-normal text-gray-500">({stats.total})</span>
                  </h2>
                  {/* Botão adicionar + Mini filtros */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddGuestModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar
                    </button>
                    <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-emerald-100 text-emerald-700">✓ {stats.confirmed}</span>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-700">⏳ {stats.pending}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Convidados */}
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {guests.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">Nenhum convidado ainda</p>
                    <p className="text-sm text-gray-400">Convide pessoas para o seu evento</p>
                  </div>
                ) : (
                  guests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                          guest.status === 'YES' ? 'bg-emerald-100 text-emerald-700' :
                          guest.status === 'NO' ? 'bg-red-100 text-red-700' :
                          guest.status === 'MAYBE' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {guest.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{guest.name}</p>
                          <p className="text-sm text-gray-500">{guest.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          guest.status === 'YES' ? 'bg-emerald-100 text-emerald-700' :
                          guest.status === 'NO' ? 'bg-red-100 text-red-700' :
                          guest.status === 'MAYBE' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {guest.status === 'YES' ? '✓ Confirmado' :
                           guest.status === 'NO' ? '✕ Recusado' :
                           guest.status === 'MAYBE' ? '? Talvez' :
                           '⏳ Pendente'}
                        </span>
                        {/* Botão remover - apenas eventos privados */}
                        {event.visibility === 'PRIVATE' && (
                          <button
                            onClick={() => setGuestToRemove(guest)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover convidado"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar: Anúncios */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Anúncios</h2>
                <button 
                  onClick={() => setShowAnnouncementModal(true)}
                  className="p-2 hover:bg-primary-100 bg-primary-50 rounded-lg transition-colors" 
                  title="Criar anúncio"
                >
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <div className="p-4 max-h-[500px] overflow-y-auto">
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Nenhum anúncio</p>
                    <button 
                      onClick={() => setShowAnnouncementModal(true)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Criar Primeiro Anúncio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-3 bg-gray-50 rounded-xl">
                        {announcement.title && (
                          <p className="font-medium text-gray-900 mb-1">{announcement.title}</p>
                        )}
                        <p className="text-sm text-gray-700">{announcement.content || announcement.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(announcement.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Modal de Adicionar Convidado */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Adicionar Convidado</h3>
                <button 
                  onClick={() => { setShowAddGuestModal(false); setNewGuestEmail(''); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail do convidado
              </label>
              <input
                type="email"
                value={newGuestEmail}
                onChange={(e) => setNewGuestEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-xs text-gray-500">
                O convidado receberá um convite por e-mail para participar do evento.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowAddGuestModal(false); setNewGuestEmail(''); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!newGuestEmail.trim()) return;
                  setIsAddingGuest(true);
                  try {
                    await eventsService.addGuestsByEmail(eventId, [newGuestEmail.trim()]);
                    await loadData();
                    setShowAddGuestModal(false);
                    setNewGuestEmail('');
                  } catch (err: any) {
                    alert(err?.message || 'Erro ao adicionar convidado');
                  } finally {
                    setIsAddingGuest(false);
                  }
                }}
                disabled={isAddingGuest || !newGuestEmail.trim()}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
              >
                {isAddingGuest ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar Anúncio */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Criar Anúncio</h3>
                <button 
                  onClick={() => { setShowAnnouncementModal(false); setNewAnnouncement({ title: '', content: '' }); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do anúncio
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Mudança de local"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva o conteúdo do anúncio..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <p className="text-xs text-gray-500">
                Os convidados serão notificados por e-mail sobre este anúncio.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowAnnouncementModal(false); setNewAnnouncement({ title: '', content: '' }); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;
                  setIsCreatingAnnouncement(true);
                  try {
                    await api.post(`/events/${eventId}/announcements`, newAnnouncement);
                    await loadData();
                    setShowAnnouncementModal(false);
                    setNewAnnouncement({ title: '', content: '' });
                  } catch (err: any) {
                    alert(err?.message || 'Erro ao criar anúncio');
                  } finally {
                    setIsCreatingAnnouncement(false);
                  }
                }}
                disabled={isCreatingAnnouncement || !newAnnouncement.title.trim() || !newAnnouncement.content.trim()}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
              >
                {isCreatingAnnouncement ? 'Criando...' : 'Criar Anúncio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Remoção de Convidado */}
      {guestToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">Remover Convidado</h3>
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja remover <strong>{guestToRemove.name}</strong> ({guestToRemove.email}) do evento?
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setGuestToRemove(null)}
                disabled={isRemovingGuest}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setIsRemovingGuest(true);
                  try {
                    await eventsService.removeGuest(eventId, guestToRemove.id);
                    await loadData();
                    setGuestToRemove(null);
                  } catch (err: any) {
                    alert(err?.message || 'Erro ao remover convidado');
                  } finally {
                    setIsRemovingGuest(false);
                  }
                }}
                disabled={isRemovingGuest}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
              >
                {isRemovingGuest ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
