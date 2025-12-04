import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export default function StatCard({ title, value, icon, trend, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: {
      border: 'border-t-primary-500',
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-500',
      iconOpacity: 'text-primary-500/10',
    },
    success: {
      border: 'border-t-success-500',
      iconBg: 'bg-success-50',
      iconColor: 'text-success-500',
      iconOpacity: 'text-success-500/10',
    },
    warning: {
      border: 'border-t-warning-500',
      iconBg: 'bg-warning-50',
      iconColor: 'text-warning-500',
      iconOpacity: 'text-warning-500/10',
    },
    error: {
      border: 'border-t-error-500',
      iconBg: 'bg-error-50',
      iconColor: 'text-error-500',
      iconOpacity: 'text-error-500/10',
    },
    info: {
      border: 'border-t-info-500',
      iconBg: 'bg-info-50',
      iconColor: 'text-info-500',
      iconOpacity: 'text-info-500/10',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`relative bg-white rounded-lg shadow border border-neutral-200 ${colors.border} border-t-4 p-3 hover:shadow-lg transition-all duration-300 overflow-hidden group`}>
      {/* Ícone grande transparente no fundo */}
      <div className={`absolute -bottom-2 -right-2 ${colors.iconOpacity} transition-all duration-300 group-hover:scale-105 group-hover:rotate-3`}>
        <div className="w-16 h-16">
          {icon}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          {/* Ícone pequeno colorido */}
          <div className={`flex items-center justify-center w-8 h-8 ${colors.iconBg} ${colors.iconColor} rounded-md shadow-sm transition-all duration-300 group-hover:scale-105`}>
            {icon}
          </div>

          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${trend.isPositive ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>
              <svg className={`w-2 h-2 ${trend.isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {trend.value}
            </div>
          )}
        </div>

        {/* Número menor */}
        <div className="mb-1">
          <p className="text-3xl font-bold text-neutral-900 tracking-tight transition-all duration-300 group-hover:scale-105">
            {value}
          </p>
        </div>

        {/* Título menor */}
        <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
          {title}
        </p>
      </div>
    </div>
  );
}
