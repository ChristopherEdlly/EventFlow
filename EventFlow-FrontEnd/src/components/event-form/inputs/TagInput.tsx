import React, { useState, useRef, KeyboardEvent } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  suggestions?: string[];
  error?: string;
}

const DEFAULT_SUGGESTIONS = [
  'tecnologia', 'networking', 'gratuito', 'workshop', 'palestras',
  'startup', 'inovação', 'carreira', 'educação', 'negócios',
  'design', 'marketing', 'vendas', 'liderança', 'empreendedorismo',
];

export default function TagInput({ 
  value, 
  onChange, 
  maxTags = 10,
  suggestions = DEFAULT_SUGGESTIONS,
  error 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/[^a-záàâãéèêíïóôõöúçñ0-9\s-]/gi, '');
    
    if (!normalizedTag) return;
    if (value.includes(normalizedTag)) return;
    if (value.length >= maxTags) return;

    onChange([...value, normalizedTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      const lastTag = value[value.length - 1];
      if (lastTag) removeTag(lastTag);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Check for comma to add tag
    if (newValue.includes(',')) {
      const tags = newValue.split(',');
      tags.forEach(tag => {
        if (tag.trim()) addTag(tag);
      });
      return;
    }

    setInputValue(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  ).slice(0, 6);

  const availableSuggestions = suggestions.filter(s => !value.includes(s)).slice(0, 8);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Tags
        <span className="font-normal text-gray-400 ml-1">({value.length}/{maxTags})</span>
      </label>

      {/* Tags Container */}
      <div 
        className={`
          min-h-[52px] p-2 bg-gray-50 border rounded-xl
          focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent
          transition-all
          ${error ? 'border-red-300' : 'border-gray-200'}
        `}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-2">
          {/* Existing Tags */}
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-sm font-medium group animate-fadeIn"
            >
              <span>#</span>
              <span>{tag}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-primary-200 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}

          {/* Input */}
          {value.length < maxTags && (
            <div className="relative flex-1 min-w-[120px]">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={value.length === 0 ? "Digite e pressione Enter..." : "Adicionar..."}
                className="w-full py-1 px-2 bg-transparent outline-none text-gray-900 placeholder-gray-400"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-10 py-1 animate-fadeIn">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addTag(suggestion)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-gray-400">#</span>
                      <span className="text-gray-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Quick Suggestions */}
      {value.length < maxTags && availableSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Sugestões populares:</p>
          <div className="flex flex-wrap gap-1.5">
            {availableSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTag(suggestion)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Pressione <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> ou{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">,</kbd> para adicionar uma tag.
      </p>
    </div>
  );
}
