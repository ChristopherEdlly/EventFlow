import React, { useState } from 'react';
import { api } from './services/api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PublicEventsPage from './pages/PublicEventsPage';
import MyInvitesPage from './pages/MyInvitesPage';
import EventDetailsPage from './pages/EventDetailsPage';

type Page = 'login' | 'register' | 'dashboard' | 'publicEvents' | 'myInvites' | 'eventDetails';

function App() {
  const [page, setPage] = useState<Page>(
    api.isAuthenticated() ? 'dashboard' : 'login'
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

  return (
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
      {page === 'dashboard' && (
        <DashboardPage
          onLogout={handleLogout}
          onNavigateToPublicEvents={() => setPage('publicEvents')}
          onNavigateToMyInvites={() => setPage('myInvites')}
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
    </>
  );
}

export default App;
