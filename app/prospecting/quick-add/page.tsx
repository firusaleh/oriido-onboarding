'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function QuickAddPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    adresse: '',
    telefon: '',
    email: '',
    website: '',
    notizen: '',
    status: 'lead' as const,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Restaurant Name ist erforderlich');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/crm/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quelle: 'manuell',
          lat: 0,
          lng: 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      toast.success('Restaurant wurde hinzugefügt');
      router.back();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Hinzufügen des Restaurants');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-bold">Restaurant manuell hinzufügen</h1>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Info */}
          <div className="bg-surface-dark rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Restaurant Informationen</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
                placeholder="z.B. Pizzeria Roma"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
                placeholder="Straße, PLZ Stadt"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
                  placeholder="+49 123 456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
                  placeholder="info@restaurant.de"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
                placeholder="https://www.restaurant.de"
              />
            </div>
          </div>

          {/* Status */}
          <div className="bg-surface-dark rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'lead', label: 'Lead', color: 'bg-blue-500' },
                { value: 'kontaktiert', label: 'Kontaktiert', color: 'bg-yellow-500' },
                { value: 'termin', label: 'Termin', color: 'bg-purple-500' },
                { value: 'angebot', label: 'Angebot', color: 'bg-orange-500' },
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: status.value as any })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.status === status.value
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className={`w-3 h-3 ${status.color} rounded-full mx-auto mb-2`} />
                  <div className="text-sm">{status.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notizen */}
          <div className="bg-surface-dark rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Notizen</h2>
            
            <textarea
              value={formData.notizen}
              onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
              rows={4}
              placeholder="Zusätzliche Informationen zum Restaurant..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-surface-hover hover:bg-border rounded-lg font-semibold transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="flex-1 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Speichern...' : 'Restaurant hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}