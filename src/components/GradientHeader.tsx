import React from 'react';

interface StatItem {
  value: number | string;
  label: string;
}

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stats?: StatItem[];
  actions?: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'success' | 'warning';
  variant?: 'default' | 'welcome'; // welcome = estilo simplificado para saudação
  onBack?: () => void;
}

const gradients = {
  primary: 'from-primary-600 via-primary-700 to-primary-800',
  secondary: 'from-secondary-600 via-secondary-700 to-secondary-800',
  success: 'from-emerald-600 via-emerald-700 to-teal-700',
  warning: 'from-amber-500 via-orange-500 to-orange-600',
};

export default function GradientHeader({
  title,
  subtitle,
  icon,
  stats,
  actions,
  gradient = 'primary',
  variant = 'default',
  onBack,
}: GradientHeaderProps) {
  // Variante "welcome" - saudação com gradiente
  if (variant === 'welcome') {
    return (
      <div className={`bg-gradient-to-br ${gradients[gradient]} rounded-2xl p-6 text-white shadow-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {icon && (
                <div className="p-2 bg-white/20 rounded-xl">
                  {icon}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
            </div>
            {subtitle && (
              <p className="text-white/80 text-sm">{subtitle}</p>
            )}
          </div>

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="hidden md:flex items-center gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center px-4 py-2 bg-white/10 rounded-xl">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="ml-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variante padrão - com gradiente
  return (
    <div className={`bg-gradient-to-br ${gradients[gradient]} rounded-2xl p-6 text-white shadow-xl`}>
      {/* Botão Voltar */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Voltar</span>
        </button>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon && (
              <div className="p-2 bg-white/20 rounded-xl">
                {icon}
              </div>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-white/80 text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="hidden md:flex items-center gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4 py-2 bg-white/10 rounded-xl">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
