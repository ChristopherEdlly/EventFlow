/**
 * Alert Component
 * Notification and feedback messages with multiple variants
 */

import React from 'react';
import clsx from 'clsx';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { AlertProps } from './Alert.types';

/**
 * Alert component for notifications and feedback
 *
 * @example
 * ```tsx
 * <Alert variant="success" title="Success!">
 *   Your event has been created successfully.
 * </Alert>
 * ```
 */
export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  icon,
  hideIcon = false,
  className,
}) => {
  const isDismissible = Boolean(onClose);

  // Variant styles
  const variantStyles = {
    success: {
      container: 'bg-success-50 border-success-200 text-success-900',
      icon: 'text-success-600',
      title: 'text-success-900',
      defaultIcon: CheckCircle,
    },
    error: {
      container: 'bg-error-50 border-error-200 text-error-900',
      icon: 'text-error-600',
      title: 'text-error-900',
      defaultIcon: XCircle,
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 text-warning-900',
      icon: 'text-warning-600',
      title: 'text-warning-900',
      defaultIcon: AlertTriangle,
    },
    info: {
      container: 'bg-info-50 border-info-200 text-info-900',
      icon: 'text-info-600',
      title: 'text-info-900',
      defaultIcon: Info,
    },
  };

  const styles = variantStyles[variant];
  const DefaultIcon = styles.defaultIcon;

  // Determine ARIA role based on variant
  const role = variant === 'error' ? 'alert' : 'status';

  return (
    <div
      role={role}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={clsx(
        'relative rounded-lg border p-4',
        'flex gap-3',
        styles.container,
        className
      )}
    >
      {/* Icon */}
      {!hideIcon && (
        <div className={clsx('flex-shrink-0', styles.icon)}>
          {icon || <DefaultIcon className="w-5 h-5" />}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={clsx('font-semibold mb-1', styles.title)}>
            {title}
          </h3>
        )}
        <div className="text-sm">
          {children}
        </div>
      </div>

      {/* Close Button */}
      {isDismissible && (
        <button
          type="button"
          onClick={onClose}
          className={clsx(
            'flex-shrink-0 -mr-1 -mt-1',
            'inline-flex items-center justify-center',
            'w-8 h-8 rounded-lg',
            'transition-colors duration-200',
            'hover:bg-black/5',
            'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-current',
            styles.icon
          )}
          aria-label="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';

export default Alert;
