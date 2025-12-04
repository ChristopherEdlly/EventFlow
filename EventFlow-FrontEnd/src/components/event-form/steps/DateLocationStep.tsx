import React from 'react';
import { StepProps } from '../types';
import ModalitySelector from '../inputs/ModalitySelector';
import DateTimePicker from '../inputs/DateTimePicker';
import LocationPicker from '../inputs/LocationPicker';

export default function DateLocationStep({ formData, updateFormData, errors }: StepProps) {
  const needsLocation = formData.eventType === 'PRESENCIAL' || formData.eventType === 'HIBRIDO';
  const needsOnlineUrl = formData.eventType === 'ONLINE' || formData.eventType === 'HIBRIDO';

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          Data e Local
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Defina quando e onde o evento acontecerá
        </p>
      </div>

      {/* Modality */}
      <ModalitySelector
        value={formData.eventType}
        onChange={(eventType) => updateFormData({ eventType })}
        error={errors?.eventType}
      />

      {/* Date and Time Pickers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start DateTime */}
        <div className="relative">
          <DateTimePicker
            date={formData.date}
            time={formData.time}
            onDateChange={(date) => updateFormData({ date })}
            onTimeChange={(time) => updateFormData({ time })}
            minDate={new Date().toISOString().split('T')[0]}
            label="Início do Evento"
            required
            error={errors?.date || errors?.time}
            placeholder="Quando começa seu evento?"
          />
        </div>

        {/* End DateTime */}
        <div className="relative">
          <DateTimePicker
            date={formData.endDate}
            time={formData.endTime}
            onDateChange={(endDate) => updateFormData({ endDate })}
            onTimeChange={(endTime) => updateFormData({ endTime })}
            minDate={formData.date || new Date().toISOString().split('T')[0]}
            label="Término do Evento"
            placeholder="Quando termina? (opcional)"
          />
        </div>
      </div>

      {/* Location - Shows for PRESENCIAL or HIBRIDO */}
      {needsLocation && (
        <div className="animate-fadeIn">
          <LocationPicker
            location={formData.location}
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={(location, lat, lng) => 
              updateFormData({ location, latitude: lat, longitude: lng })
            }
            error={errors?.location}
          />
        </div>
      )}

      {/* Online URL - Shows for ONLINE or HIBRIDO */}
      {needsOnlineUrl && (
        <div className="space-y-2 animate-fadeIn">
          <label htmlFor="onlineUrl" className="block text-sm font-medium text-gray-700">
            Link da Transmissão <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="onlineUrl"
              type="url"
              value={formData.onlineUrl}
              onChange={(e) => updateFormData({ onlineUrl: e.target.value })}
              placeholder="https://meet.google.com/xxx-xxxx-xxx ou zoom.us/j/123456"
              className={`
                w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all
                ${errors?.onlineUrl ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}
              `}
            />
          </div>
          {errors?.onlineUrl ? (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.onlineUrl}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                <span>🎥</span> Google Meet
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                <span>📹</span> Zoom
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                <span>🟣</span> Teams
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                <span>🔴</span> YouTube
              </span>
            </div>
          )}
        </div>
      )}

      {/* Helper Info */}
      {formData.eventType === 'HIBRIDO' && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100 animate-fadeIn">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">🌐</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-900">Evento Híbrido</h4>
              <p className="mt-1 text-xs text-purple-700">
                Seu evento acontecerá tanto presencialmente quanto online.
                Preencha o endereço físico e o link da transmissão para que 
                os participantes possam escolher como participar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
