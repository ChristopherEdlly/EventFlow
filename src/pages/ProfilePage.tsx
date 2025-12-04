import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { ApiError } from '../services/api';
import Toast from '../components/Toast';
import GradientHeader from '../components/GradientHeader';
import { HeaderSkeleton } from '../components/Skeleton';

interface ProfilePageProps {
  onBack: () => void;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  authProvider: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit profile form
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change password form
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Email verification
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Delete account
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProfile();
      setProfile(data);
      setEditName(data.name);
      setEditEmail(data.email);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim() || !editEmail.trim()) {
      showNotification('Preencha todos os campos', 'error');
      return;
    }

    try {
      setIsSavingProfile(true);
      const updated = await api.updateProfile({
        name: editName,
        email: editEmail,
      });

      // Se o email foi alterado, pode precisar de reverificação
      if (updated.email !== profile?.email) {
        showNotification('Perfil atualizado! Você pode precisar verificar o novo email.', 'success');
      } else {
        showNotification('Perfil atualizado com sucesso!', 'success');
      }

      // Recarregar perfil para pegar dados atualizados
      await loadProfile();
      setIsEditingProfile(false);
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao atualizar perfil', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification('Preencha todos os campos', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showNotification('A nova senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('As senhas não coincidem', 'error');
      return;
    }

    try {
      setIsSavingPassword(true);
      await api.updatePassword({
        currentPassword,
        newPassword,
      });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotification('Senha alterada com sucesso!', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao alterar senha', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showNotification('Digite o código de 6 dígitos', 'error');
      return;
    }

    try {
      setIsVerifying(true);
      await api.verifyEmail(verificationCode);
      showNotification('Email verificado com sucesso!', 'success');
      setShowVerificationDialog(false);
      setVerificationCode('');
      await loadProfile();
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Código inválido', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsResendingCode(true);
      await api.resendVerification();
      showNotification('Novo código enviado para seu email!', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao reenviar código', 'error');
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Para contas OAuth, não precisa de senha
    if (profile?.authProvider === 'LOCAL' && !deletePassword) {
      showNotification('Digite sua senha para confirmar', 'error');
      return;
    }

    try {
      setIsDeletingAccount(true);
      await api.deleteAccount(deletePassword);
      // Logout and redirect handled by the API
      window.location.href = '/';
    } catch (err) {
      const apiError = err as ApiError;
      showNotification(apiError.message || 'Erro ao deletar conta', 'error');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
      setDeletePassword('');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const formatDate = (dateString: string) => {
    const eventDate = new Date(dateString);
    const dateObj = new Date(Date.UTC(
      eventDate.getUTCFullYear(),
      eventDate.getUTCMonth(),
      eventDate.getUTCDate()
    ));
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Usuário
      </span>
    );
  };

  const getAuthProviderBadge = (provider: string) => {
    if (provider === 'GOOGLE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <svg className="w-3 h-3" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Email/Senha
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-48" />
              </div>
            </div>
            <div className="h-px bg-gray-200 my-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-error-50 border border-error-200 rounded-lg p-4">
            <p className="text-error-700">{error}</p>
            <button
              onClick={onBack}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Perfil"
        subtitle="Gerencie suas informações pessoais e configurações de conta"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      <div className="max-w-2xl mx-auto px-4">
        {/* Account Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Visão Geral da Conta</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-600">Tipo de Autenticação</span>
              {getAuthProviderBadge(profile.authProvider)}
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-600">Cargo/Função</span>
              {getRoleBadge(profile.role)}
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-600">Membro desde</span>
              <span className="text-sm font-medium text-neutral-900">{formatDate(profile.createdAt)}</span>
            </div>
          </div>
        </motion.div>

        {/* Email Verification Alert */}
        {!profile.emailVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg"
          >
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800 mb-1">Email não verificado</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Seu email ainda não foi verificado. Verifique para ter acesso completo à plataforma.
                </p>
                <button
                  onClick={() => setShowVerificationDialog(true)}
                  className="text-sm font-medium text-amber-900 hover:text-amber-800 underline"
                >
                  Verificar agora
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Informações Pessoais</h2>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Editar
              </button>
            )}
          </div>

          {!isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">Nome Completo</label>
                <p className="text-neutral-900 font-medium">{profile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <p className="text-neutral-900 font-medium">{profile.email}</p>
                  {profile.emailVerified && (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                {profile.emailVerified && (
                  <p className="text-xs text-green-600 mt-1">Email verificado</p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Ao alterar o email, você precisará verificá-lo novamente.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSavingProfile ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEditName(profile.name);
                    setEditEmail(profile.email);
                  }}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Change Password Card - Only for LOCAL auth */}
        {profile.authProvider === 'LOCAL' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Segurança</h2>
                <p className="text-sm text-neutral-600 mt-1">Altere sua senha de acesso</p>
              </div>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  Alterar Senha
                </button>
              )}
            </div>

            {isChangingPassword && (
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">Mínimo de 6 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSavingPassword ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* Google Account Notice */}
        {profile.authProvider === 'GOOGLE' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg"
          >
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">Conta Google</h3>
                <p className="text-sm text-blue-700">
                  Você está usando login com Google. Para gerenciar sua senha e outras configurações de segurança, acesse sua conta Google.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Danger Zone - Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-white rounded-2xl shadow-sm p-6 border-2 border-error-200"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-error-700 flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Zona de Perigo
            </h2>
            <p className="text-sm text-neutral-600">
              Uma vez que você deletar sua conta, não há como voltar atrás. Por favor, tenha certeza.
            </p>
          </div>

          <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-error-900 mb-2">Ao deletar sua conta:</h3>
            <ul className="text-sm text-error-800 space-y-1 list-disc list-inside">
              <li>Todos os seus eventos serão permanentemente removidos</li>
              <li>Você perderá acesso a todos os eventos que organizou</li>
              <li>Todos os convidados dos seus eventos serão notificados</li>
              <li>Seus RSVPs para eventos de outras pessoas serão cancelados</li>
              <li>Esta ação é irreversível</li>
            </ul>
          </div>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full px-4 py-3 bg-error-600 hover:bg-error-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Deletar Minha Conta
          </button>
        </motion.div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Email Verification Dialog */}
      {showVerificationDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Verificar Email
                </h3>
                <p className="text-neutral-600 text-sm">
                  Digite o código de 6 dígitos que enviamos para <strong>{profile.email}</strong>
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Código de Verificação
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-white text-neutral-900 text-center text-2xl font-mono tracking-widest placeholder-neutral-400 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                disabled={isVerifying}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleResendVerification}
                disabled={isResendingCode}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResendingCode ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowVerificationDialog(false);
                  setVerificationCode('');
                }}
                disabled={isVerifying}
                className="flex-1 py-3 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerifyEmail}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isVerifying ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-error-100">
                <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Deletar Conta Permanentemente?
                </h3>
                <p className="text-neutral-600 text-sm">
                  Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos de nossos servidores.
                </p>
              </div>
            </div>

            {profile.authProvider === 'LOCAL' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Digite sua senha para confirmar:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full px-4 py-3 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-error-500 focus:border-transparent transition-all outline-none"
                  disabled={isDeletingAccount}
                  autoFocus
                />
              </div>
            )}

            {profile.authProvider === 'GOOGLE' && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Você está usando login com Google. Confirme que deseja deletar sua conta permanentemente.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword('');
                }}
                disabled={isDeletingAccount}
                className="flex-1 py-3 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || (profile.authProvider === 'LOCAL' && !deletePassword)}
                className="flex-1 py-3 px-4 bg-error-600 hover:bg-error-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeletingAccount && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isDeletingAccount ? 'Deletando...' : 'Sim, Deletar Minha Conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
