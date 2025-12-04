import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { eventsService, type Event } from '../services/events';
import type { ApiError } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import GradientHeader from '../components/GradientHeader';
import { HeaderSkeleton, EventGridSkeleton } from '../components/Skeleton';
import EnhancedEmptyState from '../components/EnhancedEmptyState';

interface MyEventsPageProps {
  onViewEvent: (eventId: string) => void;
}

export default function MyEventsPage({ onViewEvent }: MyEventsPageProps) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; eventId: string | null }>({ isOpen: false, eventId: null });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsService.getMyEvents();
      setEvents(data);
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Failed to load events:', apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteModal.eventId) return;

    try {
      await eventsService.deleteEvent(deleteModal.eventId);
      await loadEvents();
      setDeleteModal({ isOpen: false, eventId: null });
    } catch (err) {
      const apiError = err as ApiError;
      alert('Erro ao excluir evento: ' + apiError.message);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const eventDate = new Date(event.date);
      const now = new Date();
      if (dateFilter === 'upcoming') {
        matchesDate = eventDate > now;
      } else if (dateFilter === 'past') {
        matchesDate = eventDate < now;
      }
    }

    return matchesSearch && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex gap-4 animate-pulse">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
            <div className="w-40 h-10 bg-gray-200 rounded-lg" />
            <div className="w-40 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <EventGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GradientHeader
        title="Meus Eventos"
        subtitle="Gerencie todos os seus eventos"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        stats={[
          { value: events.length, label: 'Total' },
          { value: events.filter(e => e.availability === 'PUBLISHED').length, label: 'Publicados' },
        ]}
        actions={
          <button
            onClick={() => navigate('/new-event')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Criar Evento
          </button>
        }
      />

      {/* Filtros e Controles */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome do evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Status: Todos</option>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="CANCELLED">Cancelado</option>
            <option value="COMPLETED">Passado</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Data: Todas</option>
            <option value="upcoming">Próximos</option>
            <option value="past">Passados</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Visualização em lista"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Visualização em grade"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Events Table/Grid */}
      {filteredEvents.length === 0 ? (
        <EnhancedEmptyState
          title={searchTerm ? 'Nenhum evento encontrado' : 'Você ainda não tem eventos'}
          description={searchTerm 
            ? 'Tente buscar com outros termos ou ajuste os filtros'
            : 'Crie seu primeiro evento e comece a organizar suas reuniões, festas e encontros!'
          }
          icon={
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          action={!searchTerm ? {
            label: 'Criar Primeiro Evento',
            onClick: () => navigate('/new-event'),
          } : undefined}
          secondaryAction={searchTerm ? {
            label: 'Limpar Busca',
            onClick: () => setSearchTerm(''),
          } : undefined}
        />
      ) : viewMode === 'list' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 overflow-x-auto"
        >
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data e Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Local
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscritos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event, index) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{event.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(event.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}, {event.time || '09:00'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {event.location || 'Online'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                      ${event.availability === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                        event.availability === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        event.availability === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                        'bg-gray-50 text-gray-500'}
                    `}>
                      {event.availability === 'PUBLISHED' ? 'Publicado' :
                        event.availability === 'CANCELLED' ? 'Cancelado' :
                        event.availability === 'COMPLETED' ? 'Concluído' :
                        'Indefinido'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {event._count?.guests || 0}/{event.capacity || 200}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const viewportHeight = window.innerHeight;
                          const spaceBelow = viewportHeight - rect.bottom;
                          const menuHeight = 150; // altura aproximada do menu

                          // Decide se abre para cima ou para baixo
                          const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

                          setMenuPosition({
                            top: openUpwards ? rect.top - menuHeight : rect.bottom + 8,
                            right: window.innerWidth - rect.right
                          });
                          setOpenMenuId(openMenuId === event.id ? null : event.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === event.id && menuPosition && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => {
                              setOpenMenuId(null);
                              setMenuPosition(null);
                            }}
                          ></div>
                          <div
                            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                            style={{
                              top: `${menuPosition.top}px`,
                              right: `${menuPosition.right}px`
                            }}
                          >
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setMenuPosition(null);
                                onViewEvent(event.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver Detalhes
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setMenuPosition(null);
                                navigate(`/edit-event/${event.id}`);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar Evento
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setMenuPosition(null);
                                setDeleteModal({ isOpen: true, eventId: event.id });
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Excluir Evento
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEvents.map((event, index) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            // Formatar data
            const formattedDate = (() => {
              let dateObj;
              if (event.time) {
                const [hour, minute] = event.time.split(':');
                dateObj = new Date(Date.UTC(
                  eventDate.getUTCFullYear(),
                  eventDate.getUTCMonth(),
                  eventDate.getUTCDate(),
                  Number(hour),
                  Number(minute)
                ));
              } else {
                dateObj = new Date(Date.UTC(
                  eventDate.getUTCFullYear(),
                  eventDate.getUTCMonth(),
                  eventDate.getUTCDate()
                ));
              }
              return {
                day: dateObj.getUTCDate(),
                month: dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
                weekday: dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }),
                full: dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
              };
            })();
            
            // Calcular ocupação
            const guestCount = event._count?.guests || 0;
            const occupancyPercent = event.capacity ? Math.min((guestCount / event.capacity) * 100, 100) : 0;
            
            // Status badge
            const getStatusBadge = () => {
              switch (event.availability) {
                case 'PUBLISHED':
                  return { bg: 'bg-emerald-500', text: 'Publicado', icon: '✓' };
                case 'CANCELLED':
                  return { bg: 'bg-red-500', text: 'Cancelado', icon: '✕' };
                case 'COMPLETED':
                  return { bg: 'bg-gray-500', text: 'Concluído', icon: '✓' };
                default:
                  return { bg: 'bg-amber-500', text: 'Rascunho', icon: '✎' };
              }
            };
            const statusBadge = getStatusBadge();
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden group cursor-pointer transition-all duration-300 ${
                  isPast 
                    ? 'opacity-70 border-gray-200' 
                    : 'border-gray-200 hover:border-primary-300 hover:shadow-xl'
                }`}
              >
                {/* Image Area - Header */}
                <div className="relative h-32 overflow-hidden">
                  {/* Imagem customizada ou gradiente padrão */}
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500" />
                      {/* Ícone central decorativo */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-2xl">📅</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Badges no topo */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    {/* Badge esquerdo - Status */}
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white shadow-sm ${statusBadge.bg}`}>
                      {statusBadge.icon} {statusBadge.text}
                    </span>

                    {/* Badge direito - Visibilidade */}
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                      event.visibility === 'PUBLIC' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-amber-500 text-white'
                    }`}>
                      {event.visibility === 'PUBLIC' ? '🌐 Público' : '🔒 Privado'}
                    </span>
                  </div>

                  {/* Título sobre a imagem */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <h3 className="font-bold text-white text-lg leading-tight drop-shadow-md line-clamp-1">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 space-y-3">
                  {/* Data & Hora */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary-500">📅</span>
                    <span className="font-medium text-gray-700 capitalize">
                      {formattedDate.weekday}, {formattedDate.full}
                    </span>
                    {event.time && (
                      <span className="text-gray-400">• {event.time}</span>
                    )}
                  </div>

                  {/* Local */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-500 flex-shrink-0">📍</span>
                    <span className={`truncate max-w-[180px] ${event.location ? 'text-gray-700' : 'text-gray-400 italic'}`} title={event.location || undefined}>
                      {event.location || 'Online'}
                    </span>
                  </div>

                  {/* Participantes & Vagas */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-500">👥</span>
                      <span className="text-gray-600">
                        {guestCount} {guestCount === 1 ? 'inscrito' : 'inscritos'}
                      </span>
                    </div>
                    {event.capacity && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        occupancyPercent >= 90 
                          ? 'bg-red-100 text-red-700' 
                          : occupancyPercent >= 70 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {event.capacity - guestCount > 0 
                          ? `${event.capacity - guestCount} vagas`
                          : 'Lotado'
                        }
                      </span>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewEvent(event.id);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-event/${event.id}`);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg font-medium text-sm bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ isOpen: true, eventId: event.id });
                      }}
                      className="py-2 px-3 rounded-lg font-medium text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, eventId: null })}
        onConfirm={handleDeleteEvent}
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita e todos os dados relacionados serão permanentemente removidos."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
