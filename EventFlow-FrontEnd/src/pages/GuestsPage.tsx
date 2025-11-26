import React, { useState, useEffect } from 'react';
import { eventsService, type Guest, type Event } from '../services/events';
import type { ApiError } from '../services/api';

interface GuestsPageProps {
  eventId: string;
  onBack: () => void;
}

export default function GuestsPage({ eventId, onBack }: GuestsPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [eventData, guestsData] = await Promise.all([
        eventsService.getEvent(eventId),
        eventsService.getEventGuests(eventId),
      ]);
      setEvent(eventData as Event);
      setGuests(guestsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGuest = async () => {
    if (!newGuestEmail.trim()) return;

    try {
      setIsAdding(true);
      await eventsService.addGuestsByEmail(eventId, [newGuestEmail]);
      setNewGuestEmail('');
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message || 'Erro ao adicionar convidado');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.status === 'YES').length,
    pending: guests.filter((g) => g.status === 'PENDING').length,
    declined: guests.filter((g) => g.status === 'NO').length,
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      YES: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Confirmado' },
      NO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Recusado' },
      PENDING: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pendente' },
      MAYBE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Talvez' },
    };

    const badge = badges[status] ?? badges.PENDING;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge!.bg} ${badge!.text}`}>
        {badge!.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button onClick={onBack} className="hover:text-teal-600">
            Eventos
          </button>
          <span>/</span>
          <button onClick={onBack} className="hover:text-teal-600">
            {event?.title}
          </button>
          <span>/</span>
          <span className="text-gray-900">Convidados</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Convidados</h1>
        <p className="text-gray-600 mt-1">
          Adicione, importe e gerencie a lista de convidados para o seu evento.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Total de Convidados</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <div className="text-sm font-medium text-emerald-700 mb-1">Confirmados</div>
          <div className="text-3xl font-bold text-emerald-700">{stats.confirmed}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Pendentes</div>
          <div className="text-3xl font-bold text-gray-700">{stats.pending}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-sm font-medium text-red-700 mb-1">Recusados</div>
          <div className="text-3xl font-bold text-red-700">{stats.declined}</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="all">Todos</option>
              <option value="YES">Confirmados</option>
              <option value="PENDING">Pendentes</option>
              <option value="NO">Recusados</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Importar Lista
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Convidado
            </button>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome do Convidado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Nenhum convidado encontrado
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{guest.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{guest.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(guest.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Reenviar convite">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Remover">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Exibindo 1-{filteredGuests.length} de {filteredGuests.length}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Anterior</button>
            <button className="px-3 py-1 text-sm bg-teal-500 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">2</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">3</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Próximo</button>
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Adicionar Convidado</h3>
            <p className="text-sm text-gray-600 mb-4">
              Digite o email do convidado:
            </p>
            <input
              type="email"
              value={newGuestEmail}
              onChange={(e) => setNewGuestEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewGuestEmail('');
                }}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGuest}
                disabled={isAdding || !newGuestEmail.trim()}
                className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
