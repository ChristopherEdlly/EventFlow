import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EventFormWizard } from '../components/event-form';
import { eventsService, type Event } from '../services/events';
import { EventFormData } from '../components/event-form/types';

export default function EditEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setError('ID do evento não encontrado');
        setIsLoading(false);
        return;
      }

      try {
        const data = await eventsService.getEvent(eventId);
        setEvent(data);
      } catch (err) {
        setError('Erro ao carregar evento');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleSuccess = () => {
    navigate('/my-events');
  };

  const handleCancel = () => {
    navigate('/my-events');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{error || 'Evento não encontrado'}</h3>
          <button
            onClick={() => navigate('/my-events')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Voltar para Meus Eventos
          </button>
        </div>
      </div>
    );
  }

  // Convert Event to EventFormData format
  const initialData: Partial<EventFormData> = {
    title: event.title,
    description: event.description || '',
    category: event.category || 'OUTRO',
    visibility: event.visibility || 'PUBLIC',
    date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
    time: event.time || '',
    endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
    endTime: event.endTime || '',
    location: event.location || '',
    eventType: event.eventType || 'PRESENCIAL',
    onlineUrl: event.onlineUrl || '',
    capacity: event.capacity?.toString() || '',
    price: event.price || 0,
    minAge: event.minAge?.toString() || '',
    waitlistEnabled: event.waitlistEnabled || false,
    showGuestList: event.showGuestList || false,
    imageUrl: event.imageUrl || '',
    tags: event.tags ? event.tags.split(',').map((t: string) => t.trim()) : [],
  };

  return (
    <EventFormWizard 
      onSuccess={handleSuccess} 
      onCancel={handleCancel}
      initialData={initialData}
      eventId={eventId}
      mode="edit"
    />
  );
}
