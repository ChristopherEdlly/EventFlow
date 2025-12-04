import React from 'react';
import { StepProps } from '../types';

export default function DetailsStep({ formData, updateFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Conte mais sobre o evento</h2>
        <p className="mt-1 text-sm text-gray-500">
          Adicione uma descrição e defina quem pode ver seu evento
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
          Descrição
          <span className="font-normal text-gray-400 ml-1">(opcional, mas recomendado)</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="O que as pessoas podem esperar? Quem são os palestrantes? Qual é a programação?"
          rows={4}
          maxLength={2000}
          className={`
            w-full px-4 py-3 bg-white border-2 rounded-xl
            text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            transition-all resize-none
            ${errors?.description ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}
          `}
        />
        <div className="flex items-center justify-between">
          <span></span>
          <span className={`text-xs font-medium ${formData.description.length > 1800 ? 'text-amber-500' : 'text-gray-400'}`}>
            {formData.description.length}/2000
          </span>
        </div>
      </div>

      {/* Visibility */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Quem pode ver este evento?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Public */}
          <button
            type="button"
            onClick={() => updateFormData({ visibility: 'PUBLIC' })}
            className={`
              relative p-4 rounded-xl border-2 text-left transition-all
              ${formData.visibility === 'PUBLIC'
                ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-xl
                ${formData.visibility === 'PUBLIC' ? 'bg-primary-100' : 'bg-gray-100'}
              `}>
                🌐
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${formData.visibility === 'PUBLIC' ? 'text-primary-700' : 'text-gray-700'}`}>
                  Público
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Qualquer pessoa pode encontrar e se inscrever
                </p>
              </div>
              {formData.visibility === 'PUBLIC' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>

          {/* Private */}
          <button
            type="button"
            onClick={() => updateFormData({ visibility: 'PRIVATE' })}
            className={`
              relative p-4 rounded-xl border-2 text-left transition-all
              ${formData.visibility === 'PRIVATE'
                ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-xl
                ${formData.visibility === 'PRIVATE' ? 'bg-amber-100' : 'bg-gray-100'}
              `}>
                🔒
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${formData.visibility === 'PRIVATE' ? 'text-amber-700' : 'text-gray-700'}`}>
                  Privado
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Apenas convidados podem ver e participar
                </p>
              </div>
              {formData.visibility === 'PRIVATE' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
