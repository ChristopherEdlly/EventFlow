import type { EventCategory, EventType, EventVisibility } from '../../services/events';

export interface EventFormData {
  // Step 1: Basic Info
  title: string;
  description: string;
  category: EventCategory;

  // Step 2: Date & Location
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  eventType: EventType;
  location: string;
  latitude?: number;
  longitude?: number;
  onlineUrl: string;

  // Step 3: Settings
  visibility: EventVisibility;
  price: number;
  capacity: string;
  minAge: string;
  waitlistEnabled: boolean;
  showGuestList: boolean;
  rsvpDeadline: string;

  // Step 4: Media & Tags
  imageUrl: string;
  tags: string[];

  // Step 6: Convidados (opcional)
  guestEmails: string[];
}

export const defaultFormData: EventFormData = {
  title: '',
  description: '',
  category: 'OUTRO',
  date: '',
  time: '',
  endDate: '',
  endTime: '',
  eventType: 'PRESENCIAL',
  location: '',
  onlineUrl: '',
  visibility: 'PUBLIC',
  price: 0,
  capacity: '',
  minAge: '',
  waitlistEnabled: false,
  showGuestList: true,
  rsvpDeadline: '',
  imageUrl: '',
  tags: [],
  guestEmails: [],
};

export interface StepProps {
  formData: EventFormData;
  updateFormData: (data: Partial<EventFormData>) => void;
  errors?: Record<string, string>;
}

export interface CategoryOption {
  value: EventCategory;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface ModalityOption {
  value: EventType;
  label: string;
  description: string;
  icon: string;
}

export const CATEGORIES: CategoryOption[] = [
  { value: 'CONFERENCIA', label: 'Conferência', icon: '🎤', color: 'text-indigo-600', bgColor: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400' },
  { value: 'WORKSHOP', label: 'Workshop', icon: '🔧', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200 hover:border-amber-400' },
  { value: 'PALESTRA', label: 'Palestra', icon: '🎓', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200 hover:border-purple-400' },
  { value: 'FESTA', label: 'Festa', icon: '🎉', color: 'text-pink-600', bgColor: 'bg-pink-50 border-pink-200 hover:border-pink-400' },
  { value: 'ESPORTIVO', label: 'Esportivo', icon: '⚽', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200 hover:border-green-400' },
  { value: 'CULTURAL', label: 'Cultural', icon: '🎭', color: 'text-rose-600', bgColor: 'bg-rose-50 border-rose-200 hover:border-rose-400' },
  { value: 'EDUCACIONAL', label: 'Educacional', icon: '📚', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
  { value: 'NETWORKING', label: 'Networking', icon: '🤝', color: 'text-cyan-600', bgColor: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400' },
  { value: 'CORPORATIVO', label: 'Corporativo', icon: '💼', color: 'text-slate-600', bgColor: 'bg-slate-50 border-slate-200 hover:border-slate-400' },
  { value: 'BENEFICENTE', label: 'Beneficente', icon: '❤️', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200 hover:border-red-400' },
  { value: 'OUTRO', label: 'Outro', icon: '📌', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200 hover:border-gray-400' },
];

export const MODALITIES: ModalityOption[] = [
  { value: 'PRESENCIAL', label: 'Presencial', description: 'Evento em local físico', icon: '🏢' },
  { value: 'ONLINE', label: 'Online', description: 'Evento virtual/remoto', icon: '💻' },
  { value: 'HIBRIDO', label: 'Híbrido', description: 'Presencial e online', icon: '🌐' },
];

export const STEPS = [
  { id: 1, title: 'Evento', shortTitle: 'Evento' },
  { id: 2, title: 'Detalhes', shortTitle: 'Detalhes' },
  { id: 3, title: 'Quando', shortTitle: 'Quando' },
  { id: 4, title: 'Opções', shortTitle: 'Opções' },
  { id: 5, title: 'Mídia', shortTitle: 'Mídia' },
  { id: 6, title: 'Revisar', shortTitle: 'Revisar' },
];
