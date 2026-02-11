'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ToolsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
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
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
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
        {/* Header */}
        <div className="pt-4 pb-2">
          <h1 className="text-2xl font-bold text-primary">Sales Tools</h1>
          <p className="text-secondary mt-1">
            Alles was du für dein Verkaufsgespräch brauchst.
          </p>
        </div>

        {/* Tool Cards */}
        <div className="space-y-4">
          <Link
            href="/tools/checkliste"
            className="block bg-surface border border-border rounded-xl p-6 hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent/12 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">
                  Restaurant-Checkliste
                </h3>
                <p className="text-secondary text-sm mt-1">
                  Ist das Restaurant bereit? 8 Punkte durchgehen.
                </p>
              </div>
              <span className="text-secondary text-xl">›</span>
            </div>
          </Link>

          <Link
            href="/tools/demo"
            className="block bg-surface border border-border rounded-xl p-6 hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-info/12 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">
                  Live-Demo
                </h3>
                <p className="text-secondary text-sm mt-1">
                  QR-Code scannen – Oriido als Gast erleben.
                </p>
              </div>
              <span className="text-secondary text-xl">›</span>
            </div>
          </Link>
        </div>

        {/* Onboarding CTA */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary">
                Restaurant überzeugt?
              </h3>
              <p className="text-secondary text-sm mt-1">
                Onboarding starten und alle Daten erfassen
              </p>
            </div>
          </div>
          <Link
            href="/neu"
            className="block w-full mt-4 bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-4 rounded-xl text-center transition-colors"
          >
            Onboarding starten →
          </Link>
        </div>

        {/* Tips Section */}
        <div className="bg-surface/50 border border-border/50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-lg mt-0.5">💡</span>
            <div>
              <h4 className="font-medium text-primary text-sm">
                Tipp für dein Verkaufsgespräch
              </h4>
              <p className="text-secondary text-xs mt-1 leading-relaxed">
                Beginne mit der Checkliste, um den Bedarf zu ermitteln. 
                Zeige dann die Demo, damit der Kunde Oriido selbst erlebt. 
                Bei Interesse direkt das Onboarding starten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}