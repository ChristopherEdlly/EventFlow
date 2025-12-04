import { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, Monitor, Trash2, AlertCircle, Check, Loader } from 'lucide-react';
import {
  getNotificationStatus,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  canRequestPermission,
} from '../utils/firebase';
import { getSubscriptions, PushSubscription } from '../services/notifications';

export default function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [notificationStatus, setNotificationStatus] = useState(getNotificationStatus());
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Carrega as inscrições do usuário
  const loadSubscriptions = async () => {
    try {
      const subs = await getSubscriptions();
      setSubscriptions(subs);
    } catch (err) {
      console.error('Erro ao carregar inscrições:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    setNotificationStatus(getNotificationStatus());
  }, []);

  // Ativa push notifications
  const handleSubscribe = async () => {
    setError(null);
    setSuccess(null);
    setSubscribing(true);

    try {
      const token = await subscribeToPushNotifications();
      if (token) {
        setCurrentToken(token);
        setSuccess('Push notifications ativadas com sucesso!');
        await loadSubscriptions();
        setNotificationStatus(getNotificationStatus());
      } else {
        setError('Não foi possível ativar as notificações. Verifique as permissões do navegador.');
      }
    } catch (err) {
      setError('Erro ao ativar notificações. Tente novamente.');
      console.error(err);
    } finally {
      setSubscribing(false);
    }
  };

  // Desativa uma inscrição
  const handleUnsubscribe = async (token: string) => {
    setError(null);
    setSuccess(null);

    try {
      await unsubscribeFromPushNotifications(token);
      setSuccess('Dispositivo removido com sucesso!');
      await loadSubscriptions();
    } catch (err) {
      setError('Erro ao remover dispositivo. Tente novamente.');
      console.error(err);
    }
  };

  // Formata data
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Ícone do dispositivo
  const DeviceIcon = ({ type }: { type: string }) => {
    if (type === 'mobile') {
      return <Smartphone className="h-5 w-5 text-gray-500" />;
    }
    return <Monitor className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Bell className="h-5 w-5 text-primary-600" />
          Configurações de Notificação
        </h3>

        {/* Status das notificações */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-medium text-gray-700">Status do Navegador</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Notificações disponíveis:</span>
              <span className={notificationStatus.available ? 'text-green-600' : 'text-red-600'}>
                {notificationStatus.available ? 'Sim' : 'Não'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Permissão:</span>
              <span
                className={
                  notificationStatus.permission === 'granted'
                    ? 'text-green-600'
                    : notificationStatus.permission === 'denied'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }
              >
                {notificationStatus.permission === 'granted'
                  ? 'Concedida'
                  : notificationStatus.permission === 'denied'
                    ? 'Negada'
                    : 'Não solicitada'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Firebase configurado:</span>
              <span className={notificationStatus.configured ? 'text-green-600' : 'text-yellow-600'}>
                {notificationStatus.configured ? 'Sim' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>

        {/* Mensagens de erro/sucesso */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
            <Check className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Botão de ativar */}
        {notificationStatus.available && (
          <div className="mb-6">
            {notificationStatus.permission === 'denied' ? (
              <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                <p className="font-medium">Notificações bloqueadas</p>
                <p className="mt-1 text-sm">
                  Você bloqueou as notificações deste site. Para reativar, clique no ícone de cadeado
                  na barra de endereços e altere a permissão de notificações.
                </p>
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {subscribing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  <>
                    <Bell className="h-5 w-5" />
                    {subscriptions.length > 0
                      ? 'Ativar neste dispositivo'
                      : 'Ativar Push Notifications'}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {!notificationStatus.available && !notificationStatus.configured && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-800">
            <p className="font-medium">Configuração pendente</p>
            <p className="mt-1 text-sm">
              Push notifications ainda não estão configuradas no sistema. Em breve esta
              funcionalidade estará disponível.
            </p>
          </div>
        )}

        {/* Lista de dispositivos */}
        <div>
          <h4 className="mb-3 font-medium text-gray-700">
            Dispositivos registrados ({subscriptions.length})
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center text-gray-500">
              <BellOff className="mb-2 h-8 w-8" />
              <p>Nenhum dispositivo registrado</p>
              <p className="text-sm">Ative as notificações para receber alertas neste dispositivo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <DeviceIcon type={sub.deviceType || 'web'} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {sub.deviceName || 'Dispositivo desconhecido'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Registrado em {formatDate(sub.createdAt)}
                      </p>
                      {sub.lastUsed && (
                        <p className="text-xs text-gray-400">
                          Último uso: {formatDate(sub.lastUsed)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(sub.fcmToken)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Remover dispositivo"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Informações sobre notificações */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Tipos de Notificação</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded bg-primary-100 p-1">
              <Bell className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Convites para eventos</p>
              <p>Receba notificações quando for convidado para um novo evento</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded bg-green-100 p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Confirmações de presença</p>
              <p>Seja notificado quando alguém confirmar presença em seus eventos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded bg-yellow-100 p-1">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Lembretes de eventos</p>
              <p>Receba lembretes antes de eventos que você confirmou presença</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
