import React from 'react';
import { MODALITIES } from '../types';
import type { EventType } from '../../../services/events';

interface ModalitySelectorProps {
  value: EventType;
  onChange: (modality: EventType) => void;
  error?: string;
}

export default function ModalitySelector({ value, onChange, error }: ModalitySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Modalidade do Evento
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MODALITIES.map((modality) => (
          <button
            key={modality.value}
            type="button"
            onClick={() => onChange(modality.value)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${value === modality.value
                ? 'bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-400 ring-2 ring-primary-200'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            {/* Selected Indicator */}
            {value === modality.value && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="text-2xl mb-2">{modality.icon}</span>
              <span className={`font-semibold ${value === modality.value ? 'text-primary-700' : 'text-gray-900'}`}>
                {modality.label}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">
                {modality.description}
              </span>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
