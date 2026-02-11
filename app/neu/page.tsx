'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    const createOnboarding = async () => {
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
          const data = await res.json();
          router.push(`/neu/${data.id}/1`);
        } else {
          alert('Fehler beim Erstellen des Onboardings');
          router.push('/');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Netzwerkfehler');
        router.push('/');
      }
    };

    createOnboarding();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-secondary">Neues Onboarding wird erstellt...</p>
      </div>
    </div>
  );
}