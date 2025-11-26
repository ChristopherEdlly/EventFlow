import React, { useState, useEffect, useMemo } from 'react';
import { eventsService, type Event, type GuestStatus } from '../services/events';
import CompactCalendar from '../components/CompactCalendar';


interface DashboardPageProps {
  onViewEvent?: (eventId: string) => void;
}


export default function DashboardPage({ onViewEvent }: DashboardPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await eventsService.getMyEvents();
        setEvents(data);
      } catch (err) {
        setError('Erro ao carregar eventos');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Função para abrir página de criar evento com data pré-selecionada
  const handleDayClick = (date: Date) => {
    window.location.href = `/new-event?date=${date.toISOString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <main className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Calendário puro com botão de acessibilidade */}
        <div className="relative">
          <CompactCalendar
            events={events}
            onEventClick={id => onViewEvent && onViewEvent(id)}
            onDateClick={handleDayClick}
          />
          {/* Calendário aprimorado para melhor visualização e usabilidade */}
        </div>
      </main>
      {/* Modais e ações rápidas removidos, tudo centralizado na página de novo evento */}
    </div>
  );
}
