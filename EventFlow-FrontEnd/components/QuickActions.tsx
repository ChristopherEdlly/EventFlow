import React, { useState } from 'react';

export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Action Buttons */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-full shadow-lg
                  transform transition-all duration-300 hover:scale-105
                  ${action.color || 'bg-white hover:bg-neutral-50'}
                  text-neutral-700 font-medium whitespace-nowrap
                  animate-slide-up
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <span className="w-5 h-5">{action.icon}</span>
                <span className="pr-2">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full shadow-2xl
            flex items-center justify-center
            transition-all duration-300 transform hover:scale-110
            ${isOpen ? 'bg-error-600 rotate-45' : 'bg-gradient-to-r from-primary-600 to-secondary-600'}
          `}
          aria-label="Ações rápidas"
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
