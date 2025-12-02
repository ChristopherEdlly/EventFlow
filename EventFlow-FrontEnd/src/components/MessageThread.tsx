import { useState, useEffect, useRef } from 'react';
import { messagesService, Message } from '../services/messages';
import { api } from '../services/api';

interface MessageThreadProps {
  eventId: string;
  otherUserId: string;
  otherUserName: string;
  onClose: () => void;
  isOrganizer?: boolean;
}

export function MessageThread({
  eventId,
  otherUserId,
  otherUserName,
  onClose,
  isOrganizer = false,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = getCurrentUserId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
  }, [eventId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages() {
    try {
      setLoading(true);
      const data = await messagesService.getMessageThread(eventId, otherUserId);
      setMessages(data);
      setError('');
    } catch (err: unknown) {
      console.error('Error loading messages:', err);
      setError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const messageData = {
        content: newMessage.trim(),
        ...(isOrganizer && { receiverId: otherUserId }),
      };

      const sentMessage = await messagesService.sendMessage(eventId, messageData);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
      setError('');
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      setError('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  }

  function getCurrentUserId(): string {
    // Get current user ID from token or API
    // This is a simplified version - you might want to get this from a context
    try {
      const token = api.getToken();
      if (!token) return '';
      const parts = token.split('.');
      if (parts.length < 2 || !parts[1]) return '';
      const payload = JSON.parse(atob(parts[1]));
      return payload.userId || payload.sub || '';
    } catch {
      return '';
    }
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const time = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (date.toDateString() === today.toDateString()) {
      return `Hoje às ${time}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${time}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isOrganizer ? `Conversa com ${otherUserName}` : `Mensagem para o Organizador`}
            </h2>
            <p className="text-sm text-gray-500">{otherUserName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm mt-2">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
