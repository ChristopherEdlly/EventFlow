import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { api } from './services/api';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import PublicEventsPage from './pages/PublicEventsPage';
import MyInvitesPage from './pages/MyInvitesPage';
import EventDetailsPage from './pages/EventDetailsPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import MyEventsPage from './pages/MyEventsPage';
import NewEventPage from './pages/NewEventPage';
import GuestsPage from './pages/GuestsPage';
import SettingsPage from './pages/SettingsPage';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Componente wrapper para páginas autenticadas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = api.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Componente wrapper para páginas públicas (login/register)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = api.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Componente interno que usa hooks do router
function AppRoutes() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(api.isAuthenticated());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    // Se há token salvo, tenta validar com o backend
    if (api.isAuthenticated()) {
      api.getProfile()
        .then((profile) => {
          setUserProfile(profile);
        })
        .catch(() => {
          api.logout();
          navigate('/login');
        })
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const profile = await api.getProfile();
      setUserProfile(profile);
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const handleRegister = async () => {
    try {
      const profile = await api.getProfile();
      setUserProfile(profile);
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUserProfile(null);
    navigate('/login');
  };

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    navigate(`/events/${eventId}`);
  };

  const handleNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      'dashboard': '/calendario',
      'myEvents': '/',
      'newEvent': '/new-event',
      'publicEvents': '/public-events',
      'myInvites': '/my-invites',
      'profile': '/profile',
      'settings': '/settings',
      'history': '/history',
    };
    navigate(routeMap[page] || '/');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500">
        Verificando autenticação...
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage
              onLogin={handleLogin}
              onNavigateToRegister={() => navigate('/register')}
            />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage
              onRegister={handleRegister}
              onNavigateToLogin={() => navigate('/login')}
            />
          </PublicRoute>
        }
      />

      {/* Rotas Protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="myEvents"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <MyEventsPage onViewEvent={handleViewEvent} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendario"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="dashboard"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <DashboardPage
                onLogout={handleLogout}
                onNavigateToPublicEvents={() => navigate('/public-events')}
                onNavigateToMyInvites={() => navigate('/my-invites')}
                onNavigateToProfile={() => navigate('/profile')}
                onNavigateToHistory={() => navigate('/history')}
                onViewEvent={handleViewEvent}
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/new-event"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="newEvent"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <NewEventPage onBack={() => navigate('/my-events')} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/public-events"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="publicEvents"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <PublicEventsPage
                onBack={() => navigate('/')}
                onViewEvent={handleViewEvent}
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-invites"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="myInvites"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <MyInvitesPage
                onBack={() => navigate('/')}
                onViewEvent={handleViewEvent}
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="eventDetails"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <EventDetailsPage
                eventId={selectedEventId || window.location.pathname.split('/').pop() || ''}
                onBack={() => navigate('/my-events')}
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:id/guests"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="guests"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <GuestsPage
                eventId={selectedEventId || ''}
                onBack={() => navigate(-1)}
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="profile"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <ProfilePage onBack={() => navigate('/')} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="settings"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <SettingsPage onBack={() => navigate('/')} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="history"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
            >
              <HistoryPage
                onBack={() => navigate('/')}
                onViewEvent={handleViewEvent}
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rota padrão - redireciona para home ou login */}
      <Route
        path="*"
        element={<Navigate to={api.isAuthenticated() ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
