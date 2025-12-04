import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventsService, type Event, type GuestStatus } from '../services/events';
import GradientHeader from '../components/GradientHeader';
import { HeaderSkeleton, EventCardSkeleton } from '../components/Skeleton';
import EnhancedEmptyState from '../components/EnhancedEmptyState';

interface HomePageProps {
  onViewEvent: (eventId: string) => void;
  onNavigate: (page: string) => void;
  userName?: string;
}

type TabType = 'upcoming' | 'myEvents' | 'invites';

interface InviteEvent extends Event {
  myGuestStatus?: GuestStatus;
  myGuestId?: string;
}

export default function HomePage({ onViewEvent, onNavigate, userName = '' }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [invites, setInvites] = useState<InviteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados em paralelo
      // Usar getMyParticipations para incluir eventos públicos inscritos + convites privados
      const [events, participationsData] = await Promise.all([
        eventsService.getMyEvents(),
        eventsService.getMyParticipations()
      ]);

      setMyEvents(events);
      setInvites(participationsData as InviteEvent[]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Eventos próximos (criados por mim + inscritos)
  const upcomingEvents = [
    ...myEvents.filter(e => new Date(e.date) >= new Date() && e.availability === 'PUBLISHED'),
    ...invites.filter(e => new Date(e.date) >= new Date() && e.myGuestStatus === 'YES')
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Próximo evento
  const nextEvent = upcomingEvents[0];

  // Convites pendentes
  const pendingInvites = invites.filter(i => i.myGuestStatus === 'PENDING' || i.myGuestStatus === 'MAYBE');

  // Stats
  const stats = {
    totalCreated: myEvents.length,
    totalInvites: invites.length,
    confirmed: invites.filter(i => i.myGuestStatus === 'YES').length,
    pending: pendingInvites.length,
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    if (diff < 7) return `Em ${diff} dias`;
    if (diff < 30) return `Em ${Math.ceil(diff / 7)} semanas`;
    return `Em ${Math.ceil(diff / 30)} meses`;
  };

  const getStatusBadge = (status?: GuestStatus) => {
    const badges = {
      YES: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Confirmado' },
      NO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Recusado' },
      MAYBE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Talvez' },
      PENDING: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pendente' },
      WAITLISTED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Lista de Espera' },
    };
    return badges[status || 'PENDING'];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        {/* Next Event Skeleton */}
        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        {/* Tabs Skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        {/* Events Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de Boas-vindas */}
      <GradientHeader
        variant="welcome"
        title={`Olá, ${userName.split(' ')[0]}! 👋`}
        subtitle={
          upcomingEvents.length > 0 
            ? `Você tem ${upcomingEvents.length} evento${upcomingEvents.length > 1 ? 's' : ''} próximo${upcomingEvents.length > 1 ? 's' : ''}`
            : 'Nenhum evento próximo no momento'
        }
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
        stats={[
          { value: stats.totalCreated, label: 'Criados' },
          { value: stats.confirmed, label: 'Confirmados' },
        ]}
        actions={
          <button
            onClick={() => onNavigate('newEvent')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Criar Evento
          </button>
        }
      />

      {/* Próximo Evento em Destaque */}
      {nextEvent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={() => onViewEvent(nextEvent.id)}
          className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all overflow-hidden group"
        >
          {/* Pattern decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                🎯 Próximo Evento
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {getDaysUntil(nextEvent.date)}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 group-hover:underline decoration-2 underline-offset-4">
              {nextEvent.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatFullDate(nextEvent.date)}</span>
              </div>
              {nextEvent.time && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{nextEvent.time}</span>
                </div>
              )}
              {nextEvent.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="truncate max-w-[200px]">{nextEvent.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* Stats Rápidos */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCreated}</p>
              <p className="text-xs text-gray-500">Meus Eventos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              <p className="text-xs text-gray-500">Confirmados</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pendentes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvites}</p>
              <p className="text-xs text-gray-500">Convites</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs de Navegação */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            📅 Próximos ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('myEvents')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'myEvents'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🎯 Meus Eventos ({myEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'invites'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            ✉️ Convites ({invites.length})
            {pendingInvites.length > 0 && (
              <span className="absolute top-1 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingInvites.length}
              </span>
            )}
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="p-4">
          {/* Tab: Próximos */}
          {activeTab === 'upcoming' && (
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento próximo</h3>
                  <p className="text-gray-500 mb-4">Crie um novo evento ou aceite um convite</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => onNavigate('newEvent')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                    >
                      Criar Evento
                    </button>
                    <button
                      onClick={() => onNavigate('publicEvents')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Explorar Eventos
                    </button>
                  </div>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => onViewEvent(event.id)}
                    getDaysUntil={getDaysUntil}
                    isInvite={!myEvents.find(e => e.id === event.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Tab: Meus Eventos */}
          {activeTab === 'myEvents' && (
            <div className="space-y-3">
              {myEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento criado</h3>
                  <p className="text-gray-500 mb-4">Crie seu primeiro evento agora</p>
                  <button
                    onClick={() => onNavigate('newEvent')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                  >
                    Criar Evento
                  </button>
                </div>
              ) : (
                myEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => onViewEvent(event.id)}
                    getDaysUntil={getDaysUntil}
                    showManage
                  />
                ))
              )}
            </div>
          )}

          {/* Tab: Convites */}
          {activeTab === 'invites' && (
            <div className="space-y-3">
              {invites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum convite recebido</h3>
                  <p className="text-gray-500 mb-4">Explore eventos públicos para participar</p>
                  <button
                    onClick={() => onNavigate('publicEvents')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                  >
                    Explorar Eventos
                  </button>
                </div>
              ) : (
                invites.map((event) => (
                  <InviteCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => onViewEvent(event.id)}
                    getDaysUntil={getDaysUntil}
                    getStatusBadge={getStatusBadge}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="grid grid-cols-2 gap-4"
      >
        <button
          onClick={() => onNavigate('publicEvents')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
        >
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Explorar Eventos</p>
            <p className="text-xs text-gray-500">Descubra eventos públicos</p>
          </div>
        </button>
        
        <button
          onClick={() => onNavigate('history')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
        >
          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Histórico</p>
            <p className="text-xs text-gray-500">Eventos passados</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
}

// Componente de Card de Evento
interface EventCardProps {
  event: Event;
  onClick: () => void;
  getDaysUntil: (date: string) => string;
  isInvite?: boolean;
  showManage?: boolean;
}

function EventCard({ event, onClick, getDaysUntil, isInvite, showManage }: EventCardProps) {
  const isPast = new Date(event.date) < new Date();
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
        isPast 
          ? 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80' 
          : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md'
      }`}
    >
      {/* Imagem ou Data */}
      {event.imageUrl ? (
        <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
          isPast ? 'bg-gray-200' : 'bg-gradient-to-br from-primary-500 to-secondary-600'
        }`}>
          <span className={`text-xs font-medium ${isPast ? 'text-gray-500' : 'text-white/80'}`}>
            {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
          </span>
          <span className={`text-xl font-bold ${isPast ? 'text-gray-600' : 'text-white'}`}>
            {new Date(event.date).getDate()}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
          {isInvite && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0">
              Convidado
            </span>
          )}
          {showManage && (
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full flex-shrink-0">
              Organizador
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {event.time && <span>🕐 {event.time}</span>}
          {event.location && <span className="truncate">📍 {event.location}</span>}
        </div>
      </div>

      {/* Tempo restante */}
      <div className="flex-shrink-0 text-right hidden sm:block">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isPast 
            ? 'bg-gray-200 text-gray-600' 
            : 'bg-primary-100 text-primary-700'
        }`}>
          {isPast ? 'Passado' : getDaysUntil(event.date)}
        </span>
      </div>

      {/* Seta */}
      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

// Componente de Card de Convite
interface InviteCardProps {
  event: InviteEvent;
  onClick: () => void;
  getDaysUntil: (date: string) => string;
  getStatusBadge: (status?: GuestStatus) => { bg: string; text: string; label: string };
}

interface InviteEvent extends Event {
  myGuestStatus?: GuestStatus;
  myGuestId?: string;
}

function InviteCard({ event, onClick, getDaysUntil, getStatusBadge }: InviteCardProps) {
  const isPast = new Date(event.date) < new Date();
  const badge = getStatusBadge(event.myGuestStatus);
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
        isPast 
          ? 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80' 
          : event.myGuestStatus === 'PENDING'
            ? 'bg-amber-50 border-amber-200 hover:border-amber-300 hover:shadow-md'
            : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md'
      }`}
    >
      {/* Data */}
      <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
        isPast ? 'bg-gray-200' : 'bg-gradient-to-br from-primary-500 to-secondary-600'
      }`}>
        <span className={`text-xs font-medium ${isPast ? 'text-gray-500' : 'text-white/80'}`}>
          {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
        </span>
        <span className={`text-xl font-bold ${isPast ? 'text-gray-600' : 'text-white'}`}>
          {new Date(event.date).getDate()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
          <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {event.time && <span>🕐 {event.time}</span>}
          {event.location && <span className="truncate">📍 {event.location}</span>}
        </div>
      </div>

      {/* Ação pendente */}
      {event.myGuestStatus === 'PENDING' && !isPast && (
        <div className="flex-shrink-0 hidden sm:block">
          <span className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-full animate-pulse">
            Responder
          </span>
        </div>
      )}

      {/* Seta */}
      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
