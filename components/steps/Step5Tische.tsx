'use client';

import { useState, useEffect } from 'react';
import WizardStep from '@/components/WizardStep';
import FormField from '@/components/FormField';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { Tische } from '@/lib/types';

interface Props {
  id: string;
  initialData: Partial<Tische>;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
}

export default function Step5Tische({ id, initialData, onNext, onPrevious, onSave }: Props) {
  const { data, updateData, saving } = useAutoSave(id, 'tische', {
    anzahlGesamt: 0,
    anzahlInnen: 0,
    anzahlAussen: 0,
    nummerierungVorhanden: false,
    nummerierungSchema: '',
    grundrissFoto: '',
    besonderheiten: '',
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
    
    if (!data.anzahlGesamt || data.anzahlGesamt === 0) {
      newErrors.anzahlGesamt = 'Anzahl Tische ist erforderlich';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        updateData({ grundrissFoto: url });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fehler beim Hochladen des Fotos');
    }
  };

  return (
    <WizardStep
      title="Tische & Raumplan"
      description="Für die QR-Codes brauchen wir die Tischinfos"
    >
      <div className="space-y-6">
        <FormField label="Anzahl Tische gesamt" required error={errors.anzahlGesamt}>
          <input
            type="number"
            value={data.anzahlGesamt || ''}
            onChange={(e) => updateData({ anzahlGesamt: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. 25"
            min="1"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Davon Innen">
            <input
              type="number"
              value={data.anzahlInnen || ''}
              onChange={(e) => updateData({ anzahlInnen: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. 15"
              min="0"
            />
          </FormField>

          <FormField label="Davon Außen">
            <input
              type="number"
              value={data.anzahlAussen || ''}
              onChange={(e) => updateData({ anzahlAussen: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. 10"
              min="0"
            />
          </FormField>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.nummerierungVorhanden || false}
              onChange={(e) => updateData({ nummerierungVorhanden: e.target.checked })}
              className="w-5 h-5 rounded text-accent"
            />
            <span>Tischnummerierung vorhanden</span>
          </label>

          {data.nummerierungVorhanden && (
            <FormField 
              label="Schema beschreiben" 
              hint="Beispiel: 1-20 Innen, T1-T10 Terrasse"
            >
              <input
                type="text"
                value={data.nummerierungSchema || ''}
                onChange={(e) => updateData({ nummerierungSchema: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border"
                placeholder="z.B. 1-20 Innen, T1-T10 Terrasse"
              />
            </FormField>
          )}
        </div>

        <FormField 
          label="Besonderheiten" 
          hint="Optional: Separater Raum, 2 Etagen, Biergarten, etc."
        >
          <textarea
            value={data.besonderheiten || ''}
            onChange={(e) => updateData({ besonderheiten: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            rows={3}
            placeholder="z.B. Separater Raum für bis zu 30 Personen, Biergarten mit 50 Plätzen"
          />
        </FormField>

        <FormField label="Foto der Tischanordnung" hint="Optional: Hilft beim Erstellen der QR-Codes">
          <div className="space-y-3">
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors cursor-pointer text-center">
                  📸 Foto aufnehmen
                </div>
              </label>
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors cursor-pointer text-center">
                  📁 Datei wählen
                </div>
              </label>
            </div>
            {data.grundrissFoto && (
              <div className="text-sm text-success">✓ Foto hochgeladen</div>
            )}
          </div>
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