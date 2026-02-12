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

  const salesTools = [
    {
      href: '/tools/checkliste',
      icon: '✅',
      title: 'Restaurant-Checkliste',
      description: 'Ist das Restaurant bereit? 8 Punkte durchgehen.',
      color: 'accent'
    },
    {
      href: '/tools/demo',
      icon: '📱',
      title: 'Live-Demo',
      description: 'QR-Code scannen – Oriido als Gast erleben.',
      color: 'info'
    },
    {
      href: '/tools/einwaende',
      icon: '💬',
      title: 'Einwände Datenbank',
      description: '12 häufige Einwände mit perfekten Antworten.',
      color: 'warning'
    },
    {
      href: '/tools/leitfaden',
      icon: '🗺️',
      title: 'Gesprächsleitfaden',
      description: '8 Schritte zum erfolgreichen Verkaufsgespräch.',
      color: 'success'
    },
    {
      href: '/tools/dokumente',
      icon: '📄',
      title: 'Dokumente Hub',
      description: 'Alle Verkaufsunterlagen an einem Ort.',
      color: 'primary'
    },
    {
      href: '/tools/briefing',
      icon: '📢',
      title: 'Tägliches Briefing',
      description: 'Aktuelle News und wichtige Updates.',
      color: 'secondary'
    }
  ];

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

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {salesTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-surface border border-border rounded-xl p-4 hover:bg-surface-hover transition-all hover:shadow-md group"
            >
              <div className="flex flex-col h-full">
                <div className={`w-10 h-10 bg-${tool.color}/12 rounded-lg flex items-center justify-center mb-3`}>
                  <span className="text-xl">{tool.icon}</span>
                </div>
                <h3 className="font-semibold text-primary text-sm mb-1">
                  {tool.title}
                </h3>
                <p className="text-secondary text-xs line-clamp-2 flex-1">
                  {tool.description}
                </p>
                <div className="text-accent text-xs mt-2 group-hover:translate-x-1 transition-transform">
                  Öffnen →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CRM Quick Access */}
        <Link
          href="/crm"
          className="block bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-indigo-700 transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                CRM Pipeline
              </h3>
              <p className="text-white/90 text-sm mt-1">
                Restaurants verwalten und nachverfolgen
              </p>
            </div>
            <span className="text-white/80 text-xl">›</span>
          </div>
        </Link>

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
                Nutze den Gesprächsleitfaden für die Struktur, die Einwände-Datenbank 
                bei Bedenken und die Checkliste zur Qualifikation. Bei Interesse direkt 
                das Onboarding starten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}