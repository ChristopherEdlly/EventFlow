import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
];

export default function ImageUploader({ value, onChange, error }: ImageUploaderProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (url: string) => {
    setPreviewError(false);
    onChange(url);
    
    if (url) {
      setIsValidating(true);
      // Validate URL by trying to load the image
      const img = new Image();
      img.onload = () => {
        setIsValidating(false);
        setPreviewError(false);
      };
      img.onerror = () => {
        setIsValidating(false);
        setPreviewError(true);
      };
      img.src = url;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          // TODO: Implement file upload to server
          // For now, just show a message
          console.log('Image paste detected - upload feature coming soon');
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Imagem do Evento
      </label>

      {/* URL Input */}
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="url"
              value={value}
              onChange={(e) => handleUrlChange(e.target.value)}
              onPaste={handlePaste}
              placeholder="Cole a URL da imagem ou escolha uma sugestão"
              className={`
                w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-xl
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all
                ${error || previewError ? 'border-red-300' : 'border-gray-200'}
              `}
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setPreviewError(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {isValidating && (
          <p className="mt-1.5 text-sm text-gray-500 flex items-center gap-1.5">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Validando imagem...
          </p>
        )}

        {previewError && !isValidating && (
          <p className="mt-1.5 text-sm text-amber-600 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Não foi possível carregar a imagem. Verifique a URL.
          </p>
        )}

        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>

      {/* Preview */}
      {value && !previewError && !isValidating && (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Suggestions Toggle */}
      <button
        type="button"
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
      >
        <svg className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {showSuggestions ? 'Ocultar sugestões' : 'Ver imagens sugeridas'}
      </button>

      {/* Suggestions Grid */}
      {showSuggestions && (
        <div className="grid grid-cols-3 gap-2 animate-fadeIn">
          {PLACEHOLDER_IMAGES.map((url, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleUrlChange(url)}
              className={`
                relative aspect-video rounded-lg overflow-hidden
                ring-2 transition-all
                ${value === url ? 'ring-primary-500 ring-offset-2' : 'ring-transparent hover:ring-gray-300'}
              `}
            >
              <img
                src={url}
                alt={`Sugestão ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {value === url && (
                <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        💡 Dica: Use imagens de alta qualidade no formato paisagem (16:9) para melhor visualização.
      </p>
    </div>
  );
}
