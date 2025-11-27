import React, { useState } from 'react';
import { eventsService, type Guest, type GuestStatus } from '../services/events';
import type { ApiError } from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';
import Dropdown, { type DropdownOption } from './Dropdown';

interface GuestListProps {
  guests: Guest[];
  eventId: string;
  isOwner: boolean;
  onGuestsChanged: () => void;
  eventTitle?: string;
}

export default function GuestList({ guests, eventId, isOwner, onGuestsChanged, eventTitle }: GuestListProps) {
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<GuestStatus | 'ALL'>('ALL');
  const [reminderGuest, setReminderGuest] = useState<Guest | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleStartEdit = (guest: Guest) => {
    setEditingGuestId(guest.id);
    setEditName(guest.name);
  };

  const handleCancelEdit = () => {
    setEditingGuestId(null);
    setEditName('');
  };

  const handleSaveEdit = async (guestId: string) => {
    if (!editName.trim()) {
      showNotification('O nome n�o pode estar vazio', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      await eventsService.updateGuestName(eventId, guestId, editName.trim());
      showNotification('Nome atualizado com sucesso!', 'success');
      setEditingGuestId(null);
      setEditName('');
      onGuestsChanged();
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao atualizar nome', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGuest = async () => {
    if (!guestToDelete) return;

    try {
      setIsUpdating(true);
      await eventsService.removeGuest(eventId, guestToDelete.id);
      showNotification('Convidado removido com sucesso!', 'success');
      setGuestToDelete(null);
      onGuestsChanged();
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao remover convidado', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendInvite = async (guest: Guest) => {
    try {
      setIsUpdating(true);
      await eventsService.sendInviteToGuest(eventId, guest.id);
      showNotification(`Convite reenviado para ${guest.email}!`, 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao reenviar convite', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendReminder = async () => {
    if (!reminderGuest) {
      return;
    }

    setIsSendingReminder(true);
    try {
      await eventsService.sendReminderToGuest(eventId, reminderGuest.id);
      showNotification(`Lembrete enviado para ${reminderGuest.email}!`, 'success');
      setReminderGuest(null);
      setReminderMessage('');
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao enviar lembrete', 'error');
    } finally {
      setIsSendingReminder(false);
    }
  };

  const toggleGuestSelection = (guestId: string) => {
    const newSelection = new Set(selectedGuests);
    if (newSelection.has(guestId)) {
      newSelection.delete(guestId);
    } else {
      newSelection.add(guestId);
    }
    setSelectedGuests(newSelection);
  };

  const selectAllGuests = () => {
    if (selectedGuests.size === filteredGuests.length) {
      setSelectedGuests(new Set());
    } else {
      setSelectedGuests(new Set(filteredGuests.map(g => g.id)));
    }
  };

  const handleBulkReminder = async () => {
    if (selectedGuests.size === 0) {
      showNotification('Selecione pelo menos um convidado', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      const result = await eventsService.sendBulkReminders(eventId);
      showNotification(result.message, result.failed > 0 ? 'error' : 'success');
      setSelectedGuests(new Set());
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao enviar lembretes', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGuests.size === 0) {
      showNotification('Selecione pelo menos um convidado', 'error');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja remover ${selectedGuests.size} convidado(s)?`)) {
      return;
    }

    try {
      setIsUpdating(true);
      for (const guestId of selectedGuests) {
        await eventsService.removeGuest(eventId, guestId);
      }
      showNotification(`${selectedGuests.size} convidado(s) removido(s) com sucesso!`, 'success');
      setSelectedGuests(new Set());
      onGuestsChanged();
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao remover convidados', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getGuestActions = (guest: Guest): DropdownOption[] => [
    {
      label: 'Editar Nome',
      value: 'edit',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: () => handleStartEdit(guest),
    },
    {
      label: 'Reenviar Convite',
      value: 'resend',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => handleResendInvite(guest),
    },
    {
      label: 'Enviar Lembrete',
      value: 'reminder',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      onClick: () => setReminderGuest(guest),
    },
    {
      label: 'Remover',
      value: 'delete',
      variant: 'danger',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: () => setGuestToDelete(guest),
    },
  ];

  const getStatusBadge = (status: GuestStatus) => {
    const statusConfig = {
      YES: { label: 'Confirmado', color: 'bg-success-100 text-success-700 border-success-200' },
      NO: { label: 'Recusou', color: 'bg-error-100 text-error-700 border-error-200' },
      MAYBE: { label: 'Talvez', color: 'bg-warning-100 text-warning-700 border-warning-200' },
      PENDING: { label: 'Pendente', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
      WAITLISTED: { label: 'Lista de Espera', color: 'bg-info-100 text-info-700 border-info-200' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N�o respondeu';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportCSV = () => {
    const statusLabels = {
      YES: 'Confirmado',
      NO: 'Recusou',
      MAYBE: 'Talvez',
      PENDING: 'Pendente',
      WAITLISTED: 'Lista de Espera',
    };

    const csv = [
      ['Nome', 'Email', 'Status', 'Motivo da Recusa', 'Respondeu em', 'Convidado em'].join(','),
      ...guests.map(g => [
        `"${g.name}"`,
        g.email,
        statusLabels[g.status] || g.status,
        g.declineReason ? `"${g.declineReason.replace(/"/g, '""')}"` : '',
        g.respondedAt ? new Date(g.respondedAt).toLocaleString('pt-BR') : 'Não respondeu',
        new Date(g.createdAt).toLocaleString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM for Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `convidados_${eventTitle?.replace(/\s+/g, '_') || 'evento'}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Lista exportada com sucesso!', 'success');
  };

  // Filter and search guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || guest.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: guests.length,
    yes: guests.filter(g => g.status === 'YES').length,
    no: guests.filter(g => g.status === 'NO').length,
    maybe: guests.filter(g => g.status === 'MAYBE').length,
    pending: guests.filter(g => g.status === 'PENDING').length,
  };

  return (
    <div className="space-y-4">
      {/* Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
          <div className="text-xs text-neutral-500 font-medium">Total</div>
          <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
        </div>
        <div className="bg-success-50 rounded-lg p-3 border border-success-200">
          <div className="text-xs text-success-600 font-medium">Confirmados</div>
          <div className="text-2xl font-bold text-success-700">{stats.yes}</div>
        </div>
        <div className="bg-error-50 rounded-lg p-3 border border-error-200">
          <div className="text-xs text-error-600 font-medium">Recusaram</div>
          <div className="text-2xl font-bold text-error-700">{stats.no}</div>
        </div>
        <div className="bg-warning-50 rounded-lg p-3 border border-warning-200">
          <div className="text-xs text-warning-600 font-medium">Talvez</div>
          <div className="text-2xl font-bold text-warning-700">{stats.maybe}</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
          <div className="text-xs text-neutral-500 font-medium">Pendentes</div>
          <div className="text-2xl font-bold text-neutral-700">{stats.pending}</div>
        </div>
      </div>

      {/* Search, Filter and Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as GuestStatus | 'ALL')}
          className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          <option value="ALL">Todos os status</option>
          <option value="YES">Confirmados</option>
          <option value="NO">Recusaram</option>
          <option value="MAYBE">Talvez</option>
          <option value="PENDING">Pendentes</option>
          <option value="WAITLISTED">Lista de Espera</option>
        </select>
        {guests.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {isOwner && selectedGuests.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary-900">
              {selectedGuests.size} convidado(s) selecionado(s)
            </span>
            <button
              onClick={() => setSelectedGuests(new Set())}
              className="text-sm text-primary-700 hover:text-primary-900"
            >
              Limpar seleção
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkReminder}
              className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Enviar Lembrete
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors flex items-center gap-2"
              disabled={isUpdating}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remover
            </button>
          </div>
        </div>
      )}

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
          <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-2 text-neutral-600">
            {searchTerm || filterStatus !== 'ALL' ? 'Nenhum convidado encontrado com os filtros aplicados' : 'Nenhum convidado ainda'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  {isOwner && (
                    <th className="px-3 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                        onChange={selectAllGuests}
                        className="w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Convidado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                    Respondeu em
                  </th>
                  {isOwner && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-neutral-50 transition-colors">
                    {isOwner && (
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedGuests.has(guest.id)}
                          onChange={() => toggleGuestSelection(guest.id)}
                          className="w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingGuestId === guest.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 border border-primary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{guest.name}</div>
                          <div className="text-sm text-neutral-500">{guest.email}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(guest.status)}
                        {guest.status === 'NO' && guest.declineReason && (
                          <button
                            onClick={() => {
                              window.alert(`Motivo da recusa:\n\n${guest.declineReason}`);
                            }}
                            className="text-error-600 hover:text-error-800 transition-colors"
                            title="Ver motivo da recusa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 hidden sm:table-cell">
                      {formatDate(guest.respondedAt)}
                      {guest.status === 'NO' && guest.declineReason && (
                        <div className="text-xs text-error-600 mt-1 max-w-xs truncate" title={guest.declineReason}>
                          📝 {guest.declineReason}
                        </div>
                      )}
                    </td>
                    {isOwner && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingGuestId === guest.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSaveEdit(guest.id)}
                              disabled={isUpdating}
                              className="text-success-600 hover:text-success-900 disabled:opacity-50"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              className="text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <Dropdown
                            trigger={
                              <button className="text-neutral-500 hover:text-neutral-700 p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                            }
                            options={getGuestActions(guest)}
                          />
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!guestToDelete}
        title="Remover Convidado"
        message={`Tem certeza que deseja remover ${guestToDelete?.name}? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteGuest}
        onCancel={() => setGuestToDelete(null)}
        variant="danger"
        isLoading={isUpdating}
      />

      {/* Reminder Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!reminderGuest}
        title="Enviar Lembrete"
        message={`Tem certeza que deseja enviar um lembrete por email para ${reminderGuest?.name} (${reminderGuest?.email})?`}
        confirmLabel="Enviar Lembrete"
        cancelLabel="Cancelar"
        onConfirm={handleSendReminder}
        onCancel={() => {
          setReminderGuest(null);
          setReminderMessage('');
        }}
        variant="primary"
        isLoading={isSendingReminder}
      />

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
