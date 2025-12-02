import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'simple' | 'illustrated';
  size?: 'sm' | 'md' | 'lg';
}

// Ilustrações SVG para diferentes estados vazios
const illustrations = {
  noEvents: (
    <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" fill="url(#gradient1)" fillOpacity="0.1"/>
      <rect x="50" y="60" width="100" height="80" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
      <rect x="50" y="60" width="100" height="24" rx="8" fill="url(#gradient1)"/>
      <circle cx="70" cy="72" r="4" fill="white" fillOpacity="0.5"/>
      <circle cx="85" cy="72" r="4" fill="white" fillOpacity="0.5"/>
      <rect x="62" y="96" width="76" height="8" rx="4" fill="#E5E7EB"/>
      <rect x="62" y="112" width="50" height="8" rx="4" fill="#E5E7EB"/>
      <path d="M130 130L145 145" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="122" cy="122" r="12" stroke="#9CA3AF" strokeWidth="3" fill="none"/>
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  noInvites: (
    <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" fill="url(#gradient2)" fillOpacity="0.1"/>
      <rect x="40" y="70" width="120" height="80" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
      <path d="M40 85L100 115L160 85" stroke="url(#gradient2)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M40 78L100 108L160 78" stroke="#E5E7EB" strokeWidth="2"/>
      <circle cx="150" cy="60" r="20" fill="url(#gradient2)"/>
      <path d="M145 60L148 63L155 56" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  noResults: (
    <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" fill="url(#gradient3)" fillOpacity="0.1"/>
      <circle cx="90" cy="90" r="35" stroke="#E5E7EB" strokeWidth="4" fill="white"/>
      <circle cx="90" cy="90" r="25" stroke="url(#gradient3)" strokeWidth="3" fill="none" strokeDasharray="8 4"/>
      <path d="M115 115L145 145" stroke="url(#gradient3)" strokeWidth="6" strokeLinecap="round"/>
      <path d="M80 85L85 90L95 80" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      <defs>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#EF4444"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  error: (
    <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" fill="#FEE2E2" fillOpacity="0.5"/>
      <circle cx="100" cy="100" r="50" fill="white" stroke="#FECACA" strokeWidth="3"/>
      <circle cx="100" cy="100" r="40" fill="#FEF2F2"/>
      <path d="M100 75V105" stroke="#EF4444" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="100" cy="120" r="4" fill="#EF4444"/>
    </svg>
  ),
};

export default function EnhancedEmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-16 h-16',
      illustration: 'w-24 h-24',
      title: 'text-base',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-20 h-20',
      illustration: 'w-32 h-32',
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-5 py-2.5 text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-24 h-24',
      illustration: 'w-40 h-40',
      title: 'text-xl',
      description: 'text-base',
      button: 'px-6 py-3 text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 ${sizes.container} text-center`}>
      <div className="max-w-md mx-auto px-6">
        {/* Icon ou Ilustração */}
        {variant === 'illustrated' ? (
          <div className={`${sizes.illustration} mx-auto mb-6`}>
            {icon || illustrations.noEvents}
          </div>
        ) : icon ? (
          <div className={`${sizes.icon} mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center`}>
            <div className="text-primary-600">
              {icon}
            </div>
          </div>
        ) : (
          <div className={`${sizes.icon} mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center`}>
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        )}

        {/* Título */}
        <h3 className={`${sizes.title} font-semibold text-gray-900 mb-2`}>
          {title}
        </h3>

        {/* Descrição */}
        {description && (
          <p className={`${sizes.description} text-gray-500 mb-6 leading-relaxed`}>
            {description}
          </p>
        )}

        {/* Ações */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {action && (
              <button
                onClick={action.onClick}
                className={`${sizes.button} bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all inline-flex items-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className={`${sizes.button} bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all`}
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Exportar ilustrações para uso externo
export { illustrations as emptyStateIllustrations };
