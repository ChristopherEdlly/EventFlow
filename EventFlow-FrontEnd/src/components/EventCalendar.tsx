import React, { useState, useMemo } from 'react';
import { type Event } from '../services/events';

interface EventCalendarProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  onDayClick?: (date: Date) => void;
}

export default function EventCalendar({ events, onEventClick, onDayClick }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get first day of month and number of days
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get events for each day
  const eventsByDay = useMemo(() => {
    const map = new Map<number, Event[]>();

    events.forEach(event => {
      // Corrige para UTC (backend envia em UTC)
      const eventDate = new Date(event.date);
      const localDate = new Date(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate());
      if (
        localDate.getMonth() === currentDate.getMonth() &&
        localDate.getFullYear() === currentDate.getFullYear()
      ) {
        const day = localDate.getDate();
        const dayEvents = map.get(day) || [];
        dayEvents.push(event);
        map.set(day, dayEvents);
      }
    });

    return map;
  }, [events, currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventColor = (availability?: string) => {
    if (!availability) return 'bg-primary-500';

    switch (availability) {
      case 'PUBLISHED':
        return 'bg-success-500';
      case 'CANCELLED':
        return 'bg-error-500';
      case 'COMPLETED':
        return 'bg-info-500';
      default:
        return 'bg-primary-500';
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  // Create calendar grid
  const calendarDays = [];

  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="min-h-28 bg-neutral-100/50 rounded-lg"></div>
    );
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = eventsByDay.get(day) || [];
    const isTodayDate = isToday(day);
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    calendarDays.push(
      <div
        key={day}
        className={`min-h-28 rounded-lg p-2.5 relative transition-all duration-300 group ${
          isTodayDate
            ? 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg scale-105'
            : 'bg-white hover:bg-neutral-50 hover:shadow-md'
        } ${dayEvents.length === 0 && onDayClick ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (dayEvents.length === 0 && onDayClick) {
            onDayClick(dateObj);
          }
        }}
      >
        <div className={`text-sm font-bold mb-2 flex items-center justify-between ${
          isTodayDate ? 'text-white' : 'text-neutral-700'
        }`}>
          <span>{day}</span>
          {isTodayDate && (
            <span className="text-[10px] bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-semibold">
              Hoje
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          {dayEvents.slice(0, 3).map(event => (
            <button
              key={event.id}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event.id);
              }}
              className={`w-full text-left text-[11px] px-2 py-1.5 rounded-md text-white truncate hover:scale-105 hover:shadow-md transition-all duration-200 font-medium ${getEventColor(event.availability)}`}
              title={`${event.title}${event.time ? ` - ${event.time}` : ''}`}
            >
              <div className="flex items-center gap-1">
                {event.time && (
                  <span className="font-bold flex-shrink-0">{event.time}</span>
                )}
                <span className="truncate">{event.title}</span>
              </div>
            </button>
          ))}
          {dayEvents.length > 3 && (
            <div className={`text-[11px] px-2 py-1 font-semibold ${
              isTodayDate ? 'text-white/90' : 'text-neutral-500'
            }`}>
              +{dayEvents.length - 3} mais
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {monthNames[currentDate.getMonth()]}
            </h2>
            <p className="text-white/80 text-sm font-medium">{currentDate.getFullYear()}</p>
          </div>
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <button
              onClick={goToPreviousMonth}
              className="p-2.5 text-white hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Mês anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              Hoje
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2.5 text-white hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Próximo mês"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-500 rounded-full shadow-sm"></div>
            <span className="text-neutral-700 text-xs font-medium">Publicado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error-500 rounded-full shadow-sm"></div>
            <span className="text-neutral-700 text-xs font-medium">Cancelado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info-500 rounded-full shadow-sm"></div>
            <span className="text-neutral-700 text-xs font-medium">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full shadow-md"></div>
            <span className="text-neutral-700 text-xs font-medium">Dia Atual</span>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center text-xs font-bold text-neutral-600 py-3 uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 bg-neutral-200 p-1 rounded-xl">
          {calendarDays}
        </div>

        {/* Summary */}
        <div className="mt-5 pt-5 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total do mês</p>
              <p className="text-lg font-bold text-neutral-900">
                {events.filter(e => {
                  const eventDate = new Date(e.date);
                  return eventDate.getMonth() === currentDate.getMonth() &&
                         eventDate.getFullYear() === currentDate.getFullYear();
                }).length} {events.filter(e => {
                  const eventDate = new Date(e.date);
                  return eventDate.getMonth() === currentDate.getMonth() &&
                         eventDate.getFullYear() === currentDate.getFullYear();
                }).length === 1 ? 'evento' : 'eventos'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
