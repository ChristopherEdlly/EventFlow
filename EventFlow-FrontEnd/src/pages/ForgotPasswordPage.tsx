import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { ApiError } from '../services/api';
import Toast from '../components/Toast';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onCodeSent: (email: string) => void;
}

export default function ForgotPasswordPage({ onBack, onCodeSent }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showNotification('Digite seu email', 'error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Email inválido', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.forgotPassword(email);
      showNotification(response.message, 'success');

      // Aguardar um pouco e redirecionar para página de reset
      setTimeout(() => {
        onCodeSent(email);
      }, 1500);
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao solicitar recuperação de senha', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      {/* Toast Notifications */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Esqueceu sua senha?
            </h1>
            <p className="text-neutral-600">
              Digite seu email e enviaremos um código de 6 dígitos para recuperar sua senha.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Voltar para login
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            O código expira em 15 minutos
          </p>
        </div>
      </motion.div>
    </div>
  );
}
