'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function DemoPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const demoUrl = 'https://your-restaurant.oriido.com/';

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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(demoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = demoUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openDemo = () => {
    window.open(demoUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="pt-4 text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">
            Live-<span className="text-accent">Demo</span>
          </h1>
          <p className="text-secondary">
            Scann den QR-Code und erlebe Oriido als Gast – genau so sieht es für deine Gäste aus.
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl">
            <QRCodeSVG
              value={demoUrl}
              size={250}
              level="M"
              includeMargin={false}
              className="block"
            />
          </div>
        </div>

        {/* URL and Copy Button */}
        <div className="space-y-4">
          <div className="text-center">
            <button
              onClick={openDemo}
              className="text-accent hover:text-accent-hover transition-colors font-medium underline decoration-dotted underline-offset-4"
            >
              your-restaurant.oriido.com
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-secondary text-center">
              Oder Link direkt teilen:
            </p>
            <button
              onClick={copyToClipboard}
              className="w-full bg-surface border border-border text-primary py-3 px-4 rounded-xl hover:bg-surface-hover transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>{copied ? 'Link kopiert!' : 'Link kopieren'}</span>
              {copied && <span className="text-success">✓</span>}
            </button>
          </div>
        </div>

        {/* Tip Box */}
        <div className="bg-surface/50 border border-border/50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-lg mt-0.5">💡</span>
            <div>
              <h4 className="font-medium text-primary text-sm mb-2">
                Tipp
              </h4>
              <p className="text-secondary text-sm leading-relaxed">
                Lass den Restaurantbesitzer den QR-Code mit seinem eigenen Handy scannen. 
                So erlebt er Oriido aus Gäste-Perspektive und versteht sofort den Mehrwert.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="font-semibold text-primary mb-2 flex items-center space-x-2">
              <span>🚀</span>
              <span>Demo überzeugt?</span>
            </h3>
            <p className="text-secondary text-sm mb-4">
              Starte direkt das Onboarding und erfasse alle Restaurant-Daten.
            </p>
            <button
              onClick={() => router.push('/neu')}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Onboarding starten →
            </button>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="font-semibold text-primary mb-2 flex items-center space-x-2">
              <span>✅</span>
              <span>Noch unsicher?</span>
            </h3>
            <p className="text-secondary text-sm mb-4">
              Gehe zuerst die Restaurant-Checkliste durch, um den Bedarf zu ermitteln.
            </p>
            <button
              onClick={() => router.push('/tools/checkliste')}
              className="w-full bg-surface border border-accent text-accent hover:bg-accent/10 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Zur Checkliste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}