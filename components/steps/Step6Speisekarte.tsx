'use client';

import { useState, useEffect } from 'react';
import WizardStep from '@/components/WizardStep';
import FormField from '@/components/FormField';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { Speisekarte } from '@/lib/types';

const SPRACHEN = [
  'Deutsch',
  'Englisch',
  'Arabisch',
  'Französisch',
  'Türkisch',
  'Italienisch',
  'Spanisch',
  'Sonstiges',
];

interface Props {
  id: string;
  initialData: Partial<Speisekarte>;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
}

export default function Step6Speisekarte({ id, initialData, onNext, onPrevious, onSave }: Props) {
  const { data, updateData, saving } = useAutoSave(id, 'speisekarte', {
    dateien: [],
    onlineLink: '',
    mehrereKarten: false,
    kartenBeschreibung: '',
    logo: '',
    restaurantFotos: [],
    sprachen: ['Deutsch'],
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingMenu, setUploadingMenu] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFotos, setUploadingFotos] = useState(false);

  useEffect(() => {
    if (saving) {
      onSave();
    }
  }, [saving, onSave]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.dateien || data.dateien.length === 0) {
      if (!data.onlineLink) {
        newErrors.dateien = 'Mindestens eine Speisekarte oder Online-Link erforderlich';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleMenuUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingMenu(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const { url } = await response.json();
          uploadedUrls.push(url);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    updateData({ dateien: [...(data.dateien || []), ...uploadedUrls] });
    setUploadingMenu(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        updateData({ logo: url });
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploadingLogo(false);
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingFotos(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files).slice(0, 5 - (data.restaurantFotos?.length || 0))) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const { url } = await response.json();
          uploadedUrls.push(url);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    updateData({ restaurantFotos: [...(data.restaurantFotos || []), ...uploadedUrls] });
    setUploadingFotos(false);
  };

  const toggleSprache = (sprache: string) => {
    const current = data.sprachen || [];
    if (current.includes(sprache)) {
      updateData({ sprachen: current.filter(s => s !== sprache) });
    } else {
      updateData({ sprachen: [...current, sprache] });
    }
  };

  return (
    <WizardStep
      title="Speisekarte & Bilder"
      description="Die Speisekarte wird digitalisiert – Foto oder PDF reicht!"
    >
      <div className="space-y-6">
        <FormField 
          label="Speisekarte hochladen" 
          required 
          error={errors.dateien}
          hint="PDF oder Fotos der Speisekarte"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  multiple
                  onChange={handleMenuUpload}
                  className="hidden"
                  disabled={uploadingMenu}
                />
                <div className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors cursor-pointer text-center">
                  📸 Foto machen
                </div>
              </label>
              <label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleMenuUpload}
                  className="hidden"
                  disabled={uploadingMenu}
                />
                <div className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors cursor-pointer text-center">
                  📁 Datei hochladen
                </div>
              </label>
            </div>
            
            {uploadingMenu && (
              <div className="text-sm text-secondary">Wird hochgeladen...</div>
            )}
            
            {data.dateien && data.dateien.length > 0 && (
              <div className="text-sm text-success">
                ✓ {data.dateien.length} Datei(en) hochgeladen
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-secondary">oder</span>
              </div>
            </div>

            <FormField label="Online-Link zur Speisekarte">
              <input
                type="url"
                value={data.onlineLink || ''}
                onChange={(e) => updateData({ onlineLink: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border"
                placeholder="https://restaurant.de/speisekarte"
              />
            </FormField>
          </div>
        </FormField>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.mehrereKarten || false}
            onChange={(e) => updateData({ mehrereKarten: e.target.checked })}
            className="w-5 h-5 rounded text-accent"
          />
          <span>Mehrere Speisekarten vorhanden</span>
        </label>

        {data.mehrereKarten && (
          <FormField 
            label="Karten beschreiben" 
            hint="z.B. Mittagskarte, Abendkarte, Getränkekarte"
          >
            <input
              type="text"
              value={data.kartenBeschreibung || ''}
              onChange={(e) => updateData({ kartenBeschreibung: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. Mittagskarte + Abendkarte + Getränke"
            />
          </FormField>
        )}

        <FormField label="In welchen Sprachen soll die digitale Karte verfügbar sein?">
          <div className="flex flex-wrap gap-2">
            {SPRACHEN.map(sprache => (
              <button
                key={sprache}
                type="button"
                onClick={() => toggleSprache(sprache)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  data.sprachen?.includes(sprache)
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface-hover border-border hover:bg-border'
                }`}
              >
                {sprache}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Logo hochladen" hint="Optional: Für die digitale Speisekarte">
          <div className="flex gap-2">
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploadingLogo}
              />
              <div className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors cursor-pointer text-center">
                🎨 Logo hochladen
              </div>
            </label>
          </div>
          {uploadingLogo && <div className="text-sm text-secondary">Wird hochgeladen...</div>}
          {data.logo && <div className="text-sm text-success">✓ Logo hochgeladen</div>}
        </FormField>

        <FormField 
          label="Restaurantfotos" 
          hint={`Optional: Bis zu 5 Fotos (${data.restaurantFotos?.length || 0}/5)`}
        >
          <div className="flex gap-2">
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFotoUpload}
                className="hidden"
                disabled={uploadingFotos || (data.restaurantFotos?.length || 0) >= 5}
              />
              <div className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors cursor-pointer text-center">
                📷 Fotos hinzufügen
              </div>
            </label>
          </div>
          {uploadingFotos && <div className="text-sm text-secondary">Wird hochgeladen...</div>}
          {data.restaurantFotos && data.restaurantFotos.length > 0 && (
            <div className="text-sm text-success">
              ✓ {data.restaurantFotos.length} Foto(s) hochgeladen
            </div>
          )}
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