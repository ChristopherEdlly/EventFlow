import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: string; // padrão: "text-primary-600"
  actions?: React.ReactNode;
  breadcrumb?: string;
  onBack?: () => void;
  children?: React.ReactNode; // Para controles integrados
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  iconColor = 'text-primary-600',
  actions,
  breadcrumb,
  onBack,
  children,
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      {/* Linha principal: sempre presente */}
      <div className={`px-6 py-4 ${children ? 'border-b border-gray-100' : ''}`}>
        {breadcrumb && (
          <div className="text-sm text-gray-500 mb-2">{breadcrumb}</div>
        )}

        {onBack && (
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Voltar</span>
          </button>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {icon && (
              <div className={iconColor}>
                {icon}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Linha de controles: opcional via children */}
      {children && (
        <div className="px-6 py-3">
          {children}
        </div>
      )}
    </div>
  );
}
