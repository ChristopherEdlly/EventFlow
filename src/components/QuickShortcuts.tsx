import React from 'react';

export interface Shortcut {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  description?: string;
}

interface QuickShortcutsProps {
  shortcuts: Shortcut[];
}

export default function QuickShortcuts({ shortcuts }: QuickShortcutsProps) {
  const getColorClasses = (color: Shortcut['color'] = 'primary') => {
    switch (color) {
      case 'primary':
        return {
          bg: 'from-primary-500 to-primary-600',
          hover: 'hover:from-primary-600 hover:to-primary-700',
          text: 'text-primary-700',
          bgLight: 'bg-primary-50',
        };
      case 'success':
        return {
          bg: 'from-success-500 to-success-600',
          hover: 'hover:from-success-600 hover:to-success-700',
          text: 'text-success-700',
          bgLight: 'bg-success-50',
        };
      case 'warning':
        return {
          bg: 'from-warning-500 to-warning-600',
          hover: 'hover:from-warning-600 hover:to-warning-700',
          text: 'text-warning-700',
          bgLight: 'bg-warning-50',
        };
      case 'error':
        return {
          bg: 'from-error-500 to-error-600',
          hover: 'hover:from-error-600 hover:to-error-700',
          text: 'text-error-700',
          bgLight: 'bg-error-50',
        };
      case 'info':
        return {
          bg: 'from-info-500 to-info-600',
          hover: 'hover:from-info-600 hover:to-info-700',
          text: 'text-info-700',
          bgLight: 'bg-info-50',
        };
      case 'secondary':
        return {
          bg: 'from-secondary-500 to-secondary-600',
          hover: 'hover:from-secondary-600 hover:to-secondary-700',
          text: 'text-secondary-700',
          bgLight: 'bg-secondary-50',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-4 sm:p-6">
      <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Ações Rápidas
      </h3>

      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => {
          const colors = getColorClasses(shortcut.color);
          return (
            <button
              key={index}
              onClick={shortcut.onClick}
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${colors.bgLight} hover:shadow-md transition-all duration-200 group border-2 border-transparent hover:border-${shortcut.color || 'primary'}-200`}
            >
              {/* Ícone */}
              <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${colors.bg} ${colors.hover} text-white rounded-lg flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {shortcut.icon}
              </div>

              {/* Texto */}
              <div className="flex-1 text-left">
                <p className={`font-semibold ${colors.text} group-hover:translate-x-1 transition-transform duration-200`}>
                  {shortcut.label}
                </p>
                {shortcut.description && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {shortcut.description}
                  </p>
                )}
              </div>

              {/* Seta */}
              <svg className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
