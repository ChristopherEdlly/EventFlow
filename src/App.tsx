import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
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
import ModerationPage from './pages/ModerationPage';
import InvitePage from './pages/InvitePage';


interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Componente wrapper para páginas autenticadas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = api.isAuthenticated();
  const location = window.location.pathname;

  if (!isAuthenticated) {
    // Salvar a URL atual para redirecionar após login
    if (location !== '/login' && location !== '/register') {
      sessionStorage.setItem('redirectAfterLogin', location);
    }
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

// Wrapper para EventDetailsPage que usa useParams
function EventDetailsWrapper({ onBack }: { onBack: () => void }) {
  const { id } = useParams<{ id: string }>();
  return <EventDetailsPage eventId={id || ''} onBack={onBack} />;
}

// Wrapper para GuestsPage que usa useParams
function GuestsWrapper({ onBack }: { onBack: () => void }) {
  const { id } = useParams<{ id: string }>();
  return <GuestsPage eventId={id || ''} onBack={onBack} />;
}

// Componente interno que usa hooks do router
function AppRoutes() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(api.isAuthenticated());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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
      
      // Verificar se há URL para redirecionar após login
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  };

  const handleRegister = async () => {
    try {
      const profile = await api.getProfile();
      setUserProfile(profile);
      
      // Verificar se há URL para redirecionar após registro
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/');
      }
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
    navigate(`/events/${eventId}`);
  };

  const handleNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      'home': '/',
      'dashboard': '/calendario',
      'myEvents': '/my-events',
      'newEvent': '/new-event',
      'publicEvents': '/public-events',
      'myInvites': '/my-invites',
      'profile': '/profile',
      'settings': '/settings',
      'history': '/history',
      'moderation': '/moderation',
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

      {/* Rota de Convite (pública - mostra preview do evento) */}
      <Route
        path="/invite/:eventId"
        element={<InvitePage />}
      />

      {/* Rotas Protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="home"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
              userRole={userProfile?.role}
            >
              <HomePage onViewEvent={handleViewEvent} onNavigate={handleNavigate} />
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
              userRole={userProfile?.role}
            >
              <DashboardPage onViewEvent={handleViewEvent} />
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
              userRole={userProfile?.role}
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
              userRole={userProfile?.role}
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
              userRole={userProfile?.role}
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
        path="/my-events"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="myEvents"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
              userRole={userProfile?.role}
            >
              <MyEventsPage onViewEvent={handleViewEvent} />
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
              userRole={userProfile?.role}
            >
              <EventDetailsWrapper onBack={() => navigate(-1)} />
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
              userRole={userProfile?.role}
            >
              <GuestsWrapper onBack={() => navigate(-1)} />
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
              userRole={userProfile?.role}
            >
              <ProfilePage onBack={() => navigate('/')} />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/moderation"
        element={
          <ProtectedRoute>
            <Layout
              currentPage="moderation"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              userName={userProfile?.name}
              userRole={userProfile?.role}
            >
              <ModerationPage />
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
              userRole={userProfile?.role}
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
