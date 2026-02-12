'use client';

import { useState, useEffect } from 'react';
import WizardStep from '@/components/WizardStep';
import FormField from '@/components/FormField';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { Restaurant } from '@/lib/types';

const RESTAURANT_ARTEN = [
  'Italienisch',
  'Deutsch',
  'Asiatisch',
  'Türkisch',
  'Griechisch',
  'Café',
  'Bar',
  'Sonstiges',
];

const WOCHENTAGE = [
  'montag',
  'dienstag',
  'mittwoch',
  'donnerstag',
  'freitag',
  'samstag',
  'sonntag',
] as const;

const WOCHENTAGE_DISPLAY = {
  montag: 'Montag',
  dienstag: 'Dienstag',
  mittwoch: 'Mittwoch',
  donnerstag: 'Donnerstag',
  freitag: 'Freitag',
  samstag: 'Samstag',
  sonntag: 'Sonntag',
};

interface Props {
  id: string;
  initialData: Partial<Restaurant>;
  onNext: () => void;
  onSave: () => void;
}

export default function Step1Restaurant({ id, initialData, onNext, onSave }: Props) {
  const { data, updateData, saving } = useAutoSave(id, 'restaurant', {
    name: '',
    strasse: '',
    plz: '',
    stadt: '',
    googleMapsLink: '',
    art: '',
    artSonstiges: '',
    sitzplaetzeInnen: undefined,
    sitzplaetzeAussen: undefined,
    oeffnungszeiten: {
      montag: { von: '11:00', bis: '22:00', geschlossen: false },
      dienstag: { von: '11:00', bis: '22:00', geschlossen: false },
      mittwoch: { von: '11:00', bis: '22:00', geschlossen: false },
      donnerstag: { von: '11:00', bis: '22:00', geschlossen: false },
      freitag: { von: '11:00', bis: '23:00', geschlossen: false },
      samstag: { von: '11:00', bis: '23:00', geschlossen: false },
      sonntag: { von: '11:00', bis: '22:00', geschlossen: false },
    },
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (saving) {
      onSave();
    }
  }, [saving, onSave]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
          updateData({ googleMapsLink });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Standort konnte nicht ermittelt werden');
        }
      );
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.name) newErrors.name = 'Restaurantname ist erforderlich';
    if (!data.strasse) newErrors.strasse = 'Straße ist erforderlich';
    if (!data.plz) newErrors.plz = 'PLZ ist erforderlich';
    if (data.plz && data.plz.length !== 5) newErrors.plz = 'PLZ muss 5 Zeichen haben';
    if (!data.stadt) newErrors.stadt = 'Stadt ist erforderlich';
    if (!data.art) newErrors.art = 'Art des Restaurants ist erforderlich';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <WizardStep
      title="Über das Restaurant"
      description="Grundinfos – Name, Adresse, Öffnungszeiten"
    >
      <div className="space-y-6">
        <FormField label="Restaurantname" required error={errors.name}>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. Bella Napoli"
          />
        </FormField>

        <FormField label="Straße + Hausnummer" required error={errors.strasse}>
          <input
            type="text"
            value={data.strasse}
            onChange={(e) => updateData({ strasse: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. Hauptstraße 42"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="PLZ" required error={errors.plz}>
            <input
              type="text"
              maxLength={5}
              value={data.plz}
              onChange={(e) => updateData({ plz: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="12345"
            />
          </FormField>

          <FormField label="Stadt" required error={errors.stadt}>
            <input
              type="text"
              value={data.stadt}
              onChange={(e) => updateData({ stadt: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. Berlin"
            />
          </FormField>
        </div>

        <FormField label="Google Maps Link" hint="Optional: Standort des Restaurants">
          <div className="flex gap-2">
            <input
              type="url"
              value={data.googleMapsLink || ''}
              onChange={(e) => updateData({ googleMapsLink: e.target.value })}
              className="flex-1 px-4 py-3 rounded-lg border"
              placeholder="https://maps.google.com/..."
            />
            <button
              type="button"
              onClick={handleGetLocation}
              className="px-4 py-3 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors"
            >
              📍 Standort teilen
            </button>
          </div>
        </FormField>

        <FormField label="Art des Restaurants" required error={errors.art}>
          <select
            value={data.art}
            onChange={(e) => updateData({ art: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
          >
            <option value="">Bitte wählen</option>
            {RESTAURANT_ARTEN.map(art => (
              <option key={art} value={art}>{art}</option>
            ))}
          </select>
        </FormField>

        {data.art === 'Sonstiges' && (
          <FormField label="Art beschreiben">
            <input
              type="text"
              value={data.artSonstiges || ''}
              onChange={(e) => updateData({ artSonstiges: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. Fusion-Küche"
            />
          </FormField>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Sitzplätze Innen">
            <input
              type="number"
              value={data.sitzplaetzeInnen || ''}
              onChange={(e) => updateData({ sitzplaetzeInnen: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. 50"
            />
          </FormField>

          <FormField label="Sitzplätze Außen">
            <input
              type="number"
              value={data.sitzplaetzeAussen || ''}
              onChange={(e) => updateData({ sitzplaetzeAussen: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. 30"
            />
          </FormField>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Öffnungszeiten</h3>
          <div className="space-y-4">
            {WOCHENTAGE.map(tag => (
              <div key={tag} className="bg-surface-hover rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{WOCHENTAGE_DISPLAY[tag]}</span>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={data.oeffnungszeiten[tag].geschlossen}
                      onChange={(e) => updateData({
                        oeffnungszeiten: {
                          ...data.oeffnungszeiten,
                          [tag]: { ...data.oeffnungszeiten[tag], geschlossen: e.target.checked }
                        }
                      })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-secondary">Geschlossen</span>
                  </label>
                </div>

                {!data.oeffnungszeiten[tag].geschlossen && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={data.oeffnungszeiten[tag].von}
                      onChange={(e) => updateData({
                        oeffnungszeiten: {
                          ...data.oeffnungszeiten,
                          [tag]: { ...data.oeffnungszeiten[tag], von: e.target.value }
                        }
                      })}
                      className="flex-1 px-3 py-2 rounded-lg border bg-background"
                    />
                    <span className="text-secondary px-2">bis</span>
                    <input
                      type="time"
                      value={data.oeffnungszeiten[tag].bis}
                      onChange={(e) => updateData({
                        oeffnungszeiten: {
                          ...data.oeffnungszeiten,
                          [tag]: { ...data.oeffnungszeiten[tag], bis: e.target.value }
                        }
                      })}
                      className="flex-1 px-3 py-2 rounded-lg border bg-background"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors"
          >
            Weiter
          </button>
        </div>
      </div>
    </WizardStep>
  );
}