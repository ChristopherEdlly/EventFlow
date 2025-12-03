// Firebase Messaging Service Worker
// Este arquivo deve ficar na raiz do diretório público para ter acesso a todo o escopo

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase - será injetada pelo build ou configurada manualmente
// Valores padrão que serão substituídos em produção
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY || '',
  authDomain: self.FIREBASE_AUTH_DOMAIN || '',
  projectId: self.FIREBASE_PROJECT_ID || '',
  storageBucket: self.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: self.FIREBASE_APP_ID || '',
};

// Só inicializa se tiver configuração válida
if (firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handler para mensagens em background
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'EventFlow';
    const notificationOptions = {
      body: payload.notification?.body || 'Você tem uma nova notificação',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: payload.data?.notificationId || 'default',
      data: payload.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir',
        },
        {
          action: 'dismiss',
          title: 'Dispensar',
        },
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.log('[firebase-messaging-sw.js] Firebase config not available, push disabled');
}

// Handler para cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // URL para abrir quando a notificação for clicada
  const urlToOpen = event.notification.data?.actionUrl || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Verifica se já há uma janela aberta
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Se não houver janela aberta, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handler para push events (fallback)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[firebase-messaging-sw.js] Push data:', data);
    } catch (e) {
      console.log('[firebase-messaging-sw.js] Push data (text):', event.data.text());
    }
  }
});

// Log de instalação
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installed');
  self.skipWaiting();
});

// Log de ativação
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activated');
  event.waitUntil(clients.claim());
});
