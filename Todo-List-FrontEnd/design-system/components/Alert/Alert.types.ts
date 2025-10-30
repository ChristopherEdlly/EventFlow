/**
 * Alert Component Types
 * Notification and feedback messages
 */

import React from 'react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  /**
   * Visual style variant
   * @default 'info'
   */
  variant?: AlertVariant;

  /**
   * Alert title (optional)
   */
  title?: string;

  /**
   * Alert content
   */
  children: React.ReactNode;

  /**
   * Close handler (makes alert dismissible)
   */
  onClose?: () => void;

  /**
   * Custom icon (overrides default variant icon)
   */
  icon?: React.ReactNode;

  /**
   * Hide the icon
   * @default false
   */
  hideIcon?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}
