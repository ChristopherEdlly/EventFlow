import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import GeometricPatterns from '../components/GeometricPatterns';

interface EventPreview {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  ownerName: string;
}

export default function InvitePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Se já está logado, redireciona direto para o evento
    if (api.isAuthenticated()) {
      navigate(`/events/${eventId}`, { replace: true });
      return;
    }

    // Carrega preview do evento (rota pública no backend)
    loadEventPreview();
  }, [eventId, navigate]);

  const loadEventPreview = async () => {
    try {
      const data = await api.get<EventPreview>(`/events/${eventId}/preview`);
      setEvent(data);
    } catch (err) {
      setError('Convite não encontrado ou expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    // Salva o eventId para redirecionar após registro
    sessionStorage.setItem('redirectAfterLogin', `/events/${eventId}`);
    navigate('/register');
  };

  const handleLogin = () => {
    // Salva o eventId para redirecionar após login
    sessionStorage.setItem('redirectAfterLogin', `/events/${eventId}`);
    navigate('/login');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Convite não encontrado</h2>
          <p className="text-gray-600 mb-6">
            Este convite pode ter expirado ou o evento não existe mais.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Background animado */}
      <div className="absolute inset-0 opacity-30">
        <GeometricPatterns />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Card do convite */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header com ícone */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-1">Você foi convidado!</h1>
              <p className="text-white/80 text-sm">
                {event.ownerName} te convidou para um evento
              </p>
            </div>

            {/* Detalhes do evento */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
              
              {event.description && (
                <p className="text-gray-600 mb-6 line-clamp-3">{event.description}</p>
              )}

              {/* Info cards */}
              <div className="space-y-3 mb-6">
                {/* Data */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Data</p>
                    <p className="text-gray-900 font-medium">{formatDate(event.date)}</p>
                  </div>
                </div>

                {/* Horário */}
                {event.time && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Horário</p>
                      <p className="text-gray-900 font-medium">{event.time}</p>
                    </div>
                  </div>
                )}

                {/* Local */}
                {event.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Local</p>
                      <p className="text-gray-900 font-medium">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mensagem de ação */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-amber-800 font-medium text-sm">Crie sua conta para responder</p>
                    <p className="text-amber-700 text-xs mt-1">
                      Para confirmar sua presença e ver todos os detalhes do evento, você precisa ter uma conta no EventFlow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateAccount}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Criar conta e aceitar convite
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Já tenho conta, entrar
                </motion.button>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="text-center mt-6">
            <p className="text-white/80 text-sm">
              Powered by <span className="font-semibold">EventFlow</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
