import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PublicEventsPage from './pages/PublicEventsPage';
import MyInvitesPage from './pages/MyInvitesPage';
import EventDetailsPage from './pages/EventDetailsPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import MyEventsPage from './pages/MyEventsPage';
import NewEventPage from './pages/NewEventPage';
import GuestsPage from './pages/GuestsPage';
import SettingsPage from './pages/SettingsPage';

type Page = 'login' | 'register' | 'dashboard' | 'publicEvents' | 'myInvites' | 'eventDetails' | 'profile' | 'history' | 'myEvents' | 'newEvent' | 'guests' | 'settings';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function App() {
  const [page, setPage] = useState<Page>(api.isAuthenticated() ? 'dashboard' : 'login');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(api.isAuthenticated());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Se há token salvo, tenta validar com o backend
    if (api.isAuthenticated()) {
      api.getProfile()
        .then((profile) => {
          setUserProfile(profile);
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
  }, []);

  const handleLogin = async () => {
    try {
      const profile = await api.getProfile();
      setUserProfile(profile);
      setPage('dashboard');
    } catch {
      setPage('dashboard');
    }
  };

  const handleRegister = async () => {
    try {
      const profile = await api.getProfile();
      setUserProfile(profile);
      setPage('dashboard');
    } catch {
      setPage('dashboard');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUserProfile(null);
    setPage('login');
  };

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setPage('eventDetails');
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-neutral-500">Verificando autenticação...</div>;
  }

  const isAuthenticated = api.isAuthenticated();

  return (
    <ToastProvider>
      {!isAuthenticated ? (
        <>
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
        </>
      ) : (
        <Layout
          currentPage={page}
          onNavigate={(newPage) => setPage(newPage as Page)}
          onLogout={handleLogout}
          userName={userProfile?.name}
        >
          {page === 'dashboard' && <HomePage onViewEvent={handleViewEvent} />}
          {page === 'myEvents' && <MyEventsPage onViewEvent={handleViewEvent} />}
          {page === 'newEvent' && <NewEventPage onBack={() => setPage('myEvents')} />}
          {page === 'publicEvents' && (
            <PublicEventsPage
              onBack={() => setPage('dashboard')}
              onViewEvent={handleViewEvent}
            />
          )}
          {page === 'myInvites' && (
            <MyInvitesPage
              onBack={() => setPage('dashboard')}
              onViewEvent={handleViewEvent}
            />
          )}
          {page === 'eventDetails' && selectedEventId && (
            <EventDetailsPage
              eventId={selectedEventId}
              onBack={() => setPage('myEvents')}
            />
          )}
          {page === 'guests' && selectedEventId && (
            <GuestsPage
              eventId={selectedEventId}
              onBack={() => setPage('eventDetails')}
            />
          )}
          {page === 'profile' && (
            <ProfilePage
              onBack={() => setPage('dashboard')}
            />
          )}
          {page === 'settings' && (
            <SettingsPage
              onBack={() => setPage('dashboard')}
            />
          )}
          {page === 'history' && (
            <HistoryPage
              onBack={() => setPage('dashboard')}
              onViewEvent={handleViewEvent}
            />
          )}
        </Layout>
      )}
    </ToastProvider>
  );
}

export default App;
