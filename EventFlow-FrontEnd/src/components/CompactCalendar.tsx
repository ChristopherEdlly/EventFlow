import React, { useState, useMemo } from 'react';
import { type Event } from '../services/events';

interface CompactCalendarProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  onDateClick?: (date: Date) => void;
}

export default function CompactCalendar({ events, onEventClick, onDateClick }: CompactCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [animating, setAnimating] = useState(false);

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

  // Próximos eventos (incluindo hoje)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return events
      .filter(e => new Date(e.date) >= now && e.availability === 'PUBLISHED')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);
  }, [events]);

  const goToPreviousMonth = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      setAnimating(false);
    }, 180);
  };

  const goToNextMonth = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      setAnimating(false);
    }, 180);
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
          if (hasEvents && dayEvents[0]) {
            onEventClick(dayEvents[0].id);
          } else if (onDateClick) {
            onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
          }
        }}
        className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-200 relative group overflow-visible focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500
          ${isTodayDate ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-bold shadow-lg ring-2 ring-primary-400 ring-offset-1' :
            hasEvents ? 'bg-gradient-to-br from-primary-50 to-primary-100 text-primary-900 hover:from-primary-100 hover:to-primary-200 font-semibold shadow-sm border border-primary-200 hover:shadow-md' :
            'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-transparent hover:border-neutral-200'}
          ${animating ? 'animate-pulse' : ''}`}
        tabIndex={0}
        aria-label={hasEvents ? `Dia ${day} com ${dayEvents.length} evento(s)` : `Dia ${day} sem eventos`}
      >
        <span className="text-base font-bold drop-shadow-sm mb-1">{day}</span>
        {hasEvents && (
          <div className="flex gap-1">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full shadow-sm cursor-pointer group-hover:scale-125 transition-transform duration-200 ${
                  event.availability === 'PUBLISHED' ? 'bg-success-500' :
                  event.availability === 'CANCELLED' ? 'bg-error-500' :
                  event.availability === 'COMPLETED' ? 'bg-gray-400' :
                  'bg-info-500'
                }`}
                title={event.title + ' (' +
                  (event.availability === 'PUBLISHED' ? 'Publicado' :
                   event.availability === 'CANCELLED' ? 'Cancelado' :
                   event.availability === 'COMPLETED' ? 'Concluído' : 'Outro') + ')'}
                aria-label={event.title + ' (' +
                  (event.availability === 'PUBLISHED' ? 'Publicado' :
                   event.availability === 'CANCELLED' ? 'Cancelado' :
                   event.availability === 'COMPLETED' ? 'Concluído' : 'Outro') + ')'}
              />
            ))}
          </div>
        )}
        {hasEvents && (
          <div className="absolute left-0 top-full mt-2 bg-neutral-900/95 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-2xl z-30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 pointer-events-none min-w-[140px] max-w-[200px]">
            <div className="font-semibold mb-1 text-primary-300">{dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}</div>
            {dayEvents.slice(0, 2).map((ev, idx) => (
              <div key={idx} className="truncate">• {ev.title}</div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-neutral-400 mt-1">+{dayEvents.length - 2} mais</div>
            )}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendário */}
      <div className="flex-1 max-w-[600px] bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {monthNames[currentDate.getMonth()]}
              </h3>
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
                onClick={() => setCurrentDate(new Date())}
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

        <div className="p-4">
          {/* Day names */}
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {dayNames.map((day, idx) => (
              <div key={idx} className="text-center text-xs font-bold text-neutral-500 py-1 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-success-500 rounded-full"></div>
              <span className="text-neutral-600 text-xs">Publicado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-error-500 rounded-full"></div>
              <span className="text-neutral-600 text-xs">Cancelado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
              <span className="text-neutral-600 text-xs">Concluído</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full"></div>
              <span className="text-neutral-600 text-xs">Dia Atual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos Eventos - ocupa toda largura restante */}
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Próximos Eventos
            {upcomingEvents.length > 0 && (
              <span className="ml-auto bg-white/20 px-2.5 py-1 rounded-full text-sm">
                {upcomingEvents.length}
              </span>
            )}
          </h3>
        </div>

        <div className="p-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-neutral-600 font-medium">Nenhum evento próximo</p>
              <p className="text-sm text-neutral-400 mt-1">Os próximos eventos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event.id)}
                  className="w-full bg-neutral-50 hover:bg-primary-50 rounded-xl p-4 border border-neutral-200 hover:border-primary-300 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md">
                      <span className="text-[10px] font-semibold tracking-wide">
                        {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-lg font-bold -mt-0.5">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-900 truncate text-base group-hover:text-primary-700">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        {event.time && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-neutral-600">{event.time}</p>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-sm text-neutral-500 truncate">{event.location}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
