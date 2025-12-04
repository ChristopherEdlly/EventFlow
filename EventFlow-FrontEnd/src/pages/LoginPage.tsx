import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { ApiError } from '../services/api';
import GeometricPatterns from '../components/GeometricPatterns';
import InfoPanel from '../components/InfoPanel';
import GoogleLoginButton from '../components/GoogleLoginButton';

interface LoginPageProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword?: () => void;
}

export default function LoginPage({ onLogin, onNavigateToRegister, onNavigateToForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.login(email, password);
      onLogin();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to login. Please try again.');
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
        staggerChildren: 0.1,
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
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <GeometricPatterns />
      </div>

      {/* Logo + Título no topo, fora do container */}
      <div className="relative z-20 pt-4 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-white/25 backdrop-blur-lg rounded-2xl shadow-2xl mb-2 border border-white/30"
          >
            <svg
              className="w-7 h-7 lg:w-8 lg:h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </motion.div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-0.5">EventFlow</h1>
          <p className="text-white/90 text-xs lg:text-sm">Simplifique a gestão dos seus eventos</p>
        </motion.div>
      </div>

      {/* Container principal glassmorphism horizontal */}
      <div className="relative z-10 flex items-center justify-center px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-6xl"
        >
          {/* Container glassmorphism */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[450px]">
              {/* Coluna esquerda - InfoPanel (oculta no mobile) */}
              <div className="hidden lg:flex lg:w-1/2 border-r border-white/20">
                <InfoPanel />
              </div>

              {/* Coluna direita - Formulário de Login */}
              <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6">
                <div className="w-full max-w-md">
                  {/* Card branco do formulário */}
                  <div className="bg-white rounded-2xl shadow-xl p-5 lg:p-6">
                    {/* Header */}
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="mb-4"
                    >
                      <motion.h2
                        variants={item}
                        className="text-2xl font-bold text-gray-900 mb-1"
                      >
                        Bem-vindo de volta!
                      </motion.h2>
                      <motion.p variants={item} className="text-gray-600 text-sm">
                        Entre para gerenciar seus eventos
                      </motion.p>
                    </motion.div>

                    {/* Error Alert */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
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
                          <p className="text-xs font-semibold text-red-800">Erro ao fazer login</p>
                          <p className="text-xs text-red-700 mt-0.5">{error}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Login Form */}
                    <motion.form
                      variants={container}
                      initial="hidden"
                      animate="show"
                      onSubmit={handleSubmit}
                      className="space-y-3"
                    >
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
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </div>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-gray-300"
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
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-10 py-2 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-gray-300"
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </motion.div>

                      {/* Forgot Password Link */}
                      <motion.div variants={item} className="flex justify-end">
                        <a
                          href="#"
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Esqueceu a senha?
                        </a>
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div variants={item} className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg
                                className="animate-spin h-4 w-4"
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
                              Entrando...
                            </span>
                          ) : (
                            'Entrar'
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.form>

                    {/* Forgot Password Link - FORA DO FORM */}
                    {onNavigateToForgotPassword && (
                      <div className="text-center mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onNavigateToForgotPassword();
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                        >
                          Esqueceu sua senha?
                        </button>
                      </div>
                    )}

                    {/* Divider - OU */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="mt-4 relative"
                    >
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white text-gray-500 font-medium">
                          ou continue com
                        </span>
                      </div>
                    </motion.div>

                    {/* Google Login Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75 }}
                      className="mt-4"
                    >
                      <GoogleLoginButton
                        onSuccess={(response) => {
                          // Salvar token e redirecionar
                          localStorage.setItem('auth_token', response.token);
                          onLogin();
                        }}
                        onError={(errorMsg) => setError(errorMsg)}
                      />
                    </motion.div>

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
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white text-gray-500 font-medium">
                          Não tem uma conta?
                        </span>
                      </div>
                    </motion.div>

                    {/* Register Link */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="mt-5"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onNavigateToRegister}
                        className="w-full py-3 px-6 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-all duration-200"
                      >
                        Criar nova conta
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
