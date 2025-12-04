import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  notificationsService,
  type Notification,
  getNotificationIcon,
  getNotificationColor,
  formatNotificationTime,
} from '../services/notifications';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Busca contagem de não lidas
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar contagem:', error);
    }
  }, []);

  // Busca notificações
  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const offset = reset ? 0 : notifications.length;
      const response = await notificationsService.getNotifications({
        limit: 10,
        offset,
      });
      
      if (reset) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setUnreadCount(response.unreadCount);
      setHasMore(response.notifications.length === 10);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [notifications.length]);

  // Polling para atualizar contagem
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll a cada 30 segundos
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchUnreadCount]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca notificações ao abrir
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marca como lida
    if (!notification.read) {
      try {
        await notificationsService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Erro ao marcar como lida:', error);
      }
    }

    // Navega para a URL de ação
    if (notification.actionUrl) {
      setIsOpen(false);
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-white/80 hover:text-white transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                      !notification.read ? 'bg-primary-50/50' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2" />
                    )}
                  </button>
                ))}
                
                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="w-full py-3 text-sm text-primary-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Carregando...' : 'Carregar mais'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
