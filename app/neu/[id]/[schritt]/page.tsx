'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WizardShell from '@/components/WizardShell';
import Step1Restaurant from '@/components/steps/Step1Restaurant';
import Step2Kontakt from '@/components/steps/Step2Kontakt';
import Step3Geschaeftsdaten from '@/components/steps/Step3Geschaeftsdaten';
import Step4Technik from '@/components/steps/Step4Technik';
import Step5Tische from '@/components/steps/Step5Tische';
import Step6Speisekarte from '@/components/steps/Step6Speisekarte';
import Step7Vereinbarung from '@/components/steps/Step7Vereinbarung';

export default function WizardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const currentStep = parseInt(params.schritt as string);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    const fetchOnboarding = async () => {
      try {
        const res = await fetch(`/api/onboarding/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOnboarding(data);
        } else {
          router.push('/neu');
        }
      } catch (error) {
        console.error('Error fetching onboarding:', error);
        router.push('/neu');
      } finally {
        setLoading(false);
      }
    };

    fetchOnboarding();
  }, [id, router]);

  const handleNext = () => {
    if (currentStep < 7) {
      router.push(`/neu/${id}/${currentStep + 1}`);
    } else {
      router.push(`/neu/${id}/zusammenfassung`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      router.push(`/neu/${id}/${currentStep - 1}`);
    }
  };

  const handleSaveIndicator = () => {
    setShowSave(true);
    setTimeout(() => setShowSave(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!onboarding) {
    return null;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Restaurant
            id={id}
            initialData={onboarding.restaurant || {}}
            onNext={handleNext}
            onSave={handleSaveIndicator}
          />
        );
      case 2:
        return (
          <Step2Kontakt
            id={id}
            initialData={onboarding.kontakt || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSave={handleSaveIndicator}
          />
        );
      case 3:
        return (
          <Step3Geschaeftsdaten
            id={id}
            initialData={onboarding.geschaeftsdaten || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSave={handleSaveIndicator}
          />
        );
      case 4:
        return (
          <Step4Technik
            id={id}
            initialData={onboarding.technik || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSave={handleSaveIndicator}
          />
        );
      case 5:
        return (
          <Step5Tische
            id={id}
            initialData={onboarding.tische || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSave={handleSaveIndicator}
          />
        );
      case 6:
        return (
          <Step6Speisekarte
            id={id}
            initialData={onboarding.speisekarte || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSave={handleSaveIndicator}
          />
        );
      case 7:
        return (
          <Step7Vereinbarung
            id={id}
            initialData={onboarding.vereinbarung || {}}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSave={handleSaveIndicator}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WizardShell
      currentStep={currentStep}
      totalSteps={7}
      onboardingId={id}
      showSave={showSave}
    >
      {renderStep()}
    </WizardShell>
  );
}