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

  const getEventColor = (state: string) => {
    switch (state) {
      case 'DRAFT':
        return 'bg-neutral-400';
      case 'PUBLISHED':
        return 'bg-success-500';
      case 'CANCELLED':
        return 'bg-error-500';
      case 'COMPLETED':
        return 'bg-info-500';
      case 'ARCHIVED':
        return 'bg-neutral-300';
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
      <div key={`empty-${i}`} className="min-h-24 bg-neutral-50 border border-neutral-200"></div>
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
        className={`min-h-24 border border-neutral-200 p-2 relative transition-colors hover:bg-neutral-50 ${
          isTodayDate ? 'bg-primary-50 ring-2 ring-primary-500' : 'bg-white'
        }`}
        onClick={() => {
          if (dayEvents.length === 0 && onDayClick) {
            onDayClick(dateObj);
          }
        }}
        style={{ cursor: dayEvents.length === 0 && onDayClick ? 'pointer' : 'default' }}
      >
        <div className={`text-sm font-semibold mb-1 ${isTodayDate ? 'text-primary-700' : 'text-neutral-700'}`}>
          {day}
          {isTodayDate && (
            <span className="ml-1 text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
              Hoje
            </span>
          )}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map(event => (
            <button
              key={event.id}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event.id);
              }}
              className={`w-full text-left text-xs px-2 py-1 rounded text-white truncate hover:brightness-110 transition-all ${getEventColor(event.state)}`}
              title={`${event.title}${event.time ? ` - ${event.time}` : ''}`}
            >
              {event.time && <span className="font-semibold">{event.time}</span>} {event.title}
            </button>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-neutral-500 px-2">
              +{dayEvents.length - 3} mais
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            title="Mês anterior"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            title="Próximo mês"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-success-500 rounded"></div>
          <span className="text-neutral-600">Publicado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-neutral-400 rounded"></div>
          <span className="text-neutral-600">Rascunho</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-error-500 rounded"></div>
          <span className="text-neutral-600">Cancelado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-info-500 rounded"></div>
          <span className="text-neutral-600">Concluído</span>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-neutral-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0 border-t border-l border-neutral-200">
        {calendarDays}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-neutral-200 text-sm text-neutral-600">
        <p>
          <span className="font-semibold">{events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getMonth() === currentDate.getMonth() &&
                   eventDate.getFullYear() === currentDate.getFullYear();
          }).length}</span> eventos este mês
        </p>
      </div>
    </div>
  );
}
