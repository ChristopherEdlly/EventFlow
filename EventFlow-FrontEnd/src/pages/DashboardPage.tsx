import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { eventsService, type Event } from '../services/events';
import CompactCalendar from '../components/CompactCalendar';
import GradientHeader from '../components/GradientHeader';
import { HeaderSkeleton, CalendarSkeleton } from '../components/Skeleton';
import { AnimatedPage } from '../components/Animations';


interface DashboardPageProps {
  onViewEvent?: (eventId: string) => void;
}

interface CalendarEvent extends Event {
  isOwner?: boolean;
  myGuestStatus?: string;
}

export default function DashboardPage({ onViewEvent }: DashboardPageProps) {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [invitedEvents, setInvitedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setIsLoading(true);
        // Buscar eventos criados + todos os eventos onde participo (convites + inscrições públicas)
        const [owned, participations] = await Promise.all([
          eventsService.getMyEvents(),
          eventsService.getMyParticipations()
        ]);
        setMyEvents(owned);
        setInvitedEvents(participations);
      } catch (err) {
        setError('Erro ao carregar eventos');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllEvents();
  }, []);

  // Combinar todos os eventos para o calendário, marcando os próprios
  const allEvents = useMemo(() => {
    const ownedWithFlag = myEvents.map(e => ({ ...e, isOwner: true }));
    const invitedWithFlag = invitedEvents.map(e => ({ ...e, isOwner: false }));
    
    // Evitar duplicatas (caso um evento apareça em ambas as listas)
    const eventMap = new Map<string, CalendarEvent>();
    ownedWithFlag.forEach(e => eventMap.set(e.id, e));
    invitedWithFlag.forEach(e => {
      if (!eventMap.has(e.id)) {
        eventMap.set(e.id, e);
      }
    });
    
    return Array.from(eventMap.values());
  }, [myEvents, invitedEvents]);

  // Função para abrir página de criar evento com data pré-selecionada
  const handleDayClick = (date: Date) => {
    window.location.href = `/new-event?date=${date.toISOString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GradientHeader
        title="Calendário"
        subtitle="Visualize todos os seus eventos em um só lugar"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18" />
          </svg>
        }
        stats={[
          { value: myEvents.length, label: 'Meus Eventos' },
          { value: invitedEvents.length, label: 'Participando' },
        ]}
      />

      {/* Erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-6">
          <HeaderSkeleton />
          <CalendarSkeleton />
        </div>
      ) : (
        /* Calendário */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CompactCalendar
            events={allEvents}
            onEventClick={id => onViewEvent && onViewEvent(id)}
            onDateClick={handleDayClick}
          />
        </motion.div>
      )}
    </div>
  );
}
