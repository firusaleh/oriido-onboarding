'use client';

import { useState, useEffect } from 'react';
import WizardStep from '@/components/WizardStep';
import FormField from '@/components/FormField';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { Geschaeftsdaten } from '@/lib/types';

const RECHTSFORMEN = [
  'Einzelunternehmen',
  'GbR',
  'GmbH',
  'UG',
  'OHG',
  'KG',
  'Sonstiges',
];

interface Props {
  id: string;
  initialData: Partial<Geschaeftsdaten>;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
}

export default function Step3Geschaeftsdaten({ id, initialData, onNext, onPrevious, onSave }: Props) {
  const { isAdmin } = useUserRole();
  const { data, updateData, saving } = useAutoSave(id, 'geschaeftsdaten', {
    firmenname: '',
    rechtsform: '',
    steuernummer: '',
    ustId: '',
    handelsregister: '',
    iban: '',
    bic: '',
    bankname: '',
    rechnungsadresse: {
      abweichend: false,
      strasse: '',
      plz: '',
      stadt: '',
    },
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const showHandelsregister = ['GmbH', 'UG', 'OHG', 'KG'].includes(data.rechtsform);

  useEffect(() => {
    if (saving) {
      onSave();
    }
  }, [saving, onSave]);

  const formatIBAN = (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const validate = () => {
    // Admins können ohne Validierung durch alle Schritte gehen
    if (isAdmin) {
      setErrors({});
      return true;
    }
    
    const newErrors: Record<string, string> = {};
    
    if (!data.firmenname) newErrors.firmenname = 'Firmenname ist erforderlich';
    if (!data.rechtsform) newErrors.rechtsform = 'Rechtsform ist erforderlich';
    if (!data.steuernummer) newErrors.steuernummer = 'Steuernummer ist erforderlich';
    if (!data.iban) newErrors.iban = 'IBAN ist erforderlich';
    
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
      title="Daten für den Vertrag"
      description="Für den Partnervertrag und die Zahlungsabwicklung"
    >
      <div className="space-y-6">
        <FormField 
          label="Offizieller Firmenname" 
          required 
          error={errors.firmenname}
          hint="Wie im Handelsregister eingetragen"
        >
          <input
            type="text"
            value={data.firmenname}
            onChange={(e) => updateData({ firmenname: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. Bella Napoli GmbH"
          />
        </FormField>

        <FormField label="Rechtsform" required error={errors.rechtsform}>
          <select
            value={data.rechtsform}
            onChange={(e) => updateData({ rechtsform: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
          >
            <option value="">Bitte wählen</option>
            {RECHTSFORMEN.map(form => (
              <option key={form} value={form}>{form}</option>
            ))}
          </select>
        </FormField>

        <FormField 
          label="Steuernummer" 
          required 
          error={errors.steuernummer}
          hint="Findet man auf dem letzten Steuerbescheid"
        >
          <input
            type="text"
            value={data.steuernummer}
            onChange={(e) => updateData({ steuernummer: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. 123/456/78901"
          />
        </FormField>

        <FormField 
          label="Umsatzsteuer-ID" 
          hint="DE... Nummer, nicht jeder hat eine"
        >
          <input
            type="text"
            value={data.ustId || ''}
            onChange={(e) => updateData({ ustId: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. DE123456789"
          />
        </FormField>

        {showHandelsregister && (
          <FormField label="Handelsregisternummer">
            <input
              type="text"
              value={data.handelsregister || ''}
              onChange={(e) => updateData({ handelsregister: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. HRB 12345"
            />
          </FormField>
        )}

        <FormField 
          label="IBAN" 
          required 
          error={errors.iban}
          hint="Für Auszahlungen über Stripe Connect"
        >
          <input
            type="text"
            value={data.iban}
            onChange={(e) => updateData({ iban: formatIBAN(e.target.value) })}
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="z.B. DE89 3704 0044 0532 0130 00"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="BIC">
            <input
              type="text"
              value={data.bic || ''}
              onChange={(e) => updateData({ bic: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. COBADEFFXXX"
            />
          </FormField>

          <FormField label="Bankname">
            <input
              type="text"
              value={data.bankname || ''}
              onChange={(e) => updateData({ bankname: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border"
              placeholder="z.B. Commerzbank"
            />
          </FormField>
        </div>

        <div className="border-t border-border pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.rechnungsadresse?.abweichend || false}
              onChange={(e) => updateData({
                rechnungsadresse: {
                  ...data.rechnungsadresse,
                  abweichend: e.target.checked
                }
              })}
              className="w-4 h-4 rounded text-accent"
            />
            <span className="text-sm">Rechnungsadresse weicht ab</span>
          </label>

          {data.rechnungsadresse?.abweichend && (
            <div className="mt-4 space-y-4 pl-7">
              <FormField label="Straße">
                <input
                  type="text"
                  value={data.rechnungsadresse.strasse || ''}
                  onChange={(e) => updateData({
                    rechnungsadresse: {
                      ...data.rechnungsadresse,
                      strasse: e.target.value
                    }
                  })}
                  className="w-full px-4 py-3 rounded-lg border"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="PLZ">
                  <input
                    type="text"
                    maxLength={5}
                    value={data.rechnungsadresse.plz || ''}
                    onChange={(e) => updateData({
                      rechnungsadresse: {
                        ...data.rechnungsadresse,
                        plz: e.target.value.replace(/\D/g, '')
                      }
                    })}
                    className="w-full px-4 py-3 rounded-lg border"
                  />
                </FormField>

                <FormField label="Stadt">
                  <input
                    type="text"
                    value={data.rechnungsadresse.stadt || ''}
                    onChange={(e) => updateData({
                      rechnungsadresse: {
                        ...data.rechnungsadresse,
                        stadt: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 rounded-lg border"
                  />
                </FormField>
              </div>
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