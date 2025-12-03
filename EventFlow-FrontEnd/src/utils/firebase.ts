import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { subscribePush, unsubscribePush } from '../services/notifications';

// Tipagem para import.meta.env
interface ImportMetaEnv {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_VAPID_KEY?: string;
}

const env = (import.meta as unknown as { env: ImportMetaEnv }).env;

// Configuração do Firebase
// Estas variáveis devem ser configuradas no arquivo .env
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// VAPID Key para web push (deve ser configurada no Firebase Console)
const vapidKey = env.VITE_FIREBASE_VAPID_KEY;

// Inicializa o Firebase
let app: ReturnType<typeof initializeApp> | null = null;
let messaging: Messaging | null = null;
let isInitialized = false;
let initializationError: Error | null = null;

// Verifica se a configuração está disponível
const isConfigured = (): boolean => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && vapidKey);
};

// Inicializa o Firebase de forma lazy
const initializeFirebase = async (): Promise<boolean> => {
  if (isInitialized) return !!messaging;
  if (initializationError) return false;

  try {
    // Verifica suporte a notificações
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging não é suportado neste navegador');
      initializationError = new Error('Browser not supported');
      return false;
    }

    // Verifica se está configurado
    if (!isConfigured()) {
      console.warn('Firebase não está configurado. Adicione as variáveis VITE_FIREBASE_* no .env');
      initializationError = new Error('Firebase not configured');
      return false;
    }

    // Inicializa o app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    messaging = getMessaging(app);
    isInitialized = true;
    
    console.log('Firebase inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    initializationError = error as Error;
    return false;
  }
};

// Registra o service worker
const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não é suportado');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    
    console.log('Service Worker registrado:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
    return null;
  }
};

// Solicita permissão para notificações
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Notificações não são suportadas');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
    return 'denied';
  }
};

// Obtém o token FCM e registra no backend
export const subscribeToPushNotifications = async (): Promise<string | null> => {
  try {
    // Solicita permissão
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Permissão de notificação negada');
      return null;
    }

    // Inicializa Firebase
    const initialized = await initializeFirebase();
    if (!initialized || !messaging) {
      console.warn('Firebase não disponível');
      return null;
    }

    // Registra o service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn('Service Worker não disponível');
      return null;
    }

    // Obtém o token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('Token FCM obtido:', token.substring(0, 20) + '...');

      // Detecta tipo de dispositivo
      const deviceType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) 
        ? 'mobile' 
        : 'web';
      
      // Detecta nome do dispositivo
      const uaParts = navigator.userAgent.split(')')[0]?.split('(');
      const deviceName = `${navigator.platform} - ${uaParts?.[1] || 'Browser'}`;

      // Envia para o backend
      await subscribePush(token, deviceType, deviceName);
      
      console.log('Push notifications ativadas com sucesso');
      return token;
    } else {
      console.warn('Não foi possível obter o token FCM');
      return null;
    }
  } catch (error) {
    console.error('Erro ao ativar push notifications:', error);
    return null;
  }
};

// Remove o registro de push notifications
export const unsubscribeFromPushNotifications = async (token: string): Promise<boolean> => {
  try {
    await unsubscribePush(token);
    console.log('Push notifications desativadas');
    return true;
  } catch (error) {
    console.error('Erro ao desativar push notifications:', error);
    return false;
  }
};

// Listener para mensagens em foreground
export const onForegroundMessage = (callback: (payload: unknown) => void): (() => void) | null => {
  if (!messaging) {
    console.warn('Firebase Messaging não está inicializado');
    return null;
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Mensagem recebida em foreground:', payload);
    callback(payload);
  });

  return unsubscribe;
};

// Verifica se push notifications estão disponíveis
export const isPushNotificationsAvailable = (): boolean => {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    isConfigured()
  );
};

// Verifica o status atual das notificações
export const getNotificationStatus = (): {
  available: boolean;
  permission: NotificationPermission | null;
  configured: boolean;
} => {
  const available = isPushNotificationsAvailable();
  const permission = 'Notification' in window ? Notification.permission : null;
  const configured = isConfigured();

  return { available, permission, configured };
};

// Verifica se pode pedir permissão
export const canRequestPermission = (): boolean => {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'default';
};

export default {
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  onForegroundMessage,
  isPushNotificationsAvailable,
  getNotificationStatus,
  canRequestPermission,
};
