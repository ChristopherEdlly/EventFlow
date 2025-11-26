import React, { useState } from 'react';
import { type Event, type GuestStatus } from '../services/events';

interface PendingInvitesProps {
  invites: Array<Event & { myGuestStatus?: GuestStatus; myGuestId?: string }>;
  onRespond: (eventId: string, status: GuestStatus, guestId: string) => Promise<void>;
  onViewEvent: (eventId: string) => void;
}

export default function PendingInvites({ invites, onRespond, onViewEvent }: PendingInvitesProps) {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const pendingInvites = invites.filter(invite => !invite.myGuestStatus || invite.myGuestStatus === 'PENDING');

  const handleAccept = async (eventId: string, guestId: string) => {
    setRespondingTo(eventId);
    try {
      await onRespond(eventId, 'YES', guestId);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDecline = async (eventId: string, guestId: string) => {
    setRespondingTo(eventId);
    try {
      await onRespond(eventId, 'NO', guestId);
    } finally {
      setRespondingTo(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-4 sm:p-6">
      <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Convites Pendentes
        {pendingInvites.length > 0 && (
          <span className="ml-auto bg-warning-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {pendingInvites.length}
          </span>
        )}
      </h3>

      {pendingInvites.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Nenhum convite pendente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingInvites.map((invite) => {
            const isResponding = respondingTo === invite.id;
            return (
              <div
                key={invite.id}
                className="bg-gradient-to-br from-warning-50 to-white rounded-lg border-2 border-warning-200 hover:border-warning-300 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md"
              >
                {/* Header com foto/avatar placeholder e nome do evento */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar do organizador */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {invite.organizer?.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Info do evento */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onViewEvent(invite.id)}
                        className="text-left group w-full"
                      >
                        <h4 className="font-bold text-neutral-900 group-hover:text-primary-700 transition-colors truncate">
                          {invite.title}
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Convidado por <span className="font-semibold">{invite.organizer?.name || 'Organizador'}</span>
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Data e Local */}
                  <div className="space-y-1 mb-3 text-xs text-neutral-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">
                        {new Date(invite.date).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {invite.time && ` às ${invite.time}`}
                      </span>
                    </div>
                    {invite.location && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{invite.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => invite.myGuestId && handleAccept(invite.id, invite.myGuestId)}
                      disabled={isResponding || !invite.myGuestId}
                      className="flex-1 py-2.5 px-4 bg-success-500 hover:bg-success-600 disabled:bg-neutral-300 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:hover:translate-y-0 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                      {isResponding ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm">Enviando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm">Aceitar</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => invite.myGuestId && handleDecline(invite.id, invite.myGuestId)}
                      disabled={isResponding || !invite.myGuestId}
                      className="flex-1 py-2.5 px-4 bg-white hover:bg-error-50 disabled:bg-neutral-100 text-error-600 hover:text-error-700 disabled:text-neutral-400 font-semibold rounded-lg border-2 border-error-200 hover:border-error-300 disabled:border-neutral-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:hover:translate-y-0 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                      {isResponding ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm">Recusar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
