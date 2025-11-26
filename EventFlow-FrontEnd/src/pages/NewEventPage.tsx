import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsService } from '../services/events';
import type { ApiError } from '../services/api';
import PageHeader from '../components/PageHeader';

interface NewEventPageProps {
  onBack: () => void;
}

export default function NewEventPage({ onBack }: NewEventPageProps) {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organizer: '',
    date: '',
    endDate: '',
    location: '',
    time: '',
    endTime: '',
    state: 'DRAFT' as const,
    visibility: 'PUBLIC' as const,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.date) {
      setError('Preencha os campos obrigatórios');
      return;
    }

    try {
      setIsSaving(true);
      await eventsService.createEvent({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        endDate: formData.endDate || undefined,
        time: formData.time || undefined,
        endTime: formData.endTime || undefined,
        location: formData.location,
        visibility: formData.visibility,
      });
      onBack();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao criar evento');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Cadastrar Novo Evento"
        subtitle="Preencha os detalhes abaixo para criar um novo evento"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
        onBack={onBack}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Detalhes do Evento */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Detalhes do Evento</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Evento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Conferência Anual de Tecnologia"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Detalhada
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descreva o propósito, a agenda e os destaques do evento."
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizador Responsável
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => handleChange('organizer', e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Cronograma e Local */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Cronograma e Local</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora de Fim
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local (Endereço ou Link Virtual)
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ex: Av. Paulista, 1000, São Paulo - SP ou link zoom.us/j/1234"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Gerenciamento */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Gerenciamento</h2>

          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibilidade
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC"
                    checked={formData.visibility === 'PUBLIC'}
                    onChange={(e) => handleChange('visibility', e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Público</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE"
                    checked={formData.visibility !== 'PUBLIC'}
                    onChange={(e) => handleChange('visibility', e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Privado</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            {isSaving && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
