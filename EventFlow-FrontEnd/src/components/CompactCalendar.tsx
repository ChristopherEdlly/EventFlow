import React, { useState, useMemo } from 'react';
import { type Event } from '../services/events';

interface CompactCalendarProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  onDateClick?: (date: Date) => void;
}

export default function CompactCalendar({ events, onEventClick, onDateClick }: CompactCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const startingDayOfWeek = firstDayOfMonth.getDay();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, Event[]>();
    events.forEach(event => {
      const eventDate = new Date(event.date);
      if (
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      ) {
        const day = eventDate.getDate();
        const dayEvents = map.get(day) || [];
        dayEvents.push(event);
        map.set(day, dayEvents);
      }
    });
    return map;
  }, [events, currentDate]);

  // Próximos 3 eventos
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.date) >= now && e.state === 'PUBLISHED')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="aspect-square"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = eventsByDay.get(day) || [];
    const isTodayDate = isToday(day);
    const hasEvents = dayEvents.length > 0;

    calendarDays.push(
      <button
        key={day}
        onClick={() => {
          if (hasEvents) {
            onEventClick(dayEvents[0].id);
          } else if (onDateClick) {
            onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
          }
        }}
        className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-200 relative group ${
          isTodayDate
            ? 'bg-primary-500 text-white font-bold shadow-md hover:shadow-lg'
            : hasEvents
            ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 font-semibold'
            : 'text-neutral-700 hover:bg-neutral-50'
        }`}
      >
        <span className="text-sm">{day}</span>
        {hasEvents && (
          <div className="flex gap-0.5 mt-1">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className={`w-1 h-1 rounded-full ${
                  event.state === 'PUBLISHED' ? 'bg-success-500' :
                  event.state === 'DRAFT' ? 'bg-neutral-400' :
                  event.state === 'CANCELLED' ? 'bg-error-500' :
                  'bg-info-500'
                } ${isTodayDate ? 'bg-white' : ''}`}
              />
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Calendário */}
      <div className="xl:col-span-2 bg-white rounded-xl shadow-md border border-neutral-200 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day, idx) => (
            <div key={idx} className="text-center text-xs font-semibold text-neutral-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-neutral-200 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-neutral-600">Publicado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            <span className="text-neutral-600">Rascunho</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span className="text-neutral-600">Hoje</span>
          </div>
        </div>
      </div>

      {/* Próximos Eventos */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl shadow-md border border-primary-200 p-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Próximos Eventos
        </h3>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Nenhum evento próximo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onEventClick(event.id)}
                className="w-full bg-white hover:bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-primary-300 transition-all duration-200 text-left group shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <span className="text-xs font-medium">
                      {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-lg font-bold">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900 truncate group-hover:text-primary-700 transition-colors">
                      {event.title}
                    </h4>
                    {event.time && (
                      <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.time}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-xs text-neutral-500 truncate mt-1">
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
