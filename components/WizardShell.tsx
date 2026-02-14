'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WizardShellProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onboardingId: string;
  showSave?: boolean;
}

const steps = [
  'Restaurant',
  'Kontakt',
  'Geschäft',
  'Technik',
  'Tische',
  'Speisekarte',
  'Vereinbarung',
  'Vertrag',
];

export default function WizardShell({
  children,
  currentStep,
  totalSteps,
  onboardingId,
  showSave = false,
}: WizardShellProps) {
  const router = useRouter();
  const progress = (currentStep / totalSteps) * 100;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-accent">Oriido Onboarding</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-secondary hover:text-primary"
            >
              Abmelden
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-secondary">
              <span>Schritt {currentStep} von {totalSteps}</span>
              {showSave && (
                <span className="text-success flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Gespeichert
                </span>
              )}
            </div>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-4 overflow-x-auto">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <Link
                  key={step}
                  href={isCompleted ? `/neu/${onboardingId}/${stepNumber}` : '#'}
                  className={`flex-1 min-w-0 text-center py-2 px-1 text-xs transition-colors ${
                    isActive
                      ? 'text-accent font-semibold'
                      : isCompleted
                      ? 'text-primary cursor-pointer hover:text-accent'
                      : 'text-secondary cursor-not-allowed'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isActive
                      ? 'bg-accent text-white'
                      : isCompleted
                      ? 'bg-success text-white'
                      : 'bg-border text-secondary'
                  }`}>
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <span className="block truncate">{step}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-slide-in">
          {children}
        </div>
      </div>
    </div>
  );
}