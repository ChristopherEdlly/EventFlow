import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userName?: string;
}

export default function Layout({ children, currentPage, onNavigate, onLogout, userName }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    {
      id: 'myEvents',
      label: 'Meus Eventos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10" />
        </svg>
      ),
      route: '/',
    },
    {
      id: 'publicEvents',
      label: 'Eventos Públicos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'dashboard',
      label: 'Calendário',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3" />
        </svg>
      ),
      route: '/calendario',
    },
    {
      id: 'myInvites',
      label: 'Convites',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'Histórico',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const bottomMenuItems = [
    {
      id: 'profile',
      label: 'Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-secondary-50 flex scrollbar-thin scrollbar-thumb-primary-400 scrollbar-track-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 transition-all duration-300 z-40 shadow-2xl border-r-4 border-primary-400/40 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } scrollbar-thin scrollbar-thumb-primary-400 scrollbar-track-primary-100`}
      >
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Logo */}
        <div className="relative h-16 flex items-center px-6 border-b border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-white drop-shadow-lg">EventFlow</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 drop-shadow-lg border-2 border-primary-400/30 focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                currentPage === item.id
                  ? 'bg-white/60 text-primary-700 font-bold shadow-xl ring-2 ring-primary-300 backdrop-blur-md'
                  : 'bg-white/20 text-white/90 hover:bg-white/40 hover:text-primary-700 hover:font-semibold'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
              style={{ boxShadow: currentPage === item.id ? '0 2px 12px 0 rgba(80,80,180,0.12)' : undefined }}
            >
              {item.icon}
              {!sidebarCollapsed && <span className="drop-shadow-lg text-base tracking-wide">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-primary-400/30 px-3 py-4 space-y-2">
          {bottomMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 drop-shadow-lg border-2 border-primary-400/20 focus:outline-none focus:ring-2 focus:ring-primary-400
                ${currentPage === item.id
                  ? 'bg-white/60 text-primary-700 font-bold shadow-xl ring-2 ring-primary-300 backdrop-blur-md'
                  : 'bg-white/20 text-white/90 hover:bg-white/40 hover:text-primary-700 hover:font-semibold active:bg-white/60 active:text-primary-700'}
              `}
              title={sidebarCollapsed ? item.label : undefined}
              style={{ boxShadow: currentPage === item.id ? '0 2px 12px 0 rgba(80,80,180,0.12)' : undefined }}
            >
              {item.icon}
              {!sidebarCollapsed && <span className="drop-shadow-lg text-base tracking-wide">{item.label}</span>}
            </button>
          ))}

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold border-2 border-red-400 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400
              hover:from-red-600 hover:to-red-800 hover:scale-105 active:scale-95 active:ring-4 active:ring-red-300 transition-all duration-200`}
            title={sidebarCollapsed ? 'Sair' : undefined}
            style={{ cursor: 'pointer', zIndex: 9999, pointerEvents: 'auto', position: 'relative' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span className="font-bold">Sair</span>}
          </button>
        </div>

        {/* Collapse Toggle - sempre colado na borda direita da sidebar */}
        <div
          style={{
            position: 'fixed',
            left: sidebarCollapsed ? 80 : 256, // acompanha largura da sidebar
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 9999,
            boxShadow: '0 2px 12px 0 rgba(80,80,180,0.18)',
            borderRadius: '0 1rem 1rem 0',
            transition: 'left 0.3s',
          }}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 rounded-r-xl flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all group border-2 border-primary-400/40 focus:outline-none focus:ring-2 focus:ring-primary-400"
            title={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            style={{ boxShadow: '0 2px 12px 0 rgba(80,80,180,0.18)', zIndex: 9999, position: 'relative', left: 0, borderRadius: '0 1rem 1rem 0' }}
          >
            {/* Ícone de três linhas indicando menu */}
            <div className="flex flex-col gap-1 items-center justify-center mt-2">
              <div className={`w-5 h-0.5 bg-white rounded-full transition-all ${sidebarCollapsed ? 'translate-x-0.5' : '-translate-x-0.5'}`}></div>
              <div className="w-5 h-0.5 bg-white rounded-full"></div>
              <div className={`w-5 h-0.5 bg-white rounded-full transition-all ${sidebarCollapsed ? 'translate-x-0.5' : '-translate-x-0.5'}`}></div>
            </div>

            {/* Seta indicadora */}
            <svg
              className={`w-4 h-4 text-white mt-2 transition-transform duration-300 ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} bg-gradient-to-br from-primary-50 via-primary-100 to-secondary-50`}>
        <main className="p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
