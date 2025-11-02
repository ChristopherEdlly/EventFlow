/**
 * Modal Component
 * Accessible dialog overlay with focus management and keyboard support
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { ModalProps } from './Modal.types';

/**
 * Modal component for dialogs and overlays
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Create Event"
 *   footer={
 *     <div className="flex gap-2">
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleSave}>Save</Button>
 *     </div>
 *   }
 * >
 *   <p>Modal content here</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  hideCloseButton = false,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size styles
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }

      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={clsx(
          'relative z-10 w-full',
          'bg-white rounded-xl shadow-2xl',
          'max-h-[90vh] flex flex-col',
          sizeStyles[size],
          'transform transition-all',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-neutral-900"
              >
                {title}
              </h2>
            )}
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  'inline-flex items-center justify-center',
                  'w-8 h-8 rounded-lg',
                  'text-neutral-500 hover:text-neutral-700',
                  'hover:bg-neutral-100',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  !title && 'ml-auto'
                )}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal
  return createPortal(modalContent, document.body);
};

Modal.displayName = 'Modal';

export default Modal;
