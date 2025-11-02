/**
 * Modal Component Types
 * Dialog overlays with focus management
 */

import React from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Footer content (typically buttons)
   */
  footer?: React.ReactNode;

  /**
   * Modal size
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Close on backdrop click
   * @default true
   */
  closeOnBackdrop?: boolean;

  /**
   * Close on Escape key
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Hide close button
   * @default false
   */
  hideCloseButton?: boolean;

  /**
   * Additional CSS classes for modal container
   */
  className?: string;
}
