import React from 'react';

interface Step {
  id: number;
  title: string;
  shortTitle: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  maxStepReached?: number;
  onStepClick: (step: number) => void;
  variant?: 'default' | 'light';
}

export default function StepProgress({ steps, currentStep, maxStepReached, onStepClick, variant = 'default' }: StepProgressProps) {
  const isLight = variant === 'light';
  // Se maxStepReached não for passado, usa currentStep como fallback
  const maxReached = maxStepReached ?? currentStep;
  
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = maxReached > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = step.id <= maxReached;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`
                  flex flex-col items-center transition-all relative z-10 flex-shrink-0
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                {/* Circle */}
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-300 border-2
                    ${isLight
                      ? isCompleted
                        ? 'bg-white text-primary-600 border-white shadow-lg'
                        : isCurrent
                          ? 'bg-white text-primary-600 border-white shadow-lg scale-110'
                          : 'bg-white/40 text-white border-white/60'
                      : isCompleted
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                        : isCurrent
                          ? 'bg-white text-primary-600 border-primary-600 shadow-lg scale-110'
                          : 'bg-white text-gray-500 border-gray-300'
                    }
                    ${isClickable && !isCurrent ? 'hover:scale-105' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    mt-1.5 text-xs font-medium transition-colors whitespace-nowrap
                    hidden sm:block
                    ${isLight
                      ? isCurrent ? 'text-white font-semibold' : isCompleted ? 'text-white/90' : 'text-white/70'
                      : isCurrent ? 'text-primary-700 font-semibold' : isCompleted ? 'text-gray-700' : 'text-gray-500'
                    }
                  `}
                >
                  {step.title}
                </span>

                {/* Short Label (Mobile) */}
                <span
                  className={`
                    mt-1.5 text-xs font-medium transition-colors
                    sm:hidden
                    ${isLight
                      ? isCurrent ? 'text-white font-semibold' : isCompleted ? 'text-white/90' : 'text-white/70'
                      : isCurrent ? 'text-primary-700 font-semibold' : isCompleted ? 'text-gray-700' : 'text-gray-500'
                    }
                  `}
                >
                  {step.shortTitle}
                </span>
              </button>

              {/* Connector Line (between steps) */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-1 sm:mx-2 relative min-w-[20px]">
                  {/* Background line */}
                  <div 
                    className={`absolute inset-0 rounded-full ${
                      isLight ? 'bg-white/40' : 'bg-gray-300'
                    }`} 
                  />
                  {/* Progress line */}
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      isLight ? 'bg-white' : 'bg-primary-600'
                    }`}
                    style={{ 
                      width: isCompleted ? '100%' : '0%'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
