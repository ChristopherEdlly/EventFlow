import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { ApiError } from '../services/api';
import Toast from '../components/Toast';

interface ResetPasswordPageProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordPage({ email, onBack, onSuccess }: ResetPasswordPageProps) {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      showNotification('Digite o código de 6 dígitos', 'error');
      return;
    }

    try {
      setIsVerifying(true);
      await api.verifyResetCode(email, code);
      setCodeVerified(true);
      showNotification('Código verificado! Agora defina sua nova senha.', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Código inválido ou expirado', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('As senhas não coincidem', 'error');
      return;
    }

    try {
      setIsResetting(true);
      const response = await api.resetPassword(email, code, newPassword);
      showNotification(response.message, 'success');

      // Aguardar um pouco e redirecionar para login
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao redefinir senha', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await api.forgotPassword(email);
      showNotification(response.message, 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao reenviar código', 'error');
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
                {codeVerified ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                )}
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              {codeVerified ? 'Definir nova senha' : 'Verificar código'}
            </h1>
            <p className="text-neutral-600">
              {codeVerified ? (
                'Escolha uma senha forte e segura'
              ) : (
                <>
                  Digite o código de 6 dígitos enviado para <strong>{email}</strong>
                </>
              )}
            </p>
          </div>

          {!codeVerified ? (
            /* Step 1: Verify Code */
            <div className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-2">
                  Código de Verificação
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white text-neutral-900 text-center text-2xl font-mono tracking-widest placeholder-neutral-400 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  disabled={isVerifying}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleResendCode}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Reenviar código
                </button>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isVerifying || code.length !== 6}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isVerifying ? 'Verificando...' : 'Verificar código'}
              </button>
            </div>
          ) : (
            /* Step 2: Set New Password */
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    disabled={isResetting}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    disabled={isResetting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isResetting || !newPassword || !confirmPassword}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResetting && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isResetting ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
            </form>
          )}

          {/* Back */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Voltar
            </button>
          </div>
        </div>

        {/* Info */}
        {!codeVerified && (
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Não recebeu o código? Verifique sua caixa de spam
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
