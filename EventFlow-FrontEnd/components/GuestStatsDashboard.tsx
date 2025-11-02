import React from 'react';
import { type Guest } from '../services/events';

interface GuestStatsDashboardProps {
  guests: Guest[];
}

export default function GuestStatsDashboard({ guests }: GuestStatsDashboardProps) {
  // Calculate statistics
  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'YES').length,
    declined: guests.filter(g => g.status === 'NO').length,
    maybe: guests.filter(g => g.status === 'MAYBE').length,
    pending: guests.filter(g => g.status === 'PENDING' || !g.status).length,
    waitlisted: guests.filter(g => g.status === 'WAITLISTED').length,
    declined_with_reason: guests.filter(g => g.status === 'NO' && g.declineReason).length,
  };

  const responseRate = stats.total > 0
    ? Math.round(((stats.confirmed + stats.declined + stats.maybe) / stats.total) * 100)
    : 0;

  // Calculate percentages for pie chart
  const getPercentage = (count: number) => stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-white to-neutral-50 rounded-xl shadow-lg border border-neutral-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Estatísticas de Respostas
        </h2>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-600">{responseRate}%</div>
          <div className="text-sm text-neutral-600">Taxa de Resposta</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">Progresso de Respostas</span>
          <span className="text-sm text-neutral-600">
            {stats.confirmed + stats.declined + stats.maybe} de {stats.total} responderam
          </span>
        </div>
        <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-success-500 to-success-600 transition-all duration-500 ease-out"
            style={{ width: `${responseRate}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Confirmed */}
        <div className="bg-success-50 border border-success-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-2xl font-bold text-success-700">{stats.confirmed}</span>
          </div>
          <div className="text-sm font-medium text-success-800">Confirmados</div>
          <div className="text-xs text-success-600 mt-1">{getPercentage(stats.confirmed)}% do total</div>
        </div>

        {/* Declined */}
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-2xl font-bold text-error-700">{stats.declined}</span>
          </div>
          <div className="text-sm font-medium text-error-800">Recusaram</div>
          <div className="text-xs text-error-600 mt-1">
            {getPercentage(stats.declined)}% do total
            {stats.declined_with_reason > 0 && (
              <span className="block mt-1">
                📝 {stats.declined_with_reason} com motivo
              </span>
            )}
          </div>
        </div>

        {/* Pending */}
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-2xl font-bold text-warning-700">{stats.pending}</span>
          </div>
          <div className="text-sm font-medium text-warning-800">Aguardando</div>
          <div className="text-xs text-warning-600 mt-1">{getPercentage(stats.pending)}% do total</div>
        </div>

        {/* Maybe */}
        <div className="bg-info-50 border border-info-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <svg className="w-8 h-8 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-2xl font-bold text-info-700">{stats.maybe}</span>
          </div>
          <div className="text-sm font-medium text-info-800">Talvez</div>
          <div className="text-xs text-info-600 mt-1">{getPercentage(stats.maybe)}% do total</div>
        </div>

        {/* Total */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-2xl font-bold text-primary-700">{stats.total}</span>
          </div>
          <div className="text-sm font-medium text-primary-800">Total</div>
          <div className="text-xs text-primary-600 mt-1">Convidados</div>
        </div>
      </div>

      {/* Visual Chart - Simple Bar */}
      {stats.total > 0 && (
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Distribuição Visual</h3>
          <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden">
            {stats.confirmed > 0 && (
              <div
                className="h-full bg-success-500 flex items-center justify-center text-white text-xs font-bold transition-all hover:brightness-110"
                style={{ width: `${getPercentage(stats.confirmed)}%` }}
                title={`${stats.confirmed} Confirmados (${getPercentage(stats.confirmed)}%)`}
              >
                {getPercentage(stats.confirmed) > 10 && `${getPercentage(stats.confirmed)}%`}
              </div>
            )}
            {stats.declined > 0 && (
              <div
                className="h-full bg-error-500 flex items-center justify-center text-white text-xs font-bold transition-all hover:brightness-110"
                style={{ width: `${getPercentage(stats.declined)}%` }}
                title={`${stats.declined} Recusaram (${getPercentage(stats.declined)}%)`}
              >
                {getPercentage(stats.declined) > 10 && `${getPercentage(stats.declined)}%`}
              </div>
            )}
            {stats.maybe > 0 && (
              <div
                className="h-full bg-info-500 flex items-center justify-center text-white text-xs font-bold transition-all hover:brightness-110"
                style={{ width: `${getPercentage(stats.maybe)}%` }}
                title={`${stats.maybe} Talvez (${getPercentage(stats.maybe)}%)`}
              >
                {getPercentage(stats.maybe) > 10 && `${getPercentage(stats.maybe)}%`}
              </div>
            )}
            {stats.pending > 0 && (
              <div
                className="h-full bg-warning-400 flex items-center justify-center text-white text-xs font-bold transition-all hover:brightness-110"
                style={{ width: `${getPercentage(stats.pending)}%` }}
                title={`${stats.pending} Aguardando (${getPercentage(stats.pending)}%)`}
              >
                {getPercentage(stats.pending) > 10 && `${getPercentage(stats.pending)}%`}
              </div>
            )}
            {stats.waitlisted > 0 && (
              <div
                className="h-full bg-neutral-400 flex items-center justify-center text-white text-xs font-bold transition-all hover:brightness-110"
                style={{ width: `${getPercentage(stats.waitlisted)}%` }}
                title={`${stats.waitlisted} Lista de Espera (${getPercentage(stats.waitlisted)}%)`}
              >
                {getPercentage(stats.waitlisted) > 10 && `${getPercentage(stats.waitlisted)}%`}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-success-500 rounded"></div>
              <span className="text-neutral-600">Confirmados</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-error-500 rounded"></div>
              <span className="text-neutral-600">Recusaram</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-info-500 rounded"></div>
              <span className="text-neutral-600">Talvez</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-warning-400 rounded"></div>
              <span className="text-neutral-600">Aguardando</span>
            </div>
            {stats.waitlisted > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-neutral-400 rounded"></div>
                <span className="text-neutral-600">Lista de Espera</span>
              </div>
            )}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="text-center py-8 text-neutral-500">
          <svg className="w-16 h-16 mx-auto mb-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm">Nenhum convidado ainda</p>
          <p className="text-xs mt-1">Adicione convidados para ver as estatísticas</p>
        </div>
      )}
    </div>
  );
}
