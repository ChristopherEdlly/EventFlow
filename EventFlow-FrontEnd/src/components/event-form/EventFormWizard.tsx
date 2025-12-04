import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  Sparkles
} from 'lucide-react';

import { EventFormData, STEPS, defaultFormData } from './types';
import StepProgress from './StepProgress';
import EventPreviewCard from './EventPreviewCard';
import BasicInfoStep from './steps/BasicInfoStep';
import DetailsStep from './steps/DetailsStep';
import DateLocationStep from './steps/DateLocationStep';
import SettingsStep from './steps/SettingsStep';
import MediaTagsStep from './steps/MediaTagsStep';
import ReviewStep from './steps/ReviewStep';
import { api } from '../../services/api';

interface EventFormWizardProps {
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<EventFormData>;
  eventId?: string;
  mode?: 'create' | 'edit';
}

const EventFormWizard: React.FC<EventFormWizardProps> = ({ 
  onSuccess,
  onCancel,
  initialData,
  eventId,
  mode = 'create'
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    ...defaultFormData,
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update form data
  const updateFormData = useCallback((updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedKeys = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedKeys.forEach(key => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  // Validate current step
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Nome e Categoria
        if (!formData.title.trim()) {
          newErrors.title = 'Digite o nome do evento';
        } else if (formData.title.length < 3) {
          newErrors.title = 'Nome deve ter pelo menos 3 caracteres';
        }
        break;

      case 2: // Detalhes (opcional)
        // Descrição é opcional, sem validação obrigatória
        break;

      case 3: // Data e Local
        if (!formData.date) {
          newErrors.date = 'Selecione a data do evento';
        }
        if (!formData.time) {
          newErrors.time = 'Selecione o horário';
        }
        if (formData.eventType !== 'ONLINE' && !formData.location.trim()) {
          newErrors.location = 'Informe o local do evento';
        }
        if (formData.eventType !== 'PRESENCIAL' && !formData.onlineUrl?.trim()) {
          newErrors.onlineUrl = 'Informe o link do evento online';
        }
        break;

      case 4: // Opções
        if (formData.capacity !== null && Number(formData.capacity) < 1) {
          newErrors.capacity = 'Capacidade deve ser pelo menos 1';
        }
        if (formData.price < 0) {
          newErrors.price = 'Preço não pode ser negativo';
        }
        break;

      case 5: // Mídia
        // Opcional
        break;

      case 6: // Revisão
        // Todas as validações já foram feitas
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Navigation
  const goToStep = useCallback((step: number) => {
    // Permite navegar para qualquer etapa até o máximo já alcançado
    if (step >= 1 && step <= maxStepReached) {
      setCurrentStep(step);
    }
  }, [maxStepReached]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        const nextStepNum = currentStep + 1;
        setCurrentStep(nextStepNum);
        // Atualiza o máximo alcançado
        setMaxStepReached(prev => Math.max(prev, nextStepNum));
      }
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data for API
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        date: formData.date,
        time: formData.time || undefined,
        endDate: formData.endDate || undefined,
        endTime: formData.endTime || undefined,
        location: formData.location || 'Online',
        visibility: formData.visibility,
        category: formData.category,
        eventType: formData.eventType,
        price: formData.price,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        allowWaitlist: formData.waitlistEnabled,
        requireApproval: formData.showGuestList,
        rsvpDeadline: formData.rsvpDeadline || undefined,
        minAge: formData.minAge ? parseInt(formData.minAge, 10) : null,
        imageUrl: formData.imageUrl || undefined,
        onlineUrl: formData.onlineUrl || undefined,
        tags: formData.tags.length > 0 ? formData.tags.join(',') : undefined,
      };

      let responseId: string;

      if (mode === 'edit' && eventId) {
        // Update existing event
        await api.patch(`/events/${eventId}`, eventData);
        responseId = eventId;
      } else {
        // Create new event
        const response = await api.post<{ id: string }>('/events', eventData);
        responseId = response.id;
      }
      
      if (onSuccess) {
        onSuccess(responseId);
      } else {
        navigate(`/events/${responseId}`);
      }
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} event:`, error);
      setSubmitError(
        (error as { message?: string })?.message || 
        `Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} evento. Tente novamente.`
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, formData, navigate, onSuccess, validateStep, mode, eventId]);

  // Render current step
  const renderStep = useMemo(() => {
    const stepProps = {
      formData,
      updateFormData,
      errors,
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...stepProps} />;
      case 2:
        return <DetailsStep {...stepProps} />;
      case 3:
        return <DateLocationStep {...stepProps} />;
      case 4:
        return <SettingsStep {...stepProps} />;
      case 5:
        return <MediaTagsStep {...stepProps} />;
      case 6:
        return <ReviewStep {...stepProps} onEdit={goToStep} />;
      default:
        return null;
    }
  }, [currentStep, formData, updateFormData, errors, goToStep]);

  // Check if can proceed (visual feedback)
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length >= 3;
      case 2:
        return true; // Opcional
      case 3:
        return formData.date && formData.time && 
               (formData.eventType === 'ONLINE' || formData.location.trim()) &&
               (formData.eventType === 'PRESENCIAL' || formData.onlineUrl?.trim());
      case 4:
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  return (
    <div className="min-h-full">
      {/* Header Compacto */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white rounded-xl mb-6">
        <div className="px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Botão Voltar */}
            <button
              onClick={() => onCancel ? onCancel() : navigate('/my-events')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white/90 hover:text-white text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Voltar</span>
            </button>

            {/* Stepper - ocupa o espaço central */}
            <div className="flex-1">
              <StepProgress 
                currentStep={currentStep}
                maxStepReached={maxStepReached}
                steps={STEPS}
                onStepClick={goToStep}
                variant="light"
              />
            </div>

            {/* Título */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white/80 hidden sm:block" />
              <div className="text-right">
                <h1 className="text-sm sm:text-base font-semibold">
                  {mode === 'edit' ? 'Editar Evento' : 'Criar Evento'}
                </h1>
                <p className="text-white/60 text-xs hidden sm:block">
                  {currentStep}/{STEPS.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                  {renderStep}
                </motion.div>
              </AnimatePresence>

              {/* Error Message */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                >
                  {submitError}
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                    ${currentStep === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                      ${canProceed
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/25'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {mode === 'edit' ? 'Salvando...' : 'Criando...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {mode === 'edit' ? 'Salvar Alterações' : 'Criar Evento'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <EventPreviewCard formData={formData} currentStep={currentStep} />
            </div>
          </div>
        </div>
    </div>
  );
};

export default EventFormWizard;
