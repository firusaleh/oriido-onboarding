'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Onboarding {
  _id: string;
  restaurant?: {
    name?: string;
    stadt?: string;
  };
  status: string;
  erstelltAm: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [recentOnboardings, setRecentOnboardings] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/');
          return;
        }
        const userData = await res.json();
        setUser(userData);

        // Fetch recent onboardings
        const onboardingsRes = await fetch('/api/onboarding/mine');
        if (onboardingsRes.ok) {
          const onboardingsData = await onboardingsRes.json();
          setRecentOnboardings(onboardingsData.slice(0, 3)); // Last 3
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eingereicht':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'in_bearbeitung':
        return 'bg-info/20 text-info border-info/30';
      case 'abgeschlossen':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-secondary/20 text-secondary border-secondary/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'entwurf':
        return 'Entwurf';
      case 'eingereicht':
        return 'Eingereicht';
      case 'in_bearbeitung':
        return 'In Bearbeitung';
      case 'abgeschlossen':
        return 'Abgeschlossen';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Welcome Header */}
        <div className="pt-4 pb-2">
          <h1 className="text-2xl font-bold text-primary">
            Hallo, <span className="text-accent">{user?.name}</span>!
          </h1>
          <p className="text-secondary mt-1">
            Bereit für dein nächstes Restaurant?
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="space-y-4">
          <Link
            href="/neu"
            className="block bg-surface border border-border rounded-xl p-6 hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">
                  Neues Onboarding starten
                </h3>
                <p className="text-secondary text-sm mt-1">
                  Restaurant-Daten erfassen und einreichen
                </p>
              </div>
              <span className="text-secondary text-xl">›</span>
            </div>
          </Link>

          <Link
            href="/prospecting"
            className="block bg-surface border border-border rounded-xl p-6 hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🗺️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">
                  Restaurants entdecken
                </h3>
                <p className="text-secondary text-sm mt-1">
                  Finde neue Restaurants auf der Karte in deiner Nähe
                </p>
              </div>
              <span className="text-secondary text-xl">›</span>
            </div>
          </Link>

          <Link
            href="/tools"
            className="block bg-surface border border-border rounded-xl p-6 hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-info/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧰</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">
                  Sales Tools
                </h3>
                <p className="text-secondary text-sm mt-1">
                  Checkliste, Demo und mehr für dein Verkaufsgespräch
                </p>
              </div>
              <span className="text-secondary text-xl">›</span>
            </div>
          </Link>

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="block bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl p-6 hover:from-gray-700 hover:to-gray-600 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    Admin Dashboard
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    Verwaltung aller Module und Funktionen
                  </p>
                </div>
                <span className="text-white/80 text-xl">›</span>
              </div>
            </Link>
          )}
        </div>

        {/* Recent Onboardings */}
        {recentOnboardings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary">
              Letzte Einreichungen
            </h2>
            
            {recentOnboardings.map((onboarding) => (
              <Link
                key={onboarding._id}
                href={`/admin/${onboarding._id}`}
                className="block bg-surface border border-border rounded-xl p-4 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-primary">
                      {onboarding.restaurant?.name || 'Unbenanntes Restaurant'}
                    </h3>
                    <p className="text-secondary text-sm">
                      {onboarding.restaurant?.stadt && `${onboarding.restaurant.stadt} • `}
                      {new Date(onboarding.erstelltAm).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(onboarding.status)}`}>
                    {getStatusLabel(onboarding.status)}
                  </span>
                </div>
              </Link>
            ))}

            <Link
              href="/meine"
              className="block text-center py-3 text-accent hover:text-accent-hover transition-colors"
            >
              Alle anzeigen →
            </Link>
          </div>
        )}

        {recentOnboardings.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="text-6xl">📝</div>
            <h3 className="text-lg font-semibold text-primary">
              Noch keine Einreichungen
            </h3>
            <p className="text-secondary">
              Starte dein erstes Onboarding oder nutze die Sales Tools
            </p>
          </div>
        )}
      </div>
    </div>
  );
}