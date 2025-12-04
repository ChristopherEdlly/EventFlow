import React from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';

// Animações de página
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageTransition: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

// Animações de lista (stagger)
export const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Animações de fade
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Animações de scale
export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// Animações de slide
export const slideVariants = {
  left: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
  right: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  up: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  down: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
};

// Componente de página animada
interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente de lista animada
interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedList({ children, className = '' }: AnimatedListProps) {
  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente de item de lista animado
interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className = '' }: AnimatedListItemProps) {
  return (
    <motion.div
      variants={listItemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente de presença animada
interface AnimatedPresenceWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}

export function AnimatedPresenceWrapper({ children, isVisible, className = '' }: AnimatedPresenceWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Componente de card animado com hover
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

export function AnimatedCard({ children, className = '', onClick, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente de botão animado
interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function AnimatedButton({ children, className = '', onClick, disabled, type = 'button' }: AnimatedButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// Componente de contador animado
interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

// Componente de loading spinner animado
interface AnimatedSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedSpinner({ size = 'md', className = '' }: AnimatedSpinnerProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} ${className}`}
    >
      <svg className="w-full h-full text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </motion.div>
  );
}

// Componente de loading com texto
interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ text = 'Carregando...', size = 'md' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AnimatedSpinner size={size} />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-gray-500 text-sm"
      >
        {text}
      </motion.p>
    </div>
  );
}

// Componente de sucesso animado
interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({ message = 'Sucesso!', onComplete }: SuccessAnimationProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      onAnimationComplete={onComplete}
      className="flex flex-col items-center justify-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-900 font-medium"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}

export default {
  AnimatedPage,
  AnimatedList,
  AnimatedListItem,
  AnimatedPresenceWrapper,
  AnimatedCard,
  AnimatedButton,
  AnimatedCounter,
  AnimatedSpinner,
  LoadingState,
  SuccessAnimation,
};
