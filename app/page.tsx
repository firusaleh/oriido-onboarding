'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<'pin' | 'email'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = loginMode === 'pin' ? '/api/auth/login' : '/api/auth/login-email';
      const body = loginMode === 'pin' 
        ? { name, pin }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.isFirstLogin && loginMode === 'pin') {
          window.location.href = '/registrieren';
        } else {
          window.location.href = data.redirect;
        }
      } else {
        setError(data.error || 'Anmeldung fehlgeschlagen');
      }
    } catch (err) {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-accent mb-2">Oriido</h1>
            <p className="text-secondary">Restaurant Onboarding Tool</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMode === 'email'
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-secondary hover:text-primary'
              }`}
            >
              Mit E-Mail
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('pin')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMode === 'pin'
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-secondary hover:text-primary'
              }`}
            >
              Mit PIN (Erstanmeldung)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {loginMode === 'email' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-surface-hover"
                    placeholder="deine@email.de"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Passwort
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-surface-hover"
                    placeholder="Dein Passwort"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-surface-hover"
                    placeholder="Dein Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-lg border bg-surface-hover text-center text-2xl tracking-widest"
                    placeholder="••••"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-secondary text-center">
              {loginMode === 'pin' 
                ? 'Erste Anmeldung: Verkäufer PIN: 1234 | Admin PIN: 9876'
                : 'Noch kein Konto? Verwende zuerst die PIN-Anmeldung.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}