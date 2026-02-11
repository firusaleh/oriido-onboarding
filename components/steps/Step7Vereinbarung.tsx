'use client';

import { useState, useEffect } from 'react';
import WizardStep from '@/components/WizardStep';
import FormField from '@/components/FormField';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { Vereinbarung } from '@/lib/types';

interface Props {
  id: string;
  initialData: Partial<Vereinbarung>;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
}

export default function Step7Vereinbarung({ id, initialData, onNext, onPrevious, onSave }: Props) {
  const { data, updateData, saving } = useAutoSave(id, 'vereinbarung', {
    paket: 'standard',
    startdatum: new Date().toISOString().split('T')[0],
    testphase: true,
    sonderkonditionen: '',
    unterschriftVerkäufer: '',
    unterschriftRestaurant: '',
    zustimmungDSGVO: false,
    zustimmungAGB: false,
    notizen: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFoto, setUploadingFoto] = useState(false);

  useEffect(() => {
    if (saving) {
      onSave();
    }
  }, [saving, onSave]);

  useEffect(() => {
    // Auto-fill verkäufer name from session
    const getVerkäuferName = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const { name } = await res.json();
          if (!data.unterschriftVerkäufer) {
            updateData({ unterschriftVerkäufer: name });
          }
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    };
    getVerkäuferName();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.unterschriftRestaurant) {
      newErrors.unterschriftRestaurant = 'Name des Ansprechpartners erforderlich';
    }
    if (!data.zustimmungDSGVO) {
      newErrors.zustimmungDSGVO = 'DSGVO-Zustimmung ist erforderlich';
    }
    if (!data.zustimmungAGB) {
      newErrors.zustimmungAGB = 'AGB-Zustimmung ist erforderlich';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFoto(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'aussenansicht');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        // Save to fotos.aussenansicht
        await fetch(`/api/onboarding/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fotos: { aussenansicht: url } 
          }),
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploadingFoto(false);
  };

  return (
    <WizardStep
      title="Fast geschafft! 🎉"
      description="Letzte Details und Bestätigung"
    >
      <div className="space-y-6">
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Standard-Paket</h3>
          <p className="text-2xl font-bold text-accent mb-2">€179/Monat</p>
          <ul className="text-sm space-y-1 text-secondary">
            <li>✓ Digitale Speisekarte</li>
            <li>✓ QR-Code Bestellung</li>
            <li>✓ Kassensystem-Integration</li>
            <li>✓ Zahlungsabwicklung</li>
            <li>✓ Support & Updates</li>
          </ul>
        </div>

        <label className="flex items-center gap-3 cursor-pointer bg-success/10 border border-success/20 rounded-lg p-4">
          <input
            type="checkbox"
            checked={data.testphase || false}
            onChange={(e) => updateData({ testphase: e.target.checked })}
            className="w-5 h-5 rounded text-accent"
          />
          <div>
            <div className="font-medium">30 Tage kostenlos testen</div>
            <div className="text-sm text-secondary">Keine Zahlungsdaten erforderlich</div>
          </div>
        </label>

        <FormField label="Gewünschtes Startdatum">
          <input
            type="date"
            value={data.startdatum || ''}
            onChange={(e) => updateData({ startdatum: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-lg border"
          />
        </FormField>

        <FormField 
          label="Sonderkonditionen" 
          hint="Falls etwas Besonderes vereinbart wurde"
        >
          <input
            type="text"
            value={data.sonderkonditionen || ''}
            onChange={(e) => updateData({ sonderkonditionen: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. 10% Rabatt für 6 Monate"
          />
        </FormField>

        <FormField 
          label="Notizen" 
          hint="Sonstige Infos, Besonderheiten, Wünsche"
        >
          <textarea
            value={data.notizen || ''}
            onChange={(e) => updateData({ notizen: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            rows={3}
            placeholder="z.B. Besondere Wünsche oder Anmerkungen..."
          />
        </FormField>

        <FormField label="Foto Außenansicht" hint="Optional: Kurzes Foto der Fassade für Marketing">
          <label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotoUpload}
              className="hidden"
              disabled={uploadingFoto}
            />
            <div className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors cursor-pointer text-center">
              📸 Foto der Fassade aufnehmen
            </div>
          </label>
          {uploadingFoto && <div className="text-sm text-secondary">Wird hochgeladen...</div>}
        </FormField>

        <div className="border-t border-border pt-6 space-y-4">
          <h3 className="font-semibold">Bestätigungen</h3>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.zustimmungDSGVO || false}
              onChange={(e) => updateData({ zustimmungDSGVO: e.target.checked })}
              className="w-5 h-5 rounded text-accent mt-0.5"
            />
            <div>
              <div>Der Restaurantbetreiber stimmt der Datenverarbeitung gemäß DSGVO zu</div>
              {errors.zustimmungDSGVO && (
                <div className="text-xs text-error mt-1">{errors.zustimmungDSGVO}</div>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.zustimmungAGB || false}
              onChange={(e) => updateData({ zustimmungAGB: e.target.checked })}
              className="w-5 h-5 rounded text-accent mt-0.5"
            />
            <div>
              <div>Der Restaurantbetreiber stimmt den AGB von Oriido zu</div>
              {errors.zustimmungAGB && (
                <div className="text-xs text-error mt-1">{errors.zustimmungAGB}</div>
              )}
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={true}
              readOnly
              className="w-5 h-5 rounded text-accent"
            />
            <span>Ich bestätige, dass die Angaben korrekt sind</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Name des Verkäufers">
            <input
              type="text"
              value={data.unterschriftVerkäufer || ''}
              onChange={(e) => updateData({ unterschriftVerkäufer: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border bg-surface-hover"
              readOnly
            />
          </FormField>

          <FormField 
            label="Name des Restaurant-Ansprechpartners" 
            required 
            error={errors.unterschriftRestaurant}
          >
            <input
              type="text"
              value={data.unterschriftRestaurant || ''}
              onChange={(e) => updateData({ unterschriftRestaurant: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. Max Mustermann"
            />
          </FormField>
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
            className="px-8 py-4 bg-accent hover:bg-accent-hover text-white font-bold text-lg rounded-lg transition-colors"
          >
            Zur Zusammenfassung →
          </button>
        </div>
      </div>
    </WizardStep>
  );
}