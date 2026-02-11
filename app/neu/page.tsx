'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function NewOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const createOnboarding = async () => {
      try {
        const restaurantName = searchParams.get('restaurant');
        const body = restaurantName ? { restaurant: { name: restaurantName } } : {};
        
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-secondary">Neues Onboarding wird erstellt...</p>
      </div>
    </div>
  );
}

export default function NewOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Lädt...</p>
        </div>
      </div>
    }>
      <NewOnboardingContent />
    </Suspense>
  );
}