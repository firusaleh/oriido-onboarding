'use client';

import { useState, useEffect } from 'react';
import WizardStep from '@/components/WizardStep';
import FormField from '@/components/FormField';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { Technik } from '@/lib/types';

const KASSENSYSTEME = [
  { id: 'ready2order', name: 'ready2order', icon: '🖥️' },
  { id: 'orderbird', name: 'orderbird', icon: '🐦' },
  { id: 'gastrofix', name: 'gastrofix', icon: '⚡' },
  { id: 'anderes', name: 'Anderes', icon: '🔧' },
  { id: 'keins', name: 'Keins', icon: '❌' },
];

interface Props {
  id: string;
  initialData: Partial<Technik>;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
}

export default function Step4Technik({ id, initialData, onNext, onPrevious, onSave }: Props) {
  const { data, updateData, saving } = useAutoSave(id, 'technik', {
    kassensystem: '',
    kassensystemAnderes: '',
    hatApiZugang: '',
    wlanVorhanden: false,
    tabletImService: false,
    internetAnbieter: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (saving) {
      onSave();
    }
  }, [saving, onSave]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.kassensystem) newErrors.kassensystem = 'Bitte wähle ein Kassensystem';
    
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
      title="Technik-Check"
      description="Welches Kassensystem? Brauchen wir für die Integration."
    >
      <div className="space-y-6">
        <FormField label="Kassensystem" required error={errors.kassensystem}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {KASSENSYSTEME.map(system => (
              <button
                key={system.id}
                type="button"
                onClick={() => updateData({ kassensystem: system.id })}
                className={`p-4 rounded-lg border transition-all hover:scale-105 ${
                  data.kassensystem === system.id
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface-hover border-border hover:border-accent'
                }`}
              >
                <div className="text-2xl mb-2">{system.icon}</div>
                <div className="text-sm font-medium">{system.name}</div>
              </button>
            ))}
          </div>
        </FormField>

        {data.kassensystem === 'anderes' && (
          <FormField label="Welches Kassensystem?">
            <input
              type="text"
              value={data.kassensystemAnderes || ''}
              onChange={(e) => updateData({ kassensystemAnderes: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. Lightspeed"
            />
          </FormField>
        )}

        {data.kassensystem && data.kassensystem !== 'keins' && (
          <FormField 
            label="Hat API-Zugang?" 
            hint={data.hatApiZugang === 'Weiß nicht' ? "Kein Problem, klären wir beim Onboarding" : ""}
          >
            <div className="flex gap-2">
              {['Ja', 'Nein', 'Weiß nicht'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateData({ hatApiZugang: option })}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                    data.hatApiZugang === option
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface-hover border-border hover:bg-border'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </FormField>
        )}

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.wlanVorhanden || false}
              onChange={(e) => updateData({ wlanVorhanden: e.target.checked })}
              className="w-5 h-5 rounded text-accent"
            />
            <span>WLAN für Gäste vorhanden</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.tabletImService || false}
              onChange={(e) => updateData({ tabletImService: e.target.checked })}
              className="w-5 h-5 rounded text-accent"
            />
            <span>Tablet/iPad im Service vorhanden</span>
          </label>
        </div>

        <FormField label="Internet-Anbieter" hint="Optional">
          <input
            type="text"
            value={data.internetAnbieter || ''}
            onChange={(e) => updateData({ internetAnbieter: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. Telekom, Vodafone"
          />
        </FormField>

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