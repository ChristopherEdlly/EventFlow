import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, X } from 'lucide-react';

interface DateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  minDate?: string;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
  label,
  required,
  error,
  placeholder = 'Selecione data e hora'
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (date) {
      const parts = date.split('-').map(Number);
      const year = parts[0] ?? new Date().getFullYear();
      const month = (parts[1] ?? 1) - 1;
      return new Date(year, month, 1);
    }
    return new Date();
  });
  const [use24Hour, setUse24Hour] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current time
  const timeParts = time ? time.split(':').map(Number) : [19, 0];
  const hours = timeParts[0] ?? 19;
  const minutes = timeParts[1] ?? 0;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const days: (number | null)[] = [];
    
    // Previous month padding
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onDateChange(`${year}-${month}-${dayStr}`);
  };

  const handleHourChange = (newHours: number) => {
    const h = String(newHours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    onTimeChange(`${h}:${m}`);
  };

  const handleMinuteChange = (newMinutes: number) => {
    const h = String(hours).padStart(2, '0');
    const m = String(newMinutes).padStart(2, '0');
    onTimeChange(`${h}:${m}`);
  };

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    
    // Parse minDate correctly to avoid timezone issues
    const minParts = minDate.split('-').map(Number);
    const minYear = minParts[0] ?? 0;
    const minMonth = (minParts[1] ?? 1) - 1;
    const minDay = minParts[2] ?? 1;
    
    const checkYear = viewDate.getFullYear();
    const checkMonth = viewDate.getMonth();
    
    // Compare year first
    if (checkYear < minYear) return true;
    if (checkYear > minYear) return false;
    
    // Same year, compare month
    if (checkMonth < minMonth) return true;
    if (checkMonth > minMonth) return false;
    
    // Same year and month, compare day
    return day < minDay;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!date) return false;
    const parts = date.split('-').map(Number);
    const year = parts[0];
    const month = parts[1] ?? 1;
    const d = parts[2];
    return (
      day === d &&
      viewDate.getMonth() === month - 1 &&
      viewDate.getFullYear() === year
    );
  };

  // Format display value
  const formatDisplayValue = (): { date: string; time: string } | null => {
    if (!date) return null;
    const parts = date.split('-').map(Number);
    const year = parts[0] ?? new Date().getFullYear();
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    const dateObj = new Date(year, month - 1, day);
    const dayName = DAYS_OF_WEEK[dateObj.getDay()];
    const monthName = MONTHS[month - 1] ?? 'Jan';
    const monthShort = monthName.slice(0, 3); // Abreviado
    const timeStr = time || '19:00';
    return {
      date: `${dayName}, ${day} de ${monthShort} de ${year}`,
      time: timeStr
    };
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 bg-white border-2 rounded-xl text-left
          flex items-center gap-3 transition-all
          ${isOpen 
            ? 'border-primary-500 ring-2 ring-primary-500/20' 
            : error 
              ? 'border-red-400 bg-red-50/30' 
              : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          {date && formatDisplayValue() ? (
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium text-sm">
                {formatDisplayValue()?.date}
              </span>
              <span className="text-primary-600 font-semibold text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDisplayValue()?.time}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        {date && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDateChange('');
              onTimeChange('');
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-[340px] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-lg">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-0 bg-gray-50 border-b border-gray-100">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold text-gray-500 uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 p-2">
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square p-0.5">
                {day !== null ? (
                  <button
                    type="button"
                    onClick={() => !isDateDisabled(day) && handleDayClick(day)}
                    disabled={isDateDisabled(day)}
                    className={`
                      w-full h-full rounded-lg flex items-center justify-center
                      text-sm font-medium transition-all
                      ${isSelected(day)
                        ? 'bg-primary-600 text-white shadow-md'
                        : isToday(day)
                          ? 'bg-primary-100 text-primary-700 font-bold'
                          : isDateDisabled(day)
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {day}
                  </button>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            ))}
          </div>

          {/* Time Selector */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Horário</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={use24Hour}
                  onChange={() => setUse24Hour(!use24Hour)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Formato 24h
              </label>
            </div>

            <div className="flex items-center gap-2 justify-center">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleHourChange((hours + 1) % 24)}
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 rotate-90 text-gray-400" />
                </button>
                <input
                  type="text"
                  value={use24Hour ? String(hours).padStart(2, '0') : String(hours % 12 || 12).padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleHourChange(Math.min(23, Math.max(0, val)));
                  }}
                  className="w-14 h-12 text-center text-xl font-bold bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleHourChange((hours - 1 + 24) % 24)}
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 -rotate-90 text-gray-400" />
                </button>
              </div>

              <span className="text-2xl font-bold text-gray-400 mb-1">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleMinuteChange((minutes + 5) % 60)}
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 rotate-90 text-gray-400" />
                </button>
                <input
                  type="text"
                  value={String(minutes).padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleMinuteChange(Math.min(59, Math.max(0, val)));
                  }}
                  className="w-14 h-12 text-center text-xl font-bold bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleMinuteChange((minutes - 5 + 60) % 60)}
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 -rotate-90 text-gray-400" />
                </button>
              </div>

              {/* AM/PM Toggle (when not 24h) */}
              {!use24Hour && (
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() => hours < 12 && handleHourChange(hours + 12)}
                    className={`
                      px-3 py-1.5 text-xs font-semibold rounded-md transition-colors
                      ${hours >= 12
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }
                    `}
                  >
                    PM
                  </button>
                  <button
                    type="button"
                    onClick={() => hours >= 12 && handleHourChange(hours - 12)}
                    className={`
                      px-3 py-1.5 text-xs font-semibold rounded-md transition-colors
                      ${hours < 12
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }
                    `}
                  >
                    AM
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 p-3 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (!date) {
                  // Set today as default
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  onDateChange(`${year}-${month}-${day}`);
                }
                if (!time) {
                  onTimeChange('19:00');
                }
                setIsOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
