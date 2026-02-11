'use client';

import { useState, useEffect } from 'react';
import WizardStep from '@/components/WizardStep';
import FormField from '@/components/FormField';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { Kontakt } from '@/lib/types';

const ROLLEN = ['Inhaber', 'Geschäftsführer', 'Betriebsleiter', 'Sonstiges'];
const KANAELE = ['WhatsApp', 'E-Mail', 'Telefon'];

interface Props {
  id: string;
  initialData: Partial<Kontakt>;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
}

export default function Step2Kontakt({ id, initialData, onNext, onPrevious, onSave }: Props) {
  const { data, updateData, saving } = useAutoSave(id, 'kontakt', {
    inhaberName: '',
    inhaberRolle: '',
    handynummer: '',
    email: '',
    bevorzugterKanal: 'WhatsApp',
    zweiterKontakt: undefined,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showZweiterKontakt, setShowZweiterKontakt] = useState(!!initialData.zweiterKontakt);

  useEffect(() => {
    if (saving) {
      onSave();
    }
  }, [saving, onSave]);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return cleaned.slice(0, 11);
    }
    return cleaned.slice(0, 15);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.inhaberName) newErrors.inhaberName = 'Name ist erforderlich';
    if (!data.inhaberRolle) newErrors.inhaberRolle = 'Rolle ist erforderlich';
    if (!data.handynummer) newErrors.handynummer = 'Handynummer ist erforderlich';
    if (!data.email) newErrors.email = 'E-Mail ist erforderlich';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
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
      title="Wer ist dein Ansprechpartner?"
      description="Kontaktdaten des Entscheiders – für Vertrag und Kommunikation"
    >
      <div className="space-y-6">
        <FormField label="Name des Inhabers/Geschäftsführers" required error={errors.inhaberName}>
          <input
            type="text"
            value={data.inhaberName}
            onChange={(e) => updateData({ inhaberName: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. Max Mustermann"
          />
        </FormField>

        <FormField label="Rolle" required error={errors.inhaberRolle}>
          <select
            value={data.inhaberRolle}
            onChange={(e) => updateData({ inhaberRolle: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
          >
            <option value="">Bitte wählen</option>
            {ROLLEN.map(rolle => (
              <option key={rolle} value={rolle}>{rolle}</option>
            ))}
          </select>
        </FormField>

        <FormField 
          label="Handynummer" 
          required 
          error={errors.handynummer}
          hint="Direkte Handynummer, nicht Festnetz"
        >
          <input
            type="tel"
            value={data.handynummer}
            onChange={(e) => updateData({ handynummer: formatPhoneNumber(e.target.value) })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. 0176 12345678"
          />
        </FormField>

        <FormField label="E-Mail" required error={errors.email}>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. max@restaurant.de"
          />
        </FormField>

        <FormField label="Bevorzugter Kommunikationskanal">
          <div className="flex gap-2">
            {KANAELE.map(kanal => (
              <button
                key={kanal}
                type="button"
                onClick={() => updateData({ bevorzugterKanal: kanal })}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                  data.bevorzugterKanal === kanal
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface-hover border-border hover:bg-border'
                }`}
              >
                {kanal}
              </button>
            ))}
          </div>
        </FormField>

        <div className="border-t border-border pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showZweiterKontakt}
              onChange={(e) => {
                setShowZweiterKontakt(e.target.checked);
                if (!e.target.checked) {
                  updateData({ zweiterKontakt: undefined });
                }
              }}
              className="w-4 h-4 rounded text-accent"
            />
            <span className="text-sm">Zweiten Ansprechpartner hinzufügen</span>
          </label>

          {showZweiterKontakt && (
            <div className="mt-4 space-y-4 pl-7">
              <FormField label="Name">
                <input
                  type="text"
                  value={data.zweiterKontakt?.name || ''}
                  onChange={(e) => updateData({
                    zweiterKontakt: {
                      ...data.zweiterKontakt,
                      name: e.target.value,
                      rolle: data.zweiterKontakt?.rolle || '',
                      handynummer: data.zweiterKontakt?.handynummer || '',
                    }
                  })}
                  className="w-full px-4 py-3 rounded-lg border"
                  placeholder="z.B. Anna Mustermann"
                />
              </FormField>

              <FormField label="Rolle">
                <input
                  type="text"
                  value={data.zweiterKontakt?.rolle || ''}
                  onChange={(e) => updateData({
                    zweiterKontakt: {
                      ...data.zweiterKontakt,
                      name: data.zweiterKontakt?.name || '',
                      rolle: e.target.value,
                      handynummer: data.zweiterKontakt?.handynummer || '',
                    }
                  })}
                  className="w-full px-4 py-3 rounded-lg border"
                  placeholder="z.B. Stellvertretung"
                />
              </FormField>

              <FormField label="Handynummer">
                <input
                  type="tel"
                  value={data.zweiterKontakt?.handynummer || ''}
                  onChange={(e) => updateData({
                    zweiterKontakt: {
                      ...data.zweiterKontakt,
                      name: data.zweiterKontakt?.name || '',
                      rolle: data.zweiterKontakt?.rolle || '',
                      handynummer: formatPhoneNumber(e.target.value),
                    }
                  })}
                  className="w-full px-4 py-3 rounded-lg border"
                  placeholder="z.B. 0176 98765432"
                />
              </FormField>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-surface-hover hover:bg-border text-primary font-semibold rounded-lg transition-colors"
          >
            Zurück
          </button>
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