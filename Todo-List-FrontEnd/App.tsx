import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PublicEventsPage from './pages/PublicEventsPage';
import MyInvitesPage from './pages/MyInvitesPage';
import EventDetailsPage from './pages/EventDetailsPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';

type Page = 'login' | 'register' | 'dashboard' | 'publicEvents' | 'myInvites' | 'eventDetails' | 'profile' | 'history';

function App() {
  const [page, setPage] = useState<Page>(api.isAuthenticated() ? 'dashboard' : 'login');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(api.isAuthenticated());

  useEffect(() => {
    // Se há token salvo, tenta validar com o backend
    if (api.isAuthenticated()) {
      api.getProfile()
        .then(() => {
          setPage('dashboard');
        })
        .catch(() => {
          api.logout();
          setPage('login');
        })
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () => {
    setPage('dashboard');
  };

  const handleRegister = () => {
    setPage('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setPage('login');
  };

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setPage('eventDetails');
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-neutral-500">Verificando autenticação...</div>;
  }

  return (
    <ToastProvider>
      {page === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={() => setPage('register')}
        />
      )}
      {page === 'register' && (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={() => setPage('login')}
        />
      )}
      {page === 'dashboard' && (
        <DashboardPage
          onLogout={handleLogout}
          onNavigateToPublicEvents={() => setPage('publicEvents')}
          onNavigateToMyInvites={() => setPage('myInvites')}
          onNavigateToProfile={() => setPage('profile')}
          onNavigateToHistory={() => setPage('history')}
          onViewEvent={handleViewEvent}
        />
      )}
      {page === 'publicEvents' && (
        <PublicEventsPage
          onBack={() => setPage('dashboard')}
          onViewEvent={handleViewEvent}
        />
      )}
      {page === 'myInvites' && (
        <MyInvitesPage
          onBack={() => setPage('dashboard')}
        />
      )}
      {page === 'eventDetails' && selectedEventId && (
        <EventDetailsPage
          eventId={selectedEventId}
          onBack={() => setPage('dashboard')}
        />
      )}
      {page === 'profile' && (
        <ProfilePage
          onBack={() => setPage('dashboard')}
        />
      )}
      {page === 'history' && (
        <HistoryPage
          onBack={() => setPage('dashboard')}
          onViewEvent={handleViewEvent}
        />
      )}
    </ToastProvider>
  );
}

export default App;
