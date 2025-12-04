import React, { useState } from 'react';
import { StepProps, CATEGORIES, MODALITIES } from '../types';

interface ReviewStepProps extends StepProps {
  onEdit: (step: number) => void;
}

export default function ReviewStep({ formData, updateFormData, onEdit }: ReviewStepProps) {
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const category = CATEGORIES.find(c => c.value === formData.category);
  const modality = MODALITIES.find(m => m.value === formData.eventType);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Não definido';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Não definido';
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Funções para gerenciar convidados
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase();
    
    if (!email) {
      setEmailError('Digite um email');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Email inválido');
      return;
    }
    
    if (formData.guestEmails.includes(email)) {
      setEmailError('Email já adicionado');
      return;
    }
    
    updateFormData({ guestEmails: [...formData.guestEmails, email] });
    setNewEmail('');
    setEmailError('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    updateFormData({ 
      guestEmails: formData.guestEmails.filter(e => e !== emailToRemove) 
    });
  };

  const handlePasteEmails = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const emails = pastedText
      .split(/[,;\s\n]+/)
      .map(email => email.trim().toLowerCase())
      .filter(email => email && validateEmail(email) && !formData.guestEmails.includes(email));
    
    if (emails.length > 0) {
      updateFormData({ guestEmails: [...formData.guestEmails, ...emails] });
      setNewEmail('');
      setEmailError('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Revisão Final
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Revise as informações antes de criar o evento
        </p>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        {/* Basic Info */}
        <ReviewSection
          title="Informações Básicas"
          icon="📝"
          onEdit={() => onEdit(1)}
        >
          <ReviewItem label="Nome do Evento" value={formData.title || 'Não definido'} />
          <ReviewItem 
            label="Categoria" 
            value={
              <span className="inline-flex items-center gap-1.5">
                <span>{category?.icon}</span>
                <span>{category?.label || 'Outro'}</span>
              </span>
            } 
          />
          <ReviewItem 
            label="Descrição" 
            value={formData.description || 'Nenhuma descrição'} 
            truncate
          />
        </ReviewSection>

        {/* Date & Location */}
        <ReviewSection
          title="Data e Local"
          icon="📍"
          onEdit={() => onEdit(2)}
        >
          <ReviewItem label="Data de Início" value={formatDate(formData.date)} />
          {formData.time && <ReviewItem label="Horário" value={formData.time} />}
          {formData.endDate && (
            <ReviewItem label="Data de Término" value={formatDate(formData.endDate)} />
          )}
          <ReviewItem 
            label="Modalidade" 
            value={
              <span className="inline-flex items-center gap-1.5">
                <span>{modality?.icon}</span>
                <span>{modality?.label}</span>
              </span>
            } 
          />
          {(formData.eventType === 'PRESENCIAL' || formData.eventType === 'HIBRIDO') && (
            <ReviewItem label="Local" value={formData.location || 'Não definido'} />
          )}
          {(formData.eventType === 'ONLINE' || formData.eventType === 'HIBRIDO') && (
            <ReviewItem label="Link Online" value={formData.onlineUrl || 'Não definido'} truncate />
          )}
        </ReviewSection>

        {/* Settings */}
        <ReviewSection
          title="Configurações"
          icon="⚙️"
          onEdit={() => onEdit(3)}
        >
          <ReviewItem 
            label="Visibilidade" 
            value={
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                formData.visibility === 'PUBLIC' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {formData.visibility === 'PUBLIC' ? '🌐 Público' : '🔒 Privado'}
              </span>
            } 
          />
          <ReviewItem 
            label="Preço" 
            value={
              <span className={`font-semibold ${formData.price === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                {formatPrice(formData.price)}
              </span>
            } 
          />
          {formData.capacity && (
            <ReviewItem label="Capacidade" value={`${formData.capacity} pessoas`} />
          )}
          {formData.minAge && (
            <ReviewItem label="Idade Mínima" value={`${formData.minAge} anos`} />
          )}
          <ReviewItem 
            label="Lista de Espera" 
            value={formData.waitlistEnabled ? 'Habilitada' : 'Desabilitada'} 
          />
          <ReviewItem 
            label="Lista de Convidados" 
            value={formData.showGuestList ? 'Visível' : 'Oculta'} 
          />
        </ReviewSection>

        {/* Media & Tags */}
        <ReviewSection
          title="Mídia e Tags"
          icon="🖼️"
          onEdit={() => onEdit(5)}
        >
          <ReviewItem 
            label="Imagem" 
            value={formData.imageUrl ? (
              <div className="mt-2">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview"
                  className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                />
              </div>
            ) : 'Nenhuma imagem'} 
          />
          <ReviewItem 
            label="Tags" 
            value={formData.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : 'Nenhuma tag'} 
          />
        </ReviewSection>

        {/* Convidados */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden border border-blue-200">
          <div className="flex items-center justify-between px-4 py-3 bg-blue-100/50">
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <h3 className="font-semibold text-gray-900">Convidados</h3>
              {formData.guestEmails.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
                  {formData.guestEmails.length}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">Opcional</span>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
              Adicione emails de pessoas que você deseja convidar. Eles receberão um convite por email após a criação do evento.
            </p>
            
            {/* Input para adicionar email */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailError('');
                  }}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePasteEmails}
                  placeholder="email@exemplo.com"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    emailError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-600">{emailError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              💡 Dica: Cole múltiplos emails separados por vírgula ou quebra de linha
            </p>
            
            {/* Lista de emails adicionados */}
            {formData.guestEmails.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Emails adicionados:
                  </span>
                  <button
                    type="button"
                    onClick={() => updateFormData({ guestEmails: [] })}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Limpar todos
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
                  {formData.guestEmails.map((email, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium group"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {formData.guestEmails.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Nenhum convidado adicionado ainda
                <br />
                <span className="text-xs">Você pode adicionar convidados depois também</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ready to Publish */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-emerald-900">Tudo pronto!</h4>
            <p className="mt-1 text-sm text-emerald-700">
              Revise as informações acima e clique em <strong>"Criar Evento"</strong> para publicar.
              Você pode editar os detalhes depois, se precisar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewSectionProps {
  title: string;
  icon: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ title, icon, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Editar
        </button>
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

interface ReviewItemProps {
  label: string;
  value: React.ReactNode;
  truncate?: boolean;
}

function ReviewItem({ label, value, truncate }: ReviewItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
      <span className="text-sm text-gray-500 sm:w-32 flex-shrink-0">{label}:</span>
      <span className={`text-sm text-gray-900 ${truncate ? 'line-clamp-2' : ''}`}>
        {value}
      </span>
    </div>
  );
}
