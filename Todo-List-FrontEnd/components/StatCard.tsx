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
    primary: 'from-primary-500 to-secondary-500 text-white',
    success: 'from-success-500 to-success-600 text-white',
    warning: 'from-warning-500 to-warning-600 text-white',
    error: 'from-error-500 to-error-600 text-white',
    info: 'from-info-500 to-info-600 text-white',
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg shadow-md`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-success-600' : 'text-error-600'}`}>
            <svg className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}
