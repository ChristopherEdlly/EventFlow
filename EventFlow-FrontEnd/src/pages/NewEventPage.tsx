import { useNavigate } from 'react-router-dom';
import { EventFormWizard } from '../components/event-form';

interface NewEventPageProps {
  onBack: () => void;
}

export default function NewEventPage({ onBack }: NewEventPageProps) {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/my-events');
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
