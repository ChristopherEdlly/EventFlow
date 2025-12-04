import React from 'react';
import { StepProps } from '../types';
import CategorySelector from '../inputs/CategorySelector';

export default function BasicInfoStep({ formData, updateFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Como se chama seu evento?</h2>
        <p className="mt-1 text-sm text-gray-500">
          Escolha um nome atrativo e selecione a categoria
        </p>
      </div>

      {/* Title - Campo principal destacado */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
          Nome do Evento
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="Ex: Conferência Anual de Tecnologia 2025"
          maxLength={100}
          autoFocus
          className={`
            w-full px-4 py-3.5 bg-white border-2 rounded-xl
            text-gray-900 placeholder-gray-400 text-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            transition-all
            ${errors?.title ? 'border-red-400 bg-red-50/30 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'}
          `}
        />
        <div className="flex items-center justify-between">
          {errors?.title ? (
            <p className="text-sm text-red-600 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.title}
            </p>
          ) : formData.title.length > 0 && formData.title.length < 3 ? (
            <p className="text-sm text-amber-600 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              O nome precisa ter pelo menos 3 caracteres
            </p>
          ) : (
            <span className="text-xs text-gray-400">Mínimo 3 caracteres</span>
          )}
          <span className={`text-xs font-medium ${formData.title.length > 80 ? 'text-amber-500' : formData.title.length >= 3 ? 'text-green-500' : 'text-gray-400'}`}>
            {formData.title.length}/100
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="pt-2">
        <CategorySelector
          value={formData.category}
          onChange={(category) => updateFormData({ category })}
          error={errors?.category}
        />
      </div>
    </div>
  );
}
