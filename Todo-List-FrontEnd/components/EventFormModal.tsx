import React, { useState } from 'react';
import { eventsService, type CreateEventDto } from '../services/events';
import type { ApiError } from '../services/api';

interface EventFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventFormModal({ onClose, onSuccess }: EventFormModalProps) {
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    visibility: 'PUBLIC',
    capacity: undefined,
    allowWaitlist: false,
    requireApproval: false,
  });
  const [guestEmails, setGuestEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const event = await eventsService.createEvent(formData);

      // Add guests if emails were provided
      if (guestEmails.trim()) {
        const emails = guestEmails
          .split(/[,\n]/)
          .map(email => email.trim())
          .filter(email => email.length > 0);

        if (emails.length > 0) {
          try {
            await eventsService.addGuestsByEmail(event.id, emails);
          } catch (err) {
            console.error('Failed to add guests:', err);
            // Don't fail the whole operation if guests fail
          }
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Criar Novo Evento</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Título do Evento *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Ex: Festa de Aniversário"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Descrição
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Descreva seu evento..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Horário
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Local
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Endereço do evento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Visibilidade
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' })}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            >
              <option value="PUBLIC">Público - Qualquer pessoa pode ver</option>
              <option value="PRIVATE">Privado - Apenas convidados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Capacidade (opcional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Número máximo de pessoas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Convidar pessoas (opcional)
            </label>
            <textarea
              rows={4}
              value={guestEmails}
              onChange={(e) => setGuestEmails(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Digite os emails separados por vírgula ou quebra de linha&#10;Ex: joao@email.com, maria@email.com"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Digite os emails dos convidados separados por vírgula ou quebra de linha
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.allowWaitlist}
                onChange={(e) => setFormData({ ...formData, allowWaitlist: e.target.checked })}
                className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">Permitir lista de espera</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">Requer aprovação para participar</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Criando...' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
