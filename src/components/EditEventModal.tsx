import React, { useState, useEffect, useRef } from 'react';
import { eventsService, type Event, type UpdateEventDto } from '../services/events';
import type { ApiError } from '../services/api';

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEventModal({ event, onClose, onSuccess }: EditEventModalProps) {
  const [formData, setFormData] = useState<UpdateEventDto>({
    title: event.title,
    description: event.description || '',
    date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    time: event.time || '',
    endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : undefined,
    endTime: event.endTime || undefined,
    location: event.location || '',
    visibility: event.visibility,
    capacity: event.capacity || undefined,
    waitlistEnabled: event.waitlistEnabled || false,
    showGuestList: event.showGuestList || false,
    timezone: event.timezone || '',
    // Novos campos
    category: event.category,
    eventType: event.eventType,
    price: event.price,
    minAge: event.minAge || undefined,
    imageUrl: event.imageUrl || '',
    onlineUrl: event.onlineUrl || '',
    tags: event.tags || '',
  });
  const [status, setStatus] = useState(event.availability || 'PUBLISHED');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await eventsService.updateEvent(event.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Falha ao atualizar evento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Editar Evento</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Status atual do evento */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
            ${status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
              status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
              'bg-gray-50 text-gray-500'}
          `}>
            {status === 'PUBLISHED' ? 'Publicado' :
              status === 'CANCELLED' ? 'Cancelado' :
              status === 'COMPLETED' ? 'Concluído' :
              'Indefinido'}
          </span>
          {status === 'PUBLISHED' && (
            <button
              type="button"
              className="ml-4 px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition"
              onClick={async () => {
                setIsLoading(true);
                try {
                  await eventsService.updateEvent(event.id, { availability: 'CANCELLED' });
                  setStatus('CANCELLED');
                  onSuccess();
                } catch (err) {
                  setError('Erro ao cancelar evento');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              Cancelar Evento
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Fuso horário
                      </label>
                      <input
                        type="text"
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder="Ex: America/Sao_Paulo"
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.waitlistEnabled}
                          onChange={(e) => setFormData({ ...formData, waitlistEnabled: e.target.checked })}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700">Permitir lista de espera</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.showGuestList}
                          onChange={(e) => setFormData({ ...formData, showGuestList: e.target.checked })}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700">Mostrar lista de convidados</span>
                      </label>
                    </div>
          {/* ...existing code... */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Título do Evento *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
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
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Descreva seu evento..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Data e Hora de Início *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Data e Hora de Fim
              </label>
              <input
                type="datetime-local"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                placeholder="Opcional"
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
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
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
              className="w-full px-4 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
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
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Número máximo de pessoas"
            />
          </div>

          {/* Novos Campos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              >
                <option value="CONFERENCIA">Conferência</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="PALESTRA">Palestra</option>
                <option value="FESTA">Festa</option>
                <option value="ESPORTIVO">Esportivo</option>
                <option value="CULTURAL">Cultural</option>
                <option value="EDUCACIONAL">Educacional</option>
                <option value="NETWORKING">Networking</option>
                <option value="CORPORATIVO">Corporativo</option>
                <option value="BENEFICENTE">Beneficente</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Modalidade
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                className="w-full px-4 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="ONLINE">Online</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Preço (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Idade Mínima
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.minAge || ''}
                onChange={(e) => setFormData({ ...formData, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                placeholder="Opcional"
              />
            </div>
          </div>

          {(formData.eventType === 'ONLINE' || formData.eventType === 'HIBRIDO') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Link Online
              </label>
              <input
                type="url"
                value={formData.onlineUrl}
                onChange={(e) => setFormData({ ...formData, onlineUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                placeholder="https://meet.google.com/abc-defg-hij"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              URL da Imagem/Banner
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Ex: tecnologia, networking, gratuito"
            />
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
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
