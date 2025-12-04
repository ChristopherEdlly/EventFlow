import React from 'react';
import { CATEGORIES, CategoryOption } from '../types';
import type { EventCategory } from '../../../services/events';

interface CategorySelectorProps {
  value: EventCategory;
  onChange: (category: EventCategory) => void;
  error?: string;
}

export default function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Categoria do Evento
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.value}
            category={category}
            isSelected={value === category.value}
            onClick={() => onChange(category.value)}
          />
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

interface CategoryCardProps {
  category: CategoryOption;
  isSelected: boolean;
  onClick: () => void;
}

function CategoryCard({ category, isSelected, onClick }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative p-3 rounded-xl border-2 transition-all duration-200 text-left
        ${isSelected 
          ? `bg-primary-50 border-primary-500 ring-2 ring-offset-2 ring-primary-500/30 scale-[1.02]`
          : `bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm`
        }
      `}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center shadow-md">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xl">{category.icon}</span>
        <span className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
          {category.label}
        </span>
      </div>
    </button>
  );
}
