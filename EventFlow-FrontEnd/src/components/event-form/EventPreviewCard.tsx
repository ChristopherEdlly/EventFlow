import React from 'react';
import { EventFormData, CATEGORIES, MODALITIES } from './types';

interface EventPreviewCardProps {
  formData: EventFormData;
  currentStep: number;
}

export default function EventPreviewCard({ formData, currentStep }: EventPreviewCardProps) {
  const category = CATEGORIES.find(c => c.value === formData.category);
  const modality = MODALITIES.find(m => m.value === formData.eventType);
  const completion = calculateCompletion(formData);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return null;
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Mini Card Preview - Simula como vai aparecer */}
      <div className="relative">
        {/* Image Area */}
        <div className="relative h-32 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 overflow-hidden">
          {formData.imageUrl ? (
            <img 
              src={formData.imageUrl} 
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-3xl">{category?.icon || '📅'}</span>
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            {/* Category */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-700 shadow-sm">
              <span className="text-sm">{category?.icon}</span>
              <span>{category?.label || 'Categoria'}</span>
            </span>

            {/* Visibility */}
            <span className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm
              ${formData.visibility === 'PUBLIC' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-amber-500 text-white'
              }
            `}>
              {formData.visibility === 'PUBLIC' ? '🌐 Público' : '🔒 Privado'}
            </span>
          </div>

          {/* Title on image */}
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className={`font-bold text-white text-lg leading-tight drop-shadow-md ${
              !formData.title && 'opacity-60'
            }`}>
              {formData.title || 'Nome do Evento'}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Date & Location Row */}
          <div className="flex items-center gap-3 text-sm">
            <div className={`flex items-center gap-1.5 ${formData.date ? 'text-gray-700' : 'text-gray-400'}`}>
              <span className="text-primary-500">📅</span>
              <span className="font-medium">{formatDate(formData.date) || 'Sem data'}</span>
              {formData.time && <span className="text-gray-400">• {formData.time}</span>}
            </div>
          </div>

          {/* Location */}
          <div className={`flex items-center gap-1.5 text-sm ${
            formData.location || formData.onlineUrl ? 'text-gray-700' : 'text-gray-400'
          }`}>
            <span className="text-emerald-500">📍</span>
            <span className="truncate">
              {formData.eventType === 'ONLINE' 
                ? (formData.onlineUrl || 'Link não definido')
                : (formData.location || 'Local não definido')
              }
            </span>
          </div>

          {/* Modality & Price Row */}
          <div className="flex items-center justify-between pt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600`}>
              {modality?.icon} {modality?.label}
            </span>
            <span className={`text-sm font-semibold ${
              formData.price === 0 ? 'text-emerald-600' : 'text-primary-600'
            }`}>
              {formatPrice(formData.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="px-3 py-2.5 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">Preenchimento</span>
          <span className={`text-xs font-bold ${
            completion >= 80 ? 'text-emerald-600' : completion >= 50 ? 'text-amber-600' : 'text-gray-500'
          }`}>
            {completion}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              completion >= 80 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                : completion >= 50 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-primary-500 to-primary-400'
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1 text-center">
          {completion < 50 && 'Adicione mais informações ao evento'}
          {completion >= 50 && completion < 80 && 'Quase lá! Continue preenchendo'}
          {completion >= 80 && completion < 100 && 'Ótimo! Evento quase completo'}
          {completion === 100 && '✨ Evento completo!'}
        </p>
      </div>
    </div>
  );
}

function calculateCompletion(formData: EventFormData): number {
  const fields = [
    { weight: 25, filled: !!formData.title },
    { weight: 10, filled: !!formData.description },
    { weight: 5, filled: formData.category !== 'OUTRO' },
    { weight: 20, filled: !!formData.date },
    { weight: 15, filled: !!formData.location || formData.eventType === 'ONLINE' },
    { weight: 10, filled: !!formData.onlineUrl || formData.eventType === 'PRESENCIAL' },
    { weight: 10, filled: !!formData.imageUrl },
    { weight: 5, filled: formData.tags.length > 0 },
  ];

  const completed = fields.reduce((acc, field) => acc + (field.filled ? field.weight : 0), 0);
  return Math.min(completed, 100);
}
