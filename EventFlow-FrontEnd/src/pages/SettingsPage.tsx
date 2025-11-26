import React, { useState, useEffect } from 'react';
import { api, type ApiError } from '../services/api';
import PageHeader from '../components/PageHeader';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    eventReminders: true,
    guestUpdates: true,
    marketingEmails: false,
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement settings save API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSuccessMessage('Configurações salvas com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Gerencie suas preferências e configurações da conta"
        breadcrumb="Dashboard / Configurações"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      />

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-emerald-800">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Notificações por E-mail</p>
                  <p className="text-sm text-gray-600">Receba atualizações por e-mail sobre seus eventos</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 text-teal-600 focus:ring-teal-500 rounded"
                />
              </label>

              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Lembretes de Eventos</p>
                    <p className="text-sm text-gray-600">Receba lembretes antes dos seus eventos</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.eventReminders}
                    onChange={(e) => setSettings({ ...settings, eventReminders: e.target.checked })}
                    className="w-5 h-5 text-teal-600 focus:ring-teal-500 rounded"
                  />
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Atualizações de Convidados</p>
                    <p className="text-sm text-gray-600">Seja notificado quando convidados confirmarem presença</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.guestUpdates}
                    onChange={(e) => setSettings({ ...settings, guestUpdates: e.target.checked })}
                    className="w-5 h-5 text-teal-600 focus:ring-teal-500 rounded"
                  />
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">E-mails de Marketing</p>
                    <p className="text-sm text-gray-600">Receba dicas, novidades e promoções</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.marketingEmails}
                    onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                    className="w-5 h-5 text-teal-600 focus:ring-teal-500 rounded"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferências</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuso Horário
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="Europe/Paris">Paris (GMT+1)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacidade e Segurança</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Alterar Senha</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Sessões Ativas</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Exportar Dados</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Limpar Cache
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Relatar Problema
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Central de Ajuda
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-semibold text-red-900 mb-2">Zona de Perigo</h3>
            <p className="text-sm text-red-700 mb-4">Ações irreversíveis que afetam sua conta</p>
            <button className="w-full px-4 py-2 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm">
              Excluir Conta
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>
    </div>
  );
}
