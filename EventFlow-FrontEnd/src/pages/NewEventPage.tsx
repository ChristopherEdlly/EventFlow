import { useNavigate } from 'react-router-dom';
import { EventFormWizard } from '../components/event-form';

interface NewEventPageProps {
  onBack: () => void;
}

export default function NewEventPage({ onBack }: NewEventPageProps) {
  const navigate = useNavigate();

  const handleSuccess = (eventId: string) => {
    // Redireciona para a página de detalhes do evento criado
    navigate(`/events/${eventId}`);
  };

  const handleCancel = () => {
    onBack();
  };

  return (
    <EventFormWizard 
      onSuccess={handleSuccess} 
      onCancel={handleCancel} 
    />
  );
}
