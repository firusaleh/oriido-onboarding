'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Onboarding {
  _id: string;
  status: string;
  erstelltAm: string;
  eingereichtAm?: string;
  restaurant?: {
    name?: string;
    stadt?: string;
  };
}

export default function MeinePage() {
  const router = useRouter();
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboardings();
  }, []);

  const fetchOnboardings = async () => {
    try {
      const res = await fetch('/api/onboarding/mine');
      if (res.ok) {
        const data = await res.json();
        setOnboardings(data);
      }
    } catch (error) {
      console.error('Error fetching onboardings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      entwurf: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      eingereicht: 'bg-accent/20 text-accent border-accent/30',
      in_bearbeitung: 'bg-info/20 text-info border-info/30',
      abgeschlossen: 'bg-success/20 text-success border-success/30',
    };

    const labels = {
      entwurf: 'Entwurf',
      eingereicht: 'Eingereicht',
      in_bearbeitung: 'In Bearbeitung',
      abgeschlossen: 'Abgeschlossen',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-accent">Meine Einreichungen</h1>
            <div className="flex gap-2">
              <Link
                href="/neu"
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors"
              >
                + Neues Restaurant
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-secondary hover:text-primary"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : onboardings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-xl font-semibold mb-2">Noch keine Einreichungen</h2>
            <p className="text-secondary mb-6">Starte jetzt mit deinem ersten Restaurant-Onboarding</p>
            <Link
              href="/neu"
              className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors"
            >
              Erstes Restaurant hinzufügen
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {onboardings.map((onboarding) => (
              <div
                key={onboarding._id}
                className="bg-surface border border-border rounded-xl p-6 hover:border-accent transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-primary">
                    {onboarding.restaurant?.name || 'Unbenannt'}
                  </h3>
                  {getStatusBadge(onboarding.status)}
                </div>
                
                <div className="space-y-2 text-sm text-secondary mb-4">
                  <div className="flex justify-between">
                    <span>Stadt:</span>
                    <span className="text-primary">{onboarding.restaurant?.stadt || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Erstellt:</span>
                    <span className="text-primary">
                      {format(new Date(onboarding.erstelltAm), 'dd. MMM yyyy', { locale: de })}
                    </span>
                  </div>
                  {onboarding.eingereichtAm && (
                    <div className="flex justify-between">
                      <span>Eingereicht:</span>
                      <span className="text-primary">
                        {format(new Date(onboarding.eingereichtAm), 'dd. MMM yyyy', { locale: de })}
                      </span>
                    </div>
                  )}
                </div>

                {onboarding.status === 'entwurf' ? (
                  <Link
                    href={`/neu/${onboarding._id}/1`}
                    className="block w-full text-center px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors"
                  >
                    Weiter bearbeiten
                  </Link>
                ) : (
                  <div className="text-center text-sm text-secondary py-2">
                    {onboarding.status === 'eingereicht' && 'Warte auf Bestätigung'}
                    {onboarding.status === 'in_bearbeitung' && 'Wird bearbeitet'}
                    {onboarding.status === 'abgeschlossen' && '✅ Fertig'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}