'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeitfadenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/');
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-primary">
            Gesprächs-<span className="text-accent">Leitfaden</span>
          </h1>
          <p className="text-secondary mt-1">Schritt für Schritt zum erfolgreichen Abschluss</p>
        </div>

        <div className="text-center py-12">
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            Gesprächsleitfaden
          </h3>
          <p className="text-secondary">
            Dieses Modul wird bald verfügbar sein
          </p>
        </div>
      </div>
    </div>
  );
}