'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ErfolgPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hallo Firas! Ich habe gerade ein neues Restaurant-Onboarding eingereicht. ID: ${id}`);
    window.open(`https://wa.me/491734689676?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-surface border border-success rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">✅ Erfolgreich eingereicht!</h1>
          <p className="text-secondary mb-8">
            Firas kümmert sich um den Rest. Der Vertrag wird vorbereitet und das Restaurant wird in Oriido angelegt.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleWhatsApp}
              className="w-full px-6 py-3 bg-success hover:bg-success/80 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📱 Firas per WhatsApp benachrichtigen
            </button>
            
            <Link
              href="/neu"
              className="block w-full px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors"
            >
              Neues Restaurant hinzufügen
            </Link>
            
            <Link
              href="/meine"
              className="block w-full px-6 py-3 bg-surface-hover hover:bg-border text-primary font-semibold rounded-lg transition-colors"
            >
              Meine Einreichungen ansehen
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-secondary">
              Onboarding-ID: {id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}