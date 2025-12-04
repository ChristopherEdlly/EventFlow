import React, { useState, useEffect } from 'react';
import { eventsService, type Announcement } from '../services/events';
import type { ApiError } from '../services/api';
import ConfirmDialog from './ConfirmDialog';

interface AnnouncementSectionProps {
  eventId: string;
  isOwner: boolean;
}

export default function AnnouncementSection({ eventId, isOwner }: AnnouncementSectionProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await eventsService.getEventAnnouncements(eventId);
      setAnnouncements(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Falha ao carregar anúncios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) {
      setError('A mensagem não pode estar vazia');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await eventsService.createAnnouncement(eventId, trimmedMessage);
      setNewMessage('');
      setShowModal(false);
      await loadAnnouncements();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Falha ao criar anúncio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAnnouncement = async () => {
    const trimmedMessage = editMessage.trim();
    if (!editingAnnouncement || !trimmedMessage) {
      setError('A mensagem não pode estar vazia');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await eventsService.updateAnnouncement(eventId, editingAnnouncement.id, trimmedMessage);
      setEditingAnnouncement(null);
      setEditMessage('');
      await loadAnnouncements();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Falha ao editar anúncio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deletingAnnouncement) return;

    setIsDeleting(true);
    setError('');

    try {
      await eventsService.deleteAnnouncement(eventId, deletingAnnouncement.id);
      setDeletingAnnouncement(null);
      await loadAnnouncements();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Falha ao deletar anúncio');
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setEditMessage(announcement.message);
  };

  return (
    <div className="mt-8 pt-8 border-t border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-neutral-900">
          Anúncios e Notícias
        </h3>
        {isOwner && (
          <button
            onClick={() => {
              setError('');
              setNewMessage('');
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-info-600 hover:bg-info-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Novo Anúncio
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          <p className="text-neutral-600 mt-2">Carregando anúncios...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg">
          <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p className="text-neutral-600 font-medium">Nenhum anúncio ainda</p>
          <p className="text-neutral-500 text-sm mt-1">
            {isOwner ? 'Crie o primeiro anúncio para informar os convidados' : 'Aguarde anúncios do organizador'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-info-50 border border-info-200 rounded-lg p-4 relative"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-info-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-900 font-medium mb-1">{announcement.message}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(announcement.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(announcement)}
                      className="p-2 text-neutral-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                      title="Editar anúncio"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingAnnouncement(announcement)}
                      className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                      title="Deletar anúncio"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Novo Anúncio
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-800">{error}</p>
              </div>
            )}

            <p className="text-neutral-600 mb-4">
              Envie uma mensagem para todos os convidados do evento:
            </p>

            <textarea
              rows={5}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-transparent transition-all outline-none mb-4"
              disabled={isSubmitting}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewMessage('');
                  setError('');
                }}
                className="flex-1 py-3 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-info-600 hover:bg-info-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {editingAnnouncement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Editar Anúncio
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-800">{error}</p>
              </div>
            )}

            <p className="text-neutral-600 mb-4">
              Edite a mensagem do anúncio:
            </p>

            <textarea
              rows={5}
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-info-500 focus:border-transparent transition-all outline-none mb-4"
              disabled={isSubmitting}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingAnnouncement(null);
                  setEditMessage('');
                  setError('');
                }}
                className="flex-1 py-3 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleEditAnnouncement}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-info-600 hover:bg-info-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Announcement Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingAnnouncement}
        title="Excluir Anúncio"
        message={`Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteAnnouncement}
        onCancel={() => setDeletingAnnouncement(null)}
      />
    </div>
  );
}
