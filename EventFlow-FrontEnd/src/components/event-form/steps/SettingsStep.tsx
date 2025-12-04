import React from 'react';
import { StepProps } from '../types';

export default function SettingsStep({ formData, updateFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          Configurações
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure preço, capacidade e outras opções
        </p>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Preço do Ingresso
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 font-medium">R$</span>
          </div>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => updateFormData({ price: parseFloat(e.target.value) || 0 })}
            placeholder="0,00"
            className={`
              w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl
              text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              transition-all
              ${errors?.price ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}
            `}
          />
          {formData.price === 0 && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Gratuito
              </span>
            </div>
          )}
        </div>
        {errors?.price ? (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.price}
          </p>
        ) : (
          <p className="text-xs text-gray-400">Use 0 para eventos gratuitos</p>
        )}
      </div>

      {/* Capacity & Min Age Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Capacity */}
        <div className="space-y-2">
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacidade Máxima
            <span className="font-normal text-gray-400 ml-1">(opcional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => updateFormData({ capacity: e.target.value })}
              placeholder="Ilimitado"
              className={`
                w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all
                ${errors?.capacity ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}
              `}
            />
          </div>
          {errors?.capacity && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.capacity}
            </p>
          )}
        </div>

        {/* Min Age */}
        <div className="space-y-2">
          <label htmlFor="minAge" className="block text-sm font-medium text-gray-700">
            Idade Mínima
            <span className="font-normal text-gray-400 ml-1">(opcional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="minAge"
              type="number"
              min="0"
              max="120"
              value={formData.minAge}
              onChange={(e) => updateFormData({ minAge: e.target.value })}
              placeholder="Livre"
              className={`
                w-full pl-10 pr-16 py-3 bg-gray-50 border rounded-xl
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all
                ${errors?.minAge ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}
              `}
            />
            {formData.minAge && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-sm text-gray-500">anos</span>
              </div>
            )}
          </div>
          {errors?.minAge && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.minAge}
            </p>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-700">Opções Adicionais</p>
        
        {/* Waitlist */}
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Lista de Espera</p>
              <p className="text-xs text-gray-500">Permitir inscrições após lotação</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.waitlistEnabled}
              onChange={(e) => updateFormData({ waitlistEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary-600 peer-focus:ring-4 peer-focus:ring-primary-200 transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>

        {/* Show Guest List */}
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Exibir Lista de Convidados</p>
              <p className="text-xs text-gray-500">Participantes podem ver quem mais vai</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.showGuestList}
              onChange={(e) => updateFormData({ showGuestList: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary-600 peer-focus:ring-4 peer-focus:ring-primary-200 transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>
    </div>
  );
}
