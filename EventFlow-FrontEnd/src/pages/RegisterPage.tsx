import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { ApiError } from '../services/api';
import GeometricPatterns from '../components/GeometricPatterns';
import InfoPanel from '../components/InfoPanel';

interface RegisterPageProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
}

export default function RegisterPage({
  onRegister,
  onNavigateToLogin,
}: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await api.register(name, email, password);
      onRegister();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <GeometricPatterns />
      </div>

      {/* Layout de duas colunas no desktop */}
      <div className="relative z-10 flex min-h-screen">
        {/* Coluna esquerda - InfoPanel (oculta no mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <InfoPanel />
        </div>

        {/* Coluna direita - Formulário de Registro */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {/* Card do formulário */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
              {/* Header */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="mb-6"
              >
                {/* Logo mobile (aparece apenas no mobile) */}
                <motion.div variants={item} className="lg:hidden mb-4 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-3">
                    <svg
                      className="w-9 h-9 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                </motion.div>

                <motion.h1
                  variants={item}
                  className="text-3xl font-bold text-gray-900 mb-2"
                >
                  Criar conta
                </motion.h1>
                <motion.p variants={item} className="text-gray-600">
                  Comece a gerenciar seus eventos hoje
                </motion.p>
              </motion.div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-5 h-5 text-red-500">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">Erro no cadastro</p>
                    <p className="text-sm text-red-700 mt-0.5">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Register Form - Compacto */}
              <motion.form
                variants={container}
                initial="hidden"
                animate="show"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Name Input */}
                <motion.div variants={item}>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Nome completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-gray-300"
                      placeholder="João Silva"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>

                {/* Email Input */}
                <motion.div variants={item}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-gray-300"
                      placeholder="seu@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>

                {/* Password Input */}
                <motion.div variants={item}>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-11 py-2.5 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-gray-300"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres</p>
                </motion.div>

                {/* Confirm Password Input */}
                <motion.div variants={item}>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-11 py-2.5 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-gray-300"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={item} className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Criando conta...
                      </span>
                    ) : (
                      'Criar conta'
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Já tem uma conta?
                  </span>
                </div>
              </motion.div>

              {/* Login Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-5"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onNavigateToLogin}
                  className="w-full py-3.5 px-6 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-base rounded-xl transition-all duration-200"
                >
                  Entrar
                </motion.button>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-6 text-white/80 text-sm"
            >
              © 2025 EventFlow. Todos os direitos reservados.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
