import React from 'react';
import { StepProps } from '../types';
import ImageUploader from '../inputs/ImageUploader';
import TagInput from '../inputs/TagInput';

export default function MediaTagsStep({ formData, updateFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          Mídia e Tags
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Adicione uma imagem e tags para destacar seu evento
        </p>
      </div>

      {/* Image Uploader */}
      <ImageUploader
        value={formData.imageUrl}
        onChange={(imageUrl) => updateFormData({ imageUrl })}
        error={errors?.imageUrl}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-sm text-gray-500">Tags</span>
        </div>
      </div>

      {/* Tag Input */}
      <TagInput
        value={formData.tags}
        onChange={(tags) => updateFormData({ tags })}
        error={errors?.tags}
      />

      {/* Tips Card */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-pink-900">Aumente a visibilidade do evento</h4>
            <ul className="mt-2 text-xs text-pink-700 space-y-1">
              <li className="flex items-start gap-1.5">
                <span className="text-pink-400">•</span>
                Use tags relevantes para aparecer em buscas
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-pink-400">•</span>
                Imagens em formato 16:9 ficam melhores nos cards
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
